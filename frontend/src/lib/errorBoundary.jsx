import React from 'react';

/**
 * Global Error Boundary Component
 * Catches errors and provides graceful fallback UI instead of crashing
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
    
    // Log to backend if possible
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        fetch(`${backendUrl}/api/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            component: errorInfo.componentStack
          }),
          signal: controller.signal
        }).catch(() => {});
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#080808',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', color: '#ef4444' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
              {this.state.error?.message || 'An unexpected error occurred. Our team has been notified.'}
            </p>
            <div style={{
              padding: '16px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #222',
              marginBottom: '24px',
              textAlign: 'left',
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '12px',
              color: '#666',
              fontFamily: 'monospace'
            }}>
              {this.state.error?.stack?.slice(0, 500)}...
            </div>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '14px 28px',
                backgroundColor: '#a3e635',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                transition: '0.3s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
