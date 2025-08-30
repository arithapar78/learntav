/**
 * Simplified Admin Panel JavaScript
 * Handles simple admin authentication with code only
 */

class AdminPanel {
  constructor() {
    this.accessCode = ''
    this.init()
  }
  
  /**
   * Initialize admin panel
   */
  init() {
    this.bindEvents()
    this.initializeAccessCode()
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    const form = document.getElementById('admin-login-form')
    const clearButton = document.getElementById('clear-code')
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleLogin()
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
      if (document.activeElement === document.getElementById('admin-access-code')) {
        this.handleKeypadKeyboard(e)
      }
    })
    
    // Allow direct input in the access code field
    const accessCodeInput = document.getElementById('admin-access-code')
    accessCodeInput.addEventListener('input', (e) => {
      this.accessCode = e.target.value
      this.updateAccessCodeDisplay()
    })
  }
  
  /**
   * Initialize access code functionality
   */
  initializeAccessCode() {
    const accessCodeInput = document.getElementById('admin-access-code')
    
    // Allow direct typing
    accessCodeInput.addEventListener('keydown', (e) => {
      // Allow digits, backspace, delete, tab
      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
        e.preventDefault()
      }
    })
  }
  
  /**
   * Handle login submission
   */
  handleLogin() {
    const accessCode = this.accessCode
    
    // Validate access code
    if (accessCode !== '3141' || accessCode.length !== 4) {
      this.showError('Invalid code. Please enter 3141.')
      return
    }
    
    this.setLoadingState(true)
    
    // Success
    this.showSuccess('Access granted! Redirecting...')
    
    // Redirect after short delay
    setTimeout(() => {
      this.redirectToDashboard()
    }, 800)
  }
  
  /**
   * Add digit to access code
   */
  addDigit(digit) {
    if (this.accessCode.length < 4) {
      this.accessCode += digit
      this.updateAccessCodeDisplay()
    }
  }
  
  /**
   * Remove last digit from access code
   */
  removeDigit() {
    if (this.accessCode.length > 0) {
      this.accessCode = this.accessCode.slice(0, -1)
      this.updateAccessCodeDisplay()
    }
  }
  
  /**
   * Clear access code
   */
  clearAccessCode() {
    this.accessCode = ''
    this.updateAccessCodeDisplay()
  }
  
  /**
   * Update access code display
   */
  updateAccessCodeDisplay() {
    const input = document.getElementById('admin-access-code')
    input.value = this.accessCode
    
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
      this.addDigit(e.key)
    } else if (e.key === 'Backspace') {
      this.removeDigit()
    } else if (e.key === 'Delete' || e.key === 'Escape') {
      this.clearAccessCode()
    } else if (e.key === 'Enter') {
      document.getElementById('admin-login-form').dispatchEvent(new Event('submit'))
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

// Export for potential external use
export { AdminPanel }