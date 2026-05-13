-- ═══════════════════════════════════════════════════════════
-- FIX RLS INFINITE RECURSION ISSUE
-- Run this FIRST in Supabase SQL Editor to clean up broken policies
-- ═══════════════════════════════════════════════════════════

-- DISABLE RLS TEMPORARILY TO FIX THE POLICIES
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns DISABLE ROW LEVEL SECURITY;

-- DROP ALL AFFECTED POLICIES
-- Profiles policies
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins view all roles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted admin access" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted admin update" ON public.profiles;
DROP POLICY IF EXISTS "Whitelisted admin delete" ON public.profiles;

-- Admin audit log policies
DROP POLICY IF EXISTS "Admins view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins insert audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Whitelisted admin view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Whitelisted admin insert audit logs" ON public.admin_audit_log;

-- Revenue events policies
DROP POLICY IF EXISTS "Admins view all revenue" ON public.revenue_events;
DROP POLICY IF EXISTS "Whitelisted admin view revenue" ON public.revenue_events;
DROP POLICY IF EXISTS "Users view own revenue" ON public.revenue_events;

-- Email campaigns policies
DROP POLICY IF EXISTS "Admins view all campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins delete campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins create campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns SELECT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns INSERT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins manage campaigns DELETE" ON public.email_campaigns;
DROP POLICY IF EXISTS "Whitelisted admin campaigns SELECT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Whitelisted admin campaigns INSERT" ON public.email_campaigns;
DROP POLICY IF EXISTS "Whitelisted admin campaigns DELETE" ON public.email_campaigns;

-- ═══════════════════════════════════════════════════════════
-- NOW RE-ENABLE RLS WITH PROPER (NON-RECURSIVE) POLICIES
-- ═══════════════════════════════════════════════════════════

-- PROFILES TABLE RLS (NO RECURSIVE SUBQUERIES)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Whitelisted admin email access (non-recursive, uses JWT email claim directly)
CREATE POLICY "Whitelisted admin access" ON public.profiles
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin update" ON public.profiles
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin delete" ON public.profiles
  FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- ADMIN AUDIT LOG RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Whitelisted admin view audit logs" ON public.admin_audit_log
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin insert audit logs" ON public.admin_audit_log
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com' OR admin_email = auth.jwt() ->> 'email');

-- REVENUE EVENTS RLS
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Whitelisted admin view revenue" ON public.revenue_events
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com' OR user_id = auth.uid());

CREATE POLICY "Users view own revenue" ON public.revenue_events
  FOR SELECT USING (user_id = auth.uid());

-- EMAIL CAMPAIGNS RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Whitelisted admin campaigns SELECT" ON public.email_campaigns
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin campaigns INSERT" ON public.email_campaigns
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Whitelisted admin campaigns DELETE" ON public.email_campaigns
  FOR DELETE USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- ═══════════════════════════════════════════════════════════
-- FIX APPLIED - RLS policies are now non-recursive
-- All queries from the console should now work without 500 errors
-- ═══════════════════════════════════════════════════════════
