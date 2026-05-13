import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../../lib/supabase.mobile';

const shellStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top, rgba(109, 40, 217, 0.16), transparent 40%), #0a0a0f',
  color: '#f8fafc',
  padding: '28px 20px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '32px 24px',
  borderRadius: '28px',
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(163, 230, 53, 0.14)',
  boxShadow: '0 28px 70px rgba(0, 0, 0, 0.35)'
};

const fieldStyle = {
  width: '100%',
  minHeight: '52px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: '#11131a',
  color: '#f8fafc',
  padding: '0 16px 0 44px',
  fontSize: '15px',
  boxSizing: 'border-box',
  outline: 'none'
};

function MobileLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signInWithEmail({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Unable to sign in right now.');
      return;
    }

    navigate('/app/generate', { replace: true });
  };

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              margin: '0 auto 18px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #a3e635 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#05070d',
              fontSize: '32px',
              fontWeight: 900
            }}
          >
            P
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 900 }}>PromptQuill</h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '15px', lineHeight: 1.6 }}>
            Sign in and jump straight into prompt generation.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>Email</span>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#71717a" style={{ position: 'absolute', top: '17px', left: '14px' }} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={fieldStyle}
              />
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
              Password
            </span>
            <div style={{ position: 'relative' }}>
              <LockKeyhole
                size={18}
                color="#71717a"
                style={{ position: 'absolute', top: '17px', left: '14px' }}
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={fieldStyle}
              />
            </div>
          </label>

          {error ? (
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(239, 68, 68, 0.32)',
                background: 'rgba(127, 29, 29, 0.24)',
                color: '#fecaca',
                padding: '14px 16px',
                fontSize: '14px',
                lineHeight: 1.5
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '54px',
              border: 'none',
              borderRadius: '18px',
              background: loading ? '#64748b' : '#a3e635',
              color: '#05070d',
              fontSize: '16px',
              fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Signing In...' : 'Login'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d9f99d',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Don&apos;t have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileLoginPage;
