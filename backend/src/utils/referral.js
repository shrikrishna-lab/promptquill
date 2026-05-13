import { supabase } from './supabase.js';

// ═══════════════════════════════════════════════════════════════════
// REFERRAL SYSTEM - Backend Service
// Handles all referral logic, rewards, and fraud detection
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate unique referral code
 * Format: USER_INITIALS + RANDOM_6_CHARS (e.g., KRR_X7K9M2)
 */
const generateReferralCode = async (userName) => {
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${initials}${randomPart}`;
};

/**
 * Create referral record for new user
 */
export const createUserReferral = async (userId, userName, supabaseClient = null) => {
  try {
    const client = supabaseClient || supabase;
    const code = await generateReferralCode(userName);
    
    const { data, error } = await client
      .from('referrals')
      .insert([{ user_id: userId, code }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating referral:', error);
      throw error;
    }
    
    console.log('✅ Referral created:', data.code);
    return data;
  } catch (err) {
    console.error('❌ createUserReferral error:', err);
    throw err;
  }
};

/**
 * Get referral code for user
 */
export const getReferralCode = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching referral:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('❌ getReferralCode error:', err);
    return null;
  }
};

/**
 * Track referral signup
 * Called when user signs up with ?ref=CODE parameter
 */
export const trackReferralSignup = async (referralCode, referredUserId) => {
  try {
    // Get referrer from code
    const { data: referrer, error: referrerError } = await supabase
      .from('referrals')
      .select('user_id')
      .eq('code', referralCode)
      .single();
    
    if (referrerError || !referrer) {
      console.log('⚠️ Invalid referral code:', referralCode);
      return null;
    }
    
    // Prevent self-referral
    if (referrer.user_id === referredUserId) {
      console.log('⚠️ User tried to refer themselves');
      return { error: 'Self-referral is not allowed' };
    }
    
    // Check if referred user has already been referred
    const { data: existingReferral } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referred_user_id', referredUserId)
      .maybeSingle();
      
    if (existingReferral) {
      console.log(`⚠️ User ${referredUserId} has already been referred`);
      return { error: 'User has already used a referral code' };
    }
    
    // Create referral use record
    const { data, error } = await supabase
      .from('referral_uses')
      .insert([{
        referrer_id: referrer.user_id,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        signup_completed: true,
        signup_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error tracking referral:', error);
      throw error;
    }
    
    console.log('✅ Referral signup tracked:', referralCode);
    
    // Award signup bonus to both parties
    await awardSignupBonus(referrer.user_id, referredUserId);
    
    return data;
  } catch (err) {
    console.error('❌ trackReferralSignup error:', err);
    throw err;
  }
};

/**
 * Award signup bonuses
 */
const awardSignupBonus = async (referrerId, referredUserId) => {
  try {
    const { data: settings } = await supabase
      .from('referral_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (!settings) return;
    
    // Award referrer
    const { data: referrerCredits } = await supabase.from('user_credits').select('balance').eq('user_id', referrerId).single();
    if (referrerCredits) {
      const { error: referrerError } = await supabase
        .from('user_credits')
        .update({ balance: referrerCredits.balance + settings.referrer_signup_bonus })
        .eq('user_id', referrerId);
      if (referrerError) console.error('❌ Failed to award referrer:', referrerError);
    }
    
    // Award referred user
    const { data: referredCredits } = await supabase.from('user_credits').select('balance').eq('user_id', referredUserId).single();
    if (referredCredits) {
      const { error: referredError } = await supabase
        .from('user_credits')
        .update({ balance: referredCredits.balance + settings.signup_bonus })
        .eq('user_id', referredUserId);
      if (referredError) console.error('❌ Failed to award referred user:', referredError);
    }
    
    // Update referral stats
    const { data: refStats } = await supabase.from('referrals').select('total_referred, total_credits_earned').eq('user_id', referrerId).single();
    if (refStats) {
      await supabase
        .from('referrals')
        .update({ 
          total_referred: refStats.total_referred + 1,
          total_credits_earned: refStats.total_credits_earned + settings.referrer_signup_bonus
        })
        .eq('user_id', referrerId);
    }
    
    // Mark signup bonus as credited
    await supabase
      .from('referral_uses')
      .update({ signup_bonus_credited: true })
      .eq('referrer_id', referrerId)
      .eq('referred_user_id', referredUserId);
    
    console.log('✅ Signup bonuses awarded');
  } catch (err) {
    console.error('❌ awardSignupBonus error:', err);
  }
};

/**
 * Track first prompt generation from referred user
 * Triggers additional bonus
 */
export const trackFirstPromptGeneration = async (userId) => {
  try {
    // Find referral uses where this user was referred
    const { data: referralUses } = await supabase
      .from('referral_uses')
      .select('referrer_id')
      .eq('referred_user_id', userId)
      .eq('first_prompt_generated', false)
      .limit(1);
    
    if (!referralUses || referralUses.length === 0) return;
    
    const referrerId = referralUses[0].referrer_id;
    
    // Get settings
    const { data: settings } = await supabase
      .from('referral_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (!settings) return;
    
    // Update referral use
    await supabase
      .from('referral_uses')
      .update({
        first_prompt_generated: true,
        first_prompt_at: new Date().toISOString()
      })
      .eq('referred_user_id', userId)
      .eq('first_prompt_generated', false);
    
    // Award referred user
    const { data: referredCredits } = await supabase.from('user_credits').select('balance').eq('user_id', userId).single();
    if (referredCredits) {
      await supabase
        .from('user_credits')
        .update({ balance: referredCredits.balance + settings.first_prompt_bonus })
        .eq('user_id', userId);
    }
    
    // Award referrer
    const { data: referrerCredits } = await supabase.from('user_credits').select('balance').eq('user_id', referrerId).single();
    if (referrerCredits) {
      await supabase
        .from('user_credits')
        .update({ balance: referrerCredits.balance + settings.referrer_first_prompt_bonus })
        .eq('user_id', referrerId);
    }
    
    // Update referral stats
    const { data: refStats } = await supabase.from('referrals').select('total_credits_earned').eq('user_id', referrerId).single();
    if (refStats) {
      await supabase
        .from('referrals')
        .update({ 
          total_credits_earned: refStats.total_credits_earned + settings.referrer_first_prompt_bonus
        })
        .eq('user_id', referrerId);
    }
    
    // Mark as credited
    await supabase
      .from('referral_uses')
      .update({ first_prompt_bonus_credited: true })
      .eq('referred_user_id', userId);
    
    console.log('✅ First prompt bonus awarded to referrer:', referrerId);
  } catch (err) {
    console.error('❌ trackFirstPromptGeneration error:', err);
  }
};

/**
 * Get user's referral dashboard data
 */
export const getUserReferralStats = async (userId, supabaseClient = null) => {
  try {
    const client = supabaseClient || supabase;
    
    // Get referral code
    const { data: referral } = await client
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!referral) {
      console.warn(`⚠️ No referral found for user ${userId}`);
      return null;
    }
    
    // Get referral uses
    const { data: referralUses } = await client
      .from('referral_uses')
      .select('*')
      .eq('referrer_id', userId)
      .order('referred_at', { ascending: false });
    
    // Get milestones
    const { data: milestones } = await client
      .from('referral_milestones')
      .select('*')
      .eq('user_id', userId)
      .order('milestone_level', { ascending: true });
    
    return {
      code: referral.code,
      total_referred: referral.total_referred,
      credits_earned: referral.total_credits_earned,
      pro_conversions: referral.pro_conversions,
      referral_uses: referralUses || [],
      milestones: milestones || []
    };
  } catch (err) {
    console.error('❌ getUserReferralStats error:', err);
    throw err;
  }
};

/**
 * Get top referrers this month
 */
export const getTopReferrers = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('user_id, code, total_referred, total_credits_earned')
      .order('total_referred', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Fetch user names
    const referrersWithNames = await Promise.all(
      data.map(async (ref) => {
        const { data: user } = await supabase.auth.admin.getUserById(ref.user_id);
        return {
          ...ref,
          name: user?.user_metadata?.name || 'Anonymous'
        };
      })
    );
    
    return referrersWithNames;
  } catch (err) {
    console.error('❌ getTopReferrers error:', err);
    throw err;
  }
};

/**
 * Check for fraud in referral pattern
 */
export const checkReferralFraud = async (referrerId, referredUserId, referrerIp, referredIp) => {
  try {
    const reasons = [];
    
    // Check same IP
    if (referrerIp === referredIp) {
      reasons.push('Same IP address');
    }
    
    // Check multiple accounts same IP
    const { data: sameIpReferrals } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referrer_id', referrerId);
    
    if (sameIpReferrals && sameIpReferrals.length > 50) {
      reasons.push('Unusually high referral count');
    }
    
    return {
      isSuspicious: reasons.length > 0,
      reasons: reasons.join(', ')
    };
  } catch (err) {
    console.error('❌ checkReferralFraud error:', err);
    return { isSuspicious: false, reasons: '' };
  }
};

export default {
  createUserReferral,
  getReferralCode,
  trackReferralSignup,
  trackFirstPromptGeneration,
  getUserReferralStats,
  getTopReferrers,
  checkReferralFraud
};
