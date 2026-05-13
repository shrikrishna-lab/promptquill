import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const BLOCKED_WEB_DOMAINS = [
  'vercel.app',
  'promptquill.com',
  'railway.app',
  'localhost:5173'
];

let reactNavigator = null;
let queuedNavigation = null;

const isAbsoluteUrl = (url) => /^(https?:\/\/|mailto:|tel:)/i.test(url);

const isInternalRoute = (url) => typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');

const normalizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.startsWith('#/')) {
    return trimmed.slice(1);
  }

  return trimmed;
};

const shouldOpenInBrowser = (url) => {
  const lowered = url.toLowerCase();

  if (BLOCKED_WEB_DOMAINS.some((domain) => lowered.includes(domain))) {
    return true;
  }

  return isAbsoluteUrl(url);
};

export const setReactNavigator = (navigate) => {
  reactNavigator = navigate;

  if (reactNavigator && queuedNavigation) {
    const pending = queuedNavigation;
    queuedNavigation = null;
    reactNavigator(pending.path, pending.options);
  }
};

export const navigateWithinApp = (path, options = { replace: false }) => {
  if (!path) return;

  if (reactNavigator) {
    reactNavigator(path, options);
    return;
  }

  queuedNavigation = { path, options };
};

export const openInSystemBrowser = async (url) => {
  if (!url) return;

  try {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
      return;
    }
  } catch (error) {
    console.warn('Failed to open system browser:', error);
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const safeNavigate = async (url, suppliedNavigate = reactNavigator) => {
  const target = normalizeUrl(url);
  if (!target) return;

  if (isInternalRoute(target)) {
    if (suppliedNavigate) {
      suppliedNavigate(target);
      return;
    }

    navigateWithinApp(target);
    return;
  }

  if (Capacitor.isNativePlatform() && shouldOpenInBrowser(target)) {
    console.warn('Blocked web redirect inside native app shell:', target);
    await openInSystemBrowser(target);
    return;
  }

  if (isAbsoluteUrl(target)) {
    await openInSystemBrowser(target);
    return;
  }

  if (suppliedNavigate) {
    suppliedNavigate(target);
    return;
  }

  navigateWithinApp(target);
};

export const installGlobalLinkInterceptor = (navigate) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const clickHandler = (event) => {
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    if (
      href.startsWith('/') ||
      href.startsWith('#/') ||
      isAbsoluteUrl(href) ||
      anchor.target === '_blank'
    ) {
      event.preventDefault();
      safeNavigate(href, navigate);
    }
  };

  document.addEventListener('click', clickHandler);

  return () => {
    document.removeEventListener('click', clickHandler);
  };
};
