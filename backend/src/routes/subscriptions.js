import express from 'express';
import {
  checkAndDowngradeExpiredSubscriptions,
  getSubscriptionsExpiringWithin,
  getUserSubscriptionStatus,
  getSubscriptionStats,
  manualDowngradeUser,
  extendSubscription
} from '../utils/subscriptionManager.js';

const router = express.Router();

/**
 * GET /api/subscriptions/check-expired
 * Admin endpoint to manually trigger subscription expiration check
 * Requires admin authentication
 */
router.get('/check-expired', async (req, res) => {
  try {
    console.log('🔍 Admin triggered subscription expiration check');
    
    const result = await checkAndDowngradeExpiredSubscriptions(req.supabase);
    
    res.json({
      status: 'success',
      message: `Checked and downgraded ${result.downgradedCount} expired subscriptions`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in check-expired endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/subscriptions/expiring-soon
 * Get subscriptions expiring within N days (default 7)
 * Query param: days=7
 */
router.get('/expiring-soon', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const expiringSubscriptions = await getSubscriptionsExpiringWithin(req.supabase, days);
    
    res.json({
      status: 'success',
      count: expiringSubscriptions.length,
      daysThreshold: days,
      data: expiringSubscriptions
    });
  } catch (error) {
    console.error('❌ Error in expiring-soon endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/subscriptions/user/:userId
 * Get subscription status for a specific user
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = await getUserSubscriptionStatus(req.supabase, userId);
    
    if (!status) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      status: 'success',
      data: status
    });
  } catch (error) {
    console.error('❌ Error in user subscription status endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/subscriptions/stats
 * Get subscription statistics for admin dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getSubscriptionStats(req.supabase);
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('❌ Error in stats endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/downgrade
 * Admin endpoint to manually downgrade a user
 * Body: { userId, reason }
 */
router.post('/downgrade', async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const result = await manualDowngradeUser(req.supabase, userId, reason);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: `User ${userId} has been downgraded`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in downgrade endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/subscriptions/extend
 * Admin endpoint to extend a user's subscription
 * Body: { userId, days, reason }
 */
router.post('/extend', async (req, res) => {
  try {
    const { userId, days, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const result = await extendSubscription(req.supabase, userId, days || 30, reason);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      status: 'success',
      message: `Subscription extended for user ${userId}`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error in extend endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
