import React, { useCallback, useEffect, useState } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase, registerMobileAuthStateListener } from './lib/supabase.mobile';
import { registerDeepLinkHandler } from './lib/deepLink.mobile';
import { installGlobalLinkInterceptor, setReactNavigator } from './lib/navigation.mobile';
import OnboardingFlow from './pages/onboarding/OnboardingFlow.jsx';
import MobileLoginPage from './pages/auth/MobileLoginPage.jsx';
import MobileSignupPage from './pages/auth/MobileSignupPage.jsx';
import MobileForgotPassword from './pages/auth/MobileForgotPassword.jsx';
import MobileDashboard from './pages/app/MobileDashboard.jsx';
import PromptGenerationPage from './pages/app/PromptGenerationPage.jsx';
import HistoryPage from './pages/app/HistoryPage.jsx';
import CreditsPage from './pages/app/CreditsPage.jsx';
import SettingsPage from './pages/app/SettingsPage.jsx';
import ProfilePage from './pages/app/ProfilePage.jsx';

const appShellStyle = {
  minHeight: '100vh',
  background: '#0a0a0f',
  color: '#f8fafc'
};

const LoadingScreen = () => (
  <div style={{ ...appShellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 16px',
          borderRadius: '50%',
          border: '3px solid rgba(163, 230, 53, 0.12)',
          borderTopColor: '#a3e635',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>Opening PromptQuill...</p>
    </div>
  </div>
);

const RootRedirect = ({ authReady, session, initialRoute }) => {
  if (!authReady) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to="/app/generate" replace />;
  }

  return <Navigate to={initialRoute || '/login'} replace />;
};

const PublicAuthRoute = ({ authReady, session, children }) => {
  const location = useLocation();
  const allowRecovery =
    location.pathname === '/forgot-password' &&
    new URLSearchParams(location.search).get('mode') === 'recovery';

  if (!authReady) {
    return <LoadingScreen />;
  }

  if (session && !allowRecovery) {
    return <Navigate to="/app/generate" replace />;
  }

  return children;
};

const ProtectedRoute = ({ authReady, session, children }) => {
  if (!authReady) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const NavigationBindings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setReactNavigator(navigate);
    const cleanupLinks = installGlobalLinkInterceptor(navigate);

    return () => {
      cleanupLinks();
      setReactNavigator(null);
    };
  }, [navigate]);

  useEffect(() => {
    const cleanupAuth = registerMobileAuthStateListener();
    const cleanupDeepLinks = registerDeepLinkHandler();

    return () => {
      cleanupAuth?.();
      cleanupDeepLinks?.();
    };
  }, []);

  return null;
};

const MobileRoutes = ({
  authReady,
  initialRoute,
  publicProfile,
  profile,
  refreshProfiles,
  session
}) => (
  <>
    <NavigationBindings />
    <Routes>
      <Route path="/" element={<RootRedirect authReady={authReady} session={session} initialRoute={initialRoute} />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route
        path="/login"
        element={
          <PublicAuthRoute authReady={authReady} session={session}>
            <MobileLoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicAuthRoute authReady={authReady} session={session}>
            <MobileSignupPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute authReady={authReady} session={session}>
            <MobileForgotPassword />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute authReady={authReady} session={session}>
            <MobileDashboard
              session={session}
              profile={profile}
              publicProfile={publicProfile}
              refreshProfiles={refreshProfiles}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/generate" replace />} />
        <Route
          path="generate"
          element={
            <PromptGenerationPage
              session={session}
              profile={profile}
              publicProfile={publicProfile}
            />
          }
        />
        <Route path="history" element={<HistoryPage session={session} />} />
        <Route path="credits" element={<CreditsPage session={session} profile={profile} />} />
        <Route
          path="settings"
          element={
            <SettingsPage
              session={session}
              profile={profile}
              publicProfile={publicProfile}
              refreshProfiles={refreshProfiles}
            />
          }
        />
        <Route
          path="profile"
          element={
            <ProfilePage
              session={session}
              profile={profile}
              publicProfile={publicProfile}
              refreshProfiles={refreshProfiles}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={initialRoute || '/login'} replace />} />
    </Routes>
  </>
);

function MobileApp({ initialRoute = '/login' }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshProfiles = useCallback(async (activeSession) => {
    if (!activeSession?.user?.id) {
      setProfile(null);
      setPublicProfile(null);
      return;
    }

    const [{ data: privateProfile }, { data: publicProfileData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', activeSession.user.id).maybeSingle(),
      supabase.from('user_profiles').select('*').eq('user_id', activeSession.user.id).maybeSingle()
    ]);

    setProfile(privateProfile || null);
    setPublicProfile(publicProfileData || null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(currentSession || null);
      await refreshProfiles(currentSession);
      if (isMounted) {
        setAuthReady(true);
      }
    };

    bootstrapSession().catch((error) => {
      console.error('Failed to bootstrap mobile session:', error);
      if (isMounted) {
        setAuthReady(true);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession || null);
      await refreshProfiles(nextSession);
      if (isMounted) {
        setAuthReady(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfiles]);

  return (
    <div style={appShellStyle}>
      <HashRouter>
        <MobileRoutes
          authReady={authReady}
          initialRoute={initialRoute}
          profile={profile}
          publicProfile={publicProfile}
          refreshProfiles={refreshProfiles}
          session={session}
        />
      </HashRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#11131a',
            color: '#f8fafc',
            border: '1px solid rgba(163, 230, 53, 0.18)'
          }
        }}
      />
    </div>
  );
}

export default MobileApp;
