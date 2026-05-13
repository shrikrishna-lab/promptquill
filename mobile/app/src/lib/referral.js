import { supabase } from './supabase.mobile';

/**
 * Referral System - User can share referral code and earn credits
 */

/**
 * Generate or get user's referral code
 */
export const getReferralCode = async (userId) => {
  try {
    let { data: referral, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new referral code
      const code = generateReferralCode();
      const { data: newReferral, error: insertError } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: userId,
          code: code,
          credits_earned: 0,
          referrals_count: 0,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return newReferral;
    }

    if (error) throw error;
    return referral;
  } catch (error) {
    console.error('Error getting referral code:', error);
    return null;
  }
};

/**
 * Apply referral code when user signs up
 * Awards credits to both referrer and new user
 */
export const applyReferralCode = async (newUserId, referralCode) => {
  try {
    // Find the referrer
    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', referralCode)
      .single();

    if (refError) {
      if (refError.code === 'PGRST116') {
        return { success: false, error: 'Invalid referral code' };
      }
      throw refError;
    }

    if (!referral || referral.referrer_id === newUserId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // Check if user already referred
    const { data: existingRef } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referred_user_id', newUserId)
      .single();

    if (existingRef) {
      return { success: false, error: 'You already used a referral code' };
    }

    // Get referral bonus amount
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'referral_bonus_credits')
      .single();

    const bonusCredits = parseInt(settings?.value) || 25;

    // Record the referral use
    await supabase.from('referral_uses').insert([{
      referrer_id: referral.referrer_id,
      referred_user_id: newUserId,
      bonus_credits: bonusCredits,
    }]);

    // Update referral stats
    await supabase
      .from('referrals')
      .update({
        referrals_count: referral.referrals_count + 1,
        credits_earned: referral.credits_earned + bonusCredits * 2, // Both users get bonus
      })
      .eq('id', referral.id);

    // Add credits to referrer
    await supabase
      .from('user_credits')
      .update({
        balance: supabase.raw('balance + ' + bonusCredits),
        total_earned: supabase.raw('total_earned + ' + bonusCredits),
      })
      .eq('user_id', referral.referrer_id);

    // Add credits to new user
    await supabase
      .from('user_credits')
      .update({
        balance: supabase.raw('balance + ' + bonusCredits),
        total_earned: supabase.raw('total_earned + ' + bonusCredits),
      })
      .eq('user_id', newUserId);

    // Log transactions
    await supabase.from('credit_transactions').insert([
      {
        user_id: referral.referrer_id,
        amount: bonusCredits,
        type: 'referral',
        reason: `Referral bonus from user ${newUserId.substring(0, 8)}...`,
      },
      {
        user_id: newUserId,
        amount: bonusCredits,
        type: 'referral',
        reason: `Referral sign-up bonus (code: ${referralCode})`,
      },
    ]);

    return {
      success: true,
      message: `Welcome! You and your referrer both received ${bonusCredits} credits!`,
      bonusCredits: bonusCredits,
    };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get referral stats for a user
 */
export const getReferralStats = async (userId) => {
  try {
    const { data: referral, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return {
        code: null,
        referralsCount: 0,
        creditsEarned: 0,
        referralsList: [],
      };
    }

    if (error) throw error;

    // Get list of all referrals
    const { data: referralsList } = await supabase
      .from('referral_uses')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    return {
      code: referral?.code,
      referralsCount: referral?.referrals_count || 0,
      creditsEarned: referral?.credits_earned || 0,
      referralsList: referralsList || [],
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      code: null,
      referralsCount: 0,
      creditsEarned: 0,
      referralsList: [],
    };
  }
};

/**
 * Generate a random referral code
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Share referral link
 */
export const getReferralLink = (referralCode) => {
  return `${window.location.origin}?ref=${referralCode}`;
};

/**
 * Copy referral link to clipboard
 */
export const copyReferralLink = async (referralCode) => {
  const link = getReferralLink(referralCode);
  try {
    await navigator.clipboard.writeText(link);
    return { success: true, message: 'Referral link copied to clipboard!' };
  } catch (error) {
    return { success: false, message: 'Failed to copy link' };
  }
};

export default {
  getReferralCode,
  applyReferralCode,
  getReferralStats,
  getReferralLink,
  copyReferralLink,
};
