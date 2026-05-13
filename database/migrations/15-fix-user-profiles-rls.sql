-- ════════════════════════════════════════════════════════════════════════════════
-- FIX: UPDATE USER_PROFILES RLS POLICIES
-- Run this to allow users to read their own profile after claiming username
-- ════════════════════════════════════════════════════════════════════════════════

-- DROP old policies and recreate with proper SELECT
DROP POLICY IF EXISTS "user_view_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "public_view_public_profiles" ON user_profiles;

-- SELECT policies (allows reading own profile OR public profiles)
CREATE POLICY "public_view_public_profiles" ON user_profiles FOR SELECT USING (is_public = TRUE);
CREATE POLICY "user_view_own_profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());
