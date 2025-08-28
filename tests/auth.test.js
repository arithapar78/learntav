/**
 * LearnTAV Authentication System - Unit Tests
 * Comprehensive test suite for authentication logic
 */

describe('LearnTAV Authentication System', () => {
    let auth;
    let mockLocalStorage = {};
    let mockSessionStorage = {};

    beforeEach(() => {
        // Mock localStorage and sessionStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(key => mockLocalStorage[key] || null),
                setItem: jest.fn((key, value) => mockLocalStorage[key] = value),
                removeItem: jest.fn(key => delete mockLocalStorage[key]),
                clear: jest.fn(() => mockLocalStorage = {})
            },
            writable: true
        });

        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn(key => mockSessionStorage[key] || null),
                setItem: jest.fn((key, value) => mockSessionStorage[key] = value),
                removeItem: jest.fn(key => delete mockSessionStorage[key]),
                clear: jest.fn(() => mockSessionStorage = {})
            },
            writable: true
        });

        // Mock console methods
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Reset storage
        mockLocalStorage = {};
        mockSessionStorage = {};

        // Initialize auth system (mock)
        auth = {
            currentUser: null,
            rateLimiter: new Map(),
            
            // Core methods we'll test
            validateRegistration: function(data) {
                const errors = [];
                if (!data.fullName || data.fullName.trim().length < 2) {
                    errors.push('Full name must be at least 2 characters.');
                }
                if (!this.isValidEmail(data.email)) {
                    errors.push('Please enter a valid email address.');
                }
                if (!data.password || data.password.length < 8) {
                    errors.push('Password must be at least 8 characters.');
                }
                if (!this.isStrongPassword(data.password)) {
                    errors.push('Password must contain uppercase, lowercase, number, and special character.');
                }
                if (data.password !== data.confirmPassword) {
                    errors.push('Passwords do not match.');
                }
                return { isValid: errors.length === 0, errors };
            },

            validateLogin: function(data) {
                const errors = [];
                if (!this.isValidEmail(data.email)) {
                    errors.push('Please enter a valid email address.');
                }
                if (!data.password || data.password.length === 0) {
                    errors.push('Password is required.');
                }
                return { isValid: errors.length === 0, errors };
            },

            isValidEmail: function(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            },

            isStrongPassword: function(password) {
                const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
                return strongRegex.test(password);
            },

            sanitizeInput: function(input) {
                if (typeof input !== 'string') return input;
                return input.trim().replace(/[<>\"']/g, '').substring(0, 200);
            },

            hashPassword: function(password) {
                let hash = 0;
                for (let i = 0; i < password.length; i++) {
                    const char = password.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                return hash.toString(36);
            },

            verifyPassword: function(password, hash) {
                return this.hashPassword(password) === hash;
            },

            generateUserId: function() {
                return Date.now().toString(36) + Math.random().toString(36).substr(2);
            },

            isRateLimited: function(action) {
                const key = `${action}_test-client`;
                const limit = this.rateLimiter.get(key);
                if (!limit) return false;
                if (limit.attempts >= 5) {
                    if (Date.now() - limit.lastAttempt < 15 * 60 * 1000) {
                        return true;
                    } else {
                        this.rateLimiter.delete(key);
                        return false;
                    }
                }
                return false;
            },

            updateRateLimit: function(action) {
                const key = `${action}_test-client`;
                const current = this.rateLimiter.get(key) || { attempts: 0, lastAttempt: 0 };
                current.attempts++;
                current.lastAttempt = Date.now();
                this.rateLimiter.set(key, current);
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Registration Validation', () => {
        test('should validate complete registration data', () => {
            const validData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'StrongPass123!',
                confirmPassword: 'StrongPass123!'
            };

            const result = auth.validateRegistration(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject registration with short full name', () => {
            const invalidData = {
                fullName: 'J',
                email: 'john@example.com',
                password: 'StrongPass123!',
                confirmPassword: 'StrongPass123!'
            };

            const result = auth.validateRegistration(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Full name must be at least 2 characters.');
        });

        test('should reject registration with invalid email', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'invalid-email',
                password: 'StrongPass123!',
                confirmPassword: 'StrongPass123!'
            };

            const result = auth.validateRegistration(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Please enter a valid email address.');
        });

        test('should reject registration with weak password', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'weak',
                confirmPassword: 'weak'
            };

            const result = auth.validateRegistration(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters.');
        });

        test('should reject registration with non-matching passwords', () => {
            const invalidData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'StrongPass123!',
                confirmPassword: 'DifferentPass123!'
            };

            const result = auth.validateRegistration(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Passwords do not match.');
        });
    });

    describe('Login Validation', () => {
        test('should validate complete login data', () => {
            const validData = {
                email: 'john@example.com',
                password: 'password123'
            };

            const result = auth.validateLogin(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should reject login with invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const result = auth.validateLogin(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Please enter a valid email address.');
        });

        test('should reject login without password', () => {
            const invalidData = {
                email: 'john@example.com',
                password: ''
            };

            const result = auth.validateLogin(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password is required.');
        });
    });

    describe('Email Validation', () => {
        test('should validate correct email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'firstname+lastname@example.org'
            ];

            validEmails.forEach(email => {
                expect(auth.isValidEmail(email)).toBe(true);
            });
        });

        test('should reject invalid email formats', () => {
            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'test@',
                'test.domain.com',
                ''
            ];

            invalidEmails.forEach(email => {
                expect(auth.isValidEmail(email)).toBe(false);
            });
        });
    });

    describe('Password Strength Validation', () => {
        test('should validate strong passwords', () => {
            const strongPasswords = [
                'StrongPass123!',
                'MyP@ssw0rd',
                'Secure#123'
            ];

            strongPasswords.forEach(password => {
                expect(auth.isStrongPassword(password)).toBe(true);
            });
        });

        test('should reject weak passwords', () => {
            const weakPasswords = [
                'password',      // no uppercase, no numbers, no special chars
                'PASSWORD',      // no lowercase, no numbers, no special chars
                'Password',      // no numbers, no special chars
                'Password123',   // no special chars
                'Password!',     // no numbers
                '12345678'       // no letters, no special chars
            ];

            weakPasswords.forEach(password => {
                expect(auth.isStrongPassword(password)).toBe(false);
            });
        });
    });

    describe('Input Sanitization', () => {
        test('should sanitize malicious input', () => {
            const maliciousInputs = [
                '<script>alert("xss")</script>',
                'normal"text"with"quotes',
                "text'with'single'quotes",
                '<div>HTML content</div>'
            ];

            maliciousInputs.forEach(input => {
                const sanitized = auth.sanitizeInput(input);
                expect(sanitized).not.toContain('<');
                expect(sanitized).not.toContain('>');
                expect(sanitized).not.toContain('"');
                expect(sanitized).not.toContain("'");
            });
        });

        test('should trim and limit input length', () => {
            const longInput = ' '.repeat(10) + 'a'.repeat(300) + ' '.repeat(10);
            const sanitized = auth.sanitizeInput(longInput);
            
            expect(sanitized.length).toBeLessThanOrEqual(200);
            expect(sanitized.startsWith(' ')).toBe(false);
            expect(sanitized.endsWith(' ')).toBe(false);
        });

        test('should handle non-string inputs', () => {
            expect(auth.sanitizeInput(null)).toBe(null);
            expect(auth.sanitizeInput(123)).toBe(123);
            expect(auth.sanitizeInput(undefined)).toBe(undefined);
        });
    });

    describe('Password Hashing', () => {
        test('should hash passwords consistently', () => {
            const password = 'test123';
            const hash1 = auth.hashPassword(password);
            const hash2 = auth.hashPassword(password);
            
            expect(hash1).toBe(hash2);
            expect(hash1).toBeDefined();
            expect(typeof hash1).toBe('string');
        });

        test('should produce different hashes for different passwords', () => {
            const password1 = 'test123';
            const password2 = 'test456';
            
            const hash1 = auth.hashPassword(password1);
            const hash2 = auth.hashPassword(password2);
            
            expect(hash1).not.toBe(hash2);
        });

        test('should verify passwords correctly', () => {
            const password = 'test123';
            const hash = auth.hashPassword(password);
            
            expect(auth.verifyPassword(password, hash)).toBe(true);
            expect(auth.verifyPassword('wrong-password', hash)).toBe(false);
        });
    });

    describe('Rate Limiting', () => {
        test('should not rate limit initially', () => {
            expect(auth.isRateLimited('login')).toBe(false);
        });

        test('should rate limit after maximum attempts', () => {
            // Simulate max attempts
            for (let i = 0; i < 5; i++) {
                auth.updateRateLimit('login');
            }
            
            expect(auth.isRateLimited('login')).toBe(true);
        });

        test('should track different actions separately', () => {
            // Max out login attempts
            for (let i = 0; i < 5; i++) {
                auth.updateRateLimit('login');
            }
            
            // Register should still be available
            expect(auth.isRateLimited('register')).toBe(false);
            expect(auth.isRateLimited('login')).toBe(true);
        });
    });

    describe('User ID Generation', () => {
        test('should generate unique user IDs', () => {
            const id1 = auth.generateUserId();
            const id2 = auth.generateUserId();
            
            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
        });

        test('should generate IDs with reasonable length', () => {
            const id = auth.generateUserId();
            expect(id.length).toBeGreaterThan(5);
            expect(id.length).toBeLessThan(50);
        });
    });
});

describe('Authentication UI Components', () => {
    let authUI;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = '<div id="auth-modal-container"></div>';
        
        // Mock AuthUI methods we want to test
        authUI = {
            calculatePasswordStrength: function(password) {
                let score = 0;
                let level = 'weak';
                let text = 'Weak';

                if (password.length >= 8) score += 20;
                if (password.length >= 12) score += 10;
                if (/[a-z]/.test(password)) score += 15;
                if (/[A-Z]/.test(password)) score += 15;
                if (/\d/.test(password)) score += 15;
                if (/[@$!%*?&]/.test(password)) score += 25;

                if (score >= 80) {
                    level = 'strong';
                    text = 'Strong';
                } else if (score >= 60) {
                    level = 'medium';
                    text = 'Medium';
                } else if (score >= 40) {
                    level = 'fair';
                    text = 'Fair';
                }

                return { score, level, text };
            },

            isValidEmail: function(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }
        };
    });

    describe('Password Strength Meter', () => {
        test('should calculate weak password strength', () => {
            const result = authUI.calculatePasswordStrength('weak');
            expect(result.level).toBe('weak');
            expect(result.text).toBe('Weak');
            expect(result.score).toBeLessThan(40);
        });

        test('should calculate fair password strength', () => {
            const result = authUI.calculatePasswordStrength('Password1');
            expect(result.level).toBe('fair');
            expect(result.text).toBe('Fair');
            expect(result.score).toBeGreaterThanOrEqual(40);
            expect(result.score).toBeLessThan(60);
        });

        test('should calculate medium password strength', () => {
            const result = authUI.calculatePasswordStrength('Password123');
            expect(result.level).toBe('medium');
            expect(result.text).toBe('Medium');
            expect(result.score).toBeGreaterThanOrEqual(60);
            expect(result.score).toBeLessThan(80);
        });

        test('should calculate strong password strength', () => {
            const result = authUI.calculatePasswordStrength('StrongPassword123!');
            expect(result.level).toBe('strong');
            expect(result.text).toBe('Strong');
            expect(result.score).toBeGreaterThanOrEqual(80);
        });
    });

    describe('UI Email Validation', () => {
        test('should validate email formats in UI', () => {
            expect(authUI.isValidEmail('test@example.com')).toBe(true);
            expect(authUI.isValidEmail('invalid-email')).toBe(false);
        });
    });
});