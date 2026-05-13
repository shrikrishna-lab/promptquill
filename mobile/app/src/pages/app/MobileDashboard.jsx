import React from 'react';
import { Coins, History, Settings, Sparkles, User } from 'lucide-react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const shellStyle = {
  minHeight: '100vh',
  background: '#0a0a0f',
  color: '#f8fafc'
};

const navItems = [
  { to: '/app/generate', label: 'Generate', icon: Sparkles },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/credits', label: 'Credits', icon: Coins },
  { to: '/app/profile', label: 'Profile', icon: User }
];

function MobileDashboard({ profile, publicProfile, session }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const title =
    location.pathname === '/app/history'
      ? 'History'
      : location.pathname === '/app/credits'
        ? 'Credits'
        : location.pathname === '/app/profile'
          ? 'Profile'
          : location.pathname === '/app/settings'
            ? 'Settings'
            : 'Generate';

  const userLabel =
    publicProfile?.username || profile?.display_name || session.user.email?.split('@')?.[0] || 'You';

  return (
    <div style={shellStyle}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '18px 18px 14px',
          background: 'rgba(10, 10, 15, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>PromptQuill</div>
          <div style={{ marginTop: '4px', color: '#a1a1aa', fontSize: '13px' }}>
            {title} for {userLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/settings')}
          aria-label="Open settings"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#12141c',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Settings size={18} />
        </button>
      </header>

      <main style={{ padding: '16px 16px 104px' }}>
        <Outlet />
      </main>

      <nav
        style={{
          position: 'fixed',
          left: '16px',
          right: '16px',
          bottom: '16px',
          zIndex: 30,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          padding: '12px',
          background: 'rgba(18, 18, 28, 0.94)',
          border: '1px solid rgba(163, 230, 53, 0.14)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(18px)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                minHeight: '60px',
                borderRadius: '18px',
                textDecoration: 'none',
                color: isActive ? '#08110a' : '#d4d4d8',
                background: isActive ? '#a3e635' : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 800
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileDashboard;
