import React, { useState, useCallback, useEffect } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

/**
 * Professional Toast/Notification System
 * Replaces browser alert() with beautiful UI notifications
 */

// Add global CSS for animations
const injectStyles = () => {
  if (document.getElementById('notification-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
};

const ToastContainer = ({ notifications }) => {
  useEffect(() => {
    injectStyles();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px',
      pointerEvents: 'none',
    }}>
      {notifications.map(notif => (
        <Toast key={notif.id} notification={notif} />
      ))}
    </div>
  );
};

const Toast = ({ notification }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      notification.remove();
    }, 300);
  };

  const typeStyles = {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      icon: Check,
      iconColor: '#22c55e',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      icon: AlertCircle,
      iconColor: '#ef4444',
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.1)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      icon: AlertCircle,
      iconColor: '#fbbf24',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      icon: Info,
      iconColor: '#3b82f6',
    },
  };

  const style = typeStyles[notification.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div
      style={{
        background: style.bg,
        border: style.border,
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: isExiting ? 'slideOut 0.3s ease' : 'slideIn 0.3s ease',
        pointerEvents: 'auto',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ color: style.iconColor, marginTop: '2px', flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {notification.title && (
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
            {notification.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4', wordBreak: 'break-word' }}>
          {notification.message}
        </div>
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
          padding: '0',
          flexShrink: 0,
          marginTop: '2px',
        }}
        onMouseEnter={(e) => e.target.style.color = '#888'}
        onMouseLeave={(e) => e.target.style.color = '#666'}
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Hook for managing notifications
 * Usage:
 *   const { notify, NotificationContainer } = useNotification();
 *   notify.success('Operation successful!');
 *   notify.error('Something went wrong', 'Error Title');
 *   notify.warning('Please be careful');
 *   notify.info('Here is some info');
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', title = null) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      title,
      remove: () => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      },
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 4 seconds
    const timeout = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);

    return { id, clear: () => clearTimeout(timeout) };
  }, []);

  const notify = {
    success: (message, title) => addNotification(message, 'success', title || '✓ Success'),
    error: (message, title) => addNotification(message, 'error', title || '✗ Error'),
    warning: (message, title) => addNotification(message, 'warning', title || '⚠ Warning'),
    info: (message, title) => addNotification(message, 'info', title),
  };

  const NotificationContainer = () => <ToastContainer notifications={notifications} />;

  return { notify, NotificationContainer };
};
