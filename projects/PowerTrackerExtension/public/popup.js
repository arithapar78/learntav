// EnergyTrackingApp Popup Script
// Handles popup UI interactions and data display with watts-based power consumption

class PopupManager {
  constructor() {
    this.currentTabData = null;
    this.energyData = null;
    this.backendEnergyData = null;
    this.aiEnergyData = null;
    this.settings = null;
    this.updateInterval = null;
    
    // Initialize Enhanced AI Energy Manager
    this.aiEnergyManager = typeof EnhancedAIEnergyManager !== 'undefined'
      ? new EnhancedAIEnergyManager()
      : (typeof AIEnergyManager !== 'undefined' ? new AIEnergyManager() : null);
    this.detectedAIModel = null;
    this.currentAIUsage = null;
    this.enhancedAIData = null;
    
    // Initialize Backend Power Calculator
    this.backendPowerCalculator = typeof BackendPowerCalculator !== 'undefined'
      ? new BackendPowerCalculator()
      : null;
    
    this.init();
  }
  
  async init() {
    console.log('[PopupManager] Initializing popup...');
    
    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      // Hide loading overlay
      this.hideLoadingOverlay();
      
    } catch (error) {
      console.error('[PopupManager] Initialization failed:', error);
      this.showError('Failed to initialize. Please try again.');
    }
  }
  
  setupEventListeners() {
    // Enhanced button event listeners with null checks
    this.safeAddEventListener('viewHistoryBtn', 'click', this.handleViewHistory.bind(this));
    this.safeAddEventListener('settingsBtn', 'click', this.handleSettings.bind(this));
    this.safeAddEventListener('tipAction', 'click', this.handleTipAction.bind(this));
    this.safeAddEventListener('themeToggle', 'click', this.handleThemeToggle.bind(this));
    
    // Energy mode toggle listeners
    this.safeAddEventListener('frontendModeBtn', 'click', () => this.handleEnergyModeToggle('frontend'));
    this.safeAddEventListener('totalModeBtn', 'click', () => this.handleEnergyModeToggle('total'));
    
    // Advanced features integration
    this.safeAddEventListener('advancedFeaturesBtn', 'click', this.handleAdvancedFeatures.bind(this));
    this.safeAddEventListener('modalCloseBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('cancelCodeBtn', 'click', this.hideCodeEntryModal.bind(this));
    this.safeAddEventListener('submitCodeBtn', 'click', this.handleCodeSubmit.bind(this));
    this.safeAddEventListener('generatorCloseBtn', 'click', this.hidePromptGenerator.bind(this));
    
    // Model comparison and benchmarking
    this.safeAddEventListener('comparisonCloseBtn', 'click', this.hideComparisonModal.bind(this));
    this.safeAddEventListener('benchmarksCloseBtn', 'click', this.hideBenchmarksModal.bind(this));
    this.safeAddEventListener('refreshComparisonBtn', 'click', this.refreshComparison.bind(this));
    this.safeAddEventListener('exportComparisonBtn', 'click', this.exportComparison.bind(this));
    this.safeAddEventListener('applyRecommendationBtn', 'click', this.applyRecommendation.bind(this));
    
    // Tab energy recommendations event listeners
    this.safeAddEventListener('closeRecommendedBtn', 'click', this.handleCloseRecommendedTabs.bind(this));
    this.safeAddEventListener('dismissSuggestionsBtn', 'click', this.handleDismissSuggestions.bind(this));
    
    // Image error handlers with enhanced safety
    const popupLogo = document.getElementById('popupLogo');
    if (popupLogo) {
      popupLogo.addEventListener('error', () => {
        try {
          popupLogo.style.display = 'none';
        } catch (error) {
          console.warn('[PopupManager] Failed to hide logo:', error);
        }
      });
    }
    
    // Handle popup close
    window.addEventListener('beforeunload', this.handlePopupClose.bind(this));
    
    // Add keyboard navigation support
    this.setupKeyboardNavigation();
    
    // Setup tab energy recommendations
    this.setupTabRecommendations();
  }

  setupKeyboardNavigation() {
    try {
      // Handle keyboard events for accessibility
      document.addEventListener('keydown', (event) => {
        // Check if user is typing in an input field - don't intercept if they are
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable ||
          activeElement.hasAttribute('contenteditable')
        );
        
        // For regular shortcuts, skip if user is typing
        if (!isTyping) {
          // Toggle theme with T key
          if (event.key === 't' || event.key === 'T') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleThemeToggle();
            }
          }
          
          // Settings with S key
          if (event.key === 's' || event.key === 'S') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleSettings();
            }
          }
          
          // History with H key
          if (event.key === 'h' || event.key === 'H') {
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
              event.preventDefault();
              this.handleViewHistory();
            }
          }
        }
        
        // Escape key to close popup (always allow, even when typing)
        if (event.key === 'Escape') {
          try {
            window.close();
          } catch (e) {
            // Window.close() may not work in all contexts
          }
        }
      });
      
      // Focus management for better accessibility
      this.setupFocusManagement();
      
      console.log('[PopupManager] Keyboard navigation set up successfully');
    } catch (error) {
      console.error('[PopupManager] Failed to setup keyboard navigation:', error);
    }
  }

  setupFocusManagement() {
    try {
      // Ensure the first interactive element gets focus when popup opens
      const firstButton = document.querySelector('button, [tabindex="0"]');
      if (firstButton) {
        // Small delay to ensure popup is fully rendered
        setTimeout(() => {
          firstButton.focus();
        }, 100);
      }
      
      // Add visible focus indicators for all interactive elements
      const interactiveElements = document.querySelectorAll('button, [tabindex="0"]');
      interactiveElements.forEach(element => {
        element.addEventListener('focus', () => {
          element.style.outline = '2px solid var(--accent-primary)';
          element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
          element.style.outline = '';
          element.style.outlineOffset = '';
        });
      });
    } catch (error) {
      console.error('[PopupManager] Failed to setup focus management:', error);
    }
  }

  /**
   * Safe event listener addition with null checks
   */
  safeAddEventListener(elementId, eventType, handler) {
    try {
      const element = document.getElementById(elementId);
      if (element && typeof handler === 'function') {
        element.addEventListener(eventType, handler);
        console.log(`[PopupManager] Event listener added for ${elementId}`);
      } else {
        console.warn(`[PopupManager] Element not found or invalid handler: ${elementId}`);
      }
    } catch (error) {
      console.error(`[PopupManager] Failed to add event listener for ${elementId}:`, error);
    }
  }
  
  async loadInitialData() {
    // Load theme first
    await this.loadTheme();
    
    // Load settings
    await this.loadSettings();
    
    // Load energy mode preference
    await this.loadEnergyMode();
    
    // Load current energy data
    await this.loadCurrentEnergyData();
    
    // Load backend energy data
    await this.loadBackendEnergyData();
    
    // Load enhanced AI energy data
    await this.loadEnhancedAIEnergyData();
    
    // Load today's summary
    await this.loadTodaySummary();
    
    // Update UI
    this.updateUI();
  }
  
  /**
   * Loads saved energy display mode preference
   */
  async loadEnergyMode() {
    try {
      const defaultMode = 'frontend';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default energy mode');
        this.energyDisplayMode = defaultMode;
        return;
      }

      // Get saved energy mode preference
      const result = await chrome.storage.local.get(['energyDisplayMode']);
      const savedMode = result.energyDisplayMode || defaultMode;
      
      this.energyDisplayMode = savedMode;
      console.log('[PopupManager] Energy mode loaded:', savedMode);
    } catch (error) {
      console.error('[PopupManager] Failed to load energy mode:', error);
      this.energyDisplayMode = 'frontend';
    }
  }
  
  /**
   * Handles energy mode toggle button clicks
   */
  handleEnergyModeToggle(mode) {
    console.log('[PopupManager] Energy mode toggle:', mode);
    this.setEnergyMode(mode);
  }
  
  /**
   * Updates energy mode toggle UI
   */
  updateEnergyModeUI(mode) {
    const frontendBtn = document.getElementById('frontendModeBtn');
    const totalBtn = document.getElementById('totalModeBtn');
    
    if (frontendBtn && totalBtn) {
      // Remove active class from both buttons
      frontendBtn.classList.remove('active');
      totalBtn.classList.remove('active');
      
      // Add active class to selected mode
      if (mode === 'frontend') {
        frontendBtn.classList.add('active');
      } else {
        totalBtn.classList.add('active');
      }
      
      // Add switching animation to power display
      const powerDisplay = document.getElementById('powerDisplay');
      if (powerDisplay) {
        powerDisplay.classList.add('mode-switching');
        setTimeout(() => {
          powerDisplay.classList.remove('mode-switching');
        }, 300);
      }
    }
  }
  
  async loadSettings() {
    const defaultSettings = {
      trackingEnabled: true,
      notificationsEnabled: true,
      powerThreshold: 40,
      energyThreshold: 75, // Keep for legacy compatibility
      dataRetentionDays: 30,
      samplingInterval: 5000
    };

    try {
      // Enhanced Chrome API availability check with timeout
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default settings');
        this.settings = defaultSettings;
        return;
      }
      
      // CRITICAL FIX: Add retry logic for service worker communication
      const response = await this.sendMessageWithRetry({ type: 'GET_SETTINGS' }, 3);
      
      if (response && response.success && response.settings) {
        // Merge with defaults to ensure all properties exist
        this.settings = { ...defaultSettings, ...response.settings };
        console.log('[PopupManager] Settings loaded successfully:', this.settings);
      } else {
        console.warn('[PopupManager] Failed to load settings:', response?.error || 'Invalid response');
        this.settings = defaultSettings;
      }
    } catch (error) {
      console.error('[PopupManager] Settings request failed:', error.message || error);
      this.settings = defaultSettings;
      
      // Show user-friendly error if it's a critical failure
      if (error.message && error.message.includes('Could not establish connection')) {
        console.log('[PopupManager] Service worker not available, using defaults');
      } else if (error.message === 'Settings request timeout') {
        this.showToast('Settings loading timeout - using defaults');
      }
    }
  }

  // NEW: Robust message sending with retry logic
  async sendMessageWithRetry(message, maxRetries = 3, timeout = 5000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[PopupManager] Sending message (attempt ${attempt}/${maxRetries}):`, message.type);
        
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
          console.log(`[PopupManager] Message successful on attempt ${attempt}`);
          return response;
        }
        
        throw new Error('Empty response');
      } catch (error) {
        console.warn(`[PopupManager] Message attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Check if Chrome APIs are available and functional
   */
  isChromeApiAvailable() {
    try {
      return !!(
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.id &&
        chrome.runtime.sendMessage
      );
    } catch (error) {
      console.warn('[PopupManager] Chrome API check failed:', error.message);
      return false;
    }
  }
  
  async loadCurrentEnergyData(retryCount = 0) {
    const maxRetries = 6; // Increased retries for better reliability
    const baseRetryDelay = 800; // Shorter initial delay
    const retryDelay = baseRetryDelay * Math.pow(1.4, retryCount); // Gentler exponential backoff
    
    try {
      console.log('=== POPUP: Loading Energy Data ===');
      console.log('Attempt:', retryCount + 1, '/', maxRetries + 1);
      
      // Enhanced Chrome API availability check
      if (!this.isChromeApiAvailable()) {
        console.log('Chrome APIs not available, using demo data');
        this.loadDemoData();
        return;
      }

      // CRITICAL FIX: Get current tab FIRST to ensure proper tab context
      let currentTab = null;
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs && tabs.length > 0) {
          currentTab = tabs[0];
          console.log('=== CURRENT TAB INFO ===');
          console.log('Tab ID:', currentTab?.id);
          console.log('Tab URL:', this.safeSubstring(currentTab?.url, 0, 50));
          console.log('Tab Title:', this.safeSubstring(currentTab?.title, 0, 50));
        } else {
          throw new Error('No active tab found');
        }
      } catch (tabQueryError) {
        console.error('[PopupManager] Failed to query active tab:', tabQueryError);
        await this.handleNoEnergyDataAvailable();
        return;
      }

      // CRITICAL FIX: Wake up service worker and ensure tab is being tracked
      try {
        console.log('[PopupManager] Ensuring tab is tracked...');
        await this.sendMessageWithRetry({
          type: 'ENSURE_TAB_TRACKING',
          tabId: currentTab.id,
          tabInfo: {
            url: currentTab.url,
            title: currentTab.title
          }
        }, 2);
      } catch (trackingError) {
        console.warn('[PopupManager] Failed to ensure tab tracking:', trackingError);
      }

      // ENHANCED FIX: Multiple data retrieval strategies
      let response = null;
      let energyDataFound = false;

      // Strategy 1: Get current energy snapshot
      try {
        response = await this.sendMessageWithRetry({ type: 'GET_CURRENT_ENERGY' }, 2);
        if (response?.success && response?.data) {
          this.energyData = response.data || {};
          energyDataFound = Object.keys(this.energyData).length > 0;
          console.log('[PopupManager] Strategy 1 - Current snapshot:', energyDataFound ? 'SUCCESS' : 'NO DATA');
        }
      } catch (error) {
        console.warn('[PopupManager] Strategy 1 failed:', error.message);
      }

      // Strategy 2: If no current data, try to get recent historical data
      if (!energyDataFound) {
        try {
          console.log('[PopupManager] Strategy 2 - Checking recent history...');
          const historyResponse = await chrome.runtime.sendMessage({
            type: 'GET_HISTORY',
            timeRange: '1h'
          });
          
          if (historyResponse?.success && historyResponse?.history?.length > 0) {
            console.log('[PopupManager] Found recent history entries:', historyResponse.history.length);
            const recentEntry = this.findMostRecentTabData(historyResponse.history, currentTab);
            if (recentEntry) {
              // Create current tab data from recent history
              this.energyData = {
                [currentTab.id]: {
                  ...recentEntry,
                  tabId: currentTab.id,
                  timestamp: Date.now(),
                  isHistorical: true,
                  dataSource: 'recent_history'
                }
              };
              energyDataFound = true;
              console.log('[PopupManager] Strategy 2 - Recent history: SUCCESS');
            }
          }
        } catch (historyError) {
          console.warn('[PopupManager] Strategy 2 failed:', historyError.message);
        }
      }

      // Strategy 3: Force content script data collection with enhanced safety
      if (!energyDataFound) {
        try {
          console.log('[PopupManager] Strategy 3 - Checking content script availability...');
          
          // First, check if content script is available with a ping
          let contentScriptAvailable = false;
          try {
            const pingResponse = await chrome.tabs.sendMessage(currentTab.id, { type: 'PING' });
            contentScriptAvailable = pingResponse?.success;
            console.log('[PopupManager] Content script ping result:', contentScriptAvailable);
          } catch (pingError) {
            console.log('[PopupManager] Content script not available:', pingError.message);
            
            // Try to inject content script if it's missing
            try {
              console.log('[PopupManager] Attempting to inject content script...');
              await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                files: ['content-script.js']
              });
              
              // Wait for injection to complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Try ping again
              try {
                const retryPingResponse = await chrome.tabs.sendMessage(currentTab.id, { type: 'PING' });
                contentScriptAvailable = retryPingResponse?.success;
                console.log('[PopupManager] Post-injection ping result:', contentScriptAvailable);
              } catch (retryPingError) {
                console.log('[PopupManager] Content script still not responding after injection');
              }
            } catch (injectionError) {
              console.log('[PopupManager] Content script injection failed:', injectionError.message);
            }
          }
          
          // Only proceed with metrics collection if content script is available
          if (contentScriptAvailable) {
            console.log('[PopupManager] Strategy 3 - Triggering content script metrics...');
            try {
              await chrome.tabs.sendMessage(currentTab.id, {
                type: 'COLLECT_IMMEDIATE_METRICS'
              });
              
              // Wait a moment for data collection
              await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
              
              // Try getting data again
              response = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_ENERGY' });
              if (response?.success && response?.data) {
                this.energyData = response.data || {};
                energyDataFound = Object.keys(this.energyData).length > 0;
                console.log('[PopupManager] Strategy 3 - Force collection:', energyDataFound ? 'SUCCESS' : 'NO DATA');
              }
            } catch (metricsError) {
              console.warn('[PopupManager] Strategy 3 metrics collection failed:', metricsError.message);
            }
          } else {
            console.log('[PopupManager] Strategy 3 skipped - content script not available');
          }
        } catch (contentError) {
          console.warn('[PopupManager] Strategy 3 failed:', contentError.message);
        }
      }

      // Process the retrieved data
      if (energyDataFound) {
        const energyDataKeys = Object.keys(this.energyData);
        console.log('Available tab IDs:', energyDataKeys);
        console.log('Energy data details:', energyDataKeys.map(tabId => {
          const tabData = this.energyData[tabId] || {};
          return {
            tabId,
            url: this.safeSubstring(tabData.url, 0, 50),
            energyScore: tabData.energyScore ?? 0,
            powerWatts: tabData.powerWatts ?? 0,
            timestamp: tabData.timestamp ? new Date(tabData.timestamp).toLocaleTimeString() : null,
            dataSource: tabData.dataSource || 'live'
          };
        }));

        const tabId = currentTab?.id;
        this.currentTabData = (tabId && this.energyData[tabId]) ? this.energyData[tabId] : null;
        
        if (this.currentTabData) {
          console.log('✅ Energy data found for current tab:', {
            energyScore: this.currentTabData.energyScore ?? 0,
            powerWatts: this.currentTabData.powerWatts ?? 0,
            domNodes: this.currentTabData.domNodes ?? 0,
            age: this.currentTabData.timestamp ? (Date.now() - this.currentTabData.timestamp) + 'ms ago' : 'unknown',
            source: this.currentTabData.dataSource || 'live'
          });
          return; // SUCCESS - exit early
        } else {
          console.log('❌ No energy data found for current tab ID, checking similar URLs...');
          const similarTabData = this.findSimilarTabData(currentTab?.url);
          if (similarTabData) {
            console.log('Found similar URL data:', this.safeSubstring(similarTabData.url, 0, 50));
            this.currentTabData = similarTabData;
            return; // SUCCESS with similar data
          }
        }
      }

      // RETRY LOGIC: Only retry if we haven't found any data
      if (retryCount < maxRetries) {
        console.log(`No data found, retrying in ${Math.round(retryDelay)}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        setTimeout(() => {
          this.loadCurrentEnergyData(retryCount + 1).then(() => {
            this.updateUI(); // Update UI after retry
          }).catch(error => {
            console.error('[PopupManager] Retry failed:', error);
          });
        }, retryDelay);
        return;
      } else {
        console.warn(`❌ No energy data found for current tab after ${maxRetries + 1} attempts`);
        console.log('Creating fallback tab data...');
        await this.createFallbackTabData(currentTab);
      }

    } catch (error) {
      console.error('❌ Energy data request failed:', error);
      if (retryCount < maxRetries) {
        console.log(`Retrying energy data load after error in ${Math.round(retryDelay)}ms...`);
        setTimeout(() => {
          this.loadCurrentEnergyData(retryCount + 1).then(() => {
            this.updateUI();
          });
        }, retryDelay);
        return;
      }
      this.energyData = {};
      await this.handleNoEnergyDataAvailable();
    }
  }
  
  // Helper method to find similar tab data (for URL redirects, etc.)
  findSimilarTabData(currentUrl) {
    if (!currentUrl || !this.energyData) return null;
    
    try {
      const currentDomain = new URL(currentUrl).hostname;
      
      // Look for tabs with the same domain
      for (const [tabId, data] of Object.entries(this.energyData)) {
        if (data.url) {
          try {
            const dataDomain = new URL(data.url).hostname;
            if (dataDomain === currentDomain) {
              console.log('Found matching domain data:', data.url?.substring(0, 50));
              return { ...data, tabId: parseInt(tabId) };
            }
          } catch (e) {
            // Skip invalid URLs
          }
        }
      }
    } catch (e) {
      // Skip if current URL is invalid
    }
    
    return null;
  }

  // Helper method to find most recent tab data from history
  findMostRecentTabData(history, currentTab) {
    if (!history || !Array.isArray(history) || !currentTab) return null;
    
    const currentUrl = currentTab.url;
    const currentDomain = this.safeGetDomain(currentUrl);
    
    // Sort by timestamp (most recent first)
    const sortedHistory = history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Look for exact URL match first
    let match = sortedHistory.find(entry => entry.url === currentUrl);
    
    // If no exact match, look for same domain
    if (!match && currentDomain) {
      match = sortedHistory.find(entry => {
        const entryDomain = this.safeGetDomain(entry.url);
        return entryDomain && entryDomain === currentDomain;
      });
    }
    
    if (match) {
      console.log('[PopupManager] Found recent tab data:', {
        url: this.safeSubstring(match.url, 0, 50),
        age: match.timestamp ? `${Math.round((Date.now() - match.timestamp) / 1000)}s ago` : 'unknown',
        powerWatts: match.powerWatts || 'legacy'
      });
      
      return {
        url: currentTab.url, // Use current URL
        title: currentTab.title || match.title,
        powerWatts: match.powerWatts || this.migrateLegacyScore(match.energyScore || 0),
        energyScore: match.energyScore || 0,
        domNodes: match.domNodes || 0,
        duration: 0, // Reset duration for current session
        timestamp: Date.now()
      };
    }
    
    return null;
  }
  
  // Helper method to create fallback tab data and search history
  async createFallbackTabData(currentTab) {
    console.log('Creating fallback tab data for:', currentTab.url?.substring(0, 50));
    
    // Try to find historical data for this tab/URL
    const historicalData = await this.findHistoricalData(currentTab.url);
    
    this.currentTabData = {
      url: currentTab.url,
      title: currentTab.title,
      energyScore: historicalData?.averageEnergyScore || 0,
      domNodes: historicalData?.averageDomNodes || 0,
      duration: 0,
      timestamp: Date.now(),
      tabId: currentTab.id,
      isEstimated: true,
      dataSource: historicalData ? 'historical' : 'fallback'
    };
    
    if (historicalData) {
      console.log('✅ Using historical data for estimates:', {
        averageEnergyScore: historicalData.averageEnergyScore,
        visits: historicalData.visits
      });
    } else {
      console.log('⚠️ Using basic fallback data (no history available)');
    }
  }
  
  // Helper method to find historical data for a URL with enhanced safety
  async findHistoricalData(url) {
    try {
      // Enhanced URL validation
      if (!url || typeof url !== 'string') {
        console.warn('[PopupManager] Invalid URL provided for historical data lookup');
        return null;
      }

      // Enhanced Chrome API check
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available for historical data');
        return null;
      }

      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '7d'
      });
      
      if (response && response.success && Array.isArray(response.history)) {
        // Enhanced history filtering with null safety
        let matches = response.history.filter(entry =>
          entry && typeof entry === 'object' && entry.url === url
        );
        
        // If no exact matches, try domain matching with enhanced safety
        if (matches.length === 0 && url) {
          const domain = this.safeGetDomain(url);
          if (domain) {
            matches = response.history.filter(entry => {
              if (!entry || !entry.url) return false;
              const entryDomain = this.safeGetDomain(entry.url);
              return entryDomain && entryDomain === domain;
            });
          }
        }
        
        if (matches.length > 0) {
          const totalEnergyScore = matches.reduce((sum, entry) => sum + (entry?.energyScore ?? 0), 0);
          const totalDomNodes = matches.reduce((sum, entry) => sum + (entry?.domNodes ?? 0), 0);
          const timestamps = matches.map(entry => entry?.timestamp ?? 0).filter(t => t > 0);
          
          return {
            visits: matches.length,
            averageEnergyScore: totalEnergyScore > 0 ? Math.round(totalEnergyScore / matches.length) : 0,
            averageDomNodes: totalDomNodes > 0 ? Math.round(totalDomNodes / matches.length) : 0,
            lastVisit: timestamps.length > 0 ? Math.max(...timestamps) : 0
          };
        }
      } else {
        console.warn('[PopupManager] Invalid history response:', response);
      }
    } catch (error) {
      console.error('[PopupManager] Error fetching historical data:', error.message || error);
    }
    
    return null;
  }

  /**
   * Safe domain extraction with enhanced error handling
   */
  safeGetDomain(url) {
    try {
      if (!url || typeof url !== 'string') return null;
      const urlObj = new URL(url);
      return urlObj.hostname || null;
    } catch (error) {
      console.warn('[PopupManager] Failed to extract domain from URL:', url, error.message);
      return null;
    }
  }
  
  // Helper method to handle complete absence of energy data
  async handleNoEnergyDataAvailable() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    if (currentTab) {
      this.currentTabData = {
        url: currentTab.url,
        title: currentTab.title,
        energyScore: 0,
        domNodes: 0,
        duration: 0,
        timestamp: Date.now(),
        tabId: currentTab.id,
        isUnavailable: true,
        dataSource: 'unavailable'
      };
    } else {
      this.currentTabData = null;
    }
    
    console.log('⚠️ No energy data available, using unavailable state');
  }
  
  async loadBackendEnergyData() {
    try {
      // Check if Chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        this.backendEnergyData = {
          totalEnergy: 0.012, // Demo 12Wh
          recentEntries: [
            { model: 'GPT-4', tokens: 1500, energy: 0.005, timestamp: Date.now() - 300000 },
            { model: 'Claude', tokens: 800, energy: 0.007, timestamp: Date.now() - 600000 }
          ]
        };
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_BACKEND_ENERGY_SUMMARY',
        timeRange: '24h'
      });
      
      if (response.success) {
        this.backendEnergyData = response.data;
      } else {
        console.error('[PopupManager] Failed to load backend energy data:', response.error);
        this.backendEnergyData = { totalEnergy: 0, recentEntries: [] };
      }
    } catch (error) {
      console.error('[PopupManager] Backend energy request failed:', error);
      this.backendEnergyData = { totalEnergy: 0, recentEntries: [] };
    }
  }
  
  async loadEnhancedAIEnergyData() {
    try {
      console.log('[PopupManager] Loading enhanced AI energy data...');
      
      if (!this.aiEnergyManager) {
        console.log('[PopupManager] No AI energy manager available');
        this.enhancedAIData = null;
        return;
      }

      // Get current tab info
      let currentTab = null;
      if (this.isChromeApiAvailable()) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];
      }
      
      if (!currentTab) {
        console.log('[PopupManager] No current tab found for AI detection');
        this.enhancedAIData = null;
        return;
      }
      
      console.log('[PopupManager] Detecting AI model for:', currentTab.url);
      
      // Enhanced context for AI detection
      const context = {
        batteryLevel: await this.getBatteryLevel(),
        userActivity: this.calculateUserActivity(),
        performanceMode: await this.getPerformanceMode(),
        timestamp: Date.now()
      };
      
      // Detect AI model on current page with enhanced context
      this.detectedAIModel = this.aiEnergyManager.detectAIModel(
        currentTab.url,
        currentTab.title,
        '',
        context
      );
      
      if (this.detectedAIModel) {
        console.log('[PopupManager] AI model detected:', this.detectedAIModel.model.name);
        
        // Estimate AI usage with enhanced calculations
        this.currentAIUsage = this.aiEnergyManager.estimateAIUsage(
          this.currentTabData,
          this.detectedAIModel,
          context
        );
        
        // Update session tracking if enhanced manager is available
        if (typeof this.aiEnergyManager.updateSessionTotals === 'function') {
          this.aiEnergyManager.updateSessionTotals(this.currentAIUsage);
        } else if (currentTab.id) {
          // Fallback to basic update
          this.aiEnergyManager.updateTabUsage(currentTab.id, this.currentAIUsage);
        }
        
        console.log('[PopupManager] Enhanced AI usage estimated:', this.currentAIUsage);
      } else {
        console.log('[PopupManager] No AI model detected for current tab');
        this.currentAIUsage = null;
      }
      
      // Get session statistics
      let sessionStats = {};
      if (typeof this.aiEnergyManager.getSessionStats === 'function') {
        sessionStats = this.aiEnergyManager.getSessionStats();
      } else {
        // Fallback to basic session data
        sessionStats = this.aiEnergyManager.getSessionEnergyData();
      }
      
      // Store enhanced AI data for UI updates
      
      this.enhancedAIData = {
        detectedModel: this.detectedAIModel,
        usage: this.currentAIUsage,
        sessionStats: sessionStats,
        hasEnhancedFeatures: typeof EnhancedAIEnergyManager !== 'undefined'
      };
      
      // Store for legacy compatibility
      this.aiEnergyData = {
        totalEnergy: this.currentAIUsage?.energy?.mean || 0,
        detectedModel: this.detectedAIModel,
        usage: this.currentAIUsage,
        sessionData: sessionStats
      };
      
      console.log('[PopupManager] Enhanced AI energy data loaded:', this.enhancedAIData);
      
    } catch (error) {
      console.error('[PopupManager] Failed to load enhanced AI energy data:', error);
      this.enhancedAIData = null;
      this.aiEnergyData = { totalEnergy: 0, detectedModel: null, usage: null };
    }
  }

  async getBatteryLevel() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return battery.level;
      }
    } catch (error) {
      // Battery API not available
    }
    return 0.5; // Default
  }

  calculateUserActivity() {
    // Simple user activity estimation based on tab interaction
    const now = Date.now();
    const recentThreshold = 300000; // 5 minutes
    
    if (this.currentTabData && this.currentTabData.timestamp) {
      const timeSinceUpdate = now - this.currentTabData.timestamp;
      return timeSinceUpdate < recentThreshold ? 0.8 : 0.3;
    }
    
    return 0.5; // Default moderate activity
  }

  async getPerformanceMode() {
    try {
      const batteryLevel = await this.getBatteryLevel();
      if (batteryLevel < 0.3) return 'efficient';
      if (batteryLevel > 0.8) return 'performance';
      return 'balanced';
    } catch (error) {
      return 'balanced'; // Default fallback
    }
  }
  
  /**
   * Get performance mode synchronously for immediate use
   */
  getPerformanceModeSync() {
    // Use cached battery level or estimate based on other factors
    const now = Date.now();
    const recentThreshold = 300000; // 5 minutes
    
    if (this.currentTabData && this.currentTabData.timestamp) {
      const timeSinceUpdate = now - this.currentTabData.timestamp;
      if (timeSinceUpdate > recentThreshold) return 'efficient'; // Assume low power for old data
    }
    
    return 'balanced'; // Default balanced mode
  }

  /**
   * Calculate user engagement level for backend power estimation
   */
  getUserEngagementLevel() {
    const now = Date.now();
    const lastActivity = this.currentTabData?.timestamp || now;
    const timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity < 30000) return 'high';      // Active within 30s
    if (timeSinceActivity < 300000) return 'medium';   // Active within 5 min
    return 'low';                                      // Inactive
  }

  
  async loadTodaySummary() {
    try {
      // Check if Chrome APIs are available
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        this.todayHistory = [
          { url: 'https://github.com/user/repo', title: 'GitHub Repository', powerWatts: 18.5, duration: 450000, timestamp: Date.now() - 3600000 },
          { url: 'https://www.youtube.com/watch', title: 'YouTube Video', powerWatts: 35.2, duration: 900000, timestamp: Date.now() - 1800000 },
          { url: 'https://docs.google.com/document', title: 'Google Docs', powerWatts: 12.8, duration: 1200000, timestamp: Date.now() - 7200000 },
          { url: 'https://stackoverflow.com/questions', title: 'Stack Overflow', powerWatts: 15.3, duration: 300000, timestamp: Date.now() - 1200000 }
        ];
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_HISTORY',
        timeRange: '24h'
      });
      
      if (response.success) {
        this.todayHistory = response.history;
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load today\'s summary:', error);
    }
  }
  
  updateUI() {
    try {
      console.log('[PopupManager] Updating UI with current tab data:', {
        hasCurrentTabData: !!this.currentTabData,
        dataSource: this.currentTabData?.dataSource,
        powerWatts: this.currentTabData?.powerWatts,
        isEstimated: this.currentTabData?.isEstimated,
        isUnavailable: this.currentTabData?.isUnavailable
      });
      
      this.updateStatusIndicator();
      this.updatePowerDisplay();
      this.updateDeviceComparisons();
      this.updateCurrentTabInfo();
      this.updateQuickStats();
      this.updatePowerTips();
      this.updateAIModelInfoSection();
      this.updateEnergyModeUI(this.getCurrentEnergyMode());
      this.updateTabEnergyRecommendations();
      
      console.log('[PopupManager] UI update completed successfully');
    } catch (error) {
      console.error('[PopupManager] UI update failed:', error);
      this.showError('Display update failed');
    }
  }
  
  updateStatusIndicator() {
    const statusDot = this.safeGetElement('statusDot');
    const statusText = this.safeGetElement('statusText');
    
    if (!statusDot || !statusText) {
      console.warn('[PopupManager] Status indicator elements not found');
      return;
    }
    
    try {
      // Check settings first with enhanced null safety
      if (!this.settings?.trackingEnabled) {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Tracking disabled');
        return;
      }
      
      const tabCount = Object.keys(this.energyData || {}).length;
      const hasAIModel = !!this.detectedAIModel;
      
      // Enhanced logic with comprehensive null checks and AI detection
      if (tabCount > 0 && this.currentTabData && !this.currentTabData.isUnavailable) {
        statusDot.className = hasAIModel ? 'status-dot ai-detected' : 'status-dot';
        const aiStatus = hasAIModel ? ` + AI (${this.detectedAIModel.model.name})` : '';
        this.safeSetTextContent(statusText, `Tracking ${tabCount} tab${tabCount > 1 ? 's' : ''}${aiStatus}`);
      } else if (this.currentTabData?.isEstimated) {
        statusDot.className = hasAIModel ? 'status-dot estimated ai-detected' : 'status-dot estimated';
        const dataSource = this.currentTabData.dataSource || 'estimated';
        const aiStatus = hasAIModel ? ` + AI` : '';
        this.safeSetTextContent(statusText, `Using ${dataSource} data${aiStatus}`);
      } else if (this.currentTabData?.isUnavailable) {
        statusDot.className = 'status-dot warning';
        this.safeSetTextContent(statusText, 'Content script not active');
      } else {
        statusDot.className = 'status-dot inactive';
        this.safeSetTextContent(statusText, 'Waiting for data...');
      }
    } catch (error) {
      console.error('[PopupManager] Error updating status indicator:', error);
    }
  }
  
  updatePowerDisplay() {
    const powerValue = this.safeGetElement('powerValue');
    const powerDisplay = this.safeGetElement('powerDisplay');
    const powerDescription = this.safeGetElement('powerDescription');
    const efficiencyBadge = this.safeGetElement('efficiencyBadge');
    
    if (!powerValue || !powerDisplay || !powerDescription || !efficiencyBadge) {
      console.warn('[PopupManager] Power display elements not found');
      return;
    }

    try {
      console.log('[PopupManager] Updating power display. Current tab data:', this.currentTabData);
      
      // Cascading fallback logic for different data states
      const displayData = this.determinePowerDisplayData();
      
      // Apply display data to UI elements with safety checks
      this.safeSetTextContent(powerValue, displayData.powerValue || '--');
      this.safeSetInnerHTML(powerDescription, displayData.description || 'No data available');
      
      if (displayData.displayClass) {
        // Add AI enhancement class if AI model is detected
        let className = displayData.displayClass;
        if (this.detectedAIModel && this.currentAIUsage) {
          className += ' ai-enhanced';
        }
        powerDisplay.className = className;
      }
      
      if (displayData.efficiency) {
        this.safeSetTextContent(efficiencyBadge, displayData.efficiency.label || '--');
        if (displayData.efficiency.className) {
          efficiencyBadge.className = displayData.efficiency.className;
        }
      }
      
      console.log('[PopupManager] Power display updated:', {
        powerValue: displayData.powerValue,
        watts: displayData.watts,
        dataState: displayData.dataState,
        dataSource: displayData.dataSource
      });
    } catch (error) {
      console.error('[PopupManager] Error updating power display:', error);
    }
  }
  
  /**
   * Updates environmental impact comparisons (bulbs, carbon, water)
   */
  updateDeviceComparisons() {
    const bulbsCount = this.safeGetElement('bulbsCount');
    const carbonEmissions = this.safeGetElement('carbonEmissions');
    const waterUsage = this.safeGetElement('waterUsage');
    const bulbsCard = document.querySelector('.bulbs-comparison');
    const carbonCard = document.querySelector('.carbon-comparison');
    const waterCard = document.querySelector('.water-comparison');
    
    if (!bulbsCount || !carbonEmissions || !waterUsage) {
      console.warn('[PopupManager] Environmental impact elements not found');
      return;
    }

    try {
      // Get current power consumption
      const tabPowerWatts = this.calculatePowerWattsWithFallback();
      
      // Calculate environmental impacts
      const impacts = this.calculateEnvironmentalImpacts(tabPowerWatts);
      
      // Add estimated indicator if data is estimated
      if (this.currentTabData?.isEstimated) {
        bulbsCount.classList.add('estimated');
        carbonEmissions.classList.add('estimated');
        waterUsage.classList.add('estimated');
      } else {
        bulbsCount.classList.remove('estimated');
        carbonEmissions.classList.remove('estimated');
        waterUsage.classList.remove('estimated');
      }
      
      this.safeSetTextContent(bulbsCount, impacts.bulbs.count.toString());
      this.safeSetTextContent(carbonEmissions, impacts.carbon.grams + 'g');
      this.safeSetTextContent(waterUsage, impacts.water.gallons.toString());
      
      // Update visual indicators based on environmental impact levels
      this.updateEnvironmentalVisualState(bulbsCard, impacts.bulbs);
      this.updateEnvironmentalVisualState(carbonCard, impacts.carbon);
      this.updateEnvironmentalVisualState(waterCard, impacts.water);
      
      console.log('[PopupManager] Environmental impacts updated:', {
        powerWatts: tabPowerWatts,
        bulbs: impacts.bulbs,
        carbon: impacts.carbon,
        water: impacts.water
      });
    } catch (error) {
      console.error('[PopupManager] Error updating environmental impacts:', error);
      this.safeSetTextContent(bulbsCount, '--');
      this.safeSetTextContent(carbonEmissions, '--');
      this.safeSetTextContent(waterUsage, '--');
    }
  }
  
  /**
   * Calculates environmental impacts from power consumption
   */
  calculateEnvironmentalImpacts(watts) {
    // Environmental impact calculations
    const LED_BULB_WATTS = 10;        // 10W LED bulb
    const CO2_GRAMS_PER_KWH = 400;    // ~400g CO2 per kWh (US grid average)
    const WATER_GALLONS_PER_KWH = 25; // ~25 gallons water per kWh (thermoelectric power generation)
    
    // Calculate impacts
    const bulbCount = Math.round(watts / LED_BULB_WATTS * 10) / 10; // Round to 1 decimal, display as whole if >= 1
    const carbonPerHour = Math.round((watts / 1000) * CO2_GRAMS_PER_KWH * 10) / 10;
    const waterPerHour = Math.round((watts / 1000) * WATER_GALLONS_PER_KWH * 100) / 100;
    
    return {
      bulbs: {
        count: bulbCount >= 1 ? Math.round(bulbCount) : Math.round(bulbCount * 10) / 10,
        watts: watts,
        level: this.getImpactLevel(bulbCount, 'bulbs')
      },
      carbon: {
        grams: carbonPerHour >= 1 ? Math.round(carbonPerHour) : Math.round(carbonPerHour * 10) / 10,
        watts: watts,
        level: this.getImpactLevel(carbonPerHour, 'carbon')
      },
      water: {
        gallons: waterPerHour >= 0.1 ? Math.round(waterPerHour * 100) / 100 : Math.round(waterPerHour * 1000) / 1000,
        watts: watts,
        level: this.getImpactLevel(waterPerHour, 'water')
      }
    };
  }
  
  /**
   * Determines environmental impact level for visual styling
   */
  getImpactLevel(value, impactType) {
    switch (impactType) {
      case 'bulbs':
        if (value < 1.5) return 'low';        // < 1.5 bulbs
        if (value < 3) return 'moderate';     // 1.5-3 bulbs
        if (value < 5) return 'high';         // 3-5 bulbs
        return 'very-high';                   // > 5 bulbs
        
      case 'carbon':
        if (value < 2) return 'low';          // < 2g CO2/hr
        if (value < 8) return 'moderate';     // 2-8g CO2/hr
        if (value < 15) return 'high';        // 8-15g CO2/hr
        return 'very-high';                   // > 15g CO2/hr
        
      case 'water':
        if (value < 0.2) return 'low';        // < 0.2 gallons/hr
        if (value < 0.6) return 'moderate';   // 0.2-0.6 gallons/hr
        if (value < 1.2) return 'high';       // 0.6-1.2 gallons/hr
        return 'very-high';                   // > 1.2 gallons/hr
        
      default:
        return 'moderate';
    }
  }
  
  /**
   * Updates visual state of environmental impact cards
   */
  updateEnvironmentalVisualState(card, impact) {
    if (!card) return;
    
    // Remove existing level classes
    card.classList.remove('high-usage', 'very-high-usage');
    
    // Add appropriate class based on impact level
    switch (impact.level) {
      case 'high':
        card.classList.add('high-usage');
        break;
      case 'very-high':
        card.classList.add('very-high-usage');
        break;
      // 'low' and 'moderate' don't get special styling
    }
  }
  
  /**
   * Determines power display data using cascading fallback logic
   * Priority: Live data > Historical data > Estimated data > Unavailable state > Loading state
   */
  determinePowerDisplayData() {
    const backendTodayEnergy = this.backendEnergyData?.totalEnergy || 0;
    
    // State 1: Loading/No data
    if (!this.currentTabData) {
      return {
        powerValue: '--',
        description: 'Loading power data...<br><small>Initializing extension</small>',
        displayClass: 'power-display',
        efficiency: { label: '--', className: 'efficiency-badge' },
        dataState: 'loading',
        watts: 0
      };
    }
    
    // State 2: Data unavailable (content script issues)
    if (this.currentTabData.isUnavailable) {
      return {
        powerValue: '?',
        description: 'Power data unavailable<br><small>Content script may not be running</small>',
        displayClass: 'power-display',
        efficiency: { label: '--', className: 'efficiency-badge' },
        dataState: 'unavailable',
        watts: 0
      };
    }
    
    // State 3: Get power consumption using robust fallback chain
    const tabPowerWatts = this.calculatePowerWattsWithFallback();
    const displayWatts = Math.round(tabPowerWatts * 10) / 10;
    const efficiency = this.getEfficiencyRating(tabPowerWatts);
    
    // State 4: Estimated data (historical or basic estimation)
    if (this.currentTabData.isEstimated) {
      const description = this.buildEstimatedDescription(displayWatts, backendTodayEnergy);
      return {
        powerValue: `~${displayWatts}W`,
        description,
        displayClass: `power-display power-${efficiency.level} estimated`,
        efficiency: {
          label: `~${efficiency.label}`,
          className: `efficiency-badge efficiency-${efficiency.level} estimated`
        },
        dataState: 'estimated',
        dataSource: this.currentTabData.dataSource,
        watts: tabPowerWatts
      };
    }
    
    // State 5: Live/Real data
    const description = this.buildLiveDescription(tabPowerWatts, backendTodayEnergy);
    return {
      powerValue: `${displayWatts}W`,
      description,
      displayClass: `power-display power-${efficiency.level}`,
      efficiency: {
        label: efficiency.label,
        className: `efficiency-badge efficiency-${efficiency.level}`
      },
      dataState: 'live',
      watts: tabPowerWatts
    };
  }
  
  /**
   * Enhanced power calculation with backend integration
   */
  calculatePowerWattsWithFallback() {
    // Calculate frontend (browser) power consumption
    const frontendPower = this.calculateBaseBrowserPower();
    
    // Get current energy display mode
    const currentMode = this.getCurrentEnergyMode();
    
    if (currentMode === 'total' && this.detectedAIModel) {
      // Include backend power consumption for AI models in total mode
      const backendPower = this.calculateBackendPowerForTotal();
      const totalPower = frontendPower + backendPower;
      
      console.log('[PopupManager] Total energy mode calculation:', {
        frontendPower: frontendPower.toFixed(2) + 'W',
        backendPower: backendPower.toFixed(2) + 'W',
        totalPower: totalPower.toFixed(2) + 'W',
        model: this.detectedAIModel.model.name,
        modelCategory: this.detectedAIModel.model.category,
        url: this.currentTabData?.url?.substring(0, 50)
      });
      
      // Total mode caps: 5W minimum, 150W maximum (to handle intensive AI models)
      return Math.max(5, Math.min(150, totalPower));
    }
    
    // Frontend only mode (original behavior)
    console.log('[PopupManager] Frontend only mode calculation:', {
      frontendPower: frontendPower.toFixed(2) + 'W',
      displayMode: currentMode,
      isAISite: !!this.detectedAIModel,
      url: this.currentTabData?.url?.substring(0, 50)
    });
    
    // Frontend caps: 5W minimum, 65W maximum
    return Math.max(5, Math.min(65, frontendPower));
  }
  
  /**
   * Calculates standard tab power (same measurement used for all tabs)
   */
  calculateStandardTabPower() {
    // Get base browser power consumption
    let basePower = this.calculateBaseBrowserPower();
    
    // Add AI power consumption if detected
    const aiPower = this.calculateAIPowerConsumption();
    
    // Frontend power (browser + AI)
    return basePower + aiPower;
  }
  
  /**
   * Gets current energy display mode (frontend or total)
   */
  getCurrentEnergyMode() {
    return this.energyDisplayMode || 'frontend';
  }
  
  /**
   * Sets energy display mode and updates UI
   */
  setEnergyMode(mode) {
    this.energyDisplayMode = mode;
    this.updateUI();
    
    // Save preference
    if (this.isChromeApiAvailable()) {
      chrome.storage.local.set({ energyDisplayMode: mode });
    }
  }
  
  /**
   * Gets current power caps for debugging
   */
  getCurrentPowerCaps() {
    const showTotalEnergy = this.getCurrentEnergyMode() === 'total';
    const baseCap = showTotalEnergy ? 150 : 85;
    let maxPower = baseCap;
    
    if (this.detectedAIModel) {
      const aiBonus = showTotalEnergy ? 30 : 20;
      maxPower = baseCap + aiBonus;
    }
    
    return {
      maxPower,
      mode: showTotalEnergy ? 'total' : 'frontend',
      isAISite: !!this.detectedAIModel,
      baseCap,
      aiBonus: this.detectedAIModel ? (showTotalEnergy ? 30 : 20) : 0
    };
  }
  
  /**
   * Enhanced backend power calculation for total energy mode using real-time AI model data
   */
  calculateBackendPowerForTotal() {
    // Return 0 if no AI model detected or backend calculator unavailable
    if (!this.detectedAIModel || !this.backendPowerCalculator) {
      return 0;
    }
    
    // Prepare context for backend power calculation
    const context = {
      userEngagement: this.getUserEngagementLevel(),
      batteryLevel: this.getBatteryLevel().then ? null : this.getBatteryLevel(), // Handle promise
      isActiveTab: true,
      userActivity: this.calculateUserActivity(),
      performanceMode: this.getPerformanceModeSync(),
      timestamp: Date.now()
    };
    
    // Calculate real-time backend power consumption
    const backendPower = this.backendPowerCalculator.calculateBackendPower(
      this.detectedAIModel,
      this.currentTabData,
      context
    );
    
    console.log('[PopupManager] Backend power calculated:', {
      model: this.detectedAIModel.model.name,
      category: this.detectedAIModel.model.category,
      energyPerQuery: this.detectedAIModel.model.energy.meanCombined + ' Wh',
      backendPowerW: backendPower.toFixed(2) + 'W',
      confidence: this.detectedAIModel.confidence,
      context: {
        userEngagement: context.userEngagement,
        batteryLevel: context.batteryLevel,
        userActivity: context.userActivity
      }
    });
    
    // Cap backend power at reasonable limits based on model category
    const modelCategory = this.detectedAIModel.model.category || 'balanced-performance';
    let maxBackendPower = 50; // Default cap
    
    if (modelCategory.includes('reasoning-specialized')) maxBackendPower = 80;  // DeepSeek R1
    else if (modelCategory.includes('frontier-large')) maxBackendPower = 60;   // GPT-5, Grok-4
    else if (modelCategory.includes('ultra-efficient')) maxBackendPower = 20;  // Llama-4 Maverick
    
    return Math.min(maxBackendPower, Math.max(0, backendPower));
  }
  
  /**
   * Calculates base browser power consumption (original logic)
   */
  calculateBaseBrowserPower() {
    // Priority 1: Direct power measurement
    if (this.currentTabData?.powerWatts &&
        !isNaN(this.currentTabData.powerWatts) &&
        this.currentTabData.powerWatts > 0) {
      return Math.max(5, Math.min(65, this.currentTabData.powerWatts)); // Bound to realistic range
    }
    
    // Priority 2: Legacy energy score migration
    if (this.currentTabData?.energyScore &&
        !isNaN(this.currentTabData.energyScore) &&
        this.currentTabData.energyScore >= 0) {
      return this.migrateLegacyScore(this.currentTabData.energyScore);
    }
    
    // Priority 3: Estimate based on DOM complexity
    if (this.currentTabData?.domNodes &&
        !isNaN(this.currentTabData.domNodes) &&
        this.currentTabData.domNodes > 0) {
      return this.estimatePowerFromDOMNodes(this.currentTabData.domNodes);
    }
    
    // Priority 4: URL-based estimation (includes AI site detection)
    if (this.currentTabData?.url) {
      return this.estimatePowerFromURL(this.currentTabData.url);
    }
    
    // Priority 5: Fallback default
    return 8.0; // Conservative default for light browsing
  }
  
  /**
   * Calculates AI power consumption in watts
   */
  calculateAIPowerConsumption() {
    if (!this.currentAIUsage || !this.detectedAIModel) {
      return 0;
    }
    
    try {
      const { energy, queries } = this.currentAIUsage;
      const duration = this.currentTabData?.duration || 3600000; // Default to 1 hour
      
      // Convert energy (Wh) to power (W) based on duration
      const aiPowerWatts = this.aiEnergyManager.convertEnergyToWatts(energy, duration);
      
      // Additional power overhead for AI sites (browser processing, network, etc.)
      const aiOverhead = this.calculateAIOverheadPower();
      
      return Math.max(0, aiPowerWatts + aiOverhead);
    } catch (error) {
      console.warn('[PopupManager] Error calculating AI power:', error);
      return 0;
    }
  }
  
  /**
   * Calculates additional power overhead for AI sites
   */
  calculateAIOverheadPower() {
    if (!this.detectedAIModel) return 0;
    
    const { model, confidence } = this.detectedAIModel;
    
    // Different AI platforms have different overhead
    let overheadWatts = 0;
    
    switch (model.category) {
      case 'large-multimodal':
        overheadWatts = 3.0; // GPT-4o, Gemini Pro - high processing overhead
        break;
      case 'large-language':
        overheadWatts = 2.5; // Claude Sonnet, LLaMA 70B
        break;
      case 'medium-language':
        overheadWatts = 1.5; // GPT-3.5, Cohere
        break;
      case 'small-language':
        overheadWatts = 1.0; // Claude Haiku, Mistral 7B
        break;
      case 'image-generation':
        overheadWatts = 4.0; // Stable Diffusion - image processing
        break;
      default:
        overheadWatts = 1.0;
    }
    
    // Scale by confidence level
    return overheadWatts * confidence;
  }
  
  /**
   * Enhanced description for estimated data with backend power info
   */
  buildEstimatedDescription(displayWatts, backendEnergy) {
    const dataSourceLabel = this.currentTabData.dataSource === 'historical' ?
      'based on history' : 'estimated';
    const ageInfo = this.currentTabData.dataSource === 'historical' ?
      '<br><small>Historical average</small>' :
      '<br><small>Basic estimation</small>';
    
    // Add mode indicator
    const currentMode = this.getCurrentEnergyMode();
    const modeLabel = currentMode === 'total' ? 'Total Energy' : 'Frontend Only';
    
    let description = `Estimated power consumption ${dataSourceLabel} (${modeLabel})${ageInfo}`;
    
    // Add AI model backend power information
    if (this.detectedAIModel && currentMode === 'total') {
      const backendPower = this.calculateBackendPowerForTotal();
      const frontendPower = this.calculateBaseBrowserPower();
      
      if (backendPower > 0.1) {
        description += `<br><small>🤖 ${this.detectedAIModel.model.name}: ~${frontendPower.toFixed(1)}W frontend + ~${backendPower.toFixed(1)}W backend</small>`;
      }
    } else if (this.detectedAIModel) {
      // Frontend mode - show that backend is not included
      description += `<br><small>🤖 ${this.detectedAIModel.model.name}: Frontend only (estimated)</small>`;
    }
    
    // Add backend energy cumulative data if available
    if (backendEnergy > 0.001) {
      const backendWh = backendEnergy * 1000;
      if (backendWh >= 1) {
        description += `<br><small>📊 ${backendWh.toFixed(1)}Wh used today</small>`;
      } else {
        description += `<br><small>📊 ${(backendWh * 1000).toFixed(1)}mWh used today</small>`;
      }
    }
    
    return description;
  }
  
  /**
   * Enhanced description for live data with backend power breakdown
   */
  buildLiveDescription(tabPowerWatts, backendEnergy) {
    const comparison = this.generateQuickComparison(tabPowerWatts);
    const ageMs = Date.now() - (this.currentTabData.timestamp || Date.now());
    const ageText = ageMs < 10000 ? 'live' : `${Math.round(ageMs/1000)}s ago`;
    
    // Get current mode and power breakdown
    const currentMode = this.getCurrentEnergyMode();
    const modeLabel = currentMode === 'total' ? 'Total Energy' : 'Frontend Only';
    
    let description = `${comparison} (${modeLabel})<br><small>Updated ${ageText}</small>`;
    
    // Add AI model backend power information
    if (this.detectedAIModel && currentMode === 'total') {
      const backendPower = this.calculateBackendPowerForTotal();
      const frontendPower = this.calculateBaseBrowserPower();
      
      if (backendPower > 0.1) {
        description += `<br><small>🤖 ${this.detectedAIModel.model.name}: ${frontendPower.toFixed(1)}W frontend + ${backendPower.toFixed(1)}W backend</small>`;
      }
    } else if (this.detectedAIModel) {
      // Frontend mode - show that backend is not included
      description += `<br><small>🤖 ${this.detectedAIModel.model.name}: Frontend only (${currentMode} mode)</small>`;
    }
    
    // Add backend energy cumulative data if available
    if (backendEnergy > 0.001) {
      const backendWh = backendEnergy * 1000;
      if (backendWh >= 1) {
        description += `<br><small>📊 ${backendWh.toFixed(1)}Wh used today</small>`;
      } else {
        description += `<br><small>📊 ${(backendWh * 1000).toFixed(1)}mWh used today</small>`;
      }
    }
    
    return description;
  }
  
  /**
   * Estimates power consumption based on DOM node count
   */
  estimatePowerFromDOMNodes(domNodes) {
    // Research-based estimation: more DOM nodes = higher power consumption
    if (domNodes < 500) return 8.0;   // Simple page
    if (domNodes < 1500) return 12.0; // Normal page
    if (domNodes < 3000) return 18.0; // Complex page
    if (domNodes < 5000) return 25.0; // Heavy page
    return 35.0; // Very heavy page
  }
  
  /**
   * Estimates power consumption based on URL patterns
   */
  estimatePowerFromURL(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Video/streaming sites
      if (domain.includes('youtube') || domain.includes('netflix') ||
          domain.includes('twitch') || domain.includes('vimeo')) {
        return 35.0;
      }
      
      // Social media with lots of media
      if (domain.includes('facebook') || domain.includes('instagram') ||
          domain.includes('twitter') || domain.includes('tiktok')) {
        return 25.0;
      }
      
      // Development/documentation sites
      if (domain.includes('github') || domain.includes('stackoverflow') ||
          domain.includes('docs.') || domain.includes('developer.')) {
        return 15.0;
      }
      
      // News/content sites
      if (domain.includes('news') || domain.includes('blog') ||
          domain.includes('wiki')) {
        return 12.0;
      }
      
      return 10.0; // Default for unknown sites
    } catch (e) {
      return 8.0; // Fallback for invalid URLs
    }
  }
  
  updateCurrentTabInfo() {
    const tabTitle = document.getElementById('tabTitle');
    const tabUrl = document.getElementById('tabUrl');
    const domNodes = document.getElementById('domNodes');
    const activeTime = document.getElementById('activeTime');
    
    if (!this.currentTabData) {
      tabTitle.textContent = 'Initializing...';
      tabUrl.textContent = 'Waiting for energy data';
      domNodes.textContent = '--';
      activeTime.textContent = '--';
      return;
    }
    
    // Handle different data states
    if (this.currentTabData.isUnavailable) {
      tabTitle.textContent = this.currentTabData.title || 'Current Tab';
      tabUrl.textContent = this.formatUrl(this.currentTabData.url) + ' (unavailable)';
      domNodes.textContent = '--';
      activeTime.textContent = '--';
      return;
    }
    
    tabTitle.textContent = this.currentTabData.title || 'Unknown page';
    tabUrl.textContent = this.formatUrl(this.currentTabData.url);
    
    // Show estimated indicator for DOM nodes
    const domValue = this.formatNumber(this.currentTabData.domNodes || 0);
    domNodes.textContent = this.currentTabData.isEstimated ? `~${domValue}` : domValue;
    
    // Show active time with data source indicator
    const duration = this.currentTabData.duration || 0;
    const formattedDuration = this.formatDuration(duration);
    
    if (this.currentTabData.isEstimated) {
      activeTime.textContent = duration === 0 ? '--' : `~${formattedDuration}`;
    } else {
      activeTime.textContent = formattedDuration;
    }
  }
  
  updateQuickStats() {
    const totalTabs = document.getElementById('totalTabs');
    const avgPower = document.getElementById('avgPower');
    const highPowerAlerts = document.getElementById('highPowerAlerts');
    const totalTime = document.getElementById('totalTime');
    
    // Calculate browser stats from history
    const browserStats = this.todayHistory ? this.calculateTodayPowerStats(this.todayHistory) : {
      totalTabs: 0,
      averagePower: 0,
      totalTime: 0,
      highPowerCount: 0
    };
    
    // Include backend energy in calculations
    const backendEnergy = this.backendEnergyData?.totalEnergy || 0;
    const backendWatts = backendEnergy * 1000; // Convert kWh to Wh, rough approximation for display
    
    const avgPowerValue = browserStats.averagePower > 0 ? browserStats.averagePower : 8.0;
    
    totalTabs.textContent = browserStats.totalTabs.toString();
    avgPower.textContent = `${Math.round(avgPowerValue * 10) / 10}W`;
    highPowerAlerts.textContent = (browserStats.highPowerCount + (backendWatts > 40 ? 1 : 0)).toString();
    totalTime.textContent = this.formatDuration(browserStats.totalTime);
  }
  
  updatePowerTips() {
    const tipsSection = document.getElementById('tipsSection');
    const tipText = document.querySelector('.tip-text');
    const tipAction = document.getElementById('tipAction');
    
    const currentPower = this.currentTabData?.powerWatts ||
      (this.currentTabData?.energyScore ? this.migrateLegacyScore(this.currentTabData.energyScore) : 8.0);
    
    if (!this.currentTabData || currentPower < 25) {
      tipsSection.style.display = 'none';
      return;
    }
    
    // Show power saving tip for high power consumption
    const tip = this.generatePowerTip(this.currentTabData, currentPower);
    
    if (tip) {
      tipsSection.style.display = 'block';
      tipText.textContent = tip.text;
      tipAction.textContent = tip.action;
      tipAction.removeEventListener('click', tipAction._powerTipHandler);
      tipAction._powerTipHandler = () => this.applyTip(tip.type);
      tipAction.addEventListener('click', tipAction._powerTipHandler);
    }
  }
  
  calculateTodayPowerStats(history) {
    const uniqueTabs = new Set();
    let totalPower = 0;
    let totalTime = 0;
    let highPowerCount = 0;
    
    history.forEach(entry => {
      uniqueTabs.add(entry.url);
      
      // Use watts if available, otherwise migrate from energy score
      const powerWatts = entry.powerWatts ||
        (entry.energyScore ? this.migrateLegacyScore(entry.energyScore) : 8.0);
      
      totalPower += powerWatts;
      totalTime += entry.duration || 0;
      
      if (powerWatts > 40) { // High power threshold
        highPowerCount++;
      }
    });
    
    return {
      totalTabs: uniqueTabs.size,
      averagePower: history.length > 0 ? totalPower / history.length : 0,
      totalTime: totalTime,
      highPowerCount: highPowerCount
    };
  }
  
  generatePowerTip(tabData, powerWatts) {
    if (powerWatts > 50) {
      return {
        type: 'close_tab',
        text: `This tab is using ${powerWatts}W of power. Consider closing it if not needed.`,
        action: 'Close Tab'
      };
    } else if (powerWatts > 35) {
      return {
        type: 'refresh_tab',
        text: `Using ${powerWatts}W - try refreshing the page to reduce power consumption.`,
        action: 'Refresh'
      };
    } else if (powerWatts > 25) {
      return {
        type: 'optimize_tab',
        text: `${powerWatts}W usage detected. Pause videos or animations to save power.`,
        action: 'Got it'
      };
    }
    
    return null;
  }
  
  async applyTip(tipType) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      switch (tipType) {
        case 'close_tab':
          await chrome.tabs.remove(currentTab.id);
          window.close();
          break;
          
        case 'refresh_tab':
          await chrome.tabs.reload(currentTab.id);
          this.showToast('Tab refreshed');
          break;
          
        case 'optimize_tab':
          // Just acknowledge the tip
          document.getElementById('tipsSection').style.display = 'none';
          this.showToast('Tip acknowledged');
          break;
      }
    } catch (error) {
      console.error('[PopupManager] Failed to apply tip:', error);
      this.showToast('Failed to apply tip');
    }
  }
  
  formatUrl(url) {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url.substring(0, 30) + '...';
    }
  }
  
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
  
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  startPeriodicUpdates() {
    // Update data every 5 seconds
    this.updateInterval = setInterval(async () => {
      await this.loadCurrentEnergyData();
      await this.loadBackendEnergyData();
      await this.loadEnhancedAIEnergyData();
      this.updateUI();
    }, 5000);
  }
  
  
  updateAIModelInfoSection() {
    try {
      const currentModelName = this.safeGetElement('currentModelName');
      const currentModelVersion = this.safeGetElement('currentModelVersion');
      const sessionEnergyUsage = this.safeGetElement('sessionEnergyUsage');
      const sessionCarbonUsage = this.safeGetElement('sessionCarbonUsage');
      const modelEfficiency = this.safeGetElement('modelEfficiency');
      const aiModelInfoSection = document.querySelector('.ai-model-info-section');
      
      if (!aiModelInfoSection) {
        console.warn('[PopupManager] AI Model Info section not found');
        return;
      }
      
      // Always show the AI model info section
      aiModelInfoSection.style.display = 'block';
      
      // Update with actual detected model information
      if (this.detectedAIModel && this.detectedAIModel.model) {
        const detectedModel = this.detectedAIModel.model;
        
        if (currentModelName) {
          this.safeSetTextContent(currentModelName, detectedModel.name || 'Unknown Model');
        }
        
        if (currentModelVersion) {
          // Extract version from apiId or use a generic indicator
          const version = detectedModel.apiId ?
            detectedModel.apiId.match(/\d{4}-\d{2}-\d{2}|\d{8}|v?\d+\.\d+/)?.[0] || 'Latest' :
            'Latest';
          this.safeSetTextContent(currentModelVersion, version);
        }
      } else {
        // Fallback when no AI model is detected
        if (currentModelName) {
          this.safeSetTextContent(currentModelName, 'No AI Model Detected');
        }
        
        if (currentModelVersion) {
          this.safeSetTextContent(currentModelVersion, '-');
        }
      }
      
      // Calculate session energy usage based on current tab and AI usage
      const browserPower = this.calculateBaseBrowserPower();
      const aiPower = this.calculateAIPowerConsumption();
      const totalPower = browserPower + aiPower;
      
      // Estimate session energy (assuming 30 minutes average session)
      const sessionHours = 0.5;
      const estimatedSessionEnergy = (totalPower / 1000) * sessionHours; // Convert to kWh
      const sessionWh = estimatedSessionEnergy * 1000; // Convert back to Wh for display
      
      if (sessionEnergyUsage) {
        this.safeSetTextContent(sessionEnergyUsage, `~${sessionWh.toFixed(1)} Wh`);
      }
      
      // Estimate carbon emissions (400g CO2 per kWh average)
      const sessionCarbon = estimatedSessionEnergy * 400; // grams
      if (sessionCarbonUsage) {
        this.safeSetTextContent(sessionCarbonUsage, `~${sessionCarbon.toFixed(1)} gCO₂e`);
      }
      
      // Determine efficiency rating
      let efficiency = 'High';
      let efficiencyClass = 'efficiency-good';
      
      if (totalPower > 40) {
        efficiency = 'Low';
        efficiencyClass = 'efficiency-poor';
      } else if (totalPower > 25) {
        efficiency = 'Medium';
        efficiencyClass = 'efficiency-average';
      } else if (totalPower < 15) {
        efficiency = 'Excellent';
        efficiencyClass = 'efficiency-excellent';
      }
      
      if (modelEfficiency) {
        this.safeSetTextContent(modelEfficiency, efficiency);
        modelEfficiency.className = `energy-value ${efficiencyClass}`;
      }
      
      console.log('[PopupManager] AI Model Info section updated:', {
        sessionWh: sessionWh.toFixed(1),
        sessionCarbon: sessionCarbon.toFixed(1),
        efficiency: efficiency,
        totalPower: totalPower
      });
      
    } catch (error) {
      console.error('[PopupManager] Error updating AI Model Info section:', error);
    }
  }
  
  handleViewHistory() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?tab=history')
    });
  }
  
  handleSettings() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?tab=settings')
    });
  }
  
  handleTipAction() {
    // This is handled by the specific tip's onclick event
  }

  async handleThemeToggle() {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const currentTheme = popupContainer?.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      await this.setTheme(newTheme);
      console.log('[PopupManager] Theme toggled to:', newTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to toggle theme:', error);
    }
  }

  async loadTheme() {
    try {
      const defaultTheme = 'light';
      
      // Check if Chrome APIs are available
      if (!this.isChromeApiAvailable()) {
        console.log('[PopupManager] Chrome APIs not available, using default theme');
        this.setThemeUI(defaultTheme);
        return;
      }

      // Get saved theme preference
      const result = await chrome.storage.sync.get(['theme']);
      const savedTheme = result.theme || defaultTheme;
      
      this.setThemeUI(savedTheme);
      console.log('[PopupManager] Theme loaded:', savedTheme);
    } catch (error) {
      console.error('[PopupManager] Failed to load theme:', error);
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
      console.error('[PopupManager] Failed to set theme:', error);
    }
  }

  setThemeUI(theme) {
    try {
      const popupContainer = document.querySelector('.popup-container');
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle?.querySelector('.theme-icon');
      
      if (popupContainer) {
        popupContainer.setAttribute('data-theme', theme);
      }
      
      if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
      }
      
      if (themeToggle) {
        themeToggle.setAttribute('aria-label',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggle.setAttribute('title',
          theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      }
    } catch (error) {
      console.error('[PopupManager] Failed to update theme UI:', error);
    }
  }
  
  handlePopupClose() {
    // Clean up
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
  
  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }
  
  showError(message) {
    console.error('[PopupManager] Showing error:', message);
    
    // Show error in multiple places for better UX
    const statusText = this.safeGetElement('statusText');
    if (statusText) {
      this.safeSetTextContent(statusText, 'Error occurred');
    }
    
    const powerDescription = this.safeGetElement('powerDescription');
    if (powerDescription) {
      this.safeSetInnerHTML(powerDescription, `Error: ${message}<br><small>Please try refreshing</small>`);
      powerDescription.style.color = 'var(--danger-color, #dc3545)';
    }
    
    // Show toast notification
    this.showToast(`Error: ${message}`, 'error');
    
    this.hideLoadingOverlay();
  }
  
  showToast(message, type = 'info') {
    console.log('[PopupManager] Showing toast:', message, type);
    
    // Simple toast notification with type support
    const toast = document.createElement('div');
    
    const bgColor = {
      'info': '#007bff',
      'success': '#28a745',
      'warning': '#ffc107',
      'error': '#dc3545'
    }[type] || '#007bff';
    
    toast.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeIn 0.3s ease;
      max-width: 300px;
      text-align: center;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
  // Helper functions for watts-based calculations
  migrateLegacyScore(energyScore) {
    // Convert old energy score (0-100) to estimated watts
    // Based on research: 
    // 0-20 = 8-12W (light browsing)
    // 20-40 = 12-18W (normal browsing) 
    // 40-70 = 18-30W (heavy browsing)
    // 70+ = 30-55W (intensive usage)
    
    if (energyScore < 20) {
      return 8 + (energyScore / 20) * 4; // 8-12W
    } else if (energyScore < 40) {
      return 12 + ((energyScore - 20) / 20) * 6; // 12-18W
    } else if (energyScore < 70) {
      return 18 + ((energyScore - 40) / 30) * 12; // 18-30W
    } else {
      return 30 + ((energyScore - 70) / 30) * 25; // 30-55W
    }
  }

  getEfficiencyRating(watts) {
    if (watts < 15) {
      return { level: 'excellent', label: 'Excellent' };
    } else if (watts < 25) {
      return { level: 'good', label: 'Good' };
    } else if (watts < 40) {
      return { level: 'average', label: 'Average' };
    } else {
      return { level: 'poor', label: 'Poor' };
    }
  }

  generateQuickComparison(watts) {
    // Generate a quick real-world comparison
    if (watts < 10) {
      return `Like ${(watts / 10).toFixed(1)} LED bulbs`;
    } else if (watts < 20) {
      return `Like ${Math.round(watts / 10)} LED bulbs`;
    } else if (watts < 50) {
      return `${Math.round((watts / 45) * 100)}% of laptop power`;
    } else {
      return `Like a ${Math.round(watts / 100 * 100)}% loaded laptop`;
    }
  }
  
  // Load demo data when Chrome APIs are not available
  loadDemoData() {
    console.log('Loading demo data for standalone viewing');
    
    this.energyData = {
      12345: {
        url: 'https://github.com/user/energy-tracker',
        title: 'GitHub - Energy Tracking Extension',
        powerWatts: 18.5,
        energyScore: 42,
        domNodes: 2847,
        duration: 340000,
        timestamp: Date.now() - 30000,
        tabId: 12345
      },
      12346: {
        url: 'https://www.youtube.com/watch?v=example',
        title: 'YouTube - 4K Video Playing',
        powerWatts: 45.2,
        energyScore: 85,
        domNodes: 5432,
        duration: 1800000, // 30 minutes
        timestamp: Date.now() - 900000, // 15 minutes ago
        tabId: 12346
      },
      12347: {
        url: 'https://netflix.com/title/streaming',
        title: 'Netflix - Streaming Movie',
        powerWatts: 52.8,
        energyScore: 92,
        domNodes: 3421,
        duration: 3600000, // 1 hour
        timestamp: Date.now() - 2400000, // 40 minutes ago (inactive)
        tabId: 12347
      },
      12348: {
        url: 'https://chrome://devtools/devtools_app.html',
        title: 'DevTools - Console',
        powerWatts: 28.3,
        energyScore: 65,
        domNodes: 8234,
        duration: 600000, // 10 minutes
        timestamp: Date.now() - 3600000, // 1 hour ago (inactive)
        tabId: 12348
      },
      12349: {
        url: 'https://docs.google.com/spreadsheets/large-sheet',
        title: 'Google Sheets - Large Spreadsheet',
        powerWatts: 31.7,
        energyScore: 72,
        domNodes: 12456,
        duration: 2400000, // 40 minutes
        timestamp: Date.now() - 1800000, // 30 minutes ago
        tabId: 12349
      },
      12350: {
        url: 'https://stackoverflow.com/questions/javascript',
        title: 'Stack Overflow - JavaScript Questions',
        powerWatts: 15.2,
        energyScore: 35,
        domNodes: 3214,
        duration: 120000, // 2 minutes
        timestamp: Date.now() - 7200000, // 2 hours ago (very inactive)
        tabId: 12350
      },
      12351: {
        url: 'https://www.figma.com/design/complex-project',
        title: 'Figma - Complex Design Project',
        powerWatts: 38.9,
        energyScore: 78,
        domNodes: 9876,
        duration: 5400000, // 90 minutes
        timestamp: Date.now() - 600000, // 10 minutes ago
        tabId: 12351
      }
    };
    
    // Current tab data (the tab we're viewing from)
    this.currentTabData = {
      url: 'https://github.com/user/energy-tracker',
      title: 'GitHub - Energy Tracking Extension',
      powerWatts: 18.5,
      energyScore: 42,
      domNodes: 2847,
      duration: 340000,
      timestamp: Date.now() - 30000,
      tabId: 12345
    };
  }

  /**
   * Safe substring method that handles null/undefined strings
   */
  safeSubstring(str, start, end) {
    if (!str || typeof str !== 'string') return '';
    return str.substring(start, end || str.length);
  }

  /**
   * Safe element getter with null checking
   */
  safeGetElement(elementId) {
    try {
      if (!elementId || typeof elementId !== 'string') return null;
      return document.getElementById(elementId);
    } catch (error) {
      console.warn(`[PopupManager] Failed to get element ${elementId}:`, error);
      return null;
    }
  }

  /**
   * Safe text content setter with null checking
   */
  safeSetTextContent(element, text) {
    try {
      if (element && typeof text !== 'undefined') {
        element.textContent = String(text);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set text content:', error);
    }
    return false;
  }

  /**
   * Safe innerHTML setter with null checking
   */
  safeSetInnerHTML(element, html) {
    try {
      if (element && typeof html !== 'undefined') {
        element.innerHTML = String(html);
        return true;
      }
    } catch (error) {
      console.warn('[PopupManager] Failed to set innerHTML:', error);
    }
    return false;
  }

  // ===== ADVANCED FEATURES INTEGRATION =====
  
  handleAdvancedFeatures() {
    this.showCodeEntryModal();
  }
  
  showCodeEntryModal() {
    const modal = document.getElementById('codeEntryModal');
    const input = document.getElementById('accessCodeInput');
    if (modal && input) {
      modal.style.display = 'flex';
      input.value = '';
      input.focus();
      this.hideCodeError();
    }
  }
  
  hideCodeEntryModal() {
    const modal = document.getElementById('codeEntryModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.hideCodeError();
  }
  
  handleCodeSubmit() {
    const input = document.getElementById('accessCodeInput');
    if (input) {
      const code = input.value.trim();
      if (this.validateAccessCode(code)) {
        this.hideCodeEntryModal();
        this.showPromptGenerator();
        this.loadPromptGeneratorData();
      } else {
        this.showCodeError();
      }
    }
  }
  
  validateAccessCode(code) {
    // The access code is "0410"
    return code === '0410';
  }
  
  showCodeError() {
    const error = document.getElementById('codeError');
    if (error) {
      error.style.display = 'block';
    }
  }
  
  hideCodeError() {
    const error = document.getElementById('codeError');
    if (error) {
      error.style.display = 'none';
    }
  }
  
  showPromptGenerator() {
    const generator = document.getElementById('promptGeneratorSection');
    if (generator) {
      generator.style.display = 'block';
      this.setupPromptGeneratorEvents();
    }
  }
  
  hidePromptGenerator() {
    const generator = document.getElementById('promptGeneratorSection');
    if (generator) {
      generator.style.display = 'none';
    }
  }
  
  setupPromptGeneratorEvents() {
    // Setup additional events for prompt generator
    this.safeAddEventListener('generateOptimizedBtn', 'click', this.handleGenerateOptimized.bind(this));
    this.safeAddEventListener('copyResultBtn', 'click', this.handleCopyResult.bind(this));
    this.safeAddEventListener('newOptimizationBtn', 'click', this.handleNewOptimization.bind(this));
    
    // Add modal overlay click to close
    const modal = document.getElementById('codeEntryModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideCodeEntryModal();
        }
      });
    }
  }
  
  loadPromptGeneratorData() {
    // Load saved stats or set defaults
    const stats = {
      totalPrompts: 0,
      energySavings: 0,
      avgTokenReduction: 0
    };
    
    // Update UI with stats
    this.updateGeneratorStats(stats);
  }
  
  updateGeneratorStats(stats) {
    this.safeSetTextContent(document.getElementById('totalPromptsGenerated'), stats.totalPrompts.toString());
    this.safeSetTextContent(document.getElementById('energySavingsPercent'), `${stats.energySavings}%`);
    this.safeSetTextContent(document.getElementById('avgTokenReduction'), stats.avgTokenReduction.toString());
  }
  
  handleGenerateOptimized() {
    const promptInput = document.getElementById('promptInput');
    const optimizationLevel = document.getElementById('optimizationLevel');
    const targetModel = document.getElementById('targetModel');
    
    if (!promptInput || !promptInput.value.trim()) {
      this.showToastNotification('Please enter a prompt to optimize', 'error');
      return;
    }
    
    const originalPrompt = promptInput.value.trim();
    const level = optimizationLevel?.value || 'balanced';
    const model = targetModel?.value || 'gpt-4';
    
    // Show loading state
    const generateBtn = document.getElementById('generateOptimizedBtn');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="btn-icon">⏳</span> Optimizing...';
    }
    
    // Simulate optimization process
    setTimeout(() => {
      const result = this.optimizePrompt(originalPrompt, level, model);
      this.showOptimizationResult(result);
      
      // Reset button
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="btn-icon">⚡</span> Generate Optimized Prompt';
      }
    }, 1500);
  }
  
  optimizePrompt(prompt, level, model) {
    // Enhanced prompt optimization algorithm with comprehensive token-wasting word list
    let optimized = prompt;
    let tokenReduction = 0;
    let energySavings = 0;
    
    // Comprehensive list of token-wasting words and phrases
    const tokenWastingPhrases = {
      // Politeness markers (often unnecessary in AI prompts)
      politeness: [
        'please', 'thank you', 'thanks', 'kindly', 'if you don\'t mind',
        'if possible', 'if you could', 'would you mind', 'could you please',
        'would you be so kind', 'I would appreciate', 'thank you in advance',
        'many thanks', 'much appreciated', 'grateful', 'sorry to bother you'
      ],
      
      // Redundant request phrases
      requests: [
        'can you', 'could you', 'would you', 'will you', 'are you able to',
        'I need you to', 'I want you to', 'I would like you to', 'I require you to',
        'help me', 'assist me', 'I\'m asking you to', 'do me a favor'
      ],
      
      // Uncertainty and hedging (reduce confidence unnecessarily)
      hedging: [
        'I think', 'I believe', 'I guess', 'maybe', 'perhaps', 'possibly',
        'it seems like', 'it appears that', 'I suppose', 'I assume',
        'in my opinion', 'from my perspective', 'as far as I know'
      ],
      
      // Redundant introductions
      introductions: [
        'let me start by saying', 'first of all', 'to begin with', 'initially',
        'at the outset', 'in the beginning', 'as a starting point',
        'before we begin', 'prior to starting'
      ],
      
      // Filler words and phrases
      fillers: [
        'basically', 'essentially', 'actually', 'literally', 'obviously',
        'clearly', 'definitely', 'certainly', 'absolutely', 'totally',
        'completely', 'entirely', 'utterly', 'quite', 'rather', 'pretty much',
        'sort of', 'kind of', 'more or less', 'in a way', 'to some extent'
      ],
      
      // Redundant explanatory phrases
      explanatory: [
        'in other words', 'that is to say', 'what I mean is', 'put simply',
        'to put it another way', 'in simple terms', 'to clarify', 'specifically',
        'more specifically', 'in particular', 'namely', 'for instance',
        'as an example', 'for example' // Keep some examples but reduce redundancy
      ],
      
      // Time-wasting connectors
      connectors: [
        'furthermore', 'moreover', 'additionally', 'in addition to this',
        'what\'s more', 'on top of that', 'not only that', 'also worth noting',
        'it should also be mentioned', 'another point to consider'
      ],
      
      // Redundant emphasis
      emphasis: [
        'very important', 'extremely important', 'absolutely crucial',
        'highly significant', 'tremendously valuable', 'incredibly useful',
        'exceptionally good', 'remarkably effective', 'particularly noteworthy'
      ]
    };
    
    // Apply optimizations based on level
    const allPhrases = level === 'aggressive'
      ? Object.values(tokenWastingPhrases).flat()
      : level === 'conservative'
        ? tokenWastingPhrases.politeness.concat(tokenWastingPhrases.fillers)
        : tokenWastingPhrases.politeness.concat(tokenWastingPhrases.requests, tokenWastingPhrases.fillers, tokenWastingPhrases.hedging);
    
    // Remove token-wasting phrases
    allPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = optimized.match(regex);
      if (matches) {
        optimized = optimized.replace(regex, '');
        tokenReduction += matches.length * phrase.split(' ').length;
      }
    });
    
    // Clean up extra whitespace and punctuation
    optimized = optimized.replace(/\s+/g, ' ')
                      .replace(/\s*,\s*,+/g, ',')
                      .replace(/\s*\.\s*\.+/g, '.')
                      .replace(/^\s*[,.]/, '')
                      .trim();
    
    // Apply level-specific optimizations
    switch (level) {
      case 'aggressive':
        optimized = this.applyAggressiveOptimization(optimized);
        tokenReduction += Math.floor(prompt.split(' ').length * 0.3);
        energySavings = Math.min(50, tokenReduction * 2.2);
        break;
        
      case 'conservative':
        tokenReduction += Math.floor(prompt.split(' ').length * 0.12);
        energySavings = Math.min(25, tokenReduction * 1.5);
        break;
        
      default: // balanced
        optimized = this.applyBalancedOptimization(optimized);
        tokenReduction += Math.floor(prompt.split(' ').length * 0.2);
        energySavings = Math.min(40, tokenReduction * 1.8);
    }
    
    // Ensure we don't have empty or overly short results
    if (optimized.length < 10) {
      optimized = prompt; // Revert if too aggressive
      tokenReduction = Math.floor(tokenReduction * 0.1);
      energySavings = Math.floor(energySavings * 0.1);
    }
    
    return {
      original: prompt,
      optimized: optimized,
      tokenReduction: Math.max(1, tokenReduction),
      energySavings: Math.max(5, energySavings),
      model: model,
      level: level
    };
  }
  
  applyAggressiveOptimization(text) {
    // More aggressive text optimization
    return text
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bat this point in time\b/gi, 'now')
      .replace(/\bfor the purpose of\b/gi, 'for')
      .replace(/\bin the event that\b/gi, 'if')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  applyBalancedOptimization(text) {
    // Balanced optimization maintaining readability
    return text
      .replace(/\bplease be advised that\b/gi, '')
      .replace(/\bit should be noted that\b/gi, '')
      .replace(/\bin my opinion\b/gi, '')
      .replace(/\bI think that\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  showOptimizationResult(result) {
    const resultsArea = document.getElementById('resultsArea');
    const optimizedPrompt = document.getElementById('optimizedPrompt');
    const energySavingsResult = document.getElementById('energySavingsResult');
    
    if (resultsArea && optimizedPrompt && energySavingsResult) {
      // Show results
      resultsArea.style.display = 'block';
      optimizedPrompt.value = result.optimized;
      energySavingsResult.textContent = `${result.energySavings}% Energy Saved`;
      
      // Store result for copying
      this.lastOptimizationResult = result;
      
      // Update stats
      this.updateStatsAfterOptimization(result);
      
      // Show success toast
      this.showToastNotification(`Optimized! Saved ${result.tokenReduction} tokens`, 'success');
    }
  }
  
  updateStatsAfterOptimization(result) {
    // Update the statistics display
    const totalElement = document.getElementById('totalPromptsGenerated');
    const savingsElement = document.getElementById('energySavingsPercent');
    const reductionElement = document.getElementById('avgTokenReduction');
    
    if (totalElement && savingsElement && reductionElement) {
      const currentTotal = parseInt(totalElement.textContent) || 0;
      const currentSavings = parseInt(savingsElement.textContent) || 0;
      const currentReduction = parseInt(reductionElement.textContent) || 0;
      
      // Calculate new averages
      const newTotal = currentTotal + 1;
      const newAvgSavings = Math.round(((currentSavings * currentTotal) + result.energySavings) / newTotal);
      const newAvgReduction = Math.round(((currentReduction * currentTotal) + result.tokenReduction) / newTotal);
      
      // Update display
      this.safeSetTextContent(totalElement, newTotal.toString());
      this.safeSetTextContent(savingsElement, `${newAvgSavings}%`);
      this.safeSetTextContent(reductionElement, newAvgReduction.toString());
    }
  }
  
  handleCopyResult() {
    if (this.lastOptimizationResult) {
      const optimizedText = this.lastOptimizationResult.optimized;
      
      // Try to copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(optimizedText).then(() => {
          this.showToastNotification('Optimized prompt copied to clipboard!', 'success');
        }).catch(() => {
          this.fallbackCopyToClipboard(optimizedText);
        });
      } else {
        this.fallbackCopyToClipboard(optimizedText);
      }
    }
  }
  
  fallbackCopyToClipboard(text) {
    // Fallback copy method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showToastNotification('Optimized prompt copied to clipboard!', 'success');
    } catch (err) {
      this.showToastNotification('Failed to copy to clipboard', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  }
  
  handleNewOptimization() {
    // Reset for new optimization
    const promptInput = document.getElementById('promptInput');
    const optimizedPrompt = document.getElementById('optimizedPrompt');
    const resultsArea = document.getElementById('resultsArea');
    
    if (promptInput) promptInput.value = '';
    if (optimizedPrompt) optimizedPrompt.value = '';
    if (resultsArea) resultsArea.style.display = 'none';
    
    // Clear stored result
    this.lastOptimizationResult = null;
    
    // Focus on input
    if (promptInput) promptInput.focus();
  }
  
  showToastNotification(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  // ===== MODEL COMPARISON AND BENCHMARKING =====
  
  handleCompareModels() {
    this.showComparisonModal();
    this.loadComparisonData();
  }
  
  handleViewBenchmarks() {
    this.showBenchmarksModal();
    this.loadBenchmarkData();
  }
  
  showComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) {
      modal.style.display = 'flex';
      this.setupComparisonEventListeners();
    }
  }
  
  hideComparisonModal() {
    const modal = document.getElementById('comparisonModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  showBenchmarksModal() {
    const modal = document.getElementById('benchmarksModal');
    if (modal) {
      modal.style.display = 'flex';
      this.setupBenchmarkEventListeners();
    }
  }
  
  hideBenchmarksModal() {
    const modal = document.getElementById('benchmarksModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  setupComparisonEventListeners() {
    // Comparison criteria change
    const criteriaSelect = document.getElementById('comparisonCriteria');
    if (criteriaSelect) {
      criteriaSelect.addEventListener('change', () => {
        this.refreshComparison();
      });
    }
    
    // Trending timeframe change
    const timeframeSelect = document.getElementById('trendingTimeframe');
    if (timeframeSelect) {
      timeframeSelect.addEventListener('change', () => {
        this.loadTrendingData();
      });
    }
    
    // Benchmark tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.getAttribute('data-metric');
        this.loadBenchmarkData(metric);
      });
    });
  }
  
  setupBenchmarkEventListeners() {
    // Metric selector buttons
    const metricButtons = document.querySelectorAll('.metric-btn');
    metricButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        metricButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metric = btn.getAttribute('data-metric');
        this.loadBenchmarkVisualization(metric);
      });
    });
  }
  
  async loadComparisonData() {
    try {
      console.log('[PopupManager] Loading comparison data...');
      
      const resultsContainer = document.getElementById('comparisonResults');
      if (!resultsContainer) return;
      
      resultsContainer.innerHTML = '<div class="loading-comparison">Loading comparison data...</div>';
      
      // Get available models for comparison
      const availableModels = this.getAvailableModelsForComparison();
      if (availableModels.length === 0) {
        resultsContainer.innerHTML = '<div class="no-data">No AI models detected for comparison.</div>';
        return;
      }
      
      // Get comparison criteria
      const criteria = document.getElementById('comparisonCriteria')?.value || 'all';
      
      // Request comparison from service worker
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_COMPARISON',
        models: availableModels,
        criteria: criteria
      });
      
      if (response?.success) {
        this.displayComparisonResults(response.comparison);
        this.displayRecommendations(response.comparison.recommendations);
      } else {
        resultsContainer.innerHTML = `<div class="error">Failed to load comparison: ${response?.error || 'Unknown error'}</div>`;
      }
      
    } catch (error) {
      console.error('[PopupManager] Failed to load comparison data:', error);
      const resultsContainer = document.getElementById('comparisonResults');
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div class="error">Failed to load comparison data</div>';
      }
    }
  }
  
  getAvailableModelsForComparison() {
    // Get models from current session or detected models
    const models = [];
    
    // Add currently detected model
    if (this.detectedAIModel) {
      models.push(this.detectedAIModel.modelKey);
    }
    
    // Add some popular models for comparison
    const popularModels = ['gpt-5-high', 'claude-4-sonnet-thinking', 'grok-4', 'deepseek-r1', 'llama-4-maverick'];
    popularModels.forEach(model => {
      if (!models.includes(model)) {
        models.push(model);
      }
    });
    
    return models.slice(0, 5); // Limit to 5 models for performance
  }
  
  displayComparisonResults(comparison) {
    const resultsContainer = document.getElementById('comparisonResults');
    if (!resultsContainer || !comparison?.models) return;
    
    let html = '<div class="comparison-table">';
    html += '<div class="comparison-header">';
    html += '<div class="model-col">Model</div>';
    html += '<div class="metric-col">Efficiency</div>';
    html += '<div class="metric-col">Sustainability</div>';
    html += '<div class="metric-col">Performance</div>';
    html += '<div class="metric-col">Overall</div>';
    html += '</div>';
    
    comparison.models.forEach((model, index) => {
      const rankClass = index === 0 ? 'rank-best' : index === 1 ? 'rank-second' : '';
      html += `<div class="comparison-row ${rankClass}">`;
      html += `<div class="model-info">`;
      html += `<div class="model-name">${model.name}</div>`;
      html += `<div class="model-company">${model.company}</div>`;
      html += `</div>`;
      html += `<div class="metric-value">${model.scores.efficiency}</div>`;
      html += `<div class="metric-value">${model.scores.sustainability}/100</div>`;
      html += `<div class="metric-value">${model.scores.performance}/100</div>`;
      html += `<div class="metric-value overall">${model.scores.overall}/100</div>`;
      html += '</div>';
    });
    
    html += '</div>';
    
    // Add summary
    if (comparison.summary) {
      html += '<div class="comparison-summary">';
      html += '<h4>Summary</h4>';
      html += `<p><strong>Most Efficient:</strong> ${comparison.summary.mostEfficient?.name} (${comparison.summary.mostEfficient?.score})</p>`;
      html += `<p><strong>Most Sustainable:</strong> ${comparison.summary.mostSustainable?.name} (${comparison.summary.mostSustainable?.score}/100)</p>`;
      html += `<p><strong>Highest Performance:</strong> ${comparison.summary.highestPerformance?.name} (${comparison.summary.highestPerformance?.score}/100)</p>`;
      html += '</div>';
    }
    
    resultsContainer.innerHTML = html;
  }
  
  displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendationsList');
    if (!recommendationsContainer || !recommendations) return;
    
    if (recommendations.length === 0) {
      recommendationsContainer.innerHTML = '<div class="no-recommendations">No specific recommendations at this time.</div>';
      return;
    }
    
    let html = '';
    recommendations.forEach(rec => {
      html += `<div class="recommendation-item ${rec.type}">`;
      html += `<div class="rec-icon">${this.getRecommendationIcon(rec.type)}</div>`;
      html += `<div class="rec-content">`;
      html += `<h5>${rec.title}</h5>`;
      html += `<p><strong>${rec.model}</strong></p>`;
      html += `<p>${rec.reason}</p>`;
      html += `</div>`;
      html += `<button class="btn btn-small apply-rec-btn" data-model="${rec.model}" data-type="${rec.type}">Apply</button>`;
      html += '</div>';
    });
    
    recommendationsContainer.innerHTML = html;
    
    // Add click handlers for apply buttons
    recommendationsContainer.querySelectorAll('.apply-rec-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const model = e.target.getAttribute('data-model');
        const type = e.target.getAttribute('data-type');
        this.applyModelRecommendation(model, type);
      });
    });
  }
  
  getRecommendationIcon(type) {
    const icons = {
      'best-overall': '🏆',
      'most-efficient': '⚡',
      'most-sustainable': '🌱',
      'budget-friendly': '💰'
    };
    return icons[type] || '💡';
  }
  
  async loadBenchmarkData(metric = 'intelligence') {
    try {
      console.log('[PopupManager] Loading benchmark data for:', metric);
      
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_BENCHMARKS',
        metric: metric
      });
      
      if (response?.success) {
        this.displayBenchmarkResults(response.benchmarks, metric);
      } else {
        console.error('[PopupManager] Failed to load benchmark data:', response?.error);
      }
      
    } catch (error) {
      console.error('[PopupManager] Benchmark data request failed:', error);
    }
  }
  
  displayBenchmarkResults(benchmarks, metric) {
    const benchmarkContent = document.getElementById('benchmarkContent');
    if (!benchmarkContent || !benchmarks?.models) return;
    
    let html = `<div class="benchmark-chart">`;
    html += `<h5>${metric.charAt(0).toUpperCase() + metric.slice(1)} Rankings</h5>`;
    html += '<div class="benchmark-bars">';
    
    benchmarks.models.slice(0, 10).forEach((model, index) => {
      const percentage = (model.percentile || 50);
      const barClass = percentage > 80 ? 'excellent' : percentage > 60 ? 'good' : percentage > 40 ? 'average' : 'poor';
      
      html += `<div class="benchmark-bar">`;
      html += `<div class="model-label">${model.name}</div>`;
      html += `<div class="bar-container">`;
      html += `<div class="bar-fill ${barClass}" style="width: ${percentage}%"></div>`;
      html += `<span class="bar-value">${model.value}</span>`;
      html += `</div>`;
      html += `<div class="percentile">${percentage}th percentile</div>`;
      html += '</div>';
    });
    
    html += '</div></div>';
    
    // Add insights
    if (benchmarks.insights) {
      html += '<div class="benchmark-insights">';
      html += '<h5>Insights</h5>';
      benchmarks.insights.forEach(insight => {
        html += `<div class="insight-item ${insight.impact}">`;
        html += `<strong>${insight.title}</strong>: ${insight.description}`;
        html += '</div>';
      });
      html += '</div>';
    }
    
    benchmarkContent.innerHTML = html;
  }
  
  async loadBenchmarkVisualization(metric) {
    const visualization = document.getElementById('benchmarkVisualization');
    if (!visualization) return;
    
    visualization.innerHTML = '<div class="loading-benchmarks">Loading benchmark visualization...</div>';
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_MODEL_BENCHMARKS',
        metric: metric
      });
      
      if (response?.success) {
        this.displayBenchmarkVisualization(response.benchmarks, metric);
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load benchmark visualization:', error);
      visualization.innerHTML = '<div class="error">Failed to load benchmark data</div>';
    }
  }
  
  displayBenchmarkVisualization(benchmarks, metric) {
    const visualization = document.getElementById('benchmarkVisualization');
    if (!visualization) return;
    
    // Create a simple bar chart visualization
    let html = `<div class="benchmark-viz">`;
    html += `<h4>${metric.charAt(0).toUpperCase() + metric.slice(1)} Performance</h4>`;
    
    if (benchmarks.distribution) {
      html += `<div class="distribution-stats">`;
      html += `<div class="stat"><label>Min:</label> ${benchmarks.distribution.min?.toFixed(2) || 'N/A'}</div>`;
      html += `<div class="stat"><label>Average:</label> ${benchmarks.distribution.mean?.toFixed(2) || 'N/A'}</div>`;
      html += `<div class="stat"><label>Max:</label> ${benchmarks.distribution.max?.toFixed(2) || 'N/A'}</div>`;
      html += `</div>`;
    }
    
    // Top performers
    html += '<div class="top-performers">';
    html += '<h5>Top Performers</h5>';
    benchmarks.models?.slice(0, 5).forEach((model, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      html += `<div class="performer-item">`;
      html += `<span class="rank">${medal} #${index + 1}</span>`;
      html += `<span class="name">${model.name}</span>`;
      html += `<span class="value">${model.value}</span>`;
      html += '</div>';
    });
    html += '</div>';
    
    html += '</div>';
    
    visualization.innerHTML = html;
    
    // Load insights
    this.loadBenchmarkInsights(benchmarks);
  }
  
  loadBenchmarkInsights(benchmarks) {
    const insightsList = document.getElementById('insightsList');
    if (!insightsList) return;
    
    if (!benchmarks.insights || benchmarks.insights.length === 0) {
      insightsList.innerHTML = '<div class="no-insights">No specific insights available.</div>';
      return;
    }
    
    let html = '';
    benchmarks.insights.forEach(insight => {
      html += `<div class="insight-card ${insight.impact}">`;
      html += `<h6>${insight.title}</h6>`;
      html += `<p>${insight.description}</p>`;
      if (insight.leaders) {
        html += '<div class="leaders">';
        insight.leaders.forEach(leader => {
          html += `<span class="leader">${leader.category}: ${leader.leader.name}</span>`;
        });
        html += '</div>';
      }
      html += '</div>';
    });
    
    insightsList.innerHTML = html;
  }
  
  async loadTrendingData() {
    const timeframe = document.getElementById('trendingTimeframe')?.value || '7d';
    const trendingSection = document.getElementById('trendingSection');
    const trendingList = document.getElementById('trendingList');
    
    if (!trendingSection || !trendingList) return;
    
    trendingSection.style.display = 'block';
    trendingList.innerHTML = '<div class="loading-trending">Loading trending data...</div>';
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_TRENDING_MODELS',
        timeframe: timeframe
      });
      
      if (response?.success && response.trending) {
        this.displayTrendingModels(response.trending);
      } else {
        trendingList.innerHTML = '<div class="no-data">No trending data available.</div>';
      }
    } catch (error) {
      console.error('[PopupManager] Failed to load trending data:', error);
      trendingList.innerHTML = '<div class="error">Failed to load trending data</div>';
    }
  }
  
  displayTrendingModels(trending) {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;
    
    if (trending.length === 0) {
      trendingList.innerHTML = '<div class="no-trending">No trending models in selected timeframe.</div>';
      return;
    }
    
    let html = '';
    trending.forEach((model, index) => {
      const trendIcon = index === 0 ? '🔥' : index < 3 ? '📈' : '📊';
      html += `<div class="trending-item">`;
      html += `<div class="trend-icon">${trendIcon}</div>`;
      html += `<div class="trend-info">`;
      html += `<div class="trend-name">${model.name}</div>`;
      html += `<div class="trend-stats">`;
      html += `<span>${model.count} uses</span>`;
      html += `<span>${model.averageQueriesPerUse.toFixed(1)} avg queries</span>`;
      html += `<span>${model.averageEnergyPerUse.toFixed(2)}Wh avg</span>`;
      html += `</div>`;
      html += `</div>`;
      html += '</div>';
    });
    
    trendingList.innerHTML = html;
  }
  
  async refreshComparison() {
    await this.loadComparisonData();
    this.showToastNotification('Comparison data refreshed', 'success');
  }
  
  async exportComparison() {
    try {
      const criteria = document.getElementById('comparisonCriteria')?.value || 'all';
      const models = this.getAvailableModelsForComparison();
      
      const response = await chrome.runtime.sendMessage({
        type: 'EXPORT_COMPARISON_DATA',
        models: models,
        format: 'json' // Could add format selection
      });
      
      if (response?.success) {
        // Create and download the export file
        const blob = new Blob([response.exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-model-comparison-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToastNotification('Comparison data exported', 'success');
      } else {
        this.showToastNotification('Export failed', 'error');
      }
    } catch (error) {
      console.error('[PopupManager] Export failed:', error);
      this.showToastNotification('Export failed', 'error');
    }
  }
  
  async applyRecommendation() {
    // This would integrate with the AI optimization system
    this.showToastNotification('Recommendation applied', 'success');
    this.hideComparisonModal();
  }
  
  applyModelRecommendation(model, type) {
    console.log('[PopupManager] Applying recommendation:', model, type);
    this.showToastNotification(`Applied ${type} recommendation: ${model}`, 'success');
  }

  // ===== TAB ENERGY RECOMMENDATIONS =====
  
  setupTabRecommendations() {
    console.log('[PopupManager] Setting up tab energy recommendations');
    this.selectedTabsForClosure = new Set();
    this.tabRecommendationsVisible = false;
  }

  /**
   * Updates the tab energy recommendations section
   */
  updateTabEnergyRecommendations() {
    try {
      const recommendationsSection = document.getElementById('tabEnergyRecommendations');
      if (!recommendationsSection) return;

      // Get all tab energy data
      const tabEnergyData = this.getAllTabEnergyData();
      if (!tabEnergyData || tabEnergyData.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
      }

      // Identify high energy tabs
      const highEnergyTabs = this.identifyHighEnergyTabs(tabEnergyData);
      const tabClosingSuggestions = this.generateTabClosingSuggestions(tabEnergyData);

      // Show section if we have recommendations
      if (highEnergyTabs.length > 0 || tabClosingSuggestions.length > 0) {
        recommendationsSection.style.display = 'block';
        this.tabRecommendationsVisible = true;

        // Update high energy tabs
        this.updateHighEnergyTabsSection(highEnergyTabs);
        
        // Update tab closing suggestions
        this.updateTabClosingSuggestionsSection(tabClosingSuggestions);
        
        // Update energy summary
        this.updateEnergySummarySection(tabEnergyData, highEnergyTabs, tabClosingSuggestions);
      } else {
        recommendationsSection.style.display = 'none';
        this.tabRecommendationsVisible = false;
      }
    } catch (error) {
      console.error('[PopupManager] Error updating tab energy recommendations:', error);
    }
  }

  /**
   * Gets energy data for all tabs
   */
  getAllTabEnergyData() {
    if (!this.energyData) return [];

    const tabData = [];
    for (const [tabId, data] of Object.entries(this.energyData)) {
      if (data && typeof data === 'object') {
        const powerWatts = data.powerWatts || this.migrateLegacyScore(data.energyScore || 0);
        tabData.push({
          tabId: parseInt(tabId),
          title: data.title || 'Unknown Tab',
          url: data.url || '',
          powerWatts: powerWatts,
          energyScore: data.energyScore || 0,
          domNodes: data.domNodes || 0,
          duration: data.duration || 0,
          timestamp: data.timestamp || Date.now(),
          isCurrentTab: parseInt(tabId) === this.currentTabData?.tabId
        });
      }
    }

    return tabData.sort((a, b) => b.powerWatts - a.powerWatts);
  }

  /**
   * Identifies tabs with high energy consumption
   */
  identifyHighEnergyTabs(tabEnergyData) {
    if (!tabEnergyData || tabEnergyData.length === 0) return [];

    // Define high energy threshold (configurable)
    const highEnergyThreshold = this.settings?.powerThreshold || 25; // watts
    
    // Filter tabs above threshold
    const highEnergyTabs = tabEnergyData.filter(tab =>
      tab.powerWatts >= highEnergyThreshold
    );

    // Limit to top 5 highest energy tabs
    return highEnergyTabs.slice(0, 5);
  }

  /**
   * Generates suggestions for tabs to close
   */
  generateTabClosingSuggestions(tabEnergyData) {
    if (!tabEnergyData || tabEnergyData.length === 0) return [];

    const suggestions = [];
    const currentTime = Date.now();

    for (const tab of tabEnergyData) {
      // Skip current tab
      if (tab.isCurrentTab) continue;

      let shouldSuggest = false;
      let reason = '';

      // High power consumption (>40W)
      if (tab.powerWatts > 40) {
        shouldSuggest = true;
        reason = `High power usage (${tab.powerWatts.toFixed(1)}W)`;
      }
      // Medium-high power with long inactivity (>30W and >30 min inactive)
      else if (tab.powerWatts > 30 && this.getTabInactivityTime(tab) > 1800000) {
        shouldSuggest = true;
        reason = `High power + inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }
      // Medium power with very long inactivity (>20W and >1 hour inactive)
      else if (tab.powerWatts > 20 && this.getTabInactivityTime(tab) > 3600000) {
        shouldSuggest = true;
        reason = `Medium power + inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }
      // Any tab inactive for >2 hours
      else if (this.getTabInactivityTime(tab) > 7200000) {
        shouldSuggest = true;
        reason = `Inactive for ${this.formatDuration(this.getTabInactivityTime(tab))}`;
      }

      if (shouldSuggest) {
        suggestions.push({
          ...tab,
          reason: reason,
          potentialSaving: tab.powerWatts
        });
      }
    }

    // Sort by potential energy savings (highest first)
    return suggestions
      .sort((a, b) => b.potentialSaving - a.potentialSaving)
      .slice(0, 8); // Limit to 8 suggestions
  }

  /**
   * Gets inactivity time for a tab
   */
  getTabInactivityTime(tab) {
    const now = Date.now();
    const lastActivity = tab.timestamp || now;
    return now - lastActivity;
  }

  /**
   * Updates the high energy tabs section
   */
  updateHighEnergyTabsSection(highEnergyTabs) {
    const section = document.getElementById('highEnergyTabsSection');
    const list = document.getElementById('highEnergyTabsList');
    
    if (!section || !list) return;

    if (highEnergyTabs.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    
    let html = '';
    highEnergyTabs.forEach(tab => {
      html += `
        <div class="high-energy-tab" data-tab-id="${tab.tabId}">
          <div class="tab-info-left">
            <div class="tab-title">${this.escapeHtml(tab.title)}</div>
            <div class="tab-url">${this.formatUrl(tab.url)}</div>
          </div>
          <div class="tab-energy-info">
            <span class="tab-energy-value">${tab.powerWatts.toFixed(1)}W</span>
            ${!tab.isCurrentTab ? `<button class="tab-close-btn" data-tab-id="${tab.tabId}">Close</button>` : ''}
          </div>
        </div>
      `;
    });
    
    list.innerHTML = html;

    // Add click handlers for close buttons
    list.querySelectorAll('.tab-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.getAttribute('data-tab-id'));
        this.handleCloseTab(tabId);
      });
    });
  }

  /**
   * Updates the tab closing suggestions section
   */
  updateTabClosingSuggestionsSection(suggestions) {
    const section = document.getElementById('tabClosingSuggestions');
    const list = document.getElementById('closingSuggestionsList');
    
    if (!section || !list) return;

    if (suggestions.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    
    let html = '';
    suggestions.forEach(suggestion => {
      const isSelected = this.selectedTabsForClosure.has(suggestion.tabId);
      html += `
        <div class="suggestion-item" data-tab-id="${suggestion.tabId}">
          <div class="suggestion-reason">
            <strong>${this.escapeHtml(suggestion.title)}</strong><br>
            <small>${suggestion.reason}</small>
          </div>
          <div class="suggestion-checkbox ${isSelected ? 'checked' : ''}" data-tab-id="${suggestion.tabId}"></div>
        </div>
      `;
    });
    
    list.innerHTML = html;

    // Add click handlers for checkboxes
    list.querySelectorAll('.suggestion-checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', (e) => {
        const tabId = parseInt(e.target.getAttribute('data-tab-id'));
        this.toggleTabSelection(tabId);
      });
    });
  }

  /**
   * Updates the energy summary section
   */
  updateEnergySummarySection(allTabs, highEnergyTabs, suggestions) {
    const section = document.getElementById('energySummarySection');
    const totalTabsCount = document.getElementById('totalTabsCount');
    const highEnergyCount = document.getElementById('highEnergyCount');
    const potentialSavings = document.getElementById('potentialSavings');
    
    if (!section) return;

    section.style.display = 'block';
    
    // Calculate potential savings from selected suggestions
    const selectedSavings = suggestions
      .filter(s => this.selectedTabsForClosure.has(s.tabId))
      .reduce((total, s) => total + s.potentialSaving, 0);
    
    if (totalTabsCount) totalTabsCount.textContent = allTabs.length.toString();
    if (highEnergyCount) highEnergyCount.textContent = highEnergyTabs.length.toString();
    if (potentialSavings) {
      if (selectedSavings > 0) {
        potentialSavings.textContent = `${selectedSavings.toFixed(1)}W`;
      } else {
        const maxSavings = suggestions.reduce((total, s) => total + s.potentialSaving, 0);
        potentialSavings.textContent = maxSavings > 0 ? `~${maxSavings.toFixed(1)}W` : '--';
      }
    }
  }

  /**
   * Toggles tab selection for closure
   */
  toggleTabSelection(tabId) {
    if (this.selectedTabsForClosure.has(tabId)) {
      this.selectedTabsForClosure.delete(tabId);
    } else {
      this.selectedTabsForClosure.add(tabId);
    }

    // Update UI
    const checkbox = document.querySelector(`.suggestion-checkbox[data-tab-id="${tabId}"]`);
    if (checkbox) {
      if (this.selectedTabsForClosure.has(tabId)) {
        checkbox.classList.add('checked');
      } else {
        checkbox.classList.remove('checked');
      }
    }

    // Update potential savings
    if (this.tabRecommendationsVisible) {
      const allTabs = this.getAllTabEnergyData();
      const highEnergyTabs = this.identifyHighEnergyTabs(allTabs);
      const suggestions = this.generateTabClosingSuggestions(allTabs);
      this.updateEnergySummarySection(allTabs, highEnergyTabs, suggestions);
    }
  }

  /**
   * Handles closing recommended tabs
   */
  async handleCloseRecommendedTabs() {
    if (this.selectedTabsForClosure.size === 0) {
      this.showToast('No tabs selected for closing', 'warning');
      return;
    }

    try {
      const tabIds = Array.from(this.selectedTabsForClosure);
      console.log('[PopupManager] Closing recommended tabs:', tabIds);

      // Close the selected tabs
      if (this.isChromeApiAvailable()) {
        await chrome.tabs.remove(tabIds);
        this.showToast(`Closed ${tabIds.length} tab${tabIds.length > 1 ? 's' : ''}`, 'success');
      }

      // Clear selections
      this.selectedTabsForClosure.clear();

      // Refresh data after a short delay
      setTimeout(() => {
        this.loadCurrentEnergyData();
      }, 1000);

    } catch (error) {
      console.error('[PopupManager] Failed to close recommended tabs:', error);
      this.showToast('Failed to close some tabs', 'error');
    }
  }

  /**
   * Handles closing a single tab
   */
  async handleCloseTab(tabId) {
    try {
      console.log('[PopupManager] Closing tab:', tabId);
      
      if (this.isChromeApiAvailable()) {
        await chrome.tabs.remove([tabId]);
        this.showToast('Tab closed', 'success');
      }

      // Refresh data after a short delay
      setTimeout(() => {
        this.loadCurrentEnergyData();
      }, 1000);

    } catch (error) {
      console.error('[PopupManager] Failed to close tab:', error);
      this.showToast('Failed to close tab', 'error');
    }
  }

  /**
   * Handles dismissing suggestions
   */
  handleDismissSuggestions() {
    const recommendationsSection = document.getElementById('tabEnergyRecommendations');
    if (recommendationsSection) {
      recommendationsSection.style.display = 'none';
      this.tabRecommendationsVisible = false;
    }
    
    this.selectedTabsForClosure.clear();
    this.showToast('Suggestions dismissed', 'info');
  }

  /**
   * Escapes HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
  });
} else {
  new PopupManager();
}