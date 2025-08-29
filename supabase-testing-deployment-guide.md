# Testing, Documentation & Deployment Guide

## Overview
This document provides comprehensive testing strategies, complete documentation, and deployment procedures for the LearnTAV Supabase authentication migration. It ensures a smooth transition from localStorage to enterprise-grade Supabase backend.

## Testing Strategy

### 1. Unit Testing Framework

#### Authentication Flow Tests
```javascript
// tests/supabase-auth.test.js
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SupabaseAuthFlows } from '../assets/js/supabase-authentication-flows.js';

describe('Supabase Authentication Flows', () => {
  let authFlows;
  let mockSupabase;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
        update: jest.fn(() => ({ eq: jest.fn() })),
        delete: jest.fn(() => ({ match: jest.fn() }))
      })),
      rpc: jest.fn()
    };

    authFlows = new SupabaseAuthFlows(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should successfully register a new user with valid data', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        newsletter: false
      };

      const mockAuthResponse = {
        user: { id: 'user-123', email: 'john@example.com', email_confirmed_at: null },
        session: { access_token: 'token-123' }
      };

      mockSupabase.auth.signUp.mockResolvedValue({ 
        data: mockAuthResponse, 
        error: null 
      });

      const result = await authFlows.register(userData);

      expect(result.success).toBe(true);
      expect(result.needsEmailVerification).toBe(true);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'StrongPass123!',
        options: {
          data: {
            full_name: 'John Doe',
            source: 'web_registration'
          },
          emailRedirectTo: expect.stringContaining('/auth/confirm')
        }
      });
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      };

      await expect(authFlows.register(userData)).rejects.toThrow(
        'Password must be at least 12 characters'
      );
    });

    it('should reject registration with mismatched passwords', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!'
      };

      await expect(authFlows.register(userData)).rejects.toThrow(
        'Passwords do not match'
      );
    });

    it('should handle Supabase user already exists error', async () => {
      const userData = {
        fullName: 'John Doe',
        email: 'existing@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!'
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      });

      await expect(authFlows.register(userData)).rejects.toThrow(
        'An account with this email already exists'
      );
    });
  });

  describe('User Login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'StrongPass123!'
      };

      const mockLoginResponse = {
        user: { id: 'user-123', email: 'john@example.com' },
        session: { access_token: 'token-123' }
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockLoginResponse,
        error: null
      });

      const result = await authFlows.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('john@example.com');
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'StrongPass123!'
      });
    });

    it('should reject login with invalid credentials', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      });

      await expect(authFlows.login(credentials)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should reject login with unverified email', async () => {
      const credentials = {
        email: 'unverified@example.com',
        password: 'StrongPass123!'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' }
      });

      await expect(authFlows.login(credentials)).rejects.toThrow(
        'Please verify your email address first'
      );
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'MyStr0ng!Password',
        'C0mplex#Pass123',
        'Secure$Pass2024!'
      ];

      strongPasswords.forEach(password => {
        expect(authFlows.isStrongPassword(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // Too common
        '123456789', // Only numbers
        'ABCDEFGH', // Only uppercase
        'abcdefgh', // Only lowercase
        'Pass123', // Too short
        'PasswordWithoutNumbers!', // No numbers
        'passwordwithoutupper123!', // No uppercase
        'PASSWORDWITHOUTLOWER123!', // No lowercase
        'PasswordWithoutSpecial123' // No special chars
      ];

      weakPasswords.forEach(password => {
        expect(authFlows.isStrongPassword(password)).toBe(false);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limits before operations', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      await authFlows.checkRateLimit('login', 'test@example.com');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_rate_limit', {
        p_identifier: 'test@example.com',
        p_action: 'login',
        p_max_attempts: 5,
        p_window_minutes: 15
      });
    });

    it('should throw error when rate limited', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: false, error: null });

      await expect(authFlows.checkRateLimit('login', 'test@example.com'))
        .rejects.toThrow('Too many login attempts');
    });
  });
});
```

#### Admin Authentication Tests
```javascript
// tests/supabase-admin-auth.test.js
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SupabaseAdminAuth } from '../assets/js/supabase-admin-auth.js';

describe('Supabase Admin Authentication', () => {
  let adminAuth;
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
        update: jest.fn(() => ({ eq: jest.fn() })),
        delete: jest.fn(() => ({ match: jest.fn() }))
      })),
      rpc: jest.fn()
    };

    adminAuth = new SupabaseAdminAuth(mockSupabase);
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Admin Login', () => {
    it('should successfully authenticate with correct credentials', async () => {
      const credentials = {
        username: 'admin@learntav.com',
        password: 'AdminPass123!',
        accessCode: '0410'
      };

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: {}, error: null })
      });

      const result = await adminAuth.authenticateAdmin(credentials);

      expect(result.success).toBe(true);
      expect(result.session.username).toBe('admin@learntav.com');
      expect(result.session.isAdmin).toBe(true);
    });

    it('should reject authentication with wrong username', async () => {
      const credentials = {
        username: 'wrong@example.com',
        password: 'AdminPass123!',
        accessCode: '0410'
      };

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      await expect(adminAuth.authenticateAdmin(credentials))
        .rejects.toThrow('Invalid administrator credentials');
    });

    it('should reject authentication with wrong password', async () => {
      const credentials = {
        username: 'admin@learntav.com',
        password: 'wrongpassword',
        accessCode: '0410'
      };

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      await expect(adminAuth.authenticateAdmin(credentials))
        .rejects.toThrow('Invalid administrator credentials');
    });

    it('should reject authentication with wrong access code', async () => {
      const credentials = {
        username: 'admin@learntav.com',
        password: 'AdminPass123!',
        accessCode: '1234'
      };

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      await expect(adminAuth.authenticateAdmin(credentials))
        .rejects.toThrow('Invalid administrator credentials');
    });

    it('should handle rate limiting for admin attempts', async () => {
      const credentials = {
        username: 'admin@learntav.com',
        password: 'AdminPass123!',
        accessCode: '0410'
      };

      mockSupabase.rpc.mockResolvedValue({ data: false, error: null });

      await expect(adminAuth.authenticateAdmin(credentials))
        .rejects.toThrow('Too many admin login attempts');
    });
  });

  describe('Session Management', () => {
    it('should create and validate admin sessions', async () => {
      const credentials = {
        username: 'admin@learntav.com',
        password: 'AdminPass123!',
        accessCode: '0410'
      };

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: {}, error: null })
      });

      await adminAuth.authenticateAdmin(credentials);

      expect(adminAuth.isAdminAuthenticated()).toBe(true);
      expect(adminAuth.getCurrentAdminSession().username).toBe('admin@learntav.com');
    });

    it('should expire sessions after timeout', async () => {
      // Mock expired session in localStorage
      const expiredSession = {
        sessionId: 'expired-123',
        username: 'admin@learntav.com',
        authenticated: true,
        isAdmin: true,
        created: Date.now() - (5 * 60 * 60 * 1000), // 5 hours ago
        expires: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
      };

      localStorage.setItem('learntav_admin_session', JSON.stringify(expiredSession));

      expect(adminAuth.checkExistingSession()).toBe(false);
      expect(adminAuth.isAdminAuthenticated()).toBe(false);
    });

    it('should logout and clear sessions', async () => {
      // Set up authenticated session
      adminAuth.currentAdminSession = {
        sessionId: 'test-123',
        username: 'admin@learntav.com',
        authenticated: true,
        isAdmin: true,
        created: Date.now(),
        expires: Date.now() + 3600000
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockResolvedValue({ data: {}, error: null })
      });

      await adminAuth.logoutAdmin();

      expect(adminAuth.currentAdminSession).toBe(null);
      expect(localStorage.getItem('learntav_admin_session')).toBe(null);
    });
  });
});
```

### 2. Integration Testing

#### End-to-End Authentication Flow Tests
```javascript
// tests/integration/auth-e2e.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { chromium } from 'playwright';

describe('Authentication End-to-End Tests', () => {
  let browser, context, page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await context.newPage();
    await page.goto('http://localhost:3000'); // Your test server
  });

  describe('User Registration Flow', () => {
    it('should complete full registration process', async () => {
      // Click register button to open modal
      await page.click('[data-auth-action="show-register"]');
      
      // Wait for modal to appear
      await page.waitForSelector('.auth-modal.visible');
      
      // Fill registration form
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('.auth-success-message');
      
      // Verify success message content
      const successMessage = await page.textContent('.auth-success-message');
      expect(successMessage).toContain('Registration successful');
    });

    it('should show validation errors for invalid data', async () => {
      await page.click('[data-auth-action="show-register"]');
      await page.waitForSelector('.auth-modal.visible');
      
      // Fill with invalid data
      await page.fill('input[name="fullName"]', 'A'); // Too short
      await page.fill('input[name="email"]', 'invalid-email'); // Invalid format
      await page.fill('input[name="password"]', 'weak'); // Too weak
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      const errors = await page.$$('.field-error');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('User Login Flow', () => {
    it('should login with valid credentials', async () => {
      // Assuming test user exists
      await page.click('[data-auth-action="show-login"]');
      await page.waitForSelector('.auth-modal.visible');
      
      await page.fill('input[name="email"]', 'test@learntav.com');
      await page.fill('input[name="password"]', 'TestPass123!');
      
      await page.click('button[type="submit"]');
      
      // Wait for login success and UI update
      await page.waitForSelector('[data-auth-state="logged-in"]');
      
      // Verify user menu appears
      const userMenu = await page.$('.auth-user-menu');
      expect(userMenu).toBeTruthy();
    });

    it('should show error for invalid credentials', async () => {
      await page.click('[data-auth-action="show-login"]');
      await page.waitForSelector('.auth-modal.visible');
      
      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForSelector('.auth-error-message');
      
      const errorMessage = await page.textContent('.auth-error-message');
      expect(errorMessage).toContain('Invalid email or password');
    });
  });

  describe('Admin Login Flow', () => {
    it('should access admin panel with correct credentials', async () => {
      await page.goto('http://localhost:3000/admin');
      
      // Fill admin login form
      await page.fill('input[name="username"]', 'admin@learntav.com');
      await page.fill('input[name="password"]', 'AdminPass123!');
      
      // Use numeric keypad for access code
      await page.click('.key[data-value="0"]');
      await page.click('.key[data-value="4"]');
      await page.click('.key[data-value="1"]');
      await page.click('.key[data-value="0"]');
      
      // Submit admin form
      await page.click('button[type="submit"]');
      
      // Wait for admin dashboard
      await page.waitForSelector('.admin-dashboard');
      
      // Verify admin interface elements
      const statsCards = await page.$$('.admin-stat-card');
      expect(statsCards.length).toBeGreaterThan(0);
    });

    it('should reject admin access with wrong credentials', async () => {
      await page.goto('http://localhost:3000/admin');
      
      await page.fill('input[name="username"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('.key[data-value="1"]');
      await page.click('.key[data-value="2"]');
      await page.click('.key[data-value="3"]');
      await page.click('.key[data-value="4"]');
      
      await page.click('button[type="submit"]');
      
      await page.waitForSelector('.auth-error-message');
      
      const errorMessage = await page.textContent('.auth-error-message');
      expect(errorMessage).toContain('Invalid administrator credentials');
    });
  });

  describe('Contact Form Integration', () => {
    it('should submit contact form and store in database', async () => {
      await page.goto('http://localhost:3000/contact');
      
      // Fill contact form
      await page.fill('input[name="name"]', 'Test Contact');
      await page.fill('input[name="email"]', 'contact@example.com');
      await page.fill('textarea[name="message"]', 'This is a test contact form submission.');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('.learntav-form__success');
      
      const successMessage = await page.textContent('.learntav-form__success h3');
      expect(successMessage).toContain('Message Sent Successfully');
    });
  });
});
```

### 3. Performance Testing

#### Load Testing with Jest
```javascript
// tests/performance/auth-performance.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SupabaseAuthFlows } from '../assets/js/supabase-authentication-flows.js';

describe('Authentication Performance Tests', () => {
  let authFlows;
  let mockSupabase;

  beforeAll(() => {
    mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'test' } }, error: null })
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: null, error: null }) })) }))
      })),
      rpc: jest.fn().mockResolvedValue({ data: true, error: null })
    };
    
    authFlows = new SupabaseAuthFlows(mockSupabase);
  });

  it('should handle concurrent registrations efficiently', async () => {
    const startTime = performance.now();
    const concurrentUsers = 50;
    
    const registrationPromises = Array.from({ length: concurrentUsers }, (_, i) => 
      authFlows.register({
        fullName: `User ${i}`,
        email: `user${i}@example.com`,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!'
      })
    );

    const results = await Promise.allSettled(registrationPromises);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`Processed ${concurrentUsers} registrations in ${duration}ms`);
    console.log(`Success rate: ${(successCount / concurrentUsers) * 100}%`);
    
    // Performance assertions
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    expect(successCount).toBeGreaterThan(concurrentUsers * 0.9); // 90% success rate
  });

  it('should validate passwords efficiently', () => {
    const passwords = [
      'WeakPass1',
      'MediumStrength123!',
      'VeryStrongPassword456@',
      'AnotherComplexPass789#'
    ];

    const startTime = performance.now();
    
    // Test 1000 password validations
    for (let i = 0; i < 1000; i++) {
      passwords.forEach(password => {
        authFlows.isStrongPassword(password);
      });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`4000 password validations completed in ${duration}ms`);
    expect(duration).toBeLessThan(100); // Should be very fast
  });

  it('should handle rate limit checks efficiently', async () => {
    const startTime = performance.now();
    
    // Simulate 100 rate limit checks
    const checkPromises = Array.from({ length: 100 }, (_, i) =>
      authFlows.checkRateLimit('login', `user${i}@example.com`)
    );
    
    await Promise.all(checkPromises);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`100 rate limit checks completed in ${duration}ms`);
    expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
  });
});
```

### 4. Security Testing

#### Security Validation Tests
```javascript
// tests/security/auth-security.test.js
import { describe, it, expect } from '@jest/globals';
import { SupabaseAuthFlows } from '../assets/js/supabase-authentication-flows.js';

describe('Authentication Security Tests', () => {
  let authFlows;

  beforeAll(() => {
    authFlows = new SupabaseAuthFlows({
      auth: {},
      from: () => ({}),
      rpc: () => {}
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious input', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '"><script>alert("xss")</script>',
        'onload="alert(\'xss\')"'
      ];

      maliciousInputs.forEach(input => {
        const sanitized = authFlows.sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onload=');
      });
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(1000);
      const sanitized = authFlows.sanitizeInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Password Security', () => {
    it('should reject common weak passwords', () => {
      const weakPasswords = [
        'password123',
        '123456789',
        'qwerty123',
        'admin123',
        'letmein123'
      ];

      weakPasswords.forEach(password => {
        expect(authFlows.isWeakPassword(password)).toBe(true);
      });
    });

    it('should detect repeated characters', () => {
      const repeatedPasswords = [
        'aaaaaaaaaa123!A',
        'Password1111!',
        'StrongPassssss123!'
      ];

      repeatedPasswords.forEach(password => {
        expect(authFlows.isWeakPassword(password)).toBe(true);
      });
    });
  });

  describe('Email Validation', () => {
    it('should validate legitimate email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@domain.org',
        'valid.email123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(authFlows.isValidEmail(email)).toBe(true);
      });
    });

    it('should reject malicious email formats', () => {
      const maliciousEmails = [
        'user@domain.com<script>alert(1)</script>',
        'user"@domain.com',
        'user@domain.com..com',
        '@domain.com',
        'user@',
        'user@domain',
        'user space@domain.com'
      ];

      maliciousEmails.forEach(email => {
        expect(authFlows.isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should handle potential SQL injection attempts in user data', () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "admin'/**/UNION/**/SELECT/**/password/**/FROM/**/users--",
        "1' UNION SELECT null, null, null--"
      ];

      sqlInjectionAttempts.forEach(maliciousInput => {
        const userData = {
          fullName: maliciousInput,
          email: `${maliciousInput}@example.com`,
          password: 'TestPass123!',
          confirmPassword: 'TestPass123!'
        };

        const validation = authFlows.validateRegistration(userData);
        // Should either be rejected by validation or sanitized
        if (validation.isValid) {
          const sanitizedName = authFlows.sanitizeInput(userData.fullName);
          expect(sanitizedName).not.toContain('DROP TABLE');
          expect(sanitizedName).not.toContain('UNION SELECT');
        }
      });
    });
  });
});
```

## Migration Testing Plan

### Phase 1: Pre-Migration Testing
```bash
# Run all tests before migration
npm test

# Test current localStorage system
npm run test:legacy

# Performance baseline
npm run test:performance
```

### Phase 2: Parallel Testing
```bash
# Test both systems in parallel
npm run test:parallel

# Compare performance
npm run test:compare

# Validate data consistency
npm run test:consistency
```

### Phase 3: Post-Migration Validation
```bash
# Full regression test
npm run test:regression

# Security audit
npm run test:security

# Performance validation
npm run test:performance:supabase
```

## Deployment Guide

### 1. Pre-Deployment Checklist

#### Environment Setup
```bash
# 1. Supabase Project Configuration
# ✅ Supabase project created
# ✅ Database schema deployed
# ✅ RLS policies enabled
# ✅ Environment variables set
# ✅ API keys secured

# 2. Code Preparation
# ✅ All tests passing
# ✅ Performance benchmarks met
# ✅ Security audit completed
# ✅ Documentation updated

# 3. Backup Strategy
# ✅ Current localStorage data exported
# ✅ Database backup created
# ✅ Rollback plan documented
```

#### Configuration Files
```javascript
// config/supabase-config.js
export const SUPABASE_CONFIG = {
  // Production configuration
  production: {
    url: process.env.SUPABASE_URL_PROD,
    anonKey: process.env.SUPABASE_ANON_KEY_PROD,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_PROD
  },
  
  // Staging configuration
  staging: {
    url: process.env.SUPABASE_URL_STAGING,
    anonKey: process.env.SUPABASE_ANON_KEY_STAGING,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING
  },
  
  // Development configuration
  development: {
    url: process.env.SUPABASE_URL_DEV,
    anonKey: process.env.SUPABASE_ANON_KEY_DEV,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY_DEV
  }
};

// Get config based on environment
export function getSupabaseConfig() {
  const env = process.env.NODE_ENV || 'development';
  return SUPABASE_CONFIG[env];
}
```

### 2. Deployment Process

#### Step 1: Staging Deployment
```bash
#!/bin/bash
# deploy-staging.sh

echo "🚀 Starting staging deployment..."

# 1. Deploy to staging environment
git checkout staging
git pull origin main

# 2. Install dependencies
npm install

# 3. Run tests
npm run test:full

# 4. Build and deploy
npm run build
npm run deploy:staging

# 5. Run smoke tests
npm run test:smoke:staging

echo "✅ Staging deployment complete"
```

#### Step 2: Production Deployment
```bash
#!/bin/bash
# deploy-production.sh

echo "🚀 Starting production deployment..."

# 1. Pre-deployment checks
npm run test:production
npm run audit:security
npm run check:performance

# 2. Create backup
npm run backup:create

# 3. Deploy with feature flags
npm run deploy:production --feature-flags=supabase:50%

# 4. Monitor rollout
npm run monitor:deployment

# 5. Full rollout after validation
npm run deploy:complete --feature-flags=supabase:100%

echo "✅ Production deployment complete"
```

### 3. Feature Flag Implementation

#### Gradual Rollout Strategy
```javascript
// assets/js/feature-flags.js
export class FeatureFlags {
  constructor() {
    this.flags = {
      supabaseAuth: this.getFlag('supabase_auth', 0), // 0-100% rollout
      supabaseContact: this.getFlag('supabase_contact', 0),
      supabaseAdmin: this.getFlag('supabase_admin', 0)
    };
  }

  getFlag(flagName, defaultValue) {
    // Check URL parameters first (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlFlag = urlParams.get(flagName);
    if (urlFlag !== null) {
      return parseInt(urlFlag, 10);
    }

    // Check localStorage override
    const localOverride = localStorage.getItem(`ff_${flagName}`);
    if (localOverride !== null) {
      return parseInt(localOverride, 10);
    }

    // Server-side flag (would be fetched from API)
    const serverFlag = this.getServerFlag(flagName);
    if (serverFlag !== null) {
      return serverFlag;
    }

    return defaultValue;
  }

  isEnabled(flagName, userId = null) {
    const percentage = this.flags[flagName] || 0;
    
    if (percentage === 0) return false;
    if (percentage === 100) return true;

    // Deterministic rollout based on user ID or session ID
    const identifier = userId || this.getSessionIdentifier();
    const hash = this.simpleHash(identifier);
    const bucket = hash % 100;
    
    return bucket < percentage;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  getSessionIdentifier() {
    let identifier = sessionStorage.getItem('session_id');
    if (!identifier) {
      identifier = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('session_id', identifier);
    }
    return identifier;
  }

  getServerFlag(flagName) {
    // In production, this would fetch from a feature flag service
    // For now, return null to use default
    return null;
  }
}

// Usage in authentication bridge
export function shouldUseSupabase(feature) {
  const flags = new FeatureFlags();
  return flags.isEnabled(`supabase${feature}`);
}
```

### 4. Monitoring and Observability

#### Error Tracking
```javascript
// assets/js/error-tracking.js
export class ErrorTracking {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('javascript', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('promise', event.reason);
    });

    // Supabase error handler
    this.setupSupabaseErrorHandler();
  }

  setupSupabaseErrorHandler() {
    // Intercept Supabase errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && args[0].includes('supabase')) {
          this.logError('supabase_http', new Error(`HTTP ${response.status}`), {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        
        return response;
      } catch (error) {
        if (args[0].includes('supabase')) {
          this.logError('supabase_network', error, {
            url: args[0]
          });
        }
        throw error;
      }
    };
  }

  logError(type, error, context = {}) {
    const errorEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      type,
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: window.authState?.user?.id || null
    };

    this.errors.push(errorEntry);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Send to monitoring service (optional)
    this.sendToMonitoring(errorEntry);

    console.error('Error tracked:', errorEntry);
  }

  sendToMonitoring(errorEntry) {
    // In production, send to service like Sentry, LogRocket, etc.
    try {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: errorEntry.message,
          fatal: errorEntry.type === 'javascript'
        });
      }
    } catch (e) {
      // Ignore monitoring errors
    }
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

// Initialize error tracking
window.ErrorTracking = new ErrorTracking();
```

#### Performance Monitoring
```javascript
// assets/js/performance-monitoring.js
export class PerformanceMonitoring {
  constructor() {
    this.metrics = [];
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Measure authentication operations
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name.startsWith('auth_')) {
            this.recordMetric(entry.name, entry.duration, entry.startTime);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    }
  }

  startTiming(operationName) {
    const markName = `${operationName}_start`;
    performance.mark(markName);
    return markName;
  }

  endTiming(operationName, startMark) {
    const endMark = `${operationName}_end`;
    const measureName = `auth_${operationName}`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    // Clean up marks
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
  }

  recordMetric(name, duration, timestamp) {
    const metric = {
      name,
      duration,
      timestamp,
      url: window.location.pathname,
      userId: window.authState?.user?.id || null
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log slow operations
    if (duration > 2000) { // 2 seconds
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }

    // Send to analytics
    this.sendToAnalytics(metric);
  }

  sendToAnalytics(metric) {
    try {
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: metric.name,
          value: Math.round(metric.duration)
        });
      }
    } catch (e) {
      // Ignore analytics errors
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageTime(operationName) {
    const operationMetrics = this.metrics.filter(m => 
      m.name.includes(operationName)
    );
    
    if (operationMetrics.length === 0) return 0;
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / operationMetrics.length;
  }
}

// Initialize performance monitoring
window.PerformanceMonitoring = new PerformanceMonitoring();
```

## Final Implementation Checklist

### Pre-Launch Validation
- [ ] All unit tests passing (100% coverage)
- [ ] Integration tests validated
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Accessibility compliance validated
- [ ] Documentation completed

### Launch Readiness
- [ ] Supabase project configured and secured
- [ ] Database schema deployed with RLS policies
- [ ] Environment variables properly set
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring and error tracking active
- [ ] Backup and rollback procedures tested
- [ ] Support team trained on new system

### Post-Launch Monitoring
- [ ] Monitor error rates and user feedback
- [ ] Track performance metrics
- [ ] Validate feature flag rollout percentages
- [ ] Monitor database performance
- [ ] Check security event logs
- [ ] Validate email deliverability
- [ ] Confirm admin panel functionality

This comprehensive testing and deployment strategy ensures a smooth, secure, and reliable migration from your localStorage-based authentication system to the enterprise-grade Supabase backend while maintaining all existing functionality and user experience.