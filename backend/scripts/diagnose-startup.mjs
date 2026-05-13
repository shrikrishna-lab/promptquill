import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const userId = 'ac2a88e0-0268-4098-a3a4-5b18b29f0978';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔍 STARTUP Generation Diagnostic\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Step 1: Check environment
console.log('1️⃣  Environment Check:');
console.log(`   Supabase URL: ${supabaseUrl ? '✓' : '✗'} ${supabaseUrl?.substring(0, 30)}...`);
console.log(`   Supabase Key: ${supabaseKey ? '✓' : '✗'}`);
console.log(`   User ID: ${userId}\n`);

// Step 2: Check database connection
console.log('2️⃣  Database Connection:');
try {
  const sb = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await sb.from('profiles').select('id').limit(1);
  if (error) {
    console.log(`   ✗ Error: ${error.message}`);
  } else {
    console.log(`   ✓ Database connected\n`);
    
    // Step 3: Check if user is Pro
    console.log('3️⃣  User Pro Status:');
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('id, is_pro, subscription_status, tier')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log(`   ✗ Profile not found: ${profileError.message}`);
    } else {
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   is_pro: ${profile.is_pro} ${profile.is_pro ? '✓' : '✗'}`);
      console.log(`   subscription_status: ${profile.subscription_status} ${profile.subscription_status === 'active' ? '✓' : '✗'}`);
      console.log(`   tier: ${profile.tier}\n`);
    }
    
    // Step 4: Check credits
    console.log('4️⃣  User Credits:');
    const { data: credits, error: creditsError } = await sb
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (creditsError) {
      console.log(`   ✗ Credits not found`);
    } else {
      console.log(`   Balance: ${credits.balance} credits ${credits.balance >= 25 ? '✓' : '✗'}`);
      console.log(`   Required: 25 credits\n`);
    }
  }
} catch (err) {
  console.log(`   ✗ Connection error: ${err.message}`);
}

// Step 5: Test backend API
console.log('5️⃣  Backend API Test:');
try {
  const backendUrl = 'http://localhost:5000';
  const testPayload = {
    messages: [
      { 
        role: 'system', 
        content: 'You are a helpful assistant. Return a simple JSON response.' 
      },
      { 
        role: 'user', 
        content: 'Just return {"test": "success", "message": "Backend is working"}' 
      }
    ],
    maxTokens: 500,
    userId: userId,
    userEmail: 'test@example.com',
    mode: 'STARTUP',
    isPro: true
  };

  const response = await axios.post(`${backendUrl}/api/ai/generate`, testPayload, {
    timeout: 30000
  });

  console.log(`   ✓ Backend responded`);
  console.log(`   Success: ${response.data.success}`);
  console.log(`   Data length: ${response.data.data?.length || 0} chars`);
  console.log(`   Provider: ${response.data.metadata?.provider || 'unknown'}`);
  
  if (response.data.error) {
    console.log(`   Error: ${response.data.error}`);
  } else if (!response.data.data || response.data.data.length === 0) {
    console.log(`   ⚠️  WARNING: No content in response!`);
  } else {
    console.log(`   First 100 chars: ${response.data.data.substring(0, 100)}...`);
  }
} catch (err) {
  console.log(`   ✗ Backend error: ${err.message}`);
  if (err.response?.data) {
    console.log(`   Response: ${JSON.stringify(err.response.data, null, 2).substring(0, 200)}`);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Diagnostic complete.\n');
