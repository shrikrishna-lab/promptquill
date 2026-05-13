import React, { useState } from 'react';
import { ChevronDown, Share2, Copy, Download, Star } from 'lucide-react';

const MobileDashboardResult = ({ result, tabs, activeTab, setActiveTab, getDisplayedTabContent, onCopy, onShare, onExport }) => {
  const [showContent, setShowContent] = useState(false);

  // Safely get score
  const score = result?.score || 0;
  const clampedScore = Math.max(0, Math.min(10, Number(score) || 0));

  // Determine difficulty string
  const diffString = result?.difficulty ? String(result.difficulty).charAt(0).toUpperCase() + String(result.difficulty).slice(1) : 'Standard';

  // Determine mode string
  const modeString = result?.mode ? String(result.mode).replace(/_/g, ' ').toUpperCase() : 'GENERAL';

  // Function to render markdown safely using standard HTML (no complex parser here, just simple rendering for mobile)
  // Re-use the simple markdown renderer logic for mobile
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/<\/?(role|context|task|constraints|output_format)>/gi, (tag) =>
        tag.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      )
      .replace(/```([\s\S]*?)```/g, '<div style="background:#000;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;color:#a3e635;overflow-x:auto;margin:10px 0;">$1</div>')
      .replace(/^### (.+)$/gm, '<h3 style="color:#a3e635;font-size:16px;margin:16px 0 8px;">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="color:#fff;font-size:18px;margin:18px 0 10px;">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="color:#fff;font-size:22px;margin:20px 0 12px;">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#aaa;">$1</em>')
      .replace(/`([^`]+)`/g, '<span style="background:rgba(163,230,53,0.1);color:#a3e635;padding:2px 6px;border-radius:4px;font-size:13px;">$1</span>')
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #6d28d9;padding-left:12px;margin:12px 0;color:#aaa;">$1</blockquote>')
      .replace(/^[-*] (.+)$/gm, '<li style="color:#ccc;margin-bottom:6px;font-size:14px;line-height:1.5;">$1</li>')
      .replace(/\n\n/g, '<br/><br/>');
    
    return { __html: html };
  };

  if (showContent) {
    // CONTENT VIEW (Like the Green/Light UI concept but dark/premium)
    return (
      <div className="animate-fade-in" style={{
        flex: 1, display: 'flex', flexDirection: 'column', width: '100%',
        background: 'linear-gradient(180deg, #100d1e 0%, #080808 100%)',
        position: 'relative', minHeight: '100vh', paddingBottom: '120px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', zIndex: 10 }}>
          <button onClick={() => setShowContent(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronDown size={20} />
          </button>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>Results</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onShare && onShare()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Tab Selector (Horizontal Scroll) */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', padding: '0 20px 16px 20px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '10px 16px',
                borderRadius: '99px',
                background: activeTab === tab.id ? '#a3e635' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000' : '#888',
                border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Floating Content Card */}
        <div style={{ padding: '0 20px', flex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '16px', display: 'flex', gap: '8px' }}>
               <button onClick={() => onCopy && onCopy()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Copy size={14} />
               </button>
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>{tabs.find(t => t.id === activeTab)?.label || 'Content'}</h2>
            
            <div 
              style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={renderMarkdown(getDisplayedTabContent(activeTab))}
            />
          </div>
        </div>
      </div>
    );
  }

  // OVERVIEW VIEW (Like the Purple UI concept)
  return (
    <div className="animate-fade-in" style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', 
      position: 'relative', minHeight: '100vh', paddingBottom: '100px',
      background: 'linear-gradient(180deg, rgba(109,40,217,0.2) 0%, rgba(8,8,8,1) 50%)',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{ width: '100%', padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ width: '40px' }}></div> {/* spacer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>AI Analysis</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', background: 'rgba(163,230,53,0.1)', padding: '4px 10px', borderRadius: '99px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a3e635' }}></div>
            <span style={{ color: '#a3e635', fontSize: '11px', fontWeight: '700' }}>Completed</span>
          </div>
        </div>
        <button onClick={() => onExport && onExport()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Download size={18} />
        </button>
      </div>

      {/* Giant Glowing Orb */}
      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '40px 0', zIndex: 5 }}>
        {/* Glows */}
        <div style={{ position: 'absolute', inset: '-40px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,230,53,0.3) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'pulse 3s infinite alternate' }}></div>
        <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,39,119,0.3) 0%, transparent 70%)', filter: 'blur(20px)', animation: 'pulse 4s infinite alternate-reverse' }}></div>
        
        {/* Core Sphere */}
        <div style={{ 
          width: '100%', height: '100%', borderRadius: '50%', 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(163,230,53,0.8) 40%, rgba(109,40,217,0.9) 100%)',
          boxShadow: 'inset -20px -20px 40px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.8), 0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)', borderRadius: '50% 50% 0 0' }}></div>
           <div style={{ textAlign: 'center', zIndex: 2 }}>
             <div style={{ fontSize: '48px', fontWeight: '900', color: '#000', lineHeight: '1', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>{clampedScore}</div>
             <div style={{ fontSize: '14px', fontWeight: '800', color: '#111', textTransform: 'uppercase', letterSpacing: '2px' }}>Score</div>
           </div>
        </div>
      </div>

      <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', marginBottom: '32px', zIndex: 10 }}>Session Summary</h2>

      {/* Floating Dark Cards Array */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 20px', width: '100%', justifyContent: 'center', zIndex: 10 }}>
        
        {/* Stat Card 1 */}
        <div style={{ 
          background: '#1a1a1a', borderRadius: '20px', padding: '16px', flex: 1, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #333',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)', transform: 'translateY(-10px)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px' }}>🎯</span>
          </div>
          <div style={{ color: '#888', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Mode</div>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textAlign: 'center' }}>{modeString}</div>
        </div>

        {/* Stat Card 2 */}
        <div style={{ 
          background: '#1a1a1a', borderRadius: '20px', padding: '16px', flex: 1, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #333',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)', transform: 'translateY(10px)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
          </div>
          <div style={{ color: '#888', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Difficulty</div>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textAlign: 'center' }}>{diffString}</div>
        </div>

        {/* Stat Card 3 */}
        <div style={{ 
          background: '#1a1a1a', borderRadius: '20px', padding: '16px', flex: 1, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #333',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)', transform: 'translateY(-10px)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px' }}>💡</span>
          </div>
          <div style={{ color: '#888', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Issues</div>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textAlign: 'center' }}>{result?.issues?.length || 0} found</div>
        </div>

      </div>

      {/* Large Action Button (Like "Your voice, your playlist") */}
      <div style={{ width: '100%', padding: '0 20px', marginTop: '40px', zIndex: 10 }}>
        <button 
          onClick={() => setShowContent(true)}
          className="hover-glow"
          style={{ 
            width: '100%', background: 'linear-gradient(90deg, #d8f7a0 0%, #a3e635 100%)', 
            borderRadius: '24px', padding: '24px', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 10px 30px rgba(163,230,53,0.3)', cursor: 'pointer'
          }}
        >
          <span style={{ color: '#000', fontSize: '20px', fontWeight: '900', marginBottom: '6px' }}>View Full Results</span>
          <span style={{ color: '#333', fontSize: '13px', fontWeight: '600' }}>Tap to explore AI generated content</span>
        </button>
      </div>

    </div>
  );
};

export default MobileDashboardResult;
