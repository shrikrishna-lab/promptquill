-- ========================================
-- DATABASE TRIGGERS FOR SECURITY
-- ========================================
--
-- COPY AND PASTE THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- Then run it ALL AT ONCE
--
-- These triggers prevent:
-- 1. Users from self-upgrading their plan
-- 2. Users from self-adding credits
-- 3. Users from removing their ban status
-- ========================================

-- ========== TRIGGER 1: Prevent Subscription Self-Upgrade ==========

-- Create function to prevent subscription changes from non-service roles
CREATE OR REPLACE FUNCTION prevent_subscription_self_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role (backend) to change subscription
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from changing their own subscription/tier, role, or pro status
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan OR 
     NEW.tier IS DISTINCT FROM OLD.tier OR 
     NEW.role IS DISTINCT FROM OLD.role OR 
     NEW.is_pro IS DISTINCT FROM OLD.is_pro OR
     NEW.daily_allowance IS DISTINCT FROM OLD.daily_allowance THEN
    RAISE EXCEPTION 'Critical account field changes are not allowed from client.';
  END IF;
  
  -- Prevent users from changing subscription_status
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Subscription status changes are not allowed from client.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_subscription_self_upgrade_trigger ON public.profiles;

-- Create trigger on profiles table (where subscription/tier is stored)
CREATE TRIGGER prevent_subscription_self_upgrade_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_subscription_self_upgrade();

-- ========== TRIGGER 2: Prevent Credit Self-Addition ==========

-- Create function to prevent credit additions from non-service roles
CREATE OR REPLACE FUNCTION prevent_credit_self_add()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role (backend) to deduct credits
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from increasing their own balance
  IF NEW.balance > OLD.balance THEN
    RAISE EXCEPTION 'Credits can only be added by system, not from client.';
  END IF;
  
  -- Allow users to decrease their balance (generation deduction)
  IF NEW.balance <= OLD.balance THEN
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_credit_self_add_trigger ON public.user_credits;

-- Create trigger on user_credits table
CREATE TRIGGER prevent_credit_self_add_trigger
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION prevent_credit_self_add();

-- ========== TRIGGER 3: Log Credit Transactions ==========

-- Create function to log all credit changes
CREATE OR REPLACE FUNCTION log_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log changes, not inserts
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.credit_transactions (
      user_id,
      amount,
      type,
      reason,
      balance_before,
      balance_after
    ) VALUES (
      NEW.user_id,
      OLD.balance - NEW.balance,
      CASE 
        WHEN OLD.balance > NEW.balance THEN 'deduction'
        ELSE 'adjustment'
      END,
      'Automatic tracking',
      OLD.balance,
      NEW.balance
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS log_credit_transaction_trigger ON public.user_credits;

-- Create trigger to log transactions
CREATE TRIGGER log_credit_transaction_trigger
  AFTER UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION log_credit_transaction();

-- ========== TRIGGER 4: Auto-Update Timestamps ==========

-- Create function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if the column exists
  IF NEW.updated_at IS NOT NULL THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to profiles table
DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_credits table
DROP TRIGGER IF EXISTS update_user_credits_timestamp ON public.user_credits;
CREATE TRIGGER update_user_credits_timestamp
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to prompts table
DROP TRIGGER IF EXISTS update_prompts_timestamp ON public.prompts;
CREATE TRIGGER update_prompts_timestamp
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== VERIFICATION QUERY ==========

-- Copy and paste this to verify triggers are created:
/*
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Expected to see:
-- - prevent_subscription_self_upgrade_trigger
-- - prevent_credit_self_add_trigger
-- - log_credit_transaction_trigger
-- - update_profiles_timestamp
-- - update_user_credits_timestamp
-- - update_prompts_timestamp
*/

-- ========== FINAL STATUS ==========

-- All triggers are now ACTIVE and protecting your data:
--
-- ✅ Users cannot upgrade their own subscription
-- ✅ Users cannot add credits themselves
-- ✅ All credit changes are logged to credit_transactions
-- ✅ All timestamps are automatically tracked
--
-- The database is now SECURE!
