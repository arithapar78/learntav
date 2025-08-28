/**
 * Admin Sign-In Functionality
 */

// Admin passcode functionality
const ADMIN_PASSCODE = '0410';
let adminPasscodeAttempts = 0;
const MAX_ADMIN_ATTEMPTS = 3;

function setupAdminPasscodeInputs() {
    const inputs = document.querySelectorAll('.admin-digit');
    
    inputs.forEach((input, index) => {
        // Auto-focus next input on digit entry
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
            
            // Add filled class for styling
            if (value) {
                input.classList.add('filled');
            } else {
                input.classList.remove('filled');
            }
            
            // Auto-submit when all 4 digits are entered
            const allFilled = Array.from(inputs).every(inp => inp.value);
            if (allFilled) {
                setTimeout(() => attemptAdminSignIn(), 300);
            }
        });
        
        // Handle backspace to go to previous input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
            
            // Only allow numeric input
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Clear input on focus if it already has a value
        input.addEventListener('focus', (e) => {
            if (e.target.value) {
                e.target.select();
            }
        });
    });
}

function attemptAdminSignIn() {
    const inputs = document.querySelectorAll('.admin-digit');
    const errorMessage = document.getElementById('adminErrorMessage');
    const enteredCode = Array.from(inputs).map(input => input.value).join('');
    
    console.log('🔐 Admin sign-in attempt with code:', enteredCode);
    
    if (enteredCode.length !== 4) {
        showAdminError('Please enter all 4 digits');
        return;
    }
    
    if (enteredCode === ADMIN_PASSCODE) {
        console.log('✅ Admin passcode correct, redirecting to admin panel');
        showAdminSuccess('Access granted! Redirecting to admin panel...');
        
        // Add success animation
        inputs.forEach(input => {
            input.style.borderColor = 'var(--success)';
            input.style.backgroundColor = 'rgba(5, 150, 105, 0.1)';
        });
        
        // Redirect to admin panel after short delay
        setTimeout(() => {
            window.location.href = '/admin/';
        }, 1500);
        
        // Reset attempts on success
        adminPasscodeAttempts = 0;
    } else {
        adminPasscodeAttempts++;
        console.log(`❌ Invalid admin passcode. Attempt ${adminPasscodeAttempts}/${MAX_ADMIN_ATTEMPTS}`);
        
        // Add error animation
        inputs.forEach(input => {
            input.style.borderColor = 'var(--error)';
            input.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            input.classList.add('shake');
        });
        
        setTimeout(() => {
            inputs.forEach(input => {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
                input.classList.remove('shake');
            });
        }, 600);
        
        if (adminPasscodeAttempts >= MAX_ADMIN_ATTEMPTS) {
            showAdminError(`Access denied. Too many attempts. Please try again later.`);
            disableAdminInputs(60000); // Disable for 1 minute
        } else {
            const remainingAttempts = MAX_ADMIN_ATTEMPTS - adminPasscodeAttempts;
            showAdminError(`Invalid passcode. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        }
        
        // Clear inputs
        setTimeout(() => {
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('filled');
            });
            inputs[0].focus();
        }, 1000);
    }
}

function showAdminError(message) {
    const errorElement = document.getElementById('adminErrorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.style.color = 'var(--error)';
    
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

function showAdminSuccess(message) {
    const errorElement = document.getElementById('adminErrorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.style.color = 'var(--success)';
}

function disableAdminInputs(duration) {
    const inputs = document.querySelectorAll('.admin-digit');
    const button = document.querySelector('.admin-signin-btn');
    
    inputs.forEach(input => {
        input.disabled = true;
        input.style.opacity = '0.5';
    });
    
    button.disabled = true;
    button.style.opacity = '0.5';
    button.textContent = 'Access Temporarily Disabled';
    
    setTimeout(() => {
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '';
        });
        
        button.disabled = false;
        button.style.opacity = '';
        button.textContent = 'Access Admin Panel';
        
        adminPasscodeAttempts = 0;
        document.getElementById('adminErrorMessage').classList.remove('show');
    }, duration);
}

// Add shake animation CSS
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .admin-digit.shake {
        animation: shake 0.6s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
`;
document.head.appendChild(adminStyles);

/**
 * LearnTAV Settings Page JavaScript
 * Handles user settings, preferences, and profile management
 */

(function() {
    'use strict';

    // ===================================================================
    // Settings Manager Class
    // ===================================================================
    
    class SettingsManager {
        constructor() {
            this.currentTab = 'profile';
            this.userMenuOpen = false;
            this.init();
        }

        init() {
            this.checkAuthentication();
            this.setupEventListeners();
            this.setupTabNavigation();
            this.loadUserData();
            this.updateCurrentTime();
            
            console.log('⚙️ Settings page initialized');
        }

        // ===================================================================
        // Authentication & Access Control
        // ===================================================================
        
        checkAuthentication() {
            // Wait for auth system to initialize
            if (!window.LearnTAVAuth) {
                setTimeout(() => this.checkAuthentication(), 100);
                return;
            }

            const isAuthenticated = !!window.LearnTAVAuth.currentUser;
            
            if (isAuthenticated) {
                this.showSettingsContent();
                this.loadUserSettings();
            } else {
                this.showAuthRequired();
            }
        }

        showAuthRequired() {
            document.getElementById('authRequired').style.display = 'block';
            document.getElementById('settingsContent').style.display = 'none';
        }

        showSettingsContent() {
            document.getElementById('authRequired').style.display = 'none';
            document.getElementById('settingsContent').style.display = 'block';
        }

        // ===================================================================
        // Event Listeners
        // ===================================================================
        
        setupEventListeners() {
            // Profile form
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
            }

            // Preferences form
            const preferencesForm = document.getElementById('preferences-form');
            if (preferencesForm) {
                preferencesForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
            }

            // Password form
            const passwordForm = document.getElementById('password-form');
            if (passwordForm) {
                passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
            }

            // Privacy toggles
            document.querySelectorAll('input[name="analytics"], input[name="performance"]').forEach(toggle => {
                toggle.addEventListener('change', (e) => this.handlePrivacyToggle(e));
            });

            // Theme selector
            document.querySelectorAll('input[name="theme"]').forEach(radio => {
                radio.addEventListener('change', (e) => this.handleThemeChange(e));
            });

            // Notification toggles
            document.querySelectorAll('input[name$="Notifications"], input[name$="Emails"]').forEach(toggle => {
                toggle.addEventListener('change', (e) => this.handleNotificationToggle(e));
            });

            // Interest tags
            document.querySelectorAll('input[name="interests"]').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => this.handleInterestChange(e));
            });

            // Escape key to close user menu
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.userMenuOpen) {
                    this.closeUserMenu();
                }
            });

            // Click outside to close user menu
            document.addEventListener('click', (e) => {
                if (this.userMenuOpen && !e.target.closest('.user-menu')) {
                    this.closeUserMenu();
                }
            });
        }

        setupTabNavigation() {
            const tabButtons = document.querySelectorAll('[data-settings-tab]');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = button.dataset.settingsTab;
                    this.switchTab(tabName);
                });
            });
        }

        // ===================================================================
        // Tab Management
        // ===================================================================
        
        switchTab(tabName) {
            // Update active button
            document.querySelectorAll('.settings-nav__item').forEach(item => {
                item.classList.remove('settings-nav__item--active');
            });
            document.querySelector(`[data-settings-tab="${tabName}"]`).classList.add('settings-nav__item--active');

            // Update active panel
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('settings-panel--active');
            });
            document.getElementById(`${tabName}-panel`).classList.add('settings-panel--active');

            this.currentTab = tabName;
            
            // Update URL hash without triggering navigation
            history.replaceState(null, null, `#${tabName}`);
        }

        // ===================================================================
        // User Data Management
        // ===================================================================
        
        loadUserData() {
            if (!window.LearnTAVAuth?.currentUser) return;

            const user = window.LearnTAVAuth.currentUser;
            
            // Update user name displays
            document.querySelectorAll('[data-user-name]').forEach(element => {
                if (element.tagName === 'INPUT') {
                    element.value = user.fullName || '';
                } else {
                    element.textContent = user.fullName || '';
                }
            });

            // Update email displays
            document.querySelectorAll('[data-user-email]').forEach(element => {
                if (element.tagName === 'INPUT') {
                    element.value = user.email || '';
                } else {
                    element.textContent = user.email || '';
                }
            });
        }

        loadUserSettings() {
            if (!window.LearnTAVAuth?.currentUser?.settings) return;

            const settings = window.LearnTAVAuth.currentUser.settings;
            
            // Load theme preference
            const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme || 'light'}"]`);
            if (themeRadio) themeRadio.checked = true;

            // Load notification preferences
            if (settings.notifications !== undefined) {
                const emailNotifications = document.querySelector('input[name="emailNotifications"]');
                if (emailNotifications) emailNotifications.checked = settings.notifications;
            }

            // Load privacy settings
            if (settings.analytics !== undefined) {
                const analytics = document.querySelector('input[name="analytics"]');
                if (analytics) analytics.checked = settings.analytics;
            }

            if (settings.performance !== undefined) {
                const performance = document.querySelector('input[name="performance"]');
                if (performance) performance.checked = settings.performance;
            }

            // Load interests
            if (settings.interests && Array.isArray(settings.interests)) {
                settings.interests.forEach(interest => {
                    const checkbox = document.querySelector(`input[name="interests"][value="${interest}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            // Load bio
            if (settings.bio) {
                const bioTextarea = document.getElementById('profile-bio');
                if (bioTextarea) bioTextarea.value = settings.bio;
            }
        }

        // ===================================================================
        // Form Handlers
        // ===================================================================
        
        async handleProfileUpdate(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth?.currentUser) {
                this.showError('Please log in to update your profile');
                return;
            }

            this.showLoading('Updating profile...');
            
            try {
                const formData = new FormData(event.target);
                const profileData = {};
                
                // Get basic info
                profileData.fullName = formData.get('fullName');
                profileData.bio = formData.get('bio');
                
                // Get interests
                const interests = formData.getAll('interests');
                profileData.interests = interests;

                // Validate
                if (!profileData.fullName?.trim()) {
                    throw new Error('Full name is required');
                }

                // Simulate API delay
                await this.delay(1000);

                // Update user data
                const updatedSettings = {
                    ...window.LearnTAVAuth.currentUser.settings,
                    bio: profileData.bio,
                    interests: profileData.interests
                };

                // Update full name in user object
                const users = window.LearnTAVAuth.getAllUsers();
                const userIndex = users.findIndex(u => u.id === window.LearnTAVAuth.currentUser.id);
                
                if (userIndex >= 0) {
                    users[userIndex].fullName = profileData.fullName;
                    users[userIndex].settings = updatedSettings;
                    window.LearnTAVAuth.saveUser(users[userIndex]);
                    
                    // Update current user object
                    window.LearnTAVAuth.currentUser.fullName = profileData.fullName;
                    window.LearnTAVAuth.currentUser.settings = updatedSettings;
                    
                    // Update UI
                    window.LearnTAVAuth.updateAuthUI();
                    this.loadUserData();
                }

                this.hideLoading();
                this.showSuccess('Profile updated successfully!');
                
            } catch (error) {
                this.hideLoading();
                this.showError(error.message);
            }
        }

        async handlePreferencesUpdate(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth?.currentUser) {
                this.showError('Please log in to update preferences');
                return;
            }

            this.showLoading('Saving preferences...');
            
            try {
                const formData = new FormData(event.target);
                
                const preferences = {
                    theme: formData.get('theme') || 'light',
                    notifications: formData.has('emailNotifications'),
                    marketingEmails: formData.has('marketingEmails'),
                    browserNotifications: formData.has('browserNotifications')
                };

                // Simulate API delay
                await this.delay(800);

                // Update settings
                await window.LearnTAVAuth.updateUserSettings(preferences);
                
                // Apply theme if changed
                this.applyTheme(preferences.theme);
                
                this.hideLoading();
                this.showSuccess('Preferences saved successfully!');
                
            } catch (error) {
                this.hideLoading();
                this.showError(error.message);
            }
        }

        async handlePasswordChange(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth?.currentUser) {
                this.showError('Please log in to change password');
                return;
            }

            const formData = new FormData(event.target);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            // Validate passwords
            if (!currentPassword) {
                this.showError('Current password is required');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showError('New passwords do not match');
                return;
            }

            if (newPassword.length < 8) {
                this.showError('New password must be at least 8 characters');
                return;
            }

            this.showLoading('Changing password...');
            
            try {
                // Simulate API delay
                await this.delay(1500);

                // Verify current password
                const users = window.LearnTAVAuth.getAllUsers();
                const user = users.find(u => u.id === window.LearnTAVAuth.currentUser.id);
                
                if (!user || !window.LearnTAVAuth.verifyPassword(currentPassword, user.passwordHash)) {
                    throw new Error('Current password is incorrect');
                }

                // Update password
                user.passwordHash = window.LearnTAVAuth.hashPassword(newPassword);
                window.LearnTAVAuth.saveUser(user);

                // Clear form
                event.target.reset();
                
                this.hideLoading();
                this.showSuccess('Password changed successfully!');
                
            } catch (error) {
                this.hideLoading();
                this.showError(error.message);
            }
        }

        // ===================================================================
        // Setting Handlers
        // ===================================================================
        
        handleThemeChange(event) {
            const theme = event.target.value;
            this.applyTheme(theme);
            this.updateUserSetting('theme', theme);
        }

        handleNotificationToggle(event) {
            const setting = event.target.name;
            const value = event.target.checked;
            this.updateUserSetting(setting, value);
        }

        handlePrivacyToggle(event) {
            const setting = event.target.name;
            const value = event.target.checked;
            this.updateUserSetting(setting, value);
        }

        handleInterestChange(event) {
            // Collect all checked interests
            const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(cb => cb.value);
            this.updateUserSetting('interests', interests);
        }

        async updateUserSetting(key, value) {
            if (!window.LearnTAVAuth?.currentUser) return;

            try {
                const settings = { [key]: value };
                await window.LearnTAVAuth.updateUserSettings(settings);
            } catch (error) {
                console.error('Failed to update setting:', error);
            }
        }

        // ===================================================================
        // Theme Management
        // ===================================================================
        
        applyTheme(theme) {
            const body = document.body;
            
            // Remove existing theme classes
            body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
            
            if (theme === 'dark') {
                body.classList.add('theme-dark');
            } else if (theme === 'auto') {
                body.classList.add('theme-auto');
                // Check system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    body.classList.add('theme-dark');
                }
            } else {
                body.classList.add('theme-light');
            }
        }

        // ===================================================================
        // User Menu Management
        // ===================================================================
        
        openUserMenu() {
            const dropdown = document.getElementById('userMenuDropdown');
            if (dropdown) {
                dropdown.classList.add('active');
                this.userMenuOpen = true;
            }
        }

        closeUserMenu() {
            const dropdown = document.getElementById('userMenuDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
                this.userMenuOpen = false;
            }
        }

        // ===================================================================
        // Utility Functions
        // ===================================================================
        
        updateCurrentTime() {
            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = 'Now';
            }
            
            // Update location (mock data)
            const locationElement = document.getElementById('currentLocation');
            if (locationElement) {
                locationElement.textContent = 'Unknown location';
            }
        }

        showLoading(message = 'Loading...') {
            const overlay = document.getElementById('loadingOverlay');
            const text = overlay?.querySelector('.loading-text');
            
            if (overlay) {
                if (text) text.textContent = message;
                overlay.classList.add('active');
            }
        }

        hideLoading() {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        }

        showSuccess(message) {
            if (window.LearnTAVAuthUI) {
                window.LearnTAVAuthUI.showSuccess(message);
            } else {
                alert(message);
            }
        }

        showError(message) {
            if (window.LearnTAVAuthUI) {
                window.LearnTAVAuthUI.showError(message);
            } else {
                alert(message);
            }
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // ===================================================================
    // Global Functions (called from HTML)
    // ===================================================================
    
    window.toggleUserMenu = function() {
        if (window.settingsManager.userMenuOpen) {
            window.settingsManager.closeUserMenu();
        } else {
            window.settingsManager.openUserMenu();
        }
    };

    window.resetProfileForm = function() {
        const form = document.getElementById('profile-form');
        if (form && window.settingsManager) {
            form.reset();
            window.settingsManager.loadUserData();
            window.settingsManager.loadUserSettings();
        }
    };

    window.downloadUserData = async function() {
        if (!window.LearnTAVAuth?.currentUser) {
            alert('Please log in to download your data');
            return;
        }

        window.settingsManager.showLoading('Preparing your data...');
        
        try {
            // Simulate data preparation
            await window.settingsManager.delay(2000);
            
            const userData = {
                profile: {
                    fullName: window.LearnTAVAuth.currentUser.fullName,
                    email: window.LearnTAVAuth.currentUser.email,
                    created: new Date(window.LearnTAVAuth.currentUser.created).toISOString(),
                    verified: window.LearnTAVAuth.currentUser.verified
                },
                settings: window.LearnTAVAuth.currentUser.settings,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            // Create and download file
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `learntav-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.settingsManager.hideLoading();
            window.settingsManager.showSuccess('Your data has been downloaded successfully!');
            
        } catch (error) {
            window.settingsManager.hideLoading();
            window.settingsManager.showError('Failed to download data. Please try again.');
        }
    };

    window.confirmDataDeletion = function() {
        if (!window.LearnTAVAuth?.currentUser) {
            alert('Please log in to delete your account');
            return;
        }

        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.'
        );

        if (confirmed) {
            const doubleConfirmed = confirm(
                'This is your final warning. Deleting your account will remove all your progress, settings, and personal information. Are you absolutely sure?'
            );

            if (doubleConfirmed) {
                deleteUserAccount();
            }
        }
    };

    async function deleteUserAccount() {
        window.settingsManager.showLoading('Deleting account...');
        
        try {
            // Simulate API delay
            await window.settingsManager.delay(2000);
            
            // Remove user from storage
            const users = window.LearnTAVAuth.getAllUsers();
            const updatedUsers = users.filter(u => u.id !== window.LearnTAVAuth.currentUser.id);
            localStorage.setItem('learntav_users', JSON.stringify(updatedUsers));
            
            // Clear all auth data
            window.LearnTAVAuth.clearAllSessions();
            
            window.settingsManager.hideLoading();
            alert('Your account has been deleted successfully. You will be redirected to the home page.');
            
            // Redirect to home
            window.location.href = '/';
            
        } catch (error) {
            window.settingsManager.hideLoading();
            window.settingsManager.showError('Failed to delete account. Please try again or contact support.');
        }
    }

    window.showLoginHistory = function() {
        alert('Login history feature will be available in a future update.');
    };

    window.signOutAllDevices = async function() {
        if (!window.LearnTAVAuth?.currentUser) {
            alert('Please log in to sign out of other devices');
            return;
        }

        const confirmed = confirm('Are you sure you want to sign out of all other devices? You will remain signed in on this device.');
        
        if (confirmed) {
            window.settingsManager.showLoading('Signing out of all devices...');
            
            try {
                // Simulate API delay
                await window.settingsManager.delay(1500);
                
                // In a real app, this would invalidate all other sessions
                // For now, we'll just clear the remember token and recreate session
                localStorage.removeItem('learntav_remember');
                window.LearnTAVAuth.createSession();
                
                window.settingsManager.hideLoading();
                window.settingsManager.showSuccess('Successfully signed out of all other devices.');
                
            } catch (error) {
                window.settingsManager.hideLoading();
                window.settingsManager.showError('Failed to sign out of other devices. Please try again.');
            }
        }
    };

    // ===================================================================
    // Initialize Settings Manager
    // ===================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSettings);
    } else {
        initializeSettings();
    }

    function initializeSettings() {
        window.settingsManager = new SettingsManager();
        
        // Initialize admin passcode inputs
        setTimeout(() => {
            setupAdminPasscodeInputs();
        }, 100);
        
        // Handle initial hash
        const hash = window.location.hash.substring(1);
        if (hash && ['profile', 'preferences', 'privacy', 'security'].includes(hash)) {
            setTimeout(() => {
                window.settingsManager.switchTab(hash);
            }, 100);
        }
    }

})();