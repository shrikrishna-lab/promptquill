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

async function tryDirectSQL(projectRef, dbPassword) {
  const errors = [];
  const ports = [6543, 5432];
  for (const port of ports) {
    try {
      const connStr = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:${port}/postgres`;
      const pool = new pg.Pool({ connectionString: connStr, max: 1, connectionTimeoutMillis: 6000 });
      await pool.query('SELECT 1');
      const results = [];
      const statements = SCHEMA_SQL.split(';').filter(s => s.trim());
      let allGood = true;
      for (const sql of statements) {
        try {
          await pool.query(sql.trim() + ';');
          results.push({ name: sql.trim().split('\n')[0].slice(0, 50).replace(/CREATE /i,'').replace(/ALTER /i,'').replace(/TABLE IF NOT EXISTS /i,'').trim(), status: 'done' });
        } catch (stmtErr) {
          results.push({ name: sql.trim().split('\n')[0].slice(0, 50).trim(), status: 'done', note: stmtErr.message.slice(0, 60) });
          allGood = false;
        }
      }
      await pool.end();
      return { results, success: allGood, method: 'direct' };
    } catch (e) {
      const isAuth = e.message?.includes('password') || e.message?.includes('authenticate') || e.message?.includes('28P01');
      errors.push({ port, message: e.message.slice(0, 100), isAuth });
    }
  }
  const authErrors = errors.filter(e => e.isAuth);
  return { success: false, errors, passwordWrong: authErrors.length > 0 };
}

router.post('/database', async (req, res) => {
  try {
    const { dbPassword } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL || req.body.url;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || req.body.serviceKey;
    const projectRef = getProjectRef(supabaseUrl);

    // Option 1: Direct PostgreSQL with password
    if (projectRef && dbPassword) {
      const result = await tryDirectSQL(projectRef, dbPassword);
      if (result.success) {
        return res.json({ success: true, steps: result.results, method: 'direct' });
      }
      if (result.passwordWrong) {
        return res.json({
          success: false, passwordError: true,
          error: 'Database password is incorrect. Check your password in Supabase Dashboard → Project Settings → Database → Password.',
          schema: SCHEMA_SQL,
        });
      }
      // Connection failed but not auth error
      return res.json({
        success: false, needsManualSetup: true, schema: SCHEMA_SQL,
        error: 'Could not connect to database. Your project may be paused or the host is unreachable.',
      });
    }

    // Option 2: Try exec_sql RPC via service key
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await adminClient.rpc('exec_sql', { query: SCHEMA_SQL }).maybeSingle();
        if (!error) {
          return res.json({ success: true, steps: [{ name: 'All tables created successfully', status: 'done' }], method: 'rpc' });
        }
      } catch {}
    }

    // Both failed
    return res.json({ success: false, needsManualSetup: true, schema: SCHEMA_SQL, projectRef });
  } catch (err) {
    console.error('[Setup] Database error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
  } catch (err) {
    console.error('[Setup] Database error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-db', async (req, res) => {
  try {
    const { url, dbPassword } = req.body;
    const projectRef = getProjectRef(url);
    if (!projectRef || !dbPassword) {
      return res.json({ valid: false, error: 'Project URL and database password required' });
    }
    const ports = [6543, 5432];
    for (const port of ports) {
      try {
        const connStr = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:${port}/postgres`;
        const pool = new pg.Pool({ connectionString: connStr, max: 1, connectionTimeoutMillis: 5000 });
        await pool.query('SELECT 1');
        await pool.end();
        return res.json({ valid: true, port });
      } catch {}
    }
    res.json({ valid: false, error: 'Could not connect. Check your password and that your project is not paused.' });
  } catch (err) {
    res.json({ valid: false, error: err.message });
  }
});

export default router;
