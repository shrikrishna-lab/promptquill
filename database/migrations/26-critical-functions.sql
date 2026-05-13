-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Critical Functions for AI Router System
-- PURPOSE: Add RPC functions and fixes for generation tracking and analytics
-- ════════════════════════════════════════════════════════════════════════════════

-- ║ 1. FUNCTION: increment_daily_count()
-- ║    Increments daily generation count for a user atomically in database
-- ║    Used by: generationController when tracking daily usage
-- ════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_daily_count(p_user_id UUID)
RETURNS TABLE(
  daily_count INT,
  status VARCHAR
) AS $$
DECLARE
  v_current_count INT;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Update generation_usage table and return new count
  UPDATE generation_usage 
  SET 
    daily_count = daily_count + 1,
    last_generation_date = NOW()
  WHERE user_id = p_user_id
  RETURNING generation_usage.daily_count INTO v_current_count;
  
  -- If no row exists, create it
  IF v_current_count IS NULL THEN
    INSERT INTO generation_usage (user_id, daily_count, last_reset_date, last_generation_date)
    VALUES (p_user_id, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
    SET daily_count = daily_count + 1, last_generation_date = NOW()
    RETURNING generation_usage.daily_count INTO v_current_count;
  END IF;
  
  RETURN QUERY SELECT v_current_count, 'success'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ║ 2. FUNCTION: log_generation_usage()
-- ║    Logs generation details to usage_logs for audit trail
-- ║    Used by: generationController after each generation
-- ════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_generation_usage(
  p_user_id UUID,
  p_action VARCHAR,
  p_provider VARCHAR,
  p_output_length INT,
  p_credits_used INT,
  p_status VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO usage_logs (
    user_id,
    action,
    api_provider,
    tokens_used,
    status,
    created_at
  )
  VALUES (
    p_user_id,
    p_action,
    p_provider,
    p_output_length,
    p_status,
    NOW()
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ║ 3. FUNCTION: update_platform_analytics()
-- ║    Updates daily analytics snapshot
-- ║    Used by: Background job or after each generation
-- ════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_platform_analytics()
RETURNS TABLE(
  date DATE,
  total_users INT,
  new_users INT,
  active_users INT,
  total_prompts INT
) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_total_users INT;
  v_new_users INT;
  v_active_users INT;
  v_total_prompts INT;
BEGIN
  -- Count total users
  SELECT COUNT(DISTINCT id) INTO v_total_users FROM profiles;
  
  -- Count new users today
  SELECT COUNT(DISTINCT id) INTO v_new_users FROM profiles 
  WHERE created_at::DATE = v_today;
  
  -- Count active users (generated something today)
  SELECT COUNT(DISTINCT user_id) INTO v_active_users FROM generation_usage
  WHERE last_generation_date::DATE = v_today;
  
  -- Count total prompts today
  SELECT COUNT(DISTINCT id) INTO v_total_prompts FROM prompts
  WHERE created_at::DATE = v_today;
  
  -- Upsert into analytics table
  INSERT INTO platform_analytics (
    date,
    total_users,
    new_users,
    active_users,
    total_prompts_generated,
    updated_at
  )
  VALUES (
    v_today,
    v_total_users,
    v_new_users,
    v_active_users,
    v_total_prompts,
    NOW()
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = v_total_users,
    new_users = v_new_users,
    active_users = v_active_users,
    total_prompts_generated = v_total_prompts,
    updated_at = NOW();
  
  RETURN QUERY SELECT v_today, v_total_users, v_new_users, v_active_users, v_total_prompts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- Functions are now available for:
-- - increment_daily_count(user_id) - Call after each generation
-- - log_generation_usage(...) - Call to audit each generation
-- - update_platform_analytics() - Call daily to aggregate stats
-- ════════════════════════════════════════════════════════════════════════════════
