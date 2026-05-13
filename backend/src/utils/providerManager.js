/**
 * AI Provider Manager - Intelligent Router with Health Checks
 * 
 * Features:
 * - Automatic failover between providers
 * - Health status tracking (online/degraded/offline)
 * - Exponential backoff for failed providers
 * - Transparent retry logic (user only sees delay, not errors)
 * - Admin control to enable/disable providers
 * - Provider response time monitoring
 */

import axios from 'axios';
import { OPENROUTER_CONFIG } from '../config/aiModels.js';

class ProviderManager {
  constructor() {
    this.providers = {
      // 1. GROQ - Multiple keys for load balancing (5 keys)
      groq: {
        name: 'Groq - Llama 3.1 8B (Free Tier)',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 1,
        enabled: true,
        keyIndex: 0,
        keys: [],
        config: {
          maxRetries: 3,
          timeout: 30000,
          backoffMultiplier: 2
        }
      },
      // 2. GEMINI - Multiple keys (3-4 keys)
      gemini: {
        name: 'Google Gemini 1.5 Flash',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 2,
        enabled: true,
        keyIndex: 0,
        keys: [],
        config: {
          maxRetries: 3,
          timeout: 45000,
          backoffMultiplier: 2
        }
      },
      // 3. CEREBRAS - Ultra fast, multiple keys (3 keys)
      cerebras: {
        name: 'Cerebras - Llama 3.1 8B (Ultra Fast)',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 3,
        enabled: true,
        keyIndex: 0,
        keys: [],
        config: {
          maxRetries: 3,
          timeout: 25000,
          backoffMultiplier: 2
        }
      },
      // 4. MISTRAL - Fast and reliable (1 key)
      mistral: {
        name: 'Mistral AI - Small Latest',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 4,
        enabled: true,
        keys: [],
        config: {
          maxRetries: 3,
          timeout: 35000,
          backoffMultiplier: 2
        }
      },
      // 5. CLOUDFLARE WORKERS AI - Dedicated infrastructure (1 key + account ID)
      cloudflare: {
        name: 'Cloudflare Workers AI - Llama 3.1',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 5,
        enabled: true,
        keys: [],
        config: {
          maxRetries: 3,
          timeout: 30000,
          backoffMultiplier: 2
        }
      },
      // 6. GITHUB MODELS - Integrated with GitHub (1 token)
      github: {
        name: 'GitHub Codespaces Models - Llama 3.1',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 6,
        enabled: true,
        keys: [],
        config: {
          maxRetries: 2,
          timeout: 40000,
          backoffMultiplier: 2
        }
      },
      // 7. OPENROUTER - Free tier models (with automatic fallback)
      openrouter: {
        name: 'OpenRouter - Free Models (Gemini 2.0 Flash + Fallbacks)',
        status: 'online',
        lastError: null,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        lastChecked: Date.now(),
        disabledUntil: null,
        priority: 7,
        enabled: true,
        keyIndex: 0,
        keys: [],
        config: {
          maxRetries: 2,
          timeout: 45000,
          backoffMultiplier: 2
        }
      }
    };

    this.callHistory = []; // Track recent calls for debugging
    this.MAX_HISTORY = 100;
    this.healthCheckInterval = null;
  }

  /**
   * Initialize provider manager with environment variables
   */
  init(config = {}) {
    console.log('[ProviderManager] 🚀 Initializing with ALL available providers...\n');
    
    // Load GROQ keys (up to 5)
    const groqKeys = [
      process.env.GROQ_KEY_1,
      process.env.GROQ_KEY_2,
      process.env.GROQ_KEY_3,
      process.env.GROQ_KEY_4,
      process.env.GROQ_API_KEY
    ].filter(Boolean);
    if (groqKeys.length > 0) {
      this.providers.groq.keys = groqKeys;
      console.log(`✅ Groq: ${groqKeys.length} API keys loaded`);
    }

    // Load GEMINI keys (up to 4)
    const geminiKeys = [
      process.env.GEMINI_KEY_1,
      process.env.GEMINI_KEY_2,
      process.env.GEMINI_KEY_3,
      process.env.GEMINI_API_KEY
    ].filter(Boolean);
    if (geminiKeys.length > 0) {
      this.providers.gemini.keys = geminiKeys;
      console.log(`✅ Gemini: ${geminiKeys.length} API keys loaded`);
    }

    // Load CEREBRAS keys (up to 3)
    const cerebrasKeys = [
      process.env.CEREBRAS_KEY,
      process.env.CEREBRAS_KEY1,
      process.env.CEREBRAS_KEY2
    ].filter(Boolean);
    if (cerebrasKeys.length > 0) {
      this.providers.cerebras.keys = cerebrasKeys;
      console.log(`✅ Cerebras: ${cerebrasKeys.length} API keys loaded`);
    }

    // Load MISTRAL key
    if (process.env.MISTRAL_KEY) {
      this.providers.mistral.keys = [process.env.MISTRAL_KEY];
      console.log(`✅ Mistral: 1 API key loaded`);
    }

    // Load CLOUDFLARE keys
    if (process.env.CF_API_KEY && process.env.CF_ACCOUNT_ID) {
      this.providers.cloudflare.keys = [process.env.CF_API_KEY];
      this.providers.cloudflare.accountId = process.env.CF_ACCOUNT_ID;
      console.log(`✅ Cloudflare Workers AI: API key + Account ID loaded`);
    }

    // Load GITHUB token
    if (process.env.GITHUB_TOKEN) {
      this.providers.github.keys = [process.env.GITHUB_TOKEN];
      console.log(`✅ GitHub Models: Access token loaded`);
    }

    // Load OPENROUTER keys (up to 3)
    const orKeys = [
      process.env.OR_KEY_1,
      process.env.OR_KEY_2,
      process.env.OPENROUTER_API_KEY
    ].filter(Boolean);
    if (orKeys.length > 0) {
      this.providers.openrouter.keys = orKeys;
      console.log(`✅ OpenRouter: ${orKeys.length} API keys loaded`);
    }

    console.log();

    // Filter only enabled providers with keys
    const availableProviders = Object.values(this.providers).filter(p => p.keys.length > 0 && p.enabled);
    console.log(`🎯 Total Providers Ready: ${availableProviders.length}`);
    availableProviders.forEach(p => {
      console.log(`   • ${p.name} (${p.keys.length} key${p.keys.length > 1 ? 's' : ''}, Priority ${p.priority})`);
    });
    console.log();

    if (availableProviders.length === 0) {
      console.warn('[ProviderManager] ⚠️ WARNING: No providers configured!');
      console.warn('Add API keys to .env file for at least ONE provider');
    }

    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Get provider by priority (best available first)
   */
  getActiveProviders(excludeIds = []) {
    return Object.entries(this.providers)
      .filter(([id, p]) => p.enabled && p.keys && p.keys.length > 0 && !excludeIds.includes(id))
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get all available providers for admin panel
   */
  getAvailableProviders() {
    return Object.entries(this.providers).map(([id, p]) => ({
      id,
      name: p.name,
      status: p.status,
      enabled: p.enabled,
      errorCount: p.errorCount,
      successCount: p.successCount,
      avgResponseTime: Math.round(p.avgResponseTime) + 'ms',
      lastError: p.lastError,
      lastChecked: new Date(p.lastChecked).toISOString()
    }));
  }

  /**
   * Call provider with automatic retry and fallback
   * 
   * @param {Object} request - { providerType, messages, maxTokens, userEmail }
   * @returns {Object} - { success: true/false, data: {...}, provider: 'gemini'|'groq'|'openrouter', responseTime: ms }
   */
  async callWithFallback(request) {
    const { messages, maxTokens = 2500, userEmail = 'unknown', timeout = 50000 } = request;
    const startTime = Date.now();
    const attemptedProviders = [];
    let lastError = null;

    const activeProviders = this.getActiveProviders();
    if (!activeProviders.length) {
      throw new Error('No providers available. Check your API keys.');
    }

    console.log(`[ProviderManager] 📤 Attempting generation for ${userEmail}. Available providers: ${activeProviders.length}. Timeout: ${timeout}ms`);

    // Try each provider in priority order
    for (const provider of activeProviders) {
      // Check if we've exceeded total timeout
      if (Date.now() - startTime > timeout) {
        throw new Error(`Generation timeout: Exceeded ${timeout}ms limit across all providers`);
      }

      const providerId = provider.id;
      const providerName = provider.name;
      
      console.log(`[ProviderManager] 🔄 Trying ${providerName}...`);
      attemptedProviders.push(providerId);

      try {
        // Check if provider is temporarily disabled due to errors
        if (provider.disabledUntil && Date.now() < provider.disabledUntil) {
          const waitTime = Math.round((provider.disabledUntil - Date.now()) / 1000);
          console.log(`[ProviderManager] ⏸️ ${providerName} disabled for ${waitTime}s (error recovery). Skipping...`);
          continue;
        }

        // Calculate remaining time for this provider
        const remainingTime = timeout - (Date.now() - startTime);
        
        // Call provider with retries, passing remaining timeout
        const result = await this._callProviderWithRetry(providerId, messages, maxTokens, provider.config, remainingTime);
        
        const responseTime = Date.now() - startTime;
        
        // Update success metrics
        provider.successCount++;
        provider.errorCount = Math.max(0, provider.errorCount - 1); // Decay errors on success
        provider.avgResponseTime = (provider.avgResponseTime + responseTime) / 2;
        provider.status = 'online';
        provider.lastError = null;
        provider.lastChecked = Date.now();

        this._logCall({
          provider: providerId,
          status: 'success',
          responseTime,
          userEmail,
          attemptedProviders
        });

        console.log(`[ProviderManager] ✅ ${providerName} succeeded in ${responseTime}ms`);

        return {
          success: true,
          data: result,
          provider: providerId,
          providerName,
          responseTime,
          fallbackUsed: attemptedProviders.length > 1
        };

      } catch (err) {
        lastError = err;
        const errorMsg = err.message || String(err);
        
        console.warn(`[ProviderManager] ❌ ${providerName} failed: ${errorMsg.substring(0, 100)}`);
        
        // Update error metrics
        provider.errorCount++;
        provider.lastError = errorMsg;
        provider.lastChecked = Date.now();

        // Determine if we should disable this provider temporarily
        if (provider.errorCount >= 3) {
          // Exponential backoff: 1s, 2s, 4s, 8s...
          const backoffMs = Math.pow(2, provider.errorCount - 3) * 1000;
          provider.disabledUntil = Date.now() + backoffMs;
          provider.status = 'offline';
          console.warn(`[ProviderManager] 🚫 ${providerName} disabled for ${Math.round(backoffMs/1000)}s due to repeated errors`);
        } else if (provider.errorCount >= 1) {
          provider.status = 'degraded';
        }

        this._logCall({
          provider: providerId,
          status: 'error',
          error: errorMsg,
          userEmail,
          attemptedProviders
        });

        // Continue to next provider
      }
    }

    // All providers failed
    this._logCall({
      provider: 'all',
      status: 'all_failed',
      error: lastError?.message,
      userEmail,
      attemptedProviders
    });

    const responseTime = Date.now() - startTime;
    console.error(`[ProviderManager] 💥 All ${attemptedProviders.length} providers failed after ${responseTime}ms`);

    throw new Error(`All providers exhausted after ${responseTime}ms. Last error: ${lastError?.message || 'Unknown'}`);
  }

  /**
   * Internal: Call single provider with retry logic
   */
  async _callProviderWithRetry(providerId, messages, maxTokens, config, maxTotalTime) {
    const { maxRetries = 3, timeout = 45000, backoffMultiplier = 2 } = config;
    
    // Use the tighter of the two timeouts: config default or remaining total time
    const actualTimeout = maxTotalTime ? Math.min(timeout, maxTotalTime) : timeout;

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Calculate backoff delay
        if (attempt > 0) {
          const delayMs = Math.pow(backoffMultiplier, attempt - 1) * 1000;
          console.log(`[ProviderManager] ⏳ Retry ${attempt}/${maxRetries} in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        // Call the actual provider with effective timeout
        const result = await this._callProvider(providerId, messages, maxTokens, actualTimeout);
        return result;
      } catch (err) {
        lastError = err;
        const isRetryable = this._isRetryableError(err);
        
        if (!isRetryable) {
          throw err; // Don't retry non-retryable errors
        }
        
        if (attempt === maxRetries) {
          throw err; // Last attempt failed
        }
        
        console.warn(`[ProviderManager] ⚠️ Attempt ${attempt + 1}/${maxRetries + 1} failed: ${err.message}`);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error is worth retrying
   */
  _isRetryableError(err) {
    const msg = err.message || '';
    // Retry on timeouts and 5xx errors, not on auth/invalid errors
    return msg.includes('timeout') || 
           msg.includes('503') || 
           msg.includes('502') || 
           msg.includes('429') || // Rate limit
           msg.includes('ECONNRESET') ||
           msg.includes('ETIMEDOUT');
  }

  /**
   * Get next API key for a provider (round-robin load balancing)
   */
  _getNextKey(providerId) {
    const provider = this.providers[providerId];
    if (!provider || provider.keys.length === 0) return null;
    
    const key = provider.keys[provider.keyIndex || 0];
    provider.keyIndex = (provider.keyIndex || 0) + 1;
    if (provider.keyIndex >= provider.keys.length) {
      provider.keyIndex = 0;
    }
    return key;
  }

  /**
   * Call actual provider API (Gemini, Groq, Cerebras, Mistral, etc.)
   */
  async _callProvider(providerId, messages, maxTokens, timeout) {
    if (providerId === 'gemini') {
      return await this._callGemini(messages, maxTokens, timeout);
    } else if (providerId === 'groq') {
      return await this._callGroq(messages, maxTokens, timeout);
    } else if (providerId === 'cerebras') {
      return await this._callCerebraas(messages, maxTokens, timeout);
    } else if (providerId === 'mistral') {
      return await this._callMistral(messages, maxTokens, timeout);
    } else if (providerId === 'cloudflare') {
      return await this._callCloudflare(messages, maxTokens, timeout);
    } else if (providerId === 'github') {
      return await this._callGithub(messages, maxTokens, timeout);
    } else if (providerId === 'openrouter') {
      return await this._callOpenRouter(messages, maxTokens, timeout);
    }

    throw new Error(`Unknown provider: ${providerId}`);
  }

  /**
   * Call Google Gemini API (with multiple keys)
   */
  async _callGemini(messages, maxTokens, timeout) {
    const key = this._getNextKey('gemini');
    if (!key) throw new Error('No Gemini API keys available');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const body = {
      contents: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json'
      }
    };

    try {
      const response = await axios.post(url, body, { timeout });
      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('Empty Gemini response');
      return content;
    } catch (err) {
      if (err.response?.status === 503) {
        throw new Error('HTTP 503: Gemini overloaded - trying next provider');
      }
      throw new Error(`Gemini error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call Groq API (with multiple keys for load balancing)
   */
  async _callGroq(messages, maxTokens, timeout) {
    const key = this._getNextKey('groq');
    if (!key) throw new Error('No Groq API keys available');

    const url = 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'llama-3.1-8b-instant',
        max_tokens: Math.min(maxTokens, 1500),
        temperature: 0.25,
        messages,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout
      });
      
      return response.data.choices?.[0]?.message?.content;
    } catch (err) {
      if (err.response?.status === 429) {
        throw new Error('HTTP 429: Groq rate limited - trying next provider');
      }
      throw new Error(`Groq error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call Cerebras API (multiple keys, ultra-fast)
   */
  async _callCerebraas(messages, maxTokens, timeout) {
    const key = this._getNextKey('cerebras');
    if (!key) throw new Error('No Cerebras API keys available');

    const url = 'https://api.cerebras.ai/v1/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'llama-3.1-8b',
        max_tokens: maxTokens,
        temperature: 0.25,
        messages,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout
      });
      
      return response.data.choices?.[0]?.message?.content;
    } catch (err) {
      throw new Error(`Cerebras error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call Mistral AI API
   */
  async _callMistral(messages, maxTokens, timeout) {
    const key = this._getNextKey('mistral');
    if (!key) throw new Error('No Mistral API keys available');

    const url = 'https://api.mistral.ai/v1/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'mistral-small-latest',
        max_tokens: maxTokens,
        temperature: 0.25,
        messages,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout
      });
      
      return response.data.choices?.[0]?.message?.content;
    } catch (err) {
      throw new Error(`Mistral error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call Cloudflare Workers AI API
   */
  async _callCloudflare(messages, maxTokens, timeout) {
    const key = this._getNextKey('cloudflare');
    const accountId = this.providers.cloudflare.accountId;
    if (!key || !accountId) throw new Error('Cloudflare API key or Account ID missing');

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;

    try {
      const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
      const userMessage = messages.find(m => m.role === 'user')?.content || '';

      const response = await axios.post(url, {
        prompt: `${systemInstruction}\n\n${userMessage}`,
        max_tokens: maxTokens,
        temperature: 0.25
      }, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout
      });
      
      const result = response.data.result?.response;
      if (!result) throw new Error('Empty Cloudflare response');
      
      // Try to parse as JSON, if fails return as-is
      try {
        return JSON.stringify(JSON.parse(result));
      } catch {
        return JSON.stringify({ result });
      }
    } catch (err) {
      throw new Error(`Cloudflare error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call GitHub Models API
   */
  async _callGithub(messages, maxTokens, timeout) {
    const token = this._getNextKey('github');
    if (!token) throw new Error('No GitHub token available');

    const url = 'https://models.inference.ai.azure.com/chat/completions';

    try {
      const response = await axios.post(url, {
        model: 'Meta-Llama-3.1-8B-Instruct',
        max_tokens: maxTokens,
        temperature: 0.25,
        messages,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout
      });
      
      return response.data.choices?.[0]?.message?.content;
    } catch (err) {
      throw new Error(`GitHub Models error (${err.response?.status || err.code}): ${err.message}`);
    }
  }

  /**
   * Call OpenRouter API (fallback, paid)
   */
  async _callOpenRouter(messages, maxTokens, timeout) {
    const key = this._getNextKey('openrouter');
    if (!key) throw new Error('No OpenRouter API keys available');

    // Use models from centralized config - ensures consistency across codebase
    const models = OPENROUTER_CONFIG.freeModels;
    const perModelTimeout = Math.min(OPENROUTER_CONFIG.timeoutPerModel, timeout);
    const startTime = Date.now();
    let lastError = null;

    for (const model of models) {
      // Check if total time limit exceeded
      if (Date.now() - startTime > Math.min(timeout, OPENROUTER_CONFIG.maxTotalTime)) {
        throw new Error(`OpenRouter: Max total time (${Math.min(timeout, OPENROUTER_CONFIG.maxTotalTime)}ms) exceeded - all free models exhausted`);
      }

      try {
        console.log(`[OpenRouter] Trying model: ${model}`);
        
        const controller = new AbortController();
        const timeoutHandle = setTimeout(() => controller.abort(), perModelTimeout);
        
        const response = await axios.post(
          `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
          {
            model: model,
            messages: messages,
            max_tokens: Math.min(maxTokens, OPENROUTER_CONFIG.maxTokens),
            temperature: OPENROUTER_CONFIG.temperature,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              ...OPENROUTER_CONFIG.headers,
              'Authorization': `Bearer ${key}`
            },
            timeout: perModelTimeout,
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutHandle);
        
        console.log(`[OpenRouter] ✅ Success with model: ${model}`);
        return response.data.choices?.[0]?.message?.content;

      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const errorMsg = err.message;
        
        console.log(`[OpenRouter] Failed: ${model}, Status: ${status || 'timeout/network'}, Error: ${errorMsg}`);

        // Handle different error types
        if (status === 404) {
          // Model not found - skip to next model immediately
          console.warn(`[OpenRouter] 404 - ${model} not available (model doesn't exist or not in free tier), trying next...`);
          continue;
        } else if (status === 429) {
          // Rate limited on this model - try next one
          console.warn(`[OpenRouter] 429 - Rate limited on ${model}, waiting 2s then trying next...`);
          await new Promise(r => setTimeout(r, 2000));
          continue;
        } else if (status === 503) {
          // Service temporarily unavailable - try next model
          console.warn(`[OpenRouter] 503 - Service busy on ${model}, trying next...`);
          continue;
        } else if (err.name === 'AbortError' || errorMsg.includes('timeout')) {
          // Timeout on this model - try next
          console.warn(`[OpenRouter] Timeout after ${perModelTimeout}ms on ${model}, trying next...`);
          continue;
        } else {
          // Other errors - also try next model
          console.warn(`[OpenRouter] Unknown error on ${model}: ${errorMsg}, trying next...`);
          continue;
        }
      }
    }

    // All free models exhausted
    throw new Error(`OpenRouter: All free models exhausted. Tried: ${models.join(', ')}. Last error: ${lastError?.message || 'Unknown'}`);
  }

  /**
   * Log call for debugging/analytics
   */
  _logCall(logEntry) {
    this.callHistory.unshift({
      ...logEntry,
      timestamp: new Date().toISOString()
    });

    if (this.callHistory.length > this.MAX_HISTORY) {
      this.callHistory = this.callHistory.slice(0, this.MAX_HISTORY);
    }
  }

  /**
   * Get recent call history
   */
  getCallHistory(limit = 20) {
    return this.callHistory.slice(0, limit);
  }

  /**
   * Health check - test each provider
   */
  async healthCheck() {
    console.log('[ProviderManager] 🏥 Running health check...');
    
    const testMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond with JSON: { "status": "ok", "provider": "name" }'
      },
      {
        role: 'user',
        content: 'Say ok'
      }
    ];

    for (const [id, provider] of Object.entries(this.providers)) {
      if (!provider.apiKey) continue;

      try {
        const startTime = Date.now();
        await this._callProvider(id, testMessages, 50, 5000);
        const responseTime = Date.now() - startTime;
        
        provider.status = 'online';
        provider.lastChecked = Date.now();
        provider.lastError = null;
        console.log(`[ProviderManager] ✅ ${provider.name} - ${responseTime}ms`);
      } catch (err) {
        provider.status = 'offline';
        provider.lastError = err.message;
        provider.lastChecked = Date.now();
        console.warn(`[ProviderManager] ❌ ${provider.name} - ${err.message}`);
      }
    }
  }

  /**
   * Start automatic health checks
   */
  startHealthChecks() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    
    // Initial check after 10 seconds
    setTimeout(() => this.healthCheck(), 10000);
    
    // Then every 5 minutes
    this.healthCheckInterval = setInterval(() => this.healthCheck(), 5 * 60 * 1000);
  }

  /**
   * Admin: Enable/disable provider
   */
  setProviderEnabled(providerId, enabled) {
    if (this.providers[providerId]) {
      this.providers[providerId].enabled = enabled;
      this.providers[providerId].disabledUntil = null;
      this.providers[providerId].errorCount = 0;
      console.log(`[ProviderManager] ${enabled ? '✅ Enabled' : '❌ Disabled'} ${providerId}`);
      return true;
    }
    return false;
  }

  /**
   * Admin: Reset provider error counts
   */
  resetProvider(providerId) {
    if (this.providers[providerId]) {
      const p = this.providers[providerId];
      p.errorCount = 0;
      p.successCount = 0;
      p.status = 'online';
      p.lastError = null;
      p.disabledUntil = null;
      console.log(`[ProviderManager] 🔄 Reset ${providerId}`);
      return true;
    }
    return false;
  }

  /**
   * Admin: Clear all call history
   */
  clearHistory() {
    this.callHistory = [];
    console.log('[ProviderManager] 🗑️ Cleared call history');
  }

  /**
   * Stop health checks
   */
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Export singleton instance
const providerManagerInstance = new ProviderManager();
export default providerManagerInstance;
