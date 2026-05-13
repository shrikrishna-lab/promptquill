import React from 'react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console
    console.error('💥 Error caught by ErrorBoundary:', error, errorInfo);
    
    // Optional: Log to backend
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      fetch(`${backendUrl}/api/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          component: errorInfo.componentStack
        })
      });
    } catch (e) {
      console.warn('Failed to log error to backend');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: '#111',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #333',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Something went wrong</h1>
            <p style={{ color: '#a3a3a3', marginBottom: '24px' }}>
              We encountered an unexpected error. Please refresh the page to continue.
            </p>
            <div style={{
              backgroundColor: '#000',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #222',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px',
              fontSize: '12px',
              color: '#ef4444'
            }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#a3e635',
                color: '#000',
                fontWeight: 'bold',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
