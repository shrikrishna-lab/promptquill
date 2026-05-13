import { getCredits, deductCredits, estimateCost } from './credits';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

/**
 * Generate a prompt/brief using the backend AI service
 * Handles credit deduction automatically
 */
export const generatePromptFromIdea = async (idea, category = 'e-commerce', mode = 'GENERAL') => {
  try {
    const userId = 'anonymous';
    const userCredits = await getCredits(userId);
    const estimatedCost = estimateCost(idea.length);

    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea: idea.trim(),
        category: category.toLowerCase(),
        mode: mode.toUpperCase(),
        estimatedCost: estimatedCost,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Generation failed (${response.status})`);
    }

    const data = await response.json();

    return {
      success: true,
      brief: data.brief,
      saved: data.saved,
      creditUsed: estimatedCost,
      creditsRemaining: 999,
    };
  } catch (error) {
    console.error('Prompt generation error:', error);
    return {
      success: false,
      error: 'generation_failed',
      message: error.message || 'Failed to generate prompt',
    };
  }
};

/**
 * Get generation history for current user
 */
export const getGenerationHistory = async () => {
  try {
    const response = await fetch(`${API_BASE}/prompts`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return await response.json();
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
};

/**
 * Save a generated prompt to favorites
 */
export const savePrompt = async (promptId, notes = '') => {
  try {
    const response = await fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt_id: promptId,
        notes: notes,
        is_favorite: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a saved prompt
 */
export const deletePrompt = async (promptId) => {
  try {
    const response = await fetch(`${API_BASE}/prompts/${promptId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete prompt');
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generatePromptFromIdea,
  getGenerationHistory,
  savePrompt,
  deletePrompt,
};
