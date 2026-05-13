export const SAFETY_GATE_MESSAGE = "\u26A0\uFE0F This input can't be processed.\n\nPromptQuill is built for ethical, high-quality prompt engineering. Your request contains content outside what we support.\n\nPlease revise your input or contact support if you think this is an error.";

const MAX_SAFETY_SCAN_CHARS = 20000;

const SAFETY_PATTERNS = [
  /\b(kill|murder|assassinate|shoot|stab|bomb|beat up|attack|threaten|hurt|harm)\b.{0,80}\b(person|people|someone|group|crowd|classmate|teacher|boss|ex|coworker|family|him|her|them)\b/i,
  /\b(person|people|someone|group|crowd|classmate|teacher|boss|ex|coworker|family|him|her|them)\b.{0,80}\b(kill|murder|assassinate|shoot|stab|bomb|beat up|attack|threaten|hurt|harm)\b/i,
  /\b(porn|sexually explicit|explicit sex|nude|nudes|erotic|fetish|xxx|nsfw|sext|blowjob|handjob|rape fantasy)\b/i,
  /\b(minor|child|teen|underage|kid|schoolgirl|schoolboy)\b.{0,80}\b(sex|nude|explicit|seduce|erotic|porn|fetish)\b/i,
  /\b(phishing|scam|defraud|fake invoice|steal credentials|credit card fraud|bypass kyc|social engineering attack|romance scam|identity theft)\b/i,
  /\b(hack into|break into|unauthorized access|steal credentials|credential stuffing|bypass login|malware|ransomware|keylogger|botnet|ddos|write an exploit|exploit payload|sql injection payload|xss payload)\b/i,
  /\b(make|build|manufacture|buy|acquire|obtain|synthesize|cook)\b.{0,80}\b(bomb|explosive|gun|firearm|weapon|meth|cocaine|fentanyl|heroin|illegal drugs?)\b/i,
  /\b(exterminate|eliminate|subhuman|inferior race|racially inferior|dehumanize)\b.{0,80}\b(group|race|religion|ethnicity|women|men|immigrants|jews|muslims|christians|hindus|dalits|black people|white people)\b/i,
  /\b(jailbreak|bypass safety|bypass guardrails|ignore policy|ignore safety|disable guardrails|dan prompt|unfiltered model|evade moderation)\b/i,
  /\b(guaranteed cure|prescribe me|diagnose me|legal advice as a fact|financial advice as a fact|guaranteed returns|insider trading|evade taxes|launder money)\b/i,
  /\b(impersonate|pretend to be|pose as)\b.{0,120}\b(to trick|to fool|to deceive|for fraud|for a scam|without consent)\b/i,
  /\b(avoid detection|evade ban|bypass paywall|fake reviews|mass spam|violate terms of service|break terms of service)\b/i,
];

export function safetyInputToText(input) {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) return input.map(safetyInputToText).join('\n');

  if (typeof input === 'object') {
    try {
      return JSON.stringify(input);
    } catch {
      return String(input);
    }
  }

  return String(input);
}

export function checkSafetyGate(input) {
  const text = safetyInputToText(input).slice(0, MAX_SAFETY_SCAN_CHARS);
  if (!text.trim()) {
    return { blocked: false, message: null };
  }

  const blocked = SAFETY_PATTERNS.some((pattern) => pattern.test(text));
  return {
    blocked,
    message: blocked ? SAFETY_GATE_MESSAGE : null,
  };
}

export function createSafetyGateResponse(extra = {}) {
  return {
    success: false,
    error: SAFETY_GATE_MESSAGE,
    errorType: 'safety_gate',
    type: 'safety_gate',
    data: null,
    metadata: {
      errorTime: new Date().toISOString(),
      creditsUsed: 0,
      ...(extra.metadata || {}),
    },
    ...extra,
  };
}

export default checkSafetyGate;
