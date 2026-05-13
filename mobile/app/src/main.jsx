import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './styles/mobile-overrides.css';
import MobileApp from './MobileApp.jsx';
import { hardenProduction } from './utils/securityHarden';
import { applyMobileRuntimeClasses, isNativeApp } from './lib/platform.mobile';
import { secureStore } from './lib/secureStorage.mobile';
import { supabase } from './lib/supabase.mobile';

const rootElement = document.getElementById('root');

hardenProduction();
applyMobileRuntimeClasses();

const DownloadScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      color: '#f8fafc',
      padding: '32px'
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        padding: '32px 28px',
        borderRadius: '24px',
        background: 'rgba(18, 18, 28, 0.92)',
        border: '1px solid rgba(163, 230, 53, 0.18)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          margin: '0 auto 18px',
          background: 'linear-gradient(135deg, #a3e635 0%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#05070d',
          fontSize: '28px',
          fontWeight: 900
        }}
      >
        P
      </div>
      <h1 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: 900 }}>PromptQuill</h1>
      <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.6 }}>
        This build is reserved for the native mobile app. Install PromptQuill on Android or iPhone
        to continue.
      </p>
    </div>
  </div>
);

const renderApp = (app) => {
  if (!rootElement) {
    throw new Error('Root element not found.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <HelmetProvider>{app}</HelmetProvider>
    </StrictMode>
  );
};

const resolveInitialRoute = async () => {
  const onboardingComplete = await secureStore.get('onboarding_complete');

  if (onboardingComplete !== 'true') {
    return '/onboarding';
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return '/login';
  }

  return '/app/generate';
};

const bootstrap = async () => {
  if (!isNativeApp()) {
    renderApp(<DownloadScreen />);
    return;
  }

  const initialRoute = await resolveInitialRoute();
  renderApp(<MobileApp initialRoute={initialRoute} />);
};

bootstrap().catch((error) => {
  console.error('PromptQuill mobile bootstrap failed:', error);

  if (!rootElement) {
    return;
  }

  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;color:#f8fafc;padding:24px;">
      <div style="max-width:420px;text-align:center;">
        <h2 style="margin-bottom:12px;color:#ef4444;">Mobile App Failed To Start</h2>
        <p style="margin:0;color:#a1a1aa;line-height:1.6;">${error.message}</p>
      </div>
    </div>
  `;
});
