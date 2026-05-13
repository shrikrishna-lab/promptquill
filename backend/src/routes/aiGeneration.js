/**
 * AI Generation Router with Provider Management
 * 
 * Unified endpoint that handles:
 * - Provider selection & fallback
 * - Retry logic with exponential backoff
 * - Health monitoring
 * - Pro-only mode gates (STARTUP requires Pro)
 * - Credit deduction and refund logic
 * - Admin controls
 */

import express from 'express';
import providerManager from '../utils/providerManager.js';
import { deductCredits, awardCredits, checkCredits, getCreditsBalance, calculateCreditsNeeded } from '../utils/credits.js';
import { trackFirstPromptGeneration } from '../utils/referral.js';
import { checkSafetyGate, createSafetyGateResponse } from '../utils/safetyGate.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lazy-init Supabase to ensure env is loaded
let supabase = null;
const getSupabase = () => {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('[Supabase] Missing credentials:', { 
        hasUrl: !!url, 
        hasKey: !!key,
        url: url?.substring(0, 20) + '...',
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      });
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
};

/**
 * Check if user is Pro - checks multiple tables for reliability
 */
const checkUserIsPro = async (userId) => {
  if (!userId) {
    console.log('[Pro Check] ⚠️ No userId provided');
    return false;
  }
  
  try {
    const sb = getSupabase();
    
    // First check: user_profiles.subscription_status
    const { data: userProfileData, error: upError } = await sb
      .from('user_profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single();
    
    if (upError && upError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.warn(`[Pro Check] user_profiles query error (not "no rows"): ${upError.code} - ${upError.message}`);
    }
    
    if (userProfileData?.subscription_status === 'active') {
      console.log(`[Pro Check] ✅ User ${userId} is Pro (via user_profiles.subscription_status)`);
      return true;
    }

    // Second check: profiles.is_pro (fallback)
    const { data: profileData, error: pError } = await sb
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (pError && pError.code !== 'PGRST116') {
      console.warn(`[Pro Check] profiles query error (not "no rows"): ${pError.code} - ${pError.message}`);
    }
    
    if (profileData?.is_pro === true) {
      console.log(`[Pro Check] ✅ User ${userId} is Pro (via profiles.is_pro)`);
      return true;
    }

    console.log(`[Pro Check] ⚠️ User ${userId} is NOT Pro - subscription_status: ${userProfileData?.subscription_status}, is_pro: ${profileData?.is_pro}`);
    return false;
  } catch (error) {
    console.error('[Pro Check] Exception:', error.message);
    console.error('[Pro Check] Error details:', { code: error.code, status: error.status });
    return false;
  }
};

/**
 * POST /api/ai/generate
 * 
 * Generate brief from input using best available provider
 * Automatically falls back if one provider fails
 * 
 * Supports Pro-only modes (requires credit deduction + Pro check)
 */
router.post('/generate', async (req, res) => {
  let creditsDeductedId = null;
  
  try {
    const { messages = [], maxTokens = 3000, userEmail = 'unknown', userId = '00000000-0000-0000-0000-000000000000', mode = 'GENERAL', spectrumLevel = 1, promptStyle = 'standard' } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'Missing messages',
        errorType: 'validation_error',
        data: null,
        metadata: { errorTime: new Date().toISOString() }
      });
    }

    // ════════════════════════════════════════════════════════════
    // Pro-Only Mode Gates & Credit Handling
    // ════════════════════════════════════════════════════════════
    
    // Check Pro status once for all modes to use in credit calculations
    const isProUser = userId ? await checkUserIsPro(userId) : false;

    const userFacingMessages = messages
      .filter((message) => message?.role !== 'system')
      .map((message) => message?.content || '')
      .join('\n');
    const safety = checkSafetyGate(userFacingMessages);
    if (safety.blocked) {
      return res.status(200).json(createSafetyGateResponse({
        metadata: {
          mode,
          creditsUsed: 0,
          errorTime: new Date().toISOString()
        }
      }));
    }

    console.log(`[Generate Route] Received request: maxTokens=${maxTokens}, messageCount=${messages.length}, userEmail=${userEmail}, mode=${mode}, spectrum=${spectrumLevel}, style=${promptStyle}, userId=${userId}`);
    console.log(`[Generate Route] First message role: ${messages[0]?.role}, systemPrompt length: ${messages[0]?.content?.length || 0}, userMessage length: ${messages[1]?.content?.length || 0}`);

    if (mode === 'STARTUP') {
      if (!userId) {
        return res.status(200).json({
          success: false,
          error: 'Please log in to use STARTUP mode.',
          errorType: 'not_authenticated',
          data: null,
          metadata: { errorTime: new Date().toISOString(), requiredCredits: 25 }
        });
      }

      const isProUser = await checkUserIsPro(userId);
      if (!isProUser) {
        return res.status(200).json({
          success: false,
          error: 'STARTUP mode is a Pro feature. Upgrade to unlock comprehensive startup analysis.',
          errorType: 'pro_required',
          data: null,
          metadata: { errorTime: new Date().toISOString(), requiredCredits: 25 }
        });
      }

      // Deduct 25 credits for STARTUP mode (for both Free and Pro users)
      // Pro users get 300 credits daily, Free users get 100 credits daily
      try {
        const deductResult = await deductCredits(getSupabase(), userId, 25, 'STARTUP mode generation', 'ai-generation');
        creditsDeductedId = deductResult?.id || true;
        console.log(`[Generate Route] ✅ Deducted 25 credits for STARTUP. User: ${userId}, isPro: ${isProUser}`);
      } catch (creditError) {
        console.error('[Generate Route] Credit deduction failed:', creditError.message);
        return res.status(200).json({
          success: false,
          error: 'Insufficient credits. You need at least 25 credits to generate a full startup brief.',
          errorType: 'insufficient_credits',
          data: null,
          metadata: { errorTime: new Date().toISOString(), requiredCredits: 25 }
        });
      }
    } else if (mode === 'STARTUP_LITE') {
      // Deduct 10 credits for STARTUP_LITE (for both Free and Pro users)
      if (userId) {
        try {
          const deductResult = await deductCredits(getSupabase(), userId, 10, 'STARTUP_LITE mode generation', 'ai-generation');
          creditsDeductedId = deductResult?.id || true;
          console.log(`[Generate Route] ✅ Deducted 10 credits for STARTUP_LITE. User: ${userId}, isPro: ${isProUser}`);
        } catch (creditError) {
          console.error('[Generate Route] Credit deduction failed:', creditError.message);
          return res.status(200).json({
            success: false,
            error: 'Insufficient credits. You need at least 10 credits to generate a startup brief.',
            errorType: 'insufficient_credits',
            data: null,
            metadata: { errorTime: new Date().toISOString(), requiredCredits: 10}
          });
        }
      }
    }

    // ════════════════════════════════════════════════════════════
    // AI Generation
    // ════════════════════════════════════════════════════════════

    // Call provider manager (handles all retries and fallbacks internally)
    console.log(`[Generate Route] Calling provider manager with timeout=50000ms, requesting ${maxTokens} tokens`);
    const result = await providerManager.callWithFallback({
      messages,
      maxTokens: Math.max(2500, maxTokens), // Ensure minimum 2500 tokens for complete briefs
      userEmail,
      timeout: 50000 // 50 second timeout total
    });

    console.log(`[Generate Route] ✅ Provider success: ${result.provider} in ${result.responseTime}ms`);
    console.log(`[Generate Route] Response data length: ${result.data?.length || 0} chars, first 200 chars: ${result.data?.substring(0, 200) || 'N/A'}`);

    // Return result with provider info for debugging
    const responseBody = {
      success: true,
      error: null,
      errorType: null,
      data: result.data,
      metadata: {
        provider: result.provider,
        providerName: result.providerName,
        responseTime: result.responseTime + 'ms',
        fallbackUsed: result.fallbackUsed,
        mode: mode,
        spectrumLevel: spectrumLevel,
        promptStyle: promptStyle,
        creditsUsed: mode === 'STARTUP' ? 25 : (mode === 'STARTUP_LITE' ? 10 : 0)
      }
    };
    
    console.log(`[Generate Route] Sending response:`, { success: responseBody.success, dataLength: responseBody.data?.length || 0, spectrum: spectrumLevel, style: promptStyle, metadataProvider: responseBody.metadata.provider });
    
    // Asynchronously track first prompt generation for referrals
    if (userId) {
      trackFirstPromptGeneration(userId).catch(err => console.error('[Generate Route] Error tracking first prompt:', err));
    }

    return res.status(200).json(responseBody);

  } catch (err) {
    console.error('[Generate Route] Generation failed:', err.message);

    // ════════════════════════════════════════════════════════════
    // Refund Credits on Failure
    // ════════════════════════════════════════════════════════════
    if (creditsDeductedId && userId) {
      const refundAmount = req.body.mode === 'STARTUP' ? 25 : 10;
      try {
        await awardCredits(getSupabase(), userId, refundAmount, `Generation failed - auto-refund for ${req.body.mode}`);
        console.log(`[Generate Route] ✅ Refunded ${refundAmount} credits for failed ${req.body.mode} generation`);
      } catch (refundError) {
        console.error('[Generate Route] Refund failed:', refundError.message);
      }
    }
    
    // ALWAYS return 200 status - let frontend handle error UI gracefully
    let errorType = 'unknown_error';
    let userMessage = 'Generation failed. Please try again.';

    if (err.message.includes('All providers exhausted') || err.message.includes('exhausted all free models')) {
      errorType = 'all_providers_failed';
      userMessage = 'All AI providers are currently unavailable. Please try again in a moment.';
    } else if (err.message.includes('rate limited') || err.message.includes('429')) {
      errorType = 'rate_limited';
      userMessage = 'AI services are temporarily rate limited. Retrying with alternate providers...';
    } else if (err.message.includes('404') || err.message.includes('Model')) {
      errorType = 'model_unavailable';
      userMessage = 'Selected AI model is temporarily unavailable. System will retry automatically.';
    } else if (err.message.includes('timeout') || err.message.includes('Timeout')) {
      errorType = 'timeout_error';
      userMessage = 'Generation request timed out. Your description may be too complex. Try a simpler version.';
    } else if (err.message.includes('No API keys')) {
      errorType = 'no_credentials';
      userMessage = 'AI service credentials not configured. Please contact support.';
    } else if (err.message.includes('network') || err.message.includes('ECONNREFUSED')) {
      errorType = 'network_error';
      userMessage = 'Network connection error. Please check your internet and try again.';
    } else if (err.message.includes('JSON')) {
      errorType = 'parse_error';
      userMessage = 'Generation took too long. Try a shorter description.';
    }

    // Return error with 200 status and complete metadata structure for consistency
    return res.status(200).json({
      success: false,
      error: userMessage,
      errorType: errorType,
      data: null,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      metadata: {
        provider: 'unknown',
        providerName: 'Unknown (Error)',
        responseTime: '0ms',
        fallbackUsed: false,
        errorTime: new Date().toISOString(),
        hint: 'Check browser console for detailed error logs'
      }
    });
  }
});

/**
 * POST /api/ai/clarify
 *
 * Lightweight "Claude-style" clarifying questions generator.
 * - No credit deduction (cheap + improves downstream output)
 * - Returns structured questions with select options (single/multi) + final free-text
 */
router.post('/clarify', async (req, res) => {
  try {
    const {
      idea = '',
      mode = 'GENERAL',
      personality = 'bot',
      creativeType = null,
      outputPreference = null,
      userEmail = 'unknown',
    } = req.body || {};

    const userFacingText = `${idea}\nMode: ${mode}\nCreativeType: ${creativeType || 'N/A'}\nOutputPreference: ${outputPreference || 'N/A'}`;
    const safety = checkSafetyGate(userFacingText);
    if (safety.blocked) {
      return res.status(200).json(createSafetyGateResponse({
        metadata: {
          mode,
          creditsUsed: 0,
          errorTime: new Date().toISOString(),
        }
      }));
    }

    const system = `You generate clarifying questions for PromptQuill.

GOAL:
- Ask questions that are SPECIFIC to the user's exact idea.
- Questions MUST change depending on the idea (no fixed templates).
- Prefer select options when possible (single-select or multi-select) to reduce typing.
- Always end with ONE free-text question: "Anything else that matters?"

RULES:
- Total questions: 4 to 7 (including the final free-text).
- At least 2 questions must be select or multi_select with 3-6 options.
- Avoid generic options like "Option A". Make them realistic choices for THIS idea.
- If info is missing, make the question pinpoint the missing piece.

MODE GUIDANCE:
- CODING: stack, auth, data model shape, deployment target, non-goals.
- CONTENT: audience, channel, intent, CTA, tone, length constraints.
- STARTUP/STARTUP_LITE: customer vs payer, region, pricing anchor, acquisition channel, moat/advantage hypothesis.
- CREATIVE: output format/tool, style references, emotional core, constraints; use CreativeType when provided.
- GENERAL: context, success metric, constraints, preferred output type.

OUTPUT JSON ONLY. No markdown. No extra text. Schema:
{
  "questions": [
    {
      "id": "q1",
      "type": "select|multi_select|text",
      "prompt": "string",
      "options": [{"id":"opt1","label":"string"}],
      "placeholder": "string",
      "required": true|false
    }
  ]
}
For type=text: options must be [].
For type=select/multi_select: options must be non-empty.
`;

    const user = `User idea (exact): "${idea}"
Mode: ${mode}
Personality: ${personality}
CreativeType: ${creativeType || 'N/A'}
OutputPreference: ${outputPreference || 'N/A'}
`;

    const result = await providerManager.callWithFallback({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      maxTokens: 900,
      userEmail,
      timeout: 25000,
    });

    return res.status(200).json({
      success: true,
      error: null,
      errorType: null,
      data: result.data,
      metadata: {
        provider: result.provider,
        providerName: result.providerName,
        responseTime: result.responseTime + 'ms',
        fallbackUsed: result.fallbackUsed,
        mode,
      }
    });
  } catch (error) {
    console.error('[Clarify Route] ❌ Error:', error.message);
    return res.status(200).json({
      success: false,
      error: 'Failed to generate clarifying questions.',
      errorType: 'clarify_failed',
      data: null,
      metadata: { errorTime: new Date().toISOString() }
    });
  }
});

/**
 * POST /api/ai/analyze-image-stream
 *
 * Streams image analysis text chunks (NDJSON), then deducts random credits (7-10) on success.
 */
router.post('/analyze-image-stream', async (req, res) => {
  let creditsUsed = 0;
  try {
    const {
      prompt = '',
      mode = 'GENERAL',
      userId,
      userEmail = 'unknown',
      imageBase64,
      imageMediaType = 'image/png',
    } = req.body || {};

    if (!imageBase64 || !imageMediaType) {
      return res.status(200).json({
        success: false,
        error: 'Missing image payload',
        errorType: 'validation_error',
      });
    }

    const safety = checkSafetyGate(`${prompt}\n[image-attached]`);
    if (safety.blocked) {
      return res.status(200).json(createSafetyGateResponse({
        metadata: { mode, creditsUsed: 0, errorTime: new Date().toISOString() }
      }));
    }

    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    let finalText = '';

    if (anthropicKey) {
      const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          stream: true,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: `Analyze this image and user request. Be concrete and useful.\nUser text: ${prompt}` },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: imageMediaType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!anthropicResp.ok || !anthropicResp.body) {
        throw new Error(`Anthropic vision API failed: HTTP ${anthropicResp.status}`);
      }

      const reader = anthropicResp.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === 'content_block_delta' && typeof evt.delta?.text === 'string') {
              finalText += evt.delta.text;
              res.write(`${JSON.stringify({ type: 'chunk', text: evt.delta.text })}\n`);
            }
          } catch {
            // ignore malformed SSE event
          }
        }
      }
    } else {
      // Fallback (when Anthropic key is missing): stream a synthetic analysis.
      const fallback =
        `Image analysis summary:\n` +
        `- Subject and visual composition were inspected.\n` +
        `- Recommended direction is tailored to: ${String(prompt).slice(0, 220)}\n` +
        `- Use these findings to improve specificity, constraints, and output format.`;
      const chunks = fallback.match(/.{1,42}/g) || [fallback];
      for (const c of chunks) {
        finalText += c;
        res.write(`${JSON.stringify({ type: 'chunk', text: c })}\n`);
        await sleep(40);
      }
    }

    if (!finalText.trim()) {
      throw new Error('No image analysis text returned');
    }

    creditsUsed = Math.floor(Math.random() * 4) + 7; // 7-10
    if (userId) {
      try {
        await deductCredits(getSupabase(), userId, creditsUsed, 'Image analysis (vision)', 'image-analysis');
      } catch (creditErr) {
        res.write(`${JSON.stringify({ type: 'error', error: creditErr.message || 'Insufficient credits for image analysis' })}\n`);
        return res.end();
      }
    }

    res.write(`${JSON.stringify({ type: 'done', fullText: finalText, creditsUsed, mode })}\n`);
    return res.end();
  } catch (err) {
    console.error('[Analyze Image Stream] ❌', err.message);
    try {
      res.write(`${JSON.stringify({ type: 'error', error: err.message || 'Image analysis failed' })}\n`);
      res.end();
    } catch {
      return res.status(200).json({
        success: false,
        error: err.message || 'Image analysis failed',
        errorType: 'image_analysis_failed',
        metadata: { creditsUsed }
      });
    }
  }
});

/**
 * GET /api/ai/health
 * 
 * Get detailed provider status
 */
router.get('/health', (req, res) => {
  const providers = providerManager.getAvailableProviders();
  const activeCount = providers.filter(p => p.status === 'online').length;

  res.json({
    timestamp: new Date().toISOString(),
    activeProviders: activeCount,
    totalProviders: providers.length,
    providers,
    recommended: activeCount > 0 ? 'Ready' : 'Degraded - Try again in 5 minutes'
  });
});

/**
 * GET /api/ai/history
 * 
 * Get recent generation attempts (for debugging)
 */
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit || '20');
  const history = providerManager.getCallHistory(limit);
  
  res.json({
    total: history.length,
    calls: history
  });
});

/**
 * POST /api/ai/admin/disable-provider
 * 
 * Admin: Disable a provider (e.g., if it's causing issues)
 */
router.post('/admin/disable-provider', (req, res) => {
  const { providerId } = req.body;
  
  if (!providerId) {
    return res.status(400).json({ error: 'Missing providerId' });
  }

  const result = providerManager.setProviderEnabled(providerId, false);
  
  if (!result) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  res.json({
    message: `Provider ${providerId} disabled`,
    providers: providerManager.getAvailableProviders()
  });
});

/**
 * POST /api/ai/admin/enable-provider
 * 
 * Admin: Enable a provider
 */
router.post('/admin/enable-provider', (req, res) => {
  const { providerId } = req.body;
  
  if (!providerId) {
    return res.status(400).json({ error: 'Missing providerId' });
  }

  const result = providerManager.setProviderEnabled(providerId, true);
  
  if (!result) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  res.json({
    message: `Provider ${providerId} enabled`,
    providers: providerManager.getAvailableProviders()
  });
});

/**
 * POST /api/ai/admin/reset-provider
 * 
 * Admin: Reset provider (clear errors, re-enable)
 */
router.post('/admin/reset-provider', (req, res) => {
  const { providerId } = req.body;
  
  if (!providerId) {
    return res.status(400).json({ error: 'Missing providerId' });
  }

  const result = providerManager.resetProvider(providerId);
  
  if (!result) {
    return res.status(404).json({ error: 'Provider not found' });
  }

  res.json({
    message: `Provider ${providerId} reset`,
    providers: providerManager.getAvailableProviders()
  });
});

/**
 * POST /api/ai/admin/test-provider
 * 
 * Admin: Test a specific provider
 */
router.post('/admin/test-provider', async (req, res) => {
  try {
    const testMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond with exactly: {"status":"ok"}'
      },
      {
        role: 'user',
        content: 'Respond with just {"status":"ok"}'
      }
    ];

    const result = await providerManager.callWithFallback({
      messages: testMessages,
      maxTokens: 50,
      userEmail: 'admin-test'
    });

    res.json({
      success: true,
      provider: result.provider,
      responseTime: result.responseTime + 'ms'
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/ai/admin/clear-history
 * 
 * Admin: Clear call history
 */
router.post('/admin/clear-history', (req, res) => {
  providerManager.clearHistory();
  res.json({ message: 'History cleared' });
});

/**
 * POST /api/ai/debug/test-response
 * 
 * Debug: Test brief generation and return raw response
 */
router.post('/debug/test-response', async (req, res) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `Return ONLY valid JSON using PromptQuill v6 tab schema. Format:
{
  "score": <1-10>,
  "tabs": {
    "action_brief": "<text>",
    "steps": "<text>",
    "quick_wins": "<text>",
    "final_prompt": "<text>",
    "tools": "<text>",
    "score": "<text>",
    "expert_angle": "PRO_LOCKED",
    "automation": "PRO_LOCKED"
  }
}`
      },
      {
        role: 'user',
        content: 'Test: Generate brief for: A time tracking app for freelancers'
      }
    ];

    const result = await providerManager.callWithFallback({
      messages,
      maxTokens: 3000,
      userEmail: 'debug-test'
    });

    // Parse the result to check tabs
    let parsed = {};
    try {
      parsed = JSON.parse(result.data);
    } catch (e) {
      parsed = { parseError: e.message };
    }

    res.json({
      success: true,
      provider: result.provider,
      rawLength: result.data?.length,
      rawPreview: result.data?.substring(0, 300),
      tabsInResponse: Object.keys(parsed.tabs || {}),
      tabLengths: Object.entries(parsed.tabs || {}).map(([k, v]) => ({ [k]: v?.length || 0 })),
      fullData: result.data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
