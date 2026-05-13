import React from 'react';

/**
 * Versatile loading spinner component with multiple variants
 * 
 * Props:
 * - variant: 'default', 'pulse', 'dots', 'rings', 'wave', 'bars', 'orbit' (default: 'default')
 * - size: 'sm', 'md', 'lg' (default: 'md')
 * - color: CSS color or 'lime', 'purple', 'pink', 'blue' (default: 'lime')
 * - text: Loading text to display
 * - fullHeight: Boolean, if true centers vertically and takes full height
 */
export const LoadingSpinner = ({ 
  variant = 'default',
  size = 'md',
  color = 'lime',
  text,
  fullHeight = false,
  className
}) => {
  const colorMap = {
    lime: '#a3e635',
    purple: '#a78bfa',
    pink: '#f472b6',
    blue: '#60a5fa',
  };

  const actualColor = color.startsWith('#') ? color : (colorMap[color] || color);

  const sizeMap = {
    sm: { spinner: '24px', gap: '4px' },
    md: { spinner: '40px', gap: '6px' },
    lg: { spinner: '64px', gap: '8px' },
  };

  const dim = sizeMap[size];

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullHeight && { minHeight: '100vh' }),
  };

  const textStyle = {
    marginTop: '16px',
    color: '#888',
    fontSize: size === 'lg' ? '14px' : size === 'sm' ? '12px' : '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  };

  // Default spinner - rotating circle
  if (variant === 'default') {
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            width: dim.spinner,
            height: dim.spinner,
            border: `3px solid rgba(163, 230, 53, 0.1)`,
            borderTopColor: actualColor,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Pulse variant - fading circles
  if (variant === 'pulse') {
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            width: dim.spinner,
            height: dim.spinner,
            borderRadius: '50%',
            backgroundColor: actualColor,
            opacity: '0.5',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Dots variant - bouncing dots
  if (variant === 'dots') {
    return (
      <div style={containerStyle} className={className}>
        <div style={{ display: 'flex', gap: dim.gap, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                height: size === 'sm' ? '6px' : size === 'lg' ? '12px' : '8px',
                borderRadius: '50%',
                backgroundColor: actualColor,
                animation: 'bounce 1.4s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Rings variant - overlapping rotating rings
  if (variant === 'rings') {
    const ringSize = dim.spinner;
    const ringGap = size === 'sm' ? '3px' : size === 'lg' ? '8px' : '5px';
    
    return (
      <div style={containerStyle} className={className}>
        <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: `${i * ringGap}px`,
                border: `2px solid transparent`,
                borderTopColor: actualColor,
                borderRightColor: actualColor,
                borderRadius: '50%',
                animation: `spin ${2 + i * 0.3}s linear infinite`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
              }}
            />
          ))}
        </div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Wave variant - animated wave bars
  if (variant === 'wave') {
    const barCount = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
    const barWidth = size === 'sm' ? '3px' : size === 'lg' ? '6px' : '4px';
    
    return (
      <div style={containerStyle} className={className}>
        <div style={{ display: 'flex', gap: dim.gap, alignItems: 'flex-end' }}>
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              style={{
                width: barWidth,
                height: dim.spinner,
                backgroundColor: actualColor,
                borderRadius: '2px',
                animation: 'waveBar 1s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Bars variant - horizontal bars that grow
  if (variant === 'bars') {
    return (
      <div style={containerStyle} className={className}>
        <div style={{ width: '80px' }}>
          <div
            style={{
              height: size === 'sm' ? '3px' : size === 'lg' ? '6px' : '4px',
              backgroundColor: actualColor,
              borderRadius: '2px',
              animation: 'barGrow 2s ease-in-out infinite',
              boxShadow: `0 0 10px ${actualColor}40`,
            }}
          />
        </div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  // Orbit variant - rotating dots in orbit
  if (variant === 'orbit') {
    return (
      <div style={containerStyle} className={className}>
        <div style={{ position: 'relative', width: dim.spinner, height: dim.spinner }}>
          {/* Center dot */}
          <div
            style={{
              position: 'absolute',
              inset: '50%',
              width: '4px',
              height: '4px',
              backgroundColor: actualColor,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          />
          {/* Orbiting dots */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: '0',
                borderRadius: '50%',
                border: `2px solid ${actualColor}20`,
                animation: `orbitSpin ${3 + i * 0.5}s linear infinite`,
                animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '50%',
                  width: '6px',
                  height: '6px',
                  backgroundColor: actualColor,
                  borderRadius: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          ))}
        </div>
        {text && <div style={textStyle}>{text}</div>}
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
