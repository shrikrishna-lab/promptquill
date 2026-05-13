import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../../lib/supabase.mobile';

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

function MobileSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const {
      data: { session },
      error: signUpError
    } = await signUpWithEmail({ email, password });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Unable to create your account.');
      return;
    }

    if (session) {
      navigate('/app/generate', { replace: true });
      return;
    }

    setMessage('Check your email. Your confirmation link will bring you back into the app.');
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
          <h1 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 900 }}>Create Account</h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '15px', lineHeight: 1.6 }}>
            Make PromptQuill your default place to build prompts on the go.
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
                placeholder="Create a password"
                autoComplete="new-password"
                required
                style={fieldStyle}
              />
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
              Confirm Password
            </span>
            <div style={{ position: 'relative' }}>
              <LockKeyhole
                size={18}
                color="#71717a"
                style={{ position: 'absolute', top: '17px', left: '14px' }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
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

          {message ? (
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(163, 230, 53, 0.2)',
                background: 'rgba(101, 163, 13, 0.08)',
                color: '#d9f99d',
                padding: '14px 16px',
                fontSize: '14px',
                lineHeight: 1.5
              }}
            >
              {message}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileSignupPage;
