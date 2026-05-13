import { callGroq } from './providers/groq.js';
import { callCerebras } from './providers/cerebras.js';
import { callGemini } from './providers/gemini.js';
import { callOpenRouter } from './providers/openrouter.js';
import { callCloudflare } from './providers/cloudflare.js';

export const providers = ['groq', 'cerebras', 'gemini', 'openrouter', 'cloudflare'];

const providerMap = {
  groq: { fn: callGroq, keyField: 'groqKey' },
  cerebras: { fn: callCerebras, keyField: 'cerebrasKey' },
  gemini: { fn: callGemini, keyField: 'geminiKey' },
  openrouter: { fn: callOpenRouter, keyField: 'openrouterKey' },
  cloudflare: { fn: callCloudflare, keyField: 'cfKey', extraField: 'cfAccountId' },
};

const TEST_PROMPT = 'Respond with exactly: ok';

export async function testProvider(providerName, apiKey, extra = {}) {
  const cfg = providerMap[providerName];
  if (!cfg) throw new Error(`Unknown provider: ${providerName}`);

  const start = performance.now();
  let result;
  try {
    if (providerName === 'cloudflare') {
      result = await cfg.fn(apiKey, 'You are a test assistant.', TEST_PROMPT, extra.accountId);
    } else {
      result = await cfg.fn(apiKey, 'You are a test assistant.', TEST_PROMPT);
    }
  } catch (err) {
    return { valid: false, model: providerName, latency: Math.round(performance.now() - start), error: err.message };
  }

  return { valid: true, model: providerName, latency: Math.round(performance.now() - start) };
}

export async function callWithRotation(settings, systemPrompt, userMessage) {
  const errors = [];

  for (const name of providers) {
    const cfg = providerMap[name];
    const apiKey = settings[name]?.apiKey || settings[cfg.keyField];
    if (!apiKey) {
      errors.push({ provider: name, error: 'No API key configured' });
      continue;
    }

    try {
      const start = performance.now();
      let content;
      if (name === 'cloudflare') {
        const accountId = settings[name]?.accountId || settings[cfg.extraField];
        if (!accountId) {
          errors.push({ provider: name, error: 'No Cloudflare Account ID configured' });
          continue;
        }
        content = await cfg.fn(apiKey, systemPrompt, userMessage, accountId);
      } else {
        content = await cfg.fn(apiKey, systemPrompt, userMessage);
      }

      return {
        content,
        provider: name,
        latency: Math.round(performance.now() - start),
      };
    } catch (err) {
      errors.push({ provider: name, error: err.message });
    }
  }

  throw new Error(`All providers failed. Details: ${JSON.stringify(errors)}`);
}

export function getActiveProviderName(settings) {
  for (const name of providers) {
    const cfg = providerMap[name];
    const apiKey = settings[name]?.apiKey || settings[cfg.keyField];
    if (apiKey) {
      if (name === 'cloudflare') {
        const accountId = settings[name]?.accountId || settings[cfg.extraField];
        if (accountId) return name;
      } else {
        return name;
      }
    }
  }
  return null;
}
