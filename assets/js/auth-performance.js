/**
 * LearnTAV Authentication System - Performance Optimizations
 * Enhancements for improved loading speed and runtime performance
 */

(function() {
    'use strict';

    // ===================================================================
    // Performance Monitoring & Optimization
    // ===================================================================
    
    class AuthPerformanceOptimizer {
        constructor() {
            this.metrics = {
                loadTime: 0,
                initTime: 0,
                modalRenderTime: 0,
                validationTime: 0
            };
            
            this.init();
        }

        init() {
            this.setupPerformanceMonitoring();
            this.optimizeModalRendering();
            this.optimizeFormValidation();
            this.setupLazyLoading();
            this.optimizeStorageOperations();
        }

        // ===================================================================
        // Performance Monitoring
        // ===================================================================
        
        setupPerformanceMonitoring() {
            if (!window.performance) return;

            // Monitor page load performance
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0];
                this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
                
                console.log(`🚀 Page load time: ${this.metrics.loadTime.toFixed(2)}ms`);
                
                // Log performance warnings
                if (this.metrics.loadTime > 3000) {
                    console.warn('⚠️ Slow page load detected');
                }
            });

            // Monitor authentication system initialization
            const initStart = performance.now();
            requestAnimationFrame(() => {
                this.metrics.initTime = performance.now() - initStart;
                console.log(`🔐 Auth system init: ${this.metrics.initTime.toFixed(2)}ms`);
            });
        }

        // ===================================================================
        // Modal Rendering Optimization
        // ===================================================================
        
        optimizeModalRendering() {
            // Cache modal templates for faster rendering
            this.modalTemplateCache = new Map();
            
            // Pre-render critical modals
            this.preRenderCriticalModals();
            
            // Use document fragments for efficient DOM manipulation
            this.setupEfficientDOMUpdates();
        }

        preRenderCriticalModals() {
            const criticalModals = ['welcome', 'login', 'register'];
            
            criticalModals.forEach(modalType => {
                requestIdleCallback(() => {
                    this.cacheModalTemplate(modalType);
                });
            });
        }

        cacheModalTemplate(modalType) {
            const template = this.generateModalTemplate(modalType);
            this.modalTemplateCache.set(modalType, template);
        }

        generateModalTemplate(modalType) {
            // Create template based on modal type
            const fragment = document.createDocumentFragment();
            const container = document.createElement('div');
            
            switch (modalType) {
                case 'welcome':
                    container.innerHTML = this.getWelcomeModalHTML();
                    break;
                case 'login':
                    container.innerHTML = this.getLoginModalHTML();
                    break;
                case 'register':
                    container.innerHTML = this.getRegisterModalHTML();
                    break;
            }
            
            fragment.appendChild(container.firstElementChild);
            return fragment;
        }

        setupEfficientDOMUpdates() {
            // Batch DOM updates to avoid layout thrashing
            this.pendingUpdates = [];
            this.updateScheduled = false;

            this.batchDOMUpdate = (updateFn) => {
                this.pendingUpdates.push(updateFn);
                
                if (!this.updateScheduled) {
                    this.updateScheduled = true;
                    requestAnimationFrame(() => {
                        this.flushDOMUpdates();
                    });
                }
            };
        }

        flushDOMUpdates() {
            this.pendingUpdates.forEach(updateFn => updateFn());
            this.pendingUpdates = [];
            this.updateScheduled = false;
        }

        // ===================================================================
        // Form Validation Optimization
        // ===================================================================
        
        optimizeFormValidation() {
            // Debounce validation to avoid excessive calls
            this.validationCache = new Map();
            this.debouncedValidation = this.debounce(this.performValidation.bind(this), 300);
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        performValidation(input, value) {
            const cacheKey = `${input.name}_${value}`;
            
            // Check cache first
            if (this.validationCache.has(cacheKey)) {
                return this.validationCache.get(cacheKey);
            }

            const validationStart = performance.now();
            
            // Perform actual validation
            const result = this.validateInput(input, value);
            
            // Cache result
            this.validationCache.set(cacheKey, result);
            
            // Clean cache if it gets too large
            if (this.validationCache.size > 100) {
                const firstKey = this.validationCache.keys().next().value;
                this.validationCache.delete(firstKey);
            }

            this.metrics.validationTime = performance.now() - validationStart;
            return result;
        }

        validateInput(input, value) {
            // Optimized validation logic
            switch (input.type) {
                case 'email':
                    return this.fastEmailValidation(value);
                case 'password':
                    return this.fastPasswordValidation(value);
                default:
                    return this.fastTextValidation(value, input.minLength);
            }
        }

        fastEmailValidation(email) {
            // Fast email validation (basic but efficient)
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        fastPasswordValidation(password) {
            // Optimized password strength calculation
            if (password.length < 8) return { strength: 0, level: 'weak' };
            
            let score = Math.min(password.length * 2, 20);
            if (/[a-z]/.test(password)) score += 15;
            if (/[A-Z]/.test(password)) score += 15;
            if (/\d/.test(password)) score += 15;
            if (/[@$!%*?&]/.test(password)) score += 25;
            
            return {
                strength: score,
                level: score >= 80 ? 'strong' : score >= 60 ? 'medium' : score >= 40 ? 'fair' : 'weak'
            };
        }

        fastTextValidation(text, minLength = 0) {
            return text && text.length >= minLength;
        }

        // ===================================================================
        // Lazy Loading Optimization
        // ===================================================================
        
        setupLazyLoading() {
            // Lazy load non-critical components
            this.lazyComponents = [
                'password-reset-modal',
                'settings-integration',
                'advanced-features'
            ];

            this.observeForLazyLoading();
        }

        observeForLazyLoading() {
            if (!window.IntersectionObserver) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadComponent(entry.target.dataset.component);
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            // Observe lazy loading triggers
            document.querySelectorAll('[data-lazy-component]').forEach(el => {
                observer.observe(el);
            });
        }

        loadComponent(componentName) {
            console.log(`📦 Lazy loading component: ${componentName}`);
            
            switch (componentName) {
                case 'password-reset':
                    this.loadPasswordResetModal();
                    break;
                case 'settings':
                    this.loadSettingsIntegration();
                    break;
                default:
                    console.warn(`Unknown component: ${componentName}`);
            }
        }

        loadPasswordResetModal() {
            // Load password reset functionality when needed
            requestIdleCallback(() => {
                this.cacheModalTemplate('reset');
            });
        }

        loadSettingsIntegration() {
            // Load settings page integration when needed
            if (!this.settingsLoaded) {
                this.settingsLoaded = true;
                // Load settings-specific code
            }
        }

        // ===================================================================
        // Storage Optimization
        // ===================================================================
        
        optimizeStorageOperations() {
            // Batch storage operations
            this.storageQueue = [];
            this.storageFlushScheduled = false;

            this.queueStorageOperation = (operation) => {
                this.storageQueue.push(operation);
                this.scheduleStorageFlush();
            };

            this.scheduleStorageFlush = () => {
                if (!this.storageFlushScheduled) {
                    this.storageFlushScheduled = true;
                    requestIdleCallback(() => {
                        this.flushStorageOperations();
                    });
                }
            };
        }

        flushStorageOperations() {
            this.storageQueue.forEach(operation => {
                try {
                    operation();
                } catch (error) {
                    console.error('Storage operation failed:', error);
                }
            });
            
            this.storageQueue = [];
            this.storageFlushScheduled = false;
        }

        // ===================================================================
        // Memory Optimization
        // ===================================================================
        
        optimizeMemoryUsage() {
            // Clean up unused data periodically
            setInterval(() => {
                this.cleanupUnusedData();
            }, 5 * 60 * 1000); // Every 5 minutes

            // Monitor memory usage
            this.monitorMemoryUsage();
        }

        cleanupUnusedData() {
            // Clear old validation cache entries
            if (this.validationCache.size > 50) {
                const entries = Array.from(this.validationCache.entries());
                const keep = entries.slice(-25); // Keep last 25 entries
                this.validationCache.clear();
                keep.forEach(([key, value]) => {
                    this.validationCache.set(key, value);
                });
            }

            // Clear old rate limiting data
            if (window.LearnTAVAuth && window.LearnTAVAuth.rateLimiter) {
                const now = Date.now();
                const limiter = window.LearnTAVAuth.rateLimiter;
                
                for (const [key, data] of limiter.entries()) {
                    if (now - data.lastAttempt > 60 * 60 * 1000) { // 1 hour
                        limiter.delete(key);
                    }
                }
            }
        }

        monitorMemoryUsage() {
            if (!window.performance || !performance.memory) return;

            const checkMemory = () => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                
                if (usedMB > 50) { // More than 50MB
                    console.warn(`⚠️ High memory usage: ${usedMB.toFixed(2)}MB`);
                    this.cleanupUnusedData();
                }
            };

            setInterval(checkMemory, 2 * 60 * 1000); // Every 2 minutes
        }

        // ===================================================================
        // Utility Methods
        // ===================================================================
        
        getWelcomeModalHTML() {
            return `<!-- Welcome modal HTML -->`;
        }

        getLoginModalHTML() {
            return `<!-- Login modal HTML -->`;
        }

        getRegisterModalHTML() {
            return `<!-- Register modal HTML -->`;
        }

        // ===================================================================
        // Performance Report
        // ===================================================================
        
        generatePerformanceReport() {
            const report = {
                timestamp: new Date().toISOString(),
                metrics: { ...this.metrics },
                cacheStats: {
                    modalTemplates: this.modalTemplateCache.size,
                    validationCache: this.validationCache.size
                },
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null
            };

            console.table(report.metrics);
            return report;
        }
    }

    // ===================================================================
    // Initialize Performance Optimizer
    // ===================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformanceOptimizer);
    } else {
        initPerformanceOptimizer();
    }

    function initPerformanceOptimizer() {
        window.AuthPerformanceOptimizer = new AuthPerformanceOptimizer();
        
        // Make performance report available globally for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.getAuthPerformanceReport = () => window.AuthPerformanceOptimizer.generatePerformanceReport();
        }
    }

})();