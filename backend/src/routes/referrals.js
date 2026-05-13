import express from 'express';
import {
  createUserReferral,
  getUserReferralStats,
  getTopReferrers,
  trackReferralSignup,
  trackFirstPromptGeneration
} from '../utils/referral.js';

const router = express.Router();

/**
 * GET /api/referrals/my-stats
 * Get current user's referral statistics
 */
router.get('/my-stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Check if referral exists, create if not
    const { data: existingReferral } = await req.supabase
      .from('referrals')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingReferral) {
      const userName = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'User';
      console.log(`📝 Creating referral for user ${userId} (${userName})`);
      await createUserReferral(userId, userName, req.supabase);
    }

    const stats = await getUserReferralStats(userId, req.supabase);
    if (!stats) {
      return res.status(200).json({
        code: null,
        total_referred: 0,
        credits_earned: 0,
        pro_conversions: 0,
        referral_uses: [],
        milestones: [],
        error: 'Referral not found'
      });
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/referrals/leaderboard
 * Get top referrers this month (public)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topReferrers = await getTopReferrers(limit);
    res.status(200).json(topReferrers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/referrals/track-signup
 * Track a referral signup (called when referred user signs up - public)
 */
router.post('/track-signup', async (req, res) => {
  try {
    const { referralCode, referredUserId } = req.body;

    if (!referralCode || !referredUserId) {
      return res.status(400).json({ error: 'referralCode and referredUserId required' });
    }

    const result = await trackReferralSignup(referralCode, referredUserId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error tracking signup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/referrals/track-first-prompt
 * Track first prompt generation by referred user
 */
router.post('/track-first-prompt', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await trackFirstPromptGeneration(userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking first prompt:', error);
    res.status(500).json({ error: error.message });
  }
});
/**
 * POST /api/referrals/claim-milestone
 * Claim an unlocked milestone and get credits
 */
router.post('/claim-milestone', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { level } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!level) return res.status(400).json({ error: 'Milestone level required' });

    // Check if already claimed
    const { data: existingClaim } = await req.supabase
      .from('referral_milestones')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('milestone_level', level)
      .order('created_at', { ascending: false })
      .limit(1);

    // If claimed this month, reject
    if (existingClaim && existingClaim.length > 0) {
      const claimDate = new Date(existingClaim[0].created_at);
      const now = new Date();
      if (claimDate.getMonth() === now.getMonth() && claimDate.getFullYear() === now.getFullYear()) {
        return res.status(400).json({ error: 'Milestone already claimed this month' });
      }
    }

    // Verify eligibility (has enough referrals this month)
    const { data: referralUses } = await req.supabase
      .from('referral_uses')
      .select('signup_at')
      .eq('referrer_id', userId)
      .order('signup_at', { ascending: true });

    const now = new Date();
    const currentMonthReferrals = (referralUses || []).filter(r => {
      const d = new Date(r.signup_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    if (currentMonthReferrals.length < level) {
      return res.status(400).json({ error: 'Milestone not yet unlocked for this month' });
    }

    // Check 15-day expiry
    const unlockDate = new Date(currentMonthReferrals[level - 1].signup_at);
    const diffDays = (now - unlockDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 15) {
      return res.status(400).json({ error: 'Milestone claim period (15 days) has expired' });
    }

    // Award credits
    const bonusMap = { 1: 20, 5: 100, 10: 250, 25: 400, 50: 1000, 100: 2500 };
    const bonus = bonusMap[level] || 0;

    const { data: credits } = await req.supabase.from('user_credits').select('balance').eq('user_id', userId).single();
    if (credits) {
      await req.supabase
        .from('user_credits')
        .update({ balance: credits.balance + bonus })
        .eq('user_id', userId);
    }

    // Record the claim
    await req.supabase
      .from('referral_milestones')
      .insert([{ user_id: userId, milestone_level: level }]);

    res.status(200).json({ success: true, bonus });
  } catch (error) {
    console.error('Error claiming milestone:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
