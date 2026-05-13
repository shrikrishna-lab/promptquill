import { useState, useEffect } from 'react';

const messages = [
  'Analyzing your idea...',
  'Building your strategy...',
  'Crafting expert content...',
  'Finalizing your brief...',
];

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '60px 20px',
  },
  orbContainer: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#a3e635',
    boxShadow: '0 0 40px rgba(163, 230, 53, 0.5), 0 0 80px rgba(163, 230, 53, 0.2)',
    zIndex: 2,
  },
  ring: (index) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(163, 230, 53, 0.3)',
    zIndex: 1,
    animation: `spin ${2 + index * 0.5}s linear infinite`,
  }),
  message: {
    color: '#888',
    fontSize: '15px',
    fontWeight: 500,
    textAlign: 'center',
    minHeight: '24px',
    transition: 'opacity 0.3s ease',
  },
};

export default function LoadingOrb({ message }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const displayed = message ?? messages[msgIndex];

  return (
    <div style={styles.wrapper}>
      <div style={styles.orbContainer}>
        <div style={styles.ring(0)} />
        <div style={styles.ring(1)} />
        <div style={styles.ring(2)} />
        <div style={styles.orb} />
      </div>
      <span style={{ ...styles.message, opacity: fade ? 1 : 0 }}>{displayed}</span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
