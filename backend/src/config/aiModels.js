/**
 * AI Models Configuration
 * Single source of truth for all AI model definitions
 * This prevents hardcoded model strings from breaking in the future
 */

export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  
  // Free models only - ensures no 404 errors on paid-tier models
  freeModels: [
    'google/gemini-2.0-flash-exp:free',      // Primary - Fastest, most capable free Gemini
    'meta-llama/llama-3.3-70b-instruct:free', // Fallback 1 - Excellent reasoning capability
    'deepseek/deepseek-r1:free',               // Fallback 2 - Strong technical comprehension
    'mistralai/mistral-7b-instruct:free'       // Fallback 3 - Always reliable backup
  ],
  
  // Timeout settings (in milliseconds)
  timeoutPerModel: 12000,    // 12 seconds per model attempt
  maxTotalTime: 50000,       // 50 seconds max for all fallback attempts
  
  // Standard headers for all OpenRouter requests
  headers: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
    'X-Title': 'PromptQuill',
    'Content-Type': 'application/json'
  },
  
  // Request parameters
  maxTokens: 4096,           // Maximum tokens per response
  temperature: 0.25,         // Lower = more deterministic, better for structured output
  responseFormat: 'json'     // Always request JSON format
};

/**
 * Other AI providers (for reference/fallback)
 * These are maintained by providerManager but not used for OpenRouter
 */
export const OTHER_PROVIDERS = {
  groq: {
    name: 'Groq - Lightning Fast',
    priority: 1
  },
  gemini: {
    name: 'Google Gemini',
    priority: 2
  },
  cerebras: {
    name: 'Cerebras - Fast Inference',
    priority: 3
  },
  mistral: {
    name: 'Mistral',
    priority: 4
  },
  cloudflare: {
    name: 'Cloudflare Workers AI',
    priority: 5
  },
  github: {
    name: 'GitHub Models',
    priority: 6
  }
};

export default { OPENROUTER_CONFIG, OTHER_PROVIDERS };
