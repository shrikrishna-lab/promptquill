const modes = [
  { id: 'STARTUP', icon: '\uD83D\uDE80', label: 'Startup', desc: 'Complete business strategy brief' },
  { id: 'CODING', icon: '\uD83D\uDCBB', label: 'Coding', desc: 'Technical architecture & roadmap' },
  { id: 'CONTENT', icon: '\uD83D\uDCDD', label: 'Content', desc: 'Content & marketing strategy' },
  { id: 'CREATIVE', icon: '\uD83C\uDFA8', label: 'Creative', desc: 'Creative vision & execution' },
  { id: 'GENERAL', icon: '\u26A1', label: 'General', desc: 'Multi-angle strategic analysis' },
  { id: 'STARTUP_LITE', icon: '\uD83D\uDD0D', label: 'Quick Startup', desc: 'Fast idea validation' },
];

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  card: {
    backgroundColor: '#0d0d0d',
    border: '2px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  selected: {
    borderColor: '#a3e635',
  },
  icon: { fontSize: '32px' },
  label: { color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 },
  desc: { color: '#888', fontSize: '12px', margin: 0, lineHeight: 1.4 },
};

export default function ModeSelector({ selectedMode, onSelect }) {
  return (
    <div style={styles.grid}>
      {modes.map(m => {
        const isSelected = selectedMode === m.id;
        return (
          <div
            key={m.id}
            style={{
              ...styles.card,
              ...(isSelected ? styles.selected : {}),
            }}
            onClick={() => onSelect(m.id)}
            onMouseEnter={e => {
              if (!isSelected) e.currentTarget.style.borderColor = '#555';
            }}
            onMouseLeave={e => {
              if (!isSelected) e.currentTarget.style.borderColor = '#1a1a1a';
            }}
          >
            <span style={styles.icon}>{m.icon}</span>
            <p style={styles.label}>{m.label}</p>
            <p style={styles.desc}>{m.desc}</p>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 1024px) {
          .mode-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .mode-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
