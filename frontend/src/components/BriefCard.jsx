const modeColors = {
  STARTUP: '#a3e635',
  CODING: '#3b82f6',
  CONTENT: '#f59e0b',
  CREATIVE: '#ec4899',
  GENERAL: '#8b5cf6',
  STARTUP_LITE: '#06b6d4',
};

const styles = {
  card: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  date: {
    color: '#555',
    fontSize: '12px',
  },
  tabCount: {
    color: '#888',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function BriefCard({ brief, onClick }) {
  const modeColor = modeColors[brief.mode] || '#888';

  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(163, 230, 53, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <p style={styles.title}>{brief.title || 'Untitled Brief'}</p>

      <div style={styles.badgeRow}>
        <span style={{ ...styles.badge, backgroundColor: modeColor + '20', color: modeColor }}>
          {brief.mode}
        </span>
        {brief.personality && (
          <span style={{ ...styles.badge, backgroundColor: '#1a1a1a', color: '#888' }}>
            {brief.personality}
          </span>
        )}
      </div>

      <div style={styles.meta}>
        <span style={styles.date}>{timeAgo(brief.created_at)}</span>
        <span style={styles.tabCount}>
          {brief.tab_count || '?'} tab{(brief.tab_count || 0) !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
