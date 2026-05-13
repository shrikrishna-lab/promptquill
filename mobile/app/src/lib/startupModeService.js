/**
 * STARTUP Mode Integration Service
 * Handles Pro gates, credit management, custom prompts, and loading UI
 */

import { isPro, getActionCost } from './credits.js';
import { supabase } from './supabase.mobile.js';
import { STARTUP_FULL_PROMPT, STARTUP_LITE_PROMPT } from '../utils/startupPrompts.js';

/**
 * Get enhanced system prompt based on mode
 */
export const getModeSystemPrompt = (mode, baseSystemPrompt) => {
  if (mode === 'STARTUP') {
    return STARTUP_FULL_PROMPT + '\n\n' + baseSystemPrompt.split('""" MODE: STARTUP """')[0];
  } else if (mode === 'STARTUP_LITE') {
    return STARTUP_LITE_PROMPT + '\n\n' + baseSystemPrompt.split('""" MODE: STARTUP """')[0];
  }
  return baseSystemPrompt;
};

/**
 * Check Pro access and credit availability for STARTUP modes
 * NOTE: Pro access is verified on backend. Frontend only checks authentication.
 */
export const checkStartupModeAccess = async (mode) => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;

    if (!userId) {
      return { allowed: false, reason: 'Please log in to access this feature', code: 'not_authenticated' };
    }

    // Pro status will be checked by backend - frontend just needs to ensure user is authenticated
    // STARTUP mode Pro requirement will be enforced on the backend
    return { allowed: true, userId };
  } catch (error) {
    console.error('Error checking STARTUP mode access:', error);
    return { allowed: false, reason: 'Error verifying access', code: 'check_error' };
  }
};

/**
 * Prepare fetch data for backend with Pro/credit info
 */
export const prepareGenerationPayload = async (messages, maxTokens, mode) => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;

    return {
      messages,
      maxTokens,
      userEmail: user?.data?.user?.email || 'frontend-generation',
      userId,
      mode
    };
  } catch (error) {
    console.error('Error preparing generation payload:', error);
    return {
      messages,
      maxTokens,
      userEmail: 'frontend-generation',
      mode
    };
  }
};

/**
 * Format success toast message for STARTUP modes
 */
export const getStartupSuccessMessage = (mode) => {
  if (mode === 'STARTUP') {
    return "✅ Comprehensive Startup Brief generated — 25 credits used";
  } else if (mode === 'STARTUP_LITE') {
    return "✅ Startup Brief Preview generated — 10 credits used";
  }
  return "✅ Generation complete";
};

/**
 * Get loading messages for STARTUP mode
 */
export const getStartupLoadingMessages = () => [
  "⚡ Analyzing market landscape...",
  "💰 Building revenue model...",
  "🏆 Mapping competitor space...",
  "🚀 Crafting your GTM strategy...",
  "✨ Finalizing your startup brief..."
];

/**
 * Format error message for display
 */
export const formatStartupError = (error) => {
  if (error.errorType === 'pro_required') {
    return "STARTUP mode is a Pro feature. Upgrade to unlock comprehensive startup analysis.";
  } else if (error.errorType === 'insufficient_credits') {
    const required = error.metadata?.requiredCredits || 25;
    const current = error.metadata?.currentCredits || 0;
    return `You need ${required} credits but only have ${current}. Try STARTUP LITE (10 credits) or top up your balance.`;
  }
  return error.error || 'Generation failed. Please try again.';
};

/**
 * Get startup mode display info
 */
export const getStartupModeInfo = (mode) => {
  const modes = {
    'STARTUP': {
      label: '🚀 Startup (Pro)',
      credits: 25,
      isPro: true,
      description: 'Deep 10-section analysis: market, competitors, GTM, funding'
    },
    'STARTUP_LITE': {
      label: '🚀 Startup Lite',
      credits: 10,
      isPro: false,
      description: 'Quick preview: executive summary + problem + revenue'
    }
  };
  return modes[mode] || null;
};
