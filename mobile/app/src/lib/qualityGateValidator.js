import { MODE_TAB_MAP as PROMPT_MODE_TAB_MAP, normalizeMode } from './promptModeRegistry.js';

/**
 * PROMPTQUILL v6 QUALITY GATE VALIDATOR
 * Validates output against v6 requirements
 */

// ══════════════════════════════════════════════════════════════
// BANNED PHRASES — AUTOMATIC FAILURE
// ══════════════════════════════════════════════════════════════

const BANNED_PHRASES = [
  'social media advertising', 'product-market fit', 'value proposition',
  'go-to-market strategy', 'iterate based on feedback', 'keep it simple and scalable',
  'build a strong community', 'students struggle to find content',
  'leading to poor performance', 'balance responsibilities',
  'scalable solution', 'user-friendly', 'seamless experience', 'robust',
  'leverage', 'utilize', 'synergy', 'cutting-edge', 'innovative solution',
  'game-changer', 'revolutionize', 'empower', 'holistic', 'streamline',
  'comprehensive solution', 'pain points', 'target audience', 'early adopters',
  'competitive landscape', 'best practices', 'world-class', 'next-generation',
  'thought leader', 'No content generated for this tab', 'Content coming soon'
];

// ══════════════════════════════════════════════════════════════
// GENERIC PHRASES — SPECIFICITY TEST
// ══════════════════════════════════════════════════════════════

const GENERIC_PATTERNS = [
  /^many (students|users|people)/i,
  /^this (product|app|service) helps/i,
  /^the main (problem|issue) is/i,
  /^in today's (world|market|environment)/i,
  /^with the rise of/i,
  /^more and more/i,
  /^most people/i,
  /^these days/i,
  /^nowadays/i,
  /^the fact is/i,
  /^essentially/i,
  /^basically/i,
  /^at the end of the day/i,
  /^in reality/i,
  /^the key (is|point is|thing is)/i,
  /^it's important to/i,
  /^you need to/i,
  /^users want/i,
  /^the problem is/i,
  /^create a (solution|platform|app)/i
];

// ══════════════════════════════════════════════════════════════
// TAB SPECIFICATIONS (legacy v4)
// ══════════════════════════════════════════════════════════════

const TAB_SPECS = {
  1: { name: 'Overview', minChars: 400 },
  2: { name: 'Target User', minChars: 500 },
  3: { name: 'Problem', minChars: 500 },
  4: { name: 'Solution', minChars: 800 },
  5: { name: 'Competitors', minChars: 800 },
  6: { name: 'Validate', minChars: 800 },
  7: { name: 'Revenue', minChars: 800 },
  8: { name: 'Architecture', minChars: 800 },
  9: { name: 'Launch', minChars: 800 },
  10: { name: 'Plan', minChars: 800 },
  11: { name: 'Advice', minChars: 600 },
  12: { name: 'UI Ideas', minChars: 600 }
};

// ══════════════════════════════════════════════════════════════
// v6 Mode-Specific Character Minimums
// ══════════════════════════════════════════════════════════════

const V5_TAB_MINIMUMS = {
  'GENERAL': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'final_prompt': 800, 'tools': 800, 'score': 600,
    'expert_angle': 800, 'automation': 800
  },
  'STARTUP': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'final_prompt': 800, 'validate': 800, 'plan': 1000,
    'launch': 1000, 'score': 600,
    'investor_lens': 900, 'ai_debate': 900, 'ship_30_days': 900, 'pivot_options': 900
  },
  'STARTUP_LITE': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'final_prompt': 800, 'validate': 800, 'plan': 1000,
    'launch': 1000, 'score': 600
  },
  'CODING': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'final_prompt': 800, 'dev_brief': 1000, 'architecture': 800,
    'schema': 600, 'score': 600,
    'endpoints': 600, 'build_order': 800, 'security_audit': 800, 'deployment': 800
  },
  'CONTENT': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'final_prompt': 800, 'content_brief': 1000, 'seo': 800, 'score': 600,
    'viral_hooks': 800, 'email_sequence': 900, 'distribution': 800
  },
  'CREATIVE': {
    'action_brief': 400, 'steps': 400, 'quick_wins': 400,
    'master_prompt': 1200, 'variations': 1000, 'tool_guide': 800, 'score': 600,
    'style_library': 1000, 'directors_notes': 900, 'multi_tool_pack': 1000
  }
};

// ══════════════════════════════════════════════════════════════
// VALIDATORS
// ══════════════════════════════════════════════════════════════

export const checkBannedPhrases = (text) => {
  const found = [];
  const textLower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (textLower.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  return { hasBanned: found.length > 0, bannedPhrases: found };
};

export const checkSpecificity = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const generic = [];
  for (const sentence of sentences) {
    for (const pattern of GENERIC_PATTERNS) {
      if (pattern.test(sentence.trim())) {
        generic.push(sentence.trim().substring(0, 80) + '...');
        break;
      }
    }
  }
  return { isSpecific: generic.length === 0, genericSentences: generic, genericCount: generic.length };
};

// Legacy v4 tab number mapping
const TAB_NUMBER_TO_FIELD = {
  1: 'overview', 2: 'target_user', 3: 'problem', 4: 'solution',
  5: 'competitors', 6: 'validate', 7: 'revenue', 8: 'architecture',
  9: 'launch', 10: 'plan', 11: 'advice', 12: 'ui_ideas'
};

export const checkCharacterMinimums = (tabOutput, selectedTabs) => {
  const failures = [];
  if (!tabOutput || typeof tabOutput !== 'object') {
    return { passed: false, failures: ['Invalid output structure'] };
  }

  const mode = normalizeMode(tabOutput.mode);
  const isV5 = PROMPT_MODE_TAB_MAP[mode] !== undefined;
  let tabNames = isV5 ? PROMPT_MODE_TAB_MAP[mode] : Object.values(TAB_NUMBER_TO_FIELD);

  for (const tabNum of selectedTabs) {
    const fieldName = isV5 ? tabNames[tabNum - 1] : TAB_NUMBER_TO_FIELD[tabNum];
    if (!fieldName) continue;

    let minRequired;
    if (isV5 && V5_TAB_MINIMUMS[mode]) {
      minRequired = V5_TAB_MINIMUMS[mode][fieldName] || 150;
    } else {
      minRequired = TAB_SPECS[tabNum]?.minChars || 200;
    }

    let tabContent =
      tabOutput.tabs?.[fieldName] ||
      tabOutput[fieldName] ||
      tabOutput[`tab${tabNum}`] ||
      tabOutput[tabNum] ||
      '';

    const charCount = String(tabContent).length;
    if (charCount < minRequired) {
      failures.push({
        tab: tabNum, name: fieldName, required: minRequired,
        actual: charCount, shortBy: minRequired - charCount, field: fieldName
      });
    }
  }

  return { passed: failures.length === 0, failures };
};

export const checkRequiredFields = (tabOutput, selectedTabs) => {
  const missing = [];
  const mode = normalizeMode(tabOutput.mode);
  const expectedTabNames = PROMPT_MODE_TAB_MAP[mode] || [];

  for (const tabNum of selectedTabs) {
    const v5TabName = expectedTabNames[tabNum - 1];
    const hasContent =
      tabOutput[`tab${tabNum}`] ||
      tabOutput[tabNum] ||
      tabOutput.tabs?.[v5TabName] ||
      tabOutput[TAB_SPECS[tabNum]?.name];

    if (!hasContent || String(hasContent).trim().length === 0) {
      missing.push(tabNum);
    }
  }

  return { passed: missing.length === 0, missingTabs: missing };
};

export const checkRealism = (text) => {
  const issues = [];
  if (!/₹|$|USD|INR|\d{2,}/.test(text)) {
    issues.push('Missing specific numbers or currency');
  }
  const hasNames = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text) ||
                   /[A-Z]+[a-z]+(?:ly|base|space|hub|flow|script|tech|ai)/i.test(text);
  if (!hasNames && text.length > 1000) {
    issues.push('Missing specific names (people or companies)');
  }
  return { hasRealism: issues.length === 0, issues };
};

// ══════════════════════════════════════════════════════════════
// MAIN VALIDATOR
// ══════════════════════════════════════════════════════════════

export const validatePromptQuillOutput = (output, selectedTabs = [1,2,3,4,5,6,7,8,9,10,11,12], mind = 'bot') => {
  const placeholderPhrases = [
    'PRO_LOCKED', 'coming soon', 'content coming soon', 'no content',
    'not available', 'n/a', 'tbd', 'to be determined', '[restricted]',
    '[locked]', '[coming soon]', 'placeholder', 'this will be filled in later',
    'restricted content', 'pro feature', 'upgrade to pro'
  ];

  const mode = normalizeMode(output.mode);
  const expectedTabNames = PROMPT_MODE_TAB_MAP[mode] || [];

  // Check each tab for placeholders
  for (let i = 0; i < selectedTabs.length; i++) {
    const tabNum = selectedTabs[i];
    const tabName = expectedTabNames[tabNum - 1];
    const tabContent = (output.tabs?.[tabName] || '').toLowerCase();
    if (tabContent.length < 20) continue;

    for (const phrase of placeholderPhrases) {
      if (tabContent.includes(phrase.toLowerCase())) {
        return {
          passed: false, reason: `Placeholder content in ${tabName} tab`,
          details: `Tab contains: "${phrase}"`, gate: 'no_placeholders'
        };
      }
    }
  }

  const fullText = JSON.stringify(output);

  const bannedCheck = checkBannedPhrases(fullText);
  if (bannedCheck.hasBanned) {
    return { passed: false, reason: 'Banned phrases detected', details: bannedCheck.bannedPhrases, gate: 'banned_phrases' };
  }

  const minCheck = checkCharacterMinimums(output, selectedTabs);
  if (!minCheck.passed) {
    return { passed: false, reason: 'Some tabs too short', details: minCheck.failures, gate: 'character_minimums' };
  }

  const fieldCheck = checkRequiredFields(output, selectedTabs);
  if (!fieldCheck.passed) {
    return { passed: false, reason: 'Missing tabs', details: fieldCheck.missingTabs, gate: 'required_fields' };
  }

  return {
    passed: true, reason: 'All gates passed',
    gates: { banned_phrases: { status: 'PASS' }, character_minimums: { status: 'PASS' }, required_fields: { status: 'PASS' } }
  };
};

// ══════════════════════════════════════════════════════════════
// QUALITY REPORT
// ══════════════════════════════════════════════════════════════

export const generateQualityReport = (output, selectedTabs = [], mind = 'bot') => {
  const validation = validatePromptQuillOutput(output, selectedTabs, mind);
  return {
    timestamp: new Date().toISOString(),
    validation,
    summary: { totalTabs: selectedTabs.length, mind, status: validation.passed ? '✅ PASS' : '❌ FAIL' },
    outputStats: {
      totalChars: Object.values(output).join('').length,
      tabCounts: Object.entries(TAB_SPECS)
        .filter(([num]) => selectedTabs.includes(Number(num)))
        .map(([num, spec]) => ({
          tab: num, name: spec.name, minRequired: spec.minChars,
          actual: String(output[`tab${num}`] || output[num] || '').length
        }))
    }
  };
};

// ══════════════════════════════════════════════════════════════
// FINAL_PROMPT VALIDATOR
// ══════════════════════════════════════════════════════════════

export const validateFinalPrompt = (finalPromptText) => {
  if (!finalPromptText || typeof finalPromptText !== 'string') {
    return { passed: false, reason: 'Empty or invalid final_prompt', passConditions: [], failConditions: ['No final_prompt text provided'], score: 0 };
  }

  const text = finalPromptText.trim();
  const passConditions = [];
  const failConditions = [];

  // 1. Check for structured format
  const hasXmlRole = /<role>/i.test(text);
  const hasXmlContext = /<context>/i.test(text);
  const hasXmlTask = /<task>/i.test(text);
  if (hasXmlRole && hasXmlContext && hasXmlTask) {
    passConditions.push('✅ Uses structured format (role/context/task)');
  } else {
    failConditions.push('❌ Missing structured format — must use <role>, <context>, <task>');
  }

  // 2. Specificity check
  const specificityCheck = checkSpecificity(text);
  if (specificityCheck.isSpecific) {
    passConditions.push('✅ All sentences specific to this idea only');
  } else {
    failConditions.push(`❌ ${specificityCheck.genericCount} generic sentences found`);
  }

  // 3. Zero banned phrases
  const bannedCheck = checkBannedPhrases(text);
  if (!bannedCheck.hasBanned) {
    passConditions.push('✅ Zero banned phrases detected');
  } else {
    failConditions.push(`❌ Found banned phrases: ${bannedCheck.bannedPhrases.join(', ')}`);
  }

  // 4. Minimum 400 words (~2000 chars)
  if (text.length >= 1600) {
    passConditions.push(`✅ Sufficient length (${text.length} chars)`);
  } else {
    failConditions.push(`❌ Only ${text.length} characters (minimum ~1600 required)`);
  }

  // 5. Has clear next step
  const hasClearNextStep = /(next|do|call|email|build|start|action|step)/i.test(text.slice(-500));
  if (hasClearNextStep) {
    passConditions.push('✅ Reader knows exactly what to do next');
  } else {
    failConditions.push('❌ No clear next step for reader');
  }

  const passed = failConditions.length === 0;
  const score = Math.round((passConditions.length / 5) * 100);

  return { passed, reason: passed ? 'All quality gates passed' : `Failed ${failConditions.length} quality gates`, passConditions, failConditions, score, textLength: text.length };
};

export default {
  checkBannedPhrases, checkSpecificity, checkCharacterMinimums, checkRequiredFields,
  checkRealism, validatePromptQuillOutput, validateFinalPrompt, generateQualityReport,
  BANNED_PHRASES, TAB_SPECS, V5_TAB_MINIMUMS
};

export { V5_TAB_MINIMUMS };
