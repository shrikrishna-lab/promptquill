import React, { useState, useEffect } from 'react';
import { getMobileAuthRedirectTo, supabase } from '../lib/supabase.mobile';
import { X, Mail, Lock, EyeOff, ShieldCheck } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getMobileAuthRedirectTo()
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* DESKTOP AUTH UI */}
      {!isMobile && (
        <div className="desktop-auth-ui" style={{ width: '400px', maxWidth: '90vw', backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '16px', padding: '32px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: '#888', cursor: 'pointer', background: 'none', border: 'none' }}>
            <X size={20} />
          </button>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '24px', textAlign: 'center' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#222', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setIsLogin(true)}
              style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: '600', borderRadius: '6px', background: isLogin ? '#333' : 'transparent', color: isLogin ? '#fff' : '#888', transition: '0.2s', border: 'none', cursor: 'pointer' }}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              style={{ flex: 1, padding: '8px', fontSize: '13px', fontWeight: '600', borderRadius: '6px', background: !isLogin ? '#333' : 'transparent', color: !isLogin ? '#fff' : '#888', transition: '0.2s', border: 'none', cursor: 'pointer' }}
            >
              Sign Up
            </button>
          </div>

          {error && <div style={{ fontSize: '13px', color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '8px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', fontSize: '14px' }}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '12px 16px', borderRadius: '8px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', fontSize: '14px' }}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '12px', borderRadius: '8px', background: 'linear-gradient(to right, #6d28d9, #1a0533)', color: '#fff', fontSize: '14px', fontWeight: '700', marginTop: '8px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
            <span style={{ color: '#555', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }} />
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#fff', color: '#000', fontSize: '14px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
            Continue with Google
          </button>

          <p style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' }}>
            By continuing, you agree to our{' '}
            <a href="#/terms" target="_blank" style={{ color: '#888', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#/privacy" target="_blank" style={{ color: '#888', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      )}

      {/* MOBILE AUTH UI (Exact Screenshot Match) */}
      {isMobile && (
        <div className="mobile-auth-ui" style={{ width: '100%', height: '100%', backgroundColor: '#050505', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          
          {/* Floating Emojis & Background glow */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Top Right Close Button */}
            <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '20px', zIndex: 50, color: '#fff', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <X size={20} />
            </button>

            {/* Central Curved Glow */}
            <div style={{ position: 'absolute', top: '15%', width: '150%', height: '200px', background: 'radial-gradient(ellipse at center, rgba(163, 230, 53, 0.4) 0%, rgba(139, 92, 246, 0.4) 30%, transparent 70%)', filter: 'blur(40px)', opacity: 0.8, borderRadius: '50%', transform: 'scaleY(0.4)' }}></div>

            {/* Floating Orbs/Emojis */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '50px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))', transform: 'rotate(-10deg)' }}>🤖</div>
            <div style={{ position: 'absolute', top: '5%', right: '35%', fontSize: '45px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🧠</div>
            <div style={{ position: 'absolute', top: '20%', right: '5%', fontSize: '55px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))', transform: 'rotate(15deg)' }}>💡</div>
            <div style={{ position: 'absolute', top: '35%', left: '10%', fontSize: '60px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🟣</div>
            <div style={{ position: 'absolute', top: '40%', right: '10%', fontSize: '50px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>⭐</div>
            
            <div style={{ position: 'absolute', top: '30%', left: '5%', background: '#a3e635', color: '#000', padding: '8px 12px', borderRadius: '16px 16px 16px 0', fontWeight: '800', fontSize: '11px', transform: 'rotate(-5deg)', boxShadow: '0 5px 15px rgba(163,230,53,0.3)' }}>
              Ideas loading... <span style={{ opacity: 0.5 }}>●●●</span>
            </div>

            {/* Logo & Text */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', letterSpacing: '-1.5px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                Prompt<span style={{ color: '#a3e635' }}>Quill</span> <span style={{ fontSize: '28px' }}>🌿</span>
              </h1>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>Hello there! 👋</h2>
              <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 24px 0', maxWidth: '240px', lineHeight: '1.4' }}>Let's turn your ideas into amazing prompts ✨</p>
              
              {/* Social Proof Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px 6px 6px', borderRadius: '99px' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#a3e635', border: '2px solid #050505', marginLeft: '0' }}></div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5cf6', border: '2px solid #050505', marginLeft: '-8px' }}></div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #050505', marginLeft: '-8px' }}></div>
                </div>
                <span style={{ fontSize: '10px', color: '#ccc', fontWeight: '600' }}>Loved by 50K+ creators</span>
              </div>
            </div>
          </div>

          {/* Bottom Login Sheet */}
          <div style={{ backgroundColor: '#111', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 20 }}>
            
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{ position: 'relative', width: '100%', padding: '14px', borderRadius: '99px', background: '#fff', color: '#000', fontSize: '14px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginBottom: '12px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"/></svg>
              Continue with Google
              <span style={{ position: 'absolute', right: '16px', fontSize: '18px' }}>⭐</span>
              <svg style={{ position: 'absolute', right: '-15px', top: '-15px', width: '40px', height: '40px', overflow: 'visible', stroke: '#ec4899', fill: 'none', strokeWidth: '2', strokeLinecap: 'round' }} viewBox="0 0 100 100">
                 <path d="M 90 10 Q 50 10 40 40 T 70 80 L 60 90 M 70 80 L 85 75" />
              </svg>
            </button>

            <button 
              disabled={true}
              style={{ width: '100%', padding: '14px', borderRadius: '99px', background: '#000', border: '1px solid #333', color: '#fff', fontSize: '14px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', cursor: 'not-allowed' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.82 3.59-.8 1.83.05 3.3.94 4.1 2.34-3.32 1.93-2.69 6.22.61 7.42-.78 1.82-1.9 3.65-3.38 3.21zM12.03 7.25c-.15-3.22 2.8-5.72 5.56-5.25.32 3.42-3.1 6.07-5.56 5.25z"/></svg>
              Continue with Apple
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
              <span style={{ padding: '0 10px', color: '#666', fontSize: '11px', fontWeight: '600' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
            </div>

            <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: '99px', padding: '4px', marginBottom: '16px', border: '1px solid #333', position: 'relative' }}>
               {isLogin && <span style={{ position: 'absolute', left: '-10px', top: '-10px', fontSize: '16px', color: '#a3e635' }}>✨</span>}
               <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '10px', borderRadius: '99px', background: isLogin ? '#222' : 'transparent', border: isLogin ? '1px solid #a3e635' : '1px solid transparent', fontWeight: 700, color: isLogin ? '#a3e635' : '#666', fontSize: '13px' }}>Login</button>
               <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', borderRadius: '99px', background: !isLogin ? '#222' : 'transparent', border: !isLogin ? '1px solid #a3e635' : '1px solid transparent', fontWeight: 700, color: !isLogin ? '#a3e635' : '#666', fontSize: '13px' }}>Register</button>
            </div>
            
            {error && <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#666" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '16px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '14px' }} />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>👻</span>
               </div>
               
               <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#666" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '16px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '14px' }} />
                  <EyeOff size={16} color="#666" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                  <a href="#" style={{ color: '#a3e635', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>Forgot password?</a>
               </div>

               <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(90deg, #8b5cf6, #a3e635)', color: '#fff', fontWeight: 800, border: 'none', marginTop: '8px', fontSize: '14px', position: 'relative' }}>
                  {loading ? 'Wait...' : (isLogin ? 'Continue with Email' : 'Create Account')}
                  <svg style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', overflow: 'visible', stroke: 'rgba(255,255,255,0.7)', fill: 'none', strokeWidth: '2', strokeLinecap: 'round' }} viewBox="0 0 100 100">
                     <path d="M 20 50 Q 50 80 80 50 M 80 50 L 70 40 M 80 50 L 70 60" />
                  </svg>
               </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#a3e635" />
                <div style={{ color: '#666', fontSize: '10px', fontWeight: '600', lineHeight: '1.4' }}>
                  Safe & secure.<br/>We respect your privacy.
                </div>
              </div>
              
              <svg style={{ position: 'absolute', right: '40px', bottom: '10px', width: '100px', height: '20px', overflow: 'visible', stroke: '#333', fill: 'none', strokeWidth: '1.5', strokeDasharray: '4 4' }} viewBox="0 0 100 20">
                 <path d="M 0 10 Q 50 20 100 5" />
              </svg>
              <div style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))', zIndex: 10 }}>💖<span style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '12px' }}>💕</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;
