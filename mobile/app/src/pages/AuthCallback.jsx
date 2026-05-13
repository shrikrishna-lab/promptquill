import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.mobile';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error during auth callback:', error.message);
        navigate('/');
      } else {
        navigate('/ai');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#080808', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid rgba(163, 230, 53, 0.1)', 
        borderTopColor: '#a3e635', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Finalizing Secure Login...</h2>
      <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>Redirecting you to your dashboard</p>
    </div>
  );
};

export default AuthCallback;
