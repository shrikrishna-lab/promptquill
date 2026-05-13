-- ═══════════════════════════════════════════════════════════
-- PROMPT QUILL v4 MIGRATION — Blog, Credits, Referrals
-- Run this ONCE in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  author_id uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins manage posts" ON blog_posts
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins update posts" ON blog_posts
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins delete posts" ON blog_posts
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 2. USER CREDITS TABLE
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  balance integer DEFAULT 100,
  daily_limit integer DEFAULT 100,
  last_reset timestamptz DEFAULT now(),
  total_earned integer DEFAULT 100,
  total_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own credits" ON user_credits
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users update own credits" ON user_credits
  FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users insert own credits" ON user_credits
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 3. CREDIT TRANSACTIONS LOG
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('deduct', 'topup', 'reset', 'referral', 'admin_adjust')),
  reason text,
  provider text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own transactions" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4. REFERRAL CODES TABLE
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  uses integer DEFAULT 0,
  max_uses integer DEFAULT 10,
  bonus_credits integer DEFAULT 25,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON referral_codes
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users create referral" ON referral_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 5. REFERRAL REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS referral_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id uuid REFERENCES referral_codes(id) ON DELETE CASCADE,
  redeemed_by uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referral_code_id, redeemed_by)
);
ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own redemptions" ON referral_redemptions
  FOR SELECT USING (redeemed_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users create redemptions" ON referral_redemptions
  FOR INSERT WITH CHECK (redeemed_by = auth.uid());

-- 6. ADD CREDIT SETTINGS TO PLATFORM_SETTINGS
INSERT INTO platform_settings (key, value) VALUES
  ('free_daily_credits', '100'),
  ('pro_daily_credits', '300'),
  ('referral_bonus_credits', '25'),
  ('credit_cost_groq', '1'),
  ('credit_cost_gemini', '2'),
  ('credit_cost_openrouter', '3')
ON CONFLICT (key) DO NOTHING;

-- 7. ENABLE REALTIME ON NEW TABLES
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE user_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE credit_transactions;
