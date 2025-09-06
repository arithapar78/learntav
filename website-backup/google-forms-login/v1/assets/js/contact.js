/**
 * Contact Page JavaScript
 * Handles tab switching, FAQ accordion, and visual enhancements
 * Simplified version for Google Forms integration
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
        initializeURLHandling();
        initializeCoolEnhancements();
        initializeScrollReveal();
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


})();
    
    // ===================================================================
    // Cool Contact Page Enhancements
    // ===================================================================
    
    function initializeCoolEnhancements() {
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
    
