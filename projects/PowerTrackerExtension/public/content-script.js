// ===========================
// Energy Tracking Content Script - Protected against redeclaration
// ===========================
(() => {
  // Better protection against multiple execution
  if (window.__energyTrackerContentLoaded) {
    console.log('[EnergyTracker] Content script already loaded, cleaning up...');
    // Clean up existing instances
    if (window.__energyTrackerInstance) {
      window.__energyTrackerInstance.cleanup();
    }
    if (window.__energyTipInstance) {
      window.__energyTipInstance.cleanup();
    }
  }

  /**
   * BackoffManager handles exponential backoff with jitter to prevent thundering herd problems
   * and race conditions from concurrent requests.
   */
  if (typeof window.BackoffManager === 'undefined') {
    window.BackoffManager = class BackoffManager {
      constructor(options = {}) {
        this.initialDelayMs = options.initialDelayMs || 500;
        this.maxDelayMs = options.maxDelayMs || 8000;
        this.maxRetries = options.maxRetries || 3;
        this.jitterFactor = options.jitterFactor || 0.1; // 10% jitter
        this.multiplier = options.multiplier || 2;
        
        this.reset();
      }

      reset() {
        this.currentDelayMs = this.initialDelayMs;
        this.retryCount = 0;
        console.log('[BACKOFF-DEBUG] BackoffManager reset to', this.initialDelayMs, 'ms');
      }

      /**
       * Get the next backoff delay with jitter to prevent synchronized retries
       */
      getNextDelay() {
        if (this.retryCount >= this.maxRetries) {
          console.log('[BACKOFF-DEBUG] Max retries exceeded:', this.maxRetries);
          return null; // No more retries
        }

        const baseDelay = this.currentDelayMs;
        
        // Add jitter: random variation between -jitterFactor and +jitterFactor
        const jitterRange = baseDelay * this.jitterFactor;
        const jitter = (Math.random() * 2 - 1) * jitterRange; // -jitterRange to +jitterRange
        const delayWithJitter = Math.max(0, baseDelay + jitter);

        console.log('[BACKOFF-DEBUG] Retry', this.retryCount + 1, '/', this.maxRetries,
                    'delay:', Math.round(delayWithJitter), 'ms (base:', baseDelay, 'jitter:', Math.round(jitter), ')');

        // Update state for next retry
        this.retryCount++;
        this.currentDelayMs = Math.min(this.currentDelayMs * this.multiplier, this.maxDelayMs);

        return delayWithJitter;
      }

      canRetry() {
        return this.retryCount < this.maxRetries;
      }

      getRetryInfo() {
        return {
          retryCount: this.retryCount,
          maxRetries: this.maxRetries,
          currentDelay: this.currentDelayMs,
          canRetry: this.canRetry()
        };
      }
    };
  }

  // Create singleton instance to maintain backoff state across the content script
  if (typeof window.__energyBackoffManager === 'undefined') {
    window.__energyBackoffManager = new window.BackoffManager();
  }

  if (typeof window.resetBackoff === 'undefined') {
    window.resetBackoff = function resetBackoff() {
      window.__energyBackoffManager.reset();
    };
  }

  if (typeof window.sleep === 'undefined') {
    window.sleep = function sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    };
  }

  /**
   * Error classification for different retry strategies
   */
  if (typeof window.ErrorClassification === 'undefined') {
    window.ErrorClassification = {
      EXTENSION_INVALIDATED: 'extension_invalidated',
      TRANSIENT_CONNECTION: 'transient_connection',
      PERMANENT_ERROR: 'permanent_error'
    };
  }

  if (typeof window.classifyError === 'undefined') {
    window.classifyError = function classifyError(error) {
      const text = String(error?.message || error);
      
      // Extension context issues - should retry with backoff
      const invalidated =
        text.includes('Extension context invalidated') ||
        text.includes('Receiving end does not exist') ||
        text.includes('The message port closed before a response was received') ||
        text.includes('Could not establish connection') ||
        text.includes('No receiving end');
        
      if (invalidated) {
        return window.ErrorClassification.EXTENSION_INVALIDATED;
      }
      
      // Transient network/connection issues - should retry with shorter backoff
      const transient =
        text.includes('Network error') ||
        text.includes('timeout') ||
        text.includes('Service worker') ||
        text.includes('temporarily unavailable');
        
      if (transient) {
        return window.ErrorClassification.TRANSIENT_CONNECTION;
      }
      
      // Permanent errors - should not retry
      return window.ErrorClassification.PERMANENT_ERROR;
    };
  }

  if (typeof window.safeSendMessage === 'undefined') {
    window.safeSendMessage = async function safeSendMessage(msg) {
      // Enhanced extension context validation
      if (!window.isExtensionContextValid()) {
        console.log('[BACKOFF-DEBUG] Extension context invalid, returning null');
        return null;
      }

      // Try a quick liveness ping with enhanced error handling
      try {
        const pingResult = await chrome.runtime.sendMessage({ type: 'PING' });
        if (!pingResult?.success) {
          console.log('[BACKOFF-DEBUG] Service worker not responding properly');
        }
      } catch (pingError) {
        console.log('[BACKOFF-DEBUG] Liveness ping failed:', pingError.message);
        // Check if this indicates context invalidation
        if (window.classifyError(pingError) === window.ErrorClassification.EXTENSION_INVALIDATED) {
          console.log('[BACKOFF-DEBUG] Extension context invalidated during ping');
          return null;
        }
      }

      // Initial attempt with enhanced error handling
      try {
        const result = await chrome.runtime.sendMessage(msg);
        console.log('[BACKOFF-DEBUG] Message sent successfully on first attempt');
        window.__energyBackoffManager.reset(); // Reset backoff on success
        return result;
      } catch (initialError) {
        const errorType = window.classifyError(initialError);
        console.log('[BACKOFF-DEBUG] Initial send failed, error type:', errorType, 'message:', initialError?.message);
        
        // Return null for invalidated context instead of retrying
        if (errorType === window.ErrorClassification.EXTENSION_INVALIDATED) {
          console.log('[BACKOFF-DEBUG] Extension invalidated, returning null');
          return null;
        }
        
        // Don't retry permanent errors
        if (errorType === window.ErrorClassification.PERMANENT_ERROR) {
          console.log('[BACKOFF-DEBUG] Permanent error detected, not retrying');
          return null; // Return null instead of throwing
        }

        // Retry with backoff for transient errors only
        while (window.__energyBackoffManager.canRetry()) {
          const delay = window.__energyBackoffManager.getNextDelay();
          if (delay === null) {
            console.log('[BACKOFF-DEBUG] No more retries available');
            break;
          }

          console.log('[BACKOFF-DEBUG] Retrying after', Math.round(delay), 'ms delay');
          await window.sleep(delay);

          // Check context validity before retry
          if (!window.isExtensionContextValid()) {
            console.log('[BACKOFF-DEBUG] Extension context invalidated during retry');
            return null;
          }

          try {
            const result = await chrome.runtime.sendMessage(msg);
            console.log('[BACKOFF-DEBUG] Retry successful');
            window.__energyBackoffManager.reset(); // Reset backoff on success
            return result;
          } catch (retryError) {
            const retryErrorType = window.classifyError(retryError);
            console.log('[BACKOFF-DEBUG] Retry failed, error type:', retryErrorType, 'message:', retryError?.message);
            
            // Return null for any context invalidation
            if (retryErrorType === window.ErrorClassification.EXTENSION_INVALIDATED) {
              console.log('[BACKOFF-DEBUG] Extension invalidated during retry, stopping');
              return null;
            }
            
            // If error type changed to permanent, stop retrying
            if (retryErrorType === window.ErrorClassification.PERMANENT_ERROR) {
              console.log('[BACKOFF-DEBUG] Error type changed to permanent, stopping retries');
              return null; // Return null instead of throwing
            }
          }
        }

        // All retries exhausted
        console.log('[BACKOFF-DEBUG] All retries exhausted, returning null');
        return null; // Return null instead of throwing
      }
    };
  }

  // Enhanced extension context validation
  if (typeof window.isExtensionContextValid === 'undefined') {
    window.isExtensionContextValid = function isExtensionContextValid() {
      try {
        // Check multiple indicators of valid extension context
        return !!(
          typeof chrome !== 'undefined' &&
          chrome.runtime &&
          chrome.runtime.id &&
          !chrome.runtime.lastError
        );
      } catch (error) {
        console.log('[BACKOFF-DEBUG] Extension context check failed:', error.message);
        return false;
      }
    };
  }

  // ---- Settings fetch (optional, but lets us honor user choices) ----
  if (typeof window.getSettingsOrDefault === 'undefined') {
    window.getSettingsOrDefault = async function getSettingsOrDefault() {
      const defaults = {
        trackingEnabled: true,
        notificationsEnabled: true,
        energyThreshold: 75,
        dataRetentionDays: 30,
        samplingInterval: 5000
      };
      try {
        const res = await window.safeSendMessage({ type: 'GET_SETTINGS' });
        return res?.success ? { ...defaults, ...res.settings } : defaults;
      } catch { return defaults; }
    };
  }

  // ===========================
  // Main Monitor
  // ===========================
  if (typeof window.PageEnergyMonitor === 'undefined') {
    window.PageEnergyMonitor = class PageEnergyMonitor {
  constructor() {
    this.isInitialized = false;

    // Observers
    this.mutationObserver = null;
    this.performanceObserver = null;

    // Timers
    this.intervalId = null;
    this.samplingInterval = 5000; // default; can be overridden by settings
    this.hiddenInterval = 30000;  // slow down when tab hidden

    // Metric cache between sends
    this.lastMetrics = {};

    // Bindings
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageUnload = this.handlePageUnload.bind(this);

    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    // Wait for DOM
    if (document.readyState === 'loading') {
      await new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }

    console.log('[PageEnergyMonitor] Initializing on:', window.location.href);

    // Load settings from background (if available)
    const settings = await window.getSettingsOrDefault();
    this.samplingInterval = Number(settings.samplingInterval) || 5000;

    // If tracking is disabled, still initialize but with reduced functionality
    if (!settings.trackingEnabled) {
      console.log('[PageEnergyMonitor] Tracking disabled in settings; starting with minimal monitoring.');
      // Still start monitoring but with longer intervals and basic metrics only
      this.samplingInterval = Math.max(this.samplingInterval, 15000); // At least 15 seconds
    }

    try {
      this.setupPerformanceObserver();
      this.setupMutationObserver();
      this.startPeriodicMonitoring();

      // Page lifecycle hooks
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('beforeunload', this.handlePageUnload);

      this.isInitialized = true;
      console.log('[PageEnergyMonitor] Monitoring setup complete');
    } catch (error) {
      console.error('[PageEnergyMonitor] Initialization failed:', error);
    }
  }

  // ---- Observers ----
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('[PageEnergyMonitor] PerformanceObserver not supported');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe these types when available
      ['navigation', 'resource', 'paint', 'measure'].forEach((type) => {
        try {
          this.performanceObserver.observe({ entryTypes: [type] });
        } catch {
          // some entry types may not be supported in all contexts
        }
      });
    } catch (error) {
      console.error('[PageEnergyMonitor] PerformanceObserver setup failed:', error);
    }
  }

  setupMutationObserver() {
    if (!('MutationObserver' in window) || !document.body) {
      console.warn('[PageEnergyMonitor] MutationObserver not supported or no body');
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      this.processDOMMutations(mutations);
    });

    // Observe global DOM activity
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: false
    });
  }

  // ---- Periodic monitoring ----
  startPeriodicMonitoring() {
    this.stopPeriodicMonitoring(); // clean old timer if any
    this.collectAndSendMetrics();  // immediate sample

    const interval = document.hidden ? this.hiddenInterval : this.samplingInterval;
    this.intervalId = setInterval(() => {
      this.collectAndSendMetrics();
    }, interval);
  }

  stopPeriodicMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ---- Entry processing ----
  processPerformanceEntries(entries) {
    // Clear old entries periodically
    if (!this.lastCleanup || Date.now() - this.lastCleanup > 60000) {
      this.cleanupOldMetrics();
      this.lastCleanup = Date.now();
    }
    
    entries.forEach((entry) => {
      // Process entries with size limits
      this.processEntryWithLimits(entry);
    });
  }

  processEntryWithLimits(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.lastMetrics.navigation = {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          domInteractive: entry.domInteractive - entry.navigationStart,
          totalLoadTime: entry.loadEventEnd - entry.navigationStart
        };
        break;

      case 'resource':
        if (!this.lastMetrics.resources) {
          this.lastMetrics.resources = {
            totalRequests: 0,
            totalSize: 0,
            totalDuration: 0,
            types: {},
            entries: []
          };
        }

        const type = this.getResourceType(entry.name, entry.initiatorType);
        this.lastMetrics.resources.totalRequests++;
        this.lastMetrics.resources.totalSize += entry.transferSize || 0;
        this.lastMetrics.resources.totalDuration += entry.duration;

        // Store entry with timestamp for cleanup, but limit size
        if (this.lastMetrics.resources.entries.length < 1000) {
          this.lastMetrics.resources.entries.push({
            ...entry,
            timestamp: Date.now()
          });
        }

        if (!this.lastMetrics.resources.types[type]) {
          this.lastMetrics.resources.types[type] = { count: 0, size: 0, duration: 0 };
        }
        this.lastMetrics.resources.types[type].count++;
        this.lastMetrics.resources.types[type].size += entry.transferSize || 0;
        this.lastMetrics.resources.types[type].duration += entry.duration;
        break;

      case 'paint':
        if (!this.lastMetrics.rendering) this.lastMetrics.rendering = {};
        this.lastMetrics.rendering[entry.name] = entry.startTime;
        break;

      case 'measure':
        if (!this.lastMetrics.customMeasures) this.lastMetrics.customMeasures = {};
        this.lastMetrics.customMeasures[entry.name] = entry.duration;
        break;
    }
  }

  processDOMMutations(mutations) {
    if (!this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = {
        mutations: 0,
        addedNodes: 0,
        removedNodes: 0,
        modifiedAttributes: 0
      };
    }

    for (const m of mutations) {
      this.lastMetrics.domActivity.mutations++;
      if (m.type === 'childList') {
        this.lastMetrics.domActivity.addedNodes += m.addedNodes.length;
        this.lastMetrics.domActivity.removedNodes += m.removedNodes.length;
      } else if (m.type === 'attributes') {
        this.lastMetrics.domActivity.modifiedAttributes++;
      }
    }
  }

  // ---- Collect + Send ----
  collectAndSendMetrics(isImmediate = false) {
    try {
      const metrics = this.gatherAllMetrics();
      if (isImmediate) {
        metrics.isImmediate = true;
        console.log('[PageEnergyMonitor] Immediate metrics collection triggered');
      }
      
      const success = this.sendMetricsToBackground(metrics);
      if (success || isImmediate) {
        this.resetTransientMetrics();
      }
      return success;
    } catch (error) {
      console.error('[PageEnergyMonitor] Metrics collection failed:', error);
      return false;
    }
  }

  gatherAllMetrics() {
    const metrics = {
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title,

      // Page characteristics
      domNodes: document.querySelectorAll('*').length,
      domDepth: this.calculateDOMDepth(),
      viewport: { width: window.innerWidth, height: window.innerHeight },

      // Memory usage (if available)
      memory: this.getMemoryUsage(),

      // CPU-intensive indicators
      cpuIntensiveElements: this.detectCPUIntensiveElements(),

      // Network activity estimation
      activeConnections: this.estimateActiveConnections(),

      // Everything cached by observers
      ...this.lastMetrics
    };

    return metrics;
  }

  async sendMetricsToBackground(metrics) {
    // Enhanced context validation before sending
    if (!window.isExtensionContextValid()) {
      console.log('[PageEnergyMonitor] Extension context invalid, cannot send metrics');
      return false;
    }

    // Optional: Don't send as frequently when hidden (but always send immediate collections)
    if (document.hidden && !metrics.isImmediate) {
      const hiddenSendChance = Math.random();
      if (hiddenSendChance > 0.2) { // Only send 20% of the time when hidden
        console.log('[PageEnergyMonitor] Skipping metrics send while hidden');
        return false;
      }
    }

    try {
      const backoffInfo = window.__energyBackoffManager.getRetryInfo();
      console.log('[BACKOFF-DEBUG] Sending energy data, backoff state:', backoffInfo);
      console.log('[PageEnergyMonitor] Sending metrics:', {
        url: metrics?.url || 'unknown',
        domNodes: metrics?.domNodes || 0,
        cpuIntensiveElements: metrics?.cpuIntensiveElements?.count || 0,
        timestamp: metrics?.timestamp || Date.now(),
        isImmediate: metrics?.isImmediate || false
      });
      
      const res = await window.safeSendMessage({ type: 'ENERGY_DATA', data: metrics });
      if (res !== null && res !== undefined) {
        console.log('[BACKOFF-DEBUG] Energy data sent successfully, response:', res);
        // Reset backoff only on successful communication
        if (res.success) {
          window.resetBackoff();
          return true;
        }
      } else {
        console.log('[BACKOFF-DEBUG] Energy data send returned null (extension context invalid)');
        // Don't reset backoff here - context might be invalidated
      }
      return false;
    } catch (error) {
      // Enhanced error handling - don't throw, just log
      console.warn('[EnergyTracker] sendMetricsToBackground failed:', error?.message || 'Unknown error');
      // Don't reset backoff on error
      return false;
    }
  }

  // ---- Visibility / Unload ----
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('[PageEnergyMonitor] Page hidden, slowing down sampling');
    } else {
      console.log('[PageEnergyMonitor] Page visible, resuming normal sampling');
    }
    this.startPeriodicMonitoring(); // restarts timer with correct interval
  }

  handlePageUnload() {
    try {
      console.log('[PageEnergyMonitor] Page unloading, sending final metrics & cleanup');
      this.collectAndSendMetrics();
    } catch (_) {}

    // Cleanup observers
    try { this.mutationObserver && this.mutationObserver.disconnect(); } catch (_) {}
    try { this.performanceObserver && this.performanceObserver.disconnect(); } catch (_) {}

    this.stopPeriodicMonitoring();
  }

  // ---- Utilities ----
  calculateDOMDepth() {
    let maxDepth = 0;
    const walk = (el, depth) => {
      if (!el || !el.children) return;
      maxDepth = Math.max(maxDepth, depth);
      for (const child of el.children) walk(child, depth + 1);
    };
    if (document.body) walk(document.body, 1);
    return maxDepth;
  }

  getMemoryUsage() {
    const m = performance && performance.memory;
    return m
      ? { used: m.usedJSHeapSize, total: m.totalJSHeapSize, limit: m.jsHeapSizeLimit }
      : null;
    // Note: only available in Chromium-based browsers with proper flags/contexts
  }

  detectCPUIntensiveElements() {
    const selectors = [
      'video[autoplay]', 'canvas', 'iframe',
      '[style*="animation"]', '[style*="transform"]',
      '.animated', '[data-parallax]'
    ];
    let intensiveCount = 0;
    for (const sel of selectors) {
      try { intensiveCount += document.querySelectorAll(sel).length; } catch { /* ignore */ }
    }
    return {
      count: intensiveCount,
      videos: document.querySelectorAll('video').length,
      canvases: document.querySelectorAll('canvas').length,
      iframes: document.querySelectorAll('iframe').length
    };
  }

  estimateActiveConnections() {
    const resources = performance.getEntriesByType('resource');
    const now = performance.now(); // same time basis as entry.startTime
    const recent = resources.filter(r => (now - r.startTime) < 10000); // last 10s
    return {
      recentRequests: recent.length,
      totalRequests: resources.length
    };
  }

  getResourceType(url = '', initiatorType = '') {
    const ext = (url.split('.').pop() || '').toLowerCase();

    const image = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const video = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    const audio = ['mp3', 'wav', 'ogg', 'aac'];
    const style = ['css'];
    const script = ['js'];

    if (image.includes(ext) || initiatorType === 'img') return 'image';
    if (video.includes(ext) || initiatorType === 'video') return 'video';
    if (audio.includes(ext) || initiatorType === 'audio') return 'audio';
    if (style.includes(ext) || initiatorType === 'link') return 'stylesheet';
    if (script.includes(ext) || initiatorType === 'script') return 'script';
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') return 'xhr';
    return 'other';
  }

  resetTransientMetrics() {
    if (this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = { mutations: 0, addedNodes: 0, removedNodes: 0, modifiedAttributes: 0 };
    }
  }

  cleanupOldMetrics() {
    // Keep only recent data
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (this.lastMetrics.resources && this.lastMetrics.resources.entries) {
      this.lastMetrics.resources.entries = this.lastMetrics.resources.entries.filter(
        entry => now - entry.timestamp < maxAge
      );
    }
    
    // Clear other accumulated data
    if (this.lastMetrics.domActivity) {
      this.lastMetrics.domActivity = {
        mutations: 0,
        addedNodes: 0,
        removedNodes: 0,
        modifiedAttributes: 0
      };
    }
  }

  cleanup() {
    console.log('[PageEnergyMonitor] Cleaning up...');
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handlePageUnload);
    this.isInitialized = false;
  }
    };
  }

  // ===========================
  // In-Tab Energy Tip Notifications
  // ===========================
  if (typeof window.EnergyTipNotifications === 'undefined') {
    window.EnergyTipNotifications = class EnergyTipNotifications {
      constructor() {
        this.isInitialized = false;
        this.currentTip = null;
        this.tipHistory = new Map(); // Track shown tips to avoid spam
        this.lastTipTime = 0;
        this.minimumTipInterval = 5 * 60 * 1000; // 5 minutes between tips
        this.init();
      }

      init() {
        if (this.isInitialized) return;
        
        // Listen for tip messages from service worker
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'SHOW_ENERGY_TIP') {
            this.showTip(message.tipData);
            sendResponse({ success: true });
          } else if (message.type === 'HIDE_ENERGY_TIP') {
            this.hideTip();
            sendResponse({ success: true });
          } else if (message.type === 'PING') {
            // Respond to ping messages from service worker
            sendResponse({ success: true, message: 'Content script alive' });
          } else if (message.type === 'COLLECT_IMMEDIATE_METRICS') {
            // Force immediate metrics collection
            if (window.__energyTrackerInstance) {
              console.log('[EnergyTipNotifications] Forcing immediate metrics collection');
              window.__energyTrackerInstance.collectAndSendMetrics();
              sendResponse({ success: true, message: 'Immediate collection triggered' });
            } else {
              sendResponse({ success: false, error: 'Energy tracker not available' });
            }
          }
          return true; // Keep message channel open for async response
        });

        this.injectTipStyles();
        this.isInitialized = true;
        console.log('[EnergyTipNotifications] Initialized');
      }

      showTip(tipData) {
        // Check if we should show this tip
        if (!this.shouldShowTip(tipData)) {
          return;
        }

        // Hide any existing tip
        this.hideTip();

        // Create tip notification
        this.currentTip = this.createTipElement(tipData);
        
        // Add to page
        document.body.appendChild(this.currentTip);

        // Animate in
        setTimeout(() => {
          this.currentTip.classList.add('energy-tip-show');
        }, 10);

        // Auto-hide after duration
        if (tipData.duration) {
          setTimeout(() => {
            this.hideTip();
          }, tipData.duration);
        }

        // Track this tip
        this.recordTipShown(tipData);

        console.log('[EnergyTipNotifications] Tip shown:', tipData.type);
      }

      hideTip() {
        if (!this.currentTip) return;

        this.currentTip.classList.remove('energy-tip-show');
        this.currentTip.classList.add('energy-tip-hide');

        setTimeout(() => {
          if (this.currentTip && this.currentTip.parentNode) {
            this.currentTip.parentNode.removeChild(this.currentTip);
          }
          this.currentTip = null;
        }, 300);
      }

      shouldShowTip(tipData) {
        const now = Date.now();
        
        // Check minimum time between tips
        if (now - this.lastTipTime < this.minimumTipInterval) {
          console.log('[EnergyTipNotifications] Skipping tip - too soon since last tip');
          return false;
        }

        // Check if this specific tip type was shown recently
        const tipKey = `${tipData.type}_${this.getDomain()}`;
        const lastShown = this.tipHistory.get(tipKey) || 0;
        const tipCooldown = tipData.cooldown || (30 * 60 * 1000); // 30 minutes default cooldown

        if (now - lastShown < tipCooldown) {
          console.log('[EnergyTipNotifications] Skipping tip - cooldown active for type:', tipData.type);
          return false;
        }

        // Check if user has dismissed this tip permanently
        const dismissKey = `tip_dismissed_${tipData.type}`;
        if (localStorage.getItem(dismissKey) === 'true') {
          console.log('[EnergyTipNotifications] Skipping tip - permanently dismissed:', tipData.type);
          return false;
        }

        return true;
      }

      recordTipShown(tipData) {
        const now = Date.now();
        this.lastTipTime = now;
        
        const tipKey = `${tipData.type}_${this.getDomain()}`;
        this.tipHistory.set(tipKey, now);
        
        // Clean up old history entries
        for (const [key, time] of this.tipHistory.entries()) {
          if (now - time > 24 * 60 * 60 * 1000) { // Remove entries older than 24 hours
            this.tipHistory.delete(key);
          }
        }
      }

      createTipElement(tipData) {
        const tip = document.createElement('div');
        tip.className = 'energy-tip-notification';
        tip.setAttribute('data-tip-type', tipData.type);

        // Determine urgency class
        const urgencyClass = this.getUrgencyClass(tipData.powerWatts || 0);
        tip.classList.add(`energy-tip-${urgencyClass}`);

        // Create structure using safe DOM methods (CSP-compliant)
        const content = document.createElement('div');
        content.className = 'energy-tip-content';

        // Create header
        const header = document.createElement('div');
        header.className = 'energy-tip-header';

        const icon = document.createElement('div');
        icon.className = 'energy-tip-icon';
        icon.textContent = '⚡';

        const title = document.createElement('div');
        title.className = 'energy-tip-title';
        title.textContent = tipData.title || 'Energy Tip';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'energy-tip-close';
        closeBtn.setAttribute('aria-label', 'Close tip');
        closeBtn.textContent = '×';

        header.appendChild(icon);
        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create message
        const message = document.createElement('div');
        message.className = 'energy-tip-message';
        message.textContent = tipData.message;

        // Create power info
        const power = document.createElement('div');
        power.className = 'energy-tip-power';
        power.textContent = `Power usage: ${tipData.powerWatts}W`;

        // Create actions container
        const actions = document.createElement('div');
        actions.className = 'energy-tip-actions';

        // Create action button if needed
        let actionBtn = null;
        if (tipData.actionText) {
          actionBtn = document.createElement('button');
          actionBtn.className = 'energy-tip-action';
          actionBtn.textContent = tipData.actionText;
          actions.appendChild(actionBtn);
        }

        // Create dismiss button
        const dismissBtn = document.createElement('button');
        dismissBtn.className = 'energy-tip-dismiss';
        dismissBtn.textContent = "Don't show again";
        actions.appendChild(dismissBtn);

        // Assemble the tip
        content.appendChild(header);
        content.appendChild(message);
        content.appendChild(power);
        content.appendChild(actions);
        tip.appendChild(content);

        // Add event listeners

        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.hideTip();
        });

        dismissBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.dismissTipPermanently(tipData.type);
          this.hideTip();
        });

        if (actionBtn && tipData.action) {
          actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.executeTipAction(tipData.action, tipData);
          });
        }

        // Close on escape key
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            this.hideTip();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);

        return tip;
      }

      getUrgencyClass(powerWatts) {
        if (powerWatts >= 50) return 'urgent'; // Red
        if (powerWatts >= 35) return 'warning'; // Orange/Yellow
        return 'info'; // Green
      }

      dismissTipPermanently(tipType) {
        const dismissKey = `tip_dismissed_${tipType}`;
        localStorage.setItem(dismissKey, 'true');
        console.log('[EnergyTipNotifications] Tip permanently dismissed:', tipType);
      }

      async executeTipAction(action, tipData) {
        try {
          switch (action) {
            case 'refresh_page':
              window.location.reload();
              break;
              
            case 'pause_media':
              this.pauseMediaElements();
              this.hideTip();
              break;
              
            case 'reduce_animations':
              this.reduceAnimations();
              this.hideTip();
              break;
              
            case 'close_tab':
              // Send message to service worker to close tab
              await window.safeSendMessage({ type: 'CLOSE_CURRENT_TAB' });
              break;
              
            case 'open_settings':
              await window.safeSendMessage({ type: 'OPEN_SETTINGS' });
              this.hideTip();
              break;
              
            default:
              console.warn('[EnergyTipNotifications] Unknown action:', action);
              this.hideTip();
          }
        } catch (error) {
          console.error('[EnergyTipNotifications] Action execution failed:', error);
          this.hideTip();
        }
      }

      pauseMediaElements() {
        const mediaElements = document.querySelectorAll('video, audio');
        let pausedCount = 0;
        
        mediaElements.forEach(element => {
          if (!element.paused) {
            element.pause();
            pausedCount++;
          }
        });
        
        if (pausedCount > 0) {
          this.showActionFeedback(`Paused ${pausedCount} media element${pausedCount > 1 ? 's' : ''}`);
        }
      }

      reduceAnimations() {
        // Add a style to reduce animations
        let animationStyle = document.getElementById('energy-tip-animation-reducer');
        if (!animationStyle) {
          animationStyle = document.createElement('style');
          animationStyle.id = 'energy-tip-animation-reducer';
          animationStyle.textContent = `
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          `;
          document.head.appendChild(animationStyle);
          this.showActionFeedback('Animations reduced to save energy');
        }
      }

      showActionFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'energy-tip-feedback';
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
          feedback.classList.add('energy-tip-feedback-show');
        }, 10);
        
        setTimeout(() => {
          feedback.classList.remove('energy-tip-feedback-show');
          setTimeout(() => {
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 300);
        }, 3000);
      }

      getDomain() {
        try {
          return new URL(window.location.href).hostname;
        } catch (e) {
          return 'unknown';
        }
      }

      cleanup() {
        console.log('[EnergyTipNotifications] Cleaning up...');
        this.hideTip();
        this.isInitialized = false;
        
        // Remove styles if they exist
        const styles = document.getElementById('energy-tip-styles');
        if (styles && styles.parentNode) {
          styles.parentNode.removeChild(styles);
        }

        // Clean up animation reducer
        const animationStyle = document.getElementById('energy-tip-animation-reducer');
        if (animationStyle && animationStyle.parentNode) {
          animationStyle.parentNode.removeChild(animationStyle);
        }
      }

      injectTipStyles() {
        // Check if styles already injected
        if (document.getElementById('energy-tip-styles')) {
          return;
        }

        const styles = document.createElement('style');
        styles.id = 'energy-tip-styles';
        styles.textContent = `
          .energy-tip-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 320px;
            max-width: calc(100vw - 40px);
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid #e1e5e9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 2147483647;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
          }

          .energy-tip-notification.energy-tip-show {
            opacity: 1;
            transform: translateY(0);
          }

          .energy-tip-notification.energy-tip-hide {
            opacity: 0;
            transform: translateY(20px);
          }

          .energy-tip-notification.energy-tip-urgent {
            border-left: 4px solid #dc3545;
          }

          .energy-tip-notification.energy-tip-warning {
            border-left: 4px solid #ffc107;
          }

          .energy-tip-notification.energy-tip-info {
            border-left: 4px solid #28a745;
          }

          .energy-tip-content {
            padding: 16px;
          }

          .energy-tip-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }

          .energy-tip-icon {
            font-size: 18px;
            margin-right: 8px;
          }

          .energy-tip-title {
            font-weight: 600;
            color: #1a1a1a;
            flex: 1;
          }

          .energy-tip-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #666;
            cursor: pointer;
            padding: 4px;
            line-height: 1;
            border-radius: 4px;
            transition: background-color 0.2s;
          }

          .energy-tip-close:hover {
            background-color: #f5f5f5;
            color: #333;
          }

          .energy-tip-message {
            color: #4a4a4a;
            line-height: 1.4;
            margin-bottom: 6px;
          }

          .energy-tip-power {
            color: #666;
            font-size: 12px;
            margin-bottom: 12px;
          }

          .energy-tip-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .energy-tip-action {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: background-color 0.2s;
            font-weight: 500;
          }

          .energy-tip-action:hover {
            background: #0056b3;
          }

          .energy-tip-dismiss {
            background: none;
            color: #666;
            border: 1px solid #ddd;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .energy-tip-dismiss:hover {
            background: #f5f5f5;
            border-color: #bbb;
            color: #333;
          }

          .energy-tip-feedback {
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            z-index: 2147483646;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
          }

          .energy-tip-feedback.energy-tip-feedback-show {
            opacity: 1;
            transform: translateY(0);
          }

          @media (max-width: 480px) {
            .energy-tip-notification {
              bottom: 10px;
              right: 10px;
              left: 10px;
              width: auto;
              max-width: none;
            }

            .energy-tip-actions {
              flex-direction: column;
            }

            .energy-tip-action,
            .energy-tip-dismiss {
              width: 100%;
              justify-content: center;
            }
          }

          @media (prefers-color-scheme: dark) {
            .energy-tip-notification {
              background: #2d3748;
              border-color: #4a5568;
              color: #e2e8f0;
            }

            .energy-tip-title {
              color: #f7fafc;
            }

            .energy-tip-message {
              color: #cbd5e0;
            }

            .energy-tip-power {
              color: #a0aec0;
            }

            .energy-tip-close:hover {
              background-color: #4a5568;
              color: #e2e8f0;
            }

            .energy-tip-dismiss {
              border-color: #4a5568;
              color: #a0aec0;
            }

            .energy-tip-dismiss:hover {
              background: #4a5568;
              border-color: #718096;
              color: #e2e8f0;
            }
          }
        `;

        document.head.appendChild(styles);
        console.log('[EnergyTipNotifications] Styles injected');
      }
    };
  }

  // Add global message listener for service worker communication
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[ContentScript] Received message:', message.type);
    
    if (message.type === 'PING') {
      console.log('[ContentScript] Responding to PING from service worker');
      sendResponse({ success: true, message: 'Content script alive' });
      return true;
    } else if (message.type === 'COLLECT_IMMEDIATE_METRICS') {
      console.log('[ContentScript] Forcing immediate metrics collection');
      if (window.__energyTrackerInstance && typeof window.__energyTrackerInstance.collectAndSendMetrics === 'function') {
        try {
          window.__energyTrackerInstance.collectAndSendMetrics();
          sendResponse({ success: true, message: 'Immediate collection triggered' });
        } catch (error) {
          console.error('[ContentScript] Immediate collection failed:', error);
          sendResponse({ success: false, error: error.message });
        }
      } else {
        console.warn('[ContentScript] Energy tracker instance not available');
        sendResponse({ success: false, error: 'Energy tracker not available' });
      }
      return true;
    }
    
    // Let other listeners handle other message types
    return false;
  });

  // Store instances for cleanup
  window.__energyTrackerInstance = new window.PageEnergyMonitor();
  window.__energyTipInstance = new window.EnergyTipNotifications();
  
  // Load the enhanced notification system
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content-script-notifications.js');
  script.onload = () => {
    console.log('[ContentScript] Enhanced notification system loaded');
    // Replace the old notification system with the new one
    if (window.__powerAINotificationManager) {
      window.__energyTipInstance.cleanup();
      window.__energyTipInstance = window.__powerAINotificationManager;
    }
  };
  (document.head || document.documentElement).appendChild(script);
  
  // Mark as loaded to prevent redeclaration
  window.__energyTrackerContentLoaded = true;

  console.log('[ContentScript] Energy tracking initialized for:', window.location.href);

})();
