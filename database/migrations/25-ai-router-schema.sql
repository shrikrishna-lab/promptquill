-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: AI Router System Database Schema
-- PURPOSE: Add tables and columns required for intelligent AI provider routing,
--          caching, request queuing, and credit management system
-- ════════════════════════════════════════════════════════════════════════════════

-- ║ 1. GENERATION_USAGE TABLE - Core table for tracking daily generation counts
-- ║    Required by: generationController.js, credits.js
-- ║    Used for: Daily credit reset logic, generation count tracking per user
-- ════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS generation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_count INT DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_usage_user_id ON generation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_usage_last_reset ON generation_usage(last_reset_date);

ALTER TABLE generation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_view_own_generation_usage" ON generation_usage 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_update_own_generation_usage" ON generation_usage 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_insert_generation_usage" ON generation_usage 
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- ║ 2. PROFILES TABLE - Add columns for subscription/tier/credit management
-- ║    Required by: generationController.js (lines ~130-150)
-- ║    Used for: Tier detection, daily allowance enforcement, credit reset tracking
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS daily_allowance INT DEFAULT 50,
ADD COLUMN IF NOT EXISTS generation_count_today INT DEFAULT 0;

-- Add comments for clarity (PostgreSQL supports this)
COMMENT ON COLUMN profiles.subscription_status IS 'active or inactive subscription status';
COMMENT ON COLUMN profiles.tier IS 'free (50 credits) or pro (500 credits)';
COMMENT ON COLUMN profiles.last_credit_reset IS 'timestamp of last daily credit reset (midnight IST)';
COMMENT ON COLUMN profiles.daily_allowance IS 'daily generation count allowance based on tier';
COMMENT ON COLUMN profiles.generation_count_today IS 'number of generations performed today';


-- ║ 3. PROMPTS TABLE - Add columns for AI router tracking and analytics
-- ║    Required by: generationController.js (when saving new prompts)
-- ║    Used for: Provider tracking, cache hit detection, credit audit trail
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS provider VARCHAR(100),
ADD COLUMN IF NOT EXISTS output_length INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mode VARCHAR(100);

COMMENT ON COLUMN prompts.provider IS 'AI provider used to generate (groq, gemini, cloudflare, etc)';
COMMENT ON COLUMN prompts.output_length IS 'character length of generated output for credit calculation';
COMMENT ON COLUMN prompts.credits_used IS 'actual credits deducted for this generation';
COMMENT ON COLUMN prompts.is_cached IS 'whether this response was served from cache';
COMMENT ON COLUMN prompts.mode IS 'generation mode (brainstorm, develop, roast, etc)';

-- Create indexes for new columns for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_provider ON prompts(provider);
CREATE INDEX IF NOT EXISTS idx_prompts_is_cached ON prompts(is_cached);
CREATE INDEX IF NOT EXISTS idx_prompts_credits_used ON prompts(credits_used);


-- ║ 4. RLS POLICIES - Secure access to new generation_usage table
-- ║    Ensures users can only access their own generation tracking data
-- ════════════════════════════════════════════════════════════════════════════════

-- (Already created above in section 1, but included here for documentation)


-- ║ 5. MIGRATION NOTES
-- ════════════════════════════════════════════════════════════════════════════════
/*
DEPLOYMENT CHECKLIST:
  [ ] 1. Copy entire migration to Supabase SQL Editor in the order listed
  [ ] 2. Verify each step executes without error
  [ ] 3. Run verification queries (provided below)
  [ ] 4. Test generation endpoint after all migrations applied
  [ ] 5. Monitor error logs for any schema-related issues
  
VERIFICATION QUERIES (run after applying migration):

-- Check generation_usage table exists and has correct structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'generation_usage' ORDER BY ordinal_position;

-- Check profiles table has all new columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN 
('subscription_status', 'tier', 'last_credit_reset', 'daily_allowance', 'generation_count_today')
ORDER BY ordinal_position;

-- Check prompts table has all new columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name IN 
('provider', 'output_length', 'credits_used', 'is_cached', 'mode')
ORDER BY ordinal_position;

-- Check RLS policies are enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('generation_usage', 'prompts', 'profiles');

ROLLBACK PLAN (if issues occur):
If any of the above fails, contact the development team with:
  1. The exact error message
  2. Which step failed (1, 2, 3, or 4)
  3. Screenshot or copy of the error

DO NOT attempt to manually drop tables without consulting the team first.
*/

-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- All tables and columns required for AI Router System are now in place
-- ════════════════════════════════════════════════════════════════════════════════
