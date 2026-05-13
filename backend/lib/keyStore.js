// keyStore.js - Manages per-user API keys from database
// Keys are stored in user_settings table in the user's own Supabase
// Never logged, never returned to frontend (only provider names are)

export class KeyStore {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getKeys(userId) {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('groq_key, gemini_key, cerebras_key, openrouter_key, cf_api_key, cf_account_id, openai_key, claude_key, mistral_key, deepseek_key, nvidia_key, xai_key, cohere_key, perplexity_key, moonshot_key, ollama_url, lmstudio_url, primary_provider')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      // Fall back to runtime config when database table doesn't exist
      try {
        const fs = await import('fs');
        const path = await import('path');
        const runtimePath = path.join(process.cwd(), 'config', 'runtime.json');
        if (fs.existsSync(runtimePath)) {
          const cfg = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
          const providers = cfg.providers || {};
          const keys = {};
          for (const [provider, key] of Object.entries(providers)) {
            if (key) keys[provider] = key;
          }
          keys.primaryProvider = Object.keys(keys)[0] || 'groq';
          return keys;
        }
      } catch {}
      return null;
    }

    return {
      groq: data.groq_key || null,
      gemini: data.gemini_key || null,
      cerebras: data.cerebras_key || null,
      openrouter: data.openrouter_key || null,
      cloudflare: data.cf_api_key ? { apiKey: data.cf_api_key, accountId: data.cf_account_id } : null,
      openai: data.openai_key || null,
      claude: data.claude_key || null,
      mistral: data.mistral_key || null,
      deepseek: data.deepseek_key || null,
      nvidia: data.nvidia_key || null,
      xai: data.xai_key || null,
      cohere: data.cohere_key || null,
      perplexity: data.perplexity_key || null,
      moonshot: data.moonshot_key || null,
      ollama: data.ollama_url ? { baseUrl: data.ollama_url } : null,
      lmstudio: data.lmstudio_url ? { baseUrl: data.lmstudio_url } : null,
      primaryProvider: data.primary_provider || 'openai',
    };
  }

  async saveKeys(userId, keys) {
    const payload = {};
    if (keys.groq !== undefined) payload.groq_key = keys.groq;
    if (keys.gemini !== undefined) payload.gemini_key = keys.gemini;
    if (keys.cerebras !== undefined) payload.cerebras_key = keys.cerebras;
    if (keys.openrouter !== undefined) payload.openrouter_key = keys.openrouter;
    if (keys.cfApiKey !== undefined) payload.cf_api_key = keys.cfApiKey;
    if (keys.cfAccountId !== undefined) payload.cf_account_id = keys.cfAccountId;
    if (keys.openai !== undefined) payload.openai_key = keys.openai;
    if (keys.claude !== undefined) payload.claude_key = keys.claude;
    if (keys.mistral !== undefined) payload.mistral_key = keys.mistral;
    if (keys.deepseek !== undefined) payload.deepseek_key = keys.deepseek;
    if (keys.nvidia !== undefined) payload.nvidia_key = keys.nvidia;
    if (keys.xai !== undefined) payload.xai_key = keys.xai;
    if (keys.cohere !== undefined) payload.cohere_key = keys.cohere;
    if (keys.perplexity !== undefined) payload.perplexity_key = keys.perplexity;
    if (keys.moonshot !== undefined) payload.moonshot_key = keys.moonshot;
    if (keys.ollamaUrl !== undefined) payload.ollama_url = keys.ollamaUrl;
    if (keys.lmstudioUrl !== undefined) payload.lmstudio_url = keys.lmstudioUrl;
    if (keys.primaryProvider !== undefined) payload.primary_provider = keys.primaryProvider;

    const { error } = await this.supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...payload, updated_at: new Date().toISOString() });

    return !error;
  }

  getConfiguredProviders(keys) {
    if (!keys) return [];
    const configured = [];
    for (const [provider, key] of Object.entries(keys)) {
      if (provider === 'primaryProvider') continue;
      if (provider === 'cloudflare' && key?.apiKey) configured.push(provider);
      else if (key) configured.push(provider);
    }
    return configured;
  }
}
