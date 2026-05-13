import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { History, Trash2, ChevronRight, Clock } from 'lucide-react';
import { timeAgo } from '../lib/utils';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const MODE_COLORS = {
  STARTUP: '#a3e635',
  CODING: '#3b82f6',
  CONTENT: '#f59e0b',
  CREATIVE: '#ec4899',
  GENERAL: '#8b5cf6',
  STARTUP_LITE: '#06b6d4',
};

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenSessionIds, setHiddenSessionIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('promptquill_hidden_history') || '[]'));
    } catch {
      return new Set();
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setSessions((data || []).filter(s => !hiddenSessionIds.has(s.id)));
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (window.confirm('Clear history from this device? Your prompts stay saved in your account.')) {
      const next = new Set([...hiddenSessionIds, ...sessions.map(s => s.id)]);
      localStorage.setItem('promptquill_hidden_history', JSON.stringify([...next]));
      setHiddenSessionIds(next);
      setSessions([]);
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    const next = new Set([...hiddenSessionIds, id]);
    localStorage.setItem('promptquill_hidden_history', JSON.stringify([...next]));
    setHiddenSessionIds(next);
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      <div style={{ padding: '48px 24px 40px', borderBottom: '1px solid #1a1a1a', background: 'linear-gradient(180deg, rgba(163,230,53,0.08) 0%, rgba(163,230,53,0.02) 40%, rgba(0,0,0,0) 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <button onClick={() => navigate('/ai')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#a3e635', fontSize: '13px', fontWeight: '800', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(163,230,53,0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(163,230,53,0.15), rgba(163,230,53,0.05))', padding: '14px', borderRadius: '18px', color: '#a3e635', boxShadow: '0 0 30px rgba(163,230,53,0.1)' }}>
                <History size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 4px', color: '#fff', background: 'linear-gradient(135deg, #fff 60%, #a3e635)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prompt History</h1>
                <p style={{ color: '#666', fontSize: '14px', fontWeight: '500', margin: 0 }}>Review and revisit all your previous AI generations.</p>
              </div>
            </div>
          </div>
          {sessions.length > 0 && (
            <button onClick={clearHistory} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.boxShadow = 'none' }}>
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #1a1a1a', borderTopColor: '#a3e635', borderRadius: '50%', animation: 'hspin 0.8s linear infinite' }}></div>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ fontSize: '72px', marginBottom: '24px', lineHeight: 1 }}>📜</div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>No History Yet</h2>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '36px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>Your generated prompts will securely appear here. Time to create something brilliant.</p>
              <button onClick={() => navigate('/ai')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #a3e635, #84cc16)', color: '#000', fontSize: '14px', fontWeight: '900', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(163,230,53,0.3)', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(163,230,53,0.45)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(163,230,53,0.3)' }}>
                Start Generating ✨
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => navigate(`/ai?session=${session.id}`)}
                  style={{
                    backgroundColor: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a3e635'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(163,230,53,0.08), 0 0 0 1px rgba(163,230,53,0.15)'; e.currentTarget.style.backgroundColor = '#111' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#0d0d0d' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: '8px' }}>
                      <Clock size={12} color="#666" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {timeAgo(session.updated_at)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '12px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', letterSpacing: '-0.2px' }}>
                    {session.title || 'Untitled Prompt'}
                  </h3>

                  <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {session.mode && (
                        <span style={{
                          background: `${MODE_COLORS[session.mode] || '#8b5cf6'}15`,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '800',
                          color: MODE_COLORS[session.mode] || '#8b5cf6',
                          textTransform: 'uppercase',
                          letterSpacing: '1.5px',
                          border: `1px solid ${MODE_COLORS[session.mode] || '#8b5cf6'}30`
                        }}>
                          {session.mode.replace('_', ' ')}
                        </span>
                      )}
                      {session.is_public && (
                        <span style={{ background: 'rgba(163,230,53,0.1)', padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', letterSpacing: '1.5px', border: '1px solid rgba(163,230,53,0.2)' }}>
                          Public
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#555', transition: 'all 0.3s', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#a3e635'; e.currentTarget.style.transform = 'translateX(3px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.transform = 'translateX(0)' }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes hspin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;
