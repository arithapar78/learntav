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
   * Enhanced tab switching with smooth animations
   */
  switchTab(tabName) {
    const currentActiveTab = document.querySelector('.auth-tab-button.active, .auth-tab.active')
    const newActiveTab = document.querySelector(`[data-tab="${tabName}"]`)
    const currentContent = document.querySelector('.auth-tab-content.active, .auth-form-container.active')
    const newContent = document.getElementById(`${tabName}-tab`) || document.getElementById(`${tabName}-form`)
    
    // Update tab buttons with animation
    document.querySelectorAll('.auth-tab-button, .auth-tab').forEach(btn => {
      btn.classList.remove('active')
      if (btn !== newActiveTab) {
        btn.style.transform = 'translateY(0)'
      }
    })
    
    if (newActiveTab) {
      newActiveTab.classList.add('active')
      newActiveTab.style.transform = 'translateY(-2px)'
    }
    
    // Animate content transition
    if (currentContent && newContent && currentContent !== newContent) {
      // Fade out current content
      currentContent.style.transform = 'translateX(-20px)'
      currentContent.style.opacity = '0'
      
      setTimeout(() => {
        currentContent.classList.remove('active')
        newContent.classList.add('active')
        
        // Fade in new content
        newContent.style.transform = 'translateX(20px)'
        newContent.style.opacity = '0'
        
        requestAnimationFrame(() => {
          newContent.style.transform = 'translateX(0)'
          newContent.style.opacity = '1'
        })
      }, 200)
    }
    
    // Clear errors with animation
    this.clearErrors()
    
    // Focus first input with delay for animation
    setTimeout(() => {
      const firstInput = document.querySelector(`#${tabName}-tab input:not([type="checkbox"]), #${tabName}-form input:not([type="checkbox"])`)
      if (firstInput) {
        firstInput.focus()
        firstInput.style.transform = 'scale(1.02)'
        setTimeout(() => {
          firstInput.style.transform = 'scale(1)'
        }, 200)
      }
    }, 300)
    
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
   * Enhanced password visibility toggle with animations
   */
  togglePasswordVisibility(targetId) {
    const input = document.getElementById(targetId)
    const button = document.querySelector(`[data-target="${targetId}"]`)
    const showIcon = button.querySelector('.show-text, .toggle-show')
    const hideIcon = button.querySelector('.hide-text, .toggle-hide')
    
    // Add animation to button
    button.style.transform = 'scale(0.9) rotate(180deg)'
    
    setTimeout(() => {
      if (input.type === 'password') {
        input.type = 'text'
        if (showIcon) showIcon.style.display = 'none'
        if (hideIcon) hideIcon.style.display = 'inline'
        
        // Add visual feedback to input
        input.style.borderColor = 'var(--auth-warning)'
        input.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)'
        
      } else {
        input.type = 'password'
        if (showIcon) showIcon.style.display = 'inline'
        if (hideIcon) hideIcon.style.display = 'none'
        
        // Reset input visual feedback
        input.style.borderColor = ''
        input.style.boxShadow = ''
      }
      
      // Reset button animation
      button.style.transform = 'scale(1) rotate(0deg)'
    }, 150)
    
    // Add haptic-like feedback
    button.style.background = 'var(--auth-primary)'
    button.style.color = 'var(--auth-white)'
    setTimeout(() => {
      button.style.background = ''
      button.style.color = ''
    }, 200)
  }
  
  /**
   * Enhanced loading state for button with animations
   */
  setLoadingState(button, loading) {
    const buttonContent = button.querySelector('.button-content')
    const buttonLoader = button.querySelector('.button-loader')
    const buttonText = button.querySelector('.button-text')
    const buttonIcon = button.querySelector('.button-icon')
    
    if (loading) {
      button.disabled = true
      button.classList.add('loading')
      
      // Animate content out
      if (buttonContent) {
        buttonContent.style.transform = 'translateY(-20px)'
        buttonContent.style.opacity = '0'
        setTimeout(() => {
          buttonContent.style.display = 'none'
          if (buttonLoader) {
            buttonLoader.style.display = 'flex'
            buttonLoader.style.transform = 'translateY(20px)'
            buttonLoader.style.opacity = '0'
            requestAnimationFrame(() => {
              buttonLoader.style.transform = 'translateY(0)'
              buttonLoader.style.opacity = '1'
            })
          }
        }, 150)
      }
      
      // Add loading animation class
      button.style.background = 'linear-gradient(135deg, var(--auth-primary-light), var(--auth-primary))'
      
    } else {
      button.disabled = false
      button.classList.remove('loading')
      
      // Animate content back in
      if (buttonLoader) {
        buttonLoader.style.transform = 'translateY(-20px)'
        buttonLoader.style.opacity = '0'
        setTimeout(() => {
          buttonLoader.style.display = 'none'
          if (buttonContent) {
            buttonContent.style.display = 'flex'
            buttonContent.style.transform = 'translateY(20px)'
            buttonContent.style.opacity = '0'
            requestAnimationFrame(() => {
              buttonContent.style.transform = 'translateY(0)'
              buttonContent.style.opacity = '1'
            })
          }
        }, 150)
      }
      
      // Reset button styles
      button.style.background = ''
    }
  }
  
  /**
   * Enhanced error message display with animations
   */
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    
    // Set message content with icon
    const messageIcon = '⚠️'
    errorElement.innerHTML = `<span class="message-icon">${messageIcon}</span><span class="message-text">${message}</span>`
    
    // Animate in
    errorElement.style.display = 'block'
    errorElement.style.transform = 'translateY(-10px) scale(0.95)'
    errorElement.style.opacity = '0'
    
    requestAnimationFrame(() => {
      errorElement.style.transform = 'translateY(0) scale(1)'
      errorElement.style.opacity = '1'
    })
    
    // Add shake animation for emphasis
    errorElement.style.animation = 'shake 0.5s ease-in-out'
    
    // Auto-hide after 8 seconds with fade out
    setTimeout(() => {
      errorElement.style.transform = 'translateY(-10px) scale(0.95)'
      errorElement.style.opacity = '0'
      setTimeout(() => {
        errorElement.style.display = 'none'
        errorElement.style.animation = ''
      }, 300)
    }, 8000)
  }
  
  /**
   * Enhanced success message with animations
   */
  showSuccess(message) {
    // Create or update success element
    let successElement = document.querySelector('.auth-success-message')
    if (!successElement) {
      successElement = document.createElement('div')
      successElement.className = 'auth-success-message'
      const modalBody = document.querySelector('.auth-modal-body') || document.querySelector('.auth-card')
      if (modalBody) {
        modalBody.insertBefore(successElement, modalBody.firstChild)
      }
    }
    
    // Set message content with icon
    const messageIcon = '✅'
    successElement.innerHTML = `<span class="message-icon">${messageIcon}</span><span class="message-text">${message}</span>`
    
    // Animate in
    successElement.style.display = 'block'
    successElement.style.transform = 'translateY(-10px) scale(0.95)'
    successElement.style.opacity = '0'
    
    requestAnimationFrame(() => {
      successElement.style.transform = 'translateY(0) scale(1)'
      successElement.style.opacity = '1'
    })
    
    // Add success pulse animation
    successElement.style.animation = 'successPulse 0.6s ease-out'
    
    // Auto-hide after 6 seconds with fade out
    setTimeout(() => {
      successElement.style.transform = 'translateY(-10px) scale(0.95)'
      successElement.style.opacity = '0'
      setTimeout(() => {
        successElement.style.display = 'none'
        successElement.style.animation = ''
      }, 300)
    }, 6000)
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