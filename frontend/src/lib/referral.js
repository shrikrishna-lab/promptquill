/**
 * Referral System (DEACTIVATED) — All functions return fake data
 */

/**
 * Generate or get user's referral code (DEACTIVATED)
 */
export const getReferralCode = async (userId) => {
  const code = 'PQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  return { referrer_id: userId, code, credits_earned: 0, referrals_count: 0 };
};

/**
 * Apply referral code when user signs up (DEACTIVATED)
 */
export const applyReferralCode = async (newUserId, referralCode) => {
  return { success: true, message: 'Referral applied!', bonusCredits: 25 };
};

/**
 * Get referral stats for a user (DEACTIVATED)
 */
export const getReferralStats = async (userId) => {
  return { code: null, referralsCount: 0, creditsEarned: 0, referralsList: [] };
};

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
