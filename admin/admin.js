/**
 * Admin Panel JavaScript
 * Handles admin authentication and panel functionality
 */

import { signInAdmin, authState, initAuth, isAdmin, logAdminAccess } from '../auth/supabase-client.js'
import { PasswordValidator } from '../assets/js/password-validator.js'

class AdminPanel {
  constructor() {
    this.passwordValidator = new PasswordValidator()
    this.accessCode = ''
    this.loginAttempts = 0
    this.maxLoginAttempts = 3
    this.lockoutTime = 300000 // 5 minutes
    this.init()
  }
  
  /**
   * Initialize admin panel
   */
  init() {
    this.bindEvents()
    this.setupPasswordValidation()
    this.initializeAccessCode()
    this.checkExistingAuth()
    
    // Security: Clear clipboard and disable dev tools
    this.enableSecurityMeasures()
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    const form = document.getElementById('admin-login-form')
    const usernameInput = document.getElementById('admin-username')
    const passwordInput = document.getElementById('admin-password')
    const passwordToggle = document.querySelector('.admin-password-toggle')
    const clearButton = document.getElementById('clear-code')
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleLogin()
    })
    
    // Username validation
    usernameInput.addEventListener('input', (e) => {
      this.validateUsername(e.target.value)
    })
    
    // Password validation
    passwordInput.addEventListener('input', (e) => {
      this.validatePassword(e.target.value)
    })
    
    // Password toggle
    passwordToggle.addEventListener('click', () => {
      this.togglePasswordVisibility()
    })
    
    // Numeric keypad
    document.querySelectorAll('.keypad-key').forEach(key => {
      key.addEventListener('click', (e) => {
        const value = e.target.dataset.value
        const action = e.target.dataset.action
        
        if (value) {
          this.addDigit(value)
        } else if (action === 'backspace') {
          this.removeDigit()
        } else if (action === 'clear') {
          this.clearAccessCode()
        }
      })
    })
    
    // Clear button
    clearButton.addEventListener('click', () => {
      this.clearAccessCode()
    })
    
    // Keyboard shortcuts for keypad
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === document.getElementById('admin-access-code') || 
          document.querySelector('.numeric-keypad').contains(document.activeElement)) {
        this.handleKeypadKeyboard(e)
      }
    })
    
    // Security: Prevent common attack vectors
    document.addEventListener('keydown', (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault()
        this.logSecurityEvent('Dev tools access attempted')
      }
    })
  }
  
  /**
   * Setup password validation
   */
  setupPasswordValidation() {
    this.passwordValidator.createValidationUI('admin-password-requirements', {
      showStrengthBar: true,
      showRequirements: true,
      className: 'admin-password-requirements'
    })
  }
  
  /**
   * Initialize access code functionality
   */
  initializeAccessCode() {
    const accessCodeInput = document.getElementById('admin-access-code')
    
    // Prevent manual input
    accessCodeInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault()
      }
    })
    
    // Handle paste events
    accessCodeInput.addEventListener('paste', (e) => {
      e.preventDefault()
      this.logSecurityEvent('Paste attempted in access code field')
    })
  }
  
  /**
   * Check if user is already authenticated
   */
  async checkExistingAuth() {
    await initAuth()
    
    if (isAdmin()) {
      this.showSuccess('Already authenticated as admin')
      setTimeout(() => {
        this.redirectToDashboard()
      }, 2000)
    }
  }
  
  /**
   * Handle login submission
   */
  async handleLogin() {
    const username = document.getElementById('admin-username').value
    const password = document.getElementById('admin-password').value
    const accessCode = this.accessCode
    
    // Check rate limiting
    if (this.isLockedOut()) {
      this.showError('Too many failed attempts. Please try again later.')
      return
    }
    
    // Validate all fields
    if (!this.validateAllFields(username, password, accessCode)) {
      this.incrementLoginAttempts()
      return
    }
    
    const submitButton = document.querySelector('.admin-submit-button')
    this.setLoadingState(true)
    
    try {
      // Attempt admin login
      const { data, error } = await signInAdmin({ username, password, accessCode })
      
      if (error) {
        throw error
      }
      
      // Success
      this.showSuccess('Authentication successful! Redirecting to admin dashboard...')
      this.logSecurityEvent('Admin login successful')
      
      // Reset attempts on success
      this.resetLoginAttempts()
      
      // Redirect after delay
      setTimeout(() => {
        this.redirectToDashboard()
      }, 2000)
      
    } catch (error) {
      console.error('Admin login error:', error)
      this.showError(this.getErrorMessage(error))
      this.incrementLoginAttempts()
      this.logSecurityEvent(`Admin login failed: ${error.message}`)
    } finally {
      this.setLoadingState(false)
    }
  }
  
  /**
   * Validate username
   */
  validateUsername(username) {
    const isValid = username === 'LearnTAV-Admin'
    const indicator = document.querySelector('#admin-username').parentNode.querySelector('.input-validation-indicator')
    
    if (username.length === 0) {
      indicator.className = 'input-validation-indicator'
    } else if (isValid) {
      indicator.className = 'input-validation-indicator valid'
    } else {
      indicator.className = 'input-validation-indicator invalid'
    }
    
    this.updateSubmitButton()
    return isValid
  }
  
  /**
   * Validate password
   */
  validatePassword(password) {
    const isValid = this.passwordValidator.updateValidationUI(password, 'admin-password-requirements')
    const indicator = document.querySelector('#admin-password').parentNode.querySelector('.input-validation-indicator')
    
    if (password.length === 0) {
      indicator.className = 'input-validation-indicator'
    } else if (isValid) {
      indicator.className = 'input-validation-indicator valid'
    } else {
      indicator.className = 'input-validation-indicator invalid'
    }
    
    this.updateSubmitButton()
    return isValid
  }
  
  /**
   * Validate access code
   */
  validateAccessCode(accessCode) {
    return accessCode === '0410' && accessCode.length === 4
  }
  
  /**
   * Validate all fields
   */
  validateAllFields(username, password, accessCode) {
    const isUsernameValid = this.validateUsername(username)
    const isPasswordValid = this.passwordValidator.isPasswordAcceptable(password)
    const isAccessCodeValid = this.validateAccessCode(accessCode)
    
    if (!isUsernameValid) {
      this.showError('Invalid administrator username')
      return false
    }
    
    if (!isPasswordValid) {
      this.showError('Password does not meet security requirements')
      return false
    }
    
    if (!isAccessCodeValid) {
      this.showError('Invalid access code')
      return false
    }
    
    return true
  }
  
  /**
   * Add digit to access code
   */
  addDigit(digit) {
    if (this.accessCode.length < 4) {
      this.accessCode += digit
      this.updateAccessCodeDisplay()
      
      // Auto-validate when complete
      if (this.accessCode.length === 4) {
        this.validateAccessCode(this.accessCode)
        this.updateSubmitButton()
      }
    }
  }
  
  /**
   * Remove last digit from access code
   */
  removeDigit() {
    if (this.accessCode.length > 0) {
      this.accessCode = this.accessCode.slice(0, -1)
      this.updateAccessCodeDisplay()
      this.updateSubmitButton()
    }
  }
  
  /**
   * Clear access code
   */
  clearAccessCode() {
    this.accessCode = ''
    this.updateAccessCodeDisplay()
    this.updateSubmitButton()
  }
  
  /**
   * Update access code display
   */
  updateAccessCodeDisplay() {
    const input = document.getElementById('admin-access-code')
    input.value = '•'.repeat(this.accessCode.length)
    
    // Visual feedback
    const keys = document.querySelectorAll('.keypad-key')
    keys.forEach(key => key.classList.remove('pressed'))
    
    if (this.accessCode.length > 0) {
      const lastDigit = this.accessCode[this.accessCode.length - 1]
      const lastKey = document.querySelector(`[data-value="${lastDigit}"]`)
      if (lastKey) {
        lastKey.classList.add('pressed')
        setTimeout(() => lastKey.classList.remove('pressed'), 200)
      }
    }
  }
  
  /**
   * Handle keypad keyboard input
   */
  handleKeypadKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      this.addDigit(e.key)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      this.removeDigit()
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      e.preventDefault()
      this.clearAccessCode()
    }
  }
  
  /**
   * Update submit button state
   */
  updateSubmitButton() {
    const username = document.getElementById('admin-username').value
    const password = document.getElementById('admin-password').value
    const submitButton = document.querySelector('.admin-submit-button')
    
    const isUsernameValid = username === 'LearnTAV-Admin'
    const isPasswordValid = this.passwordValidator.isPasswordAcceptable(password)
    const isAccessCodeValid = this.validateAccessCode(this.accessCode)
    
    const allValid = isUsernameValid && isPasswordValid && isAccessCodeValid
    
    submitButton.disabled = !allValid
    
    if (allValid) {
      submitButton.classList.add('ready')
    } else {
      submitButton.classList.remove('ready')
    }
  }
  
  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    const passwordInput = document.getElementById('admin-password')
    const toggleButton = document.querySelector('.admin-password-toggle')
    const showIcon = toggleButton.querySelector('.toggle-show')
    const hideIcon = toggleButton.querySelector('.toggle-hide')
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text'
      showIcon.style.display = 'none'
      hideIcon.style.display = 'inline'
    } else {
      passwordInput.type = 'password'
      showIcon.style.display = 'inline'
      hideIcon.style.display = 'none'
    }
  }
  
  /**
   * Set loading state
   */
  setLoadingState(loading) {
    const submitButton = document.querySelector('.admin-submit-button')
    const buttonContent = submitButton.querySelector('.button-content')
    const buttonLoader = submitButton.querySelector('.button-loader')
    const overlay = document.getElementById('admin-loading-overlay')
    
    if (loading) {
      submitButton.disabled = true
      buttonContent.style.display = 'none'
      buttonLoader.style.display = 'flex'
      overlay.style.display = 'flex'
      document.body.style.overflow = 'hidden'
    } else {
      submitButton.disabled = false
      buttonContent.style.display = 'flex'
      buttonLoader.style.display = 'none'
      overlay.style.display = 'none'
      document.body.style.overflow = ''
    }
  }
  
  /**
   * Show error message
   */
  showError(message) {
    const errorElement = document.getElementById('admin-error-message')
    const errorText = errorElement.querySelector('.error-text')
    const successElement = document.getElementById('admin-success-message')
    
    // Hide success message
    successElement.style.display = 'none'
    
    // Show error
    errorText.textContent = message
    errorElement.style.display = 'flex'
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      errorElement.style.display = 'none'
    }, 10000)
    
    // Shake animation
    errorElement.classList.add('shake')
    setTimeout(() => {
      errorElement.classList.remove('shake')
    }, 500)
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    const successElement = document.getElementById('admin-success-message')
    const successText = successElement.querySelector('.success-text')
    const errorElement = document.getElementById('admin-error-message')
    
    // Hide error message
    errorElement.style.display = 'none'
    
    // Show success
    successText.textContent = message
    successElement.style.display = 'flex'
    
    // Pulse animation
    successElement.classList.add('pulse')
    setTimeout(() => {
      successElement.classList.remove('pulse')
    }, 1000)
  }
  
  /**
   * Check if account is locked out
   */
  isLockedOut() {
    const lockoutData = localStorage.getItem('admin_lockout')
    if (!lockoutData) return false
    
    const { attempts, timestamp } = JSON.parse(lockoutData)
    const now = Date.now()
    
    // Check if lockout period has expired
    if (now - timestamp > this.lockoutTime) {
      localStorage.removeItem('admin_lockout')
      return false
    }
    
    return attempts >= this.maxLoginAttempts
  }
  
  /**
   * Increment login attempts
   */
  incrementLoginAttempts() {
    this.loginAttempts++
    
    if (this.loginAttempts >= this.maxLoginAttempts) {
      localStorage.setItem('admin_lockout', JSON.stringify({
        attempts: this.loginAttempts,
        timestamp: Date.now()
      }))
      
      this.showError(`Account locked after ${this.maxLoginAttempts} failed attempts. Try again in 5 minutes.`)
    } else {
      const remaining = this.maxLoginAttempts - this.loginAttempts
      this.showError(`Invalid credentials. ${remaining} attempts remaining.`)
    }
  }
  
  /**
   * Reset login attempts
   */
  resetLoginAttempts() {
    this.loginAttempts = 0
    localStorage.removeItem('admin_lockout')
  }
  
  /**
   * Log security events
   */
  logSecurityEvent(event) {
    console.warn(`🚨 Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    // In production, send to security monitoring service
    if (window.location.hostname !== 'localhost') {
      // Example: Send to security endpoint
      // fetch('/api/security/log', { ... })
    }
  }
  
  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid admin username': 'Administrator username must be exactly "LearnTAV-Admin"',
      'Invalid access code': 'The 4-digit access code is incorrect',
      'Invalid login credentials': 'Invalid administrator credentials',
      'Unauthorized: Admin access required': 'This account does not have administrator privileges',
      'Network Error': 'Unable to connect to authentication server',
      'Failed to fetch': 'Network connection error. Please check your internet connection.'
    }
    
    const message = error.message || error
    return errorMessages[message] || `Authentication failed: ${message}`
  }
  
  /**
   * Redirect to dashboard
   */
  redirectToDashboard() {
    // Check if dashboard exists, otherwise create it
    const dashboardUrl = './dashboard.html'
    
    // Add loading state
    this.setLoadingState(true)
    
    // Redirect with delay for UX
    setTimeout(() => {
      window.location.href = dashboardUrl
    }, 1000)
  }
  
  /**
   * Enable security measures
   */
  enableSecurityMeasures() {
    // Disable right-click in production
    if (window.location.hostname !== 'localhost') {
      document.addEventListener('contextmenu', e => e.preventDefault())
    }
    
    // Clear console periodically
    if (window.location.hostname !== 'localhost') {
      setInterval(() => {
        console.clear()
      }, 10000)
    }
    
    // Detect developer tools
    let devtools = false
    const threshold = 160
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true
          this.logSecurityEvent('Developer tools detected')
        }
      } else {
        devtools = false
      }
    }, 500)
    
    // Prevent common debug shortcuts
    document.addEventListener('keydown', (e) => {
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault()
        this.logSecurityEvent('Debug shortcut blocked')
        return false
      }
    })
  }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new AdminPanel()
})

// Export for potential external use
export { AdminPanel }