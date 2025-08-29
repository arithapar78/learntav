// Power Tracker Extension - Content Script
// This script runs on every web page to monitor power-related metrics

(function() {
    'use strict';
    
    let powerMetrics = {
        domComplexity: 0,
        resourceCount: 0,
        animationCount: 0,
        videoCount: 0,
        lastUpdate: Date.now()
    };
    
    // Initialize monitoring when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePowerMonitoring);
    } else {
        initializePowerMonitoring();
    }
    
    function initializePowerMonitoring() {
        console.log('🔋 Power Tracker: Monitoring started for', window.location.hostname);
        
        // Initial metrics calculation
        calculateInitialMetrics();
        
        // Set up observers for dynamic content
        setupMutationObserver();
        setupIntersectionObserver();
        
        // Monitor resource loading
        monitorResourceLoading();
        
        // Monitor user activity
        monitorUserActivity();
        
        // Send initial data to background script
        sendMetricsToBackground();
        
        // Set up periodic updates
        setInterval(sendMetricsToBackground, 30000); // Every 30 seconds
    }
    
    function calculateInitialMetrics() {
        // Count DOM elements
        powerMetrics.domComplexity = document.querySelectorAll('*').length;
        
        // Count resource-heavy elements
        powerMetrics.resourceCount = 
            document.querySelectorAll('img, video, audio, iframe, embed, object').length;
        
        // Count animated elements
        powerMetrics.animationCount = 
            document.querySelectorAll('[style*="animation"], .animate, .animated').length +
            document.querySelectorAll('video[autoplay], [data-autoplay]').length;
        
        // Count videos specifically
        powerMetrics.videoCount = document.querySelectorAll('video').length;
        
        console.log('🔋 Initial metrics:', powerMetrics);
    }
    
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let significantChanges = 0;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    significantChanges += mutation.addedNodes.length;
                    significantChanges -= mutation.removedNodes.length;
                }
            });
            
            // Update metrics if significant changes detected
            if (significantChanges > 5) {
                updateMetrics();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }
    
    function setupIntersectionObserver() {
        // Monitor videos entering/leaving viewport
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target.tagName === 'VIDEO') {
                    const isVisible = entry.isIntersecting;
                    const video = entry.target;
                    
                    // Pause videos that go out of view (power optimization)
                    if (!isVisible && !video.paused && video.duration > 30) {
                        video.dataset.powerTrackerPaused = 'true';
                        video.pause();
                        console.log('🔋 Paused out-of-view video for power optimization');
                    } else if (isVisible && video.dataset.powerTrackerPaused === 'true') {
                        delete video.dataset.powerTrackerPaused;
                        // Don't auto-resume - let user decide
                    }
                }
            });
        }, { threshold: 0.1 });
        
        // Observe all videos
        document.querySelectorAll('video').forEach(video => {
            videoObserver.observe(video);
        });
    }
    
    function monitorResourceLoading() {
        // Track new images and other resources
        const resourceObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const resources = node.querySelectorAll('img, video, audio, iframe');
                        if (resources.length > 0 || node.matches('img, video, audio, iframe')) {
                            updateResourceMetrics();
                        }
                    }
                });
            });
        });
        
        resourceObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function monitorUserActivity() {
        let isActive = true;
        let inactivityTimer;
        
        function resetInactivityTimer() {
            isActive = true;
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                isActive = false;
                optimizeForInactivity();
            }, 60000); // 1 minute of inactivity
        }
        
        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });
        
        // Initial timer
        resetInactivityTimer();
        
        function optimizeForInactivity() {
            console.log('🔋 User inactive - applying power optimizations');
            
            // Pause all videos
            document.querySelectorAll('video').forEach(video => {
                if (!video.paused) {
                    video.dataset.powerTrackerInactivePause = 'true';
                    video.pause();
                }
            });
        }
    }
    
    function updateMetrics() {
        calculateInitialMetrics();
        powerMetrics.lastUpdate = Date.now();
    }
    
    function updateResourceMetrics() {
        powerMetrics.resourceCount = 
            document.querySelectorAll('img, video, audio, iframe, embed, object').length;
        powerMetrics.videoCount = document.querySelectorAll('video').length;
    }
    
    function sendMetricsToBackground() {
        const pageMetrics = {
            ...powerMetrics,
            url: window.location.href,
            title: document.title,
            visible: !document.hidden
        };
        
        // Send to background script
        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
                action: 'contentMetrics',
                metrics: pageMetrics
            }).catch(err => {
                console.log('🔋 Could not send metrics to background:', err.message);
            });
        }
    }
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('🔋 Page hidden - reducing power consumption');
            
            // Pause all videos
            document.querySelectorAll('video').forEach(video => {
                if (!video.paused) {
                    video.dataset.powerTrackerHiddenPause = 'true';
                    video.pause();
                }
            });
        } else {
            console.log('🔋 Page visible - restoring normal operation');
        }
        
        // Update metrics
        sendMetricsToBackground();
    });
    
})();
