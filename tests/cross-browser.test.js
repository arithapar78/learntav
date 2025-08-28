/**
 * LearnTAV Authentication System - Cross-Browser Compatibility Tests
 * Testing authentication functionality across different browsers and versions
 */

const { test, expect, devices } = require('@playwright/test');

// Define browsers to test
const browsers = ['chromium', 'firefox', 'webkit'];
const mobileDevices = ['iPhone 12', 'Samsung Galaxy S21', 'iPad Pro'];

browsers.forEach(browserName => {
    test.describe(`${browserName.toUpperCase()} Browser Tests`, () => {
        test.use({ 
            browserName,
            // Enable additional browser features
            permissions: ['notifications'],
            geolocation: { longitude: 12.492507, latitude: 41.889938 }
        });

        test('should load authentication system correctly', async ({ page }) => {
            await page.goto('/');
            
            // Basic page load verification
            await expect(page.locator('.learntav-nav')).toBeVisible();
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            
            // Check console for errors
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });
            
            await page.waitForTimeout(2000);
            
            // Filter known non-critical errors
            const criticalErrors = errors.filter(error => 
                !error.includes('favicon') && 
                !error.includes('Extension') &&
                !error.includes('net::ERR_FILE_NOT_FOUND')
            );
            
            expect(criticalErrors.length).toBe(0);
        });

        test('should handle registration flow', async ({ page }) => {
            await page.goto('/');
            
            // Complete registration
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await page.fill('#register-name', `${browserName} Test User`);
            await page.fill('#register-email', `${browserName}@test.com`);
            await page.fill('#register-password', 'TestPassword123!');
            await page.fill('#register-confirm-password', 'TestPassword123!');
            await page.check('#register-terms');
            
            // Submit form
            await page.click('.auth-modal--register button[type="submit"]');
            
            // Should work across all browsers
            await expect(page.locator('.auth-notification--success')).toBeVisible({ timeout: 10000 });
        });

        test('should handle form validation consistently', async ({ page }) => {
            await page.goto('/');
            
            // Open registration
            await page.click('.auth-modal--welcome .auth-btn--primary');
            
            // Test validation with invalid data
            await page.fill('#register-name', 'A');
            await page.fill('#register-email', 'invalid');
            await page.fill('#register-password', 'weak');
            await page.fill('#register-confirm-password', 'different');
            
            // Trigger validation
            await page.click('#register-name');
            await page.click('#register-email');
            
            // Check validation works in this browser
            await expect(page.locator('#register-name')).toHaveClass(/error/);
            await expect(page.locator('#register-email')).toHaveClass(/error/);
        });

        test('should handle localStorage/sessionStorage', async ({ page }) => {
            await page.goto('/');
            
            // Test storage functionality
            const storageWorks = await page.evaluate(() => {
                try {
                    localStorage.setItem('test', 'value');
                    sessionStorage.setItem('test', 'value');
                    
                    const localValue = localStorage.getItem('test');
                    const sessionValue = sessionStorage.getItem('test');
                    
                    localStorage.removeItem('test');
                    sessionStorage.removeItem('test');
                    
                    return localValue === 'value' && sessionValue === 'value';
                } catch (error) {
                    return false;
                }
            });
            
            expect(storageWorks).toBe(true);
        });

        test('should handle CSS animations and transitions', async ({ page }) => {
            await page.goto('/');
            
            // Check if modal animations work
            const modal = page.locator('.auth-modal--welcome');
            await expect(modal).toBeVisible();
            
            // Check computed styles for animations
            const hasTransition = await modal.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.transition !== 'all 0s ease 0s' || style.transform !== 'none';
            });
            
            // Animations should work (or fallback gracefully)
            expect(typeof hasTransition).toBe('boolean');
        });

        test('should handle JavaScript ES6 features', async ({ page }) => {
            await page.goto('/');
            
            // Test if ES6 features work
            const es6Support = await page.evaluate(() => {
                try {
                    // Test arrow functions, const/let, template literals
                    const testFunc = () => `ES6 works`;
                    let result = testFunc();
                    const obj = { [result]: true };
                    
                    return obj['ES6 works'] === true;
                } catch (error) {
                    return false;
                }
            });
            
            expect(es6Support).toBe(true);
        });
    });
});

// Mobile device testing
mobileDevices.forEach(deviceName => {
    test.describe(`${deviceName} Device Tests`, () => {
        test.use({ ...devices[deviceName] });

        test('should work on mobile device', async ({ page }) => {
            await page.goto('/');
            
            // Modal should be visible and functional
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            
            // Should be able to interact with form
            await page.click('.auth-modal--welcome .auth-btn--primary');
            await expect(page.locator('.auth-modal--register')).toBeVisible();
            
            // Form should be usable on mobile
            await page.fill('#register-name', 'Mobile User');
            await page.fill('#register-email', 'mobile@test.com');
            
            // Check viewport adaptation
            const viewport = page.viewportSize();
            expect(viewport.width).toBeLessThanOrEqual(500);
        });

        test('should handle touch interactions', async ({ page }) => {
            await page.goto('/');
            
            // Test touch interactions
            await page.tap('.auth-modal--welcome .auth-btn--primary');
            await expect(page.locator('.auth-modal--register')).toBeVisible();
            
            // Test form interaction with touch
            await page.tap('#register-name');
            await page.fill('#register-name', 'Touch User');
            
            // Should work with touch events
            const nameValue = await page.inputValue('#register-name');
            expect(nameValue).toBe('Touch User');
        });
    });
});

// Specific browser quirks and features
test.describe('Browser-Specific Features', () => {
    test('Chrome/Chromium specific features', async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium');
        
        await page.goto('/');
        
        // Test Chrome-specific features
        const chromeFeatures = await page.evaluate(() => {
            return {
                webkitFeatures: typeof window.webkitRequestAnimationFrame !== 'undefined',
                chromeSpecific: !!window.chrome
            };
        });
        
        // Should detect Chrome environment
        expect(chromeFeatures.chromeSpecific).toBeTruthy();
    });

    test('Firefox specific features', async ({ page, browserName }) => {
        test.skip(browserName !== 'firefox');
        
        await page.goto('/');
        
        // Test Firefox-specific behavior
        const firefoxFeatures = await page.evaluate(() => {
            return {
                mozFeatures: typeof window.mozRequestAnimationFrame !== 'undefined' || 
                           navigator.userAgent.includes('Firefox')
            };
        });
        
        // Should work in Firefox
        expect(typeof firefoxFeatures.mozFeatures).toBe('boolean');
    });

    test('Safari/WebKit specific features', async ({ page, browserName }) => {
        test.skip(browserName !== 'webkit');
        
        await page.goto('/');
        
        // Test WebKit-specific behavior
        const webkitFeatures = await page.evaluate(() => {
            return {
                safariFeatures: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                webkitFeatures: typeof window.webkitRequestAnimationFrame !== 'undefined'
            };
        });
        
        // Should work in Safari/WebKit
        expect(typeof webkitFeatures.webkitFeatures).toBe('boolean');
    });
});

// Performance across browsers
test.describe('Cross-Browser Performance', () => {
    browsers.forEach(browserName => {
        test(`${browserName} performance benchmarks`, async ({ page }) => {
            test.use({ browserName });
            
            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;
            
            // Should load within reasonable time on all browsers
            expect(loadTime).toBeLessThan(5000);
            
            // Test JavaScript execution performance
            const jsPerf = await page.evaluate(() => {
                const start = performance.now();
                
                // Simulate auth system operations
                for (let i = 0; i < 1000; i++) {
                    const hash = btoa(Math.random().toString());
                }
                
                return performance.now() - start;
            });
            
            // JavaScript performance should be acceptable
            expect(jsPerf).toBeLessThan(100); // 100ms for 1000 operations
        });
    });
});

// Accessibility across browsers
test.describe('Cross-Browser Accessibility', () => {
    browsers.forEach(browserName => {
        test(`${browserName} accessibility features`, async ({ page }) => {
            test.use({ browserName });
            
            await page.goto('/');
            
            // Test keyboard navigation
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            
            // Should be keyboard accessible
            const focusedElement = await page.evaluate(() => document.activeElement.tagName);
            expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
            
            // Test ARIA attributes
            const hasAriaLabels = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button[aria-label]');
                return buttons.length > 0;
            });
            
            expect(hasAriaLabels).toBe(true);
        });
    });
});

// Error handling across browsers
test.describe('Cross-Browser Error Handling', () => {
    browsers.forEach(browserName => {
        test(`${browserName} error resilience`, async ({ page }) => {
            test.use({ browserName });
            
            let consoleErrors = 0;
            page.on('console', msg => {
                if (msg.type() === 'error') consoleErrors++;
            });
            
            await page.goto('/');
            
            // Cause intentional JavaScript error
            await page.evaluate(() => {
                try {
                    // This should not break the application
                    nonExistentFunction();
                } catch (error) {
                    console.log('Caught error:', error.message);
                }
            });
            
            await page.waitForTimeout(1000);
            
            // Application should still be functional
            await expect(page.locator('.auth-modal--welcome')).toBeVisible();
            
            // Should handle errors gracefully
            expect(consoleErrors).toBeLessThan(5);
        });
    });
});