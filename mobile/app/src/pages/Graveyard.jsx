import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { useNavigate } from 'react-router-dom';
import { Skull, RefreshCw, Home, Zap, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Graveyard = ({ session }) => {
  const [buriedSessions, setBuriedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviveModal, setReviveModal] = useState(null);
  const [reviveLoading, setReviveLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id) {
      fetchBuriedSessions();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchBuriedSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', session.user.id)
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
        .eq('user_id', session.user.id)
        .select();

      if (error) {
        console.error('Error reviving idea:', error);
        showNotification('❌ Failed to revive idea: ' + error.message, 'error');
        return;
      }

      if (!data || data.length === 0) {
        console.error('No session found to revive');
        showNotification('❌ Session not found', 'error');
        return;
      }

      setBuriedSessions(prev => prev.filter(s => s.id !== sessionData.id));
      setReviveModal(null);
      showNotification(`✨ "${sessionData.title}" has been revived!`, 'success');
    } catch (err) {
      console.error('Error reviving idea:', err);
      showNotification('❌ Failed to revive idea. Please try again.', 'error');
    } finally {
      setReviveLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!session?.user) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '48px', color: '#fff' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🪦</div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>The Graveyard</h1>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
              Sign in to access your buried ideas and revive them whenever you're ready.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{ padding: '14px 32px', backgroundColor: '#a3e635', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', padding: '48px 48px 120px 48px', color: '#fff' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Idea <span style={{ color: '#ef4444' }}>Graveyard</span> 🪦</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchBuriedSessions}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', color: '#888', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '13px', fontWeight: '700', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
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
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#333' }}>
          <Skull size={64} style={{ marginBottom: '24px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>The graveyard is empty</p>
          <p style={{ fontSize: '14px', color: '#555' }}>Your ideas are still alive. 🌱</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {buriedSessions.map((s) => (
            <div
              key={s.id}
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                opacity: 0.85,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <Skull size={24} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a3e635', fontWeight: '700' }}>
                    {s.mode || 'GENERAL'} Mode
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#666', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
                Buried on {new Date(s.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>

              <button
                onClick={() => setReviveModal(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#111',
              border: '2px solid #6366f1',
              borderRadius: '20px',
              padding: '48px',
              maxWidth: '450px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '24px', animation: 'pulse 2s ease-in-out infinite' }}>
              ✨
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>
              Revive "{reviveModal.title}"?
            </h2>

            <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
              Bring this idea back to life. It will reappear in your dashboard as an active session.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setReviveModal(null)}
                disabled={reviveLoading}
                style={{
                  padding: '12px 28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#888',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: '0.2s',
                  opacity: reviveLoading ? 0.5 : 1
                }}
                onMouseEnter={(e) => !reviveLoading && (e.currentTarget.style.borderColor = '#555')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
              >
                Cancel
              </button>

              <button
                onClick={() => handleRevive(reviveModal)}
                disabled={reviveLoading}
                style={{
                  padding: '12px 28px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: reviveLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: reviveLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !reviveLoading && (e.currentTarget.style.backgroundColor = '#7c3aed')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
              >
                {reviveLoading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Graveyard;
