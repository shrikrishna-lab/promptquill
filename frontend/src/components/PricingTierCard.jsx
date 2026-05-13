import React, { useState } from 'react';
import { Check, X, Zap, Crown, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PricingTierCard - Displays a single pricing tier
 */

const PricingTierCard = ({ tier, profile }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('PromptQuill is self-hosted — configure your own payment setup');
    }, 1500);
  };

  const monthlyPrice = tier.interval === 'year' 
    ? Math.round(tier.amount / 12) 
    : tier.amount;

  // Define which features are Pro-exclusive
  const exclusiveFeatures = [
    'PDF Export',
    'PDF + Cursor Export',
    'Priority AI Processing',
    'Pro Badge',
    'Full Reddit Validator',
    'Clean Share Cards (No Watermark)',
    'Clean Share Cards'
  ];

  const isFeatureExclusive = (featureName) => {
    return exclusiveFeatures.some(exclusive => featureName.includes(exclusive));
  };

  return (
    <div 
      style={{ 
        padding: '40px', 
        backgroundColor: tier.highlighted 
          ? 'rgba(109, 40, 217, 0.05)' 
          : '#0d0d0d',
        border: tier.highlighted 
          ? '2px solid #6d28d9' 
          : '1px solid #1a1a1a',
        borderRadius: '24px', 
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: tier.highlighted ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={e => !tier.highlighted && (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={e => !tier.highlighted && (e.currentTarget.style.borderColor = '#1a1a1a')}
    >
      {/* Popular Badge */}
      {tier.highlighted && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '-30px', 
          backgroundColor: '#6d28d9', 
          color: '#fff', 
          padding: '4px 30px', 
          fontSize: '10px', 
          fontWeight: '900', 
          transform: 'rotate(45deg)', 
          letterSpacing: '1px',
          zIndex: 10
        }}>
          ⭐ POPULAR
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '800', 
          color: tier.highlighted ? '#a3e635' : '#ccc',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {tier.highlighted && <Zap size={18} color="#a3e635" />}
          {tier.name}
        </h3>
        <p style={{ fontSize: '13px', color: '#666' }}>{tier.description}</p>
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '36px', fontWeight: '900', color: '#fff' }}>
            {tier.currency}{monthlyPrice.toLocaleString()}
          </span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            /{tier.interval === 'year' ? 'month billed yearly' : tier.interval}
          </span>
        </div>
        {tier.interval === 'year' && (
          <p style={{ fontSize: '12px', color: '#a3e635', fontWeight: '600' }}>
            ✓ Save 28% vs monthly ({tier.currency}{(monthlyPrice * 12).toLocaleString()}/year)
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button 
        onClick={handlePayment}
        style={{ 
          width: '100%', 
          padding: '14px 16px', 
          borderRadius: '12px', 
          backgroundColor: tier.highlighted ? '#a3e635' : '#111',
          border: tier.highlighted ? 'none' : '1px solid #222',
          color: tier.highlighted ? '#000' : '#fff', 
          fontSize: '14px', 
          fontWeight: '800', 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '24px'
        }}
        onMouseEnter={e => {
          if (tier.highlighted) {
            e.currentTarget.style.backgroundColor = '#b8ff2b';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(163, 230, 53, 0.3)';
          } else {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
          }
        }}
        onMouseLeave={e => {
          if (tier.highlighted) {
            e.currentTarget.style.backgroundColor = '#a3e635';
            e.currentTarget.style.boxShadow = 'none';
          } else {
            e.currentTarget.style.backgroundColor = '#111';
          }
        }}
      >
        {tier.cta} → {tier.currency}{tier.amount.toLocaleString()}
      </button>

      {/* Features List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          What's included
        </p>
        {tier.features.map((feature, i) => {
          const isExclusive = feature.included && isFeatureExclusive(feature.name);
          
          return (
            <div 
              key={i} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                fontSize: '13px',
                padding: isExclusive ? '8px 12px' : '0',
                borderRadius: isExclusive ? '8px' : '0',
                backgroundColor: isExclusive ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                border: isExclusive ? '1px solid rgba(217, 119, 6, 0.3)' : 'none'
              }}
            >
              {feature.included ? (
                isExclusive ? (
                  <Crown size={14} color="#d97706" strokeWidth={2.5} />
                ) : (
                  <Check size={14} color={tier.highlighted ? '#a3e635' : '#555'} strokeWidth={3} />
                )
              ) : (
                <X size={14} color="#333" strokeWidth={3} />
              )}
              <span style={{ 
                color: isExclusive ? '#d97706' : (feature.included ? (tier.highlighted ? '#ccc' : '#888') : '#333'),
                fontWeight: isExclusive ? '700' : (feature.included ? '500' : '400')
              }}>
                {feature.name}
              </span>
              {isExclusive && (
                <span style={{ 
                  fontSize: '9px', 
                  fontWeight: '800',
                  color: '#d97706',
                  marginLeft: 'auto',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  PRO
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '16px', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: '11px',
        color: '#555',
        textAlign: 'center'
      }}>
        🔒 Secure payment • Instant activation
      </div>

      {/* Processing Animation Overlay */}
      {isProcessing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(16px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes pulseGlow {
              0%, 100% { box-shadow: 0 0 40px rgba(163, 230, 53, 0.2); transform: scale(1); }
              50% { box-shadow: 0 0 80px rgba(163, 230, 53, 0.6); transform: scale(1.05); }
            }
            @keyframes spinRing {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(163, 230, 53, 0.1)',
              animation: 'pulseGlow 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '2px dashed rgba(163, 230, 53, 0.5)',
              animation: 'spinRing 8s linear infinite'
            }} />
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(163, 230, 53, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(163, 230, 53, 0.4)'
            }}>
              <Lock size={28} color="#a3e635" />
            </div>
          </div>
          
          <h2 style={{
            color: '#fff',
            fontSize: '28px',
            fontWeight: '900',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            Securing Connection
          </h2>
          <p style={{
            color: '#a3e635',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Loader2 size={16} className="animate-spin" /> Preparing Checkout...
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingTierCard;
