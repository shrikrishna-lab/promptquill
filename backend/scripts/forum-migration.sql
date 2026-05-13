-- ═══════════════════════════════════════════════════════
-- PROMPTQUILL FORUM SYSTEM — Database Migration
-- Run this SQL in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT '#A8FF3E',
  sort_order INTEGER DEFAULT 0,
  role_required TEXT DEFAULT NULL, -- NULL = public, 'PRO' = pro-only
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Forum Threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Forum Posts (replies)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL, -- nested replies
  upvotes INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Forum Votes (prevent duplicate voting)
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id)
);

-- ═══════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned ON forum_threads(is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user_thread ON forum_votes(user_id, thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user_post ON forum_votes(user_id, post_id);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Categories: anyone can read active ones
CREATE POLICY "Anyone can view active categories" ON forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manages categories" ON forum_categories FOR ALL USING (true) WITH CHECK (true);

-- Threads: anyone can read non-deleted, auth users can insert their own
CREATE POLICY "Anyone can view threads" ON forum_threads FOR SELECT USING (is_deleted = false);
CREATE POLICY "Auth users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages threads" ON forum_threads FOR ALL USING (true) WITH CHECK (true);

-- Posts: anyone can read non-deleted, auth users can insert their own
CREATE POLICY "Anyone can view posts" ON forum_posts FOR SELECT USING (is_deleted = false);
CREATE POLICY "Auth users can create posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages posts" ON forum_posts FOR ALL USING (true) WITH CHECK (true);

-- Votes: users can manage their own votes
CREATE POLICY "Users can view own votes" ON forum_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert votes" ON forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON forum_votes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role manages votes" ON forum_votes FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════
-- SEED: Default Forum Categories
-- ═══════════════════════════════════════════════════════
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order, role_required) VALUES
  ('General Discussion', 'general-discussion', 'Anything related to PromptQuill, AI, or productivity. Introduce yourself here!', '💬', '#A8FF3E', 1, NULL),
  ('Startup Ideas', 'startup-ideas', 'Share, validate, and debate startup concepts generated with PromptQuill.', '🚀', '#f97316', 2, NULL),
  ('Coding & Architecture', 'coding-architecture', 'Discuss technical architectures, endpoints, schemas, and dev strategies.', '💻', '#3b82f6', 3, NULL),
  ('Prompt Engineering', 'prompt-engineering', 'Tips, tricks, and strategies for writing better prompts across all modes.', '🧠', '#a78bfa', 4, NULL),
  ('Feature Requests', 'feature-requests', 'Suggest new features, improvements, or integrations you want to see.', '💡', '#eab308', 5, NULL),
  ('Bug Reports', 'bug-reports', 'Found a bug? Report it here with steps to reproduce.', '🐛', '#ef4444', 6, NULL),
  ('Pro Lounge', 'pro-lounge', 'Exclusive discussions for Pro subscribers. Share advanced strategies and get priority support.', '👑', '#7b2fff', 7, 'PRO'),
  ('Showcase', 'showcase', 'Show off what you built using PromptQuill outputs. Startups, apps, content, and more.', '🎨', '#ec4899', 8, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- SEED: Test Threads and Posts (Optional mock data)
-- ═══════════════════════════════════════════════════════
DO $$ 
DECLARE
  first_user_id UUID;
  cat_general_id UUID;
  cat_prompt_id UUID;
  thread_1_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF first_user_id IS NOT NULL THEN
    -- Get category IDs
    SELECT id INTO cat_general_id FROM forum_categories WHERE slug = 'general-discussion';
    SELECT id INTO cat_prompt_id FROM forum_categories WHERE slug = 'prompt-engineering';
    
    -- Check if threads already exist to prevent duplicates on re-runs
    IF NOT EXISTS (SELECT 1 FROM forum_threads WHERE title = 'Welcome to PromptQuill Forums! 👋') THEN
      -- Insert test thread 1
      INSERT INTO forum_threads (title, body, category_id, user_id, tags, upvotes, views, reply_count, is_pinned)
      VALUES ('Welcome to PromptQuill Forums! 👋', 'This is the official discussion board for PromptQuill. Feel free to introduce yourself, share your generated ideas, or ask for help with prompt engineering. Let''s build an amazing community together!', cat_general_id, first_user_id, ARRAY['announcement', 'welcome'], 15, 120, 1, true)
      RETURNING id INTO thread_1_id;

      -- Insert test post for thread 1
      INSERT INTO forum_posts (thread_id, user_id, body, upvotes)
      VALUES (thread_1_id, first_user_id, 'Glad to be here! The startup mode is blowing my mind 🚀', 5);
      
      -- Insert test thread 2
      INSERT INTO forum_threads (title, body, category_id, user_id, tags, upvotes, views, reply_count)
      VALUES ('Best prompts for coding React components?', 'What are your go-to context windows for generating React components? I''ve been using the Coding Mode but I want to get more consistent results with Tailwind CSS styling and best practices.', cat_prompt_id, first_user_id, ARRAY['coding', 'react', 'prompts'], 8, 45, 0);

      -- Insert test thread 3
      INSERT INTO forum_threads (title, body, category_id, user_id, tags, upvotes, views, reply_count, is_locked)
      VALUES ('[Archived] Beta feedback collection', 'Thanks everyone for participating in the early beta! We are closing this thread as the V1 release is now live.', cat_general_id, first_user_id, ARRAY['beta', 'feedback'], 42, 500, 0, true);
    END IF;
  END IF;
END $$;
