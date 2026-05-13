// providerManager.js - Unified provider management system
// Handles: provider registration, key validation, model listing, seamless switching

import { callGroq } from './providers/groq.js';
import { callGemini } from './providers/gemini.js';
import { callCerebras } from './providers/cerebras.js';
import { callOpenRouter } from './providers/openrouter.js';
import { callCloudflare } from './providers/cloudflare.js';
import { callOpenAI } from './providers/openai.js';
import { callClaude } from './providers/claude.js';
import { callMistral } from './providers/mistral.js';
import { callDeepSeek } from './providers/deepseek.js';
import { callXAI } from './providers/xai.js';
import { callCohere } from './providers/cohere.js';
import { callPerplexity } from './providers/perplexity.js';
import { callMoonshot } from './providers/moonshot.js';
import { callOllama } from './providers/ollama.js';
import { callLMStudio } from './providers/lmstudio.js';
import { callNVIDIA } from './providers/nvidia.js';
import { PromptBuilder } from './promptBuilder.js';

const PROVIDER_DEFS = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'cloud',
    models: ['gpt-5.5', 'gpt-5', 'gpt-4.1', 'gpt-4o', 'o4-mini', 'o3', 'o1', 'gpt-5-codex', 'whisper-1', 'dall-e-3'],
    defaultModel: 'gpt-5',
    priority: 1,
    call: callOpenAI,
    format: 'openai',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'claude',
    name: 'Anthropic',
    type: 'cloud',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-sonnet-3-7', 'claude-3-5-sonnet-20241022'],
    defaultModel: 'claude-sonnet-4-6',
    priority: 2,
    call: callClaude,
    format: 'claude',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'xai',
    name: 'xAI',
    type: 'cloud',
    models: ['grok-4', 'grok-3', 'grok-vision', 'grok-code'],
    defaultModel: 'grok-4',
    priority: 3,
    call: callXAI,
    format: 'openai',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'cloud',
    models: ['gemini-3.1-pro', 'gemini-3-flash', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemma-3', 'imagen-3', 'veo-2'],
    defaultModel: 'gemini-3.1-pro',
    priority: 4,
    call: callGemini,
    format: 'gemini',
    dailyFreeLimit: 1500,
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'cloud',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'qwen-2.5-32b'],
    defaultModel: 'llama-3.3-70b-versatile',
    priority: 5,
    call: callGroq,
    format: 'openai',
    dailyFreeLimit: 14400,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'cloud',
    models: ['mistral-large', 'mistral-medium', 'mistral-small', 'codestral', 'pixtral', 'mixtral', 'ministral'],
    defaultModel: 'mistral-large',
    priority: 6,
    call: callMistral,
    format: 'openai',
    dailyFreeLimit: 2000,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'cloud',
    models: ['deepseek-v4', 'deepseek-v4-flash', 'deepseek-r1', 'deepseek-v3', 'deepseek-coder-v2'],
    defaultModel: 'deepseek-v4',
    priority: 7,
    call: callDeepSeek,
    format: 'openai',
    dailyFreeLimit: 5000,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    type: 'cloud',
    models: ['command-r-plus', 'command-r', 'aya', 'embed-english-v3', 'rerank-v3'],
    defaultModel: 'command-r-plus',
    priority: 8,
    call: callCohere,
    format: 'cohere',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    type: 'cloud',
    models: ['sonar-pro', 'sonar', 'r1-1776'],
    defaultModel: 'sonar-pro',
    priority: 9,
    call: callPerplexity,
    format: 'openai',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    type: 'cloud',
    models: ['kimi-k2.5', 'kimi-vision'],
    defaultModel: 'kimi-k2.5',
    priority: 10,
    call: callMoonshot,
    format: 'openai',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    type: 'cloud',
    models: ['llama3.1-70b', 'llama3.1-8b'],
    defaultModel: 'llama3.1-70b',
    priority: 11,
    call: callCerebras,
    format: 'openai',
    dailyFreeLimit: 5000,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'cloud',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-r1:free', 'mistralai/mistral-7b-instruct:free'],
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    priority: 12,
    call: callOpenRouter,
    format: 'openai',
    dailyFreeLimit: 200,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    type: 'cloud',
    models: ['@cf/meta/llama-3.3-70b-instruct-fp8-fast', '@cf/meta/llama-3.1-8b-instruct'],
    defaultModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    priority: 13,
    call: callCloudflare,
    format: 'cloudflare',
    dailyFreeLimit: 10000,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    type: 'cloud',
    models: ['nvidia/llama-3.3-nemotron-super-49b-v1', 'nvidia/nemotron-3-super-120b-a12b', 'deepseek/deepseek-v4-pro', 'deepseek/deepseek-v4-flash', 'google/gemma-4-31b-it', 'mistralai/mistral-large-3-675b-instruct-2512', 'qwen/qwen3.5-122b-a10b', 'z-ai/glm-5.1'],
    defaultModel: 'nvidia/llama-3.3-nemotron-super-49b-v1',
    priority: 14,
    call: callNVIDIA,
    format: 'openai',
    dailyFreeLimit: Infinity,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    models: [], // dynamically fetched from running Ollama instance
    defaultModel: '',
    priority: 15,
    call: callOllama,
    format: 'openai',
    dailyFreeLimit: Infinity,
    dynamicModels: true,
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    type: 'local',
    models: [], // dynamically fetched from running LM Studio instance
    defaultModel: '',
    priority: 16,
    call: callLMStudio,
    format: 'openai',
    dailyFreeLimit: Infinity,
    dynamicModels: true,
  },
];

export class ProviderManager {
  constructor() {
    this.providers = PROVIDER_DEFS;
    this.usageTracker = new Map();
    this.failureTracker = new Map();
    this.maxConsecutiveFailures = 3;
  }

  getConfiguredProviders(userKeys) {
    if (!userKeys) return [];
    return this.providers.filter(p => {
      if (p.type === 'local') return true;
      const key = userKeys[p.id];
      if (p.id === 'cloudflare') return key?.apiKey && key?.accountId;
      return !!key;
    });
  }

  async getOrderedProviders(userKeys, preferredProvider) {
    const configured = this.getConfiguredProviders(userKeys);

    configured.sort((a, b) => {
      if (a.id === preferredProvider) return -1;
      if (b.id === preferredProvider) return 1;
      return a.priority - b.priority;
    });

    const checked = [];
    for (const p of configured) {
      if (p.type === 'local') {
        const available = await this.checkLocalProvider(p.id);
        if (!available) continue;
      }
      checked.push(p);
    }

    return checked;
  }

  async checkLocalProvider(id, baseUrl) {
    try {
      if (id === 'ollama') {
        const url = baseUrl || 'http://localhost:11434';
        const res = await fetch(`${url}/api/tags`);
        return res.ok;
      }
      if (id === 'lmstudio') {
        const url = baseUrl || 'http://localhost:1234';
        const res = await fetch(`${url}/v1/models`);
        return res.ok;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getLocalModels(id, baseUrl) {
    try {
      if (id === 'ollama') {
        const url = baseUrl || 'http://localhost:11434';
        const res = await fetch(`${url}/api/tags`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.models || []).map(m => m.name);
      }
      if (id === 'lmstudio') {
        const url = baseUrl || 'http://localhost:1234';
        const res = await fetch(`${url}/v1/models`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map(m => m.id);
      }
      return [];
    } catch {
      return [];
    }
  }

  async listModels(userKeys) {
    const models = [];
    for (const p of this.providers) {
      if (p.dynamicModels) {
        const baseUrl = userKeys?.[p.id]?.baseUrl || (p.id === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234');
        const available = await this.getLocalModels(p.id, baseUrl);
        models.push({ id: p.id, name: p.name, type: p.type, models: available.length > 0 ? available : ['(no models found - is the server running?)'], defaultModel: available[0] || '' });
      } else {
        models.push({ id: p.id, name: p.name, type: p.type, models: p.models, defaultModel: p.defaultModel });
      }
    }
    return models;
  }

  async generate(providerId, userKeys, systemPrompt, userMessage, model, onChunk) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) throw new Error(`Provider not found: ${providerId}`);

    const key = userKeys?.[providerId];
    const { messages, params } = PromptBuilder.buildRequest(providerId, systemPrompt, userMessage, model || provider.defaultModel);

    const extra = {};
    if (providerId === 'cloudflare') {
      extra.accountId = userKeys?.cloudflare?.accountId;
    }
    if (providerId === 'lmstudio') {
      extra.baseUrl = userKeys?.lmstudio?.baseUrl || 'http://localhost:1234';
    }
    if (providerId === 'ollama') {
      extra.baseUrl = userKeys?.ollama?.baseUrl || 'http://localhost:11434';
    }

    try {
      const result = await provider.call(key, messages, params, extra, onChunk);
      this.recordSuccess(providerId);
      return result;
    } catch (err) {
      this.recordFailure(providerId);
      throw err;
    }
  }

  async generateWithFallback(userKeys, systemPrompt, userMessage, preferredProvider, getModel, onChunk) {
    if (typeof getModel === 'function') {
      // getModel is optional - shift args if not provided
    } else {
      onChunk = getModel;
      getModel = () => null;
    }
    const providers = await this.getOrderedProviders(userKeys, preferredProvider);

    if (providers.length === 0) {
      throw new Error('No AI providers configured. Add at least one API key in Settings or start a local model.');
    }

    let lastError = null;

    for (const provider of providers) {
      const failures = this.failureTracker.get(provider.id) || 0;
      if (failures >= this.maxConsecutiveFailures) {
        this.failureTracker.set(provider.id, 0);
      }

      try {
        const model = getModel(provider.id) || provider.defaultModel;
        const result = await this.generate(provider.id, userKeys, systemPrompt, userMessage, model, onChunk);
        return { provider: provider.id, providerName: provider.name, ...result };
      } catch (err) {
        lastError = err;
        console.warn(`[Provider] ${provider.id} failed: ${err.message}. Trying next...`);
        if (onChunk) onChunk({ type: 'provider_fallback', from: provider.id, error: err.message });
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }

  async testProvider(providerId, apiKey, extra = {}) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) throw new Error(`Unknown provider: ${providerId}`);

    const start = Date.now();
    try {
      const testMessage = 'Respond with exactly: OK';
      const { messages, params } = PromptBuilder.buildRequest(providerId, 'Reply with exactly the word: OK', testMessage, provider.defaultModel);
      await provider.call(apiKey, messages, params, extra);
      return { valid: true, model: provider.defaultModel, latency: Date.now() - start };
    } catch (err) {
      return { valid: false, model: provider.id, latency: Date.now() - start, error: err.message };
    }
  }

  recordSuccess(providerId) {
    this.failureTracker.set(providerId, 0);
    const today = new Date().toDateString();
    const usage = this.usageTracker.get(providerId) || { today: 0, date: today };
    if (usage.date !== today) {
      usage.today = 0;
      usage.date = today;
    }
    usage.today++;
    this.usageTracker.set(providerId, usage);
  }

  recordFailure(providerId) {
    const failures = (this.failureTracker.get(providerId) || 0) + 1;
    this.failureTracker.set(providerId, failures);
  }

  getProviderStatus() {
    return this.providers.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      models: p.models,
      usage: this.usageTracker.get(p.id)?.today || 0,
      failures: this.failureTracker.get(p.id) || 0,
    }));
  }

  listModels() {
    return this.providers.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      models: p.models,
      defaultModel: p.defaultModel,
    }));
  }
}
