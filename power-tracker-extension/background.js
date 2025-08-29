// Power Tracker Extension - Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Power Tracker Extension installed');
    
    // Initialize default settings
    chrome.storage.local.set({
        powerSettings: {
            notifications: true,
            threshold: 5.0,
            updateInterval: 5,
            autoOptimization: false
        },
        powerHistory: [],
        proEnabled: false
    });
    
    // Set up periodic power monitoring
    setupPowerMonitoring();
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Power Tracker Extension started');
    setupPowerMonitoring();
});

function setupPowerMonitoring() {
    // Monitor tab changes
    chrome.tabs.onActivated.addListener(handleTabActivation);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.tabs.onCreated.addListener(handleTabCreated);
    chrome.tabs.onRemoved.addListener(handleTabRemoved);
    
    // Start periodic monitoring
    startPeriodicMonitoring();
}

function handleTabActivation(activeInfo) {
    // Update power calculations when switching tabs
    updatePowerMetrics(activeInfo.tabId);
}

function handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // Analyze the loaded page for power consumption
        analyzePage(tab);
    }
}

function handleTabCreated(tab) {
    // New tab created - update power metrics
    updateTotalPowerUsage();
}

function handleTabRemoved(tabId, removeInfo) {
    // Tab removed - update power metrics
    updateTotalPowerUsage();
}

function analyzePage(tab) {
    if (!tab.url || tab.url.startsWith('chrome://')) return;
    
    // Inject content script to analyze page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: analyzePageContent
    }).catch(err => {
        // Ignore errors for protected pages
        console.log('Could not analyze page:', err.message);
    });
}

function analyzePageContent() {
    // This function runs in the page context
    const metrics = {
        domElements: document.querySelectorAll('*').length,
        images: document.querySelectorAll('img').length,
        scripts: document.querySelectorAll('script').length,
        stylesheets: document.querySelectorAll('link[rel="stylesheet"], style').length,
        videos: document.querySelectorAll('video').length,
        animations: document.querySelectorAll('[style*="animation"], .animated').length
    };
    
    // Send metrics back to background
    chrome.runtime.sendMessage({
        action: 'pageAnalysis',
        metrics: metrics,
        url: window.location.href
    });
}

function updatePowerMetrics(tabId = null) {
    chrome.tabs.query({}, (tabs) => {
        let totalEstimatedPower = calculateBasePower();
        
        tabs.forEach(tab => {
            const tabPower = calculateTabPower(tab);
            totalEstimatedPower += tabPower;
        });
        
        // Store power data
        const powerData = {
            timestamp: Date.now(),
            totalPower: totalEstimatedPower,
            tabCount: tabs.length,
            activeTabId: tabId
        };
        
        storePowerData(powerData);
        
        // Send update to popup if open
        chrome.runtime.sendMessage({
            action: 'powerUpdate',
            data: powerData
        }).catch(() => {
            // Popup not open, ignore
        });
        
        // Check for notifications
        checkPowerThreshold(totalEstimatedPower);
    });
}

function calculateBasePower() {
    // Base Chrome browser power consumption estimate
    return 1.2; // Watts
}

function calculateTabPower(tab) {
    let power = 0.3; // Base tab power
    
    // Estimate based on URL and status
    if (tab.active) {
        power += 0.5; // Active tab uses more power
    }
    
    if (tab.audible) {
        power += 1.0; // Audio/video content
    }
    
    if (tab.url) {
        // Video streaming sites
        if (tab.url.includes('youtube.com') || tab.url.includes('netflix.com') || 
            tab.url.includes('twitch.tv') || tab.url.includes('vimeo.com')) {
            power += 2.0;
        }
        
        // Social media (often has auto-playing content)
        if (tab.url.includes('facebook.com') || tab.url.includes('instagram.com') || 
            tab.url.includes('twitter.com') || tab.url.includes('tiktok.com')) {
            power += 0.8;
        }
        
        // News sites (often have ads and dynamic content)
        if (tab.url.includes('cnn.com') || tab.url.includes('bbc.com') || 
            tab.url.includes('reddit.com')) {
            power += 0.6;
        }
        
        // Google services
        if (tab.url.includes('docs.google.com') || tab.url.includes('sheets.google.com')) {
            power += 0.4;
        }
    }
    
    return power;
}

function storePowerData(powerData) {
    chrome.storage.local.get(['powerHistory'], (result) => {
        let history = result.powerHistory || [];
        history.push(powerData);
        
        // Keep only last 24 hours
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        history = history.filter(entry => entry.timestamp > dayAgo);
        
        chrome.storage.local.set({ powerHistory: history });
    });
}

function checkPowerThreshold(currentPower) {
    chrome.storage.local.get(['powerSettings'], (result) => {
        const settings = result.powerSettings || {};
        
        if (settings.notifications && currentPower > settings.threshold) {
            // Show high power consumption notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'High Power Consumption',
                message: `Current usage: ${currentPower.toFixed(1)}W. Consider closing unused tabs.`,
                priority: 1
            });
        }
    });
}

function startPeriodicMonitoring() {
    // Update power metrics every 30 seconds
    setInterval(() => {
        updatePowerMetrics();
    }, 30000);
    
    // Initial update
    setTimeout(() => {
        updatePowerMetrics();
    }, 2000);
}

function updateTotalPowerUsage() {
    setTimeout(() => {
        updatePowerMetrics();
    }, 1000);
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'pageAnalysis':
            // Handle page analysis data
            handlePageAnalysis(request.metrics, request.url, sender.tab.id);
            break;
            
        case 'getPowerData':
            // Send current power data to popup
            chrome.storage.local.get(['powerHistory'], (result) => {
                const history = result.powerHistory || [];
                const latest = history[history.length - 1];
                sendResponse({ powerData: latest, history: history });
            });
            return true;
            
        case 'updateSettings':
            // Update extension settings
            chrome.storage.local.set({ powerSettings: request.settings });
            sendResponse({ success: true });
            break;
            
        case 'enablePro':
            // Enable Pro features
            chrome.storage.local.set({ proEnabled: true });
            sendResponse({ success: true });
            break;
    }
});

function handlePageAnalysis(metrics, url, tabId) {
    // Calculate power impact based on page complexity
    let complexityScore = 0;
    
    complexityScore += metrics.domElements * 0.001;
    complexityScore += metrics.images * 0.05;
    complexityScore += metrics.scripts * 0.1;
    complexityScore += metrics.videos * 2.0;
    complexityScore += metrics.animations * 0.5;
    
    // Store page analysis
    chrome.storage.local.get(['pageAnalytics'], (result) => {
        let analytics = result.pageAnalytics || {};
        const domain = new URL(url).hostname;
        
        if (!analytics[domain]) {
            analytics[domain] = {
                visits: 0,
                totalComplexity: 0,
                avgPowerImpact: 0
            };
        }
        
        analytics[domain].visits++;
        analytics[domain].totalComplexity += complexityScore;
        analytics[domain].avgPowerImpact = analytics[domain].totalComplexity / analytics[domain].visits;
        
        chrome.storage.local.set({ pageAnalytics: analytics });
    });
}

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'powerTracker',
        title: 'Power Tracker',
        contexts: ['action']
    });
    
    chrome.contextMenus.create({
        id: 'optimizeTab',
        title: 'Optimize Current Tab',
        contexts: ['page'],
        parentId: 'powerTracker'
    });
    
    chrome.contextMenus.create({
        id: 'viewPowerStats',
        title: 'View Power Statistics',
        contexts: ['action'],
        parentId: 'powerTracker'
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'optimizeTab':
            optimizeCurrentTab(tab.id);
            break;
        case 'viewPowerStats':
            chrome.action.openPopup();
            break;
    }
});

function optimizeCurrentTab(tabId) {
    // Inject optimization script
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: optimizePageForPower
    });
}

function optimizePageForPower() {
    // Pause auto-playing videos
    document.querySelectorAll('video[autoplay]').forEach(video => {
        video.pause();
    });
    
    // Reduce animation intervals
    document.querySelectorAll('[style*="animation"]').forEach(el => {
        el.style.animationDuration = '10s';
    });
    
    // Lazy load images that are not visible
    document.querySelectorAll('img').forEach(img => {
        if (!isElementVisible(img)) {
            img.loading = 'lazy';
        }
    });
    
    console.log('Power optimization applied to page');
}

function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
}