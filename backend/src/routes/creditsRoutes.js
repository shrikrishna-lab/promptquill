import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

let supabase = null;
const getSupabase = () => {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    supabase = createClient(url, key);
  }
  return supabase;
};

// Log a transaction
const logTransaction = async (userId, amount, type, reason = '', provider = '') => {
  const sb = getSupabase();
  await sb.from('credit_transactions').insert([{
    user_id: userId,
    amount,
    type,
    reason,
    provider: provider || null
  }]);
};

// Check if user is Pro
const checkIfPro = async (userId) => {
  const sb = getSupabase();
  const { data: prof } = await sb.from('profiles').select('is_pro').eq('id', userId).maybeSingle();
  if (prof?.is_pro) return true;
  const { data: sub } = await sb.from('user_profiles').select('subscription_status').eq('id', userId).maybeSingle();
  return sub?.subscription_status === 'active';
};

// Get configurable limits
const getCreditLimits = async () => {
  const sb = getSupabase();
  const { data } = await sb.from('platform_settings').select('key, value').in('key', ['free_daily_credits', 'pro_daily_credits', 'referral_bonus_credits']);
  const settings = {};
  (data || []).forEach(d => { settings[d.key] = d.value; });
  return {
    free: parseInt(settings.free_daily_credits) || 100,
    pro: parseInt(settings.pro_daily_credits) || 300,
    referralBonus: parseInt(settings.referral_bonus_credits) || 25
  };
};

/**
 * GET /api/credits/:userId
 * Fetch user credits and handle 24h refill securely
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Security check: ensure user is requesting their own credits

  // Use the supabase client provided by the middleware (already initialized)
  const sb = req.supabase || getSupabase();

  try {
    let { data, error } = await sb.from('user_credits').select('*').eq('user_id', userId).maybeSingle();

    if (error) {
      console.error('[Credits Route] Fetch Error:', error);
      throw error;
    }

    // If user has no row, create one
    if (!data) {
      console.log('[Credits Route] 📝 Creating new credits row for:', userId);
      const isPro = await checkIfPro(userId);
      const limits = await getCreditLimits();
      const limit = isPro ? limits.pro : limits.free;
      const now = new Date().toISOString();
      
      const { data: newRow, error: insertError } = await sb
        .from('user_credits')
        .insert([{ user_id: userId, balance: limit, last_reset: now }])
        .select()
        .single();
        
      if (insertError) {
        console.error('[Credits Route] Insert Error:', insertError);
        throw insertError;
      }
      return res.json({ balance: newRow.balance, lastReset: newRow.last_reset });
    }

    // Auto-reset logic
    const now = new Date();
    let lastResetDate;
    
    if (!data.last_reset) {
      console.log('[Credits Route] ⚠️ last_reset is NULL for user:', userId);
      lastResetDate = new Date(0); // Trigger reset
    } else {
      lastResetDate = new Date(data.last_reset);
      if (isNaN(lastResetDate.getTime())) {
        console.log('[Credits Route] ⚠️ Invalid last_reset date:', data.last_reset);
        lastResetDate = new Date(0);
      }
    }

    const diffMs = now - lastResetDate;
    const hoursSinceReset = diffMs / (1000 * 60 * 60);
    
    console.log(`[Credits Route] User: ${userId} | Balance: ${data.balance} | Hours Since Reset: ${hoursSinceReset.toFixed(2)}h`);

    if (hoursSinceReset >= 24) {
      console.log('[Credits Route] 🔄 24h passed. Resetting credits...');
      const isPro = await checkIfPro(userId);
      const limits = await getCreditLimits();
      const newLimit = isPro ? limits.pro : limits.free;
      const newResetTime = now.toISOString();

      // Ensure accumulated referral credits aren't wiped out by the daily reset
      const preservedBalance = Math.max(data.balance, newLimit);

      const { data: updatedData, error: updateError } = await sb
        .from('user_credits')
        .update({ balance: preservedBalance, last_reset: newResetTime })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error('[Credits Route] Reset Update Failed:', updateError);
        // If update failed, return 'now' as lastReset so the timer at least shows up on frontend
        // and tries again next refresh.
        return res.json({ balance: data.balance, lastReset: data.last_reset || now.toISOString() });
      }

      console.log('[Credits Route] ✅ Credits successfully reset to:', newLimit);
      await logTransaction(userId, newLimit, 'reset', 'Daily credit reset');
      return res.json({ balance: updatedData.balance, lastReset: updatedData.last_reset });
    }

    // If we are here, we are within the 24h window. 
    // Ensure we return a valid string for the frontend timer.
    return res.json({ balance: data.balance, lastReset: data.last_reset || now.toISOString() });
  } catch (err) {
    console.error('[Credits Route] Global Error:', err);
    // On error, return now so timer is visible
    res.status(500).json({ error: err.message, balance: 100, lastReset: new Date().toISOString() });
  }
});

/**
 * POST /api/credits/:userId/deduct
 * Securely deduct credits
 */
router.post('/:userId/deduct', async (req, res) => {
  const { userId } = req.params;
  const { amount, provider, reason } = req.body;
  
  // Security check: ensure user is deducting their own credits

  const sb = getSupabase();

  try {
    const { data: credits } = await sb.from('user_credits').select('*').eq('user_id', userId).single();
    
    if (!credits || credits.balance < amount) {
      return res.json({ success: false, remaining: credits?.balance || 0, message: 'Insufficient credits' });
    }

    const newBalance = credits.balance - amount;
    await sb.from('user_credits').update({ balance: newBalance }).eq('user_id', userId);
    await logTransaction(userId, -amount, 'deduct', reason || 'AI generation', provider);

    return res.json({ success: true, remaining: newBalance, cost: amount });
  } catch (err) {
    console.error('[Credits Route] Deduct Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
