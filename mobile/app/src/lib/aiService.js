/**
 * Centralized AI Generation Service
 * 
 * Delegates all provider logic to backend
 * User experience: Just see loading + delay, no errors
 */

import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Generate brief via backend (handles all provider fallback)
 * 
 * @param {Array} messages - OpenAI format messages
 * @param {number} maxTokens - Max tokens to generate
 * @param {string} userEmail - User email for logging
 * @returns {Object} - { success, data, provider, responseTime, fallbackUsed }
 */
export const generateViaBackend = async (messages, maxTokens = 1500, userEmail = 'anonymous') => {
  try {
    console.log('[AIService] 📤 Sending generation request to backend...');
    
    const response = await fetch(`${BACKEND_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        maxTokens,
        userEmail
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AIService] ❌ Backend error:', errorData);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`[AIService] ✅ Generated via ${result.metadata.providerName} in ${result.metadata.responseTime}`);
    if (result.metadata.fallbackUsed) {
      console.log('[AIService] 🔄 (Fallback provider used)');
    }

    return {
      success: true,
      data: result.data,
      metadata: result.metadata
    };

  } catch (err) {
    console.error('[AIService] 💥 Generation failed:', err.message);
    
    // Show user-friendly error
    toast.error(`Generation delayed. Retrying... (${err.message.substring(0, 40)})`);
    
    // Auto-retry once after 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    return generateViaBackend(messages, maxTokens, userEmail);
  }
};

/**
 * Get current provider health status
 */
export const getProviderHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[AIService] Could not fetch provider health:', err.message);
    return null;
  }
};

/**
 * Get recent generation history (admin/debugging)
 */
export const getGenerationHistory = async (limit = 20) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/history?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[AIService] Could not fetch history:', err.message);
    return { total: 0, calls: [] };
  }
};

/**
 * Admin: Disable a provider
 */
export const disableProvider = async (providerId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/admin/disable-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('[AIService] Could not disable provider:', err.message);
    throw err;
  }
};

/**
 * Admin: Enable a provider
 */
export const enableProvider = async (providerId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/admin/enable-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('[AIService] Could not enable provider:', err.message);
    throw err;
  }
};

/**
 * Admin: Reset provider error counts
 */
export const resetProvider = async (providerId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/admin/reset-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('[AIService] Could not reset provider:', err.message);
    throw err;
  }
};

/**
 * Admin: Test a specific provider
 */
export const testProvider = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/admin/test-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('[AIService] Test failed:', err.message);
    throw err;
  }
};
