import { supabase } from './supabase.mobile';
import { getCredits, deductCredits, estimateCost } from './credits';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

/**
 * Generate a prompt/brief using the backend AI service
 * Handles credit deduction automatically
 */
export const generatePromptFromIdea = async (idea, category = 'e-commerce', mode = 'GENERAL') => {
  try {
    // Get authenticated session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('You must be logged in to generate a prompt');
    }

    const userId = session.user.id;

    // Check credits BEFORE generation
    const userCredits = await getCredits(userId);
    const estimatedCost = estimateCost(idea.length);

    console.log(`📊 User Credits: ${userCredits.balance}, Estimated Cost: ${estimatedCost}`);

    if (userCredits.balance <= 0) {
      return {
        success: false,
        error: 'insufficient_credits',
        message: 'You have no credits remaining. Please upgrade or purchase credits.',
      };
    }

    if (userCredits.balance < estimatedCost) {
      return {
        success: false,
        error: 'insufficient_credits',
        message: `Insufficient credits. You have ${userCredits.balance} but need ${estimatedCost}. Please purchase more.`,
        balance: userCredits.balance,
        required: estimatedCost,
      };
    }

    // Get the user's JWT token
    const { data: { session: freshSession }, error: freshError } = await supabase.auth.refreshSession();
    if (freshError || !freshSession) {
      throw new Error('Authentication token expired');
    }

    const token = freshSession.access_token;

    // Call backend API
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
      
      // Handle insufficient credits from backend (402 Payment Required)
      if (response.status === 402 || errorData.error === 'insufficient_credits') {
        return {
          success: false,
          error: 'insufficient_credits',
          message: errorData.message || 'Insufficient credits',
          balance: errorData.balance,
          required: errorData.required,
          isPro: userCredits.is_pro,
        };
      }
      
      throw new Error(errorData.error || `Generation failed (${response.status})`);
    }

    const data = await response.json();

    // Deduct credits AFTER successful generation
    const deductResult = await deductCredits(userId, estimatedCost, 'generation', `Generated brief for: ${idea.substring(0, 50)}`);

    if (!deductResult.success) {
      console.warn('Credit deduction warning:', deductResult.message);
    }

    return {
      success: true,
      brief: data.brief,
      saved: data.saved,
      creditUsed: estimatedCost,
      creditsRemaining: deductResult.remaining || userCredits.balance - estimatedCost,
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    const token = session.access_token;

    const response = await fetch(`${API_BASE}/prompts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    const token = session.access_token;

    const response = await fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    const token = session.access_token;

    const response = await fetch(`${API_BASE}/prompts/${promptId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
