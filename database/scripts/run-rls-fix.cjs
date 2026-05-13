#!/usr/bin/env node
/**
 * Run SQL against Supabase
 * Usage: SUPABASE_URL=https://project.supabase.co SUPABASE_SERVICE_KEY=key node run-rls-fix.cjs
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY env vars required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  const sql = process.argv[2] || 'SELECT 1';
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  console.log('Result:', data);
}

run();
