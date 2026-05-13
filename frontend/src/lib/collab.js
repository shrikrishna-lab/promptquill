import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

/**
 * Get headers for API requests
 */
const getAuthHeaders = async () => {
  return {
    'Content-Type': 'application/json'
  };
};

/**
 * Create a new collaboration room
 * @param {string} title - Room title
 * @param {string} description - Optional room description
 * @returns {Promise<{id: string, success: boolean}>}
 */
export const createCollabRoom = async (title, description = '') => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/features/collab/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, description })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create collaboration room');
    }

    console.log('✅ Collaboration room created:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error creating collab room:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Join an existing collaboration room
 * @param {string} roomId - Room ID to join
 * @returns {Promise<{success: boolean}>}
 */
export const joinCollabRoom = async (roomId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/features/collab/${roomId}/join`, {
      method: 'POST',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to join collaboration room');
    }

    console.log('✅ Joined collab room:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error joining collab room:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update collaboration room content
 * @param {string} roomId - Room ID to update
 * @param {string} content - New content
 * @param {string} changeSummary - Optional summary of changes
 * @returns {Promise<{success: boolean, version: number, creditsDeducted: number}>}
 */
export const updateCollabContent = async (roomId, content, changeSummary = '') => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/features/collab/${roomId}/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content, changeSummary })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 402) {
        return {
          success: false,
          error: 'insufficient_credits',
          message: data.message,
          required: data.required,
          current: data.current
        };
      }
      throw new Error(data.error || 'Failed to update collaboration content');
    }

    console.log('✅ Collaboration content updated:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error updating collab content:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get collaboration room history (all versions)
 * @param {string} roomId - Room ID
 * @returns {Promise<{history: Array, count: number}>}
 */
export const getCollabRoomHistory = async (roomId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/features/collab/${roomId}/history`, {
      method: 'GET',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch collaboration history');
    }

    console.log(`✅ Retrieved ${data.count} versions for room ${roomId}`);
    return {
      success: true,
      history: data.history || [],
      count: data.count || 0,
      retrievedAt: data.retrievedAt
    };
  } catch (err) {
    console.error('❌ Error fetching collab history:', err);
    return { success: false, error: err.message, history: [] };
  }
};

/**
 * Get collaboration room details
 * @param {string} roomId - Room ID
 * @returns {Promise<{room: Object}>}
 */
export const getCollabRoomDetails = async (roomId) => {
  try {
    // Get room from Supabase directly
    const { data, error } = await supabase
      .from('collab_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Retrieved room details:', data);
    return { success: true, room: data };
  } catch (err) {
    console.error('❌ Error fetching room details:', err);
    return { success: false, error: err.message };
  }
};

/**
 * List user's collaboration rooms
 * @returns {Promise<{rooms: Array}>}
 */
export const listUserCollabRooms = async () => {
  try {
    const { data, error } = await supabase
      .from('collab_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} collaboration rooms`);
    return { success: true, rooms: data || [] };
  } catch (err) {
    console.error('❌ Error listing collab rooms:', err);
    return { success: false, error: err.message, rooms: [] };
  }
};

/**
 * Get a specific version of a collaboration room
 * @param {string} roomId - Room ID
 * @param {number} versionNumber - Version number to retrieve
 * @returns {Promise<{version: Object}>}
 */
export const getCollabRoomVersion = async (roomId, versionNumber) => {
  try {
    const { data, error } = await supabase
      .from('collab_versions')
      .select('*')
      .eq('room_id', roomId)
      .eq('version_number', versionNumber)
      .single();

    if (error) {
      throw error;
    }

    console.log(`✅ Retrieved version ${versionNumber} of room ${roomId}`);
    return { success: true, version: data };
  } catch (err) {
    console.error('❌ Error fetching collab version:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Track user activity in collaboration session
 * @param {string} roomId - Room ID
 * @returns {Promise<{success: boolean}>}
 */
export const trackCollabActivity = async (roomId) => {
  return { success: true };
};

/**
 * Compare two versions of a collaboration room
 * @param {string} roomId - Room ID
 * @param {number} fromVersion - Starting version number
 * @param {number} toVersion - Ending version number
 * @returns {Promise<{diff: Object}>}
 */
export const compareCollabVersions = async (roomId, fromVersion, toVersion) => {
  try {
    const [fromData, toData] = await Promise.all([
      supabase
        .from('collab_versions')
        .select('*')
        .eq('room_id', roomId)
        .eq('version_number', fromVersion)
        .single(),
      supabase
        .from('collab_versions')
        .select('*')
        .eq('room_id', roomId)
        .eq('version_number', toVersion)
        .single()
    ]);

    if (fromData.error || toData.error) {
      throw new Error('Failed to fetch versions for comparison');
    }

    console.log(`✅ Compared versions ${fromVersion} to ${toVersion}`);
    return {
      success: true,
      diff: {
        fromVersion: fromData.data,
        toVersion: toData.data
      }
    };
  } catch (err) {
    console.error('❌ Error comparing versions:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get collaboration activity audit log
 * @param {string} roomId - Room ID
 * @param {number} limit - Max number of records to retrieve (default 50)
 * @returns {Promise<{audit: Array}>}
 */
export const getCollabAuditLog = async (roomId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('history_audit')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} audit records for room`);
    return { success: true, audit: data || [] };
  } catch (err) {
    console.error('❌ Error fetching audit log:', err);
    return { success: false, error: err.message, audit: [] };
  }
};

/**
 * Initialize real-time collaboration listener (using Supabase)
 * @param {string} roomId - Room ID to listen to
 * @param {Function} onUpdate - Callback when content updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCollabRoomUpdates = (roomId, onUpdate) => {
  try {
    const subscription = supabase
      .channel(`collab:${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'collab_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          console.log('📝 Collaboration room updated:', payload);
          onUpdate(payload.new);
        }
      )
      .subscribe();

    console.log(`✅ Subscribed to room ${roomId} updates`);

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
      console.log(`✅ Unsubscribed from room ${roomId} updates`);
    };
  } catch (err) {
    console.error('❌ Error subscribing to updates:', err);
    return () => {};
  }
};

export default {
  createCollabRoom,
  joinCollabRoom,
  updateCollabContent,
  getCollabRoomHistory,
  getCollabRoomDetails,
  listUserCollabRooms,
  getCollabRoomVersion,
  trackCollabActivity,
  compareCollabVersions,
  getCollabAuditLog,
  subscribeToCollabRoomUpdates
};
