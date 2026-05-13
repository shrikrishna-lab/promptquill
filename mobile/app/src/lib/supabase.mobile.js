import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { secureStore } from './secureStorage.mobile';
import { navigateWithinApp } from './navigation.mobile';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const MOBILE_AUTH_REDIRECT_URI =
  import.meta.env.VITE_MOBILE_AUTH_REDIRECT_URI || 'promptquill://auth/callback';

const secureStorageAdapter = {
  getItem: async (key) => {
    const value = await secureStore.get(key);
    return value ?? null;
  },
  setItem: async (key, value) => {
    await secureStore.set(key, value);
  },
  removeItem: async (key) => {
    await secureStore.remove(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
    redirectTo: MOBILE_AUTH_REDIRECT_URI,
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      Accept: 'application/json',
      'X-PromptQuill-Client': `mobile-${Capacitor.getPlatform()}`
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 8
    }
  }
});

let authListenerCleanup = null;

const routeFromAuthEvent = (event) => {
  if (event === 'PASSWORD_RECOVERY') {
    return '/forgot-password?mode=recovery';
  }

  if (event === 'SIGNED_IN') {
    return '/app/generate';
  }

  if (event === 'SIGNED_OUT') {
    return '/login';
  }

  return null;
};

export const getMobileAuthRedirectTo = () => MOBILE_AUTH_REDIRECT_URI;

export const getCurrentSession = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session ?? null;
};

export const registerMobileAuthStateListener = () => {
  if (authListenerCleanup) {
    return authListenerCleanup;
  }

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      return;
    }

    const nextRoute = routeFromAuthEvent(event);
    if (nextRoute) {
      navigateWithinApp(nextRoute, { replace: true });
    }
  });

  authListenerCleanup = () => {
    subscription.unsubscribe();
    authListenerCleanup = null;
  };

  return authListenerCleanup;
};

export const signInWithEmail = async ({ email, password }) =>
  supabase.auth.signInWithPassword({
    email,
    password
  });

export const signUpWithEmail = async ({ email, password }) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: MOBILE_AUTH_REDIRECT_URI
    }
  });

export const sendPasswordRecovery = async (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: MOBILE_AUTH_REDIRECT_URI
  });

export const updateMobilePassword = async (password) =>
  supabase.auth.updateUser({
    password
  });

export const signOutMobile = async () => supabase.auth.signOut();

export const safeSupabaseQuery = async (query, fallbackData = null) => {
  try {
    const result = await query();

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        return { data: fallbackData, error: null };
      }

      return { data: fallbackData, error: result.error };
    }

    return result;
  } catch (error) {
    return { data: fallbackData, error };
  }
};
