-- ════════════════════════════════════════════════════════════════════════════════
-- MISSING TABLES ONLY
-- Tables that don't exist yet in Supabase - run this after 00-complete-schema.sql
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. SESSIONS - Prompt generation sessions (LIKELY MISSING)
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500),
  input_text TEXT,
  final_prompt TEXT,
  mode VARCHAR(50) DEFAULT 'GENERAL',
  category VARCHAR(100),
  score NUMERIC,
  difficulty VARCHAR(100),
  difficulty_hours INT,
  issues_count INT DEFAULT 0,
  suggestions_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  is_buried BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_is_public ON sessions(is_public);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_sessions" ON sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "public_view_public_sessions" ON sessions FOR SELECT USING (is_public = true);
CREATE POLICY "user_create_session" ON sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_update_own_session" ON sessions FOR UPDATE USING (user_id = auth.uid());

-- 2. PROMPT VERSIONS - Track versions of prompts (LIKELY MISSING)
DROP TABLE IF EXISTS prompt_versions CASCADE;
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  version_number INT,
  prompt_text TEXT,
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_prompt_versions_session_id ON prompt_versions(session_id);
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_versions" ON prompt_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM sessions WHERE id = session_id AND user_id = auth.uid())
);

-- 3. USAGE LOGS - Track API usage (LIKELY MISSING)
DROP TABLE IF EXISTS usage_logs CASCADE;
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100),
  api_provider VARCHAR(50),
  tokens_used INT,
  cost_usd NUMERIC,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_logs" ON usage_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_view_logs" ON usage_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 4. USER INTERACTIONS - Likes, comments, etc (LIKELY MISSING)
DROP TABLE IF EXISTS user_interactions CASCADE;
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_session_id ON user_interactions(session_id);
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_interactions" ON user_interactions FOR SELECT USING (true);

-- 5. IDEA ROASTS - AI roast feature (LIKELY MISSING)
DROP TABLE IF EXISTS idea_roasts CASCADE;
CREATE TABLE idea_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roast_content TEXT,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_idea_roasts_session_id ON idea_roasts(session_id);
ALTER TABLE idea_roasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_roasts" ON idea_roasts FOR SELECT USING (true);

-- 6. REDDIT INSIGHTS - Integration with Reddit (LIKELY MISSING)
DROP TABLE IF EXISTS reddit_insights CASCADE;
CREATE TABLE reddit_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  subreddit VARCHAR(255),
  post_title VARCHAR(500),
  engagement_score INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. USER PROFILES (Extended - for public profiles) (LIKELY MISSING)
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  twitter VARCHAR(255),
  github VARCHAR(255),
  website VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_public_profiles" ON user_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "user_update_own_profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- 8. MODERATION QUEUE (LIKELY MISSING)
DROP TABLE IF EXISTS moderation_queue CASCADE;
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(100),
  content_id UUID,
  reason VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_mod_queue" ON moderation_queue FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 9. WAITLIST (LIKELY MISSING)
DROP TABLE IF EXISTS waitlist CASCADE;
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  referred_by VARCHAR(255),
  is_joined BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- 10. PROFILES (if not exists - extend auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  is_pro BOOLEAN DEFAULT FALSE,
  role VARCHAR(50) DEFAULT 'USER',
  username VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "user_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "user_insert_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ════════════════════════════════════════════════════════════════════════════════
-- NOTES:
-- These are the tables most likely to be missing
-- Already exist (from previous migrations):
-- - announcements
-- - feature_flags
-- - admin_logs
-- - platform_analytics
-- - revenue_events
-- - promo_codes
-- - blog_posts
-- - email_campaigns
-- - support_tickets
-- - ticket_replies
-- - user_credits
-- - credit_transactions
-- - referrals
-- - referral_uses
-- - platform_settings
-- - moderation_queue
-- - waitlist
-- ════════════════════════════════════════════════════════════════════════════════
