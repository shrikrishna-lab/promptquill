import { sendAttackAlert } from './adminAlerts.js';
import { getCountryFromIP } from './ipCountry.js';

// In-memory tracker: IP -> { count, windowStart, alerted }
const blockTracker = new Map();

// Cleanup hourly
setInterval(() => {
  const cutoff = Date.now() - 3600000;
  for (const [ip, data] of blockTracker.entries()) {
    if (data.windowStart < cutoff) blockTracker.delete(ip);
  }
}, 3600000);

export const trackBlockedIP = async (ip, endpoint) => {
  if (!ip) return;
  const now = Date.now();
  const t = blockTracker.get(ip) || { count: 0, windowStart: now, alerted: false };

  if (now - t.windowStart > 3600000) {
    t.count = 0;
    t.windowStart = now;
    t.alerted = false;
  }

  t.count += 1;
  blockTracker.set(ip, t);

  if (t.count >= 20 && !t.alerted) {
    t.alerted = true;
    try {
      const loc = await getCountryFromIP(ip);
      await sendAttackAlert({ ip, country: loc.full, endpoint, blockCount: t.count, banned: false });
    } catch (err) {
      console.error('Attack alert error:', err.message);
    }
  }
};
