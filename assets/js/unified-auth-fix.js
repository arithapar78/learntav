/**
 * Unified Authentication Fix
 * Resolves fragmented authentication architecture by creating a single point of truth
 */

(function() {
    'use strict';

    class UnifiedAuthFix {
        constructor() {
            this.init();
        }

        init() {
            console.log('🔧 UNIFIED AUTH FIX: Initializing authentication consolidation...');
            
            // Wait for all auth systems to load
            setTimeout(() => {
                this.consolidateAuthSystems();
                this.fixSessionConflicts();
                this.patchAdminAccess();
                console.log('✅ UNIFIED AUTH FIX: Authentication system consolidated');
            }, 1000);
        }

        consolidateAuthSystems() {
            console.log('🔗 UNIFIED AUTH: Consolidating authentication systems...');
            
            // Make admin auth use the main auth system for user validation
            if (window.LearnTAVAdminAuth && window.LearnTAVAuth) {
                const originalAuthenticate = window.LearnTAVAdminAuth.authenticate.bind(window.LearnTAVAdminAuth);
                
                window.LearnTAVAdminAuth.authenticate = async (credentials) => {
                    console.log('🔐 UNIFIED AUTH: Admin authentication request intercepted');
                    
                    try {
                        // First try the original admin auth method
                        const adminResult = await originalAuthenticate(credentials);
                        if (adminResult.success) {
                            console.log('✅ UNIFIED AUTH: Admin-specific auth succeeded');
                            return adminResult;
                        }
                    } catch (adminError) {
                        console.log('⚠️ UNIFIED AUTH: Admin-specific auth failed, trying main auth system...');
                    }
                    
                    // Fallback: Try main auth system with admin credentials
                    if (credentials.username && credentials.password) {
                        try {
                            const loginResult = await window.LearnTAVAuth.login({
                                email: credentials.username,
                                password: credentials.password,
                                rememberMe: true
                            });
                            
                            if (loginResult.success && window.LearnTAVAuth.isAdmin(loginResult.user)) {
                                console.log('✅ UNIFIED AUTH: Main auth system validated admin user');
                                
                                // Create admin session in admin auth system
                                window.LearnTAVAdminAuth.isAuthenticated = true;
                                window.LearnTAVAdminAuth.createSession();
                                
                                return {
                                    success: true,
                                    message: 'Administrator access granted via unified auth!',
                                    session: window.LearnTAVAdminAuth.getSessionInfo()
                                };
                            } else if (loginResult.success) {
                                throw new Error('User account found but lacks administrator privileges');
                            }
                        } catch (mainAuthError) {
                            console.log('❌ UNIFIED AUTH: Main auth system also failed:', mainAuthError.message);
                        }
                    }
                    
                    throw new Error('Invalid administrator credentials');
                };
            }
        }

        fixSessionConflicts() {
            console.log('🔄 UNIFIED AUTH: Fixing session storage conflicts...');
            
            // Ensure all systems check the same session sources
            if (window.AdminPanel) {
                const originalGetCurrentUser = window.AdminPanel.getCurrentUser;
                
                window.AdminPanel.getCurrentUser = () => {
                    console.log('🔍 UNIFIED AUTH: AdminPanel.getCurrentUser called');
                    
                    // Priority order for user session checking
                    const sessionSources = [
                        () => window.LearnTAVAuth?.currentUser,
                        () => {
                            const persistent = localStorage.getItem('learntav_session_persistent');
                            if (persistent) {
                                const session = JSON.parse(persistent);
                                return (session.expires > Date.now()) ? session.user : null;
                            }
                            return null;
                        },
                        () => {
                            const session = sessionStorage.getItem('learntav_session');
                            if (session) {
                                const sessionData = JSON.parse(session);
                                return (sessionData.expires > Date.now()) ? sessionData.user : null;
                            }
                            return null;
                        },
                        () => {
                            if (window.LearnTAVAdminAuth?.isAuthenticated) {
                                return {
                                    email: 'admin@learntav.com',
                                    fullName: 'System Administrator',
                                    role: 'admin',
                                    id: 'admin_session'
                                };
                            }
                            return null;
                        }
                    ];
                    
                    for (const source of sessionSources) {
                        try {
                            const user = source();
                            if (user && this.isValidUser(user)) {
                                console.log(`✅ UNIFIED AUTH: Found valid user from source:`, user.email);
                                return user;
                            }
                        } catch (error) {
                            console.log('⚠️ UNIFIED AUTH: Error checking session source:', error.message);
                        }
                    }
                    
                    console.log('❌ UNIFIED AUTH: No valid user found in any session source');
                    return null;
                };
            }
        }

        patchAdminAccess() {
            console.log('🔒 UNIFIED AUTH: Patching admin access methods...');
            
            // Create a unified admin check function
            window.checkAdminAccess = () => {
                const user = window.LearnTAVAuth?.currentUser || 
                           (window.AdminPanel ? window.AdminPanel.getCurrentUser() : null);
                
                if (!user) {
                    console.log('❌ ADMIN ACCESS: No authenticated user found');
                    return false;
                }
                
                const isAdmin = user.role === 'admin' || 
                               user.role === 'super_admin' || 
                               user.role === 'administrator';
                
                console.log(`🔍 ADMIN ACCESS: User ${user.email} admin status: ${isAdmin}`);
                return isAdmin;
            };
            
            // Patch admin panel initialization if it exists
            if (window.AdminPanel) {
                const originalCheckAdminAccess = window.AdminPanel.checkAdminAccess;
                
                window.AdminPanel.checkAdminAccess = async () => {
                    console.log('🔐 UNIFIED AUTH: AdminPanel.checkAdminAccess called');
                    
                    // Check unified admin access
                    if (window.checkAdminAccess()) {
                        console.log('✅ UNIFIED AUTH: Admin access granted');
                        window.AdminPanel.updateAdminUI();
                        window.AdminPanel.loadDashboardData();
                        return true;
                    }
                    
                    // Check if admin auth system has valid session
                    if (window.LearnTAVAdminAuth?.checkExistingSession()) {
                        console.log('✅ UNIFIED AUTH: Admin auth session valid');
                        window.AdminPanel.updateAdminUI();
                        window.AdminPanel.loadDashboardData();
                        return true;
                    }
                    
                    console.log('❌ UNIFIED AUTH: Admin access denied, showing authentication');
                    window.AdminPanel.showAdminAuthentication();
                    return false;
                };
            }
        }

        isValidUser(user) {
            return user && 
                   typeof user === 'object' && 
                   user.email && 
                   user.role;
        }
    }

    // Initialize the unified auth fix
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.UnifiedAuthFix = new UnifiedAuthFix();
        });
    } else {
        window.UnifiedAuthFix = new UnifiedAuthFix();
    }

    console.log('🔧 Unified Authentication Fix loaded');

})();