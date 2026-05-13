import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.mobile';
import { CollabHistory, CollabHistoryPanel } from '../components/CollabHistory';
import { createCollabRoom, updateCollabContent, listUserCollabRooms } from '../lib/collab';
import './CollabPage.css';

/**
 * CollabPage - Collaboration Hub with improved UI
 */
export default function CollabPage({ session }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const historyRefreshKey = useRef(0);

  useEffect(() => {
    loadRooms();
  }, [session]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const result = await listUserCollabRooms();
      
      if (result.success) {
        setRooms(result.rooms || []);
        if ((result.rooms || []).length > 0 && !selectedRoomId) {
          setSelectedRoomId((result.rooms || [])[0].id);
        }
      } else {
        showMessage(`Error loading rooms: ${result.error}`, 'error');
      }
    } catch (err) {
      console.error('Load rooms error:', err);
      showMessage(`Failed to load rooms: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) {
      showMessage('Room title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createCollabRoom(newRoomTitle, 'Collaboration space');
      
      if (result.success) {
        showMessage(`✅ Room "${newRoomTitle}" created successfully!`, 'success');
        setNewRoomTitle('');
        await loadRooms();
      } else {
        showMessage(`Failed to create room: ${result.error}`, 'error');
      }
    } catch (err) {
      console.error('Create room error:', err);
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    if (!selectedRoomId || !content.trim()) {
      showMessage('Select a room and enter content', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await updateCollabContent(
        selectedRoomId,
        content,
        changeSummary || 'Content updated'
      );

      if (result.success) {
        showMessage(
          `✅ Version ${result.data.version} saved! ${result.data.creditsDeducted || 0} credits deducted`,
          'success'
        );
        setContent('');
        setChangeSummary('');
        // Reload rooms to update version count
        await loadRooms();
        // Trigger history refresh
        historyRefreshKey.current += 1;
      } else if (result.error === 'insufficient_credits') {
        showMessage(
          `⚠️ Insufficient credits: need ${result.required}, have ${result.current}`,
          'error'
        );
      } else {
        showMessage(`Error: ${result.error}`, 'error');
      }
    } catch (err) {
      console.error('Update content error:', err);
      showMessage(`Failed to update: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="collab-page">
      <div className="collab-wrapper">
        <h1 className="collab-title">🤝 Collaboration Hub</h1>
        
        <div className="collab-grid">
          {/* Left Sidebar */}
          <aside className="collab-sidebar">
            <section className="section-create">
              <h3>Create Room</h3>
              <form onSubmit={handleCreateRoom}>
                <input
                  type="text"
                  placeholder="Room title..."
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  disabled={loading}
                  className="input-field"
                />
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? '⏳ Creating...' : '➕ Create Room'}
                </button>
              </form>
            </section>

            <section className="section-rooms">
              <h3>Your Rooms {rooms.length > 0 && <span className="badge">{rooms.length}</span>}</h3>
              <div className="rooms-container">
                {rooms.length === 0 ? (
                  <p className="empty-state">No rooms yet. Create one to get started!</p>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`room-card ${selectedRoomId === room.id ? 'active' : ''}`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="room-title">{room.prompt_title || room.title || 'Untitled'}</div>
                      <div className="room-stats">
                        <span>📝 {room.version_count || 0} versions</span>
                        <span>✏️ {room.total_edits || 0} edits</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>

          {/* Main Content */}
          <main className="collab-main">
            {selectedRoom ? (
              <>
                <div className="room-header">
                  <h2>{selectedRoom.prompt_title || selectedRoom.title || 'Untitled Room'}</h2>
                  <p className="room-desc">{selectedRoom.description || 'No description'}</p>
                </div>

                <section className="editor-section">
                  <h3>✏️ Update Content</h3>
                  <form onSubmit={handleUpdateContent}>
                    <textarea
                      placeholder="Enter collaborative content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      disabled={loading}
                      className="textarea-content"
                    />

                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Describe your changes..."
                        value={changeSummary}
                        onChange={(e) => setChangeSummary(e.target.value)}
                        disabled={loading}
                        className="input-field"
                      />
                      <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="btn-save"
                      >
                        {loading ? '⏳ Saving...' : '💾 Save Version'}
                      </button>
                    </div>
                  </form>

                  {message && (
                    <div className={`message message-${messageType}`}>
                      {message}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="empty-state large">
                <p>👈 Select or create a room to start collaborating</p>
              </div>
            )}
          </main>

          {/* Right Sidebar - History */}
          <aside className="collab-history-sidebar">
            {selectedRoom ? (
              <>
                <h3>📜 History</h3>
                <CollabHistoryPanel 
                  key={`${selectedRoomId}-${historyRefreshKey.current}`}
                  roomId={selectedRoomId}
                  onVersionSelect={(version) => {
                    setContent(version.content);
                    setChangeSummary(`Restored from v${version.version_number}`);
                    showMessage(`Loaded v${version.version_number}`, 'success');
                  }}
                />
              </>
            ) : (
              <div className="empty-state">No room selected</div>
            )}
          </aside>
        </div>

        {/* Full History Modal */}
        {selectedRoom && (
          <section className="full-history-section">
            <details>
              <summary>📋 Full Version History</summary>
              <CollabHistory key={`history-${selectedRoomId}-${historyRefreshKey.current}`} roomId={selectedRoomId} />
            </details>
          </section>
        )}
      </div>
    </div>
  );
}
