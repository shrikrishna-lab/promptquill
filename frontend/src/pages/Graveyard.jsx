import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Skull, RefreshCw, Home, Zap, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const Graveyard = () => {
  const [buriedSessions, setBuriedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviveModal, setReviveModal] = useState(null);
  const [reviveLoading, setReviveLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuriedSessions();
  }, []);

  const fetchBuriedSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', DEMO_USER_ID)
        .eq('is_buried', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching buried sessions:', error);
      } else {
        setBuriedSessions(data || []);
      }
    } catch (err) {
      console.error('Error in fetchBuriedSessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevive = async (sessionData) => {
    try {
      setReviveLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .update({ is_buried: false, updated_at: new Date().toISOString() })
        .eq('id', sessionData.id)
        .eq('user_id', DEMO_USER_ID)
        .select();

      if (error) {
        console.error('Error reviving idea:', error);
        showNotification('Failed to revive idea: ' + error.message, 'error');
        return;
      }

      if (!data || data.length === 0) {
        console.error('No session found to revive');
        showNotification('Session not found', 'error');
        return;
      }

      setBuriedSessions(prev => prev.filter(s => s.id !== sessionData.id));
      setReviveModal(null);
      showNotification(`"${sessionData.title}" has been revived!`, 'success');
    } catch (err) {
      console.error('Error reviving idea:', err);
      showNotification('Failed to revive idea. Please try again.', 'error');
    } finally {
      setReviveLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '48px 48px 120px', color: '#fff', position: 'relative' }}>
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
          boxShadow: notification.type === 'success' ? '0 4px 24px rgba(5, 150, 105, 0.4)' : '0 4px 24px rgba(239, 68, 68, 0.4)',
          animation: 'gslideIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{notification.msg}</span>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(163,230,53,0.03))', padding: '32px', borderRadius: '24px', border: '1px solid rgba(239,68,68,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', padding: '12px', borderRadius: '16px', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}>
                <Skull size={28} color="#ef4444" />
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
                Idea <span style={{ color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>Graveyard</span>
              </h1>
            </div>
            <p style={{ color: '#666', fontSize: '14px', fontWeight: '500', margin: '4px 0 0', letterSpacing: '0.3px' }}>
              Buried ideas rest here. Some are meant to be revived. 💀
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchBuriedSessions}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid #222', borderRadius: '12px', color: '#888', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#888' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 12px', borderRadius: '12px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a1a1aa' }}
            >
              <Home size={18} /> Back Home
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <LoadingSpinner
                variant="rings"
                size="md"
                color="lime"
                text="Retrieving buried ideas..."
              />
            </div>
          </div>
        ) : buriedSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 40px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ fontSize: '72px', marginBottom: '24px', lineHeight: 1, filter: 'grayscale(0.3)' }}>💀</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>The Graveyard is Empty</h2>
            <p style={{ fontSize: '14px', color: '#555', maxWidth: '360px', margin: '0 auto', lineHeight: '1.6' }}>
              No buried ideas yet. When you bury an idea, it will rest here — waiting to be revived.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {buriedSessions.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '28px',
                  background: '#0d0d0d',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0.8,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = '#0d0d0d';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '12px', flexShrink: 0, lineHeight: 0 }}>
                    <Skull size={22} color="#ef4444" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff', letterSpacing: '-0.2px' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: '700', letterSpacing: '0.5px' }}>
                      {s.mode || 'GENERAL'} Mode
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#555', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(239, 68, 68, 0.08)', fontWeight: '600' }}>
                  Buried on {new Date(s.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                <button
                  onClick={() => setReviveModal(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: '#0d0d0d',
                    border: '1px solid rgba(163, 230, 53, 0.3)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#a3e635',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.3px',
                    marginTop: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#a3e635';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(163, 230, 53, 0.3), 0 0 60px rgba(163, 230, 53, 0.1)';
                    e.currentTarget.style.borderColor = '#a3e635';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0d0d0d';
                    e.currentTarget.style.color = '#a3e635';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(163, 230, 53, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Zap size={14} /> Revive Idea
                </button>
              </div>
            ))}
          </div>
        )}

        {reviveModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              backdropFilter: 'blur(8px)'
            }}
          >
            <div
              style={{
                backgroundColor: '#0d0d0d',
                border: '1px solid rgba(163, 230, 53, 0.25)',
                borderRadius: '24px',
                padding: '48px',
                maxWidth: '460px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 0 60px rgba(163, 230, 53, 0.08)',
                animation: 'gslideUp 0.3s ease-out'
              }}
            >
              <div style={{ fontSize: '52px', marginBottom: '20px', animation: 'gpulse 2s ease-in-out infinite', lineHeight: 1 }}>
                ✨
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px', color: '#fff', letterSpacing: '-0.5px' }}>
                Revive "{reviveModal.title}"?
              </h2>

              <p style={{ fontSize: '14px', color: '#666', marginBottom: '36px', lineHeight: '1.7' }}>
                Bring this idea back to life. It will reappear in your dashboard as an active session.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setReviveModal(null)}
                  disabled={reviveLoading}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: 'transparent',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    color: '#888',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: reviveLoading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !reviveLoading && (e.currentTarget.style.borderColor = '#444')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#222')}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleRevive(reviveModal)}
                  disabled={reviveLoading}
                  style={{
                    padding: '12px 28px',
                    background: reviveLoading ? '#1a1a1a' : '#a3e635',
                    border: 'none',
                    borderRadius: '12px',
                    color: reviveLoading ? '#888' : '#000',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: reviveLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: reviveLoading ? 'none' : '0 0 30px rgba(163, 230, 53, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!reviveLoading) {
                      e.currentTarget.style.background = '#84cc16';
                      e.currentTarget.style.boxShadow = '0 0 40px rgba(163, 230, 53, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = reviveLoading ? '#1a1a1a' : '#a3e635';
                    e.currentTarget.style.boxShadow = reviveLoading ? 'none' : '0 0 30px rgba(163, 230, 53, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {reviveLoading ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid #555', borderTopColor: '#a3e635', borderRadius: '50%', animation: 'gspin 1s linear infinite' }} />
                      Reviving...
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Revive Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gslideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gslideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gpulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes gspin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Graveyard;
