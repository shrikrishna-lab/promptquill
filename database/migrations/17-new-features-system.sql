-- ═══════════════════════════════════════════════════════════════════
-- NEW FEATURES DATABASE MIGRATION
-- ═══════════════════════════════════════════════════════════════════
-- Tables: prompt_battles, prompt_battle_votes, prompts (enhanced), 
-- prompt_likes, achievements, collab_rooms, collab_sessions

-- ═══════════════════════════════════════════════════════════════════
-- 1. PROMPT_BATTLES TABLE - AI Prompt Battle voting system
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prompt_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  prompt_a TEXT NOT NULL,
  prompt_b TEXT NOT NULL,
  votes_a INT DEFAULT 0,
  votes_b INT DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  winner VARCHAR(1) -- 'a' or 'b'
);

CREATE INDEX idx_prompt_battles_user_id ON prompt_battles(user_id);
CREATE INDEX idx_prompt_battles_created_at ON prompt_battles(created_at);

-- ═══════════════════════════════════════════════════════════════════
-- 2. PROMPT_BATTLE_VOTES TABLE - User votes on battles
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prompt_battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES prompt_battles(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote VARCHAR(1) NOT NULL, -- 'a' or 'b'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battle_id, voter_id)
);

CREATE INDEX idx_battle_votes_battle_id ON prompt_battle_votes(battle_id);
CREATE INDEX idx_battle_votes_voter_id ON prompt_battle_votes(voter_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. CREATE PROMPTS TABLE (if not exists)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  fork_count INT DEFAULT 0,
  forked_from UUID REFERENCES prompts(id) ON DELETE SET NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_is_public ON prompts(is_public);

-- ═══════════════════════════════════════════════════════════════════
-- 4. PROMPT_LIKES TABLE - Community engagement
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS prompt_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

CREATE INDEX idx_prompt_likes_prompt_id ON prompt_likes(prompt_id);
CREATE INDEX idx_prompt_likes_user_id ON prompt_likes(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 5. ACHIEVEMENTS TABLE - User achievements and badges
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'first_prompt', 'master', 'legendary', 'streak_7', 'streak_30', etc
  unlocked_at TIMESTAMP DEFAULT NOW(),
  data JSONB -- Store additional metadata
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

-- ═══════════════════════════════════════════════════════════════════
-- 6. COLLAB_ROOMS TABLE - Real-time collaboration spaces
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS collab_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_content TEXT,
  participants JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_modified TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collab_rooms_creator_id ON collab_rooms(creator_id);
CREATE INDEX idx_collab_rooms_active ON collab_rooms(is_active);

-- ═══════════════════════════════════════════════════════════════════
-- 7. COLLAB_VERSIONS TABLE - Version control for collab sessions
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS collab_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES collab_rooms(id) ON DELETE CASCADE,
  content TEXT,
  edited_by UUID REFERENCES auth.users(id),
  version_number INT,
  created_at TIMESTAMP DEFAULT NOW(),
  change_summary TEXT
);

CREATE INDEX idx_collab_versions_room_id ON collab_versions(room_id);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_versions ENABLE ROW LEVEL SECURITY;

-- Prompts: Users see own, others see public
CREATE POLICY "prompts_view_own_or_public" ON prompts FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "prompts_create" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prompts_update_own" ON prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prompts_delete_own" ON prompts FOR DELETE USING (auth.uid() = user_id);

-- Battles: Anyone can view, users can create
CREATE POLICY "battles_view_all" ON prompt_battles FOR SELECT USING (true);
CREATE POLICY "battles_create" ON prompt_battles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "battles_update_self" ON prompt_battles FOR UPDATE USING (auth.uid() = user_id);

-- Votes: Users vote on battles
CREATE POLICY "votes_view_own" ON prompt_battle_votes FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "votes_create" ON prompt_battle_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "votes_update_own" ON prompt_battle_votes FOR UPDATE USING (auth.uid() = voter_id);

-- Likes: Users like prompts
CREATE POLICY "likes_create" ON prompt_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON prompt_likes FOR DELETE USING (auth.uid() = user_id);

-- Achievements: Users see own
CREATE POLICY "achievements_view_own" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert" ON achievements FOR INSERT WITH CHECK (true);

-- Collab Rooms: Users collaborate
CREATE POLICY "collab_rooms_view_active" ON collab_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "collab_rooms_create" ON collab_rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "collab_rooms_update_creator" ON collab_rooms FOR UPDATE USING (auth.uid() = creator_id);

-- Collab Versions: View versions of rooms you have access to
CREATE POLICY "collab_versions_view" ON collab_versions FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM collab_rooms 
    WHERE id = collab_versions.room_id 
    AND (creator_id = auth.uid() OR is_active = true)
  )
);

-- ═══════════════════════════════════════════════════════════════════
-- ANALYTICS TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Update likes count when a like is added
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts 
  SET likes_count = likes_count + 1 
  WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update likes count when a like is removed
CREATE OR REPLACE FUNCTION update_likes_count_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts 
  SET likes_count = GREATEST(0, likes_count - 1) 
  WHERE id = OLD.prompt_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS prompt_likes_insert ON prompt_likes;
CREATE TRIGGER prompt_likes_insert AFTER INSERT ON prompt_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS prompt_likes_delete ON prompt_likes;
CREATE TRIGGER prompt_likes_delete AFTER DELETE ON prompt_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count_delete();
