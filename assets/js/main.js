/**
 * LearnTAV Website JavaScript
 * Professional interactive functionality for education and consulting website
 * Integrated with authentication and route protection
 */

// IMMEDIATE DEBUG: Test if JavaScript is loading
console.log('🚀 DEBUG: JavaScript file is loading!');

// IMMEDIATE GLOBAL FUNCTION: Make showAuthModal available immediately
let modalDisplaying = false;
let modalDebounceTimeout = null;

// Define function globally and test immediately
window.showAuthModal = function(tab = 'signin') {
    console.log('🔵 DEBUG: Global showAuthModal called with tab:', tab);
    
    // Prevent multiple simultaneous calls
    if (modalDisplaying) {
        console.log('🔶 DEBUG: Modal already displaying, ignoring duplicate call');
        return;
    }
    
    // Clear any existing debounce timeout
    if (modalDebounceTimeout) {
        clearTimeout(modalDebounceTimeout);
    }
    
    // Debounce multiple rapid calls
    modalDebounceTimeout = setTimeout(() => {
        modalDisplaying = true;
        showModalInternal(tab);
        modalDebounceTimeout = null;
    }, 50);
};

// Immediately test that function is accessible
console.log('🔵 DEBUG: showAuthModal function defined:', typeof window.showAuthModal);
console.log('🔵 DEBUG: Function accessibility test:', window.showAuthModal ? 'ACCESSIBLE' : 'NOT ACCESSIBLE');

function showModalInternal(tab = 'signin') {
    console.log('🟢 DEBUG: Creating modal internally with tab:', tab);
    
    // Simple modal creation without dependencies
    const modalHTML = `
        <div id="dynamicAuthOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 1;">
            <div id="dynamicAuthModal" style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 460px; width: 90vw; max-height: 90vh; overflow: hidden; position: relative;">
                <button onclick="hideAuthModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; z-index: 10; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">×</button>
                
                <div style="padding: 40px;">
                    <h2 style="font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 32px 0; text-align: center;">Welcome Back</h2>
                    
                    <!-- Demo Credentials Notice -->
                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 8px; font-size: 0.9rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; color: #0c4a6e; font-weight: 600;">
                            <span style="font-size: 1.1rem;">🔧</span>
                            Demo Mode - Use These Credentials
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: #075985;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 0.25rem;">👤 Regular User:</div>
                                <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                                    demo@learntav.com<br>
                                    demo123
                                </div>
                            </div>
                            <div>
                                <div style="font-weight: 500; margin-bottom: 0.25rem;">👑 Admin User:</div>
                                <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                                    admin@learntav.com<br>
                                    admin123
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form onsubmit="handleSimpleSignIn(event)" style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label style="font-weight: 500; color: #374151; font-size: 14px; display: block; margin-bottom: 8px;">Email Address</label>
                            <input type="email" id="simple-email" placeholder="Enter your email address" required style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none;">
                        </div>
                        
                        <div>
                            <label style="font-weight: 500; color: #374151; font-size: 14px; display: block; margin-bottom: 8px;">Password</label>
                            <input type="password" id="simple-password" placeholder="Enter your password" required style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none;">
                        </div>
                        
                        <button type="submit" style="width: 100%; padding: 18px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer;">
                            Sign In
                        </button>
                        
                        <div id="simple-error" style="display: none; background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 16px; border-radius: 8px; font-size: 14px;"></div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.querySelector('#dynamicAuthOverlay');
    if (existing) {
        existing.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    console.log('🟢 DEBUG: Simple modal created and displayed');
}

// Simple global hide function
window.hideAuthModal = function() {
    const overlay = document.getElementById('dynamicAuthOverlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = 'auto';
        modalDisplaying = false;
        console.log('🟢 DEBUG: Modal hidden');
    }
};

// Simple sign in handler
window.handleSimpleSignIn = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('simple-email').value.trim();
    const password = document.getElementById('simple-password').value;
    const errorDiv = document.getElementById('simple-error');
    
    console.log('🟢 DEBUG: Sign in attempt:', { email });
    
    // Demo authentication
    if ((email === 'demo@learntav.com' && password === 'demo123') ||
        (email === 'admin@learntav.com' && password === 'admin123')) {
        
        // Set auth state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', email.includes('admin') ? 'admin' : 'user');
        localStorage.setItem('userEmail', email);
        
        alert('✅ Sign in successful! Welcome back!');
        hideAuthModal();
        
        // Redirect after short delay
        setTimeout(() => {
            if (email.includes('admin')) {
                window.location.href = './admin/dashboard.html';
            } else {
                window.location.href = './dashboard/index.html';
            }
        }, 1000);
        
    } else {
        errorDiv.textContent = '❌ Invalid credentials. Please use the demo credentials shown above.';
        errorDiv.style.display = 'block';
    }
};

console.log('🟢 DEBUG: Global auth functions defined');

// Enhanced error handling and diagnostic logging
function logDiagnostic(category, message, data = null) {
    console.log(`🔧 ${category.toUpperCase()}: ${message}`, data || '');
}

function safeInsertBefore(newNode, referenceNode, parentNode) {
    try {
        if (parentNode && referenceNode && parentNode.contains(referenceNode)) {
            parentNode.insertBefore(newNode, referenceNode);
            logDiagnostic('DOM', 'Successfully inserted node before reference');
            return true;
        } else {
            logDiagnostic('DOM', 'Reference node not found, appending instead');
            if (parentNode) {
                parentNode.appendChild(newNode);
                return true;
            }
        }
    } catch (error) {
        logDiagnostic('DOM', 'Insert failed, falling back to append', error.message);
        try {
            if (parentNode) {
                parentNode.appendChild(newNode);
                return true;
            }
        } catch (fallbackError) {
            logDiagnostic('DOM', 'All insertion methods failed', fallbackError.message);
        }
    }
    return false;
}

// Fix navigation button positioning with enhanced error handling
document.addEventListener('DOMContentLoaded', function() {
    logDiagnostic('INIT', 'Starting navigation button positioning fix');
    
    // Find and fix the auth buttons container
    const authButtons = document.querySelector('.auth-buttons');
    const navActions = document.querySelector('.learntav-nav__actions');
    
    logDiagnostic('DOM', 'Found elements', {
        authButtons: !!authButtons,
        navActions: !!navActions
    });
    
    if (authButtons && navActions) {
        // Add proper CSS to fix layout
        authButtons.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            position: static;
            z-index: auto;
        `;
        
        navActions.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
        `;
        
        // Ensure Sign In button has proper styling
        const signInButton = authButtons.querySelector('button');
        if (signInButton) {
            signInButton.style.cssText = `
                position: static;
                z-index: auto;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.5rem 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                background: white;
                color: #374151;
                font-weight: 500;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            // Add hover effect
            signInButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f9fafb';
                this.style.borderColor = '#d1d5db';
            });
            
            signInButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'white';
                this.style.borderColor = '#e5e7eb';
            });
            
            console.log('🔴 DEBUG: Sign In button styling fixed');
        }
        
        // Ensure Get Started button has proper styling
        const getStartedButton = authButtons.querySelector('a.learntav-btn--primary');
        if (getStartedButton) {
            getStartedButton.style.cssText = `
                position: static;
                z-index: auto;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.5rem 1rem;
                background: #2563eb;
                color: white;
                border-radius: 0.375rem;
                font-weight: 500;
                font-size: 0.875rem;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            console.log('🔴 DEBUG: Get Started button styling fixed');
        }
        
        console.log('🔴 DEBUG: Navigation layout fixed');
    }
    
    // Add comprehensive debugging for Sign In button
    console.log('🔍 DEBUG: Starting Sign In button investigation...');
    
    // Global click listener to handle ONLY the navigation Sign In button
    document.addEventListener('click', function(e) {
        const targetTag = e.target.tagName;
        const targetClass = e.target.className || '';
        const targetText = e.target.textContent?.trim() || '';
        const targetOnclick = e.target.getAttribute('onclick') || '';
        
        console.log('🔍 GLOBAL CLICK:');
        console.log('  - Tag:', targetTag);
        console.log('  - Class:', targetClass);
        console.log('  - Text:', targetText);
        console.log('  - Onclick:', targetOnclick);
        console.log('  - Coords:', e.clientX + ',' + e.clientY);
        
        // Only handle the NAVIGATION Sign In button, not form buttons
        // Check if it's NOT inside an auth modal
        const isInModal = e.target.closest('#dynamicAuthModal') || e.target.closest('.auth-modal');
        
        if (!isInModal) {
            // Navigation Sign In button detection by onclick attribute
            if (targetOnclick === 'showAuthModal()') {
                console.log('🟢 GLOBAL: Navigation Sign In button detected by onclick!');
                e.preventDefault();
                e.stopPropagation();
                showAuthModal();
                return;
            }
            
            // Navigation Sign In button detection by class and text
            if (targetClass.includes('learntav-btn--ghost') && targetText === 'Sign In') {
                console.log('🟢 GLOBAL: Navigation Sign In button detected by class and text!');
                e.preventDefault();
                e.stopPropagation();
                showAuthModal();
                return;
            }
        } else {
            console.log('🟡 GLOBAL: Click inside modal - allowing normal form behavior');
        }
    });
    
    const signInButton = document.querySelector('button[onclick="showAuthModal()"]');
    if (signInButton) {
        console.log('🟢 DEBUG: Found Sign In button:', {
            className: signInButton.className,
            onclick: signInButton.getAttribute('onclick'),
            text: signInButton.textContent.trim(),
            style: signInButton.style.cssText,
            disabled: signInButton.disabled,
            offsetParent: signInButton.offsetParent?.tagName
        });
        
        // Add multiple event types for debugging
        signInButton.addEventListener('click', function(e) {
            console.log('🟢 CLICK EVENT: Sign In button clicked!');
            e.preventDefault();
            e.stopPropagation();
            showAuthModal();
        });
        
        signInButton.addEventListener('mousedown', function(e) {
            console.log('🟢 MOUSEDOWN: Sign In button pressed');
        });
        
        signInButton.addEventListener('mouseup', function(e) {
            console.log('🟢 MOUSEUP: Sign In button released');
        });
        
    } else {
        console.log('🔴 ERROR: Sign In button not found via onclick selector');
        // Try all possible selectors
        const alternatives = [
            'button:contains("Sign In")',
            '.auth-buttons button',
            '[data-auth-state="unauthenticated"] button'
        ];
        
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 DEBUG: Found', allButtons.length, 'total buttons:');
        allButtons.forEach((btn, index) => {
            console.log(`  Button ${index}:`, {
                text: btn.textContent.trim(),
                onclick: btn.getAttribute('onclick'),
                className: btn.className
            });
            
            if (btn.textContent.trim() === 'Sign In') {
                console.log(`🟢 DEBUG: Adding listener to Sign In button ${index}`);
                btn.addEventListener('click', function(e) {
                    console.log('🟢 CLICK: Sign In via text search');
                    e.preventDefault();
                    e.stopPropagation();
                    showAuthModal();
                });
            }
        });
    }
});

// Import route protection system (will be loaded as ES6 module)
let routeProtectionLoaded = false;

(function() {
    'use strict';
    
    // Utility Functions - Define early since they're used throughout
    // Debounce function for performance
    function debounce(func, wait) {
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

    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Enhanced DEBUG: Track animation system status with diagnostic logging
    window.LEARNTAV_DEBUG = {
        animationSystemLoaded: false,
        elementsFound: 0,
        elementsAnimated: 0,
        failsafeTriggered: false,
        intersectionObserverSupported: false,
        offsetIssuesDetected: 0,
        log: function(message, data) {
            console.log('🐛 ANIMATION DEBUG:', message, data || '');
        },
        logDiagnostic: function(message, data) {
            logDiagnostic('ANIMATION', message, data);
        }
    };
    
    // Set up scroll animations with robust failsafe system
    const setupScrollAnimations = function() {
        // Find elements that should animate - both existing classes and new ones
        const elements = document.querySelectorAll(
            '.scroll-animate, .learntav-value-card:not(.scroll-animate), .learntav-service-card:not(.scroll-animate), .learntav-testimonial-card:not(.scroll-animate)'
        );
        
        window.LEARNTAV_DEBUG.elementsFound = elements.length;
        window.LEARNTAV_DEBUG.log('Early setup found elements:', elements.length);
        
        // Add scroll-animate class to elements that don't have it yet
        elements.forEach((el, index) => {
            if (!el.classList.contains('scroll-animate')) {
                el.classList.add('scroll-animate');
                window.LEARNTAV_DEBUG.log(`Added scroll-animate to element ${index}:`, el.className);
            }
            
            // CSS class-controlled initial state - no JavaScript style manipulation
            if (document.body.classList.contains('enable-scroll-animations')) {
                // Use both rect and offset methods for better positioning detection
                const rect = el.getBoundingClientRect();
                const offsetTop = el.offsetTop;
                const offsetHeight = el.offsetHeight;
                
                // Diagnostic logging for offset issues
                if (offsetTop === 0 && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                    window.LEARNTAV_DEBUG.offsetIssuesDetected++;
                    window.LEARNTAV_DEBUG.logDiagnostic(`Element ${index} has offsetTop=0, potential positioning issue`, {
                        tagName: el.tagName,
                        className: el.className,
                        offsetParent: el.offsetParent?.tagName || 'null'
                    });
                }
                
                const isInitiallyInView = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (!isInitiallyInView) {
                    // Mark elements as hidden via CSS class only
                    el.classList.add('animate-pending');
                    window.LEARNTAV_DEBUG.log(`JS: Marked element ${index} as animate-pending (rect.top: ${Math.round(rect.top)}, offsetTop: ${offsetTop})`);
                } else {
                    // Elements initially in view start visible
                    el.classList.add('animate-in');
                    window.LEARNTAV_DEBUG.log(`JS: Element ${index} initially visible, marked as animated`);
                }
            }
        });
        
        // Robust failsafe: Multiple fallback mechanisms
        const enableFailsafe = () => {
            window.LEARNTAV_DEBUG.log('Enabling failsafe system');
            
            // Immediate check for elements that should be visible
            setTimeout(() => {
                elements.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    const transform = computedStyle.transform;
                    const opacity = computedStyle.opacity;
                    
                    // More generous viewport detection that accounts for transforms
                    const isInViewport = rect.bottom > -200 && rect.top < window.innerHeight + 200;
                    
                    if (!el.classList.contains('animate-in')) {
                        window.LEARNTAV_DEBUG.log(`🔍 DIAGNOSIS Element ${index}:`, {
                            rect: {top: Math.round(rect.top), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height)},
                            transform: transform,
                            opacity: opacity,
                            classes: el.className,
                            offsetTop: el.offsetTop,
                            offsetHeight: el.offsetHeight,
                            inViewport: isInViewport
                        });
                        
                        if (isInViewport) {
                            el.classList.add('animate-in');
                            window.LEARNTAV_DEBUG.elementsAnimated++;
                            window.LEARNTAV_DEBUG.log(`Failsafe animated element ${index}`);
                        }
                    }
                });
            }, 1000);
            
            // Final failsafe: ensure all elements are visible after reasonable time
            setTimeout(() => {
                elements.forEach((el, index) => {
                    if (!el.classList.contains('animate-in')) {
                        el.classList.add('animate-in');
                        window.LEARNTAV_DEBUG.elementsAnimated++;
                        window.LEARNTAV_DEBUG.failsafeTriggered = true;
                        window.LEARNTAV_DEBUG.log(`Final failsafe revealed element ${index}`);
                    }
                });
                
                window.LEARNTAV_DEBUG.log('Animation system status:', {
                    found: window.LEARNTAV_DEBUG.elementsFound,
                    animated: window.LEARNTAV_DEBUG.elementsAnimated,
                    failsafeTriggered: window.LEARNTAV_DEBUG.failsafeTriggered
                });
            }, 7000);
        };
        
        enableFailsafe();
    };
    
    // Run setup when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScrollAnimations);
    } else {
        setupScrollAnimations();
    }

    // ===================================================================
    // DOM Ready and Initialization
    // ===================================================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeNavigation();
        initializeSmoothScrolling();
        initializeFormValidation();
        initializeAnimations();
        initializeAccessibility();
        initializeRouteProtection();
    });

    // ===================================================================
    // Navigation Functionality
    // ===================================================================
    
    function initializeNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.learntav-nav__link');

        if (navToggle && navMenu) {
            // Mobile menu toggle
            navToggle.addEventListener('click', function() {
                const isActive = navMenu.classList.contains('active');
                
                if (isActive) {
                    closeNavMenu();
                } else {
                    openNavMenu();
                }
            });

            // Close menu when clicking on nav links (mobile)
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        closeNavMenu();
                    }
                });
            });

            // Close menu when clicking outside (mobile)
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!e.target.closest('.learntav-nav')) {
                        closeNavMenu();
                    }
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    closeNavMenu();
                    navToggle.focus();
                }
            });
        }

        // Highlight active nav link based on current page
        highlightActiveNavLink();
    }

    function openNavMenu() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Close navigation menu');
        
        // Animate hamburger to X
        const lines = navToggle.querySelectorAll('.learntav-nav__toggle-line');
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        
        // Focus first menu item
        const firstLink = navMenu.querySelector('.learntav-nav__link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    function closeNavMenu() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        
        // Reset hamburger animation
        const lines = navToggle.querySelectorAll('.learntav-nav__toggle-line');
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
    }

    function highlightActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.learntav-nav__link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('learntav-nav__link--active');
            } else {
                link.classList.remove('learntav-nav__link--active');
            }
        });
    }

    // ===================================================================
    // Smooth Scrolling
    // ===================================================================
    
    function initializeSmoothScrolling() {
        const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
        
        smoothScrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.learntav-nav').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update focus for accessibility
                    target.focus();
                    if (target.tabIndex === -1) {
                        target.tabIndex = -1;
                    }
                }
            });
        });
    }

    // ===================================================================
    // Form Validation and Handling
    // ===================================================================
    
    function initializeFormValidation() {
        const forms = document.querySelectorAll('.learntav-form');
        
        forms.forEach(form => {
            new FormValidator(form);
        });
    }

    class FormValidator {
        constructor(form) {
            this.form = form;
            this.errors = {};
            this.setupValidation();
        }

        setupValidation() {
            // Form submission
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validate()) {
                    this.submitForm();
                } else {
                    this.focusFirstError();
                }
            });

            // Real-time validation
            const fields = this.form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            });

            // Honeypot check (spam protection)
            const honeypot = this.form.querySelector('input[name="website"]');
            if (honeypot) {
                honeypot.style.position = 'absolute';
                honeypot.style.left = '-9999px';
                honeypot.setAttribute('tabindex', '-1');
                honeypot.setAttribute('autocomplete', 'off');
            }
        }

        validate() {
            this.errors = {};
            
            // Required field validation
            const requiredFields = this.form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!this.isFieldValid(field)) {
                    this.addError(field.name, this.getErrorMessage(field, 'required'));
                }
            });

            // Email validation
            const emailFields = this.form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !this.isValidEmail(field.value)) {
                    this.addError(field.name, 'Please enter a valid email address');
                }
            });

            // Phone validation (if provided)
            const phoneFields = this.form.querySelectorAll('input[type="tel"]');
            phoneFields.forEach(field => {
                if (field.value && !this.isValidPhone(field.value)) {
                    this.addError(field.name, 'Please enter a valid phone number');
                }
            });

            // Honeypot check (spam protection)
            const honeypot = this.form.querySelector('input[name="website"]');
            if (honeypot && honeypot.value) {
                this.addError('spam', 'Spam detected');
                return false;
            }

            this.displayErrors();
            return Object.keys(this.errors).length === 0;
        }

        validateField(field) {
            const fieldErrors = {};
            
            if (field.hasAttribute('required') && !this.isFieldValid(field)) {
                fieldErrors[field.name] = this.getErrorMessage(field, 'required');
            } else if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
                fieldErrors[field.name] = 'Please enter a valid email address';
            } else if (field.type === 'tel' && field.value && !this.isValidPhone(field.value)) {
                fieldErrors[field.name] = 'Please enter a valid phone number';
            }

            this.displayFieldError(field, fieldErrors[field.name]);
            return Object.keys(fieldErrors).length === 0;
        }

        isFieldValid(field) {
            if (field.type === 'checkbox') {
                return field.checked;
            }
            return field.value.trim() !== '';
        }

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
            return phoneRegex.test(cleanPhone);
        }

        getErrorMessage(field, type) {
            const fieldName = field.getAttribute('data-label') || 
                            field.previousElementSibling?.textContent?.replace('*', '').trim() || 
                            field.name;
            
            switch (type) {
                case 'required':
                    return `${fieldName} is required`;
                default:
                    return `${fieldName} is invalid`;
            }
        }

        addError(field, message) {
            this.errors[field] = message;
        }

        clearFieldError(field) {
            const errorElement = field.parentNode.querySelector('.learntav-form__error');
            if (errorElement) {
                errorElement.remove();
            }
            field.classList.remove('learntav-form__input--error');
            field.removeAttribute('aria-describedby');
        }

        displayFieldError(field, message) {
            this.clearFieldError(field);
            
            if (message) {
                const errorElement = document.createElement('div');
                errorElement.className = 'learntav-form__error';
                errorElement.textContent = message;
                errorElement.id = `${field.name}-error`;
                
                field.parentNode.appendChild(errorElement);
                field.classList.add('learntav-form__input--error');
                field.setAttribute('aria-describedby', errorElement.id);
                field.setAttribute('aria-invalid', 'true');
            } else {
                field.removeAttribute('aria-invalid');
            }
        }

        displayErrors() {
            // Clear existing errors
            this.form.querySelectorAll('.learntav-form__error').forEach(error => {
                error.remove();
            });

            this.form.querySelectorAll('.learntav-form__input--error').forEach(field => {
                field.classList.remove('learntav-form__input--error');
                field.removeAttribute('aria-describedby');
                field.removeAttribute('aria-invalid');
            });

            // Display new errors
            Object.entries(this.errors).forEach(([field, message]) => {
                const fieldElement = this.form.querySelector(`[name="${field}"]`);
                if (fieldElement && field !== 'spam') {
                    this.displayFieldError(fieldElement, message);
                }
            });
        }

        focusFirstError() {
            const firstErrorField = this.form.querySelector('.learntav-form__input--error');
            if (firstErrorField) {
                firstErrorField.focus();
                
                // Scroll to field if not visible
                const rect = firstErrorField.getBoundingClientRect();
                if (rect.top < 0 || rect.bottom > window.innerHeight) {
                    firstErrorField.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }

        async submitForm() {
            const submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('learntav-btn--loading');

            try {
                // Simulate form submission (replace with actual endpoint)
                await this.simulateFormSubmission();
                
                // Show success message
                this.showSuccessMessage();
                this.form.reset();
                
            } catch (error) {
                // Show error message
                this.showErrorMessage(error.message);
                
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.classList.remove('learntav-btn--loading');
            }
        }

        async simulateFormSubmission() {
            // Simulate API call delay
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate success for demo
                    resolve({ success: true });
                }, 2000);
            });
        }

        showSuccessMessage() {
            const message = document.createElement('div');
            message.className = 'learntav-form__success';
            message.innerHTML = `
                <div class="learntav-form__success-content">
                    <div class="learntav-form__success-icon">✓</div>
                    <h3>Thank you for your message!</h3>
                    <p>We'll get back to you within 24 hours.</p>
                </div>
            `;
            
            this.form.parentNode.insertBefore(message, this.form.nextSibling);
            this.form.style.display = 'none';
            
            message.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                message.remove();
                this.form.style.display = 'block';
            }, 10000);
        }

        showErrorMessage(errorMsg) {
            const message = document.createElement('div');
            message.className = 'learntav-form__error-global';
            message.innerHTML = `
                <div class="learntav-form__error-content">
                    <div class="learntav-form__error-icon">⚠</div>
                    <h3>There was a problem</h3>
                    <p>${errorMsg || 'Please try again or contact us directly.'}</p>
                </div>
            `;
            
            this.form.insertBefore(message, this.form.firstChild);
            
            message.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Auto-remove after 8 seconds
            setTimeout(() => {
                message.remove();
            }, 8000);
        }
    }

    // ===================================================================
    // Scroll Animations and Intersection Observer
    // ===================================================================
    
    function initializeAnimations() {
        window.LEARNTAV_DEBUG.log('Main animation system initializing...');
        window.LEARNTAV_DEBUG.animationSystemLoaded = true;
        
        // Find all elements that should animate
        const animatedElements = document.querySelectorAll('.scroll-animate');
        
        window.LEARNTAV_DEBUG.log('Main system found elements:', animatedElements.length);
        
        // Prevent duplicate animation systems from conflicting
        if (animatedElements.length === 0) {
            window.LEARNTAV_DEBUG.log('No elements found - early system may have handled setup');
            // Initialize other systems and return
            initializeDownloadSystem();
            initializeNavbarScroll();
            return;
        }
        
        // SCROLL-BASED ANIMATION SYSTEM - IntersectionObserver replacement
        window.LEARNTAV_DEBUG.intersectionObserverSupported = true;
        window.LEARNTAV_DEBUG.log('Using scroll-based animation system...');
        
        const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        
        function checkElementsInViewport() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            
            animatedElements.forEach((el, index) => {
                if (!el.classList.contains('animate-in')) {
                    // Enhanced positioning detection - use both methods
                    const rect = el.getBoundingClientRect();
                    const elementTop = el.offsetTop;
                    const elementHeight = el.offsetHeight;
                    const elementBottom = elementTop + elementHeight;
                    
                    // Fallback to getBoundingClientRect if offsetTop is problematic
                    let isInViewport;
                    if (elementTop === 0 && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                        // Use rect-based calculation as fallback
                        isInViewport = rect.top < (windowHeight - 100) && rect.bottom > 100;
                        window.LEARNTAV_DEBUG.logDiagnostic(`Using rect fallback for element ${index}`, {
                            rectTop: Math.round(rect.top),
                            rectBottom: Math.round(rect.bottom),
                            isInViewport
                        });
                    } else {
                        // Calculate if element is in viewport using offset positioning
                        isInViewport = (elementBottom > scrollTop + 100) && (elementTop < scrollTop + windowHeight - 100);
                    }
                    
                    window.LEARNTAV_DEBUG.log(`🔍 ENHANCED check element ${index}: offsetTop=${elementTop}, rectTop=${Math.round(rect.top)}, scrollTop=${scrollTop}, windowHeight=${windowHeight}, inViewport=${isInViewport}`);
                    
                    if (isInViewport) {
                        // Add staggered delay
                        let baseDelay = index * 100;
                        if (isHomepage) {
                            baseDelay += Math.min(150, index * 50);
                        }
                        
                        setTimeout(() => {
                            if (!el.classList.contains('animate-in')) {
                                // Pure CSS class animation - no JavaScript style manipulation
                                el.classList.remove('animate-pending');
                                el.classList.add('animate-in');
                                window.LEARNTAV_DEBUG.elementsAnimated++;
                                window.LEARNTAV_DEBUG.log(`✅ ENHANCED: Animated element ${index} (delay: ${baseDelay}ms)`);
                            }
                        }, baseDelay);
                    }
                }
            });
        }
        
        // Initial check
        setTimeout(checkElementsInViewport, 100);
        
        // Throttled scroll event listener
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    checkElementsInViewport();
                    scrollTimeout = null;
                }, 100);
            }
        }, { passive: true });
        
        // Resize event listener
        window.addEventListener('resize', checkElementsInViewport);
        
        // Legacy fallback for older browsers
        if (false) {
            window.LEARNTAV_DEBUG.log('IntersectionObserver not supported, using scroll fallback');
            
            // Fallback for older browsers
            function checkScroll() {
                animatedElements.forEach((el, index) => {
                    if (!el.classList.contains('animate-in')) {
                        const rect = el.getBoundingClientRect();
                        const isVisible = rect.top < (window.innerHeight - 50) && rect.bottom > 0;
                        
                        if (isVisible) {
                            el.classList.add('animate-in');
                            window.LEARNTAV_DEBUG.elementsAnimated++;
                            window.LEARNTAV_DEBUG.log(`Scroll fallback animated element ${index}`);
                        }
                    }
                });
            }
            
            // Throttle scroll events for performance
            let scrollTimeout;
            function throttledScroll() {
                if (scrollTimeout) return;
                scrollTimeout = setTimeout(() => {
                    checkScroll();
                    scrollTimeout = null;
                }, 16); // ~60fps
            }
            
            window.addEventListener('scroll', throttledScroll, { passive: true });
            window.addEventListener('resize', checkScroll);
            
            // Initial check after a delay
            setTimeout(checkScroll, 100);
        }

        // Emergency failsafe: ensure no elements are permanently hidden
        setTimeout(() => {
            animatedElements.forEach((el, index) => {
                if (!el.classList.contains('animate-in')) {
                    window.LEARNTAV_DEBUG.log(`EMERGENCY: Revealing hidden element ${index}`);
                    el.classList.add('animate-in');
                    window.LEARNTAV_DEBUG.elementsAnimated++;
                    window.LEARNTAV_DEBUG.failsafeTriggered = true;
                }
            });
            
            // Final status report
            window.LEARNTAV_DEBUG.log('Final Animation Status:', {
                elementsFound: window.LEARNTAV_DEBUG.elementsFound,
                elementsAnimated: window.LEARNTAV_DEBUG.elementsAnimated,
                intersectionObserverSupported: window.LEARNTAV_DEBUG.intersectionObserverSupported,
                failsafeTriggered: window.LEARNTAV_DEBUG.failsafeTriggered
            });
        }, 10000);

        // Initialize download functionality
        initializeDownloadSystem();
        
        // Navbar background on scroll
        initializeNavbarScroll();
    }

    function initializeNavbarScroll() {
        const navbar = document.querySelector('.learntav-nav');
        let lastScrollTop = 0;

        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScrollTop = scrollTop;
        }

        // Throttle scroll events
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
                setTimeout(() => ticking = false, 16);
            }
        });
    }

    // ===================================================================
    // Accessibility Enhancements
    // ===================================================================
    
    function initializeAccessibility() {
        // Skip to content link
        createSkipToContentLink();
        
        // Enhanced keyboard navigation
        enhanceKeyboardNavigation();
        
        // Manage focus for screen readers
        manageFocusForScreenReaders();
        
        // Announce page changes for SPA-like behavior
        announcePageChanges();
    }

    function createSkipToContentLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-to-content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark if it doesn't exist
        const mainContent = document.querySelector('#main-content');
        if (!mainContent) {
            const hero = document.querySelector('.learntav-hero');
            if (hero) {
                hero.id = 'main-content';
                hero.setAttribute('tabindex', '-1');
            }
        }
    }

    function enhanceKeyboardNavigation() {
        // Trap focus in mobile menu when open
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        if (navMenu && navToggle) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && navMenu.classList.contains('active')) {
                    const focusableElements = navMenu.querySelectorAll('a[href]');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        }
    }

    function manageFocusForScreenReaders() {
        // Add proper labels to interactive elements without text
        const interactiveElements = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        
        interactiveElements.forEach(element => {
            if (!element.textContent.trim()) {
                const context = element.closest('[data-section]')?.getAttribute('data-section') || 'page';
                element.setAttribute('aria-label', `Interactive element in ${context}`);
            }
        });
    }

    function announcePageChanges() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
        
        // Function to announce messages
        window.announceToScreenReader = function(message) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    // ===================================================================
    // Utility Functions (moved to top for earlier access)
    // ===================================================================

    // ===================================================================
    // Download System with Verification
    // ===================================================================
    
    function initializeDownloadSystem() {
        logDiagnostic('DOWNLOAD', 'Initializing download system...');
        
        // Add event listeners to all download buttons
        const downloadButtons = document.querySelectorAll('.btn-purchase, .learntav-btn[href*="power-tracker"], .learntav-btn[href*="prompt-energy-optimizer"]');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href') || this.getAttribute('data-href');
                if (url && (url.includes('power-tracker') || url.includes('prompt-energy-optimizer'))) {
                    // Direct download without modal for free access
                    directDownload(url);
                } else {
                    showDownloadModal(url);
                }
            });
        });
        
        logDiagnostic('DOWNLOAD', 'Download system initialized successfully');
    }
    
    // New function for direct downloads
    function directDownload(url) {
        let zipFile = '';
        let toolName = '';
        
        if (url.includes('power-tracker')) {
            zipFile = 'power-tracker-extension.zip';
            toolName = 'Power Tracker';
        } else if (url.includes('prompt-energy-optimizer')) {
            zipFile = 'prompt-optimizer-extension.zip';
            toolName = 'Prompt Optimizer';
        }
        
        if (zipFile) {
            const link = document.createElement('a');
            link.href = `assets/extensions/${zipFile}`;
            link.download = zipFile;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            alert(`✅ ${toolName} download started!\n\nInstallation:\n1. Unzip the downloaded file\n2. Open Chrome → Extensions\n3. Enable Developer Mode\n4. Click "Load Unpacked"\n5. Select the unzipped folder`);
        }
    }
    
    function showDownloadModal(toolType) {
        const isPromptOptimizer = toolType.includes('prompt-energy-optimizer');
        const toolName = isPromptOptimizer ? 'Prompt Optimizer' : 'Power Tracker';
        const zipFile = isPromptOptimizer ? 'prompt-optimizer-extension.zip' : 'power-tracker-extension.zip';
        
        // Create modal HTML
        const modalHTML = `
            <div class="download-modal-overlay" id="downloadOverlay" onclick="hideDownloadModal()"></div>
            <div class="download-modal" id="downloadModal">
                <button class="download-modal__close" onclick="hideDownloadModal()">&times;</button>
                <div class="download-modal__header">
                    <h3 class="download-modal__title">Download ${toolName}</h3>
                    <p class="download-modal__subtitle">Please enter the verification code to proceed</p>
                </div>
                
                <div class="verification-section">
                    <label class="verification-label">Enter Verification Code</label>
                    <div class="verification-input" id="verificationInput">
                        <input type="text" class="verification-digit" maxlength="1" data-index="0">
                        <input type="text" class="verification-digit" maxlength="1" data-index="1">
                        <input type="text" class="verification-digit" maxlength="1" data-index="2">
                        <input type="text" class="verification-digit" maxlength="1" data-index="3">
                    </div>
                    <div class="verification-example">
                        Example code: <strong>7 3 9 2</strong>
                    </div>
                    
                    <div class="verification-keypad">
                        <button class="keypad-btn" onclick="addDigit('1')">1</button>
                        <button class="keypad-btn" onclick="addDigit('2')">2</button>
                        <button class="keypad-btn" onclick="addDigit('3')">3</button>
                        <button class="keypad-btn" onclick="addDigit('4')">4</button>
                        <button class="keypad-btn" onclick="addDigit('5')">5</button>
                        <button class="keypad-btn" onclick="addDigit('6')">6</button>
                        <button class="keypad-btn" onclick="addDigit('7')">7</button>
                        <button class="keypad-btn" onclick="addDigit('8')">8</button>
                        <button class="keypad-btn" onclick="addDigit('9')">9</button>
                        <button class="keypad-btn" onclick="clearCode()">Clear</button>
                        <button class="keypad-btn" onclick="addDigit('0')">0</button>
                        <button class="keypad-btn" onclick="removeDigit()">⌫</button>
                    </div>
                </div>
                
                <div class="download-actions">
                    <button class="download-btn" id="downloadBtn" onclick="verifyAndDownload('${zipFile}', '${toolName}')" disabled>
                        Download ${toolName}
                    </button>
                </div>
                
                <div class="download-instructions" id="downloadInstructions">
                    <h4 class="download-instructions__title">Installation Instructions</h4>
                    <ol class="download-instructions__list">
                        <li>Unzip the downloaded file to a folder on your computer</li>
                        <li>Open Chrome and go to chrome://extensions/</li>
                        <li>Enable "Developer mode" by clicking the toggle in the top right</li>
                        <li>Click "Load unpacked" and select the unzipped folder</li>
                        <li>The extension will now appear in your Chrome toolbar</li>
                        <li>Pin it to your toolbar for easy access</li>
                    </ol>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal with animation
        setTimeout(() => {
            document.getElementById('downloadOverlay').classList.add('active');
            document.getElementById('downloadModal').classList.add('active');
        }, 10);
        
        // Setup input handlers
        setupVerificationInputs();
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
    
    function hideDownloadModal() {
        const overlay = document.getElementById('downloadOverlay');
        const modal = document.getElementById('downloadModal');
        
        if (overlay && modal) {
            overlay.classList.remove('active');
            modal.classList.remove('active');
            
            setTimeout(() => {
                overlay.remove();
                modal.remove();
            }, 300);
        }
        
        // Restore body scrolling
        document.body.style.overflow = 'auto';
    }
    
    function setupVerificationInputs() {
        const inputs = document.querySelectorAll('.verification-digit');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                const value = e.target.value;
                if (value.length === 1 && /^\d$/.test(value)) {
                    e.target.classList.add('filled');
                    // Move to next input
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                } else {
                    e.target.classList.remove('filled');
                }
                checkCodeComplete();
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
            
            input.addEventListener('focus', function(e) {
                e.target.select();
            });
        });
    }
    
    window.addDigit = function(digit) {
        const inputs = document.querySelectorAll('.verification-digit');
        const emptyInput = Array.from(inputs).find(input => !input.value);
        
        if (emptyInput) {
            emptyInput.value = digit;
            emptyInput.classList.add('filled');
            emptyInput.dispatchEvent(new Event('input'));
        }
    };
    
    window.removeDigit = function() {
        const inputs = document.querySelectorAll('.verification-digit');
        const lastFilledInput = Array.from(inputs).reverse().find(input => input.value);
        
        if (lastFilledInput) {
            lastFilledInput.value = '';
            lastFilledInput.classList.remove('filled');
            lastFilledInput.focus();
            checkCodeComplete();
        }
    };
    
    window.clearCode = function() {
        const inputs = document.querySelectorAll('.verification-digit');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        inputs[0].focus();
        checkCodeComplete();
    };
    
    function checkCodeComplete() {
        const inputs = document.querySelectorAll('.verification-digit');
        const code = Array.from(inputs).map(input => input.value).join('');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (code.length === 4) {
            downloadBtn.disabled = false;
        } else {
            downloadBtn.disabled = true;
        }
    }
    
    window.verifyAndDownload = function(zipFile, toolName) {
        // Skip verification - allow free download
        const instructions = document.getElementById('downloadInstructions');
        if (instructions) {
            instructions.classList.add('active');
        }
        
        // Trigger download immediately
        const link = document.createElement('a');
        link.href = `../assets/extensions/${zipFile}`;
        link.download = zipFile;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update button text
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.textContent = `✓ Downloaded ${toolName}`;
            downloadBtn.style.background = '#10b981';
        }
        
        console.log(`✅ Downloaded: ${zipFile}`);
    };
    
    // Expose download modal functions globally
    window.showDownloadModal = showDownloadModal;
    window.hideDownloadModal = hideDownloadModal;

    // ===================================================================
    // Additional Animation Styles Injection
    // ===================================================================
    
    // Inject additional styles for scrolled navbar and forms
    const additionalStyles = `
        .learntav-nav.scrolled {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .learntav-btn--loading {
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .learntav-form__success,
        .learntav-form__error-global {
            margin: 2rem 0;
            padding: 2rem;
            border-radius: 0.5rem;
            text-align: center;
        }
        
        .learntav-form__success {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            color: #15803d;
        }
        
        .learntav-form__error-global {
            background: #fef2f2;
            border: 1px solid #ef4444;
            color: #dc2626;
        }
        
        .learntav-form__success-icon,
        .learntav-form__error-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .learntav-form__error {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .learntav-form__input--error {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);

    // ===================================================================
    // Route Protection Integration
    // ===================================================================
    
    function initializeRouteProtection() {
        // Load route protection CSS if not already loaded
        if (!document.querySelector('link[href*="route-protection.css"]')) {
            const routeProtectionCSS = document.createElement('link');
            routeProtectionCSS.rel = 'stylesheet';
            routeProtectionCSS.href = './assets/css/route-protection.css';
            document.head.appendChild(routeProtectionCSS);
        }
        
        // Check if route protection system is available
        if (window.routeProtection) {
            console.log('✅ Route protection system active');
        } else {
            console.log('⏳ Route protection system loading...');
            
            // Fallback: Basic auth state management
            initializeFallbackAuthSystem();
        }
    }
    
    /**
     * Fallback auth system for when route protection module isn't loaded
     */
    function initializeFallbackAuthSystem() {
        // Basic auth state indicators
        const authElements = document.querySelectorAll('[data-auth-state]');
        
        // Hide auth-required elements by default
        authElements.forEach(element => {
            const requiredState = element.dataset.authState;
            
            switch (requiredState) {
                case 'authenticated':
                case 'admin':
                    element.style.display = 'none';
                    break;
                case 'unauthenticated':
                    element.style.display = 'block';
                    break;
            }
        });
        
        // Add basic protection to admin links
        const adminLinks = document.querySelectorAll('a[href*="/admin/"]');
        adminLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Authentication required. Please sign in to access admin features.');
            });
        });
        
        // The main showAuthModal function is already defined globally at line 14
        // No need to redefine it here - removing duplicate
        
        function createAndShowAuthModal(tab = 'signin') {
            console.log('🟡 DEBUG: createAndShowAuthModal called with tab:', tab);
            
            // Remove existing modal if any
            const existingModal = document.querySelector('#dynamicAuthOverlay');
            if (existingModal) {
                console.log('🟡 DEBUG: Removing existing modal');
                existingModal.remove();
            }
            
            // Create modal HTML
            const modalHTML = `
                <div id="dynamicAuthOverlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.3s ease;">
                    <div id="dynamicAuthModal" style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 460px; width: 90vw; max-height: 90vh; overflow: hidden; position: relative; transform: scale(0.9) translateY(-20px); opacity: 0; transition: all 0.3s ease;">
                        <button onclick="hideAuthModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280; z-index: 10; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(0, 0, 0, 0.05)'; this.style.color='#374151'" onmouseout="this.style.background='none'; this.style.color='#6b7280'">
                            ×
                        </button>
                        
                        <div style="padding: 0;">
                            <div style="padding: 40px 40px 24px 40px; text-align: center; border-bottom: none;">
                                <h2 style="font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 32px 0; letter-spacing: -0.025em;">Welcome Back</h2>
                                
                                <div style="display: flex; background: #f3f4f6; border-radius: 12px; padding: 6px; gap: 4px; margin-bottom: 32px;">
                                    <button data-tab="signin" onclick="switchAuthTab('signin')" style="background: #2563eb; border: none; padding: 16px 20px; border-radius: 8px; font-weight: 500; font-size: 15px; color: white; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; min-height: 52px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);">
                                        <span style="font-size: 18px;">🔐</span>
                                        Sign In
                                    </button>
                                    <button data-tab="signup" onclick="switchAuthTab('signup')" style="background: transparent; border: none; padding: 16px 20px; border-radius: 8px; font-weight: 500; font-size: 15px; color: #6b7280; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; min-height: 52px;" onmouseover="this.style.color='#374151'; this.style.background='rgba(59, 130, 246, 0.08)'" onmouseout="this.style.color='#6b7280'; this.style.background='transparent'">
                                        <span style="font-size: 18px;">✨</span>
                                        Create Account
                                    </button>
                                </div>
                            </div>
                            
                            <div style="padding: 0 40px 32px 40px; overflow-y: auto; max-height: calc(90vh - 200px);">
                                <!-- Sign In Tab -->
                                <div id="signin-tab" style="display: block;">
                                    <div style="text-align: left; margin-bottom: 32px;">
                                        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">Sign in to access your personalized learning experience</p>
                                    </div>
                                    
                                    <!-- Demo Credentials Notice -->
                                    <div class="demo-credentials-notice" style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #0ea5e9; border-radius: 8px; font-size: 0.9rem;">
                                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; color: #0c4a6e; font-weight: 600;">
                                            <span style="font-size: 1.1rem;">🔧</span>
                                            Demo Mode - Use These Credentials
                                        </div>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: #075985;">
                                            <div>
                                                <div style="font-weight: 500; margin-bottom: 0.25rem;">👤 Regular User:</div>
                                                <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                                                    demo@learntav.com<br>
                                                    demo123
                                                </div>
                                            </div>
                                            <div>
                                                <div style="font-weight: 500; margin-bottom: 0.25rem;">👑 Admin User:</div>
                                                <div style="font-family: 'Courier New', monospace; background: rgba(255,255,255,0.7); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">
                                                    admin@learntav.com<br>
                                                    admin123
                                                </div>
                                            </div>
                                        </div>
                                        <div style="margin-top: 0.75rem; font-size: 0.8rem; color: #0369a1; font-style: italic;">
                                            💡 This is a demo environment. In production, you would use your real credentials.
                                        </div>
                                    </div>
                                    
                                    <form id="dynamic-signin-form" onsubmit="handleSignIn(event)" style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signin-email" style="font-weight: 500; color: #374151; font-size: 14px;">Email Address *</label>
                                            <input type="email"
                                                   id="dynamic-signin-email"
                                                   name="email"
                                                   placeholder="Enter your email address"
                                                   required
                                                   style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                   onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                   onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                        </div>
                                        
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signin-password" style="font-weight: 500; color: #374151; font-size: 14px;">Password *</label>
                                            <div style="position: relative;">
                                                <input type="password"
                                                       id="dynamic-signin-password"
                                                       name="password"
                                                       placeholder="Enter your password"
                                                       required
                                                       style="width: 100%; padding: 16px 50px 16px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                       onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                       onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                                <button type="button" onclick="togglePassword('dynamic-signin-password')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; font-size: 16px;">
                                                    <span class="toggle-show">👁️</span>
                                                    <span class="toggle-hide" style="display: none;">🙈</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <input type="checkbox" name="remember" id="dynamic-remember-checkbox" style="width: 18px; height: 18px;">
                                            <label for="dynamic-remember-checkbox" style="font-size: 14px; color: #374151;">Remember me for 30 days</label>
                                        </div>
                                        
                                        <button type="submit" style="width: 100%; padding: 18px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.2);" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'">
                                            <span class="button-text">Sign In</span>
                                        </button>
                                        
                                        <div id="dynamic-signin-error" style="display: none; background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-top: 16px;"></div>
                                    </form>
                                </div>
                                
                                <!-- Sign Up Tab -->
                                <div id="signup-tab" style="display: none;">
                                    <div style="text-align: left; margin-bottom: 32px;">
                                        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">Create your account to start your AI learning journey</p>
                                    </div>
                                    
                                    <form id="dynamic-signup-form" onsubmit="handleSignUp(event)" style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signup-fullname" style="font-weight: 500; color: #374151; font-size: 14px;">Full Name *</label>
                                            <input type="text"
                                                   id="dynamic-signup-fullname"
                                                   name="fullName"
                                                   placeholder="Enter your full name"
                                                   required
                                                   style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                   onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                   onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                        </div>
                                        
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signup-email" style="font-weight: 500; color: #374151; font-size: 14px;">Email Address *</label>
                                            <input type="email"
                                                   id="dynamic-signup-email"
                                                   name="email"
                                                   placeholder="Enter your email address"
                                                   required
                                                   style="width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                   onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                   onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                        </div>
                                        
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signup-password" style="font-weight: 500; color: #374151; font-size: 14px;">Password *</label>
                                            <div style="position: relative;">
                                                <input type="password"
                                                       id="dynamic-signup-password"
                                                       name="password"
                                                       placeholder="Create a strong password"
                                                       required
                                                       style="width: 100%; padding: 16px 50px 16px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                       onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                       onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                                <button type="button" onclick="togglePassword('dynamic-signup-password')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; font-size: 16px;">
                                                    <span class="toggle-show">👁️</span>
                                                    <span class="toggle-hide" style="display: none;">🙈</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            <label for="dynamic-signup-confirm-password" style="font-weight: 500; color: #374151; font-size: 14px;">Confirm Password *</label>
                                            <div style="position: relative;">
                                                <input type="password"
                                                       id="dynamic-signup-confirm-password"
                                                       name="confirmPassword"
                                                       placeholder="Confirm your password"
                                                       required
                                                       style="width: 100%; padding: 16px 50px 16px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"
                                                       onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
                                                       onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                                <button type="button" onclick="togglePassword('dynamic-signup-confirm-password')" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; font-size: 16px;">
                                                    <span class="toggle-show">👁️</span>
                                                    <span class="toggle-hide" style="display: none;">🙈</span>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <button type="submit" style="width: 100%; padding: 18px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.2);" onmouseover="this.style.background='#1d4ed8'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#2563eb'; this.style.transform='translateY(0)'">
                                            <span class="button-text">Create Account</span>
                                        </button>
                                        
                                        <div id="dynamic-signup-error" style="display: none; background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-top: 16px;"></div>
                                    </form>
                                </div>
                            </div>
                            
                            <div class="auth-modal-footer">
                                <p class="auth-footer-text">
                                    Don't have an account?
                                    <a href="#" class="auth-footer-link" onclick="switchAuthTab('signup')">Create Account</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Inject CSS if not already present
            if (!document.querySelector('#dynamic-auth-modal-css')) {
                const authLink = document.createElement('link');
                authLink.id = 'dynamic-auth-modal-css';
                authLink.rel = 'stylesheet';
                authLink.href = './auth/auth.css';
                document.head.appendChild(authLink);
                
                const dynamicLink = document.createElement('link');
                dynamicLink.id = 'dynamic-auth-modal-dynamic-css';
                dynamicLink.rel = 'stylesheet';
                dynamicLink.href = './assets/css/auth-modal-dynamic.css';
                document.head.appendChild(dynamicLink);
            }
            
            // Add modal to page
            console.log('🟡 DEBUG: Adding modal HTML to page');
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Show modal with animation
            const overlay = document.getElementById('dynamicAuthOverlay');
            const modal = document.getElementById('dynamicAuthModal');
            
            console.log('🟡 DEBUG: Overlay element:', overlay);
            console.log('🟡 DEBUG: Modal element:', modal);
            
            if (overlay && modal) {
                overlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    overlay.classList.add('active');
                    modal.classList.add('active');
                    console.log('🟡 DEBUG: Modal should now be visible');
                }, 10);
            } else {
                console.error('🔴 ERROR: Could not find overlay or modal elements');
            }
            
            // Switch to requested tab
            if (tab === 'signup') {
                switchAuthTab('signup');
            }
            
            // Close modal when clicking overlay
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    hideAuthModal();
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    hideAuthModal();
                }
            });
        }
        
        // Global functions for modal interaction
        window.hideAuthModal = function() {
            const overlay = document.getElementById('dynamicAuthOverlay');
            const modal = document.getElementById('dynamicAuthModal');
            
            if (!overlay || !modal) return;
            
            overlay.classList.remove('active');
            modal.classList.remove('active');
            
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        };
        
        window.switchAuthTab = function(tabName) {
            const modal = document.getElementById('dynamicAuthModal');
            if (!modal) return;
            
            // Update tab buttons
            modal.querySelectorAll('.auth-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const newActiveTab = modal.querySelector(`[data-tab="${tabName}"]`);
            if (newActiveTab) {
                newActiveTab.classList.add('active');
            }
            
            // Update content
            modal.querySelectorAll('.auth-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const newContent = document.getElementById(`${tabName}-tab`);
            if (newContent) {
                newContent.classList.add('active');
            }
            
            // Update header and footer text
            const headerText = modal.querySelector('.auth-modal-header h2');
            const footerText = modal.querySelector('.auth-footer-text');
            const footerLink = modal.querySelector('.auth-footer-link');
            
            if (headerText) {
                headerText.textContent = tabName === 'signin' ? 'Welcome Back' : 'Create Account';
            }
            
            if (footerText && footerLink) {
                if (tabName === 'signin') {
                    footerText.innerHTML = `Don't have an account? <a href="#" class="auth-footer-link" onclick="switchAuthTab('signup')">Create Account</a>`;
                } else {
                    footerText.innerHTML = `Already have an account? <a href="#" class="auth-footer-link" onclick="switchAuthTab('signin')">Sign In</a>`;
                }
            }
            
            // Clear errors
            modal.querySelectorAll('.auth-error-message').forEach(el => {
                el.style.display = 'none';
            });
        };
        
        window.togglePassword = function(inputId) {
            const input = document.getElementById(inputId);
            const button = document.querySelector(`[onclick="togglePassword('${inputId}')"]`);
            
            if (!input || !button) return;
            
            const showIcon = button.querySelector('.toggle-show');
            const hideIcon = button.querySelector('.toggle-hide');
            
            if (input.type === 'password') {
                input.type = 'text';
                showIcon.style.display = 'none';
                hideIcon.style.display = 'inline';
            } else {
                input.type = 'password';
                showIcon.style.display = 'inline';
                hideIcon.style.display = 'none';
            }
        };
        
        window.handleSignIn = async function(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const email = formData.get('email')?.trim();
            const password = formData.get('password');
            const rememberMe = formData.get('remember');
            
            const submitButton = form.querySelector('.auth-submit-button');
            const errorElement = document.getElementById('dynamic-signin-error');
            
            // Clear previous errors
            errorElement.style.display = 'none';
            
            if (!email || !password) {
                showAuthError('dynamic-signin-error', 'Please enter both email and password');
                return;
            }
            
            // Set loading state
            submitButton.disabled = true;
            submitButton.querySelector('.button-text').textContent = 'Signing In...';
            
            try {
                // Demo authentication
                if ((email === 'demo@learntav.com' && password === 'demo123') ||
                    (email === 'admin@learntav.com' && password === 'admin123')) {
                    
                    // Handle remember me
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                        localStorage.setItem('userEmail', email);
                    }
                    
                    // Set auth state
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userRole', email.includes('admin') ? 'admin' : 'user');
                    localStorage.setItem('userEmail', email);
                    
                    showAuthSuccess('Welcome back! Redirecting to your dashboard...');
                    
                    setTimeout(() => {
                        if (email.includes('admin')) {
                            window.location.href = './admin/dashboard.html';
                        } else {
                            window.location.href = './dashboard/index.html';
                        }
                    }, 1500);
                    
                } else {
                    showAuthError('dynamic-signin-error', 'Invalid email or password. Please try the demo credentials above.');
                }
                
            } catch (error) {
                console.error('Sign in error:', error);
                showAuthError('dynamic-signin-error', 'An error occurred. Please try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.querySelector('.button-text').textContent = 'Sign In';
            }
        };
        
        window.handleSignUp = async function(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const fullName = formData.get('fullName')?.trim();
            const email = formData.get('email')?.trim();
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            const submitButton = form.querySelector('.auth-submit-button');
            const errorElement = document.getElementById('dynamic-signup-error');
            
            // Clear previous errors
            errorElement.style.display = 'none';
            
            // Basic validation
            if (!fullName || !email || !password || !confirmPassword) {
                showAuthError('dynamic-signup-error', 'Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                showAuthError('dynamic-signup-error', 'Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                showAuthError('dynamic-signup-error', 'Password must be at least 8 characters long');
                return;
            }
            
            // Set loading state
            submitButton.disabled = true;
            submitButton.querySelector('.button-text').textContent = 'Creating Account...';
            
            try {
                // Simulate account creation
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                showAuthSuccess('Account created successfully! Please check your email to verify your account.');
                
                setTimeout(() => {
                    form.reset();
                    switchAuthTab('signin');
                    document.getElementById('dynamic-signin-email').value = email;
                }, 2500);
                
            } catch (error) {
                console.error('Sign up error:', error);
                showAuthError('dynamic-signup-error', 'Failed to create account. Please try again.');
            } finally {
                submitButton.disabled = false;
                submitButton.querySelector('.button-text').textContent = 'Create Account';
            }
        };
        
        function showAuthError(elementId, message) {
            const errorElement = document.getElementById(elementId);
            if (!errorElement) return;
            
            errorElement.innerHTML = `<span class="message-icon">⚠️</span><span class="message-text">${message}</span>`;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 8000);
        }
        
        function showAuthSuccess(message) {
            const modal = document.getElementById('dynamicAuthModal');
            if (!modal) return;
            
            let successElement = modal.querySelector('.auth-success-message');
            if (!successElement) {
                successElement = document.createElement('div');
                successElement.className = 'auth-success-message';
                const modalBody = modal.querySelector('.auth-modal-body');
                if (modalBody) {
                    modalBody.insertBefore(successElement, modalBody.firstChild);
                }
            }
            
            successElement.innerHTML = `<span class="message-icon">✅</span><span class="message-text">${message}</span>`;
            successElement.style.display = 'block';
            
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 6000);
        }
        
        console.log('✅ Fallback auth system initialized');
    }
    
    // ===================================================================
    // Enhanced Navigation with Auth Integration
    // ===================================================================
    
    // Enhance existing navigation with auth-aware functionality
    const originalHighlightActiveNavLink = highlightActiveNavLink;
    highlightActiveNavLink = function() {
        originalHighlightActiveNavLink();
        
        // Add auth-based navigation enhancements
        const navLinks = document.querySelectorAll('.learntav-nav__link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Mark protected routes
            if (href && (href.includes('/admin/') || href.includes('/dashboard/'))) {
                if (!link.classList.contains('nav-protected')) {
                    link.classList.add('nav-protected');
                    
                    // Add protection indicator
                    const protectedIndicator = document.createElement('span');
                    protectedIndicator.className = 'nav-protected-indicator';
                    protectedIndicator.innerHTML = '🔒';
                    protectedIndicator.title = 'Authentication required';
                    link.appendChild(protectedIndicator);
                }
            }
        });
    };
    
    // ===================================================================
    // User Profile Integration
    // ===================================================================
    
    function createUserProfileDropdown() {
        const navActions = document.querySelector('.learntav-nav__actions');
        if (!navActions) return;
        
        // Create user profile dropdown
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-profile-dropdown';
        userDropdown.innerHTML = `
            <button class="user-profile-button" data-auth-state="authenticated">
                <div class="user-avatar">
                    <span data-user-name>U</span>
                </div>
                <span class="user-name" data-user-name>User</span>
                <span class="dropdown-arrow">▾</span>
            </button>
            <div class="user-profile-menu">
                <a href="/dashboard/" class="user-profile-menu-item">
                    📊 Dashboard
                </a>
                <a href="/profile/" class="user-profile-menu-item">
                    👤 Profile
                </a>
                <a href="/settings/" class="user-profile-menu-item">
                    ⚙️ Settings
                </a>
                <div class="user-profile-menu-divider"></div>
                <a href="/admin/dashboard.html" class="user-profile-menu-item" data-auth-state="admin">
                    👑 Admin Panel
                </a>
                <div class="user-profile-menu-divider" data-auth-state="admin"></div>
                <button class="user-profile-menu-item" onclick="handleSignOut()">
                    🚪 Sign Out
                </button>
            </div>
        `;
        
        // Insert before existing buttons
        const getStartedBtn = navActions.querySelector('.learntav-btn');
        if (getStartedBtn) {
            navActions.insertBefore(userDropdown, getStartedBtn);
        } else {
            navActions.appendChild(userDropdown);
        }
        
        // Add dropdown toggle functionality
        const dropdownButton = userDropdown.querySelector('.user-profile-button');
        const dropdownMenu = userDropdown.querySelector('.user-profile-menu');
        
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('open');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('open');
        });
        
        // Hide by default (will be shown by route protection system)
        userDropdown.style.display = 'none';
    }
    
    // Global sign out handler
    window.handleSignOut = async function() {
        try {
            // Try to use the Supabase sign out if available
            if (window.supabase && window.supabase.auth) {
                await window.supabase.auth.signOut();
            }
            
            // Clear any local storage auth tokens
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
            
            // Redirect to home page
            window.location.href = '/';
            
        } catch (error) {
            console.error('Sign out error:', error);
            // Fallback: force redirect
            window.location.href = '/';
        }
    };
    
    // ===================================================================
    // Enhanced Form Integration
    // ===================================================================
    
    // Override form submission to integrate with Supabase
    const originalSubmitForm = FormValidator.prototype.submitForm;
    FormValidator.prototype.submitForm = async function() {
        // Check if this is a contact form and if Supabase integration is available
        const formType = this.form.querySelector('input[name="form_type"]')?.value;
        
        if (formType && window.submitContactForm) {
            // Use Supabase integration
            const submitButton = this.form.querySelector('button[type="submit"], input[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('learntav-btn--loading');
            
            try {
                // Collect form data
                const formData = new FormData(this.form);
                const submissionData = {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                
                // Convert FormData to object
                for (let [key, value] of formData.entries()) {
                    if (key !== 'website') { // Skip honeypot
                        submissionData[key] = value;
                    }
                }
                
                // Submit via Supabase
                const result = await window.submitContactForm(submissionData);
                
                if (result.success) {
                    this.showSuccessMessage();
                    this.form.reset();
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showErrorMessage(error.message);
                
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.classList.remove('learntav-btn--loading');
            }
        } else {
            // Fall back to original submission method
            return originalSubmitForm.call(this);
        }
    };
    
    // Initialize user profile dropdown
    createUserProfileDropdown();
    
    // Enhanced navigation highlighting
    highlightActiveNavLink();

})();