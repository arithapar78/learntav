/**
 * LearnTAV Website JavaScript
 * Clean public website functionality without authentication
 */

// Simple logging for development
console.log('🚀 LearnTAV JavaScript loading...');

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

// Navigation initialization - clean and simple
document.addEventListener('DOMContentLoaded', function() {
    logDiagnostic('INIT', 'Starting navigation initialization');
    
    // Basic navigation setup
    const navActions = document.querySelector('.learntav-nav__actions');
    
    if (navActions) {
        navActions.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
        `;
        
        // Ensure Get Started button has proper styling
        const getStartedButton = navActions.querySelector('a.learntav-btn--primary');
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
            
            console.log('🔴 DEBUG: Get Started button styling applied');
        }
        
        console.log('🔴 DEBUG: Navigation layout initialized');
        
        // Initialize profile button system on all pages
        initializeProfileButton();
    }
});

// ===================================================================
// Universal Profile Button System
// ===================================================================
function initializeProfileButton() {
    const userName = localStorage.getItem('user_name');
    if (userName) {
        addProfileButton(userName);
    }
}

function addProfileButton(name) {
    const navActions = document.querySelector('.learntav-nav__actions');
    if (!navActions) return;
    
    // Remove existing profile button if any
    const existingProfileBtn = document.getElementById('profile-button');
    if (existingProfileBtn) {
        existingProfileBtn.remove();
    }
    
    // Determine the correct relative path to profile
    let profilePath = 'profile/index.html';
    const currentPath = window.location.pathname;
    
    // Adjust path based on directory depth
    if (currentPath.includes('/education/') ||
        currentPath.includes('/consulting/') ||
        currentPath.includes('/about/') ||
        currentPath.includes('/resources/') ||
        currentPath.includes('/ai-tools/') ||
        currentPath.includes('/contact/') ||
        currentPath.includes('/settings/') ||
        currentPath.includes('/legal/')) {
        profilePath = '../profile/index.html';
    } else if (currentPath.includes('/vibe-coding-101/') ||
               currentPath.includes('/paths/') ||
               currentPath.includes('/approach/') ||
               currentPath.includes('/team/') ||
               currentPath.includes('/case-studies/') ||
               currentPath.includes('/blog/') ||
               currentPath.includes('/guides/') ||
               currentPath.includes('/newsletter/') ||
               currentPath.includes('/tools/') ||
               currentPath.includes('/power-tracker/') ||
               currentPath.includes('/prompt-energy-optimizer/') ||
               currentPath.includes('/privacy/') ||
               currentPath.includes('/terms/') ||
               currentPath.includes('/cookies/')) {
        profilePath = '../../profile/index.html';
    }
    
    // Create profile button
    const profileBtn = document.createElement('a');
    profileBtn.id = 'profile-button';
    profileBtn.href = profilePath;
    profileBtn.className = 'learntav-btn learntav-btn--secondary profile-btn';
    profileBtn.innerHTML = `👤 ${name.split(' ')[0]}`;
    profileBtn.title = `Profile: ${name}`;
    
    // Find the Get Started button and insert profile button before it
    const getStartedBtn = navActions.querySelector('a.learntav-btn--primary');
    const toggle = navActions.querySelector('.learntav-nav__toggle');
    
    if (getStartedBtn) {
        navActions.insertBefore(profileBtn, getStartedBtn);
    } else if (toggle) {
        navActions.insertBefore(profileBtn, toggle);
    } else {
        navActions.appendChild(profileBtn);
    }
    
    console.log('🔴 DEBUG: Profile button added for:', name);
}

// Make sure profile button is added when name is submitted on any page
function handleGlobalNameEntry(name) {
    // Store name
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_first_visit', 'false');
    
    // Add profile button
    addProfileButton(name);
}

(function() {
    'use strict';
    
    // Utility Functions
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
    
    // Animation system debugging
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
    
    // Set up scroll animations
    const setupScrollAnimations = function() {
        const elements = document.querySelectorAll(
            '.scroll-animate, .learntav-value-card:not(.scroll-animate), .learntav-service-card:not(.scroll-animate), .learntav-testimonial-card:not(.scroll-animate)'
        );
        
        window.LEARNTAV_DEBUG.elementsFound = elements.length;
        window.LEARNTAV_DEBUG.log('Early setup found elements:', elements.length);
        
        elements.forEach((el, index) => {
            if (!el.classList.contains('scroll-animate')) {
                el.classList.add('scroll-animate');
                window.LEARNTAV_DEBUG.log(`Added scroll-animate to element ${index}:`, el.className);
            }
            
            if (document.body.classList.contains('enable-scroll-animations')) {
                const rect = el.getBoundingClientRect();
                const offsetTop = el.offsetTop;
                const offsetHeight = el.offsetHeight;
                
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
                    el.classList.add('animate-pending');
                    window.LEARNTAV_DEBUG.log(`JS: Marked element ${index} as animate-pending (rect.top: ${Math.round(rect.top)}, offsetTop: ${offsetTop})`);
                } else {
                    el.classList.add('animate-in');
                    window.LEARNTAV_DEBUG.log(`JS: Element ${index} initially visible, marked as animated`);
                }
            }
        });
        
        // Robust failsafe system
        const enableFailsafe = () => {
            window.LEARNTAV_DEBUG.log('Enabling failsafe system');
            
            setTimeout(() => {
                elements.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    const transform = computedStyle.transform;
                    const opacity = computedStyle.opacity;
                    
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
            
            // Final failsafe
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
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupScrollAnimations);
    } else {
        setupScrollAnimations();
    }

    // DOM Ready and Initialization
    document.addEventListener('DOMContentLoaded', function() {
        initializeNavigation();
        initializeSmoothScrolling();
        initializeFormValidation();
        initializeAnimations();
        initializeAccessibility();
    });

    // Enhanced Navigation Functionality with Mobile Touch Support
    function initializeNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.learntav-nav__link');
        
        // Mobile touch optimization
        let touchStartX = 0;
        let touchStartY = 0;
        let touchMoved = false;

        if (navToggle && navMenu) {
            // Enhanced click/touch handler for toggle
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const isActive = navMenu.classList.contains('active');
                
                if (isActive) {
                    closeNavMenu();
                } else {
                    openNavMenu();
                }
            });

            // Touch optimization for mobile toggle
            navToggle.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchMoved = false;
            }, { passive: true });

            navToggle.addEventListener('touchmove', function(e) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = Math.abs(touchX - touchStartX);
                const deltaY = Math.abs(touchY - touchStartY);
                
                if (deltaX > 10 || deltaY > 10) {
                    touchMoved = true;
                }
            }, { passive: true });

            navToggle.addEventListener('touchend', function(e) {
                if (!touchMoved) {
                    e.preventDefault();
                    const isActive = navMenu.classList.contains('active');
                    if (isActive) {
                        closeNavMenu();
                    } else {
                        openNavMenu();
                    }
                }
            });

            // Enhanced nav link interactions with mobile touch feedback
            navLinks.forEach((link, index) => {
                // Optimize touch action
                link.style.touchAction = 'manipulation';
                
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        // Add visual feedback
                        link.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                        setTimeout(() => {
                            link.style.backgroundColor = '';
                            closeNavMenu();
                        }, 150);
                    }
                });

                // Touch feedback for mobile
                link.addEventListener('touchstart', function() {
                    if (window.innerWidth <= 768) {
                        this.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                    }
                }, { passive: true });

                link.addEventListener('touchend', function() {
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            this.style.backgroundColor = '';
                        }, 200);
                    }
                }, { passive: true });
            });

            // Enhanced click/touch outside to close
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!e.target.closest('.learntav-nav') && navMenu.classList.contains('active')) {
                        closeNavMenu();
                    }
                }
            });

            document.addEventListener('touchstart', function(e) {
                if (window.innerWidth <= 768) {
                    if (!e.target.closest('.learntav-nav') && navMenu.classList.contains('active')) {
                        closeNavMenu();
                    }
                }
            }, { passive: true });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                    closeNavMenu();
                    navToggle.focus();
                }
            });

            // Prevent body scroll when mobile menu is open
            function preventBodyScroll() {
                if (window.innerWidth <= 768) {
                    document.body.style.overflow = 'hidden';
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${window.scrollY}px`;
                }
            }
            
            function restoreBodyScroll() {
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }

            // Create mobile overlay
            function createMobileOverlay() {
                if (window.innerWidth <= 768) {
                    const overlay = document.createElement('div');
                    overlay.className = 'learntav-nav__overlay';
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 999;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(2px);
                    `;
                    
                    overlay.addEventListener('click', closeNavMenu);
                    overlay.addEventListener('touchstart', closeNavMenu, { passive: true });
                    
                    document.body.appendChild(overlay);
                    
                    setTimeout(() => {
                        overlay.style.opacity = '1';
                        overlay.style.visibility = 'visible';
                    }, 10);
                    
                    return overlay;
                }
                return null;
            }
            
            function removeMobileOverlay() {
                const overlay = document.querySelector('.learntav-nav__overlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.visibility = 'hidden';
                    setTimeout(() => {
                        overlay.remove();
                    }, 300);
                }
            }

            // Store references for enhanced functions
            window.preventBodyScroll = preventBodyScroll;
            window.restoreBodyScroll = restoreBodyScroll;
            window.createMobileOverlay = createMobileOverlay;
            window.removeMobileOverlay = removeMobileOverlay;
        }

        highlightActiveNavLink();
        
        // Add resize handler to close menu when switching to desktop
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
                closeNavMenu();
            }
        }, 250));
    }

    function openNavMenu() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Close navigation menu');
        
        const lines = navToggle.querySelectorAll('.learntav-nav__toggle-line');
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        
        // Mobile enhancements
        if (window.preventBodyScroll) window.preventBodyScroll();
        if (window.createMobileOverlay) window.createMobileOverlay();
        
        const firstLink = navMenu.querySelector('.learntav-nav__link');
        if (firstLink && typeof firstLink.focus === 'function') {
            setTimeout(() => {
                try {
                    firstLink.focus();
                } catch (error) {
                    console.log('Focus error handled:', error.message);
                }
            }, 100);
        }
    }

    function closeNavMenu() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        
        const lines = navToggle.querySelectorAll('.learntav-nav__toggle-line');
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
        
        // Mobile enhancements
        if (window.restoreBodyScroll) window.restoreBodyScroll();
        if (window.removeMobileOverlay) window.removeMobileOverlay();
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

    // Smooth Scrolling
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
                    
                    target.focus();
                    if (target.tabIndex === -1) {
                        target.tabIndex = -1;
                    }
                }
            });
        });
    }

    // Form Validation and Handling
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
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validate()) {
                    this.submitForm();
                } else {
                    this.focusFirstError();
                }
            });

            const fields = this.form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.clearFieldError(field));
            });

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
            
            const requiredFields = this.form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!this.isFieldValid(field)) {
                    this.addError(field.name, this.getErrorMessage(field, 'required'));
                }
            });

            const emailFields = this.form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !this.isValidEmail(field.value)) {
                    this.addError(field.name, 'Please enter a valid email address');
                }
            });

            const phoneFields = this.form.querySelectorAll('input[type="tel"]');
            phoneFields.forEach(field => {
                if (field.value && !this.isValidPhone(field.value)) {
                    this.addError(field.name, 'Please enter a valid phone number');
                }
            });

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
            this.form.querySelectorAll('.learntav-form__error').forEach(error => {
                error.remove();
            });

            this.form.querySelectorAll('.learntav-form__input--error').forEach(field => {
                field.classList.remove('learntav-form__input--error');
                field.removeAttribute('aria-describedby');
                field.removeAttribute('aria-invalid');
            });

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
            
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('learntav-btn--loading');

            try {
                await this.simulateFormSubmission();
                this.showSuccessMessage();
                this.form.reset();
                
            } catch (error) {
                this.showErrorMessage(error.message);
                
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.classList.remove('learntav-btn--loading');
            }
        }

        async simulateFormSubmission() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
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
            
            setTimeout(() => {
                message.remove();
            }, 8000);
        }
    }

    // Scroll Animations and Intersection Observer
    function initializeAnimations() {
        window.LEARNTAV_DEBUG.log('Main animation system initializing...');
        window.LEARNTAV_DEBUG.animationSystemLoaded = true;
        
        const animatedElements = document.querySelectorAll('.scroll-animate');
        
        window.LEARNTAV_DEBUG.log('Main system found elements:', animatedElements.length);
        
        if (animatedElements.length === 0) {
            window.LEARNTAV_DEBUG.log('No elements found - early system may have handled setup');
            initializeDownloadSystem();
            initializeNavbarScroll();
            return;
        }
        
        window.LEARNTAV_DEBUG.intersectionObserverSupported = true;
        window.LEARNTAV_DEBUG.log('Using scroll-based animation system...');
        
        const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        
        function checkElementsInViewport() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            
            animatedElements.forEach((el, index) => {
                if (!el.classList.contains('animate-in')) {
                    const rect = el.getBoundingClientRect();
                    const elementTop = el.offsetTop;
                    const elementHeight = el.offsetHeight;
                    const elementBottom = elementTop + elementHeight;
                    
                    let isInViewport;
                    if (elementTop === 0 && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                        isInViewport = rect.top < (windowHeight - 100) && rect.bottom > 100;
                        window.LEARNTAV_DEBUG.logDiagnostic(`Using rect fallback for element ${index}`, {
                            rectTop: Math.round(rect.top),
                            rectBottom: Math.round(rect.bottom),
                            isInViewport
                        });
                    } else {
                        isInViewport = (elementBottom > scrollTop + 100) && (elementTop < scrollTop + windowHeight - 100);
                    }
                    
                    window.LEARNTAV_DEBUG.log(`🔍 ENHANCED check element ${index}: offsetTop=${elementTop}, rectTop=${Math.round(rect.top)}, scrollTop=${scrollTop}, windowHeight=${windowHeight}, inViewport=${isInViewport}`);
                    
                    if (isInViewport) {
                        let baseDelay = index * 100;
                        if (isHomepage) {
                            baseDelay += Math.min(150, index * 50);
                        }
                        
                        setTimeout(() => {
                            if (!el.classList.contains('animate-in')) {
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
        
        setTimeout(checkElementsInViewport, 100);
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    checkElementsInViewport();
                    scrollTimeout = null;
                }, 100);
            }
        }, { passive: true });
        
        window.addEventListener('resize', checkElementsInViewport);

        setTimeout(() => {
            animatedElements.forEach((el, index) => {
                if (!el.classList.contains('animate-in')) {
                    window.LEARNTAV_DEBUG.log(`EMERGENCY: Revealing hidden element ${index}`);
                    el.classList.add('animate-in');
                    window.LEARNTAV_DEBUG.elementsAnimated++;
                    window.LEARNTAV_DEBUG.failsafeTriggered = true;
                }
            });
            
            window.LEARNTAV_DEBUG.log('Final Animation Status:', {
                elementsFound: window.LEARNTAV_DEBUG.elementsFound,
                elementsAnimated: window.LEARNTAV_DEBUG.elementsAnimated,
                intersectionObserverSupported: window.LEARNTAV_DEBUG.intersectionObserverSupported,
                failsafeTriggered: window.LEARNTAV_DEBUG.failsafeTriggered
            });
        }, 10000);

        initializeDownloadSystem();
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

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
                setTimeout(() => ticking = false, 16);
            }
        });
    }

    // Accessibility Enhancements
    function initializeAccessibility() {
        createSkipToContentLink();
        enhanceKeyboardNavigation();
        manageFocusForScreenReaders();
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
        const interactiveElements = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        
        interactiveElements.forEach(element => {
            if (!element.textContent.trim()) {
                const context = element.closest('[data-section]')?.getAttribute('data-section') || 'page';
                element.setAttribute('aria-label', `Interactive element in ${context}`);
            }
        });
    }

    function announcePageChanges() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'announcements';
        document.body.appendChild(liveRegion);
        
        window.announceToScreenReader = function(message) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        };
    }

    // Download System (simplified)
    function initializeDownloadSystem() {
        logDiagnostic('DOWNLOAD', 'Initializing simplified download system...');
        
        const downloadButtons = document.querySelectorAll('.btn-purchase, .learntav-btn[href*="power-tracker"], .learntav-btn[href*="prompt-energy-optimizer"]');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href') || this.getAttribute('data-href');
                if (url && (url.includes('power-tracker') || url.includes('prompt-energy-optimizer'))) {
                    directDownload(url);
                }
            });
        });
        
        logDiagnostic('DOWNLOAD', 'Download system initialized successfully');
    }
    
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
            
            alert(`✅ ${toolName} download started!\n\nInstallation:\n1. Unzip the downloaded file\n2. Open Chrome → Extensions\n3. Enable Developer Mode\n4. Click "Load Unpacked"\n5. Select the unzipped folder`);
        }
    }
    
    // Additional styles injection
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

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    
    // Mobile-specific enhancements
    const mobileEnhancements = `
        /* Mobile Touch Optimizations */
        @media (max-width: 768px) {
            .learntav-btn,
            .learntav-nav__link,
            .learntav-nav__toggle {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            .learntav-nav__menu {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
            }
            
            .learntav-nav__overlay {
                -webkit-backdrop-filter: blur(2px);
                backdrop-filter: blur(2px);
            }
            
            /* Prevent zoom on input focus */
            input, textarea, select {
                font-size: 16px !important;
                transform: translateZ(0);
            }
            
            /* Enhanced mobile button feedback */
            .learntav-btn:active {
                transform: scale(0.98) !important;
                transition: transform 0.1s ease;
            }
            
            .learntav-nav__link:active {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
        }
        
        /* Prevent horizontal scrolling on mobile */
        html, body {
            overflow-x: hidden;
        }
        
        /* Enhanced accessibility for mobile */
        @media (hover: none) and (pointer: coarse) {
            .learntav-btn:hover,
            .learntav-nav__link:hover {
                transform: none;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles + mobileEnhancements;
    document.head.appendChild(styleSheet);

    // Initialize mobile-specific features
    if (window.innerWidth <= 768) {
        // Add viewport meta tag if missing
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
        
        // Prevent default touch behaviors on navigation
        const nav = document.querySelector('.learntav-nav');
        if (nav) {
            nav.addEventListener('touchmove', function(e) {
                // Allow scrolling only in mobile menu
                if (!e.target.closest('.learntav-nav__menu')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // Optimize scroll performance
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
    }

})();

// View Mode Toggle System
class ViewModeController {
  constructor() {
    this.currentMode = localStorage.getItem('viewMode') || 'auto';
    this.init();
  }

  init() {
    this.createToggleButton();
    this.applyViewMode(this.currentMode);
    this.addEventListeners();
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'view-toggle-btn';
    button.innerHTML = this.getButtonContent();
    button.setAttribute('aria-label', 'Toggle view mode');
    button.setAttribute('title', 'Switch between mobile, desktop, and auto view modes');
    document.body.appendChild(button);
    this.button = button;
  }

  getButtonContent() {
    const modes = {
      'mobile': '💻 Desktop View',
      'desktop': '📱 Mobile View',
      'auto': '🔄 Auto View'
    };
    return modes[this.currentMode];
  }

  toggleViewMode() {
    const modes = ['auto', 'mobile', 'desktop'];
    const currentIndex = modes.indexOf(this.currentMode);
    this.currentMode = modes[(currentIndex + 1) % modes.length];
    
    localStorage.setItem('viewMode', this.currentMode);
    this.applyViewMode(this.currentMode);
    this.button.innerHTML = this.getButtonContent();
    this.announceViewModeChange();
  }

  applyViewMode(mode) {
    // Remove any existing view mode classes
    document.body.className = document.body.className.replace(/view-mode-\w+/g, '');
    document.body.classList.add(`view-mode-${mode}`);
    
    if (mode === 'mobile') {
      this.forceMobileLayout();
    } else if (mode === 'desktop') {
      this.forceDesktopLayout();
    } else {
      this.restoreAutoLayout();
    }
  }

  forceMobileLayout() {
    // Force mobile styles regardless of screen size
    document.documentElement.style.setProperty('--force-mobile', '1');
    
    // Trigger mobile navigation if needed
    const nav = document.querySelector('.learntav-nav');
    if (nav) {
      nav.classList.add('force-mobile');
    }
  }

  forceDesktopLayout() {
    // Force desktop styles regardless of screen size
    document.documentElement.style.setProperty('--force-desktop', '1');
    
    // Ensure desktop navigation
    const nav = document.querySelector('.learntav-nav');
    if (nav) {
      nav.classList.add('force-desktop');
    }
  }

  restoreAutoLayout() {
    // Remove forced layout styles
    document.documentElement.style.removeProperty('--force-mobile');
    document.documentElement.style.removeProperty('--force-desktop');
    
    const nav = document.querySelector('.learntav-nav');
    if (nav) {
      nav.classList.remove('force-mobile', 'force-desktop');
    }
  }

  announceViewModeChange() {
    const modeNames = {
      'auto': 'automatic responsive',
      'mobile': 'mobile',
      'desktop': 'desktop'
    };
    
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Switched to ${modeNames[this.currentMode]} view mode`);
    }
  }

  addEventListeners() {
    this.button.addEventListener('click', () => this.toggleViewMode());
    
    // Keyboard support
    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleViewMode();
      }
    });
  }
}

// Initialize View Mode Controller on page load
document.addEventListener('DOMContentLoaded', () => {
  new ViewModeController();
});

console.log('✅ LearnTAV JavaScript loaded successfully (public version)');