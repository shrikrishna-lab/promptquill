/**
 * AI Router System - Intelligent provider selection and routing
 * Handles rate limiting, provider priority, failover, and request management
 */

import crypto from 'crypto';
import axios from 'axios';
import { providerLogger } from './providerLogger.js';
import { wsManager } from './websocket.js';

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDERS = {
  // ═════════════════════════════════════════════════════════════════════════
  // GROQ (5 keys available = 72,000 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  groq_1: {
    name: 'groq_1',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    keyEnv: 'GROQ_KEY_1',
    rpmLimit: 30,
    rpdLimit: 14400,
    priority: { free: 9, pro: 1 },
    timeout: 30000
  },
  groq_2: {
    name: 'groq_2',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    keyEnv: 'GROQ_KEY_2',
    rpmLimit: 30,
    rpdLimit: 14400,
    priority: { free: 10, pro: 2 },
    timeout: 30000
  },
  groq_3: {
    name: 'groq_3',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    keyEnv: 'GROQ_KEY_3',
    rpmLimit: 30,
    rpdLimit: 14400,
    priority: { free: 11, pro: 4 },
    timeout: 30000
  },
  groq_4: {
    name: 'groq_4',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    keyEnv: 'GROQ_KEY_4',
    rpmLimit: 30,
    rpdLimit: 14400,
    priority: { free: 12, pro: 3 },
    timeout: 30000
  },
  groq_5: {
    name: 'groq_5',
    type: 'openai-compatible',
    baseURL: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    keyEnv: 'GROQ_API_KEY',
    rpmLimit: 30,
    rpdLimit: 14400,
    priority: { free: 13, pro: 8 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CEREBRAS (3 keys available = 15,000 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  cerebras_1: {
    name: 'cerebras_1',
    type: 'openai-compatible',
    baseURL: 'https://api.cerebras.ai/v1',
    model: 'llama3.1-8b',
    keyEnv: 'CEREBRAS_KEY',
    rpmLimit: 30,
    rpdLimit: 5000,
    priority: { free: 14, pro: 5 },
    timeout: 30000
  },
  cerebras_2: {
    name: 'cerebras_2',
    type: 'openai-compatible',
    baseURL: 'https://api.cerebras.ai/v1',
    model: 'llama3.1-8b',
    keyEnv: 'CEREBRAS_KEY1',
    rpmLimit: 30,
    rpdLimit: 5000,
    priority: { free: 15, pro: 6 },
    timeout: 30000
  },
  cerebras_3: {
    name: 'cerebras_3',
    type: 'openai-compatible',
    baseURL: 'https://api.cerebras.ai/v1',
    model: 'llama3.1-8b',
    keyEnv: 'CEREBRAS_KEY2',
    rpmLimit: 30,
    rpdLimit: 5000,
    priority: { free: 16, pro: 7 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // CLOUDFLARE (1 key = 10,000 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  cloudflare: {
    name: 'cloudflare',
    type: 'cloudflare',
    baseURL: 'https://api.cloudflare.com/client/v4/accounts',
    model: '@cf/meta/llama-3.1-8b-instruct',
    keyEnv: 'CF_API_KEY',
    accountIdEnv: 'CF_ACCOUNT_ID',
    rpmLimit: 600,
    rpdLimit: 10000,
    priority: { free: 1, pro: 9 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // GEMINI (1 key = 1,500 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  gemini: {
    name: 'gemini',
    type: 'gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-1.5-flash',
    keyEnv: 'GEMINI_API_KEY',
    rpmLimit: 15,
    rpdLimit: 1500,
    priority: { free: 2, pro: 10 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // GITHUB MODELS (1 key = 5,000 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  github_models: {
    name: 'github_models',
    type: 'openai-compatible',
    baseURL: 'https://models.inference.ai.azure.com',
    model: 'meta-llama-3.1-8b-instruct',
    keyEnv: 'GITHUB_TOKEN',
    rpmLimit: 180,
    rpdLimit: 5000,
    priority: { free: 3, pro: 11 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MISTRAL (1 key = 2,000 req/day)
  // ═════════════════════════════════════════════════════════════════════════
  mistral: {
    name: 'mistral',
    type: 'openai-compatible',
    baseURL: 'https://api.mistral.ai/v1',
    model: 'mistral-small-latest',
    keyEnv: 'MISTRAL_KEY',
    rpmLimit: 180,
    rpdLimit: 2000,
    priority: { free: 4, pro: 12 },
    timeout: 30000
  },

  // ═════════════════════════════════════════════════════════════════════════
  // OPENROUTER (1 key = 400 req/day FREE TIER)
  // ═════════════════════════════════════════════════════════════════════════
  openrouter: {
    name: 'openrouter',
    type: 'openai-compatible',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    keyEnv: 'OPENROUTER_API_KEY',
    rpmLimit: 30,
    rpdLimit: 400,
    priority: { free: 5, pro: 13 },
    timeout: 30000,
    extraHeaders: { 'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173' }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMIT TRACKER (IN-MEMORY)
// ═══════════════════════════════════════════════════════════════════════════

class RateLimitTracker {
  constructor() {
    // Track per provider: { timestamps: [], errorCount: 0, blacklistUntil: timestamp }
    this.providers = {};
    Object.keys(PROVIDERS).forEach(name => {
      this.providers[name] = {
        minuteTimestamps: [],
        dayTimestamps: [],
        consecutiveErrors: 0,
        blacklistedUntil: null,
        lastUsed: null
      };
    });
    // Cleanup interval every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Check if provider can accept requests right now
   */
  canUseProvider(providerName) {
    const provider = this.providers[providerName];
    if (!provider) return false;

    // Check if blacklisted
    if (provider.blacklistedUntil && provider.blacklistedUntil > Date.now()) {
      return false;
    }

    const config = PROVIDERS[providerName];
    const now = Date.now();

    // Clean old timestamps
    provider.minuteTimestamps = provider.minuteTimestamps.filter(t => now - t < 60000);
    provider.dayTimestamps = provider.dayTimestamps.filter(t => now - t < 86400000);

    // Check RPM
    if (provider.minuteTimestamps.length >= config.rpmLimit) {
      return false;
    }

    // Check RPD
    if (provider.dayTimestamps.length >= config.rpdLimit) {
      return false;
    }

    return true;
  }

  /**
   * Record successful request
   */
  recordSuccess(providerName, userId = 'unknown', duration = 0) {
    const provider = this.providers[providerName];
    const now = Date.now();
    provider.minuteTimestamps.push(now);
    provider.dayTimestamps.push(now);
    provider.consecutiveErrors = 0;
    provider.lastUsed = now;
    
    // Log to analytics
    providerLogger.logSuccess(providerName, userId, duration);
    
    // Broadcast real-time update to WebSocket clients
    wsManager.broadcastProviderEvent({
      type: 'success',
      provider: providerName,
      userId: userId,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
    // Also send updated metrics every 10th success
    if (Math.random() < 0.1) {
      wsManager.broadcastMetricsUpdate();
    }
  }

  /**
   * Record error
   */
  recordError(providerName, statusCode, userId = 'unknown', errorMessage = '', duration = 0) {
    const provider = this.providers[providerName];

    // 429 errors don't count toward blacklist
    if (statusCode === 429) {
      providerLogger.logRateLimit(providerName, 'minute');
      
      // Broadcast rate limit event
      wsManager.broadcastProviderEvent({
        type: 'rate_limit',
        provider: providerName,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 5xx errors increment counter
    if (statusCode >= 500) {
      provider.consecutiveErrors++;
      providerLogger.logError(providerName, userId, statusCode, errorMessage, duration);
      
      // Broadcast error event
      wsManager.broadcastProviderEvent({
        type: 'error',
        provider: providerName,
        statusCode: statusCode,
        errorMessage: errorMessage,
        userId: userId,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      if (provider.consecutiveErrors >= 5) {
        provider.blacklistedUntil = Date.now() + 600000; // 10 min blacklist
        console.log(`❌ Provider ${providerName} blacklisted for 10 minutes (${provider.consecutiveErrors} errors)`);
        providerLogger.logBlacklist(providerName, `${provider.consecutiveErrors} consecutive errors`);
        
        // Broadcast blacklist event
        wsManager.broadcastProviderEvent({
          type: 'blacklist',
          provider: providerName,
          reason: `${provider.consecutiveErrors} consecutive errors`,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      providerLogger.logError(providerName, userId, statusCode, errorMessage, duration);
      
      // Broadcast error event
      wsManager.broadcastProviderEvent({
        type: 'error',
        provider: providerName,
        statusCode: statusCode,
        errorMessage: errorMessage,
        userId: userId,
        duration: duration,
        timestamp: new Date().toISOString()
      });
    }
    
    // Send updated metrics after errors
    wsManager.broadcastMetricsUpdate();
  }

  /**
   * Get provider stats for monitoring
   */
  getStats(providerName) {
    const provider = this.providers[providerName];
    const config = PROVIDERS[providerName];
    const now = Date.now();

    // Clean timestamps
    const minuteStamps = provider.minuteTimestamps.filter(t => now - t < 60000);
    const dayStamps = provider.dayTimestamps.filter(t => now - t < 86400000);

    return {
      name: providerName,
      available: this.canUseProvider(providerName),
      blacklisted: provider.blacklistedUntil && provider.blacklistedUntil > now,
      minuteUsed: minuteStamps.length,
      minuteLimit: config.rpmLimit,
      minutePercent: Math.round((minuteStamps.length / config.rpmLimit) * 100),
      dayUsed: dayStamps.length,
      dayLimit: config.rpdLimit,
      dayPercent: Math.round((dayStamps.length / config.rpdLimit) * 100),
      consecutiveErrors: provider.consecutiveErrors,
      lastUsed: provider.lastUsed
    };
  }

  /**
   * Periodic cleanup of old timestamps
   */
  cleanup() {
    const now = Date.now();
    Object.keys(this.providers).forEach(name => {
      const provider = this.providers[name];
      provider.minuteTimestamps = provider.minuteTimestamps.filter(t => now - t < 60000);
      provider.dayTimestamps = provider.dayTimestamps.filter(t => now - t < 86400000);

      // Remove old blacklist
      if (provider.blacklistedUntil && provider.blacklistedUntil < now) {
        provider.blacklistedUntil = null;
        provider.consecutiveErrors = 0;
      }
    });
  }
}

const rateLimitTracker = new RateLimitTracker();

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER SELECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get available providers sorted by priority
 */
function getAvailableProviders(userTier) {
  const tier = userTier === 'pro' ? 'pro' : 'free';
  
  // Get all providers that are currently available
  const available = Object.keys(PROVIDERS).filter(
    name => rateLimitTracker.canUseProvider(name) && process.env[PROVIDERS[name].keyEnv]
  );

  // Sort by priority
  available.sort((a, b) => {
    const priorityA = PROVIDERS[a].priority[tier];
    const priorityB = PROVIDERS[b].priority[tier];
    return priorityA - priorityB;
  });

  return available;
}

// ═══════════════════════════════════════════════════════════════════════════
// API CALLS - OPENAI COMPATIBLE FORMAT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Call OpenAI-compatible provider
 */
async function callOpenAICompatible(providerName, prompt, systemPrompt) {
  const config = PROVIDERS[providerName];
  const apiKey = process.env[config.keyEnv];

  if (!apiKey) {
    throw new Error(`Missing API key for ${providerName}`);
  }

  try {
    const response = await axios.post(
      `${config.baseURL}/chat/completions`,
      {
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(config.extraHeaders || {})
        },
        timeout: config.timeout
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Invalid response format from provider');
    }

    rateLimitTracker.recordSuccess(providerName);
    return content;
  } catch (error) {
    const statusCode = error.response?.status || 0;
    rateLimitTracker.recordError(providerName, statusCode);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API CALLS - GEMINI FORMAT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Call Google Gemini API
 */
async function callGemini(providerName, prompt, systemPrompt) {
  const config = PROVIDERS[providerName];
  const apiKey = process.env[config.keyEnv];

  if (!apiKey) {
    throw new Error(`Missing API key for ${providerName}`);
  }

  try {
    const response = await axios.post(
      `${config.baseURL}/${config.model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4000,
          topP: 0.9
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: config.timeout
      }
    );

    const content = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Invalid response format from Gemini');
    }

    rateLimitTracker.recordSuccess(providerName);
    return content;
  } catch (error) {
    const statusCode = error.response?.status || 0;
    rateLimitTracker.recordError(providerName, statusCode);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// API CALLS - CLOUDFLARE FORMAT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Call Cloudflare Workers AI
 */
async function callCloudflare(providerName, prompt, systemPrompt) {
  const config = PROVIDERS[providerName];
  const apiKey = process.env[config.keyEnv];
  const accountId = process.env[config.accountIdEnv];

  if (!apiKey || !accountId) {
    throw new Error(`Missing credentials for ${providerName}`);
  }

  try {
    const response = await axios.post(
      `${config.baseURL}/${accountId}/ai/run/${config.model}`,
      {
        prompt: `${systemPrompt}\n\n${prompt}`
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response?.data?.result?.response;
    if (!content) {
      throw new Error('Invalid response format from Cloudflare');
    }

    rateLimitTracker.recordSuccess(providerName);
    return content;
  } catch (error) {
    const statusCode = error.response?.status || 0;
    rateLimitTracker.recordError(providerName, statusCode);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ROUTING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Route to appropriate provider and get AI response
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System instructions
 * @param {string} userTier - User tier ('free' or 'pro')
 * @returns {Promise<{content: string, provider: string, outputLength: number}>}
 */
async function routeToProvider(prompt, systemPrompt, userTier = 'free') {
  const availableProviders = getAvailableProviders(userTier);

  if (availableProviders.length === 0) {
    throw new Error('ALL_PROVIDERS_EXHAUSTED');
  }

  let lastError = null;

  // Try each available provider in priority order
  for (const providerName of availableProviders) {
    try {
      const config = PROVIDERS[providerName];
      let content;

      if (config.type === 'openai-compatible') {
        content = await callOpenAICompatible(providerName, prompt, systemPrompt);
      } else if (config.type === 'gemini') {
        content = await callGemini(providerName, prompt, systemPrompt);
      } else if (config.type === 'cloudflare') {
        content = await callCloudflare(providerName, prompt, systemPrompt);
      }

      return {
        content,
        provider: providerName,
        outputLength: content.length
      };
    } catch (error) {
      console.error(`❌ Provider ${providerName} failed:`, error.message);
      lastError = error;
      continue;
    }
  }

  // All providers failed
  throw lastError || new Error('ALL_PROVIDERS_FAILED');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PROVIDERS,
  rateLimitTracker,
  providerLogger,
  getAvailableProviders,
  routeToProvider,
  callOpenAICompatible,
  callGemini,
  callCloudflare
};
