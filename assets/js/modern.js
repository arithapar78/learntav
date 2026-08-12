/* ========================================
   LearnTAV Modern JavaScript
   Clean, professional interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initScrollAnimations();
    initSmoothScroll();
    initHeaderScroll();
    initThemeToggle();
});

/* ========================================
   Navigation
   ======================================== */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navToggle || !mobileMenu) return;

    // Elements outside the menu are inert while it is open, so focus has
    // to be kept inside it for keyboard and screen-reader users.
    const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function focusableItems() {
        // The menu animates in via opacity/visibility, so immediately after
        // opening its children still report offsetParent === null. Filter on
        // layout box instead, which is already correct at that point.
        return Array.from(mobileMenu.querySelectorAll(FOCUSABLE))
            .filter(el => el.getBoundingClientRect().width > 0);
    }

    function setOpen(open) {
        navToggle.classList.toggle('active', open);
        mobileMenu.classList.toggle('active', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';

        if (open) {
            // The menu transitions from visibility:hidden, and a hidden
            // element cannot take focus — calling focus() synchronously
            // here silently does nothing. Wait for the transition to end
            // (with a timeout fallback in case it never fires).
            let moved = false;
            const focusFirst = () => {
                if (moved) return;
                moved = true;
                const first = focusableItems()[0];
                if (first) first.focus();
            };

            mobileMenu.addEventListener('transitionend', focusFirst, { once: true });
            setTimeout(focusFirst, 250);
        }
    }

    navToggle.addEventListener('click', function () {
        setOpen(!mobileMenu.classList.contains('active'));
    });

    // Close when a destination is chosen.
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', function (e) {
        if (!mobileMenu.classList.contains('active')) return;

        if (e.key === 'Escape') {
            setOpen(false);
            navToggle.focus();
            return;
        }

        // Trap Tab within the open menu.
        if (e.key === 'Tab') {
            const items = focusableItems();
            if (!items.length) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

/* ========================================
   Header Scroll Effect
   ======================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.pageYOffset > 50);
    }, { passive: true });
}

/* ========================================
   Scroll Animations
   ======================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .feature, .testimonial, .section-header'
    );

    // Respect a reduced-motion preference: never hide content that we
    // would then have to animate back into view.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // IntersectionObserver is what restores opacity. Without it the
    // .animate-on-scroll rule would leave content permanently invisible.
    if (!('IntersectionObserver' in window)) return;

    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/* ========================================
   Smooth Scroll
   ======================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   Utility Functions
   ======================================== */

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
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ========================================
   Theme Toggle (Light/Dark Mode)
   ======================================== */
// The initial theme is resolved in assets/js/layout.js, which runs in
// <head> before first paint so dark-mode users never see a flash of the
// light theme. This function only wires up the toggle control.
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');

    function syncToggle(theme) {
        if (!themeToggle) return;
        const isDark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute(
            'aria-label',
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
    }

    syncToggle(document.documentElement.getAttribute('data-theme'));

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {
                // Ignore: private mode blocks writes, theme still applies.
            }
            syncToggle(next);
        });
    }

    // Follow the OS only while the user has no explicit preference.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        let saved = null;
        try {
            saved = localStorage.getItem('theme');
        } catch (err) { /* ignore */ }

        if (!saved) {
            const theme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            syncToggle(theme);
        }
    });
}
