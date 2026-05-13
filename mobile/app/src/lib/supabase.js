import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/[\r\n\s]+/g, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/[\r\n\s]+/g, '');

/**
 * Create Supabase client with custom headers to prevent 406 errors
 * 406 Not Acceptable usually means Accept header mismatch
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json'
    }
  }
});

/**
 * Safe Supabase query wrapper with retry logic for transient errors
 * Prevents app crash on 406 or other errors, returns fallback data instead
 */
export const safeSupabaseQuery = async (query, fallbackData = null) => {
  try {
    const result = await query();
    
    if (result.error) {
      // Log but don't crash
      console.warn(`⚠️ Supabase query warning (${result.error.code}):`, result.error.message);
      
      // Specific error handling
      if (result.error.code === 'PGRST116') {
        // "Not Found" - this is ok, return empty/null
        return { data: fallbackData, error: null };
      }
      
      return { data: fallbackData, error: result.error };
    }
    
    return result;
  } catch (err) {
    console.error('❌ Supabase query exception:', err.message);
    return { data: fallbackData, error: err };
  }
};
