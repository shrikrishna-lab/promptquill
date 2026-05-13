import type { CapacitorConfig } from '@capacitor/cli';

const liveReloadUrl = process.env.PROMPTQUILL_DEV_SERVER_URL?.trim() || '';
const liveReloadEnabled = process.env.PROMPTQUILL_LIVE_RELOAD === 'true' && liveReloadUrl.length > 0;
const baseAllowNavigation = [
  'promptquill-production.up.railway.app',
  '*.supabase.co',
  'your-project.supabase.co'
];

if (liveReloadEnabled) {
  try {
    baseAllowNavigation.push(new URL(liveReloadUrl).host);
  } catch {
    // Ignore malformed live reload URLs and fall back to the production-only allowlist.
  }
}

const server = liveReloadEnabled
  ? {
      url: liveReloadUrl,
      cleartext: true,
      androidScheme: 'http' as const,
      allowNavigation: Array.from(new Set(baseAllowNavigation))
    }
  : {
      androidScheme: 'https' as const,
      cleartext: false,
      allowNavigation: Array.from(new Set(baseAllowNavigation))
    };

const config: CapacitorConfig = {
  appId: 'com.promptquill.app',
  appName: 'PromptQuill',
  webDir: '../dist-mobile',
  bundledWebRuntime: false,
  server,
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
      overlaysWebView: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  ios: {
    scheme: 'promptquill',
    contentInset: 'automatic',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: liveReloadEnabled
  }
};

export default config;
