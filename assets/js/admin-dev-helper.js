/**
 * Admin Development Helper
 * Provides easy admin access during development and testing
 */

(function() {
    'use strict';

    // Only enable in development (localhost/127.0.0.1)
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '';

    if (!isDevelopment) {
        console.log('🔐 Admin Dev Helper: Production mode detected, helper disabled');
        return;
    }

    class AdminDevHelper {
        constructor() {
            this.init();
        }

        init() {
            console.log('🛠️ Admin Dev Helper: Development mode detected');
            this.addDevControls();
            this.addConsoleCommands();
            this.showAdminCredentials();
        }

        showAdminCredentials() {
            console.log('🔐 ADMIN ACCESS CREDENTIALS:');
            console.log('📧 Email: admin@learntav.com');
            console.log('🔑 Password: AdminPass123!');
            console.log('💡 Use adminLogin() in console for quick login');
        }

        addDevControls() {
            // Add a floating development panel
            const devPanel = document.createElement('div');
            devPanel.id = 'admin-dev-panel';
            devPanel.innerHTML = `
                <div class="dev-panel">
                    <h4>🛠️ Admin Dev Tools</h4>
                    <button onclick="window.adminLogin()">Quick Admin Login</button>
                    <button onclick="window.clearAllSessions()">Clear All Sessions</button>
                    <button onclick="window.showAdminStatus()">Show Auth Status</button>
                    <small>Development Mode Only</small>
                </div>
            `;
            
            // Add styles
            const styles = document.createElement('style');
            styles.textContent = `
                #admin-dev-panel {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    z-index: 10001;
                    background: #000;
                    color: #fff;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    font-family: monospace;
                    font-size: 12px;
                    max-width: 200px;
                }
                
                #admin-dev-panel .dev-panel h4 {
                    margin: 0 0 10px 0;
                    color: #4CAF50;
                }
                
                #admin-dev-panel button {
                    display: block;
                    width: 100%;
                    margin: 5px 0;
                    padding: 5px 8px;
                    background: #333;
                    color: #fff;
                    border: 1px solid #555;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                }
                
                #admin-dev-panel button:hover {
                    background: #555;
                }
                
                #admin-dev-panel small {
                    display: block;
                    margin-top: 10px;
                    opacity: 0.7;
                    font-size: 10px;
                }
            `;
            
            document.head.appendChild(styles);
            document.body.appendChild(devPanel);
        }

        addConsoleCommands() {
            // Quick admin login function
            window.adminLogin = async () => {
                console.log('🔐 Attempting quick admin login...');
                
                if (!window.LearnTAVAuth) {
                    console.error('❌ Auth system not loaded');
                    return;
                }

                try {
                    const result = await window.LearnTAVAuth.login({
                        email: 'admin@learntav.com',
                        password: 'AdminPass123!',
                        rememberMe: true
                    });
                    
                    console.log('✅ Admin login successful:', result);
                    
                    // Refresh page if on admin panel
                    if (window.location.pathname.includes('/admin/')) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    }
                    
                } catch (error) {
                    console.error('❌ Admin login failed:', error.message);
                }
            };

            // Clear all sessions
            window.clearAllSessions = () => {
                console.log('🧹 Clearing all sessions...');
                if (window.LearnTAVAuth) {
                    window.LearnTAVAuth.clearAllSessions();
                }
                localStorage.clear();
                sessionStorage.clear();
                console.log('✅ All sessions cleared');
                
                if (window.location.pathname.includes('/admin/')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            };

            // Show admin status
            window.showAdminStatus = () => {
                if (!window.LearnTAVAuth) {
                    console.log('❌ Auth system not loaded');
                    return;
                }
                
                const currentUser = window.LearnTAVAuth.currentUser;
                console.log('🔐 AUTH STATUS:');
                console.log('Current User:', currentUser);
                console.log('Is Logged In:', !!currentUser);
                console.log('Is Admin:', currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin'));
                
                // Check storage
                const persistentSession = localStorage.getItem('learntav_session_persistent');
                const sessionData = sessionStorage.getItem('learntav_session');
                const rememberToken = localStorage.getItem('learntav_remember');
                
                console.log('📱 STORAGE STATUS:');
                console.log('Persistent Session:', !!persistentSession);
                console.log('Session Storage:', !!sessionData);
                console.log('Remember Token:', !!rememberToken);
            };
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new AdminDevHelper();
        });
    } else {
        new AdminDevHelper();
    }

    console.log('🛠️ Admin Dev Helper loaded - Use adminLogin() for quick access');

})();