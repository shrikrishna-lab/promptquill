/**
 * Check Daily Limit Middleware
 * Prevents free users from exceeding daily generation limit
 * Pro users have no limit
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger.js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY  // SERVICE ROLE KEY
)

export const checkDailyLimit = async (req, res, next) => {
  // Pro users have no daily limit
  if (req.user.isPro) {
    logger.debug('[checkDailyLimit] Pro user - no limit applied')
    return next()
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]
  const todayStart = `${today}T00:00:00.000Z`
  const todayEnd = `${today}T23:59:59.999Z`

  try {
    // Count today's generations from database
    const { count, error } = await supabaseAdmin
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('type', 'generation')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd)

    if (error) {
      logger.error('[checkDailyLimit] Query error:', error)
      return res.status(500).json({
        error: 'System error. Please try again.'
      })
    }

    const dailyLimit = 10  // Free users: 10 generations per day
    const used = count || 0

    if (used >= dailyLimit) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const hoursLeft = Math.ceil(
        (tomorrow - new Date()) / 3600000
      )

      logger.warn('[checkDailyLimit] Daily limit exceeded:', {
        userId: req.user.id,
        used,
        limit: dailyLimit
      })

      return res.status(429).json({
        error: 'Daily generation limit reached',
        limit: dailyLimit,
        used: used,
        resetsIn: `${hoursLeft} hours`,
        upgradeUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
      })
    }

    logger.debug('[checkDailyLimit] Within limit:', {
      userId: req.user.id,
      used,
      limit: dailyLimit,
      remaining: dailyLimit - used
    })

    next()
  } catch (err) {
    logger.error('[checkDailyLimit] Error:', err)
    return res.status(500).json({
      error: 'System error. Please try again.'
    })
  }
}

export default checkDailyLimit
