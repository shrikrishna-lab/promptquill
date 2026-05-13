import { Capacitor } from '@capacitor/core';

export const isNativeApp = () => {
  if (typeof Capacitor.isNativePlatform === 'function') {
    return Capacitor.isNativePlatform();
  }

  return ['android', 'ios'].includes(Capacitor.getPlatform());
};

export const getPlatform = () => Capacitor.getPlatform();

export const getMobilePlatform = getPlatform;
export const isNativeMobile = isNativeApp;
export const isAndroid = () => getPlatform() === 'android';
export const isIOS = () => getPlatform() === 'ios';

export const applyMobileRuntimeClasses = () => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const platform = getPlatform();

  root.classList.add('promptquill-mobile');
  root.classList.add(`mobile-${platform}`);
  root.classList.toggle('mobile-native', isNativeApp());
  root.classList.toggle('mobile-web', !isNativeApp());
};

export const getMobileRenderProfile = () => {
  const native = isNativeApp();
  const narrow = typeof window !== 'undefined' ? window.innerWidth <= 768 : true;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return {
    antialias: !(native || narrow),
    maxPixelRatio: native ? 1.25 : Math.min(devicePixelRatio, 2),
    particles: native ? 90 : narrow ? 150 : 800,
    powerPreference: native ? 'low-power' : 'high-performance'
  };
};
