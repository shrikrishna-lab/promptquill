-- ════════════════════════════════════════════════════════════════════════════════
-- FIX MISSING COLUMNS FOR BLOG & PROMO CODES
-- ════════════════════════════════════════════════════════════════════════════════

-- Add missing columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);

-- Fix promo_codes table - rename column if needed
-- First, check if discount_percentage exists and migrate data
ALTER TABLE promo_codes
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0;

-- Update discount_percentage from discount_value for backward compatibility
UPDATE promo_codes 
SET discount_percentage = discount_value 
WHERE discount_percentage = 0 AND discount_value > 0;

-- Rename used_count to current_uses if needed (create alias)
ALTER TABLE promo_codes
ADD COLUMN IF NOT EXISTS current_uses INT DEFAULT 0;

-- Keep both columns in sync during write operations (used_count is primary)
UPDATE promo_codes 
SET current_uses = used_count 
WHERE current_uses != used_count;

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFY SCHEMA
-- ════════════════════════════════════════════════════════════════════════════════
-- Run these to verify:
-- SELECT column_name FROM information_schema.columns WHERE table_name='blog_posts';
-- SELECT column_name FROM information_schema.columns WHERE table_name='promo_codes';
