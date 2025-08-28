/**
 * LearnTAV Authentication Emergency Fix
 * Addresses critical session persistence and admin panel access issues
 */

(function() {
    'use strict';

    // ===================================================================
    // Cross-Tab Session Manager Fix
    // ===================================================================
    
    class SessionSyncManager {
        constructor() {
            this.setupStorageEventHandlers();
            this.setupSessionRenewalCheck();
            this.isInitialized = false;
            console.log('🔧 Emergency Session Sync Manager initialized');
        }

        setupStorageEventHandlers() {
            // Listen for storage changes across tabs
            window.addEventListener('storage', (event) => {
                console.log('📡 Storage event detected:', event.key, event.newValue ? 'updated' : 'removed');
                
                if (event.key === 'learntav_session_persistent') {
                    this.handlePersistentSessionChange(event);
                } else if (event.key === 'learntav_users') {
                    this.handleUserDataChange(event);
                } else if (event.key === 'session_sync_trigger') {
                    this.handleSyncTrigger(event);
                }
            });

            // Custom event for immediate sync
            document.addEventListener('auth-state-changed', (event) => {
                console.log('🔄 Auth state changed event:', event.detail);
                this.syncAuthStateAcrossTabs(event.detail);
            });
        }

        handlePersistentSessionChange(event) {
            if (!window.LearnTAVAuth) return;

            if (event.newValue) {
                // Session was created or updated in another tab
                try {
                    const sessionData = JSON.parse(event.newValue);
                    if (this.isValidSession(sessionData)) {
                        console.log('✅ Valid session detected from another tab, syncing...');
                        
                        // Update current user
                        window.LearnTAVAuth.currentUser = sessionData.user;
                        
                        // Update session storage for current tab
                        sessionStorage.setItem('learntav_session', JSON.stringify(sessionData));
                        
                        // Update UI
                        if (window.LearnTAVAuthUI) {
                            window.LearnTAVAuth.updateAuthUI();
                        }
                        
                        // Trigger custom event for other components
                        this.dispatchAuthStateChange('login', sessionData.user);
                    }
                } catch (error) {
                    console.error('❌ Error parsing session data:', error);
                }
            } else {
                // Session was cleared in another tab
                console.log('🚪 Session cleared in another tab, logging out...');
                this.performCrossTabLogout();
            }
        }

        handleUserDataChange(event) {
            // User data was updated (role changes, profile updates, etc.)
            if (window.LearnTAVAuth && window.LearnTAVAuth.currentUser) {
                try {
                    const users = JSON.parse(event.newValue || '[]');
                    const updatedUser = users.find(u => u.id === window.LearnTAVAuth.currentUser.id);
                    
                    if (updatedUser) {
                        // Remove password hash for security
                        const userForSession = { ...updatedUser };
                        delete userForSession.passwordHash;
                        
                        window.LearnTAVAuth.currentUser = userForSession;
                        window.LearnTAVAuth.updateAuthUI();
                        
                        console.log('👤 User data updated from another tab');
                    }
                } catch (error) {
                    console.error('❌ Error updating user data:', error);
                }
            }
        }

        handleSyncTrigger(event) {
            // Manual sync trigger from another tab
            if (event.newValue) {
                const trigger = JSON.parse(event.newValue);
                if (trigger.action === 'force_logout' && trigger.timestamp > Date.now() - 5000) {
                    this.performCrossTabLogout();
                } else if (trigger.action === 'force_refresh' && trigger.timestamp > Date.now() - 5000) {
                    window.location.reload();
                }
            }
        }

        isValidSession(session) {
            return session && 
                   session.expires > Date.now() && 
                   session.user && 
                   session.user.email;
        }

        performCrossTabLogout() {
            if (window.LearnTAVAuth) {
                window.LearnTAVAuth.currentUser = null;
                sessionStorage.removeItem('learntav_session');
                window.LearnTAVAuth.updateAuthUI();
                
                // Show notification
                if (window.LearnTAVAuthUI) {
                    window.LearnTAVAuthUI.showInfo('You have been logged out from another tab.');
                }
                
                // Redirect if on protected page
                if (window.location.pathname.includes('settings') || window.location.pathname.includes('admin')) {
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }
        }

        dispatchAuthStateChange(action, user) {
            const event = new CustomEvent('auth-state-changed', {
                detail: { action, user, timestamp: Date.now() }
            });
            document.dispatchEvent(event);
        }

        syncAuthStateAcrossTabs(detail) {
            // Trigger sync in other tabs
            try {
                localStorage.setItem('session_sync_trigger', JSON.stringify({
                    action: detail.action,
                    timestamp: detail.timestamp,
                    userId: detail.user?.id
                }));
                
                // Remove trigger after short delay
                setTimeout(() => {
                    localStorage.removeItem('session_sync_trigger');
                }, 1000);
            } catch (error) {
                console.error('❌ Error syncing across tabs:', error);
            }
        }

        setupSessionRenewalCheck() {
            // Check for session renewal every 5 minutes
            setInterval(() => {
                this.checkAndRenewSession();
            }, 5 * 60 * 1000);
        }

        checkAndRenewSession() {
            if (!window.LearnTAVAuth || !window.LearnTAVAuth.currentUser) return;

            try {
                const sessionData = sessionStorage.getItem('learntav_session');
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    const timeUntilExpiry = session.expires - Date.now();
                    
                    // Renew if less than 15 minutes remaining
                    if (timeUntilExpiry < 15 * 60 * 1000 && timeUntilExpiry > 0) {
                        console.log('🔄 Session nearing expiry, renewing...');
                        this.renewSession(session);
                    }
                }
            } catch (error) {
                console.error('❌ Error checking session renewal:', error);
            }
        }

        renewSession(session) {
            // Extend session expiry
            session.expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            session.renewed = Date.now();
            
            // Update both storages
            sessionStorage.setItem('learntav_session', JSON.stringify(session));
            localStorage.setItem('learntav_session_persistent', JSON.stringify(session));
            
            console.log('✅ Session renewed successfully');
        }
    }

    // ===================================================================
    // Admin Panel Access Fix
    // ===================================================================
    
    class AdminAccessFix {
        constructor() {
            this.applyAdminPanelFixes();
            console.log('🔧 Admin Panel Access Fix applied');
        }

        applyAdminPanelFixes() {
            // Override admin panel session checking if AdminPanel exists
            if (window.AdminPanel) {
                console.log('🔧 Patching AdminPanel.getCurrentUser method');
                this.patchAdminPanelAuth();
            } else {
                // Wait for AdminPanel to load
                const checkForAdminPanel = setInterval(() => {
                    if (window.AdminPanel) {
                        console.log('🔧 AdminPanel loaded, applying patches');
                        this.patchAdminPanelAuth();
                        clearInterval(checkForAdminPanel);
                    }
                }, 100);
                
                // Stop checking after 10 seconds
                setTimeout(() => clearInterval(checkForAdminPanel), 10000);
            }
        }

        patchAdminPanelAuth() {
            const originalGetCurrentUser = window.AdminPanel.getCurrentUser;
            
            window.AdminPanel.getCurrentUser = () => {
                console.log('🔐 ADMIN-FIX: Enhanced getCurrentUser called');
                
                try {
                    // First try the original method
                    let user = originalGetCurrentUser.call(window.AdminPanel);
                    if (user && this.isValidUser(user)) {
                        console.log('✅ ADMIN-FIX: Original method returned valid user:', user.email);
                        return user;
                    }
                    
                    // Try main auth system
                    if (window.LearnTAVAuth && window.LearnTAVAuth.currentUser) {
                        user = window.LearnTAVAuth.currentUser;
                        if (this.isValidUser(user)) {
                            console.log('✅ ADMIN-FIX: Main auth system has valid user:', user.email);
                            return user;
                        }
                    }
                    
                    // Try all possible session storage locations
                    const sessionSources = [
                        'learntav_session',
                        'learntav_session_persistent'
                    ];
                    
                    for (const key of sessionSources) {
                        try {
                            let sessionData;
                            if (key === 'learntav_session') {
                                sessionData = sessionStorage.getItem(key);
                            } else {
                                sessionData = localStorage.getItem(key);
                            }
                            
                            if (sessionData) {
                                console.log(`🔍 ADMIN-FIX: Checking ${key}...`);
                                const session = JSON.parse(sessionData);
                                
                                if (session.user && session.expires > Date.now()) {
                                    user = session.user;
                                    if (this.isValidUser(user)) {
                                        console.log(`✅ ADMIN-FIX: Found valid user in ${key}:`, user.email);
                                        return user;
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(`⚠️ ADMIN-FIX: Error checking ${key}:`, error.message);
                        }
                    }
                    
                    console.log('❌ ADMIN-FIX: No valid user found in any storage location');
                    return null;
                    
                } catch (error) {
                    console.error('💥 ADMIN-FIX: Error in enhanced getCurrentUser:', error);
                    return null;
                }
            };

            // Also patch the isAdmin method to be more permissive
            const originalIsAdmin = window.AdminPanel.isAdmin;
            window.AdminPanel.isAdmin = (user) => {
                if (!user) return false;
                
                const adminRoles = ['admin', 'administrator', 'super_admin'];
                const isAdmin = adminRoles.includes(user.role);
                
                console.log(`🔐 ADMIN-FIX: Checking admin status for ${user.email}: ${isAdmin} (role: ${user.role})`);
                return isAdmin;
            };

            console.log('✅ Admin panel authentication methods patched successfully');
        }

        isValidUser(user) {
            return user && 
                   typeof user === 'object' && 
                   user.email && 
                   user.role;
        }
    }

    // ===================================================================
    // UI Update Fix
    // ===================================================================
    
    class UIUpdateFix {
        constructor() {
            this.setupUIEventHandlers();
            console.log('🔧 UI Update Fix initialized');
        }

        setupUIEventHandlers() {
            // Listen for auth state changes
            document.addEventListener('auth-state-changed', (event) => {
                this.updateUIForAuthChange(event.detail);
            });

            // Force UI update on page focus (handles tab switching)
            window.addEventListener('focus', () => {
                this.checkAndUpdateAuthState();
            });

            // Also check when page becomes visible
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.checkAndUpdateAuthState();
                }
            });
        }

        updateUIForAuthChange(detail) {
            console.log('🎨 Updating UI for auth change:', detail.action);
            
            if (window.LearnTAVAuth) {
                window.LearnTAVAuth.updateAuthUI();
            }
            
            if (window.LearnTAVAuthUI && detail.user) {
                window.LearnTAVAuthUI.updateUserMenuInfo(detail.user);
            }
        }

        checkAndUpdateAuthState() {
            if (!window.LearnTAVAuth) return;

            try {
                // Check if session is still valid
                const persistentSession = localStorage.getItem('learntav_session_persistent');
                if (persistentSession) {
                    const session = JSON.parse(persistentSession);
                    if (session.expires > Date.now() && session.user) {
                        // Update current user if it's different
                        if (!window.LearnTAVAuth.currentUser || 
                            window.LearnTAVAuth.currentUser.id !== session.user.id) {
                            
                            console.log('🔄 Updating auth state from persistent session');
                            window.LearnTAVAuth.currentUser = session.user;
                            window.LearnTAVAuth.updateAuthUI();
                        }
                        return;
                    }
                }
                
                // If no valid persistent session, check if we should clear current user
                if (window.LearnTAVAuth.currentUser) {
                    console.log('🚪 No valid persistent session, clearing current user');
                    window.LearnTAVAuth.currentUser = null;
                    window.LearnTAVAuth.updateAuthUI();
                }
                
            } catch (error) {
                console.error('❌ Error checking auth state:', error);
            }
        }
    }

    // ===================================================================
    // Initialize Emergency Fixes
    // ===================================================================
    
    function initializeEmergencyFixes() {
        console.log('🚨 Initializing Emergency Authentication Fixes...');
        
        // Initialize all fixes
        window.SessionSyncManager = new SessionSyncManager();
        window.AdminAccessFix = new AdminAccessFix();
        window.UIUpdateFix = new UIUpdateFix();
        
        // Set up enhanced logging for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.authDebugInfo = () => {
                console.log('🔍 Auth Debug Info:');
                console.log('- Current User:', window.LearnTAVAuth?.currentUser);
                console.log('- Session Storage:', sessionStorage.getItem('learntav_session'));
                console.log('- Persistent Storage:', localStorage.getItem('learntav_session_persistent'));
                console.log('- Remember Token:', localStorage.getItem('learntav_remember'));
                console.log('- All Users:', localStorage.getItem('learntav_users'));
            };
        }
        
        console.log('✅ Emergency fixes initialized successfully');
        
        // Trigger immediate auth state check
        setTimeout(() => {
            if (window.UIUpdateFix) {
                window.UIUpdateFix.checkAndUpdateAuthState();
            }
        }, 500);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEmergencyFixes);
    } else {
        initializeEmergencyFixes();
    }

})();