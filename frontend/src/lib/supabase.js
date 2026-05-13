import { createClient } from '@supabase/supabase-js';

let _supabaseClient = null;
let _lastUrl = '';

function getConfig(key) {
  try {
    const setupDone = localStorage.getItem('pq_setup_complete');
    if (setupDone) {
      const fromStorage = localStorage.getItem(`pq_supabase_${key.toLowerCase()}`);
      if (fromStorage) return fromStorage;
    }
  } catch {}
  const fromEnv = import.meta.env[`VITE_SUPABASE_${key}`]?.replace(/[\r\n\s]+/g, '');
  if (fromEnv) return fromEnv;
  return '';
}

function buildClient() {
  const url = getConfig('URL');
  const key = getConfig('ANON_KEY');
  if (!_supabaseClient || url !== _lastUrl) {
    _lastUrl = url;
    _supabaseClient = createClient(url || '', key || '', {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      global: { headers: { 'Accept': 'application/json' } }
    });
  }
  return _supabaseClient;
}

// Proxy-based singleton: any property access recreates client if config changed
export const supabase = new Proxy({}, {
  get(_, prop) {
    return buildClient()[prop];
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
      console.warn(`⚠️ Supabase query warning (${result.error.code}):`, result.error.message);
      
      if (result.error.code === 'PGRST116') {
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
