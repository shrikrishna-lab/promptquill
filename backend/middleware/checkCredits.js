/**
 * Check Credits Middleware
 * Verifies user has sufficient credits before proceeding
 * Uses database values (server-verified), never trusts client
 */

import { logger } from '../utils/logger.js'

export const checkCredits = (creditCost) => {
  return async (req, res, next) => {
    // req.user.credits is set by verifyUser middleware from database
    const userCredits = req.user.credits

    if (userCredits < creditCost) {
      logger.warn('[checkCredits] Insufficient credits:', {
        userId: req.user.id,
        needed: creditCost,
        available: userCredits
      })

      return res.status(402).json({
        error: 'Insufficient credits',
        creditsNeeded: creditCost,
        creditsAvailable: userCredits,
        upgradeUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
      })
    }

    // Store cost for later deduction
    req.creditCost = creditCost

    logger.debug('[checkCredits] User has sufficient credits:', {
      userId: req.user.id,
      available: userCredits,
      cost: creditCost,
      remaining: userCredits - creditCost
    })

    next()
  }
}

export default checkCredits
