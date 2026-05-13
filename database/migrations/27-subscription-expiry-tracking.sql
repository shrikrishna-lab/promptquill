-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Subscription Expiry Tracking & Tier Management
-- PURPOSE: Add subscription expiration tracking, tier management, and auto-downgrade
--          support for Pro plan subscriptions
-- ════════════════════════════════════════════════════════════════════════════════

-- ║ 1. ADD SUBSCRIPTION EXPIRY COLUMNS TO PROFILES TABLE
-- ════════════════════════════════════════════════════════

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_auto_renew BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_downgrade_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN profiles.subscription_start_date IS 'When current subscription started (used for renewal tracking)';
COMMENT ON COLUMN profiles.subscription_end_date IS 'When current subscription expires (for auto-downgrade)';
COMMENT ON COLUMN profiles.subscription_plan IS 'Current subscription plan: pro_monthly, pro_yearly, or null for free';
COMMENT ON COLUMN profiles.subscription_auto_renew IS 'Whether to auto-renew when subscription expires';
COMMENT ON COLUMN profiles.last_downgrade_date IS 'When user was last downgraded from pro to free (for analytics)';

-- Create index on subscription_end_date for efficient downgrade queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end_date ON profiles(subscription_end_date)
WHERE subscription_end_date IS NOT NULL AND tier = 'pro';

-- Create index on tier for efficient tier filtering
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);


-- ║ 2. CREATE SUBSCRIPTION HISTORY TABLE FOR AUDITING
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'renew', 'cancel'
  from_tier VARCHAR(50),
  to_tier VARCHAR(50),
  plan_type VARCHAR(50), -- pro_monthly, pro_yearly, etc
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created ON subscription_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_history_action ON subscription_history(action);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_view_own_subscription_history" ON subscription_history 
  FOR SELECT USING (user_id = auth.uid());


-- ║ 3. CREATE AUTO-DOWNGRADE FUNCTION
-- ════════════════════════════════════

CREATE OR REPLACE FUNCTION check_and_downgrade_expired_subscriptions()
RETURNS TABLE(user_id UUID, downgraded BOOLEAN, from_tier VARCHAR, to_tier VARCHAR) AS $$
DECLARE
  v_expired_count INT := 0;
  v_cursor CURSOR FOR
    SELECT id, tier, subscription_end_date, subscription_plan
    FROM profiles
    WHERE tier = 'pro' 
    AND subscription_end_date IS NOT NULL 
    AND subscription_end_date < NOW()
    AND (last_downgrade_date IS NULL OR last_downgrade_date < subscription_end_date);
BEGIN
  FOR rec IN v_cursor LOOP
    -- Update to free tier
    UPDATE profiles SET
      tier = 'free',
      subscription_status = 'inactive',
      subscription_plan = NULL,
      daily_allowance = 50,
      generation_count_today = 0,
      last_downgrade_date = NOW(),
      updated_at = NOW()
    WHERE id = rec.id;

    -- Record in subscription history
    INSERT INTO subscription_history 
    (user_id, action, from_tier, to_tier, plan_type, reason, created_at)
    VALUES 
    (rec.id, 'downgrade', 'pro', 'free', rec.subscription_plan, 'subscription_expired', NOW());

    v_expired_count := v_expired_count + 1;
    RETURN QUERY SELECT rec.id, TRUE::BOOLEAN, rec.tier, 'free'::VARCHAR;
  END LOOP;

  -- Log summary
  RAISE NOTICE 'Auto-downgraded % expired subscriptions', v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users (for admin check endpoint)
GRANT EXECUTE ON FUNCTION check_and_downgrade_expired_subscriptions() TO anon, authenticated;


-- ║ 4. CREATE SUBSCRIPTION UPGRADE FUNCTION
-- ════════════════════════════════════════

CREATE OR REPLACE FUNCTION upgrade_to_pro(
  p_user_id UUID,
  p_plan_type VARCHAR,
  p_payment_id VARCHAR
)
RETURNS TABLE(success BOOLEAN, message VARCHAR, subscription_end_date TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_old_tier VARCHAR;
  v_is_renewal BOOLEAN;
BEGIN
  -- Calculate subscription end date based on plan
  CASE p_plan_type
    WHEN 'pro_monthly' THEN
      v_end_date := NOW() + INTERVAL '30 days';
    WHEN 'pro_yearly' THEN
      v_end_date := NOW() + INTERVAL '365 days';
    ELSE
      RAISE EXCEPTION 'Invalid plan type: %', p_plan_type;
  END CASE;

  -- Get current tier
  SELECT tier INTO v_old_tier FROM profiles WHERE id = p_user_id;
  v_is_renewal := (v_old_tier = 'pro');

  -- Update profile
  UPDATE profiles SET
    tier = 'pro',
    subscription_status = 'active',
    subscription_plan = p_plan_type,
    subscription_start_date = CASE WHEN v_is_renewal THEN subscription_start_date ELSE NOW() END,
    subscription_end_date = v_end_date,
    subscription_auto_renew = TRUE,
    daily_allowance = 500,
    is_pro = TRUE
  WHERE id = p_user_id;

  -- Record in subscription history
  INSERT INTO subscription_history 
  (user_id, action, from_tier, to_tier, plan_type, start_date, end_date, reason, created_at)
  VALUES 
  (p_user_id, CASE WHEN v_is_renewal THEN 'renew' ELSE 'upgrade' END, 
   v_old_tier, 'pro', p_plan_type, NOW(), v_end_date, 
   'payment_' || p_payment_id, NOW());

  RETURN QUERY SELECT TRUE::BOOLEAN, 'Pro upgrade successful'::VARCHAR, v_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upgrade_to_pro(UUID, VARCHAR, VARCHAR) TO anon, authenticated;


-- ║ 5. CREATE SUBSCRIPTION VALIDATION POLICY
-- ════════════════════════════════════════

-- Create a view showing active vs expired subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  id,
  id AS user_id,
  tier,
  subscription_status,
  subscription_plan,
  subscription_start_date,
  subscription_end_date,
  (subscription_end_date > NOW()) AS is_active,
  EXTRACT(DAY FROM (subscription_end_date - NOW()))::INT AS days_remaining
FROM profiles
WHERE tier = 'pro' AND subscription_end_date IS NOT NULL;

-- Create a view for expired subscriptions
CREATE OR REPLACE VIEW expired_subscriptions AS
SELECT 
  id,
  id AS user_id,
  tier,
  subscription_plan,
  subscription_end_date,
  EXTRACT(DAY FROM (NOW() - subscription_end_date))::INT AS days_expired
FROM profiles
WHERE tier = 'pro' 
  AND subscription_end_date IS NOT NULL 
  AND subscription_end_date < NOW()
  AND (last_downgrade_date IS NULL OR last_downgrade_date < subscription_end_date);


-- ║ 6. DATA MIGRATION - Set tier='pro' for existing is_pro=true users
-- ════════════════════════════════════════════════════════════════

UPDATE profiles 
SET tier = 'pro', 
    subscription_status = 'active',
    daily_allowance = 500,
    subscription_end_date = NOW() + INTERVAL '365 days'
WHERE is_pro = TRUE AND tier = 'free'
AND subscription_end_date IS NULL;

-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ════════════════════════════════════════════════════════════════════════════════
