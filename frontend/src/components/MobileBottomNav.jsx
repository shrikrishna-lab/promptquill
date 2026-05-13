import React from 'react';
import { Home, User as UserIcon, Globe, Plus, LayoutGrid, Layers } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGenerateClick = () => {
    navigate('/ai');
    if (location.pathname === '/ai') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHome = location.pathname === '/ai' || location.pathname === '/';
  const isGallery = location.pathname === '/gallery';
  const isCommunity = location.pathname === '/community';
  const isProfile = location.pathname.startsWith('/settings') || location.pathname === '/history';

  // Return the new pill-style bottom nav
  return (
    <div className="mobile-bottom-nav mobile-only-nav" style={{
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
          backgroundColor: isGallery ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: isGallery ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: isGallery ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: isGallery ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <LayoutGrid size={21} strokeWidth={isGallery ? 2.5 : 2} />
      </Link>

      {/* Community */}
      <Link 
        to="/community"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: isCommunity ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: isCommunity ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: isCommunity ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: isCommunity ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Globe size={21} strokeWidth={isCommunity ? 2.5 : 2} />
      </Link>

      {/* Profile */}
      <Link 
        to="/settings"
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          backgroundColor: isProfile ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: isProfile ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
          transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
          boxShadow: isProfile ? '0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
          transform: isProfile ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <UserIcon size={21} strokeWidth={isProfile ? 2.5 : 2} />
      </Link>
      
    </div>
  );
};

export default MobileBottomNav;
