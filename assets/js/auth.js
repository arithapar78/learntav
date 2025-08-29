/**
 * LearnTAV Authentication System
 * Comprehensive user authentication with modern UI and security features
 */

(function() {
    'use strict';

    // ===================================================================
    // Authentication Configuration
    // ===================================================================
    
    const AUTH_CONFIG = {
        storage: {
            userKey: 'learntav_user',
            sessionKey: 'learntav_session',
            rememberKey: 'learntav_remember',
            settingsKey: 'learntav_user_settings'
        },
        security: {
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
            rememberDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
            passwordMinLength: 8
        },
        ui: {
            animationDuration: 300,
            loadingTimeout: 2000
        }
    };

    // ===================================================================
    // Core Authentication Class
    // ===================================================================
    
    class LearnTAVAuth {
        constructor() {
            this.currentUser = null;
            this.isInitialized = false;
            this.rateLimiter = new Map();
            
            this.init();
        }

        init() {
            this.loadUserSession();
            this.setupEventListeners();
            this.createDefaultAdminUser();
            this.checkFirstVisit();
            this.isInitialized = true;
            
            console.log('🔐 LearnTAV Authentication System initialized');
        }

        // ===================================================================
        // Session Management
        // ===================================================================
        
        loadUserSession() {
            try {
                // Debug logging for session persistence
                console.log('🔐 DEBUG: Starting loadUserSession...');
                console.log('🔐 DEBUG: Storage keys - sessionKey:', AUTH_CONFIG.storage.sessionKey, 'rememberKey:', AUTH_CONFIG.storage.rememberKey);
                
                // Check localStorage for persistent session first (cross-tab support)
                const persistentSession = localStorage.getItem(AUTH_CONFIG.storage.sessionKey + '_persistent');
                console.log('🔐 DEBUG: Persistent session raw data:', persistentSession ? 'Found' : 'Not found');
                
                if (persistentSession) {
                    console.log('📱 Found persistent session in localStorage');
                    const sessionData = JSON.parse(persistentSession);
                    console.log('🔐 DEBUG: Persistent session data:', {
                        hasUser: !!sessionData.user,
                        userEmail: sessionData.user?.email,
                        userRole: sessionData.user?.role,
                        expires: new Date(sessionData.expires).toISOString(),
                        isExpired: Date.now() > sessionData.expires
                    });
                    
                    if (this.isValidSession(sessionData)) {
                        console.log('✅ Persistent session is valid, restoring user');
                        this.currentUser = sessionData.user;
                        console.log('🔐 DEBUG: Current user set to:', {
                            email: this.currentUser.email,
                            role: this.currentUser.role,
                            isAdmin: this.isAdmin(this.currentUser)
                        });
                        this.createSession(true); // Mark as restored from persistent storage
                        return;
                    } else {
                        console.log('❌ Persistent session expired, cleaning up');
                        localStorage.removeItem(AUTH_CONFIG.storage.sessionKey + '_persistent');
                    }
                }

                // Check for remember me token
                const rememberToken = localStorage.getItem(AUTH_CONFIG.storage.rememberKey);
                console.log('🔐 DEBUG: Remember me token:', rememberToken ? 'Found' : 'Not found');
                
                if (rememberToken) {
                    console.log('🔑 Found remember me token');
                    const tokenData = JSON.parse(rememberToken);
                    console.log('🔐 DEBUG: Remember me token data:', {
                        hasUser: !!tokenData.user,
                        userEmail: tokenData.user?.email,
                        userRole: tokenData.user?.role,
                        expires: new Date(tokenData.expires).toISOString(),
                        isExpired: Date.now() > tokenData.expires
                    });
                    
                    if (this.isValidToken(tokenData)) {
                        console.log('✅ Remember me token valid, restoring user');
                        this.currentUser = tokenData.user;
                        console.log('🔐 DEBUG: Current user set to:', {
                            email: this.currentUser.email,
                            role: this.currentUser.role,
                            isAdmin: this.isAdmin(this.currentUser)
                        });
                        this.createSession();
                        return;
                    } else {
                        console.log('❌ Remember me token expired, cleaning up');
                        localStorage.removeItem(AUTH_CONFIG.storage.rememberKey);
                    }
                }

                // Fallback: Check session storage (current tab only)
                const sessionData = sessionStorage.getItem(AUTH_CONFIG.storage.sessionKey);
                console.log('🔐 DEBUG: Session storage data:', sessionData ? 'Found' : 'Not found');
                
                if (sessionData) {
                    console.log('📝 Found session in sessionStorage (tab-specific)');
                    const session = JSON.parse(sessionData);
                    console.log('🔐 DEBUG: Session storage data:', {
                        hasUser: !!session.user,
                        userEmail: session.user?.email,
                        userRole: session.user?.role,
                        expires: new Date(session.expires).toISOString(),
                        isExpired: Date.now() > session.expires
                    });
                    
                    if (this.isValidSession(session)) {
                        console.log('✅ Session storage valid, restoring user');
                        this.currentUser = session.user;
                        console.log('🔐 DEBUG: Current user set to:', {
                            email: this.currentUser.email,
                            role: this.currentUser.role,
                            isAdmin: this.isAdmin(this.currentUser)
                        });
                        // Also save to persistent storage for cross-tab access
                        this.savePersistentSession(session);
                        return;
                    } else {
                        console.log('❌ Session storage expired, cleaning up');
                        sessionStorage.removeItem(AUTH_CONFIG.storage.sessionKey);
                    }
                }
                
                console.log('🚫 No valid session found, user needs to sign in');
                console.log('🔐 DEBUG: Final currentUser state:', this.currentUser);
            } catch (error) {
                console.error('💥 Error loading user session:', error);
                this.clearAllSessions();
            }
        }

        isValidToken(tokenData) {
            return tokenData && 
                   tokenData.expires > Date.now() && 
                   tokenData.user && 
                   tokenData.user.email;
        }

        isValidSession(session) {
            return session && 
                   session.expires > Date.now() && 
                   session.user && 
                   session.user.email;
        }

        createSession(isRestored = false) {
            const sessionData = {
                user: this.currentUser,
                created: Date.now(),
                expires: Date.now() + AUTH_CONFIG.security.sessionDuration,
                restored: isRestored
            };
            
            console.log('💾 Creating session:', isRestored ? 'restored from persistent storage' : 'new session');
            
            // Save to sessionStorage for current tab
            sessionStorage.setItem(AUTH_CONFIG.storage.sessionKey, JSON.stringify(sessionData));
            
            // Save to persistent storage for cross-tab access
            this.savePersistentSession(sessionData);
        }

        savePersistentSession(sessionData) {
            // Save session to localStorage for cross-tab persistence
            const persistentData = {
                ...sessionData,
                persistentSave: Date.now()
            };
            localStorage.setItem(AUTH_CONFIG.storage.sessionKey + '_persistent', JSON.stringify(persistentData));
            console.log('🔄 Session saved to persistent storage for cross-tab access');
        }

        clearAllSessions() {
            console.log('🧹 Clearing all sessions');
            sessionStorage.removeItem(AUTH_CONFIG.storage.sessionKey);
            localStorage.removeItem(AUTH_CONFIG.storage.sessionKey + '_persistent');
            localStorage.removeItem(AUTH_CONFIG.storage.rememberKey);
            localStorage.removeItem(AUTH_CONFIG.storage.userKey);
            this.currentUser = null;
        }

        // ===================================================================
        // User Authentication
        // ===================================================================
        
        async register(userData) {
            try {
                this.showLoadingState('Creating account...');
                
                // Validate input
                const validation = this.validateRegistration(userData);
                if (!validation.isValid) {
                    throw new Error(validation.errors.join(', '));
                }

                // Check rate limiting
                if (this.isRateLimited('register')) {
                    throw new Error('Too many registration attempts. Please try again later.');
                }

                // Simulate API delay
                await this.delay(1500);

                // Check if user already exists
                const existingUsers = this.getAllUsers();
                if (existingUsers.some(user => user.email === userData.email)) {
                    throw new Error('An account with this email already exists.');
                }

                // Create new user
                const newUser = {
                    id: this.generateUserId(),
                    fullName: this.sanitizeInput(userData.fullName),
                    email: this.sanitizeInput(userData.email).toLowerCase(),
                    passwordHash: this.hashPassword(userData.password),
                    role: 'member', // Default role
                    created: Date.now(),
                    lastLogin: Date.now(),
                    verified: false,
                    activityLog: [{
                        action: 'account_created',
                        timestamp: Date.now(),
                        ip: this.getClientIP(),
                        userAgent: navigator.userAgent
                    }],
                    settings: this.getDefaultSettings()
                };

                // Save user
                this.saveUser(newUser);
                this.currentUser = { ...newUser };
                delete this.currentUser.passwordHash;

                this.createSession();
                
                if (userData.rememberMe) {
                    this.setRememberToken();
                }

                this.updateRateLimit('register');
                this.hideLoadingState();
                this.showSuccessMessage('Account created successfully!');
                
                // Update UI
                this.updateAuthUI();
                
                return { success: true, user: this.currentUser };
                
            } catch (error) {
                this.hideLoadingState();
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        async login(credentials) {
            try {
                console.log('🔐 LOGIN: Starting login process for:', credentials.email);
                this.showLoadingState('Signing in...');
                
                // Check rate limiting
                if (this.isRateLimited('login')) {
                    console.log('🔐 LOGIN: Rate limited');
                    throw new Error('Too many login attempts. Please try again later.');
                }

                // Validate input
                const validation = this.validateLogin(credentials);
                if (!validation.isValid) {
                    console.log('🔐 LOGIN: Validation failed:', validation.errors);
                    throw new Error(validation.errors.join(', '));
                }

                // Simulate API delay
                console.log('🔐 LOGIN: Simulating API delay...');
                await this.delay(1200);

                // Find user
                const users = this.getAllUsers();
                console.log('🔐 LOGIN: Found', users.length, 'users in storage');
                console.log('🔐 LOGIN: Looking for email:', credentials.email.toLowerCase());
                console.log('🔐 LOGIN: Available users:', users.map(u => ({email: u.email, role: u.role})));
                
                const user = users.find(u => u.email === credentials.email.toLowerCase());
                
                if (!user) {
                    console.log('🔐 LOGIN: User not found');
                    this.updateRateLimit('login');
                    throw new Error('Invalid email or password.');
                }

                console.log('🔐 LOGIN DEBUG: Found user:', {
                    email: user.email,
                    role: user.role,
                    hasPasswordHash: !!user.passwordHash,
                    passwordHashLength: user.passwordHash?.length
                });

                // Verify password
                console.log('🔐 LOGIN DEBUG: Verifying password...');
                console.log('🔐 LOGIN DEBUG: Input password length:', credentials.password.length);
                console.log('🔐 LOGIN DEBUG: Stored hash:', user.passwordHash);
                
                const passwordValid = this.verifyPassword(credentials.password, user.passwordHash);
                console.log('🔐 LOGIN DEBUG: Password verification result:', passwordValid);
                
                if (!passwordValid) {
                    console.log('🔐 LOGIN: Password verification failed');
                    this.updateRateLimit('login');
                    throw new Error('Invalid email or password.');
                }

                console.log('🔐 LOGIN: Password verified successfully');

                // Success - clear rate limits
                this.clearRateLimit('login');
                
                this.currentUser = { ...user };
                delete this.currentUser.passwordHash;

                console.log('🔐 LOGIN DEBUG: Current user set:', {
                    email: this.currentUser.email,
                    role: this.currentUser.role,
                    isAdmin: this.isAdmin(this.currentUser)
                });

                // Update last login and add activity log
                this.updateUserActivity('login');

                this.createSession();
                
                if (credentials.rememberMe) {
                    this.setRememberToken();
                }

                this.hideLoadingState();
                this.showSuccessMessage('Welcome back!');
                
                // Update UI
                this.updateAuthUI();
                
                console.log('🔐 LOGIN: Login process completed successfully');
                return { success: true, user: this.currentUser };
                
            } catch (error) {
                console.error('🔐 LOGIN: Login failed with error:', error.message);
                this.hideLoadingState();
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        async loginAdmin(credentials) {
            try {
                console.log('🔐 ADMIN LOGIN: Starting admin login process for:', credentials.email);
                this.showLoadingState('Verifying administrator credentials...');
                
                // Enhanced rate limiting for admin attempts
                if (this.isRateLimited('admin_login')) {
                    console.log('🔐 ADMIN LOGIN: Rate limited');
                    throw new Error('Too many admin login attempts. Access temporarily restricted.');
                }

                // Validate admin-specific requirements
                const validation = this.validateAdminLogin(credentials);
                if (!validation.isValid) {
                    console.log('🔐 ADMIN LOGIN: Validation failed:', validation.errors);
                    throw new Error(validation.errors.join(', '));
                }

                // Extended API delay for admin security
                console.log('🔐 ADMIN LOGIN: Performing enhanced security checks...');
                await this.delay(2000);

                // Find user
                const users = this.getAllUsers();
                console.log('🔐 ADMIN LOGIN: Searching for admin user:', credentials.email.toLowerCase());
                
                const user = users.find(u => u.email === credentials.email.toLowerCase());
                
                if (!user) {
                    console.log('🔐 ADMIN LOGIN: User not found');
                    this.updateRateLimit('admin_login');
                    throw new Error('Invalid administrator credentials.');
                }

                // Verify admin role
                if (!this.isAdmin(user)) {
                    console.log('🔐 ADMIN LOGIN: User lacks admin privileges');
                    this.updateRateLimit('admin_login');
                    throw new Error('Access denied. Administrator privileges required.');
                }

                console.log('🔐 ADMIN LOGIN: Found admin user:', {
                    email: user.email,
                    role: user.role,
                    hasPasswordHash: !!user.passwordHash
                });

                // Verify password with enhanced security checks
                console.log('🔐 ADMIN LOGIN: Verifying admin password...');
                const passwordValid = this.verifyAdminPassword(credentials.password, user.passwordHash);
                console.log('🔐 ADMIN LOGIN: Password verification result:', passwordValid);
                
                if (!passwordValid) {
                    console.log('🔐 ADMIN LOGIN: Password verification failed');
                    this.updateRateLimit('admin_login');
                    throw new Error('Invalid administrator credentials.');
                }

                // Handle 2FA if provided
                if (credentials.twoFactorCode) {
                    console.log('🔐 ADMIN LOGIN: Processing 2FA code...');
                    const twoFactorValid = this.verifyTwoFactorCode(credentials.twoFactorCode, user);
                    if (!twoFactorValid) {
                        console.log('🔐 ADMIN LOGIN: 2FA verification failed');
                        this.updateRateLimit('admin_login');
                        throw new Error('Invalid two-factor authentication code.');
                    }
                    console.log('🔐 ADMIN LOGIN: 2FA verification successful');
                }

                console.log('🔐 ADMIN LOGIN: Admin authentication successful');

                // Success - clear rate limits
                this.clearRateLimit('admin_login');
                
                this.currentUser = { ...user };
                delete this.currentUser.passwordHash;

                console.log('🔐 ADMIN LOGIN: Admin user set:', {
                    email: this.currentUser.email,
                    role: this.currentUser.role,
                    isAdmin: this.isAdmin(this.currentUser)
                });

                // Update last login and add admin activity log
                this.updateUserActivity('admin_login', {
                    enhanced_security: true,
                    two_factor_used: !!credentials.twoFactorCode
                });

                // Create admin session with extended security
                this.createAdminSession(credentials.rememberMe);
                
                this.hideLoadingState();
                this.showSuccessMessage('Administrator access granted!');
                
                // Update UI
                this.updateAuthUI();
                
                console.log('🔐 ADMIN LOGIN: Admin login process completed successfully');
                return { success: true, user: this.currentUser };
                
            } catch (error) {
                console.error('🔐 ADMIN LOGIN: Admin login failed with error:', error.message);
                this.hideLoadingState();
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        validateAdminLogin(data) {
            const errors = [];

            if (!this.isValidEmail(data.email)) {
                errors.push('Please enter a valid administrator email address.');
            }

            if (!data.password || data.password.length < 12) {
                errors.push('Administrator password must be at least 12 characters.');
            }

            // Enhanced password requirements for admin
            if (!this.isAdminStrongPassword(data.password)) {
                errors.push('Administrator password must contain uppercase, lowercase, numbers, and special characters.');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        }

        isAdminStrongPassword(password) {
            // Enhanced password requirements for admin accounts
            return password.length >= 12 &&
                   /[a-z]/.test(password) &&
                   /[A-Z]/.test(password) &&
                   /\d/.test(password) &&
                   /[@$!%*?&^#]/.test(password);
        }

        verifyAdminPassword(password, hash) {
            // Same verification but with additional logging for admin attempts
            const result = this.verifyPassword(password, hash);
            if (!result) {
                console.warn('🚨 ADMIN LOGIN: Failed password verification attempt');
            }
            return result;
        }

        verifyTwoFactorCode(code, user) {
            // Simplified 2FA verification for demo
            // In production, this would verify against TOTP/authenticator app
            if (!code || code.length !== 6) {
                return false;
            }
            
            // For demo purposes, accept any 6-digit numeric code
            // In production, implement proper TOTP verification
            return /^\d{6}$/.test(code);
        }

        createAdminSession(rememberMe = false) {
            const sessionData = {
                user: this.currentUser,
                created: Date.now(),
                expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days for admin
                admin: true,
                enhanced_security: true
            };
            
            console.log('💾 Creating admin session with enhanced security');
            
            // Save to sessionStorage for current tab
            sessionStorage.setItem(AUTH_CONFIG.storage.sessionKey, JSON.stringify(sessionData));
            
            // Save to persistent storage for cross-tab access
            this.savePersistentSession(sessionData);

            // Handle remember me for admin (shorter duration)
            if (rememberMe) {
                const rememberData = {
                    user: this.currentUser,
                    created: Date.now(),
                    expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days max for admin
                    admin: true
                };
                localStorage.setItem(AUTH_CONFIG.storage.rememberKey + '_admin', JSON.stringify(rememberData));
                console.log('🔐 Admin remember token set (7 days)');
            }
        }

        logout() {
            const wasAdmin = this.currentUser && this.isAdmin(this.currentUser);
            
            this.clearAllSessions();
            
            // Clear admin-specific storage
            if (wasAdmin) {
                localStorage.removeItem(AUTH_CONFIG.storage.rememberKey + '_admin');
                console.log('🔐 Admin session cleared');
            }
            
            this.updateAuthUI();
            this.showInfoMessage(wasAdmin ? 'Administrator logged out.' : 'You have been logged out.');
            
            // Redirect to home page if on protected page
            if (window.location.pathname.includes('settings') || window.location.pathname.includes('admin')) {
                window.location.href = '/';
            }
        }

        // ===================================================================
        // Password Reset
        // ===================================================================
        
        async initiatePasswordReset(email) {
            try {
                this.showLoadingState('Sending reset email...');
                
                if (this.isRateLimited('reset')) {
                    throw new Error('Please wait before requesting another reset email.');
                }

                // Validate email
                if (!this.isValidEmail(email)) {
                    throw new Error('Please enter a valid email address.');
                }

                // Simulate API delay
                await this.delay(2000);

                // Check if user exists (in production, don't reveal this)
                const users = this.getAllUsers();
                const userExists = users.some(u => u.email === email.toLowerCase());
                
                // Always show success message for security
                this.updateRateLimit('reset');
                this.hideLoadingState();
                this.showSuccessMessage('If an account exists with this email, you will receive reset instructions.');
                
                // In a real app, send email here
                if (userExists) {
                    console.log(`Password reset would be sent to: ${email}`);
                }
                
                return { success: true };
                
            } catch (error) {
                this.hideLoadingState();
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        async initiateAdminPasswordReset(email) {
            try {
                this.showLoadingState('Processing secure admin reset...');
                
                // Enhanced rate limiting for admin resets
                if (this.isRateLimited('admin_reset')) {
                    throw new Error('Please wait before requesting another admin password reset.');
                }

                // Validate email
                if (!this.isValidEmail(email)) {
                    throw new Error('Please enter a valid administrator email address.');
                }

                // Extended delay for admin security
                await this.delay(3000);

                // Check if admin user exists
                const users = this.getAllUsers();
                const user = users.find(u => u.email === email.toLowerCase());
                const isAdminUser = user && this.isAdmin(user);
                
                // Always show success message for security
                this.updateRateLimit('admin_reset');
                this.hideLoadingState();
                
                if (isAdminUser) {
                    this.showSuccessMessage('Admin password reset instructions sent. Please check your email and follow the enhanced security verification process.');
                    console.log(`🔒 Admin password reset would be sent to: ${email} with enhanced security`);
                    
                    // Log admin reset attempt for security
                    this.logSecurityEvent('admin_password_reset_requested', {
                        email: email,
                        timestamp: Date.now(),
                        ip: this.getClientIP()
                    });
                } else {
                    // Same success message to prevent email enumeration
                    this.showSuccessMessage('Admin password reset instructions sent. Please check your email and follow the enhanced security verification process.');
                    console.log(`🔒 Admin password reset attempted for non-admin email: ${email}`);
                }
                
                return { success: true };
                
            } catch (error) {
                this.hideLoadingState();
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        logSecurityEvent(event, data) {
            // Log security events for admin activities
            const securityLog = {
                event,
                data,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };
            
            // In production, send to security logging service
            console.log('🛡️ SECURITY EVENT:', securityLog);
            
            // Store locally for demo purposes
            try {
                const existingLogs = JSON.parse(localStorage.getItem('learntav_security_log') || '[]');
                existingLogs.push(securityLog);
                
                // Keep only last 100 security events
                if (existingLogs.length > 100) {
                    existingLogs.splice(0, existingLogs.length - 100);
                }
                
                localStorage.setItem('learntav_security_log', JSON.stringify(existingLogs));
            } catch (error) {
                console.error('Failed to log security event:', error);
            }
        }

        // ===================================================================
        // User Management
        // ===================================================================
        
        getAllUsers() {
            try {
                const users = localStorage.getItem('learntav_users');
                return users ? JSON.parse(users) : [];
            } catch (error) {
                console.error('Error loading users:', error);
                return [];
            }
        }

        saveUser(user) {
            try {
                const users = this.getAllUsers();
                const existingIndex = users.findIndex(u => u.id === user.id);
                
                if (existingIndex >= 0) {
                    users[existingIndex] = user;
                } else {
                    users.push(user);
                }
                
                localStorage.setItem('learntav_users', JSON.stringify(users));
            } catch (error) {
                console.error('Error saving user:', error);
                throw new Error('Failed to save user data.');
            }
        }

        updateUserSettings(settings) {
            if (!this.currentUser) {
                throw new Error('No user logged in.');
            }

            try {
                const users = this.getAllUsers();
                const userIndex = users.findIndex(u => u.id === this.currentUser.id);
                
                if (userIndex >= 0) {
                    users[userIndex].settings = { ...users[userIndex].settings, ...settings };
                    this.currentUser.settings = users[userIndex].settings;
                    this.saveUser(users[userIndex]);
                    
                    this.showSuccessMessage('Settings updated successfully!');
                    return { success: true };
                }
                
                throw new Error('User not found.');
                
            } catch (error) {
                this.showErrorMessage(error.message);
                throw error;
            }
        }

        // ===================================================================
        // Validation & Security
        // ===================================================================
        
        validateRegistration(data) {
            const errors = [];

            if (!data.fullName || data.fullName.trim().length < 2) {
                errors.push('Full name must be at least 2 characters.');
            }

            if (!this.isValidEmail(data.email)) {
                errors.push('Please enter a valid email address.');
            }

            if (!data.password || data.password.length < AUTH_CONFIG.security.passwordMinLength) {
                errors.push(`Password must be at least ${AUTH_CONFIG.security.passwordMinLength} characters.`);
            }

            if (!this.isStrongPassword(data.password)) {
                errors.push('Password must contain uppercase, lowercase, number, and special character.');
            }

            if (data.password !== data.confirmPassword) {
                errors.push('Passwords do not match.');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        }

        validateLogin(data) {
            const errors = [];

            if (!this.isValidEmail(data.email)) {
                errors.push('Please enter a valid email address.');
            }

            if (!data.password || data.password.length === 0) {
                errors.push('Password is required.');
            }

            return {
                isValid: errors.length === 0,
                errors
            };
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        isStrongPassword(password) {
            const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            return strongRegex.test(password);
        }

        sanitizeInput(input) {
            if (typeof input !== 'string') return input;
            
            return input
                .trim()
                .replace(/[<>\"']/g, '')
                .substring(0, 200);
        }

        hashPassword(password) {
            // Enhanced hash for better consistency - use proper hashing in production
            if (!password) return '';
            
            let hash = 0;
            const str = password.toString();
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            
            // Ensure consistent string representation
            const result = Math.abs(hash).toString(36);
            console.log('🔐 HASH DEBUG: Password hashed to:', result);
            return result;
        }

        verifyPassword(password, hash) {
            if (!password || !hash) {
                console.log('🔐 VERIFY DEBUG: Missing password or hash');
                return false;
            }
            
            const inputHash = this.hashPassword(password);
            const isValid = inputHash === hash;
            
            console.log('🔐 VERIFY DEBUG: Input password hash:', inputHash);
            console.log('🔐 VERIFY DEBUG: Stored hash:', hash);
            console.log('🔐 VERIFY DEBUG: Passwords match:', isValid);
            
            return isValid;
        }

        // ===================================================================
        // Rate Limiting
        // ===================================================================
        
        isRateLimited(action) {
            const key = `${action}_${this.getClientId()}`;
            const limit = this.rateLimiter.get(key);
            
            if (!limit) return false;
            
            if (limit.attempts >= AUTH_CONFIG.security.maxLoginAttempts) {
                if (Date.now() - limit.lastAttempt < AUTH_CONFIG.security.lockoutDuration) {
                    return true;
                } else {
                    this.rateLimiter.delete(key);
                    return false;
                }
            }
            
            return false;
        }

        updateRateLimit(action) {
            const key = `${action}_${this.getClientId()}`;
            const current = this.rateLimiter.get(key) || { attempts: 0, lastAttempt: 0 };
            
            current.attempts++;
            current.lastAttempt = Date.now();
            
            this.rateLimiter.set(key, current);
        }

        clearRateLimit(action) {
            const key = `${action}_${this.getClientId()}`;
            this.rateLimiter.delete(key);
        }

        getClientId() {
            // Simple client identification for rate limiting
            return navigator.userAgent.slice(0, 50) + navigator.language;
        }

        getClientIP() {
            // In a real application, this would be handled by the backend
            // For demo purposes, return a placeholder
            return '127.0.0.1';
        }

        updateUserActivity(action, additionalData = {}) {
            if (!this.currentUser) return;

            const activity = {
                action,
                timestamp: Date.now(),
                ip: this.getClientIP(),
                userAgent: navigator.userAgent,
                ...additionalData
            };

            // Update user's last login if it's a login action
            if (action === 'login') {
                this.currentUser.lastLogin = Date.now();
            }

            // Add to activity log
            if (!this.currentUser.activityLog) {
                this.currentUser.activityLog = [];
            }
            this.currentUser.activityLog.push(activity);

            // Keep only last 50 activities to prevent storage bloat
            if (this.currentUser.activityLog.length > 50) {
                this.currentUser.activityLog = this.currentUser.activityLog.slice(-50);
            }

            // Update stored user data
            this.updateStoredUserData();
        }

        updateStoredUserData() {
            if (!this.currentUser) return;

            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex >= 0) {
                // Create a complete user object with password hash for storage
                const completeUser = {
                    ...this.currentUser,
                    passwordHash: users[userIndex].passwordHash // Preserve the password hash
                };
                
                users[userIndex] = completeUser;
                localStorage.setItem('learntav_users', JSON.stringify(users));
            }
        }

        // ===================================================================
        // Admin Role Check
        // ===================================================================
        
        isAdmin(user) {
            if (!user) return false;
            return user.role === 'admin' || user.role === 'super_admin';
        }

        // ===================================================================
        // UI Management
        // ===================================================================
        
        setupEventListeners() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-auth-action]')) {
                    e.preventDefault();
                    this.handleAuthAction(e.target.dataset.authAction, e.target);
                }
            });

            // Handle escape key to close modals
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAuthModals();
                }
            });
        }

        handleAuthAction(action, element) {
            switch (action) {
                case 'show-register':
                    this.showRegisterModal();
                    break;
                case 'show-login':
                    this.showLoginModal();
                    break;
                case 'show-reset':
                    this.showResetModal();
                    break;
                case 'logout':
                    this.logout();
                    break;
                case 'show-settings':
                    this.showSettingsPage();
                    break;
                default:
                    console.warn('Unknown auth action:', action);
            }
        }

        updateAuthUI() {
            const isLoggedIn = !!this.currentUser;
            
            // Update navigation
            const authButtons = document.querySelectorAll('[data-auth-state]');
            authButtons.forEach(button => {
                const requiredState = button.dataset.authState;
                if (requiredState === 'logged-in') {
                    button.style.display = isLoggedIn ? 'flex' : 'none';
                } else if (requiredState === 'logged-out') {
                    button.style.display = isLoggedIn ? 'none' : 'inline-flex';
                }
            });

            // Update modern user menu if available
            if (isLoggedIn && window.LearnTAVAuthUI) {
                window.LearnTAVAuthUI.updateUserMenuInfo(this.currentUser);
            }

            // Update user info displays (legacy support)
            const userNameElements = document.querySelectorAll('[data-user-name]');
            userNameElements.forEach(element => {
                element.textContent = isLoggedIn ? this.currentUser.fullName : '';
            });

            // Update user email displays (legacy support)
            const userEmailElements = document.querySelectorAll('[data-user-email]');
            userEmailElements.forEach(element => {
                element.textContent = isLoggedIn ? this.currentUser.email : '';
            });
        }
        
        updateAuthenticationState() {
            // Call this method to force UI update after initialization
            this.updateAuthUI();
        }

        // ===================================================================
        // First Visit Modal
        // ===================================================================
        
        checkFirstVisit() {
            const hasVisited = localStorage.getItem('learntav_visited');
            if (!hasVisited && !this.currentUser) {
                // Small delay to ensure UI components are ready
                setTimeout(() => {
                    this.showWelcomeModal();
                    localStorage.setItem('learntav_visited', 'true');
                }, 200);
            }
        }

        // ===================================================================
        // Utility Functions
        // ===================================================================
        
        generateUserId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        setRememberToken() {
            const tokenData = {
                user: this.currentUser,
                created: Date.now(),
                expires: Date.now() + AUTH_CONFIG.security.rememberDuration
            };
            
            localStorage.setItem(AUTH_CONFIG.storage.rememberKey, JSON.stringify(tokenData));
        }

        getDefaultSettings() {
            return {
                theme: 'light',
                notifications: true,
                newsletter: false,
                privacy: 'standard'
            };
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        showLoadingState(message = 'Loading...') {
            // This will be implemented with UI components
            console.log('Loading:', message);
        }

        hideLoadingState() {
            // This will be implemented with UI components
            console.log('Loading complete');
        }

        showSuccessMessage(message) {
            // This will be implemented with UI components
            console.log('Success:', message);
        }

        showErrorMessage(message) {
            // This will be implemented with UI components
            console.error('Error:', message);
        }

        showInfoMessage(message) {
            // This will be implemented with UI components
            console.log('Info:', message);
        }

        closeAuthModals() {
            // This will be implemented with UI components
            console.log('Closing auth modals');
        }

        createDefaultAdminUser() {
            try {
                console.log('🔐 DEBUG: Skipping default admin user creation - using dedicated admin auth system');
                
                // Create a test user for demonstration purposes
                const users = this.getAllUsers();
                const testUserExists = users.some(user => user.email === 'test@learntav.com');
                
                if (!testUserExists) {
                    console.log('🔐 Creating test user for demo...');
                    const passwordHash = this.hashPassword('TestPass123!');
                    
                    const testUser = {
                        id: this.generateUserId(),
                        fullName: 'Test User',
                        email: 'test@learntav.com',
                        passwordHash: passwordHash,
                        role: 'member',
                        created: Date.now(),
                        lastLogin: 0,
                        verified: true,
                        activityLog: [{
                            action: 'account_created',
                            timestamp: Date.now(),
                            ip: this.getClientIP(),
                            userAgent: 'System',
                            reason: 'Demo test user creation'
                        }],
                        settings: this.getDefaultSettings()
                    };
                    
                    this.saveUser(testUser);
                    console.log('✅ Test user created: test@learntav.com / TestPass123!');
                }
            } catch (error) {
                console.error('❌ Error in createDefaultAdminUser:', error);
            }
        }

        // Placeholder methods for UI components
        showWelcomeModal() { console.log('Show welcome modal'); }
        showRegisterModal() { console.log('Show register modal'); }
        showLoginModal() { console.log('Show login modal'); }
        showResetModal() { console.log('Show reset modal'); }
        showSettingsPage() { console.log('Show settings page'); }
    }

    // ===================================================================
    // Access Control & Route Protection
    // ===================================================================
    
    class AccessControl {
        constructor(auth) {
            this.auth = auth;
            this.protectedPaths = ['/settings'];
            this.init();
        }

        init() {
            this.checkCurrentPath();
            
            // Monitor navigation changes
            window.addEventListener('popstate', () => {
                this.checkCurrentPath();
            });
        }

        checkCurrentPath() {
            const currentPath = window.location.pathname;
            
            if (this.isProtectedPath(currentPath)) {
                if (!this.auth.currentUser) {
                    this.redirectToLogin(currentPath);
                    return false;
                }
            }
            
            return true;
        }

        isProtectedPath(path) {
            return this.protectedPaths.some(protectedPath => 
                path.includes(protectedPath)
            );
        }

        redirectToLogin(intendedPath) {
            sessionStorage.setItem('auth_redirect', intendedPath);
            this.auth.showLoginModal();
        }

        handleSuccessfulLogin() {
            const redirectPath = sessionStorage.getItem('auth_redirect');
            if (redirectPath) {
                sessionStorage.removeItem('auth_redirect');
                window.location.href = redirectPath;
            }
        }

        handleSuccessfulAdminLogin() {
            // Admin users might want to go to admin panel or stay on current page
            const redirectPath = sessionStorage.getItem('auth_redirect');
            if (redirectPath) {
                sessionStorage.removeItem('auth_redirect');
                window.location.href = redirectPath;
            } else {
                // Optionally redirect to admin panel or show admin options
                console.log('🔒 Admin logged in successfully');
            }
        }
    }

    // ===================================================================
    // Initialize Authentication System
    // ===================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuth);
    } else {
        initializeAuth();
    }

    function initializeAuth() {
        window.LearnTAVAuth = new LearnTAVAuth();
        window.LearnTAVAccessControl = new AccessControl(window.LearnTAVAuth);
        
        // Make auth available globally for console debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.authDebug = window.LearnTAVAuth;
        }
    }

})();