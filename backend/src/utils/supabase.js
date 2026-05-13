import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase;
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ [supabase.js] No credentials. Setup wizard will configure.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

export default supabase;
