/**
 * Contact Page JavaScript
 * Handles tab switching, FAQ accordion, and enhanced form interactions
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        initializeContactTabs();
        initializeFAQAccordion();
        initializeFormEnhancements();
        initializeURLHandling();
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
        
        form.addEventListener('input', debounce(saveFormData, 1000));
        form.addEventListener('change', saveFormData);
        
        form.addEventListener('submit', function() {
            // Clear saved data after successful submission
            setTimeout(clearSavedData, 5000);
        });
    }

    // Debounce utility
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