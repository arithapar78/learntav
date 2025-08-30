# PowerTrackingApp - Quick Integration Reference

> **🚨 CRITICAL**: Use this checklist to avoid conflicts when combining PowerTrackingApp with other Chrome extensions.

## ⛔ DO NOT USE (Reserved by PowerTrackingApp)

### Message Types (chrome.runtime.sendMessage)
```
❌ PING
❌ ENERGY_DATA
❌ GET_CURRENT_ENERGY
❌ GET_SETTINGS / UPDATE_SETTINGS
❌ GET_HISTORY
❌ LOG_BACKEND_ENERGY
❌ GET_BACKEND_ENERGY_SUMMARY
❌ SHOW_ENERGY_TIP / HIDE_ENERGY_TIP
❌ CLOSE_CURRENT_TAB
❌ OPEN_SETTINGS
```

### Storage Keys (chrome.storage.local)
```
❌ energyHistory
❌ backendEnergyHistory  
❌ settings
❌ notificationSettings
❌ lastMigrationAttempt
❌ migration_backup_*
```

### Global Variables (window.*)
```
❌ __energyTrackerContentLoaded
❌ __energyTrackerInstance
❌ __energyTipInstance
❌ __energyBackoffManager
❌ __powerAINotificationManager
❌ BackoffManager
❌ PageEnergyMonitor
❌ EnergyTipNotifications
❌ safeSendMessage
❌ isExtensionContextValid
```

### CSS Classes
```
❌ .energy-tip-*
❌ .status-dot
❌ .power-display
❌ .efficiency-badge
```

## ✅ SAFE PATTERNS

### Message Handling
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type.startsWith('MY_EXT_')) {
    // Handle your messages only
    return true;
  }
  return false; // Let PowerTrackingApp handle its messages
});
```

### Storage Access
```javascript
// Use prefixed keys
chrome.storage.local.set({
  'myExt_settings': settings,
  'myExt_data': data
});
```

### Global Variables
```javascript
// Use your own namespace
window.MyExt_BackoffManager = MyBackoffManager;
window.__myExtension_instance = instance;
```

### CSS Styling
```css
/* Use specific prefixes */
.my-ext-notification { }
.my-extension-popup { }
```

## 🧪 Quick Test

After integration, verify both extensions work:

```javascript
// Test PowerTrackingApp
chrome.runtime.sendMessage({type: 'PING'}).then(console.log);

// Test your extension  
chrome.runtime.sendMessage({type: 'MY_EXT_PING'}).then(console.log);

// Check storage isolation
chrome.storage.local.get(['settings', 'myExt_settings']).then(console.log);
```

## 🚨 Failure Signs

Integration failed if you see:
- "Receiving end does not exist" errors
- PowerTrackingApp popup shows no data
- Extension settings reset unexpectedly
- Console errors about undefined classes/functions
- Notification styling broken

## 📞 Emergency Debugging

```javascript
// Check PowerTrackingApp health
console.log('PowerTrackingApp status:', {
  contentLoaded: !!window.__energyTrackerContentLoaded,
  serviceWorker: chrome.runtime.sendMessage({type: 'PING'}),
  storage: chrome.storage.local.get(['settings'])
});
```

---
**✅ Integration is SAFE when both extensions function independently without errors.**