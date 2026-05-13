-- Create creative_works table
CREATE TABLE IF NOT EXISTS creative_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  creative_type VARCHAR(50) NOT NULL CHECK (creative_type IN ('image', 'video', 'frontend', 'logo', 'motion', '3d', 'music', 'writing', 'social', 'poster', 'typography', 'game')),
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create creative_likes table
CREATE TABLE IF NOT EXISTS creative_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES creative_works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(work_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS creative_works_created_by_idx ON creative_works(created_by);
CREATE INDEX IF NOT EXISTS creative_works_created_type_idx ON creative_works(creative_type);
CREATE INDEX IF NOT EXISTS creative_works_is_public_idx ON creative_works(is_public);
CREATE INDEX IF NOT EXISTS creative_works_created_at_idx ON creative_works(created_at DESC);
CREATE INDEX IF NOT EXISTS creative_likes_user_id_idx ON creative_likes(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE creative_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read public works
DROP POLICY IF EXISTS creative_works_read ON creative_works;
CREATE POLICY creative_works_read ON creative_works
  FOR SELECT USING (is_public = true);

-- RLS Policy: Users can read their own private works
DROP POLICY IF EXISTS creative_works_read_own ON creative_works;
CREATE POLICY creative_works_read_own ON creative_works
  FOR SELECT USING (created_by = auth.uid());

-- RLS Policy: Users can create works
DROP POLICY IF EXISTS creative_works_create ON creative_works;
CREATE POLICY creative_works_create ON creative_works
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
  );

-- RLS Policy: Users can update their own works
DROP POLICY IF EXISTS creative_works_update ON creative_works;
CREATE POLICY creative_works_update ON creative_works
  FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- RLS Policy: Users can delete their own works
DROP POLICY IF EXISTS creative_works_delete ON creative_works;
CREATE POLICY creative_works_delete ON creative_works
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policy for likes
DROP POLICY IF EXISTS creative_likes_read ON creative_likes;
CREATE POLICY creative_likes_read ON creative_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS creative_likes_create ON creative_likes;
CREATE POLICY creative_likes_create ON creative_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS creative_likes_delete ON creative_likes;
CREATE POLICY creative_likes_delete ON creative_likes
  FOR DELETE USING (user_id = auth.uid());

-- Storage bucket for creative works (already created via setup script)
-- Storage policies are managed through Supabase dashboard

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_creative_works_updated_at ON creative_works;

CREATE OR REPLACE FUNCTION update_creative_works_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creative_works_updated_at
BEFORE UPDATE ON creative_works
FOR EACH ROW
EXECUTE PROCEDURE update_creative_works_timestamp();
