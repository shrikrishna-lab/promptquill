-- Fix RLS policy for referrals table - Add INSERT permission
-- Run this in Supabase SQL Editor if the initial migration didn't have it

-- Check if policy exists, if not create it
DO $$
BEGIN
  -- Drop if exists (for re-running)
  DROP POLICY IF EXISTS "users_create_referral" ON referrals;
  
  -- Create INSERT policy for referrals
  CREATE POLICY "users_create_referral" ON referrals 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR auth.jwt() -> 'role' = 'service_role');
    
  RAISE NOTICE 'INSERT policy added to referrals table';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or error: %', SQLERRM;
END
$$;

-- Also ensure INSERT policies exist for referral_uses (for tracking signups)
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_insert_referral_uses" ON referral_uses;
  
  CREATE POLICY "public_insert_referral_uses" ON referral_uses
    FOR INSERT
    WITH CHECK (true); -- Allow any insert for signup tracking
    
  RAISE NOTICE 'INSERT policy added to referral_uses table';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy might already exist or error: %', SQLERRM;
END
$$;

-- Verify RLS is enabled
DO $$
BEGIN
  ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;
  
  RAISE NOTICE 'RLS verification complete';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS might already be enabled: %', SQLERRM;
END
$$;
