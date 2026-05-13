import React, { useState, useEffect } from 'react';
import { Copy, Share2, Heart, GitBranch, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.mobile';
import { useNavigate } from 'react-router-dom';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';

const IdeaRemixer = ({ session }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});
  const [remixingId, setRemixingId] = useState(null);
  const [remixTitle, setRemixTitle] = useState('');
  const [remixDescription, setRemixDescription] = useState('');
  const [notification, setNotification] = useState(null);
  const [remixLoading, setRemixLoading] = useState(false);
  const [previewIdea, setPreviewIdea] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user) {
      fetchIdeas();
    } else {
      setLoading(false);
    }
  }, [session]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, title, input_text, final_prompt, mode, created_at, is_public, user_id
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching ideas:', error);
        showNotification('❌ Failed to load ideas', 'error');
        setIdeas([]);
        return;
      }
      setIdeas(data || []);
      setLoading(false);

      // Fetch user's likes
      if (session?.user?.id) {
        const { data: likes, error: likesError } = await supabase
          .from('user_interactions')
          .select('session_id, interaction_type')
          .eq('user_id', session.user.id);

        if (likesError) {
          console.error('Error fetching likes:', likesError);
        } else {
          const likeMap = {};
          likes?.forEach(l => {
            if (l.interaction_type === 'upvote') {
              likeMap[l.session_id] = true;
            }
          });
          setUserLikes(likeMap);
        }
      }
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setIdeas([]);
      setLoading(false);
    }
  };

  const handleLike = async (ideaId) => {
    if (!session?.user) {
      showNotification('Please login to like ideas', 'error');
      return;
    }

    try {
      const isCurrentlyLiked = userLikes[ideaId];
      
      if (isCurrentlyLiked) {
        // Unlike - delete the like
        const { error } = await supabase
          .from('user_interactions')
          .delete()
          .eq('session_id', ideaId)
          .eq('interaction_type', 'upvote')
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error('Error removing like:', error);
          showNotification('❌ Failed to unlike', 'error');
          return;
        }
      } else {
        // Like - insert new like
        const { error } = await supabase
          .from('user_interactions')
          .insert([{
            session_id: ideaId,
            user_id: session.user.id,
            interaction_type: 'upvote',
            created_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('Error adding like:', error);
          showNotification('❌ Failed to like', 'error');
          return;
        }
      }

      // Optimistically update UI
      const updatedLikes = { ...userLikes, [ideaId]: !isCurrentlyLiked };
      setUserLikes(updatedLikes);

      // Refresh to sync counts
      fetchIdeas();
    } catch (err) {
      console.error('Error toggling like:', err);
      showNotification('Failed to update like', 'error');
      // Revert optimistic update on error
      setUserLikes(prev => ({ ...prev, [ideaId]: userLikes[ideaId] }));
    }
  };

  const handleRemix = async (idea) => {
    if (!session?.user) {
      showNotification('Please login to remix ideas', 'error');
      return;
    }

    setRemixLoading(true);
    try {
      // Create a new prompt based on the original
      const { data: newPrompt, error: insertError } = await supabase
        .from('sessions')
        .insert([{
          user_id: session.user.id,
          title: remixTitle || `${idea.title} (Remixed)`,
          input_text: idea.input_text || idea.title || '',
          final_prompt: idea.final_prompt || null,
          mode: idea.mode || 'GENERAL',
          is_public: false
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating remixed prompt:', insertError);
        showNotification('❌ Failed to create remix', 'error');
        return;
      }

      showNotification('🎨 Idea remixed! Check your dashboard.');
      setRemixingId(null);
      setRemixTitle('');
      fetchIdeas();
    } catch (err) {
      console.error('Error remixing idea:', err);
      showNotification('❌ Failed to remix idea', 'error');
    } finally {
      setRemixLoading(false);
    }
  };

  const handleShareIdea = async (idea) => {
    const url = `${window.location.origin}/prompt/${idea.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: idea.title, text: 'Check this remixable idea on PromptQuill', url });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    showNotification('🔗 Link copied');
  };

  if (loading) {
    return <PageLoadingSkeleton variant="page" />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: notification.type === 'success' ? '#059669' : '#ef4444',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: '600' }}>{notification.msg}</span>
        </div>
      )}

      {!session?.user ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎨</div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Idea Remixer</h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
              Sign in to remix prompts from the community and build on brilliant ideas.
            </p>
            <button onClick={() => navigate('/')} style={{ padding: '14px 32px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-2px' }}>
                🎨 <span style={{ color: '#a3e635' }}>Idea</span> Remixer
              </h1>
              <p style={{ fontSize: '16px', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                Discover and remix amazing prompts from the community. Build on brilliant ideas and make them your own.
              </p>
            </div>

            {ideas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '120px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎨</div>
                <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Ideas Yet</p>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
                  Share your first prompt to the community and start remixing!
                </p>
                <button onClick={() => navigate('/')} style={{ padding: '14px 32px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
                  Create & Share →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {ideas.map(idea => (
                  <div key={idea.id} onClick={() => setPreviewIdea(idea)} style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                    border: '1px solid rgba(163, 230, 53, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(163, 230, 53, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    {/* Title */}
                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', lineHeight: '1.3', color: '#fff', cursor: 'pointer' }}>
                      {idea.title}
                    </h3>

                    {/* Date */}
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(idea.id); }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: userLikes[idea.id] ? '#a3e635' : 'transparent',
                          color: userLikes[idea.id] ? '#000' : '#a3e635',
                          border: `1px solid ${userLikes[idea.id] ? '#a3e635' : 'rgba(163, 230, 53, 0.3)'}`,
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          if (!userLikes[idea.id]) {
                            e.currentTarget.style.backgroundColor = 'rgba(163, 230, 53, 0.1)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!userLikes[idea.id]) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <Heart size={14} fill={userLikes[idea.id] ? 'currentColor' : 'none'} /> Like
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleShareIdea(idea); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'transparent',
                          color: '#888',
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={14} /> Share
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setRemixingId(idea.id); }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.5)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
                        }}
                      >
                        <GitBranch size={14} /> Remix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {previewIdea && (
        <div onClick={() => setPreviewIdea(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.82)', zIndex: 1051, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '18px', background: 'linear-gradient(180deg,#111,#0a0a0a)', border: '1px solid #262626' }}>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{previewIdea.title}</h3>
            <p style={{ marginTop: '10px', color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {(() => {
                if (previewIdea.input_text) return previewIdea.input_text;
                try {
                  const parsed = JSON.parse(previewIdea.final_prompt || '{}');
                  return parsed?.tabs?.action_brief || parsed?.tabs?.final_prompt || parsed?.tabs?.master_prompt || parsed?.summary || String(previewIdea.final_prompt || '').slice(0, 1200) || 'No description available.';
                } catch {
                  return String(previewIdea.final_prompt || '').slice(0, 1200) || 'No description available.';
                }
              })()}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => handleShareIdea(previewIdea)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #333', background: '#121212', color: '#ddd', fontWeight: 700, cursor: 'pointer' }}>Share</button>
              <button onClick={() => setRemixingId(previewIdea.id)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Remix</button>
            </div>
          </div>
        </div>
      )}

      {/* Remix Modal */}
      {remixingId && ideas.find(i => i.id === remixingId) && (
        <div onClick={() => !remixLoading && setRemixingId(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '450px',
            padding: '48px',
            backgroundColor: '#111',
            border: '2px solid #6366f1',
            borderRadius: '20px',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px', textAlign: 'center', animation: 'pulse 2s ease-in-out infinite' }}>🎨</div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#fff', textAlign: 'center' }}>
              Remix "{ideas.find(i => i.id === remixingId)?.title}"
            </h2>

            <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', textAlign: 'center', lineHeight: '1.6' }}>
              Create your own version of this prompt. Give it a new title.
            </p>

            <input
              type="text"
              placeholder="Your remix title"
              value={remixTitle}
              onChange={e => setRemixTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
                marginBottom: '24px',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => !remixLoading && setRemixingId(null)}
                disabled={remixLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  color: '#888',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: remixLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: remixLoading ? 0.5 : 1
                }}
                onMouseEnter={e => !remixLoading && (e.currentTarget.style.borderColor = '#555')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#333')}
              >
                Cancel
              </button>

              <button
                onClick={() => handleRemix(ideas.find(i => i.id === remixingId))}
                disabled={remixLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: remixLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: remixLoading ? 0.6 : 1
                }}
                onMouseEnter={e => !remixLoading && (e.currentTarget.style.backgroundColor = '#7c3aed')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6366f1')}
              >
                {remixLoading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Remixing...
                  </>
                ) : (
                  <>
                    <GitBranch size={14} /> Remix It
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default IdeaRemixer;
