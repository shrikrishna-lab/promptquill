/**
 * Backend Logger Utility
 * Only logs in development mode
 * In production, logs should go to a monitoring service
 */

const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  log: (...args) => {
    if (isDev) console.log('[LOG]', ...args)
  },
  error: (...args) => {
    if (isDev) {
      console.error('[ERROR]', ...args)
    } else {
      // In production: log to monitoring service (Sentry, etc.)
      // Example: sentry.captureException(args[0])
    }
  },
  warn: (...args) => {
    if (isDev) console.warn('[WARN]', ...args)
  },
  debug: (...args) => {
    if (isDev) console.debug('[DEBUG]', ...args)
  },
  info: (...args) => {
    if (isDev) console.info('[INFO]', ...args)
  }
}

export default logger
