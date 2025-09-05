/**
 * Simple Admin Panel JavaScript
 * Handles password-based admin authentication
 */

class AdminPanel {
  constructor() {
    this.init()
  }
  
  /**
   * Initialize admin panel
   */
  init() {
    this.bindEvents()
    this.focusPasswordField()
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    const form = document.getElementById('admin-login-form')
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleLogin()
    })
    
    // Password input field
    const passwordInput = document.getElementById('admin-password')
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.handleLogin()
      }
    })
    
    // Enable button when typing
    passwordInput.addEventListener('input', () => {
      this.enableButton()
    })
  }
  
  /**
   * Focus password field on load
   */
  focusPasswordField() {
    const passwordInput = document.getElementById('admin-password')
    if (passwordInput) {
      passwordInput.focus()
    }
  }
  
  /**
   * Handle login submission
   */
  handleLogin() {
    const passwordInput = document.getElementById('admin-password')
    const password = passwordInput.value.trim()
    
    // Check if password matches "LearnTAV4ever!"
    if (password !== 'LearnTAV4ever!') {
      this.showError('Invalid password. Please try again.')
      passwordInput.value = '' // Clear the password field
      passwordInput.focus()
      return
    }
    
    this.setLoadingState(true)
    
    // Set admin session
    localStorage.setItem('adminAuthenticated', 'true')
    localStorage.setItem('adminSessionTimestamp', Date.now().toString())
    
    // Success
    this.showSuccess('Access granted! Redirecting...')
    
    // Redirect after short delay
    setTimeout(() => {
      this.redirectToDashboard()
    }, 800)
  }
  
  /**
   * Enable button when password is entered
   */
  enableButton() {
    const passwordInput = document.getElementById('admin-password')
    const submitButton = document.querySelector('.admin-submit-button')
    
    if (passwordInput.value.trim().length > 0) {
      submitButton.disabled = false
    } else {
      submitButton.disabled = true
    }
  }
  
  
  /**
   * Set loading state
   */
  setLoadingState(loading) {
    const submitButton = document.querySelector('.admin-submit-button')
    const buttonContent = submitButton.querySelector('.button-content')
    const buttonLoader = submitButton.querySelector('.button-loader')
    
    if (loading) {
      submitButton.disabled = true
      buttonContent.style.display = 'none'
      buttonLoader.style.display = 'flex'
    } else {
      submitButton.disabled = false
      buttonContent.style.display = 'flex'
      buttonLoader.style.display = 'none'
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
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      errorElement.style.display = 'none'
    }, 3000)
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
    
  }
  
  
  /**
   * Redirect to dashboard
   */
  redirectToDashboard() {
    const dashboardUrl = './dashboard.html'
    window.location.href = dashboardUrl
  }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  new AdminPanel()
})

// No export needed for non-module script
// export { AdminPanel }