import React, { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sendPasswordRecovery, supabase, updateMobilePassword } from '../../lib/supabase.mobile';

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

function MobileForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recoveryMode = searchParams.get('mode') === 'recovery';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    if (!recoveryMode) {
      setHasRecoverySession(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setHasRecoverySession(Boolean(session));
      }
    });

    return () => {
      active = false;
    };
  }, [recoveryMode]);

  const handleResetEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: resetError } = await sendPasswordRecovery(email);
    setLoading(false);

    if (resetError) {
      setError(resetError.message || 'Unable to send reset link.');
      return;
    }

    setMessage('Reset email sent. Open it on this device and you will come right back into the app.');
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const { error: updateError } = await updateMobilePassword(password);
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Unable to update your password.');
      return;
    }

    setMessage('Password updated. You can continue inside PromptQuill now.');
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
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900 }}>
            {recoveryMode ? 'Set New Password' : 'Reset Password'}
          </h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '15px', lineHeight: 1.6 }}>
            {recoveryMode
              ? 'Finish your password recovery without leaving the app.'
              : 'We will email you a reset link that opens back inside PromptQuill.'}
          </p>
        </div>

        {recoveryMode && hasRecoverySession ? (
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                New Password
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
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  required
                  style={fieldStyle}
                />
              </div>
            </label>

            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                Confirm New Password
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
                  placeholder="Repeat your new password"
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
              {loading ? 'Updating Password...' : 'Save New Password'}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              {loading ? 'Sending Link...' : 'Send Reset Link'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {message ? (
          <div
            style={{
              marginTop: '16px',
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
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileForgotPassword;
