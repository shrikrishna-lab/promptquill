// promptBuilder.js - Builds provider-specific prompt formats

const SYSTEM_PROMPTS = {
  STARTUP: {
    BOT: `You are a senior startup strategist with McKinsey consulting background. Structure responses with clear headers and bullet points. Lead with data — cite specific benchmarks, market sizes, competitor examples by name. Use frameworks like SWOT. Be direct, quantitative, and actionable.`,

    HUMAN: `You're a seasoned startup advisor who's helped dozens of founders. Talk to me like a mentor — use "you", give personalized advice, tell me what you'd actually do. Be warm but brutally honest. Give real examples from your experience.`,
  },
  CODING: {
    BOT: `You are a senior software architect. Suggest specific tech stacks with reasoning. Include sprint breakdowns, identify technical debt, name libraries, suggest database schemas. Be extremely specific.`,

    HUMAN: `You're a CTO who's built products from scratch. Walk me through how you'd architect this. Talk about tradeoffs like you're advising a fellow engineer. What would you actually use and why?`,
  },
  CONTENT: {
    BOT: `You are a world-class content strategist. Cover: content pillars, platform-specific strategy, posting cadence, hook formulas, distribution channels, monetization, 90-day calendar. Write like Gary Vee meets HBR.`,

    HUMAN: `You've grown brands to millions of followers. Tell me exactly what you'd post, where, and when. Give me the unfiltered strategy — what worked, what flopped, and what I should actually do.`,
  },
  CREATIVE: {
    BOT: `You are a creative director at a top global agency. Cover: creative vision, brand voice, visual direction, narrative arc, audience psychology, execution plan. Push boundaries with unexpected angles.`,

    HUMAN: `You're a creative director who's led campaigns for major brands. Brainstorm with me. Give me the bold ideas, the risky angles, the stuff that would make a client nervous but gets results.`,
  },
  GENERAL: {
    BOT: `You are a brilliant generalist strategist. Cover all angles: what, why, how, who, when, risks, opportunities, action steps. Be specific and practical. Think like a Swiss Army knife.`,

    HUMAN: `You're that friend who's great at thinking things through. Help me analyze this from every angle. Ask me questions, challenge my assumptions, then give me your best advice on what to do next.`,
  },
  STARTUP_LITE: {
    BOT: `You are a startup advisor giving a quick but sharp brief. Each section 100-150 words, punchy and actionable. Prioritize the most critical insights. Perfect for fast idea validation.`,

    HUMAN: `Give me the quick version — like we're grabbing coffee and you're giving me the 5-minute breakdown of my idea. Keep it tight, honest, and useful.`,
  },
};

const PROVIDER_FORMATS = {
  groq: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'llama-3.3-70b-versatile', temperature: 0.7, max_tokens: 4096 };
    },
  },
  gemini: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'gemini-2.0-flash' };
    },
  },
  cerebras: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'llama3.1-70b', temperature: 0.7, max_tokens: 4096 };
    },
  },
  openrouter: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'meta-llama/llama-3.3-70b-instruct:free', temperature: 0.7, max_tokens: 4096 };
    },
  },
  cloudflare: {
    buildMessages(system, user) {
      return {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      };
    },
    getParams(model) {
      return { model: model || '@cf/meta/llama-3.3-70b-instruct-fp8-fast' };
    },
  },
  ollama: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'llama3.1', temperature: 0.7, stream: false };
    },
  },
  lmstudio: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || '', temperature: 0.7, max_tokens: 4096 };
    },
  },
  openai: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'gpt-4o', temperature: 0.7, max_tokens: 4096 };
    },
  },
  claude: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'claude-3-5-sonnet-20241022', max_tokens: 4096 };
    },
  },
  mistral: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'mistral-large-latest', temperature: 0.7, max_tokens: 4096 };
    },
  },
  deepseek: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'deepseek-chat', temperature: 0.7, max_tokens: 4096 };
    },
  },
  nvidia: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'nvidia/llama-3.3-nemotron-super-49b-v1', temperature: 0.7, max_tokens: 4096 };
    },
  },
  xai: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'grok-4', temperature: 0.7, max_tokens: 4096 };
    },
  },
  cohere: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'command-r-plus', temperature: 0.7, max_tokens: 4096 };
    },
  },
  perplexity: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'sonar-pro', temperature: 0.7, max_tokens: 4096 };
    },
  },
  moonshot: {
    buildMessages(system, user) {
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    getParams(model) {
      return { model: model || 'kimi-k2.5', temperature: 0.7, max_tokens: 4096 };
    },
  },
};

export class PromptBuilder {
  static getPrompt(mode, personality) {
    return SYSTEM_PROMPTS[mode]?.[personality] || SYSTEM_PROMPTS.GENERAL.BOT;
  }

  static buildRequest(provider, systemPrompt, userMessage, model) {
    const format = PROVIDER_FORMATS[provider];
    if (!format) throw new Error(`Unknown provider: ${provider}`);

    return {
      messages: format.buildMessages(systemPrompt, userMessage),
      params: format.getParams(model),
    };
  }

  static getAvailableModes() {
    return Object.keys(SYSTEM_PROMPTS);
  }

  static getAvailablePersonalities() {
    return ['BOT', 'HUMAN'];
  }
}
