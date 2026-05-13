import { normalizeMode } from './promptModeRegistry.js';

export const TAB_PURPOSES = {
  CODING: {
    action_brief: 'Technical scope: stack, system boundaries, constraints, purpose.',
    steps: 'Ordered implementation sequence: setup → build → integrate → test → deploy.',
    quick_wins: 'Fast engineering improvements achievable in under 2 hours.',
    final_prompt: 'Complete structured prompt for Cursor, Copilot, or Claude Code.',
    dev_brief: 'Feature spec with acceptance criteria, edge cases, and test scenarios.',
    architecture: 'System design with cost at 100/1K/10K users, bottleneck analysis.',
    schema: 'Exact DB tables, fields, types, relationships, validation rules.',
    score: 'Technical feasibility + complexity rating with honest reasoning.',
    endpoints: 'Every API route: method, path, request/response schema, auth.',
    build_order: 'Day-by-day build plan with verifiable done conditions.',
    security_audit: 'Vulnerabilities + fixes specific to this stack.',
    deployment: 'CI/CD pipeline, infra, environment variables, rollback plan.'
  },
  CONTENT: {
    action_brief: 'Content strategy summary: what, for whom, goal, and success metric.',
    steps: 'Content workflow: research → outline → draft → review → publish.',
    quick_wins: 'Highest-impact content improvements achievable immediately.',
    final_prompt: 'Complete structured prompt for ChatGPT, Claude, or Jasper.',
    content_brief: 'Full brief: topic, angle, word count, key messages, CTA, tone.',
    seo: 'Keyword targets, title tag, meta description, internal links, search intent.',
    score: 'Content quality + impact rating with honest reasoning.',
    viral_hooks: '10 written hook variations with real copy — not templates.',
    email_sequence: '5-email nurture series with subject lines, body, and CTA.',
    distribution: 'Platform + timing + repurpose strategy for maximum reach.'
  },
  CREATIVE: {
    action_brief: 'Creative vision: the feeling, world, or experience being created.',
    steps: 'Creative process: ideation → concept → execution → refinement.',
    quick_wins: 'Immediate creative improvements that elevate the work right now.',
    master_prompt: 'Extended prompt with sensory language, world-building, emotional core.',
    variations: 'Three meaningfully different creative directions — not rephrased versions.',
    tool_guide: 'Best AI tool for this creative task with specific settings and why.',
    score: 'Creative quality rating with honest reasoning.',
    style_library: '10 named style references with rationale and visual descriptors.',
    directors_notes: 'Full creative brief: do/don\'t guidance, staging, rhythm.',
    multi_tool_pack: 'Same prompt formatted for 5 different tools (Midjourney, DALL-E, etc.).'
  },
  GENERAL: {
    action_brief: 'Strategic summary: what needs to happen, why, what success looks like.',
    steps: 'Execution plan: ordered actions with owners and dependencies.',
    quick_wins: 'Highest-leverage actions achievable in 24-48 hours.',
    final_prompt: 'Structured general-purpose prompt for the stated goal.',
    tools: 'Best tools and resources with cost and role in this task.',
    score: 'Feasibility + clarity rating with honest reasoning.',
    expert_angle: 'Non-obvious insight that separates expert execution from average.',
    automation: 'What to automate, how, what tools, and failure checks.'
  },
  STARTUP: {
    action_brief: 'Investor-grade summary: problem, solution, market, traction, ask.',
    steps: '90-day execution roadmap with milestones and done conditions.',
    quick_wins: 'Growth signals or validation experiments achievable this week.',
    final_prompt: 'Structured prompt for fundraising, pitch, or growth workflows.',
    validate: 'Riskiest assumptions + 3 real competitors with actual pricing.',
    plan: 'Week-by-week build plan with done conditions per phase.',
    launch: 'First 100 users: actual outreach copy, channels, retention hook.',
    score: 'Startup viability score with honest reasoning and next milestone.',
    investor_lens: 'VC evaluation, investment thesis, red flags, comparable raises.',
    ai_debate: 'Bull case vs bear case, scenarios, and balanced verdict.',
    ship_30_days: '30-day execution calendar with daily deliverables.',
    pivot_options: '3 alternative directions if the current thesis is weak.'
  },
  STARTUP_LITE: {
    action_brief: 'Lean hypothesis: what, for whom, why now.',
    steps: 'Fastest path to working prototype or first customer.',
    quick_wins: 'Zero-budget validation experiments for today.',
    final_prompt: 'Structured prompt for lean startup experimentation.',
    validate: 'Top 3 riskiest assumptions + test method for each.',
    plan: '2-week sprint to working demo.',
    launch: 'First 10 users: exact DM to send (real copy, no brackets).',
    score: 'Honest viability score with one improvement suggestion.'
  }
};

const MODE_TERMS = {
  CODING: ['api', 'schema', 'database', 'component', 'endpoint', 'test', 'deploy', 'auth', 'server', 'client', 'stack', 'ci', 'bug', 'edge'],
  CONTENT: ['audience', 'keyword', 'headline', 'cta', 'draft', 'publish', 'seo', 'channel', 'voice', 'hook', 'brief', 'reader'],
  CREATIVE: ['mood', 'texture', 'palette', 'composition', 'world', 'character', 'scene', 'light', 'rhythm', 'style', 'emotion', 'reference'],
  GENERAL: ['milestone', 'owner', 'dependency', 'risk', 'resource', 'timeline', 'priority', 'decision', 'outcome', 'phase'],
  STARTUP: ['market', 'traction', 'customer', 'revenue', 'pricing', 'moat', 'investor', 'growth', 'retention', 'cac', 'ltv', 'funding'],
  STARTUP_LITE: ['hypothesis', 'prototype', 'signal', 'experiment', 'validation', 'customer', 'zero-budget', '48-hour', 'mvp']
};

const CROSS_MODE_PENALTIES = {
  CODING: ['investor', 'fundraising', 'tam', 'traction', 'pitch deck', 'market fit', 'moat'],
  CONTENT: ['database schema', 'api endpoint', 'ci/cd', 'auth middleware', 'investor ask'],
  CREATIVE: ['cac', 'ltv', 'api endpoint', 'database schema', 'fundraising'],
  GENERAL: [],
  STARTUP: ['component props', 'unit test', 'database index'],
  STARTUP_LITE: ['series a', 'vc', 'tam', 'enterprise sales team']
};

const GENERIC_PHRASES = [
  'user-friendly', 'seamless', 'innovative', 'game-changer', 'leverage',
  'utilize', 'best practices', 'target audience', 'comprehensive solution',
  'pain points', 'robust'
];

const STOPWORDS = new Set([
  'about', 'after', 'again', 'with', 'this', 'that', 'from', 'they', 'them', 'then',
  'than', 'your', 'have', 'will', 'what', 'when', 'where', 'which', 'into', 'make',
  'build', 'create', 'using', 'need', 'want', 'prompt', 'generate', 'mode'
]);

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function countMatches(text, terms) {
  const lower = text.toLowerCase();
  return terms.reduce((count, term) => count + (lower.includes(term.toLowerCase()) ? 1 : 0), 0);
}

function inputTerms(input) {
  return [...new Set(String(input || '')
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{3,}/g) || [])]
    .filter((term) => !STOPWORDS.has(term))
    .slice(0, 12);
}

function purposeTerms(mode, tabId) {
  return [...new Set((getTabPurpose(mode, tabId).toLowerCase().match(/[a-z][a-z-]{4,}/g) || []))]
    .filter((term) => !STOPWORDS.has(term))
    .slice(0, 10);
}

function bar(percent) {
  const filled = clamp(percent, 0, 100) / 10;
  const blocks = Math.round(filled);
  return `${'█'.repeat(blocks)}${'░'.repeat(10 - blocks)}`;
}

function labelFor(overall) {
  if (overall >= 90) return '⭐⭐⭐⭐⭐ Excellent — Production-ready';
  if (overall >= 75) return '⭐⭐⭐⭐ Good — Ready to use with minor refinements';
  if (overall >= 60) return '⭐⭐⭐ Fair — Useful but needs sharpening';
  return '⭐⭐ Needs work — Revise before use';
}

function lowestNote(lowestMetric, mode, tabId) {
  const purpose = getTabPurpose(mode, tabId);
  const notes = {
    Completeness: `The weakest element is coverage: strengthen the tab against its exact purpose: ${purpose}`,
    Specificity: 'The weakest element is specificity: add more named details from the original input and remove generic phrasing.',
    'Mode Accuracy': `The weakest element is mode fit: remove language that does not belong to ${normalizeMode(mode)} mode.`,
    Actionability: 'The weakest element is actionability: add concrete next actions, owners, thresholds, or execution checks.',
    'Prompt Strength': 'The weakest element is prompt structure: clarify role, context, task, constraints, and output format.'
  };
  return notes[lowestMetric] || 'The weakest element needs one more pass for precision.';
}

function isPromptTab(tabId) {
  return ['final_prompt', 'master_prompt', 'multi_tool_pack', 'email_sequence'].includes(tabId);
}

export function getTabPurpose(mode, tabId) {
  const normalizedMode = normalizeMode(mode);
  return TAB_PURPOSES[normalizedMode]?.[tabId] || TAB_PURPOSES.GENERAL[tabId] || 'Mode-specific tab content.';
}

export function escapeDisplayText(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*/g, '&#42;')
    .replace(/`/g, '&#96;')
    .replace(/\|/g, '&#124;');
}

export function withInputHeader(content, input, options = {}) {
  const text = String(content || '');
  if (text.trimStart().startsWith('📝 YOUR INPUT')) return text;
  const inputText = options.escape ? escapeDisplayText(input) : String(input || '');
  return `📝 YOUR INPUT\n"${inputText}"\n\n${text}`;
}

export function buildQualityRating({ content, input, mode = 'GENERAL', tabId = 'action_brief' }) {
  const normalizedMode = normalizeMode(mode);
  const text = String(content || '');
  const lower = text.toLowerCase();
  const words = text.match(/\b[\w-]+\b/g) || [];
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  const purposeMatches = countMatches(text, purposeTerms(normalizedMode, tabId));
  const modeMatches = countMatches(text, MODE_TERMS[normalizedMode] || MODE_TERMS.GENERAL);
  const inputMatches = countMatches(text, inputTerms(input));
  const genericHits = countMatches(text, GENERIC_PHRASES);
  const crossHits = countMatches(text, CROSS_MODE_PENALTIES[normalizedMode] || []);
  const hasNumbers = /\b\d+([.,]\d+)?(%|x|k|m|ms|s|h|hr|hrs|days?|weeks?|months?|\$|₹)?\b/i.test(text);
  const hasStructure = /^#{1,3}\s|^\d+\.\s|^[-*]\s|\|.+\|/m.test(text);
  const hasActionVerbs = /\b(build|ship|test|validate|publish|deploy|write|measure|review|launch|design|create|set up|instrument|compare)\b/i.test(text);

  const completeness = clamp(35 + Math.min(30, words.length / 6) + purposeMatches * 7 + (hasStructure ? 10 : 0));
  const specificity = clamp(35 + inputMatches * 9 + (hasNumbers ? 12 : 0) + Math.min(15, uniqueWords.size / 18) - genericHits * 7);
  const modeAccuracy = clamp(55 + modeMatches * 7 + purposeMatches * 3 - crossHits * 12);
  const actionability = clamp(40 + (hasStructure ? 15 : 0) + (hasActionVerbs ? 20 : 0) + (hasNumbers ? 15 : 0) + Math.min(10, words.length / 40));

  const promptChecks = [
    /\brole\s*:/i, /\bcontext\s*:/i, /\btask\s*:/i,
    /\bconstraints?\s*:/i, /\boutput format\s*:/i, /\[(final prompt|prompt)\]/i
  ];
  const promptStrength = isPromptTab(tabId)
    ? clamp(25 + promptChecks.filter((pattern) => pattern.test(text)).length * 12 + inputMatches * 5 + (lower.includes('avoid') ? 8 : 0))
    : clamp(55 + (hasStructure ? 12 : 0) + purposeMatches * 5 + inputMatches * 3 - genericHits * 5);

  const metrics = [
    ['Completeness', completeness, 'Does this fully address the tab\'s purpose?'],
    ['Specificity', specificity, 'Is this specific to this input, or generic?'],
    ['Mode Accuracy', modeAccuracy, 'Is this truly scoped to this mode?'],
    ['Actionability', actionability, 'Can the user act on this immediately?'],
    ['Prompt Strength', promptStrength, 'How effective is the generated prompt?']
  ];

  const overall = clamp(metrics.reduce((sum, [, score]) => sum + score, 0) / metrics.length);
  const lowest = metrics.reduce((min, metric) => metric[1] < min[1] ? metric : min, metrics[0]);
  const warnings = metrics
    .filter(([, score]) => score < 70)
    .map(([name, score]) => `⚠️ Low score on ${name}: ${score}% because this output needs more ${name.toLowerCase()} for the active tab.`);

  return `━━━━━━━━━━━━━━━━━━━━━━━━
📊 OUTPUT QUALITY RATING

${metrics.map(([name, score, description]) => `${name.padEnd(16)} ${bar(score)}  ${String(score).padStart(3)}%  — ${description}`).join('\n')}

Overall          ${bar(overall)}  ${String(overall).padStart(3)}%  ${labelFor(overall)}
${warnings.length ? `\n${warnings.join('\n')}\n` : '\n'}Honest note: ${lowestNote(lowest[0], normalizedMode, tabId)}
━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export function buildTabIdentityBlock() {
  return `
TAB-SPECIFIC CONTENT RULES:
- Every tab has its own job. Do not write a general brief and reword it across tabs.
- If a sentence could appear in a different mode or tab without changing, rewrite it.
- Action Brief, Steps, Quick Wins, and Final Prompt are separate outputs, not variants.

CODING: Action Brief = technical scope; Steps = implementation sequence; Quick Wins = under-2-hour wins; Final Prompt = coding-agent prompt; Dev Brief = feature spec; Architecture = system design; Schema = data model; Endpoints = API contract; Build Order = build plan; Security Audit = vulnerability report; Deployment = CI/CD guide.
CONTENT: Action Brief = content strategy; Steps = creation workflow; Quick Wins = immediate improvements; Final Prompt = content-agent prompt; Content Brief = editorial brief; SEO = search plan; Viral Hooks = hook copy; Email Sequence = nurture series; Distribution = channel plan.
CREATIVE: Action Brief = creative vision; Steps = creative process; Quick Wins = immediate elevation; Master Prompt = extended sensory prompt; Variations = distinct interpretations; Tool Guide = tool choices; Style Library = reusable style system; Director's Notes = creative brief; Multi-Tool Pack = cross-tool prompts.
GENERAL: Action Brief = strategic summary; Steps = execution plan; Quick Wins = 24-48 hour leverage; Final Prompt = general-purpose prompt; Tools = resources; Expert Angle = non-obvious approach; Automation = workflow automation.
STARTUP: Action Brief = investor-grade summary; Steps = traction roadmap; Quick Wins = growth signals; Final Prompt = fundraising prompt; Validate = market reality; Plan = execution plan; Launch = first users; Score = viability rating; Investor Lens = VC evaluation; AI Debate = bull/bear analysis; Ship 30 Days = daily calendar; Pivot Options = alternative directions.
STARTUP_LITE: Action Brief = lean summary; Steps = fastest path; Quick Wins = zero-budget experiments; Final Prompt = experimentation prompt; Validate = riskiest assumptions; Plan = 2-week sprint; Launch = first 10 users; Score = viability rating.
`;
}
