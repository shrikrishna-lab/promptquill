/**
 * Production-Grade Rate Limiting Middleware
 * Uses express-rate-limit for battle-tested, memory-efficient limiting
 * 
 * WHY THIS MATTERS:
 * - Prevents API abuse and DDoS attacks
 * - Protects free tier users from being exploited
 * - Saves on API provider costs (Groq, OpenRouter, etc.)
 * - Required for payment webhook security
 */

import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: 100 requests per minute per IP
 * Applies to all routes except health checks
 */
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  keyGenerator: (req, res) => req.ip, // Use IP address as key
  skip: (req, res) => {
    // Don't rate limit health checks
    return req.path === '/api/health' || req.path === '/health';
  }
});

/**
 * Strict rate limiter for AI generation: 30 requests per minute per IP
 * Applied to /api/generate and /api/ai/generate routes
 * 
 * WHY STRICTER:
 * - Each AI generation calls expensive external APIs (Groq, OpenRouter, Gemini)
 * - Cost: ~$0.01-0.50 per generation
 * - Prevents single user from burning through credits/budget
 * - Free users limited by database, paid by this IP rate limit
 */
export const aiGenerationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // Max 30 AI generations per minute per IP
  message: 'Too many generation requests. Please wait before generating again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Use authenticated user ID if available, otherwise IP
    return req.user?.id || req.ip;
  },
  skip: (req, res) => {
    // Don't rate limit admin users
    return req.user?.role === 'ADMIN';
  }
});

/**
 * Strict IP-based daily limit to prevent "Free Tier Farming"
 * Prevents users from creating multiple accounts to bypass daily limits.
 */
export const ipAbuseLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // Max 50 AI generations per IP per day (across all accounts)
  message: 'Daily global network limit exceeded. Try again tomorrow or upgrade to Pro.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip, // STRICTLY use IP, ignore user ID
  skip: (req, res) => {
    return req.user?.role === 'ADMIN';
  }
});

/**
 * Webhook rate limiter: 500 requests per minute per IP
 * Applied to payment webhooks (Razorpay, etc.)
 * 
 * WHY PERMISSIVE:
 * - Webhooks are server-to-server (not user-facing)
 * - Payment processors may retry failed webhooks
 * - High concurrency expected during sales events
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 500, // Max 500 webhook calls per minute
  message: 'Webhook rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Only limit by IP for webhooks (no auth)
    return req.ip;
  }
});

/**
 * Auth endpoint limiter: 5 requests per 15 minutes per IP
 * Applied to login/signup routes
 * 
 * WHY STRICT:
 * - Prevents brute force password guessing
 * - Protects against account enumeration attacks
 * - Standard security practice for auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // Max 5 auth attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip,
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Admin operations limiter: 100 requests per minute per admin
 * Applied to /api/admin routes
 * 
 * WHY NEEDED:
 * - Prevents accidental bulk operations
 * - Limits damage from compromised admin account
 * - Still allows normal admin workflow
 */
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Max 100 admin operations per minute
  message: 'Admin rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.user?.id || req.ip,
  skip: (req, res) => {
    // Super admin bypass (configurable via ADMIN_EMAIL env var)
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminEmails = adminEmail.split(',').map(e => e.trim());
    return req.user?.email && adminEmails.includes(req.user.email);
  }
});

export default {
  globalLimiter,
  aiGenerationLimiter,
  ipAbuseLimiter,
  webhookLimiter,
  authLimiter,
  adminLimiter
};
