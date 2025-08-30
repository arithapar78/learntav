// PowerTrackingApp Options Page Script
// Handles settings, history, and insights functionality

class OptionsManager {
  constructor() {
    this.currentTab = 'settings';
    this.settings = {};
    this.chart = null;
    this.powerCalculator = null;
    
    this.init();
  }
  
  async init() {
    console.log('[OptionsManager] Initializing options page...');
    
    try {
      // Check Chrome API availability first
      if (!this.isChromeApiAvailable()) {
        console.error('[OptionsManager] Chrome APIs not available - extension context may be invalid');
        this.showError('Extension context unavailable. Please reload the page.');
        return;
      }

      // Wait for DOM to be fully ready
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
          } else {
            window.addEventListener('load', resolve);
          }
        });
      }
      
      // Initialize PowerCalculator with error handling
      try {
        this.powerCalculator = new PowerCalculator();
        console.log('[OptionsManager] PowerCalculator initialized successfully');
      } catch (pcError) {
        console.warn('[OptionsManager] PowerCalculator initialization failed:', pcError);
        // Continue without PowerCalculator - functions will use fallbacks
        this.powerCalculator = null;
      }
      
      // Load theme first
      await this.loadTheme();
      
      // Load initial data first to have settings available
      await this.loadSettings();
      
      // Set up event listeners with error handling
      this.setupEventListeners();
      
      // Initialize UI
      this.initializeUI();
      
      // Set up modal event listeners
      this.setupModalEventListeners();
      
      // Initialize pricing section
      this.initializePricingSection();
      
      // Handle URL parameters for direct tab navigation
      this.handleURLParams();
      
      console.log('[OptionsManager] Initialization completed successfully');
      
    } catch (error) {
      console.error('[OptionsManager] Initialization failed:', error);
      this.showError('Failed to initialize settings page: ' + error.message);
      
      // Still try to set up basic button functionality
      this.setupBasicEventListeners();
    }
  }
  
  setupEventListeners() {
    try {
      console.log('[OptionsManager] Setting up event listeners...');
      
      // Remove existing listeners first
      this.removeExistingListeners();
      
      // Use a single delegated listener instead of multiple
      this.mainEventListener = (e) => {
        // Tab navigation
        if (e.target.classList.contains('nav-tab')) {
          e.preventDefault();
          this.switchTab(e.target.dataset.tab);
        }
        // Action buttons
        else if (e.target.id === 'saveSettingsBtn') {
          e.preventDefault();
          this.saveSettings();
        }
        else if (e.target.id === 'resetSettingsBtn') {
          e.preventDefault();
          this.resetSettings();
        }
        else if (e.target.id === 'exportDataBtn') {
          e.preventDefault();
          this.exportData();
        }
        else if (e.target.id === 'clearDataBtn') {
          e.preventDefault();
          this.clearData();
        }
        // History controls
        else if (e.target.id === 'refreshHistoryBtn') {
          e.preventDefault();
          this.refreshHistory();
        }
        // About links
        else if (e.target.id === 'privacyPolicyLink') {
          e.preventDefault();
          this.showPrivacyPolicy();
        }
        else if (e.target.id === 'helpLink') {
          e.preventDefault();
          this.showHelp();
        }
        else if (e.target.id === 'feedbackLink') {
          e.preventDefault();
          this.showFeedback();
        }
        // Backend Energy buttons
        else if (e.target.id === 'logGpt4Btn') {
          e.preventDefault();
          this.quickLogAI('gpt-4', 1000);
        }
        else if (e.target.id === 'logClaudeBtn') {
          e.preventDefault();
          this.quickLogAI('claude-3-sonnet', 1000);
        }
        else if (e.target.id === 'logGeminiBtn') {
          e.preventDefault();
          this.quickLogAI('gemini-pro', 1000);
        }
        else if (e.target.id === 'logCustomBtn') {
          e.preventDefault();
          this.showCustomAIDialog();
        }
        // History table details buttons
        else if (e.target.classList.contains('btn-link')) {
          e.preventDefault();
          if (e.target.dataset.url) {
            this.viewTabDetails(e.target.dataset.url);
          } else if (e.target.dataset.testSite) {
            this.testModalWithData(e.target.dataset.testSite);
          }
        }
        // Theme toggle
        else if (e.target.id === 'themeToggle') {
          e.preventDefault();
          this.handleThemeToggle();
        }
      };
      
      // Change event handler for form controls
      this.changeEventListener = (e) => {
        if (e.target.id === 'trackingEnabled' || e.target.id === 'notificationsEnabled' || e.target.id === 'samplingInterval') {
          this.updateSetting(e);
        }
        else if (e.target.id === 'dataRetentionDays' || e.target.id === 'powerThreshold') {
          this.updateSlider(e);
        }
        else if (e.target.id === 'historyTimeRange') {
          this.updateHistoryView();
        }
        else if (e.target.id === 'aiModel') {
          this.handleAIModelChange(e);
        }
      };
      
      // Submit event handler
      this.submitEventListener = (e) => {
        if (e.target.id === 'backendEnergyForm') {
          this.handleEnergyFormSubmit(e);
        }
      };
      
      // Add delegated listeners
      document.addEventListener('click', this.mainEventListener);
      document.addEventListener('change', this.changeEventListener);
      document.addEventListener('input', this.changeEventListener);
      document.addEventListener('submit', this.submitEventListener);
      
      // Store references for cleanup
      this.boundListeners = [
        { element: document, event: 'click', handler: this.mainEventListener },
        { element: document, event: 'change', handler: this.changeEventListener },
        { element: document, event: 'input', handler: this.changeEventListener },
        { element: document, event: 'submit', handler: this.submitEventListener }
      ];
      
      // Image error handlers (these need to be individual)
      const optionsLogo = document.getElementById('optionsLogo');
      if (optionsLogo) {
        optionsLogo.addEventListener('error', () => {
          optionsLogo.style.display = 'none';
        });
      }
      
      console.log('[OptionsManager] Event listeners setup completed');
      
    } catch (error) {
      console.error('[OptionsManager] Error setting up event listeners:', error);
      // Fallback to basic button functionality
      this.setupBasicEventListeners();
    }
  }

  removeExistingListeners() {
    if (this.boundListeners) {
      this.boundListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.boundListeners = [];
    }
  }
  
  // Helper method to safely add event listeners
  addEventListenerSafe(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(eventType, handler);
      console.log(`[OptionsManager] Added ${eventType} listener to ${elementId}`);
    } else {
      console.warn(`[OptionsManager] Element ${elementId} not found, skipping event listener`);
    }
  }
  
  // Fallback method for basic button functionality
  setupBasicEventListeners() {
    console.log('[OptionsManager] Setting up basic event listeners as fallback...');
    
    try {
      // Remove existing listeners first
      this.removeExistingListeners();
      
      // Focus on the most critical buttons with safer approach
      const criticalButtons = [
        { id: 'saveSettingsBtn', handler: this.saveSettings.bind(this) },
        { id: 'resetSettingsBtn', handler: this.resetSettings.bind(this) },
        { id: 'exportDataBtn', handler: this.exportData.bind(this) },
        { id: 'clearDataBtn', handler: this.clearData.bind(this) }
      ];
      
      this.boundListeners = [];
      
      criticalButtons.forEach(({ id, handler }) => {
        const element = document.getElementById(id);
        if (element) {
          const safeHandler = (e) => {
            e.preventDefault();
            console.log(`[OptionsManager] Button ${id} clicked`);
            handler();
          };
          
          element.addEventListener('click', safeHandler);
          this.boundListeners.push({ element, event: 'click', handler: safeHandler });
          console.log(`[OptionsManager] Basic listener added to ${id}`);
        } else {
          console.error(`[OptionsManager] Critical button ${id} not found`);
        }
      });
    } catch (error) {
      console.error('[OptionsManager] Failed to setup basic event listeners:', error);
    }
  }

  /**
   * Checks if Chrome Extension APIs are available and functional
   * @returns {boolean} - True if APIs are available
   */
  isChromeApiAvailable() {
    try {
      // Check if chrome object exists
      if (typeof chrome === 'undefined') {
        console.warn('[OptionsManager] Chrome object not available');
        return false;
      }

      // Check if runtime API exists
      if (!chrome.runtime) {
        console.warn('[OptionsManager] Chrome runtime API not available');
        return false;
      }

      // Check if extension ID is valid
      if (!chrome.runtime.id) {
        console.warn('[OptionsManager] Chrome runtime ID not available - extension context invalid');
        return false;
      }

      // Check if storage API exists
      if (!chrome.storage || !chrome.storage.local) {
        console.warn('[OptionsManager] Chrome storage API not available');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[OptionsManager] Error checking Chrome API availability:', error);
      return false;
    }
  }

  // NEW: Robust message sending with retry logic
  async sendMessageWithRetry(message, maxRetries = 3, timeout = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[OptionsManager] Sending message (attempt ${attempt}/${maxRetries}):`, message.type);
        
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Message timeout')), timeout);
        });
        
        // Race between message and timeout
        const response = await Promise.race([
          chrome.runtime.sendMessage(message),
          timeoutPromise
        ]);
        
        if (response) {
          console.log(`[OptionsManager] Message successful on attempt ${attempt}`);
          return response;
        }
        
        throw new Error('Empty response');
      } catch (error) {
        console.warn(`[OptionsManager] Message attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  async loadSettings() {
    try {
      // Double-check Chrome API availability before making requests
      if (!this.isChromeApiAvailable()) {
        console.warn('[OptionsManager] Chrome APIs unavailable, using default settings');
        this.settings = this.getDefaultSettings();
        return;
      }

      const response = await this.sendMessageWithRetry({ type: 'GET_SETTINGS' }, 3);
      if (response && response.success) {
        // Convert settings to proper types after loading from storage
        this.settings = this.convertSettingsTypes(response.settings);
        console.log('[OptionsManager] Settings loaded and type-converted:', this.settings);
      } else {
        console.error('[OptionsManager] Failed to load settings:', response?.error || 'No response');
        this.settings = this.getDefaultSettings();
      }
    } catch (error) {
      console.error('[OptionsManager] Settings request failed:', error);
      
      // Try direct storage access as fallback
      if (this.isStorageApiAvailable()) {
        try {
          const fallbackSettings = await this.loadSettingsFromStorageDirect();
          if (fallbackSettings) {
            this.settings = this.convertSettingsTypes(fallbackSettings);
            console.log('[OptionsManager] Settings loaded via fallback storage access');
            return;
          }
        } catch (storageError) {
          console.error('[OptionsManager] Fallback storage access failed:', storageError);
        }
      }
      
      this.settings = this.getDefaultSettings();
      console.log('[OptionsManager] Using default settings due to load failure');
    }
  }

  /**
   * Checks if Chrome Storage API is available separately
   * @returns {boolean} - True if storage APIs are available
   */
  isStorageApiAvailable() {
    try {
      return typeof chrome !== 'undefined' &&
             chrome.storage &&
             chrome.storage.local &&
             typeof chrome.storage.local.get === 'function';
    } catch (error) {
      console.error('[OptionsManager] Error checking storage API:', error);
      return false;
    }
  }

  /**
   * Fallback method to load settings directly from chrome.storage
   * @returns {Object|null} - Settings object or null if failed
   */
  async loadSettingsFromStorageDirect() {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['settings'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result.settings);
          }
        });
      });
    } catch (error) {
      console.error('[OptionsManager] Direct storage access failed:', error);
      return null;
    }
  }
  
  /**
   * Converts settings values to their proper types
   * @param {Object} settings - Raw settings object
   * @returns {Object} - Settings object with proper types
   */
  convertSettingsTypes(settings) {
    if (!settings || typeof settings !== 'object') {
      return this.getDefaultSettings();
    }
    
    const converted = { ...settings };
    
    // Convert boolean settings - handle strings from storage
    if ('trackingEnabled' in converted) {
      converted.trackingEnabled = this.convertToBoolean(converted.trackingEnabled);
    }
    if ('notificationsEnabled' in converted) {
      converted.notificationsEnabled = this.convertToBoolean(converted.notificationsEnabled);
    }
    
    // Convert numeric settings
    if ('powerThreshold' in converted) {
      converted.powerThreshold = this.convertToNumber(converted.powerThreshold, 40);
    }
    if ('energyThreshold' in converted && !converted.powerThreshold) {
      // Migrate legacy energyThreshold to powerThreshold
      converted.powerThreshold = this.convertToNumber(converted.energyThreshold, 40);
      delete converted.energyThreshold;
    }
    if ('dataRetentionDays' in converted) {
      converted.dataRetentionDays = this.convertToNumber(converted.dataRetentionDays, 30);
    }
    if ('samplingInterval' in converted) {
      converted.samplingInterval = this.convertToNumber(converted.samplingInterval, 5000);
    }
    
    return converted;
  }
  
  /**
   * Safely converts a value to boolean
   * @param {*} value - Value to convert
   * @returns {boolean} - Boolean value
   */
  convertToBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }
  
  /**
   * Safely converts a value to number with fallback
   * @param {*} value - Value to convert
   * @param {number} fallback - Fallback value if conversion fails
   * @returns {number} - Numeric value
   */
  convertToNumber(value, fallback) {
    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
  }
  
  getDefaultSettings() {
    return {
      trackingEnabled: true,
      notificationsEnabled: true,
      powerThreshold: 40, // Watts threshold for notifications
      dataRetentionDays: 30,
      samplingInterval: 5000
    };
  }
  
  // Defensive programming helper methods for DOM safety
  validateRequiredElements() {
    const criticalElements = [
      'trackingEnabled',
      'notificationsEnabled',
      'saveSettingsBtn',
      'resetSettingsBtn'
    ];

    const optionalElements = [
      'samplingInterval',
      'dataRetentionDays',
      'powerThreshold',
      'exportDataBtn',
      'clearDataBtn'
    ];
    
    const missingCritical = [];
    const missingOptional = [];
    
    criticalElements.forEach(id => {
      if (!document.getElementById(id)) {
        missingCritical.push(id);
      }
    });
    
    optionalElements.forEach(id => {
      if (!document.getElementById(id)) {
        missingOptional.push(id);
      }
    });
    
    if (missingCritical.length > 0) {
      console.error('[OptionsManager] Missing critical DOM elements:', missingCritical);
      return false;
    }
    
    if (missingOptional.length > 0) {
      console.warn('[OptionsManager] Missing optional DOM elements:', missingOptional);
      // Still return true - we can work with missing optional elements
    }
    
    console.log('[OptionsManager] DOM validation passed');
    return true;
  }

  /**
   * Enhanced safe DOM element getter with comprehensive error handling
   * @param {string} elementId - The element ID to get
   * @returns {HTMLElement|null} - The element or null if not found
   */
  safeGetElement(elementId) {
    try {
      if (!elementId || typeof elementId !== 'string') {
        console.warn('[OptionsManager] Invalid element ID provided:', elementId);
        return null;
      }

      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`[OptionsManager] Element '${elementId}' not found in DOM`);
        return null;
      }

      return element;
    } catch (error) {
      console.error(`[OptionsManager] Error getting element '${elementId}':`, error);
      return null;
    }
  }
  
  safeSetCheckbox(elementId, checked) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && element.type === 'checkbox') {
        element.checked = Boolean(checked);
        console.log(`[OptionsManager] Checkbox '${elementId}' set to ${checked}`);
        return true;
      } else if (element) {
        console.warn(`[OptionsManager] Element '${elementId}' is not a checkbox`);
        return false;
      }
      return false;
    } catch (error) {
      console.error(`[OptionsManager] Error setting checkbox '${elementId}':`, error);
      return false;
    }
  }
  
  safeSetValue(elementId, value) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && 'value' in element) {
        // Handle different input types appropriately
        if (element.type === 'number' || element.type === 'range') {
          const numValue = parseFloat(value);
          element.value = isNaN(numValue) ? '' : numValue.toString();
        } else {
          element.value = String(value);
        }
        console.log(`[OptionsManager] Value for '${elementId}' set to ${value}`);
        return true;
      } else if (element) {
        console.warn(`[OptionsManager] Element '${elementId}' does not support value property`);
        return false;
      }
      return false;
    } catch (error) {
      console.error(`[OptionsManager] Error setting value for '${elementId}':`, error);
      return false;
    }
  }
  
  safeSetTextContent(elementId, text) {
    try {
      const element = this.safeGetElement(elementId);
      if (element) {
        element.textContent = String(text || '');
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[OptionsManager] Error setting text content for '${elementId}':`, error);
      return false;
    }
  }

  /**
   * Safely adds a CSS class to an element
   * @param {string} elementId - The element ID
   * @param {string} className - The CSS class to add
   * @returns {boolean} - True if successful
   */
  safeAddClass(elementId, className) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && className) {
        element.classList.add(className);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[OptionsManager] Error adding class '${className}' to '${elementId}':`, error);
      return false;
    }
  }

  /**
   * Safely removes a CSS class from an element
   * @param {string} elementId - The element ID
   * @param {string} className - The CSS class to remove
   * @returns {boolean} - True if successful
   */
  safeRemoveClass(elementId, className) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && className) {
        element.classList.remove(className);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[OptionsManager] Error removing class '${className}' from '${elementId}':`, error);
      return false;
    }
  }

  /**
   * Safely gets a value from an input element with type checking
   * @param {string} elementId - The element ID
   * @returns {*} - The element value or null if not found/accessible
   */
  safeGetValue(elementId) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && 'value' in element) {
        return element.value;
      }
      return null;
    } catch (error) {
      console.error(`[OptionsManager] Error getting value from '${elementId}':`, error);
      return null;
    }
  }

  /**
   * Safely gets a checkbox state with type checking
   * @param {string} elementId - The element ID
   * @returns {boolean|null} - The checkbox state or null if not found/accessible
   */
  safeGetCheckbox(elementId) {
    try {
      const element = this.safeGetElement(elementId);
      if (element && element.type === 'checkbox') {
        return element.checked;
      }
      return null;
    } catch (error) {
      console.error(`[OptionsManager] Error getting checkbox state from '${elementId}':`, error);
      return null;
    }
  }
  
  initializeUI() {
    try {
      // Validate required elements first
      if (!this.validateRequiredElements()) {
        console.warn('[OptionsManager] Some elements missing, initializing UI with available elements only');
      }
      
      // Ensure settings have proper types before UI initialization
      this.settings = this.convertSettingsTypes(this.settings);
      console.log('[OptionsManager] Initializing UI with converted settings:', this.settings);
      
      // Populate settings form with safe methods using explicit Boolean conversion
      this.safeSetCheckbox('trackingEnabled', Boolean(this.settings.trackingEnabled));
      this.safeSetCheckbox('notificationsEnabled', Boolean(this.settings.notificationsEnabled));
      this.safeSetValue('samplingInterval', this.settings.samplingInterval);
      this.safeSetValue('dataRetentionDays', this.settings.dataRetentionDays);
      this.safeSetValue('powerThreshold', this.settings.powerThreshold || this.settings.energyThreshold || 40);
      
      // Update slider displays with safe methods
      this.updateSliderDisplaySafe('dataRetentionDays', this.settings.dataRetentionDays, ' days');
      this.updateSliderDisplaySafe('powerThreshold', this.settings.powerThreshold || this.settings.energyThreshold || 40, 'W');
      
    } catch (error) {
      console.error('[OptionsManager] Error during UI initialization:', error);
      this.showError('Failed to initialize settings interface');
    }
  }
  
  handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const welcome = urlParams.get('welcome');
    
    if (tab && ['settings', 'backend-energy', 'history', 'insights', 'about'].includes(tab)) {
      this.switchTab(tab);
    }
    
    if (welcome === 'true') {
      this.showWelcomeMessage();
    }
  }
  
  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    this.currentTab = tabName;
    
    // Load tab-specific data
    if (tabName === 'history') {
      this.loadHistoryData();
    } else if (tabName === 'insights') {
      this.loadInsightsData();
    } else if (tabName === 'backend-energy') {
      this.loadBackendEnergyData();
    } else if (tabName === 'pricing') {
      this.loadPricingData();
    }
  }
  
  updateSetting(event) {
    const setting = event.target.id;
    let value;
    
    // Handle different input types properly
    if (event.target.type === 'checkbox') {
      // For checkboxes, use the checked property (boolean)
      value = event.target.checked;
    } else if (event.target.type === 'number' || event.target.type === 'range') {
      // For numeric inputs, convert to number
      value = parseFloat(event.target.value);
      if (isNaN(value)) {
        console.warn(`[OptionsManager] Invalid numeric value for ${setting}, using fallback`);
        value = this.getDefaultSettings()[setting] || 0;
      }
    } else {
      // For other inputs, use the value as-is
      value = event.target.value;
    }
    
    console.log(`[OptionsManager] Setting ${setting} updated to:`, value, `(type: ${typeof value})`);
    this.settings[setting] = value;
    
    // Real-time validation for numeric inputs
    if (event.target.type !== 'checkbox') {
      this.validateSettingRealTime(setting, value);
    }
    
    this.showUnsavedChanges();
  }
  
  updateSlider(event) {
    const setting = event.target.id;
    const value = parseInt(event.target.value);
    
    this.settings[setting] = value;
    
    // Update display
    let suffix = ' days';
    if (setting === 'powerThreshold') suffix = 'W';
    this.updateSliderDisplay(setting, value, suffix);
    
    // Real-time validation for slider values
    this.validateSettingRealTime(setting, value);
    
    this.showUnsavedChanges();
  }
  
  updateSliderDisplay(settingId, value, suffix) {
    let displayId = 'retentionValue';
    if (settingId === 'powerThreshold' || settingId === 'energyThreshold') displayId = 'thresholdValue';
    const element = document.getElementById(displayId);
    if (element) {
      element.textContent = value + suffix;
    } else {
      console.warn(`[OptionsManager] Display element ${displayId} not found`);
    }
  }
  
  updateSliderDisplaySafe(settingId, value, suffix) {
    let displayId = 'retentionValue';
    if (settingId === 'powerThreshold' || settingId === 'energyThreshold') displayId = 'thresholdValue';
    this.safeSetTextContent(displayId, value + suffix);
  }
  
  /**
   * Validates current settings to ensure they are within acceptable ranges
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validateSettings() {
    const errors = [];
    
    // Validate power threshold (5W - 100W)
    const powerThreshold = this.settings.powerThreshold || this.settings.energyThreshold || 40;
    if (typeof powerThreshold !== 'number' || isNaN(powerThreshold)) {
      errors.push('Power threshold must be a valid number');
    } else if (powerThreshold < 5) {
      errors.push('Power threshold must be at least 5W');
    } else if (powerThreshold > 100) {
      errors.push('Power threshold must not exceed 100W');
    }
    
    // Validate sampling interval (1000ms - 60000ms = 1-60 seconds)
    const samplingInterval = this.settings.samplingInterval || 5000;
    if (typeof samplingInterval !== 'number' || isNaN(samplingInterval)) {
      errors.push('Sampling interval must be a valid number');
    } else if (samplingInterval < 1000) {
      errors.push('Sampling interval must be at least 1 second (1000ms)');
    } else if (samplingInterval > 60000) {
      errors.push('Sampling interval must not exceed 60 seconds (60000ms)');
    }
    
    // Validate data retention days (1 - 365 days)
    const dataRetentionDays = this.settings.dataRetentionDays || 30;
    if (typeof dataRetentionDays !== 'number' || isNaN(dataRetentionDays)) {
      errors.push('Data retention period must be a valid number');
    } else if (dataRetentionDays < 1) {
      errors.push('Data retention period must be at least 1 day');
    } else if (dataRetentionDays > 365) {
      errors.push('Data retention period must not exceed 365 days');
    }
    
    // Validate boolean settings
    if (typeof this.settings.trackingEnabled !== 'boolean') {
      errors.push('Tracking enabled setting must be true or false');
    }
    
    if (typeof this.settings.notificationsEnabled !== 'boolean') {
      errors.push('Notifications enabled setting must be true or false');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Sanitizes and corrects settings values to ensure they are within valid ranges
   * @returns {Object} - The corrected settings object
   */
  sanitizeSettings() {
    const sanitized = { ...this.settings };
    
    // First convert to proper types
    const converted = this.convertSettingsTypes(sanitized);
    
    // Then sanitize ranges
    converted.powerThreshold = Math.max(5, Math.min(100, Math.round(converted.powerThreshold)));
    converted.samplingInterval = Math.max(1000, Math.min(60000, converted.samplingInterval));
    converted.dataRetentionDays = Math.max(1, Math.min(365, converted.dataRetentionDays));
    
    // Ensure boolean values are proper booleans (already handled in convertSettingsTypes)
    converted.trackingEnabled = this.convertToBoolean(converted.trackingEnabled);
    converted.notificationsEnabled = this.convertToBoolean(converted.notificationsEnabled);
    
    console.log('[OptionsManager] Settings sanitized:', converted);
    return converted;
  }
  
  /**
   * Provides real-time validation feedback for individual settings as the user types
   * @param {string} settingName - The setting being validated
   * @param {*} value - The current value
   */
  validateSettingRealTime(settingName, value) {
    const element = document.getElementById(settingName);
    if (!element) return;
    
    // Remove any existing validation feedback
    this.clearValidationFeedback(element);
    
    let isValid = true;
    let errorMessage = '';
    let suggestionMessage = '';
    
    // Validate based on setting type
    switch (settingName) {
      case 'powerThreshold':
      case 'energyThreshold':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          isValid = false;
          errorMessage = 'Must be a valid number';
        } else if (numValue < 5) {
          isValid = false;
          errorMessage = 'Minimum value is 5W';
          suggestionMessage = 'Try 5-15W for efficient browsing';
        } else if (numValue > 100) {
          isValid = false;
          errorMessage = 'Maximum value is 100W';
          suggestionMessage = 'Try 25-50W for typical usage';
        } else if (numValue > 60) {
          suggestionMessage = 'High threshold - you may miss efficiency opportunities';
        } else if (numValue < 10) {
          suggestionMessage = 'Low threshold - may trigger frequent notifications';
        }
        break;
        
      case 'samplingInterval':
        const intervalMs = parseInt(value);
        if (isNaN(intervalMs)) {
          isValid = false;
          errorMessage = 'Must be a valid number';
        } else if (intervalMs < 1000) {
          isValid = false;
          errorMessage = 'Minimum interval is 1 second (1000ms)';
          suggestionMessage = 'Try 3000-10000ms for balanced monitoring';
        } else if (intervalMs > 60000) {
          isValid = false;
          errorMessage = 'Maximum interval is 60 seconds (60000ms)';
          suggestionMessage = 'Try 5000-15000ms for regular monitoring';
        } else if (intervalMs < 3000) {
          suggestionMessage = 'Short interval - may impact browser performance';
        } else if (intervalMs > 30000) {
          suggestionMessage = 'Long interval - may miss short-term power spikes';
        }
        break;
        
      case 'dataRetentionDays':
        const days = parseInt(value);
        if (isNaN(days)) {
          isValid = false;
          errorMessage = 'Must be a valid number';
        } else if (days < 1) {
          isValid = false;
          errorMessage = 'Minimum retention is 1 day';
          suggestionMessage = 'Try 7-30 days for useful insights';
        } else if (days > 365) {
          isValid = false;
          errorMessage = 'Maximum retention is 365 days';
          suggestionMessage = 'Try 30-90 days to balance history and storage';
        } else if (days < 7) {
          suggestionMessage = 'Short retention - limited trend analysis';
        } else if (days > 180) {
          suggestionMessage = 'Long retention - may consume significant storage';
        }
        break;
    }
    
    // Apply validation feedback
    this.applyValidationFeedback(element, isValid, errorMessage, suggestionMessage);
  }
  
  /**
   * Clears any existing validation feedback from an element
   * @param {HTMLElement} element - The form element
   */
  clearValidationFeedback(element) {
    // Remove validation classes
    element.classList.remove('validation-error', 'validation-warning', 'validation-success');
    
    // Remove any existing feedback messages
    const existingFeedback = element.parentNode.querySelector('.validation-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }
  }
  
  /**
   * Applies validation feedback styling and messages to an element
   * @param {HTMLElement} element - The form element
   * @param {boolean} isValid - Whether the value is valid
   * @param {string} errorMessage - Error message if invalid
   * @param {string} suggestionMessage - Suggestion message for improvement
   */
  applyValidationFeedback(element, isValid, errorMessage, suggestionMessage) {
    if (!isValid) {
      // Add error styling
      element.classList.add('validation-error');
      
      // Add error message
      const feedback = document.createElement('div');
      feedback.className = 'validation-feedback error';
      feedback.innerHTML = `
        <span class="validation-icon">⚠️</span>
        <span class="validation-message">${errorMessage}</span>
      `;
      element.parentNode.insertBefore(feedback, element.nextSibling);
      
    } else if (suggestionMessage) {
      // Add warning styling for suggestions
      element.classList.add('validation-warning');
      
      // Add suggestion message
      const feedback = document.createElement('div');
      feedback.className = 'validation-feedback warning';
      feedback.innerHTML = `
        <span class="validation-icon">💡</span>
        <span class="validation-message">${suggestionMessage}</span>
      `;
      element.parentNode.insertBefore(feedback, element.nextSibling);
      
    } else {
      // Add success styling for valid values
      element.classList.add('validation-success');
    }
  }
  
  async saveSettings() {
    console.log('[OptionsManager] Save settings button clicked');
    
    try {
      // Check Chrome API availability before proceeding
      if (!this.isChromeApiAvailable()) {
        this.showError('Chrome APIs unavailable. Please reload the page and try again.');
        return;
      }

      // Add visual feedback immediately
      const saveBtn = this.safeGetElement('saveSettingsBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Validating...';
      }
      
      console.log('[OptionsManager] Current settings before conversion:', this.settings);
      
      // Convert settings to proper types before validation
      this.settings = this.convertSettingsTypes(this.settings);
      console.log('[OptionsManager] Settings after type conversion:', this.settings);
      
      // Validate settings after type conversion
      const validation = this.validateSettings();
      if (!validation.isValid) {
        console.warn('[OptionsManager] Settings validation failed:', validation.errors);
        
        // Show detailed validation errors
        const errorMessage = 'Settings validation failed:\n• ' + validation.errors.join('\n• ');
        this.showError(errorMessage);
        
        // Try to sanitize and show corrected values
        const sanitized = this.sanitizeSettings();
        const hasChanges = JSON.stringify(sanitized) !== JSON.stringify(this.settings);
        
        if (hasChanges) {
          const confirmMessage = 'Would you like to automatically correct the invalid values?\n\n' +
            `Power Threshold: ${sanitized.powerThreshold}W (was ${this.settings.powerThreshold || 'invalid'})\n` +
            `Sampling Interval: ${sanitized.samplingInterval}ms (was ${this.settings.samplingInterval || 'invalid'})\n` +
            `Data Retention: ${sanitized.dataRetentionDays} days (was ${this.settings.dataRetentionDays || 'invalid'})`;
          
          if (confirm(confirmMessage)) {
            this.settings = sanitized;
            this.initializeUI(); // Update form with corrected values
            this.showUnsavedChanges();
          }
        }
        return;
      }
      
      // Update button text for saving
      if (saveBtn) {
        saveBtn.textContent = 'Saving...';
      }
      
      // Final sanitization (in case of minor floating point issues)
      this.settings = this.sanitizeSettings();
      
      console.log('[OptionsManager] Final validated settings to save:', this.settings);
      
      // Attempt to save via service worker first
      let saveSuccessful = false;
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'UPDATE_SETTINGS',
          settings: this.settings
        });
        
        console.log('[OptionsManager] Save settings response:', response);
        
        if (response && response.success) {
          saveSuccessful = true;
          this.showSuccess('Settings saved successfully!');
          this.hideUnsavedChanges();
        } else {
          throw new Error(response?.error || 'Service worker save failed');
        }
      } catch (serviceWorkerError) {
        console.warn('[OptionsManager] Service worker save failed, trying direct storage:', serviceWorkerError);
        
        // Fallback to direct storage save
        if (this.isStorageApiAvailable()) {
          try {
            await this.saveSettingsToStorageDirect(this.settings);
            saveSuccessful = true;
            this.showSuccess('Settings saved successfully (via fallback)!');
            this.hideUnsavedChanges();
          } catch (storageError) {
            console.error('[OptionsManager] Direct storage save also failed:', storageError);
          }
        }
      }
      
      if (!saveSuccessful) {
        this.showError('Failed to save settings. Please try again or reload the page.');
      }
      
    } catch (error) {
      console.error('[OptionsManager] Save settings failed:', error);
      this.showError('Failed to save settings: ' + error.message);
    } finally {
      // Restore button state
      const saveBtn = this.safeGetElement('saveSettingsBtn');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Settings';
      }
    }
  }

  /**
   * Fallback method to save settings directly to chrome.storage
   * @param {Object} settings - Settings object to save
   * @returns {Promise} - Promise that resolves when save is complete
   */
  async saveSettingsToStorageDirect(settings) {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ settings }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('[OptionsManager] Direct storage save failed:', error);
      throw error;
    }
  }
  
  async resetSettings() {
    console.log('[OptionsManager] Reset settings button clicked');
    
    if (confirm('Reset all settings to default values? This cannot be undone.')) {
      try {
        // Add visual feedback
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
          resetBtn.disabled = true;
          resetBtn.textContent = 'Resetting...';
        }
        
        this.settings = this.getDefaultSettings();
        console.log('[OptionsManager] Settings reset to defaults:', this.settings);
        
        this.initializeUI();
        await this.saveSettings();
        
        this.showSuccess('Settings reset to defaults successfully!');
        
      } catch (error) {
        console.error('[OptionsManager] Reset settings failed:', error);
        this.showError('Failed to reset settings: ' + error.message);
      } finally {
        // Restore button state
        const resetBtn = document.getElementById('resetSettingsBtn');
        if (resetBtn) {
          resetBtn.disabled = false;
          resetBtn.textContent = 'Reset to Defaults';
        }
      }
    }
  }
  
  async exportData() {
    console.log('[OptionsManager] Export data button clicked');
    
    try {
      // Add visual feedback
      const exportBtn = document.getElementById('exportDataBtn');
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = 'Exporting...';
      }
      
      // Get all power history data
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '30d'
      });
      
      console.log('[OptionsManager] Export data response:', response);
      
      if (response && response.success) {
        const exportData = {
          settings: this.settings,
          history: response.history || [],
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `power-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); // Ensure element is in DOM
        a.click();
        document.body.removeChild(a); // Clean up
        
        URL.revokeObjectURL(url);
        this.showSuccess('Data exported successfully!');
        
      } else {
        this.showError('Failed to export data: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('[OptionsManager] Export data failed:', error);
      this.showError('Failed to export data: ' + error.message);
    } finally {
      // Restore button state
      const exportBtn = document.getElementById('exportDataBtn');
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = 'Export My Data';
      }
    }
  }
  
  async clearData() {
    console.log('[OptionsManager] Clear data button clicked');
    
    const confirmed = confirm(
      'Clear all power tracking data? This will delete:\n\n' +
      '• All historical power consumption data\n' +
      '• Settings will be reset to defaults\n\n' +
      'This action cannot be undone!'
    );
    
    if (confirmed) {
      try {
        // Add visual feedback
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
          clearBtn.disabled = true;
          clearBtn.textContent = 'Clearing...';
        }
        
        console.log('[OptionsManager] Clearing all data...');
        
        // Check Chrome API availability first
        if (!this.isStorageApiAvailable()) {
          throw new Error('Chrome storage API not available');
        }

        await chrome.storage.local.clear();
        
        this.settings = this.getDefaultSettings();
        console.log('[OptionsManager] Settings reset to defaults after clear');
        
        this.initializeUI();
        this.showSuccess('All data cleared successfully!');
        
      } catch (error) {
        console.error('[OptionsManager] Clear data failed:', error);
        this.showError('Failed to clear data: ' + error.message);
      } finally {
        // Restore button state
        const clearBtn = document.getElementById('clearDataBtn');
        if (clearBtn) {
          clearBtn.disabled = false;
          clearBtn.textContent = 'Clear All Data';
        }
      }
    }
  }
  
  async loadHistoryData() {
    try {
      const timeRange = document.getElementById('historyTimeRange').value;
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: timeRange
      });
      
      if (response.success) {
        this.displayHistoryData(response.history);
        this.updateHistoryStats(response.history);
        this.renderPowerChart(response.history);
      } else {
        console.error('[OptionsManager] Failed to load history:', response.error);
        this.showError('Failed to load history data');
      }
    } catch (error) {
      console.error('[OptionsManager] History request failed:', error);
      this.showError('Failed to load history data');
    }
  }
  
  displayHistoryData(history) {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 32px;">No data available for the selected time range</td></tr>';
      return;
    }
    
    history.slice(0, 100).forEach(entry => {
      // Calculate power consumption using PowerCalculator or legacy conversion
      let powerWatts, energyKWh;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
        energyKWh = entry.energyKWh || 0;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
        energyKWh = (powerWatts * (entry.duration || 0)) / (1000 * 60 * 60 * 1000); // Convert to kWh
      } else {
        powerWatts = 0;
        energyKWh = 0;
      }
      
      const efficiencyRating = this.getEfficiencyRatingFromWatts(powerWatts);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.formatDate(entry.timestamp)}</td>
        <td>
          <div style="font-weight: 500;">${this.truncateText(entry.title || 'Unknown', 30)}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${this.formatUrl(entry.url)}</div>
        </td>
        <td>
          <span class="power-badge power-${efficiencyRating.class}">${powerWatts.toFixed(1)}W</span>
        </td>
        <td>${(energyKWh * 1000).toFixed(2)} Wh</td>
        <td>
          <span class="efficiency-badge efficiency-${efficiencyRating.class}">${efficiencyRating.label}</span>
        </td>
        <td>
          <button class="btn-link" data-url="${entry.url}">Details</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  updateHistoryStats(history) {
    if (history.length === 0) {
      this.safeSetTextContent('totalPowerConsumed', '0 Wh');
      this.safeSetTextContent('averagePowerUsage', '0W');
      this.safeSetTextContent('peakPowerTime', '--');
      this.safeSetTextContent('mostEfficientSite', '--');
      return;
    }
    
    let totalEnergyWh = 0;
    let totalPowerWatts = 0;
    
    // Calculate power metrics from history
    history.forEach(entry => {
      let powerWatts;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
      } else {
        powerWatts = 0;
      }
      
      totalPowerWatts += powerWatts;
      totalEnergyWh += (powerWatts * (entry.duration || 0)) / (1000 * 60 * 60); // Convert to Wh
    });
    
    this.safeSetTextContent('totalPowerConsumed', totalEnergyWh.toFixed(1) + ' Wh');
    
    const avgPower = Math.round(totalPowerWatts / history.length);
    this.safeSetTextContent('averagePowerUsage', avgPower + 'W');
    
    // Find peak usage time based on power consumption
    const hourlyUsage = {};
    history.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      let powerWatts = 0;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
      }
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + powerWatts;
    });
    
    const peakHour = Object.keys(hourlyUsage).reduce((a, b) =>
      hourlyUsage[a] > hourlyUsage[b] ? a : b
    );
    this.safeSetTextContent('peakPowerTime', `${peakHour}:00`);
    
    // Find most efficient site (lowest average power consumption)
    const siteEfficiency = {};
    history.forEach(entry => {
      const domain = this.getDomain(entry.url);
      if (!siteEfficiency[domain]) {
        siteEfficiency[domain] = { total: 0, count: 0 };
      }
      
      let powerWatts = 0;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
      }
      
      siteEfficiency[domain].total += powerWatts;
      siteEfficiency[domain].count++;
    });
    
    const mostEfficient = Object.keys(siteEfficiency).reduce((best, current) => {
      const currentAvg = siteEfficiency[current].total / siteEfficiency[current].count;
      const bestAvg = siteEfficiency[best].total / siteEfficiency[best].count;
      return currentAvg < bestAvg ? current : best;
    });
    
    this.safeSetTextContent('mostEfficientSite', mostEfficient);
  }
  
  renderPowerChart(history) {
    const canvas = document.getElementById('powerChart');
    if (!canvas) {
      console.warn('[OptionsManager] Power chart canvas element not found');
      return;
    }
    
    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
      this.renderChartJS(canvas, history);
    } else {
      // Fallback to native canvas implementation
      this.renderFallbackChart(canvas, history);
    }
  }
  
  renderChartJS(canvas, history) {
    try {
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      // Prepare data for Chart.js
      const chartData = this.prepareChartData(history);
      
      // Create Chart.js chart
      this.chart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Power Consumption (W)',
            data: chartData.powerData,
            borderColor: '#4285f4',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#4285f4',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Power Consumption Over Time',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  return `Power: ${context.parsed.y.toFixed(1)}W`;
                },
                afterLabel: function(context) {
                  const powerWatts = context.parsed.y;
                  const efficiency = powerWatts < 15 ? 'Excellent' :
                                   powerWatts < 25 ? 'Good' :
                                   powerWatts < 40 ? 'Average' : 'Poor';
                  return `Efficiency: ${efficiency}`;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time'
              },
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Power (Watts)'
              },
              beginAtZero: true,
              max: Math.max(65, Math.max(...chartData.powerData) * 1.1),
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value) {
                  return value + 'W';
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutCubic'
          }
        }
      });
      
      console.log('[OptionsManager] Chart.js chart rendered successfully');
      
    } catch (error) {
      console.error('[OptionsManager] Error creating Chart.js chart:', error);
      // Fallback to native canvas if Chart.js fails
      this.renderFallbackChart(canvas, history);
    }
  }
  
  renderFallbackChart(canvas, history) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('[OptionsManager] Failed to get canvas context');
        return;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (history.length === 0) {
        // Show "No data" message
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No power consumption data available', canvas.width / 2, canvas.height / 2);
        return;
      }
      
      // Prepare data
      const chartData = this.prepareChartData(history);
      const powerData = chartData.powerData;
      const labels = chartData.labels;
      
      if (powerData.length === 0) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Unable to process power data', canvas.width / 2, canvas.height / 2);
        return;
      }
      
      // Chart dimensions
      const padding = 60;
      const chartWidth = canvas.width - (padding * 2);
      const chartHeight = canvas.height - (padding * 2);
      const chartX = padding;
      const chartY = padding;
      
      // Find min and max values
      const maxPower = Math.max(65, Math.max(...powerData) * 1.1);
      const minPower = 0;
      
      // Draw background
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines (power levels)
      const powerSteps = 5;
      for (let i = 0; i <= powerSteps; i++) {
        const y = chartY + (i * chartHeight / powerSteps);
        ctx.beginPath();
        ctx.moveTo(chartX, y);
        ctx.lineTo(chartX + chartWidth, y);
        ctx.stroke();
        
        // Power labels
        const powerValue = maxPower - (i * maxPower / powerSteps);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(powerValue) + 'W', chartX - 5, y + 4);
      }
      
      // Vertical grid lines (time)
      const timeSteps = Math.min(6, powerData.length - 1);
      if (timeSteps > 0) {
        for (let i = 0; i <= timeSteps; i++) {
          const x = chartX + (i * chartWidth / timeSteps);
          ctx.beginPath();
          ctx.moveTo(x, chartY);
          ctx.lineTo(x, chartY + chartHeight);
          ctx.stroke();
          
          // Time labels (simplified)
          if (i < labels.length) {
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.save();
            ctx.translate(x, chartY + chartHeight + 20);
            ctx.rotate(-Math.PI / 4);
            const labelText = labels[Math.floor(i * labels.length / timeSteps)] || '';
            ctx.fillText(labelText.substring(labelText.length - 8), 0, 0); // Show last 8 chars
            ctx.restore();
          }
        }
      }
      
      // Draw power line
      if (powerData.length > 1) {
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < powerData.length; i++) {
          const x = chartX + (i * chartWidth / (powerData.length - 1));
          const y = chartY + chartHeight - ((powerData[i] - minPower) * chartHeight / (maxPower - minPower));
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        // Draw fill area
        ctx.fillStyle = 'rgba(66, 133, 244, 0.2)';
        ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
        ctx.lineTo(chartX, chartY + chartHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw data points
        ctx.fillStyle = '#4285f4';
        for (let i = 0; i < powerData.length; i++) {
          const x = chartX + (i * chartWidth / (powerData.length - 1));
          const y = chartY + chartHeight - ((powerData[i] - minPower) * chartHeight / (maxPower - minPower));
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      // Chart title
      ctx.fillStyle = '#333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Power Consumption Over Time', canvas.width / 2, 25);
      
      // Chart subtitle
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(`${powerData.length} data points • Average: ${(powerData.reduce((a, b) => a + b, 0) / powerData.length).toFixed(1)}W`,
                   canvas.width / 2, 45);
      
      console.log('[OptionsManager] Fallback chart rendered successfully');
      
    } catch (error) {
      console.error('[OptionsManager] Error rendering fallback chart:', error);
      // Last resort: show error message
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffebee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#c62828';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Unable to render power chart', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Chart rendering failed', canvas.width / 2, canvas.height / 2 + 10);
      }
    }
  }
  
  prepareChartData(history) {
    if (!history || history.length === 0) {
      return { labels: [], powerData: [] };
    }
    
    // Sort history by timestamp
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    
    // Limit to last 50 entries for performance
    const limitedHistory = sortedHistory.slice(-50);
    
    const labels = [];
    const powerData = [];
    
    limitedHistory.forEach(entry => {
      // Create time label
      const date = new Date(entry.timestamp);
      const timeLabel = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      labels.push(timeLabel);
      
      // Extract power data
      let powerWatts = 0;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
      } else if (entry.energyScore) {
        // Fallback conversion without PowerCalculator
        powerWatts = Math.max(6, Math.min(65, entry.energyScore * 0.8 + 10));
      }
      
      powerData.push(powerWatts);
    });
    
    return { labels, powerData };
  }
  
  async loadInsightsData() {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '7d'
      });
      
      if (response.success) {
        this.displayInsights(response.history);
      }
    } catch (error) {
      console.error('[OptionsManager] Insights request failed:', error);
    }
  }
  
  displayInsights(history) {
    // Calculate weekly insights based on power consumption
    let totalEnergyWh = 0;
    history.forEach(entry => {
      let powerWatts = 0;
      if (entry.powerWatts) {
        powerWatts = entry.powerWatts;
      } else if (entry.energyScore && this.powerCalculator) {
        const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
        powerWatts = legacyPowerData.powerWatts;
      }
      totalEnergyWh += (powerWatts * (entry.duration || 0)) / (1000 * 60 * 60); // Convert to Wh
    });
    
    const estimatedSavingsWh = Math.max(0, totalEnergyWh * 0.15); // 15% potential savings
    const estimatedSavingsKWh = estimatedSavingsWh / 1000;
    
    // Weekly energy savings in kWh
    document.getElementById('weeklySavings').textContent = estimatedSavingsKWh.toFixed(3);
    
    // Battery life extension in minutes (assuming 50Wh laptop battery)
    const batteryExtensionMinutes = Math.round((estimatedSavingsWh / 50) * 60 * 8); // 8 hour workday
    document.getElementById('batteryExtension').textContent = batteryExtensionMinutes;
    
    // Carbon reduction in grams CO2 (0.5 kg CO2/kWh average)
    const carbonReductionGrams = Math.round(estimatedSavingsKWh * 500);
    document.getElementById('carbonReduction').textContent = carbonReductionGrams;
    
    // Generate personalized tips
    this.generatePersonalizedTips(history);
  }
  
  generatePersonalizedTips(history) {
    const tipsContainer = document.getElementById('personalizedTips');
    tipsContainer.innerHTML = '';
    
    // Calculate average power consumption
    let avgPowerWatts = 0;
    if (history.length > 0) {
      let totalPowerWatts = 0;
      history.forEach(entry => {
        let powerWatts = 0;
        if (entry.powerWatts) {
          powerWatts = entry.powerWatts;
        } else if (entry.energyScore && this.powerCalculator) {
          const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
          powerWatts = legacyPowerData.powerWatts;
        }
        totalPowerWatts += powerWatts;
      });
      avgPowerWatts = totalPowerWatts / history.length;
    }
    
    const tips = [
      {
        title: 'Close Unused Tabs',
        description: `You have an average of ${Math.round(history.length / 7)} active tabs per day. Closing unused tabs can reduce power consumption by up to 5-10W per tab.`
      },
      {
        title: 'Optimize Video Settings',
        description: `Video streaming can consume 25-45W. ${avgPowerWatts > 30 ? 'Consider reducing video quality to save power.' : 'Your video usage appears efficient!'}`
      },
      {
        title: 'Use Dark Mode',
        description: 'Dark themes can reduce display power consumption by 2-5W on OLED displays. Enable dark mode in your browser settings.'
      },
      {
        title: avgPowerWatts > 25 ? 'Reduce Background Processes' : 'Excellent Power Efficiency',
        description: avgPowerWatts > 25
          ? `Your average power consumption is ${avgPowerWatts.toFixed(1)}W. Consider closing background apps and extensions.`
          : `Great job! Your average power consumption of ${avgPowerWatts.toFixed(1)}W is very efficient.`
      }
    ];
    
    tips.forEach(tip => {
      const tipElement = document.createElement('div');
      tipElement.className = 'tip-item';
      tipElement.innerHTML = `
        <h4>${tip.title}</h4>
        <p>${tip.description}</p>
      `;
      tipsContainer.appendChild(tipElement);
    });
  }
  
  updateHistoryView() {
    this.loadHistoryData();
  }
  
  refreshHistory() {
    this.loadHistoryData();
  }
  
  async viewTabDetails(url) {
    try {
      // Get detailed history data for this specific entry
      const response = await chrome.runtime.sendMessage({
        type: 'GET_DETAILED_HISTORY',
        url: url
      });
      
      let entryData;
      if (response.success && response.entry) {
        entryData = response.entry;
      } else {
        // Fallback: find the entry in our current history data
        const historyResponse = await chrome.runtime.sendMessage({
          type: 'GET_HISTORY',
          timeRange: '30d'
        });
        
        if (historyResponse.success) {
          entryData = historyResponse.history.find(entry => entry.url === url);
        }
      }
      
      if (!entryData) {
        this.showError('Could not load detailed power data for this entry');
        return;
      }
      
      this.showPowerDetailsModal(entryData);
      
    } catch (error) {
      console.error('[OptionsManager] Failed to load entry details:', error);
      this.showError('Failed to load detailed power information');
    }
  }
  
  showPowerDetailsModal(entry) {
    const modal = document.getElementById('energyDetailsModal');
    
    // Populate website information
    document.getElementById('modalUrl').textContent = this.formatUrl(entry.url);
    document.getElementById('modalPageTitle').textContent = entry.title || 'Unknown Page';
    document.getElementById('modalTimestamp').textContent = this.formatDate(entry.timestamp);
    document.getElementById('modalDuration').textContent = this.formatDuration(entry.duration || 0);
    
    // Calculate power metrics
    let powerMetrics;
    if (entry.powerWatts) {
      powerMetrics = this.calculatePowerMetrics(entry.powerWatts, entry.duration || 0);
    } else if (entry.energyScore && this.powerCalculator) {
      const legacyPowerData = this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore);
      powerMetrics = this.calculatePowerMetrics(legacyPowerData.powerWatts, entry.duration || 0);
    } else {
      powerMetrics = { watts: 0, kWh: 0, durationHours: 0 };
    }
    
    // Populate power consumption
    document.getElementById('modalWatts').textContent = powerMetrics.watts.toFixed(1) + 'W';
    document.getElementById('modalKwh').textContent = (powerMetrics.kWh * 1000).toFixed(1) + ' Wh';
    
    // Calculate estimated cost ($0.12/kWh average US rate)
    const estimatedCost = powerMetrics.kWh * 0.12;
    document.getElementById('modalCost').textContent = estimatedCost < 0.001 ? '< $0.001' : '$' + estimatedCost.toFixed(3);
    
    // Set efficiency rating
    const efficiency = this.getEfficiencyRatingFromWatts(powerMetrics.watts);
    const efficiencyElement = document.getElementById('modalEfficiency');
    efficiencyElement.textContent = efficiency.label;
    efficiencyElement.className = `efficiency-badge efficiency-${efficiency.class}`;
    
    // Populate real-world comparisons
    this.populateRealWorldComparisons(powerMetrics.watts, powerMetrics.kWh);
    
    // Populate power breakdown
    this.populatePowerBreakdown(entry);
    
    // Populate power insights
    this.populatePowerInsights(entry, powerMetrics);
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus management for accessibility
    setTimeout(() => {
      document.getElementById('modalCloseBtn').focus();
    }, 100);
  }

  // Legacy method for backward compatibility
  showEnergyDetailsModal(entry) {
    this.showPowerDetailsModal(entry);
  }
  
  calculatePowerMetrics(powerWatts, durationMs) {
    // Calculate total energy consumption in kWh
    const durationHours = durationMs / (1000 * 60 * 60);
    const kWh = (powerWatts * durationHours) / 1000;
    
    return {
      watts: powerWatts,
      kWh: kWh,
      durationHours: durationHours
    };
  }
  
  getEfficiencyRatingFromWatts(powerWatts) {
    if (powerWatts < 15) {
      return { label: 'Excellent', class: 'excellent' };
    } else if (powerWatts < 25) {
      return { label: 'Good', class: 'good' };
    } else if (powerWatts < 40) {
      return { label: 'Average', class: 'average' };
    } else {
      return { label: 'Poor', class: 'poor' };
    }
  }
  
  // Legacy method for backward compatibility
  getEfficiencyRating(energyScore) {
    if (energyScore < 25) {
      return { label: 'Excellent', class: 'excellent' };
    } else if (energyScore < 50) {
      return { label: 'Good', class: 'good' };
    } else if (energyScore < 75) {
      return { label: 'Average', class: 'average' };
    } else {
      return { label: 'Poor', class: 'poor' };
    }
  }
  
  populateRealWorldComparisons(powerWatts, kWh) {
    // Real-world power and energy consumption comparisons
    const comparisons = {
      // LED 10W bulbs equivalent
      LED: (powerWatts / 10).toFixed(1) + ' LED bulbs',
      
      // Phone charging (5W) equivalent  
      phone: (powerWatts / 5).toFixed(1) + ' phone chargers',
      
      // Laptop usage (45W) percentage
      laptop: ((powerWatts / 45) * 100).toFixed(0) + '% of laptop',
      
      // Smart TV (100W) percentage
      TV: ((powerWatts / 100) * 100).toFixed(0) + '% of smart TV',
      
      // WiFi router (10W) equivalent
      router: (powerWatts / 10).toFixed(1) + ' WiFi routers',
      
      // CO2 impact (0.5 kg CO2/kWh average)
      CO2: (kWh * 500).toFixed(1) + 'g CO₂'
    };
    
    document.getElementById('comparisonLED').textContent = comparisons.LED;
    document.getElementById('comparisonPhone').textContent = comparisons.phone;
    document.getElementById('comparisonLaptop').textContent = comparisons.laptop;
    document.getElementById('comparisonTV').textContent = comparisons.TV;
    document.getElementById('comparisonRouter').textContent = comparisons.router;
    if (document.getElementById('comparisonCO2')) {
      document.getElementById('comparisonCO2').textContent = comparisons.CO2;
    }
  }
  
  populatePowerBreakdown(entry) {
    // Generate realistic power breakdown based on the entry characteristics
    let breakdown = this.generatePowerBreakdown(entry);
    
    // Update progress bars and percentages
    this.updateBreakdownBar('CPU', breakdown.cpu);
    this.updateBreakdownBar('Network', breakdown.network);
    this.updateBreakdownBar('DOM', breakdown.dom);
    this.updateBreakdownBar('Media', breakdown.media);
  }
  
  generatePowerBreakdown(entry) {
    const url = entry.url || '';
    const energyScore = entry.energyScore || 0;
    
    // Base breakdown percentages
    let breakdown = {
      cpu: 25,
      network: 20,
      dom: 30,
      media: 25
    };
    
    // Adjust based on site characteristics
    if (url.includes('youtube.com') || url.includes('video') || url.includes('stream')) {
      // Video-heavy site
      breakdown.media = 45;
      breakdown.cpu = 35;
      breakdown.network = 15;
      breakdown.dom = 5;
    } else if (url.includes('github.com') || url.includes('stackoverflow') || url.includes('docs.')) {
      // Text/code-heavy site
      breakdown.dom = 45;
      breakdown.cpu = 20;
      breakdown.network = 25;
      breakdown.media = 10;
    } else if (url.includes('social') || url.includes('facebook') || url.includes('twitter') || url.includes('instagram')) {
      // Social media - mixed content
      breakdown.media = 35;
      breakdown.dom = 25;
      breakdown.network = 25;
      breakdown.cpu = 15;
    } else if (energyScore > 70) {
      // High energy score - likely CPU intensive
      breakdown.cpu = 40;
      breakdown.media = 30;
      breakdown.dom = 20;
      breakdown.network = 10;
    }
    
    // Normalize to 100%
    const total = breakdown.cpu + breakdown.network + breakdown.dom + breakdown.media;
    if (total !== 100) {
      const factor = 100 / total;
      breakdown.cpu = Math.round(breakdown.cpu * factor);
      breakdown.network = Math.round(breakdown.network * factor);
      breakdown.dom = Math.round(breakdown.dom * factor);
      breakdown.media = 100 - breakdown.cpu - breakdown.network - breakdown.dom; // Ensure exactly 100%
    }
    
    return breakdown;
  }
  
  updateBreakdownBar(category, percentage) {
    const fillElement = document.getElementById(`breakdown${category}`);
    const percentElement = document.getElementById(`breakdown${category}Percent`);
    
    fillElement.style.width = percentage + '%';
    percentElement.textContent = percentage + '%';
  }
  
  populatePowerInsights(entry, powerMetrics) {
    const powerWatts = powerMetrics.watts;
    
    // Peak power usage (simulate based on current power)
    const peakUsage = Math.round(powerWatts * 1.4); // 40% higher than average
    document.getElementById('insightPeakUsage').textContent = peakUsage + 'W';
    
    // Comparison to similar sites based on power consumption
    let comparisonText;
    if (powerWatts < 15) {
      comparisonText = '25% more efficient than average';
    } else if (powerWatts < 25) {
      comparisonText = '10% more efficient than average';
    } else if (powerWatts < 40) {
      comparisonText = 'Similar to average efficiency';
    } else {
      comparisonText = '35% less efficient than average';
    }
    document.getElementById('insightComparison').textContent = comparisonText;
    
    // Estimated cost (assuming $0.12/kWh average US rate)
    const cost = powerMetrics.kWh * 0.12;
    if (cost < 0.001) {
      document.getElementById('insightCost').textContent = '< $0.001';
    } else {
      document.getElementById('insightCost').textContent = '$' + cost.toFixed(3);
    }
    
    // Carbon footprint
    const carbonGrams = powerMetrics.kWh * 500; // 0.5 kg CO2/kWh
    if (document.getElementById('insightCarbon')) {
      document.getElementById('insightCarbon').textContent = carbonGrams.toFixed(1) + 'g CO₂';
    }
  }
  
  setupModalEventListeners() {
    const modal = document.getElementById('energyDetailsModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const okBtn = document.getElementById('modalOkBtn');
    const exportBtn = document.getElementById('modalExportBtn');
    
    // Close button
    closeBtn.addEventListener('click', () => this.hideEnergyDetailsModal());
    
    // OK button
    okBtn.addEventListener('click', () => this.hideEnergyDetailsModal());
    
    // Export button
    exportBtn.addEventListener('click', () => this.exportModalData());
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideEnergyDetailsModal();
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.hideEnergyDetailsModal();
      }
    });
  }
  
  hideEnergyDetailsModal() {
    const modal = document.getElementById('energyDetailsModal');
    modal.classList.add('hidden');
  }
  
  exportModalData() {
    // Get current modal data and export it
    const modalData = {
      url: document.getElementById('modalUrl').textContent,
      title: document.getElementById('modalPageTitle').textContent,
      timestamp: document.getElementById('modalTimestamp').textContent,
      duration: document.getElementById('modalDuration').textContent,
      watts: document.getElementById('modalWatts').textContent,
      kWh: document.getElementById('modalKwh').textContent,
      efficiency: document.getElementById('modalEfficiency').textContent,
      comparisons: {
        LED: document.getElementById('comparisonLED').textContent,
        phone: document.getElementById('comparisonPhone').textContent,
        laptop: document.getElementById('comparisonLaptop').textContent,
        TV: document.getElementById('comparisonTV').textContent,
        router: document.getElementById('comparisonRouter').textContent
      },
      exportedAt: new Date().toISOString()
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(modalData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `power-details-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showSuccess('Power details exported successfully!');
  }
  
  showPrivacyPolicy() {
    alert('Privacy Policy: All data is stored locally on your device. No data is transmitted to external servers.');
  }
  
  showHelp() {
    alert('Help & Support: This extension monitors your browser\'s power consumption and provides insights to help reduce your energy usage.');
  }
  
  showFeedback() {
    alert('Send Feedback: Feature to send feedback would be implemented here.');
  }
  
  showWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--secondary-color);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: var(--shadow);
      z-index: 1000;
      max-width: 300px;
    `;
    welcome.innerHTML = `
      <strong>Welcome to Power Tracker!</strong><br>
      Your extension is now active and monitoring power consumption.
      <button id="welcomeCloseBtn" style="float: right; background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 16px;">&times;</button>
    `;
    
    // Add event listener for close button
    const closeBtn = welcome.querySelector('#welcomeCloseBtn');
    closeBtn.addEventListener('click', () => {
      welcome.remove();
    });
    document.body.appendChild(welcome);
    
    setTimeout(() => {
      if (welcome.parentElement) {
        welcome.remove();
      }
    }, 5000);
  }
  
  showUnsavedChanges() {
    document.getElementById('saveSettingsBtn').style.background = 'var(--warning-color)';
    document.getElementById('saveSettingsBtn').textContent = 'Save Changes';
  }
  
  hideUnsavedChanges() {
    document.getElementById('saveSettingsBtn').style.background = 'var(--primary-color)';
    document.getElementById('saveSettingsBtn').textContent = 'Save Settings';
  }
  
  showSuccess(message) {
    this.showToast(message, 'success');
  }
  
  showError(message) {
    this.showToast(message, 'error');
  }
  
  showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      box-shadow: var(--shadow);
      background: ${type === 'success' ? 'var(--secondary-color)' : 'var(--danger-color)'};
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
  
  // Utility functions
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
  
  formatUrl(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }
  
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
  
  getEnergyLevel(score) {
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  }
  
  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return 'unknown';
    }
  }

  // Backend Energy Methods
  async loadBackendEnergyData() {
    try {
      // Check Chrome API availability first
      if (!this.isChromeApiAvailable()) {
        console.log('[OptionsManager] Chrome APIs unavailable, using fallback data');
        this.backendEnergyData = {
          totalEnergy: 0.012, // Demo 12Wh
          recentEntries: [
            { model: 'GPT-4', tokens: 1500, energy: 0.005, timestamp: Date.now() - 300000 },
            { model: 'Claude', tokens: 800, energy: 0.007, timestamp: Date.now() - 600000 }
          ]
        };
        return;
      }

      // Check if extension context is valid
      if (!chrome.runtime || !chrome.runtime.id) {
        console.warn('[OptionsManager] Extension context invalid, using fallback data');
        this.backendEnergyData = { totalEnergy: 0, recentEntries: [] };
        return;
      }

      // CRITICAL FIX: Use retry logic for service worker communication
      const response = await this.sendMessageWithRetry({
        type: 'GET_BACKEND_ENERGY_HISTORY',
        timeRange: '7d'
      }, 3);
      
      if (response && response.success && response.history) {
        this.displayBackendEnergyLog(response.history || []);
      } else {
        console.warn('[OptionsManager] Invalid response from backend:', response);
        this.displayBackendEnergyLog([]);
      }
      
    } catch (error) {
      console.error('[OptionsManager] Backend energy request failed:', error.message || error);
      
      // Use fallback data instead of crashing
      this.displayBackendEnergyLog([]);
      
      // Show user-friendly message if this is a critical failure
      if (error.message && error.message.includes('Could not establish connection')) {
        console.log('[OptionsManager] Service worker appears to be inactive');
        // Don't show error to user unless they're actively trying to use this feature
      }
    }
  }

  displayBackendEnergyLog(history) {
    const tableBody = document.getElementById('backendLogTableBody');
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 32px;">No backend energy usage logged yet</td></tr>';
      return;
    }
    
    history.slice(0, 50).forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${this.formatDate(entry.timestamp)}</td>
        <td>${entry.aiModel}</td>
        <td>${entry.tokens?.toLocaleString() || '--'}</td>
        <td>${(entry.energyConsumption || 0).toFixed(4)}</td>
        <td>${entry.description || '--'}</td>
        <td>
          <button class="btn-link delete-entry" data-id="${entry.id}">Delete</button>
        </td>
      `;
      
      // Add delete functionality
      const deleteBtn = row.querySelector('.delete-entry');
      deleteBtn.addEventListener('click', () => {
        this.deleteBackendEnergyEntry(entry.id);
      });
      
      tableBody.appendChild(row);
    });
  }

  async quickLogAI(model, defaultTokens) {
    const tokens = prompt(`How many tokens were used for this ${model} query?`, defaultTokens.toString());
    if (tokens && !isNaN(tokens) && parseInt(tokens) > 0) {
      const description = prompt('Brief description of the AI usage (optional):') || '';
      await this.logBackendEnergyUsage({
        aiModel: model,
        tokens: parseInt(tokens),
        requests: 1,
        description: description,
        timestamp: Date.now()
      });
    }
  }

  showCustomAIDialog() {
    const model = prompt('Enter the AI model name:');
    if (model) {
      const tokens = prompt('How many tokens were used?');
      if (tokens && !isNaN(tokens) && parseInt(tokens) > 0) {
        const description = prompt('Brief description (optional):') || '';
        this.logBackendEnergyUsage({
          aiModel: model,
          tokens: parseInt(tokens),
          requests: 1,
          description: description,
          timestamp: Date.now()
        });
      }
    }
  }

  async handleEnergyFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const aiModel = document.getElementById('aiModel').value;
    const customModelName = document.getElementById('customModelName').value;
    const tokenCount = parseInt(document.getElementById('tokenCount').value);
    const requestCount = parseInt(document.getElementById('requestCount').value) || 1;
    const serverEnergy = parseFloat(document.getElementById('serverEnergy').value) || 0;
    const description = document.getElementById('description').value;

    // Validation
    if (!tokenCount || tokenCount <= 0) {
      this.showError('Please enter a valid token count');
      return;
    }

    const energyEntry = {
      aiModel: aiModel === 'custom' ? customModelName : aiModel,
      tokens: tokenCount,
      requests: requestCount,
      serverEnergy: serverEnergy,
      description: description,
      timestamp: Date.now()
    };

    await this.logBackendEnergyUsage(energyEntry);
    
    // Reset form
    event.target.reset();
    document.getElementById('customModelName').disabled = true;
  }

  handleAIModelChange(event) {
    const customModelName = document.getElementById('customModelName');
    if (event.target.value === 'custom') {
      customModelName.disabled = false;
      customModelName.required = true;
    } else {
      customModelName.disabled = true;
      customModelName.required = false;
      customModelName.value = '';
    }
  }

  async logBackendEnergyUsage(entry) {
    try {
      // Calculate energy consumption if not provided
      if (!entry.energyConsumption && !entry.serverEnergy) {
        entry.energyConsumption = this.calculateAIEnergyConsumption(entry.aiModel, entry.tokens, entry.requests);
      } else if (entry.serverEnergy) {
        entry.energyConsumption = entry.serverEnergy;
      }

      // Generate unique ID
      entry.id = 'be_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const response = await chrome.runtime.sendMessage({
        type: 'LOG_BACKEND_ENERGY',
        entry: entry
      });

      if (response.success) {
        this.showSuccess('Backend energy usage logged successfully!');
        this.loadBackendEnergyData(); // Refresh the display
      } else {
        this.showError('Failed to log backend energy: ' + response.error);
      }
    } catch (error) {
      console.error('[OptionsManager] Failed to log backend energy:', error);
      this.showError('Failed to log backend energy usage');
    }
  }

  calculateAIEnergyConsumption(model, tokens, requests = 1) {
    // Energy consumption per 1000 tokens in kWh (estimates based on research)
    const energyDatabase = {
      'gpt-4': 0.047,
      'gpt-3.5-turbo': 0.012,
      'claude-3-opus': 0.045,
      'claude-3-sonnet': 0.025,
      'claude-3-haiku': 0.008,
      'gemini-pro': 0.020,
      'gemini-flash': 0.008,
      'llama-2-70b': 0.035,
      'llama-2-13b': 0.015,
      'llama-2-7b': 0.008,
    };

    const modelKey = model.toLowerCase();
    let energyPer1000Tokens = energyDatabase[modelKey];
    
    // If model not found, estimate based on similar models
    if (!energyPer1000Tokens) {
      if (modelKey.includes('gpt-4') || modelKey.includes('opus')) {
        energyPer1000Tokens = 0.045;
      } else if (modelKey.includes('gpt-3') || modelKey.includes('sonnet')) {
        energyPer1000Tokens = 0.020;
      } else if (modelKey.includes('gemini') || modelKey.includes('claude')) {
        energyPer1000Tokens = 0.015;
      } else if (modelKey.includes('llama') || modelKey.includes('70b')) {
        energyPer1000Tokens = 0.030;
      } else {
        // Default estimate for unknown models
        energyPer1000Tokens = 0.025;
      }
    }

    // Calculate energy consumption
    const energyConsumption = (tokens / 1000) * energyPer1000Tokens * requests;
    return energyConsumption;
  }

  async deleteBackendEnergyEntry(entryId) {
    if (confirm('Delete this backend energy entry? This action cannot be undone.')) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'DELETE_BACKEND_ENERGY_ENTRY',
          entryId: entryId
        });

        if (response.success) {
          this.showSuccess('Entry deleted successfully');
          this.loadBackendEnergyData();
        } else {
          this.showError('Failed to delete entry: ' + response.error);
        }
      } catch (error) {
        console.error('[OptionsManager] Failed to delete entry:', error);
        this.showError('Failed to delete entry');
      }
    }
  }

  // ===== PRICING DATA LOADING =====
  
  loadPricingData() {
    try {
      console.log('[OptionsManager] Loading pricing data...');
      
      // Check and update pro status
      this.checkProStatus();
      
      // Update pricing metrics if available
      this.updatePricingMetrics();
      
      // Ensure FAQ functionality is working
      this.setupFAQToggles();
      
      console.log('[OptionsManager] Pricing data loaded successfully');
    } catch (error) {
      console.error('[OptionsManager] Failed to load pricing data:', error);
    }
  }
  
  updatePricingMetrics() {
    // Update pricing page with current usage statistics
    // This would typically show current usage, limits, etc.
    
    // Get current usage data
    this.getCurrentUsageStats().then(stats => {
      // Update usage displays in pricing section
      const usageElements = document.querySelectorAll('.current-usage');
      usageElements.forEach(element => {
        if (element.dataset.metric === 'energy-tracked') {
          element.textContent = `${stats.energyTracked.toFixed(2)} kWh this month`;
        } else if (element.dataset.metric === 'sites-monitored') {
          element.textContent = `${stats.sitesMonitored} sites monitored`;
        } else if (element.dataset.metric === 'reports-generated') {
          element.textContent = `${stats.reportsGenerated} reports this month`;
        }
      });
    }).catch(error => {
      console.error('[OptionsManager] Failed to update pricing metrics:', error);
    });
  }
  
  async getCurrentUsageStats() {
    try {
      if (!this.isChromeApiAvailable()) {
        return {
          energyTracked: 2.45,
          sitesMonitored: 12,
          reportsGenerated: 3
        };
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_USAGE_STATS',
        timeRange: '30d'
      });
      
      if (response && response.success) {
        return response.stats;
      } else {
        // Return demo data as fallback
        return {
          energyTracked: 2.45,
          sitesMonitored: 12,
          reportsGenerated: 3
        };
      }
    } catch (error) {
      console.error('[OptionsManager] Failed to get usage stats:', error);
      return {
        energyTracked: 0,
        sitesMonitored: 0,
        reportsGenerated: 0
      };
    }
  }
  
  // Test function to demonstrate modal with mock data
  testModalWithData(siteType) {
    const mockData = {
      youtube: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'YouTube - Video Streaming Platform',
        timestamp: Date.now() - (15 * 60 * 1000), // 15 minutes ago
        duration: 15 * 60 * 1000 + 30 * 1000, // 15 minutes 30 seconds
        energyScore: 78
      },
      github: {
        url: 'https://github.com/user/repository',
        title: 'GitHub - Code Repository',
        timestamp: Date.now() - (25 * 60 * 1000), // 25 minutes ago
        duration: 8 * 60 * 1000 + 12 * 1000, // 8 minutes 12 seconds
        energyScore: 42
      },
      docs: {
        url: 'https://docs.example.com/api/reference',
        title: 'API Documentation - Developer Resources',
        timestamp: Date.now() - (45 * 60 * 1000), // 45 minutes ago
        duration: 22 * 60 * 1000 + 45 * 1000, // 22 minutes 45 seconds
        energyScore: 18
      }
    };
    
    const entry = mockData[siteType];
    if (entry) {
      this.showPowerDetailsModal(entry);
    }
  }

  // ===== THEME MANAGEMENT METHODS =====
  
  async handleThemeToggle() {
    try {
      const container = document.querySelector('.container');
      const currentTheme = container?.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      await this.setTheme(newTheme);
      console.log('[OptionsManager] Theme toggled to:', newTheme);
    } catch (error) {
      console.error('[OptionsManager] Failed to toggle theme:', error);
      this.showError('Failed to toggle theme');
    }
  }

  async loadTheme() {
    try {
      const defaultTheme = 'light';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[OptionsManager] Chrome APIs not available, using default theme');
        this.setThemeUI(defaultTheme);
        return;
      }

      // Get saved theme preference
      const result = await chrome.storage.sync.get(['theme']);
      const savedTheme = result.theme || defaultTheme;
      
      this.setThemeUI(savedTheme);
      console.log('[OptionsManager] Theme loaded:', savedTheme);
    } catch (error) {
      console.error('[OptionsManager] Failed to load theme:', error);
      this.setThemeUI('light');
    }
  }

  async setTheme(theme) {
    try {
      // Update UI immediately
      this.setThemeUI(theme);
      
      // Save theme preference if Chrome APIs are available
      if (this.isChromeApiAvailable()) {
        await chrome.storage.sync.set({ theme });
      }
    } catch (error) {
      console.error('[OptionsManager] Failed to set theme:', error);
    }
  }

  setThemeUI(theme) {
    try {
      const container = document.querySelector('.container');
      const themeToggle = document.getElementById('themeToggle');
      
      if (container) {
        container.setAttribute('data-theme', theme);
      }
      
      if (themeToggle) {
        // Update theme toggle button icon
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggle.setAttribute('title',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      }
    } catch (error) {
      console.error('[OptionsManager] Failed to update theme UI:', error);
    }
  }

  // ===== PRICING MANAGEMENT METHODS =====
  
  initializePricingSection() {
    try {
      console.log('[OptionsManager] Initializing pricing section...');
      
      // Set up FAQ toggle functionality
      this.setupFAQToggles();
      
      // Set up plan selection handlers
      this.setupPlanSelectionHandlers();
      
      // Initialize notification system
      this.setupNotificationSystem();
      
      // Check pro status and update UI accordingly
      this.checkProStatus();
      
      console.log('[OptionsManager] Pricing section initialized successfully');
    } catch (error) {
      console.error('[OptionsManager] Error initializing pricing section:', error);
    }
  }
  
  setupFAQToggles() {
    // Add event listener for FAQ toggles using event delegation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('faq-question')) {
        const answer = e.target.nextElementSibling;
        const icon = e.target.querySelector('.faq-icon');
        
        if (answer && answer.classList.contains('faq-answer')) {
          const isOpen = answer.style.display === 'block';
          
          if (isOpen) {
            answer.style.display = 'none';
            if (icon) icon.textContent = '+';
            e.target.setAttribute('aria-expanded', 'false');
          } else {
            answer.style.display = 'block';
            if (icon) icon.textContent = '−';
            e.target.setAttribute('aria-expanded', 'true');
          }
        }
      }
    });
  }
  
  setupPlanSelectionHandlers() {
    // Handle plan selection buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-primary') && e.target.textContent.includes('Choose')) {
        const planCard = e.target.closest('.pricing-card');
        const planName = planCard.querySelector('h3').textContent;
        
        this.handlePlanSelection(planName, e.target);
      }
    });
    
    // Handle contact sales button
    const contactSalesBtn = document.getElementById('contactSalesBtn');
    if (contactSalesBtn) {
      contactSalesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleContactSales();
      });
    }
  }
  
  setupNotificationSystem() {
    // Initialize notification container if not exists
    let notificationContainer = document.getElementById('pricing-notifications');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'pricing-notifications';
      notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 350px;
      `;
      document.body.appendChild(notificationContainer);
    }
  }
  
  async checkProStatus() {
    try {
      // Check if user has pro features enabled
      // This would typically check against a backend or local storage
      const isProUser = await this.getProStatus();
      
      if (isProUser) {
        this.updateUIForProUser();
      } else {
        this.updateUIForFreeUser();
      }
    } catch (error) {
      console.error('[OptionsManager] Failed to check pro status:', error);
    }
  }
  
  async getProStatus() {
    try {
      // In a real implementation, this would check against a licensing server
      // For now, check local storage for demo purposes
      if (!this.isChromeApiAvailable()) {
        return false;
      }
      
      const result = await chrome.storage.local.get(['proStatus']);
      return result.proStatus || false;
    } catch (error) {
      console.error('[OptionsManager] Failed to get pro status:', error);
      return false;
    }
  }
  
  updateUIForProUser() {
    // Update UI to show pro features are active
    const proStatusElements = document.querySelectorAll('.pro-status');
    proStatusElements.forEach(element => {
      element.textContent = 'PRO ACTIVE';
      element.style.color = 'var(--secondary-color)';
    });
    
    // Update pricing cards to show current plan
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
      const button = card.querySelector('.btn-primary');
      if (button && button.textContent.includes('Choose Pro')) {
        button.textContent = 'Current Plan';
        button.style.background = 'var(--secondary-color)';
        button.disabled = true;
      }
    });
  }
  
  updateUIForFreeUser() {
    // Update UI for free user
    const proStatusElements = document.querySelectorAll('.pro-status');
    proStatusElements.forEach(element => {
      element.textContent = 'FREE PLAN';
      element.style.color = 'var(--text-secondary)';
    });
  }
  
  handlePlanSelection(planName, buttonElement) {
    console.log('[OptionsManager] Plan selected:', planName);
    
    // Disable button temporarily
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Processing...';
    buttonElement.disabled = true;
    
    // Simulate plan selection process
    setTimeout(() => {
      if (planName.includes('Free')) {
        this.showPricingNotification('Free plan is already active!', 'info');
      } else if (planName.includes('Enterprise')) {
        // Redirect to contact form for enterprise
        this.handleContactSales();
      } else {
        // Show upgrade modal/process
        this.showUpgradeModal(planName);
      }
      
      // Restore button
      buttonElement.textContent = originalText;
      buttonElement.disabled = false;
    }, 1000);
  }
  
  showUpgradeModal(planName) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: var(--background-color);
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: var(--shadow-elevated);
        border: 1px solid var(--border-color);
      ">
        <h2 style="color: var(--primary-red); margin-bottom: 16px;">Upgrade to ${planName}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          This would redirect to a secure payment processor to complete your upgrade.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn-secondary upgrade-modal-cancel">
            Cancel
          </button>
          <button class="btn-primary upgrade-modal-continue" data-plan="${planName}">
            Continue to Payment
          </button>
        </div>
      </div>
    `;
    
    // Add proper event listeners instead of inline handlers
    const cancelBtn = modal.querySelector('.upgrade-modal-cancel');
    const continueBtn = modal.querySelector('.upgrade-modal-continue');
    
    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    continueBtn.addEventListener('click', () => {
      this.showPaymentProcessor(planName);
    });
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  }
  
  showPaymentProcessor(planName) {
    // In a real implementation, this would redirect to Stripe, PayPal, etc.
    this.showPricingNotification(
      `Payment integration would be implemented here for ${planName}`,
      'info'
    );
    
    // Remove the modal
    const modal = document.querySelector('.upgrade-modal');
    if (modal) modal.remove();
  }
  
  handleContactSales() {
    const contactModal = document.createElement('div');
    contactModal.className = 'contact-modal';
    contactModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;
    
    contactModal.innerHTML = `
      <div class="modal-content" style="
        background: var(--background-color);
        border-radius: 16px;
        padding: 32px;
        max-width: 600px;
        width: 90%;
        box-shadow: var(--shadow-elevated);
        border: 1px solid var(--border-color);
      ">
        <h2 style="color: var(--primary-red); margin-bottom: 16px; text-align: center;">
          Contact Sales Team
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px; text-align: center;">
          Get in touch with our enterprise solutions team for custom pricing and features.
        </p>
        <form class="contact-form" style="display: flex; flex-direction: column; gap: 16px;">
          <input type="text" placeholder="Your Name" required style="
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-primary);
          ">
          <input type="email" placeholder="Business Email" required style="
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-primary);
          ">
          <input type="text" placeholder="Company Name" required style="
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-primary);
          ">
          <select required style="
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-primary);
          ">
            <option value="">Team Size</option>
            <option value="10-50">10-50 employees</option>
            <option value="50-200">50-200 employees</option>
            <option value="200-1000">200-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
          <textarea placeholder="Tell us about your energy tracking needs..." rows="4" style="
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-background);
            color: var(--text-primary);
            resize: vertical;
          "></textarea>
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px;">
            <button type="button" class="btn-secondary contact-modal-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              Send Message
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(contactModal);
    
    // Add event listener for cancel button
    const cancelBtn = contactModal.querySelector('.contact-modal-cancel');
    cancelBtn.addEventListener('click', () => {
      contactModal.remove();
    });
    
    // Handle form submission
    const form = contactModal.querySelector('.contact-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // In a real implementation, this would send the form data to a backend
      this.showPricingNotification(
        'Message sent! Our sales team will contact you within 24 hours.',
        'success'
      );
      
      contactModal.remove();
    });
    
    // Close on backdrop click
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.remove();
      }
    });
  }
  
  showPricingNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('pricing-notifications');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = 'pricing-notification';
    notification.style.cssText = `
      background: ${type === 'success' ? 'var(--secondary-color)' :
                   type === 'error' ? 'var(--danger-color)' :
                   type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 12px;
      box-shadow: var(--shadow);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      cursor: pointer;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 18px;">
          ${type === 'success' ? '✅' :
            type === 'error' ? '❌' :
            type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <span style="flex: 1;">${message}</span>
        <span class="notification-close" style="opacity: 0.7; font-size: 18px; cursor: pointer;">×</span>
      </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Add event listener for close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
    
    // Click to remove
    notification.addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    });
  }
}

// Initialize when DOM is ready
let optionsManager;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    optionsManager = new OptionsManager();
  });
} else {
  optionsManager = new OptionsManager();
}

// Add power badge styles and validation styles dynamically
const style = document.createElement('style');
style.textContent = `
  .energy-badge, .power-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  .energy-low, .power-excellent { background: #e8f5e8; color: #2e7d32; }
  .energy-medium, .power-good { background: #fff3e0; color: #f57c00; }
  .energy-high, .power-average { background: #ffebee; color: #c62828; }
  .power-poor { background: #ffebee; color: #c62828; }
  .efficiency-badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: bold;
  }
  .efficiency-excellent { background: #e8f5e8; color: #2e7d32; }
  .efficiency-good { background: #fff3e0; color: #f57c00; }
  .efficiency-average { background: #fff3e0; color: #f57c00; }
  .efficiency-poor { background: #ffebee; color: #c62828; }
  .btn-link {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    text-decoration: underline;
    font-size: 12px;
  }
  
  /* Validation feedback styles */
  .validation-error {
    border-color: #d32f2f !important;
    background-color: #ffebee;
  }
  
  .validation-warning {
    border-color: #f57c00 !important;
    background-color: #fff3e0;
  }
  
  .validation-success {
    border-color: #388e3c !important;
    background-color: #e8f5e8;
  }
  
  .validation-feedback {
    display: flex;
    align-items: center;
    margin-top: 4px;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.3;
  }
  
  .validation-feedback.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }
  
  .validation-feedback.warning {
    background-color: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc02;
  }
  
  .validation-icon {
    margin-right: 6px;
    flex-shrink: 0;
  }
  
  .validation-message {
    flex: 1;
  }
  
  /* Enhanced form input styles for validation states */
  input[type="text"], input[type="number"], input[type="range"], select {
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  
  input[type="range"].validation-error::-webkit-slider-track,
  input[type="range"].validation-warning::-webkit-slider-track {
    transition: background-color 0.2s ease;
  }
  
  input[type="range"].validation-error::-webkit-slider-track {
    background-color: #ffcdd2;
  }
  
  input[type="range"].validation-warning::-webkit-slider-track {
    background-color: #ffcc02;
  }
  
  input[type="range"].validation-success::-webkit-slider-track {
    background-color: #c8e6c9;
  }
`;
document.head.appendChild(style);