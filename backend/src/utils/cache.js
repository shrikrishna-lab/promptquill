/**
 * Prompt Cache System - In-memory LRU cache with TTL
 * Caches identical prompts to reduce API calls and save credits
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// CACHE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_CONFIG = {
  TTL: 2 * 60 * 60 * 1000, // 2 hours
  MAX_SIZE: 500,
  CREDIT_SAVINGS_HIT: 5, // Cache hit costs 5 credits instead of 10-15
};

// Personal info patterns to prevent caching
const PERSONAL_INFO_PATTERNS = [
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // Email
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b\d{16}\b/, // Credit card
  /\bphone|contact|mobile|cell\b/i,
  /\bname|username|user id\b/i,
  /\baddress|location|city|state|zip\b/i,
];

// ═══════════════════════════════════════════════════════════════════════════
// CACHE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class PromptCache {
  constructor() {
    /**
     * Cache structure:
     * {
     *   hash: {
     *     content: string,
     *     timestamp: number,
     *     hits: number,
     *     lastAccess: number,
     *     model: string
     *   }
     * }
     */
    this.cache = {};
    this.accessQueue = []; // For LRU tracking
    this.stats = {
      hits: 0,
      misses: 0,
      createdAt: Date.now()
    };

    // Cleanup interval (every 30 minutes)
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  /**
   * Create cache key from prompt
   */
  _generateKey(prompt, model = 'default') {
    const normalized = prompt.trim().toLowerCase();
    const hash = crypto
      .createHash('sha256')
      .update(normalized + model)
      .digest('hex');
    return hash;
  }

  /**
   * Check if prompt contains personal info
   */
  _hasPersonalInfo(prompt) {
    return PERSONAL_INFO_PATTERNS.some(pattern => pattern.test(prompt));
  }

  /**
   * Check cache for prompt
   */
  get(prompt, model = 'default') {
    // Don't cache if contains personal info
    if (this._hasPersonalInfo(prompt)) {
      return null;
    }

    const key = this._generateKey(prompt, model);
    const entry = this.cache[key];

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL) {
      delete this.cache[key];
      this.stats.misses++;
      return null;
    }

    // Cache hit
    entry.hits++;
    entry.lastAccess = Date.now();
    this.stats.hits++;
    this.accessQueue.push(key);

    return {
      content: entry.content,
      provider: entry.provider,
      outputLength: entry.outputLength
    };
  }

  /**
   * Store prompt result in cache
   */
  set(prompt, content, provider, outputLength, model = 'default') {
    // Don't cache if contains personal info
    if (this._hasPersonalInfo(prompt)) {
      return false;
    }

    const key = this._generateKey(prompt, model);

    // Check if cache is full, evict LRU if needed
    if (Object.keys(this.cache).length >= CACHE_CONFIG.MAX_SIZE) {
      this._evictLRU();
    }

    this.cache[key] = {
      content,
      provider,
      outputLength,
      timestamp: Date.now(),
      hits: 0,
      lastAccess: Date.now(),
      model
    };

    this.accessQueue.push(key);
    return true;
  }

  /**
   * Evict least recently used entry
   */
  _evictLRU() {
    // Find oldest accessed entry
    let oldestKey = null;
    let oldestTime = Infinity;

    Object.entries(this.cache).forEach(([key, entry]) => {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      delete this.cache[oldestKey];
    }
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    Object.entries(this.cache).forEach(([key, entry]) => {
      if (now - entry.timestamp > CACHE_CONFIG.TTL) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      delete this.cache[key];
    });

    // Reset access queue to prevent memory leak
    this.accessQueue = this.accessQueue.filter(key => key in this.cache);

    if (expiredKeys.length > 0) {
      console.log(`🗑️ Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
      : 0;

    const runningSeconds = (Date.now() - this.stats.createdAt) / 1000;
    const runningHours = Math.round(runningSeconds / 3600);

    return {
      size: Object.keys(this.cache).length,
      maxSize: CACHE_CONFIG.MAX_SIZE,
      percentFull: Math.round((Object.keys(this.cache).length / CACHE_CONFIG.MAX_SIZE) * 100),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      uptime: `${runningHours}h`,
      totalRequests: this.stats.hits + this.stats.misses
    };
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache = {};
    this.accessQueue = [];
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache entry details
   */
  getEntry(prompt, model = 'default') {
    const key = this._generateKey(prompt, model);
    return this.cache[key] || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

const cacheInstance = new PromptCache();

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  cacheInstance as cache,
  PromptCache,
  CACHE_CONFIG,
  CACHE_CONFIG as CREDIT_SAVINGS_HIT
};
