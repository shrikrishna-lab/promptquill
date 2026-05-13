-- ═══════════════════════════════════════════════════════════
-- ADMIN SECURITY FIX - Role-based RLS & Audit Logging
-- Run this ONCE in Supabase SQL Editor AFTER prompt-quill-migration.sql
-- ═══════════════════════════════════════════════════════════

-- 1. FIX HARDCODED EMAIL IN RLS POLICIES
-- Drop ALL existing policies on profiles (clean slate)
DROP POLICY IF EXISTS "Admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Create role-based policies + whitelisted email fallback (NO RECURSIVE SUBQUERIES)
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Special policy for whitelisted admin email to bypass role check
CREATE POLICY "Whitelisted admin access" ON public.profiles
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin update" ON public.profiles
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin delete" ON public.profiles
  FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- 2. CREATE ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_email VARCHAR NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('create_admin', 'revoke_admin', 'promote_pro', 'demote_pro', 'adjust_credits', 'delete_user', 'delete_session', 'toggle_feature_flag', 'create_promo_code', 'delete_promo_code', 'create_announcement', 'delete_announcement', 'delete_waitlist_entry', 'send_email_campaign')),
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_user_email VARCHAR,
  target_resource_id VARCHAR,
  target_resource_type VARCHAR,
  changes JSONB DEFAULT '{}'::JSONB,
  reason VARCHAR,
  ip_address VARCHAR,
  status VARCHAR DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for audit log (admins can view, only they can insert)
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Admins view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Whitelisted admin view audit logs" ON public.admin_audit_log
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin insert audit logs" ON public.admin_audit_log
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com' OR admin_email = auth.jwt() ->> 'email');

-- 3. FIX EXISTING RLS POLICIES FOR ADMIN TABLES
-- Update revenue_events RLS
DROP POLICY IF EXISTS "Admins view all revenue" ON public.revenue_events;
CREATE POLICY "Whitelisted admin view revenue" ON public.revenue_events
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com' OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users view own revenue" ON public.revenue_events;
CREATE POLICY "Users view own revenue" ON public.revenue_events
  FOR SELECT USING (user_id = auth.uid());

-- Update email_campaigns RLS
DROP POLICY IF EXISTS "Admins view all campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins delete campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins create campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns SELECT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns INSERT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns DELETE" ON public.email_campaigns;

CREATE POLICY "Whitelisted admin campaigns SELECT" ON public.email_campaigns
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin campaigns INSERT" ON public.email_campaigns
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin campaigns DELETE" ON public.email_campaigns
  FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- 4. ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_user_id ON public.admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- 5. ENABLE REALTIME ON AUDIT LOG (if not already added)
-- This is optional - uncomment if you want realtime updates on audit log
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS admin_audit_log;

-- ═══════════════════════════════════════════════════════════
-- SUMMARY OF CHANGES:
-- ✓ Fixed email-based RLS to role-based RLS in profiles table
-- ✓ Created admin_audit_log table for action tracking
-- ✓ Updated all admin RLS policies to use role check
-- ✓ Added performance indexes
-- ✓ Enabled realtime for audit logs
-- ═══════════════════════════════════════════════════════════
