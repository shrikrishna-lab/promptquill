const styles = {
  wrapper: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a1a',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
  },
  body: {
    padding: '20px',
    color: '#ccc',
    fontSize: '14px',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  placeholder: {
    padding: '48px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#555',
  },
  lock: { fontSize: '36px' },
  placeholderText: { fontSize: '14px', textAlign: 'center', maxWidth: '280px' },
};

export default function TabViewer({ tabContent, tabName }) {
  const hasContent = tabContent && tabContent.trim().length > 0;

  return (
    <div style={styles.wrapper}>
      {tabName && <div style={styles.header}>{tabName}</div>}
      {hasContent ? (
        <div style={styles.body}>{tabContent}</div>
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.lock}>{'\uD83D\uDD12'}</span>
          <span style={styles.placeholderText}>
            Click 'Generate' to create content for this tab
          </span>
        </div>
      )}
    </div>
  );
}
