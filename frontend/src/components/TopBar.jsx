import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Download, Share2, AlertTriangle, Lightbulb, Zap, Plus, Menu, Globe, ChevronDown, ChevronUp, Flame, Clock, ShoppingCart } from 'lucide-react';

const TopBar = ({ score, scoreBreakdown, difficulty, difficultyHours, issuesCount, suggestionsCount, mode, onCopy, onRefine, onExport, onShare, onTogglePublic, isPublic, onNewSession, onToggleSidebar, isSidebarOpen, isPro, onRoast, isRoasting, credits, onBuyCredits }) => {
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [nextReset, setNextReset] = useState(null);

  // Calculate countdown timer
  useEffect(() => {
    const lr = credits?.lastReset || credits?.last_reset;
    if (!lr || credits?.balance <= 0) {
      setNextReset(null);
      return;
    }

    const calculateNextReset = () => {
      try {
        const lastReset = new Date(lr);
        if (isNaN(lastReset.getTime())) {
          setNextReset(null);
          return;
        }
        
        const nextResetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = nextResetTime - now;

        if (diffMs <= 0) {
          setNextReset(null);
          return;
        }

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        setNextReset({ hours, minutes, seconds });
      } catch (err) {
        console.error('Error calculating countdown:', err);
        setNextReset(null);
      }
    };

    calculateNextReset();
    const interval = setInterval(calculateNextReset, 1000);
    return () => clearInterval(interval);
  }, [credits?.lastReset, credits?.balance]);

  const scoreGlow = score >= 8 ? '0 0 20px rgba(163, 230, 53, 0.3)' : score >= 5 ? '0 0 20px rgba(234, 179, 8, 0.3)' : score > 0 ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none';
  const scoreRingColor = score >= 8 ? '#a3e635' : score >= 5 ? '#eab308' : score > 0 ? '#ef4444' : '#333';

  const difficultyColors = {
    'Weekend Project': { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#22c55e' },
    '1 Month Build': { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#eab308' },
    '3 Month Build': { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', text: '#f97316' },
    '6 Months+': { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' }
  };
  const dc = difficultyColors[difficulty] || difficultyColors['1 Month Build'];

  const ScoreBar = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#555', width: '110px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', backgroundColor: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
        <div className="score-bar-fill" style={{ height: '100%', width: `${(value / 10) * 100}%`, backgroundColor: '#a3e635', borderRadius: '3px', transition: '0.5s' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '800', color: '#fff', width: '30px', textAlign: 'right' }}>{value}/10</span>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar" style={{
        height: '64px', padding: '0 20px', display: 'none', alignItems: 'center', justifyContent: 'space-between',
        background: '#050505',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <button onClick={onToggleSidebar} style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Menu size={20} />
        </button>
        <div style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#fff' }}>PromptQuill</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
            <span style={{ color: '#fbbf24' }}>⚡</span> {credits?.balance ?? '...'}
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a3e635', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
            U
          </div>
        </div>
      </div>

      {/* DESKTOP TOP BAR */}
      <div className="desktop-topbar" style={{ padding: '32px 40px 0px 40px', backgroundColor: '#080808' }}>
        {/* Header Row */}
        <div className="mobile-header-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', marginLeft: '-8px' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Prompt<span style={{ color: '#a3e635' }}>Quill</span></h1>
              {isPro && <span className="animate-shimmer" style={{ color: '#fff', fontSize: '9px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', letterSpacing: '1px' }}>PRO</span>}
            </div>
          </div>
          <button 
            onClick={onNewSession}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#111', border: '1px solid #222', color: '#fff', fontSize: '12px', fontWeight: '600' }}
          >
            <Plus size={14} /> New Session
          </button>
        </div>

        {/* Stats and Actions Row */}
        <div className="mobile-flex-col" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Score Box — Expandable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div 
                onClick={() => setScoreExpanded(!scoreExpanded)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#111', border: '1px solid #222', borderRadius: scoreExpanded ? '16px 16px 0 0' : '16px', boxShadow: scoreGlow, cursor: 'pointer', transition: '0.3s' }}
              >
                <div style={{ position: 'relative', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="21" cy="21" r="19" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
                    <circle cx="21" cy="21" r="19" stroke={scoreRingColor} strokeWidth="3" fill="none" strokeDasharray={`${(score || 0) / 10 * 120} 120`} strokeLinecap="round" style={{ transition: 'all 0.8s var(--ease-premium)' }} />
                  </svg>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff', zIndex: 1 }}>{score || 0}</span>
                </div>
                <div style={{ fontSize: '10px', color: '#555', fontWeight: '800' }}>/10</div>
                {scoreExpanded ? <ChevronUp size={14} color="#555" /> : <ChevronDown size={14} color="#555" />}
              </div>
              {scoreExpanded && scoreBreakdown && (
                <div style={{ padding: '16px 20px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderTop: 'none', borderRadius: '0 0 16px 16px' }}>
                  <ScoreBar label="Clarity" value={scoreBreakdown.clarity || 0} />
                  <ScoreBar label="Specificity" value={scoreBreakdown.specificity || 0} />
                  <ScoreBar label="Feasibility" value={scoreBreakdown.feasibility || 0} />
                  <ScoreBar label="Market" value={scoreBreakdown.market_potential || 0} />
                </div>
              )}
            </div>

            {/* Difficulty Badge */}
            {difficulty && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', backgroundColor: dc.bg, border: `1px solid ${dc.border}`, borderRadius: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: dc.text }}>{difficulty}</span>
                {difficultyHours && <span style={{ fontSize: '10px', color: '#555', fontWeight: '700' }}>~{difficultyHours}h</span>}
              </div>
            )}

            {/* Issues Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', backgroundColor: '#111', border: issuesCount > 0 ? '1px solid rgba(251, 146, 60, 0.3)' : '1px solid #222', borderRadius: '16px', transition: '0.3s' }}>
              <AlertTriangle size={20} color={issuesCount > 0 ? '#fb923c' : '#555'} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>ISSUES</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: issuesCount > 0 ? '#fb923c' : '#fff' }}>{issuesCount || 0}</div>
              </div>
            </div>

            {/* Suggestions Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', backgroundColor: '#111', border: suggestionsCount > 0 ? '1px solid rgba(163, 230, 53, 0.2)' : '1px solid #222', borderRadius: '16px', transition: '0.3s' }}>
              <Lightbulb size={20} color={suggestionsCount > 0 ? '#a3e635' : '#555'} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>SUGGESTIONS</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: suggestionsCount > 0 ? '#a3e635' : '#fff' }}>{suggestionsCount || 0}</div>
              </div>
            </div>

            {/* Mode Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '16px' }}>
              <Zap size={18} color="#a3e635" />
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>MODE</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>{mode?.toUpperCase() || 'GENERAL'}</div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mobile-flex-wrap" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onRoast} disabled={isRoasting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '12px', fontWeight: '800', cursor: isRoasting ? 'wait' : 'pointer' }}>
              <Flame size={16} color="#ef4444" className={isRoasting ? 'animate-pulse' : ''} /> {isRoasting ? 'Roasting...' : 'AI Roast'}
            </button>
            <button onClick={onCopy} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
              <Copy size={16} color="#888" /> Copy
            </button>
            <button onClick={onRefine} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
              <RefreshCw size={16} color="#888" /> Refine
            </button>
            <button onClick={onTogglePublic} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: isPublic ? 'rgba(163, 230, 53, 0.1)' : 'transparent', border: isPublic ? '1px solid rgba(163, 230, 53, 0.3)' : '1px solid #333', color: isPublic ? '#a3e635' : '#fff', fontSize: '12px', fontWeight: '600' }}>
              <Globe size={16} color={isPublic ? '#a3e635' : '#888'} /> {isPublic ? 'Make Private' : 'Make Public'}
            </button>
            <button onClick={onShare} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
              <Share2 size={16} color="#888" /> Share
            </button>
            <button onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
              <Download size={16} color="#888" /> Export
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
