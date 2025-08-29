/**
 * LearnTAV Website JavaScript
 * Professional interactive functionality for education and consulting website
 */

(function() {
    'use strict';

    // ===================================================================
    // DOM Ready and Initialization
    // ===================================================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initializePageLoader();
        initializeNavigation();
        initializeSmoothScrolling();
        initializeFormValidation();
        initializeAnimations();
        initializeAccessibility();
        initializeFeedbackSystem();
        initializeInteractiveEffects();
        initializeCoolEffects();
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
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            const animatedElements = document.querySelectorAll(
                '.learntav-value-card, .learntav-service-card, .learntav-testimonial-card'
            );

            animatedElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(el);
            });
        }

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
    // Utility Functions
    // ===================================================================
    
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

    // ===================================================================
    // Add animation styles
    // ===================================================================
    
    // Inject animation CSS
    const animationStyles = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
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
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);

    // ===================================================================
    // Page Loader System
    // ===================================================================
    
    function initializePageLoader() {
        // Create page loader
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-logo">LearnTAV</div>
                <div class="loading-spinner"></div>
            </div>
        `;
        document.body.appendChild(loader);
        
        // Hide loader after page loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }, 1000);
        });
    }

    // ===================================================================
    // User Feedback System
    // ===================================================================
    
    function initializeFeedbackSystem() {
        createFeedbackFAB();
        
        // Global feedback functions
        window.showFeedback = function(message, type = 'success', duration = 5000) {
            const feedback = document.createElement('div');
            feedback.className = `feedback-popup ${type}`;
            
            const icons = {
                success: '✅',
                warning: '⚠️',
                error: '❌',
                info: 'ℹ️'
            };
            
            feedback.innerHTML = `
                <button class="close-btn">&times;</button>
                <div class="feedback-title">
                    <span>${icons[type] || '💬'}</span>
                    ${message}
                </div>
            `;
            
            document.body.appendChild(feedback);
            
            // Show feedback
            setTimeout(() => feedback.classList.add('show'), 100);
            
            // Auto-hide
            const hideTimeout = setTimeout(() => hideFeedback(feedback), duration);
            
            // Close button
            feedback.querySelector('.close-btn').addEventListener('click', () => {
                clearTimeout(hideTimeout);
                hideFeedback(feedback);
            });
            
            // Click to dismiss
            feedback.addEventListener('click', () => {
                clearTimeout(hideTimeout);
                hideFeedback(feedback);
            });
        };
        
        function hideFeedback(feedback) {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }
        
        function createFeedbackFAB() {
            const fab = document.createElement('button');
            fab.className = 'feedback-fab';
            fab.innerHTML = '💬';
            fab.setAttribute('aria-label', 'Give Feedback');
            fab.title = 'Give us feedback!';
            
            fab.addEventListener('click', () => {
                showFeedback('Thanks for wanting to give feedback! Contact form coming soon...', 'info');
            });
            
            document.body.appendChild(fab);
        }

        // Demonstrate feedback on page interactions
        setTimeout(() => {
            showFeedback('Welcome to LearnTAV! 🚀 Enjoy the enhanced experience!', 'success', 6000);
        }, 2000);
    }

    // ===================================================================
    // Interactive Effects
    // ===================================================================
    
    function initializeInteractiveEffects() {
        // Add glow effect to interactive elements
        const interactiveElements = document.querySelectorAll('.learntav-btn, .learntav-service-card, .learntav-value-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.classList.add('interactive-glow');
            });
            
            element.addEventListener('mouseleave', function() {
                this.classList.remove('interactive-glow');
            });
        });

        // Enhanced button interactions
        const buttons = document.querySelectorAll('.learntav-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
                
                // Show feedback for certain buttons
                if (this.textContent.includes('Get Started') || this.textContent.includes('Book')) {
                    setTimeout(() => {
                        showFeedback('Great choice! Contact form functionality coming soon.', 'info');
                    }, 300);
                }
            });
        });

        // Add ripple animation
        const rippleCSS = `
            @keyframes ripple {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(4); opacity: 0; }
            }
        `;
        
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = rippleCSS;
        document.head.appendChild(rippleStyle);
    }

    // ===================================================================
    // Cool Effects and Enhancements
    // ===================================================================
    
    function initializeCoolEffects() {
        // Parallax effect for hero
        initializeParallax();
        
        // Mouse tracking effects
        initializeMouseTracking();
        
        // Cool loading states
        initializeCoolLoading();
        
        // Enhanced scroll effects
        initializeScrollEffects();
        
        // Initialize tooltips
        initializeTooltips();
    }

    function initializeParallax() {
        const hero = document.querySelector('.learntav-hero');
        if (!hero) return;

        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.2;
            
            if (hero.style) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        }, 16));
    }

    function initializeMouseTracking() {
        const cards = document.querySelectorAll('.learntav-service-card, .learntav-value-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    function initializeCoolLoading() {
        // Add cool loading to all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const button = this.querySelector('button[type="submit"]');
                if (button) {
                    button.innerHTML = '<div class="loading-spinner"></div>';
                    setTimeout(() => {
                        showFeedback('Form submitted! (Demo mode)', 'success');
                        button.innerHTML = 'Sent!';
                        setTimeout(() => {
                            button.innerHTML = 'Send Message';
                        }, 2000);
                    }, 2000);
                }
            });
        });
    }

    function initializeScrollEffects() {
        let lastScrollTop = 0;
        const nav = document.querySelector('.learntav-nav');
        
        window.addEventListener('scroll', throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Cool navbar behavior
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
            
            // Add scroll progress indicator
            const scrollPercent = (scrollTop / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            updateScrollProgress(scrollPercent);
        }, 16));
    }

    function updateScrollProgress(percent) {
        let progressBar = document.getElementById('scroll-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'scroll-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #2563eb, #6366f1);
                z-index: 9999;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        }
        
        progressBar.style.width = `${percent}%`;
    }

    // Add tooltips to elements with data-tooltip attribute
    function initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.classList.add('tooltip');
        });

        // Add some demo tooltips
        setTimeout(() => {
            const logo = document.querySelector('.learntav-nav__logo');
            if (logo) {
                logo.setAttribute('data-tooltip', 'LearnTAV - AI Education & Consulting');
                logo.classList.add('tooltip');
            }
        }, 1000);
    }

    // Performance monitoring
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        if (loadTime > 3000) {
            setTimeout(() => {
                showFeedback('Page loaded! Thanks for your patience.', 'info', 3000);
            }, 500);
        }
    });

})();