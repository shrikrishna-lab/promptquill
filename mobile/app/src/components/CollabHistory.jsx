import React, { useState, useEffect } from 'react';
import { getCollabRoomHistory, compareCollabVersions } from '../lib/collab';
import './CollabHistory.css';

/**
 * CollabHistory Component
 * Displays version history of a collaboration room
 */
export function CollabHistory({ roomId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  // Load history on mount and when roomId changes
  useEffect(() => {
    loadHistory();
  }, [roomId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📜 Loading history for room: ${roomId}`);
      
      const result = await getCollabRoomHistory(roomId);

      if (result.success) {
        console.log(`✅ History loaded: ${result.history?.length || 0} versions`);
        setHistory(result.history || []);
        setSelectedVersions([]);
      } else {
        console.error(`❌ History load failed:`, result.error);
        setError(result.error || 'Failed to load history');
        setHistory([]);
      }
    } catch (err) {
      console.error(`❌ History fetch error:`, err);
      setError(err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionNumber) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionNumber)) {
        return prev.filter((v) => v !== versionNumber);
      } else if (prev.length < 2) {
        return [...prev, versionNumber].sort();
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) {
      setError('Please select exactly 2 versions to compare');
      return;
    }

    try {
      const result = await compareCollabVersions(
        roomId,
        selectedVersions[0],
        selectedVersions[1]
      );

      if (result.success) {
        setComparisonData(result.diff);
        setShowComparison(true);
      } else {
        setError(result.error || 'Failed to compare versions');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="collab-history-container">
        <div className="loading">📝 Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collab-history-container">
        <div className="error">❌ {error}</div>
        <button onClick={loadHistory}>Retry</button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="collab-history-container">
        <div className="empty">No versions yet</div>
      </div>
    );
  }

  return (
    <div className="collab-history-container">
      <div className="history-header">
        <h3>📋 Version History ({history.length} versions)</h3>
        {selectedVersions.length === 2 && (
          <button className="compare-btn" onClick={handleCompare}>
            Compare v{selectedVersions[0]} ↔ v{selectedVersions[1]}
          </button>
        )}
      </div>

      {showComparison && comparisonData && (
        <div className="comparison">
          <div className="comparison-close" onClick={() => setShowComparison(false)}>
            ✕
          </div>
          <div className="comparison-content">
            <div className="version-comparison">
              <div className="version-old">
                <h4>Version {selectedVersions[0]}</h4>
                <p>{comparisonData.fromVersion.content}</p>
              </div>
              <div className="version-new">
                <h4>Version {selectedVersions[1]}</h4>
                <p>{comparisonData.toVersion.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="history-list">
        {history.map((version) => (
          <div
            key={version.id}
            className={`history-item ${selectedVersions.includes(version.version_number) ? 'selected' : ''}`}
            onClick={() => handleVersionSelect(version.version_number)}
          >
            <div className="version-number">v{version.version_number}</div>

            <div className="version-details">
              <div className="change-summary">{version.change_summary || '(no summary)'}</div>
              <div className="version-meta">
                <span className="editor">👤 {version.edited_by ? version.edited_by.substring(0, 8) : 'Unknown'}</span>
                <span className="timestamp">🕐 {new Date(version.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="content-preview">
              <p>{version.content.substring(0, 100)}...</p>
            </div>

            {selectedVersions.includes(version.version_number) && (
              <div className="selected-badge">✓ Selected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CollabHistoryPanel Component
 * Compact version for viewing in a sidebar
 */
export function CollabHistoryPanel({ roomId, onVersionSelect }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`📜 Loading history for room: ${roomId}`);
        
        const result = await getCollabRoomHistory(roomId);
        
        if (result.success) {
          console.log(`✅ Loaded ${result.history?.length || 0} versions for panel`);
          setHistory(result.history || []);
        } else {
          console.error(`❌ Failed to load history:`, result.error);
          setError(result.error);
          setHistory([]);
        }
      } catch (err) {
        console.error(`❌ Panel history load error:`, err);
        setError(err.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadHistory();
    }
  }, [roomId]);

  if (loading) return <div className="panel-loading">⏳ Loading versions...</div>;
  if (error) return <div className="panel-error">❌ {error}</div>;
  if (history.length === 0) return <div className="panel-empty">📝 No versions yet</div>;

  return (
    <div className="collab-history-panel">
      <div className="panel-header">
        <h4>📜 Versions</h4>
        <span className="badge">{history.length}</span>
      </div>
      <div className="panel-list">
        {history.map((version) => (
          <div
            key={version.id}
            className="panel-item"
            onClick={() => onVersionSelect?.(version)}
            title={version.change_summary}
          >
            <div className="version-badge">v{version.version_number}</div>
            <div className="item-info">
              <div className="summary">{version.change_summary?.substring(0, 30) || 'Update'}</div>
              <div className="time">
                {new Date(version.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollabHistory;
