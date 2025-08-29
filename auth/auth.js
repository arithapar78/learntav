/**
 * Authentication Modal System
 * Handles user sign-in, sign-up, and authentication UI
 */

import { supabase, signUp, signIn, resetPassword, authState, initAuth } from './supabase-client.js'
import { PasswordValidator } from '../assets/js/password-validator.js'

class AuthModal {
  constructor() {
    this.isOpen = true // Modal is shown by default on auth page
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
    this.getModalElements()
    this.bindEvents()
    this.setupPasswordValidation()
    
    // Make modal globally accessible
    window.authModal = this
  }
  
  /**
   * Get existing modal elements from HTML
   */
  getModalElements() {
    this.modal = document.querySelector('.auth-modal')
    this.overlay = document.querySelector('.auth-overlay')
  }
  
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.auth-tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.closest('.auth-tab-button').dataset.tab
        this.switchTab(tabName)
      })
    })
    
    // Close modal
    const closeButton = document.querySelector('.auth-close-button')
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide()
      })
    }
    
    // Close modal when clicking overlay
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide()
        }
      })
    }
    
    // Form submissions
    const signinForm = document.getElementById('signin-form')
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignIn(new FormData(e.target))
      })
    }
    
    const signupForm = document.getElementById('signup-form')
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignUp(new FormData(e.target))
      })
    }
    
    // Forgot password
    const forgotBtn = document.getElementById('forgot-password-btn')
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        this.handleForgotPassword()
      })
    }
    
    // Password toggles
    document.querySelectorAll('.auth-password-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target.closest('.auth-password-toggle').dataset.target
        this.togglePasswordVisibility(target)
      })
    })
    
    // Social login buttons
    document.querySelectorAll('.auth-social-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const provider = e.target.closest('.auth-social-button').dataset.provider
        if (provider) {
          this.handleSocialLogin(provider)
        }
      })
    })
    
    // Create Account link in footer
    const createAccountLink = document.getElementById('create-account-link')
    if (createAccountLink) {
      createAccountLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.switchTab('signup')
      })
    }
    
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
    // Update tab buttons
    document.querySelectorAll('.auth-tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    
    const newActiveTab = document.querySelector(`[data-tab="${tabName}"]`)
    if (newActiveTab) {
      newActiveTab.classList.add('active')
    }
    
    // Update content
    document.querySelectorAll('.auth-tab-content').forEach(content => {
      content.classList.remove('active')
    })
    
    const newContent = document.getElementById(`${tabName}-tab`)
    if (newContent) {
      newContent.classList.add('active')
    }
    
    // Clear errors
    this.clearErrors()
    
    // Focus first input
    setTimeout(() => {
      const firstInput = document.querySelector(`#${tabName}-tab input:not([type="checkbox"])`)
      if (firstInput) {
        firstInput.focus()
      }
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
    // For auth page, redirect to home instead of hiding
    window.location.href = '../index.html'
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
    
    if (!input || !button) return
    
    if (input.type === 'password') {
      input.type = 'text'
      button.textContent = '🙈'
    } else {
      input.type = 'password'
      button.textContent = '👁️'
    }
  }
  
  /**
   * Enhanced loading state for button with animations
   */
  setLoadingState(button, loading) {
    const buttonText = button.querySelector('.button-text')
    
    if (loading) {
      button.disabled = true
      button.classList.add('loading')
      if (buttonText) {
        buttonText.textContent = 'Processing...'
      }
    } else {
      button.disabled = false
      button.classList.remove('loading')
      if (buttonText) {
        // Reset text based on form type
        if (button.closest('#signin-form')) {
          buttonText.textContent = 'Sign In'
        } else if (button.closest('#signup-form')) {
          buttonText.textContent = 'Create Account'
        }
      }
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