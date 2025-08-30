# Service Worker Connection Fixes

## Problem Summary

The extension was experiencing "Could not establish connection. Receiving end does not exist." errors due to:

1. **Service Worker Lifecycle Issues**: In Manifest V3, service workers can be terminated and restarted, causing connection issues
2. **Message Response Handling**: Improper async response handling in the service worker
3. **Initialization Timing**: Service worker not ready when messages are sent
4. **No Retry Logic**: Single message attempts that fail immediately

## Fixes Implemented

### 1. Service Worker Improvements (`service-worker.js`)

- **Added lifecycle listeners**: `onStartup` and `onInstalled` to keep service worker active
- **Enhanced message handling**: Improved async response handling with proper error catching
- **Initialization safety**: Added checks to ensure service worker is initialized before handling messages
- **Better error responses**: Always respond to prevent "Receiving end does not exist" errors

### 2. Retry Logic Implementation

#### Popup Manager (`popup.js`)
- **Added `sendMessageWithRetry()` method**: Implements exponential backoff retry logic
- **Updated `loadSettings()`**: Uses retry logic instead of single attempt
- **Updated `loadCurrentEnergyData()`**: Uses retry logic for energy data requests
- **Better error handling**: Distinguishes between connection errors and other failures

#### Options Manager (`options.js`)
- **Added `sendMessageWithRetry()` method**: Same retry logic as popup
- **Updated `loadSettings()`**: Uses retry logic for settings loading
- **Updated `loadBackendEnergyData()`**: Uses retry logic for backend energy data

### 3. Manifest Updates (`manifest.json`)

- **Added `background` permission**: Ensures service worker can stay active
- **Enhanced permissions**: Better control over service worker lifecycle

### 4. Testing Tools

- **Created `test-connection.html`**: Test page to verify connection fixes
- **Multiple test scenarios**: Basic connection, settings, energy data, and retry logic tests

## Key Features of the Fixes

### Retry Logic (`sendMessageWithRetry`)
```javascript
async sendMessageWithRetry(message, maxRetries = 3, timeout = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Message timeout')), timeout);
      });
      
      // Race between message and timeout
      const response = await Promise.race([
        chrome.runtime.sendMessage(message),
        timeoutPromise
      ]);
      
      if (response) return response;
      throw new Error('Empty response');
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Service Worker Message Handling
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleRequest = async () => {
    try {
      // Ensure service worker is initialized
      if (!this.initPromise) {
        this.initPromise = this.init();
      }
      await this.initPromise;
      
      // Handle message...
      return response;
    } catch (error) {
      return { success: false, error: error.message || String(error) };
    }
  };

  // Handle async responses properly
  handleRequest().then(response => {
    if (sendResponse) sendResponse(response);
  }).catch(error => {
    if (sendResponse) sendResponse({ success: false, error: error.message });
  });

  return true; // Indicate async response
});
```

## Testing the Fixes

1. **Load the test page**: Open `test-connection.html` in your browser
2. **Run the tests**: Click each test button to verify functionality
3. **Check console**: Monitor for any remaining connection errors
4. **Test extension**: Use the popup and options pages normally

## Expected Results

- ✅ No more "Could not establish connection" errors
- ✅ Automatic retry on connection failures
- ✅ Graceful fallback to default settings/data
- ✅ Better user experience with fewer errors
- ✅ Service worker stays active longer

## Monitoring

After implementing these fixes, monitor the console for:
- Successful message attempts
- Retry attempts (should be minimal)
- Service worker initialization messages
- Any remaining connection errors

If you still see occasional errors, they should be much less frequent and the retry logic should handle them automatically.
