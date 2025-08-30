# PowerTrackingApp Integration Memory Bank

> **Critical Reference**: This document contains all technical details needed to safely integrate PowerTrackingApp with other Chrome extensions without conflicts.

## 🎯 Quick Integration Summary

**SAFE TO COMBINE**: PowerTrackingApp is designed with namespace isolation and follows Chrome extension best practices.

**MUST AVOID**: 
- Overriding global variables prefixed with `__energy*` or `window.PageEnergyMonitor`
- Using message types: `PING`, `ENERGY_DATA`, `GET_CURRENT_ENERGY`, etc. (see full list below)
- Storage keys: `energyHistory`, `settings`, `backendEnergyHistory`, `notificationSettings`
- CSS classes starting with `energy-tip-*`, `status-dot`, `power-display`

## 📡 Complete Message API Reference

### Message Schema Structure
```typescript
interface ExtensionMessage {
  type: string;           // Message identifier
  data?: any;            // Optional data payload
  settings?: object;     // Settings object for update messages
  timeRange?: string;    // Time range for history queries
  entry?: object;        // Entry data for logging
  entryId?: string;      // Entry ID for deletion
  action?: string;       // Action to execute
  notificationData?: any; // Notification-specific data
}

interface MessageResponse {
  success: boolean;
  data?: any;
  settings?: object;
  history?: array;
  error?: string;
  message?: string;
}
```

### Core System Messages
```javascript
// Health Check
{ type: 'PING' }
// Response: { success: true, message: 'Service worker alive' }

// Energy Data Transmission (Content Script → Service Worker)
{ 
  type: 'ENERGY_DATA', 
  data: {
    timestamp: number,
    url: string,
    title: string,
    domNodes: number,
    domDepth: number,
    viewport: { width: number, height: number },
    memory: { used: number, total: number, limit: number },
    cpuIntensiveElements: { count: number, videos: number, canvases: number },
    activeConnections: { recentRequests: number, totalRequests: number },
    resources: { totalRequests: number, totalSize: number, totalDuration: number },
    navigation: { domContentLoaded: number, loadComplete: number },
    rendering: { 'first-contentful-paint': number },
    domActivity: { mutations: number, addedNodes: number, removedNodes: number }
  }
}
// Response: { success: boolean }

// Get Current Energy Snapshot
{ type: 'GET_CURRENT_ENERGY' }
// Response: { 
//   success: true, 
//   data: {
//     [tabId]: {
//       powerWatts: number,
//       powerData: object,
//       energyScore: number, // Legacy compatibility
//       url: string,
//       title: string,
//       domNodes: number,
//       duration: number,
//       timestamp: number,
//       energyConsumption: { kWh: number, cost: number }
//     }
//   }
// }
```

### Settings Management Messages
```javascript
// Get Settings
{ type: 'GET_SETTINGS' }
// Response: {
//   success: true,
//   settings: {
//     trackingEnabled: boolean,
//     notificationsEnabled: boolean,
//     energyThreshold: number, // 0-100, legacy
//     powerThreshold: number,  // watts
//     dataRetentionDays: number,
//     samplingInterval: number // milliseconds
//   }
// }

// Update Settings
{ 
  type: 'UPDATE_SETTINGS', 
  settings: {
    trackingEnabled?: boolean,
    notificationsEnabled?: boolean,
    energyThreshold?: number,
    powerThreshold?: number,
    dataRetentionDays?: number,
    samplingInterval?: number
  }
}
// Response: { success: boolean }
```

### History and Analytics Messages
```javascript
// Get Energy History
{ type: 'GET_HISTORY', timeRange: '1h' | '24h' | '7d' | '30d' }
// Response: {
//   success: true,
//   history: [{
//     timestamp: number,
//     tabId: number,
//     url: string,
//     title: string,
//     powerWatts: number,
//     energyKwh: number,
//     energyCost: number,
//     co2Grams: number,
//     energyScore: number, // Legacy
//     duration: number,
//     powerData: object
//   }]
// }

// Get Power Summary
{ type: 'GET_POWER_SUMMARY', timeRange: '24h' | '7d' | '30d' }
// Response: {
//   success: true,
//   data: {
//     totalEntries: number,
//     averagePowerWatts: number,
//     totalEnergyKwh: number,
//     totalCostUSD: number,
//     totalCO2Grams: number,
//     efficiencyLevels: { excellent: number, good: number, average: number, poor: number },
//     peakPowerWatts: number,
//     peakPowerUrl: string,
//     recentEntries: array
//   }
// }
```

### Backend Energy Tracking Messages
```javascript
// Log Backend Energy Usage
{ 
  type: 'LOG_BACKEND_ENERGY', 
  entry: {
    id: string,
    timestamp: number,
    model: string,
    tokens: number,
    energyConsumption: number,
    provider: string,
    requestType: string
  }
}
// Response: { success: boolean }

// Get Backend Energy Summary
{ type: 'GET_BACKEND_ENERGY_SUMMARY', timeRange: '24h' | '7d' | '30d' }
// Response: {
//   success: true,
//   data: {
//     totalEnergy: number,
//     recentEntries: array,
//     entryCount: number
//   }
// }

// Delete Backend Energy Entry
{ type: 'DELETE_BACKEND_ENERGY_ENTRY', entryId: string }
// Response: { success: boolean }
```

### Notification System Messages
```javascript
// Show Energy Tip (Service Worker → Content Script)
{ 
  type: 'SHOW_ENERGY_TIP',
  tipData: {
    type: string, // 'high_power_video', 'moderate_power_social', etc.
    severity: 'urgent' | 'warning' | 'info' | 'success',
    title: string,
    message: string,
    powerWatts: number,
    impact: string, // Energy savings description
    action: string, // Action identifier
    actionText: string, // Button text
    duration: number, // Display duration in ms
    cooldown: number, // Cooldown before showing again
    efficiency: 'excellent' | 'good' | 'average' | 'poor'
  }
}
// Response: { success: boolean }

// Hide Energy Tip
{ type: 'HIDE_ENERGY_TIP' }
// Response: { success: boolean }

// Execute Tip Action
{ 
  type: 'EXECUTE_TIP_ACTION', 
  action: 'pause_media' | 'reduce_animations' | 'refresh_page' | 'close_tab' | 'open_settings' | 'show_history' | 'optimize_tab',
  notificationData: object
}
// Response: { success: boolean, message: string }

// Get Notification Settings
{ type: 'GET_NOTIFICATION_SETTINGS' }
// Response: {
//   success: true,
//   settings: {
//     enabled: boolean,
//     position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
//     duration: number,
//     maxVisible: number,
//     respectReducedMotion: boolean,
//     showHighPowerAlerts: boolean,
//     showEfficiencyTips: boolean,
//     showAchievements: boolean,
//     quietHours: { enabled: boolean, start: string, end: string },
//     frequency: 'minimal' | 'normal' | 'aggressive'
//   }
// }

// Update Notification Settings
{ type: 'UPDATE_NOTIFICATION_SETTINGS', settings: object }
// Response: { success: boolean }
```

### Data Migration Messages
```javascript
// Migrate Legacy Data
{ type: 'MIGRATE_LEGACY_DATA' }
// Response: { success: boolean, stats: object, error?: string }

// Get Migration Status
{ type: 'GET_MIGRATION_STATUS' }
// Response: { success: boolean, completed: boolean, version?: string, error?: string }

// Restore from Backup
{ type: 'RESTORE_FROM_BACKUP', backupKey: string }
// Response: { success: boolean, error?: string }

// Cleanup Old Backups
{ type: 'CLEANUP_OLD_BACKUPS', keepCount: number }
// Response: { success: boolean, removed: number, error?: string }
```

### Tab Management Messages
```javascript
// Close Current Tab
{ type: 'CLOSE_CURRENT_TAB' }
// Response: { success: boolean, error?: string }

// Open Settings Page
{ type: 'OPEN_SETTINGS' }
// Response: { success: boolean }
```

### Content Script Specific Messages
```javascript
// Pause Media Elements (Service Worker → Content Script)
{ type: 'PAUSE_MEDIA_ELEMENTS' }

// Reduce Animations (Service Worker → Content Script)
{ type: 'REDUCE_ANIMATIONS' }

// Optimize Tab (Service Worker → Content Script)
{ type: 'OPTIMIZE_TAB', actions: ['pause_media', 'reduce_animations', 'cleanup_dom'] }

// Update Notification Settings (Service Worker → Content Script)
{ type: 'UPDATE_NOTIFICATION_SETTINGS', settings: object }
```

## 🌐 Complete Global Variables Registry

### Content Script Window Globals
```javascript
// Primary Extension Flags
window.__energyTrackerContentLoaded: boolean
// Indicates if PowerTrackingApp content script is loaded

// Main Component Instances
window.__energyTrackerInstance: PageEnergyMonitor
// Main energy monitoring instance

window.__energyTipInstance: EnergyTipNotifications | PowerAINotificationManager  
// Notification system instance

window.__powerAINotificationManager: PowerAINotificationManager
// Enhanced notification manager (from content-script-notifications.js)

// Backoff Management System
window.__energyBackoffManager: BackoffManager
// Singleton instance for retry logic with exponential backoff

// Utility Classes (Available Globally)
window.BackoffManager: class
// Handles exponential backoff with jitter for message retry

window.ErrorClassification: object
// Error type constants: EXTENSION_INVALIDATED, TRANSIENT_CONNECTION, PERMANENT_ERROR

window.PageEnergyMonitor: class  
// Main monitoring class for DOM metrics and performance

window.EnergyTipNotifications: class
// Basic in-page notification system

// Utility Functions
window.safeSendMessage: async function(msg)
// Safe message sending with retry and backoff

window.isExtensionContextValid: function()  
// Validates Chrome extension context

window.classifyError: function(error)
// Classifies errors for retry strategy

window.resetBackoff: function()
// Resets backoff manager state

window.sleep: function(ms)
// Promise-based delay utility

window.getSettingsOrDefault: async function()
// Fetches extension settings with fallbacks
```

### Service Worker Globals (Internal)
```javascript
// Main Service Worker Class
class EnergyTracker {
  // Core properties
  isReady: boolean
  initPromise: Promise
  powerCalculator: PowerCalculator | null
  dataMigration: DataMigrationUtility | null
  currentTabs: Map<tabId, TabData>
}

// Helper Classes  
class PowerCalculator // From power-calculator.js
class DataMigrationUtility // From data-migration.js
```

### Global CSS Classes Used
```css
/* Notification System Classes */
.energy-tip-notification
.energy-tip-content
.energy-tip-header
.energy-tip-icon
.energy-tip-title
.energy-tip-close
.energy-tip-message
.energy-tip-power
.energy-tip-actions
.energy-tip-action
.energy-tip-dismiss
.energy-tip-feedback
.energy-tip-show
.energy-tip-hide
.energy-tip-urgent
.energy-tip-warning
.energy-tip-info
.energy-tip-feedback-show

/* Status Indicators */
.status-dot
.status-dot.inactive
.status-dot.estimated
.status-dot.warning

/* Power Display Classes */
.power-display
.power-display.power-excellent
.power-display.power-good
.power-display.power-average
.power-display.power-poor
.power-display.estimated

/* Efficiency Badges */
.efficiency-badge
.efficiency-badge.efficiency-excellent
.efficiency-badge.efficiency-good  
.efficiency-badge.efficiency-average
.efficiency-badge.efficiency-poor
.efficiency-badge.estimated
```

## 🔐 Chrome Extension Permissions & Resources

### Permissions Required
```json
{
  "permissions": [
    "storage",      // Local and sync storage access
    "tabs",         // Tab management and querying
    "scripting",    // Content script injection
    "activeTab",    // Active tab access
    "notifications", // System notifications
    "alarms"        // Background processing
  ],
  "host_permissions": ["<all_urls>"]
}
```

### Web Accessible Resources
```json
{
  "resources": [
    "styles/*",
    "images/*", 
    "content-script-notifications.js"
  ],
  "matches": ["<all_urls>"]
}
```

### Content Security Policy
```json
{
  "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'"
}
```

## 🎨 UI Components and Injection Points

### Popup Interface Elements
```html
<!-- Critical UI Element IDs -->
<div id="statusDot" class="status-dot"></div>
<span id="statusText"></span>
<div id="powerValue"></div>
<div id="powerDisplay" class="power-display"></div>
<div id="powerDescription"></div>
<div id="efficiencyBadge" class="efficiency-badge"></div>
<div id="tabTitle"></div>
<div id="tabUrl"></div>
<span id="domNodes"></span>
<span id="activeTime"></span>
<span id="totalTabs"></span>
<span id="avgPower"></span>
<span id="highPowerAlerts"></span>
<span id="totalTime"></span>
<div id="tipsSection"></div>
<button id="viewHistoryBtn"></button>
<button id="settingsBtn"></button>
<button id="tipAction"></button>
<button id="themeToggle"></button>
<div id="loadingOverlay"></div>
```

### Dynamic Content Injection
```javascript
// PowerTrackingApp injects these into pages:
// 1. energy-tip-styles (CSS for notifications)
// 2. energy-tip-animation-reducer (CSS to reduce animations)
// 3. Dynamic .energy-tip-notification elements
```

## ⚠️ Critical Integration Warnings

### 1. Message Handler Conflicts
```javascript
// ❌ NEVER DO THIS - Breaks PowerTrackingApp
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // This captures ALL messages, breaking PowerTrackingApp
  console.log('Got message:', message);
  return true; // Prevents other handlers from running
});

// ✅ CORRECT APPROACH - Filter your messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only handle messages intended for your extension
  if (message.type && message.type.startsWith('MY_EXTENSION_')) {
    // Handle your messages here
    return true; // Async response for your messages only
  }
  // Return false to let other extensions handle their messages
  return false;
});
```

### 2. Global Variable Overwrites
```javascript
// ❌ DANGER - Overwrites PowerTrackingApp utilities
window.BackoffManager = MyCustomBackoffManager;
window.__energyTrackerInstance = null;

// ✅ SAFE - Use your own namespace
window.MyExt_BackoffManager = MyCustomBackoffManager;
window.__myExtension_instance = myInstance;
```

### 3. Content Script Conflicts
```javascript
// ❌ PROBLEMATIC - May interfere with energy tracking
document.body.innerHTML = '<div>My extension content</div>';

// ✅ SAFE - Append without replacing
const myContainer = document.createElement('div');
myContainer.id = 'my-extension-container';
document.body.appendChild(myContainer);
```

### 4. Storage Key Conflicts
```javascript
// ❌ OVERWRITES PowerTrackingApp data
chrome.storage.local.set({
  'settings': mySettings,
  'energyHistory': myData
});

// ✅ SAFE - Use prefixed keys
chrome.storage.local.set({
  'myExt_settings': mySettings,
  'myExt_data': myData
});
```

## 🛡️ Safe Integration Patterns

### Pattern 1: Namespace Isolation
```javascript
// Create your extension's namespace
const MyExtension = {
  // All your extension's code goes here
  namespace: 'MY_EXT_',
  
  sendMessage(type, data) {
    return chrome.runtime.sendMessage({
      type: this.namespace + type,
      data: data
    });
  },
  
  getStorageKey(key) {
    return this.namespace + key;
  }
};
```

### Pattern 2: Feature Detection
```javascript
// Check if PowerTrackingApp is present
function isPowerTrackingAppPresent() {
  return !!(
    window.__energyTrackerContentLoaded ||
    (typeof chrome !== 'undefined' && 
     chrome.runtime && 
     chrome.runtime.getManifest &&
     chrome.runtime.getManifest().name === 'PowerTrackingApp')
  );
}

// Adjust behavior based on presence
if (isPowerTrackingAppPresent()) {
  console.log('PowerTrackingApp detected, using compatible mode');
  // Use more conservative DOM modifications
} else {
  console.log('PowerTrackingApp not found, using full feature set');
}
```

### Pattern 3: Message Router
```javascript
class SafeMessageRouter {
  constructor(extensionPrefix) {
    this.prefix = extensionPrefix;
    this.setupListener();
  }
  
  setupListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Only handle messages with our prefix
      if (message.type && message.type.startsWith(this.prefix)) {
        return this.handleMessage(message, sender, sendResponse);
      }
      // Let other extensions handle their messages
      return false;
    });
  }
  
  handleMessage(message, sender, sendResponse) {
    // Your message handling logic
    const cleanType = message.type.replace(this.prefix, '');
    // Handle cleanType...
    return true; // For async responses
  }
}

// Usage
const router = new SafeMessageRouter('MY_EXT_');
```

### Pattern 4: Safe DOM Manipulation
```javascript
class SafeDOMManager {
  constructor() {
    this.energyTrackerPresent = !!window.__energyTrackerContentLoaded;
  }
  
  addElement(element) {
    if (this.energyTrackerPresent) {
      // More conservative approach when PowerTrackingApp is present
      element.style.zIndex = '999999'; // Below PowerTrackingApp's z-index
      element.classList.add('my-ext-element'); // Clear identification
    }
    
    document.body.appendChild(element);
  }
  
  removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}
```

## 🧪 Integration Testing Framework

### Pre-Integration Test Suite
```javascript
// Test 1: Verify PowerTrackingApp functionality before integration
async function testPowerTrackingAppBaseline() {
  const tests = {
    messageHandling: false,
    storageAccess: false,
    contentScriptInjection: false,
    notificationSystem: false
  };
  
  // Test message handling
  try {
    const response = await chrome.runtime.sendMessage({type: 'PING'});
    tests.messageHandling = response && response.success;
  } catch (e) {
    console.error('PowerTrackingApp message test failed:', e);
  }
  
  // Test storage access
  try {
    const result = await chrome.storage.local.get(['settings']);
    tests.storageAccess = result !== undefined;
  } catch (e) {
    console.error('PowerTrackingApp storage test failed:', e);
  }
  
  // Test content script
  tests.contentScriptInjection = !!window.__energyTrackerContentLoaded;
  
  // Test notifications
  tests.notificationSystem = !!(
    window.__energyTipInstance || 
    window.__powerAINotificationManager
  );
  
  return tests;
}
```

### Post-Integration Test Suite
```javascript
async function testIntegrationSuccess() {
  console.log('Testing PowerTrackingApp + MyExtension integration...');
  
  // Test 1: Both extensions respond to their messages
  const powerTrackingResponse = await chrome.runtime.sendMessage({type: 'PING'});
  const myExtensionResponse = await chrome.runtime.sendMessage({type: 'MY_EXT_PING'});
  
  console.log('PowerTrackingApp responds:', powerTrackingResponse);
  console.log('MyExtension responds:', myExtensionResponse);
  
  // Test 2: Storage isolation
  await chrome.storage.local.set({'test_pt': 'powertracking', 'test_me': 'myextension'});
  const storage = await chrome.storage.local.get(['test_pt', 'test_me', 'settings']);
  
  console.log('Storage isolation test:', {
    powerTrackingData: storage.test_pt,
    myExtensionData: storage.test_me,
    powerTrackingSettings: storage.settings
  });
  
  // Test 3: No global variable conflicts
  console.log('Global variable check:', {
    energyTrackerLoaded: !!window.__energyTrackerContentLoaded,
    backoffManagerExists: !!window.BackoffManager,
    myExtensionGlobalsIntact: !!window.MyExt_instance // Your globals
  });
  
  // Test 4: Both notification systems work
  if (window.__energyTipInstance && window.MyExt_notifications) {
    console.log('Both notification systems coexist');
  }
  
  // Cleanup test data
  await chrome.storage.local.remove(['test_pt', 'test_me']);
}
```

### Performance Impact Test
```javascript
async function measurePerformanceImpact() {
  const startTime = performance.now();
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  
  // Simulate typical extension operations
  for (let i = 0; i < 10; i++) {
    await chrome.runtime.sendMessage({type: 'PING'});
    await chrome.runtime.sendMessage({type: 'MY_EXT_PING'});
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const endTime = performance.now();
  const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  
  console.log('Performance Impact:', {
    timeMs: endTime - startTime,
    memoryDeltaMB: (endMemory - startMemory) / (1024 * 1024),
    acceptable: (endTime - startTime) < 1000 && (endMemory - startMemory) < 5000000
  });
}
```

## 🔍 Debugging Integration Issues

### Common Error Signatures
```javascript
// Error 1: Message handler conflict
// Symptom: "Receiving end does not exist" OR no response from PowerTrackingApp
// Solution: Check message listener return values

// Error 2: Storage conflict  
// Symptom: PowerTrackingApp settings reset or corrupted
// Solution: Use prefixed storage keys

// Error 3: Global variable conflict
// Symptom: "BackoffManager is not a constructor" in console
// Solution: Don't override PowerTrackingApp globals

// Error 4: CSS conflict
// Symptom: Notification styling broken or invisible
// Solution: Use specific CSS selectors and higher specificity
```

### Debug Console Commands
```javascript
// Check PowerTrackingApp health
chrome.runtime.sendMessage({type: 'PING'}).then(console.log);

// Inspect current energy data
chrome.runtime.sendMessage({type: 'GET_CURRENT_ENERGY'}).then(console.log);

// Check storage state
chrome.storage.local.get(null).then(console.log);

// Verify content script state
console.log('Content script state:', {
  loaded: !!window.__energyTrackerContentLoaded,
  instance: !!window.__energyTrackerInstance,
  backoffManager: !!window.__energyBackoffManager
});

// Test message isolation
const testMessageIsolation = async () => {
  const ptResponse = await chrome.runtime.sendMessage({type: 'PING'});
  const unknownResponse = await chrome.runtime.sendMessage({type: 'UNKNOWN_TYPE'});
  console.log('PowerTrackingApp responds to PING:', ptResponse);
  console.log('Unknown message handled gracefully:', unknownResponse);
};
```

## 📋 Final Integration Checklist

### Pre-Integration Requirements
- [ ] Extension uses prefixed message types (not conflicting with PowerTrackingApp)
- [ ] Storage keys are prefixed and don't conflict
- [ ] Global variables use unique namespace
- [ ] CSS classes are scoped and don't override PowerTrackingApp styles
- [ ] Message handlers return `false` for non-owned messages
- [ ] Content script modifications are additive, not destructive

### During Integration Testing
- [ ] Both extensions load successfully
- [ ] PowerTrackingApp's energy tracking functions normally
- [ ] Settings pages for both extensions work
- [ ] Popup interfaces don't conflict
- [ ] Notification systems coexist
- [ ] Performance impact is acceptable
- [ ] No console errors related to conflicts
- [ ] Storage data remains intact for both extensions

### Post-Integration Validation
- [ ] PowerTrackingApp displays accurate power data
- [ ] Energy history is preserved and continues logging
- [ ] Notification tips appear appropriately
- [ ] Your extension's functionality is unimpaired
- [ ] Theme switching works for both extensions
- [ ] Tab management functions correctly
- [ ] Background processes run smoothly

## 🎯 Success Metrics

**Integration is successful when:**
1. Both extensions function independently without errors
2. No message routing conflicts occur
3. Storage data remains isolated and uncorrupted
4. UI elements don't overlap or interfere
5. Performance impact is < 5ms per operation
6. Memory usage increase is < 10MB total
7. All existing PowerTrackingApp features continue working
8. Content scripts inject and run without conflicts

**Integration requires revision when:**
- PowerTrackingApp stops showing energy data
- Console errors mention extension conflicts
- Settings become corrupted or reset
- Popup interfaces break or overlap
- Background service worker becomes unresponsive
- Content script injection fails
- Message handlers stop responding

---

**This memory bank ensures safe, conflict-free integration while preserving full functionality of PowerTrackingApp.**