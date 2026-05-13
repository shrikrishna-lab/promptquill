import React from 'react';
import { ArrowRight } from 'lucide-react';

export const StartupLiteUpsellCard = ({ onUpgrade }) => {
  return (
    <div style={{
      marginTop: '32px',
      padding: '24px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #a3e635',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(163, 230, 53, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left: Text Content */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#a3e635',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Upgrade to Pro
            </span>
          </div>

          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            margin: '0 0 12px 0',
            lineHeight: '1.4'
          }}>
            Get the Full 10-Section Startup Brief
          </h3>

          <p style={{
            fontSize: '14px',
            color: '#ccc',
            margin: '0 0 16px 0',
            lineHeight: '1.6'
          }}>
            Go beyond the preview. Get market data, competitor analysis, GTM strategy, MVP roadmap, funding requirements, and comprehensive risk analysis.
          </p>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: '#aaa'
          }}>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#a3e635' }}>✓</span>
              Market sizing (TAM/SAM/SOM breakdowns)
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#a3e635' }}>✓</span>
              Competitor positioning & differentiation
            </li>
            <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#a3e635' }}>✓</span>
              Go-to-market strategy with timelines
            </li>
          </ul>
        </div>

        {/* Right: CTA Button */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={onUpgrade}
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: '#a3e635',
              color: '#080808',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
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
            Upgrade to Pro
            <ArrowRight size={16} />
          </button>

          <p style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
            margin: 0
          }}>
            First month at 50% off
          </p>
        </div>
      </div>

      {/* Bottom: Pricing */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #333',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        Pro: Unlimited briefs + market research + exports. Free: 10-credit daily limit
      </div>
    </div>
  );
};

export default StartupLiteUpsellCard;
