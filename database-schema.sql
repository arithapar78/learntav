-- LearnTAV Database Schema
-- This file contains all the required tables and RLS policies for the admin panel

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors auth.users for lightweight access)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text,
  description text,
  price_cents int,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending','paid','refunded','canceled')) DEFAULT 'pending',
  source text, -- 'stripe' | 'manual' | 'form'
  payment_ref text,
  enrolled_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Consult bookings table
CREATE TABLE IF NOT EXISTS public.consults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  timeslot_start timestamptz,
  timeslot_end timestamptz,
  status text DEFAULT 'pending',
  payment_ref text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Contact submissions table (for form submissions)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  form_type text DEFAULT 'general',
  status text DEFAULT 'unread',
  submitted_at timestamptz DEFAULT now()
);

-- Site settings table (for admin code and other settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

-- Admin users table (identifies who has admin access)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now()
);

-- Admin logs table (for tracking admin actions)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default admin code if not exists
INSERT INTO public.site_settings (key, value) 
VALUES ('admin_code', '2468')
ON CONFLICT (key) DO NOTHING;

-- Insert some sample courses if not exists
INSERT INTO public.courses (slug, title, description, price_cents, active) VALUES
  ('vibe-coding-101', 'Vibe Coding 101', 'Learn the fundamentals of coding with a modern approach', 9900, true),
  ('ai-tools-mastery', 'AI Tools Mastery', 'Master the latest AI tools for productivity', 14900, true),
  ('consulting-foundations', 'Consulting Foundations', 'Build your consulting business from scratch', 19900, true)
ON CONFLICT (slug) DO NOTHING;

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_self_read ON public.users;
DROP POLICY IF EXISTS users_admin_read ON public.users;
DROP POLICY IF EXISTS users_self_update ON public.users;

DROP POLICY IF EXISTS courses_read_all ON public.courses;
DROP POLICY IF EXISTS courses_admin_all ON public.courses;

DROP POLICY IF EXISTS enr_self_read ON public.enrollments;
DROP POLICY IF EXISTS enr_self_insert ON public.enrollments;
DROP POLICY IF EXISTS enr_admin_read ON public.enrollments;
DROP POLICY IF EXISTS enr_admin_all ON public.enrollments;

DROP POLICY IF EXISTS c_self_read ON public.consults;
DROP POLICY IF EXISTS c_self_insert ON public.consults;
DROP POLICY IF EXISTS c_admin_read ON public.consults;
DROP POLICY IF EXISTS c_admin_all ON public.consults;

DROP POLICY IF EXISTS contact_admin_read ON public.contact_submissions;
DROP POLICY IF EXISTS contact_insert_all ON public.contact_submissions;

DROP POLICY IF EXISTS settings_admin_read ON public.site_settings;
DROP POLICY IF EXISTS admin_users_admin_read ON public.admin_users;
DROP POLICY IF EXISTS admin_logs_admin_read ON public.admin_logs;

-- USERS table policies
CREATE POLICY users_self_read ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_admin_read ON public.users
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- COURSES table policies (readable by all, manageable by admins)
CREATE POLICY courses_read_all ON public.courses
  FOR SELECT USING (active = true OR EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY courses_admin_all ON public.courses
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- ENROLLMENTS table policies
CREATE POLICY enr_self_read ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY enr_self_insert ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY enr_admin_read ON public.enrollments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY enr_admin_all ON public.enrollments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- CONSULTS table policies
CREATE POLICY c_self_read ON public.consults
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY c_self_insert ON public.consults
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY c_admin_read ON public.consults
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY c_admin_all ON public.consults
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- CONTACT SUBMISSIONS table policies
CREATE POLICY contact_admin_read ON public.contact_submissions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY contact_insert_all ON public.contact_submissions
  FOR INSERT WITH CHECK (true); -- Anyone can submit contact forms

-- SITE SETTINGS table policies (admin read only)
CREATE POLICY settings_admin_read ON public.site_settings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- ADMIN USERS table policies (admin read only)
CREATE POLICY admin_users_admin_read ON public.admin_users
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- ADMIN LOGS table policies (admin read only)
CREATE POLICY admin_logs_admin_read ON public.admin_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid()
  ));

-- ===================================================================
-- FUNCTIONS AND TRIGGERS
-- ===================================================================

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON public.courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================================================
-- INDEXES FOR PERFORMANCE
-- ===================================================================

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON public.enrollments(created_at);

CREATE INDEX IF NOT EXISTS idx_consults_user_id ON public.consults(user_id);
CREATE INDEX IF NOT EXISTS idx_consults_timeslot_start ON public.consults(timeslot_start);
CREATE INDEX IF NOT EXISTS idx_consults_status ON public.consults(status);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at);

-- ===================================================================
-- SAMPLE DATA FOR TESTING (optional - comment out for production)
-- ===================================================================

-- Note: You'll need to manually add your auth user ID to admin_users table
-- Example: INSERT INTO public.admin_users (user_id) VALUES ('your-auth-user-id-here');

COMMENT ON TABLE public.users IS 'User profiles that mirror auth.users';
COMMENT ON TABLE public.courses IS 'Available courses for enrollment';
COMMENT ON TABLE public.enrollments IS 'User course enrollments with payment tracking';
COMMENT ON TABLE public.consults IS 'Consultation booking records';
COMMENT ON TABLE public.contact_submissions IS 'Contact form submissions';
COMMENT ON TABLE public.site_settings IS 'Site-wide configuration settings';
COMMENT ON TABLE public.admin_users IS 'Users with administrative privileges';
COMMENT ON TABLE public.admin_logs IS 'Log of administrative actions';