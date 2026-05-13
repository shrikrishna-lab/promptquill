/**
 * Backend Authentication Middleware
 * Verifies JWT and loads user from database (source of truth)
 * NEVER trust client-provided user data
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger.js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY  // SERVICE ROLE KEY (backend only)
)

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      logger.warn('[verifyUser] Invalid or expired token')
      return res.status(401).json({
        error: 'Invalid or expired token'
      })
    }

    // Get user details from DATABASE - this is the source of truth
    const { data: userDetails, error: detailsError } = await supabaseAdmin
      .from('user_details')
      .select('plan, is_banned, total_prompts')
      .eq('user_id', user.id)
      .single()

    if (detailsError || !userDetails) {
      logger.warn('[verifyUser] User details not found:', user.id)
      return res.status(404).json({
        error: 'User details not found'
      })
    }

    // Check if banned
    if (userDetails.is_banned) {
      logger.warn('[verifyUser] Banned user attempted access:', user.id)
      return res.status(403).json({
        error: 'Account suspended'
      })
    }

    // Get credits from DATABASE
    const { data: credits, error: creditsError } = await supabaseAdmin
      .from('user_credits')
      .select('balance, last_reset')
      .eq('user_id', user.id)
      .single()

    if (creditsError) {
      logger.error('[verifyUser] Credits fetch error:', creditsError)
      return res.status(500).json({
        error: 'System error. Please try again.'
      })
    }

    // Attach to request - backend is now the source of truth
    req.user = {
      id: user.id,
      email: user.email,
      plan: userDetails.plan,  // FROM DATABASE
      credits: credits?.balance || 0,  // FROM DATABASE
      isPro: ['professional', 'premium', 'annual'].includes(
        userDetails.plan?.toLowerCase() || ''
      ),
      banned: userDetails.is_banned
    }

    logger.debug('[verifyUser] User verified:', {
      userId: user.id,
      plan: req.user.plan,
      credits: req.user.credits
    })

    next()
  } catch (err) {
    logger.error('[verifyUser] Error:', err)
    return res.status(500).json({
      error: 'Authentication failed'
    })
  }
}

export default verifyUser
