/* Product page behaviours: install tabs (iPhone/Android), copy-link.
   Without JS both install panels are visible, so nothing is hidden. */
(function () {
    'use strict';

    var tabsWrap = document.getElementById('installTabs');
    var panelsWrap = document.getElementById('installPanels');

    if (tabsWrap && panelsWrap) {
        var tabs = Array.prototype.slice.call(tabsWrap.querySelectorAll('[role="tab"]'));
        document.documentElement.classList.add('js-tabs');
        panelsWrap.classList.add('js-tabs');

        function select(tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
                var p = document.getElementById(t.getAttribute('aria-controls'));
                if (p) p.hidden = !on;
            });
            if (focus) tab.focus();
        }

        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { select(t, false); });
            t.addEventListener('keydown', function (e) {
                var n = null;
                if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
                else if (e.key === 'ArrowLeft') n = tabs[(i + tabs.length - 1) % tabs.length];
                else if (e.key === 'Home') n = tabs[0];
                else if (e.key === 'End') n = tabs[tabs.length - 1];
                if (n) { e.preventDefault(); select(n, true); }
            });
        });

        // Preselect the likely device; everyone can switch.
        var ua = navigator.userAgent || '';
        var isAndroid = /Android/i.test(ua);
        select(document.getElementById(isAndroid ? 'tab-android' : 'tab-iphone'), false);
    }

    var btn = document.getElementById('copyLinkBtn');
    var status = document.getElementById('copyStatus');
    if (btn) {
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-copy');
            function ok() { if (status) status.textContent = 'Link copied'; setTimeout(function () { if (status) status.textContent = ''; }, 3000); }
            function fallback() {
                var code = document.getElementById('tcLink');
                if (code && window.getSelection) {
                    var r = document.createRange(); r.selectNodeContents(code);
                    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
                }
                if (status) status.textContent = 'Press and hold to copy the selected link';
            }
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
            else fallback();
        });
    }
})();
