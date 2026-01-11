/* ===================================================================
   Power Tracker School - Lockdown & Modal Script
   Navigation restrictions and contact modal functionality
   =================================================================== */

(function() {
    'use strict';
    
    // ===================================================================
    // Navigation Lockdown System
    // ===================================================================
    
    // Remove any beforeunload handlers
    window.onbeforeunload = null;
    
    // Show toast notification for blocked navigation
    function showToast(message) {
        const toast = document.getElementById('nav-toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Check if navigation should be blocked
    function shouldBlockNavigation(href, element = null) {
        if (!href) return false;
        
        // Allow hash links
        if (href.startsWith('#')) return false;
        
        // Allow current page
        if (href === window.location.pathname || href === window.location.href) return false;
        
        // Allow relative paths to current directory
        if (href.startsWith('./') && href.includes('#')) return false;
        
        // Allow specific external form URL
        if (href === 'https://forms.gle/3csP1Z1CTtAYdGmL8') return false;
        
        // Allow elements with data-external-form attribute
        if (element && element.hasAttribute('data-external-form')) return false;
        
        // Block everything else
        return true;
    }
    
    // Navigation click handler
    function handleClick(event) {
        const target = event.target;
        const link = target.closest('a');
        
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        if (shouldBlockNavigation(href, link)) {
            event.preventDefault();
            event.stopPropagation();
            showToast('External navigation is disabled on this page.');
            return false;
        }
    }
    
    // Initialize navigation lockdown
    function initNavigationLockdown() {
        document.addEventListener('click', handleClick, true);
        
        // Also handle programmatic navigation attempts
        const originalOpen = window.open;
        window.open = function() {
            showToast('External navigation is disabled on this page.');
            return null;
        };
        
        // Block form submissions to external URLs
        document.addEventListener('submit', function(event) {
            const form = event.target;
            const action = form.action;
            
            if (action && shouldBlockNavigation(action, form)) {
                event.preventDefault();
                showToast('External navigation is disabled on this page.');
            }
        });
    }
    
    // ===================================================================
    // Contact Modal System
    // ===================================================================
    
    let modal = null;
    let modalContent = null;
    let contactBtn = null;
    let closeBtn = null;
    let modalCloseBtn = null;
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    // Get focusable elements for focus trap
    function getFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(modalContent.querySelectorAll(focusableSelectors.join(',')))
            .filter(el => !el.hasAttribute('hidden') && el.offsetWidth > 0 && el.offsetHeight > 0);
    }
    
    // Focus trap handler
    function handleFocusTrap(event) {
        if (event.key !== 'Tab') return;
        
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                event.preventDefault();
                lastFocusableElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusableElement) {
                event.preventDefault();
                firstFocusableElement.focus();
            }
        }
    }
    
    // Open modal
    function openModal() {
        if (!modal) return;
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Set up focus trap
        focusableElements = getFocusableElements();
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        setTimeout(() => {
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }, 100);
        
        // Add event listeners
        document.addEventListener('keydown', handleModalKeydown);
        document.addEventListener('keydown', handleFocusTrap);
    }
    
    // Close modal
    function closeModal() {
        if (!modal) return;
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Remove event listeners
        document.removeEventListener('keydown', handleModalKeydown);
        document.removeEventListener('keydown', handleFocusTrap);
        
        // Return focus to trigger button
        if (contactBtn) {
            contactBtn.focus();
        }
    }
    
    // Handle modal keyboard events
    function handleModalKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        }
    }
    
    // Handle modal overlay click
    function handleModalOverlayClick(event) {
        if (event.target === modal) {
            closeModal();
        }
    }
    
    // Initialize modal system
    function initModal() {
        modal = document.getElementById('contact-modal');
        modalContent = modal ? modal.querySelector('.modal-content') : null;
        contactBtn = document.getElementById('contact-btn');
        closeBtn = document.getElementById('modal-close');
        modalCloseBtn = document.getElementById('modal-close-btn');
        
        if (!modal || !modalContent || !contactBtn) {
            console.warn('Modal elements not found');
            return;
        }
        
        // Set initial ARIA attributes
        modal.setAttribute('aria-hidden', 'true');
        
        // Event listeners
        contactBtn.addEventListener('click', function(event) {
            event.preventDefault();
            openModal();
        });
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function(event) {
                event.preventDefault();
                closeModal();
            });
        }
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', function(event) {
                event.preventDefault();
                closeModal();
            });
        }
        
        modal.addEventListener('click', handleModalOverlayClick);
        
        // Prevent clicks inside modal content from closing modal
        modalContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
    
    // ===================================================================
    // Smooth Scrolling for Hash Links
    // ===================================================================
    
    function initSmoothScroll() {
        document.addEventListener('click', function(event) {
            const link = event.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without triggering navigation
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    }
    
    // ===================================================================
    // Accessibility Enhancements
    // ===================================================================
    
    function initAccessibility() {
        // Add skip link functionality if needed
        const skipLinks = document.querySelectorAll('a[href^="#"]');
        skipLinks.forEach(link => {
            link.addEventListener('click', function() {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
        
        // Improve button accessibility
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });
    }
    
    // ===================================================================
    // Initialize All Systems
    // ===================================================================
    
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        try {
            initNavigationLockdown();
            initModal();
            initSmoothScroll();
            initAccessibility();
            
            console.log('Power Tracker School: Lockdown system initialized');
        } catch (error) {
            console.error('Power Tracker School: Initialization error:', error);
        }
    }
    
    // Start initialization
    init();
    
    // ===================================================================
    // Public API (if needed for testing)
    // ===================================================================
    
    window.PowerTrackerSchool = {
        showToast: showToast,
        openModal: openModal,
        closeModal: closeModal
    };
    
})();