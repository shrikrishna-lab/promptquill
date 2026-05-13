// Import utilities
import { routeToProvider, PROVIDERS, rateLimitTracker } from '../utils/aiRouter.js';
import { cache } from '../utils/cache.js';
import { queue } from '../utils/queue.js';

// User controller functions
export const getProfile = async (req, res) => {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data: profile, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data: profile, error } = await req.supabase
      .from('profiles')
      .update(req.body)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Prompt controller functions
export const getPrompts = async (req, res) => {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data: prompts, error } = await req.supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(prompts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPrompt = async (req, res) => {
  try {
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data: prompt, error } = await req.supabase
      .from('prompts')
      .insert([{ ...req.body, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data: prompt, error } = await req.supabase
      .from('prompts')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = '00000000-0000-0000-0000-000000000000';
    const { error } = await req.supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// AI Generation Controller
export const generatePrompt = async (req, res) => {
  try {
    const { idea, mode = 'GENERAL', category = 'e-commerce' } = req.body;
    const userId = '00000000-0000-0000-0000-000000000000';

    // ════════════════════════════════════════════════════════════════════════
    // 1. VALIDATION
    // ════════════════════════════════════════════════════════════════════════

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ 
        error: 'invalid_input',
        message: 'Please provide an idea or description' 
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. GET USER PROFILE & TIER
    // ════════════════════════════════════════════════════════════════════════

    const { data: profile, error: profileError } = await req.supabase
      .from('profiles')
      .select('tier, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const userTier = profile?.subscription_status === 'active' ? 'pro' : 'free';

    // ════════════════════════════════════════════════════════════════════════
    // 3. CHECK DAILY GENERATION HARD CAP
    // ════════════════════════════════════════════════════════════════════════

    const { data: usage, error: usageError } = await req.supabase
      .from('generation_usage')
      .select('daily_count, last_reset_date')
      .eq('user_id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const lastReset = usage?.last_reset_date?.split('T')[0];
    let dailyCount = 0;

    // Reset if new day
    if (lastReset !== today) {
      await req.supabase
        .from('generation_usage')
        .upsert({
          user_id: userId,
          daily_count: 0,
          last_reset_date: new Date().toISOString()
        });
      dailyCount = 0;
    } else {
      dailyCount = usage?.daily_count || 0;
    }

    const hardCap = userTier === 'pro' ? 50 : 5;
    if (dailyCount >= hardCap) {
      const tier = userTier === 'pro' ? '50' : '5';
      return res.status(429).json({
        error: 'daily_limit_reached',
        message: `You've used all ${tier} generations today. Credits reset at midnight IST. Upgrade to Pro for more.`,
        used: dailyCount,
        limit: hardCap,
        resetTime: '00:00 IST'
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. GET USER CREDITS
    // ════════════════════════════════════════════════════════════════════════

    const { data: userCredits, error: creditsError } = await req.supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle non-existent records

    const currentBalance = userCredits?.balance || 0;

    if (currentBalance < 10) {
      return res.status(402).json({
        error: 'insufficient_credits',
        message: 'Not enough credits. You need at least 10 credits to generate. Your credits reset at midnight IST.',
        balance: currentBalance,
        required: 10,
        resetTime: '00:00 IST'
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. CHECK CACHE FIRST
    // ════════════════════════════════════════════════════════════════════════

    const cacheHit = cache.get(idea, category);
    if (cacheHit) {
      console.log(`📦 Cache HIT for user ${userId}`);
      
      // Deduct 5 credits for cache hit
      const newBalance = currentBalance - 5;
      await req.supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          total_spent: (userCredits?.total_spent || 0) + 5
        })
        .eq('user_id', userId);

      // Log transaction
      await req.supabase.from('credit_transactions').insert([{
        user_id: userId,
        amount: -5,
        type: 'generation_cached',
        reason: `Cached: ${idea.substring(0, 50)}...`,
        provider: cacheHit.provider,
      }]);

      // Increment daily count
      const { error: cacheIncrementError } = await req.supabase
        .rpc('increment_daily_count', { p_user_id: userId });

      if (cacheIncrementError) {
        console.error('⚠️  Cache hit daily count error:', cacheIncrementError);
      }

      // Save to database
      const { data: saved } = await req.supabase
        .from('prompts')
        .insert([{
          user_id: userId,
          title: idea.substring(0, 100),
          content: cacheHit.content,
          mode: mode,
          category: category,
          provider: cacheHit.provider,
          is_cached: true,
        }])
        .select()
        .single();

      // Log to usage_logs
      await req.supabase
        .from('usage_logs')
        .insert([{
          user_id: userId,
          action: 'generation_cached',
          api_provider: cacheHit.provider,
          tokens_used: cacheHit.content?.length || 0,
          status: 'success_cached'
        }]);

      // Update platform analytics
      await req.supabase.rpc('update_platform_analytics');

      return res.status(201).json({
        success: true,
        cached: true,
        content: cacheHit.content,
        provider: cacheHit.provider,
        creditUsed: 5,
        creditsRemaining: newBalance,
        dailyUsed: dailyCount + 1,
        saved: saved
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 6. TRY TO ROUTE TO PROVIDER
    // ════════════════════════════════════════════════════════════════════════

    const buildSystemPrompt = (mode, category) => {
      const systemPrompts = {
        'e-commerce': 'You are an expert e-commerce product specialist. Generate compelling product descriptions.',
        'content': 'You are a professional content writer. Generate high-quality, engaging content.',
        'marketing': 'You are a marketing expert. Generate persuasive marketing copy.',
        'social': 'You are a social media expert. Generate engaging social media posts.',
        'default': 'You are a helpful AI assistant. Generate high-quality prompts based on user input.'
      };
      
      return systemPrompts[category] || systemPrompts['default'];
    };

    const systemPrompt = buildSystemPrompt(mode, category);

    let result;
    try {
      result = await routeToProvider(idea, systemPrompt, userTier);
      console.log(`✅ Generation success via ${result.provider}`);
    } catch (error) {
      if (error.message === 'ALL_PROVIDERS_EXHAUSTED') {
        console.log(`⏳ All providers exhausted, queuing request for user ${userId}`);
        
        // Queue request
        try {
          const queueStatus = await queue.enqueue(userId, userTier, idea, systemPrompt);
          return res.status(202).json({
            queued: true,
            jobId: queueStatus.jobId,
            position: queueStatus.position,
            estimatedWait: queueStatus.estimatedWait,
            message: `Our AI is experiencing high demand. Your request has been queued and will process in ~${queueStatus.estimatedWait} seconds.`
          });
        } catch (queueError) {
          if (queueError.message === 'QUEUE_FULL') {
            return res.status(503).json({
              error: 'service_overloaded',
              message: 'Service is at maximum capacity. Please try again in a few minutes.'
            });
          }
          throw queueError;
        }
      }
      throw error;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 7. CALCULATE CREDIT DEDUCTION BASED ON OUTPUT LENGTH
    // ════════════════════════════════════════════════════════════════════════

    let creditsToDeduct = 10; // Default
    const outputLen = result.outputLength;

    if (outputLen < 200) {
      creditsToDeduct = 10;
    } else if (outputLen < 500) {
      creditsToDeduct = 12;
    } else {
      creditsToDeduct = 15;
    }

    // Check if user still has enough credits
    if (currentBalance < creditsToDeduct) {
      return res.status(402).json({
        error: 'insufficient_credits',
        message: 'Not enough credits for this generation.',
        balance: currentBalance,
        required: creditsToDeduct
      });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 8. DEDUCT CREDITS AFTER SUCCESS
    // ════════════════════════════════════════════════════════════════════════

    const newBalance = currentBalance - creditsToDeduct;
    await req.supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        total_spent: (userCredits?.total_spent || 0) + creditsToDeduct
      })
      .eq('user_id', userId);

    // Log transaction
    await req.supabase.from('credit_transactions').insert([{
      user_id: userId,
      amount: -creditsToDeduct,
      type: 'generation',
      reason: `Generated: ${idea.substring(0, 50)}...`,
      provider: result.provider,
    }]);

    // ════════════════════════════════════════════════════════════════════════
    // 9. INCREMENT DAILY GENERATION COUNT
    // ════════════════════════════════════════════════════════════════════════

    const { data: incrementResult, error: incrementError } = await req.supabase
      .rpc('increment_daily_count', { p_user_id: userId });

    if (incrementError) {
      console.error('⚠️  Daily count increment error:', incrementError);
      // Non-critical, don't fail the request
    }

    // ════════════════════════════════════════════════════════════════════════
    // 10. CACHE THE RESULT
    // ════════════════════════════════════════════════════════════════════════

    cache.set(idea, result.content, result.provider, result.outputLength, category);

    // ════════════════════════════════════════════════════════════════════════
    // 11. SAVE TO DATABASE
    // ════════════════════════════════════════════════════════════════════════

    const { data: saved, error: saveError } = await req.supabase
      .from('prompts')
      .insert([{
        user_id: userId,
        title: idea.substring(0, 100),
        content: result.content,
        mode: mode,
        category: category,
        provider: result.provider,
        output_length: result.outputLength,
        credits_used: creditsToDeduct
      }])
      .select()
      .single();

    if (saveError) {
      console.error('❌ Save error:', saveError);
      // Still succeed, error is non-critical
    }

    // ════════════════════════════════════════════════════════════════════════
    // 11A. LOG TO USAGE_LOGS FOR AUDIT TRAIL
    // ════════════════════════════════════════════════════════════════════════

    const { error: logError } = await req.supabase
      .from('usage_logs')
      .insert([{
        user_id: userId,
        action: 'generation',
        api_provider: result.provider,
        tokens_used: result.outputLength,
        status: 'success'
      }]);

    if (logError) {
      console.error('⚠️  Usage log error:', logError);
      // Non-critical, don't fail the request
    }

    // ════════════════════════════════════════════════════════════════════════
    // 11B. UPDATE PLATFORM ANALYTICS
    // ════════════════════════════════════════════════════════════════════════

    const { error: analyticsError } = await req.supabase
      .rpc('update_platform_analytics');

    if (analyticsError) {
      console.error('⚠️  Analytics update error:', analyticsError);
      // Non-critical, don't fail the request
    }

    // ════════════════════════════════════════════════════════════════════════
    // 12. APPLY LOGIN BONUS (FREE USERS ONLY, FIRST GENERATION OF DAY)
    // ════════════════════════════════════════════════════════════════════════

    if (userTier === 'free' && dailyCount === 0) {
      const bonusAmount = 10;
      const bonusBalance = newBalance + bonusAmount;

      await req.supabase
        .from('user_credits')
        .update({ balance: bonusBalance })
        .eq('user_id', userId);

      await req.supabase.from('credit_transactions').insert([{
        user_id: userId,
        amount: bonusAmount,
        type: 'login_bonus',
        reason: 'First generation of the day bonus',
        provider: 'system'
      }]);

      return res.status(201).json({
        success: true,
        content: result.content,
        provider: result.provider,
        creditUsed: creditsToDeduct,
        bonusAwarded: bonusAmount,
        creditsRemaining: bonusBalance,
        dailyUsed: dailyCount + 1,
        saved: saved
      });
    }

    return res.status(201).json({
      success: true,
      content: result.content,
      provider: result.provider,
      creditUsed: creditsToDeduct,
      creditsRemaining: newBalance,
      dailyUsed: dailyCount + 1,
      saved: saved
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    
    // Map errors to user-friendly messages
    if (error.message === 'ALL_PROVIDERS_FAILED') {
      return res.status(503).json({
        error: 'generation_failed',
        message: 'Generation failed. Please try again in a moment.'
      });
    }

    res.status(500).json({ 
      error: 'generation_error',
      message: 'Failed to generate prompt. Please try again.' 
    });
  }
};

// Helper function to build system prompt based on category
const buildSystemPrompt = (mode, category) => {
  const categoryPrompts = {
    'e-commerce': 'You are an e-commerce expert. Generate a detailed business brief for an e-commerce platform.',
    'saas': 'You are a SaaS product expert. Generate a detailed business brief for a SaaS application.',
    'mobile': 'You are a mobile app expert. Generate a detailed business brief for a mobile application.',
    'general': 'You are a product expert. Generate a detailed business brief for the described product idea.',
  };

  return categoryPrompts[category] || categoryPrompts['general'];
};

export default {
  getProfile,
  updateProfile,
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  generatePrompt,
};
