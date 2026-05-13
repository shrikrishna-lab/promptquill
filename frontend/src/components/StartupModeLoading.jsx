import React, { useState, useEffect } from 'react';

export const StartupModeLoading = ({ mode = 'STARTUP', elapsed = 0 }) => {
  const messages = [
    "⚡ Analyzing market landscape...",
    "💰 Building revenue model...",
    "🏆 Mapping competitor space...",
    "🚀 Crafting your GTM strategy...",
    "✨ Finalizing your startup brief..."
  ];
  
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLongRunning, setIsLongRunning] = useState(false);

  useEffect(() => {
    // Cycle through messages every 3-4 seconds
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    },  3500);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show "still working" message after 30 seconds
    if (elapsed > 30000) {
      setIsLongRunning(true);
    }
  }, [elapsed]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '32px',
      backgroundColor: '#0a0a0a',
      borderRadius: '12px',
      border: '1px solid #1a1a1a',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333',
      }}>
        <span style={{ fontSize: '24px' }}>⚡</span>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#a3e635' }}>
            High Power Mode
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            Generating comprehensive startup brief
          </div>
        </div>
      </div>

      {/* Spinner */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #a3e635',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>

      {/* Cycling Messages */}
      <div style={{
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <div key={messageIndex} style={{
          fontSize: '16px',
          color: '#888',
          animation: 'fadeInOut 3.5s ease-in-out',
          fontWeight: '500'
        }}>
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          {messages[messageIndex]}
        </div>
      </div>

      {/* Time Estimates */}
      <div style={{
        fontSize: '13px',
        color: '#666',
        textAlign: 'center',
        padding: '12px',
        backgroundColor: '#080808',
        borderRadius: '6px',
        border: '1px solid #1a1a1a'
      }}>
        {elapsed < 25000 ? (
          <>
            <div>⏱️ This usually takes 15–25 seconds</div>
            <div style={{ marginTop: '6px', opacity: 0.8 }}>
              We're building something comprehensive...
            </div>
          </>
        ) : (
          <>
            <div>Still working... 🔧</div>
            <div style={{ marginTop: '6px', opacity: 0.8 }}>
              STARTUP briefs are deeply detailed, almost there...
            </div>
          </>
        )}
      </div>

      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center'
      }}>
        {messages.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: idx <= messageIndex ? '#a3e635' : '#333',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const StartupModeSuccess = ({ mode = 'STARTUP' }) => {
  const [showMessage, setShowMessage] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showMessage) return null;

  const message = mode === 'STARTUP' 
    ? "✅ Full Startup Brief Ready" 
    : "✅ Startup Brief Preview Ready";

  return (
    <div style={{
      padding: '16px 24px',
      backgroundColor: '#1a3a1a',
      border: '1px solid #2d5a2d',
      borderRadius: '8px',
      color: '#4ade80',
      fontWeight: '600',
      textAlign: 'center',
      animation: 'slideDown 0.4s ease-out',
    }}>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {message}
    </div>
  );
};
