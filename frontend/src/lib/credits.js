// ═══════════════════════════════════════════════════════════
// PROMPT QUILL — Credits System (DEACTIVATED)
// All functions return success — credit checks are no-ops
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
  return { balance: 999, lastReset: new Date().toISOString() };
};

/**
 * Deduct credits from user balance via secure backend endpoint.
 * Returns { success, remaining, cost } or { success: false, message }
 */
export const deductCredits = async (userId, amount, provider = '', reason = 'AI generation') => {
  return { success: true, remaining: 999, cost: amount };
};

/**
 * Add credits to a user (admin adjust, topup, referral).
 */
export const addCredits = async (userId, amount, type = 'topup', reason = '') => {
  return { success: true, balance: 999 };
};

/**
 * Admin: Set credits for ALL users at once. (DEACTIVATED)
 */
export const setAllUsersCredits = async (amount) => {
  return { success: true };
};

/**
 * Admin: Update the configurable daily limits in platform_settings. (DEACTIVATED)
 */
export const updateCreditLimits = async (freeLimit, proLimit) => {
  return { success: true };
};

/**
 * Get configurable credit limits from platform_settings. (DEACTIVATED)
 */
export const getCreditLimits = async () => {
  return {
    free: 999,
    pro: 999,
    referralBonus: 25,
    costGroq: 1,
    costGemini: 2,
    costOpenrouter: 3
  };
};

/**
 * Log a credit transaction. (DEACTIVATED)
 */
const logTransaction = async () => {};

/**
 * Check if user is Pro via user_profiles table or subscription_status.
 * NOTE: Pro status is now determined by the backend only.
 * Frontend cannot directly query user_profiles due to RLS policies.
 * Backend endpoint: POST /api/ai/generate with mode='STARTUP' will reject if not Pro.
 */
const checkIfPro = async (userId) => {
  return true;
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
 * Generate a referral code for a user. (DEACTIVATED)
 */
export const generateReferralCode = async (userId) => {
  const code = 'PQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  return { user_id: userId, code, is_active: true, uses: 0, max_uses: 999 };
};

/**
 * Redeem a referral code. (DEACTIVATED)
 */
export const redeemReferralCode = async (userId, code) => {
  return { success: true, bonus: 25, message: '+25 credits earned!' };
};
