import React from 'react';
import { Layers, LayoutGrid, Globe, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MobileBottomNav = ({ profile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/ai');
    if (location.pathname === '/ai') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHome = location.pathname === '/ai' || location.pathname === '/';

  return (
    <div className="mobile-only-input" style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(255, 255, 255, 0.01)',
      backgroundImage: `
        radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%),
        linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)
      `,
      backdropFilter: 'blur(12px) saturate(200%) brightness(1.05)',
      WebkitBackdropFilter: 'blur(12px) saturate(200%) brightness(1.05)',
      padding: '8px 12px',
      borderRadius: '100px',
      boxShadow: `
        0 20px 40px -10px rgba(0, 0, 0, 0.5), 
        inset 0 1px 1px rgba(255,255,255,0.2),
        0 0 0 0.5px rgba(255,255,255,0.15)
      `,
      zIndex: 9999,
      border: 'none',
      width: 'max-content',
      height: '62px'
    }}>
      
      {/* Dashboard */}
      <Link 
        to="/ai"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: isHome ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: isHome ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: isHome ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: isHome ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Layers size={21} strokeWidth={isHome ? 2.5 : 2} />
      </Link>

      {/* Gallery */}
      <Link 
        to="/gallery"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: location.pathname === '/gallery' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: location.pathname === '/gallery' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: location.pathname === '/gallery' ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: location.pathname === '/gallery' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <LayoutGrid size={21} strokeWidth={location.pathname === '/gallery' ? 2.5 : 2} />
      </Link>

      {/* Community */}
      <Link 
        to="/community"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: location.pathname === '/community' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: location.pathname === '/community' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: location.pathname === '/community' ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: location.pathname === '/community' ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Globe size={21} strokeWidth={location.pathname === '/community' ? 2.5 : 2} />
      </Link>

      {/* Profile */}
      <div 
        onClick={() => navigate('/settings')}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: location.pathname.startsWith('/settings') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: location.pathname.startsWith('/settings') ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: location.pathname.startsWith('/settings') ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: location.pathname.startsWith('/settings') ? 'scale(1.05)' : 'scale(1)',
          cursor: 'pointer'
        }}
      >
        <UserIcon size={21} strokeWidth={location.pathname.startsWith('/settings') ? 2.5 : 2} />
      </div>
      
    </div>
  );
};

export default MobileBottomNav;
