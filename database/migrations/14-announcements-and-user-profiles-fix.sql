-- ════════════════════════════════════════════════════════════════════════════════
-- FIX: CREATE MISSING ANNOUNCEMENTS & USER_PROFILES TABLES
-- ════════════════════════════════════════════════════════════════════════════════

-- ANNOUNCEMENTS TABLE
DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_active_announcements" ON announcements FOR SELECT USING (is_active = TRUE);
CREATE POLICY "admin_manage_announcements" ON announcements FOR ALL USING (admin_id = auth.uid());

-- USER_PROFILES TABLE (ensure exists with public read)
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  twitter VARCHAR(100),
  github VARCHAR(100),
  website VARCHAR(500),
  avatar_url VARCHAR(500),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "public_view_public_profiles" ON user_profiles FOR SELECT USING (is_public = TRUE);
CREATE POLICY "user_view_own_profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());

-- INSERT/UPDATE policies
CREATE POLICY "user_insert_own_profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_update_own_profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
