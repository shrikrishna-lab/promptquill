/**
 * Admin Guard Middleware
 * Ensures only admins can access protected routes
 * Uses database (source of truth), never trusts client claims
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger.js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

export const adminGuard = async (req, res, next) => {
  try {
    // User must be verified first (via verifyUser middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }

    // Check admin status from database
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('user_id', req.user.id)
      .single()

    if (error || !data) {
      logger.warn('[adminGuard] Non-admin access attempt:', {
        userId: req.user.id,
        email: req.user.email
      })

      return res.status(403).json({
        error: 'Access denied'
      })
    }

    // Attach admin role to request
    req.adminRole = data.role

    logger.debug('[adminGuard] Admin access granted:', {
      userId: req.user.id,
      role: data.role
    })

    next()
  } catch (err) {
    logger.error('[adminGuard] Error:', err)
    return res.status(500).json({
      error: 'Authorization check failed'
    })
  }
}

export default adminGuard
