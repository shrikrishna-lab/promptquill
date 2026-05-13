import React, { useEffect, useState } from 'react';
import { LogOut, Mail, Sparkles, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { signOutMobile, supabase } from '../../lib/supabase.mobile.js';

const cardStyle = {
  background: 'rgba(18, 18, 28, 0.94)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '22px',
  padding: '18px'
};

function ProfilePage({ profile, publicProfile, session }) {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .then(({ count }) => {
        setHistoryCount(count || 0);
      });
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOutMobile();
    toast.success('Signed out.');
  };

  const name =
    publicProfile?.username || profile?.display_name || session.user.email?.split('@')?.[0] || 'PromptQuill User';
  const bio = publicProfile?.bio || 'Your mobile PromptQuill workspace is ready.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <section style={{ ...cardStyle, textAlign: 'center' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '28px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #a3e635 0%, #6d28d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#05070d',
            fontSize: '34px',
            fontWeight: 900
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>{name}</h2>
        <p style={{ margin: '0 auto', maxWidth: '320px', color: '#a1a1aa', fontSize: '14px', lineHeight: 1.6 }}>
          {bio}
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '12px'
        }}
      >
        <article style={cardStyle}>
          <div style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>Plan</div>
          <div style={{ fontSize: '20px', fontWeight: 900 }}>{profile?.is_pro ? 'Pro' : 'Free'}</div>
        </article>
        <article style={cardStyle}>
          <div style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '6px' }}>History</div>
          <div style={{ fontSize: '20px', fontWeight: 900 }}>{historyCount}</div>
        </article>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Mail size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Account details</h2>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>{session.user.email}</div>
          <div style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: 1.6 }}>
            Auth stays in the app and resumes directly into generation when your session is still
            valid.
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Sparkles size={18} color="#d9f99d" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Mobile identity</h2>
        </div>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7' }}>
            <UserRound size={16} color="#a1a1aa" />
            {publicProfile?.username || 'Username not set yet'}
          </div>
          <div style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: 1.6 }}>
            Edit your username or bio from Settings whenever you want to tune your profile.
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        style={{
          width: '100%',
          minHeight: '52px',
          borderRadius: '18px',
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
        Logout
      </button>
    </div>
  );
}

export default ProfilePage;
