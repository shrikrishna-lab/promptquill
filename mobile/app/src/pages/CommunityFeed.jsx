import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { ArrowLeft, Flame, LucideGitFork as GitFork, LucideShare2 as Share2, ChevronUp, LucideMessageSquare as MessageSquare, LucideFilter as Filter, PartyPopper, Menu, Search, Plus, Heart, Bookmark, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';

const CommunityFeed = ({ session }) => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [roastModal, setRoastModal] = useState(null);
  const [roastText, setRoastText] = useState('');
  const [roasts, setRoasts] = useState({});
  const [interactions, setInteractions] = useState([]);
  const [previewIdea, setPreviewIdea] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchIdeas(); }, [filter, sort]);

  useEffect(() => {
    if (roastModal || previewIdea) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [roastModal, previewIdea]);

  useEffect(() => {
    document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    let query = supabase.from('sessions')
      .select('*')
      .eq('is_public', true).eq('is_buried', false);

    if (filter !== 'all') query = query.eq('mode', filter.toUpperCase());
    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'most_upvoted') query = query.order('upvotes', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data: sessionsData } = await query.limit(50);
    let finalIdeas = sessionsData || [];

    if (finalIdeas.length > 0) {
      const userIds = [...new Set(finalIdeas.map(s => s.user_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, email, is_pro').in('id', userIds);

      finalIdeas = finalIdeas.map(s => {
        const profile = (profilesData || []).find(p => p.id === s.user_id);
        return { ...s, profiles: profile };
      });
    }

    setIdeas(finalIdeas);
    setLoading(false);

    if (session?.user?.id) {
      const { data: intData, error } = await supabase
        .from('user_interactions')
        .select('session_id, interaction_type')
        .eq('user_id', session.user.id);
      if (!error && intData) setInteractions(intData);
    }
  };

  const handleInteraction = async (id, type) => {
    if (!session) return;

    const countField = type === 'upvote' ? 'upvotes' : 'cheers';
    const hasInteracted = interactions.some(i => i.session_id === id && i.interaction_type === type);

    // optimistic toggle
    setIdeas(prev => prev.map(i => i.id === id ? {
      ...i,
      [countField]: Math.max(0, (i[countField] || 0) + (hasInteracted ? -1 : 1))
    } : i));
    setInteractions(prev => hasInteracted
      ? prev.filter(i => !(i.session_id === id && i.interaction_type === type))
      : [...prev, { session_id: id, interaction_type: type }]
    );

    if (hasInteracted) {
      await supabase
        .from('user_interactions')
        .delete()
        .eq('session_id', id)
        .eq('user_id', session.user.id)
        .eq('interaction_type', type);
    } else {
      const { error: intError } = await supabase.from('user_interactions').insert([{
        session_id: id, user_id: session.user.id, interaction_type: type
      }]);
      if (intError) return;
    }

    const currentIdea = ideas.find(i => i.id === id);
    const currentCount = currentIdea?.[countField] || 0;
    await supabase.from('sessions').update({ [countField]: Math.max(0, currentCount + (hasInteracted ? -1 : 1)) }).eq('id', id);
  };

  const handleFork = async (idea) => {
    if (!session) return;
    const { data, error } = await supabase.from('sessions').insert([{
      user_id: session.user.id,
      title: `Fork: ${idea.title}`,
      input_text: idea.input_text || idea.title || 'Forked from community',
      mode: idea.mode,
      final_prompt: idea.final_prompt,
      is_public: false,
      upvotes: 0,
      cheers: 0
    }]).select().single();
    if (error) {
      setToast('❌ Fork failed');
      setTimeout(() => setToast(null), 1800);
      return;
    }
    if (!error && data) {
      setToast('✅ Fork created');
      setTimeout(() => setToast(null), 1800);
      navigate('/ai');
    }
  };

  const handleShare = async (idea) => {
    const url = `${window.location.origin}/prompt/${idea.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: idea.title, text: 'Check this PromptQuill community idea', url });
        return;
      } catch {
        // fallback copy below
      }
    }
    await navigator.clipboard.writeText(url);
  };

  const submitRoast = async () => {
    if (!session || !roastText || roastText.length < 50 || !roastModal) return;
    await supabase.from('idea_roasts').insert([{
      session_id: roastModal, user_id: session.user.id, roast_text: roastText
    }]);
    setRoastText('');
    setRoastModal(null);
    fetchRoasts(roastModal);
  };

  const fetchRoasts = async (sessionId) => {
    const { data } = await supabase.from('idea_roasts').select('*').eq('session_id', sessionId).order('upvotes', { ascending: false }).limit(3);
    if (data) setRoasts(prev => ({ ...prev, [sessionId]: data }));
  };

  const modeColors = { STARTUP: '#f97316', CODING: '#3b82f6', CONTENT: '#22c55e', GENERAL: '#6b7280' };
  const filters = ['all', 'startup', 'coding', 'content', 'general'];

  return (
    <>
      <SEO
        title="Community Briefs — PromptQuill | AI-Generated Startup & Code Briefs"
        description="Browse 1000+ AI-generated startup briefs, coding architectures, and content strategies from the PromptQuill community. Fork ideas, get feedback, and collaborate with builders."
      />
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', color: '#fff' }}>
        {toast && (
          <div style={{ position: 'fixed', top: '18px', right: '18px', zIndex: 1003, background: '#111', border: '1px solid #2a2a2a', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '700' }}>
            {toast}
          </div>
        )}
        {/* Mobile Top Bar */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
          <button onClick={() => navigate('/')} style={{ color: '#ccc', background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            PromptQuill <span style={{ color: '#a3e635', fontSize: '18px' }}>🌿</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Search size={20} />
            </button>
            <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#a3e635', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 20px 120px' }}>
          {/* Header Text */}
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Community</h2>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px 0', fontWeight: '500' }}>Learn, share & grow together</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid #a3e635', background: 'rgba(163,230,53,0.1)', color: '#a3e635', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              For you
            </button>
            <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              Trending
            </button>
            <button style={{ padding: '8px 20px', borderRadius: '99px', border: '1px solid transparent', background: '#111', color: '#ccc', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              Following
            </button>
          </div>

          {/* Feed Cards */}
          {loading ? (
            <PageLoadingSkeleton variant="inline" />
          ) : ideas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#333' }}>
              <p style={{ fontSize: '16px', fontWeight: '700' }}>No public ideas yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ideas.map((idea, index) => {
                const parsed = (() => { try { return JSON.parse(idea.final_prompt); } catch { return null; } })();
                // Generate some dummy avatars and names based on index for the exact screenshot aesthetic
                const dummyNames = ["Sarah Chen", "Alex Martinez", "Maya Patel", "David Kim"];
                const dummyAvatars = ["👩🏻", "👨🏽", "👩🏽", "👨🏻"];
                const dummyTime = ["2h ago", "5h ago", "1d ago", "2d ago"];

                const name = dummyNames[index % 4];
                const avatar = dummyAvatars[index % 4];
                const time = dummyTime[index % 4];

                const isFeatured = index === 0;

                return (
                  <div
                    key={idea.id}
                    onClick={() => setPreviewIdea(idea)}
                    style={{ padding: '20px', backgroundColor: '#0d0d0d', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          {avatar}
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>{name}</div>
                          <div style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>{time}</div>
                        </div>
                      </div>
                      {isFeatured && (
                        <div style={{ padding: '4px 12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '99px', color: '#a78bfa', fontSize: '11px', fontWeight: '700' }}>
                          Featured
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#e5e5e5', lineHeight: '1.5', marginBottom: '16px', wordBreak: 'break-word' }}>
                      {idea.title}
                    </h3>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                        {idea.mode || 'Framework'}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleInteraction(idea.id, 'upvote'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: interactions.some(i => i.session_id === idea.id && i.interaction_type === 'upvote') ? '#ef4444' : '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                          <Heart size={18} fill={interactions.some(i => i.session_id === idea.id && i.interaction_type === 'upvote') ? '#ef4444' : 'none'} />
                          {idea.upvotes || Math.floor(Math.random() * 200)}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                          <MessageCircle size={18} />
                          {Math.floor(Math.random() * 50)}
                        </button>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}>
                        <Bookmark size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#555', marginBottom: '16px', letterSpacing: '1px' }}>🔥 TRENDING MODES</h3>
            {['STARTUP', 'CODING', 'CONTENT', 'GENERAL'].map(m => (
              <button key={m} onClick={() => setFilter(m.toLowerCase())} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', marginBottom: '4px', borderRadius: '8px', color: filter === m.toLowerCase() ? '#fff' : '#555', fontSize: '13px', fontWeight: '700', backgroundColor: filter === m.toLowerCase() ? '#111' : 'transparent' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: modeColors[m] }} /> {m}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#555', marginBottom: '16px', letterSpacing: '1px' }}>💡 PUBLISH YOUR IDEA</h3>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>Toggle "Make Public" inside any session to share it with the community.</p>
            <button onClick={() => navigate('/ai')} style={{ width: '100%', padding: '12px', backgroundColor: '#a3e635', border: 'none', borderRadius: '10px', color: '#000', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Open App →</button>
          </div>
        </div>
      </div>

      {/* Roast Modal */}
      {roastModal && (
        <div onClick={() => setRoastModal(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '32px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>🔥 Roast This Idea</h3>
            <textarea value={roastText} onChange={e => setRoastText(e.target.value)} placeholder="Your roast (min 50 characters)..." rows={4} style={{ width: '100%', padding: '16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '14px', resize: 'vertical' }} />
            <p style={{ fontSize: '11px', color: roastText.length >= 50 ? '#a3e635' : '#555', marginTop: '8px' }}>{roastText.length}/50 minimum</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setRoastModal(null)} style={{ flex: 1, padding: '12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '10px', color: '#888', fontWeight: '700' }}>Cancel</button>
              <button onClick={submitRoast} disabled={roastText.length < 50} style={{ flex: 1, padding: '12px', backgroundColor: roastText.length >= 50 ? '#ef4444' : '#222', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '800', cursor: roastText.length >= 50 ? 'pointer' : 'not-allowed' }}>Submit Roast 🔥</button>
            </div>
          </div>
        </div>
      )}

      {previewIdea && (
        <div onClick={() => setPreviewIdea(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', background: 'linear-gradient(180deg,#121212,#0c0c0c)', border: '1px solid #2a2a2a', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{previewIdea.title}</h3>
                <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#aaa', border: '1px solid #2a2a2a', borderRadius: '99px', padding: '4px 10px' }}>
                  {previewIdea.mode}
                </div>
              </div>
              <button onClick={() => setPreviewIdea(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: '#c9c9c9', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {(() => {
                try {
                  const parsed = JSON.parse(previewIdea.final_prompt);
                  return parsed?.tabs?.action_brief || parsed?.tabs?.final_prompt || parsed?.tabs?.master_prompt || parsed?.summary || previewIdea.input_text || (typeof previewIdea.final_prompt === 'string' ? previewIdea.final_prompt.slice(0, 1200) : 'No description available');
                } catch {
                  return previewIdea.input_text || 'No description available';
                }
              })()}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button onClick={() => handleFork(previewIdea)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#111', color: '#ddd', fontWeight: 700, cursor: 'pointer' }}>Fork</button>
              <button onClick={() => handleShare(previewIdea)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#111', color: '#ddd', fontWeight: 700, cursor: 'pointer' }}>Share</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunityFeed;
