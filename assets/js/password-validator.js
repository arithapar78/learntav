/**
 * Password Validation Utility
 * Provides comprehensive password validation with visual feedback
 */

export class PasswordValidator {
  constructor() {
    this.requirements = {
      length: { 
        min: 12, 
        regex: /.{12,}/, 
        message: "At least 12 characters",
        icon: "🔢"
      },
      uppercase: { 
        regex: /[A-Z]/, 
        message: "One uppercase letter (A-Z)",
        icon: "🔤" 
      },
      lowercase: { 
        regex: /[a-z]/, 
        message: "One lowercase letter (a-z)",
        icon: "🔡" 
      },
      number: { 
        regex: /\d/, 
        message: "One number (0-9)",
        icon: "🔢" 
      },
      special: { 
        regex: /[@$!%*?&]/, 
        message: "One special character (@$!%*?&)",
        icon: "🔣" 
      }
    }
  }
  
  /**
   * Validate password against all requirements
   * @param {string} password - Password to validate
   * @returns {object} Validation results
   */
  validate(password) {
    const results = {}
    let isValid = true
    let score = 0
    
    for (const [key, requirement] of Object.entries(this.requirements)) {
      const passes = requirement.regex.test(password)
      results[key] = {
        passes,
        message: requirement.message,
        icon: requirement.icon,
        class: passes ? 'valid' : 'invalid'
      }
      
      if (!passes) {
        isValid = false
      } else {
        score += 20 // Each requirement is worth 20 points (100% total)
      }
    }
    
    // Calculate strength
    let strength = 'weak'
    if (score >= 100) strength = 'strong'
    else if (score >= 80) strength = 'good'
    else if (score >= 60) strength = 'fair'
    
    return { 
      isValid, 
      requirements: results, 
      score,
      strength,
      strengthColor: this.getStrengthColor(strength)
    }
  }
  
  /**
   * Get color for password strength
   * @param {string} strength - Password strength level
   * @returns {string} CSS color value
   */
  getStrengthColor(strength) {
    const colors = {
      weak: '#dc2626',     // Red
      fair: '#d97706',     // Orange
      good: '#16a34a',     // Green
      strong: '#059669'    // Dark green
    }
    return colors[strength] || colors.weak
  }
  
  /**
   * Create validation UI elements
   * @param {string} containerId - ID of container element
   * @param {object} options - Configuration options
   */
  createValidationUI(containerId, options = {}) {
    const container = document.getElementById(containerId)
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`)
      return
    }
    
    const config = {
      showStrengthBar: true,
      showRequirements: true,
      showScore: false,
      className: 'password-requirements',
      ...options
    }
    
    let html = `<div class="${config.className}">`
    
    // Strength bar
    if (config.showStrengthBar) {
      html += `
        <div class="strength-container">
          <div class="strength-bar">
            <div class="strength-fill" id="strength-fill-${containerId}"></div>
          </div>
          <span class="strength-text" id="strength-text-${containerId}">Enter password</span>
          ${config.showScore ? '<span class="strength-score" id="strength-score-' + containerId + '">0%</span>' : ''}
        </div>
      `
    }
    
    // Requirements list
    if (config.showRequirements) {
      html += '<div class="requirements-list">'
      Object.entries(this.requirements).forEach(([key, req]) => {
        html += `
          <div class="requirement" id="req-${key}-${containerId}" data-requirement="${key}">
            <span class="requirement-icon">${req.icon}</span>
            <span class="checkmark">✗</span>
            <span class="text">${req.message}</span>
          </div>
        `
      })
      html += '</div>'
    }
    
    html += '</div>'
    container.innerHTML = html
    
    // Add CSS if not already added
    this.injectCSS()
  }
  
  /**
   * Update validation UI with current password
   * @param {string} password - Current password value
   * @param {string} containerId - Container ID
   * @returns {boolean} Whether password is valid
   */
  updateValidationUI(password, containerId) {
    const validation = this.validate(password)
    
    // Update requirements
    Object.entries(validation.requirements).forEach(([key, result]) => {
      const element = document.getElementById(`req-${key}-${containerId}`)
      if (element) {
        element.className = `requirement ${result.class}`
        const checkmark = element.querySelector('.checkmark')
        if (checkmark) {
          checkmark.textContent = result.passes ? '✓' : '✗'
          checkmark.setAttribute('aria-label', result.passes ? 'Requirement met' : 'Requirement not met')
        }
      }
    })
    
    // Update strength bar
    const strengthFill = document.getElementById(`strength-fill-${containerId}`)
    const strengthText = document.getElementById(`strength-text-${containerId}`)
    const strengthScore = document.getElementById(`strength-score-${containerId}`)
    
    if (strengthFill && strengthText) {
      const percentage = password.length === 0 ? 0 : validation.score
      strengthFill.style.width = `${percentage}%`
      strengthFill.style.backgroundColor = validation.strengthColor
      strengthText.textContent = password.length === 0 ? 'Enter password' : 
        `Password strength: ${validation.strength}`
      strengthText.style.color = validation.strengthColor
      
      if (strengthScore) {
        strengthScore.textContent = `${percentage}%`
      }
    }
    
    return validation.isValid
  }
  
  /**
   * Check if two passwords match
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @returns {object} Match result
   */
  validatePasswordMatch(password, confirmPassword) {
    const matches = password === confirmPassword && password.length > 0
    return {
      matches,
      message: matches ? 'Passwords match' : 'Passwords do not match',
      class: matches ? 'valid' : 'invalid'
    }
  }
  
  /**
   * Update password match UI
   * @param {string} password - Original password
   * @param {string} confirmPassword - Confirmation password
   * @param {string} containerId - Container ID for match indicator
   */
  updatePasswordMatchUI(password, confirmPassword, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return
    
    const result = this.validatePasswordMatch(password, confirmPassword)
    
    let html = ''
    if (confirmPassword.length > 0) {
      html = `
        <div class="password-match ${result.class}">
          <span class="checkmark">${result.matches ? '✓' : '✗'}</span>
          <span class="text">${result.message}</span>
        </div>
      `
    }
    
    container.innerHTML = html
    return result.matches
  }
  
  /**
   * Generate a strong password suggestion
   * @param {number} length - Desired password length (min 12)
   * @returns {string} Generated password
   */
  generateStrongPassword(length = 16) {
    if (length < 12) length = 12
    
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '@$!%*?&'
    
    let password = ''
    
    // Ensure at least one character from each required set
    password += this.getRandomChar(uppercase)
    password += this.getRandomChar(lowercase)
    password += this.getRandomChar(numbers)
    password += this.getRandomChar(symbols)
    
    // Fill remaining length with random characters from all sets
    const allChars = lowercase + uppercase + numbers + symbols
    for (let i = password.length; i < length; i++) {
      password += this.getRandomChar(allChars)
    }
    
    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password)
  }
  
  /**
   * Get random character from string
   * @param {string} str - String to pick from
   * @returns {string} Random character
   */
  getRandomChar(str) {
    return str.charAt(Math.floor(Math.random() * str.length))
  }
  
  /**
   * Shuffle string characters
   * @param {string} str - String to shuffle
   * @returns {string} Shuffled string
   */
  shuffleString(str) {
    return str.split('').sort(() => Math.random() - 0.5).join('')
  }
  
  /**
   * Inject CSS styles for validation UI
   */
  injectCSS() {
    if (document.getElementById('password-validator-styles')) {
      return // Already injected
    }
    
    const styles = `
      <style id="password-validator-styles">
        .password-requirements {
          margin-top: 0.75rem;
          padding: 1rem;
          background: rgba(249, 250, 251, 0.5);
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .strength-container {
          margin-bottom: 0.75rem;
        }
        
        .strength-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .strength-fill {
          height: 100%;
          width: 0%;
          background: #dc2626;
          transition: all 0.3s ease;
          border-radius: 3px;
        }
        
        .strength-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          transition: color 0.3s ease;
        }
        
        .strength-score {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-left: 0.5rem;
        }
        
        .requirements-list {
          display: grid;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .requirement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }
        
        .requirement.valid {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }
        
        .requirement.invalid {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }
        
        .requirement-icon {
          font-size: 1rem;
          opacity: 0.7;
        }
        
        .requirement .checkmark {
          font-weight: bold;
          width: 16px;
          text-align: center;
        }
        
        .requirement.valid .checkmark {
          color: #059669;
        }
        
        .requirement.invalid .checkmark {
          color: #dc2626;
        }
        
        .requirement .text {
          flex: 1;
        }
        
        .password-match {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .password-match.valid {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .password-match.invalid {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .password-match .checkmark {
          font-weight: bold;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .password-requirements {
            background: rgba(17, 24, 39, 0.5);
            border-color: #374151;
          }
          
          .strength-bar {
            background: #374151;
          }
          
          .strength-text {
            color: #d1d5db;
          }
          
          .strength-score {
            color: #9ca3af;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .strength-fill,
          .requirement,
          .password-match {
            transition: none;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .requirement.valid {
            background: #dcfdf7;
            border: 2px solid #059669;
          }
          
          .requirement.invalid {
            background: #fef2f2;
            border: 2px solid #dc2626;
          }
          
          .password-match.valid {
            border-width: 2px;
          }
          
          .password-match.invalid {
            border-width: 2px;
          }
        }
      </style>
    `
    
    document.head.insertAdjacentHTML('beforeend', styles)
  }
  
  /**
   * Remove validation UI
   * @param {string} containerId - Container ID to clear
   */
  removeValidationUI(containerId) {
    const container = document.getElementById(containerId)
    if (container) {
      container.innerHTML = ''
    }
  }
  
  /**
   * Get password strength as number (0-100)
   * @param {string} password - Password to evaluate
   * @returns {number} Strength score
   */
  getPasswordScore(password) {
    return this.validate(password).score
  }
  
  /**
   * Check if password meets minimum requirements
   * @param {string} password - Password to check
   * @returns {boolean} Whether password is acceptable
   */
  isPasswordAcceptable(password) {
    return this.validate(password).isValid
  }
}

// Export singleton instance for easy use
export const passwordValidator = new PasswordValidator()

// Make available globally for legacy code
if (typeof window !== 'undefined') {
  window.PasswordValidator = PasswordValidator
  window.passwordValidator = passwordValidator
}