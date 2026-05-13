import { MODE_TAB_MAP as PROMPT_MODE_TAB_MAP, normalizeMode } from './promptModeRegistry.js';

/**
 * Robust JSON Extraction & Repair
 * Handles truncated, malformed, and incomplete JSON responses
 */

export const extractAndRepairJson = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty or non-string response');
  }
  
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error(`No JSON object found. Preview: ${cleaned.substring(0, 200)}`);
  }
  
  // Helper: Find matching closing brace accounting for string state
  const findClosingBrace = (str, startIdx) => {
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = startIdx; i < str.length; i++) {
      const char = str[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          bracketCount = 0;
          if (braceCount === 0) return i;
        }
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
      }
    }
    
    return -1;
  };
  
  let end = findClosingBrace(cleaned, start);
  
  if (end === -1) {
    console.warn('[extractJson] ⚠️ Unterminated JSON detected. Initiating comprehensive repair...');
    let raw_json = cleaned.slice(start);
    
    // STEP 1: Find and close unterminated strings
    let inString = false;
    let escapeNext = false;
    let lastGoodStringEnd = -1;
    
    for (let i = 0; i < raw_json.length; i++) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (raw_json[i] === '\\') {
        escapeNext = true;
        continue;
      }
      if (raw_json[i] === '"') {
        inString = !inString;
        if (!inString) lastGoodStringEnd = i;
      }
    }
    
    // If still in string, truncate and close it
    if (inString && lastGoodStringEnd !== -1) {
      console.warn('[extractJson] 🔧 Closing unterminated string at position', lastGoodStringEnd);
      raw_json = raw_json.slice(0, lastGoodStringEnd + 1);
    }
    
    // STEP 2: Remove incomplete/dangling fields
    raw_json = raw_json.replace(/,\s*"[^"]*"\s*(?=[}\]])/g, '');
    raw_json = raw_json.replace(/,\s*"[^"]*":\s*(?=[}\]])/g, '');
    raw_json = raw_json.replace(/[,:]+\s*$/g, '');
    
    // STEP 3: Count and close all open braces/brackets
    let braceCount = 0;
    let bracketCount = 0;
    inString = false;
    escapeNext = false;
    
    for (let i = 0; i < raw_json.length; i++) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (raw_json[i] === '\\') {
        escapeNext = true;
        continue;
      }
      if (raw_json[i] === '"') {
        inString = !inString;
      }
      if (!inString) {
        if (raw_json[i] === '{') braceCount++;
        else if (raw_json[i] === '}') braceCount--;
        else if (raw_json[i] === '[') bracketCount++;
        else if (raw_json[i] === ']') bracketCount--;
      }
    }
    
    // Close all open brackets first
    while (bracketCount > 0) {
      raw_json += ']';
      bracketCount--;
    }
    
    // Close all open braces
    while (braceCount > 0) {
      raw_json += '}';
      braceCount--;
    }
    
    console.warn(`[extractJson] 🔧 Repaired JSON. Length: ${raw_json.length}`);
    cleaned = raw_json;
  } else {
    cleaned = cleaned.slice(start, end + 1);
  }
  
  try { 
    return JSON.parse(cleaned); 
  }
  catch (parseError) { 
    console.warn('[extractJson] Initial parse failed, applying sanitization...', parseError.message);
    
    let recovered = cleaned;
    
    // Step 1: Find the error position and work backwards to find a safe point
    const errorMatch = parseError.message.match(/position (\d+)/);
    let errorPos = recovered.length;
    if (errorMatch) {
      errorPos = parseInt(errorMatch[1]);
    }
    
    // Step 2: Walk backwards from error position to find the last complete string or value
    let safePos = errorPos;
    let inString = false;
    let escapeNext = false;
    let quoteCount = 0;
    
    // Count quotes from start to find where we are in parsing
    for (let i = 0; i < errorPos; i++) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (recovered[i] === '\\' && inString) {
        escapeNext = true;
        continue;
      }
      if (recovered[i] === '"') {
        quoteCount++;
        inString = !inString;
      }
    }
    
    // If we're in a string at error position, truncate to before it started
    if (inString) {
      // Find the start of the incomplete string
      for (let i = errorPos - 1; i >= 0; i--) {
        if (recovered[i] === '"' && (i === 0 || recovered[i-1] !== '\\')) {
          safePos = i;
          break;
        }
      }
      recovered = recovered.substring(0, safePos);
    } else {
      recovered = recovered.substring(0, errorPos);
    }
    
    // Step 3: Remove trailing incomplete keys/values
    recovered = recovered.replace(/,\s*"[^"]*"\s*:\s*$/, ','); // Remove last incomplete key
    recovered = recovered.replace(/,\s*"[^"]*"\s*$/, ''); // Remove trailing incomplete key
    recovered = recovered.replace(/:\s*$/, ''); // Remove trailing colon
    recovered = recovered.replace(/,\s*$/, ''); // Remove trailing comma
    
    // Step 4: If last char before potential close is a comma, remove it
    let trimmed = recovered.trimEnd();
    if (trimmed.endsWith(',')) {
      trimmed = trimmed.slice(0, -1);
    }
    recovered = trimmed;
    
    // Step 5: Count and close all unclosed structures
    let braceCount = 0;
    let bracketCount = 0;
    inString = false;
    escapeNext = false;
    
    for (let i = 0; i < recovered.length; i++) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (recovered[i] === '\\') {
        escapeNext = true;
        continue;
      }
      if (recovered[i] === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (recovered[i] === '{') braceCount++;
        else if (recovered[i] === '}') braceCount--;
        else if (recovered[i] === '[') bracketCount++;
        else if (recovered[i] === ']') bracketCount--;
      }
    }
    
    // Close all unclosed structures
    while (bracketCount > 0) {
      recovered += ']';
      bracketCount--;
    }
    while (braceCount > 0) {
      recovered += '}';
      braceCount--;
    }
    
    try {
      const parsed = JSON.parse(recovered);
      console.warn('[extractJson] ✅ Sanitization recovery succeeded');
      return parsed;
    } catch (recoveryError) {
      console.error('[extractJson] ❌ Both parsing strategies failed');
      console.warn('[extractJson] Attempted recovery:', recovered.substring(0, 300));
      throw new Error(`JSON parse failed: ${parseError.message}`);
    }
  }
};

/**
 * Create fallback brief for when generation fails
 */
export const createFallbackBrief = (mode = 'GENERAL') => {
  const normalizedMode = normalizeMode(mode);
  const tabs = Object.fromEntries(
    PROMPT_MODE_TAB_MAP[normalizedMode].map(tab => [tab, 'Generation incomplete - please retry'])
  );

  return {
  score: 5,
  score_breakdown: { clarity: 5, specificity: 5, feasibility: 5, market_potential: 5 },
  score_reasoning: 'Response was incomplete. Please retry with a more specific description.',
  difficulty: '1 Month Build',
  difficulty_hours: 80,
  naming_suggestions: [],
  stress_test: [],
  mode: normalizedMode,
  issues: ['Response truncated during generation'],
  suggestions: ['Retry with a shorter, more focused idea description'],
  tabs
  };
};

/**
 * Validate and merge parsed JSON with fallback defaults
 * Now supports v5 multi-mode system with pro_tab_previews
 */
export const validateAndMergeBrief = (parsed, fallbackMode, mode = 'GENERAL') => {
  // Get expected tabs from the canonical registry. This keeps each mode isolated
  // even if older local maps drift behind the prompt builder.
  const requestedMode = normalizeMode(fallbackMode || mode || parsed?.mode);
  const expectedTabs = PROMPT_MODE_TAB_MAP[requestedMode];
  
  // v4 fallback for legacy compatibility
  const LEGACY_V4_TABS = ['overview', 'target_user', 'problem', 'solution', 'competitors', 'validate', 'revenue', 'architecture', 'launch', 'plan', 'advice', 'ui_ideas'];
  
  const fallback = createFallbackBrief(requestedMode);
  
  // HELPER: Convert any value to a string (handles objects, arrays, etc.)
  const toTabString = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };
  
  // FIX: Handle both formats - tabs nested under "tabs" key OR at top level
  let workingBrief = parsed;
  if (!parsed.tabs && parsed.overview) {
    // Tabs are at top level (v4 format), not nested under "tabs" - restructure them
    console.log('[validateAndMergeBrief] 🔧 Restructuring v4 tabs from top-level to nested format');
    workingBrief = {
      ...parsed,
      tabs: {}
    };
    // Copy all legacy tabs
    for (const tabKey of LEGACY_V4_TABS) {
      workingBrief.tabs[tabKey] = toTabString(parsed[tabKey] || '');
    }
    console.log('[validateAndMergeBrief] ✅ Restructured v4 tabs. Converted to nested format.');
  }
  
  const tabsPresent = Object.keys(workingBrief.tabs || {});
  const tabStats = Object.entries(workingBrief.tabs || {}).map(([k, v]) => `${k}: ${v?.length || 0}ch`).join(', ');
  console.log('[validateAndMergeBrief] 📊 Tabs present in parsed:', tabsPresent);
  console.log('[validateAndMergeBrief] 📊 Tab lengths:', tabStats);
  
  // Ensure score is valid
  const score = typeof workingBrief.score === 'number' && workingBrief.score >= 1 && workingBrief.score <= 10 
    ? Math.round(workingBrief.score) 
    : fallback.score;
  
  // Ensure score_breakdown is complete
  const score_breakdown = {
    clarity: Math.min(10, Math.max(1, Math.round(workingBrief.score_breakdown?.clarity ?? 5))),
    specificity: Math.min(10, Math.max(1, Math.round(workingBrief.score_breakdown?.specificity ?? 5))),
    feasibility: Math.min(10, Math.max(1, Math.round(workingBrief.score_breakdown?.feasibility ?? 5))),
    market_potential: Math.min(10, Math.max(1, Math.round(workingBrief.score_breakdown?.market_potential ?? 5)))
  };
  
  // Ensure tabs all exist
  const tabs = {};
  console.log('[validateAndMergeBrief] 🔍 Tabs in parsed response:', Object.keys(workingBrief.tabs || {}));
  
  // DETECT: Did LLM return v4 tabs instead of v5 mode-specific tabs?
  const hasV4Tabs = Object.keys(workingBrief.tabs || {}).some(k => LEGACY_V4_TABS.includes(k));
  const hasV5Tabs = Object.keys(workingBrief.tabs || {}).some(k => expectedTabs.includes(k));
  
  console.log(`[validateAndMergeBrief] 📊 Has v4 tabs: ${hasV4Tabs}, Has v5 tabs: ${hasV5Tabs}`);
  
  // Legacy v4 tab names are no longer accepted as substitutes for the active mode.
  // Each mode must keep its own tab identity, even when the model returns fallback-era keys.
  const acceptLegacyTabs = false;
  if (acceptLegacyTabs && hasV4Tabs && !hasV5Tabs) {
    console.log('[validateAndMergeBrief] 🔄 Detected v4 tabs in response, accepting as valid');
    
    // Map v4 tabs to output (accept all 12 even though mode expected different names)
    for (const tabKey of LEGACY_V4_TABS) {
      const tabValue = workingBrief.tabs?.[tabKey];
      const isValid = typeof tabValue === 'string' && tabValue.length > 10;
      
      if (isValid) {
        tabs[tabKey] = tabValue;
      } else {
        tabs[tabKey] = fallback.tabs[tabKey];
      }
    }
    console.log('[validateAndMergeBrief] ✅ Accepted v4 tab structure');
    
  } else {
    // Normal v5 path: use expectedTabs from MODE_TAB_MAP
    // Filter out 'score' since it's not a tab, it's a top-level property
    const actualTabsToProcess = expectedTabs.filter(t => t !== 'score');
    
    // Track how many tabs we received vs expected
    const receivedTabCount = Object.keys(workingBrief.tabs || {}).filter(k => {
      const val = workingBrief.tabs[k];
      return typeof val === 'string' && val.length > 5 && val !== 'PRO_LOCKED';
    }).length;
    const isPartialResponse = receivedTabCount < actualTabsToProcess.length && receivedTabCount > 0;
    
    for (const tabKey of actualTabsToProcess) {
      let tabValue = workingBrief.tabs?.[tabKey];
      
      // Handle PRO_LOCKED tabs (valid for free users)
      if (tabValue === 'PRO_LOCKED') {
        tabs[tabKey] = 'PRO_LOCKED';
        continue;
      }
      
      // For partial responses (some tabs present), accept even short content (min 3 chars)
      // For complete responses, require longer content (min 10 chars)
      const minLength = isPartialResponse ? 3 : 10;
      const isValid = typeof tabValue === 'string' && tabValue.length > minLength;
      
      if (!isValid && isPartialResponse) {
        console.log(`[validateAndMergeBrief] ℹ️ Tab "${tabKey}" incomplete (${tabValue?.length || 0} chars). Generated placeholder.`);
      } else if (!isValid) {
        console.warn(`[validateAndMergeBrief] ⚠️ Tab "${tabKey}" missing or too short (${tabValue?.length || 0} chars). Using fallback.`);
      }
      
      // For missing tabs in partial responses, use a more helpful placeholder
      if (!isValid && isPartialResponse) {
        tabs[tabKey] = `[${tabKey.replace(/_/g, ' ').toUpperCase()} - Content generated. Please expand this section.]`;
      } else {
        // For v4 fallback, use legacy fallback; otherwise use a mode-appropriate placeholder
        const fallbackTab = fallback.tabs[tabKey] || 'Generation incomplete - please retry';
        tabs[tabKey] = isValid ? tabValue : fallbackTab;
      }
    }
  }
  
  // Ensure 'score' tab exists even if not in expectedTabs list
  // (for backward compatibility with old system that expected score as a tab)
  if (!tabs['score']) {
    tabs['score'] = workingBrief.score_reasoning || `Score: ${score}/10. Breakdown: Clarity ${score_breakdown.clarity}, Specificity ${score_breakdown.specificity}, Feasibility ${score_breakdown.feasibility}, Market Potential ${score_breakdown.market_potential}`;
  }
  
  // Build the merged result
  const merged = {
    score,
    score_breakdown,
    score_reasoning: workingBrief.score_reasoning || fallback.score_reasoning,
    difficulty: workingBrief.difficulty || fallback.difficulty,
    difficulty_hours: workingBrief.difficulty_hours || fallback.difficulty_hours,
    naming_suggestions: Array.isArray(workingBrief.naming_suggestions) && workingBrief.naming_suggestions.length > 0 ? workingBrief.naming_suggestions : fallback.naming_suggestions,
    stress_test: Array.isArray(workingBrief.stress_test) && workingBrief.stress_test.length > 0 ? workingBrief.stress_test : fallback.stress_test,
    mode: requestedMode,
    personality: workingBrief.personality || 'bot',
    issues: Array.isArray(workingBrief.issues) && workingBrief.issues.length > 0 ? workingBrief.issues : fallback.issues,
    suggestions: Array.isArray(workingBrief.suggestions) && workingBrief.suggestions.length > 0 ? workingBrief.suggestions : fallback.suggestions,
    tabs
  };
  
  // Add pro_tab_previews if present
  if (parsed.pro_tab_previews && typeof parsed.pro_tab_previews === 'object') {
    merged.pro_tab_previews = parsed.pro_tab_previews;
  }
  
  return merged;
};

/**
 * Get appropriate token limit based on mode
 */
export const getMaxTokensForMode = (mode) => {
  const modeTokens = {
    'STARTUP': 10000,       // 12 tabs (8 free + 4 pro)
    'STARTUP_LITE': 4000,   // 8 tabs all free
    'CODING': 8000,         // 12 tabs (8 free + 4 pro)
    'CONTENT': 6000,        // 10 tabs (7 free + 3 pro)
    'CREATIVE': 6000,       // 10 tabs (7 free + 3 pro)
    'GENERAL': 5000         // 8 tabs (6 free + 2 pro)
  };
  return modeTokens[mode] || 5000;
};
