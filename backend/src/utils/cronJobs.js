/**
 * Cron Jobs Management
 * Initialize and manage scheduled tasks like subscription expiration checks
 * and daily admin summary emails
 */

import { checkAndDowngradeExpiredSubscriptions } from './subscriptionManager.js';
const sendDailySummaryAlert = async () => console.log('[CRON] Daily summary alert (disabled for open source)');

// Store for active cron jobs
const activeCronJobs = new Map();

/**
 * Initialize cron jobs
 * Called on server startup
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @param {Object} config - Configuration object
 */
export function initializeCronJobs(supabase, config = {}) {
  console.log('⏰ Initializing cron jobs...');

  // Subscription expiration check - runs every 6 hours
  const subscriptionCheckInterval = config.subscriptionCheckInterval || 6 * 60 * 60 * 1000;
  
  const subscriptionCheckJob = setInterval(async () => {
    try {
      console.log('⏰ Running scheduled subscription expiration check...');
      const result = await checkAndDowngradeExpiredSubscriptions(supabase);
      
      if (result.downgradedCount > 0) {
        console.log(`✅ Subscription check completed: ${result.downgradedCount} users downgraded`);
      } else {
        console.log('✅ Subscription check completed: No expirations found');
      }
    } catch (error) {
      console.error('❌ Error in subscription expiration cron job:', error);
    }
  }, subscriptionCheckInterval);

  activeCronJobs.set('subscriptionCheck', {
    interval: subscriptionCheckJob,
    frequency: subscriptionCheckInterval,
    description: 'Check and downgrade expired subscriptions'
  });

  // Daily Summary Email — runs once per hour, fires at 9:00 AM IST (3:30 AM UTC)
  const dailySummaryJob = setInterval(async () => {
    try {
      const now = new Date();
      const istHour = (now.getUTCHours() + 5 + (now.getUTCMinutes() >= 30 ? 1 : 0)) % 24;
      const istMinute = (now.getUTCMinutes() + 30) % 60;
      
      // Only fire between 9:00-9:59 IST
      if (istHour !== 9) return;
      // Only fire in the first check of the hour (within first 5 min)
      if (istMinute > 5) return;
      
      console.log('📊 Running daily summary email...');
      
      // Gather stats from Supabase
      const { count: newSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getTime() - 86400000).toISOString());
        
      const { data: revToday } = await supabase
        .from('revenue_events')
        .select('amount, amount_usd')
        .eq('event_type', 'payment_success')
        .gte('created_at', new Date(now.getTime() - 86400000).toISOString());
      const revenueToday = (revToday || []).reduce((a, b) => a + (Number(b.amount_usd) || Number(b.amount) || 0), 0);
      
      const { count: genCount } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'generate')
        .gte('created_at', new Date(now.getTime() - 86400000).toISOString());
        
      await sendDailySummaryAlert({
        newSignups: newSignups || 0,
        revenueToday: revenueToday,
        totalGenerations: genCount || 0,
        activeUsers: '—',
        failedPayments: 0,
        suspiciousAccounts: 0,
        serverErrors: 0
      });
      console.log('✅ Daily summary sent!');
    } catch (error) {
      console.error('❌ Daily summary cron error:', error.message);
    }
  }, 3600000); // Check every hour

  activeCronJobs.set('dailySummary', {
    interval: dailySummaryJob,
    frequency: 3600000,
    description: 'Daily admin summary email at 9 AM IST'
  });

  console.log(`✅ Cron jobs initialized (${activeCronJobs.size} jobs active)`);

  return {
    subscriptionCheckJob,
    dailySummaryJob,
    jobCount: activeCronJobs.size
  };
}

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
export function stopAllCronJobs() {
  console.log('🛑 Stopping all cron jobs...');
  
  let stoppedCount = 0;
  activeCronJobs.forEach((job, name) => {
    clearInterval(job.interval);
    console.log(`✅ Stopped cron job: ${name}`);
    stoppedCount++;
  });

  activeCronJobs.clear();
  console.log(`✅ All ${stoppedCount} cron jobs stopped`);
}

/**
 * Get status of all cron jobs
 */
export function getCronJobStatus() {
  const jobs = [];
  activeCronJobs.forEach((job, name) => {
    jobs.push({
      name,
      frequency: job.frequency,
      frequencyInHours: job.frequency / (1000 * 60 * 60),
      description: job.description,
      status: 'active'
    });
  });

  return {
    totalJobs: jobs.length,
    jobs
  };
}

/**
 * Stop a specific cron job
 */
export function stopCronJob(jobName) {
  if (activeCronJobs.has(jobName)) {
    const job = activeCronJobs.get(jobName);
    clearInterval(job.interval);
    activeCronJobs.delete(jobName);
    console.log(`✅ Stopped cron job: ${jobName}`);
    return true;
  }
  console.warn(`⚠️ Cron job not found: ${jobName}`);
  return false;
}

/**
 * Restart a specific cron job
 */
export function restartCronJob(jobName, supabase) {
  if (jobName === 'subscriptionCheck') {
    stopCronJob(jobName);
    const { subscriptionCheckJob } = initializeCronJobs(supabase);
    return subscriptionCheckJob;
  }
  console.warn(`⚠️ Cannot restart unknown cron job: ${jobName}`);
  return null;
}

export default {
  initializeCronJobs,
  stopAllCronJobs,
  getCronJobStatus,
  stopCronJob,
  restartCronJob
};
