/**
 * LearnTAV Website JavaScript
 * Professional interactive functionality for education and consulting website
 */

// IMMEDIATE DEBUG: Test if JavaScript is loading
console.log('🚀 DEBUG: JavaScript file is loading!');

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
    
    // DEBUG: Track animation system status
    window.LEARNTAV_DEBUG = {
        animationSystemLoaded: false,
        elementsFound: 0,
        elementsAnimated: 0,
        failsafeTriggered: false,
        intersectionObserverSupported: false,
        log: function(message, data) {
            console.log('🐛 ANIMATION DEBUG:', message, data || '');
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
                const rect = el.getBoundingClientRect();
                const isInitiallyInView = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (!isInitiallyInView) {
                    // Mark elements as hidden via CSS class only
                    el.classList.add('animate-pending');
                    window.LEARNTAV_DEBUG.log(`JS: Marked element ${index} as animate-pending`);
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
                    // Use offsetTop instead of getBoundingClientRect to avoid transform issues
                    const elementTop = el.offsetTop;
                    const elementHeight = el.offsetHeight;
                    const elementBottom = elementTop + elementHeight;
                    
                    // Calculate if element is in viewport using offset positioning
                    const isInViewport = (elementBottom > scrollTop + 100) && (elementTop < scrollTop + windowHeight - 100);
                    
                    window.LEARNTAV_DEBUG.log(`🔍 OFFSET check element ${index}: offsetTop=${elementTop}, scrollTop=${scrollTop}, windowHeight=${windowHeight}, inViewport=${isInViewport}`);
                    
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
                                window.LEARNTAV_DEBUG.log(`✅ OFFSET: Animated element ${index} (delay: ${baseDelay}ms)`);
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
        console.log('💾 DEBUG: Initializing download system...');
        
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
        
        console.log('✅ DEBUG: Download system initialized');
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

})();