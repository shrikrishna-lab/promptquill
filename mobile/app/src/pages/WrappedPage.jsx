import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Rocket, Zap, Award, Share2 } from 'lucide-react';
import FullPageLoadingScreen from '../components/FullPageLoadingScreen';

const WrappedPage = ({ session }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchWrapped();
    else navigate('/');
  }, [session]);

  const fetchWrapped = async () => {
    setLoading(true);
    const userId = session.user.id;

    // Fetch all sessions
    const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', userId);
    const { data: usageLogs } = await supabase.from('usage_logs').select('*').eq('user_id', userId);

    const allSessions = sessions || [];
    const buried = allSessions.filter(s => s.is_buried);
    const publicOnes = allSessions.filter(s => s.is_public);

    // Find best score
    let bestScore = 0, bestIdea = '';
    const modeCounts = {};
    allSessions.forEach(s => {
      try {
        const parsed = JSON.parse(s.last_output);
        if (parsed?.score > bestScore) { bestScore = parsed.score; bestIdea = s.title; }
      } catch { }
      modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1;
    });

    const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'GENERAL';
    const totalUpvotes = allSessions.reduce((sum, s) => sum + (s.upvotes || 0), 0);

    const s = {
      totalPrompts: allSessions.length,
      bestScore,
      bestIdea: bestIdea || 'No ideas yet',
      topMode,
      ideasBuried: buried.length,
      ideasPublic: publicOnes.length,
      totalUpvotes,
      builderLevel: allSessions.length >= 50 ? 'Unicorn 🦄' : allSessions.length >= 20 ? 'Founder 🚀' : allSessions.length >= 10 ? 'Builder 🔨' : 'Ideator 💡',
      firstIdea: allSessions.length > 0 ? allSessions[allSessions.length - 1]?.title : 'Nothing yet',
    };
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStats(s);
    setLoading(false);
  };

  if (loading) {
    return (
      <FullPageLoadingScreen
        title="Wrapping Up Your Year"
        subtitle="Compiling your Prompt Quill journey..."
        spinnerVariant="wave"
        messages={[
          "📊 Analyzing your prompts",
          "🏆 Calculating achievements",
          "🎯 Finding your builder type",
          "✨ Preparing your reels"
        ]}
        icon="🎬"
      />
    );
  }

  const slides = stats ? [
    {
      bg: 'linear-gradient(135deg, #080808, #0d0d0d)', content: (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '16px' }}>Your <span style={{ color: '#a3e635' }}>Prompt Quill</span> Year</h1>
          <p style={{ fontSize: '80px', fontWeight: '900', color: '#a3e635', lineHeight: '1' }}>{stats.totalPrompts}</p>
          <p style={{ color: '#888', fontSize: '18px', marginTop: '16px' }}>prompts generated</p>
        </div>
      )
    },
    {
      bg: 'linear-gradient(135deg, #080808, #1a0533)', content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '24px', color: '#fff' }}>Your Best Idea 🏆</h2>
          <p style={{ fontSize: '24px', fontWeight: '900', color: '#a3e635', fontStyle: 'italic', marginBottom: '16px' }}>"{stats.bestIdea}"</p>
          <p style={{ fontSize: '64px', fontWeight: '900' }}>{stats.bestScore}<span style={{ fontSize: '24px', color: '#555' }}>/10</span></p>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>your highest score ever</p>
        </div>
      )
    },
    {
      bg: 'linear-gradient(135deg, #080808, #0a1628)', content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>Your Builder DNA 🧬</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
            {Object.entries({ STARTUP: '#f97316', CODING: '#3b82f6', CONTENT: '#22c55e', GENERAL: '#6b7280' }).map(([mode, color]) => {
              const count = stats.totalPrompts > 0 ? Math.round((stats.topMode === mode ? 60 : 13) / 100 * 100) : 0;
              return (
                <div key={mode} style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${stats.topMode === mode ? color : '#222'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: stats.topMode === mode ? color : '#333' }}>
                    {stats.topMode === mode ? '★' : '·'}
                  </div>
                  <p style={{ fontSize: '10px', color: stats.topMode === mode ? color : '#333', marginTop: '8px', fontWeight: '700' }}>{mode}</p>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '20px', fontWeight: '800' }}>You're a <span style={{ color: '#a3e635' }}>{stats.topMode}</span> builder</p>
        </div>
      )
    },
    {
      bg: 'linear-gradient(135deg, #080808, #0d0d0d)', content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>The Journey 🪦➡️🚀</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px' }}>
            <div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#ef4444' }}>{stats.ideasBuried}</p>
              <p style={{ color: '#555', fontSize: '14px' }}>ideas buried</p>
            </div>
            <div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#a3e635' }}>{stats.ideasPublic}</p>
              <p style={{ color: '#555', fontSize: '14px' }}>ideas published</p>
            </div>
            <div>
              <p style={{ fontSize: '48px', fontWeight: '900', color: '#6d28d9' }}>{stats.totalUpvotes}</p>
              <p style={{ color: '#555', fontSize: '14px' }}>community upvotes</p>
            </div>
          </div>
        </div>
      )
    },
    {
      bg: 'linear-gradient(135deg, #080808, #162008)', content: (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>Builder Level</h2>
          <p style={{ fontSize: '72px', marginBottom: '16px' }}>{stats.builderLevel.split(' ')[1]}</p>
          <p style={{ fontSize: '28px', fontWeight: '900', color: '#a3e635' }}>{stats.builderLevel.split(' ')[0]}</p>
          <p style={{ color: '#555', fontSize: '14px', marginTop: '16px' }}>{stats.totalPrompts} prompts • {stats.bestScore}/10 best score</p>
          <button onClick={() => { navigator.clipboard.writeText(`I'm a ${stats.builderLevel} on @Prompt Quill! ${stats.totalPrompts} prompts generated, best score ${stats.bestScore}/10 🚀 #Prompt Quill #buildinpublic`); }} style={{ marginTop: '32px', padding: '14px 28px', backgroundColor: '#a3e635', border: 'none', borderRadius: '99px', color: '#000', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '32px auto 0' }}>
            <Share2 size={16} /> Share My Wrapped
          </button>
        </div>
      )
    },
  ] : [];

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #222', borderTopColor: '#a3e635', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ height: '100vh', background: slides[slide]?.bg || '#080808', color: '#fff', display: 'flex', flexDirection: 'column', transition: 'background 0.5s' }}>
      {/* Top */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{ color: '#888', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}><ArrowLeft size={18} /> Home</button>
        <span style={{ fontSize: '12px', color: '#444', fontWeight: '700' }}>{slide + 1} / {slides.length}</span>
      </div>

      {/* Slide Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} className="animate-fade-in" key={slide}>
        {slides[slide]?.content}
      </div>

      {/* Navigation */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
        {slide > 0 && <button onClick={() => setSlide(s => s - 1)} style={{ padding: '12px 24px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontWeight: '700' }}>← Previous</button>}
        {slide < slides.length - 1 && <button onClick={() => setSlide(s => s + 1)} style={{ padding: '12px 24px', backgroundColor: '#a3e635', border: 'none', borderRadius: '12px', color: '#000', fontWeight: '800' }}>Next →</button>}
        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px', position: 'absolute', bottom: '32px' }}>
          {slides.map((_, i) => <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === slide ? '#a3e635' : '#333', cursor: 'pointer', transition: '0.3s' }} />)}
        </div>
      </div>
    </div>
  );
};

export default WrappedPage;

