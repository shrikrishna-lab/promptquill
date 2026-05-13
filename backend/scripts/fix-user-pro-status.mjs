#!/usr/bin/env node
/**
 * Fix Pro Status for User
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const userId = process.env.USER_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixUserProStatus() {
  try {
    console.log(`\n[Fix Pro Status] Updating user ${userId}...\n`);

    // Update profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_pro: true,
        subscription_status: 'active',
        tier: 'pro',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('❌ Update failed:', error.message);
      process.exit(1);
    }

    console.log('✅ User Pro status updated successfully!\n');
    console.log('Updated data:', data?.[0] || {});
    
    // Verify the update
    const { data: verified, error: verifyError } = await supabase
      .from('profiles')
      .select('id, is_pro, subscription_status, tier, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      process.exit(1);
    }

    console.log('\n✅ Verification successful!\n');
    console.log('Current profile status:', verified);
    console.log(`\n✅ User ${userId} is now PRO and can use STARTUP generation!\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixUserProStatus();
