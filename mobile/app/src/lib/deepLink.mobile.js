import { App as CapacitorApp } from '@capacitor/app';
import { navigateWithinApp } from './navigation.mobile';
import { MOBILE_AUTH_REDIRECT_URI, supabase } from './supabase.mobile';

let listenerHandle = null;

const parseDeepLinkParams = (url) => {
  const parsed = new URL(url);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#\/?/, ''));
  const read = (key) => parsed.searchParams.get(key) || hashParams.get(key);

  return {
    code: read('code'),
    accessToken: read('access_token'),
    refreshToken: read('refresh_token'),
    tokenHash: read('token_hash'),
    type: read('type'),
    error: read('error') || read('error_description'),
    errorDescription: read('error_description') || read('message')
  };
};

const nextRouteForType = (type) =>
  type === 'recovery' ? '/forgot-password?mode=recovery' : '/app/generate';

export const handleMobileAuthDeepLink = async (url) => {
  const { code, accessToken, refreshToken, tokenHash, type, error, errorDescription } =
    parseDeepLinkParams(url);

  if (error) {
    navigateWithinApp('/login?error=auth_callback', { replace: true });
    throw new Error(errorDescription || error);
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    navigateWithinApp(nextRouteForType(type), { replace: true });
    return;
  }

  if (tokenHash) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type || 'magiclink'
    });
    navigateWithinApp(nextRouteForType(type), { replace: true });
    return;
  }

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    navigateWithinApp(nextRouteForType(type), { replace: true });
    return;
  }

  throw new Error('Unsupported auth callback payload.');
};

export const registerDeepLinkHandler = () => {
  if (listenerHandle) {
    return async () => {
      await listenerHandle?.remove?.();
      listenerHandle = null;
    };
  }

  const handlePromise = Promise.resolve(
    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url?.startsWith(MOBILE_AUTH_REDIRECT_URI)) {
        return;
      }

      try {
        await handleMobileAuthDeepLink(url);
      } catch (error) {
        console.error('Failed to process auth deep link:', error);
        navigateWithinApp('/login?error=auth_callback', { replace: true });
      }
    })
  );

  listenerHandle = handlePromise;

  return async () => {
    const resolvedHandle = await handlePromise;
    await resolvedHandle?.remove?.();
    listenerHandle = null;
  };
};
