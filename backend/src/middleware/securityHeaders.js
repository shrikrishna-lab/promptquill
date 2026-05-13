/**
 * Security Headers Configuration (Helmet.js)
 * 
 * WHY THIS MATTERS:
 * - Prevents XSS (Cross-Site Scripting) attacks
 * - Blocks clickjacking attacks
 * - Prevents MIME type sniffing
 * - Enforces HTTPS connections
 * - Controls browser caching of sensitive data
 */

import helmet from 'helmet';

/**
 * Production-grade security headers configuration
 * 
 * Includes:
 * - Content Security Policy (CSP) - blocks inline scripts
 * - X-Frame-Options - prevents clickjacking
 * - X-Content-Type-Options - prevents MIME sniffing
 * - Strict-Transport-Security - forces HTTPS
 * - Referrer-Policy - controls information leakage
 * - Permissions-Policy - controls browser features
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if needed
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https:', 'wss:'], // Allow WebSocket connections
      frameSrc: ["'none'"], // Prevent embedding in frames
      objectSrc: ["'none'"], // No plugins
      mediaSrc: ["'self'"],
      childSrc: ["'none'"],
      formAction: ["'self'"], // Only submit forms to same origin
      frameAncestors: ["'none'"], // Cannot be in iframe
      baseUri: ["'self'"], // Prevent base tag injection
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [] // Redirect HTTP to HTTPS
    }
  },

  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },

  // Referrer Policy - control information leakage
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // Permissions Policy - control browser features
  permissionsPolicy: {
    features: {
      microphone: ["()"],
      camera: ["()"],
      geolocation: ["()"],
      magnetometer: ["()"],
      gyroscope: ["()"],
      accelerometer: ["()"],
      usb: ["()"],
      payment: ["()"]
    }
  },

  // Remove X-Powered-By header
  xPoweredBy: true,

  // Cross-Origin-Embedder-Policy
  crossOriginEmbedderPolicy: true,

  // Cross-Origin-Opener-Policy
  crossOriginOpenerPolicy: true,

  // Cross-Origin-Resource-Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  }
});

export default { securityHeaders };
