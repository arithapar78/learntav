/**
 * LearnTAV Admin Panel - Secure Three-Factor Authentication
 * Administrative access with Username, Password, and Code verification
 */

(function() {
    'use strict';

    // ===================================================================
    // Admin Panel Main Class
    // ===================================================================
    
    class AdminPanel {
        constructor() {
            this.currentTab = 'dashboard';
            this.refreshInterval = null;
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
        // Three-Factor Authentication System
        // ===================================================================
        
        async checkAdminAccess() {
            console.log('🔐 ADMIN PANEL: Checking admin access...');
            
            // Check if admin authentication system is available
            if (!window.LearnTAVAdminAuth) {
                console.error('💥 Admin authentication system not loaded!');
                this.showAuthenticationError();
                return;
            }

            // Check for existing valid session
            if (window.LearnTAVAdminAuth.checkExistingSession()) {
                console.log('✅ ADMIN PANEL: Valid admin session found');
                this.updateAdminUI();
                this.loadDashboardData();
                return;
            }
            
            // No valid session, show authentication form
            console.log('🔐 ADMIN PANEL: No valid session, showing authentication');
            this.showAdminAuthentication();
        }

        showAdminAuthentication() {
            // Use the dedicated admin auth UI
            if (window.LearnTAVAdminAuthUI) {
                window.LearnTAVAdminAuthUI.showAdminLogin();
            } else {
                console.error('💥 Admin authentication UI not loaded!');
                this.showAuthenticationError();
            }
        }

        showAuthenticationError() {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #f3f4f6;
                    font-family: system-ui, -apple-system, sans-serif;
                ">
                    <div style="
                        background: white;
                        padding: 48px;
                        border-radius: 16px;
                        text-align: center;
                        max-width: 500px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    ">
                        <div style="font-size: 64px; margin-bottom: 24px;">🔒</div>
                        <h1 style="color: #dc2626; margin-bottom: 16px;">Authentication System Error</h1>
                        <p style="color: #6b7280; margin-bottom: 32px; line-height: 1.6;">
                            The admin authentication system failed to load properly. Please contact your system administrator.
                        </p>
                        <button onclick="window.location.reload()" style="
                            background: #2563eb;
                            color: white;
                            padding: 12px 24px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            margin-right: 12px;
                        ">Reload Page</button>
                        <button onclick="window.location.href = '../index.html'" style="
                            background: #6b7280;
                            color: white;
                            padding: 12px 24px;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Go Home</button>
                    </div>
                </div>
            `;
        }

        // ===================================================================
        // UI Management
        // ===================================================================
        
        updateAdminUI() {
            // Update admin info in nav - no user account needed
            document.querySelectorAll('[data-admin-name]').forEach(el => {
                el.textContent = 'Administrator';
            });

            document.querySelectorAll('[data-admin-initials]').forEach(el => {
                el.textContent = 'A';
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
            
            // Simple mock stats - no database dependencies
            const stats = {
                totalUsers: 0,
                activeSessions: 1, // Just the admin session
                securityEvents: 0,
                dailyLogins: 0,
                userGrowth: 0,
                sessionChange: 1,
                securityChange: 0,
                loginChange: 0
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
            // Simple activity log for admin access
            return [
                {
                    icon: '🔐',
                    text: 'Admin panel accessed',
                    time: 'Just now'
                }
            ];
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
            
            return actions[log.event] || 'System event';
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
            // No user data to load - show empty state
            this.renderUsersTable([]);
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
                            <button class="admin-btn admin-btn--small admin-btn--secondary" onclick="window.AdminPanel.editUser('${user.id}')">Edit</button>
                            <button class="admin-btn admin-btn--small admin-btn--danger" onclick="window.AdminPanel.suspendUser('${user.id}')">Suspend</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        loadSessionsData() {
            // Show only current admin session
            const adminSession = {
                id: 'admin_session',
                user: { fullName: 'Administrator', email: 'admin@system' },
                ipAddress: '127.0.0.1',
                userAgent: navigator.userAgent,
                created: Date.now(),
                lastActivity: Date.now()
            };
            this.renderSessionsTable([adminSession]);
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
                            <button class="admin-btn admin-btn--small admin-btn--danger" onclick="window.AdminPanel.revokeSession('${session.id}')">Revoke</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        loadLogsData() {
            // Simple log entry for admin access
            const logs = [
                {
                    timestamp: Date.now(),
                    event: 'admin_access',
                    userId: null,
                    ipAddress: '127.0.0.1',
                    reason: 'Admin panel accessed with valid code'
                }
            ];
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
                    <td>${log.userId || '-'}</td>
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
                    // Revoke all user sessions (admin has no user sessions)
                    const sessionManager = window.LearnTAVSecurity.sessionManager;
                    sessionManager.sessions.forEach((session, sessionId) => {
                        sessionManager.destroySession(sessionId);
                    });
                    this.loadSessionsData();
                    this.showSuccess('All user sessions revoked successfully');
                } else {
                    this.showInfo('No active sessions to revoke');
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
        
        // Data methods simplified - no database dependencies
        getAllUsers() {
            return [];
        }


        getActiveSessions() {
            return [];
        }

        getSecurityLogs() {
            return [
                {
                    event: 'admin_access',
                    timestamp: Date.now(),
                    userId: null,
                    ipAddress: '127.0.0.1',
                    reason: 'Admin panel accessed'
                }
            ];
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
                localStorage.removeItem('admin_session');
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
        // No dependencies needed - direct initialization
        window.AdminPanel = new AdminPanel();
        console.log('🔐 Admin Panel initialized with code-only access');
    }

})();