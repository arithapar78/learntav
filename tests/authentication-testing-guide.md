# Authentication System Testing Guide

This comprehensive guide walks you through testing all aspects of the LearnTAV authentication system, including security measures, user flows, and edge cases.

## 🚀 Quick Test Overview

### System Components to Test
- ✅ **User Registration & Sign-in** - Standard authentication flows
- ✅ **Admin Authentication** - Special multi-factor admin access 
- ✅ **Route Protection** - Access control for protected pages
- ✅ **Contact Form Integration** - Supabase database storage
- ✅ **Password Validation** - Real-time strength checking
- ✅ **Security Measures** - Rate limiting, session management
- ✅ **Database Policies** - Row Level Security (RLS)

## 📋 Pre-Testing Setup

### 1. Environment Preparation

**Required Setup:**
```bash
# 1. Supabase Project Configuration
# Update auth/supabase-client.js with your credentials:
const supabaseUrl = 'your-supabase-project-url'
const supabaseAnonKey = 'your-supabase-anon-key'

# 2. Database Schema Installation
# Run the SQL files in Supabase SQL Editor:
# - database/schema.sql
# - database/rls-policies.sql

# 3. Test Admin User Creation
# Create admin user with email: admin@learntav.com
# Use password that meets validation requirements
```

**Test Environment Checklist:**
- [ ] Supabase project is active and configured
- [ ] Database tables and RLS policies are applied
- [ ] Admin user account is created
- [ ] All CSS and JS files are properly linked
- [ ] Local server is running (if testing locally)

### 2. Test Data Setup

**Create Test Users:**
```sql
-- Test admin user (if not already created)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('admin@learntav.com', crypt('YourSecurePassword123!', gen_salt('bf')), now(), now(), now());

-- Test regular user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at) 
VALUES ('testuser@example.com', crypt('TestPassword123!', gen_salt('bf')), now(), now(), now());
```

**Test Form Submissions:**
- Prepare test contact form data for each form type
- Have test email addresses ready for validation testing
- Prepare invalid data sets for security testing

## 🔐 Authentication Flow Testing

### Test 1: User Registration Flow

**Objective:** Verify new user registration works correctly

**Steps:**
1. Navigate to home page
2. Click "Sign In" button
3. Switch to "Sign Up" tab
4. Test password validation:
   - Enter short password → Should show validation errors
   - Enter weak password → Should show strength requirements
   - Enter strong password → Should show success indicators
5. Submit valid registration data
6. Verify email confirmation (if enabled)
7. Check that profile is created in database

**Expected Results:**
- ✅ Password validation shows real-time feedback
- ✅ Registration succeeds with valid data
- ✅ User profile is created automatically
- ✅ User is redirected to dashboard
- ✅ Navigation shows authenticated state

**Test Cases:**
```javascript
// Test Case 1.1: Password Validation
Input: "weak"
Expected: Shows "Password too short", "Need uppercase", etc.

// Test Case 1.2: Valid Registration
Input: {
  fullName: "Test User",
  email: "newuser@example.com", 
  password: "SecurePassword123!"
}
Expected: Registration success, profile created, redirect to dashboard

// Test Case 1.3: Duplicate Email
Input: Existing email address
Expected: Error message about email already registered
```

### Test 2: User Sign-In Flow

**Objective:** Verify existing users can sign in successfully

**Steps:**
1. Navigate to home page
2. Click "Sign In" button
3. Enter valid credentials
4. Submit sign-in form
5. Verify navigation to dashboard
6. Check authentication state in UI
7. Test sign-out functionality

**Expected Results:**
- ✅ Valid credentials allow sign-in
- ✅ User is redirected to appropriate dashboard
- ✅ Navigation updates to show user profile
- ✅ Protected routes become accessible
- ✅ Sign-out clears session and redirects

**Test Cases:**
```javascript
// Test Case 2.1: Valid Sign-In
Input: {
  email: "testuser@example.com",
  password: "TestPassword123!"
}
Expected: Sign-in success, redirect to dashboard

// Test Case 2.2: Invalid Credentials
Input: {
  email: "testuser@example.com", 
  password: "wrongpassword"
}
Expected: Error message, no sign-in

// Test Case 2.3: Non-existent User
Input: {
  email: "nonexistent@example.com",
  password: "SomePassword123!"
}
Expected: Error message about user not found
```

### Test 3: Admin Authentication Flow

**Objective:** Verify admin-specific authentication requirements

**Steps:**
1. Navigate to `/admin/index.html`
2. Test username validation:
   - Enter wrong username → Should show error
   - Enter "LearnTAV-Admin" → Should allow continuation
3. Test password requirements (same as regular users)
4. Test access code validation:
   - Enter wrong code → Should show error
   - Enter "0410" → Should allow submission
5. Submit complete admin login form
6. Verify access to admin dashboard

**Expected Results:**
- ✅ Only exact username "LearnTAV-Admin" is accepted
- ✅ Password meets all validation requirements
- ✅ Only access code "0410" is accepted
- ✅ All three fields are required for admin access
- ✅ Successful admin login grants dashboard access
- ✅ Admin actions are logged in admin_logs table

**Test Cases:**
```javascript
// Test Case 3.1: Complete Admin Login
Input: {
  username: "LearnTAV-Admin",
  password: "AdminPassword123!",
  accessCode: "0410"
}
Expected: Admin login success, access to admin dashboard

// Test Case 3.2: Invalid Username
Input: {
  username: "Admin",
  password: "AdminPassword123!",
  accessCode: "0410"
}
Expected: Error message about invalid username

// Test Case 3.3: Invalid Access Code
Input: {
  username: "LearnTAV-Admin", 
  password: "AdminPassword123!",
  accessCode: "1234"
}
Expected: Error message about invalid access code
```

## 🛡️ Security Testing

### Test 4: Route Protection

**Objective:** Verify unauthorized users cannot access protected content

**Steps:**
1. **Test Protected Routes (Unauthenticated):**
   - Navigate to `/dashboard/` → Should redirect or show auth modal
   - Navigate to `/admin/dashboard.html` → Should block access
   - Click protected navigation links → Should require authentication

2. **Test Protected Routes (Authenticated User):**
   - Sign in as regular user
   - Navigate to `/dashboard/` → Should allow access
   - Navigate to `/admin/dashboard.html` → Should block access (non-admin)
   - Test user-specific content displays correctly

3. **Test Protected Routes (Admin User):**
   - Sign in as admin user
   - Navigate to `/dashboard/` → Should allow access
   - Navigate to `/admin/dashboard.html` → Should allow access
   - Test admin-specific features are visible

**Expected Results:**
- ✅ Unauthenticated users blocked from protected routes
- ✅ Regular users can access user dashboard but not admin areas
- ✅ Admin users can access all areas
- ✅ Appropriate error messages or redirect behavior
- ✅ Navigation updates based on authentication state

### Test 5: Form Security & Validation

**Objective:** Verify contact forms handle malicious input safely

**Steps:**
1. **Test Honeypot Protection:**
   - Fill hidden "website" field → Submission should be blocked
   - Submit normal form → Should succeed

2. **Test Input Validation:**
   - Submit XSS attempts in message fields
   - Submit SQL injection attempts
   - Test extremely long input strings
   - Submit forms with missing required fields

3. **Test Rate Limiting:**
   - Submit multiple forms quickly from same email
   - Verify rate limiting kicks in (5 submissions per hour)

**Expected Results:**
- ✅ Honeypot field blocks spam submissions
- ✅ Malicious input is safely handled
- ✅ Required field validation works
- ✅ Rate limiting prevents abuse
- ✅ All submissions are stored correctly in database

**Test Cases:**
```javascript
// Test Case 5.1: Honeypot Protection
Input: {
  name: "Test User",
  email: "test@example.com", 
  message: "Test message",
  website: "spam-bot-url.com" // Hidden field
}
Expected: Submission blocked with spam detection message

// Test Case 5.2: XSS Attempt
Input: {
  name: "<script>alert('xss')</script>",
  email: "test@example.com",
  message: "Normal message"
}
Expected: Input safely escaped, no script execution

// Test Case 5.3: Rate Limiting
Action: Submit 6 forms in quick succession from same email
Expected: First 5 succeed, 6th blocked with rate limit message
```

### Test 6: Database Security (RLS Policies)

**Objective:** Verify Row Level Security policies prevent unauthorized data access

**Steps:**
1. **Test User Profile Access:**
   - Sign in as User A
   - Attempt to access User B's profile data
   - Verify only own profile is accessible

2. **Test Contact Form Access:**
   - Submit contact form while unauthenticated → Should succeed
   - Try to view all submissions as regular user → Should be blocked
   - Sign in as admin and view submissions → Should succeed

3. **Test Admin Log Access:**
   - Try to access admin_logs as regular user → Should be blocked
   - Access admin_logs as admin → Should succeed
   - Verify admin actions are being logged

**Database Test Queries:**
```sql
-- Test 1: User can only see own profile
SELECT * FROM profiles WHERE id != auth.uid();
-- Should return no results for regular users

-- Test 2: Admin can see all profiles  
SELECT * FROM profiles;
-- Should return all profiles for admin users

-- Test 3: Contact submissions are admin-only for viewing
SELECT * FROM contact_submissions;
-- Should work for admins, fail for regular users

-- Test 4: Admin logs are admin-only
SELECT * FROM admin_logs;
-- Should work for admins only
```

## 🧪 Manual Testing Scenarios

### Scenario 1: New User Journey
1. User visits website for first time
2. Explores public content
3. Tries to access dashboard → Prompted to sign in
4. Creates new account with strong password
5. Confirms email (if applicable)
6. Explores user dashboard
7. Submits contact form
8. Signs out

### Scenario 2: Admin User Journey  
1. Admin navigates to admin login page
2. Enters admin credentials with access code
3. Accesses admin dashboard
4. Views user management
5. Reviews contact form submissions
6. Checks admin activity logs
7. Signs out safely

### Scenario 3: Security Attack Simulation
1. Attempt SQL injection in forms
2. Try XSS attacks in user input
3. Attempt to access admin routes as regular user
4. Try to spam contact forms
5. Attempt brute force admin access
6. Test session hijacking scenarios

## 🤖 Automated Testing Setup

### JavaScript Test Framework Setup

Create `tests/auth.test.js`:
```javascript
// Example automated tests using Jest or similar framework

describe('Authentication System', () => {
  test('Password validation rejects weak passwords', async () => {
    const validator = new PasswordValidator();
    const result = validator.validate('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password too short');
  });

  test('User registration creates profile', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'SecurePassword123!'
    };
    
    const result = await signUp(userData);
    expect(result.error).toBeNull();
    expect(result.data.user).toBeDefined();
  });

  test('Route protection blocks unauthenticated access', async () => {
    // Mock unauthenticated state
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(false);
    
    const routeManager = new RouteProtectionManager();
    const hasAccess = await routeManager.checkRouteAccess('/dashboard/');
    expect(hasAccess).toBe(false);
  });
});
```

### Security Testing Tools

**Recommended Tools:**
- **OWASP ZAP** - Web application security scanner
- **Burp Suite** - Web vulnerability scanner  
- **SQLmap** - SQL injection testing
- **XSStrike** - XSS vulnerability scanner

**Security Testing Commands:**
```bash
# Test SQL injection
sqlmap -u "http://localhost:3000/contact" --forms --batch

# Test XSS vulnerabilities  
xsstrike -u "http://localhost:3000/contact" --crawl

# Scan for general vulnerabilities
zap-baseline.py -t http://localhost:3000
```

## 📊 Test Results Documentation

### Test Results Template

**Test Date:** [DATE]  
**Tester:** [NAME]  
**Environment:** [LOCAL/STAGING/PRODUCTION]

#### Authentication Flow Results
- [ ] ✅ User Registration: PASS/FAIL - [Notes]
- [ ] ✅ User Sign-In: PASS/FAIL - [Notes]  
- [ ] ✅ Admin Authentication: PASS/FAIL - [Notes]
- [ ] ✅ Sign-Out Process: PASS/FAIL - [Notes]

#### Security Test Results  
- [ ] ✅ Route Protection: PASS/FAIL - [Notes]
- [ ] ✅ Form Validation: PASS/FAIL - [Notes]
- [ ] ✅ RLS Policies: PASS/FAIL - [Notes]
- [ ] ✅ Rate Limiting: PASS/FAIL - [Notes]

#### Performance Test Results
- [ ] ✅ Authentication Speed: [TIME] ms
- [ ] ✅ Dashboard Load Time: [TIME] ms  
- [ ] ✅ Database Query Performance: [TIME] ms

#### Issues Found
1. **Issue:** [Description]  
   **Severity:** High/Medium/Low  
   **Status:** Open/Fixed  
   **Notes:** [Resolution details]

## 🚨 Common Issues & Solutions

### Issue 1: Authentication Modal Not Showing
**Symptoms:** Click "Sign In" but modal doesn't appear  
**Cause:** JavaScript module loading issues  
**Solution:** Check browser console for import errors, ensure ES6 modules are supported

### Issue 2: Admin Login Fails Despite Correct Credentials
**Symptoms:** Valid admin credentials rejected  
**Cause:** Database trigger not creating admin role  
**Solution:** Manually update user role in profiles table

### Issue 3: Contact Forms Not Saving to Database
**Symptoms:** Form submits but no data in Supabase  
**Cause:** RLS policies blocking insert, or missing table  
**Solution:** Check database setup and RLS policies

### Issue 4: Protected Routes Accessible Without Authentication
**Symptoms:** Can access dashboard without signing in  
**Cause:** Route protection not loading or initializing  
**Solution:** Check JavaScript loading order and route protection initialization

## ✅ Security Best Practices Checklist

### Authentication Security
- [ ] Passwords must meet complexity requirements (12+ chars, mixed case, numbers, symbols)
- [ ] Admin access requires multi-factor authentication (username + password + code)
- [ ] Failed login attempts are logged and monitored
- [ ] Sessions expire after reasonable time period
- [ ] Password reset requires email verification

### Database Security
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Users can only access their own data
- [ ] Admin functions require admin role verification
- [ ] All admin actions are logged for audit trail
- [ ] Database queries are parameterized to prevent SQL injection

### Application Security  
- [ ] All user input is validated and sanitized
- [ ] XSS protection through proper output encoding
- [ ] Honeypot fields prevent spam submissions
- [ ] Rate limiting prevents abuse
- [ ] HTTPS enforced for all authentication operations
- [ ] Sensitive operations require re-authentication

### Access Control
- [ ] Public routes accessible to all users
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] Navigation updates based on authentication state
- [ ] Error messages don't reveal system information

---

**Next Steps After Testing:**
1. Document all test results
2. Fix any identified security issues
3. Implement additional monitoring
4. Set up automated testing pipeline
5. Plan regular security audits