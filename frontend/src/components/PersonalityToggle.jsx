const styles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0',
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '30px',
    padding: '4px',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
  },
  option: {
    padding: '8px 20px',
    borderRadius: '26px',
    fontSize: '13px',
    fontWeight: 600,
    zIndex: 2,
    position: 'relative',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
  },
  active: { color: '#fff' },
  inactive: { color: '#555' },
  pill: {
    position: 'absolute',
    top: '4px',
    bottom: '4px',
    borderRadius: '26px',
    zIndex: 1,
    transition: 'left 0.3s ease, background 0.3s ease',
  },
};

export default function PersonalityToggle({ value, onChange }) {
  const isBot = value === 'bot';

  return (
    <div
      style={styles.wrapper}
      onClick={() => onChange(isBot ? 'human' : 'bot')}
    >
      <div
        style={{
          ...styles.pill,
          left: isBot ? '4px' : '50%',
          right: isBot ? '50%' : '4px',
          background: isBot ? '#3b82f6' : '#8b5cf6',
        }}
      />
      <span style={{ ...styles.option, ...(isBot ? styles.active : styles.inactive) }}>
        Bot
      </span>
      <span style={{ ...styles.option, ...(!isBot ? styles.active : styles.inactive) }}>
        Human
      </span>
    </div>
  );
}
