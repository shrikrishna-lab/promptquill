/**
 * Validation utilities for Admin Panel operations
 * Ensures data integrity and security
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim() || '');
};

/**
 * Sanitize email (trim whitespace)
 * @param {string} email - Raw email input
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

/**
 * Validate and sanitize email in one step
 * @param {string} email - Raw email input
 * @returns {object} - { valid: boolean, email: string, error: string }
 */
export const validateEmail = (email) => {
  const sanitized = sanitizeEmail(email);
  
  if (!sanitized) {
    return { valid: false, email: '', error: 'Email is required' };
  }
  
  if (!isValidEmail(sanitized)) {
    return { valid: false, email: sanitized, error: 'Invalid email format' };
  }
  
  if (sanitized.length > 255) {
    return { valid: false, email: sanitized, error: 'Email too long (max 255 characters)' };
  }
  
  return { valid: true, email: sanitized, error: null };
};

/**
 * Validate credit amount
 * @param {number} amount - Amount to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateCreditAmount = (amount) => {
  const num = parseInt(amount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a number' };
  }
  
  if (num === 0) {
    return { valid: false, error: 'Amount must be non-zero' };
  }
  
  if (Math.abs(num) > 100000) {
    return { valid: false, error: 'Amount cannot exceed ±100,000' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate promo code format
 * @param {string} code - Code to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validatePromoCode = (code) => {
  const sanitized = (code || '').trim().toUpperCase();
  
  if (!sanitized) {
    return { valid: false, error: 'Code is required' };
  }
  
  if (!/^[A-Z0-9_-]{3,20}$/.test(sanitized)) {
    return { valid: false, error: 'Code must be 3-20 alphanumeric characters (A-Z, 0-9, -, _)' };
  }
  
  return { valid: true, code: sanitized, error: null };
};

/**
 * Validate discount percentage
 * @param {number} discount - Discount to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateDiscount = (discount) => {
  const num = parseInt(discount);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Discount must be a number' };
  }
  
  if (num < 0 || num > 100) {
    return { valid: false, error: 'Discount must be between 0-100%' };
  }
  
  return { valid: true, error: null };
};

/**
 * Sanitize text for markdown (prevent injection)
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeMarkdown = (text) => {
  if (!text) return '';
  // Remove potentially dangerous characters but allow markdown
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

export default {
  isValidEmail,
  sanitizeEmail,
  validateEmail,
  validateCreditAmount,
  validatePromoCode,
  validateDiscount,
  sanitizeMarkdown
};
