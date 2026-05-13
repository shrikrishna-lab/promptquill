/**
 * Input Sanitization & Validation
 * Prevents prompt injection, token stuffing, and malicious input
 */

import { logger } from '../utils/logger.js'

/**
 * Sanitize user idea/prompt input
 * Removes null bytes, limits length, removes injection attempts
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length - prevent token stuffing
    .slice(0, 2000)
    // Remove obvious jailbreak attempts
    .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/forget\s+(all\s+)?previous\s+instructions/gi, '')
    .replace(/system\s+prompt/gi, '')
    .replace(/jailbreak/gi, '')
    .replace(/override/gi, '')
    .replace(/bypass\s+security/gi, '')
    // Trim whitespace
    .trim()
}

/**
 * Validate generation mode
 */
export const validateMode = (mode) => {
  const validModes = [
    'STARTUP', 'STARTUP_LITE',
    'CODING', 'CONTENT',
    'CREATIVE', 'DESIGN',
    'GAME', 'AI_ML',
    'GENERAL'
  ]
  
  if (!mode || !validModes.includes(mode)) {
    return 'GENERAL'
  }
  
  return mode
}

/**
 * Validate personality setting
 */
export const validatePersonality = (personality) => {
  const validPersonalities = ['machine', 'human']
  
  if (!personality || !validPersonalities.includes(personality)) {
    return 'machine'
  }
  
  return personality
}

/**
 * Validate and sanitize metadata
 */
export const sanitizeMetadata = (metadata = {}) => {
  const safe = {}
  
  if (metadata.userId) {
    // Validate UUID format (basic check)
    if (typeof metadata.userId === 'string' && 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(metadata.userId)) {
      safe.userId = metadata.userId
    }
  }
  
  if (metadata.userEmail) {
    // Basic email validation
    const email = String(metadata.userEmail).toLowerCase()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      safe.userEmail = email
    }
  }
  
  // Remove any other metadata properties for security
  return safe
}

/**
 * Validate JSON from AI provider
 */
export const validateJsonStructure = (json, mode) => {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON structure')
  }

  // Validate required fields
  const required = ['score', 'tabs', 'issues', 'suggestions']
  
  for (const field of required) {
    if (!(field in json)) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Validate score is 1-10
  if (typeof json.score !== 'number' || json.score < 1 || json.score > 10) {
    json.score = 5  // Default to middle score
  }

  // Validate tabs object
  if (typeof json.tabs !== 'object' || Array.isArray(json.tabs)) {
    throw new Error('Tabs must be an object')
  }

  // Validate issues and suggestions are arrays
  if (!Array.isArray(json.issues)) {
    json.issues = []
  }
  if (!Array.isArray(json.suggestions)) {
    json.suggestions = []
  }

  // Limit arrays to prevent memory issues
  json.issues = json.issues.slice(0, 10)
  json.suggestions = json.suggestions.slice(0, 10)

  return json
}

export const inputValidation = {
  sanitizeInput,
  validateMode,
  validatePersonality,
  sanitizeMetadata,
  validateJsonStructure
}

export default inputValidation
