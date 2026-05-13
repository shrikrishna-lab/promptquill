import React from 'react';
import { Crown } from 'lucide-react';

/**
 * ProExclusiveBadge - Universal component for marking Pro-exclusive features
 * Replaces diamond emoji (💎) with golden premium styling
 * 
 * Usage:
 * <ProExclusiveBadge featureName="Expert Angle" />
 * OR
 * <ProExclusiveBadge featureName="Expert Angle" variant="inline" />
 * OR
 * <ProExclusiveBadge featureName="Expert Angle" variant="badge" />
 */

const ProExclusiveBadge = ({ 
  featureName, 
  variant = 'inline',  // 'inline', 'badge', 'tab', 'chip'
  showIcon = true,
  size = 'md'  // 'sm', 'md', 'lg'
}) => {
  
  const sizeConfig = {
    sm: {
      padding: '4px 8px',
      fontSize: '10px',
      iconSize: 12,
      gap: '4px'
    },
    md: {
      padding: '6px 12px',
      fontSize: '12px',
      iconSize: 14,
      gap: '6px'
    },
    lg: {
      padding: '8px 16px',
      fontSize: '14px',
      iconSize: 16,
      gap: '8px'
    }
  };

  const config = sizeConfig[size];

  if (variant === 'inline') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        padding: config.padding,
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        border: '1px solid rgba(217, 119, 6, 0.3)',
        borderRadius: '8px',
        color: '#d97706',
        fontWeight: '700',
        fontSize: config.fontSize,
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        {showIcon && <Crown size={config.iconSize} color="#d97706" strokeWidth={2.5} />}
        <span>{featureName}</span>
        <span style={{ marginLeft: '4px', fontSize: config.fontSize }}>PRO</span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span style={{
        display: 'inline-block',
        padding: config.padding,
        backgroundColor: '#d97706',
        color: '#fff',
        borderRadius: '12px',
        fontSize: config.fontSize,
        fontWeight: '800',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        marginLeft: '6px'
      }}>
        👑 PRO
      </span>
    );
  }

  if (variant === 'tab') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: config.gap,
        padding: config.padding,
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: '6px',
        color: '#d97706',
        fontWeight: '700',
        fontSize: config.fontSize,
        width: '100%',
        transition: 'all 0.2s ease'
      }}>
        {showIcon && <Crown size={config.iconSize} color="#d97706" strokeWidth={2.5} />}
        <span style={{ flex: 1 }}>{featureName}</span>
        <span style={{ 
          fontSize: '9px', 
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          PRO
        </span>
      </div>
    );
  }

  if (variant === 'chip') {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: config.padding,
        backgroundColor: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(251, 191, 36, 0.05))',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        borderRadius: '100px',
        color: '#d97706',
        fontWeight: '700',
        fontSize: config.fontSize,
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        {showIcon && <Crown size={config.iconSize} color="#d97706" strokeWidth={2} />}
        {featureName}
      </div>
    );
  }

  // Default: inline
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: config.gap,
      padding: config.padding,
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      border: '1px solid rgba(217, 119, 6, 0.3)',
      borderRadius: '8px',
      color: '#d97706',
      fontWeight: '700',
      fontSize: config.fontSize,
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }}>
      {showIcon && <Crown size={config.iconSize} color="#d97706" strokeWidth={2.5} />}
      <span>{featureName}</span>
      <span style={{ marginLeft: '4px', fontSize: config.fontSize }}>PRO</span>
    </div>
  );
};

export default ProExclusiveBadge;
