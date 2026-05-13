import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function setupAdminRLS() {
  const sql = `
  -- Function to check if current user is an admin
  CREATE OR REPLACE FUNCTION is_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Apply admin policies to profiles
  DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
  CREATE POLICY "Admins can do everything on profiles" ON profiles
    FOR ALL
    USING (is_admin() OR auth.uid() = id)
    WITH CHECK (is_admin() OR auth.uid() = id);

  -- Apply admin policies to user_credits
  DROP POLICY IF EXISTS "Admins can do everything on user_credits" ON user_credits;
  CREATE POLICY "Admins can do everything on user_credits" ON user_credits
    FOR ALL
    USING (is_admin() OR auth.uid() = user_id)
    WITH CHECK (is_admin() OR auth.uid() = user_id);

  -- Apply admin policies to usage_logs
  DROP POLICY IF EXISTS "Admins can do everything on usage_logs" ON usage_logs;
  CREATE POLICY "Admins can do everything on usage_logs" ON usage_logs
    FOR ALL
    USING (is_admin() OR auth.uid() = user_id)
    WITH CHECK (is_admin() OR auth.uid() = user_id);

  -- Apply admin policies to sessions
  DROP POLICY IF EXISTS "Admins can do everything on sessions" ON sessions;
  CREATE POLICY "Admins can do everything on sessions" ON sessions
    FOR ALL
    USING (is_admin() OR auth.uid() = user_id)
    WITH CHECK (is_admin() OR auth.uid() = user_id);

  -- Apply admin policies to credit_transactions
  DROP POLICY IF EXISTS "Admins can do everything on credit_transactions" ON credit_transactions;
  CREATE POLICY "Admins can do everything on credit_transactions" ON credit_transactions
    FOR ALL
    USING (is_admin() OR auth.uid() = user_id)
    WITH CHECK (is_admin() OR auth.uid() = user_id);
  `;
  
  // Try pg/query endpoint
  try {
    const res = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'x-supabase-api-key': SUPABASE_KEY
      },
      body: JSON.stringify({ query: sql })
    });
    const text = await res.text();
    console.log('PG Query Response:', res.status, text);
  } catch (e) {
    console.log('PG Query failed:', e);
  }
}

setupAdminRLS().catch(console.error);
