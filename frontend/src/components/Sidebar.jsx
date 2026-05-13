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
      <div style={{
        width: 260, height: '100vh', background: '#0a0a0a', borderRight: '1px solid #141414',
        display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease', zIndex: 100,
      }}>
        <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: '#fff' }}>PromptQuill</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link to="/ai" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', fontSize: 13, fontWeight: 600 }}>
              <Home size={16} color="#a3e635" /> Dashboard
            </Link>
            <Link to="/battles" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, color: '#666', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <Swords size={15} /> Prompt Battle
            </Link>
            <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, color: '#666', textDecoration: 'none', fontSize: 13, fontWeight: 500, marginTop: 4 }}>
              <Settings size={15} /> Settings
            </Link>
          </div>


        </div>

        {/* Bottom Profile */}
        <div style={{ padding: '16px', borderTop: '1px solid #141414' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#0d0d0d', borderRadius: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: 12 }}>D</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Demo User</div>
                <div style={{ fontSize: 10, color: '#555' }}>Free Plan</div>
              </div>
            </div>
            <button onClick={onSettings} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Settings size={14} />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
