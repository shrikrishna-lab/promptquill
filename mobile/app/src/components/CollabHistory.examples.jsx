/**
 * Example Usage of CollabHistory Component
 * 
 * Show how to use the CollabHistory component in your app
 */

import React, { useState } from 'react';
import { CollabHistory, CollabHistoryPanel } from './components/CollabHistory';

/**
 * Example 1: Full History View
 * Use this on a dedicated page or modal for detailed history viewing
 */
export function CollabPage({ roomId }) {
  return (
    <div className="page">
      <h1>Collaboration Room</h1>
      <CollabHistory roomId={roomId} />
    </div>
  );
}

/**
 * Example 2: Sidebar History Panel
 * Use this in a layout with the main editor on the left
 */
export function CollabEditor({ roomId }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  return (
    <div className="collabEditor">
      <div className="main-content">
        <div className="editor-area">
          <h2>Edit Content</h2>
          <textarea
            placeholder="Start collaborating..."
            style={{ width: '100%', minHeight: '400px' }}
          />
          <button>Save Changes</button>
        </div>
      </div>

      <div className="sidebar">
        <CollabHistoryPanel
          roomId={roomId}
          onVersionSelect={(version) => {
            setSelectedVersion(version);
            console.log('Selected version:', version.version_number);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Example 3: In a Modal
 * Use this in a modal dialog for viewing history
 */
export function CollabHistoryModal({ roomId, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Version History</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <CollabHistory roomId={roomId} />
      </div>
    </div>
  );
}

/**
 * Example 4: Integration with Dashboard
 * Show history in a dashboard view
 */
export function CollabDashboard({ rooms }) {
  return (
    <div className="dashboard">
      <h1>My Collaborations</h1>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>{room.title}</h3>
            <p>{room.description}</p>
            <div className="stats">
              <span>📝 {room.version_count} versions</span>
              <span>👥 {room.participants?.length || 0} participants</span>
            </div>
            {/* Show compact history in card */}
            <CollabHistoryPanel roomId={room.id} />
            <button className="view-btn">View Full History</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * HTML and CSS for Examples
 */
export const ExampleStyles = `
/* Editor Layout */
.collabEditor {
  display: flex;
  gap: 20px;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.editor-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background: #f5f5f5;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

/* Dashboard */
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.room-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.room-card h3 {
  margin-top: 0;
  color: #333;
}

.stats {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  font-size: 13px;
  color: #666;
}

.view-btn {
  width: 100%;
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 12px;
}

.view-btn:hover {
  background: #1d4ed8;
}
`;

export default {
  CollabPage,
  CollabEditor,
  CollabHistoryModal,
  CollabDashboard,
};
