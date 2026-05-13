#!/usr/bin/env node

/**
 * Pro Status Manager
 * Manages Pro user status in the database
 * 
 * Usage:
 *   npm run pro-status -- set-pro <user_id>           # Mark user as Pro
 *   npm run pro-status -- set-free <user_id>          # Mark user as Free
 *   npm run pro-status -- check <user_id>             # Check user status
 *   npm run pro-status -- list-pro                    # List all Pro users
 *   npm run pro-status -- expire-subscriptions        # Expire old subscriptions
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════════════════════════════════

async function setPro(userId) {
  console.log(`\n📝 Setting ${userId} as Pro...\n`);

  try {
    const { data, error } = await sb
      .from('profiles')
      .update({
        is_pro: true,
        subscription_status: 'active',
        tier: 'pro',
        subscription_started_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Pro status set successfully');
    console.log(`   ID: ${data.id}`);
    console.log(`   is_pro: ${data.is_pro}`);
    console.log(`   subscription_status: ${data.subscription_status}`);
    console.log(`   tier: ${data.tier}`);
  } catch (err) {
    console.error('❌ Error setting Pro:', err.message);
    process.exit(1);
  }
}

async function setFree(userId) {
  console.log(`\n📝 Setting ${userId} as Free...\n`);

  try {
    const { data, error } = await sb
      .from('profiles')
      .update({
        is_pro: false,
        subscription_status: 'expired',
        tier: 'free'
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Free status set successfully');
    console.log(`   ID: ${data.id}`);
    console.log(`   is_pro: ${data.is_pro}`);
    console.log(`   subscription_status: ${data.subscription_status}`);
    console.log(`   tier: ${data.tier}`);
  } catch (err) {
    console.error('❌ Error setting Free:', err.message);
    process.exit(1);
  }
}

async function checkStatus(userId) {
  console.log(`\n🔍 Checking ${userId}...\n`);

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id, is_pro, subscription_status, tier, subscription_started_at, pro_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  User not found');
      } else {
        throw error;
      }
      process.exit(1);
    }

    console.log('📊 User Status:');
    console.log(`   ID: ${data.id}`);
    console.log(`   is_pro: ${data.is_pro ? '✅ true' : '❌ false'}`);
    console.log(`   subscription_status: ${data.subscription_status}`);
    console.log(`   tier: ${data.tier}`);
    console.log(`   subscription_started_at: ${data.subscription_started_at || 'N/A'}`);
    console.log(`   pro_expires_at: ${data.pro_expires_at || 'N/A'}`);
  } catch (err) {
    console.error('❌ Error checking status:', err.message);
    process.exit(1);
  }
}

async function listProUsers() {
  console.log(`\n📊 Listing all Pro users...\n`);

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id, is_pro, subscription_status, tier, subscription_started_at')
      .eq('is_pro', true)
      .order('subscription_started_at', { ascending: false });

    if (error) throw error;

    console.log(`Found ${data.length} Pro users:\n`);
    data.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.id}`);
      console.log(`   Status: ${user.subscription_status}`);
      console.log(`   Tier: ${user.tier}`);
      console.log(`   Started: ${user.subscription_started_at}\n`);
    });
  } catch (err) {
    console.error('❌ Error listing Pro users:', err.message);
    process.exit(1);
  }
}

async function expireSubscriptions() {
  console.log(`\n⏰ Expiring old subscriptions...\n`);

  try {
    const { data, error } = await sb
      .from('profiles')
      .update({
        is_pro: false,
        subscription_status: 'expired',
        tier: 'free'
      })
      .eq('is_pro', true)
      .lt('pro_expires_at', new Date().toISOString())
      .select();

    if (error) throw error;

    console.log(`✅ Expired ${data.length} subscriptions\n`);
    data.forEach((user) => {
      console.log(`   ${user.id}`);
    });
  } catch (err) {
    console.error('❌ Error expiring subscriptions:', err.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'set-pro':
      if (!arg) {
        console.error('Usage: npm run pro-status -- set-pro <user_id>');
        process.exit(1);
      }
      await setPro(arg);
      break;

    case 'set-free':
      if (!arg) {
        console.error('Usage: npm run pro-status -- set-free <user_id>');
        process.exit(1);
      }
      await setFree(arg);
      break;

    case 'check':
      if (!arg) {
        console.error('Usage: npm run pro-status -- check <user_id>');
        process.exit(1);
      }
      await checkStatus(arg);
      break;

    case 'list-pro':
      await listProUsers();
      break;

    case 'expire-subscriptions':
      await expireSubscriptions();
      break;

    default:
      console.log(`
Pro Status Manager

Usage:
  node backend/scripts/pro-status-manager.mjs set-pro <user_id>
  node backend/scripts/pro-status-manager.mjs set-free <user_id>
  node backend/scripts/pro-status-manager.mjs check <user_id>
  node backend/scripts/pro-status-manager.mjs list-pro
  node backend/scripts/pro-status-manager.mjs expire-subscriptions

Examples:
  node backend/scripts/pro-status-manager.mjs set-pro ac2a88e0-0268-4098-a3a4-5b18b29f0978
  node backend/scripts/pro-status-manager.mjs check ac2a88e0-0268-4098-a3a4-5b18b29f0978
  node backend/scripts/pro-status-manager.mjs list-pro
      `);
  }
}

main();
