/**
 * LearnTAV Authentication System - End-to-End Tests
 * Complete user journey testing with Playwright
 */

const { test, expect } = require('@playwright/test');

test.describe('LearnTAV Authentication E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear storage before each test
        await page.context().clearCookies();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Navigate to the main page
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Complete User Registration Journey', () => {
        test('should complete full user registration and login cycle', async ({ page }) => {
            // Step 1: Welcome modal should appear immediately
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            await expect(page.locator('.auth-modal--welcome h2')).toContainText('Transform Your Tech Journey');

            // Step 2: Click "Create Free Account"
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await expect(page.locator('.auth-modal--register')).toBeVisible();

            // Step 3: Fill registration form with valid data
            await page.fill('#register-name', 'Alice Johnson');
            await page.fill('#register-email', 'alice@example.com');
            await page.fill('#register-password', 'SecurePass123!');
            await page.fill('#register-confirm-password', 'SecurePass123!');

            // Step 4: Verify password strength meter shows strong
            await expect(page.locator('#password-strength')).toHaveClass(/strong/);

            // Step 5: Accept terms and submit
            await page.check('#register-terms');
            await page.check('#register-remember');
            await page.click('.auth-modal--register button[type="submit"]');

            // Step 6: Wait for registration to complete
            await expect(page.locator('.auth-notification--success')).toBeVisible();
            await expect(page.locator('.auth-notification--success')).toContainText('Account created successfully');

            // Step 7: Verify user is logged in
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();
            await expect(page.locator('[data-user-name]')).toContainText('Alice Johnson');

            // Step 8: Log out
            await page.click('.user-menu__toggle');
            await page.click('[data-auth-action="logout"]');

            // Step 9: Verify logout successful
            await expect(page.locator('[data-auth-state="logged-out"]')).toBeVisible();
            await expect(page.locator('.auth-notification--info')).toContainText('logged out');

            // Step 10: Log back in
            await page.click('[data-auth-action="show-login"]');
            await page.fill('#login-email', 'alice@example.com');
            await page.fill('#login-password', 'SecurePass123!');
            await page.click('.auth-modal--login button[type="submit"]');

            // Step 11: Verify login successful
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();
            await expect(page.locator('.auth-notification--success')).toContainText('Welcome back');
        });

        test('should handle registration validation errors', async ({ page }) => {
            // Open registration modal
            await page.click('.auth-modal--welcome .auth-btn--primary');

            // Try to submit with invalid data
            await page.fill('#register-name', 'A'); // Too short
            await page.fill('#register-email', 'invalid-email');
            await page.fill('#register-password', 'weak');
            await page.fill('#register-confirm-password', 'different');
            
            // Submit without accepting terms
            await page.click('.auth-modal--register button[type="submit"]');

            // Verify validation errors appear
            await expect(page.locator('#register-name-error')).toBeVisible();
            await expect(page.locator('#register-email-error')).toBeVisible();
            await expect(page.locator('#register-password-error')).toBeVisible();
            await expect(page.locator('#register-confirm-password-error')).toBeVisible();

            // Fix errors one by one and verify they disappear
            await page.fill('#register-name', 'Alice Johnson');
            await expect(page.locator('#register-name-error')).not.toBeVisible();

            await page.fill('#register-email', 'alice@example.com');
            await expect(page.locator('#register-email-error')).not.toBeVisible();
        });
    });

    test.describe('Settings Page Access Control', () => {
        test('should redirect unauthenticated users', async ({ page }) => {
            // Navigate directly to settings
            await page.goto('/settings/');
            
            // Should show login modal or redirect
            await expect(page.locator('.auth-modal--login')).toBeVisible();
        });

        test('should allow authenticated users to access settings', async ({ page }) => {
            // First register and login
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.fill('#register-name', 'Test User');
            await page.fill('#register-email', 'test@example.com');
            await page.fill('#register-password', 'TestPass123!');
            await page.fill('#register-confirm-password', 'TestPass123!');
            await page.check('#register-terms');
            await page.click('.auth-modal--register button[type="submit"]');
            
            // Wait for login to complete
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();

            // Navigate to settings
            await page.goto('/settings/');
            await page.waitForLoadState('networkidle');

            // Should successfully load settings page
            await expect(page.locator('.settings-container')).toBeVisible();
            await expect(page.locator('.settings-header h1')).toContainText('Account Settings');
        });

        test('should update user settings', async ({ page }) => {
            // Login first
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.fill('#register-name', 'Settings User');
            await page.fill('#register-email', 'settings@example.com');
            await page.fill('#register-password', 'SettingsPass123!');
            await page.fill('#register-confirm-password', 'SettingsPass123!');
            await page.check('#register-terms');
            await page.click('.auth-modal--register button[type="submit"]');
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();

            // Go to settings
            await page.goto('/settings/');
            await expect(page.locator('.settings-container')).toBeVisible();

            // Update profile information
            await page.fill('#profile-name', 'Updated Settings User');
            await page.click('button[onclick*="updateProfile"]');

            // Verify success notification
            await expect(page.locator('.notification--success')).toBeVisible();
            await expect(page.locator('.notification--success')).toContainText('Profile updated');
        });
    });

    test.describe('Password Reset Flow', () => {
        test('should complete password reset flow', async ({ page }) => {
            // Go to login and click forgot password
            await page.click('.auth-modal--welcome .auth-btn--ghost');
            await page.click('button[onclick*="showResetModal"]');

            // Fill reset form
            await expect(page.locator('.auth-modal--reset')).toBeVisible();
            await page.fill('#reset-email', 'user@example.com');
            await page.click('.auth-modal--reset button[type="submit"]');

            // Verify success message
            await expect(page.locator('.auth-notification--success')).toBeVisible();
            await expect(page.locator('.auth-notification--success')).toContainText('reset instructions');
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Welcome modal should appear and be functional
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            
            // Click create account
            await page.click('.auth-modal--welcome .auth-btn--primary');
            
            // Form should be usable on mobile
            await expect(page.locator('.auth-modal--register')).toBeVisible();
            await page.fill('#register-name', 'Mobile User');
            await page.fill('#register-email', 'mobile@example.com');
            
            // Form fields should be properly sized
            const nameField = page.locator('#register-name');
            await expect(nameField).toBeVisible();
        });

        test('should work on tablet devices', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });

            // All functionality should work
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await expect(page.locator('.auth-modal--register')).toBeVisible();
        });
    });

    test.describe('Accessibility', () => {
        test('should be keyboard navigable', async ({ page }) => {
            // Modal should be focusable
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            
            // Tab through elements
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            
            // Enter should activate buttons
            await page.keyboard.press('Enter');
            await expect(page.locator('.auth-modal--register')).toBeVisible();

            // Escape should close modal
            await page.keyboard.press('Escape');
            await expect(page.locator('.auth-modal--register')).not.toBeVisible();
        });

        test('should have proper ARIA labels', async ({ page }) => {
            await page.click('.auth-modal--welcome .auth-btn--primary');
            
            // Check for proper labels
            await expect(page.locator('label[for="register-name"]')).toBeVisible();
            await expect(page.locator('label[for="register-email"]')).toBeVisible();
            await expect(page.locator('label[for="register-password"]')).toBeVisible();
        });
    });

    test.describe('Performance', () => {
        test('should load quickly', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });

        test('should not have console errors', async ({ page }) => {
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            await page.goto('/');
            await page.waitForTimeout(2000);

            // Filter out known non-critical errors
            const criticalErrors = errors.filter(error => 
                !error.includes('favicon') && 
                !error.includes('Extension') &&
                !error.includes('ERR_FILE_NOT_FOUND')
            );

            expect(criticalErrors).toHaveLength(0);
        });
    });

    test.describe('Cross-Browser Functionality', () => {
        test('should work across different browsers', async ({ browserName, page }) => {
            // Basic functionality test for all browsers
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await expect(page.locator('.auth-modal--register')).toBeVisible();

            // Fill form
            await page.fill('#register-name', `${browserName} User`);
            await page.fill('#register-email', `${browserName}@example.com`);
            await page.fill('#register-password', 'BrowserPass123!');
            await page.fill('#register-confirm-password', 'BrowserPass123!');

            // Password strength should work
            await expect(page.locator('#password-strength')).toHaveClass(/strong/);
        });
    });

    test.describe('Data Persistence', () => {
        test('should persist login state across page refreshes', async ({ page }) => {
            // Register and login
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.fill('#register-name', 'Persistent User');
            await page.fill('#register-email', 'persistent@example.com');
            await page.fill('#register-password', 'PersistentPass123!');
            await page.fill('#register-confirm-password', 'PersistentPass123!');
            await page.check('#register-terms');
            await page.check('#register-remember'); // Enable remember me
            await page.click('.auth-modal--register button[type="submit"]');

            // Verify logged in
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();

            // Refresh page
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Should still be logged in
            await expect(page.locator('[data-auth-state="logged-in"]')).toBeVisible();
            await expect(page.locator('[data-user-name]')).toContainText('Persistent User');
        });
    });

    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate offline mode
            await page.context().setOffline(true);

            // Try to register
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.fill('#register-name', 'Offline User');
            await page.fill('#register-email', 'offline@example.com');
            await page.fill('#register-password', 'OfflinePass123!');
            await page.fill('#register-confirm-password', 'OfflinePass123!');
            await page.check('#register-terms');
            await page.click('.auth-modal--register button[type="submit"]');

            // Should handle error gracefully (no crashes)
            await page.waitForTimeout(2000);

            // Re-enable network
            await page.context().setOffline(false);
        });
    });
});