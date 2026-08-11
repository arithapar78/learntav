/* ========================================
   LearnTAV Shared Layout
   Injects the site header, mobile menu, and footer into every
   marketing page so the markup lives in exactly one place.

   Loaded from <head> with a plain <script src> (NOT defer) so the
   header and footer are written into the DOM before first paint.
   ======================================== */

(function () {
    'use strict';

    /* ----------------------------------------
       Theme + JS flag (must run before paint)
       ---------------------------------------- */
    // Resolve the theme here, in <head>, so dark-mode users never see a
    // flash of the light theme. modern.js only wires up the toggle.
    try {
        var savedTheme = localStorage.getItem('theme');
        var prefersDark = window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        // localStorage can throw in private mode / sandboxed frames.
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Scroll-reveal animations start at opacity:0. Scope that rule to
    // .js-enabled so content stays visible when JS is off or fails.
    document.documentElement.classList.add('js-enabled');

    /* ----------------------------------------
       Base path
       ---------------------------------------- */
    // Derive how deep this page sits so every link resolves correctly from
    // the root, one level down (contact/), or two (legal/privacy/).
    //
    // The depth comes from this script's own src attribute (e.g.
    // "../../assets/js/layout.js" => depth 2). That element is guaranteed
    // to exist while the script is executing, and it works identically on
    // http(s):// and file://, and when the site is served from a subfolder.
    // Counting location.pathname segments would break in all three cases.
    function getBasePath() {
        var self = document.currentScript;

        if (!self) {
            // currentScript is null inside a deferred/async context; fall
            // back to locating the tag by name.
            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length - 1; i >= 0; i--) {
                if ((scripts[i].getAttribute('src') || '').indexOf('assets/js/layout.js') !== -1) {
                    self = scripts[i];
                    break;
                }
            }
        }

        var src = self ? (self.getAttribute('src') || '') : '';
        var ups = (src.match(/\.\.\//g) || []).length;
        return '../'.repeat(ups);
    }

    var basePath = getBasePath();
    var depth = (basePath.match(/\.\.\//g) || []).length;

    function url(rel) {
        return basePath + rel;
    }

    /* ----------------------------------------
       Social profiles
       ---------------------------------------- */
    // Simple Icons glyphs, 24x24 viewBox. Defined once and reused
    // everywhere social links appear.
    var SOCIAL = [
        {
            name: 'Instagram',
            handle: '@learntav_llc',
            href: 'https://www.instagram.com/learntav_llc/',
            path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z'
        },
        {
            name: 'Facebook',
            handle: 'LearnTAV',
            href: 'https://www.facebook.com/profile.php?id=61593091894765',
            path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z'
        },
        {
            name: 'YouTube',
            handle: 'learntavOFFICIAL',
            href: 'https://www.youtube.com/channel/UC9ksUX7uSH0yPYjETWThdGA',
            path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
        }
    ];

    // Expose for pages that render their own social blocks (contact, about,
    // homepage CTA, newsletter).
    window.LearnTAVSocial = SOCIAL;

    function socialIcon(item) {
        return '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false">' +
            '<path d="' + item.path + '"/></svg>';
    }

    /**
     * Render a row of social links.
     * @param {Object} opts
     *   showName   - render the visible platform name
     *   showHandle - render the visible @handle
     *   className  - extra class on the wrapping list
     */
    function socialLinks(opts) {
        opts = opts || {};
        var cls = 'social-links' + (opts.className ? ' ' + opts.className : '');

        var items = SOCIAL.map(function (item) {
            var label = 'LearnTAV on ' + item.name + ' (' + item.handle + ')';
            var text = '';

            if (opts.showName) {
                text += '<span class="social-name">' + item.name + '</span>';
            }
            if (opts.showHandle) {
                text += '<span class="social-handle">' + item.handle + '</span>';
            }

            return '<li>' +
                '<a class="social-link" href="' + item.href + '"' +
                ' target="_blank" rel="noopener noreferrer"' +
                ' aria-label="' + label + '">' +
                socialIcon(item) +
                (text ? '<span class="social-text">' + text + '</span>' : '') +
                '</a></li>';
        }).join('');

        return '<ul class="' + cls + '">' + items + '</ul>';
    }

    window.LearnTAVSocialLinks = socialLinks;

    /* ----------------------------------------
       Navigation model
       ---------------------------------------- */
    var NAV = [
        { label: 'Education', href: 'education/index.html', match: /^education\// },
        { label: 'Consulting', href: 'consulting/index.html', match: /^consulting\// },
        { label: 'AI Tools', href: 'ai-tools/index.html', match: /^(ai-tools|power-tracker-school)\// },
        { label: 'Resources', href: 'resources/index.html', match: /^resources\// },
        { label: 'About', href: 'about/index.html', match: /^about\// }
    ];

    // Path of the current page relative to the site root, e.g.
    // "legal/privacy". `depth` tells us how many trailing directory
    // segments of location.pathname belong to the site, which makes this
    // correct no matter where the site is mounted (or on file://).
    function currentRelativePath() {
        var segments = window.location.pathname
            .split('/')
            .filter(function (s) { return s.length > 0; });

        // Drop a trailing filename so only directories remain.
        var last = segments[segments.length - 1] || '';
        var dirs = /\.[a-z]+$/i.test(last) ? segments.slice(0, -1) : segments.slice();

        return depth > 0 ? dirs.slice(-depth).join('/') : '';
    }

    var currentPath = currentRelativePath();

    function isActive(item) {
        // Trailing slash lets a section regex match its own index page,
        // e.g. /^about\// against "about/".
        return item.match.test(currentPath + '/');
    }

    /* ----------------------------------------
       Header
       ---------------------------------------- */
    function renderHeader() {
        var navLinks = NAV.map(function (item) {
            var active = isActive(item);
            return '<a href="' + url(item.href) + '"' +
                ' class="nav-link' + (active ? ' nav-link-active' : '') + '"' +
                (active ? ' aria-current="page"' : '') +
                '>' + item.label + '</a>';
        }).join('\n                ');

        return '' +
'<a class="skip-link" href="#main">Skip to main content</a>\n' +
'<header class="header" id="header">\n' +
'    <nav class="nav" aria-label="Main">\n' +
'        <a href="' + url('index.html') + '" class="nav-logo">\n' +
'            <span class="logo-text">LearnTAV</span>\n' +
'        </a>\n' +
'\n' +
'        <div class="nav-menu" id="navMenu">\n' +
'                ' + navLinks + '\n' +
'        </div>\n' +
'\n' +
'        <div class="nav-actions">\n' +
'            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">\n' +
'                <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">\n' +
'                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>\n' +
'                </svg>\n' +
'                <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">\n' +
'                    <circle cx="12" cy="12" r="5"/>\n' +
'                    <line x1="12" y1="1" x2="12" y2="3"/>\n' +
'                    <line x1="12" y1="21" x2="12" y2="23"/>\n' +
'                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>\n' +
'                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>\n' +
'                    <line x1="1" y1="12" x2="3" y2="12"/>\n' +
'                    <line x1="21" y1="12" x2="23" y2="12"/>\n' +
'                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>\n' +
'                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>\n' +
'                </svg>\n' +
'            </button>\n' +
'            <a href="' + url('contact/index.html') + '" class="btn btn-ghost">Contact</a>\n' +
'            <a href="' + url('ai-tools/index.html') + '" class="btn btn-primary">Get Started</a>\n' +
'            <button class="nav-toggle" id="navToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">\n' +
'                <span></span>\n' +
'                <span></span>\n' +
'                <span></span>\n' +
'            </button>\n' +
'        </div>\n' +
'    </nav>\n' +
'</header>\n' +
'\n' +
'<div class="mobile-menu" id="mobileMenu">\n' +
'    <nav class="mobile-menu-content" aria-label="Mobile">\n' +
        NAV.map(function (item) {
            return '        <a href="' + url(item.href) + '" class="mobile-link"' +
                (isActive(item) ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
        }).join('\n') + '\n' +
'        <a href="' + url('contact/index.html') + '" class="mobile-link">Contact</a>\n' +
'        <a href="' + url('ai-tools/index.html') + '" class="btn btn-primary btn-lg mobile-cta">Get Started</a>\n' +
'    </nav>\n' +
'</div>';
    }

    /* ----------------------------------------
       Footer
       ---------------------------------------- */
    // The homepage footer was the superset; inner pages had drifted and
    // lost links. This is that superset, rendered everywhere.
    var FOOTER_COLUMNS = [
        {
            title: 'Services',
            links: [
                { label: 'Education', href: 'education/index.html' },
                { label: 'Consulting', href: 'consulting/index.html' },
                { label: 'Learning Paths', href: 'education/paths/index.html' },
                { label: 'Case Studies', href: 'consulting/case-studies/index.html' }
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About', href: 'about/index.html' },
                { label: 'Team', href: 'about/team/index.html' },
                { label: 'Our Approach', href: 'about/approach/index.html' },
                { label: 'Contact', href: 'contact/index.html' }
            ]
        },
        {
            title: 'Resources',
            links: [
                { label: 'AI Tools', href: 'ai-tools/index.html' },
                { label: 'Guides', href: 'resources/guides/index.html' },
                { label: 'Blog', href: 'resources/blog/index.html' },
                { label: 'Newsletter', href: 'resources/newsletter/index.html' }
            ]
        }
    ];

    function renderFooter() {
        var year = new Date().getFullYear();

        var columns = FOOTER_COLUMNS.map(function (col) {
            var links = col.links.map(function (l) {
                return '                <a href="' + url(l.href) + '">' + l.label + '</a>';
            }).join('\n');

            return '            <div class="footer-column">\n' +
                '                <h2 class="footer-column-title">' + col.title + '</h2>\n' +
                links + '\n' +
                '            </div>';
        }).join('\n\n');

        return '' +
'<footer class="footer">\n' +
'    <div class="container">\n' +
'        <div class="footer-grid">\n' +
'            <div class="footer-brand">\n' +
'                <a href="' + url('index.html') + '" class="footer-logo">LearnTAV</a>\n' +
'                <p class="footer-tagline">\n' +
'                    A learning platform and lab for building with AI&mdash;practical, honest, and education-first.\n' +
'                </p>\n' +
'                <p class="footer-motto">&ldquo;Learning Takes a Village&rdquo;</p>\n' +
                 socialLinks({ showName: true, className: 'social-links-footer' }) + '\n' +
'            </div>\n' +
'\n' +
'            <nav class="footer-links" aria-label="Footer">\n' +
                 columns + '\n' +
'            </nav>\n' +
'        </div>\n' +
'\n' +
'        <div class="footer-bottom">\n' +
'            <p>&copy; ' + year + ' LearnTAV. All rights reserved.</p>\n' +
'            <div class="footer-legal">\n' +
'                <a href="' + url('legal/privacy/index.html') + '">Privacy</a>\n' +
'                <a href="' + url('legal/terms/index.html') + '">Terms</a>\n' +
'                <a href="' + url('legal/cookies/index.html') + '">Cookies</a>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'</footer>';
    }

    /* ----------------------------------------
       Mount
       ---------------------------------------- */
    // This file is loaded from <head>, so at that point the placeholder
    // divs do not exist yet. Each page therefore calls LearnTAVLayout.mount()
    // from a one-line inline <script> placed immediately after each
    // placeholder: that runs synchronously while the parser is still
    // working, so the header and footer are in the DOM before first paint
    // (no pop-in). The DOMContentLoaded listener below is only a safety
    // net for pages that omit the inline call.
    function mount() {
        var headerSlot = document.getElementById('site-header');
        var footerSlot = document.getElementById('site-footer');

        if (headerSlot && !headerSlot.dataset.rendered) {
            headerSlot.innerHTML = renderHeader();
            headerSlot.dataset.rendered = 'true';
        }

        if (footerSlot && !footerSlot.dataset.rendered) {
            footerSlot.innerHTML = renderFooter();
            footerSlot.dataset.rendered = 'true';
        }

        return !!(headerSlot && footerSlot);
    }

    window.LearnTAVLayout = { mount: mount, basePath: basePath, url: url };

    // Safety net: catches anything the inline calls missed.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
