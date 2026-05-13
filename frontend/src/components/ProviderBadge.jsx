const providerColors = {
  groq: '#a3e635',
  gemini: '#4285F4',
  cerebras: '#8b5cf6',
  openrouter: '#f59e0b',
  cloudflare: '#f6821f',
};

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    fontSize: '12px',
    fontWeight: 600,
    color: '#888',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

export default function ProviderBadge({ provider }) {
  const key = provider?.toLowerCase() || '';
  const dotColor = providerColors[key] || '#555';

  return (
    <span style={styles.badge}>
      <span style={{ ...styles.dot, backgroundColor: dotColor }} />
      {provider ? provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase() : 'Unknown'}
    </span>
  );
}
