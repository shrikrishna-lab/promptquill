// ═════════════════════════════════════════════════════════════════════
// Frontend Email Service - Calls backend email endpoints
// This keeps email logic on the backend for security
// ═════════════════════════════════════════════════════════════════════

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Send welcome email to new user
 */
export const triggerWelcomeEmail = async (email, name) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    
    if (!response.ok) throw new Error('Failed to send welcome email');
    console.log('✅ Welcome email triggered');
    return await response.json();
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Notify referrer about bonus
 */
export const triggerReferralBonusEmail = async (email, referreeName, creditsEarned) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/email/referral-bonus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referreeName, creditsEarned })
    });
    
    if (!response.ok) throw new Error('Failed to send referral email');
    console.log('✅ Referral bonus email triggered');
    return await response.json();
  } catch (error) {
    console.error('❌ Error sending referral email:', error);
    throw error;
  }
};

/**
 * Send low credits warning (triggered when credits < 5)
 */
export const triggerLowCreditsEmail = async (email, name, credits) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/email/low-credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, credits })
    });
    
    if (!response.ok) throw new Error('Failed to send low credits email');
    console.log('✅ Low credits email triggered');
    return await response.json();
  } catch (error) {
    console.error('❌ Error sending low credits email:', error);
    throw error;
  }
};

export default {
  triggerWelcomeEmail,
  triggerReferralBonusEmail,
  triggerLowCreditsEmail
};
