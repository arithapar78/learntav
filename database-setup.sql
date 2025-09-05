-- LearnTAV Database Schema Setup
-- Run this in your Supabase Dashboard → SQL Editor

-- ==================================================
-- 1. CREATE TABLES
-- ==================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  form_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'unread',
  priority TEXT DEFAULT 'normal',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consults table
CREATE TABLE IF NOT EXISTS consults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consultant_name TEXT,
  consultation_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_consults_user_id ON consults(user_id);
CREATE INDEX IF NOT EXISTS idx_consults_scheduled_at ON consults(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- ==================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consults ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- 4. CREATE SECURITY POLICIES
-- ==================================================

-- Users policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow anon to read users for testing" ON users;
CREATE POLICY "Allow anon to read users for testing" ON users
  FOR SELECT TO anon USING (true);

-- Contact submissions policies
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON contact_submissions;
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to read contact submissions" ON contact_submissions;
CREATE POLICY "Allow anon to read contact submissions" ON contact_submissions
  FOR SELECT TO anon USING (true);

-- Enrollments policies
DROP POLICY IF EXISTS "Users can read their enrollments" ON enrollments;
CREATE POLICY "Users can read their enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow anon to read enrollments" ON enrollments;
CREATE POLICY "Allow anon to read enrollments" ON enrollments
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon to insert enrollments" ON enrollments;
CREATE POLICY "Allow anon to insert enrollments" ON enrollments
  FOR INSERT TO anon WITH CHECK (true);

-- Consults policies
DROP POLICY IF EXISTS "Users can read their consults" ON consults;
CREATE POLICY "Users can read their consults" ON consults
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow anon to read consults" ON consults;
CREATE POLICY "Allow anon to read consults" ON consults
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon to insert consults" ON consults;
CREATE POLICY "Allow anon to insert consults" ON consults
  FOR INSERT TO anon WITH CHECK (true);

-- Admin logs policies (restrictive)
DROP POLICY IF EXISTS "Only authenticated users can read admin logs" ON admin_logs;
CREATE POLICY "Only authenticated users can read admin logs" ON admin_logs
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow anon to read admin logs" ON admin_logs;
CREATE POLICY "Allow anon to read admin logs" ON admin_logs
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon to insert admin logs" ON admin_logs;
CREATE POLICY "Allow anon to insert admin logs" ON admin_logs
  FOR INSERT TO anon WITH CHECK (true);

-- Site settings policies
DROP POLICY IF EXISTS "Allow anon to read site settings" ON site_settings;
CREATE POLICY "Allow anon to read site settings" ON site_settings
  FOR SELECT TO anon USING (true);

-- Admin users policies
DROP POLICY IF EXISTS "Allow anon to read admin users" ON admin_users;
CREATE POLICY "Allow anon to read admin users" ON admin_users
  FOR SELECT TO anon USING (true);

-- ==================================================
-- 5. INSERT DEFAULT DATA
-- ==================================================

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES 
  ('admin_code', 'LearnTAV4ever!', 'Admin panel password')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert sample test data (optional - remove if not needed)
INSERT INTO users (email, full_name, role) VALUES 
  ('admin@learntav.com', 'LearnTAV Admin', 'admin'),
  ('test@example.com', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO contact_submissions (name, email, subject, message, form_type) VALUES 
  ('John Doe', 'john@example.com', 'General Inquiry', 'Hello, I have a question about your services.', 'general'),
  ('Jane Smith', 'jane@example.com', 'Technical Support', 'I need help with the platform.', 'support')
ON CONFLICT DO NOTHING;

-- ==================================================
-- 6. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- ==================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;
CREATE TRIGGER update_enrollments_updated_at 
  BEFORE UPDATE ON enrollments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consults_updated_at ON consults;
CREATE TRIGGER update_consults_updated_at 
  BEFORE UPDATE ON consults 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- SETUP COMPLETE! 
-- ==================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'contact_submissions', 'enrollments', 'consults', 'admin_logs', 'site_settings', 'admin_users')
ORDER BY tablename;