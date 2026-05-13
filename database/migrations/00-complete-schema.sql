-- ════════════════════════════════════════════════════════════════════════════════
-- COMPLETE PROMPTQUILL DATABASE SCHEMA
-- All tables with proper RLS policies - Run this ONCE in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════════
-- 1. PROFILES - Extended user info from auth.users
-- ════════════════════════════════════════════════════════════════════════════════
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
-- 2. SESSIONS - Prompt generation sessions
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 3. PROMPT VERSIONS - Track versions of prompts
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 4. USAGE LOGS - Track API usage
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 5. SUPPORT TICKETS & REPLIES
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS ticket_replies CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_view_own_tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_create_ticket" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_view_all_tickets" ON support_tickets FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 6. ANNOUNCEMENTS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_active_announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "admin_manage_announcements" ON announcements FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 7. FEATURE FLAGS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS feature_flags CASCADE;
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  target VARCHAR(50) DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "admin_manage_flags" ON feature_flags FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 8. ADMIN LOGS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS admin_logs CASCADE;
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
Create INDEX idx_admin_logs_created_at ON admin_logs(created_at);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_view_logs" ON admin_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 9. PLATFORM ANALYTICS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS platform_analytics CASCADE;
CREATE TABLE platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  total_prompts_generated INT DEFAULT 0,
  active_users INT DEFAULT 0,
  revenue_usd NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_view_analytics" ON platform_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 10. REVENUE EVENTS - Payment tracking
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS revenue_events CASCADE;
CREATE TABLE revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  plan VARCHAR(50),
  amount_usd NUMERIC NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_provider VARCHAR(50) DEFAULT 'razorpay',
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX idx_revenue_events_created_at ON revenue_events(created_at);

ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_revenue" ON revenue_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_view_revenue" ON revenue_events FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 11. PROMO CODES
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS promo_codes CASCADE;
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50),
  discount_value NUMERIC NOT NULL,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_active_promo" ON promo_codes FOR SELECT USING (is_active = true);

-- ════════════════════════════════════════════════════════════════════════════════
-- 12. BLOG POSTS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS blog_posts CASCADE;
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  content TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_published_posts" ON blog_posts FOR SELECT USING (is_published = true);

-- ════════════════════════════════════════════════════════════════════════════════
-- 13. EMAIL CAMPAIGNS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS email_campaigns CASCADE;
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_campaigns" ON email_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- 14. WAITLIST
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 15. MODERATION QUEUE
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 16. USER INTERACTIONS - Likes, comments, etc
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 17. IDEA ROASTS - AI roast feature
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 18. REDDIT INSIGHTS - Integration with Reddit
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS reddit_insights CASCADE;
CREATE TABLE reddit_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  subreddit VARCHAR(255),
  post_title VARCHAR(500),
  engagement_score INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════════════════
-- 19. USER PROFILES (Extended - for public profiles)
-- ════════════════════════════════════════════════════════════════════════════════
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

-- ════════════════════════════════════════════════════════════════════════════════
-- 20. CREDITS SYSTEM WITH RLS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS user_credits CASCADE;
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 100,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_credits" ON user_credits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_update_own_credits" ON user_credits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_credits" ON user_credits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_manage_credits" ON user_credits FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "service_role_bypass_credits" ON user_credits FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- 21. CREDIT TRANSACTIONS (Audit log)
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS credit_transactions CASCADE;
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason TEXT,
  provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
Create INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_transactions" ON credit_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_transactions" ON credit_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin_view_transactions" ON credit_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "service_role_bypass_transactions" ON credit_transactions FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- 22. REFERRALS
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS referrals CASCADE;
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(10) UNIQUE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_user_id ON referrals(user_id);
CREATE INDEX idx_referrals_code ON referrals(code);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_own_referral" ON referrals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_update_own_referral" ON referrals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "user_insert_own_referral" ON referrals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "public_view_by_code" ON referrals FOR SELECT USING (true);
CREATE POLICY "service_role_bypass_referrals" ON referrals FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- 23. REFERRAL USES - Track referral conversions
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS referral_uses CASCADE;
CREATE TABLE referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_credits INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_uses_referral_id ON referral_uses(referral_id);
CREATE INDEX idx_referral_uses_referred_user_id ON referral_uses(referred_user_id);

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_view_uses" ON referral_uses FOR SELECT USING (
  referral_id IN (SELECT id FROM referrals WHERE user_id = auth.uid()) OR referred_user_id = auth.uid()
);
CREATE POLICY "user_insert_referral_use" ON referral_uses FOR INSERT WITH CHECK (referred_user_id = auth.uid());
CREATE POLICY "admin_view_all_uses" ON referral_uses FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "service_role_bypass_uses" ON referral_uses FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- 24. PLATFORM SETTINGS - For admin configuration
-- ════════════════════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS platform_settings CASCADE;
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "admin_manage_settings" ON platform_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- ════════════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETE!
-- ════════════════════════════════════════════════════════════════════════════════
-- All tables created with proper RLS policies
-- You're ready to use PromptQuill!
