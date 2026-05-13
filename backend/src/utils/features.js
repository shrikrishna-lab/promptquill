import { supabase } from './supabase.js';

// ═══════════════════════════════════════════════════════════════════
// PROMPT BATTLE SERVICE
// ═══════════════════════════════════════════════════════════════════

export async function createBattle(userId, title, description, promptA, promptB) {
  try {
    const { data, error } = await supabase
      .from('prompt_battles')
      .insert([{
        user_id: userId,
        title,
        description,
        prompt_a: promptA,
        prompt_b: promptB
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error creating battle:', err);
    return { success: false, error: err.message };
  }
}

export async function recordBattleVote(battleId, voterId, vote) {
  try {
    // Check if vote exists
    const { data: existing } = await supabase
      .from('prompt_battle_votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('voter_id', voterId)
      .single();

    if (existing) {
      // Update vote
      await supabase
        .from('prompt_battle_votes')
        .update({ vote })
        .eq('id', existing.id);
    } else {
      // Insert new vote
      await supabase
        .from('prompt_battle_votes')
        .insert([{ battle_id: battleId, voter_id: voterId, vote }]);
    }

    // Update vote counts
    const { data: votes } = await supabase
      .from('prompt_battle_votes')
      .select('vote')
      .eq('battle_id', battleId);

    const votesA = votes?.filter(v => v.vote === 'a').length || 0;
    const votesB = votes?.filter(v => v.vote === 'b').length || 0;

    await supabase
      .from('prompt_battles')
      .update({ votes_a: votesA, votes_b: votesB })
      .eq('id', battleId);

    return { success: true, votesA, votesB };
  } catch (err) {
    console.error('Error recording vote:', err);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS SERVICE
// ═══════════════════════════════════════════════════════════════════

export async function checkAndUnlockAchievements(userId) {
  try {
    // Get user stats
    const { data: prompts } = await supabase
      .from('prompt_versions')
      .select('id')
      .eq('user_id', userId);

    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .single();

    const promptCount = prompts?.length || 0;
    const referralCount = referrals?.total_referred || 0;

    const achievements = [];

    // First prompt
    if (promptCount === 1) {
      await unlockAchievement(userId, 'first_prompt');
      achievements.push('first_prompt');
    }

    // Prompt master (10 prompts)
    if (promptCount === 10) {
      await unlockAchievement(userId, 'prompt_master');
      achievements.push('prompt_master');
    }

    // Legendary creator (100 prompts)
    if (promptCount === 100) {
      await unlockAchievement(userId, 'legendary_creator');
      achievements.push('legendary_creator');
    }

    // Referral milestones
    const milestones = [1, 10, 100, 250, 500];
    for (const milestone of milestones) {
      if (referralCount === milestone) {
        await unlockAchievement(userId, `referral_${milestone}`);
        achievements.push(`referral_${milestone}`);
      }
    }

    return { success: true, unlockedAchievements: achievements };
  } catch (err) {
    console.error('Error checking achievements:', err);
    return { success: false, error: err.message };
  }
}

export async function unlockAchievement(userId, achievementType) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([{
        user_id: userId,
        achievement_type: achievementType
      }])
      .select()
      .single();

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error unlocking achievement:', err);
    return { success: false, error: err.message };
  }
}

export async function getUserAchievements(userId) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error fetching achievements:', err);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// COLLAB SERVICE
// ═══════════════════════════════════════════════════════════════════

export async function createCollabRoom(userId, title, description) {
  try {
    const { data, error } = await supabase
      .from('collab_rooms')
      .insert([{
        creator_id: userId,
        prompt_title: title,
        description,
        participants: [userId],
        version_count: 0,
        total_edits: 0,
        prompt_content: '',
        last_modified: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    console.log(`✅ Room created: ${data.id}`);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error creating collab room:', err);
    return { success: false, error: err.message };
  }
}

export async function joinCollabRoom(roomId, userId) {
  try {
    const { data: room } = await supabase
      .from('collab_rooms')
      .select('participants')
      .eq('id', roomId)
      .single();

    if (!room) {
      throw new Error('Room not found');
    }

    // participants is already JSONB array
    const participants = Array.isArray(room.participants) ? room.participants : [];
    if (!participants.includes(userId)) {
      participants.push(userId);
      await supabase
        .from('collab_rooms')
        .update({ participants })
        .eq('id', roomId);
    }

    console.log(`✅ User ${userId.substring(0, 8)} joined room ${roomId.substring(0, 8)}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Error joining collab room:', err);
    return { success: false, error: err.message };
  }
}

export async function updateCollabContent(roomId, userId, content, changeSummary) {
  try {
    // Get current version number
    const { data: versions } = await supabase
      .from('collab_versions')
      .select('version_number')
      .eq('room_id', roomId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    // Save version with all metadata
    const { data: newVersion, error: versionError } = await supabase
      .from('collab_versions')
      .insert([{
        room_id: roomId,
        content,
        edited_by: userId,
        version_number: nextVersion,
        change_summary: changeSummary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (versionError) throw versionError;

    // Update room metadata
    const { error: updateError } = await supabase
      .from('collab_rooms')
      .update({
        prompt_content: content,
        last_modified: new Date().toISOString(),
        last_editor_id: userId,
        total_edits: nextVersion,
        version_count: nextVersion
      })
      .eq('id', roomId);

    if (updateError) throw updateError;

    // Track in history audit
    await supabase
      .from('history_audit')
      .insert([{
        room_id: roomId,
        user_id: userId,
        action: 'update_content',
        new_content: content.substring(0, 500), // Store first 500 chars
        created_at: new Date().toISOString()
      }])
      .select();

    // Update session stats
    await supabase
      .from('collab_sessions')
      .update({
        edits_count: nextVersion,
        last_action: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    console.log(`✅ Room ${roomId} updated to version ${nextVersion} by user ${userId}`);
    
    return { success: true, version: nextVersion, data: newVersion };
  } catch (err) {
    console.error('❌ Error updating collab content:', err);
    throw err;
  }
}

export async function getCollabRoomHistory(roomId) {
  try {
    // Get all versions sorted by version number
    const { data, error } = await supabase
      .from('collab_versions')
      .select(`
        id,
        room_id,
        version_number,
        content,
        edited_by,
        change_summary,
        created_at,
        updated_at
      `)
      .eq('room_id', roomId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('❌ Error fetching collab history:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} versions for room ${roomId}`);
    
    // Return array directly for easier access
    return data || [];
  } catch (err) {
    console.error('❌ getCollabRoomHistory error:', err);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
// LIKES / ENGAGEMENT SERVICE
// ═══════════════════════════════════════════════════════════════════

export async function togglePromptLike(promptId, userId) {
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('prompt_likes')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('prompt_likes')
        .delete()
        .eq('id', existing.id);
      return { success: true, liked: false };
    } else {
      // Like
      await supabase
        .from('prompt_likes')
        .insert([{ prompt_id: promptId, user_id: userId }]);
      return { success: true, liked: true };
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    return { success: false, error: err.message };
  }
}

export async function getPromptEngagement(promptId) {
  try {
    const { data: likes } = await supabase
      .from('prompt_likes')
      .select('id')
      .eq('prompt_id', promptId);

    const { data: prompt } = await supabase
      .from('prompts')
      .select('fork_count')
      .eq('id', promptId)
      .single();

    return {
      success: true,
      likes: likes?.length || 0,
      forks: prompt?.fork_count || 0
    };
  } catch (err) {
    console.error('Error fetching engagement:', err);
    return { success: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════
// REMIX / FORK SERVICE
// ═══════════════════════════════════════════════════════════════════

export async function remixPrompt(originalId, userId, newTitle, newDescription) {
  try {
    const { data: original } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', originalId)
      .single();

    if (!original) throw new Error('Original prompt not found');

    // Create forked version
    const { data: newPrompt, error } = await supabase
      .from('prompts')
      .insert([{
        user_id: userId,
        title: newTitle || `${original.title} (Remixed)`,
        description: newDescription || `A remix of "${original.title}"`,
        content: original.content,
        category: original.category,
        is_public: false,
        forked_from: originalId
      }])
      .select()
      .single();

    if (error) throw error;

    // Increment fork count
    await supabase
      .from('prompts')
      .update({ fork_count: (original.fork_count || 0) + 1 })
      .eq('id', originalId);

    return { success: true, data: newPrompt };
  } catch (err) {
    console.error('Error remixing prompt:', err);
    return { success: false, error: err.message };
  }
}

export default {
  createBattle,
  recordBattleVote,
  checkAndUnlockAchievements,
  unlockAchievement,
  getUserAchievements,
  createCollabRoom,
  joinCollabRoom,
  updateCollabContent,
  getCollabRoomHistory,
  togglePromptLike,
  getPromptEngagement,
  remixPrompt
};
