import dotenv from 'dotenv';
dotenv.config();

const FROM_EMAIL = process.env.FROM_EMAIL || 'PromptQuill <noreply@yourdomain.com>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@yourdomain.com';

const logEmail = (type, to) => console.log(`[EMAIL] ${type} -> ${to}`);

export const sendWelcomeEmail = async (userEmail, userName) => logEmail('welcome', userEmail);
export const sendPasswordResetEmail = async (userEmail, resetLink) => logEmail('password_reset', userEmail);
export const sendProConfirmationEmail = async (userEmail, userName) => logEmail('pro_confirmation', userEmail);
export const sendPaymentReceipt = async (userEmail, amount, paymentId) => logEmail('payment_receipt', userEmail);
export const sendReferralBonusEmail = async (userEmail, amount) => logEmail('referral_bonus', userEmail);
export const sendLowCreditsEmail = async (userEmail, balance) => logEmail('low_credits', userEmail);
export const sendReEngagementEmail = async (userEmail) => logEmail('re_engagement', userEmail);
export const sendWeeklyDigestEmail = async (userEmail) => logEmail('weekly_digest', userEmail);
export const sendFeatureAnnouncementEmail = async (userEmail, feature) => logEmail('feature_announcement', userEmail);
export const sendCustomCampaignEmail = async (userEmail, subject, content) => logEmail(`campaign:${subject}`, userEmail);
export { FROM_EMAIL, SUPPORT_EMAIL };
