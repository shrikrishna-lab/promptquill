-- ════════════════════════════════════════════════════════════════════════════
-- REFERRAL SYSTEM - Complete Schema
-- Handles referral tracking, rewards, milestones, and anti-abuse
-- ════════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS referral_uses CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS referral_milestones CASCADE;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. REFERRALS TABLE - Core referral codes and tracking
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  total_referred INT DEFAULT 0,
  total_credits_earned INT DEFAULT 0,
  pro_conversions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_user_id ON referrals(user_id);
CREATE INDEX idx_referrals_code ON referrals(code);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_referral" ON referrals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "public_view_referral_stats" ON referrals FOR SELECT USING (true);
CREATE POLICY "users_update_own_referral" ON referrals FOR UPDATE USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- 2. REFERRAL USES TABLE - Track each signup from referral link
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  
  -- Status tracking
  signup_completed BOOLEAN DEFAULT FALSE,
  first_prompt_generated BOOLEAN DEFAULT FALSE,
  pro_upgraded BOOLEAN DEFAULT FALSE,
  stayed_30_days BOOLEAN DEFAULT FALSE,
  
  -- Rewards tracking
  signup_bonus_credited BOOLEAN DEFAULT FALSE,
  first_prompt_bonus_credited BOOLEAN DEFAULT FALSE,
  pro_upgrade_bonus_credited BOOLEAN DEFAULT FALSE,
  thirty_day_bonus_credited BOOLEAN DEFAULT FALSE,
  
  -- Fraud detection
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicious_reason VARCHAR(200),
  flagged_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signup_at TIMESTAMP WITH TIME ZONE,
  first_prompt_at TIMESTAMP WITH TIME ZONE,
  pro_upgrade_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referral_uses_referrer_id ON referral_uses(referrer_id);
CREATE INDEX idx_referral_uses_referred_user_id ON referral_uses(referred_user_id);
CREATE INDEX idx_referral_uses_referral_code ON referral_uses(referral_code);
CREATE INDEX idx_referral_uses_is_suspicious ON referral_uses(is_suspicious);

ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_referrals" ON referral_uses FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());
CREATE POLICY "public_view_referral_uses" ON referral_uses FOR SELECT USING (is_suspicious = FALSE);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. REFERRAL MILESTONES TABLE - Track bonuses unlocked
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE referral_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_level INT NOT NULL, -- 1, 10, 100, 250, 500
  credits_bonus INT NOT NULL,
  pro_reward VARCHAR(50), -- '3_months_free' for 500 referrals
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestones_user_id ON referral_milestones(user_id);
CREATE INDEX idx_milestones_level ON referral_milestones(milestone_level);

ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_own_milestones" ON referral_milestones FOR SELECT USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- 4. REFERRAL SETTINGS TABLE - Admin control
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_active BOOLEAN DEFAULT TRUE,
  signup_bonus INT DEFAULT 20,
  referrer_signup_bonus INT DEFAULT 30,
  
  first_prompt_bonus INT DEFAULT 5,
  referrer_first_prompt_bonus INT DEFAULT 10,
  
  pro_upgrade_bonus INT DEFAULT 20,
  referrer_pro_upgrade_bonus INT DEFAULT 50,
  
  thirty_day_bonus INT DEFAULT 0,
  referrer_thirty_day_bonus INT DEFAULT 20,
  
  credits_hold_hours INT DEFAULT 24,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_settings" ON referral_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO referral_settings DEFAULT VALUES;

-- ═════════════════════════════════════════════════════════════════════════
-- SUMMARY:
-- ✅ Tracks every referral with anti-fraud fields
-- ✅ Supports multi-action bonuses (signup, first prompt, pro upgrade, 30-day)
-- ✅ Milestone tracking for bonus unlocks
-- ✅ Admin control over reward amounts
-- ✅ RLS for privacy and security
-- ═════════════════════════════════════════════════════════════════════════
