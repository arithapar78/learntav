# LearnTAV Database Setup Guide

This guide walks you through setting up the complete database schema and Row Level Security (RLS) policies for the LearnTAV authentication system in Supabase.

## 📋 Prerequisites

- Active Supabase project
- Supabase CLI installed (optional but recommended)
- Admin access to your Supabase dashboard

## 🚀 Quick Setup

### 1. Database Schema Setup

1. **Access your Supabase SQL Editor:**
   - Go to your Supabase dashboard
   - Navigate to "SQL Editor"
   - Create a new query

2. **Run the schema setup:**
   - Copy the contents of `schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Apply Row Level Security:**
   - Copy the contents of `rls-policies.sql`
   - Paste into a new query in SQL Editor
   - Click "Run" to execute

### 2. Environment Configuration

Update your Supabase client configuration:

```javascript
// In auth/supabase-client.js
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Create Admin User

1. **Sign up the admin user:**
   - Use email: `admin@learntav.com`
   - Use a secure password that meets the validation requirements
   - The trigger will automatically set role to 'admin'

2. **Verify admin setup:**
   ```sql
   SELECT * FROM profiles WHERE role = 'admin';
   ```

## 📊 Database Structure

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | Extended user profiles | Auto-created on signup, role-based access |
| `contact_submissions` | Form submissions | All form types, metadata storage |
| `admin_logs` | Security audit trail | Immutable logging, detailed tracking |
| `user_sessions` | Session management | Security monitoring, cleanup |
| `analytics` | Usage tracking | Dashboard metrics, user behavior |

### Key Features

- **Automatic Profile Creation**: New users get profiles automatically
- **Role-Based Access Control**: Users vs Admins with different permissions
- **Security Auditing**: All admin actions are logged
- **Rate Limiting**: Contact forms have spam protection
- **Data Privacy**: GDPR-compliant anonymization functions
- **Realtime Updates**: Admin dashboard gets live updates

## 🔒 Security Features

### Row Level Security (RLS)

All tables have comprehensive RLS policies:

- **Users** can only access their own data
- **Admins** have elevated access to manage all data  
- **Anonymous users** can submit contact forms only
- **Audit trail** is immutable and admin-only

### Rate Limiting

- Contact form submissions: 5 per email per hour
- Failed login tracking and monitoring
- Session cleanup and security monitoring

### Data Protection

- Automatic data anonymization after 2 years
- Secure password requirements enforced
- Admin privilege escalation prevention
- Last admin deletion prevention

## 🛠️ Configuration Options

### 1. Customize Rate Limits

```sql
-- Modify the rate limit in rls-policies.sql
-- Current: 5 submissions per hour per email
SELECT check_submission_rate_limit('test@example.com');
```

### 2. Adjust Data Retention

```sql
-- Modify anonymization period (currently 2 years)
-- In rls-policies.sql, update the anonymize_old_submissions function
WHERE submitted_at < NOW() - INTERVAL '2 years'
```

### 3. Configure Analytics Cleanup

```sql
-- Modify analytics retention period (currently 1 year)  
-- In rls-policies.sql, update the cleanup_old_analytics function
WHERE created_at < NOW() - INTERVAL '1 year'
```

## 📱 Frontend Integration

### 1. Form Submission

The contact forms automatically integrate with the database:

```javascript
import { submitContactForm } from '../auth/supabase-client.js';

// Form submission is handled automatically
// Data goes to contact_submissions table
```

### 2. Admin Dashboard

The dashboard pulls data from views and functions:

```javascript
// User statistics
const { data } = await supabase.rpc('get_user_stats');

// Contact statistics  
const { data } = await supabase.rpc('get_contact_stats');
```

### 3. Authentication

User authentication and profile management:

```javascript
import { signUp, signIn, authState } from '../auth/supabase-client.js';

// Profiles are created automatically on signup
// Role assignment is handled by database triggers
```

## 🔍 Monitoring & Maintenance

### 1. View Security Metrics

```sql
SELECT * FROM security_overview;
```

### 2. Check Admin Activity

```sql
SELECT * FROM admin_recent_activity LIMIT 10;
```

### 3. Monitor Contact Submissions

```sql
SELECT * FROM admin_contact_overview 
WHERE age_category = 'new' 
LIMIT 10;
```

### 4. Run Maintenance Tasks

```sql
-- Clean expired sessions
SELECT cleanup_expired_sessions();

-- Anonymize old data (GDPR compliance)
SELECT anonymize_old_submissions();

-- Clean old analytics
SELECT cleanup_old_analytics();
```

## 🚨 Troubleshooting

### Common Issues

1. **Schema Installation Fails:**
   - Check for existing tables with same names
   - Ensure you have admin privileges
   - Run schema cleanup if needed

2. **RLS Policies Block Access:**
   - Verify user roles in profiles table
   - Check authentication state
   - Review policy conditions

3. **Admin Login Issues:**
   - Ensure admin user exists with correct email
   - Verify role is set to 'admin' 
   - Check password meets requirements

4. **Contact Forms Not Working:**
   - Verify RLS policies allow anonymous inserts
   - Check network connectivity to Supabase
   - Review browser console for errors

### Debug Queries

```sql
-- Check user roles
SELECT id, email, role FROM profiles;

-- View recent admin logs
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 5;

-- Check contact submissions
SELECT COUNT(*), status FROM contact_submissions GROUP BY status;

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📚 Additional Resources

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)

## 🔄 Updates & Maintenance

### Regular Maintenance Schedule

- **Weekly**: Review security overview and admin activity
- **Monthly**: Run cleanup functions for expired data
- **Quarterly**: Review and update rate limiting policies
- **Annually**: Audit data retention and anonymization policies

### Schema Updates

When updating the schema:

1. Backup your data first
2. Test changes in development environment
3. Use migrations for production updates
4. Update RLS policies accordingly
5. Test all access patterns thoroughly

## 🎯 Performance Optimization

The schema includes several optimizations:

- **Indexes**: On frequently queried columns
- **Views**: For common admin dashboard queries
- **Functions**: For complex calculations
- **Partitioning**: Consider for large datasets

Monitor query performance and add indexes as needed based on actual usage patterns.

---

**Need help?** Check the troubleshooting section or create an issue with your specific problem and relevant error messages.