// ???????????????????????????????????????????????????????????????????????????????
// PROMPTQUILL AI ENGINE v2.0 – Complete Production System
// ???????????????????????????????????????????????????????????????????????????????

import { extractAndRepairJson, validateAndMergeBrief, createFallbackBrief, getMaxTokensForMode } from './jsonRepair.js';
import { cleanText, cleanObject } from '../utils/cleanText.js';
import { addDebugLog } from '../utils/debugLogs.js';
import buildSystemPromptV6, { buildSystemPromptPartial, ADDITIONAL_TAB_COST, calculateInitialTabCost, INITIAL_TABS } from './systemPromptBuilder.js';
import { validatePromptQuillOutput, generateQualityReport } from './qualityGateValidator.js';
import { normalizeMode, getTabsForMode } from './promptModeRegistry.js';
import { checkSafetyGate, createSafetyGateResult, SAFETY_GATE_MESSAGE } from './safetyGate.js';

export const fetchClarifyingQuestions = async (idea, mode, metadata = {}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const normalizedMode = normalizeMode(mode || 'GENERAL');
  const personality = (metadata?.personality || 'bot').toLowerCase();

  try {
    // Frontend safety gate mirror (cheap early-block)
    const safety = checkSafetyGate(String(idea || ''));
    if (safety.blocked) return { blocked: true, message: SAFETY_GATE_MESSAGE, questions: [] };

    const response = await fetch(`${backendUrl}/api/ai/clarify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea,
        mode: normalizedMode,
        personality,
        creativeType: metadata?.creative_type || null,
        outputPreference: metadata?.output_preference || null,
        userEmail: metadata?.userEmail || 'frontend',
      }),
    });

    const result = await response.json().catch(() => null);
    if (!result?.success || !result?.data) return { blocked: false, message: null, questions: [] };

    const extracted = extractAndRepairJson(result.data);
    const questions = Array.isArray(extracted?.questions) ? extracted.questions : [];

    // Basic schema hardening
    const cleaned = questions
      .filter((q) => q && typeof q === 'object' && typeof q.prompt === 'string' && typeof q.type === 'string')
      .map((q, idx) => ({
        id: String(q.id || `q${idx + 1}`),
        type: q.type,
        prompt: q.prompt,
        required: q.required === true,
        placeholder: typeof q.placeholder === 'string' ? q.placeholder : '',
        options: Array.isArray(q.options)
          ? q.options
              .filter((o) => o && typeof o === 'object' && typeof o.label === 'string')
              .map((o, oIdx) => ({ id: String(o.id || `opt${oIdx + 1}`), label: o.label }))
          : [],
      }));

    return { blocked: false, message: null, questions: cleaned };
  } catch (e) {
    console.warn('[fetchClarifyingQuestions] Failed:', e.message);
    return { blocked: false, message: null, questions: [] };
  }
};

export const streamImageAnalysis = async ({
  prompt,
  mode = 'GENERAL',
  metadata = {},
  attachment,
  onChunk,
  onDone,
  onError
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (!attachment?.base64 || !attachment?.type) {
    throw new Error('Missing image attachment payload');
  }

  const response = await fetch(`${backendUrl}/api/ai/analyze-image-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      mode,
      userId: metadata?.userId,
      userEmail: metadata?.userEmail || 'frontend',
      imageBase64: attachment.base64,
      imageMediaType: attachment.type,
      imageName: attachment.name || 'upload'
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`Image analysis failed: HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        try {
          const evt = JSON.parse(line);
          if (evt.type === 'chunk' && typeof evt.text === 'string') {
            fullText += evt.text;
            if (onChunk) onChunk(fullText, evt.text);
          } else if (evt.type === 'error') {
            throw new Error(evt.error || 'Stream error');
          } else if (evt.type === 'done') {
            if (onDone) onDone(evt);
          }
        } catch (e) {
          // Ignore malformed stream line and continue.
        }
      }
      newlineIndex = buffer.indexOf('\n');
    }
  }

  if (onDone) onDone({ type: 'done', fullText });
  return fullText;
};

// ???????????????????????????????????????????????????????????????????????????????
// PROMPT MEMORY — Self-Learning System with Persistence
// ???????????????????????????????????????????????????????????????????????????????

export class PromptMemory {
  static STORAGE_KEY = 'PromptQuill_memory_v2';
  static ANALYTICS_KEY = 'PromptQuill_analytics_v1';
  static MAX_LESSONS = 30;
  static MAX_INJECT = 10;
  static MAX_HISTORY = 50;
  static LESSON_WEIGHT_INCREMENT = 0.2;
  static LESSON_WEIGHT_DECAY = 0.95;

  static load() {
    try {
      const raw = localStorage.getItem(PromptMemory.STORAGE_KEY);
      return raw ? JSON.parse(raw) : PromptMemory.empty();
    } catch (e) {
      console.warn('[PromptMemory] Load error:', e.message);
      return PromptMemory.empty();
    }
  }

  static empty() {
    return {
      lessons: [],
      history: [],
      stats: {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        modeDistribution: {},
        avgScore: 0,
        highestScore: 0,
        lowestScore: 10,
        totalTokensUsed: 0,
      },
      config: {
        lastUpdated: Date.now(),
        version: '2.0',
        autoInject: true,
        enableCache: true,
      }
    };
  }

  static save(memory) {
    try {
      if (!memory || typeof memory !== 'object') return;
      if (!memory.config) memory.config = {};
      memory.config.lastUpdated = Date.now();
      localStorage.setItem(PromptMemory.STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
      console.warn('[PromptMemory] Save failed:', e.message);
    }
  }

  static recordBrief(idea, brief, tokensUsed = 0) {
    const memory = PromptMemory.load();

    // Record history entry
    memory.history.unshift({
      idea: idea.substring(0, 120),
      mode: brief.mode,
      score: brief.score,
      difficulty: brief.difficulty,
      timestamp: Date.now(),
      successful: brief.score > 0,
    });

    if (memory.history.length > PromptMemory.MAX_HISTORY) {
      memory.history = memory.history.slice(0, PromptMemory.MAX_HISTORY);
    }

    // Update statistics
    memory.stats.totalGenerations += 1;
    memory.stats.totalTokensUsed += tokensUsed;

    if (brief.score > 0) {
      memory.stats.successfulGenerations += 1;
      memory.stats.highestScore = Math.max(memory.stats.highestScore, brief.score);
      memory.stats.lowestScore = Math.min(memory.stats.lowestScore, brief.score);
    } else {
      memory.stats.failedGenerations += 1;
    }

    memory.stats.modeDistribution[brief.mode] = (memory.stats.modeDistribution[brief.mode] || 0) + 1;

    // Calculate running average
    const scores = memory.history.map(h => h.score).filter(s => s > 0);
    memory.stats.avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;

    // Extract and store lessons from brief
    if (brief.suggestions && Array.isArray(brief.suggestions)) {
      brief.suggestions.forEach(suggestion => {
        PromptMemory.addLesson({
          text: suggestion,
          mode: brief.mode,
          weight: 2.0,
          source: 'suggestion',
        });
      });
    }

    PromptMemory.save(memory);
    return memory;
  }

  static addLesson(lesson) {
    const memory = PromptMemory.load();

    // Check for duplicates using fuzzy matching
    const isDupe = memory.lessons.some(l => {
      const similarity = PromptMemory.stringSimilarity(
        l.text.toLowerCase().substring(0, 50),
        lesson.text.toLowerCase().substring(0, 50)
      );
      return similarity > 0.8;
    });

    if (isDupe) return;

    // Create new lesson entry with metadata
    const newLesson = {
      ...lesson,
      weight: lesson.weight || 1,
      createdAt: lesson.createdAt || Date.now(),
      usageCount: 0,
      successRate: 0,
      source: lesson.source || 'user',
    };

    memory.lessons.unshift(newLesson);

    // Sort by weight and recency
    memory.lessons = memory.lessons
      .sort((a, b) => {
        const weightDiff = b.weight - a.weight;
        if (Math.abs(weightDiff) > 0.1) return weightDiff;
        return b.createdAt - a.createdAt;
      })
      .slice(0, PromptMemory.MAX_LESSONS);

    PromptMemory.save(memory);
  }

  static recordLessonUsage(lessonIndex, wasSuccessful = true) {
    const memory = PromptMemory.load();
    if (!memory.lessons[lessonIndex]) return;

    const lesson = memory.lessons[lessonIndex];
    lesson.usageCount = (lesson.usageCount || 0) + 1;
    lesson.weight += (wasSuccessful ? PromptMemory.LESSON_WEIGHT_INCREMENT : -0.1);
    lesson.weight = Math.max(0.1, Math.min(10, lesson.weight)); // Clamp 0.1-10

    PromptMemory.save(memory);
  }

  static getInjectable(currentMode) {
    const memory = PromptMemory.load();
    if (!memory.lessons.length || !memory.config.autoInject) return '';

    const sorted = memory.lessons
      .filter(l => !l.mode || l.mode === currentMode || l.mode === 'ALL')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, PromptMemory.MAX_INJECT);

    if (!sorted.length) return '';

    const dominant = Object.entries(memory.stats.modeDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN';

    const learnedContext = `

LEARNED CALIBRATIONS — Apply These to Improve Output
????????????????????????????????????????????????????????????

Extracted from ${memory.stats.totalGenerations} past generations. 
Average score: ${memory.stats.avgScore}/10. Highest: ${memory.stats.highestScore}/10. Lowest: ${memory.stats.lowestScore}/10.
Most common mode: ${dominant}. Success rate: ${((memory.stats.successfulGenerations / memory.stats.totalGenerations) * 100).toFixed(0)}%.

KEY INSIGHTS TO APPLY:

${sorted.map((l, i) => `${i + 1}. [${l.mode}] ${l.text} (Used ${l.usageCount} times)`).join('\n')}

????????????????????????????????????????????????????????????
`;

    return learnedContext;
  }

  static getStats() {
    return PromptMemory.load().stats;
  }

  static getMemorySize() {
    const memory = PromptMemory.load();
    return JSON.stringify(memory).length;
  }

  static clear() {
    localStorage.removeItem(PromptMemory.STORAGE_KEY);
    console.log('[PromptMemory] Storage cleared');
  }

  static export() {
    return PromptMemory.load();
  }

  static import(data) {
    try {
      PromptMemory.save(data);
      console.log('[PromptMemory] Data imported successfully');
      return true;
    } catch (e) {
      console.error('[PromptMemory] Import failed:', e.message);
      return false;
    }
  }

  static stringSimilarity(a, b) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1.0;

    const editDistance = PromptMemory.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  static levenshteinDistance(a, b) {
    const costs = [];
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (a.charAt(i - 1) !== b.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return costs[b.length];
  }
}

// ???????????????????????????????????????????????????????????????????????????????
// MODE DETECTION & ROUTING ENGINE
// ???????????????????????????????????????????????????????????????????????????????

export class ModeDetector {
  static PATTERNS = {
    CODING: {
      keywords: ['build', 'code', 'api', 'app', 'frontend', 'backend', 'deploy', 'dashboard', 'cli', 'library', 'plugin', 'extension', 'saas', 'sdk', 'framework', 'component', 'database', 'microservice', 'service', 'webhook', 'endpoint', 'rest', 'graphql'],
      weight: 1.5,
    },
    STARTUP: {
      keywords: ['startup', 'business', 'market', 'revenue', 'pricing', 'customers', 'b2b', 'b2c', 'subscription', 'company', 'founder', 'pitch', 'investors', 'vc', 'acquisition', 'exit', 'growth', 'scalable', 'profit', 'business model', 'monetize', 'saas pricing', 'affiliate'],
      weight: 1.6,
    },
    CONTENT: {
      keywords: ['blog', 'post', 'tweet', 'article', 'newsletter', 'thread', 'video script', 'content', 'write', 'guide', 'tutorial', 'seo', 'marketing', 'copywriting', 'social media', 'podcast', 'email', 'landing page copy'],
      weight: 1.4,
    },
    DESIGN: {
      keywords: ['ui', 'ux', 'design', 'figma', 'wireframe', 'mock', 'prototype', 'logo', 'brand', 'visual', 'color', 'typography', 'landing page', 'interface', 'component design', 'design system'],
      weight: 1.3,
    },
    GAME: {
      keywords: ['game', 'mechanic', 'level', 'player', 'rpg', 'puzzle', 'mobile game', 'indie', 'unity', 'godot', 'phaser', 'game engine', 'playable', 'gameplay', 'arcade', 'multiplayer'],
      weight: 1.4,
    },
    AI_ML: {
      keywords: ['ai', 'ml', 'model', 'llm', 'fine-tune', 'agent', 'rag', 'vector', 'embedding', 'chatbot', 'inference', 'gpt', 'claude', 'neural', 'deep learning', 'classification', 'prediction', 'ai api'],
      weight: 1.5,
    },
  };

  static detect(input) {
    const lower = input.toLowerCase();
    const scores = {};

    Object.entries(ModeDetector.PATTERNS).forEach(([mode, config]) => {
      const matches = config.keywords.filter(kw => lower.includes(kw)).length;
      scores[mode] = matches * config.weight;
    });

    const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return detected ? detected[0] : 'GENERAL';
  }

  static suggestMode(input) {
    return {
      detected: ModeDetector.detect(input),
      confidence: 0.5 + (Math.random() * 0.3),
      alternatives: ['STARTUP', 'STARTUP_LITE', 'CODING', 'GENERAL'],
    };
  }
}

// ???????????????????????????????????????????????????????????????????????????????
// RESPONSE CACHE & OPTIMIZATION LAYER
// ???????????????????????????????????????????????????????????????????????????????

export class ResponseCache {
  static CACHE_KEY = 'PromptQuill_cache_v1';
  static MAX_CACHE_SIZE = 50;
  static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static getHash(input, mode) {
    let hash = 0;
    const str = `${input}:${mode}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  static load() {
    try {
      const raw = localStorage.getItem(ResponseCache.CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  static save(cache) {
    try {
      const keys = Object.keys(cache);
      if (keys.length > ResponseCache.MAX_CACHE_SIZE) {
        keys.slice(0, keys.length - ResponseCache.MAX_CACHE_SIZE).forEach(k => {
          delete cache[k];
        });
      }
      localStorage.setItem(ResponseCache.CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.warn('[ResponseCache] Save failed:', e.message);
    }
  }

  static get(input, mode) {
    const cache = ResponseCache.load();
    const hash = ResponseCache.getHash(input, mode);
    const cached = cache[hash];

    if (cached && Date.now() - cached.timestamp < ResponseCache.CACHE_TTL) {
      console.log('[Cache] HIT for:', input.substring(0, 40));
      return cached.response;
    }

    if (cached) {
      delete cache[hash];
      ResponseCache.save(cache);
    }

    return null;
  }

  static set(input, mode, response) {
    const cache = ResponseCache.load();
    const hash = ResponseCache.getHash(input, mode);
    cache[hash] = {
      response,
      timestamp: Date.now(),
      mode,
    };
    ResponseCache.save(cache);
  }

  static clear() {
    localStorage.removeItem(ResponseCache.CACHE_KEY);
  }
}

// ???????????????????????????????????????????????????????????????????????????????
// TOKEN MANAGEMENT & COUNTING
// ???????????????????????????????????????????????????????????????????????????????

export class TokenManager {
  static APPROX_CHARS_PER_TOKEN = 3.7;
  static MODE_TOKEN_BUDGETS = {
    STARTUP: 10000,        // Increased: 12 tabs need ~2200+ tokens + system prompt
    STARTUP_LITE: 5000,    // 4 essential tabs
    CODING: 8000,          // Increased for comprehensive tech specs
    CONTENT: 6000,         // Increased for detailed content plans
    DESIGN: 7000,          // Increased for UX flows and components
    GAME: 7000,            // Increased for game mechanics and levels
    AI_ML: 8000,           // Increased for model architectures and RAG
    GENERAL: 6000,         // Increased: minimum 12 tabs = ~2200+ tokens response
  };

  static estimateTokens(text) {
    return Math.ceil(text.length / TokenManager.APPROX_CHARS_PER_TOKEN);
  }

  static getMaxTokensForMode(mode) {
    return TokenManager.MODE_TOKEN_BUDGETS[mode] || 6000;
  }

  static calculateOutputTokens(jsonResponse) {
    if (typeof jsonResponse === 'string') {
      return TokenManager.estimateTokens(jsonResponse);
    }
    return TokenManager.estimateTokens(JSON.stringify(jsonResponse));
  }

  static getSystemPromptTokens() {
    return 2500;
  }

  static getTotalBudget(mode) {
    return 4096;
  }

  static getRemainingBudget(mode, usedTokens) {
    return TokenManager.getTotalBudget(mode) - usedTokens;
  }
}

// ???????????????????????????????????????????????????????????????????????????????
// PROMPTQUILL v4 SYSTEM PROMPT BUILDER
// ???????????????????????????????????????????????????????????????????????????????
// OLD SYSTEM PROMPTS REMOVED — Now using systemPromptBuilder.js (v5)
// ???????????????????????????????????????????????????????????????????????????????

  // Build spectrum level injection block
  // [REMOVED: Old spectrum/style blocks - all replaced by v5 systemPromptBuilder.js]


// [END OF OLD SYSTEM PROMPT BUILDERS - ALL REMOVED]
// v5 now uses: buildSystemPromptV5(mode, personality, isPro, idea) from systemPromptBuilder.js

// ???????????????????????????????????????????????????????????????????????????????
// MAIN GENERATION ENGINE
// ???????????????????????????????????????????????????????????????????????????????

export const generateBrief = async (input, userSelectedMode, metadata = {}, selectedTabs = [1,2,3,4,5,6,7,8,9,10,11,12], retryCount = 0) => {
  const safety = checkSafetyGate(input);
  if (safety.blocked) {
    return createSafetyGateResult({
      mode: normalizeMode(userSelectedMode || 'GENERAL'),
    });
  }

  const modeToUse = normalizeMode(userSelectedMode || ModeDetector.detect(input));
  const maxTokens = TokenManager.getMaxTokensForMode(modeToUse);

  console.log('[generateBrief] 🔍 METADATA RECEIVED:', JSON.stringify(metadata, null, 2));
  console.log('[generateBrief] selectedTabs:', selectedTabs);
  if (retryCount > 0) {
    console.log(`[generateBrief] 🔄 RETRY ATTEMPT ${retryCount}/2 - Character minimums not met in previous attempt`);
  }

  // Cache is opt-in for now while debugging generation quality.
  const shouldUseCache = metadata.useCache === true && retryCount === 0;
  if (shouldUseCache) {
    const cached = ResponseCache.get(input, modeToUse);
    if (cached) {
      PromptMemory.recordBrief(input, cached, 0);
      addDebugLog('Using cached response', { mode: modeToUse });
      return cached;
    }
  }

  const personality = metadata?.personality === 'human' ? 'human' : 'bot'; // Default to bot
  const isPro = metadata?.isPro === true; // Default to free
  
  // NEW V6 SYSTEM PROMPT — Mode × Personality × Tier based
  const creativeSubType = metadata?.creative_type || null;
  const systemPromptStr = buildSystemPromptV6(modeToUse, personality, isPro, input, creativeSubType);
  
  console.log('[generateBrief] ✅ USING V6: mode=' + modeToUse + ', personality=' + personality + ', isPro=' + isPro);
  console.log('[generateBrief] System prompt length:', systemPromptStr.length, 'chars');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  try {
    console.log(`[PromptQuill] 🚀 Generating brief in ${modeToUse} mode with ${personality} personality...`);
    addDebugLog('Sending request', { mode: modeToUse, personality, isPro, inputLength: input.length, retryAttempt: retryCount });

    // ═══════════════════════════════════════════════════════════
    // CRITICAL BUG FIX: buildUserMessage — passes REAL user input
    // ═══════════════════════════════════════════════════════════
    const buildUserMessage = (input, mode, isRetry, personality, creativeSubType) => {
      return [
        `Generate a complete PromptQuill brief.`,
        ``,
        `The user's exact idea is: "${input}"`,
        ``,
        `Generate ALL tabs based ONLY on this specific idea.`,
        `CRITICAL: Use the user's exact idea above.`,
        `Never substitute with placeholder text.`,
        `Never say 'the test concept' or 'the product'.`,
        `If the idea is short — make specific inferences.`,
        `Specific inference > generic placeholder always.`,
        ``,
        `Mode: ${mode}`,
        `Personality: ${personality || 'BOT'}`,
        creativeSubType ? `Creative type: ${creativeSubType}` : '',
        ``,
        `REQUIREMENTS:`,
        `- Every tab: specific to THIS idea only`,
        `- Action Brief: opens with sharp insight,`,
        `  not 'The X concept targets...'`,
        `- Steps: every step has a done condition`,
        `- Final Prompt: structured format mandatory`,
        `- Quality rating: computed honestly`,
        `- Return ONLY valid JSON. First char: {`,
        isRetry
          ? `- Previous was truncated. Be concise but always complete the JSON.` : '',
      ].filter(Boolean).join('\n');
    };

    let userMessage = buildUserMessage(input, modeToUse, retryCount > 0, personality, creativeSubType);


    const requestBody = {
      messages: [
        { role: 'system', content: systemPromptStr },
        {
          role: 'user',
          content: userMessage,
        }
      ],
      maxTokens,
      userEmail: metadata.userEmail || 'frontend',
      mode: modeToUse,
      personality: personality,
      isPro: isPro,
    };

    const response = await fetch(`${backendUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(requestBody),
      timeout: 60000,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success === false) {
      if (result.errorType === 'safety_gate' || result.type === 'safety_gate') {
        return createSafetyGateResult({ mode: modeToUse });
      }

      throw new Error(result.error || 'Generation failed');
    }

    const cleaned = cleanObject(result);
    const raw = cleaned.data || cleaned.content;

    addDebugLog('Response received', {
      provider: cleaned.metadata?.provider,
      length: raw?.length,
      tokensUsed: result.tokensUsed,
    });

    if (!raw || typeof raw !== 'string') {
      throw new Error(`Invalid response format: ${typeof raw}`);
    }

    const brief = validateAndMergeBrief(extractAndRepairJson(raw), modeToUse, modeToUse);
    brief._providerUsed = cleaned.metadata?.provider;
    brief._tokensUsed = result.tokensUsed || 0;
    brief.creditsUsed = cleaned.metadata?.creditsUsed || 0;

    // ═══════════════════════════════════════════════════════════════
    // v5 QUALITY GATE VALIDATION WITH AUTO-RETRY
    // ═══════════════════════════════════════════════════════════════
    const validationResult = validatePromptQuillOutput(brief, selectedTabs, personality);
    
    if (!validationResult.passed && validationResult.gate === 'character_minimums' && retryCount < 2) {
      // Auto-retry if character minimums failed (max 2 retries)
      console.warn('[PromptQuill] ⚠️  Character minimum validation failed. Retrying with stronger prompt...');
      console.warn('[PromptQuill] Failed tabs:', validationResult.details);
      addDebugLog('Character minimum retry', { attempt: retryCount + 1, failedTabs: validationResult.details });
      
      // Recursively retry with incremented retry count
      // The generateBrief function will add retry enforcement to the user message automatically
      return generateBrief(input, modeToUse, metadata, selectedTabs, retryCount + 1);
    }
    
    if (!validationResult.passed) {
      console.warn('[PromptQuill] ⚠️  Quality gate FAILED:', validationResult.reason);
      console.warn('[PromptQuill] Details:', validationResult.details);
      // Log failure but still return output (with flag)
      brief._qualityGateFailed = true;
      brief._qualityFailureReason = validationResult.reason;
      addDebugLog('Quality gate failed', { reason: validationResult.reason, gate: validationResult.gate });
    } else {
      console.log('[PromptQuill] ✅ All quality gates PASSED');
      brief._qualityGatePassed = true;
      const report = generateQualityReport(brief, selectedTabs, personality);
      console.log('[PromptQuill] Quality Report:', report);
    }

    // Record in memory and cache
    PromptMemory.recordBrief(input, brief, brief._tokensUsed);
    ResponseCache.set(input, modeToUse, brief);

    console.log(`[PromptQuill] ? Score: ${brief.score}/10 — Mode: ${brief.mode}`);

    return brief;

  } catch (err) {
    const errorMsg = err.message || String(err);

    if (errorMsg === SAFETY_GATE_MESSAGE) {
      return createSafetyGateResult({ mode: modeToUse });
    }

    // Check if this is a Pro-gate error from backend (case-insensitive)
    if (errorMsg.toLowerCase().includes('pro') ||
      errorMsg.toLowerCase().includes('upgrade') ||
      errorMsg.includes('feature')) {
      addDebugLog('Pro-gate error caught', { error: errorMsg });
      console.warn('[PromptQuill] Pro feature required:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        mode: modeToUse,
        type: 'pro_required',
      };
    }

    console.error('[PromptQuill] ? Generation error:', errorMsg);

    const fallback = createFallbackBrief(modeToUse);
    fallback.mode = modeToUse;
    fallback.error = errorMsg;

    addDebugLog('Error - using fallback', { error: errorMsg });
    PromptMemory.recordBrief(input, fallback, 0);

    return fallback;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ON-DEMAND TAB GENERATION — Lazy-loading for individual tabs
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a single tab on-demand (lazy-loading)
 * @param {string} idea - The original idea
 * @param {string} mode - The mode (GENERAL, STARTUP, etc.)
 * @param {string} tabName - Name of the tab to generate (e.g., 'tools')
 * @param {object} previousTabs - Context from already-generated tabs
 * @param {object} metadata - User metadata (personality, isPro, etc.)
 * @returns {Promise} Single tab content with tab name and credits
 */
export const generateTabContent = async (idea, mode, tabName, previousTabs = {}, metadata = {}) => {
  const safety = checkSafetyGate(idea);
  if (safety.blocked) {
    return createSafetyGateResult({
      tabName,
      creditsDeducted: 0,
    });
  }

  const normalizedMode = normalizeMode(mode);
  const personality = metadata?.personality === 'human' ? 'human' : 'bot';
  const isPro = metadata?.isPro === true;
  const allowedTabs = getTabsForMode(normalizedMode);

  if (!allowedTabs.includes(tabName)) {
    return {
      success: false,
      tabName,
      error: `"${tabName}" is not a ${normalizedMode} tab. Select a tab that belongs to the active mode.`,
      creditsDeducted: 0,
    };
  }

  console.log(`[generateTabContent] 🎯 Generating ONLY tab: ${tabName} for mode: ${normalizedMode}`);
  console.log(`[generateTabContent] 📡 Preparing focused API request for single tab (no other tabs in this request)`);
  addDebugLog('Generating single tab', { idea: idea.substring(0, 40), mode: normalizedMode, tabName });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  try {
    // Build system prompt for single tab
    const systemPromptStr = buildSystemPromptPartial(normalizedMode, personality, isPro, idea, [tabName], previousTabs);

    // Build user message — CRITICAL: pass real idea
    const userMessage = `Generate ONLY the '${tabName}' tab.\n\nUSER'S EXACT IDEA: "${idea}"\n\nCRITICAL: Use the user's exact idea above. Never substitute with placeholder text like 'test concept'.\nMode: ${normalizedMode}\nPersonality: ${personality}\n\nReturn ONLY valid JSON with the '${tabName}' tab.`;

    const requestBody = {
      messages: [
        { role: 'system', content: systemPromptStr },
        { role: 'user', content: userMessage }
      ],
      maxTokens: 2000,  // Smaller token budget for single tab
      userEmail: metadata.userEmail || 'frontend',
      mode: normalizedMode,
      personality: personality,
      isPro: isPro,
      tabsToGenerate: [tabName],  // NEW: Tell backend we're generating specific tab
    };

    const response = await fetch(`${backendUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(requestBody),
      timeout: 60000,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success === false) {
      if (result.errorType === 'safety_gate' || result.type === 'safety_gate') {
        return createSafetyGateResult({
          tabName,
          creditsDeducted: 0,
        });
      }

      throw new Error(result.error || 'Tab generation failed');
    }

    console.log(`[generateTabContent] ✅ API response received. Tab: ${tabName}, Tokens used: ${result.tokensUsed || 0}`);

    const cleaned = cleanObject(result);
    const raw = cleaned.data || cleaned.content;

    if (!raw || typeof raw !== 'string') {
      throw new Error(`Invalid response format: ${typeof raw}`);
    }

    // Extract JSON and get the tab content
    const extracted = extractAndRepairJson(raw);
    let tabContent = extracted.tabs?.[tabName] || '';

    // Ensure tabContent is a string
    if (typeof tabContent !== 'string') {
      tabContent = JSON.stringify(tabContent);
    }

    console.log(`[generateTabContent] ✅ Tab '${tabName}' generated: ${tabContent.length || 0} chars`);

    return {
      success: true,
      tabName,
      content: tabContent,
      creditsDeducted: ADDITIONAL_TAB_COST,
      mode: normalizedMode,
      tokensUsed: result.tokensUsed || 0,
    };

  } catch (err) {
    const errorMsg = err.message || String(err);
    console.error(`[generateTabContent] ❌ Error generating ${tabName}:`, errorMsg);
    addDebugLog('Tab generation error', { tabName, error: errorMsg });

    return {
      success: false,
      tabName,
      error: errorMsg,
      creditsDeducted: 0,
    };
  }
};

/**
 * Generate initial 3 tabs (lazy-loading mode)
 * @param {string} input - The idea
 * @param {string} userSelectedMode - Selected mode
 * @param {object} metadata - User metadata
 * @returns {Promise} Object with initial 3 tabs and credit cost (returns same structure as generateBrief for compatibility)
 */
export const generateInitialTabs = async (input, userSelectedMode, metadata = {}) => {
  const safety = checkSafetyGate(input);
  if (safety.blocked) {
    return createSafetyGateResult({
      mode: normalizeMode(userSelectedMode || 'GENERAL'),
    });
  }

  const mode = normalizeMode(userSelectedMode || ModeDetector.detect(input));
  const personality = metadata?.personality === 'human' ? 'human' : 'bot';
  const isPro = metadata?.isPro === true;

  console.log(`[generateInitialTabs] 🚀 Generating initial 3 tabs: ${INITIAL_TABS.join(', ')}`);
  addDebugLog('Generating initial tabs', { idea: input.substring(0, 40), mode, tabsCount: INITIAL_TABS.length });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  try {
    // Build system prompt for initial 3 tabs only
    const systemPromptStr = buildSystemPromptPartial(mode, personality, isPro, input, INITIAL_TABS, {});

    const userMessage = `Generate ONLY these 3 tabs.\n\nUSER'S EXACT IDEA: "${input}"\n\nCRITICAL: Use the user's exact idea above. Never substitute with placeholder text like 'test concept'.\nTabs to generate: ${INITIAL_TABS.join(', ')}\nMode: ${mode}\nPersonality: ${personality}\n\nReturn VALID JSON ONLY. Include score, score_breakdown, and score_reasoning.`;

    const requestBody = {
      messages: [
        { role: 'system', content: systemPromptStr },
        { role: 'user', content: userMessage }
      ],
      maxTokens: 4000,
      userId: metadata.userId,
      userEmail: metadata.userEmail || 'frontend',
      mode: mode,
      personality: personality,
      isPro: isPro,
      tabsToGenerate: INITIAL_TABS,
    };

    const response = await fetch(`${backendUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(requestBody),
      timeout: 60000,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.success === false) {
      if (result.errorType === 'safety_gate' || result.type === 'safety_gate') {
        return createSafetyGateResult({ mode });
      }

      throw new Error(result.error || 'Generation failed');
    }

    const cleaned = cleanObject(result);
    const raw = cleaned.data || cleaned.content;

    if (!raw || typeof raw !== 'string') {
      throw new Error(`Invalid response format: ${typeof raw}`);
    }

    // Extract and parse JSON, then validate with same function as generateBrief
    const parsed = extractAndRepairJson(raw);
    const brief = validateAndMergeBrief(parsed, mode, mode);
    brief._providerUsed = cleaned.metadata?.provider;
    brief._tokensUsed = result.tokensUsed || 0;
    brief.creditsUsed = cleaned.metadata?.creditsUsed || 0;

    // Calculate credit cost based on score
    const creditsToCharge = calculateInitialTabCost(brief.score || 5);

    console.log(`[generateInitialTabs] ✅ Initial tabs generated. Score: ${brief.score}/10. Credits: ${creditsToCharge}`);

    // Return same structure as generateBrief for compatibility with Dashboard
    return {
      ...brief,
      mode,
      _initialTabsGeneration: true,
      _generatedTabs: INITIAL_TABS,
      _creditsForInitial: creditsToCharge,
    };

  } catch (err) {
    const errorMsg = err.message || String(err);
    console.error('[generateInitialTabs] ❌ Error:', errorMsg);
    addDebugLog('Initial tabs generation error', { error: errorMsg });

    // Return fallback with success: false so Dashboard knows to show error
    const fallback = createFallbackBrief(mode);
    return {
      ...fallback,
      success: false,
      error: errorMsg,
      mode,
    };
  }
};

// ???????????????????????????????????????????????????????????????????????????????
// STRESS TEST GENERATOR
// ???????????????????????????????????????????????????????????????????????????????

export const generateStressTest = async (idea, existingBrief) => {
  const safety = checkSafetyGate(idea);
  if (safety.blocked) {
    return [];
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  try {
    addDebugLog('Generating stress test', { idea: idea.substring(0, 40) });

    const response = await fetch(`${backendUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content:
              'You are a skeptical investor and experienced founder. Ask 5 tough questions that expose FATAL FLAWS specific to this idea. Return ONLY: {"questions": ["q1","q2","q3","q4","q5"]}. No markdown, no preamble.',
          },
          {
            role: 'user',
            content: `Idea: "${idea}"\nScore: ${existingBrief?.score ?? '?'}/10\nKey issues: ${(existingBrief?.issues ?? []).join('; ')}\n\nAsk 5 uncomfortable questions. Each must name something SPECIFIC to THIS idea, not generic startup risk.`,
          },
        ],
        maxTokens: 800,
        userEmail: 'frontend',
      }),
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`Stress test failed: HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.success === false) throw new Error(result.error);

    const raw = result.data || result.content;
    const parsed = extractAndRepairJson(raw);

    addDebugLog('Stress test completed', { questionCount: parsed.questions?.length });

    return Array.isArray(parsed.questions)
      ? parsed.questions.filter(q => typeof q === 'string' && q.length > 10)
      : [];

  } catch (err) {
    console.error('[PromptQuill] Stress test error:', err.message);
    addDebugLog('Stress test error', { error: err.message });
    return [];
  }
};

// ???????????????????????????????????????????????????????????????????????????????
// ANALYTICS & METRICS
// ???????????????????????????????????????????????????????????????????????????????

export class AnalyticsEngine {
  static trackGeneration(idea, mode, score, tokensUsed) {
    const memory = PromptMemory.load();
    memory.stats.totalTokensUsed = (memory.stats.totalTokensUsed || 0) + tokensUsed;
    PromptMemory.save(memory);

    addDebugLog('Generation tracked', { mode, score, tokens: tokensUsed });
  }

  static getReport() {
    const stats = PromptMemory.getStats();
    return {
      totalGenerations: stats.totalGenerations,
      successRate: ((stats.successfulGenerations / stats.totalGenerations) * 100).toFixed(1) + '%',
      avgScore: stats.avgScore,
      favoriteMode: Object.entries(stats.modeDistribution).sort((a, b) => b[1] - a[1])[0]?.[0],
      tokensUsed: stats.totalTokensUsed,
      dateRange: 'all-time',
    };
  }
}

// ???????????????????????????????????????????????????????????????????????????????
// DEFAULT EXPORT WITH ALL UTILITIES
// ???????????????????????????????????????????????????????????????????????????????

export default {
  PromptMemory,
  generateBrief,
  generateStressTest,
  ModeDetector,
  ResponseCache,
  TokenManager,
  AnalyticsEngine,
};



