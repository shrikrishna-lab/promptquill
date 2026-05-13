-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles (for community), update own
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Briefs: owner full access, others can see public
CREATE POLICY "briefs_select_own" ON public.briefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "briefs_select_public" ON public.briefs FOR SELECT USING (is_public = true);
CREATE POLICY "briefs_insert_own" ON public.briefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefs_update_own" ON public.briefs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "briefs_delete_own" ON public.briefs FOR DELETE USING (auth.uid() = user_id);

-- Community feed: all authenticated can read, insert own
CREATE POLICY "feed_select_all" ON public.community_feed FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "feed_insert_own" ON public.community_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feed_delete_own" ON public.community_feed FOR DELETE USING (auth.uid() = user_id);

-- User settings: only owner can access
CREATE POLICY "settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
