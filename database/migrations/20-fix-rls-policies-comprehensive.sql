-- ════════════════════════════════════════════════════════════════════════════════
-- RLS POLICY FIXES - Critical Database Policies
-- Run this in Supabase SQL Editor IMMEDIATELY after discovering 403 errors
-- ════════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════════
-- FIX 1: prompt_versions - Add INSERT and UPDATE policies
-- Issue: 403 error when saving new versions
-- Root cause: Table only had SELECT policy, missing INSERT/UPDATE
-- ════════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_insert_own_versions" ON prompt_versions;
DROP POLICY IF EXISTS "user_update_own_versions" ON prompt_versions;

CREATE POLICY "user_insert_own_versions" ON prompt_versions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "user_update_own_versions" ON prompt_versions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Allow delete of own versions
CREATE POLICY "user_delete_own_versions" ON prompt_versions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════════════════════════
-- FIX 2: usage_logs - Add INSERT policy for authenticated users
-- Issue: 403 error when logging usage metrics
-- Root cause: Missing INSERT policy for authenticated users (only service_role/admin)
-- ════════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_insert_own_logs" ON usage_logs;

CREATE POLICY "user_insert_own_logs" ON usage_logs 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Also allow users to view their own usage logs
DROP POLICY IF EXISTS "user_view_own_logs" ON usage_logs;

CREATE POLICY "user_view_own_logs" ON usage_logs 
  FOR SELECT 
  USING (user_id = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════════
-- FIX 3: user_interactions - Add INSERT policy
-- Issue: 403 error when tracking user interactions (likes, shares, etc.)
-- Root cause: Missing INSERT policy (only had SELECT)
-- ════════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_insert_interaction" ON user_interactions;

CREATE POLICY "user_insert_interaction" ON user_interactions 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Allow users to view their own interactions
DROP POLICY IF EXISTS "user_view_own_interactions" ON user_interactions;

CREATE POLICY "user_view_own_interactions" ON user_interactions 
  FOR SELECT 
  USING (user_id = auth.uid() OR true);  -- true allows public read for shared sessions

-- ════════════════════════════════════════════════════════════════════════════════
-- FIX 4: credit_transactions - Add INSERT/SELECT policies
-- Issue: 403 error on credit transaction operations
-- Root cause: Missing INSERT policy for admins to adjust user credits
-- Allow: Users see own transactions, Admins can insert transactions for any user
-- ════════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "user_view_own_transactions_audit" ON credit_transactions;
DROP POLICY IF EXISTS "user_insert_own_transactions_audit" ON credit_transactions;
DROP POLICY IF EXISTS "admin_insert_any_transactions" ON credit_transactions;

-- Users can view their own transactions
CREATE POLICY "user_view_own_transactions_audit" ON credit_transactions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can insert their own transactions (for system-generated credits)
CREATE POLICY "user_insert_own_transactions_audit" ON credit_transactions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Admins can insert transactions for any user (credit adjustments)
CREATE POLICY "admin_insert_any_transactions" ON credit_transactions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- Run these to verify policies are in place:
-- ════════════════════════════════════════════════════════════════════════════════

-- Verify prompt_versions policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'prompt_versions';

-- Verify usage_logs policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'usage_logs';

-- Verify user_interactions policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'user_interactions';

-- ════════════════════════════════════════════════════════════════════════════════
-- IMPACT ANALYSIS
-- ════════════════════════════════════════════════════════════════════════════════

-- After applying these fixes, the following operations will now work:

-- 1. Frontend can insert prompt versions:
--    INSERT INTO prompt_versions (session_id, version_number, prompt_text, score) VALUES (...)

-- 2. Frontend can log usage metrics:
--    INSERT INTO usage_logs (user_id, action, api_provider, tokens_used, cost_usd) VALUES (...)

-- 3. Frontend can track interactions:
--    INSERT INTO user_interactions (user_id, session_id, interaction_type) VALUES (...)

-- 4. Frontend can view own transactions:
--    SELECT * FROM credit_transactions WHERE user_id = auth.uid()

-- All of these will no longer return 403 Forbidden errors.

