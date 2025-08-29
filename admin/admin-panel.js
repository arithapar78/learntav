/**
 * LearnTAV Admin Panel
 * Comprehensive user management and security monitoring system
 */

(function() {
    'use strict';

    // ===================================================================
    // Admin Panel Main Class
    // ===================================================================
    
    class AdminPanel {
        constructor() {
            this.currentAdmin = null;
            this.twoFactorEnabled = false;
            this.currentTab = 'dashboard';
            this.refreshInterval = null;
            this.adminAccessCode = 'ADMIN2024!'; // Simple admin access code
            this.init();
        }

        async init() {
            await this.checkAdminAccess();
            this.setupEventListeners();
            this.initializeTabs();
            this.startAutoRefresh();
            this.loadDashboardData();
        }

        // ===================================================================
        // Authentication & Access Control
        // ===================================================================
        
        async checkAdminAccess() {
            console.log('🔐 ADMIN DEBUG: Starting simplified checkAdminAccess...');
            
            // Check for admin access code in URL parameters first
            const urlParams = new URLSearchParams(window.location.search);
            const accessCode = urlParams.get('code');
            
            if (accessCode === this.adminAccessCode) {
                console.log('✅ ADMIN: Valid access code provided in URL');
                this.grantAdminAccess();
                return;
            }
            
            // Check for stored admin session
            const adminSession = localStorage.getItem('admin_session');
            if (adminSession) {
                try {
                    const session = JSON.parse(adminSession);
                    if (session.expires > Date.now() && session.accessCode === this.adminAccessCode) {
                        console.log('✅ ADMIN: Valid admin session found');
                        this.currentAdmin = session.admin;
                        this.updateAdminUI();
                        this.loadDashboardData();
                        return;
                    }
                } catch (error) {
                    console.error('Error parsing admin session:', error);
                }
            }
            
            // Check if user is logged in with admin role as fallback
            const currentUser = this.getCurrentUser();
            if (currentUser && this.isAdmin(currentUser)) {
                console.log('✅ ADMIN: User has admin role, granting access');
                this.currentAdmin = currentUser;
                this.updateAdminUI();
                this.loadDashboardData();
                return;
            }
            
            // No valid access, show access code prompt
            console.log('🔐 ADMIN: No valid access found, prompting for code');
            this.showAccessCodePrompt();
        }

        grantAdminAccess() {
            this.currentAdmin = {
                id: 'admin_' + Date.now(),
                fullName: 'Administrator',
                email: 'admin@learntav.com',
                role: 'admin'
            };
            
            // Create admin session
            const adminSession = {
                admin: this.currentAdmin,
                accessCode: this.adminAccessCode,
                created: Date.now(),
                expires: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
            };
            
            localStorage.setItem('admin_session', JSON.stringify(adminSession));
            
            this.updateAdminUI();
            this.loadDashboardData();
            this.showSuccess('Admin panel access granted!');
        }

        showAccessCodePrompt() {
            const code = prompt('Enter admin access code:');
            if (code === this.adminAccessCode) {
                this.grantAdminAccess();
            } else if (code !== null) {
                alert('Invalid access code. Contact administrator for access.');
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }

        getCurrentUser() {
            try {
                console.log('🔐 ADMIN DEBUG: Getting current user...');
                
                // First check if we can get user from main auth system
                if (window.LearnTAVAuth && window.LearnTAVAuth.currentUser) {
                    console.log('🔐 ADMIN DEBUG: Found user in main auth system:', {
                        email: window.LearnTAVAuth.currentUser.email,
                        role: window.LearnTAVAuth.currentUser.role
                    });
                    return window.LearnTAVAuth.currentUser;
                }
                
                // Check persistent session first
                const persistentSession = localStorage.getItem('learntav_session_persistent');
                console.log('🔐 ADMIN DEBUG: Persistent session check:', !!persistentSession);
                
                if (persistentSession) {
                    console.log('🔐 ADMIN: Found persistent session');
                    const sessionData = JSON.parse(persistentSession);
                    console.log('🔐 ADMIN DEBUG: Persistent session data:', {
                        hasUser: !!sessionData.user,
                        userEmail: sessionData.user?.email,
                        userRole: sessionData.user?.role,
                        expires: new Date(sessionData.expires).toISOString(),
                        isExpired: sessionData.expires <= Date.now()
                    });
                    
                    if (sessionData.expires > Date.now()) {
                        console.log('🔐 ADMIN: Persistent session valid:', sessionData.user.email);
                        return sessionData.user;
                    } else {
                        console.log('🔐 ADMIN DEBUG: Persistent session expired');
                    }
                }
                
                // Check session storage
                const session = sessionStorage.getItem('learntav_session');
                console.log('🔐 ADMIN DEBUG: Session storage check:', !!session);
                
                if (session) {
                    console.log('🔐 ADMIN: Found session storage');
                    const sessionData = JSON.parse(session);
                    console.log('🔐 ADMIN DEBUG: Session storage data:', {
                        hasUser: !!sessionData.user,
                        userEmail: sessionData.user?.email,
                        userRole: sessionData.user?.role,
                        expires: new Date(sessionData.expires).toISOString(),
                        isExpired: sessionData.expires <= Date.now()
                    });
                    
                    if (sessionData.expires > Date.now()) {
                        console.log('🔐 ADMIN: Session valid:', sessionData.user.email);
                        return sessionData.user;
                    } else {
                        console.log('🔐 ADMIN DEBUG: Session storage expired');
                    }
                }
                
                console.log('🔐 ADMIN DEBUG: No valid session found anywhere');
                return null;
            } catch (error) {
                console.error('🔐 ADMIN DEBUG: Error getting current user:', error);
                return null;
            }
        }

        isAdmin(user) {
            if (!user) return false;
            const result = user.role === 'admin' || user.role === 'super_admin';
            console.log('🔐 ADMIN DEBUG: isAdmin check:', {
                hasUser: !!user,
                userRole: user?.role,
                isAdminRole: result,
                acceptedRoles: ['admin', 'super_admin']
            });
            return result;
        }

        requires2FA() {
            // Disable 2FA for now to simplify testing
            // In production, this would check admin settings
            return false;
        }

        redirectToLogin() {
            // Instead of redirecting to login, show access code prompt
            this.showAccessCodePrompt();
        }

        showAccessDenied() {
            document.body.innerHTML = `
                <div class="access-denied">
                    <h1>Access Denied</h1>
                    <p>You don't have permission to access the admin panel.</p>
                    <a href="../index.html" class="admin-btn admin-btn--primary">Go Back</a>
                </div>
            `;
        }

        // ===================================================================
        // Two-Factor Authentication
        // ===================================================================
        
        async show2FAModal() {
            const modal = document.getElementById('twoFactorModal');
            if (modal) {
                modal.classList.add('active');
                document.getElementById('twoFactorCode').focus();
            }
        }

        async verifyTwoFactor(event) {
            event.preventDefault();
            
            const code = document.getElementById('twoFactorCode').value;
            
            if (!code || code.length !== 6) {
                this.showError('Please enter a valid 6-digit code');
                return;
            }

            // Simulate 2FA verification (in production, this would be server-side)
            const isValid = await this.verify2FACode(code);
            
            if (isValid) {
                this.twoFactorEnabled = true;
                this.closeTwoFactorModal();
                this.showSuccess('Two-factor authentication verified');
            } else {
                this.showError('Invalid authentication code');
                document.getElementById('twoFactorCode').value = '';
            }
        }

        async verify2FACode(code) {
            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo purposes, accept specific codes or pattern
            const validCodes = ['123456', '000000', '111111'];
            return validCodes.includes(code) || code === new Date().getMinutes().toString().padStart(2, '0') + '0000';
        }

        closeTwoFactorModal() {
            const modal = document.getElementById('twoFactorModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }

        // ===================================================================
        // UI Management
        // ===================================================================
        
        updateAdminUI() {
            if (!this.currentAdmin) return;

            // Update admin info in nav
            document.querySelectorAll('[data-admin-name]').forEach(el => {
                el.textContent = this.currentAdmin.fullName || this.currentAdmin.name || 'Admin';
            });

            document.querySelectorAll('[data-admin-initials]').forEach(el => {
                const name = this.currentAdmin.fullName || this.currentAdmin.name || 'A';
                el.textContent = name.split(' ').map(n => n[0]).join('').toUpperCase();
            });
        }

        setupEventListeners() {
            // Tab navigation
            document.querySelectorAll('[data-tab]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(link.dataset.tab);
                });
            });

            // User menu toggle
            document.querySelector('.admin-user-menu .auth-user-menu__trigger')?.addEventListener('click', () => {
                this.toggleUserMenu();
            });

            // Search and filters
            document.getElementById('userSearch')?.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });

            document.getElementById('roleFilter')?.addEventListener('change', (e) => {
                this.filterUsersByRole(e.target.value);
            });

            document.getElementById('statusFilter')?.addEventListener('change', (e) => {
                this.filterUsersByStatus(e.target.value);
            });
        }

        initializeTabs() {
            const tabs = document.querySelectorAll('.admin-tab');
            const links = document.querySelectorAll('[data-tab]');
            
            // Show first tab by default
            if (tabs.length > 0) {
                tabs[0].classList.add('active');
                links[0]?.classList.add('active');
            }
        }

        switchTab(tabName) {
            // Update tab visibility
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.querySelectorAll('[data-tab]').forEach(link => {
                link.classList.remove('active');
            });

            const targetTab = document.getElementById(`${tabName}-tab`);
            const targetLink = document.querySelector(`[data-tab="${tabName}"]`);
            
            if (targetTab) targetTab.classList.add('active');
            if (targetLink) targetLink.classList.add('active');

            this.currentTab = tabName;
            
            // Load tab-specific data
            this.loadTabData(tabName);
        }

        toggleUserMenu() {
            const dropdown = document.querySelector('.admin-user-menu .auth-user-menu__dropdown');
            dropdown?.classList.toggle('active');
        }

        // ===================================================================
        // Dashboard Data
        // ===================================================================
        
        async loadDashboardData() {
            try {
                const stats = await this.getDashboardStats();
                this.updateDashboardStats(stats);
                
                const recentActivity = await this.getRecentActivity();
                this.updateRecentActivity(recentActivity);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }

        async getDashboardStats() {
            console.log('📊 ADMIN: Loading dashboard stats...');
            const users = this.getAllUsers();
            const sessions = this.getActiveSessions();
            const securityLogs = this.getSecurityLogs();
            
            console.log('📊 ADMIN: Found', users.length, 'users');
            console.log('📊 ADMIN: Found', sessions.length, 'active sessions');
            console.log('📊 ADMIN: Found', securityLogs.length, 'security logs');
            
            const today = new Date();
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
            
            const todayLogins = users.filter(user =>
                user.lastLogin && new Date(user.lastLogin) > yesterday
            ).length;

            const recentSecurityEvents = securityLogs.filter(log =>
                log.timestamp > yesterday.getTime()
            ).length;

            const stats = {
                totalUsers: users.length,
                activeSessions: sessions.length,
                securityEvents: recentSecurityEvents,
                dailyLogins: todayLogins,
                userGrowth: this.calculateUserGrowth(users),
                sessionChange: sessions.length,
                securityChange: recentSecurityEvents,
                loginChange: this.calculateLoginGrowth(users)
            };
            
            console.log('📊 ADMIN: Stats calculated:', stats);
            return stats;
        }

        updateDashboardStats(stats) {
            document.getElementById('totalUsers').textContent = stats.totalUsers.toLocaleString();
            document.getElementById('activeSessions').textContent = stats.activeSessions.toLocaleString();
            document.getElementById('securityEvents').textContent = stats.securityEvents.toLocaleString();
            document.getElementById('dailyLogins').textContent = stats.dailyLogins.toLocaleString();
            
            // Update growth indicators
            this.updateGrowthIndicator('userGrowth', stats.userGrowth);
            this.updateGrowthIndicator('sessionChange', stats.sessionChange, false);
            this.updateGrowthIndicator('securityChange', stats.securityChange, false);
            this.updateGrowthIndicator('loginChange', stats.loginChange);
        }

        updateGrowthIndicator(elementId, value, isPercentage = true) {
            const element = document.getElementById(elementId);
            if (!element) return;

            const displayValue = isPercentage ? `${value > 0 ? '+' : ''}${value}%` : `${value > 0 ? '+' : ''}${value}`;
            element.textContent = displayValue;
            
            element.className = 'admin-stat-card__change';
            if (value > 0) {
                element.classList.add('positive');
            } else if (value < 0) {
                element.classList.add('negative');
            }
        }

        calculateUserGrowth(users) {
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const recentUsers = users.filter(user => user.created > thirtyDaysAgo).length;
            const olderUsers = users.length - recentUsers;
            
            return olderUsers > 0 ? Math.round((recentUsers / olderUsers) * 100) : 100;
        }

        calculateLoginGrowth(users) {
            const yesterday = Date.now() - 24 * 60 * 60 * 1000;
            const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
            
            const yesterdayLogins = users.filter(user => 
                user.lastLogin && user.lastLogin > yesterday
            ).length;
            
            const dayBeforeLogins = users.filter(user => 
                user.lastLogin && user.lastLogin > twoDaysAgo && user.lastLogin <= yesterday
            ).length;
            
            return dayBeforeLogins > 0 ? Math.round(((yesterdayLogins - dayBeforeLogins) / dayBeforeLogins) * 100) : 0;
        }

        async getRecentActivity() {
            const logs = this.getSecurityLogs().slice(-10).reverse();
            return logs.map(log => ({
                icon: this.getActivityIcon(log.event),
                text: this.formatActivityText(log),
                time: this.formatTimeAgo(log.timestamp)
            }));
        }

        updateRecentActivity(activities) {
            const container = document.getElementById('recentActivity');
            if (!container) return;

            container.innerHTML = activities.map(activity => `
                <div class="admin-activity__item">
                    <div class="admin-activity__icon">${activity.icon}</div>
                    <div class="admin-activity__content">
                        <p class="admin-activity__text">${activity.text}</p>
                        <span class="admin-activity__time">${activity.time}</span>
                    </div>
                </div>
            `).join('');
        }

        getActivityIcon(event) {
            const icons = {
                'login': '👤',
                'register': '🆕',
                'logout': '🚪',
                'failed_login': '🔐',
                'suspicious_activity': '⚠️',
                'session_destroyed': '❌',
                'account_created': '✨',
                'password_reset': '🔄',
                'settings_updated': '⚙️'
            };
            return icons[event] || '📋';
        }

        formatActivityText(log) {
            const actions = {
                'login': 'User logged in',
                'register': 'New user registered',
                'logout': 'User logged out',
                'failed_login': 'Failed login attempt',
                'suspicious_activity': 'Suspicious activity detected',
                'session_destroyed': 'Session terminated',
                'account_created': 'Account created',
                'password_reset': 'Password reset requested',
                'settings_updated': 'Settings updated'
            };
            
            let text = actions[log.event] || 'System event';
            
            if (log.userId) {
                const user = this.getUserById(log.userId);
                if (user) {
                    text += `: ${user.email}`;
                }
            }
            
            return text;
        }

        formatTimeAgo(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            
            if (diff < 60 * 1000) return 'Just now';
            if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} minutes ago`;
            if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
            
            return new Date(timestamp).toLocaleDateString();
        }

        // ===================================================================
        // Tab Data Loading
        // ===================================================================
        
        loadTabData(tabName) {
            switch (tabName) {
                case 'users':
                    this.loadUsersData();
                    break;
                case 'sessions':
                    this.loadSessionsData();
                    break;
                case 'logs':
                    this.loadLogsData();
                    break;
                case 'roles':
                    this.loadRolesData();
                    break;
                case 'settings':
                    this.loadSettingsData();
                    break;
            }
        }

        loadUsersData() {
            const users = this.getAllUsers();
            this.renderUsersTable(users);
        }

        renderUsersTable(users) {
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <div class="admin-user-info">
                            <div class="admin-user-avatar">${this.getUserInitials(user.fullName || user.name)}</div>
                            <div class="admin-user-details">
                                <h4>${user.fullName || user.name || 'Unknown'}</h4>
                                <p>ID: ${user.id}</p>
                            </div>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="admin-role-badge admin-role-badge--${user.role || 'member'}">${user.role || 'member'}</span>
                    </td>
                    <td>
                        <span class="admin-status-badge admin-status-badge--${user.status || 'active'}">${user.status || 'active'}</span>
                    </td>
                    <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-btn admin-btn--small admin-btn--secondary" onclick="AdminPanel.editUser('${user.id}')">Edit</button>
                            <button class="admin-btn admin-btn--small admin-btn--danger" onclick="AdminPanel.suspendUser('${user.id}')">Suspend</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        loadSessionsData() {
            const sessions = this.getActiveSessions();
            this.renderSessionsTable(sessions);
        }

        renderSessionsTable(sessions) {
            const tbody = document.getElementById('sessionsTableBody');
            if (!tbody) return;

            tbody.innerHTML = sessions.map(session => `
                <tr>
                    <td>
                        <div class="admin-user-info">
                            <div class="admin-user-avatar">${this.getUserInitials(session.user?.fullName)}</div>
                            <div class="admin-user-details">
                                <h4>${session.user?.fullName || 'Unknown'}</h4>
                                <p>${session.user?.email || 'No email'}</p>
                            </div>
                        </div>
                    </td>
                    <td>${session.ipAddress || 'Unknown'}</td>
                    <td>${this.getDeviceInfo(session.userAgent)}</td>
                    <td>${new Date(session.created).toLocaleString()}</td>
                    <td>${new Date(session.lastActivity).toLocaleString()}</td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-btn admin-btn--small admin-btn--danger" onclick="AdminPanel.revokeSession('${session.id}')">Revoke</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        loadLogsData() {
            const logs = this.getSecurityLogs();
            this.renderLogsTable(logs);
        }

        renderLogsTable(logs) {
            const tbody = document.getElementById('logsTableBody');
            if (!tbody) return;

            tbody.innerHTML = logs.slice(-50).reverse().map(log => `
                <tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                        <span class="admin-activity__icon">${this.getActivityIcon(log.event)}</span>
                        ${log.event.replace(/_/g, ' ')}
                    </td>
                    <td>${log.userId ? this.getUserById(log.userId)?.email || 'Unknown' : '-'}</td>
                    <td>${log.ipAddress || '-'}</td>
                    <td>${log.reason || JSON.stringify(log.data || {})}</td>
                </tr>
            `).join('');
        }

        // ===================================================================
        // User Management Actions
        // ===================================================================
        
        showCreateUserModal() {
            // Implementation for creating new users
            this.showInfo('Create user modal coming soon!');
        }

        editUser(userId) {
            // Implementation for editing users
            this.showInfo(`Edit user ${userId} - coming soon!`);
        }

        suspendUser(userId) {
            if (confirm('Are you sure you want to suspend this user?')) {
                const users = this.getAllUsers();
                const userIndex = users.findIndex(u => u.id === userId);
                
                if (userIndex >= 0) {
                    users[userIndex].status = 'suspended';
                    localStorage.setItem('learntav_users', JSON.stringify(users));
                    this.loadUsersData();
                    this.showSuccess('User suspended successfully');
                }
            }
        }

        revokeSession(sessionId) {
            if (confirm('Are you sure you want to revoke this session?')) {
                // Implementation would connect to SecureSessionManager
                if (window.LearnTAVSecurity?.sessionManager) {
                    window.LearnTAVSecurity.sessionManager.destroySession(sessionId);
                    this.loadSessionsData();
                    this.showSuccess('Session revoked successfully');
                }
            }
        }

        revokeAllSessions() {
            if (confirm('Are you sure you want to revoke ALL active sessions? This will log out all users.')) {
                if (window.LearnTAVSecurity?.sessionManager) {
                    // Revoke all sessions except current admin
                    const sessionManager = window.LearnTAVSecurity.sessionManager;
                    sessionManager.sessions.forEach((session, sessionId) => {
                        if (session.userId !== this.currentAdmin.id) {
                            sessionManager.destroySession(sessionId);
                        }
                    });
                    this.loadSessionsData();
                    this.showSuccess('All user sessions revoked successfully');
                }
            }
        }

        // ===================================================================
        // Filters and Search
        // ===================================================================
        
        filterUsers(query) {
            const users = this.getAllUsers();
            const filtered = users.filter(user => 
                (user.fullName || '').toLowerCase().includes(query.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(query.toLowerCase())
            );
            this.renderUsersTable(filtered);
        }

        filterUsersByRole(role) {
            const users = this.getAllUsers();
            const filtered = role ? users.filter(user => user.role === role) : users;
            this.renderUsersTable(filtered);
        }

        filterUsersByStatus(status) {
            const users = this.getAllUsers();
            const filtered = status ? users.filter(user => (user.status || 'active') === status) : users;
            this.renderUsersTable(filtered);
        }

        // ===================================================================
        // Data Access Methods
        // ===================================================================
        
        getAllUsers() {
            try {
                const users = localStorage.getItem('learntav_users');
                const userList = users ? JSON.parse(users) : [];
                console.log('👥 ADMIN: Loaded', userList.length, 'users from storage');
                return userList;
            } catch (error) {
                console.error('Error loading users:', error);
                return [];
            }
        }

        getUserById(userId) {
            const users = this.getAllUsers();
            return users.find(user => user.id === userId);
        }

        getActiveSessions() {
            if (window.LearnTAVSecurity?.sessionManager) {
                return Array.from(window.LearnTAVSecurity.sessionManager.sessions.values());
            }
            return [];
        }

        getSecurityLogs() {
            try {
                const logs = localStorage.getItem('security_logs');
                const logList = logs ? JSON.parse(logs) : this.generateSampleSecurityLogs();
                console.log('🔒 ADMIN: Loaded', logList.length, 'security logs');
                return logList;
            } catch (error) {
                console.error('Error loading security logs:', error);
                return this.generateSampleSecurityLogs();
            }
        }

        generateSampleSecurityLogs() {
            const now = Date.now();
            const sampleLogs = [
                {
                    event: 'login',
                    timestamp: now - 5 * 60 * 1000,
                    userId: 'admin_user',
                    ipAddress: '127.0.0.1',
                    reason: 'Admin login successful'
                },
                {
                    event: 'failed_login',
                    timestamp: now - 10 * 60 * 1000,
                    userId: null,
                    ipAddress: '192.168.1.100',
                    reason: 'Invalid credentials'
                },
                {
                    event: 'account_created',
                    timestamp: now - 60 * 60 * 1000,
                    userId: 'new_user',
                    ipAddress: '127.0.0.1',
                    reason: 'New user registration'
                }
            ];
            
            localStorage.setItem('security_logs', JSON.stringify(sampleLogs));
            return sampleLogs;
        }

        // ===================================================================
        // Utility Methods
        // ===================================================================
        
        getUserInitials(name) {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }

        getDeviceInfo(userAgent) {
            if (!userAgent) return 'Unknown';
            
            if (userAgent.includes('Chrome')) return 'Chrome';
            if (userAgent.includes('Firefox')) return 'Firefox';
            if (userAgent.includes('Safari')) return 'Safari';
            if (userAgent.includes('Edge')) return 'Edge';
            
            return 'Unknown Browser';
        }

        startAutoRefresh() {
            // Refresh dashboard data every 30 seconds
            this.refreshInterval = setInterval(() => {
                if (this.currentTab === 'dashboard') {
                    this.loadDashboardData();
                } else {
                    this.loadTabData(this.currentTab);
                }
            }, 30000);
        }

        // ===================================================================
        // Admin Actions
        // ===================================================================
        
        showProfile() {
            this.showInfo('Admin profile modal coming soon!');
        }

        showSecuritySettings() {
            this.showInfo('Security settings modal coming soon!');
        }

        logout() {
            if (confirm('Are you sure you want to sign out of the admin panel?')) {
                sessionStorage.clear();
                localStorage.removeItem('admin_session');
                this.currentAdmin = null;
                window.location.href = '../index.html';
            }
        }

        exportLogs() {
            const logs = this.getSecurityLogs();
            const csv = this.convertToCSV(logs);
            this.downloadFile(csv, 'security-logs.csv', 'text/csv');
        }

        convertToCSV(data) {
            if (!data.length) return '';
            
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
            ].join('\n');
            
            return csvContent;
        }

        downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        // ===================================================================
        // Notification Methods
        // ===================================================================
        
        showSuccess(message) {
            this.showNotification(message, 'success');
        }

        showError(message) {
            this.showNotification(message, 'error');
        }

        showInfo(message) {
            this.showNotification(message, 'info');
        }

        showNotification(message, type) {
            if (window.LearnTAVAuthUI) {
                window.LearnTAVAuthUI.showNotification(message, type);
            } else {
                alert(message);
            }
        }
    }

    // ===================================================================
    // Initialize Admin Panel
    // ===================================================================
    
    // Wait for DOM and dependencies to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminPanel);
    } else {
        initAdminPanel();
    }

    function initAdminPanel() {
        // Wait for dependencies
        const checkDependencies = setInterval(() => {
            if (window.LearnTAVAuth && window.LearnTAVAuthUI) {
                clearInterval(checkDependencies);
                window.AdminPanel = new AdminPanel();
                console.log('🔐 Admin Panel initialized');
            }
        }, 100);
    }

})();