/**
 * LearnTAV Authentication UI Components
 * Modern, animated UI components for the authentication system
 */

(function() {
    'use strict';

    // ===================================================================
    // Authentication UI Manager
    // ===================================================================
    
    class AuthUI {
        constructor() {
            this.activeModal = null;
            this.init();
        }

        init() {
            this.createModalContainer();
            this.setupGlobalStyles();
            this.bindEventListeners();
            console.log('🎨 Authentication UI initialized');
        }

        createModalContainer() {
            if (!document.getElementById('auth-modal-container')) {
                const container = document.createElement('div');
                container.id = 'auth-modal-container';
                container.className = 'auth-modal-container';
                document.body.appendChild(container);
            }
        }

        // ===================================================================
        // Welcome Modal (First Visit)
        // ===================================================================
        
        showWelcomeModal() {
            const modalHTML = `
                <div class="auth-modal-overlay" onclick="window.LearnTAVAuthUI.closeModal()">
                    <div class="auth-modal auth-modal--welcome" onclick="event.stopPropagation()">
                        <div class="auth-modal__header">
                            <div class="auth-modal__logo">
                                <span class="auth-modal__logo-text">Welcome to LearnTAV!</span>
                            </div>
                            <button class="auth-modal__close" onclick="window.LearnTAVAuthUI.closeModal()" aria-label="Close">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="auth-modal__body">
                            <div class="welcome-content">
                                <div class="welcome-icon">🚀</div>
                                <h2>Transform Your Tech Journey</h2>
                                <p>Join thousands learning to build applications and master AI without coding experience. Get started with a free account to unlock exclusive resources and track your progress.</p>
                                
                                <div class="welcome-features">
                                    <div class="welcome-feature">
                                        <span class="welcome-feature__icon">📱</span>
                                        <span>Build Real Apps</span>
                                    </div>
                                    <div class="welcome-feature">
                                        <span class="welcome-feature__icon">🤖</span>
                                        <span>AI-Powered Learning</span>
                                    </div>
                                    <div class="welcome-feature">
                                        <span class="welcome-feature__icon">🌱</span>
                                        <span>Sustainable Tech</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="auth-modal__footer">
                            <button class="auth-btn auth-btn--primary auth-btn--large" onclick="window.LearnTAVAuthUI.showRegisterModal()">
                                Create Free Account
                            </button>
                            <div style="margin: 24px 0;"></div>
                            <button class="auth-btn auth-btn--ghost" onclick="window.LearnTAVAuthUI.showLoginModal()">
                                I Already Have an Account
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(modalHTML);
        }

        // ===================================================================
        // Registration Modal
        // ===================================================================
        
        showRegisterModal() {
            const modalHTML = `
                <div class="auth-modal-overlay" onclick="window.LearnTAVAuthUI.closeModal()">
                    <div class="auth-modal auth-modal--register" onclick="event.stopPropagation()">
                        <div class="auth-modal__header">
                            <h2 class="auth-modal__title">Create Your Account</h2>
                            <button class="auth-modal__close" onclick="window.LearnTAVAuthUI.closeModal()" aria-label="Close">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="auth-modal__body">
                            <form id="register-form" class="auth-form" onsubmit="window.LearnTAVAuthUI.handleRegister(event)">
                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="register-name">Full Name *</label>
                                    <input type="text" id="register-name" name="fullName" class="auth-form__input" required>
                                    <div class="auth-form__error" id="register-name-error"></div>
                                </div>

                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="register-email">Email Address *</label>
                                    <input type="email" id="register-email" name="email" class="auth-form__input" required>
                                    <div class="auth-form__error" id="register-email-error"></div>
                                </div>

                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="register-password">Password *</label>
                                    <div class="auth-form__input-wrapper">
                                        <input type="password" id="register-password" name="password" class="auth-form__input" required minlength="8">
                                        <button type="button" class="auth-form__toggle-password" onclick="window.LearnTAVAuthUI.togglePassword('register-password')">
                                            <span class="toggle-password-icon">👁️</span>
                                        </button>
                                    </div>
                                    <div class="auth-form__password-strength" id="password-strength"></div>
                                    <div class="auth-form__error" id="register-password-error"></div>
                                </div>

                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="register-confirm-password">Confirm Password *</label>
                                    <input type="password" id="register-confirm-password" name="confirmPassword" class="auth-form__input" required minlength="8">
                                    <div class="auth-form__error" id="register-confirm-password-error"></div>
                                </div>

                                <div class="auth-form__group auth-form__group--checkbox">
                                    <label class="auth-form__checkbox-label">
                                        <input type="checkbox" id="register-remember" name="rememberMe" class="auth-form__checkbox">
                                        <span class="auth-form__checkbox-custom"></span>
                                        Keep me signed in
                                    </label>
                                </div>

                                <div class="auth-form__group auth-form__group--checkbox">
                                    <label class="auth-form__checkbox-label">
                                        <input type="checkbox" id="register-terms" name="acceptTerms" class="auth-form__checkbox" required>
                                        <span class="auth-form__checkbox-custom"></span>
                                        I agree to the <a href="/legal/terms/" target="_blank">Terms of Service</a> and <a href="/legal/privacy/" target="_blank">Privacy Policy</a>
                                    </label>
                                </div>

                                <button type="submit" class="auth-btn auth-btn--primary auth-btn--large auth-btn--full">
                                    <span class="auth-btn__text">Create Account</span>
                                    <span class="auth-btn__loading">Creating Account...</span>
                                </button>
                            </form>
                        </div>
                        <div class="auth-modal__footer">
                            <p class="auth-modal__switch">
                                Already have an account? 
                                <button type="button" class="auth-link" onclick="window.LearnTAVAuthUI.showLoginModal()">Sign In</button>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(modalHTML);
            this.setupPasswordStrengthMeter();
            this.setupRealTimeValidation('register-form');
        }

        // ===================================================================
        // Login Modal
        // ===================================================================
        
        showLoginModal() {
            const modalHTML = `
                <div class="auth-modal-overlay" onclick="window.LearnTAVAuthUI.closeModal()">
                    <div class="auth-modal auth-modal--login" onclick="event.stopPropagation()">
                        <div class="auth-modal__header">
                            <h2 class="auth-modal__title">Welcome Back</h2>
                            <button class="auth-modal__close" onclick="window.LearnTAVAuthUI.closeModal()" aria-label="Close">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="auth-modal__body">
                            <form id="login-form" class="auth-form" onsubmit="window.LearnTAVAuthUI.handleLogin(event)">
                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="login-email">Email Address *</label>
                                    <input type="email" id="login-email" name="email" class="auth-form__input" required>
                                    <div class="auth-form__error" id="login-email-error"></div>
                                </div>

                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="login-password">Password *</label>
                                    <div class="auth-form__input-wrapper">
                                        <input type="password" id="login-password" name="password" class="auth-form__input" required>
                                        <button type="button" class="auth-form__toggle-password" onclick="window.LearnTAVAuthUI.togglePassword('login-password')">
                                            <span class="toggle-password-icon">👁️</span>
                                        </button>
                                    </div>
                                    <div class="auth-form__error" id="login-password-error"></div>
                                </div>

                                <div class="auth-form__row">
                                    <div class="auth-form__group auth-form__group--checkbox">
                                        <label class="auth-form__checkbox-label">
                                            <input type="checkbox" id="login-remember" name="rememberMe" class="auth-form__checkbox">
                                            <span class="auth-form__checkbox-custom"></span>
                                            Remember me
                                        </label>
                                    </div>
                                    <button type="button" class="auth-link" onclick="window.LearnTAVAuthUI.showResetModal()">
                                        Forgot Password?
                                    </button>
                                </div>

                                <button type="submit" class="auth-btn auth-btn--primary auth-btn--large auth-btn--full">
                                    <span class="auth-btn__text">Sign In</span>
                                    <span class="auth-btn__loading">Signing In...</span>
                                </button>
                            </form>
                        </div>
                        <div class="auth-modal__footer">
                            <p class="auth-modal__switch">
                                Don't have an account? 
                                <button type="button" class="auth-link" onclick="window.LearnTAVAuthUI.showRegisterModal()">Create Account</button>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(modalHTML);
            this.setupRealTimeValidation('login-form');
        }

        // ===================================================================
        // Password Reset Modal
        // ===================================================================
        
        showResetModal() {
            const modalHTML = `
                <div class="auth-modal-overlay" onclick="window.LearnTAVAuthUI.closeModal()">
                    <div class="auth-modal auth-modal--reset" onclick="event.stopPropagation()">
                        <div class="auth-modal__header">
                            <h2 class="auth-modal__title">Reset Password</h2>
                            <button class="auth-modal__close" onclick="window.LearnTAVAuthUI.closeModal()" aria-label="Close">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="auth-modal__body">
                            <p class="auth-modal__description">
                                Enter your email address and we'll send you instructions to reset your password.
                            </p>
                            <form id="reset-form" class="auth-form" onsubmit="window.LearnTAVAuthUI.handleReset(event)">
                                <div class="auth-form__group">
                                    <label class="auth-form__label" for="reset-email">Email Address *</label>
                                    <input type="email" id="reset-email" name="email" class="auth-form__input" required>
                                    <div class="auth-form__error" id="reset-email-error"></div>
                                </div>

                                <button type="submit" class="auth-btn auth-btn--primary auth-btn--large auth-btn--full">
                                    <span class="auth-btn__text">Send Reset Instructions</span>
                                    <span class="auth-btn__loading">Sending...</span>
                                </button>
                            </form>
                        </div>
                        <div class="auth-modal__footer">
                            <p class="auth-modal__switch">
                                Remember your password? 
                                <button type="button" class="auth-link" onclick="window.LearnTAVAuthUI.showLoginModal()">Sign In</button>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal(modalHTML);
            this.setupRealTimeValidation('reset-form');
        }

        // ===================================================================
        // Form Handlers
        // ===================================================================
        
        async handleRegister(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth) {
                this.showError('Authentication system not available');
                return;
            }

            const form = event.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Show loading state
            this.setFormLoading(form, true);

            try {
                await window.LearnTAVAuth.register(data);
                this.closeModal();
                this.showSuccess('Account created successfully! Welcome to LearnTAV!');
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.setFormLoading(form, false);
            }
        }

        async handleLogin(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth) {
                this.showError('Authentication system not available');
                return;
            }

            const form = event.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Show loading state
            this.setFormLoading(form, true);

            try {
                await window.LearnTAVAuth.login(data);
                this.closeModal();
                this.showSuccess('Welcome back!');
                
                // Handle redirect if needed
                if (window.LearnTAVAccessControl) {
                    window.LearnTAVAccessControl.handleSuccessfulLogin();
                }
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.setFormLoading(form, false);
            }
        }

        async handleReset(event) {
            event.preventDefault();
            
            if (!window.LearnTAVAuth) {
                this.showError('Authentication system not available');
                return;
            }

            const form = event.target;
            const formData = new FormData(form);
            const email = formData.get('email');

            // Show loading state
            this.setFormLoading(form, true);

            try {
                await window.LearnTAVAuth.initiatePasswordReset(email);
                this.closeModal();
                this.showSuccess('Reset instructions sent! Check your email.');
            } catch (error) {
                this.showError(error.message);
            } finally {
                this.setFormLoading(form, false);
            }
        }

        // ===================================================================
        // Form Validation & UI Helpers
        // ===================================================================
        
        setupPasswordStrengthMeter() {
            const passwordInput = document.getElementById('register-password');
            const strengthMeter = document.getElementById('password-strength');
            
            if (!passwordInput || !strengthMeter) return;

            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthMeter.className = `auth-form__password-strength auth-form__password-strength--${strength.level}`;
                strengthMeter.innerHTML = `
                    <div class="password-strength-bar">
                        <div class="password-strength-fill" style="width: ${strength.score}%"></div>
                    </div>
                    <span class="password-strength-text">${strength.text}</span>
                `;
            });
        }

        calculatePasswordStrength(password) {
            let score = 0;
            let level = 'weak';
            let text = 'Weak';

            if (password.length >= 8) score += 20;
            if (password.length >= 12) score += 10;
            if (/[a-z]/.test(password)) score += 15;
            if (/[A-Z]/.test(password)) score += 15;
            if (/\d/.test(password)) score += 15;
            if (/[@$!%*?&]/.test(password)) score += 25;

            if (score >= 80) {
                level = 'strong';
                text = 'Strong';
            } else if (score >= 60) {
                level = 'medium';
                text = 'Medium';
            } else if (score >= 40) {
                level = 'fair';
                text = 'Fair';
            }

            return { score, level, text };
        }

        setupRealTimeValidation(formId) {
            const form = document.getElementById(formId);
            if (!form) return;

            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }

        validateField(input) {
            const value = input.value.trim();
            const type = input.type;
            const name = input.name;
            let isValid = true;
            let message = '';

            // Required field validation
            if (input.hasAttribute('required') && !value) {
                isValid = false;
                message = `${this.getFieldLabel(input)} is required`;
            }
            // Email validation
            else if (type === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            // Password confirmation
            else if (name === 'confirmPassword') {
                const passwordInput = input.form.querySelector('input[name="password"]');
                if (passwordInput && value !== passwordInput.value) {
                    isValid = false;
                    message = 'Passwords do not match';
                }
            }
            // Minimum length
            else if (input.minLength && value.length < input.minLength) {
                isValid = false;
                message = `${this.getFieldLabel(input)} must be at least ${input.minLength} characters`;
            }

            if (isValid) {
                this.setFieldValid(input);
            } else {
                this.setFieldError(input, message);
            }

            return isValid;
        }

        setFieldError(input, message) {
            input.classList.add('auth-form__input--error');
            input.classList.remove('auth-form__input--valid');
            
            const errorElement = input.parentNode.querySelector('.auth-form__error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('auth-form__error--visible');
            }
        }

        setFieldValid(input) {
            input.classList.remove('auth-form__input--error');
            input.classList.add('auth-form__input--valid');
            this.clearFieldError(input);
        }

        clearFieldError(input) {
            const errorElement = input.parentNode.querySelector('.auth-form__error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('auth-form__error--visible');
            }
        }

        getFieldLabel(input) {
            const label = input.parentNode.querySelector('.auth-form__label');
            return label ? label.textContent.replace('*', '').trim() : input.name;
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
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

        setFormLoading(form, loading) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            if (loading) {
                submitButton.classList.add('auth-btn--loading');
                submitButton.disabled = true;
            } else {
                submitButton.classList.remove('auth-btn--loading');
                submitButton.disabled = false;
            }
        }

        // ===================================================================
        // Modal Management
        // ===================================================================
        
        showModal(html) {
            const container = document.getElementById('auth-modal-container');
            container.innerHTML = html;
            container.classList.add('auth-modal-container--active');
            document.body.classList.add('auth-modal-open');
            
            // Focus first input
            setTimeout(() => {
                const firstInput = container.querySelector('input:not([type="hidden"]):not([type="checkbox"])');
                if (firstInput) firstInput.focus();
            }, 300);
        }

        closeModal() {
            const container = document.getElementById('auth-modal-container');
            container.classList.remove('auth-modal-container--active');
            document.body.classList.remove('auth-modal-open');
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 300);
        }

        // ===================================================================
        // Notification System
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

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `auth-notification auth-notification--${type}`;
            notification.innerHTML = `
                <div class="auth-notification__content">
                    <span class="auth-notification__icon">${this.getNotificationIcon(type)}</span>
                    <span class="auth-notification__message">${message}</span>
                    <button class="auth-notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;

            document.body.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);

            // Animate in
            setTimeout(() => {
                notification.classList.add('auth-notification--visible');
            }, 10);
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

        // ===================================================================
        // Global Styles
        // ===================================================================
        
        setupGlobalStyles() {
            if (document.getElementById('auth-ui-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'auth-ui-styles';
            styles.textContent = this.getAuthStyles();
            document.head.appendChild(styles);
        }

        getAuthStyles() {
            return `
                /* Auth Modal Styles - Comprehensive and Modern */
                .auth-modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .auth-modal-container--active {
                    pointer-events: all;
                    opacity: 1;
                }

                .auth-modal-open {
                    overflow: hidden;
                }

                .auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .auth-modal {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                    max-width: 480px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    transform: scale(0.9);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .auth-modal-container--active .auth-modal {
                    transform: scale(1);
                }

                .auth-modal__header {
                    padding: 32px 32px 0;
                    position: relative;
                }

                .auth-modal__title {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-primary, #1f2937);
                    margin: 0 0 8px 0;
                    text-align: center;
                }

                .auth-modal__close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-muted, #9ca3af);
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .auth-modal__close:hover {
                    background: var(--gray-100, #f3f4f6);
                    color: var(--text-primary, #1f2937);
                }

                .auth-modal__body {
                    padding: 24px 32px;
                }

                .auth-modal__footer {
                    padding: 0 32px 32px;
                    text-align: center;
                }

                .auth-modal__description {
                    color: var(--text-secondary, #6b7280);
                    text-align: center;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }

                .auth-modal__switch {
                    margin: 0;
                    color: var(--text-secondary, #6b7280);
                }

                /* Welcome Modal Specific */
                .auth-modal--welcome {
                    max-width: 520px;
                }

                .auth-modal__logo-text {
                    background: linear-gradient(135deg, var(--primary, #2563eb), var(--accent, #6366f1));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-size: 24px;
                    font-weight: 800;
                }

                .welcome-content {
                    text-align: center;
                }

                .welcome-icon {
                    font-size: 64px;
                    margin-bottom: 24px;
                }

                .welcome-content h2 {
                    font-size: 32px;
                    font-weight: 800;
                    margin-bottom: 16px;
                    color: var(--text-primary, #1f2937);
                }

                .welcome-content p {
                    font-size: 18px;
                    color: var(--text-secondary, #6b7280);
                    line-height: 1.6;
                    margin-bottom: 32px;
                }

                .welcome-features {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .welcome-feature {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .welcome-feature__icon {
                    font-size: 32px;
                }

                .welcome-feature span:last-child {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary, #1f2937);
                }

                /* Form Styles */
                .auth-form {
                    max-width: none;
                }

                .auth-form__group {
                    margin-bottom: 24px;
                }

                .auth-form__row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .auth-form__label {
                    display: block;
                    font-weight: 600;
                    color: var(--text-primary, #1f2937);
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .auth-form__input-wrapper {
                    position: relative;
                }

                .auth-form__input {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid var(--gray-300, #d1d5db);
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    background: white;
                }

                .auth-form__input:focus {
                    outline: none;
                    border-color: var(--primary, #2563eb);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .auth-form__input--error {
                    border-color: var(--error, #dc2626);
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }

                .auth-form__input--valid {
                    border-color: var(--success, #059669);
                }

                .auth-form__toggle-password {
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

                .auth-form__toggle-password:hover {
                    opacity: 1;
                }

                .auth-form__error {
                    color: var(--error, #dc2626);
                    font-size: 14px;
                    margin-top: 8px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .auth-form__error--visible {
                    opacity: 1;
                }

                .auth-form__password-strength {
                    margin-top: 12px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .auth-form__password-strength:not(:empty) {
                    opacity: 1;
                }

                .password-strength-bar {
                    height: 4px;
                    background: var(--gray-200, #e5e7eb);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .password-strength-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                    border-radius: 2px;
                }

                .auth-form__password-strength--weak .password-strength-fill {
                    background: var(--error, #dc2626);
                }

                .auth-form__password-strength--fair .password-strength-fill {
                    background: var(--warning, #d97706);
                }

                .auth-form__password-strength--medium .password-strength-fill {
                    background: var(--info, #0891b2);
                }

                .auth-form__password-strength--strong .password-strength-fill {
                    background: var(--success, #059669);
                }

                .password-strength-text {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary, #6b7280);
                }

                /* Checkbox Styles */
                .auth-form__group--checkbox {
                    margin-bottom: 16px;
                }

                .auth-form__checkbox-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    font-size: 14px;
                    color: var(--text-secondary, #6b7280);
                }

                .auth-form__checkbox {
                    display: none;
                }

                .auth-form__checkbox-custom {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--gray-300, #d1d5db);
                    border-radius: 4px;
                    margin-right: 12px;
                    flex-shrink: 0;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .auth-form__checkbox:checked + .auth-form__checkbox-custom {
                    background: var(--primary, #2563eb);
                    border-color: var(--primary, #2563eb);
                }

                .auth-form__checkbox:checked + .auth-form__checkbox-custom::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }

                /* Button Styles */
                .auth-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    border: none;
                    position: relative;
                    overflow: hidden;
                }

                .auth-btn--primary {
                    background: linear-gradient(135deg, var(--primary, #2563eb), var(--primary-dark, #1d4ed8));
                    color: white;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .auth-btn--primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
                }

                .auth-btn--ghost {
                    background: transparent;
                    color: var(--primary, #2563eb);
                    border: 2px solid var(--primary, #2563eb);
                }

                .auth-btn--ghost:hover {
                    background: var(--primary, #2563eb);
                    color: white;
                }

                .auth-btn--large {
                    padding: 16px 32px;
                    font-size: 18px;
                }

                .auth-btn--full {
                    width: 100%;
                }

                .auth-btn--loading .auth-btn__text {
                    opacity: 0;
                }

                .auth-btn--loading .auth-btn__loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 1;
                }

                .auth-btn__loading {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .auth-btn__text {
                    transition: opacity 0.2s ease;
                }

                .auth-link {
                    background: none;
                    border: none;
                    color: var(--primary, #2563eb);
                    cursor: pointer;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s ease;
                }

                .auth-link:hover {
                    color: var(--primary-dark, #1d4ed8);
                    text-decoration: underline;
                }

                /* Notification Styles */
                .auth-notification {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 10001;
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .auth-notification--visible {
                    transform: translateX(0);
                }

                .auth-notification__content {
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-left: 4px solid;
                }

                .auth-notification--success .auth-notification__content {
                    border-left-color: var(--success, #059669);
                }

                .auth-notification--error .auth-notification__content {
                    border-left-color: var(--error, #dc2626);
                }

                .auth-notification--info .auth-notification__content {
                    border-left-color: var(--info, #0891b2);
                }

                .auth-notification__icon {
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .auth-notification__message {
                    flex: 1;
                    font-weight: 500;
                    color: var(--text-primary, #1f2937);
                }

                .auth-notification__close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: var(--text-muted, #9ca3af);
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

                .auth-notification__close:hover {
                    background: var(--gray-100, #f3f4f6);
                    color: var(--text-primary, #1f2937);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .auth-modal-overlay {
                        padding: 16px;
                    }

                    .auth-modal {
                        max-height: 95vh;
                    }

                    .auth-modal__header {
                        padding: 24px 24px 0;
                    }

                    .auth-modal__body {
                        padding: 20px 24px;
                    }

                    .auth-modal__footer {
                        padding: 0 24px 24px;
                    }

                    .auth-modal__title {
                        font-size: 24px;
                    }

                    .welcome-features {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .auth-notification {
                        top: 16px;
                        right: 16px;
                        left: 16px;
                        max-width: none;
                    }
                }

                /* Animations */
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                /* Accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .auth-modal-container,
                    .auth-modal,
                    .auth-notification {
                        transition: none;
                    }
                }
            `;
        }

        bindEventListeners() {
            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.querySelector('.auth-modal-container--active')) {
                    this.closeModal();
                }
            });
        }

        // ===================================================================
        // Modern User Menu Implementation
        // ===================================================================
        
        initializeModernUserMenu() {
            this.createModernUserMenu();
            this.setupModernUserMenuEvents();
        }

        createModernUserMenu() {
            // Find existing user menu and replace with modern version
            const existingUserMenu = document.querySelector('.user-menu');
            if (!existingUserMenu) return;

            const modernUserMenu = this.buildModernUserMenu();
            existingUserMenu.parentNode.replaceChild(modernUserMenu, existingUserMenu);
        }

        buildModernUserMenu() {
            const userMenu = document.createElement('div');
            userMenu.className = 'auth-user-menu';
            userMenu.setAttribute('data-auth-state', 'logged-in');
            userMenu.style.display = 'none';

            userMenu.innerHTML = `
                <button class="auth-user-menu__trigger" aria-expanded="false" onclick="window.LearnTAVAuthUI.toggleUserMenu()">
                    <div class="auth-user-menu__avatar">
                        <span data-user-initials>U</span>
                    </div>
                    <div class="auth-user-menu__info">
                        <div class="auth-user-menu__name" data-user-name>User</div>
                        <div class="auth-user-menu__role" data-user-role>Member</div>
                    </div>
                    <svg class="auth-user-menu__chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                <div class="auth-user-menu__dropdown" id="modernUserMenuDropdown">
                    <div class="auth-user-menu__dropdown-header">
                        <div class="auth-user-menu__dropdown-user">
                            <div class="auth-user-menu__dropdown-avatar">
                                <span data-user-initials>U</span>
                            </div>
                            <div class="auth-user-menu__dropdown-info">
                                <h3 data-user-name>User</h3>
                                <p data-user-email>user@example.com</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="auth-user-menu__dropdown-body">
                        <div class="auth-user-menu__dropdown-section">
                            <div class="auth-user-menu__dropdown-section-title">Account</div>
                            <button class="auth-user-menu__item" onclick="window.location.href='/settings/'">
                                <svg class="auth-user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <div class="auth-user-menu__item-content">
                                    <div class="auth-user-menu__item-title">Settings</div>
                                    <div class="auth-user-menu__item-description">Manage your account preferences</div>
                                </div>
                            </button>
                            
                            <button class="auth-user-menu__item" onclick="window.LearnTAVAuthUI.showProfileModal()">
                                <svg class="auth-user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                <div class="auth-user-menu__item-content">
                                    <div class="auth-user-menu__item-title">Profile</div>
                                    <div class="auth-user-menu__item-description">View and edit your profile</div>
                                </div>
                            </button>
                        </div>

                        <div class="auth-user-menu__dropdown-section">
                            <div class="auth-user-menu__dropdown-section-title">Support</div>
                            <button class="auth-user-menu__item" onclick="window.location.href='/contact/'">
                                <svg class="auth-user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div class="auth-user-menu__item-content">
                                    <div class="auth-user-menu__item-title">Help & Support</div>
                                    <div class="auth-user-menu__item-description">Get help and contact support</div>
                                </div>
                            </button>
                        </div>

                        <div class="auth-user-menu__dropdown-section">
                            <button class="auth-user-menu__item danger" data-auth-action="logout">
                                <svg class="auth-user-menu__item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                </svg>
                                <div class="auth-user-menu__item-content">
                                    <div class="auth-user-menu__item-title">Sign Out</div>
                                    <div class="auth-user-menu__item-description">Sign out of your account</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            return userMenu;
        }

        setupModernUserMenuEvents() {
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const userMenu = document.querySelector('.auth-user-menu');
                if (userMenu && !userMenu.contains(e.target)) {
                    this.closeUserMenu();
                }
            });
        }

        toggleUserMenu() {
            const trigger = document.querySelector('.auth-user-menu__trigger');
            const dropdown = document.querySelector('.auth-user-menu__dropdown');
            
            if (!trigger || !dropdown) return;

            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            
            trigger.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('active', !isExpanded);
        }

        closeUserMenu() {
            const trigger = document.querySelector('.auth-user-menu__trigger');
            const dropdown = document.querySelector('.auth-user-menu__dropdown');
            
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            if (dropdown) dropdown.classList.remove('active');
        }

        updateUserMenuInfo(user) {
            if (!user) return;

            // Update all user name displays
            document.querySelectorAll('[data-user-name]').forEach(el => {
                el.textContent = user.fullName || user.name || 'User';
            });

            // Update all user email displays
            document.querySelectorAll('[data-user-email]').forEach(el => {
                el.textContent = user.email || '';
            });

            // Update user initials
            const initials = this.getUserInitials(user.fullName || user.name || 'U');
            document.querySelectorAll('[data-user-initials]').forEach(el => {
                el.textContent = initials;
            });

            // Update user role
            document.querySelectorAll('[data-user-role]').forEach(el => {
                el.textContent = this.formatUserRole(user.role || 'member');
            });
        }

        getUserInitials(name) {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }

        formatUserRole(role) {
            const roleMap = {
                'admin': 'Administrator',
                'moderator': 'Moderator',
                'member': 'Member',
                'premium': 'Premium Member'
            };
            return roleMap[role] || 'Member';
        }

        showProfileModal() {
            // Placeholder for profile modal
            this.showInfo('Profile modal coming soon!');
        }
    }

    // ===================================================================
    // Initialize Auth UI
    // ===================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuthUI);
    } else {
        initializeAuthUI();
    }

    function initializeAuthUI() {
        window.LearnTAVAuthUI = new AuthUI();
        
        // Wire up auth system UI methods
        if (window.LearnTAVAuth) {
            window.LearnTAVAuth.showWelcomeModal = () => window.LearnTAVAuthUI.showWelcomeModal();
            window.LearnTAVAuth.showRegisterModal = () => window.LearnTAVAuthUI.showRegisterModal();
            window.LearnTAVAuth.showLoginModal = () => window.LearnTAVAuthUI.showLoginModal();
            window.LearnTAVAuth.showResetModal = () => window.LearnTAVAuthUI.showResetModal();
            window.LearnTAVAuth.closeAuthModals = () => window.LearnTAVAuthUI.closeModal();
            
            // Wire up notification methods
            window.LearnTAVAuth.showLoadingState = (message) => console.log('Loading:', message);
            window.LearnTAVAuth.hideLoadingState = () => console.log('Loading complete');
            window.LearnTAVAuth.showSuccessMessage = (message) => window.LearnTAVAuthUI.showSuccess(message);
            window.LearnTAVAuth.showErrorMessage = (message) => window.LearnTAVAuthUI.showError(message);
            window.LearnTAVAuth.showInfoMessage = (message) => window.LearnTAVAuthUI.showInfo(message);
        }
        
        // Initialize modern user menu
        window.LearnTAVAuthUI.initializeModernUserMenu();
    }

})();