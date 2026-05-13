import React from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Full-page loading screen with customizable content and animations
 * 
 * Props:
 * - title: Loading title text
 * - subtitle: Loading subtitle/description
 * - spinnerVariant: Spinner variant to use (default: 'default')
 * - showBackground: Boolean, show animated background (default: true)
 * - messages: Array of messages to cycle through
 * - icon: Custom icon/emoji to display
 */
export const FullPageLoadingScreen = ({
  title = 'Loading',
  subtitle,
  spinnerVariant = 'default',
  showBackground = true,
  messages,
  icon = '✨',
}) => {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (!messages || messages.length <= 1) return;
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      {showBackground && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(163, 230, 53, 0.05) 0%, transparent 50%)',
              animation: 'bgPan 15s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 80% 80%, rgba(109, 40, 217, 0.05) 0%, transparent 50%)',
              animation: 'bgPan 20s ease-in-out infinite reverse',
            }}
          />
          {/* Grid pattern */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.1,
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a3e635" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </>
      )}

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '500px',
          padding: '40px',
        }}
      >
        {/* Icon */}
        {icon && (
          <div
            style={{
              fontSize: '64px',
              marginBottom: '24px',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            {icon}
          </div>
        )}

        {/* Spinner */}
        <div style={{ marginBottom: '40px' }}>
          <LoadingSpinner variant={spinnerVariant} size="lg" color="lime" />
        </div>

        {/* Title */}
        {title && (
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '12px',
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </h1>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: '#888',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Rotating Messages */}
        {messages && messages.length > 0 && (
          <div
            style={{
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#a3e635',
                fontWeight: '700',
                letterSpacing: '1px',
                animation: 'fadeIn 0.5s ease-in-out',
              }}
              key={messageIndex}
            >
              {messages[messageIndex]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullPageLoadingScreen;
