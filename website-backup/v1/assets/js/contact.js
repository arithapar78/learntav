/**
 * Contact Page JavaScript
 * Handles tab switching, FAQ accordion, and enhanced form interactions
 */

(function() {
    'use strict';

    // Debounce utility function - defined early since it's used throughout
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

    document.addEventListener('DOMContentLoaded', function() {
        initializeContactTabs();
        initializeFAQAccordion();
        initializeFormEnhancements();
        initializeURLHandling();
        initializeCoolEnhancements();
        initializeScrollReveal();
        initializeFormProgressTracking();
        initializeTabIndicator();
    });

    // ===================================================================
    // Tab Functionality
    // ===================================================================
    
    function initializeContactTabs() {
        const tabButtons = document.querySelectorAll('.learntav-tab-btn');
        const tabContents = document.querySelectorAll('.learntav-tab-content');

        if (tabButtons.length === 0 || tabContents.length === 0) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                switchTab(targetTab, tabButtons, tabContents);
            });

            // Keyboard navigation
            button.addEventListener('keydown', function(e) {
                let targetButton = null;
                const currentIndex = Array.from(tabButtons).indexOf(this);

                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetButton = tabButtons[currentIndex - 1] || tabButtons[tabButtons.length - 1];
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        targetButton = tabButtons[currentIndex + 1] || tabButtons[0];
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetButton = tabButtons[0];
                        break;
                    case 'End':
                        e.preventDefault();
                        targetButton = tabButtons[tabButtons.length - 1];
                        break;
                }

                if (targetButton) {
                    targetButton.focus();
                    targetButton.click();
                }
            });
        });
    }

    function switchTab(targetTab, tabButtons, tabContents) {
        // Update button states
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });

        // Update content visibility
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.setAttribute('aria-hidden', 'true');
        });

        // Activate target tab
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(`${targetTab}-form`);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
            activeButton.setAttribute('tabindex', '0');

            activeContent.classList.add('active');
            activeContent.setAttribute('aria-hidden', 'false');

            // Focus first input in the active form
            const firstInput = activeContent.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 100);
            }

            // Update URL hash
            history.replaceState(null, null, `#${targetTab}-form`);

            // Announce change for screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader(`Switched to ${activeButton.textContent} form`);
            }
        }
    }

    // ===================================================================
    // FAQ Accordion
    // ===================================================================
    
    function initializeFAQAccordion() {
        const faqItems = document.querySelectorAll('.learntav-faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.learntav-faq-question');
            const answer = item.querySelector('.learntav-faq-answer');
            
            if (question && answer) {
                const questionId = `faq-question-${Math.random().toString(36).substr(2, 9)}`;
                const answerId = `faq-answer-${Math.random().toString(36).substr(2, 9)}`;
                
                question.id = questionId;
                answer.id = answerId;
                question.setAttribute('aria-controls', answerId);
                answer.setAttribute('aria-labelledby', questionId);
                
                question.addEventListener('click', function() {
                    toggleFAQItem(item, question, answer);
                });

                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFAQItem(item, question, answer);
                    }
                });
            }
        });
    }

    function toggleFAQItem(item, question, answer) {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            question.setAttribute('aria-expanded', 'false');
            answer.classList.remove('active');
            item.classList.remove('expanded');
        } else {
            question.setAttribute('aria-expanded', 'true');
            answer.classList.add('active');
            item.classList.add('expanded');
        }

        // Announce state change
        if (window.announceToScreenReader) {
            const state = isExpanded ? 'collapsed' : 'expanded';
            window.announceToScreenReader(`FAQ item ${state}`);
        }
    }

    // ===================================================================
    // Form Enhancements
    // ===================================================================
    
    function initializeFormEnhancements() {
        const forms = document.querySelectorAll('.learntav-form');
        
        forms.forEach(form => {
            enhanceFormFields(form);
            addFormAnalytics(form);
        });
    }

    function enhanceFormFields(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Add floating label effect
            if (input.type !== 'hidden' && input.type !== 'checkbox' && input.type !== 'radio') {
                addFloatingLabelEffect(input);
            }

            // Enhanced validation feedback
            input.addEventListener('invalid', function(e) {
                e.preventDefault();
                showCustomValidationMessage(this);
            });

            // Clear custom validation on input
            input.addEventListener('input', function() {
                if (this.hasAttribute('data-custom-validity')) {
                    this.removeAttribute('data-custom-validity');
                    this.setCustomValidity('');
                }
            });

            // Auto-format phone numbers
            if (input.type === 'tel') {
                input.addEventListener('input', formatPhoneNumber);
            }

            // Character counter for textareas
            if (input.tagName === 'TEXTAREA') {
                addCharacterCounter(input);
            }
        });
    }

    function addFloatingLabelEffect(input) {
        const group = input.closest('.learntav-form__group');
        const label = group?.querySelector('.learntav-form__label');
        
        if (!label) return;

        function updateFloatingState() {
            if (input.value || input === document.activeElement) {
                group.classList.add('floating');
            } else {
                group.classList.remove('floating');
            }
        }

        input.addEventListener('focus', updateFloatingState);
        input.addEventListener('blur', updateFloatingState);
        input.addEventListener('input', updateFloatingState);

        // Initial state
        updateFloatingState();
    }

    function showCustomValidationMessage(input) {
        const validationMessage = getCustomValidationMessage(input);
        input.setCustomValidity(validationMessage);
        input.setAttribute('data-custom-validity', validationMessage);
        
        // Show message in custom error display
        const validator = input.closest('form')?.validator;
        if (validator) {
            validator.displayFieldError(input, validationMessage);
        }
    }

    function getCustomValidationMessage(input) {
        const fieldName = input.getAttribute('data-label') || input.name;
        
        if (input.validity.valueMissing) {
            return `${fieldName} is required`;
        }
        if (input.validity.typeMismatch) {
            if (input.type === 'email') {
                return 'Please enter a valid email address';
            }
            if (input.type === 'tel') {
                return 'Please enter a valid phone number';
            }
        }
        if (input.validity.patternMismatch) {
            return `Please enter a valid ${fieldName.toLowerCase()}`;
        }
        if (input.validity.tooShort) {
            return `${fieldName} must be at least ${input.minLength} characters`;
        }
        if (input.validity.tooLong) {
            return `${fieldName} must be no more than ${input.maxLength} characters`;
        }
        
        return input.validationMessage;
    }

    function formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        } else if (value.length >= 3) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        }
        
        event.target.value = value;
    }

    function addCharacterCounter(textarea) {
        const maxLength = textarea.getAttribute('maxlength');
        if (!maxLength) return;

        const counter = document.createElement('div');
        counter.className = 'learntav-form__character-counter';
        counter.setAttribute('aria-live', 'polite');
        
        function updateCounter() {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 50) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        }

        textarea.addEventListener('input', updateCounter);
        textarea.parentNode.appendChild(counter);
        updateCounter();
    }

    function addFormAnalytics(form) {
        const formType = form.id;
        let startTime = Date.now();
        let fieldInteractions = {};

        // Track form start
        form.addEventListener('focusin', function() {
            if (!startTime) {
                startTime = Date.now();
            }
        }, { once: true });

        // Track field interactions
        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.type !== 'hidden') {
                field.addEventListener('focus', function() {
                    fieldInteractions[this.name] = fieldInteractions[this.name] || {};
                    fieldInteractions[this.name].focused = true;
                    fieldInteractions[this.name].focusTime = Date.now();
                });

                field.addEventListener('blur', function() {
                    if (fieldInteractions[this.name]) {
                        fieldInteractions[this.name].timeSpent = 
                            Date.now() - fieldInteractions[this.name].focusTime;
                    }
                });
            }
        });

        // Track form submission
        form.addEventListener('submit', function() {
            const analyticsData = {
                formType: formType,
                completionTime: Date.now() - startTime,
                fieldInteractions: fieldInteractions,
                timestamp: new Date().toISOString()
            };

            // Store analytics data (could be sent to analytics service)
            console.log('Form Analytics:', analyticsData);
            
            // Could integrate with Google Analytics, Mixpanel, etc.
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'form_type': formType,
                    'completion_time': analyticsData.completionTime
                });
            }
        });
    }

    // ===================================================================
    // URL Handling and Deep Linking
    // ===================================================================
    
    function initializeURLHandling() {
        // Handle hash-based navigation
        function handleHashChange() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const targetContent = document.getElementById(hash);
                if (targetContent && targetContent.classList.contains('learntav-tab-content')) {
                    const tabName = hash.replace('-form', '');
                    const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
                    if (tabButton) {
                        tabButton.click();
                    }
                }
            }
        }

        // Handle initial hash
        handleHashChange();

        // Handle hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Handle external links to specific forms
        const queryParams = new URLSearchParams(window.location.search);
        const formType = queryParams.get('form');
        if (formType) {
            const tabButton = document.querySelector(`[data-tab="${formType}"]`);
            if (tabButton) {
                setTimeout(() => tabButton.click(), 100);
            }
        }
    }

    // ===================================================================
    // Utility Functions
    // ===================================================================
    
    // Auto-save form data to localStorage
    function enableFormAutoSave(form) {
        const formId = form.id;
        const storageKey = `learntav-form-${formId}`;

        // Load saved data
        function loadFormData() {
            try {
                const savedData = localStorage.getItem(storageKey);
                if (savedData) {
                    const data = JSON.parse(savedData);
                    Object.keys(data).forEach(name => {
                        const field = form.querySelector(`[name="${name}"]`);
                        if (field && field.type !== 'hidden') {
                            field.value = data[name];
                        }
                    });
                }
            } catch (error) {
                console.warn('Could not load saved form data:', error);
            }
        }

        // Save form data
        function saveFormData() {
            try {
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    if (key !== 'website' && key !== 'csrf_token') { // Skip honeypot and CSRF
                        data[key] = value;
                    }
                }
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (error) {
                console.warn('Could not save form data:', error);
            }
        }

        // Clear saved data on successful submission
        function clearSavedData() {
            try {
                localStorage.removeItem(storageKey);
            } catch (error) {
                console.warn('Could not clear saved form data:', error);
            }
        }

        // Set up auto-save
        loadFormData();
        
        form.addEventListener('input', () => {
            let timeout;
            clearTimeout(timeout);
            timeout = setTimeout(saveFormData, 1000);
        });
        form.addEventListener('change', saveFormData);
        
        form.addEventListener('submit', function() {
            // Clear saved data after successful submission
            setTimeout(clearSavedData, 5000);
        });
    }

    // Enable auto-save for all forms
    document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('.learntav-form');
        forms.forEach(enableFormAutoSave);
    });

})();

// Add floating label CSS
const floatingLabelStyles = `
.learntav-form__group {
    position: relative;
}

.learntav-form__group.floating .learntav-form__label {
    transform: translateY(-1.5rem) scale(0.85);
    color: var(--primary);
}

.learntav-form__label {
    transition: all 0.2s ease;
    transform-origin: left top;
    pointer-events: none;
}

.learntav-form__character-counter {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    text-align: right;
    margin-top: var(--space-1);
}

.learntav-form__character-counter.warning {
    color: var(--warning);
}

@media (max-width: 768px) {
    .learntav-form__group.floating .learntav-form__label {
        transform: translateY(-1.25rem) scale(0.9);
    }
}
`;

// Inject styles
if (!document.querySelector('#floating-label-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'floating-label-styles';
    styleSheet.textContent = floatingLabelStyles;
    document.head.appendChild(styleSheet);
}
    
    // ===================================================================
    // Cool Contact Page Enhancements
    // ===================================================================
    
    function initializeCoolEnhancements() {
        // Add form progress bar to page
        const progressBar = document.createElement('div');
        progressBar.className = 'learntav-form-progress';
        document.body.appendChild(progressBar);
        
        // Enhanced button interactions
        enhanceButtonInteractions();
        
        // Add scroll reveal classes to elements
        addScrollRevealClasses();
        
        // Initialize particle animation observer
        initializeParticleObserver();
    }
    
    function initializeScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => revealObserver.observe(el));
    }
    
    function initializeFormProgressTracking() {
        const forms = document.querySelectorAll('.learntav-form');
        const progressBar = document.querySelector('.learntav-form-progress');
        
        if (!progressBar) return;
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            const totalFields = inputs.length;
            
            function updateProgress() {
                let completedFields = 0;
                inputs.forEach(input => {
                    if (input.value.trim() !== '' && input.checkValidity()) {
                        completedFields++;
                    }
                });
                
                const progress = (completedFields / totalFields) * 100;
                progressBar.style.width = progress + '%';
                
                if (progress > 0) {
                    progressBar.classList.add('visible');
                } else {
                    progressBar.classList.remove('visible');
                }
            }
            
            inputs.forEach(input => {
                input.addEventListener('input', updateProgress);
                input.addEventListener('change', updateProgress);
            });
            
            // Reset progress when switching tabs
            form.addEventListener('reset', () => {
                setTimeout(() => {
                    progressBar.style.width = '0%';
                    progressBar.classList.remove('visible');
                }, 100);
            });
        });
    }
    
    function initializeTabIndicator() {
        const tabsNav = document.querySelector('.learntav-contact-tabs__nav');
        const tabButtons = tabsNav?.querySelectorAll('.learntav-tab-btn');
        
        if (!tabsNav || !tabButtons.length) return;
        
        // Create tab indicator
        const indicator = document.createElement('div');
        indicator.className = 'learntav-tab-indicator';
        tabsNav.appendChild(indicator);
        
        function updateIndicator(activeButton) {
            const rect = activeButton.getBoundingClientRect();
            const navRect = tabsNav.getBoundingClientRect();
            const left = rect.left - navRect.left;
            const width = rect.width;
            
            indicator.style.left = left + 'px';
            indicator.style.width = width + 'px';
            indicator.classList.add('active');
        }
        
        // Set initial position
        const activeButton = tabsNav.querySelector('.learntav-tab-btn.active');
        if (activeButton) {
            setTimeout(() => updateIndicator(activeButton), 100);
        }
        
        // Update on tab change
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                updateIndicator(this);
            });
        });
        
        // Update on window resize
        window.addEventListener('resize', () => {
            let timeout;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const currentActive = tabsNav.querySelector('.learntav-tab-btn.active');
                if (currentActive) {
                    updateIndicator(currentActive);
                }
            }, 250);
        });
    }
    
    function enhanceButtonInteractions() {
        const buttons = document.querySelectorAll('.learntav-btn--primary');
        
        buttons.forEach(button => {
            // Add ripple effect on click
            button.addEventListener('click', function(e) {
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
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Add ripple animation styles
        if (!document.querySelector('#ripple-styles')) {
            const rippleStyles = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            
            const styleSheet = document.createElement('style');
            styleSheet.id = 'ripple-styles';
            styleSheet.textContent = rippleStyles;
            document.head.appendChild(styleSheet);
        }
    }
    
    function addScrollRevealClasses() {
        const elementsToReveal = [
            '.learntav-contact-option',
            '.learntav-faq-item',
            '.learntav-form-container',
            '.learntav-section-header'
        ];
        
        elementsToReveal.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.classList.contains('scroll-reveal')) {
                    el.classList.add('scroll-reveal');
                }
            });
        });
    }
    
    function initializeParticleObserver() {
        const contactOptions = document.querySelector('.learntav-contact-options');
        
        if (!contactOptions) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('particles-active');
                } else {
                    entry.target.classList.remove('particles-active');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(contactOptions);
    }
    
    // Enhanced form validation with cool animations
    function addCoolFormValidation() {
        const forms = document.querySelectorAll('.learntav-form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('blur', function() {
                    if (this.checkValidity() && this.value.trim()) {
                        this.classList.add('valid');
                        this.classList.remove('invalid');
                    } else if (this.value.trim()) {
                        this.classList.add('invalid');
                        this.classList.remove('valid');
                    }
                });
                
                input.addEventListener('input', function() {
                    if (this.classList.contains('invalid') && this.checkValidity()) {
                        this.classList.remove('invalid');
                        this.classList.add('valid');
                    }
                });
            });
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('learntav-btn--loading');
                    submitBtn.disabled = true;
                }
                
                // Collect form data
                const formData = new FormData(this);
                const formType = formData.get('form_type') || 'general';
                
                // Create submission data object
                const submissionData = {
                    timestamp: new Date().toISOString(),
                    formType: formType,
                    userAgent: navigator.userAgent,
                    url: window.location.href
                };
                
                // Collect form fields (skip hidden and honeypot fields)
                for (let [key, value] of formData.entries()) {
                    if (key !== 'website' && key !== 'csrf_token' && value.trim() !== '') {
                        submissionData[key] = value;
                    }
                }
                
                // Log submission for debugging
                console.log('Form Submission Data:', submissionData);
                
                // Since this is a static site, we'll use EmailJS or similar service
                // For now, we'll show success but with proper error handling
                submitFormData(submissionData, submitBtn, this);
            });
        });
    }
    
    function submitFormData(submissionData, submitBtn, form) {
        // For a static site, use mailto as the primary method
        const mailtoFallback = () => {
            try {
                const subject = encodeURIComponent(`LearnTAV Contact: ${submissionData.formType || 'General'}`);
                const body = encodeURIComponent(
                    Object.keys(submissionData)
                        .filter(key => !['timestamp', 'userAgent', 'url', 'formType'].includes(key))
                        .map(key => `${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${submissionData[key]}`)
                        .join('\n\n')
                );
                window.location.href = `mailto:hello@learntav.com?subject=${subject}&body=${body}`;
                
                // Show success message after a brief delay
                setTimeout(() => {
                    showSuccessMessage(form);
                }, 1000);
                
            } catch (error) {
                console.error('Error creating mailto link:', error);
                showErrorMessage(form, 'Unable to open email client. Please email us directly at hello@learntav.com');
            }
        };

        // Try to submit via fetch first (for future backend implementation)
        const tryServerSubmission = async () => {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submissionData)
                });
                
                if (response.ok) {
                    showSuccessMessage(form);
                } else {
                    throw new Error('Server response not ok');
                }
            } catch (error) {
                console.log('Server submission not available, falling back to mailto:', error.message);
                mailtoFallback();
            }
        };

        // Reset button state after attempt
        const resetButton = () => {
            if (submitBtn) {
                submitBtn.classList.remove('learntav-btn--loading');
                submitBtn.disabled = false;
            }
        };

        // Try server submission first, fallback to mailto
        setTimeout(() => {
            tryServerSubmission().finally(resetButton);
        }, 1000);
    }

    function showSuccessMessage(form) {
        const successHTML = `
            <div class="learntav-form__success">
                <span class="learntav-form__success-icon">✅</span>
                <div class="learntav-form__success-content">
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                </div>
            </div>
        `;
        
        const formContainer = form.closest('.learntav-form-container');
        if (formContainer) {
            formContainer.innerHTML = successHTML;
        }
        
        // Reset progress bar
        const progressBar = document.querySelector('.learntav-form-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.classList.remove('visible');
        }
    }

    function showErrorMessage(form, message) {
        const errorHTML = `
            <div class="learntav-form__error-global">
                <span class="learntav-form__error-icon">⚠️</span>
                <div class="learntav-form__error-content">
                    <h3>Submission Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="learntav-btn learntav-btn--secondary" style="margin-top: 1rem;">
                        Try Again
                    </button>
                </div>
            </div>
        `;
        
        const formContainer = form.closest('.learntav-form-container');
        if (formContainer) {
            formContainer.innerHTML = errorHTML;
        }
    }
    
    // Initialize cool form validation on page load
    document.addEventListener('DOMContentLoaded', function() {
        addCoolFormValidation();
    });
