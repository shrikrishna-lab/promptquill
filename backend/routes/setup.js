import express from 'express';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const router = express.Router();

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  idea_input TEXT NOT NULL,
  mode TEXT NOT NULL,
  personality TEXT,
  provider_used TEXT,
  tabs JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.community_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brief_id)
);
ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  groq_key TEXT, gemini_key TEXT, cerebras_key TEXT, openrouter_key TEXT,
  cf_api_key TEXT, cf_account_id TEXT,
  openai_key TEXT, claude_key TEXT, mistral_key TEXT, deepseek_key TEXT,
  primary_provider TEXT DEFAULT 'openai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON public.briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_is_public ON public.briefs(is_public) WHERE is_public = true;
`;

// Extract project ref from Supabase URL: https://[ref].supabase.co
function getProjectRef(url) {
  const match = url?.match(/https?:\/\/([^.]+)/);
  return match ? match[1] : null;
}

router.post('/database', async (req, res) => {
  try {
    const { dbPassword } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL || req.body.url;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || req.body.serviceKey;
    const projectRef = getProjectRef(supabaseUrl);

    // Option 1: Direct PostgreSQL connection (works every time)
    if (projectRef && dbPassword) {
      const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
      const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });

      try {
        const results = [];
        const statements = SCHEMA_SQL.split(';').filter(s => s.trim());

        for (const sql of statements) {
          try {
            await pool.query(sql.trim() + ';');
            results.push({ name: sql.trim().split('\n')[0].replace(/^CREATE /i, '').replace(/^ALTER /i, '').slice(0, 40), status: 'done' });
          } catch (stmtErr) {
            results.push({ name: sql.trim().split('\n')[0].slice(0, 40), status: 'error', message: stmtErr.message.slice(0, 100) });
          }
        }

        await pool.end();
        const allDone = results.every(r => r.status === 'done');
        return res.json({ success: allDone, steps: results, method: 'direct' });
      } catch (poolErr) {
        return res.json({ success: false, error: poolErr.message, needsManualSetup: true, schema: SCHEMA_SQL });
      }
    }

    // Option 2: Try exec_sql RPC (works if user enabled it)
    if (supabaseUrl && supabaseServiceKey) {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      try {
        const { error } = await adminClient.rpc('exec_sql', { query: SCHEMA_SQL }).maybeSingle();
        if (!error) {
          return res.json({ success: true, steps: [{ name: 'All tables created', status: 'done' }], method: 'rpc' });
        }
      } catch {}
    }

    // Both options failed — return the SQL for manual execution
    return res.json({
      success: false,
      needsManualSetup: true,
      schema: SCHEMA_SQL,
      projectRef,
      hint: 'To auto-create tables, enter your database password (Project Settings → Database).',
    });
  } catch (err) {
    console.error('[Setup] Database error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
