/**
 * Standalone Authentication System
 * Complete authentication UI with working functionality
 */

class AuthModal {
  constructor() {
    this.isOpen = true // Modal is shown by default on auth page
    this.currentTab = 'signin'
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
    
    // Initialize remember me functionality
    this.initRememberMe()
  }
  
  /**
   * Get existing modal elements from HTML
   */
  getModalElements() {
    this.modal = document.querySelector('.auth-modal')
    this.overlay = document.querySelector('.auth-overlay')
  }
  
  /**
   * Initialize remember me functionality
   */
  initRememberMe() {
    const rememberedEmail = localStorage.getItem('userEmail')
    const rememberMe = localStorage.getItem('rememberMe')
    
    if (rememberMe === 'true' && rememberedEmail) {
      const emailInput = document.getElementById('signin-email')
      const checkbox = document.getElementById('remember-me')
      
      if (emailInput) emailInput.value = rememberedEmail
      if (checkbox) checkbox.checked = true
    }
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
    
    if (!passwordInput || !confirmInput) return
    
    // Password strength validation
    passwordInput.addEventListener('input', (e) => {
      this.updatePasswordStrength(e.target.value)
      this.updateSubmitButtonState()
    })
    
    // Password confirmation validation
    confirmInput.addEventListener('input', () => {
      this.updatePasswordMatch(passwordInput.value, confirmInput.value)
      this.updateSubmitButtonState()
    })
    
    // Real-time form validation
    this.setupFormValidation()
  }
  
  /**
   * Update password strength indicator
   */
  updatePasswordStrength(password) {
    const strengthText = document.querySelector('.password-strength-text')
    const strengthBar = document.querySelector('.password-strength-bar')
    const strengthFill = document.querySelector('.strength-fill')
    
    if (!strengthText || !strengthBar || !strengthFill) return
    
    if (!password) {
      strengthText.textContent = 'Enter password to see strength'
      strengthFill.style.width = '0%'
      strengthFill.className = 'strength-fill'
      strengthBar.setAttribute('aria-valuenow', '0')
      return
    }
    
    const strength = this.calculatePasswordStrength(password)
    
    strengthText.textContent = strength.message
    strengthFill.style.width = `${strength.percentage}%`
    strengthFill.className = `strength-fill strength-${strength.level}`
    strengthBar.setAttribute('aria-valuenow', strength.percentage.toString())
    
    // Update aria-label for screen readers
    strengthBar.setAttribute('aria-label', `Password strength: ${strength.message}`)
  }
  
  /**
   * Calculate password strength
   */
  calculatePasswordStrength(password) {
    let score = 0
    let feedback = []
    
    // Length checks
    if (password.length >= 8) score += 20
    else feedback.push('at least 8 characters')
    
    if (password.length >= 12) score += 20
    else if (password.length >= 8) feedback.push('longer password recommended')
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 15
    else feedback.push('lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 15
    else feedback.push('uppercase letters')
    
    if (/[0-9]/.test(password)) score += 15
    else feedback.push('numbers')
    
    if (/[^A-Za-z0-9]/.test(password)) score += 15
    else feedback.push('special characters')
    
    // Determine strength level
    let level, message
    if (score < 30) {
      level = 'weak'
      message = 'Very weak'
    } else if (score < 50) {
      level = 'weak'
      message = 'Weak'
    } else if (score < 70) {
      level = 'medium'
      message = 'Good'
    } else if (score < 90) {
      level = 'strong'
      message = 'Strong'
    } else {
      level = 'very-strong'
      message = 'Very strong'
    }
    
    return {
      percentage: Math.min(100, score),
      level,
      message,
      feedback,
      acceptable: score >= 50
    }
  }
  
  /**
   * Update password match indicator
   */
  updatePasswordMatch(password, confirmPassword) {
    const matchIndicator = document.getElementById('password-match-indicator')
    
    if (!matchIndicator) return
    
    if (!confirmPassword) {
      matchIndicator.textContent = ''
      matchIndicator.className = 'password-match-indicator'
      return
    }
    
    if (password === confirmPassword && password.length > 0) {
      matchIndicator.textContent = '✓ Passwords match'
      matchIndicator.className = 'password-match-indicator match'
    } else {
      matchIndicator.textContent = '✗ Passwords do not match'
      matchIndicator.className = 'password-match-indicator no-match'
    }
  }
  
  /**
   * Update submit button state based on validation
   */
  updateSubmitButtonState() {
    const passwordInput = document.getElementById('signup-password')
    const confirmInput = document.getElementById('signup-confirm-password')
    const submitButton = document.querySelector('#signup-form .auth-submit-button')
    
    if (!passwordInput || !confirmInput || !submitButton) return
    
    const strength = this.calculatePasswordStrength(passwordInput.value)
    const passwordsMatch = passwordInput.value === confirmInput.value && passwordInput.value.length > 0
    
    const isValid = strength.acceptable && passwordsMatch
    
    submitButton.disabled = !isValid
    submitButton.setAttribute('aria-disabled', (!isValid).toString())
    
    if (!isValid) {
      submitButton.classList.add('disabled')
    } else {
      submitButton.classList.remove('disabled')
    }
  }
  
  /**
   * Setup form validation
   */
  setupFormValidation() {
    // Real-time validation for all inputs
    document.querySelectorAll('.auth-form-input').forEach(input => {
      input.addEventListener('blur', () => this.validateInput(input))
      input.addEventListener('input', () => this.clearInputError(input))
    })
  }
  
  /**
   * Validate individual input
   */
  validateInput(input) {
    const value = input.value.trim()
    const type = input.type
    const name = input.name
    let isValid = true
    let message = ''
    
    // Required field check
    if (input.hasAttribute('required') && !value) {
      isValid = false
      message = `${this.getFieldLabel(input)} is required`
    }
    // Email validation
    else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        isValid = false
        message = 'Please enter a valid email address'
      }
    }
    // Full name validation
    else if (name === 'fullName' && value) {
      if (value.length < 2) {
        isValid = false
        message = 'Full name must be at least 2 characters'
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        isValid = false
        message = 'Full name can only contain letters, spaces, hyphens, and apostrophes'
      }
    }
    
    this.showInputError(input, isValid ? '' : message)
    return isValid
  }
  
  /**
   * Show input error
   */
  showInputError(input, message) {
    const errorId = input.getAttribute('aria-describedby')?.split(' ')[0] + '-error' || `${input.id}-error`
    const errorElement = document.getElementById(errorId)
    
    if (!errorElement) return
    
    if (message) {
      errorElement.textContent = message
      errorElement.style.display = 'block'
      input.setAttribute('aria-invalid', 'true')
      input.classList.add('error')
    } else {
      errorElement.style.display = 'none'
      input.setAttribute('aria-invalid', 'false')
      input.classList.remove('error')
    }
  }
  
  /**
   * Clear input error
   */
  clearInputError(input) {
    const errorId = input.getAttribute('aria-describedby')?.split(' ')[0] + '-error' || `${input.id}-error`
    const errorElement = document.getElementById(errorId)
    
    if (errorElement) {
      errorElement.style.display = 'none'
      input.setAttribute('aria-invalid', 'false')
      input.classList.remove('error')
    }
  }
  
  /**
   * Get field label for error messages
   */
  getFieldLabel(input) {
    const label = document.querySelector(`label[for="${input.id}"]`)
    return label ? label.textContent.replace('*', '').trim() : input.name
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
    
    // Update header text
    const headerText = document.querySelector('.auth-modal-header h2')
    if (headerText) {
      headerText.textContent = tabName === 'signin' ? 'Welcome Back' : 'Create Account'
    }
    
    // Update footer text
    const footerText = document.querySelector('.auth-footer-text')
    const footerLink = document.querySelector('.auth-footer-link')
    if (footerText && footerLink) {
      if (tabName === 'signin') {
        footerText.firstChild.textContent = "Don't have an account? "
        footerLink.textContent = 'Create Account'
      } else {
        footerText.firstChild.textContent = 'Already have an account? '
        footerLink.textContent = 'Sign In'
      }
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
    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    const rememberMe = formData.get('remember')
    
    // Validate form inputs
    if (!this.validateSignInForm(email, password)) {
      return
    }
    
    this.clearErrors()
    this.setLoadingState(submitButton, true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('userEmail', email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('userEmail')
      }
      
      // Success
      this.showSuccess('Welcome back! Redirecting to your dashboard...')
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = '../dashboard/index.html'
      }, 1500)
      
    } catch (error) {
      console.error('Sign in error:', error)
      this.showError('signin-error', 'Invalid email or password. Please try again.')
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Validate sign in form
   */
  validateSignInForm(email, password) {
    let isValid = true
    
    if (!email) {
      this.showError('signin-error', 'Please enter your email address')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showError('signin-error', 'Please enter a valid email address')
      isValid = false
    }
    
    if (!password) {
      this.showError('signin-error', 'Please enter your password')
      isValid = false
    }
    
    return isValid
  }
  
  /**
   * Handle sign up
   */
  async handleSignUp(formData) {
    const submitButton = document.querySelector('#signup-form .auth-submit-button')
    const fullName = formData.get('fullName')?.trim()
    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    // Validate form inputs
    if (!this.validateSignUpForm(fullName, email, password, confirmPassword)) {
      return
    }
    
    this.clearErrors()
    this.setLoadingState(submitButton, true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success
      this.showSuccess('Account created successfully! Please check your email to verify your account.')
      
      // Clear form and switch to sign in tab
      setTimeout(() => {
        document.getElementById('signup-form').reset()
        this.switchTab('signin')
        document.getElementById('signin-email').value = email
        document.getElementById('signin-email').focus()
      }, 2500)
      
    } catch (error) {
      console.error('Sign up error:', error)
      this.showError('signup-error', 'Failed to create account. Please try again.')
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Validate sign up form
   */
  validateSignUpForm(fullName, email, password, confirmPassword) {
    let isValid = true
    let errors = []
    
    // Full name validation
    if (!fullName) {
      errors.push('Please enter your full name')
      isValid = false
    } else if (fullName.length < 2) {
      errors.push('Full name must be at least 2 characters')
      isValid = false
    }
    
    // Email validation
    if (!email) {
      errors.push('Please enter your email address')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address')
      isValid = false
    }
    
    // Password validation
    if (!password) {
      errors.push('Please enter a password')
      isValid = false
    } else {
      const strength = this.calculatePasswordStrength(password)
      if (!strength.acceptable) {
        errors.push('Password is too weak. Please choose a stronger password.')
        isValid = false
      }
    }
    
    // Password confirmation
    if (password !== confirmPassword) {
      errors.push('Passwords do not match')
      isValid = false
    }
    
    if (!isValid) {
      this.showError('signup-error', errors[0]) // Show first error
    }
    
    return isValid
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.showSuccess('Password reset instructions sent to your email!')
      
    } catch (error) {
      console.error('Password reset error:', error)
      this.showError('signin-error', 'Failed to send reset email. Please try again.')
    }
  }
  
  /**
   * Enhanced password visibility toggle with animations
   */
  togglePasswordVisibility(targetId) {
    const input = document.getElementById(targetId)
    const button = document.querySelector(`[data-target="${targetId}"]`)
    
    if (!input || !button) return
    
    const showIcon = button.querySelector('.toggle-show')
    const hideIcon = button.querySelector('.toggle-hide')
    
    if (input.type === 'password') {
      input.type = 'text'
      button.setAttribute('aria-label', 'Hide password')
      if (showIcon) showIcon.style.display = 'none'
      if (hideIcon) hideIcon.style.display = 'inline'
    } else {
      input.type = 'password'
      button.setAttribute('aria-label', 'Show password')
      if (showIcon) showIcon.style.display = 'inline'
      if (hideIcon) hideIcon.style.display = 'none'
    }
    
    // Add subtle animation
    input.style.transform = 'scale(0.98)'
    setTimeout(() => {
      input.style.transform = 'scale(1)'
    }, 100)
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
      const modalBody = document.querySelector('.auth-modal-body')
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
}

// Initialize auth modal when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Create auth modal
  const authModal = new AuthModal()
  
  console.log('✅ Authentication system initialized successfully')
})