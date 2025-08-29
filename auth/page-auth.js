/**
 * Page-based Authentication Tab System
 * Handles tab switching for the authentication page forms
 */

class PageAuthSystem {
  constructor() {
    this.currentTab = 'signin'
    this.init()
  }

  init() {
    this.bindEvents()
    // Set initial state
    this.showTab('signin')
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.auth-tab[data-tab]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab')
        this.showTab(tabName)
      })
    })

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target')
        this.togglePasswordVisibility(targetId)
      })
    })

    // Form submissions
    const signinForm = document.getElementById('signin')
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignIn(new FormData(e.target))
      })
    }

    const signupForm = document.getElementById('signup')
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignUp(new FormData(e.target))
      })
    }

    // Password strength validation
    const signupPassword = document.getElementById('signup-password')
    if (signupPassword) {
      signupPassword.addEventListener('input', (e) => {
        this.updatePasswordStrength(e.target.value)
      })
    }

    // Password confirmation validation
    const confirmPassword = document.getElementById('signup-confirm-password')
    if (confirmPassword && signupPassword) {
      confirmPassword.addEventListener('input', () => {
        this.validatePasswordMatch(signupPassword.value, confirmPassword.value)
      })
    }
  }

  showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.classList.remove('active')
    })
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`)
    if (activeTab) {
      activeTab.classList.add('active')
    }

    // Update form containers
    document.querySelectorAll('.auth-form-container').forEach(container => {
      container.classList.remove('active')
    })

    const activeContainer = document.getElementById(`${tabName}-form`)
    if (activeContainer) {
      activeContainer.classList.add('active')
    }

    this.currentTab = tabName
    
    // Clear any error messages
    this.clearMessages()
    
    // Focus first input
    setTimeout(() => {
      const firstInput = activeContainer?.querySelector('input:not([type="checkbox"])')
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  }

  togglePasswordVisibility(targetId) {
    const input = document.getElementById(targetId)
    const button = document.querySelector(`[data-target="${targetId}"]`)
    
    if (!input || !button) return

    const showIcon = button.querySelector('.toggle-show')
    const hideIcon = button.querySelector('.toggle-hide')

    if (input.type === 'password') {
      input.type = 'text'
      if (showIcon) showIcon.style.display = 'none'
      if (hideIcon) hideIcon.style.display = 'inline'
    } else {
      input.type = 'password'
      if (showIcon) showIcon.style.display = 'inline'
      if (hideIcon) hideIcon.style.display = 'none'
    }
  }

  updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('password-strength')
    const strengthFill = document.querySelector('.strength-fill')
    const strengthText = document.querySelector('.strength-text')
    
    if (!strengthContainer || !strengthFill || !strengthText) return

    if (!password) {
      strengthText.textContent = 'Enter password to see strength'
      strengthFill.style.width = '0%'
      strengthFill.className = 'strength-fill'
      return
    }

    const strength = this.calculatePasswordStrength(password)
    
    strengthFill.style.width = `${strength.percentage}%`
    strengthFill.className = `strength-fill strength-${strength.level}`
    strengthText.textContent = strength.message
  }

  calculatePasswordStrength(password) {
    let score = 0
    let feedback = []

    // Length check
    if (password.length >= 8) score += 25
    else feedback.push('at least 8 characters')
    
    if (password.length >= 12) score += 25
    else if (password.length >= 8) feedback.push('longer password')

    // Character variety checks
    if (/[a-z]/.test(password)) score += 12.5
    else feedback.push('lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 12.5
    else feedback.push('uppercase letters')
    
    if (/[0-9]/.test(password)) score += 12.5
    else feedback.push('numbers')
    
    if (/[^A-Za-z0-9]/.test(password)) score += 12.5
    else feedback.push('special characters')

    let level, message
    if (score < 25) {
      level = 'weak'
      message = 'Very weak'
    } else if (score < 50) {
      level = 'weak'
      message = 'Weak'
    } else if (score < 75) {
      level = 'medium'
      message = 'Good'
    } else if (score < 100) {
      level = 'strong'
      message = 'Strong'
    } else {
      level = 'very-strong'
      message = 'Very strong'
    }

    return {
      percentage: Math.min(100, score),
      level: level,
      message: message,
      feedback: feedback
    }
  }

  validatePasswordMatch(password, confirmPassword) {
    const matchContainer = document.querySelector('.password-match-indicator')
    
    // Create match indicator if it doesn't exist
    if (!matchContainer && confirmPassword) {
      const container = document.createElement('div')
      container.className = 'password-match-indicator'
      const confirmInput = document.getElementById('signup-confirm-password')
      if (confirmInput && confirmInput.parentNode) {
        confirmInput.parentNode.insertBefore(container, confirmInput.nextSibling)
      }
    }

    const indicator = document.querySelector('.password-match-indicator')
    if (!indicator) return

    if (!confirmPassword) {
      indicator.textContent = ''
      indicator.className = 'password-match-indicator'
      return
    }

    if (password === confirmPassword) {
      indicator.textContent = '✓ Passwords match'
      indicator.className = 'password-match-indicator match'
    } else {
      indicator.textContent = '✗ Passwords do not match'
      indicator.className = 'password-match-indicator no-match'
    }
  }

  async handleSignIn(formData) {
    const email = formData.get('email')
    const password = formData.get('password')
    
    this.showMessage('Signing you in...', 'info')
    
    // Simulate authentication (replace with actual implementation)
    setTimeout(() => {
      this.showMessage('Welcome back! Sign in successful.', 'success')
    }, 1000)
  }

  async handleSignUp(formData) {
    const fullName = formData.get('fullName')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error')
      return
    }

    const strength = this.calculatePasswordStrength(password)
    if (strength.percentage < 50) {
      this.showMessage('Please choose a stronger password', 'error')
      return
    }

    this.showMessage('Creating your account...', 'info')
    
    // Simulate account creation (replace with actual implementation)
    setTimeout(() => {
      this.showMessage('Account created successfully! Please check your email for verification.', 'success')
      // Switch to signin tab after account creation
      setTimeout(() => {
        this.showTab('signin')
        const signinEmail = document.getElementById('signin-email')
        if (signinEmail) {
          signinEmail.value = email
        }
      }, 2000)
    }, 1000)
  }

  showMessage(text, type = 'info') {
    let messageEl = document.getElementById('auth-message')
    if (!messageEl) {
      messageEl = document.createElement('div')
      messageEl.id = 'auth-message'
      messageEl.className = 'auth-message'
      const card = document.querySelector('.auth-card')
      if (card) {
        card.appendChild(messageEl)
      }
    }

    const icons = {
      success: '✅',
      error: '❌', 
      info: 'ℹ️',
      warning: '⚠️'
    }

    messageEl.innerHTML = `
      <span class="message-icon">${icons[type] || icons.info}</span>
      <span class="message-text">${text}</span>
    `
    
    messageEl.className = `auth-message auth-message--${type}`
    messageEl.style.display = 'block'

    // Auto-hide after 5 seconds for info messages
    if (type === 'info') {
      setTimeout(() => {
        messageEl.style.display = 'none'
      }, 5000)
    }
  }

  clearMessages() {
    const messageEl = document.getElementById('auth-message')
    if (messageEl) {
      messageEl.style.display = 'none'
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PageAuthSystem()
})

// Export for external use
window.PageAuthSystem = PageAuthSystem