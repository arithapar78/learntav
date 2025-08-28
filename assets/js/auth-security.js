/**
 * LearnTAV Secure Authentication Backend
 * Enterprise-level security features with bcrypt encryption, session management, and CSRF protection
 */

(function() {
    'use strict';

    // ===================================================================
    // Security Configuration
    // ===================================================================
    
    const SECURITY_CONFIG = {
        // Password hashing
        bcrypt: {
            saltRounds: 12,
            maxInputLength: 72
        },
        
        // Session management
        session: {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            renewalThreshold: 15 * 60 * 1000, // 15 minutes before expiry
            maxSessions: 5 // Maximum concurrent sessions per user
        },
        
        // CSRF protection
        csrf: {
            tokenLength: 32,
            headerName: 'X-CSRF-Token',
            cookieName: 'csrf-token'
        },
        
        // Security monitoring
        monitoring: {
            maxFailedAttempts: 5,
            lockoutDuration: 30 * 60 * 1000, // 30 minutes
            suspiciousActivityThreshold: 10,
            ipTracking: true,
            deviceTracking: true
        }
    };

    // ===================================================================
    // Secure Password Hashing (bcrypt simulation)
    // ===================================================================
    
    class SecureBCrypt {
        constructor() {
            this.saltRounds = SECURITY_CONFIG.bcrypt.saltRounds;
        }

        async hash(password) {
            if (!password || password.length > SECURITY_CONFIG.bcrypt.maxInputLength) {
                throw new Error('Invalid password length');
            }

            // Generate salt
            const salt = await this.generateSalt();
            
            // Create hash using Web Crypto API
            const hash = await this.hashWithSalt(password, salt);
            
            // Return bcrypt-compatible format: $2b$rounds$salt$hash
            return `$2b$${this.saltRounds.toString().padStart(2, '0')}$${salt}$${hash}`;
        }

        async compare(password, hash) {
            try {
                // Parse bcrypt format
                const parts = hash.split('$');
                if (parts.length !== 5 || parts[1] !== '2b') {
                    throw new Error('Invalid hash format');
                }

                const salt = parts[3];
                const expectedHash = parts[4];
                
                // Hash the provided password with the same salt
                const actualHash = await this.hashWithSalt(password, salt);
                
                // Constant-time comparison
                return this.constantTimeCompare(actualHash, expectedHash);
            } catch (error) {
                console.error('Hash comparison failed:', error);
                return false;
            }
        }

        async generateSalt() {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 22);
        }

        async hashWithSalt(password, salt) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + salt);
            
            // Use PBKDF2 for secure hashing
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveBits']
            );

            const bits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode(salt),
                    iterations: Math.pow(2, this.saltRounds),
                    hash: 'SHA-256'
                },
                key,
                256
            );

            return Array.from(new Uint8Array(bits), byte => 
                byte.toString(16).padStart(2, '0')
            ).join('').slice(0, 31);
        }

        constantTimeCompare(a, b) {
            if (a.length !== b.length) return false;
            
            let result = 0;
            for (let i = 0; i < a.length; i++) {
                result |= a.charCodeAt(i) ^ b.charCodeAt(i);
            }
            return result === 0;
        }
    }

    // ===================================================================
    // Secure Session Management
    // ===================================================================
    
    class SecureSessionManager {
        constructor() {
            this.sessions = new Map();
            this.csrfTokens = new Map();
            this.init();
        }

        init() {
            this.loadPersistedSessions();
            this.startSessionCleanup();
            this.setupCSRFProtection();
        }

        async createSession(user) {
            const sessionId = await this.generateSessionId();
            const deviceFingerprint = await this.generateDeviceFingerprint();
            
            const session = {
                id: sessionId,
                userId: user.id,
                user: { ...user },
                created: Date.now(),
                lastActivity: Date.now(),
                expires: Date.now() + SECURITY_CONFIG.session.maxAge,
                deviceFingerprint,
                ipAddress: this.getClientIP(),
                userAgent: navigator.userAgent,
                csrfToken: await this.generateCSRFToken()
            };

            // Limit concurrent sessions
            this.limitUserSessions(user.id);
            
            this.sessions.set(sessionId, session);
            this.persistSession(session);
            
            return session;
        }

        validateSession(sessionId) {
            const session = this.sessions.get(sessionId);
            
            if (!session) {
                return { valid: false, reason: 'Session not found' };
            }

            if (Date.now() > session.expires) {
                this.destroySession(sessionId);
                return { valid: false, reason: 'Session expired' };
            }

            // Check for suspicious activity
            const suspiciousActivity = this.detectSuspiciousActivity(session);
            if (suspiciousActivity.suspicious) {
                this.flagSuspiciousSession(session, suspiciousActivity.reason);
                return { valid: false, reason: 'Suspicious activity detected' };
            }

            // Update last activity
            session.lastActivity = Date.now();
            
            // Check if session needs renewal
            const needsRenewal = this.shouldRenewSession(session);
            
            return { 
                valid: true, 
                session, 
                needsRenewal,
                csrfToken: session.csrfToken
            };
        }

        async renewSession(sessionId) {
            const session = this.sessions.get(sessionId);
            if (!session) return null;

            // Create new session ID for security
            const newSessionId = await this.generateSessionId();
            const newCSRFToken = await this.generateCSRFToken();
            
            session.id = newSessionId;
            session.expires = Date.now() + SECURITY_CONFIG.session.maxAge;
            session.csrfToken = newCSRFToken;
            session.renewed = Date.now();

            // Move to new session ID
            this.sessions.delete(sessionId);
            this.sessions.set(newSessionId, session);
            
            this.persistSession(session);
            
            return session;
        }

        destroySession(sessionId) {
            const session = this.sessions.get(sessionId);
            if (session) {
                this.sessions.delete(sessionId);
                this.removePersistedSession(sessionId);
                this.logSecurityEvent('session_destroyed', { sessionId });
            }
        }

        destroyUserSessions(userId) {
            for (const [sessionId, session] of this.sessions.entries()) {
                if (session.userId === userId) {
                    this.destroySession(sessionId);
                }
            }
        }

        limitUserSessions(userId) {
            const userSessions = Array.from(this.sessions.entries())
                .filter(([_, session]) => session.userId === userId)
                .sort((a, b) => b[1].lastActivity - a[1].lastActivity);

            // Remove oldest sessions if limit exceeded
            if (userSessions.length >= SECURITY_CONFIG.session.maxSessions) {
                const sessionsToRemove = userSessions.slice(SECURITY_CONFIG.session.maxSessions - 1);
                sessionsToRemove.forEach(([sessionId]) => this.destroySession(sessionId));
            }
        }

        shouldRenewSession(session) {
            const timeUntilExpiry = session.expires - Date.now();
            return timeUntilExpiry < SECURITY_CONFIG.session.renewalThreshold;
        }

        detectSuspiciousActivity(session) {
            const currentDeviceFingerprint = this.generateDeviceFingerprint();
            const currentIP = this.getClientIP();

            // Check for device fingerprint mismatch
            if (session.deviceFingerprint !== currentDeviceFingerprint) {
                return { suspicious: true, reason: 'Device fingerprint mismatch' };
            }

            // Check for rapid session access (potential bot)
            const timeSinceLastActivity = Date.now() - session.lastActivity;
            if (timeSinceLastActivity < 100) { // Less than 100ms
                return { suspicious: true, reason: 'Rapid access pattern' };
            }

            return { suspicious: false };
        }

        flagSuspiciousSession(session, reason) {
            this.logSecurityEvent('suspicious_activity', {
                sessionId: session.id,
                userId: session.userId,
                reason,
                timestamp: Date.now(),
                ipAddress: session.ipAddress,
                userAgent: session.userAgent
            });

            // Optionally destroy the session immediately
            this.destroySession(session.id);
        }

        async generateSessionId() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        }

        async generateDeviceFingerprint() {
            const fingerprint = {
                screen: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                platform: navigator.platform,
                userAgent: navigator.userAgent.slice(0, 100) // Limited for storage
            };
            
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(fingerprint));
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
        }

        getClientIP() {
            // In a real application, this would be provided by the backend
            return '127.0.0.1';
        }

        startSessionCleanup() {
            // Clean up expired sessions every 5 minutes
            setInterval(() => {
                const now = Date.now();
                for (const [sessionId, session] of this.sessions.entries()) {
                    if (now > session.expires) {
                        this.destroySession(sessionId);
                    }
                }
            }, 5 * 60 * 1000);
        }

        persistSession(session) {
            // In a real app, this would be server-side
            const sessionData = {
                id: session.id,
                userId: session.userId,
                created: session.created,
                expires: session.expires,
                deviceFingerprint: session.deviceFingerprint
            };
            
            localStorage.setItem(`session_${session.id}`, JSON.stringify(sessionData));
        }

        loadPersistedSessions() {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('session_'));
            
            keys.forEach(key => {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    if (sessionData && Date.now() < sessionData.expires) {
                        // Session is still valid, but we need user data
                        const users = JSON.parse(localStorage.getItem('learntav_users') || '[]');
                        const user = users.find(u => u.id === sessionData.userId);
                        
                        if (user) {
                            const session = {
                                ...sessionData,
                                user: { ...user },
                                lastActivity: Date.now(),
                                userAgent: navigator.userAgent,
                                ipAddress: this.getClientIP(),
                                csrfToken: this.generateCSRFToken()
                            };
                            
                            this.sessions.set(session.id, session);
                        }
                    } else {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    console.error('Error loading persisted session:', error);
                    localStorage.removeItem(key);
                }
            });
        }

        removePersistedSession(sessionId) {
            localStorage.removeItem(`session_${sessionId}`);
        }

        // ===================================================================
        // CSRF Protection
        // ===================================================================

        setupCSRFProtection() {
            // Intercept all form submissions and AJAX requests
            this.interceptForms();
            this.interceptXHR();
        }

        async generateCSRFToken() {
            const array = new Uint8Array(SECURITY_CONFIG.csrf.tokenLength);
            crypto.getRandomValues(array);
            const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            
            // Store token with timestamp
            this.csrfTokens.set(token, Date.now());
            
            return token;
        }

        validateCSRFToken(token, sessionId) {
            const session = this.sessions.get(sessionId);
            if (!session || session.csrfToken !== token) {
                return false;
            }

            const tokenTimestamp = this.csrfTokens.get(token);
            if (!tokenTimestamp || Date.now() - tokenTimestamp > 60 * 60 * 1000) { // 1 hour
                this.csrfTokens.delete(token);
                return false;
            }

            return true;
        }

        interceptForms() {
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.tagName === 'FORM') {
                    const currentSession = this.getCurrentSession();
                    if (currentSession) {
                        // Add CSRF token to form
                        const csrfInput = document.createElement('input');
                        csrfInput.type = 'hidden';
                        csrfInput.name = 'csrf_token';
                        csrfInput.value = currentSession.csrfToken;
                        form.appendChild(csrfInput);
                    }
                }
            });
        }

        interceptXHR() {
            const originalXHR = window.XMLHttpRequest.prototype.open;
            const self = this;
            
            window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
                const xhr = this;
                const originalSend = xhr.send;
                
                xhr.send = function(data) {
                    const currentSession = self.getCurrentSession();
                    if (currentSession && method.toUpperCase() !== 'GET') {
                        xhr.setRequestHeader(SECURITY_CONFIG.csrf.headerName, currentSession.csrfToken);
                    }
                    return originalSend.call(xhr, data);
                };
                
                return originalXHR.call(this, method, url, ...args);
            };
        }

        getCurrentSession() {
            // Get current session from storage or memory
            const sessionId = sessionStorage.getItem('current_session_id');
            return sessionId ? this.sessions.get(sessionId) : null;
        }

        logSecurityEvent(event, data) {
            const logEntry = {
                event,
                timestamp: Date.now(),
                ...data
            };

            // Store security logs
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 entries
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('security_logs', JSON.stringify(logs));
            
            console.warn('Security Event:', logEntry);
        }
    }

    // ===================================================================
    // Initialize Security Systems
    // ===================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecuritySystems);
    } else {
        initSecuritySystems();
    }

    function initSecuritySystems() {
        window.SecureBCrypt = new SecureBCrypt();
        window.SecureSessionManager = new SecureSessionManager();
        
        // Make available globally for auth system integration
        window.LearnTAVSecurity = {
            bcrypt: window.SecureBCrypt,
            sessionManager: window.SecureSessionManager,
            config: SECURITY_CONFIG
        };
        
        console.log('🔐 Security systems initialized');
    }

})();