-- ════════════════════════════════════════════════════════════════════════════════
-- FIX RLS POLICIES - Add INSERT/UPDATE Permissions
-- Run this in Supabase SQL Editor if policies are missing
-- ════════════════════════════════════════════════════════════════════════════════

-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view referral uses they created" ON referral_uses;

-- ═══ USER CREDITS POLICIES ═══
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ═══ CREDIT TRANSACTIONS POLICIES ═══
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ═══ REFERRALS POLICIES ═══
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own referrals" ON referrals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ═══ REFERRAL USES POLICIES ═══
CREATE POLICY "Users can view referral uses they created" ON referral_uses
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can insert referral uses" ON referral_uses
  FOR INSERT WITH CHECK (referrer_id = auth.uid() OR referred_user_id = auth.uid());
