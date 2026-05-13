import React, { useState, useEffect } from 'react';
import { Send, Paperclip, Mic, Plus, Maximize2, Sparkles } from 'lucide-react';

const BottomInput = ({ onGenerate, loading, isCentered, isSidebarOpen, externalInput = '', mode, setMode, isPro = false }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Use provided mode/setMode from parent, or fall back to local state if not provided
  const [localMode, setLocalMode] = useState('GENERAL');
  const currentMode = mode !== undefined ? mode : localMode;
  const updateMode = setMode || setLocalMode;

  // Creative mode sub-type state (sticky per browser)
  const [creativeSubType, setCreativeSubType] = useState(null);
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);

  // Personality selection state
  const [personality, setPersonality] = useState('bot');
  const [attachment, setAttachment] = useState(null);
  const compressImageToDataUrl = (file, maxDim = 1280, quality = 0.82) =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, outputType === 'image/jpeg' ? quality : undefined);
        URL.revokeObjectURL(objectUrl);
        resolve({ dataUrl, outputType });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to decode image'));
      };
      img.src = objectUrl;
    });


  const PURPLE = '#6d28d9';

  useEffect(() => {
    if (externalInput) setInput(externalInput);
  }, [externalInput]);

  // Restore last chosen creative subtype (choose once, reuse)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pq_creative_subtype');
      if (saved) setCreativeSubType(saved);
    } catch {
      // ignore
    }
  }, []);

  const allModes = [
    { id: 'CODING', label: 'Coding', icon: '</>', color: '#3b82f6' },
    { id: 'STARTUP', label: 'Startup', icon: '🚀', color: '#f97316' },
    { id: 'STARTUP_LITE', label: 'Startup Lite', icon: '✨', color: '#fbbf24' },
    { id: 'CONTENT', label: 'Content', icon: '📝', color: '#22c55e' },
    { id: 'GENERAL', label: 'General', icon: '⚡', color: '#6366f1' },
    { id: 'CREATIVE', label: 'Creative', icon: '🎨', color: '#db2777' }
  ];

  const modes = allModes;

  const creativeSubTypes = [
    { id: 'image', label: 'Image', icon: '🖼️', desc: 'Single image generation' },
    { id: 'video', label: 'Video', icon: '🎬', desc: 'Scene and shot prompts' },
    { id: 'frontend', label: 'Frontend', icon: '💻', desc: 'UI concepts and layouts' },
    { id: 'logo', label: 'Logo', icon: '🎨', desc: 'Brand mark and style' },
    { id: 'motion', label: 'Motion', icon: '🌀', desc: 'Animation direction' },
    { id: 'game', label: 'Game Art', icon: '🎮', desc: 'Game visual concepts' },
    { id: 'music', label: 'Music', icon: '🎶', desc: 'Mood and composition cues' },
    { id: 'story', label: 'Story', icon: '📖', desc: 'Narrative world building' },
    { id: 'social', label: 'Social Post', icon: '📱', desc: 'Platform-ready creatives' },
    { id: 'poster', label: 'Poster', icon: '🪧', desc: 'Campaign poster concepts' }
  ];

  useEffect(() => {
    if (currentMode === 'CREATIVE' && !creativeSubType) {
      setShowSubTypeModal(true);
    }
    if (currentMode !== 'CREATIVE') {
      setShowSubTypeModal(false);
    }
  }, [currentMode, creativeSubType]);

  const handleModeSelect = (modeId) => {
    updateMode(modeId);
    if (modeId !== 'CREATIVE') {
      setShowSubTypeModal(false);
    }
    if (modeId === 'CREATIVE' && !creativeSubType) {
      setShowSubTypeModal(true);
    }
  };

  const handleSubTypeSelect = (subTypeId) => {
    setCreativeSubType(subTypeId);
    try {
      localStorage.setItem('pq_creative_subtype', subTypeId);
    } catch {
      // ignore
    }
    // Auto-close on selection (no need to keep showing)
    setShowSubTypeModal(false);
  };

  const detectSensitiveAction = (text) => {
    const s = String(text || '').toLowerCase();
    if (!s.trim()) return null;
    if (/(run|execute)\s+code|terminal|shell|deploy|production deploy/.test(s)) {
      return {
        name: 'Run Code / Deploy Action',
        description: 'Potentially executes code or deploy-related action on your behalf.',
        params: { mode: currentMode, intent: 'run_or_deploy', preview: text.slice(0, 220) }
      };
    }
    if (/api call|webhook|post to|send request|delete|payment|charge|purchase/.test(s)) {
      return {
        name: 'External API Action',
        description: 'May call an external API or perform a sensitive operation.',
        params: { mode: currentMode, intent: 'external_api', preview: text.slice(0, 220) }
      };
    }
    return null;
  };

  const handleAttachmentClick = () => {
    const el = document.getElementById('pq-image-upload-input');
    if (el) el.click();
  };

  const handleAttachmentSelected = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      event.target.value = '';
      return;
    }

    const finalizeWithDataUrl = (dataUrl, mediaType) => {
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      setAttachment({
        name: file.name,
        type: mediaType || file.type,
        size: file.size,
        preview: dataUrl,
        base64
      });
    };

    // Keep GIF as-is (to preserve animation); compress raster images.
    if (file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => finalizeWithDataUrl(String(reader.result || ''), file.type);
      reader.readAsDataURL(file);
    } else {
      compressImageToDataUrl(file)
        .then(({ dataUrl, outputType }) => finalizeWithDataUrl(dataUrl, outputType))
        .catch(() => {
          const reader = new FileReader();
          reader.onload = () => finalizeWithDataUrl(String(reader.result || ''), file.type);
          reader.readAsDataURL(file);
        });
    }
    event.target.value = '';
  };

  const submitWithCurrentState = () => {
    if (!input.trim() && !attachment) return;
    if (currentMode === 'CREATIVE' && !creativeSubType) {
      setShowSubTypeModal(true);
      return;
    }
    if (showSubTypeModal) setShowSubTypeModal(false);

    const metadata = currentMode === 'CREATIVE' ? { creative_type: creativeSubType } : {};
    metadata.personality = personality;
    metadata.isPro = isPro;
    if (attachment) {
      metadata.attachment = attachment;
    }
    const sensitiveAction = detectSensitiveAction(input);
    if (sensitiveAction) {
      metadata.pendingAction = sensitiveAction;
    }

    onGenerate(input, currentMode, metadata);
    setInput('');
    setAttachment(null);
  };

  const handleSubmit = () => {
    submitWithCurrentState();
  };

  const handleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };
      recognition.start();
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  };

  return (
    <div className="bottom-input-container" style={
      isCentered
        ? { width: '100%', display: 'flex', justifyContent: 'center' }
        : {
          position: 'fixed',
          bottom: window.innerWidth <= 768 ? '120px' : 0,
          left: isSidebarOpen ? '280px' : '0',
          right: 0,
          padding: window.innerWidth <= 768 ? '12px' : '32px',
          backgroundColor: window.innerWidth <= 768 ? 'transparent' : 'rgba(8, 8, 8, 0.8)',
          backdropFilter: window.innerWidth <= 768 ? 'none' : 'blur(10px)',
          borderTop: window.innerWidth <= 768 ? 'none' : '1px solid #111',
          zIndex: 50,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: window.innerWidth <= 768 ? 'none' : 'auto'
        }
    }>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', pointerEvents: 'auto' }}>

        {/* DESKTOP HUGE PILL INPUT */}
        <div className="desktop-only-input" style={{ width: '100%' }}>
          <div className="input-pill-wrapper" style={{
            width: '100%',
            backgroundColor: '#111',
            borderRadius: '99px',
            padding: '8px 8px 8px 24px',
            display: 'flex',
            alignItems: 'center',
            border: isFocused ? '1px solid rgba(109, 40, 217, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isFocused ? '0 0 30px rgba(109, 40, 217, 0.15)' : 'none',
            transition: 'all 0.4s var(--ease-premium)'
          }}>
            <button
              style={{ color: '#444', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.3s' }}
              onClick={handleAttachmentClick}
              onMouseEnter={(e) => e.currentTarget.style.color = PURPLE}
              onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
            >
              <Paperclip size={18} />
            </button>
            <input
              id="pq-image-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleAttachmentSelected}
            />
            {attachment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #2a2a2a', background: '#0b0b0b' }}>
                <img src={attachment.preview} alt="Attachment preview" style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
                <button
                  onClick={() => setAttachment(null)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontWeight: 800 }}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              type="text"
              placeholder="Describe your idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={loading}
              style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', padding: '0 12px' }}
            />
            <button
              onClick={handleMic}
              style={{ color: '#444', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '4px', transition: '0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#a3e635'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#444'}
            >
              <Mic size={18} />
            </button>

            {/* Personality Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '6px', background: '#0d0d0d', borderRadius: '99px', border: '1px solid #222', padding: '2px' }}>
              <button
                onClick={() => setPersonality('bot')}
                title="Bot personality"
                style={{
                  padding: '6px 12px', borderRadius: '99px', border: 'none',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  background: personality === 'bot' ? '#a3e635' : 'transparent',
                  color: personality === 'bot' ? '#000' : '#666',
                  transition: 'all 0.15s',
                }}
              >🤖 Bot</button>
              <button
                onClick={() => setPersonality('human')}
                title="Human personality"
                style={{
                  padding: '6px 12px', borderRadius: '99px', border: 'none',
                  fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  background: personality === 'human' ? '#a3e635' : 'transparent',
                  color: personality === 'human' ? '#000' : '#666',
                  transition: 'all 0.15s',
                }}
              >👤 Human</button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || (!input.trim() && !attachment)}
              style={{
                width: '42px',
                height: '42px',
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#0a0a0a',
                border: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: loading || (!input.trim() && !attachment) ? 'not-allowed' : 'pointer',
                transition: '0.3s var(--ease-premium)',
                opacity: loading || (!input.trim() && !attachment) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && (input.trim() || attachment)) {
                  e.currentTarget.style.borderColor = '#6d28d9';
                  e.currentTarget.style.transform = 'scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Plus size={20} />
            </button>

          </div>
        </div>

        {/* MOBILE GLASS CARD INPUT */}
        <div className="mobile-only-input" style={{
          width: '100%',
          borderRadius: '20px',
          padding: '16px',
          display: 'none', // Overridden in CSS to flex for mobile
          flexDirection: 'column',
          gap: '12px',
          background: 'linear-gradient(#050505, #050505) padding-box, linear-gradient(135deg, #a3e635, #8b5cf6) border-box',
          border: '1.5px solid transparent',
          boxShadow: '0 0 20px rgba(163, 230, 53, 0.05), 0 0 20px rgba(139, 92, 246, 0.05)',
          transition: 'all 0.4s var(--ease-premium)',
          position: 'relative'
        }}>
          {attachment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '12px', border: '1px solid #2a2a2a', background: '#0b0b0b', width: 'max-content', marginBottom: '8px' }}>
              <img src={attachment.preview} alt="Attachment preview" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
              <button
                onClick={() => setAttachment(null)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ position: 'relative', width: '100%' }}>
            <textarea
              placeholder="Describe your idea..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                minHeight: '60px',
                resize: 'none',
                paddingRight: '24px'
              }}
            />
            <button style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', color: '#555', padding: 0 }}>
              <Maximize2 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Attachment & Mic inside dark circles */}
              <button
                onClick={handleAttachmentClick}
                style={{ color: '#aaa', width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Paperclip size={16} />
              </button>
              <button
                onClick={handleMic}
                style={{ color: '#aaa', width: '36px', height: '36px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Mic size={16} />
              </button>

              {/* Joined Pill for Bot / Human */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', padding: '3px', marginLeft: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => setPersonality('bot')}
                  disabled={loading}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    border: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: '700',
                    backgroundColor: personality === 'bot' ? '#a3e635' : 'transparent',
                    color: personality === 'bot' ? '#000' : '#888',
                    transition: 'all 0.2s'
                  }}
                >
                  🤖 Bot
                </button>
                <button
                  onClick={() => setPersonality('human')}
                  disabled={loading}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    border: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: '700',
                    backgroundColor: personality === 'human' ? '#a3e635' : 'transparent',
                    color: personality === 'human' ? '#000' : '#888',
                    transition: 'all 0.2s'
                  }}
                >
                  👤 Human
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!input.trim() && !attachment)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: (loading || (!input.trim() && !attachment)) ? 'rgba(255,255,255,0.1)' : '#a3e635',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (loading || (!input.trim() && !attachment)) ? '#555' : '#000',
                cursor: loading || (!input.trim() && !attachment) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || (!input.trim() && !attachment)) ? 'none' : '0 0 15px rgba(163, 230, 53, 0.4)',
                transition: 'all 0.3s'
              }}
            >
              <Sparkles size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
        </div>
  );
      {/* Creative Sub-Type Selector Modal */}
      {showSubTypeModal && currentMode === 'CREATIVE' && (
        <div className="creative-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowSubTypeModal(false)}>
          <div className="creative-modal-container" style={{
            background: 'radial-gradient(1200px 600px at 20% 0%, rgba(168, 85, 247, 0.12), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(219, 39, 119, 0.10), transparent 55%), #0b0b0b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '32px',
            padding: '48px',
            width: '95%',
            maxWidth: '980px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 90px rgba(0, 0, 0, 0.85)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '950', marginBottom: '12px', marginTop: 0, background: 'linear-gradient(135deg, #db2777 0%, #a855f7 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Choose Your Creative Type
              </h2>
            </div>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '40px', fontWeight: '500', lineHeight: '1.6' }}>
              Select your creative specialty to get perfectly tailored prompts and intelligent suggestions for your project.
            </p>

            <div className="creative-modal-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {creativeSubTypes.map((subType, idx) => (
                <button
                  key={subType.id}
                  className={`creative-item ${creativeSubType === subType.id ? 'creative-selected' : ''}`}
                  onClick={() => handleSubTypeSelect(subType.id)}
                  style={{
                    minHeight: '130px',
                    padding: '14px 10px',
                    borderRadius: '20px',
                    border: creativeSubType === subType.id ? '2px solid transparent' : '1.5px solid #222',
                    backgroundColor: creativeSubType === subType.id ? 'rgba(219, 39, 119, 0.10)' : 'rgba(255,255,255,0.03)',
                    backgroundImage: creativeSubType === subType.id ? 'linear-gradient(rgba(255,255,255,0.05), rgba(255,255,255,0.02)), linear-gradient(135deg, #db2777 0%, #a855f7 100%)' : 'none',
                    backgroundOrigin: 'border-box',
                    backgroundClip: creativeSubType === subType.id ? 'padding-box, border-box' : 'border-box',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `slideIn 0.5s ease-out ${idx * 0.05}s both`
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(219, 39, 119, 0.08)';
                    e.currentTarget.style.borderColor = '#db2777';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(219, 39, 119, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = creativeSubType === subType.id ? 'rgba(219, 39, 119, 0.12)' : '#111';
                    e.currentTarget.style.borderColor = creativeSubType === subType.id ? '#db2777' : '#222';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Background Glow Effect */}
                  {creativeSubType === subType.id && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(219, 39, 119, 0.05)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  )}

                  <span style={{
                    fontSize: '32px',
                    filter: creativeSubType === subType.id ? 'drop-shadow(0 0 12px #db2777)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    transition: 'all 0.3s ease-out'
                  }}>
                    {subType.icon}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                    {subType.label}
                  </span>
                  <span style={{ fontSize: '10px', color: '#555', position: 'relative', zIndex: 1 }}>
                    {subType.desc}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setShowSubTypeModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid #222',
                  backgroundColor: 'transparent',
                  color: '#888',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out',
                  fontSize: '14px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#222';
                  e.currentTarget.style.color = '#888';
                }}
              >
                Cancel
              </button>
              {/* Selection auto-closes modal; no continue button needed */}
            </div>
          </div>
        </div>
      )}
};

export default BottomInput;
