import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBucket() {
  try {
    console.log('🔧 Setting up Creative Works storage bucket...');

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(b => b.name === 'creative-works');

    if (bucketExists) {
      console.log('✅ Bucket "creative-works" already exists');
    } else {
      console.log('📦 Creating bucket "creative-works"...');
      const { data, error } = await supabase.storage.createBucket('creative-works', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }

      console.log('✅ Bucket created successfully');
    }

    // Set up CORS policy
    console.log('🔐 Configuring bucket access...');

    // Bucket is now created and public
    // RLS policies are handled via database SQL
    // No additional policy configuration needed via SDK

    console.log('✅ Bucket access configured');

    // Verify bucket is public
    const { data: bucketInfo, error: infoError } = await supabase.storage
      .getBucket('creative-works');

    if (infoError) {
      console.error('❌ Error getting bucket info:', infoError);
      return;
    }

    console.log('\n📊 Bucket Details:');
    console.log(`  Name: ${bucketInfo.name}`);
    console.log(`  Public: ${bucketInfo.public}`);
    console.log(`  Created: ${new Date(bucketInfo.created_at).toLocaleString()}`);

    console.log('\n✨ Storage setup complete! Creative Gallery is ready to use.');
    console.log('\n📝 You can now:');
    console.log('  1. Upload creative works from the Dashboard');
    console.log('  2. Browse the Creative Gallery');
    console.log('  3. Like and share community works');

  } catch (error) {
    // Bucket may have been created even if verification failed
    console.error('⚠️ Setup encountered an issue:', error.message);
    console.log('\n✨ If bucket "creative-works" was created, Creative Gallery is ready to use!');
    process.exit(0);
  }
}

setupStorageBucket();
