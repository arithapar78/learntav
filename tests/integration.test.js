/**
 * LearnTAV Authentication System - Integration Tests
 * End-to-end user flow testing
 */

describe('Authentication User Flows - Integration Tests', () => {
    let page;
    let browser;

    beforeAll(async () => {
        // Setup for browser testing (Puppeteer)
        const puppeteer = require('puppeteer');
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        // Set viewport for consistent testing
        await page.setViewport({ width: 1200, height: 800 });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        // Clear localStorage and sessionStorage before each test
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Navigate to the main page
        await page.goto('file://' + process.cwd() + '/index.html');
        await page.waitForTimeout(1000); // Wait for page to load
    });

    describe('Welcome Modal Flow', () => {
        test('should show welcome modal immediately on first visit', async () => {
            // Check if welcome modal appears
            const welcomeModal = await page.waitForSelector('.auth-modal--welcome', { timeout: 2000 });
            expect(welcomeModal).toBeTruthy();

            // Verify modal content
            const modalTitle = await page.$eval('.auth-modal--welcome h2', el => el.textContent);
            expect(modalTitle).toBe('Transform Your Tech Journey');

            // Verify buttons are present
            const createAccountBtn = await page.$('.auth-modal--welcome .auth-btn--primary');
            const signInBtn = await page.$('.auth-modal--welcome .auth-btn--ghost');
            
            expect(createAccountBtn).toBeTruthy();
            expect(signInBtn).toBeTruthy();
        });

        test('should not show welcome modal on subsequent visits', async () => {
            // First visit - modal should appear
            await page.waitForSelector('.auth-modal--welcome', { timeout: 2000 });
            
            // Close modal by clicking outside
            await page.click('.auth-modal-overlay');
            await page.waitForTimeout(500);

            // Refresh page
            await page.reload();
            await page.waitForTimeout(1000);

            // Modal should not appear again
            const welcomeModal = await page.$('.auth-modal--welcome');
            expect(welcomeModal).toBeFalsy();
        });
    });

    describe('User Registration Flow', () => {
        test('should complete full registration process', async () => {
            // Wait for welcome modal and click create account
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--primary');

            // Wait for registration modal
            await page.waitForSelector('.auth-modal--register');

            // Fill registration form
            await page.type('#register-name', 'John Doe');
            await page.type('#register-email', 'john@example.com');
            await page.type('#register-password', 'StrongPass123!');
            await page.type('#register-confirm-password', 'StrongPass123!');
            
            // Check terms checkbox
            await page.click('#register-terms');

            // Submit form
            await page.click('.auth-modal--register button[type="submit"]');

            // Wait for success notification
            const notification = await page.waitForSelector('.auth-notification--success', { timeout: 5000 });
            expect(notification).toBeTruthy();

            // Verify user is logged in (check UI state)
            const userMenu = await page.waitForSelector('[data-auth-state="logged-in"]', { visible: true });
            expect(userMenu).toBeTruthy();
        });

        test('should show validation errors for invalid registration', async () => {
            // Open registration modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.waitForSelector('.auth-modal--register');

            // Try to submit with invalid data
            await page.type('#register-name', 'J'); // Too short
            await page.type('#register-email', 'invalid-email');
            await page.type('#register-password', 'weak');
            await page.type('#register-confirm-password', 'different');

            // Submit form
            await page.click('.auth-modal--register button[type="submit"]');

            // Check for validation errors
            const nameError = await page.$('#register-name-error.auth-form__error--visible');
            const emailError = await page.$('#register-email-error.auth-form__error--visible');
            const passwordError = await page.$('#register-password-error.auth-form__error--visible');

            expect(nameError).toBeTruthy();
            expect(emailError).toBeTruthy();
            expect(passwordError).toBeTruthy();
        });

        test('should show password strength meter', async () => {
            // Open registration modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.waitForSelector('.auth-modal--register');

            // Type different password strengths and verify meter
            await page.type('#register-password', 'weak');
            let strengthMeter = await page.$eval('#password-strength', el => el.className);
            expect(strengthMeter).toContain('weak');

            // Clear and try stronger password
            await page.evaluate(() => document.getElementById('register-password').value = '');
            await page.type('#register-password', 'StrongPass123!');
            strengthMeter = await page.$eval('#password-strength', el => el.className);
            expect(strengthMeter).toContain('strong');
        });
    });

    describe('User Login Flow', () => {
        beforeEach(async () => {
            // Pre-register a user for login tests
            await page.evaluate(() => {
                const users = [{
                    id: 'test-user-id',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    passwordHash: 'hashed-password',
                    created: Date.now(),
                    verified: false,
                    settings: { theme: 'light', notifications: true }
                }];
                localStorage.setItem('learntav_users', JSON.stringify(users));
            });
        });

        test('should complete login process with valid credentials', async () => {
            // Open login modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--ghost');
            await page.waitForSelector('.auth-modal--login');

            // Fill login form
            await page.type('#login-email', 'test@example.com');
            await page.type('#login-password', 'correct-password');

            // Submit form
            await page.click('.auth-modal--login button[type="submit"]');

            // Wait for success (this would work with proper backend)
            await page.waitForTimeout(2000);

            // Check if modal closed (successful login)
            const loginModal = await page.$('.auth-modal--login');
            expect(loginModal).toBeFalsy();
        });

        test('should switch between login and register modals', async () => {
            // Open login modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--ghost');
            await page.waitForSelector('.auth-modal--login');

            // Click "Create Account" link
            await page.click('.auth-modal--login .auth-link');
            
            // Should now show register modal
            await page.waitForSelector('.auth-modal--register');
            const registerModal = await page.$('.auth-modal--register');
            expect(registerModal).toBeTruthy();

            // Click "Sign In" link
            await page.click('.auth-modal--register .auth-link');
            
            // Should now show login modal
            await page.waitForSelector('.auth-modal--login');
            const loginModal = await page.$('.auth-modal--login');
            expect(loginModal).toBeTruthy();
        });
    });

    describe('Password Reset Flow', () => {
        test('should open password reset modal from login', async () => {
            // Open login modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--ghost');
            await page.waitForSelector('.auth-modal--login');

            // Click "Forgot Password?" link
            await page.evaluate(() => {
                document.querySelector('button[onclick*="showResetModal"]').click();
            });

            // Should show reset modal
            await page.waitForSelector('.auth-modal--reset');
            const resetModal = await page.$('.auth-modal--reset');
            expect(resetModal).toBeTruthy();

            // Verify modal content
            const title = await page.$eval('.auth-modal--reset h2', el => el.textContent);
            expect(title).toBe('Reset Password');
        });

        test('should handle password reset submission', async () => {
            // Open reset modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--ghost');
            await page.waitForSelector('.auth-modal--login');
            await page.evaluate(() => {
                document.querySelector('button[onclick*="showResetModal"]').click();
            });
            await page.waitForSelector('.auth-modal--reset');

            // Fill email and submit
            await page.type('#reset-email', 'test@example.com');
            await page.click('.auth-modal--reset button[type="submit"]');

            // Wait for processing
            await page.waitForTimeout(2000);

            // Should show success notification
            const notification = await page.waitForSelector('.auth-notification--success', { timeout: 5000 });
            expect(notification).toBeTruthy();
        });
    });

    describe('Settings Page Access Control', () => {
        test('should redirect unauthenticated users from settings', async () => {
            // Navigate directly to settings page
            await page.goto('file://' + process.cwd() + '/settings/index.html');
            await page.waitForTimeout(1000);

            // Should be redirected or shown login modal
            const currentUrl = page.url();
            const loginModal = await page.$('.auth-modal--login');
            
            // Either redirected away from settings or login modal shown
            expect(currentUrl.includes('settings') && loginModal).toBeTruthy();
        });

        test('should allow authenticated users to access settings', async () => {
            // Simulate logged in user
            await page.evaluate(() => {
                const user = {
                    id: 'test-user-id',
                    fullName: 'Test User',
                    email: 'test@example.com',
                    settings: { theme: 'light', notifications: true }
                };
                const session = {
                    user: user,
                    created: Date.now(),
                    expires: Date.now() + 24 * 60 * 60 * 1000
                };
                sessionStorage.setItem('learntav_session', JSON.stringify(session));
            });

            // Navigate to settings page
            await page.goto('file://' + process.cwd() + '/settings/index.html');
            await page.waitForTimeout(1000);

            // Should successfully load settings page
            const settingsPage = await page.$('.settings-container');
            expect(settingsPage).toBeTruthy();
        });
    });

    describe('Responsive Design Tests', () => {
        test('should work on mobile viewport', async () => {
            // Set mobile viewport
            await page.setViewport({ width: 375, height: 667 });
            await page.reload();
            await page.waitForTimeout(1000);

            // Welcome modal should still appear and be functional
            const welcomeModal = await page.waitForSelector('.auth-modal--welcome');
            expect(welcomeModal).toBeTruthy();

            // Modal should be responsive
            const modalWidth = await page.$eval('.auth-modal--welcome', el => 
                window.getComputedStyle(el).width
            );
            expect(parseFloat(modalWidth)).toBeLessThan(400); // Should fit mobile screen
        });

        test('should work on tablet viewport', async () => {
            // Set tablet viewport
            await page.setViewport({ width: 768, height: 1024 });
            await page.reload();
            await page.waitForTimeout(1000);

            // All functionality should still work
            const welcomeModal = await page.waitForSelector('.auth-modal--welcome');
            expect(welcomeModal).toBeTruthy();
        });
    });

    describe('Keyboard Navigation', () => {
        test('should close modals with Escape key', async () => {
            // Open welcome modal
            await page.waitForSelector('.auth-modal--welcome');
            
            // Press Escape key
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            // Modal should be closed
            const welcomeModal = await page.$('.auth-modal--welcome');
            expect(welcomeModal).toBeFalsy();
        });

        test('should navigate form fields with Tab key', async () => {
            // Open registration modal
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.waitForSelector('.auth-modal--register');

            // Tab through form fields
            await page.keyboard.press('Tab');
            let activeElement = await page.evaluate(() => document.activeElement.id);
            expect(activeElement).toBe('register-name');

            await page.keyboard.press('Tab');
            activeElement = await page.evaluate(() => document.activeElement.id);
            expect(activeElement).toBe('register-email');
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors gracefully', async () => {
            // Simulate network failure
            await page.setOfflineMode(true);

            // Try to register
            await page.waitForSelector('.auth-modal--welcome');
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.waitForSelector('.auth-modal--register');

            await page.type('#register-name', 'John Doe');
            await page.type('#register-email', 'john@example.com');
            await page.type('#register-password', 'StrongPass123!');
            await page.type('#register-confirm-password', 'StrongPass123!');
            await page.click('#register-terms');
            await page.click('.auth-modal--register button[type="submit"]');

            // Should still handle gracefully (show appropriate message)
            await page.waitForTimeout(3000);

            // Reset network
            await page.setOfflineMode(false);
        });
    });
});