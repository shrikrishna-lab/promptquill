/**
 * Global Error Handler Middleware
 * Returns safe generic messages to client
 * Never reveals internal details, database structure, or implementation
 */

import { logger } from '../utils/logger.js'

const SAFE_ERRORS = {
  400: 'Bad request. Please check your input.',
  401: 'Please log in to continue.',
  402: 'Insufficient credits.',
  403: 'You do not have access to this feature.',
  404: 'Not found.',
  429: 'Too many requests. Please try again later.',
  500: 'Something went wrong. Please try again.'
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500

  // Log full error internally (server logs only - never exposed to client)
  if (process.env.NODE_ENV === 'production') {
    // Log to your monitoring service here (e.g., Sentry, LogRocket)
    // Example: sentry.captureException(err, { tags: { route: req.path } })
    logger.error('[ERROR]', {
      message: err.message,
      statusCode: statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    })
  } else {
    logger.error('[ERROR]', err)
  }

  // Return safe, generic message to client
  const safeMessage = SAFE_ERRORS[statusCode] || SAFE_ERRORS[500]

  res.status(statusCode).json({
    error: safeMessage
    // NEVER include: err.message, err.stack, database errors,
    // internal details, file paths, query information
  })
}

export default errorHandler
