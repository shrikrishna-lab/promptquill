-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION 28: Pro Status System - Production Ready
-- ════════════════════════════════════════════════════════════════════════════════
-- PURPOSE: 
--   1. Ensure profiles table has all Pro-related columns
--   2. Sync existing data from user_credits table
--   3. Create indexes for performance
--   4. Set up proper defaults for all users
--   5. NO BREAKING CHANGES - works for all existing and new users
-- ════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Add missing columns to profiles table (safe - idempotent)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Create indexes for Pro check queries (improves performance)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON profiles(is_pro) WHERE is_pro = true;
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status) WHERE subscription_status = 'active';
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Ensure all new profiles have default values
-- ═══════════════════════════════════════════════════════════════════════════════

-- Set default values for any profiles missing them
UPDATE profiles
SET 
  is_pro = COALESCE(is_pro, false),
  subscription_status = COALESCE(subscription_status, 'free'),
  tier = COALESCE(tier, 'free')
WHERE is_pro IS NULL 
   OR subscription_status IS NULL 
   OR tier IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Mark specific test user as Pro (for testing)
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE profiles
SET 
  is_pro = true,
  subscription_status = 'active',
  tier = 'pro',
  subscription_started_at = NOW()
WHERE id = 'ac2a88e0-0268-4098-a3a4-5b18b29f0978';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5: Verify the fix worked
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 
  id,
  is_pro,
  subscription_status,
  tier,
  subscription_started_at,
  pro_expires_at
FROM profiles 
WHERE id = 'ac2a88e0-0268-4098-a3a4-5b18b29f0978';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 6: Check Pro user count (for monitoring)
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 
  COUNT(*) as total_profiles,
  SUM(CASE WHEN is_pro = true THEN 1 ELSE 0 END) as pro_users,
  SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscriptions
FROM profiles;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOCUMENTATION FOR FUTURE USE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- When a user buys Pro (after payment processing):
-- 
--   UPDATE profiles
--   SET 
--     is_pro = true,
--     subscription_status = 'active',
--     tier = 'pro',
--     subscription_started_at = NOW(),
--     pro_expires_at = NOW() + INTERVAL '1 year'  -- Adjust based on subscription period
--   WHERE id = 'USER_ID_FROM_PAYMENT_SYSTEM';
--
-- When a subscription expires:
--
--   UPDATE profiles
--   SET 
--     is_pro = false,
--     subscription_status = 'expired',
--     tier = 'free'
--   WHERE id = 'USER_ID' AND pro_expires_at <= NOW();
--
-- To check if user is Pro (used by backend):
--   - Check: is_pro = true OR subscription_status = 'active'
--   - Both conditions checked by checkUserIsPro() in aiGeneration.js
--
-- ═════════════════════════════════════════════════════════════════════════════════
