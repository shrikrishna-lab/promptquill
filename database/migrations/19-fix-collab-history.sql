-- Fix collaboration history storage and tracking
-- Run this in Supabase SQL Editor

-- 1. Ensure collab_versions table exists with proper structure
CREATE TABLE IF NOT EXISTS collab_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES collab_rooms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_summary VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint on room_id and version_number
ALTER TABLE collab_versions
ADD CONSTRAINT unique_room_version UNIQUE (room_id, version_number);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collab_versions_room_id ON collab_versions(room_id);
CREATE INDEX IF NOT EXISTS idx_collab_versions_created_at ON collab_versions(created_at);

-- 2. Ensure collab_sessions table exists for session tracking
CREATE TABLE IF NOT EXISTS collab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES collab_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  edits_count INTEGER DEFAULT 0,
  last_action TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collab_sessions_room_id ON collab_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_collab_sessions_user_id ON collab_sessions(user_id);

-- 3. Enable RLS on collab_versions
ALTER TABLE collab_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_view_room_versions" ON collab_versions
  FOR SELECT USING (
    room_id IN (
      SELECT id FROM collab_rooms WHERE participants @> to_jsonb(auth.uid()::TEXT)
    )
  );

-- 4. History audit table (optional - for tracking all changes)
CREATE TABLE IF NOT EXISTS history_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(50),
  previous_content TEXT,
  new_content TEXT,
  credits_deducted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_audit_room_id ON history_audit(room_id);
CREATE INDEX IF NOT EXISTS idx_history_audit_user_id ON history_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_history_audit_created_at ON history_audit(created_at);

-- 5. Update collab_rooms to include history tracking metadata
ALTER TABLE collab_rooms 
ADD COLUMN IF NOT EXISTS version_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_edits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_editor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Grant permissions
GRANT ALL ON collab_versions TO anon, authenticated, service_role;
GRANT ALL ON collab_sessions TO anon, authenticated, service_role;
GRANT ALL ON history_audit TO authenticated, service_role;
GRANT ALL ON collab_rooms TO anon, authenticated, service_role;

-- Final confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Collaboration history tables fixed and optimized';
END
$$;
