-- Run this script in the Supabase SQL Editor to enforce strict Row Level Security (RLS) on your prompt sessions and support tickets
-- This guarantees user's data remains private to them directly at the database layer.

-- 1. Enforce RLS on Sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Remove any potentially insecure existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON sessions;
DROP POLICY IF EXISTS "Public sessions are visible to everyone" ON sessions;

-- Creating proper isolation: Users can only see their own sessions OR public sessions
CREATE POLICY "Users can view their own sessions and public sessions" ON sessions
FOR SELECT USING (
  auth.uid() = user_id OR is_public = true
);

-- Users can only insert/update/delete their own sessions
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);


-- 2. Enforce RLS on Support Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON support_tickets;

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view/update all tickets (assuming you have an admin bypass role or logic)
-- Note: Your admin panel might need a bypass if 'role' is stored in profiles.
