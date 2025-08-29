/**
 * LearnTAV Admin Authentication System
 * Secure admin access with Username, Password, and Code verification
 */

(function() {
    'use strict';

    class AdminAuth {
        constructor() {
            // Standardized admin credentials - Fixed credential mismatch issue
            this.adminCredentials = {
                username: 'admin@learntav.com',
                password: 'AdminPass123!',
                code: '0410'
            };
            
            this.isAuthenticated = false;
            this.sessionDuration = 4 * 60 * 60 * 1000; // 4 hours
            
            this.init();
        }

        init() {
            this.checkExistingSession();
            console.log('🔐 Admin Authentication System initialized');
        }

        checkExistingSession() {
            const session = localStorage.getItem('admin_auth_session');
            if (session) {
                try {
                    const sessionData = JSON.parse(session);
                    if (sessionData.expires > Date.now()) {
                        this.isAuthenticated = true;
                        console.log('✅ Valid admin session found');
                        return true;
                    } else {
                        localStorage.removeItem('admin_auth_session');
                        console.log('⏰ Admin session expired, cleared');
                    }
                } catch (error) {
                    console.error('💥 Error parsing admin session:', error);
                    localStorage.removeItem('admin_auth_session');
                }
            }
            return false;
        }

        async authenticate(credentials) {
            console.log('🔐 ADMIN AUTH: Starting authentication...');
            
            // Validate all three required fields
            if (!credentials.username || !credentials.password || !credentials.code) {
                throw new Error('Username, Password, and Code are all required for admin access');
            }

            // Simulate processing time for security
            await this.delay(1500);

            // Verify credentials exactly
            if (credentials.username !== this.adminCredentials.username) {
                console.log('❌ ADMIN AUTH: Invalid username');
                throw new Error('Invalid admin credentials');
            }

            if (credentials.password !== this.adminCredentials.password) {
                console.log('❌ ADMIN AUTH: Invalid password');
                throw new Error('Invalid admin credentials');
            }

            if (credentials.code !== this.adminCredentials.code) {
                console.log('❌ ADMIN AUTH: Invalid code');
                throw new Error('Invalid admin credentials');
            }

            // All credentials valid
            console.log('✅ ADMIN AUTH: All credentials verified');
            this.isAuthenticated = true;
            this.createSession();
            
            return {
                success: true,
                message: 'Administrator access granted!',
                session: this.getSessionInfo()
            };
        }

        createSession() {
            const sessionData = {
                authenticated: true,
                timestamp: Date.now(),
                expires: Date.now() + this.sessionDuration,
                username: this.adminCredentials.username
            };

            localStorage.setItem('admin_auth_session', JSON.stringify(sessionData));
            console.log('💾 Admin session created');
        }

        getSessionInfo() {
            const session = localStorage.getItem('admin_auth_session');
            if (session) {
                const data = JSON.parse(session);
                return {
                    authenticated: true,
                    username: data.username,
                    expires: new Date(data.expires).toISOString()
                };
            }
            return { authenticated: false };
        }

        logout() {
            this.isAuthenticated = false;
            localStorage.removeItem('admin_auth_session');
            console.log('🔐 Admin logged out');
        }

        requireAuth() {
            if (!this.checkExistingSession()) {
                throw new Error('Admin authentication required');
            }
            return true;
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Make AdminAuth available globally
    window.LearnTAVAdminAuth = new AdminAuth();

})();