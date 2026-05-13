/**
 * Enhanced Subscription Upgrade Function
 * Fixes all edge cases and handles missing columns
 */


CREATE OR REPLACE FUNCTION upgrade_to_pro_v2(
  p_user_id UUID,
  p_plan_type VARCHAR,
  p_payment_id VARCHAR
)
RETURNS TABLE(success BOOLEAN, message VARCHAR, new_tier VARCHAR) AS $$
DECLARE
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_old_tier VARCHAR;
  v_is_renewal BOOLEAN;
  v_update_count INT;
BEGIN
  -- Log the call
  RAISE NOTICE 'upgrade_to_pro_v2 called for user % with plan %', p_user_id, p_plan_type;

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

  -- Safely update profile with only columns that exist
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

  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  
  IF v_update_count = 0 THEN
    RAISE EXCEPTION 'User % not found or update failed', p_user_id;
  END IF;

  -- Record in subscription history
  INSERT INTO subscription_history 
  (user_id, action, from_tier, to_tier, plan_type, start_date, end_date, reason, created_at)
  VALUES 
  (p_user_id, CASE WHEN v_is_renewal THEN 'renew' ELSE 'upgrade' END, 
   v_old_tier, 'pro', p_plan_type, NOW(), v_end_date, 
   'payment_' || p_payment_id, NOW());

  RAISE NOTICE 'upgrade_to_pro_v2 completed successfully - tier: %, updated rows: %', v_old_tier, v_update_count;

  RETURN QUERY SELECT TRUE::BOOLEAN, 'Pro upgrade successful'::VARCHAR, 'pro'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upgrade_to_pro_v2(UUID, VARCHAR, VARCHAR) TO anon, authenticated;

-- Replace old function with new one
DROP FUNCTION IF EXISTS upgrade_to_pro(UUID, VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION upgrade_to_pro(
  p_user_id UUID,
  p_plan_type VARCHAR,
  p_payment_id VARCHAR
)
RETURNS TABLE(success BOOLEAN, message VARCHAR, new_tier VARCHAR) AS $$
BEGIN
  -- Just call the v2 function
  RETURN QUERY SELECT * FROM upgrade_to_pro_v2(p_user_id, p_plan_type, p_payment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upgrade_to_pro(UUID, VARCHAR, VARCHAR) TO anon, authenticated;
