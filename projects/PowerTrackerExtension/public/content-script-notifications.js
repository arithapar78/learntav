// ===========================
// Power AI - CSP-Compliant In-Page Notification System
// Secure implementation for Gmail, Docs, and other secure sites
// ===========================

(() => {
  // Prevent multiple initialization
  if (window.__powerAINotificationSystemLoaded) {
    console.log('[PowerAI] Notification system already loaded');
    return;
  }

  // Security checks for CSP compliance
  const isSecureSite = () => {
    try {
      const hostname = window.location.hostname.toLowerCase();
      const secureHosts = ['mail.google.com', 'docs.google.com', 'drive.google.com', 'gmail.com'];
      return secureHosts.some(host => hostname.includes(host));
    } catch (error) {
      return false;
    }
  };

  const hasStrictCSP = () => {
    try {
      // Check for Trusted Types policy (modern CSP indicator)
      if (typeof window.trustedTypes !== 'undefined') {
        return true;
      }
      
      // Check for Content-Security-Policy header indicators
      const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      if (metaTags.length > 0) {
        return true;
      }
      
      // Check for common secure site indicators
      const hostname = window.location.hostname.toLowerCase();
      const secureHosts = ['mail.google.com', 'docs.google.com', 'drive.google.com', 'gmail.com'];
      
      return secureHosts.some(host => hostname.includes(host));
    } catch (error) {
      // If we can't detect, assume strict CSP for safety
      return true;
    }
  };

  /**
   * CSP-Compliant Energy Tip Notification Manager
   * Features: Safe DOM creation, Chrome API error handling, demo mode
   */
  class EnergyTipNotificationManager {
    constructor() {
      this.notifications = [];
      this.container = null;
      this.isInitialized = false;
      this.messageListener = null;
      this.settings = null;
      this.apiAvailable = false;
      this.nextId = 1;
      this.isSecureSite = isSecureSite();
      this.hasStrictCSP = hasStrictCSP();
      
      this.init();
    }

    init() {
      try {
        // Enhanced security logging
        if (this.isSecureSite) {
          console.log('[PowerAI] Running on secure site, using enhanced security mode');
        }
        if (this.hasStrictCSP) {
          console.log('[PowerAI] Strict CSP detected, using safe DOM methods only');
        }
        
        // Check API availability first
        this.apiAvailable = this.checkChromeApiAvailability();
        
        if (this.apiAvailable) {
          console.log('[PowerAI] Chrome APIs available, full functionality enabled');
          this.setupChromeIntegration();
        } else {
          console.log('[PowerAI] Chrome APIs not available, running in standalone mode');
          this.setupStandaloneMode();
        }
        
        this.createNotificationContainer();
        this.loadSettings();
        this.isInitialized = true;
        
      } catch (error) {
        console.error('[PowerAI] Initialization failed:', error);
        this.setupStandaloneMode();
      }
    }

    checkChromeApiAvailability() {
      try {
        // Comprehensive Chrome API check
        if (typeof chrome === 'undefined') {
          console.log('[PowerAI] Chrome object not available');
          return false;
        }
        
        if (!chrome.runtime) {
          console.log('[PowerAI] Chrome runtime not available');
          return false;
        }
        
        if (!chrome.runtime.id) {
          console.log('[PowerAI] Chrome runtime ID not available - extension context invalid');
          return false;
        }
        
        if (!chrome.runtime.sendMessage) {
          console.log('[PowerAI] Chrome sendMessage API not available');
          return false;
        }
        
        return true;
        
      } catch (error) {
        console.log('[PowerAI] Chrome API availability check failed:', error.message);
        return false;
      }
    }

    setupChromeIntegration() {
      try {
        // Set up message listener for extension communication
        if (chrome.runtime.onMessage) {
          this.messageListener = (message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
          };
          chrome.runtime.onMessage.addListener(this.messageListener);
          console.log('[PowerAI] Chrome integration setup complete');
        }
      } catch (error) {
        console.error('[PowerAI] Chrome integration setup failed:', error);
        this.apiAvailable = false;
        this.setupStandaloneMode();
      }
    }

    setupStandaloneMode() {
      console.log('[PowerAI] Setting up standalone mode with demo functionality');
      
      // Use default settings when Chrome APIs aren't available
      this.settings = {
        notificationsEnabled: true,
        notificationFrequency: 'normal',
        notificationPosition: 'bottom-right',
        darkMode: this.detectDarkMode()
      };
      
      // Simulate demo notifications
      setTimeout(() => {
        this.showDemoTip();
      }, 3000);
    }

    detectDarkMode() {
      try {
        // Check for system dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return true;
        }
        
        // Check for dark theme indicators in the page
        const bodyClass = document.body.className.toLowerCase();
        const htmlClass = document.documentElement.className.toLowerCase();
        
        return bodyClass.includes('dark') || htmlClass.includes('dark') ||
               bodyClass.includes('night') || htmlClass.includes('night');
      } catch (error) {
        return false;
      }
    }

    handleMessage(message, sender, sendResponse) {
      try {
        switch (message.type) {
          case 'SHOW_ENERGY_TIP':
            this.showTip(message.tipData);
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
          case 'HIDE_ENERGY_TIP':
            if (message.id) {
              this.hideTip(message.id);
            } else {
              this.hideAllTips();
            }
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
          case 'UPDATE_NOTIFICATION_SETTINGS':
            this.updateSettings(message.settings);
            if (sendResponse) {
              sendResponse({ success: true });
            }
            break;
        }
      } catch (error) {
        console.error('[PowerAI] Message handling failed:', error);
        if (sendResponse) {
          sendResponse({ success: false, error: error.message });
        }
      }
      return true;
    }

    async loadSettings() {
      try {
        if (this.apiAvailable) {
          const response = await this.sendMessage({ type: 'GET_SETTINGS' });
          
          if (response && response.success) {
            this.settings = response.settings;
            console.log('[PowerAI] Settings loaded from extension');
          } else {
            console.log('[PowerAI] Failed to load settings from extension, using defaults');
            this.useDefaultSettings();
          }
        } else {
          console.log('[PowerAI] Using default settings (Chrome APIs unavailable)');
          this.useDefaultSettings();
        }
      } catch (error) {
        console.error('[PowerAI] Settings loading failed:', error);
        this.useDefaultSettings();
      }
    }

    useDefaultSettings() {
      this.settings = {
        notificationsEnabled: true,
        notificationFrequency: 'normal',
        notificationPosition: 'bottom-right',
        darkMode: this.detectDarkMode()
      };
    }

    async sendMessage(message) {
      try {
        if (!this.apiAvailable) {
          console.log('[PowerAI] Chrome APIs not available for message sending');
          return { success: false, error: 'API not available' };
        }
        
        if (!chrome.runtime || !chrome.runtime.id) {
          console.log('[PowerAI] Extension context invalid during message send');
          this.apiAvailable = false;
          return { success: false, error: 'Context invalid' };
        }
        
        const response = await chrome.runtime.sendMessage(message);
        return response || { success: false, error: 'No response' };
        
      } catch (error) {
        console.error('[PowerAI] Message sending failed:', error.message);
        
        // Mark API as unavailable if connection fails
        if (error.message.includes('Could not establish connection') ||
            error.message.includes('Extension context invalidated')) {
          this.apiAvailable = false;
        }
        
        return { success: false, error: error.message };
      }
    }

    createNotificationContainer() {
      if (this.container) return;
      
      try {
        this.container = this.createSecureElement('div', {
          id: 'power-ai-notification-container',
          className: 'power-ai-notifications',
          styles: {
            position: 'fixed',
            zIndex: '10001',
            pointerEvents: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            right: '30px',
            bottom: '30px'
          }
        });
        
        if (this.container) {
          document.body.appendChild(this.container);
          console.log('[PowerAI] Notification container created');
        } else {
          console.error('[PowerAI] Failed to create notification container');
        }
      } catch (error) {
        console.error('[PowerAI] Container creation failed:', error);
      }
    }

    // Safe DOM creation that works with Content Security Policy
    createSecureElement(tagName, options = {}) {
      try {
        const element = document.createElement(tagName);
        
        // Set attributes safely
        if (options.className) {
          element.className = options.className;
        }
        
        if (options.id) {
          element.id = options.id;
        }
        
        // Set text content safely (never use innerHTML)
        if (options.textContent) {
          element.textContent = options.textContent;
        }
        
        // Set styles safely
        if (options.styles) {
          Object.keys(options.styles).forEach(property => {
            element.style[property] = options.styles[property];
          });
        }
        
        // Add event listeners safely
        if (options.onclick) {
          element.addEventListener('click', options.onclick);
        }
        
        if (options.onmouseenter) {
          element.addEventListener('mouseenter', options.onmouseenter);
        }
        
        if (options.onmouseleave) {
          element.addEventListener('mouseleave', options.onmouseleave);
        }
        
        return element;
        
      } catch (error) {
        console.error('[PowerAI] Element creation failed:', error);
        return null;
      }
    }

    createNotificationElement(tipData) {
      try {
        // Create main notification container - CSP compliant
        const notification = this.createSecureElement('div', {
          className: `energy-tip-notification ${this.settings?.darkMode ? 'dark-mode' : ''}`,
          styles: {
            position: 'fixed',
            right: '30px',
            background: this.settings?.darkMode 
              ? 'rgba(30, 41, 59, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: this.settings?.darkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            maxWidth: '320px',
            minWidth: '280px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            zIndex: '10002',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transform: 'translateX(100%)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            color: this.settings?.darkMode ? '#f1f5f9' : '#1f2937',
            pointerEvents: 'auto'
          }
        });
        
        if (!notification) {
          console.error('[PowerAI] Failed to create notification container');
          return null;
        }
        
        // Create header section
        const header = this.createSecureElement('div', {
          styles: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px'
          }
        });
        
        // Create icon
        const icon = this.createSecureElement('span', {
          textContent: tipData.icon || '⚡',
          styles: {
            fontSize: '20px',
            marginRight: '10px'
          }
        });
        
        // Create title
        const title = this.createSecureElement('span', {
          textContent: tipData.title || 'Energy Tip',
          styles: {
            fontWeight: '600',
            fontSize: '14px',
            flex: '1'
          }
        });
        
        // Create close button
        const closeButton = this.createSecureElement('button', {
          textContent: '×',
          styles: {
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: this.settings?.darkMode ? '#94a3b8' : '#6b7280',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          onclick: () => {
            this.dismissNotification(notification);
          }
        });
        
        // Create message section
        const message = this.createSecureElement('div', {
          textContent: tipData.message || 'Consider optimizing your energy usage.',
          styles: {
            fontSize: '13px',
            lineHeight: '1.4',
            marginBottom: tipData.actionText ? '12px' : '0',
            color: this.settings?.darkMode ? '#cbd5e1' : '#4b5563'
          }
        });
        
        // Assemble header
        header.appendChild(icon);
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Assemble notification
        notification.appendChild(header);
        notification.appendChild(message);
        
        // Create action button if specified
        if (tipData.actionText) {
          const actionButton = this.createSecureElement('button', {
            textContent: tipData.actionText,
            styles: {
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s',
              marginTop: '8px'
            },
            onclick: () => {
              this.handleActionClick(tipData);
            },
            onmouseenter: (e) => {
              e.target.style.backgroundColor = '#2563eb';
            },
            onmouseleave: (e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }
          });
          
          notification.appendChild(actionButton);
        }
        
        return notification;
        
      } catch (error) {
        console.error('[PowerAI] Notification element creation failed:', error);
        return null;
      }
    }

    showTip(tipData) {
      try {
        if (!this.settings || !this.settings.notificationsEnabled) {
          console.log('[PowerAI] Notifications disabled');
          return;
        }

        // Create and show notification
        const notificationElement = this.createNotificationElement(tipData);
        if (notificationElement) {
          this.container.appendChild(notificationElement);
          
          // Animate in
          requestAnimationFrame(() => {
            notificationElement.style.transform = 'translateX(0)';
          });
          
          // Store notification reference
          this.notifications.push({
            id: this.nextId++,
            element: notificationElement,
            data: tipData,
            timestamp: Date.now()
          });
          
          // Auto-dismiss after duration
          const duration = tipData.duration || 7000;
          setTimeout(() => {
            this.dismissNotification(notificationElement);
          }, duration);
          
          console.log('[PowerAI] Notification shown:', tipData.title);
        }
      } catch (error) {
        console.error('[PowerAI] Show tip failed:', error);
      }
    }

    showDemoTip() {
      const demoTips = [
        {
          type: 'demo',
          icon: '⚡',
          title: 'PowerAI Demo Mode',
          message: 'This tab would normally show 23W energy usage. Install the extension for real data.',
          actionText: 'Learn More',
          severity: 'info',
          duration: 6000
        },
        {
          type: 'demo',
          icon: '🌱',
          title: 'Energy Tip',
          message: 'Gmail in dark mode can reduce screen energy consumption by up to 15%.',
          actionText: 'Enable Dark Mode',
          severity: 'success',
          duration: 8000
        }
      ];
      
      const randomTip = demoTips[Math.floor(Math.random() * demoTips.length)];
      this.showTip(randomTip);
    }

    handleActionClick(tipData) {
      console.log('[PowerAI] Action clicked:', tipData.actionText);
      
      if (this.apiAvailable) {
        // Send action to extension
        this.sendMessage({
          type: 'NOTIFICATION_ACTION',
          action: tipData.type,
          data: tipData
        });
      } else {
        // Handle demo actions
        if (tipData.actionText === 'Learn More') {
          console.log('[PowerAI] Would open extension popup or info page');
        } else if (tipData.actionText === 'Enable Dark Mode') {
          console.log('[PowerAI] Would toggle dark mode if extension was active');
        }
      }
    }

    dismissNotification(notificationElement) {
      try {
        if (!notificationElement || !notificationElement.parentNode) return;
        
        // Animate out
        notificationElement.style.transform = 'translateX(100%)';
        notificationElement.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
          if (notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
          }
          
          // Remove from notifications array
          this.notifications = this.notifications.filter(n => n.element !== notificationElement);
        }, 400);
        
      } catch (error) {
        console.error('[PowerAI] Dismiss notification failed:', error);
      }
    }

    hideAllTips() {
      this.notifications.forEach(notification => {
        this.dismissNotification(notification.element);
      });
    }

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }

    cleanup() {
      try {
        // Remove message listener safely
        if (this.messageListener && chrome.runtime && chrome.runtime.onMessage) {
          chrome.runtime.onMessage.removeListener(this.messageListener);
          console.log('[PowerAI] Message listener removed');
        }
        
        // Remove notification container
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
        
        this.notifications = [];
        this.isInitialized = false;
        
      } catch (error) {
        console.error('[PowerAI] Cleanup failed:', error);
      }
    }
  }

  // Safe initialization with error boundaries
  let notificationManager = null;

  try {
    // Only initialize if we're in a proper content script context
    if (document && document.documentElement) {
      if (!window.__powerAINotificationManager) {
        notificationManager = new EnergyTipNotificationManager();
        window.__powerAINotificationManager = notificationManager;
      } else {
        notificationManager = window.__powerAINotificationManager;
      }
    }
  } catch (initError) {
    console.error('[PowerAI] Failed to initialize:', initError);
  }

  // Safe cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      try {
        if (notificationManager) {
          notificationManager.cleanup();
        }
      } catch (cleanupError) {
        console.error('[PowerAI] Cleanup error:', cleanupError);
      }
    });
  }

  // Export for potential use by other scripts
  if (typeof window !== 'undefined') {
    window.energyNotificationManager = notificationManager;
  }

  // Export for cleanup
  window.__powerAINotificationSystemLoaded = true;

  console.log('[PowerAI] CSP-compliant notification system loaded');

  // Universal error boundary for Chrome extension
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('Could not establish connection')) {
      console.log('[ErrorBoundary] Chrome extension connection error caught and handled');
      event.preventDefault(); // Prevent the error from showing in console
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Could not establish connection')) {
      console.log('[ErrorBoundary] Chrome extension promise rejection caught and handled');
      event.preventDefault();
      return true;
    }
  });
})();