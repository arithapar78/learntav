-- =====================================================
-- Row Level Security (RLS) Policies
-- Comprehensive security policies for LearnTAV database
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete profiles (except their own)
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
  AND id != auth.uid()  -- Prevent admins from deleting themselves
);

-- New users can insert their own profile (handled by trigger)
CREATE POLICY "Enable insert for new users"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- CONTACT SUBMISSIONS POLICIES
-- =====================================================

-- Anyone can submit contact forms (anonymous access allowed)
CREATE POLICY "Anyone can submit contact forms"
ON contact_submissions FOR INSERT
WITH CHECK (true);

-- Admins can view all contact submissions
CREATE POLICY "Admins can view all contact submissions"
ON contact_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can update contact submissions (mark as read, reply, etc.)
CREATE POLICY "Admins can update contact submissions"
ON contact_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
ON contact_submissions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Users can view their own submissions (by email)
CREATE POLICY "Users can view own submissions by email"
ON contact_submissions FOR SELECT
USING (
  auth.jwt() ->> 'email' = email
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email = contact_submissions.email
  )
);

-- =====================================================
-- ADMIN LOGS POLICIES
-- =====================================================

-- Only admins can view admin logs
CREATE POLICY "Only admins can view admin logs"
ON admin_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can insert admin logs
CREATE POLICY "Only admins can insert admin logs"
ON admin_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins cannot update or delete admin logs (audit trail integrity)
-- No UPDATE or DELETE policies = no access

-- =====================================================
-- USER SESSIONS POLICIES
-- =====================================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON user_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON user_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
ON user_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON user_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete any session (for security purposes)
CREATE POLICY "Admins can delete any session"
ON user_sessions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- ANALYTICS POLICIES
-- =====================================================

-- Anyone can insert analytics data (for tracking)
CREATE POLICY "Anyone can insert analytics"
ON analytics FOR INSERT
WITH CHECK (true);

-- Users can view their own analytics data
CREATE POLICY "Users can view own analytics"
ON analytics FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all analytics data
CREATE POLICY "Admins can view all analytics"
ON analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete analytics data (for privacy/cleanup)
CREATE POLICY "Admins can delete analytics"
ON analytics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user owns a resource
CREATE OR REPLACE FUNCTION owns_resource(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS profiles AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Policy to prevent privilege escalation
-- Users cannot change their own role
CREATE POLICY "Prevent role self-modification"
ON profiles FOR UPDATE
USING (
  -- If updating role, must be admin and not changing own role
  CASE 
    WHEN OLD.role != NEW.role THEN
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      ) AND auth.uid() != profiles.id
    ELSE true
  END
);

-- Policy to ensure admin integrity
-- Last admin cannot be deleted or demoted
CREATE OR REPLACE FUNCTION ensure_admin_exists()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Count current admins
  SELECT COUNT(*) INTO admin_count
  FROM profiles
  WHERE role = 'admin' AND id != COALESCE(OLD.id, NEW.id);
  
  -- If this would be the last admin, prevent the action
  IF admin_count = 0 THEN
    RAISE EXCEPTION 'Cannot delete or demote the last admin user';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent deletion/demotion of last admin
CREATE TRIGGER prevent_last_admin_removal
  BEFORE DELETE OR UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role = 'admin')
  EXECUTE FUNCTION ensure_admin_exists();

-- =====================================================
-- RATE LIMITING POLICIES (OPTIONAL ENHANCEMENT)
-- =====================================================

-- Function to check rate limiting for contact submissions
CREATE OR REPLACE FUNCTION check_submission_rate_limit(submitter_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count submissions from same email in last hour
  SELECT COUNT(*) INTO recent_count
  FROM contact_submissions
  WHERE email = submitter_email
  AND submitted_at > NOW() - INTERVAL '1 hour';
  
  -- Allow up to 5 submissions per hour per email
  RETURN recent_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced contact submission policy with rate limiting
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;

CREATE POLICY "Rate limited contact submissions"
ON contact_submissions FOR INSERT
WITH CHECK (
  check_submission_rate_limit(email)
);

-- =====================================================
-- AUDIT TRIGGERS
-- =====================================================

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile updates by admins
  IF TG_OP = 'UPDATE' AND auth.uid() != NEW.id THEN
    INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      'profile_updated',
      'profile',
      NEW.id::TEXT,
      json_build_object(
        'target_user_email', NEW.email,
        'target_user_name', NEW.full_name,
        'changes', json_build_object(
          'old_role', OLD.role,
          'new_role', NEW.role,
          'old_name', OLD.full_name,
          'new_name', NEW.full_name
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile change logging
CREATE TRIGGER log_profile_changes_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- Function to log contact submission status changes
CREATE OR REPLACE FUNCTION log_submission_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when admins change submission status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      'submission_status_changed',
      'contact_submission',
      NEW.id::TEXT,
      json_build_object(
        'submission_email', NEW.email,
        'submission_name', NEW.name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'form_type', NEW.form_type
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for submission change logging
CREATE TRIGGER log_submission_changes_trigger
  AFTER UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_submission_changes();

-- =====================================================
-- DATA CLEANUP POLICIES
-- =====================================================

-- Function to anonymize old contact submissions (GDPR compliance)
CREATE OR REPLACE FUNCTION anonymize_old_submissions()
RETURNS INTEGER AS $$
DECLARE
  anonymized_count INTEGER;
BEGIN
  -- Anonymize submissions older than 2 years
  UPDATE contact_submissions
  SET 
    name = 'Anonymized User',
    email = 'anonymized@example.com',
    phone = NULL,
    metadata = '{"anonymized": true}'::jsonb
  WHERE submitted_at < NOW() - INTERVAL '2 years'
  AND name != 'Anonymized User';
  
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;
  RETURN anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete analytics data older than 1 year
  DELETE FROM analytics
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for admin dashboard
-- =====================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- =====================================================
-- SECURITY VIEWS FOR ADMINS
-- =====================================================

-- View for security monitoring
CREATE OR REPLACE VIEW security_overview AS
SELECT 
  'failed_logins' as metric,
  COUNT(*)::TEXT as value,
  'Last 24 hours' as period
FROM admin_logs 
WHERE action = 'admin_login' 
AND success = false 
AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'active_sessions' as metric,
  COUNT(*)::TEXT as value,
  'Current' as period
FROM user_sessions 
WHERE is_active = true 
AND expires_at > NOW()

UNION ALL

SELECT 
  'recent_submissions' as metric,
  COUNT(*)::TEXT as value,
  'Last 24 hours' as period
FROM contact_submissions 
WHERE submitted_at > NOW() - INTERVAL '24 hours';

-- Restrict security overview to admins only
ALTER VIEW security_overview OWNER TO postgres;
REVOKE ALL ON security_overview FROM PUBLIC;
GRANT SELECT ON security_overview TO authenticated;

CREATE POLICY "Only admins can view security overview"
ON security_overview FOR SELECT
USING (is_admin());

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Allow users to view their own profile data';
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Allow admin users to view all user profiles';
COMMENT ON POLICY "Rate limited contact submissions" ON contact_submissions IS 'Prevent spam by limiting submissions per email per hour';
COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user has admin role';
COMMENT ON FUNCTION check_submission_rate_limit(TEXT) IS 'Rate limiting function for contact form submissions';
COMMENT ON VIEW security_overview IS 'Security metrics view for admin dashboard monitoring';