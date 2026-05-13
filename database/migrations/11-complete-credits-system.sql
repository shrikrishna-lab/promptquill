-- ════════════════════════════════════════════════════════════════════════════════
-- COMPLETE CREDITS & REFERRAL SYSTEM - ZERO ISSUES VERSION
-- Run this in Supabase SQL Editor to set up everything from scratch
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. USER CREDITS TABLE
-- Tracks available credits for each user
DROP TABLE IF EXISTS user_credits CASCADE;
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 100,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- User can view and update their own credits
CREATE POLICY "user_view_own_credits" ON user_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_update_own_credits" ON user_credits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_credits" ON user_credits
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can do anything
CREATE POLICY "admin_manage_all_credits" ON user_credits
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Service role bypass (for backend operations)
CREATE POLICY "service_role_bypass_credits" ON user_credits
  FOR ALL USING (auth.role() = 'service_role');

-- 2. CREDIT TRANSACTIONS TABLE
-- Audit log for all credit changes
DROP TABLE IF EXISTS credit_transactions CASCADE;
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason TEXT,
  provider VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Enable RLS for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- User can view their own transactions
CREATE POLICY "user_view_own_transactions" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- User can insert their own transactions
CREATE POLICY "user_insert_own_transactions" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can view all transactions
CREATE POLICY "admin_view_all_transactions" ON credit_transactions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Service role bypass
CREATE POLICY "service_role_bypass_transactions" ON credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- 3. REFERRALS TABLE
-- Tracks referral codes and performance
DROP TABLE IF EXISTS referrals CASCADE;
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  code VARCHAR(10) UNIQUE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_referrals_user_id ON referrals(user_id);
CREATE INDEX idx_referrals_code ON referrals(code);

-- Enable RLS for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- User can view their own referral
CREATE POLICY "user_view_own_referral" ON referrals
  FOR SELECT USING (user_id = auth.uid());

-- User can update their own referral
CREATE POLICY "user_update_own_referral" ON referrals
  FOR UPDATE USING (user_id = auth.uid());

-- User can insert their own referral
CREATE POLICY "user_insert_own_referral" ON referrals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Anyone can view public referral info by code (for joining)
CREATE POLICY "public_view_referral_by_code" ON referrals
  FOR SELECT USING (true);

-- Service role bypass
CREATE POLICY "service_role_bypass_referrals" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

-- 4. REFERRAL USES TABLE
-- Tracks who used which referral code
DROP TABLE IF EXISTS referral_uses CASCADE;
CREATE TABLE referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  bonus_credits INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_referral_uses_referral_id ON referral_uses(referral_id);
CREATE INDEX idx_referral_uses_referred_user_id ON referral_uses(referred_user_id);

-- Enable RLS for referral_uses
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

-- User can view referrals that used their code
CREATE POLICY "user_view_uses_of_code" ON referral_uses
  FOR SELECT USING (
    referral_id IN (SELECT id FROM referrals WHERE user_id = auth.uid())
    OR referred_user_id = auth.uid()
  );

-- User can insert when they use a referral code
CREATE POLICY "user_insert_referral_use" ON referral_uses
  FOR INSERT WITH CHECK (referred_user_id = auth.uid());

-- Admin can view all
CREATE POLICY "admin_view_all_referral_uses" ON referral_uses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Service role bypass
CREATE POLICY "service_role_bypass_referral_uses" ON referral_uses
  FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (Run these to check everything is set up correctly)
-- ════════════════════════════════════════════════════════════════════════════════

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_credits', 'credit_transactions', 'referrals', 'referral_uses');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('user_credits', 'credit_transactions', 'referrals', 'referral_uses');

-- Check policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('user_credits', 'credit_transactions', 'referrals', 'referral_uses') ORDER BY tablename, policyname;
