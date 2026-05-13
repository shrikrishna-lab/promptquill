import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { useNavigate } from 'react-router-dom';
import { History, Trash2, ChevronRight, Clock, Star, Zap } from 'lucide-react';
import { timeAgo } from '../lib/utils';
import TopBar from '../components/TopBar'; // Only for basic top bar if needed, or we can just build a custom header.

const HistoryPage = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      const { error } = await supabase.from('sessions').delete().eq('user_id', user?.id);
      if (!error) setSessions([]);
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this prompt?')) {
      await supabase.from('sessions').delete().eq('id', id);
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
      {/* Header */}
      <div style={{ padding: '40px 24px', borderBottom: '1px solid #1a1a1a', background: 'linear-gradient(180deg, rgba(163,230,53,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <button onClick={() => navigate('/ai')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#a3e635', fontSize: '13px', fontWeight: '800', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: 'rgba(163,230,53,0.1)', padding: '12px', borderRadius: '16px', color: '#a3e635' }}>
                <History size={28} />
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: '#fff' }}>Prompt History</h1>
            </div>
            <p style={{ color: '#888', fontSize: '14px', fontWeight: '500' }}>Review and revisit all your previous AI generations.</p>
          </div>
          {sessions.length > 0 && (
            <button onClick={clearHistory} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#ef4444', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #333', borderTopColor: '#a3e635', borderRadius: '50%' }}></div>
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0a0a0a', border: '1px dashed #222', borderRadius: '24px' }}>
              <History size={64} color="#333" style={{ marginBottom: '24px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '12px' }}>No History Yet</h2>
              <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px' }}>Your generated prompts will securely appear here.</p>
              <button onClick={() => navigate('/ai')} style={{ padding: '14px 32px', backgroundColor: '#a3e635', color: '#000', fontSize: '14px', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(163,230,53,0.3)' }}>
                Start Generating ✨
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => navigate(`/ai?session=${session.id}`)}
                  className="history-card"
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                      <Clock size={12} color="#888" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase' }}>
                        {timeAgo(session.updated_at)}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => deleteSession(session.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '12px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {session.title || 'Untitled Prompt'}
                  </h3>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {session.mode && (
                        <span style={{ background: '#1a1a1a', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {session.mode.replace('_', ' ')}
                        </span>
                      )}
                      {session.is_public && (
                        <span style={{ background: 'rgba(163,230,53,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: '#a3e635', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Public
                        </span>
                      )}
                    </div>
                    <ChevronRight size={18} color="#555" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
