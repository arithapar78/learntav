-- =====================================================
-- LearnTAV Database Schema
-- Comprehensive database setup for authentication system
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with additional profile data
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_created_at_idx ON profiles(created_at);

-- =====================================================
-- CONTACT SUBMISSIONS TABLE
-- Stores all contact form submissions
-- =====================================================

CREATE TABLE contact_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  form_type TEXT DEFAULT 'general' CHECK (form_type IN ('general', 'consultation', 'education', 'consulting', 'partnerships')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tags TEXT[],
  assigned_to UUID REFERENCES profiles(id),
  replied_at TIMESTAMP WITH TIME ZONE,
  replied_by UUID REFERENCES profiles(id),
  reply_message TEXT,
  metadata JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX contact_submissions_email_idx ON contact_submissions(email);
CREATE INDEX contact_submissions_form_type_idx ON contact_submissions(form_type);
CREATE INDEX contact_submissions_status_idx ON contact_submissions(status);
CREATE INDEX contact_submissions_submitted_at_idx ON contact_submissions(submitted_at);
CREATE INDEX contact_submissions_priority_idx ON contact_submissions(priority);
CREATE INDEX contact_submissions_metadata_idx ON contact_submissions USING GIN(metadata);

-- =====================================================
-- ADMIN LOGS TABLE  
-- Tracks all admin actions for security auditing
-- =====================================================

CREATE TABLE admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX admin_logs_admin_id_idx ON admin_logs(admin_id);
CREATE INDEX admin_logs_action_idx ON admin_logs(action);
CREATE INDEX admin_logs_created_at_idx ON admin_logs(created_at);
CREATE INDEX admin_logs_resource_type_idx ON admin_logs(resource_type);
CREATE INDEX admin_logs_success_idx ON admin_logs(success);
CREATE INDEX admin_logs_details_idx ON admin_logs USING GIN(details);

-- =====================================================
-- USER SESSIONS TABLE
-- Track active user sessions (optional enhancement)
-- =====================================================

CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX user_sessions_is_active_idx ON user_sessions(is_active);
CREATE INDEX user_sessions_expires_at_idx ON user_sessions(expires_at);

-- =====================================================
-- ANALYTICS TABLE
-- Store analytics data for admin dashboard
-- =====================================================

CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for performance
CREATE INDEX analytics_event_type_idx ON analytics(event_type);
CREATE INDEX analytics_user_id_idx ON analytics(user_id);
CREATE INDEX analytics_created_at_idx ON analytics(created_at);
CREATE INDEX analytics_event_data_idx ON analytics USING GIN(event_data);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FOR PROFILE CREATION
-- Automatically create profile when user signs up
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@learntav.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTIONS FOR COMMON QUERIES
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'users_this_month', (
      SELECT COUNT(*) FROM profiles 
      WHERE role = 'user' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'users_this_week', (
      SELECT COUNT(*) FROM profiles 
      WHERE role = 'user' 
      AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get contact form statistics
CREATE OR REPLACE FUNCTION get_contact_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_submissions', (SELECT COUNT(*) FROM contact_submissions),
    'unread_submissions', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'unread'),
    'submissions_this_month', (
      SELECT COUNT(*) FROM contact_submissions 
      WHERE submitted_at >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'submissions_this_week', (
      SELECT COUNT(*) FROM contact_submissions 
      WHERE submitted_at >= DATE_TRUNC('week', CURRENT_DATE)
    ),
    'submissions_by_type', (
      SELECT json_object_agg(form_type, count)
      FROM (
        SELECT form_type, COUNT(*) as count 
        FROM contact_submissions 
        GROUP BY form_type
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Create default admin user (will be created when admin signs up)
-- This is handled by the trigger above

-- Insert sample contact form types for reference
-- These are enforced by CHECK constraints above

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for admin dashboard user overview
CREATE OR REPLACE VIEW admin_users_overview AS
SELECT 
  id,
  full_name,
  email,
  role,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at > NOW() - INTERVAL '24 hours' THEN 'active'
    WHEN updated_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'inactive'
  END as activity_status
FROM profiles
ORDER BY created_at DESC;

-- View for contact submissions with enhanced data
CREATE OR REPLACE VIEW admin_contact_overview AS
SELECT 
  cs.*,
  CASE 
    WHEN cs.submitted_at > NOW() - INTERVAL '1 day' THEN 'new'
    WHEN cs.submitted_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'old'
  END as age_category,
  p.full_name as assigned_to_name
FROM contact_submissions cs
LEFT JOIN profiles p ON cs.assigned_to = p.id
ORDER BY cs.submitted_at DESC;

-- View for recent admin activity
CREATE OR REPLACE VIEW admin_recent_activity AS
SELECT 
  al.*,
  p.full_name as admin_name,
  p.email as admin_email
FROM admin_logs al
LEFT JOIN profiles p ON al.admin_id = p.id
WHERE al.created_at > NOW() - INTERVAL '30 days'
ORDER BY al.created_at DESC;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with additional information';
COMMENT ON TABLE contact_submissions IS 'All contact form submissions from the website';
COMMENT ON TABLE admin_logs IS 'Audit log of all administrative actions for security tracking';
COMMENT ON TABLE user_sessions IS 'Active user sessions tracking for security and analytics';
COMMENT ON TABLE analytics IS 'Website analytics and user behavior tracking data';

COMMENT ON COLUMN profiles.role IS 'User role: user or admin';
COMMENT ON COLUMN contact_submissions.form_type IS 'Type of contact form: general, consultation, education, consulting, partnerships';
COMMENT ON COLUMN contact_submissions.status IS 'Submission status: unread, read, replied, archived';
COMMENT ON COLUMN contact_submissions.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN contact_submissions.metadata IS 'Additional form data and tracking information';
COMMENT ON COLUMN admin_logs.action IS 'The action performed by the admin';
COMMENT ON COLUMN admin_logs.details IS 'Additional details about the action in JSON format';