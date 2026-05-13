/**
 * STARTUP Mode Pro-Only Gate and Credit System
 * Handles Pro verification, credit deduction, and refunds
 */

import { isPro } from './credits';
import { supabase } from './supabase.mobile';

export const STARTUP_PRO_GATES = {
  STARTUP_FULL: { 
    isPro: true, 
    credits: 25, 
    label: 'Comprehensive Startup Brief' 
  },
  STARTUP_LITE: { 
    isPro: false, 
    credits: 10, 
    label: 'Startup Brief Preview' 
  }
};

/**
 *  Check if user has access to a mode
 */
export const checkModeAccess = async (mode, userId) => {
  const gate = STARTUP_PRO_GATES[mode === 'STARTUP' ? 'STARTUP_FULL' : mode];
  
  if (!gate) return { allowed: true }; // No gate for this mode
  
  if (gate.isPro) {
    const userIsPro = await isPro(userId);
    if (!userIsPro) {
      return {
        allowed: false,
        reason: 'STARTUP mode is a Pro feature. Upgrade to Pro to unlock deep startup briefs.',
        type: 'pro_required'
      };
    }
  }
  
  return { allowed: true };
};

/**
 * Deduct credits before AI generation
 * Returns { success, transactionId } or { success: false, message }
 */
export const deductStartupCredits = async (userId, mode) => {
  try {
    const credits_amount = mode === 'STARTUP' ? 25 : 10;
    
    // Check current balance
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !currentCredits) {
      return { success: false, message: 'Unable to fetch credit balance' };
    }
    
    if (currentCredits.balance < credits_amount) {
      return { 
        success: false, 
        message: `Insufficient credits. You need ${credits_amount} credits, but have ${currentCredits.balance}.`,
        type: 'insufficient_credits',
        balance: currentCredits.balance,
        required: credits_amount
      };
    }
    
    // Deduct credits
    const newBalance = currentCredits.balance - credits_amount;
    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError || !updated) {
      return { success: false, message: 'Failed to deduct credits' };
    }
    
    // Log transaction
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .insert([{
        user_id: userId,
        amount: -credits_amount,
        type: 'deduct',
        reason: `${mode} mode generation`,
        provider: 'ai-generation',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return { 
      success: true, 
      newBalance,
      transactionId: transaction?.id,
      creditsDeducted: credits_amount
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Refund credits if generation fails
 */
export const refundStartupCredits = async (userId, mode, transactionId) => {
  try {
    const credits_amount = mode === 'STARTUP' ? 25 : 10;
    
    // Get current balance
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (!currentCredits) return { success: false };
    
    // Refund
    const newBalance = currentCredits.balance + credits_amount;
    await supabase
      .from('user_credits')
      .update({ balance: newBalance })
      .eq('user_id', userId);
    
    // Log refund
    await supabase
      .from('credit_transactions')
      .insert([{
        user_id: userId,
        amount: credits_amount,
        type: 'refund',
        reason: `${mode} generation failed - automatic refund`,
        provider: 'ai-generation',
        created_at: new Date().toISOString()
      }]);
    
    return { success: true, newBalance };
  } catch (error) {
    console.error('Error refunding credits:', error);
    return { success: false };
  }
};

/**
 * Get startup mode loading messages for UI
 */
export const getStartupLoadingMessages = () => [
  "⚡ Analyzing market landscape...",
  "💰 Building revenue model...",
  "🏆 Mapping competitor space...",
  "🚀 Crafting your GTM strategy...",
  "✨ Finalizing your startup brief..."
];

/**
 * Format startup generate success message
 */
export const getStartupSuccessMessage = (mode) => {
  if (mode === 'STARTUP') {
    return "✅ Comprehensive Startup Brief generated — 25 credits used";
  } else if (mode === 'STARTUP_LITE') {
    return "✅ Startup Brief Preview generated — 10 credits used";
  }
  return "✅ Generation complete";
};
