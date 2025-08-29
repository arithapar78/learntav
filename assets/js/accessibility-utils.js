/**
 * Accessibility Utilities
 * Comprehensive JavaScript utilities for enhanced accessibility
 */

class AccessibilityManager {
  constructor() {
    this.announcer = null
    this.focusTrap = null
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.highContrast = window.matchMedia('(prefers-contrast: high)').matches
    this.touchDevice = 'ontouchstart' in window
    this.screenReaderActive = this.detectScreenReader()
    
    this.init()
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.createLiveRegion()
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupScreenReaderSupport()
    this.setupMotionPreferences()
    this.setupTouchOptimizations()
    this.monitorAccessibilityChanges()
    
    console.log('✅ Accessibility Manager initialized')
  }

  /**
   * Create ARIA live region for announcements
   */
  createLiveRegion() {
    // Create polite announcer
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.className = 'sr-only'
    this.announcer.id = 'accessibility-announcer'
    document.body.appendChild(this.announcer)

    // Create assertive announcer for urgent messages
    this.urgentAnnouncer = document.createElement('div')
    this.urgentAnnouncer.setAttribute('aria-live', 'assertive')
    this.urgentAnnouncer.setAttribute('aria-atomic', 'true')
    this.urgentAnnouncer.className = 'sr-only'
    this.urgentAnnouncer.id = 'accessibility-urgent-announcer'
    document.body.appendChild(this.urgentAnnouncer)
  }

  /**
   * Announce message to screen readers
   */
  announce(message, urgent = false) {
    const announcer = urgent ? this.urgentAnnouncer : this.announcer
    
    // Clear previous message
    announcer.textContent = ''
    
    // Add new message after a brief delay
    setTimeout(() => {
      announcer.textContent = message
    }, 100)
    
    // Clear message after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, urgent ? 3000 : 1500)
  }

  /**
   * Setup enhanced keyboard navigation
   */
  setupKeyboardNavigation() {
    // Arrow key navigation for tab-like interfaces
    this.setupArrowKeyNavigation()
    
    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey()
      }
    })
    
    // Tab key focus management
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e)
      }
    })
    
    // Enter and Space key activation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivationKey(e)
      }
    })
  }

  /**
   * Setup arrow key navigation for tab-like interfaces
   */
  setupArrowKeyNavigation() {
    const tabGroups = document.querySelectorAll('[role="tablist"], .learntav-contact-tabs__nav')
    
    tabGroups.forEach(group => {
      const tabs = group.querySelectorAll('[role="tab"], .learntav-tab-btn')
      
      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          let targetIndex = -1
          
          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              e.preventDefault()
              targetIndex = index > 0 ? index - 1 : tabs.length - 1
              break
            case 'ArrowRight':
            case 'ArrowDown':
              e.preventDefault()
              targetIndex = index < tabs.length - 1 ? index + 1 : 0
              break
            case 'Home':
              e.preventDefault()
              targetIndex = 0
              break
            case 'End':
              e.preventDefault()
              targetIndex = tabs.length - 1
              break
          }
          
          if (targetIndex >= 0) {
            tabs[targetIndex].focus()
            tabs[targetIndex].click()
            this.announce(`Switched to ${tabs[targetIndex].textContent}`)
          }
        })
      })
    })
  }

  /**
   * Handle Escape key press
   */
  handleEscapeKey() {
    // Close modals
    const modals = document.querySelectorAll('.auth-modal, .detail-modal, .simple-auth-modal')
    modals.forEach(modal => {
      if (modal.style.display !== 'none' && !modal.hidden) {
        const closeBtn = modal.querySelector('[data-close], .close, .modal-close')
        if (closeBtn) {
          closeBtn.click()
        }
      }
    })
    
    // Close dropdowns
    const dropdowns = document.querySelectorAll('.user-profile-dropdown.open')
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('open')
    })
    
    // Close mobile menu
    const mobileMenu = document.querySelector('.learntav-nav__menu.active')
    if (mobileMenu) {
      const toggleBtn = document.querySelector('.learntav-nav__toggle')
      if (toggleBtn) {
        toggleBtn.click()
      }
    }
  }

  /**
   * Handle Tab key navigation
   */
  handleTabKey(e) {
    // Check if we're in a modal or focus trap
    const activeModal = document.querySelector('.auth-modal:not([hidden]), .detail-modal:not([hidden])')
    
    if (activeModal) {
      this.trapFocus(e, activeModal)
    }
  }

  /**
   * Trap focus within a container
   */
  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Handle Enter and Space key activation
   */
  handleActivationKey(e) {
    const target = e.target
    
    // Handle buttons that aren't real buttons
    if (target.getAttribute('role') === 'button' && target.tagName !== 'BUTTON') {
      e.preventDefault()
      target.click()
    }
    
    // Handle tab activation
    if (target.classList.contains('learntav-tab-btn') || target.getAttribute('role') === 'tab') {
      if (e.key === 'Enter' || (e.key === ' ' && target.getAttribute('role') === 'tab')) {
        e.preventDefault()
        target.click()
      }
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Add focus classes for styling
    document.addEventListener('focusin', (e) => {
      e.target.classList.add('focus-visible')
    })
    
    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-visible')
    })
    
    // Skip link functionality
    this.createSkipLinks()
    
    // Manage focus for dynamic content
    this.setupDynamicFocusManagement()
  }

  /**
   * Create skip links for navigation
   */
  createSkipLinks() {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'
    skipLink.setAttribute('aria-label', 'Skip to main content')
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector('#main-content')
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        this.announce('Skipped to main content')
      }
    })
    
    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  /**
   * Setup dynamic focus management for SPAs
   */
  setupDynamicFocusManagement() {
    // Focus management for route changes
    window.addEventListener('popstate', () => {
      this.handleRouteChange()
    })
    
    // Focus management for dynamic content loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.setupNewContent(node)
            }
          })
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Handle route changes for accessibility
   */
  handleRouteChange() {
    // Announce route change
    const title = document.title
    this.announce(`Navigated to ${title}`)
    
    // Focus on main content or page heading
    const mainContent = document.querySelector('#main-content, main, h1')
    if (mainContent) {
      mainContent.focus()
    }
  }

  /**
   * Setup accessibility for new content
   */
  setupNewContent(element) {
    // Add ARIA labels to elements missing them
    const interactiveElements = element.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby])'
    )
    
    interactiveElements.forEach(el => {
      if (!el.textContent.trim() && !el.value) {
        const context = el.closest('[data-section]')?.dataset.section || 'page'
        el.setAttribute('aria-label', `Interactive element in ${context}`)
      }
    })
    
    // Setup form labels
    const inputs = element.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      this.setupFormAccessibility(input)
    })
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Add landmark roles if missing
    this.addLandmarkRoles()
    
    // Setup heading hierarchy
    this.validateHeadingHierarchy()
    
    // Add descriptions to complex elements
    this.addElementDescriptions()
    
    // Setup live regions for dynamic content
    this.setupLiveRegions()
  }

  /**
   * Add landmark roles to page sections
   */
  addLandmarkRoles() {
    // Add main role if missing
    if (!document.querySelector('main, [role="main"]')) {
      const mainContent = document.querySelector('#main-content, .main-content')
      if (mainContent) {
        mainContent.setAttribute('role', 'main')
      }
    }
    
    // Add navigation role if missing
    const navs = document.querySelectorAll('nav:not([role])')
    navs.forEach(nav => {
      nav.setAttribute('role', 'navigation')
    })
    
    // Add banner role to header if missing
    const header = document.querySelector('header:not([role])')
    if (header) {
      header.setAttribute('role', 'banner')
    }
    
    // Add contentinfo role to footer if missing
    const footer = document.querySelector('footer:not([role])')
    if (footer) {
      footer.setAttribute('role', 'contentinfo')
    }
  }

  /**
   * Validate and fix heading hierarchy
   */
  validateHeadingHierarchy() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentLevel = 0
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1))
      
      // Check for proper hierarchy
      if (level > currentLevel + 1) {
        console.warn(`Heading hierarchy skip detected: ${heading.tagName} after h${currentLevel}`, heading)
      }
      
      currentLevel = level
      
      // Add IDs for in-page navigation
      if (!heading.id) {
        const id = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        
        if (id && !document.getElementById(id)) {
          heading.id = id
        }
      }
    })
  }

  /**
   * Add descriptions to complex elements
   */
  addElementDescriptions() {
    // Add descriptions to forms
    const forms = document.querySelectorAll('form:not([aria-describedby])')
    forms.forEach(form => {
      const description = form.querySelector('.form-description, .form-help')
      if (description && !description.id) {
        const id = `form-desc-${Math.random().toString(36).substr(2, 9)}`
        description.id = id
        form.setAttribute('aria-describedby', id)
      }
    })
    
    // Add descriptions to password fields
    const passwordFields = document.querySelectorAll('input[type="password"]:not([aria-describedby])')
    passwordFields.forEach(field => {
      const requirements = field.parentNode.querySelector('.password-requirements, .password-help')
      if (requirements) {
        const id = `pwd-req-${Math.random().toString(36).substr(2, 9)}`
        requirements.id = id
        field.setAttribute('aria-describedby', id)
      }
    })
  }

  /**
   * Setup live regions for dynamic content
   */
  setupLiveRegions() {
    // Add live regions to status messages
    const statusContainers = document.querySelectorAll('.status-messages, .alerts, .notifications')
    statusContainers.forEach(container => {
      if (!container.getAttribute('aria-live')) {
        container.setAttribute('aria-live', 'polite')
        container.setAttribute('aria-atomic', 'true')
      }
    })
    
    // Setup live regions for loading states
    const loadingContainers = document.querySelectorAll('.loading-container, .spinner-container')
    loadingContainers.forEach(container => {
      container.setAttribute('aria-live', 'polite')
      container.setAttribute('aria-label', 'Loading content')
    })
  }

  /**
   * Setup form accessibility
   */
  setupFormAccessibility(input) {
    const label = input.parentNode.querySelector('label')
    const wrapper = input.closest('.form-group, .learntav-form__group')
    
    // Associate label with input
    if (label && !input.getAttribute('aria-labelledby')) {
      if (!label.id) {
        label.id = `label-${Math.random().toString(36).substr(2, 9)}`
      }
      input.setAttribute('aria-labelledby', label.id)
    }
    
    // Add required indicator
    if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
      input.setAttribute('aria-required', 'true')
    }
    
    // Setup error handling
    input.addEventListener('invalid', (e) => {
      e.preventDefault()
      this.displayFormError(input, input.validationMessage)
    })
    
    // Clear errors on input
    input.addEventListener('input', () => {
      this.clearFormError(input)
    })
  }

  /**
   * Display form error with accessibility support
   */
  displayFormError(input, message) {
    this.clearFormError(input)
    
    const errorElement = document.createElement('div')
    errorElement.className = 'form-error'
    errorElement.id = `error-${input.id || Math.random().toString(36).substr(2, 9)}`
    errorElement.textContent = message
    errorElement.setAttribute('role', 'alert')
    errorElement.setAttribute('aria-live', 'polite')
    
    input.parentNode.appendChild(errorElement)
    input.setAttribute('aria-describedby', errorElement.id)
    input.setAttribute('aria-invalid', 'true')
    
    // Announce error
    this.announce(`Error: ${message}`, true)
  }

  /**
   * Clear form error
   */
  clearFormError(input) {
    const existingError = input.parentNode.querySelector('.form-error')
    if (existingError) {
      existingError.remove()
    }
    
    input.removeAttribute('aria-describedby')
    input.removeAttribute('aria-invalid')
  }

  /**
   * Setup motion preferences
   */
  setupMotionPreferences() {
    if (this.reducedMotion) {
      document.body.classList.add('reduce-motion')
      
      // Disable problematic animations
      const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]')
      animatedElements.forEach(el => {
        el.style.animation = 'none'
        el.style.transition = 'none'
      })
    }
    
    // Listen for preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addListener((mq) => {
      this.reducedMotion = mq.matches
      document.body.classList.toggle('reduce-motion', this.reducedMotion)
      
      if (this.reducedMotion) {
        this.announce('Animations disabled for accessibility')
      }
    })
  }

  /**
   * Setup touch device optimizations
   */
  setupTouchOptimizations() {
    if (this.touchDevice) {
      document.body.classList.add('touch-device')
      
      // Ensure touch targets are large enough
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea')
      interactiveElements.forEach(el => {
        if (!el.classList.contains('touch-target')) {
          el.classList.add('touch-target')
        }
      })
      
      // Remove hover effects on touch devices
      const hoverElements = document.querySelectorAll('[class*="hover"]')
      hoverElements.forEach(el => {
        el.classList.add('no-hover')
      })
    }
  }

  /**
   * Detect screen reader usage
   */
  detectScreenReader() {
    // Check for common screen reader indicators
    const indicators = [
      () => window.navigator.userAgent.includes('NVDA'),
      () => window.navigator.userAgent.includes('JAWS'),
      () => window.speechSynthesis && window.speechSynthesis.getVoices().length > 0,
      () => window.navigator.userAgent.includes('VoiceOver'),
      () => 'speechSynthesis' in window
    ]
    
    return indicators.some(test => test())
  }

  /**
   * Monitor accessibility-related changes
   */
  monitorAccessibilityChanges() {
    // Monitor contrast preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    contrastQuery.addListener((mq) => {
      this.highContrast = mq.matches
      document.body.classList.toggle('high-contrast', this.highContrast)
      
      if (this.highContrast) {
        this.announce('High contrast mode enabled')
      }
    })
    
    // Monitor focus changes for debugging
    if (window.location.search.includes('debug-focus')) {
      document.addEventListener('focusin', (e) => {
        console.log('Focus:', e.target)
      })
    }
  }

  /**
   * Test accessibility compliance
   */
  async testAccessibility() {
    const issues = []
    
    // Test for missing alt text
    const images = document.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`)
    }
    
    // Test for missing labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const unlabeledInputs = Array.from(inputs).filter(input => 
      !input.closest('label') && input.type !== 'hidden'
    )
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} form inputs missing labels`)
    }
    
    // Test for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.substring(1))
      if (currentLevel > previousLevel + 1) {
        issues.push(`Heading hierarchy skip: ${heading.tagName} after h${previousLevel}`)
      }
      previousLevel = currentLevel
    })
    
    // Test for color contrast (simplified)
    const buttons = document.querySelectorAll('button, .btn')
    buttons.forEach(button => {
      const style = getComputedStyle(button)
      const bgColor = style.backgroundColor
      const textColor = style.color
      
      // This is a simplified check - real implementation would calculate contrast ratio
      if (bgColor === textColor) {
        issues.push('Button with insufficient color contrast detected')
      }
    })
    
    return {
      passed: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 10))
    }
  }

  /**
   * Generate accessibility report
   */
  async generateAccessibilityReport() {
    const report = await this.testAccessibility()
    
    console.group('♿ Accessibility Report')
    console.log(`Score: ${report.score}/100`)
    console.log(`Status: ${report.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}`)
    
    if (report.issues.length > 0) {
      console.group('Issues Found:')
      report.issues.forEach(issue => console.warn(`• ${issue}`))
      console.groupEnd()
    } else {
      console.log('🎉 No accessibility issues found!')
    }
    
    console.groupEnd()
    
    return report
  }
}

// Initialize accessibility manager when DOM is ready
let accessibilityManager = null

document.addEventListener('DOMContentLoaded', function() {
  accessibilityManager = new AccessibilityManager()
  
  // Make accessibility functions globally available
  window.accessibility = accessibilityManager
  window.announce = (message, urgent) => accessibilityManager.announce(message, urgent)
})

// Export for ES6 modules
export default AccessibilityManager
export { AccessibilityManager }

// Make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.AccessibilityManager = AccessibilityManager
}