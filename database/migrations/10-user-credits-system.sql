-- ════════════════════════════════════════════════════════════════════════════════
-- USER CREDITS & REFERRAL SYSTEM
-- Implements monetization with credits, pro plans, and referral program
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. User Credits Table
-- Tracks available credits for each user
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 10,
  daily_limit INTEGER NOT NULL DEFAULT 100,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_pro BOOLEAN DEFAULT FALSE,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Credit Transactions Table
-- Audit log for all credit changes
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'generation', 'referral', 'purchase', 'reset', 'admin_adjust', 'refund'
  reason TEXT,
  provider VARCHAR(50), -- 'groq', 'gemini', 'openrouter', 'razorpay', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- 3. Referrals Table
-- Tracks referral codes and performance
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  referrals_count INTEGER DEFAULT 0,
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_referrals_user_id ON referrals(user_id);
CREATE INDEX idx_referrals_code ON referrals(code);

-- 4. Referral Uses Table
-- Tracks which user referred which user
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  bonus_credits INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(referred_user_id) -- Each user can only be referred once
);
CREATE INDEX idx_referral_uses_referrer_id ON referral_uses(referrer_id);
CREATE INDEX idx_referral_uses_referred_user_id ON referral_uses(referred_user_id);

-- 5. Platform Settings Table
-- Configurable settings for credit system
CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value) VALUES
  ('free_daily_credits', '100'),
  ('pro_daily_credits', '300'),
  ('referral_bonus_credits', '25'),
  ('credit_cost_groq', '1'),
  ('credit_cost_gemini', '2'),
  ('credit_cost_openrouter', '3'),
  ('generation_cost_simple', '1'),
  ('generation_cost_medium', '2'),
  ('generation_cost_complex', '3')
ON CONFLICT (key) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own credits
CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own credits
CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own referral info
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own referrals
CREATE POLICY "Users can insert own referrals" ON referrals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view referrals they created
CREATE POLICY "Users can view referral uses they created" ON referral_uses
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Users can insert referral uses
CREATE POLICY "Users can insert referral uses" ON referral_uses
  FOR INSERT WITH CHECK (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Users can view platform settings (read-only)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON platform_settings
  FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════════════════════

-- Function to initialize credits for new user
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, daily_limit)
  VALUES (NEW.id, 10, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to initialize credits on user signup
CREATE TRIGGER trigger_initialize_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_credits();

-- Function to apply referral bonus
CREATE OR REPLACE FUNCTION apply_referral_bonus(
  p_referrer_id UUID,
  p_referred_user_id UUID,
  p_bonus_credits INTEGER DEFAULT 25
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Award credits to referrer
  UPDATE user_credits
  SET balance = balance + p_bonus_credits,
      total_earned = total_earned + p_bonus_credits
  WHERE user_id = p_referrer_id;

  -- Award credits to referred user
  UPDATE user_credits
  SET balance = balance + p_bonus_credits,
      total_earned = total_earned + p_bonus_credits
  WHERE user_id = p_referred_user_id;

  -- Log transactions
  INSERT INTO credit_transactions (user_id, amount, type, reason, provider)
  VALUES
    (p_referrer_id, p_bonus_credits, 'referral', 'Referral bonus', 'referral'),
    (p_referred_user_id, p_bonus_credits, 'referral', 'Referral bonus', 'referral');

  -- Record referral use
  INSERT INTO referral_uses (referrer_id, referred_user_id, bonus_credits)
  VALUES (p_referrer_id, p_referred_user_id, p_bonus_credits);

  -- Update referral stats
  UPDATE referrals
  SET referrals_count = referrals_count + 1,
      credits_earned = credits_earned + p_bonus_credits,
      updated_at = NOW()
  WHERE user_id = p_referrer_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits for generation
CREATE OR REPLACE FUNCTION deduct_generation_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'AI generation'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has enough credits
  IF (SELECT balance FROM user_credits WHERE user_id = p_user_id) < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET balance = balance - p_amount,
      total_spent = total_spent + p_amount
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, reason, provider)
  VALUES (p_user_id, -p_amount, 'generation', p_reason, 'groq');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- Run this script once when setting up the database
-- ════════════════════════════════════════════════════════════════════════════════
