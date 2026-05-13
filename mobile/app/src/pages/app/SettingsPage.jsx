import React, { useEffect, useState } from 'react';
import { Bell, LifeBuoy, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeNavigate } from '../../lib/navigation.mobile.js';
import { signOutMobile, supabase } from '../../lib/supabase.mobile.js';

const cardStyle = {
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '22px',
  padding: '18px'
};

function SettingsPage({ publicProfile, refreshProfiles, session }) {
  const [username, setUsername] = useState(publicProfile?.username || '');
  const [bio, setBio] = useState(publicProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(publicProfile?.username || '');
    setBio(publicProfile?.bio || '');
  }, [publicProfile?.bio, publicProfile?.username]);

  const saveProfile = async () => {
    setSaving(true);

    await supabase.from('user_profiles').upsert(
      [
        {
          user_id: session.user.id,
          username: username.trim(),
          bio: bio.trim()
        }
      ],
      { onConflict: 'user_id' }
    );

    await refreshProfiles?.({
      user: {
        id: session.user.id
      }
    });

    setSaving(false);
    toast.success('Profile settings saved.');
  };

  const signOut = async () => {
    await signOutMobile();
    toast.success('Signed out.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 900 }}>Profile settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px' }}>
              Username
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose a username"
              style={{
                width: '100%',
                minHeight: '50px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#11131a',
                color: '#f8fafc',
                padding: '0 16px',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px' }}>Bio</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell future-you what this account is for."
              style={{
                width: '100%',
                minHeight: '120px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#11131a',
                color: '#f8fafc',
                padding: '14px 16px',
                fontSize: '15px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </label>

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            style={{
              minHeight: '50px',
              borderRadius: '16px',
              border: 'none',
              background: saving ? '#64748b' : '#a3e635',
              color: '#05070d',
              fontWeight: 900,
              fontSize: '15px',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldCheck size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>App behavior</h2>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <button
            type="button"
            onClick={() => safeNavigate('https://promptquill.com/privacy')}
            style={{
              minHeight: '48px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#11131a',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => safeNavigate('mailto:promptquill.support@gmail.com')}
            style={{
              minHeight: '48px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#11131a',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Contact Support
          </button>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Bell size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Mobile notes</h2>
        </div>
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
          PromptQuill keeps its session and onboarding state in secure storage on device and stays
          inside the app for auth, generation, history, credits, and profile flows.
        </p>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <LifeBuoy size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Account</h2>
        </div>
        <button
          type="button"
          onClick={signOut}
          style={{
            width: '100%',
            minHeight: '50px',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.24)',
            background: 'rgba(127, 29, 29, 0.18)',
            color: '#fecaca',
            fontWeight: 900,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </section>
    </div>
  );
}

export default SettingsPage;
