// ═══════════════════════════════════════════════════════════════
// PROMPTQUILL v6 — Mode Registry (Definitive Tab Structure)
// ═══════════════════════════════════════════════════════════════

export const INITIAL_TABS = ['action_brief', 'steps', 'quick_wins'];

export const MODE_TAB_MAP = {
  STARTUP: [
    // FREE (8)
    'action_brief', 'steps', 'quick_wins', 'final_prompt',
    'validate', 'plan', 'launch', 'score',
    // PRO (4)
    'investor_lens', 'ai_debate', 'ship_30_days', 'pivot_options'
  ],
  STARTUP_LITE: [
    // ALL FREE (8)
    'action_brief', 'steps', 'quick_wins', 'final_prompt',
    'validate', 'plan', 'launch', 'score'
  ],
  CODING: [
    // FREE (8)
    'action_brief', 'steps', 'quick_wins', 'final_prompt',
    'dev_brief', 'architecture', 'schema', 'score',
    // PRO (4)
    'endpoints', 'build_order', 'security_audit', 'deployment'
  ],
  CONTENT: [
    // FREE (7)
    'action_brief', 'steps', 'quick_wins', 'final_prompt',
    'content_brief', 'seo', 'score',
    // PRO (3)
    'viral_hooks', 'email_sequence', 'distribution'
  ],
  CREATIVE: [
    // FREE (7)
    'action_brief', 'steps', 'quick_wins', 'master_prompt',
    'variations', 'tool_guide', 'score',
    // PRO (3)
    'style_library', 'directors_notes', 'multi_tool_pack'
  ],
  GENERAL: [
    // FREE (6)
    'action_brief', 'steps', 'quick_wins', 'final_prompt',
    'tools', 'score',
    // PRO (2)
    'expert_angle', 'automation'
  ]
};

export const MODE_PRO_TABS = {
  STARTUP: ['investor_lens', 'ai_debate', 'ship_30_days', 'pivot_options'],
  STARTUP_LITE: [],
  CODING: ['endpoints', 'build_order', 'security_audit', 'deployment'],
  CONTENT: ['viral_hooks', 'email_sequence', 'distribution'],
  CREATIVE: ['style_library', 'directors_notes', 'multi_tool_pack'],
  GENERAL: ['expert_angle', 'automation']
};

export const VALID_MODES = Object.keys(MODE_TAB_MAP);

export function normalizeMode(mode, fallback = 'GENERAL') {
  if (typeof mode !== 'string' || !mode.trim()) return fallback;

  const normalized = mode.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const aliases = {
    STARTUP_PRO: 'STARTUP',
    STARTUP_FULL: 'STARTUP',
    STARTUP_LITE_MODE: 'STARTUP_LITE'
  };
  const canonical = aliases[normalized] || normalized;

  return VALID_MODES.includes(canonical) ? canonical : fallback;
}

export function getTabsForMode(mode) {
  return MODE_TAB_MAP[normalizeMode(mode)];
}

export function getProTabsForMode(mode) {
  return MODE_PRO_TABS[normalizeMode(mode)] || [];
}

export function getFreeTabsForMode(mode) {
  const allTabs = getTabsForMode(mode);
  const proTabs = new Set(getProTabsForMode(mode));
  return allTabs.filter(t => !proTabs.has(t));
}
