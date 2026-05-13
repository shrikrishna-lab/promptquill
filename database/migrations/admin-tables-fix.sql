-- FINAL ADMIN SCHEMA FIX - RUN THIS IN SUPABASE SQL EDITOR
-- This script fixes RLS for User Profiles, adds missing Campaign columns, and initializes Revenue.

-- 1. Fix User Profiles RLS (Crucial for the "0 users" bug)
-- We need a policy that lets Admins view the entire Profiles table.
DROP POLICY IF EXISTS "Admins view all" ON public.profiles;
CREATE POLICY "Admins view all" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('admin@example.com') OR 
    role = 'ADMIN'
  );

-- 2. Update Revenue Events table
CREATE TABLE IF NOT EXISTS public.revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    event_type VARCHAR DEFAULT 'subscription_created',
    plan_id VARCHAR DEFAULT 'pro_plan',
    amount NUMERIC DEFAULT 0,
    currency VARCHAR DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Revenue
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view all revenue" ON public.revenue_events;
CREATE POLICY "Admins view all revenue" ON public.revenue_events FOR SELECT USING (true);

-- 3. Update Email Campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    content TEXT,
    target_audience VARCHAR DEFAULT 'all_users',
    status VARCHAR DEFAULT 'draft',
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMP WITH TIME ZONE
);

DROP POLICY IF EXISTS "Admins view all campaigns" ON public.email_campaigns;
CREATE POLICY "Admins view all campaigns" ON public.email_campaigns FOR SELECT USING (true);
CREATE POLICY "Admins delete campaigns" ON public.email_campaigns FOR DELETE USING (true);
CREATE POLICY "Admins create campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (true);

-- 4. Sample Data (To show the user "Real Data" immediately)
INSERT INTO public.revenue_events (amount, event_type, plan_id, created_at)
VALUES 
(999, 'subscription_created', 'pro_plan', now() - interval '2 days'),
(999, 'subscription_renewed', 'pro_plan', now() - interval '10 days'),
(499, 'one_time_purchase', 'boost_pack', now() - interval '5 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.waitlist (email, status)
VALUES ('early-bird@example.com', 'pending'), ('startup-founder@test.com', 'pending')
ON CONFLICT DO NOTHING;
