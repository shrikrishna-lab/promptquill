import React from 'react';
import { X } from 'lucide-react';

export const ProOnlyModal = ({ show, onClose, onUpgrade, message, title = "Pro Feature" }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90vw',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '12px'
          }}>
            🚀
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 8px 0'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a3e635',
            margin: 0
          }}>
            Unlock powerful startup analysis
          </p>
        </div>

        {/* Message */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '15px',
          color: '#ccc',
          lineHeight: '1.6'
        }}>
          {message}
        </div>

        {/* Features List */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#a3e635', fontSize: '16px' }}>✓</span>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                10-Section Brief
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                Executive summary, market size, competitors, funding & more
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#a3e635', fontSize: '16px' }}>✓</span>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                Data-Driven Analysis
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                TAM/SAM/SOM quantification, competitor positioning, unit economics
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ color: '#a3e635', fontSize: '16px' }}>✓</span>
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>
                Actionable Strategy
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                GTM roadmap, funding requirements, 90-day success metrics
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          <button
            onClick={onUpgrade}
            style={{
              padding: '14px 24px',
              backgroundColor: '#a3e635',
              color: '#080808',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#bce64a';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#a3e635';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🎉 Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#666';
              e.currentTarget.style.backgroundColor = '#222';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.backgroundColor = '#1a1a1a';
            }}
          >
            Maybe Later
          </button>
        </div>

        {/* Footer Text */}
        <p style={{
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: 0
        }}>
          Pro membership includes unlimited startups, market research, and export features
        </p>
      </div>
    </div>
  );
};

export const InsufficientCreditsModal = ({ show, onClose, required, current, onTopup }) => {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '450px',
        width: '90vw',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
        
        <h2 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#fff',
          margin: '0 0 12px 0'
        }}>
          Not Enough Credits
        </h2>
        
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <div style={{ color: '#888', marginBottom: '8px' }}>
            You need <span style={{ color: '#ff6b6b', fontWeight: '700' }}>{required} credits</span> for STARTUP mode,
          </div>
          <div style={{ color: '#888' }}>
            but only have <span style={{ color: '#ffa94d', fontWeight: '700' }}>{current} credits</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column'
        }}>
          <button
            onClick={onTopup}
            style={{
              padding: '14px 24px',
              backgroundColor: '#a3e635',
              color: '#080808',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            💰 Top Up Credits
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 24px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '16px',
          marginBottom: 0
        }}>
          Or try <strong>Startup Lite</strong> (10 credits) for a free preview
        </p>
      </div>
    </div>
  );
};
