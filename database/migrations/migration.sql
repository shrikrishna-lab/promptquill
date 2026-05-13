-- PromptOS Enterprise Migration
-- Run this in Supabase SQL Editor

-- 1. Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  assigned_to uuid REFERENCES auth.users,
  resolved_at timestamp,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users,
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- 2. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  target text DEFAULT 'all',
  is_active boolean DEFAULT true,
  show_from timestamp DEFAULT now(),
  show_until timestamp,
  created_by uuid REFERENCES auth.users,
  created_at timestamp DEFAULT now()
);

-- 3. Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  target text DEFAULT 'all',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 4. Admin logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb,
  created_at timestamp DEFAULT now()
);

-- 5. Platform analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date DEFAULT CURRENT_DATE UNIQUE,
  total_users int DEFAULT 0,
  new_users int DEFAULT 0,
  total_sessions int DEFAULT 0,
  total_prompts_generated int DEFAULT 0,
  active_users int DEFAULT 0,
  revenue_usd numeric DEFAULT 0,
  updated_at timestamp DEFAULT now()
);

-- 6. Revenue events
CREATE TABLE IF NOT EXISTS revenue_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  event_type text,
  plan text,
  amount_usd numeric NOT NULL,
  currency text DEFAULT 'INR',
  payment_provider text DEFAULT 'razorpay',
  payment_id text,
  created_at timestamp DEFAULT now()
);

-- 7. Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  description text,
  discount_type text,
  discount_value numeric NOT NULL,
  max_uses int DEFAULT 100,
  used_count int DEFAULT 0,
  valid_until timestamp,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users,
  created_at timestamp DEFAULT now()
);

-- 8. Moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text,
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES auth.users,
  reason text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users,
  reviewed_at timestamp,
  created_at timestamp DEFAULT now()
);

-- 9. Platform settings (key-value store for admin)
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES auth.users
);

-- Insert default settings
INSERT INTO platform_settings (key, value) VALUES
  ('groq_api_key', ''),
  ('openrouter_api_key', ''),
  ('razorpay_button_id', 'pl_SXtp4oMC3em6yO'),
  ('maintenance_mode', 'false'),
  ('max_free_daily', '10'),
  ('registration_mode', 'open')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users see their own tickets, admins see all
CREATE POLICY "users_own_tickets" ON support_tickets
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "users_own_replies" ON ticket_replies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_replies.ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')))
  );

-- Everyone can read active announcements
CREATE POLICY "read_announcements" ON announcements
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "admin_manage_announcements" ON announcements
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Admin-only tables
CREATE POLICY "admin_only_flags" ON feature_flags
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "read_flags" ON feature_flags
  FOR SELECT USING (true);

CREATE POLICY "admin_only_logs" ON admin_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "admin_only_analytics" ON platform_analytics
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "admin_only_revenue" ON revenue_events
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "admin_only_promo" ON promo_codes
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "admin_only_moderation" ON moderation_queue
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "admin_only_settings" ON platform_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
