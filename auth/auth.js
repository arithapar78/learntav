/**
 * Authentication Modal System
 * Handles user sign-in, sign-up, and authentication UI
 */

import { supabase, signUp, signIn, resetPassword, authState, initAuth } from './supabase-client.js'
import { PasswordValidator } from '../assets/js/password-validator.js'

class AuthModal {
  constructor() {
    this.isOpen = false
    this.currentTab = 'signin'
    this.passwordValidator = new PasswordValidator()
    this.modal = null
    this.overlay = null
    this.init()
  }
  
  /**
   * Initialize the authentication modal
   */
  init() {
    this.createModal()
    this.bindEvents()
    this.setupPasswordValidation()
    
    // Make modal globally accessible
    window.authModal = this
  }
  
  /**
   * Create modal HTML structure
   */
  createModal() {
    const modalHTML = `
      <div id="auth-overlay" class="auth-overlay">
        <div id="auth-modal" class="auth-modal">
          <div class="auth-modal-content">
            <div class="auth-modal-header">
              <div class="auth-tabs">
                <button class="auth-tab-button active" data-tab="signin" type="button">
                  <span class="tab-icon">🔐</span>
                  Sign In
                </button>
                <button class="auth-tab-button" data-tab="signup" type="button">
                  <span class="tab-icon">👤</span>
                  Create Account
                </button>
              </div>
              <button class="auth-close-button" type="button" aria-label="Close authentication modal">
                <span>&times;</span>
              </button>
            </div>
            
            <div class="auth-modal-body">
              <!-- Sign In Form -->
              <div id="signin-tab" class="auth-tab-content active">
                <div class="auth-form-header">
                  <h2>Welcome Back!</h2>
                  <p>Sign in to access your personalized learning experience</p>
                </div>
                
                <form id="signin-form" class="auth-form" novalidate>
                  <div class="auth-form-group">
                    <label for="signin-email" class="auth-form-label">Email Address</label>
                    <div class="auth-input-wrapper">
                      <input type="email" 
                             id="signin-email" 
                             name="email" 
                             class="auth-form-input" 
                             placeholder="your@email.com"
                             required 
                             autocomplete="email">
                      <span class="auth-input-icon">📧</span>
                    </div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="signin-password" class="auth-form-label">Password</label>
                    <div class="auth-input-wrapper">
                      <input type="password" 
                             id="signin-password" 
                             name="password" 
                             class="auth-form-input" 
                             placeholder="Enter your password"
                             required 
                             autocomplete="current-password">
                      <span class="auth-input-icon">🔒</span>
                      <button type="button" class="auth-password-toggle" data-target="signin-password">
                        <span class="show-text">👁️</span>
                        <span class="hide-text" style="display: none;">🙈</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="auth-form-options">
                    <label class="auth-checkbox-wrapper">
                      <input type="checkbox" name="remember" class="auth-checkbox">
                      <span class="auth-checkmark"></span>
                      <span class="auth-checkbox-label">Remember me</span>
                    </label>
                    <button type="button" class="auth-forgot-password" id="forgot-password-btn">
                      Forgot Password?
                    </button>
                  </div>
                  
                  <div class="auth-form-actions">
                    <button type="submit" class="auth-submit-button auth-submit-primary">
                      <span class="button-text">Sign In</span>
                      <span class="button-loader" style="display: none;">🔄</span>
                    </button>
                  </div>
                  
                  <div class="auth-error-message" id="signin-error" style="display: none;"></div>
                </form>
                
                <div class="auth-social-login">
                  <div class="auth-divider">
                    <span>or continue with</span>
                  </div>
                  <div class="auth-social-buttons">
                    <button type="button" class="auth-social-button" data-provider="google">
                      <span class="social-icon">🔍</span>
                      Google
                    </button>
                    <button type="button" class="auth-social-button" data-provider="github">
                      <span class="social-icon">🐱</span>
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Sign Up Form -->
              <div id="signup-tab" class="auth-tab-content">
                <div class="auth-form-header">
                  <h2>Join LearnTAV</h2>
                  <p>Create your account to start your AI learning journey</p>
                </div>
                
                <form id="signup-form" class="auth-form" novalidate>
                  <div class="auth-form-group">
                    <label for="signup-fullname" class="auth-form-label">Full Name</label>
                    <div class="auth-input-wrapper">
                      <input type="text" 
                             id="signup-fullname" 
                             name="fullName" 
                             class="auth-form-input" 
                             placeholder="Your full name"
                             required 
                             autocomplete="name">
                      <span class="auth-input-icon">👤</span>
                    </div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="signup-email" class="auth-form-label">Email Address</label>
                    <div class="auth-input-wrapper">
                      <input type="email" 
                             id="signup-email" 
                             name="email" 
                             class="auth-form-input" 
                             placeholder="your@email.com"
                             required 
                             autocomplete="email">
                      <span class="auth-input-icon">📧</span>
                    </div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="signup-password" class="auth-form-label">Password</label>
                    <div class="auth-input-wrapper">
                      <input type="password" 
                             id="signup-password" 
                             name="password" 
                             class="auth-form-input" 
                             placeholder="Create a strong password"
                             required 
                             autocomplete="new-password">
                      <span class="auth-input-icon">🔒</span>
                      <button type="button" class="auth-password-toggle" data-target="signup-password">
                        <span class="show-text">👁️</span>
                        <span class="hide-text" style="display: none;">🙈</span>
                      </button>
                    </div>
                    <div id="signup-password-requirements" class="password-requirements-container"></div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="signup-confirm-password" class="auth-form-label">Confirm Password</label>
                    <div class="auth-input-wrapper">
                      <input type="password" 
                             id="signup-confirm-password" 
                             name="confirmPassword" 
                             class="auth-form-input" 
                             placeholder="Confirm your password"
                             required 
                             autocomplete="new-password">
                      <span class="auth-input-icon">🔐</span>
                    </div>
                    <div id="signup-password-match" class="password-match-container"></div>
                  </div>
                  
                  <div class="auth-form-actions">
                    <button type="submit" class="auth-submit-button auth-submit-primary" disabled>
                      <span class="button-text">Create Account</span>
                      <span class="button-loader" style="display: none;">🔄</span>
                    </button>
                  </div>
                  
                  <div class="auth-error-message" id="signup-error" style="display: none;"></div>
                </form>
              </div>
            </div>
            
            <div class="auth-modal-footer">
              <p class="auth-footer-text">
                Not a user? 
                <a href="/admin/index.html" class="auth-admin-link">Access Admin Panel</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
    
    // Insert modal into document
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Get references
    this.modal = document.getElementById('auth-modal')
    this.overlay = document.getElementById('auth-overlay')
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.auth-tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })
    
    // Close modal
    document.querySelector('.auth-close-button').addEventListener('click', () => {
      this.hide()
    })
    
    // Close modal when clicking overlay
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide()
      }
    })
    
    // Form submissions
    document.getElementById('signin-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSignIn(new FormData(e.target))
    })
    
    document.getElementById('signup-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSignUp(new FormData(e.target))
    })
    
    // Forgot password
    document.getElementById('forgot-password-btn').addEventListener('click', () => {
      this.handleForgotPassword()
    })
    
    // Password toggles
    document.querySelectorAll('.auth-password-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        this.togglePasswordVisibility(e.target.dataset.target)
      })
    })
    
    // Social login buttons
    document.querySelectorAll('.auth-social-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleSocialLogin(e.target.dataset.provider)
      })
    })
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide()
      }
    })
  }
  
  /**
   * Set up password validation
   */
  setupPasswordValidation() {
    const passwordInput = document.getElementById('signup-password')
    const confirmInput = document.getElementById('signup-confirm-password')
    const submitButton = document.querySelector('#signup-form .auth-submit-button')
    
    // Create password requirements UI
    this.passwordValidator.createValidationUI('signup-password-requirements', {
      showStrengthBar: true,
      showRequirements: true,
      className: 'auth-password-requirements'
    })
    
    // Password strength validation
    passwordInput.addEventListener('input', (e) => {
      const isValid = this.passwordValidator.updateValidationUI(e.target.value, 'signup-password-requirements')
      this.updateSubmitButtonState()
    })
    
    // Password confirmation validation
    confirmInput.addEventListener('input', () => {
      this.passwordValidator.updatePasswordMatchUI(
        passwordInput.value, 
        confirmInput.value, 
        'signup-password-match'
      )
      this.updateSubmitButtonState()
    })
  }
  
  /**
   * Update submit button state based on validation
   */
  updateSubmitButtonState() {
    const passwordInput = document.getElementById('signup-password')
    const confirmInput = document.getElementById('signup-confirm-password')
    const submitButton = document.querySelector('#signup-form .auth-submit-button')
    
    const isPasswordValid = this.passwordValidator.isPasswordAcceptable(passwordInput.value)
    const passwordsMatch = passwordInput.value === confirmInput.value && passwordInput.value.length > 0
    
    submitButton.disabled = !(isPasswordValid && passwordsMatch)
    
    if (submitButton.disabled) {
      submitButton.classList.add('disabled')
    } else {
      submitButton.classList.remove('disabled')
    }
  }
  
  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')
    
    // Update tab content
    document.querySelectorAll('.auth-tab-content').forEach(content => {
      content.classList.remove('active')
    })
    document.getElementById(`${tabName}-tab`).classList.add('active')
    
    // Clear errors
    this.clearErrors()
    
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector(`#${tabName}-tab input:not([type="checkbox"])`)
      if (firstInput) firstInput.focus()
    }, 100)
    
    this.currentTab = tabName
  }
  
  /**
   * Show the modal
   */
  show(tab = 'signin') {
    if (this.isOpen) return
    
    this.isOpen = true
    this.overlay.classList.add('active')
    this.modal.classList.add('active')
    document.body.style.overflow = 'hidden'
    
    // Switch to requested tab
    if (tab !== this.currentTab) {
      this.switchTab(tab)
    }
    
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector(`#${this.currentTab}-tab input:not([type="checkbox"])`)
      if (firstInput) firstInput.focus()
    }, 300)
  }
  
  /**
   * Hide the modal
   */
  hide() {
    if (!this.isOpen) return
    
    this.isOpen = false
    this.overlay.classList.remove('active')
    this.modal.classList.remove('active')
    document.body.style.overflow = ''
    
    // Clear forms and errors
    this.clearForms()
    this.clearErrors()
  }
  
  /**
   * Handle sign in
   */
  async handleSignIn(formData) {
    const submitButton = document.querySelector('#signin-form .auth-submit-button')
    const email = formData.get('email')
    const password = formData.get('password')
    
    this.clearErrors()
    this.setLoadingState(submitButton, true)
    
    try {
      const { data, error } = await signIn({ email, password })
      
      if (error) {
        throw error
      }
      
      // Success
      this.showSuccess('Welcome back! Redirecting...')
      
      // Hide modal after delay
      setTimeout(() => {
        this.hide()
        // Redirect or update UI
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      console.error('Sign in error:', error)
      this.showError('signin-error', this.getErrorMessage(error))
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Handle sign up
   */
  async handleSignUp(formData) {
    const submitButton = document.querySelector('#signup-form .auth-submit-button')
    const fullName = formData.get('fullName')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    this.clearErrors()
    
    // Validate passwords match
    if (password !== confirmPassword) {
      this.showError('signup-error', 'Passwords do not match')
      return
    }
    
    // Validate password strength
    if (!this.passwordValidator.isPasswordAcceptable(password)) {
      this.showError('signup-error', 'Password does not meet security requirements')
      return
    }
    
    this.setLoadingState(submitButton, true)
    
    try {
      const { data, error } = await signUp({ email, password, fullName })
      
      if (error) {
        throw error
      }
      
      // Success
      this.showSuccess('Account created! Please check your email to verify your account.')
      
      // Switch to sign in tab after delay
      setTimeout(() => {
        this.switchTab('signin')
        document.getElementById('signin-email').value = email
      }, 2000)
      
    } catch (error) {
      console.error('Sign up error:', error)
      this.showError('signup-error', this.getErrorMessage(error))
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Handle forgot password
   */
  async handleForgotPassword() {
    const email = document.getElementById('signin-email').value
    
    if (!email) {
      this.showError('signin-error', 'Please enter your email address first')
      return
    }
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        throw error
      }
      
      this.showSuccess('Password reset instructions sent to your email!')
      
    } catch (error) {
      console.error('Password reset error:', error)
      this.showError('signin-error', this.getErrorMessage(error))
    }
  }
  
  /**
   * Handle social login
   */
  async handleSocialLogin(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) {
        throw error
      }
      
    } catch (error) {
      console.error('Social login error:', error)
      this.showError('signin-error', `Failed to sign in with ${provider}`)
    }
  }
  
  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(targetId) {
    const input = document.getElementById(targetId)
    const button = document.querySelector(`[data-target="${targetId}"]`)
    const showIcon = button.querySelector('.show-text')
    const hideIcon = button.querySelector('.hide-text')
    
    if (input.type === 'password') {
      input.type = 'text'
      showIcon.style.display = 'none'
      hideIcon.style.display = 'inline'
    } else {
      input.type = 'password'
      showIcon.style.display = 'inline'
      hideIcon.style.display = 'none'
    }
  }
  
  /**
   * Set loading state for button
   */
  setLoadingState(button, loading) {
    const buttonText = button.querySelector('.button-text')
    const buttonLoader = button.querySelector('.button-loader')
    
    if (loading) {
      button.disabled = true
      button.classList.add('loading')
      buttonText.style.display = 'none'
      buttonLoader.style.display = 'inline'
    } else {
      button.disabled = false
      button.classList.remove('loading')
      buttonText.style.display = 'inline'
      buttonLoader.style.display = 'none'
    }
  }
  
  /**
   * Show error message
   */
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    errorElement.textContent = message
    errorElement.style.display = 'block'
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      errorElement.style.display = 'none'
    }, 10000)
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    // Create or update success element
    let successElement = document.querySelector('.auth-success-message')
    if (!successElement) {
      successElement = document.createElement('div')
      successElement.className = 'auth-success-message'
      document.querySelector('.auth-modal-body').prepend(successElement)
    }
    
    successElement.textContent = message
    successElement.style.display = 'block'
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      successElement.style.display = 'none'
    }, 5000)
  }
  
  /**
   * Clear all error messages
   */
  clearErrors() {
    document.querySelectorAll('.auth-error-message').forEach(el => {
      el.style.display = 'none'
    })
    
    document.querySelectorAll('.auth-success-message').forEach(el => {
      el.style.display = 'none'
    })
  }
  
  /**
   * Clear all forms
   */
  clearForms() {
    document.querySelectorAll('.auth-form').forEach(form => {
      form.reset()
    })
    
    // Clear password validation UI
    this.passwordValidator.removeValidationUI('signup-password-requirements')
    document.getElementById('signup-password-match').innerHTML = ''
    
    // Reset submit button state
    document.querySelector('#signup-form .auth-submit-button').disabled = true
  }
  
  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password. Please try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password must be at least 12 characters long.',
      'Invalid email': 'Please enter a valid email address.',
      'Signup is disabled': 'Account registration is currently disabled.',
      'Email rate limit exceeded': 'Too many requests. Please wait a moment and try again.'
    }
    
    const message = error.message || error.error_description || error
    return errorMessages[message] || `Authentication error: ${message}`
  }
}

// Initialize auth modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize auth state first
  initAuth()
  
  // Create auth modal
  new AuthModal()
  
  // Add auth trigger buttons throughout the site
  document.querySelectorAll('[data-auth-trigger]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const tab = button.dataset.authTrigger || 'signin'
      window.authModal.show(tab)
    })
  })
})

export { AuthModal }