-- ════════════════════════════════════════════════════════════════════════════════
-- ANNOUNCEMENTS TABLE
-- Complete setup with RLS policies
-- ════════════════════════════════════════════════════════════════════════════════

-- Drop if exists
DROP TABLE IF EXISTS announcements CASCADE;

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Everyone can read active announcements
CREATE POLICY "read_active_announcements" ON announcements
  FOR SELECT USING (is_active = true);

-- Admins can read all announcements (active or inactive)
CREATE POLICY "admin_read_all_announcements" ON announcements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Only admins can create announcements
CREATE POLICY "admin_create_announcements" ON announcements
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Only admins can update announcements
CREATE POLICY "admin_update_announcements" ON announcements
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Only admins can delete announcements
CREATE POLICY "admin_delete_announcements" ON announcements
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Service role bypass (for backend operations)
CREATE POLICY "service_role_bypass_announcements" ON announcements
  FOR ALL USING (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════════════════
-- INSERT SAMPLE ANNOUNCEMENTS (Optional)
-- ════════════════════════════════════════════════════════════════════════════════

-- Uncomment to add sample data:
/*
INSERT INTO announcements (title, content, type, is_active) VALUES
  ('Welcome to PromptQuill!', 'Start generating amazing prompts with AI-powered insights.', 'info', true),
  ('New Feature: Prompt Chaining', 'Chain multiple prompts together for advanced workflows.', 'feature', true),
  ('Maintenance Notice', 'System maintenance scheduled for tomorrow 2-4 AM UTC.', 'warning', false);
*/

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Check table exists:
-- SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'announcements');

-- Check RLS is enabled:
-- SELECT rowsecurity FROM pg_tables WHERE tablename = 'announcements';

-- Check policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'announcements' ORDER BY policyname;

-- View all announcements (from admin query):
-- SELECT * FROM announcements ORDER BY created_at DESC;
