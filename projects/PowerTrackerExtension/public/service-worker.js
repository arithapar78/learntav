// background/service-worker.js
// EnergyTrackingApp — Manifest V3 service worker
// Robust against restarts, handles async sendResponse correctly, and
// never crashes the content script if the SW gets reloaded.

console.log('[EnergyTracker] SW loaded');

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('[EnergyTracker] Extension startup detected');
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[EnergyTracker] Extension installed/updated');
});

// Global flags for dependency availability
let POWER_CALCULATOR_AVAILABLE = false;
let DATA_MIGRATION_AVAILABLE = false;
let AGENT_SYSTEM_AVAILABLE = false;

// Import PowerCalculator for watts-based energy measurement and DataMigrationUtility
try {
  importScripts('power-calculator.js');
  POWER_CALCULATOR_AVAILABLE = true;
  console.log('[EnergyTracker] PowerCalculator loaded successfully');
} catch (error) {
  console.warn('[EnergyTracker] PowerCalculator not available:', error.message);
}

try {
  importScripts('data-migration.js');
  DATA_MIGRATION_AVAILABLE = true;
  console.log('[EnergyTracker] DataMigrationUtility loaded successfully');
} catch (error) {
  console.warn('[EnergyTracker] DataMigrationUtility not available:', error.message);
}

// Import Enhanced Power Tracker with Agent System and Enhanced Integration
let ENHANCED_INTEGRATION_AVAILABLE = false;

try {
  importScripts('energy-tracker-with-agent.js');
  AGENT_SYSTEM_AVAILABLE = true;
  console.log('[EnergyTracker] Agent system loaded successfully');
} catch (error) {
  console.warn('[EnergyTracker] Agent system not available:', error.message);
  console.log('[EnergyTracker] Falling back to base EnergyTracker');
}

// Try to load enhanced AI energy database and integration
try {
  importScripts('enhanced-ai-energy-database.js');
  console.log('[EnergyTracker] Enhanced AI energy database loaded successfully');
} catch (error) {
  console.warn('[EnergyTracker] Enhanced AI database not available:', error.message);
}

try {
  importScripts('energy-tracker-enhanced-integration.js');
  ENHANCED_INTEGRATION_AVAILABLE = true;
  console.log('[EnergyTracker] Enhanced integration loaded successfully');
} catch (error) {
  console.warn('[EnergyTracker] Enhanced integration not available:', error.message);
}

console.log('[EnergyTracker] Dependency status - PowerCalculator:', POWER_CALCULATOR_AVAILABLE, 'DataMigration:', DATA_MIGRATION_AVAILABLE, 'AgentSystem:', AGENT_SYSTEM_AVAILABLE, 'EnhancedIntegration:', ENHANCED_INTEGRATION_AVAILABLE);

class EnergyTracker {
  constructor() {
    this.isReady = false;
    this.initPromise = null;

    // Initialize power calculator for watts-based measurements with enhanced safety
    this.powerCalculator = null;
    if (POWER_CALCULATOR_AVAILABLE) {
      try {
        if (typeof PowerCalculator !== 'undefined') {
          this.powerCalculator = new PowerCalculator();
          console.log('[EnergyTracker] PowerCalculator initialized successfully');
        } else {
          console.warn('[EnergyTracker] PowerCalculator class not found despite successful import');
        }
      } catch (error) {
        console.error('[EnergyTracker] PowerCalculator initialization failed:', error.message);
        this.powerCalculator = null;
      }
    }
    
    if (!this.powerCalculator) {
      console.log('[EnergyTracker] Using fallback power calculations');
    }
    
    // Initialize data migration utility with enhanced safety
    this.dataMigration = null;
    if (DATA_MIGRATION_AVAILABLE) {
      try {
        if (typeof DataMigrationUtility !== 'undefined') {
          this.dataMigration = new DataMigrationUtility();
          console.log('[EnergyTracker] DataMigrationUtility initialized successfully');
        } else {
          console.warn('[EnergyTracker] DataMigrationUtility class not found despite successful import');
        }
      } catch (error) {
        console.error('[EnergyTracker] DataMigrationUtility initialization failed:', error.message);
        this.dataMigration = null;
      }
    }
    
    if (!this.dataMigration) {
      console.log('[EnergyTracker] Migration features disabled - using fallback methods');
    }

    // Runtime state (in‑memory; OK to rebuild after SW restart)
    // Updated to track power consumption in watts instead of energy score
    this.currentTabs = new Map(); // tabId -> { startTime, lastUpdate, url, title, powerWatts, lastMetrics, powerData }

    // Kick off init
    this.initPromise = this.init();
  }

  async init() {
    if (this.isReady) return;
    console.log('[EnergyTracker] initializing…');

    // Check and run comprehensive data migration if needed
    await this.checkAndRunMigration();

    this.setupListeners();
    await this.ensureStorageDefaults();
    this.setupKeepAlive();

    this.isReady = true;
    console.log('[EnergyTracker] initialized');
  }

  /**
   * Check if comprehensive data migration is needed and run it
   */
  async checkAndRunMigration() {
    // Skip migration if DataMigrationUtility is not available
    if (!this.dataMigration) {
      console.log('[EnergyTracker] Migration skipped - DataMigrationUtility not available');
      return;
    }
    
    try {
      // Check if we've already attempted migration recently
      const { lastMigrationAttempt } = await chrome.storage.local.get('lastMigrationAttempt');
      const now = Date.now();
      const hoursSinceLastAttempt = (now - (lastMigrationAttempt || 0)) / (1000 * 60 * 60);
      
      // Don't retry migration if attempted within last 24 hours
      if (lastMigrationAttempt && hoursSinceLastAttempt < 24) {
        console.log('[EnergyTracker] Migration attempted recently, skipping');
        return;
      }
      
      console.log('[EnergyTracker] Checking comprehensive migration status...');
      const migrationStats = await this.dataMigration.getMigrationStats();
      
      if (!migrationStats.completed) {
        console.log('[EnergyTracker] Starting migration with safety checks...');
        
        // Create backup before migration
        const backupKey = `migration_backup_${Date.now()}`;
        await this.createSafetyBackup(backupKey);
        
        console.log('[EnergyTracker] Comprehensive migration needed, starting process...');
        const result = await this.dataMigration.migrateLegacyData();
        
        // Record attempt regardless of outcome
        await chrome.storage.local.set({ lastMigrationAttempt: now });
        
        if (result.success) {
          console.log('[EnergyTracker] Comprehensive migration completed successfully:', result.stats);
          
          // Show notification about successful migration
          if (chrome.notifications) {
            try {
              await chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon-48.png',
                title: 'PowerTracker - Data Migration Complete',
                message: `Successfully migrated ${result.stats.entriesMigrated} entries to the new power-based system.`
              });
            } catch (notificationError) {
              console.log('[EnergyTracker] Could not show migration notification:', notificationError);
            }
          }
        } else {
          console.error('[EnergyTracker] Comprehensive migration failed, backup available at:', backupKey);
          // Don't retry automatically - let user handle it
        }
      } else {
        console.log('[EnergyTracker] Comprehensive migration already completed at version:', migrationStats.version);
      }
    } catch (error) {
      console.error('[EnergyTracker] Comprehensive migration check failed:', error);
      // Record failed attempt to prevent infinite retries
      await chrome.storage.local.set({ lastMigrationAttempt: Date.now() });
    }
  }

  async createSafetyBackup(backupKey) {
    try {
      const data = await chrome.storage.local.get(['energyHistory', 'settings', 'backendEnergyHistory']);
      await chrome.storage.local.set({ [backupKey]: data });
      console.log('[EnergyTracker] Safety backup created:', backupKey);
    } catch (error) {
      console.error('[EnergyTracker] Failed to create safety backup:', error);
      throw new Error('Cannot proceed with migration - backup failed');
    }
  }

  setupListeners() {
    // Install/open welcome
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('[EnergyTracker] onInstalled:', details.reason);
      if (details.reason === 'install') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html?welcome=true') });
      }
    });

    chrome.runtime.onStartup.addListener(() => {
      console.log('[EnergyTracker] onStartup');
      this.init(); // best-effort
    });

    // Tab lifecycle
    chrome.tabs.onActivated.addListener(async (info) => {
      try {
        await this.startTrackingTab(info.tabId);
      } catch (e) {
        console.warn('[EnergyTracker] onActivated error:', e);
      }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      try {
        if (changeInfo.status === 'complete' && tab.url) {
          this.updateTabInfo(tabId, tab);
          if (!this.currentTabs.has(tabId)) {
            await this.startTrackingTab(tabId);
          }
        }
      } catch (e) {
        console.warn('[EnergyTracker] onUpdated error:', e);
      }
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.stopTrackingTab(tabId);
    });

    // Messages (popup + content + options) - Enhanced with robust error handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // CRITICAL FIX: Always respond to prevent "Receiving end does not exist" errors
      const handleRequest = async () => {
        try {
          // Ensure service worker is initialized
          if (!this.initPromise) {
            this.initPromise = this.init();
          }
          await this.initPromise;

          switch (message.type) {
            case 'ENERGY_DATA': {
              const tabId = sender.tab?.id;
              if (tabId) await this.processEnergyData(tabId, message.data);
              return { success: true };
            }
            case 'GET_CURRENT_ENERGY': {
              const data = await this.getCurrentEnergySnapshot();
              return { success: true, data };
            }
            case 'ENSURE_TAB_TRACKING': {
              const tabId = message.tabId;
              const tabInfo = message.tabInfo;
              console.log('[EnergyTracker] Ensuring tab tracking for:', tabId, tabInfo?.url?.substring(0, 50));
              
              if (tabId && tabInfo) {
                // Force start tracking this tab
                const trackingStarted = await this.startTrackingTab(tabId);
                
                // Update tab info if we have current data
                if (this.currentTabs.has(tabId)) {
                  const currentData = this.currentTabs.get(tabId);
                  this.currentTabs.set(tabId, {
                    ...currentData,
                    url: tabInfo.url || currentData.url,
                    title: tabInfo.title || currentData.title,
                    lastUpdate: Date.now()
                  });
                }
                
                // Enhanced content script injection with safety checks
                let contentScriptInjected = false;
                try {
                  // Check if we can inject into this tab
                  const tab = await chrome.tabs.get(tabId);
                  const canInject = tab && tab.url &&
                    (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                    !tab.url.includes('chrome://') && !tab.url.includes('chrome-extension://');
                  
                  if (canInject) {
                    await chrome.scripting.executeScript({
                      target: { tabId },
                      files: ['content-script.js']
                    });
                    contentScriptInjected = true;
                    console.log('[EnergyTracker] Content script injected successfully for tab:', tabId);
                  } else {
                    console.log('[EnergyTracker] Cannot inject content script into tab:', tab?.url?.substring(0, 50));
                  }
                } catch (scriptError) {
                  console.log('[EnergyTracker] Content script injection failed:', scriptError.message);
                }
                
                return {
                  success: true,
                  tracking: this.currentTabs.has(tabId),
                  contentScriptInjected: contentScriptInjected,
                  trackingStarted: trackingStarted
                };
              }
              return { success: false, error: 'Invalid tab info provided' };
            }
            case 'GET_SETTINGS': {
              const settings = await this.getSettings();
              return { success: true, settings };
            }
            case 'UPDATE_SETTINGS': {
              await this.updateSettings(message.settings);
              return { success: true };
            }
            case 'GET_HISTORY': {
              const history = await this.getEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'GET_BACKEND_ENERGY_HISTORY': {
              const history = await this.getBackendEnergyHistory(message.timeRange);
              return { success: true, history };
            }
            case 'LOG_BACKEND_ENERGY': {
              await this.logBackendEnergy(message.entry);
              return { success: true };
            }
            case 'DELETE_BACKEND_ENERGY_ENTRY': {
              await this.deleteBackendEnergyEntry(message.entryId);
              return { success: true };
            }
            case 'GET_BACKEND_ENERGY_SUMMARY': {
              const data = await this.getBackendEnergySummary(message.timeRange);
              return { success: true, data };
            }
            case 'GET_POWER_SUMMARY': {
              const data = await this.getPowerSummary(message.timeRange);
              return { success: true, data };
            }
            case 'MIGRATE_LEGACY_DATA': {
              if (this.dataMigration) {
                const result = await this.dataMigration.migrateLegacyData();
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'GET_MIGRATION_STATUS': {
              if (this.dataMigration) {
                const stats = await this.dataMigration.getMigrationStats();
                return { success: true, ...stats };
              } else {
                return { success: true, completed: false, error: 'Migration utility not available' };
              }
            }
            case 'RESTORE_FROM_BACKUP': {
              if (this.dataMigration) {
                const result = await this.dataMigration.restoreFromBackup(message.backupKey);
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'CLEANUP_OLD_BACKUPS': {
              if (this.dataMigration) {
                const result = await this.dataMigration.cleanupOldBackups(message.keepCount);
                return result;
              } else {
                return { success: false, error: 'Migration utility not available' };
              }
            }
            case 'CLOSE_CURRENT_TAB': {
              // Get the sender's tab ID and close it
              const tabId = sender.tab?.id;
              if (tabId) {
                await chrome.tabs.remove(tabId);
                return { success: true };
              }
              return { success: false, error: 'No tab to close' };
            }
            case 'OPEN_SETTINGS': {
              await chrome.tabs.create({
                url: chrome.runtime.getURL('options.html?tab=settings')
              });
              return { success: true };
            }
            case 'HIDE_ENERGY_TIP': {
              // Forward to content script if needed
              const tabId = sender.tab?.id;
              if (tabId) {
                try {
                  await chrome.tabs.sendMessage(tabId, { type: 'HIDE_ENERGY_TIP' });
                  return { success: true };
                } catch (e) {
                  return { success: false, error: 'Could not hide tip' };
                }
              }
              return { success: true };
            }
            case 'EXECUTE_TIP_ACTION': {
              // Handle notification actions
              const result = await this.executeTipAction(message.action, message.notificationData, sender.tab?.id);
              return result;
            }
            case 'GET_NOTIFICATION_SETTINGS': {
              const settings = await this.getNotificationSettings();
              return { success: true, settings };
            }
            case 'UPDATE_NOTIFICATION_SETTINGS': {
              await this.updateNotificationSettings(message.settings);
              return { success: true };
            }
            case 'PING': {
              return { success: true, message: 'Service worker alive' };
            }
            case 'SHOW_ENERGY_TIP': {
              // Handle tip display request
              return { success: true };
            }
            default:
              return { success: false, error: 'Unknown message type: ' + message.type };
          }
        } catch (error) {
          console.error('[EnergyTracker] Message handling error:', error);
          return { success: false, error: error.message || String(error) };
        }
      };

      // Handle async responses properly with timeout protection
      handleRequest().then(response => {
        try {
          if (sendResponse) {
            sendResponse(response);
          }
        } catch (responseError) {
          console.error('[EnergyTracker] Send response error:', responseError);
        }
      }).catch(error => {
        console.error('[EnergyTracker] Async handler error:', error);
        try {
          if (sendResponse) {
            sendResponse({ success: false, error: error.message || String(error) });
          }
        } catch (responseError) {
          console.error('[EnergyTracker] Error response failed:', responseError);
        }
      });

      // Return true to indicate async response
      return true;
    });

    // Alarms (keep SW warm + cleanup)
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      try {
        if (alarm.name === 'et_process') {
          await this.periodicCleanup();
        }
      } catch (e) {
        console.warn('[EnergyTracker] alarm error:', e);
      }
    });
  }

  setupKeepAlive() {
    // 1) periodic alarm keeps the SW from going cold forever
    try {
      chrome.alarms.create('et_process', { periodInMinutes: 1 });
    } catch (e) {
      console.warn('[EnergyTracker] failed to create alarm:', e);
    }
  }

  async ensureStorageDefaults() {
    try {
      const { settings, energyHistory } = await chrome.storage.local.get(['settings', 'energyHistory']);
      if (!settings) {
        await chrome.storage.local.set({
          settings: {
            trackingEnabled: true,
            notificationsEnabled: true,
            energyThreshold: 75,
            dataRetentionDays: 30,
            samplingInterval: 5000
          }
        });
      }
      if (!energyHistory) {
        await chrome.storage.local.set({ energyHistory: [] });
      }
    } catch (e) {
      console.warn('[EnergyTracker] storage init failed:', e);
    }
  }

  async startTrackingTab(tabId) {
    // validate tab exists
    let tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch {
      console.log('[EnergyTracker] Tab', tabId, 'no longer exists');
      return false;
    }
    if (!tab?.url) {
      console.log('[EnergyTracker] Tab', tabId, 'has no URL');
      return false;
    }

    // skip system/extension pages
    const u = tab.url;
    if (
      u.startsWith('chrome://') || u.startsWith('edge://') || u.startsWith('about:') ||
      u.startsWith('moz-extension://') || u.startsWith('chrome-extension://') ||
      u === 'chrome://newtab/' || u === 'about:blank'
    ) {
      console.log('[EnergyTracker] Skipping system page:', u.substring(0, 50));
      return false;
    }
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      console.log('[EnergyTracker] Skipping non-http URL:', u.substring(0, 50));
      return false;
    }

    // Check if already tracking
    if (this.currentTabs.has(tabId)) {
      console.log('[EnergyTracker] Already tracking tab', tabId);
      // Update existing data
      const existingData = this.currentTabs.get(tabId);
      this.currentTabs.set(tabId, {
        ...existingData,
        url: tab.url,
        title: tab.title || existingData.title || 'Unknown',
        lastUpdate: Date.now()
      });
      return true;
    }

    console.log('[EnergyTracker] Starting to track new tab:', tabId, u.substring(0, 50));

    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-script.js']
      });
      
      // Wait for content script to be ready with timeout
      const isReady = await this.waitForContentScriptReady(tabId);
      console.log('[EnergyTracker] Content script ready for tab', tabId, ':', isReady);
    } catch (e) {
      // Some sites disallow injection; that's fine.
      console.log('[EnergyTracker] Content script injection skipped for tab', tabId, ':', e?.message || e);
    }

    // Create initial tab data
    const tabData = {
      startTime: Date.now(),
      lastUpdate: Date.now(),
      url: tab.url,
      title: tab.title || 'Unknown',
      powerWatts: 8.0, // Default idle browsing power consumption
      energyScore: 0, // Keep for migration compatibility
      lastMetrics: null,
      powerData: null,
      isNew: true
    };

    this.currentTabs.set(tabId, tabData);

    console.log('[EnergyTracker] Now tracking tab', tabId, 'Total tabs:', this.currentTabs.size);
    return true;
  }

  async waitForContentScriptReady(tabId, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'PING' });
        return true; // Content script is ready
      } catch (e) {
        if (i === maxRetries - 1) {
          console.warn('[EnergyTracker] Content script not ready after', maxRetries, 'attempts');
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      }
    }
  }

  stopTrackingTab(tabId) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;

    this.saveHistoryEntry(tabId, data).catch((e) => {
      console.warn('[EnergyTracker] save on close failed:', e);
    });
    this.currentTabs.delete(tabId);
  }

  updateTabInfo(tabId, tab) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;
    data.url = tab.url || data.url;
    data.title = tab.title || data.title;
    data.lastUpdate = Date.now();
    this.currentTabs.set(tabId, data);
  }

  async processEnergyData(tabId, metrics) {
    const data = this.currentTabs.get(tabId);
    if (!data) return;

    // Calculate power consumption using new system
    const powerData = this.calculatePowerConsumption(metrics, data);
    const powerWatts = powerData.totalWatts;
    
    // Keep legacy energy score for migration compatibility
    const legacyScore = this.calculateLegacyEnergyScore(metrics);
    
    data.powerWatts = powerWatts;
    data.energyScore = legacyScore; // Maintain compatibility
    data.powerData = powerData;
    data.lastMetrics = metrics;
    data.lastUpdate = Date.now();
    this.currentTabs.set(tabId, data);

    // Show browser notification for high power (legacy)
    await this.maybeNotifyHighPower(powerWatts);
    
    // Show contextual in-tab tip (new feature)
    await this.maybeShowEnergyTip(tabId, powerWatts, data);
  }

  calculatePowerConsumption(metrics, tabData) {
    // Enhanced metrics with tab context
    const enhancedMetrics = {
      ...metrics,
      url: tabData.url,
      title: tabData.title,
      // Add timestamp for activity calculations
      timestamp: Date.now(),
      tabStartTime: tabData.startTime
    };

    // Use PowerCalculator if available, otherwise use fallback
    if (this.powerCalculator) {
      return this.powerCalculator.calculatePowerConsumption(enhancedMetrics);
    } else {
      return this.fallbackCalculatePowerConsumption(enhancedMetrics);
    }
  }
  
  /**
   * Fallback power calculation when PowerCalculator is not available
   */
  fallbackCalculatePowerConsumption(metrics) {
    const domNodes = metrics.domNodes || 0;
    const cpuElements = metrics.cpuIntensiveElements?.count || 0;
    const videos = metrics.cpuIntensiveElements?.videos || 0;
    const url = metrics.url || '';
    
    // Simple fallback calculation
    let watts = 8.5; // Base idle power
    
    // Add power based on DOM complexity
    if (domNodes > 2000) watts += (domNodes - 2000) * 0.001;
    
    // Add power based on CPU intensive elements
    watts += cpuElements * 0.4;
    watts += videos * 6.2;
    
    // Site-specific adjustments
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube') || urlLower.includes('video')) {
      watts *= 1.4;
    } else if (urlLower.includes('game')) {
      watts *= 1.6;
    }
    
    // Ensure realistic bounds
    watts = Math.max(6, Math.min(65, watts));
    
    return {
      totalWatts: Math.round(watts * 10) / 10,
      breakdown: {
        baseline: 8.5,
        dom: Math.min((domNodes - 2000) * 0.001, 5),
        cpu: Math.min(cpuElements * 0.4 + videos * 6.2, 20)
      },
      confidence: 0.6,
      methodology: 'fallback'
    };
  }

  // Keep legacy calculation for backward compatibility and migration
  calculateLegacyEnergyScore(m) {
    // simple weighted model (0–100)
    const {
      // try to read values from our content metrics; fallback to 0
      cpuUsage = 0,
      memoryUsage = 0,
      resources = null,
      domNodes = 0,
      rendering = null
    } = m || {};

    // derive some hints if present
    const networkRequests = resources?.totalRequests || m?.activeConnections?.recentRequests || 0;
    const renderingTime = (rendering && typeof rendering['first-contentful-paint'] === 'number')
      ? rendering['first-contentful-paint']
      : 0;

    const cpuScore = Math.min(cpuUsage * 2, 40);          // 0–40
    const memScore = Math.min(memoryUsage / 10, 20);      // 0–20
    const netScore = Math.min(networkRequests * 0.5, 20); // 0–20
    const domScore = Math.min(domNodes / 100, 10);        // 0–10
    const renScore = Math.min(renderingTime / 10, 10);    // 0–10

    return Math.round(cpuScore + memScore + netScore + domScore + renScore);
  }

  async maybeNotifyHighPower(powerWatts) {
    try {
      const s = await this.getSettings();
      if (s.notificationsEnabled) {
        // Convert threshold to watts (75% threshold ≈ 40W for high power usage)
        const powerThreshold = this.convertThresholdToWatts(s.energyThreshold);
        
        if (powerWatts > powerThreshold) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon-48.png',
            title: 'High Power Consumption',
            message: `This tab is using ${powerWatts}W of power. Consider closing or optimizing it.`
          });
        }
      }
    } catch (e) {
      console.warn('[EnergyTracker] notify failed:', e);
    }
  }

  // Enhanced method for contextual in-tab tips
  async maybeShowEnergyTip(tabId, powerWatts, tabData) {
    try {
      const s = await this.getSettings();
      const notificationSettings = await this.getNotificationSettings();
      
      if (!s.notificationsEnabled || !notificationSettings.enabled) return;

      // Check if tab has been consuming power for sustained period
      const sustainedDuration = 30 * 1000; // 30 seconds
      const now = Date.now();
      const tabStartTime = tabData.startTime || now;
      const tabDuration = now - tabStartTime;

      // Different thresholds based on power level
      const shouldShowTip =
        (powerWatts >= 45 && tabDuration >= sustainedDuration) ||        // High power after 30s
        (powerWatts >= 35 && tabDuration >= 2 * sustainedDuration) ||    // Medium power after 1min
        (powerWatts >= 25 && tabDuration >= 5 * sustainedDuration) ||    // Moderate power after 2.5min
        (powerWatts < 20 && tabDuration >= 10 * sustainedDuration);      // Achievement for efficient browsing

      if (shouldShowTip) {
        // Generate advanced contextual tip
        const tipData = this.generateAdvancedContextualTip(powerWatts, tabData, notificationSettings);
        
        if (tipData) {
          // Send tip to content script (enhanced notification system)
          try {
            await chrome.tabs.sendMessage(tabId, {
              type: 'SHOW_ENERGY_TIP',
              tipData: tipData
            });
            console.log('[EnergyTracker] Advanced tip sent to tab:', tabId, tipData.type);
          } catch (contentScriptError) {
            console.log('[EnergyTracker] Could not send tip to content script:', contentScriptError);
            // Fallback to browser notification
            if (chrome.notifications) {
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon-48.png',
                title: tipData.title || 'Power AI Tip',
                message: tipData.message
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[EnergyTracker] contextual tip failed:', e);
    }
  }

  // Convert legacy energy threshold percentage to watts
  convertThresholdToWatts(thresholdPercent) {
    // Map 0-100% threshold to realistic watts ranges
    // 0% = 5W (minimum active browsing)
    // 50% = 25W (moderate usage)
    // 75% = 40W (high usage threshold)
    // 100% = 60W+ (very high usage)
    return 5 + (thresholdPercent / 100) * 55;
  }

  // Legacy method for backward compatibility
  async maybeNotifyHighEnergy(score) {
    try {
      const s = await this.getSettings();
      if (s.notificationsEnabled && score > s.energyThreshold) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon-48.png',
          title: 'High Energy Consumption',
          message: `This tab is using ${score}% energy. Consider closing or optimizing.`
        });
      }
    } catch (e) {
      console.warn('[EnergyTracker] notify failed:', e);
    }
  }

  async getCurrentEnergySnapshot() {
    console.log('[EnergyTracker] Getting current energy snapshot, in-memory tabs:', this.currentTabs.size);
    
    const out = {};
    
    // First, try to get data from in-memory cache
    for (const [tabId, data] of this.currentTabs.entries()) {
      try {
        await chrome.tabs.get(tabId);
        const duration = Date.now() - (data.startTime || Date.now());
        
        out[tabId] = {
          // New watts-based data (primary)
          powerWatts: data.powerWatts || 8.0,
          powerData: data.powerData,
          
          // Legacy energy score (for compatibility)
          energyScore: data.energyScore || 0,
          
          // Common data
          url: data.url || '',
          title: data.title || 'Unknown',
          domNodes: data.lastMetrics?.domNodes || 0,
          duration: duration,
          timestamp: data.lastUpdate || Date.now(),
          
          // Energy consumption calculations
          energyConsumption: this.powerCalculator?.calculateEnergyConsumption(
            data.powerWatts || 8.0,
            duration
          ) || { kWh: 0, cost: 0 }
        };
      } catch {
        this.currentTabs.delete(tabId);
      }
    }
    
    // If no in-memory data, try to recover from persistent storage
    if (Object.keys(out).length === 0) {
      console.log('[EnergyTracker] No in-memory data, attempting recovery from storage...');
      try {
        const { currentTabsSnapshot } = await chrome.storage.local.get('currentTabsSnapshot');
        if (currentTabsSnapshot && typeof currentTabsSnapshot === 'object') {
          const now = Date.now();
          
          // Only use recent data (within last 10 minutes)
          for (const [tabId, data] of Object.entries(currentTabsSnapshot)) {
            if (data && (now - (data.lastUpdate || 0)) < 600000) {
              try {
                await chrome.tabs.get(parseInt(tabId));
                out[tabId] = {
                  ...data,
                  timestamp: data.lastUpdate || now,
                  isRecovered: true,
                  dataSource: 'recovered_storage'
                };
                console.log('[EnergyTracker] Recovered data for tab:', tabId);
              } catch {
                // Tab no longer exists
              }
            }
          }
        }
      } catch (storageError) {
        console.warn('[EnergyTracker] Storage recovery failed:', storageError);
      }
    }
    
    // Persist current snapshot for future recovery
    if (Object.keys(out).length > 0) {
      try {
        await chrome.storage.local.set({
          currentTabsSnapshot: out,
          lastSnapshotTime: Date.now()
        });
      } catch (persistError) {
        console.warn('[EnergyTracker] Failed to persist snapshot:', persistError);
      }
    }
    
    console.log('[EnergyTracker] Returning energy snapshot with', Object.keys(out).length, 'tabs');
    return out;
  }

  async getSettings() {
    const defaultSettings = {
      trackingEnabled: true,
      notificationsEnabled: true,
      energyThreshold: 75,
      powerThreshold: 40, // Add power threshold with default
      dataRetentionDays: 30,
      samplingInterval: 5000
    };

    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('[EnergyTracker] Chrome storage API not available');
        return defaultSettings;
      }

      const { settings } = await chrome.storage.local.get('settings');
      if (!settings || typeof settings !== 'object') {
        console.log('[EnergyTracker] No valid settings found, using defaults');
        return defaultSettings;
      }

      // Merge with defaults to ensure all required properties exist
      return { ...defaultSettings, ...settings };
    } catch (error) {
      console.error('[EnergyTracker] Failed to load settings:', error.message);
      return defaultSettings;
    }
  }

  async updateSettings(newSettings) {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('[EnergyTracker] Chrome storage API not available for settings update');
        return false;
      }

      if (!newSettings || typeof newSettings !== 'object') {
        console.error('[EnergyTracker] Invalid settings provided for update');
        return false;
      }

      // Sanitize settings before saving
      const sanitizedSettings = this.sanitizeSettings(newSettings);
      await chrome.storage.local.set({ settings: sanitizedSettings });
      console.log('[EnergyTracker] Settings updated successfully');
      return true;
    } catch (error) {
      console.error('[EnergyTracker] Failed to update settings:', error.message);
      return false;
    }
  }

  /**
   * Sanitize settings to ensure valid values
   */
  sanitizeSettings(settings) {
    const sanitized = { ...settings };
    
    // Ensure boolean values
    if (typeof sanitized.trackingEnabled !== 'boolean') {
      sanitized.trackingEnabled = true;
    }
    if (typeof sanitized.notificationsEnabled !== 'boolean') {
      sanitized.notificationsEnabled = true;
    }
    
    // Ensure numeric values are within valid ranges
    if (typeof sanitized.energyThreshold !== 'number' || sanitized.energyThreshold < 0 || sanitized.energyThreshold > 100) {
      sanitized.energyThreshold = 75;
    }
    if (typeof sanitized.powerThreshold !== 'number' || sanitized.powerThreshold < 5 || sanitized.powerThreshold > 100) {
      sanitized.powerThreshold = 40;
    }
    if (typeof sanitized.dataRetentionDays !== 'number' || sanitized.dataRetentionDays < 1 || sanitized.dataRetentionDays > 365) {
      sanitized.dataRetentionDays = 30;
    }
    if (typeof sanitized.samplingInterval !== 'number' || sanitized.samplingInterval < 1000 || sanitized.samplingInterval > 60000) {
      sanitized.samplingInterval = 5000;
    }
    
    return sanitized;
  }

  async getEnergyHistory(timeRange = '24h') {
    try {
      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      const now = Date.now();
      const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const dur = windows[timeRange] ?? windows['24h'];
      const cutoff = now - dur;
      return energyHistory.filter(e => e.timestamp > cutoff);
    } catch {
      return [];
    }
  }

  async saveHistoryEntry(tabId, data) {
    const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
    const duration = Math.max(0, Date.now() - (data.startTime || Date.now()));
    const powerWatts = data.powerWatts || 8.0;
    
    // Calculate energy consumption for this session
    const energyData = this.powerCalculator?.calculateEnergyConsumption(powerWatts, duration) ||
      this.fallbackCalculateEnergyConsumption(powerWatts, duration);
    
    const historyEntry = {
      timestamp: Date.now(),
      tabId,
      url: data.url,
      title: data.title,
      
      // New watts-based data (primary)
      powerWatts: powerWatts,
      energyKwh: energyData.kWh,
      energyCost: energyData.cost,
      co2Grams: energyData.co2Grams,
      
      // Legacy energy score (for backward compatibility)
      energyScore: data.energyScore || 0,
      
      // Duration and metadata
      duration: duration,
      powerData: data.powerData
    };
    
    energyHistory.push(historyEntry);

    // trim to avoid unbounded growth
    const MAX = 10000;
    if (energyHistory.length > MAX) {
      energyHistory.splice(0, energyHistory.length - MAX);
    }
    await chrome.storage.local.set({ energyHistory });
  }

  async periodicCleanup() {
    // delete old history beyond retention
    try {
      const s = await this.getSettings();
      const keepMs = (s.dataRetentionDays || 30) * 24 * 60 * 60 * 1000;
      const cutoff = Date.now() - keepMs;

      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      const filtered = energyHistory.filter(e => e.timestamp > cutoff);
      if (filtered.length !== energyHistory.length) {
        await chrome.storage.local.set({ energyHistory: filtered });
        console.log(`[EnergyTracker] cleaned ${energyHistory.length - filtered.length} old entries`);
      }
    } catch (e) {
      console.warn('[EnergyTracker] cleanup failed:', e);
    }
  }

  async getBackendEnergyHistory(timeRange = '7d') {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      const now = Date.now();
      const windows = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const dur = windows[timeRange] ?? windows['7d'];
      const cutoff = now - dur;
      return backendEnergyHistory.filter(e => e.timestamp > cutoff);
    } catch (e) {
      console.warn('[EnergyTracker] backend history failed:', e);
      return [];
    }
  }

  async logBackendEnergy(entry) {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      backendEnergyHistory.push(entry);
      
      // trim to avoid unbounded growth
      const MAX = 5000;
      if (backendEnergyHistory.length > MAX) {
        backendEnergyHistory.splice(0, backendEnergyHistory.length - MAX);
      }
      
      await chrome.storage.local.set({ backendEnergyHistory });
      console.log('[EnergyTracker] backend energy logged:', entry);
    } catch (e) {
      console.warn('[EnergyTracker] log backend energy failed:', e);
      throw e;
    }
  }

  async deleteBackendEnergyEntry(entryId) {
    try {
      const { backendEnergyHistory = [] } = await chrome.storage.local.get('backendEnergyHistory');
      const filtered = backendEnergyHistory.filter(e => e.id !== entryId);
      await chrome.storage.local.set({ backendEnergyHistory: filtered });
      console.log('[EnergyTracker] backend energy entry deleted:', entryId);
    } catch (e) {
      console.warn('[EnergyTracker] delete backend entry failed:', e);
      throw e;
    }
  }

  async getBackendEnergySummary(timeRange = '24h') {
    try {
      const history = await this.getBackendEnergyHistory(timeRange);
      const totalEnergy = history.reduce((sum, entry) => sum + (entry.energyConsumption || 0), 0);
      return {
        totalEnergy,
        recentEntries: history.slice(-10),
        entryCount: history.length
      };
    } catch (e) {
      console.warn('[EnergyTracker] backend summary failed:', e);
      return { totalEnergy: 0, recentEntries: [], entryCount: 0 };
    }
  }

  async getPowerSummary(timeRange = '24h') {
    try {
      const history = await this.getEnergyHistory(timeRange);
      
      // Calculate power-based statistics
      const totalEntries = history.length;
      const totalWatts = history.reduce((sum, entry) => sum + (entry.powerWatts || 0), 0);
      const totalKwh = history.reduce((sum, entry) => sum + (entry.energyKwh || 0), 0);
      const totalCost = history.reduce((sum, entry) => sum + (entry.energyCost || 0), 0);
      const totalCO2 = history.reduce((sum, entry) => sum + (entry.co2Grams || 0), 0);
      
      const averagePowerWatts = totalEntries > 0 ? totalWatts / totalEntries : 0;
      
      // Count efficiency levels
      const efficiencyLevels = {
        excellent: 0, // < 15W
        good: 0,      // 15-25W
        average: 0,   // 25-40W
        poor: 0       // > 40W
      };
      
      history.forEach(entry => {
        const watts = entry.powerWatts || 0;
        if (watts < 15) efficiencyLevels.excellent++;
        else if (watts < 25) efficiencyLevels.good++;
        else if (watts < 40) efficiencyLevels.average++;
        else efficiencyLevels.poor++;
      });
      
      // Find peak power usage
      const peakEntry = history.reduce((peak, entry) => {
        return (entry.powerWatts || 0) > (peak.powerWatts || 0) ? entry : peak;
      }, { powerWatts: 0 });
      
      return {
        totalEntries,
        averagePowerWatts: Math.round(averagePowerWatts * 10) / 10,
        totalEnergyKwh: Math.round(totalKwh * 10000) / 10000, // 4 decimal places
        totalCostUSD: Math.round(totalCost * 100) / 100, // 2 decimal places
        totalCO2Grams: Math.round(totalCO2),
        efficiencyLevels,
        peakPowerWatts: peakEntry.powerWatts || 0,
        peakPowerUrl: peakEntry.url || '',
        recentEntries: history.slice(-10)
      };
    } catch (e) {
      console.warn('[EnergyTracker] power summary failed:', e);
      return {
        totalEntries: 0,
        averagePowerWatts: 0,
        totalEnergyKwh: 0,
        totalCostUSD: 0,
        totalCO2Grams: 0,
        efficiencyLevels: { excellent: 0, good: 0, average: 0, poor: 0 },
        peakPowerWatts: 0,
        peakPowerUrl: '',
        recentEntries: []
      };
    }
  }

  async migrateLegacyEnergyData() {
    try {
      console.log('[EnergyTracker] Starting legacy data migration...');
      const { energyHistory = [] } = await chrome.storage.local.get('energyHistory');
      
      let migratedCount = 0;
      let alreadyMigratedCount = 0;
      
      const migratedHistory = energyHistory.map(entry => {
        // Check if entry already has power data
        if (entry.powerWatts !== undefined) {
          alreadyMigratedCount++;
          return entry;
        }
        
        // Migrate legacy energy score to watts
        const estimatedWatts = this.powerCalculator ?
          this.powerCalculator.migrateEnergyScoreToWatts(entry.energyScore || 0, { url: entry.url, title: entry.title }) :
          this.fallbackMigrateEnergyScore(entry.energyScore || 0);
        
        // Calculate energy consumption for the duration
        const energyData = this.powerCalculator ?
          this.powerCalculator.calculateEnergyConsumption(estimatedWatts, entry.duration || 0) :
          this.fallbackCalculateEnergyConsumption(estimatedWatts, entry.duration || 0);
        
        migratedCount++;
        
        return {
          ...entry,
          // New watts-based data
          powerWatts: estimatedWatts,
          energyKwh: energyData.kWh,
          energyCost: energyData.cost,
          co2Grams: energyData.co2Grams,
          // Mark as migrated
          migrated: true,
          migrationTimestamp: Date.now()
        };
      });
      
      // Save migrated data
      await chrome.storage.local.set({ energyHistory: migratedHistory });
      
      console.log(`[EnergyTracker] Migration complete: ${migratedCount} entries migrated, ${alreadyMigratedCount} already up-to-date`);
      
      return {
        migratedCount,
        alreadyMigratedCount,
        totalEntries: energyHistory.length
      };
      
    } catch (e) {
      console.error('[EnergyTracker] Migration failed:', e);
      return {
        error: e.message,
        migratedCount: 0,
        alreadyMigratedCount: 0,
        totalEntries: 0
      };
    }
  }
  
  /**
   * Fallback energy consumption calculation
   */
  fallbackCalculateEnergyConsumption(watts, durationMs) {
    const hours = durationMs / (1000 * 60 * 60);
    const kWh = (watts * hours) / 1000;
    
    return {
      watts: watts,
      durationHours: hours,
      kWh: kWh,
      cost: kWh * 0.12, // $0.12/kWh average US rate
      co2Grams: kWh * 500 // 500g CO2/kWh average
    };
  }
  
  /**
   * Fallback energy score to watts migration
   */
  fallbackMigrateEnergyScore(energyScore) {
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

  /**
   * Execute tip actions from the notification system
   */
  async executeTipAction(action, notificationData, tabId) {
    console.log('[EnergyTracker] Executing tip action:', action, 'for tab:', tabId);
    
    try {
      switch (action) {
        case 'pause_media':
          if (tabId) {
            // Send message to content script to pause media elements
            await chrome.tabs.sendMessage(tabId, {
              type: 'PAUSE_MEDIA_ELEMENTS'
            });
            return { success: true, message: 'Media elements paused' };
          }
          break;
          
        case 'reduce_animations':
          if (tabId) {
            // Send message to content script to reduce animations
            await chrome.tabs.sendMessage(tabId, {
              type: 'REDUCE_ANIMATIONS'
            });
            return { success: true, message: 'Animations reduced' };
          }
          break;
          
        case 'refresh_page':
          if (tabId) {
            await chrome.tabs.reload(tabId);
            return { success: true, message: 'Page refreshed' };
          }
          break;
          
        case 'close_tab':
          if (tabId) {
            await chrome.tabs.remove(tabId);
            return { success: true, message: 'Tab closed' };
          }
          break;
          
        case 'open_settings':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html?tab=settings')
          });
          return { success: true, message: 'Settings opened' };
          
        case 'show_history':
          await chrome.tabs.create({
            url: chrome.runtime.getURL('options.html?tab=history')
          });
          return { success: true, message: 'History opened' };
          
        case 'optimize_tab':
          if (tabId) {
            // Send comprehensive optimization message
            await chrome.tabs.sendMessage(tabId, {
              type: 'OPTIMIZE_TAB',
              actions: ['pause_media', 'reduce_animations', 'cleanup_dom']
            });
            return { success: true, message: 'Tab optimized' };
          }
          break;
          
        default:
          console.warn('[EnergyTracker] Unknown tip action:', action);
          return { success: false, error: 'Unknown action' };
      }
      
      return { success: false, error: 'Action could not be executed' };
      
    } catch (error) {
      console.error('[EnergyTracker] Action execution failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification system settings
   */
  async getNotificationSettings() {
    const defaultSettings = {
      enabled: true,
      position: 'bottom-right',
      duration: 7000,
      maxVisible: 3,
      respectReducedMotion: true,
      showHighPowerAlerts: true,
      showEfficiencyTips: true,
      showAchievements: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      frequency: 'normal' // minimal, normal, aggressive
    };

    try {
      const { notificationSettings } = await chrome.storage.local.get('notificationSettings');
      return { ...defaultSettings, ...notificationSettings };
    } catch (error) {
      console.error('[EnergyTracker] Failed to get notification settings:', error);
      return defaultSettings;
    }
  }

  /**
   * Update notification system settings
   */
  async updateNotificationSettings(newSettings) {
    try {
      const sanitizedSettings = this.sanitizeNotificationSettings(newSettings);
      await chrome.storage.local.set({ notificationSettings: sanitizedSettings });
      
      // Broadcast settings update to all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'UPDATE_NOTIFICATION_SETTINGS',
            settings: sanitizedSettings
          });
        } catch (e) {
          // Content script might not be loaded, ignore
        }
      }
      
      console.log('[EnergyTracker] Notification settings updated');
      return true;
    } catch (error) {
      console.error('[EnergyTracker] Failed to update notification settings:', error);
      return false;
    }
  }

  /**
   * Sanitize notification settings
   */
  sanitizeNotificationSettings(settings) {
    const sanitized = { ...settings };
    
    // Ensure boolean values
    if (typeof sanitized.enabled !== 'boolean') sanitized.enabled = true;
    if (typeof sanitized.respectReducedMotion !== 'boolean') sanitized.respectReducedMotion = true;
    if (typeof sanitized.showHighPowerAlerts !== 'boolean') sanitized.showHighPowerAlerts = true;
    if (typeof sanitized.showEfficiencyTips !== 'boolean') sanitized.showEfficiencyTips = true;
    if (typeof sanitized.showAchievements !== 'boolean') sanitized.showAchievements = true;
    
    // Ensure valid position
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (!validPositions.includes(sanitized.position)) sanitized.position = 'bottom-right';
    
    // Ensure valid duration
    if (typeof sanitized.duration !== 'number' || sanitized.duration < 1000 || sanitized.duration > 30000) {
      sanitized.duration = 7000;
    }
    
    // Ensure valid maxVisible
    if (typeof sanitized.maxVisible !== 'number' || sanitized.maxVisible < 1 || sanitized.maxVisible > 10) {
      sanitized.maxVisible = 3;
    }
    
    // Ensure valid frequency
    const validFrequencies = ['minimal', 'normal', 'aggressive'];
    if (!validFrequencies.includes(sanitized.frequency)) sanitized.frequency = 'normal';
    
    // Ensure valid quiet hours
    if (!sanitized.quietHours || typeof sanitized.quietHours !== 'object') {
      sanitized.quietHours = { enabled: false, start: '22:00', end: '08:00' };
    }
    
    return sanitized;
  }

  /**
   * Check if we're in quiet hours
   */
  isInQuietHours() {
    try {
      const settings = this.getNotificationSettings();
      if (!settings.quietHours?.enabled) return false;
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const start = settings.quietHours.start;
      const end = settings.quietHours.end;
      
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (start > end) {
        return currentTime >= start || currentTime <= end;
      } else {
        return currentTime >= start && currentTime <= end;
      }
    } catch (error) {
      console.error('[EnergyTracker] Quiet hours check failed:', error);
      return false;
    }
  }

  /**
   * Enhanced contextual tip generation with more sophisticated logic
   */
  generateAdvancedContextualTip(powerWatts, tabData, settings) {
    // Skip if in quiet hours
    if (this.isInQuietHours()) return null;
    
    // Skip based on frequency setting
    const frequencyChances = {
      minimal: 0.1,
      normal: 0.3,
      aggressive: 0.7
    };
    
    if (Math.random() > frequencyChances[settings.frequency || 'normal']) {
      return null;
    }
    
    const url = tabData.url || '';
    const title = tabData.title || '';
    const domain = this.getDomain(url);
    const metrics = tabData.lastMetrics || {};
    
    // High power usage (>= 45W)
    if (powerWatts >= 45) {
      if (!settings.showHighPowerAlerts) return null;
      
      // Video streaming
      if (domain.includes('youtube') || domain.includes('netflix') || domain.includes('twitch') ||
          title.toLowerCase().includes('video') || metrics.cpuIntensiveElements?.videos > 0) {
        return {
          type: 'high_power_video',
          severity: 'urgent',
          title: 'High Video Power Usage',
          message: `Video streaming is using ${powerWatts}W. Consider lowering quality to save energy.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 25) * 0.024)} kWh/hour saved`,
          action: 'pause_media',
          actionText: 'Pause Media',
          duration: 8000,
          cooldown: 10 * 60 * 1000,
          efficiency: 'poor'
        };
      }
      
      // Gaming/WebGL
      if (url.includes('game') || title.toLowerCase().includes('game') ||
          metrics.cpuIntensiveElements?.canvases > 0) {
        return {
          type: 'high_power_gaming',
          severity: 'urgent',
          title: 'Gaming Power Alert',
          message: `This game is consuming ${powerWatts}W. Close when not actively playing.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 15) * 0.024)} kWh/hour saved`,
          action: 'close_tab',
          actionText: 'Close Tab',
          duration: 8000,
          cooldown: 15 * 60 * 1000,
          efficiency: 'poor'
        };
      }
      
      // General high power
      return {
        type: 'high_power_general',
        severity: 'urgent',
        title: 'Very High Power Usage',
        message: `This tab is using ${powerWatts}W. Refreshing may help reduce consumption.`,
        powerWatts: powerWatts,
        impact: `~${Math.round((powerWatts - 20) * 0.024)} kWh/hour saved`,
        action: 'refresh_page',
        actionText: 'Refresh Page',
        duration: 8000,
        cooldown: 10 * 60 * 1000,
        efficiency: 'poor'
      };
    }
    
    // Moderate high power (35-44W)
    if (powerWatts >= 35) {
      if (!settings.showEfficiencyTips) return null;
      
      // Social media
      if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram') ||
          domain.includes('linkedin') || domain.includes('tiktok')) {
        return {
          type: 'moderate_power_social',
          severity: 'warning',
          title: 'Social Media Power Usage',
          message: `Auto-playing content is using ${powerWatts}W. Consider pausing videos.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 20) * 0.024)} kWh/hour saved`,
          action: 'pause_media',
          actionText: 'Pause Media',
          duration: 6000,
          cooldown: 20 * 60 * 1000,
          efficiency: 'average'
        };
      }
      
      // Animation-heavy sites
      if (metrics.cpuIntensiveElements?.count > 5) {
        return {
          type: 'moderate_power_animations',
          severity: 'warning',
          title: 'Animation Power Usage',
          message: `Multiple animations are using ${powerWatts}W. Reducing them saves energy.`,
          powerWatts: powerWatts,
          impact: `~${Math.round((powerWatts - 18) * 0.024)} kWh/hour saved`,
          action: 'reduce_animations',
          actionText: 'Reduce Animations',
          duration: 6000,
          cooldown: 15 * 60 * 1000,
          efficiency: 'average'
        };
      }
    }
    
    // Achievement notifications
    if (settings.showAchievements && powerWatts < 20) {
      // Only show occasionally for efficient browsing
      if (Math.random() < 0.05) {
        return {
          type: 'achievement_efficient',
          severity: 'success',
          title: 'Efficient Browsing! 🌱',
          message: `Great job! This tab is only using ${powerWatts}W - very energy efficient.`,
          powerWatts: powerWatts,
          impact: 'Saving ~0.5 kWh/day vs average',
          action: null,
          actionText: 'Keep it up!',
          duration: 4000,
          cooldown: 60 * 60 * 1000, // 1 hour
          efficiency: 'excellent'
        };
      }
    }
    
    return null;
  }

  /**
   * Helper method to extract domain from URL safely
   */
  getDomain(url) {
    try {
      if (!url || typeof url !== 'string') return '';
      return new URL(url).hostname;
    } catch (error) {
      console.warn('[EnergyTracker] Failed to extract domain from URL:', url);
      return '';
    }
  }
}

// Initialize the appropriate tracker based on available dependencies
let tracker;

if (ENHANCED_INTEGRATION_AVAILABLE && typeof EnergyTrackerEnhancedIntegration !== 'undefined') {
  console.log('[EnergyTracker] Initializing Enhanced Power Tracker with Full Integration');
  tracker = new EnergyTrackerEnhancedIntegration();
} else if (AGENT_SYSTEM_AVAILABLE && typeof EnergyTrackerWithAgent !== 'undefined') {
  console.log('[EnergyTracker] Initializing Enhanced Power Tracker with Agent System');
  tracker = new EnergyTrackerWithAgent();
} else {
  console.log('[EnergyTracker] Initializing Base Power Tracker (Enhanced features not available)');
  tracker = new EnergyTracker();
}

console.log('[EnergyTracker] Tracker initialized:', tracker.constructor.name);