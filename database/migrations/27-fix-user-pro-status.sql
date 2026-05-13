-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Fix User Pro Status for STARTUP Mode
-- PURPOSE: Mark user ac2a88e0-0268-4098-a3a4-5b18b29f0978 as Pro
--          so they can use STARTUP generation mode with 25 credit deduction
-- ════════════════════════════════════════════════════════════════════════════════

-- Ensure is_pro column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;

-- Mark user as Pro
UPDATE profiles
SET 
  is_pro = true,
  subscription_status = 'active',
  tier = 'pro',
  updated_at = NOW()
WHERE id = 'ac2a88e0-0268-4098-a3a4-5b18b29f0978';

-- Verify the update
SELECT id, is_pro, subscription_status, tier, created_at, updated_at
FROM profiles
WHERE id = 'ac2a88e0-0268-4098-a3a4-5b18b29f0978';
