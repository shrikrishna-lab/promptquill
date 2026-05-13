import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCw, Zap, Clock } from 'lucide-react';

/**
 * Professional retry UI component
 * Shows graceful retry messages instead of error popups
 */
const GenerationRetry = ({ 
  isActive = false, 
  message = 'High demand facing',
  retryCount = 0,
  maxRetries = 3,
  onRetry = () => {},
  onCancel = () => {}
}) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [fadeIn, setFadeIn] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(3);
  const [autoRetryActive, setAutoRetryActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      setFadeIn(true);
      // Show different messages based on situation
      if (retryCount === 0) {
        setDisplayMessage('🌩️ High demand facing');
      } else if (retryCount === 1) {
        setDisplayMessage('⏳ Trying another provider');
      } else if (retryCount >= 2) {
        setDisplayMessage('🔄 Retrying...');
      }
      
      // Auto-retry after 2 seconds (visual delay)
      const timer = setTimeout(() => {
        setAutoRetryActive(true);
        setSecondsRemaining(3);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setFadeIn(false);
      setAutoRetryActive(false);
    }
  }, [isActive, retryCount]);

  // Countdown timer for auto-retry
  useEffect(() => {
    if (!autoRetryActive || secondsRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoRetryActive, secondsRemaining]);

  // Auto-retry when countdown reaches 0
  useEffect(() => {
    if (autoRetryActive && secondsRemaining === 0 && retryCount < maxRetries) {
      onRetry();
    }
  }, [autoRetryActive, secondsRemaining, retryCount, maxRetries, onRetry]);

  if (!isActive) return null;

  const isMaxRetriesReached = retryCount >= maxRetries;
  const canManualRetry = retryCount < maxRetries;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: fadeIn ? 'auto' : 'none',
      }}
    >
      {/* Main Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(163, 230, 53, 0.2)',
          borderRadius: '12px',
          padding: '20px 24px',
          maxWidth: '400px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(163, 230, 53, 0.1)',
        }}
      >
        {/* Header with Icon */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: isMaxRetriesReached
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(163, 230, 53, 0.1)',
              flexShrink: 0,
            }}
          >
            {isMaxRetriesReached ? (
              <AlertCircle size={20} style={{ color: '#ef4444' }} />
            ) : (
              <RotateCw
                size={20}
                style={{
                  color: '#a3e635',
                  animation: 'spin 2s linear infinite',
                }}
              />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: isMaxRetriesReached ? '#fca5a5' : '#a3e635',
                marginBottom: '4px',
              }}
            >
              {displayMessage}
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              {isMaxRetriesReached
                ? 'All providers temporarily unavailable'
                : `Attempt ${retryCount + 1} of ${maxRetries}`}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div
          style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              height: '100%',
              background:
                'linear-gradient(90deg, #a3e635 0%, #6d28d9 100%)',
              width: `${((retryCount + 1) / maxRetries) * 100}%`,
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </div>

        {/* Message */}
        {autoRetryActive && !isMaxRetriesReached && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#a3e635',
              marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(163, 230, 53, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(163, 230, 53, 0.1)',
            }}
          >
            <Clock size={14} />
            <span>Auto-retrying in {secondsRemaining}s...</span>
          </div>
        )}

        {isMaxRetriesReached && (
          <div
            style={{
              fontSize: '13px',
              color: '#fca5a5',
              marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              lineHeight: '1.5',
            }}
          >
            We're experiencing high demand. Please wait a moment and try again.
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {canManualRetry && (
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                padding: '10px 14px',
                background:
                  autoRetryActive
                    ? 'rgba(163, 230, 53, 0.1)'
                    : 'rgba(163, 230, 53, 0.2)',
                border: '1px solid rgba(163, 230, 53, 0.3)',
                borderRadius: '6px',
                color: '#a3e635',
                fontSize: '13px',
                fontWeight: '600',
                cursor: autoRetryActive ? 'not-allowed' : 'pointer',
                opacity: autoRetryActive ? 0.6 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!autoRetryActive) {
                  e.currentTarget.style.background = 'rgba(163, 230, 53, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = autoRetryActive
                  ? 'rgba(163, 230, 53, 0.1)'
                  : 'rgba(163, 230, 53, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              disabled={autoRetryActive}
            >
              <RotateCw size={14} />
              {autoRetryActive ? `Retrying (${secondsRemaining}s)` : 'Retry Now'}
            </button>
          )}

          <button
            onClick={onCancel}
            style={{
              flex: isMaxRetriesReached ? 1 : 0.8,
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#888',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#999';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#888';
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GenerationRetry;
