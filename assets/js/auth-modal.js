/**
 * Dynamic Authentication Modal for Main Pages
 * Creates and manages authentication modal that can be injected into any page
 */

export class DynamicAuthModal {
  constructor() {
    this.isOpen = false
    this.currentTab = 'signin'
    this.modal = null
    this.overlay = null
    this.modalHTML = null
    
    // Make globally accessible
    window.authModal = this
    window.showAuthModal = (tab = 'signin') => this.show(tab)
  }
  
  /**
   * Create the modal HTML structure
   */
  createModalHTML() {
    return `
      <div class="auth-overlay" id="dynamicAuthOverlay">
        <div class="auth-modal" id="dynamicAuthModal">
          <button class="auth-close-button" type="button" aria-label="Close">
            ×
          </button>
          
          <div class="auth-modal-content">
            <div class="auth-modal-header">
              <h2>Welcome Back</h2>
              
              <div class="auth-tabs">
                <button class="auth-tab-button active" data-tab="signin" type="button">
                  <span class="tab-icon">🔐</span>
                  Sign In
                </button>
                <button class="auth-tab-button" data-tab="signup" type="button">
                  <span class="tab-icon">✨</span>
                  Create Account
                </button>
              </div>
            </div>
            
            <div class="auth-modal-body">
              <!-- Sign In Tab -->
              <div id="signin-tab" class="auth-tab-content active">
                <div class="auth-form-header">
                  <p>Sign in to access your personalized learning experience</p>
                </div>
                
                <!-- Demo Credentials Notice -->
                <div class="demo-credentials-notice" style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 8px; font-size: 0.9rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; color: #0c4a6e; font-weight: 600;">
                    <span style="font-size: 1.1rem;">🔧</span>
                    Demo Mode - Use These Credentials
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: #075985;">
                    <div>
                      <div style="font-weight: 500; margin-bottom: 0.25rem;">👤 Regular User:</div>
                      <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                        demo@learntav.com<br>
                        demo123
                      </div>
                    </div>
                    <div>
                      <div style="font-weight: 500; margin-bottom: 0.25rem;">👑 Admin User:</div>
                      <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                        admin@learntav.com<br>
                        admin123
                      </div>
                    </div>
                  </div>
                  <div style="margin-top: 0.75rem; font-size: 0.8rem; color: #0369a1; font-style: italic;">
                    💡 This is a demo environment. In production, you would use your real credentials.
                  </div>
                </div>
                
                <form id="dynamic-signin-form" class="auth-form" novalidate aria-label="Sign in form">
                  <div class="auth-form-group">
                    <label for="dynamic-signin-email" class="auth-form-label">Email Address *</label>
                    <div class="auth-input-wrapper">
                      <input type="email"
                             id="dynamic-signin-email"
                             name="email"
                             class="auth-form-input"
                             placeholder="Enter your email address"
                             required
                             autocomplete="email"
                             aria-describedby="dynamic-signin-email-error"
                             aria-invalid="false">
                    </div>
                    <div class="auth-input-error" id="dynamic-signin-email-error" role="alert" aria-live="polite" style="display: none;"></div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="dynamic-signin-password" class="auth-form-label">Password *</label>
                    <div class="auth-input-wrapper">
                      <input type="password"
                             id="dynamic-signin-password"
                             name="password"
                             class="auth-form-input"
                             placeholder="Enter your password"
                             required
                             autocomplete="current-password"
                             aria-describedby="dynamic-signin-password-error"
                             aria-invalid="false">
                      <button type="button"
                              class="auth-password-toggle"
                              data-target="dynamic-signin-password"
                              aria-label="Toggle password visibility"
                              title="Show/hide password">
                        <span class="toggle-show" aria-hidden="true">👁️</span>
                        <span class="toggle-hide" aria-hidden="true" style="display: none;">🙈</span>
                      </button>
                    </div>
                    <div class="auth-input-error" id="dynamic-signin-password-error" role="alert" aria-live="polite" style="display: none;"></div>
                  </div>
                  
                  <div class="auth-form-options">
                    <label class="auth-checkbox-wrapper">
                      <input type="checkbox" name="remember" class="auth-checkbox" id="dynamic-remember-me">
                      <span class="auth-checkmark"></span>
                      <span class="auth-checkbox-label">Remember me for 30 days</span>
                    </label>
                    <button type="button" class="auth-forgot-password" id="dynamic-forgot-password-btn">
                      Forgot Password?
                    </button>
                  </div>
                  
                  <div class="auth-form-actions">
                    <button type="submit" class="auth-submit-button">
                      <span class="button-text">Sign In</span>
                    </button>
                  </div>
                  
                  <div class="auth-error-message" id="dynamic-signin-error" style="display: none;"></div>
                </form>
              </div>
              
              <!-- Sign Up Tab -->
              <div id="signup-tab" class="auth-tab-content">
                <div class="auth-form-header">
                  <p>Create your account to start your AI learning journey</p>
                </div>
                
                <form id="dynamic-signup-form" class="auth-form" novalidate aria-label="Create account form">
                  <div class="auth-form-group">
                    <label for="dynamic-signup-fullname" class="auth-form-label">Full Name *</label>
                    <div class="auth-input-wrapper">
                      <input type="text"
                             id="dynamic-signup-fullname"
                             name="fullName"
                             class="auth-form-input"
                             placeholder="Enter your full name"
                             required
                             autocomplete="name"
                             aria-describedby="dynamic-signup-fullname-error"
                             aria-invalid="false">
                    </div>
                    <div class="auth-input-error" id="dynamic-signup-fullname-error" role="alert" aria-live="polite" style="display: none;"></div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="dynamic-signup-email" class="auth-form-label">Email Address *</label>
                    <div class="auth-input-wrapper">
                      <input type="email"
                             id="dynamic-signup-email"
                             name="email"
                             class="auth-form-input"
                             placeholder="Enter your email address"
                             required
                             autocomplete="email"
                             aria-describedby="dynamic-signup-email-error"
                             aria-invalid="false">
                    </div>
                    <div class="auth-input-error" id="dynamic-signup-email-error" role="alert" aria-live="polite" style="display: none;"></div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="dynamic-signup-password" class="auth-form-label">Password *</label>
                    <div class="auth-input-wrapper">
                      <input type="password"
                             id="dynamic-signup-password"
                             name="password"
                             class="auth-form-input"
                             placeholder="Create a strong password"
                             required
                             autocomplete="new-password"
                             aria-describedby="dynamic-signup-password-error dynamic-password-strength-indicator"
                             aria-invalid="false">
                      <button type="button"
                              class="auth-password-toggle"
                              data-target="dynamic-signup-password"
                              aria-label="Toggle password visibility"
                              title="Show/hide password">
                        <span class="toggle-show" aria-hidden="true">👁️</span>
                        <span class="toggle-hide" aria-hidden="true" style="display: none;">🙈</span>
                      </button>
                    </div>
                    <div class="auth-input-error" id="dynamic-signup-password-error" role="alert" aria-live="polite" style="display: none;"></div>
                    <div class="password-strength-container" id="dynamic-password-strength-indicator">
                      <div class="password-strength-text" aria-live="polite">Enter password to see strength</div>
                      <div class="password-strength-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div class="strength-fill"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="auth-form-group">
                    <label for="dynamic-signup-confirm-password" class="auth-form-label">Confirm Password *</label>
                    <div class="auth-input-wrapper">
                      <input type="password"
                             id="dynamic-signup-confirm-password"
                             name="confirmPassword"
                             class="auth-form-input"
                             placeholder="Confirm your password"
                             required
                             autocomplete="new-password"
                             aria-describedby="dynamic-signup-confirm-password-error dynamic-password-match-indicator"
                             aria-invalid="false">
                      <button type="button"
                              class="auth-password-toggle"
                              data-target="dynamic-signup-confirm-password"
                              aria-label="Toggle password visibility"
                              title="Show/hide password">
                        <span class="toggle-show" aria-hidden="true">👁️</span>
                        <span class="toggle-hide" aria-hidden="true" style="display: none;">🙈</span>
                      </button>
                    </div>
                    <div class="auth-input-error" id="dynamic-signup-confirm-password-error" role="alert" aria-live="polite" style="display: none;"></div>
                    <div class="password-match-indicator" id="dynamic-password-match-indicator" aria-live="polite"></div>
                  </div>
                  
                  <div class="auth-form-actions">
                    <button type="submit" class="auth-submit-button">
                      <span class="button-text">Create Account</span>
                    </button>
                  </div>
                  
                  <div class="auth-error-message" id="dynamic-signup-error" style="display: none;"></div>
                </form>
              </div>
            </div>
            
            <div class="auth-modal-footer">
              <p class="auth-footer-text">
                Don't have an account?
                <a href="#" class="auth-footer-link" id="dynamic-create-account-link">Create Account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }
  
  /**
   * Inject CSS for the modal
   */
  injectCSS() {
    // Check if CSS is already loaded
    if (document.querySelector('#dynamic-auth-modal-css')) return
    
    // Load main auth CSS
    const authLink = document.createElement('link')
    authLink.id = 'dynamic-auth-modal-css'
    authLink.rel = 'stylesheet'
    authLink.href = './auth/auth.css'
    document.head.appendChild(authLink)
    
    // Load dynamic modal specific CSS
    const dynamicLink = document.createElement('link')
    dynamicLink.id = 'dynamic-auth-modal-dynamic-css'
    dynamicLink.rel = 'stylesheet'
    dynamicLink.href = './assets/css/auth-modal-dynamic.css'
    document.head.appendChild(dynamicLink)
  }
  
  /**
   * Create and inject the modal
   */
  createModal() {
    if (document.querySelector('#dynamicAuthOverlay')) return // Already exists
    
    this.injectCSS()
    
    // Create modal HTML
    const modalContainer = document.createElement('div')
    modalContainer.innerHTML = this.createModalHTML()
    document.body.appendChild(modalContainer.firstElementChild)
    
    this.modal = document.querySelector('#dynamicAuthModal')
    this.overlay = document.querySelector('#dynamicAuthOverlay')
    
    this.bindEvents()
    this.setupPasswordValidation()
    this.initRememberMe()
  }
  
  /**
   * Initialize remember me functionality
   */
  initRememberMe() {
    const rememberedEmail = localStorage.getItem('userEmail')
    const rememberMe = localStorage.getItem('rememberMe')
    
    if (rememberMe === 'true' && rememberedEmail) {
      const emailInput = document.getElementById('dynamic-signin-email')
      const checkbox = document.getElementById('dynamic-remember-me')
      
      if (emailInput) emailInput.value = rememberedEmail
      if (checkbox) checkbox.checked = true
    }
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Tab switching
    document.querySelectorAll('#dynamicAuthModal .auth-tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.closest('.auth-tab-button').dataset.tab
        this.switchTab(tabName)
      })
    })
    
    // Close modal
    const closeButton = this.modal.querySelector('.auth-close-button')
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
    const signinForm = document.getElementById('dynamic-signin-form')
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignIn(new FormData(e.target))
      })
    }
    
    const signupForm = document.getElementById('dynamic-signup-form')
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSignUp(new FormData(e.target))
      })
    }
    
    // Forgot password
    const forgotBtn = document.getElementById('dynamic-forgot-password-btn')
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        this.handleForgotPassword()
      })
    }
    
    // Password toggles
    this.modal.querySelectorAll('.auth-password-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target.closest('.auth-password-toggle').dataset.target
        this.togglePasswordVisibility(target)
      })
    })
    
    // Create Account link in footer
    const createAccountLink = document.getElementById('dynamic-create-account-link')
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
    const passwordInput = document.getElementById('dynamic-signup-password')
    const confirmInput = document.getElementById('dynamic-signup-confirm-password')
    
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
    const strengthText = this.modal.querySelector('.password-strength-text')
    const strengthBar = this.modal.querySelector('.password-strength-bar')
    const strengthFill = this.modal.querySelector('.strength-fill')
    
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
  }
  
  /**
   * Calculate password strength
   */
  calculatePasswordStrength(password) {
    let score = 0
    
    // Length checks
    if (password.length >= 8) score += 25
    if (password.length >= 12) score += 25
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 12.5
    if (/[A-Z]/.test(password)) score += 12.5
    if (/[0-9]/.test(password)) score += 12.5
    if (/[^A-Za-z0-9]/.test(password)) score += 12.5
    
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
      acceptable: score >= 50
    }
  }
  
  /**
   * Update password match indicator
   */
  updatePasswordMatch(password, confirmPassword) {
    const matchIndicator = document.getElementById('dynamic-password-match-indicator')
    
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
    const passwordInput = document.getElementById('dynamic-signup-password')
    const confirmInput = document.getElementById('dynamic-signup-confirm-password')
    const submitButton = this.modal.querySelector('#dynamic-signup-form .auth-submit-button')
    
    if (!passwordInput || !confirmInput || !submitButton) return
    
    const strength = this.calculatePasswordStrength(passwordInput.value)
    const passwordsMatch = passwordInput.value === confirmInput.value && passwordInput.value.length > 0
    
    const isValid = strength.acceptable && passwordsMatch
    
    submitButton.disabled = !isValid
    submitButton.setAttribute('aria-disabled', (!isValid).toString())
  }
  
  /**
   * Setup form validation
   */
  setupFormValidation() {
    this.modal.querySelectorAll('.auth-form-input').forEach(input => {
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
    let isValid = true
    let message = ''
    
    if (input.hasAttribute('required') && !value) {
      isValid = false
      message = `${this.getFieldLabel(input)} is required`
    } else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        isValid = false
        message = 'Please enter a valid email address'
      }
    }
    
    this.showInputError(input, isValid ? '' : message)
    return isValid
  }
  
  /**
   * Show input error
   */
  showInputError(input, message) {
    const errorId = `${input.id}-error`
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
    const errorId = `${input.id}-error`
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
    const label = this.modal.querySelector(`label[for="${input.id}"]`)
    return label ? label.textContent.replace('*', '').trim() : input.name
  }
  
  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    this.modal.querySelectorAll('.auth-tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    
    const newActiveTab = this.modal.querySelector(`[data-tab="${tabName}"]`)
    if (newActiveTab) {
      newActiveTab.classList.add('active')
    }
    
    // Update content
    this.modal.querySelectorAll('.auth-tab-content').forEach(content => {
      content.classList.remove('active')
    })
    
    const newContent = document.getElementById(`${tabName}-tab`)
    if (newContent) {
      newContent.classList.add('active')
    }
    
    // Update header text
    const headerText = this.modal.querySelector('.auth-modal-header h2')
    if (headerText) {
      headerText.textContent = tabName === 'signin' ? 'Welcome Back' : 'Create Account'
    }
    
    // Update footer text
    const footerText = this.modal.querySelector('.auth-footer-text')
    const footerLink = this.modal.querySelector('.auth-footer-link')
    if (footerText && footerLink) {
      if (tabName === 'signin') {
        footerText.firstChild.textContent = "Don't have an account? "
        footerLink.textContent = 'Create Account'
        footerLink.onclick = (e) => {
          e.preventDefault()
          this.switchTab('signup')
        }
      } else {
        footerText.firstChild.textContent = 'Already have an account? '
        footerLink.textContent = 'Sign In'
        footerLink.onclick = (e) => {
          e.preventDefault()
          this.switchTab('signin')
        }
      }
    }
    
    this.clearErrors()
    this.currentTab = tabName
    
    // Focus first input
    setTimeout(() => {
      const firstInput = this.modal.querySelector(`#${tabName}-tab input:not([type="checkbox"])`)
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  }
  
  /**
   * Show the modal
   */
  show(tab = 'signin') {
    if (this.isOpen) return
    
    // Create modal if it doesn't exist
    if (!this.modal) {
      this.createModal()
    }
    
    this.isOpen = true
    this.overlay.style.display = 'flex'
    document.body.style.overflow = 'hidden'
    
    // Animate in
    setTimeout(() => {
      this.overlay.classList.add('active')
      this.modal.classList.add('active')
    }, 10)
    
    // Switch to requested tab
    if (tab !== this.currentTab) {
      this.switchTab(tab)
    }
  }
  
  /**
   * Hide the modal
   */
  hide() {
    if (!this.isOpen) return
    
    this.isOpen = false
    this.overlay.classList.remove('active')
    this.modal.classList.remove('active')
    
    setTimeout(() => {
      this.overlay.style.display = 'none'
      document.body.style.overflow = 'auto'
    }, 300)
  }
  
  /**
   * Handle sign in
   */
  async handleSignIn(formData) {
    const submitButton = this.modal.querySelector('#dynamic-signin-form .auth-submit-button')
    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    const rememberMe = formData.get('remember')
    
    if (!this.validateSignInForm(email, password)) {
      return
    }
    
    this.clearErrors()
    this.setLoadingState(submitButton, true)
    
    try {
      // Demo authentication - check credentials
      if ((email === 'demo@learntav.com' && password === 'demo123') ||
          (email === 'admin@learntav.com' && password === 'admin123')) {
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('userEmail', email)
        }
        
        // Set auth state
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userRole', email.includes('admin') ? 'admin' : 'user')
        localStorage.setItem('userEmail', email)
        
        this.showSuccess('Welcome back! Redirecting to your dashboard...')
        
        setTimeout(() => {
          if (email.includes('admin')) {
            window.location.href = './admin/dashboard.html'
          } else {
            window.location.href = './dashboard/index.html'
          }
        }, 1500)
        
      } else {
        throw new Error('Invalid credentials')
      }
      
    } catch (error) {
      console.error('Sign in error:', error)
      this.showError('dynamic-signin-error', 'Invalid email or password. Please try again.')
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Handle sign up
   */
  async handleSignUp(formData) {
    const submitButton = this.modal.querySelector('#dynamic-signup-form .auth-submit-button')
    const fullName = formData.get('fullName')?.trim()
    const email = formData.get('email')?.trim()
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    if (!this.validateSignUpForm(fullName, email, password, confirmPassword)) {
      return
    }
    
    this.clearErrors()
    this.setLoadingState(submitButton, true)
    
    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      this.showSuccess('Account created successfully! Please check your email to verify your account.')
      
      setTimeout(() => {
        this.modal.querySelector('#dynamic-signup-form').reset()
        this.switchTab('signin')
        document.getElementById('dynamic-signin-email').value = email
      }, 2500)
      
    } catch (error) {
      console.error('Sign up error:', error)
      this.showError('dynamic-signup-error', 'Failed to create account. Please try again.')
    } finally {
      this.setLoadingState(submitButton, false)
    }
  }
  
  /**
   * Handle forgot password
   */
  async handleForgotPassword() {
    const email = document.getElementById('dynamic-signin-email').value
    
    if (!email) {
      this.showError('dynamic-signin-error', 'Please enter your email address first')
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.showSuccess('Password reset instructions sent to your email!')
    } catch (error) {
      this.showError('dynamic-signin-error', 'Failed to send reset email. Please try again.')
    }
  }
  
  /**
   * Validate sign in form
   */
  validateSignInForm(email, password) {
    if (!email) {
      this.showError('dynamic-signin-error', 'Please enter your email address')
      return false
    }
    if (!password) {
      this.showError('dynamic-signin-error', 'Please enter your password')
      return false
    }
    return true
  }
  
  /**
   * Validate sign up form
   */
  validateSignUpForm(fullName, email, password, confirmPassword) {
    if (!fullName) {
      this.showError('dynamic-signup-error', 'Please enter your full name')
      return false
    }
    if (!email) {
      this.showError('dynamic-signup-error', 'Please enter your email address')
      return false
    }
    if (!password) {
      this.showError('dynamic-signup-error', 'Please enter a password')
      return false
    }
    if (password !== confirmPassword) {
      this.showError('dynamic-signup-error', 'Passwords do not match')
      return false
    }
    
    const strength = this.calculatePasswordStrength(password)
    if (!strength.acceptable) {
      this.showError('dynamic-signup-error', 'Password is too weak. Please choose a stronger password.')
      return false
    }
    
    return true
  }
  
  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(targetId) {
    const input = document.getElementById(targetId)
    const button = this.modal.querySelector(`[data-target="${targetId}"]`)
    
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
  }
  
  /**
   * Set loading state for button
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
        if (button.closest('#dynamic-signin-form')) {
          buttonText.textContent = 'Sign In'
        } else if (button.closest('#dynamic-signup-form')) {
          buttonText.textContent = 'Create Account'
        }
      }
    }
  }
  
  /**
   * Show error message
   */
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    if (!errorElement) return
    
    const messageIcon = '⚠️'
    errorElement.innerHTML = `<span class="message-icon">${messageIcon}</span><span class="message-text">${message}</span>`
    errorElement.style.display = 'block'
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      errorElement.style.display = 'none'
    }, 8000)
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    let successElement = this.modal.querySelector('.auth-success-message')
    if (!successElement) {
      successElement = document.createElement('div')
      successElement.className = 'auth-success-message'
      const modalBody = this.modal.querySelector('.auth-modal-body')
      if (modalBody) {
        modalBody.insertBefore(successElement, modalBody.firstChild)
      }
    }
    
    const messageIcon = '✅'
    successElement.innerHTML = `<span class="message-icon">${messageIcon}</span><span class="message-text">${message}</span>`
    successElement.style.display = 'block'
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      successElement.style.display = 'none'
    }, 6000)
  }
  
  /**
   * Clear all error messages
   */
  clearErrors() {
    this.modal.querySelectorAll('.auth-error-message, .auth-success-message').forEach(el => {
      el.style.display = 'none'
    })
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we're not on the auth page
  if (!window.location.pathname.includes('/auth/')) {
    new DynamicAuthModal()
  }
})