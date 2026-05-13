import express from 'express';
import {
  sendWelcomeEmail,
  sendReferralBonusEmail,
  sendLowCreditsEmail,
  sendReEngagementEmail,
  sendWeeklyDigestEmail,
  sendFeatureAnnouncementEmail,
  sendCustomCampaignEmail
} from '../utils/email.js';


const router = express.Router();

/**
 * POST /api/email/welcome
 * Send welcome email to new user
 */
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name required' });
    }
    
    await sendWelcomeEmail(email, name);
    res.status(200).json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/referral-bonus
 * Send referral bonus notification
 */
router.post('/referral-bonus', async (req, res) => {
  try {
    const { email, referreeName, creditsEarned } = req.body;
    
    if (!email || !referreeName || !creditsEarned) {
      return res.status(400).json({ error: 'Email, referreeName, and creditsEarned required' });
    }
    
    await sendReferralBonusEmail(email, referreeName, creditsEarned);
    res.status(200).json({ success: true, message: 'Referral bonus email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/low-credits
 * Send low credits warning
 */
router.post('/low-credits', async (req, res) => {
  try {
    const { email, name, credits } = req.body;
    
    if (!email || !name || credits === undefined) {
      return res.status(400).json({ error: 'Email, name, and credits required' });
    }
    
    await sendLowCreditsEmail(email, name, credits);
    res.status(200).json({ success: true, message: 'Low credits email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/re-engagement
 * Send re-engagement email to inactive users
 */
router.post('/re-engagement', async (req, res) => {
  try {
    const { email, name, daysSinceActive } = req.body;
    
    if (!email || !name || !daysSinceActive) {
      return res.status(400).json({ error: 'Email, name, and daysSinceActive required' });
    }
    
    await sendReEngagementEmail(email, name, daysSinceActive);
    res.status(200).json({ success: true, message: 'Re-engagement email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/weekly-digest
 * Send weekly digest email
 */
router.post('/weekly-digest', async (req, res) => {
  try {
    const { email, name, trendingIdeas, communityStats } = req.body;
    
    if (!email || !name || !trendingIdeas || !communityStats) {
      return res.status(400).json({ error: 'Email, name, trendingIdeas, and communityStats required' });
    }
    
    await sendWeeklyDigestEmail(email, name, trendingIdeas, communityStats);
    res.status(200).json({ success: true, message: 'Weekly digest email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/announce
 * Send feature announcement to multiple users
 * Body: { emails: [...], featureTitle, featureDescription }
 */
router.post('/announce', async (req, res) => {
  try {
    const { emails, featureTitle, featureDescription } = req.body;
    
    if (!emails || !featureTitle || !featureDescription) {
      return res.status(400).json({ error: 'Emails, featureTitle, and featureDescription required' });
    }
    
    await sendFeatureAnnouncementEmail(emails, featureTitle, featureDescription);
    res.status(200).json({ success: true, message: `Announcement sent to ${emails.length} users` });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/campaign
 * Send custom built campaigns to targeted subgroups
 * Body: { emails: [...], subject, htmlContent }
 */
router.post('/campaign', async (req, res) => {
  try {
    const { emails, subject, htmlContent, contentFormat = 'plain' } = req.body;
    
    if (!emails || emails.length === 0 || !subject || !htmlContent) {
      return res.status(400).json({ error: 'Emails array, subject, and htmlContent required' });
    }
    
    await sendCustomCampaignEmail(emails, subject, htmlContent, { contentFormat });
    res.status(200).json({ success: true, message: `Campaign sent to ${emails.length} users` });
  } catch (error) {
    console.error('Campaign email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/email/test
 * Test endpoint - sends a test email
 */
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    await sendWelcomeEmail(email, 'Test User');
    res.status(200).json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
