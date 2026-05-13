import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Settings, Home, Trash2, User, Shield, LogOut, Globe, Zap, HelpCircle, Swords, Award, Lightbulb, Palette, X, ChevronRight, Star, History } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { getCredits } from '../lib/credits';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

const Sidebar = ({ profile, sessions, currentSessionId, onNewSession, onSessionSelect, onVersionSelect, onRename, onDelete, isOpen, onToggle, usageInfo, onSettings, onTogglePublic, isPublic }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('prompt_os_api_key') || '');
  const isAdmin = false;
  const isPro = profile?.is_pro;
  const navigate = useNavigate();

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('prompt_os_api_key', val);
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      try {
        // First, get all session IDs for this user
        const { data: userSessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', DEMO_USER_ID);
        
        if (userSessions && userSessions.length > 0) {
          const sessionIds = userSessions.map(s => s.id);
          
          // Delete dependent prompt_versions first (foreign key constraint)
          await supabase
            .from('prompt_versions')
            .delete()
            .in('session_id', sessionIds);
          
          // Delete dependent user_interactions
          await supabase
            .from('user_interactions')
            .delete()
            .in('session_id', sessionIds);
        }
        
        // Now delete the sessions
        const { error } = await supabase.from('sessions').delete().eq('user_id', DEMO_USER_ID);
        if (error) {
          console.error('Error clearing history:', error.message);
          alert('Failed to clear history: ' + error.message);
        } else {
          window.location.reload();
        }
      } catch (err) {
        console.error('Error clearing history:', err);
        alert('Failed to clear history. Please try again.');
      }
    }
  };

  const dailyMax = isPro ? 300 : 100;
  const currentBalance = usageInfo?.balance || dailyMax;
  const currentMax = Math.max(dailyMax, currentBalance);
  const creditsUsed = currentMax - currentBalance;
  const percentUsed = Math.min(100, Math.round((creditsUsed / currentMax) * 100)) || 0;

  // Use backend's lastReset to calculate real reset time (24h from last reset)
  const [resetHours, setResetHours] = useState(0);
  const [resetMins, setResetMins] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const lastReset = usageInfo?.lastReset;
      if (lastReset) {
        const resetDate = new Date(lastReset);
        const nextReset = new Date(resetDate.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = nextReset - now;

        if (diffMs <= 0) {
          setResetHours(0);
          setResetMins(0);
          // Timer expired — re-fetch credits from backend to trigger reset
          if (DEMO_USER_ID) {
            getCredits(DEMO_USER_ID).then(() => {
              window.location.reload();
            }).catch(() => { });
          }
        } else {
          setResetHours(Math.floor(diffMs / (1000 * 60 * 60)));
          setResetMins(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
        }
      } else {
        // Fallback: end of day
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        setResetHours(Math.floor((endOfDay - now) / (1000 * 60 * 60)));
        setResetMins(Math.floor(((endOfDay - now) / (1000 * 60)) % 60));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [usageInfo?.lastReset]);

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="sidebar" style={{
        width: '280px',
        height: '100vh',
        backgroundColor: '#0d0d0d',
        borderRight: '1px solid #222222',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100
      }}>
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }} className="no-scrollbar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Prompt<span style={{ color: '#fff' }}> Quill</span>
            </h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onNewSession} style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', padding: '6px', borderRadius: '6px', color: '#6366f1' }}>
                <Plus size={16} />
              </button>
              <button className="mobile-floating-toggle" onClick={onToggle} style={{ background: 'transparent', border: 'none', color: '#888', padding: '6px', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/ai" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#fff', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: '600' }}>
                <Home size={18} color="#a3e635" /> Dashboard
              </Link>


              {/* Feature Pages */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(163, 230, 53, 0.1)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Tools</div>
                <Link to="/graveyard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                  <Trash2 size={18} /> Graveyard
                </Link>
                <Link to="/remixer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                  <Lightbulb size={18} /> Idea Remixer
                </Link>
                <Link to="/battles" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                  <Swords size={18} /> Prompt Battle
                </Link>
              </div>

              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                <Settings size={18} /> Settings
              </Link>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', display: 'block' }}>HISTORY</label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                onDoubleClick={() => onRename(session.id)}
                onContextMenu={(e) => { e.preventDefault(); onDelete(session); }}
                onClick={() => onSessionSelect(session.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: currentSessionId === session.id ? 'rgba(163, 230, 53, 0.04)' : 'transparent',
                  borderLeft: currentSessionId === session.id ? '2px solid #a3e635' : '2px solid transparent',
                  transition: 'all 0.3s var(--ease-premium)',
                  marginBottom: '4px'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: currentSessionId === session.id ? '700' : '400', color: currentSessionId === session.id ? '#fff' : '#888', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session.title || 'Untitled Session'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {session.versions?.map(v => (
                    <button
                      key={v.id}
                      onClick={(e) => { e.stopPropagation(); onVersionSelect(v); }}
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: v.version_number === 1 ? '#1a1a1a' : 'rgba(109, 40, 217, 0.2)',
                        color: v.version_number === 1 ? '#666' : '#a78bfa',
                        border: v.version_number === 1 ? 'none' : '1px solid #6d28d9',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      v{v.version_number}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    className={`pill-badge pill-${(session.mode?.toLowerCase() || 'general').replace(/\s+/g, '-')}`}
                    style={{
                      boxShadow: session.mode === 'STARTUP' || session.mode === 'STARTUP LITE' ? '0 0 6px rgba(249, 115, 22, 0.3)' :
                        session.mode === 'CODING' ? '0 0 6px rgba(59, 130, 246, 0.3)' :
                          session.mode === 'CREATIVE' ? '0 0 6px rgba(219, 39, 119, 0.3)' :
                            session.mode === 'BUSINESS' ? '0 0 6px rgba(139, 92, 246, 0.3)' :
                              session.mode === 'ANALYTICS' ? '0 0 6px rgba(6, 182, 212, 0.3)' :
                                'none'
                    }}
                  >
                    {session.mode || 'GENERAL'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#444' }}>{session.created_at_human || 'Just now'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Part - Profile Section */}
        <div style={{ padding: '20px', backgroundColor: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Usage Meter */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#444', textTransform: 'uppercase' }}>Credits Remaining</label>
              <span style={{ fontSize: '10px', fontWeight: '800', color: currentBalance <= 15 ? '#ef4444' : '#888' }}>{currentBalance} / {currentMax}</span>
            </div>
            <div style={{ height: '4px', backgroundColor: '#111', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${percentUsed}%`, backgroundColor: currentBalance <= 15 ? '#ef4444' : '#a3e635', borderRadius: '2px', transition: '0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#666' }}>Resets in {resetHours}h {resetMins}m</span>
              {!isPro && <Link to="/pricing" style={{ fontSize: '10px', color: '#a3e635', fontWeight: '700', textDecoration: 'none' }}>Go Pro →</Link>}
            </div>
          </div>

          {/* Usage Meter removed from desktop as requested */}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#111',
            borderRadius: '14px',
            border: '1px solid #1a1a1a',
            transition: '0.3s'
          }}>
            <div onClick={() => profile?.username && navigate(`/u/${profile.username}`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', cursor: profile?.username ? 'pointer' : 'default' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#a3e635',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#000',
                  fontSize: '14px',
                  flexShrink: 0,
                  transition: '0.3s',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#a3e635'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                {'D'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {'Demo User'}
                  {profile?.is_pro && (
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(163,230,53,0.15)',
                      color: '#a3e635',
                      borderRadius: '4px',
                      border: '1px solid rgba(163,230,53,0.3)',
                      fontWeight: '900',
                      letterSpacing: '0.5px'
                    }}>PRO</span>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#666', fontWeight: '700' }}>
                  {profile?.is_pro ? 'Pro Plan' : 'Basic Plan'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ color: '#555', padding: '4px' }} title="Settings" onClick={onSettings}>
                <Settings size={16} />
              </button>

            </div>
          </div>

          <div onClick={clearHistory} style={{ fontSize: '10px', color: '#333', textAlign: 'center', cursor: 'pointer', marginTop: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
            CLEAR HISTORY
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
