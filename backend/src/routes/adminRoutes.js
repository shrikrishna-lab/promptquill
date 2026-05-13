/**
 * Admin Routes - Monitoring and management endpoints
 * Requires admin authentication (checked via middleware)
 */

import { PROVIDERS, rateLimitTracker, providerLogger } from '../utils/aiRouter.js';
import { cache } from '../utils/cache.js';
import { queue } from '../utils/queue.js';

/**
 * GET /api/admin/ai-status
 * Returns comprehensive AI system status and monitoring data
 * Requires: admin role
 */
const getAIStatus = async (req, res) => {
  try {
    // ═══════════════════════════════════════════════════════════════════════
    // PROVIDER STATUS
    // ═══════════════════════════════════════════════════════════════════════

    const providers = [];
    let totalCapacityPercent = 0;
    let criticalProviders = [];
    let warningProviders = [];
    let blacklistedProviders = [];

    Object.keys(PROVIDERS).forEach(providerName => {
      const stats = rateLimitTracker.getStats(providerName);
      const config = PROVIDERS[providerName];

      providers.push({
        name: stats.name,
        available: stats.available,
        blacklisted: stats.blacklisted,
        minuteUsed: stats.minuteUsed,
        minuteLimit: stats.minuteLimit,
        minutePercent: stats.minutePercent,
        dayUsed: stats.dayUsed,
        dayLimit: stats.dayLimit,
        dayPercent: stats.dayPercent,
        consecutiveErrors: stats.consecutiveErrors,
        lastUsed: stats.lastUsed ? new Date(stats.lastUsed) : null,
        type: config.type,
        model: config.model,
        priority: config.priority
      });

      totalCapacityPercent += stats.dayPercent;

      // Check for alerts
      if (stats.blacklisted) {
        blacklistedProviders.push(stats.name);
      } else if (stats.dayPercent >= 90) {
        criticalProviders.push({
          name: stats.name,
          percent: stats.dayPercent,
          used: stats.dayUsed,
          limit: stats.dayLimit
        });
      } else if (stats.dayPercent >= 70) {
        warningProviders.push({
          name: stats.name,
          percent: stats.dayPercent,
          used: stats.dayUsed,
          limit: stats.dayLimit
        });
      }
    });

    const averageCapacityPercent = Math.round(totalCapacityPercent / providers.length);

    // ═══════════════════════════════════════════════════════════════════════
    // CACHE STATUS
    // ═══════════════════════════════════════════════════════════════════════

    const cacheStats = cache.getStats();

    // ═══════════════════════════════════════════════════════════════════════
    // QUEUE STATUS
    // ═══════════════════════════════════════════════════════════════════════

    const queueStatus = queue.getStatus();
    const queuePeek = queue.peekNext(10);

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULATE ESTIMATED USERS SUPPORTED
    // ═══════════════════════════════════════════════════════════════════════

    const totalDailyCapacity = 70100; // From SECTION 1 in requirements
    const averageCreditsPerGeneration = 12; // Average of 10-15
    const averageGenerationsPerUser = 3; // Free = 5, Pro shares with others
    const estimatedUsersSupported = Math.floor(
      (totalDailyCapacity / averageGenerationsPerUser) * (50 / averageCreditsPerGeneration)
    );

    // ═══════════════════════════════════════════════════════════════════════
    // BUILD RESPONSE
    // ═══════════════════════════════════════════════════════════════════════

    const response = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      Alert: {
        level: 'none',
        message: 'All systems normal',
        blacklistedCount: blacklistedProviders.length,
        criticalCount: criticalProviders.length,
        warningCount: warningProviders.length
      },
      providers: providers,
      cache: {
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        percentFull: cacheStats.percentFull,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: cacheStats.hitRate,
        uptime: cacheStats.uptime,
        totalRequests: cacheStats.totalRequests
      },
      queue: {
        length: queueStatus.length,
        proCount: queueStatus.proCount,
        freeCount: queueStatus.freeCount,
        maxSize: queueStatus.maxSize,
        percentFull: queueStatus.percentFull,
        estimatedWait: queueStatus.estimatedWait,
        totalQueued: queueStatus.totalQueued,
        totalProcessed: queueStatus.totalProcessed,
        totalExpired: queueStatus.totalExpired,
        uptime: queueStatus.uptime,
        nextInQueue: queuePeek
      },
      capacity: {
        averageCapacityPercent: averageCapacityPercent,
        totalDailyCapacity: totalDailyCapacity,
        estimatedUsersSupported: estimatedUsersSupported,
        criticalThreshold: 90,
        warningThreshold: 70
      },
      alerts: {
        criticalProviders: criticalProviders,
        warningProviders: warningProviders,
        blacklistedProviders: blacklistedProviders
      }
    };

    // Set overall status based on alerts
    if (blacklistedProviders.length > 5 || criticalProviders.length > 3) {
      response.status = 'degraded';
      response.Alert.level = 'critical';
      response.Alert.message = `${blacklistedProviders.length} blacklisted, ${criticalProviders.length} critical`;
    } else if (warningProviders.length > 0 || blacklistedProviders.length > 0) {
      response.status = 'warning';
      response.Alert.level = 'warning';
      response.Alert.message = `${warningProviders.length} warnings, ${blacklistedProviders.length} blacklisted`;
    }

    res.json(response);
  } catch (error) {
    console.error('❌ Admin status error:', error);
    res.status(500).json({
      error: 'admin_status_error',
      message: error.message
    });
  }
};

/**
 * POST /api/admin/ai-clear-cache
 * Emergency cache clear (admin only)
 */
const clearCache = async (req, res) => {
  try {
    cache.clear();
    res.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/ai-clear-queue
 * Emergency queue clear (admin only)
 */
const clearQueue = async (req, res) => {
  try {
    const count = queue.length();
    queue.clear();
    res.json({ 
      success: true, 
      message: `Queue cleared (${count} items removed)` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/ai-reset-provider
 * Reset specific provider error count (admin only)
 * Body: { provider: string }
 */
const resetProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider || !PROVIDERS[provider]) {
      return res.status(400).json({
        error: 'invalid_provider',
        message: `Provider "${provider}" not found`
      });
    }

    const tracker = rateLimitTracker;
    tracker.providers[provider].consecutiveErrors = 0;
    tracker.providers[provider].blacklistedUntil = null;

    res.json({
      success: true,
      message: `Provider ${provider} reset`,
      provider: tracker.getStats(provider)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/ai-providers
 * List all configured providers and their status
 */
const getProviders = async (req, res) => {
  try {
    const providers = Object.entries(PROVIDERS).map(([name, config]) => {
      const hasKey = !!process.env[config.keyEnv];
      const stats = rateLimitTracker.getStats(name);

      return {
        name: name,
        type: config.type,
        model: config.model,
        keyEnv: config.keyEnv,
        hasKey: hasKey,
        configured: hasKey,
        rpmLimit: config.rpmLimit,
        rpdLimit: config.rpdLimit,
        priority: config.priority,
        available: stats.available,
        blacklisted: stats.blacklisted,
        stats: stats
      };
    });

    const configured = providers.filter(p => p.hasKey).length;
    const available = providers.filter(p => p.available).length;

    res.json({
      total: providers.length,
      configured: configured,
      available: available,
      providers: providers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/ai-analytics
 * Get detailed provider analytics and metrics
 */
const getAnalytics = async (req, res) => {
  try {
    const metrics = providerLogger.getMetrics();
    
    res.json({
      timestamp: new Date().toISOString(),
      metrics: metrics
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      error: 'analytics_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-events
 * Get provider event log (with optional filters)
 */
const getEvents = async (req, res) => {
  try {
    const { provider, type, limit = 100 } = req.query;
    
    const events = providerLogger.getEvents({
      providerId: provider,
      type: type,
      limit: parseInt(limit)
    });

    res.json({
      timestamp: new Date().toISOString(),
      count: events.length,
      events: events
    });
  } catch (error) {
    console.error('❌ Events error:', error);
    res.status(500).json({
      error: 'events_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-summary
 * Get comprehensive summary report
 */
const getSummaryReport = async (req, res) => {
  try {
    const report = providerLogger.getSummaryReport();
    
    res.json(report);
  } catch (error) {
    console.error('❌ Summary report error:', error);
    res.status(500).json({
      error: 'summary_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-provider-health/:providerId
 * Get specific provider health details
 */
const getProviderHealth = async (req, res) => {
  try {
    const { providerId } = req.params;
    const health = providerLogger.getProviderHealth(providerId);

    if (!health) {
      return res.status(404).json({
        error: 'not_found',
        message: `Provider ${providerId} not found`
      });
    }

    res.json({
      timestamp: new Date().toISOString(),
      provider: health
    });
  } catch (error) {
    console.error('❌ Provider health error:', error);
    res.status(500).json({
      error: 'health_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-trends
 * Get provider performance trends over time
 */
const getTrends = async (req, res) => {
  try {
    const metrics = providerLogger.getMetrics();
    const hourlyData = metrics.hourly || [];

    // Format data for Recharts LineChart (array of objects with all metrics per hour)
    const trends = hourlyData.map(h => ({
      hour: h.hour || 'N/A',
      requests: h.requests || 0,
      successes: h.successes || 0,
      errors: h.errors || 0,
      successRate: h.requests > 0 ? Math.round((h.successes / h.requests) * 100) : 0
    }));

    res.json({
      timestamp: new Date().toISOString(),
      trends: trends
    });
  } catch (error) {
    console.error('❌ Trends error:', error);
    res.status(500).json({
      error: 'trends_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-error-analysis
 * Get error breakdown by provider and error type
 */
const getErrorAnalysis = async (req, res) => {
  try {
    const events = providerLogger.getEvents({ type: 'error', limit: 500 });
    
    // Group errors by provider and error code
    const errorsByProvider = {};
    const errorsByCode = {};

    events.forEach(event => {
      const providerId = event.providerId || 'unknown';
      if (!errorsByProvider[providerId]) {
        errorsByProvider[providerId] = {
          total: 0,
          byCodes: {}
        };
      }
      errorsByProvider[providerId].total++;

      const code = event.errorCode || 'UNKNOWN_ERROR';
      if (!errorsByProvider[providerId].byCodes[code]) {
        errorsByProvider[providerId].byCodes[code] = 0;
      }
      errorsByProvider[providerId].byCodes[code]++;

      if (!errorsByCode[code]) {
        errorsByCode[code] = 0;
      }
      errorsByCode[code]++;
    });

    res.json({
      timestamp: new Date().toISOString(),
      totalErrors: events.length,
      byProvider: errorsByProvider,
      byErrorCode: Object.entries(errorsByCode).map(([code, count]) => ({
        code: code,
        count: count,
        percentage: events.length > 0 ? Math.round((count / events.length) * 100) : 0
      }))
    });
  } catch (error) {
    console.error('❌ Error analysis error:', error);
    res.status(500).json({
      error: 'error_analysis_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-performance-timeline
 * Get 24-hour performance timeline with hourly breakdown
 */
const getPerformanceTimeline = async (req, res) => {
  try {
    const metrics = providerLogger.getMetrics();
    const hourlyData = metrics.hourly || [];

    const timeline = hourlyData.map(h => {
      const topProvider = Object.entries(h.providers || {})
        .sort((a, b) => (b[1]?.requests || 0) - (a[1]?.requests || 0))[0];
      return {
        hour: h.hour || 'N/A',
        requests: h.requests || 0,
        successes: h.successes || 0,
        errors: h.errors || 0,
        successRate: h.requests > 0 ? Math.round((h.successes / h.requests) * 100) : 0,
        providerCount: Object.keys(h.providers || {}).length,
        topProvider: topProvider ? topProvider[0] : 'none',
        topProviderRequests: topProvider ? (topProvider[1]?.requests || 0) : 0
      };
    });

    res.json({
      timestamp: new Date().toISOString(),
      timeline: timeline
    });
  } catch (error) {
    console.error('❌ Performance timeline error:', error);
    res.status(500).json({
      error: 'timeline_error',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/ai-comparison
 * Compare all providers side-by-side
 */
const getProviderComparison = async (req, res) => {
  try {
    const metrics = providerLogger.getMetrics();
    const byProvider = metrics.byProvider || {};

    // Calculate reliability score and format data for frontend
    const providers = Object.entries(byProvider).map(([providerId, stats]) => {
      const successRate = stats.successRate || 0;
      const totalReqs = stats.totalRequests || 0;
      const uptime = totalReqs > 0 ? 100 : 0;
      const reliabilityScore = (successRate * 0.7) + (uptime * 0.3);
      
      return {
        providerName: providerId,
        totalRequests: totalReqs,
        successes: stats.successes || 0,
        errors: stats.errors || 0,
        rateLimits: stats.rateLimits || 0,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(stats.averageResponseTime || 0),
        errorPercentage: totalReqs > 0 ? Math.round((stats.errors / totalReqs) * 100) : 0,
        reliabilityScore: Math.round(reliabilityScore * 100) / 100,
        lastError: stats.lastError || null,
        status: reliabilityScore >= 95 ? 'Excellent' : reliabilityScore >= 80 ? 'Good' : 'Degraded'
      };
    })
    .sort((a, b) => b.reliabilityScore - a.reliabilityScore);

    res.json({
      timestamp: new Date().toISOString(),
      providers: providers,
      totalProviders: providers.length,
      bestPerformer: providers[0] || null,
      worstPerformer: providers[providers.length - 1] || null
    });
  } catch (error) {
    console.error('❌ Comparison error:', error);
    res.status(500).json({
      error: 'comparison_error',
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/payments/stats
 * Get comprehensive payment and revenue statistics
 * Breakdown by: Pro Monthly, Pro Yearly, Credits Topup, Status
 */
const getPaymentStats = async (req, res) => {
  try {
    const supabase = req.supabase;

    // Fetch all revenue events
    const { data: revenueEvents, error: revError } = await supabase
      .from('revenue_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (revError) {
      return res.status(500).json({ error: 'Failed to fetch revenue events', details: revError.message });
    }

    const events = revenueEvents || [];

    // Calculate metrics by payment type
    const proMonthlyEvents = events.filter(e => e.plan === 'pro_monthly' && e.event_type === 'payment_success');
    const proYearlyEvents = events.filter(e => e.plan === 'pro_yearly' && e.event_type === 'payment_success');
    const creditsTopupEvents = events.filter(e => e.plan === 'credits_topup' && e.event_type === 'payment_success');
    const failedEvents = events.filter(e => e.event_type === 'payment_failed');

    const calculateRevenue = (eventList) => {
      return eventList.reduce((sum, e) => sum + (Number(e.amount_usd) || Number(e.amount) || 0), 0);
    };

    const proMonthlyRevenue = calculateRevenue(proMonthlyEvents);
    const proYearlyRevenue = calculateRevenue(proYearlyEvents);
    const creditsRevenue = calculateRevenue(creditsTopupEvents);
    const totalRevenue = proMonthlyRevenue + proYearlyRevenue + creditsRevenue;

    // Calculate MRR (Monthly Recurring Revenue)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mrrMonthly = proMonthlyEvents
      .filter(e => new Date(e.created_at) > thirtyDaysAgo)
      .reduce((sum, e) => sum + (Number(e.amount_usd) || Number(e.amount) || 0), 0);
    const mrrYearly = proYearlyEvents
      .filter(e => new Date(e.created_at) > thirtyDaysAgo)
      .reduce((sum, e) => sum + (Number(e.amount_usd) || Number(e.amount) || 0) / 12, 0);
    const mrr = mrrMonthly + mrrYearly;

    // Get user count for ARPU calculation
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const arpu = (userCount && userCount > 0) ? (totalRevenue / userCount).toFixed(2) : 0;

    // Response
    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        mrr: Math.round(mrr * 100) / 100,
        arpu: parseFloat(arpu),
        totalPayments: events.length,
        successfulPayments: events.filter(e => e.event_type === 'payment_success').length,
        failedPayments: failedEvents.length
      },
      byPaymentType: {
        proMonthly: {
          revenue: Math.round(proMonthlyRevenue * 100) / 100,
          count: proMonthlyEvents.length,
          avgValue: proMonthlyEvents.length > 0 ? Math.round((proMonthlyRevenue / proMonthlyEvents.length) * 100) / 100 : 0
        },
        proYearly: {
          revenue: Math.round(proYearlyRevenue * 100) / 100,
          count: proYearlyEvents.length,
          avgValue: proYearlyEvents.length > 0 ? Math.round((proYearlyRevenue / proYearlyEvents.length) * 100) / 100 : 0
        },
        creditsTopup: {
          revenue: Math.round(creditsRevenue * 100) / 100,
          count: creditsTopupEvents.length,
          avgValue: creditsTopupEvents.length > 0 ? Math.round((creditsRevenue / creditsTopupEvents.length) * 100) / 100 : 0
        }
      },
      recentTransactions: events.slice(0, 50)
    });
  } catch (error) {
    console.error('❌ Payment stats error:', error);
    res.status(500).json({
      error: 'payment_stats_error',
      message: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BLOG MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const createBlogPost = async (req, res) => {
  try {
    const supabase = req.supabase;
    const { data, error } = await supabase.from('blog_posts').insert([req.body]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

const updateBlogPost = async (req, res) => {
  try {
    const supabase = req.supabase;
    const { id } = req.params;
    const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

const deleteBlogPost = async (req, res) => {
  try {
    const supabase = req.supabase;
    const { id } = req.params;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

export {
  getAIStatus,
  getProviders,
  getAnalytics,
  getEvents,
  getSummaryReport,
  getProviderHealth,
  getTrends,
  getErrorAnalysis,
  getPerformanceTimeline,
  getProviderComparison,
  getPaymentStats,
  clearCache,
  clearQueue,
  resetProvider,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
// New Admin Functions
};

export const adjustUserCredits = async (req, res) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;
  const supabase = req.supabase;

  try {
    const { data: userCredits } = await supabase.from('user_credits').select('balance').eq('user_id', userId).maybeSingle();
    const newBalance = (userCredits?.balance || 0) + parseInt(amount);
    
    if (newBalance < 0) return res.status(400).json({ error: 'Balance would be negative' });
    
    await supabase.from('user_credits').upsert([{ user_id: userId, balance: newBalance }], { onConflict: 'user_id' });
    
    await supabase.from('credit_transactions').insert([{
      user_id: userId, amount: parseInt(amount), type: 'admin_adjust', reason: reason || 'Admin adjustment'
    }]);

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserData = async (req, res) => {
  const { userId } = req.params;
  const supabase = req.supabase;

  try {
    const ignoreMissingTable = async (query) => {
      const { error } = await query;
      if (error && error.code !== '42P01' && error.code !== '42703') throw error;
    };

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', userId);

    const sessionIds = (sessions || []).map(s => s.id).filter(Boolean);
    if (sessionIds.length > 0) {
      await ignoreMissingTable(supabase.from('prompt_versions').delete().in('session_id', sessionIds));
      await ignoreMissingTable(supabase.from('user_interactions').delete().in('session_id', sessionIds));
    }

    let creativeRows = [];
    try {
      const { data, error } = await supabase
        .from('creative_works')
        .select('id')
        .eq('created_by', userId);
      if (error && error.code !== '42P01' && error.code !== '42703') throw error;
      creativeRows = data || [];
    } catch (error) {
      if (error.code !== '42P01' && error.code !== '42703') throw error;
    }
    const creativeIds = (creativeRows || []).map(w => w.id).filter(Boolean);
    if (creativeIds.length > 0) {
      await ignoreMissingTable(supabase.from('creative_likes').delete().in('work_id', creativeIds));
    }

    await ignoreMissingTable(supabase.from('ticket_replies').delete().eq('sender_id', userId));
    await ignoreMissingTable(supabase.from('support_tickets').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('credit_transactions').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('usage_logs').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('creative_works').delete().eq('created_by', userId));
    await ignoreMissingTable(supabase.from('creative_likes').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('creative_works').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('forum_votes').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('forum_posts').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('forum_threads').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('sessions').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('user_credits').delete().eq('user_id', userId));
    await ignoreMissingTable(supabase.from('profiles').delete().eq('id', userId));

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError && authError.status !== 404) throw authError;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim()
    .replace('::ffff:', '');
};

export const listEmailCampaigns = async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json({ campaigns: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveEmailCampaign = async (req, res) => {
  const {
    id,
    name,
    subject,
    content,
    target,
    status = 'sent',
    sent_count = 0,
    sent_at = new Date().toISOString()
  } = req.body || {};

  if (!name || !subject || !content) {
    return res.status(400).json({ error: 'Campaign name, subject, and content are required' });
  }

  try {
    const payload = {
      name,
      subject,
      content,
      target,
      target_audience: target,
      status,
      sent_count,
      sent_at,
      created_by: '00000000-0000-0000-0000-000000000000'
    };

    const query = id
      ? req.supabase.from('email_campaigns').update(payload).eq('id', id)
      : req.supabase.from('email_campaigns').insert([{ ...payload, created_at: new Date().toISOString() }]);

    const { data, error } = await query.select('*').maybeSingle();
    if (error) throw error;

    res.json({ success: true, campaign: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEmailCampaign = async (req, res) => {
  try {
    const { error } = await req.supabase
      .from('email_campaigns')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setUserBan = async (req, res) => {
  const { userId } = req.params;
  const { banned = true, hard = false, reason = 'Admin action', ipAddress } = req.body || {};
  const demoAdminId = '00000000-0000-0000-0000-000000000000';

  try {
    const { data: profile, error: profileError } = await req.supabase
      .from('profiles')
      .update({
        is_banned: !!banned,
        ban_reason: banned ? reason : null,
        banned_at: banned ? new Date().toISOString() : null,
        banned_by: banned ? demoAdminId : null,
        hard_banned: hard && banned
      })
      .eq('id', userId)
      .select('id, email, is_banned, hard_banned, ban_reason')
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return res.status(404).json({ error: 'User not found' });

    const ip = String(ipAddress || '').trim();
    if (hard && banned && ip) {
      const { error: ipError } = await req.supabase.from('admin_banned_ips').upsert([{
        ip_address: ip,
        user_id: userId,
        reason,
        created_by: demoAdminId,
        is_active: true,
        created_at: new Date().toISOString()
      }], { onConflict: 'ip_address' });
      if (ipError) throw ipError;
    }

    if (!banned) {
      await req.supabase.from('admin_banned_ips').update({ is_active: false }).eq('user_id', userId);
    }

    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkBanStatus = async (req, res) => {
  try {
    const ip = getClientIp(req);
    const email = String(req.query.email || '').trim().toLowerCase();

    const { data: ipBan } = await req.app.locals.supabase
      .from('admin_banned_ips')
      .select('reason')
      .eq('ip_address', ip)
      .eq('is_active', true)
      .maybeSingle();

    if (ipBan) {
      return res.status(403).json({ banned: true, hard: true, reason: ipBan.reason || 'This device is banned' });
    }

    if (email) {
      const { data: profile } = await req.app.locals.supabase
        .from('profiles')
        .select('is_banned, hard_banned, ban_reason')
        .eq('email', email)
        .maybeSingle();

      if (profile?.is_banned) {
        return res.status(403).json({
          banned: true,
          hard: !!profile.hard_banned,
          reason: profile.ban_reason || 'Your account is banned'
        });
      }
    }

    res.json({ banned: false });
  } catch (err) {
    res.json({ banned: false });
  }
};

export const getUsageLogs = async (req, res) => {
  const supabase = req.supabase;
  try {
    const { data } = await supabase.from('usage_logs').select('*').order('created_at', { ascending: false }).limit(1000);
    res.json({ usageLogs: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const normalizedRole = String(role || '').toUpperCase();

  if (!['ADMIN', 'USER'].includes(normalizedRole)) {
    return res.status(400).json({ error: 'Role must be ADMIN or USER' });
  }

  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .update({ role: normalizedRole })
      .eq('id', userId)
      .select('id, email, role')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserProStatus = async (req, res) => {
  const { userId } = req.params;
  const { isPro } = req.body;

  if (typeof isPro !== 'boolean') {
    return res.status(400).json({ error: 'isPro must be a boolean' });
  }

  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .update({
        is_pro: isPro,
        tier: isPro ? 'pro' : 'free',
        subscription_status: isPro ? 'active' : 'inactive'
      })
      .eq('id', userId)
      .select('id, email, is_pro, tier, subscription_status')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

