/**
 * Subscription Management Utility
 * Handles subscription expiration checks, downgrades, and renewal logic
 */

/**
 * Check for expired subscriptions and automatically downgrade users
 * Should be called by a cron job or admin endpoint periodically
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @returns {Promise<Object>} Results with count and details
 */
export async function checkAndDowngradeExpiredSubscriptions(supabase) {
  try {
    console.log('🔍 Checking for expired subscriptions...');

    // Use the database function to check and downgrade
    const { data: downgrades, error: checkError } = await supabase
      .rpc('check_and_downgrade_expired_subscriptions');

    if (checkError) {
      console.error('❌ Error checking expired subscriptions:', checkError);
      throw checkError;
    }

    const downgradedCount = downgrades?.length || 0;
    console.log(`✅ Auto-downgraded ${downgradedCount} expired subscriptions`);

    // Return details for logging
    return {
      success: true,
      downgradedCount,
      downgrades: downgrades || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error in checkAndDowngradeExpiredSubscriptions:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get all active subscriptions that expire within N days
 * Useful for sending renewal reminders
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @param {number} daysUntilExpiry - Days threshold (default 7)
 * @returns {Promise<Array>} Array of subscriptions expiring soon
 */
export async function getSubscriptionsExpiringWithin(supabase, daysUntilExpiry = 7) {
  try {
    const expiryDate = new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000);

    const { data: expiringSubscriptions, error } = await supabase
      .from('active_subscriptions')
      .select('*')
      .lt('subscription_end_date', expiryDate.toISOString())
      .order('subscription_end_date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching expiring subscriptions:', error);
      throw error;
    }

    console.log(`✅ Found ${expiringSubscriptions?.length || 0} subscriptions expiring within ${daysUntilExpiry} days`);
    return expiringSubscriptions || [];
  } catch (error) {
    console.error('❌ Error in getSubscriptionsExpiringWithin:', error);
    return [];
  }
}

/**
 * Get subscription status for a specific user
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription status object
 */
export async function getUserSubscriptionStatus(supabase, userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'tier, subscription_status, subscription_plan, subscription_start_date, ' +
        'subscription_end_date, daily_allowance, is_pro'
      )
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching subscription status:', error);
      return null;
    }

    // Calculate days remaining
    let daysRemaining = null;
    let isExpired = false;
    
    if (profile?.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      const now = new Date();
      daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      isExpired = endDate < now;
    }

    return {
      userId,
      tier: profile?.tier,
      isActive: profile?.tier === 'pro' && !isExpired,
      isExpired,
      subscriptionStatus: profile?.subscription_status,
      subscriptionPlan: profile?.subscription_plan,
      startDate: profile?.subscription_start_date,
      endDate: profile?.subscription_end_date,
      daysRemaining,
      dailyAllowance: profile?.daily_allowance,
      isPro: profile?.is_pro
    };
  } catch (error) {
    console.error('❌ Error in getUserSubscriptionStatus:', error);
    return null;
  }
}

/**
 * Get subscription statistics for admin dashboard
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @returns {Promise<Object>} Subscription stats
 */
export async function getSubscriptionStats(supabase) {
  try {
    // Get counts by tier
    const { data: tierCounts } = await supabase
      .from('profiles')
      .select('tier', { count: 'exact' })
      .then(result => {
        const counts = { free: 0, pro: 0 };
        result.data?.forEach(row => {
          if (row.tier === 'pro') counts.pro++;
          else counts.free++;
        });
        return { data: counts };
      });

    // Get pro subscriptions by plan type
    const { data: proCounts } = await supabase
      .from('profiles')
      .select('subscription_plan', { count: 'exact' })
      .eq('tier', 'pro')
      .then(result => {
        const plans = { monthly: 0, yearly: 0, other: 0 };
        result.data?.forEach(row => {
          if (row.subscription_plan?.includes('monthly')) plans.monthly++;
          else if (row.subscription_plan?.includes('yearly')) plans.yearly++;
          else plans.other++;
        });
        return { data: plans };
      });

    // Get count of subscriptions expiring within 7 days
    const expiringIn7Days = await getSubscriptionsExpiringWithin(supabase, 7);

    // Get recently expired subscriptions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: recentDowngrades } = await supabase
      .from('subscription_history')
      .select('id', { count: 'exact' })
      .eq('action', 'downgrade')
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      totalUsers: (tierCounts?.free || 0) + (tierCounts?.pro || 0),
      freeUsers: tierCounts?.free || 0,
      proUsers: tierCounts?.pro || 0,
      proByPlan: proCounts,
      expiringWithin7Days: expiringIn7Days?.length || 0,
      recentDowngrades: recentDowngrades?.count || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error in getSubscriptionStats:', error);
    return null;
  }
}

/**
 * Manual downgrade - useful for handling cancellations or disputes
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @param {string} userId - User ID to downgrade
 * @param {string} reason - Reason for downgrade
 * @returns {Promise<Object>} Result of downgrade
 */
export async function manualDowngradeUser(supabase, userId, reason = 'manual_admin_action') {
  try {
    console.log(`📉 Manually downgrading user ${userId} - Reason: ${reason}`);

    // Get current tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tier: 'free',
        subscription_status: 'inactive',
        subscription_plan: NULL,
        daily_allowance: 50,
        generation_count_today: 0,
        last_downgrade_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Failed to downgrade user:', updateError);
      throw updateError;
    }

    // Record in history
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert([{
        user_id: userId,
        action: 'downgrade',
        from_tier: profile?.tier,
        to_tier: 'free',
        reason,
        created_at: new Date().toISOString()
      }]);

    if (historyError) {
      console.warn('⚠️ Failed to record downgrade in history:', historyError);
    }

    console.log(`✅ User ${userId} manually downgraded`);
    return { success: true, userId, previousTier: profile?.tier };
  } catch (error) {
    console.error('❌ Error in manualDowngradeUser:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extend subscription by N days (useful for supporter/gift subscriptions)
 * 
 * @param {SupabaseClient} supabase - Supabase client
 * @param {string} userId - User ID
 * @param {number} days - Number of days to add
 * @param {string} reason - Reason for extension
 * @returns {Promise<Object>} Result with new end date
 */
export async function extendSubscription(supabase, userId, days = 30, reason = 'admin_extension') {
  try {
    // Get current subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_end_date, tier, subscription_plan')
      .eq('id', userId)
      .single();

    if (!profile || profile.tier !== 'pro') {
      return { success: false, error: 'User is not a pro subscriber' };
    }

    // Calculate new end date
    const currentEndDate = new Date(profile.subscription_end_date);
    const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_end_date: newEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Failed to extend subscription:', updateError);
      throw updateError;
    }

    console.log(`✅ Extended subscription for user ${userId} by ${days} days until ${newEndDate}`);
    return {
      success: true,
      userId,
      oldEndDate: profile.subscription_end_date,
      newEndDate: newEndDate.toISOString(),
      daysAdded: days
    };
  } catch (error) {
    console.error('❌ Error in extendSubscription:', error);
    return { success: false, error: error.message };
  }
}
