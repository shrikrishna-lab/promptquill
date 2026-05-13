/**
 * Debug logging utility for tracking AI generation and system operations
 */

const DEBUG_LOGS = [];
const MAX_LOGS = 1000; // Keep last 1000 logs in memory

/**
 * Add a debug log entry
 * @param {string} category - Log category (e.g., 'AI_GENERATION', 'API_CALL', 'ERROR')
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
export const addDebugLog = (category, message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    category,
    message,
    data,
    id: DEBUG_LOGS.length
  };

  DEBUG_LOGS.push(logEntry);

  // Keep only the last MAX_LOGS entries to prevent memory overflow
  if (DEBUG_LOGS.length > MAX_LOGS) {
    DEBUG_LOGS.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${category}] ${message}`, data);
  }

  return logEntry;
};

/**
 * Get all debug logs
 * @param {string} category - Optional: filter by category
 * @returns {array} Array of log entries
 */
export const getDebugLogs = (category = null) => {
  if (!category) return DEBUG_LOGS;
  return DEBUG_LOGS.filter(log => log.category === category);
};

/**
 * Clear all debug logs
 */
export const clearDebugLogs = () => {
  DEBUG_LOGS.length = 0;
};

/**
 * Export debug logs as JSON
 * @returns {string} JSON string of all logs
 */
export const exportDebugLogs = () => {
  return JSON.stringify(DEBUG_LOGS, null, 2);
};

/**
 * Get stats about debug logs
 * @returns {object} Statistics about collected logs
 */
export const getDebugStats = () => {
  const stats = {};
  DEBUG_LOGS.forEach(log => {
    if (!stats[log.category]) {
      stats[log.category] = 0;
    }
    stats[log.category]++;
  });
  return {
    totalLogs: DEBUG_LOGS.length,
    categories: stats,
    oldestLog: DEBUG_LOGS.length > 0 ? DEBUG_LOGS[0].timestamp : null,
    newestLog: DEBUG_LOGS.length > 0 ? DEBUG_LOGS[DEBUG_LOGS.length - 1].timestamp : null
  };
};
