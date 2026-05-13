/**
 * Debug endpoint to check payment and subscription status
 * Useful for troubleshooting pro plan activation issues
 */

import express from 'express';


const router = express.Router();

// SECURITY: Block ALL debug routes in production
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Route not found' });
  }
  next();
});



/**
 * GET /api/debug/webhook-test
 * Test webhook processing with mock payment data
 */
router.get('/webhook-test', async (req, res) => {
  try {
    console.log('🧪 Testing webhook with mock payment data...');

    // Get first free user for testing
    const { data: users } = await req.supabase
      .from('profiles')
      .select('id, email, tier, is_pro')
      .eq('tier', 'free')
      .limit(1);

    if (!users || users.length === 0) {
      return res.json({ 
        status: 'no_test_user',
        message: 'No free users available for testing'
      });
    }

    const testUserId = users[0].id;
    console.log(`✅ Using test user: ${testUserId}`);

    // Create mock webhook payload
    const mockPayload = {
      payment: {
        id: 'pay_test_' + Date.now(),
        order_id: 'order_test_' + Date.now(),
        amount: 49900,
        notes: {
          user_id: testUserId,
          plan_type: 'pro_monthly',
          credits_to_add: 0
        }
      }
    };

    // Simulate what webhook would do
    console.log('📤 Testing with payload:', mockPayload);

    // Try to call upgrade_to_pro function
    const { data: upgradeResult, error: upgradeError } = await req.supabase
      .rpc('upgrade_to_pro', {
        p_user_id: testUserId,
        p_plan_type: 'pro_monthly',
        p_payment_id: mockPayload.payment.id
      });

    if (upgradeError) {
      console.error('❌ RPC function error:', upgradeError);
      
      // Try fallback manual update
      console.log('📝 Attempting fallback update...');
      const { error: fallbackError } = await req.supabase
        .from('profiles')
        .update({
          is_pro: true,
          tier: 'pro',
          subscription_status: 'active',
          subscription_plan: 'pro_monthly',
          daily_allowance: 500,
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', testUserId);

      if (fallbackError) {
        console.error('❌ Fallback update error:', fallbackError);
        return res.json({
          status: 'error',
          rpcError: upgradeError.message,
          fallbackError: fallbackError.message
        });
      }
    }

    // Check if profile was updated
    const { data: updatedProfile } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    console.log('✅ Profile after update:', {
      tier: updatedProfile?.tier,
      is_pro: updatedProfile?.is_pro,
      subscription_plan: updatedProfile?.subscription_plan,
      subscription_end_date: updatedProfile?.subscription_end_date,
      daily_allowance: updatedProfile?.daily_allowance
    });

    res.json({
      status: 'success',
      message: 'Webhook test completed',
      testUserId,
      rpcAvailable: !upgradeError,
      rpcError: upgradeError?.message,
      updatedProfile: {
        tier: updatedProfile?.tier,
        is_pro: updatedProfile?.is_pro,
        subscription_plan: updatedProfile?.subscription_plan,
        subscription_end_date: updatedProfile?.subscription_end_date,
        daily_allowance: updatedProfile?.daily_allowance
      }
    });
  } catch (error) {
    console.error('❌ Debug test error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/debug/check-pro-users
 * List all pro users and their subscription status
 */
router.get('/check-pro-users', async (req, res) => {
  try {
    const { data: proUsers } = await req.supabase
      .from('profiles')
      .select('id, email, tier, is_pro, subscription_plan, subscription_end_date, daily_allowance')
      .eq('tier', 'pro');

    const { data: isProUsers } = await req.supabase
      .from('profiles')
      .select('id, email, is_pro')
      .eq('is_pro', true);

    console.log(`📊 Pro users (tier='pro'): ${proUsers?.length || 0}`);
    console.log(`📊 is_pro users (is_pro=true): ${isProUsers?.length || 0}`);

    res.json({
      status: 'success',
      tierProUsers: proUsers || [],
      isProUsers: isProUsers || []
    });
  } catch (error) {
    console.error('❌ Error checking pro users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/debug/subscription-history
 * Show recent subscription changes
 */
router.get('/subscription-history', async (req, res) => {
  try {
    const { data: history } = await req.supabase
      .from('subscription_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`📜 Recent subscription changes: ${history?.length || 0} records`);

    res.json({
      status: 'success',
      recentChanges: history || []
    });
  } catch (error) {
    console.error('❌ Error fetching subscription history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/debug/upgrade-user-to-pro
 * Direct endpoint to upgrade a user to pro without RPC
 * Body: { userId, planType }
 */
router.post('/upgrade-user-to-pro', async (req, res) => {
  try {
    const { userId, planType } = req.body;
    
    if (!userId || !planType) {
      return res.status(400).json({ error: 'userId and planType required' });
    }

    console.log(`🎯 Direct pro upgrade for user ${userId} to ${planType}`);

    const subscriptionEndDate = new Date(
      planType === 'pro_yearly' 
        ? Date.now() + 365 * 24 * 60 * 60 * 1000
        : Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Direct update
    const { error: updateError } = await req.supabase
      .from('profiles')
      .update({
        is_pro: true,
        tier: 'pro',
        subscription_status: 'active',
        subscription_plan: planType,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: subscriptionEndDate,
        subscription_auto_renew: true,
        daily_allowance: 500
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    // Record in history
    try {
      await req.supabase
        .from('subscription_history')
        .insert([{
          user_id: userId,
          action: 'upgrade',
          from_tier: 'free',
          to_tier: 'pro',
          plan_type: planType,
          start_date: new Date().toISOString(),
          end_date: subscriptionEndDate,
          reason: 'debug_direct_upgrade',
          created_at: new Date().toISOString()
        }]);
    } catch (histErr) {
      console.warn('⚠️ History error:', histErr.message);
    }

    // Verify
    const { data: updated } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log(`✅ User upgraded successfully:`, {
      tier: updated?.tier,
      is_pro: updated?.is_pro,
      subscription_plan: updated?.subscription_plan,
      subscription_end_date: updated?.subscription_end_date
    });

    res.json({
      status: 'success',
      message: 'User upgraded to pro',
      profile: {
        tier: updated?.tier,
        is_pro: updated?.is_pro,
        subscription_plan: updated?.subscription_plan,
        subscription_end_date: updated?.subscription_end_date,
        daily_allowance: updated?.daily_allowance
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/debug/fix-missing-plan
 * Fix pro users that are missing subscription_plan
 */
router.get('/fix-missing-plan', async (req, res) => {
  try {
    console.log('🔧 Fixing pro users missing subscription_plan...');

    // Get pro users without subscription_plan
    const { data: brokenUsers } = await req.supabase
      .from('profiles')
      .select('id, email, tier, subscription_end_date')
      .eq('tier', 'pro')
      .or('subscription_plan.is.null,subscription_plan.eq.""');

    if (!brokenUsers || brokenUsers.length === 0) {
      return res.json({
        status: 'success',
        message: 'No broken users found',
        fixed: 0
      });
    }

    console.log(`Found ${brokenUsers.length} broken users`);

    // Determine plan based on subscription_end_date
    const updates = brokenUsers.map(user => {
      const daysRemaining = Math.ceil(
        (new Date(user.subscription_end_date) - new Date()) / (1000 * 60 * 60 * 24)
      );
      const plan = daysRemaining > 100 ? 'pro_yearly' : 'pro_monthly';
      console.log(`  - ${user.email}: ${daysRemaining} days remaining → ${plan}`);
      return { ...user, plan };
    });

    // Update each user
    let fixedCount = 0;
    for (const user of updates) {
      const { error } = await req.supabase
        .from('profiles')
        .update({ subscription_plan: user.plan })
        .eq('id', user.id);

      if (error) {
        console.error(`  ❌ Failed to fix ${user.email}:`, error.message);
      } else {
        console.log(`  ✅ Fixed ${user.email}`);
        fixedCount++;
      }
    }

    res.json({
      status: 'success',
      message: `Fixed ${fixedCount} users`,
      fixed: fixedCount,
      total: brokenUsers.length,
      details: updates
    });
  } catch (error) {
    console.error('❌ Fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/debug/check-user-status/:userId
 * Check Pro status for a specific user across both tables
 */
router.get('/check-user-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    console.log(`🔍 Checking Pro status for user ${userId}`);

    // Check profiles table
    const { data: profileData, error: profileError } = await req.supabase
      .from('profiles')
      .select('id, email, tier, is_pro, subscription_status, subscription_plan, subscription_end_date, daily_allowance')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
    }

    // Check user_profiles table
    const { data: userProfileData, error: userProfileError } = await req.supabase
      .from('user_profiles')
      .select('id, subscription_status')
      .eq('id', userId)
      .single();

    if (userProfileError) {
      console.error('⚠️ user_profiles error:', userProfileError.message);
    }

    // Determine Pro status
    const isProViaProfiles = profileData?.is_pro === true;
    const isProViaUserProfiles = userProfileData?.subscription_status === 'active';
    const isPro = isProViaProfiles || isProViaUserProfiles;

    console.log(`📊 Status for ${userId}:`, {
      isProViaProfiles,
      isProViaUserProfiles,
      finalIsPro: isPro
    });

    res.json({
      status: 'success',
      userId,
      profiles_table: profileData ? {
        exists: true,
        tier: profileData.tier,
        is_pro: profileData.is_pro,
        subscription_status: profileData.subscription_status,
        subscription_plan: profileData.subscription_plan,
        subscription_end_date: profileData.subscription_end_date,
        daily_allowance: profileData.daily_allowance
      } : { exists: false },
      user_profiles_table: userProfileData ? {
        exists: true,
        subscription_status: userProfileData.subscription_status
      } : { exists: false },
      pro_status_checks: {
        via_profiles: isProViaProfiles,
        via_user_profiles: isProViaUserProfiles
      },
      determined_is_pro: isPro
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
