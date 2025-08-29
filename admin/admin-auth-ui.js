/**
 * LearnTAV Admin Authentication UI
 * Modern UI for admin sign-in with Username, Password, and Code
 */

(function() {
    'use strict';

    class AdminAuthUI {
        constructor() {
            this.modalContainer = null;
            this.init();
        }

        init() {
            this.createModalContainer();
            this.setupStyles();
            console.log('🎨 Admin Auth UI initialized');
        }

        createModalContainer() {
            if (!document.getElementById('admin-auth-modal')) {
                const container = document.createElement('div');
                container.id = 'admin-auth-modal';
                container.className = 'admin-auth-modal-container';
                document.body.appendChild(container);
                this.modalContainer = container;
            }
        }

        showAdminLogin() {
            const modalHTML = `
                <div class="admin-auth-overlay" onclick="window.LearnTAVAdminAuthUI.closeModal()">
                    <div class="admin-auth-modal" onclick="event.stopPropagation()">
                        <div class="admin-auth-header">
                            <div class="admin-auth-logo">
                                <span class="admin-auth-icon">🔒</span>
                                <h2 class="admin-auth-title">Administrator Access</h2>
                            </div>
                            <button class="admin-auth-close" onclick="window.LearnTAVAdminAuthUI.closeModal()" aria-label="Close">
                                <span>&times;</span>
                            </button>
                        </div>
                        
                        <div class="admin-auth-body">
                            <div class="admin-security-notice">
                                <div class="security-notice-icon">🛡️</div>
                                <div class="security-notice-text">
                                    <strong>Enhanced Security Required</strong>
                                    <p>Administrative access requires Username, Password, and Security Code verification.</p>
                                </div>
                            </div>

                            <form id="admin-auth-form" class="admin-auth-form" onsubmit="window.LearnTAVAdminAuthUI.handleSubmit(event)">
                                <div class="admin-form-group">
                                    <label class="admin-form-label" for="admin-username">Username *</label>
                                    <input type="text" id="admin-username" name="username" class="admin-form-input" required autocomplete="username">
                                    <div class="admin-form-error" id="admin-username-error"></div>
                                </div>

                                <div class="admin-form-group">
                                    <label class="admin-form-label" for="admin-password">Password *</label>
                                    <div class="admin-form-input-wrapper">
                                        <input type="password" id="admin-password" name="password" class="admin-form-input" required autocomplete="current-password">
                                        <button type="button" class="admin-form-toggle-password" onclick="window.LearnTAVAdminAuthUI.togglePassword('admin-password')">
                                            <span class="toggle-password-icon">👁️</span>
                                        </button>
                                    </div>
                                    <div class="admin-form-error" id="admin-password-error"></div>
                                </div>

                                <div class="admin-form-group">
                                    <label class="admin-form-label" for="admin-code">Security Code *</label>
                                    <input type="text" id="admin-code" name="code" class="admin-form-input admin-form-code" required maxlength="10" autocomplete="off">
                                    <div class="admin-form-hint">Enter your 4-digit security code</div>
                                    <div class="admin-form-error" id="admin-code-error"></div>
                                </div>

                                <button type="submit" class="admin-form-submit">
                                    <span class="admin-btn-text">🔐 Authenticate Admin Access</span>
                                    <span class="admin-btn-loading">Verifying Credentials...</span>
                                </button>
                            </form>

                            <div class="admin-auth-footer">
                                <div class="admin-contact-info">
                                    <small>🔧 Need admin access? Contact system administrator</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.modalContainer.innerHTML = modalHTML;
            this.modalContainer.classList.add('active');
            document.body.classList.add('admin-auth-modal-open');

            // Focus first input
            setTimeout(() => {
                const usernameInput = document.getElementById('admin-username');
                if (usernameInput) usernameInput.focus();
            }, 300);
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAdminAuth) {
                this.showError('Admin authentication system not available');
                return;
            }

            const form = event.target;
            const formData = new FormData(form);
            const credentials = {
                username: formData.get('username').trim(),
                password: formData.get('password'),
                code: formData.get('code').trim()
            };

            // Clear previous errors
            this.clearErrors();

            // Basic validation
            if (!credentials.username) {
                this.showFieldError('admin-username', 'Username is required');
                return;
            }
            if (!credentials.password) {
                this.showFieldError('admin-password', 'Password is required');
                return;
            }
            if (!credentials.code) {
                this.showFieldError('admin-code', 'Security code is required');
                return;
            }

            // Show loading state
            this.setLoading(true);

            try {
                const result = await window.LearnTAVAdminAuth.authenticate(credentials);
                
                if (result.success) {
                    this.closeModal();
                    this.showSuccessNotification('🔐 Administrator access granted! Redirecting to admin panel...');
                    
                    // Redirect to admin panel after short delay
                    setTimeout(() => {
                        window.location.href = '/admin/index.html';
                    }, 1500);
                }
            } catch (error) {
                console.error('Admin authentication failed:', error);
                this.showError(error.message || 'Authentication failed. Please verify your credentials.');
            } finally {
                this.setLoading(false);
            }
        }

        togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.parentNode.querySelector('.toggle-password-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        }

        showFieldError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + '-error');
            const inputElement = document.getElementById(fieldId);
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('visible');
            }
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }

        clearErrors() {
            document.querySelectorAll('.admin-form-error').forEach(el => {
                el.textContent = '';
                el.classList.remove('visible');
            });
            document.querySelectorAll('.admin-form-input').forEach(el => {
                el.classList.remove('error');
            });
        }

        showError(message) {
            this.showNotification(message, 'error');
        }

        showSuccessNotification(message) {
            this.showNotification(message, 'success');
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `admin-notification admin-notification--${type}`;
            notification.innerHTML = `
                <div class="admin-notification-content">
                    <span class="admin-notification-icon">${this.getNotificationIcon(type)}</span>
                    <span class="admin-notification-message">${message}</span>
                    <button class="admin-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;

            document.body.appendChild(notification);

            setTimeout(() => notification.classList.add('visible'), 10);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }

        getNotificationIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                info: 'ℹ️',
                warning: '⚠️'
            };
            return icons[type] || icons.info;
        }

        setLoading(loading) {
            const submitButton = document.querySelector('.admin-form-submit');
            if (!submitButton) return;

            if (loading) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
            }
        }

        closeModal() {
            this.modalContainer.classList.remove('active');
            document.body.classList.remove('admin-auth-modal-open');
            
            setTimeout(() => {
                this.modalContainer.innerHTML = '';
            }, 300);
        }

        setupStyles() {
            if (document.getElementById('admin-auth-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'admin-auth-styles';
            styles.textContent = `
                /* Admin Authentication Styles */
                .admin-auth-modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    padding: 20px;
                }

                .admin-auth-modal-container.active {
                    opacity: 1;
                    visibility: visible;
                }

                .admin-auth-modal-open {
                    overflow: hidden;
                }

                .admin-auth-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }

                .admin-auth-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                    max-width: 450px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    transform: scale(0.9);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative;
                }

                .admin-auth-modal-container.active .admin-auth-modal {
                    transform: scale(1);
                }

                .admin-auth-header {
                    padding: 32px 32px 0;
                    position: relative;
                    text-align: center;
                }

                .admin-auth-logo {
                    margin-bottom: 24px;
                }

                .admin-auth-icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 16px;
                }

                .admin-auth-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #dc2626;
                    margin: 0;
                    background: linear-gradient(135deg, #dc2626, #991b1b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .admin-auth-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #9ca3af;
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .admin-auth-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                .admin-auth-body {
                    padding: 24px 32px 32px;
                }

                .admin-security-notice {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 8px;
                    margin-bottom: 24px;
                }

                .security-notice-icon {
                    font-size: 24px;
                    color: #dc2626;
                    flex-shrink: 0;
                }

                .security-notice-text strong {
                    color: #b91c1c;
                    font-size: 14px;
                    display: block;
                    margin-bottom: 4px;
                }

                .security-notice-text p {
                    color: #dc2626;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.4;
                }

                .admin-form-group {
                    margin-bottom: 20px;
                }

                .admin-form-label {
                    display: block;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .admin-form-input-wrapper {
                    position: relative;
                }

                .admin-form-input {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #fca5a5;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    background: rgba(220, 38, 38, 0.02);
                    box-sizing: border-box;
                }

                .admin-form-input:focus {
                    outline: none;
                    border-color: #dc2626;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }

                .admin-form-input.error {
                    border-color: #dc2626;
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }

                .admin-form-code {
                    text-align: center;
                    font-family: 'Courier New', monospace;
                    font-size: 20px;
                    letter-spacing: 2px;
                    font-weight: 600;
                }

                .admin-form-toggle-password {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    opacity: 0.6;
                    transition: opacity 0.2s ease;
                }

                .admin-form-toggle-password:hover {
                    opacity: 1;
                }

                .admin-form-hint {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 6px;
                    text-align: center;
                }

                .admin-form-error {
                    color: #dc2626;
                    font-size: 14px;
                    margin-top: 8px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .admin-form-error.visible {
                    opacity: 1;
                }

                .admin-form-submit {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                }

                .admin-form-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
                }

                .admin-form-submit.loading .admin-btn-text {
                    opacity: 0;
                }

                .admin-form-submit.loading .admin-btn-loading {
                    opacity: 1;
                }

                .admin-btn-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .admin-btn-text {
                    transition: opacity 0.2s ease;
                }

                .admin-auth-footer {
                    margin-top: 24px;
                    text-align: center;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .admin-contact-info small {
                    color: #9ca3af;
                    font-size: 12px;
                }

                /* Notifications */
                .admin-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 10001;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .admin-notification.visible {
                    transform: translateX(0);
                }

                .admin-notification-content {
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-left: 4px solid;
                }

                .admin-notification--success .admin-notification-content {
                    border-left-color: #059669;
                }

                .admin-notification--error .admin-notification-content {
                    border-left-color: #dc2626;
                }

                .admin-notification-icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .admin-notification-message {
                    flex: 1;
                    font-weight: 500;
                    color: #1f2937;
                }

                .admin-notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #9ca3af;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .admin-notification-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .admin-auth-modal {
                        margin: 16px;
                        max-width: none;
                        width: calc(100% - 32px);
                    }

                    .admin-auth-header,
                    .admin-auth-body {
                        padding-left: 24px;
                        padding-right: 24px;
                    }

                    .admin-notification {
                        top: 16px;
                        right: 16px;
                        left: 16px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Initialize Admin Auth UI
    window.LearnTAVAdminAuthUI = new AdminAuthUI();

})();