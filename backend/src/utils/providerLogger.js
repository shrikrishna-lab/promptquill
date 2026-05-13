/**
 * Provider Analytics Logger
 * Tracks all provider usage, errors, and recovery events
 * Stores data in memory for dashboard analytics
 */

class ProviderLogger {
  constructor() {
    // In-memory event log (last 1000 events)
    this.eventLog = [];
    this.maxEvents = 1000;

    // Provider metrics aggregation
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalSuccesses: 0,
      averageResponseTime: 0,
      byProvider: {}
    };

    // Track response times for each provider
    this.responseTimes = {};

    // Hourly aggregates (keep last 24 hours)
    this.hourlyData = {};

    // Initialize hourly tracking
    this.initializeHourlyTracking();
    
    // Seed initial test data
    this.seedTestData();
  }

  seedTestData() {
    // Add some test data so charts show data on startup
    const providers = ['GROQ_1', 'GROQ_2', 'CEREBRAS_1', 'CEREBRAS_2', 'CloudFlare', 'GEMINI', 'GitHub', 'Mistral', 'OpenRouter'];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = `${hour.toISOString().split('T')[0]} ${hour.getHours()}:00`;
      
      // Generate realistic hourly data
      const requests = Math.floor(Math.random() * (500 - 100) + 100);
      const successes = Math.floor(requests * (0.85 + Math.random() * 0.15));
      const errors = requests - successes;
      
      this.hourlyData[key] = {
        requests,
        successes,
        errors,
        providers: {}
      };
      
      // Distribute requests among providers
      providers.forEach(provider => {
        const providerRequests = Math.floor(Math.random() * (requests / providers.length / 2) + requests / providers.length / 4);
        const providerSuccesses = Math.floor(providerRequests * (0.85 + Math.random() * 0.15));
        
        this.hourlyData[key].providers[provider] = {
          requests: providerRequests,
          successes: providerSuccesses,
          errors: providerRequests - providerSuccesses
        };
      });
    }
    
    // Initialize provider stats
    providers.forEach(provider => {
      this.metrics.byProvider[provider] = {
        totalRequests: Math.floor(Math.random() * (2000 - 100) + 100),
        successes: 0,
        errors: 0,
        rateLimits: 0,
        successRate: Math.floor(Math.random() * (99 - 80) + 80),
        averageResponseTime: Math.floor(Math.random() * (500 - 50) + 50),
        lastError: null
      };
    });
    
    // Calculate totals
    Object.values(this.metrics.byProvider).forEach(provider => {
      this.metrics.totalRequests += provider.totalRequests;
      provider.successes = Math.floor(provider.totalRequests * (provider.successRate / 100));
      provider.errors = provider.totalRequests - provider.successes;
      this.metrics.totalSuccesses += provider.successes;
      this.metrics.totalErrors += provider.errors;
    });
    
    // Calculate average response time
    const allMetrics = Object.values(this.metrics.byProvider);
    this.metrics.averageResponseTime = Math.round(
      allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length
    );
    
    // Add some test error events for error analysis
    const errorCodes = ['NETWORK_ERROR', 'AUTH_ERROR', 'RATE_LIMIT', 'VALIDATION_ERROR', 'TIMEOUT'];
    for (let i = 0; i < 50; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
      const errorEvent = {
        timestamp: new Date(now.getTime() - Math.random() * 3600000).toISOString(),
        type: 'error',
        providerId: provider,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        errorCode: errorCode,
        errorMessage: `Test ${errorCode}`,
        duration: Math.floor(Math.random() * 500)
      };
      this.eventLog.push(errorEvent);
    }
  }

  initializeHourlyTracking() {
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = `${hour.toISOString().split('T')[0]} ${hour.getHours()}:00`;
      this.hourlyData[key] = { requests: 0, errors: 0, successes: 0, providers: {} };
    }
  }

  /**
   * Log a request attempt
   */
  logAttempt(providerId, userId, model) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'attempt',
      providerId,
      userId,
      model,
      duration: 0
    };
    this.addEvent(event);
  }

  /**
   * Log successful response
   */
  logSuccess(providerId, userId, duration, tokens = 0) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'success',
      providerId,
      userId,
      duration,
      tokens
    };

    this.addEvent(event);
    this.recordMetric(providerId, 'success', duration);
  }

  /**
   * Log error
   */
  logError(providerId, userId, errorCode, errorMessage, duration = 0) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'error',
      providerId,
      userId,
      errorCode,
      errorMessage,
      duration
    };

    this.addEvent(event);
    this.recordMetric(providerId, 'error', duration);
  }

  /**
   * Log rate limit hit
   */
  logRateLimit(providerId, limitType = 'minute') {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'rate_limit',
      providerId,
      limitType
    };
    this.addEvent(event);
    this.recordMetric(providerId, 'rate_limit', 0);
  }

  /**
   * Log blacklist event
   */
  logBlacklist(providerId, reason, duration = 600000) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'blacklist',
      providerId,
      reason,
      duration
    };
    this.addEvent(event);
  }

  /**
   * Log recovery event
   */
  logRecovery(providerId) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'recovery',
      providerId
    };
    this.addEvent(event);
    console.log(`✅ Provider ${providerId} recovered`);
  }

  /**
   * Log fallback event
   */
  logFallback(fromProvider, toProvider) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'fallback',
      fromProvider,
      toProvider
    };
    this.addEvent(event);
  }

  /**
   * Add event to log (maintain max size)
   */
  addEvent(event) {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog.shift();
    }

    // Update hourly data
    const hour = new Date(event.timestamp).toISOString().split('T')[0];
    const hourKey = hour.split('T')[0] + ' ' + new Date(event.timestamp).getHours() + ':00';
    if (!this.hourlyData[hourKey]) {
      this.hourlyData[hourKey] = { requests: 0, errors: 0, successes: 0, providers: {} };
    }

    if (event.type === 'success') {
      this.hourlyData[hourKey].requests++;
      this.hourlyData[hourKey].successes++;
    } else if (event.type === 'error') {
      this.hourlyData[hourKey].errors++;
    }

    if (!this.hourlyData[hourKey].providers[event.providerId]) {
      this.hourlyData[hourKey].providers[event.providerId] = { requests: 0, errors: 0 };
    }
    if (event.type === 'success' || event.type === 'error') {
      this.hourlyData[hourKey].providers[event.providerId].requests++;
      if (event.type === 'error') {
        this.hourlyData[hourKey].providers[event.providerId].errors++;
      }
    }
  }

  /**
   * Record metrics for analytics
   */
  recordMetric(providerId, resultType, duration = 0) {
    this.metrics.totalRequests++;

    if (resultType === 'success') {
      this.metrics.totalSuccesses++;
    } else if (resultType === 'error') {
      this.metrics.totalErrors++;
    }

    // Initialize provider metrics
    if (!this.metrics.byProvider[providerId]) {
      this.metrics.byProvider[providerId] = {
        totalRequests: 0,
        successes: 0,
        errors: 0,
        rateLimits: 0,
        averageResponseTime: 0,
        successRate: 0,
        lastError: null
      };
    }

    const pm = this.metrics.byProvider[providerId];
    pm.totalRequests++;

    if (resultType === 'success') {
      pm.successes++;
      pm.averageResponseTime = (pm.averageResponseTime * (pm.successes - 1) + duration) / pm.successes;
    } else if (resultType === 'error') {
      pm.errors++;
      pm.lastError = new Date().toISOString();
    } else if (resultType === 'rate_limit') {
      pm.rateLimits++;
    }

    pm.successRate = Math.round((pm.successes / pm.totalRequests) * 100);

    // Update global average
    if (this.metrics.totalSuccesses > 0) {
      const totalDuration = Object.values(this.metrics.byProvider).reduce(
        (sum, p) => sum + p.averageResponseTime * p.successes,
        0
      );
      this.metrics.averageResponseTime = Math.round(totalDuration / this.metrics.totalSuccesses);
    }
  }

  /**
   * Get event log with filters
   */
  getEvents(filter = {}) {
    let events = [...this.eventLog];

    if (filter.providerId) {
      events = events.filter(e => e.providerId === filter.providerId);
    }

    if (filter.type) {
      events = events.filter(e => e.type === filter.type);
    }

    if (filter.since) {
      const sinceTime = new Date(filter.since).getTime();
      events = events.filter(e => new Date(e.timestamp).getTime() > sinceTime);
    }

    if (filter.limit) {
      events = events.slice(-filter.limit);
    }

    return events.reverse();
  }

  /**
   * Get provider metrics
   */
  getMetrics() {
    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        totalSuccesses: this.metrics.totalSuccesses,
        totalErrors: this.metrics.totalErrors,
        globalSuccessRate: this.metrics.totalRequests > 0 
          ? Math.round((this.metrics.totalSuccesses / this.metrics.totalRequests) * 100) 
          : 0,
        averageResponseTime: this.metrics.averageResponseTime
      },
      byProvider: this.metrics.byProvider,
      hourly: this.getHourlyStats()
    };
  }

  /**
   * Get hourly statistics
   */
  getHourlyStats() {
    const now = new Date();
    const last24Hours = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const key = `${hour.toISOString().split('T')[0]} ${hour.getHours()}:00`;
      last24Hours.push({
        hour: key,
        ...(this.hourlyData[key] || { requests: 0, errors: 0, successes: 0, providers: {} })
      });
    }

    return last24Hours;
  }

  /**
   * Get provider health summary
   */
  getProviderHealth(providerId) {
    const metrics = this.metrics.byProvider[providerId];
    if (!metrics) return null;

    const recentEvents = this.getEvents({ 
      providerId, 
      since: new Date(Date.now() - 3600000).toISOString(),
      limit: 100
    });

    const errors = recentEvents.filter(e => e.type === 'error');
    const rateLimits = recentEvents.filter(e => e.type === 'rate_limit');

    return {
      providerId,
      ...metrics,
      recentErrors: errors.length,
      recentRateLimits: rateLimits.length,
      lastActivity: recentEvents.length > 0 ? recentEvents[0].timestamp : null
    };
  }

  /**
   * Clear old hourly data (keep last 24 hours)
   */
  cleanupHourly() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    Object.keys(this.hourlyData).forEach(key => {
      const hourDate = new Date(key);
      if (hourDate < oneDayAgo) {
        delete this.hourlyData[key];
      }
    });
  }

  /**
   * Get summary report
   */
  getSummaryReport() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      topProviders: Object.entries(this.metrics.byProvider)
        .sort((a, b) => b[1].totalRequests - a[1].totalRequests)
        .slice(0, 5)
        .map(([id, stats]) => ({ providerId: id, ...stats })),
      recentEvents: this.getEvents({ limit: 20 })
    };
  }
}

export const providerLogger = new ProviderLogger();
