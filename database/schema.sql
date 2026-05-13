-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Briefs (AI-generated strategic briefs)
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  idea_input TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('STARTUP', 'CODING', 'CONTENT', 'CREATIVE', 'GENERAL', 'STARTUP_LITE')),
  personality TEXT NOT NULL CHECK (personality IN ('BOT', 'HUMAN')),
  provider_used TEXT,
  tabs JSONB NOT NULL DEFAULT '{}',
  score INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community feed (public briefs index)
CREATE TABLE IF NOT EXISTS public.community_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brief_id)
);

-- User settings (API keys stored encrypted by RLS)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  groq_key TEXT,
  gemini_key TEXT,
  cerebras_key TEXT,
  openrouter_key TEXT,
  cf_api_key TEXT,
  cf_account_id TEXT,
  openai_key TEXT,
  claude_key TEXT,
  mistral_key TEXT,
  deepseek_key TEXT,
  nvidia_key TEXT,
  primary_provider TEXT DEFAULT 'openai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON public.briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON public.briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefs_is_public ON public.briefs(is_public) WHERE is_public = true;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
