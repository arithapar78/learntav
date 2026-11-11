/* ========================================
   LearnTAV site configuration — single source of truth.

   Edit prices, course facts and enrollment settings HERE.
   - Elements with data-cfg="pricing.group.total" etc. are filled in
     from this file at load.
   - The same values are also written statically in the HTML so the page
     is correct without JS and for search engines. Run
       node scripts/check-site.mjs
     after editing to confirm every page still agrees with this file.
   ======================================== */
(function () {
    'use strict';

    var CONFIG = {
        contact: {
            email: 'hello@learntav.com',
            introCall: '15-minute introductory conversation (free, optional)'
        },

        course: {
            slug: 'vibe-coding-101',
            name: 'Vibe Coding 101',
            sessions: 4,
            sessionMinutes: 60,
            totalHours: 4,
            sessionList: [
                { n: 1, title: 'Prompting Fundamentals',
                  summary: 'How to describe what you want so an AI assistant gives you useful results.' },
                { n: 2, title: 'AI Coding Tools Setup',
                  summary: 'Install and configure an AI coding environment and learn to steer it.' },
                { n: 3, title: 'Direct AI to Build',
                  summary: 'Guide an AI assistant to build your project, then review and refine what it produces.' },
                { n: 4, title: 'Debug & Deploy',
                  summary: 'Use AI to find and fix problems and learn the basics of putting a project online.' }
            ]
        },

        pricing: {
            currency: 'USD',
            symbol: '$',
            // Full-course price per person. Never display an hourly rate as the headline.
            // size = maximum students per group class (set by the business).
            group:   { label: 'Group',   total: 99,  perPerson: true,
                       size: 5 },
            private: { label: 'Private', total: 199, perPerson: true }
        },

        enrollment: {
            // Formspree form that delivers enrollment inquiries to the
            // business inbox (set up to forward to hello@learntav.com).
            // If this is ever '' the form tells visitors it is not live
            // and links the fallback form instead of pretending to submit.
            endpoint: 'https://formspree.io/f/xppdzpwn',
            // Temporary fallback: the existing Google Form.
            fallbackFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfBJwP5hFVhluQdWbiBJy0xx3wj0n9r7iOTfJajNcQshGFYIA/viewform?usp=header',
            // Payment is NOT enabled. Flip only when a verified integration exists.
            paymentEnabled: false
        }
    };

    function get(path) {
        return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, CONFIG);
    }

    function format(path, value) {
        if (/\.total$/.test(path)) return CONFIG.pricing.symbol + value;
        if (/\.size$/.test(path) && typeof value === 'number') return 'Up to ' + value + ' students';
        return String(value);
    }

    function hydrate(root) {
        (root || document).querySelectorAll('[data-cfg]').forEach(function (el) {
            var path = el.getAttribute('data-cfg');
            var v = get(path);
            if (v === undefined) return;
            el.textContent = format(path, v);
        });
    }

    window.LearnTAVConfig = CONFIG;
    window.LearnTAVConfigHydrate = hydrate;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { hydrate(); });
    } else {
        hydrate();
    }
})();
