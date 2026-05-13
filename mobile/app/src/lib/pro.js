import { supabase } from './supabase.mobile';

// Check if user is Pro
export const checkProStatus = async (userId) => {
  // Check profile's is_pro field FIRST (most direct and reliable)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', userId)
    .maybeSingle();
  
  if (profileError) {
    console.error('Error checking pro status from profile:', profileError);
    return false;
  }
  
  if (profile?.is_pro === true) return true;
  
  // If not in profile, check subscriptions table
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .eq('plan', 'pro')
    .maybeSingle();
  
  if (subError) {
    console.error('Error checking pro status from subscriptions:', subError);
    return false;
  }
  
  if (subscription && subscription.expires_at) {
    return new Date(subscription.expires_at) > new Date();
  }
  
  return false;
};

// Get today's usage count (Reset at Midnight IST)
export const getTodayUsage = async (userId) => {
  const ISTOffset = 5.5 * 60 * 60 * 1000; // 5h 30m
  const now = new Date();
  const istDate = new Date(now.getTime() + ISTOffset);
  
  const istMidnight = new Date(now.getTime() + ISTOffset);
  istMidnight.setUTCHours(0, 0, 0, 0);
  
  // Back to UTC for Supabase query
  const startOfIstDay = new Date(istMidnight.getTime() - ISTOffset);
  
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', 'generate')
    .gte('created_at', startOfIstDay.toISOString());
  
  return count || 0;
};

// Log a usage action
export const logUsage = async (userId, action) => {
  await supabase.from('usage_logs').insert([{ user_id: userId, action }]);
};

// Free limits - PROMPTS per day
export const FREE_PROMPT_LIMIT = 10;  // Max prompts per day for free users
export const PROMPT_LIMIT = 999;       // Unlimited prompts for Pro users

// Credit limits - CREDITS per day
export const FREE_DAILY_LIMIT = 100;   // Max credits per day for free users
export const PRO_DAILY_LIMIT = 300;     // Max credits per day for Pro users

export const FREE_HISTORY_LIMIT = 20;

// Check if user can generate
export const canGenerate = async (userId) => {
  const isPro = await checkProStatus(userId);
  const used = await getTodayUsage(userId);
  
  if (isPro) {
    return { allowed: true, isPro: true, used, limit: PROMPT_LIMIT };
  }
  
  // For free users: check if daily prompt limit (10) is reached
  const promptsAllowed = used < FREE_PROMPT_LIMIT;
  return { allowed: promptsAllowed, isPro: false, used, limit: FREE_PROMPT_LIMIT };
};

// Payment placeholder
export const initiatePayment = (plan, userEmail, onSuccess) => {
  console.log('Payment not configured: using placeholder');
  if (onSuccess) onSuccess('placeholder_id', plan);
};


/**
 * Start Pro subscription payment (placeholder)
 */
export const startProSubscription = async (plan, userId, userEmail, userName, onSuccess, onFailure) => {
  console.log('Payment not configured: using placeholder');
  if (onSuccess) onSuccess();
};

/**
 * Start credit topup payment (placeholder)
 */
export const startCreditTopup = async (creditsPackage, userId, userEmail, userName, onSuccess, onFailure) => {
  console.log('Payment not configured: using placeholder');
  if (onSuccess) onSuccess();
};

/**
 * Get payment config for a product type (placeholder)
 */
export const getPaymentConfig = (productType) => {
  return null;
};
