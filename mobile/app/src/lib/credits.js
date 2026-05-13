import { supabase } from './supabase.mobile';

// ═══════════════════════════════════════════════════════════
// PROMPT QUILL — Credits System
// Controls API usage via credit-based access
// ═══════════════════════════════════════════════════════════

// Credit costs per action - NOW WITH DYNAMIC COSTS
const ACTION_COSTS = {
  'generate': { base: 10, min: 10, max: 15 },  // 10-15 based on output quality/length
  'refine': { base: 15, min: 15, max: 20 },    // Fixed 15 credits for refining
  'validate': { base: 8, min: 8, max: 10 },    // 8-10 based on output quality/size
  'debate': { base: 10, min: 10, max: 15 },             // AI Debate
  'investor_lens': { base: 8, min: 8, max: 10 },      // Investor Lens
  'ship_30': { base: 5, min: 5, max: 10 },            // Ship in 30 Days
  'pivot': { base: 5, min: 5, max: 10 },              // Pivot Suggester
  'chaining': { base: 10, min: 10, max: 15 },          // Prompt Chaining
  'pdf': { base: 5, min: 5, max: 10 },                // Export PDF
  'voice': { base: 2, min: 2, max: 5 },              // Voice Input
  'api': { base: 2, min: 2, max: 5 },                // API call
  'STARTUP': { base: 25, min: 25, max: 30 },         // Pro-only comprehensive startup brief
  'STARTUP_LITE': { base: 10, min: 10, max: 15 },    // Free teaser - exec summary + problem + revenue
  'default': { base: 2, min: 2, max: 5 }             // Default for unknown actions
};

// Legacy provider costs (kept for backward compatibility)
const DEFAULT_COSTS = {
  groq: 1,
  gemini: 2,
  openrouter: 3
};

// Complexity multipliers
const COMPLEXITY = {
  simple: 1,    // < 500 chars input
  medium: 2,    // 500-2000 chars
  complex: 3    // > 2000 chars
};

/**
 * Get credit cost for a specific action with optional dynamic calculation
 * @param {string} action - Action type (generate, validate, refine)
 * @param {Object} output - Optional output object to calculate dynamic cost
 * @returns {number} Credit cost
 */
export const getActionCost = (action = 'generate', output = null) => {
  const cost = ACTION_COSTS[action];
  
  if (!cost) return ACTION_COSTS['default'];
  
  // If cost is just a number (legacy), return it
  if (typeof cost === 'number') return cost;
  
  // For dynamic costs (objects with base, min, max)
  if (typeof cost === 'object' && cost.base !== undefined) {
    // If no output provided, use base cost
    if (!output) return cost.base;
    
    // Calculate based on output quality/length
    let score = cost.base;
    
    // Bonus for longer/better output
    if (action === 'generate' || action === 'validate') {
      const outputLength =
        output.tabs?.final_prompt?.length ||
        output.tabs?.master_prompt?.length ||
        output.length ||
        0;
      const scoreValue = output.score || 0;
      
      // 10-15: base 10 + up to 5 bonus based on quality/length
      if (outputLength > 2000 || scoreValue >= 8) {
        score = Math.min(cost.max, cost.base + Math.ceil((scoreValue / 10) * 5));
      } else if (outputLength > 1000 && scoreValue >= 7) {
        score = Math.min(cost.max, cost.base + 2);
      }
    }
    
    return Math.max(cost.min, Math.min(cost.max, score));
  }
  
  return cost;
};

/**
 * Estimate credit cost based on input length and provider (legacy).
 */
export const estimateCost = (inputLength, providerName = 'groq') => {
  const provider = providerName.toLowerCase();
  let baseCost = DEFAULT_COSTS.groq;
  if (provider.includes('gemini')) baseCost = DEFAULT_COSTS.gemini;
  else if (provider.includes('openrouter')) baseCost = DEFAULT_COSTS.openrouter;
  else if (provider.includes('groq')) baseCost = DEFAULT_COSTS.groq;

  let multiplier = COMPLEXITY.simple;
  if (inputLength > 2000) multiplier = COMPLEXITY.complex;
  else if (inputLength > 500) multiplier = COMPLEXITY.medium;

  return baseCost * multiplier;
};

/**
 * Get or initialize credits for a user via secure backend endpoint.
 */
export const getCredits = async (userId) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) return { balance: 0, lastReset: new Date().toISOString() };

    const res = await fetch(`${backendUrl}/api/credits/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch credits from backend');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('💥 Unexpected error in getCredits:', err);
    return { balance: 100, lastReset: new Date().toISOString() };
  }
};

/**
 * Deduct credits from user balance via secure backend endpoint.
 * Returns { success, remaining, cost } or { success: false, message }
 */
export const deductCredits = async (userId, amount, provider = '', reason = 'AI generation') => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) return { success: false, message: 'Unauthorized' };

    const res = await fetch(`${backendUrl}/api/credits/${userId}/deduct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, provider, reason })
    });
    
    return await res.json();
  } catch (err) {
    console.error('💥 Unexpected error in deductCredits:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Add credits to a user (admin adjust, topup, referral).
 */
export const addCredits = async (userId, amount, type = 'topup', reason = '') => {
  const credits = await getCredits(userId);
  const newBalance = credits.balance + amount;

  await supabase
    .from('user_credits')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  await logTransaction(userId, amount, type, reason);

  return { success: true, balance: newBalance };
};

/**
 * Admin: Set credits for ALL users at once.
 */
export const setAllUsersCredits = async (amount) => {
  await supabase.from('user_credits').update({ balance: amount });
  return { success: true };
};

/**
 * Admin: Update the configurable daily limits in platform_settings.
 */
export const updateCreditLimits = async (freeLimit, proLimit) => {
  await supabase.from('platform_settings').upsert([
    { key: 'free_daily_credits', value: String(freeLimit) },
    { key: 'pro_daily_credits', value: String(proLimit) }
  ], { onConflict: 'key' });
  return { success: true };
};

/**
 * Get configurable credit limits from platform_settings.
 */
export const getCreditLimits = async () => {
  const { data } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['free_daily_credits', 'pro_daily_credits', 'referral_bonus_credits', 'credit_cost_groq', 'credit_cost_gemini', 'credit_cost_openrouter']);

  const settings = {};
  (data || []).forEach(d => { settings[d.key] = d.value; });

  return {
    free: parseInt(settings.free_daily_credits) || 100,
    pro: parseInt(settings.pro_daily_credits) || 300,
    referralBonus: parseInt(settings.referral_bonus_credits) || 25,
    costGroq: parseInt(settings.credit_cost_groq) || 1,
    costGemini: parseInt(settings.credit_cost_gemini) || 2,
    costOpenrouter: parseInt(settings.credit_cost_openrouter) || 3
  };
};

/**
 * Log a credit transaction.
 */
const logTransaction = async (userId, amount, type, reason = '', provider = '') => {
  await supabase.from('credit_transactions').insert([{
    user_id: userId,
    amount,
    type,
    reason,
    provider: provider || null
  }]);
};

/**
 * Check if user is Pro via user_profiles table or subscription_status.
 * NOTE: Pro status is now determined by the backend only.
 * Frontend cannot directly query user_profiles due to RLS policies.
 * Backend endpoint: POST /api/ai/generate with mode='STARTUP' will reject if not Pro.
 */
const checkIfPro = async (userId) => {
  try {
    // Get current user from auth to check if we have auth context
    const { data: { user } } = await supabase.auth.getUser();
    // Pro status check is deferred to backend for STARTUP modes
    // Frontend just needs to know if user is authenticated
    return !!user?.id;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

/**
 * Export for external use in components
 * NOTE: Returns true only if user is authenticated.
 * Actual Pro status is verified on backend.
 */
export const isPro = async (userId) => {
  return checkIfPro(userId);
};

/**
 * Get hours until next credit reset.
 */
export const getResetCountdown = (lastReset) => {
  const reset = new Date(lastReset);
  const next = new Date(reset.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = next - now;
  if (diffMs <= 0) return '0h 0m';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

// ═══════════════════════════════════════════════════════════
// REFERRAL SYSTEM
// ═══════════════════════════════════════════════════════════

/**
 * Generate a referral code for a user.
 */
export const generateReferralCode = async (userId) => {
  // Check if user already has one
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) return existing;

  const code = 'PQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('referral_codes')
    .insert([{ user_id: userId, code }])
    .select()
    .single();

  return data;
};

/**
 * Redeem a referral code.
 */
export const redeemReferralCode = async (userId, code) => {
  // Find the referral code
  const { data: refCode } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (!refCode) return { success: false, message: 'Invalid or expired referral code' };
  if (refCode.user_id === userId) return { success: false, message: 'Cannot use your own referral code' };
  if (refCode.uses >= refCode.max_uses) return { success: false, message: 'Referral code has reached max uses' };

  // Check if already redeemed by this user
  const { data: existing } = await supabase
    .from('referral_redemptions')
    .select('id')
    .eq('referral_code_id', refCode.id)
    .eq('redeemed_by', userId)
    .single();

  if (existing) return { success: false, message: 'You already used this referral code' };

  const limits = await getCreditLimits();
  const bonus = limits.referralBonus;

  // Give credits to redeemer
  await addCredits(userId, bonus, 'referral', `Redeemed referral ${code}`);
  // Give credits to referrer
  await addCredits(refCode.user_id, bonus, 'referral', `Referral code ${code} used`);

  // Track redemption
  await supabase.from('referral_redemptions').insert([{ referral_code_id: refCode.id, redeemed_by: userId }]);
  // Increment uses
  await supabase.from('referral_codes').update({ uses: refCode.uses + 1 }).eq('id', refCode.id);

  return { success: true, bonus, message: `+${bonus} credits earned!` };
};
