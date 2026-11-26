// EcoPrompt Desktop download buttons. Shared by the main EcoPrompt page
// (ai-tools/power-tracker/) and the desktop page (.../desktop/). One switch
// controls both pages: COMING_SOON below.
//
// Expects this markup on the page: #dl-live (with #dl-grid > .dl-card[data-os])
// and #dl-soon; #dl-lead is optional. See ai-tools/power-tracker/desktop/index.html.
(function () {
    'use strict';

    // ── Edit here ───────────────────────────────────────────────────────
    // true  = show "Coming soon" and make NO network request.
    // false = show download buttons, upgraded from the latest published release.
    // Flip to false only after the first desktop release is PUBLISHED (not a draft).
    var COMING_SOON = false;
    var REPO = 'arithapar78/ecoprompt';
    var TAG_PREFIX = 'desktop-v';   // release tags look like desktop-v0.1.0
    // ────────────────────────────────────────────────────────────────────

    var $ = function (sel, root) { return (root || document).querySelector(sel); };

    function detectOS() {
        var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.userAgent || '';
        if (/iphone|ipad|ipod|android|cros|linux/i.test(navigator.userAgent || '')) return null;
        if (/mac/i.test(p)) return 'mac';
        if (/win/i.test(p)) return 'windows';
        return null;
    }

    function fmtSize(bytes) {
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // 1. Soon, or live.
    if (COMING_SOON) {
        $('#dl-live').hidden = true;
        $('#dl-soon').hidden = false;
        $('#dl-lead').textContent = 'Mac and Windows installers are on the way.';
        return;
    }

    // 2. Feature the visitor's OS. The other one stays, smaller, underneath.
    var os = detectOS();
    if (os) {
        $('#dl-grid').classList.add('has-featured');
        document.querySelectorAll('.dl-card').forEach(function (card) {
            var mine = card.getAttribute('data-os') === os;
            card.classList.add(mine ? 'is-featured' : 'is-secondary');
        });
    }

    // 3. Upgrade the fallback links to direct downloads. Any failure leaves the
    //    working "Latest release on GitHub" links in place.
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 8000) : null;

    function api(path, accept) {
        return fetch('https://api.github.com/repos/' + REPO + path, {
            headers: { 'Accept': accept || 'application/vnd.github+json' },
            signal: ctl ? ctl.signal : undefined
        });
    }

    // List releases rather than /releases/latest: this repo also hosts the Chrome
    // extension, and "latest" could point at a non-desktop release.
    api('/releases?per_page=20')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (list) {
            var rel = list.filter(function (x) {
                return !x.draft && !x.prerelease && String(x.tag_name).indexOf(TAG_PREFIX) === 0;
            })[0];
            if (!rel) throw new Error('no published desktop release');

            var version = String(rel.tag_name).slice(TAG_PREFIX.length);
            var assets = { dmg: null, exe: null };
            rel.assets.forEach(function (a) {
                if (/\.dmg$/i.test(a.name)) assets.dmg = assets.dmg || a;
                else if (/-setup\.exe$/i.test(a.name)) assets.exe = assets.exe || a;
            });

            document.querySelectorAll('.dl-card').forEach(function (card) {
                var btn = $('[data-dl]', card);
                var asset = assets[btn.getAttribute('data-dl')];
                if (!asset) return;                       // keep the fallback link
                btn.href = asset.browser_download_url;
                $('[data-meta]', card).textContent = 'Version ' + version + ' \u00b7 ' + fmtSize(asset.size);

                // GitHub reports each asset's SHA-256 in the release JSON ("sha256:<hex>"),
                // the same value as SHA256SUMS.txt. (Fetching SHA256SUMS.txt from a browser
                // fails: GitHub redirects it to a host without CORS headers.)
                var m = /^sha256:([0-9a-f]{64})$/i.exec(asset.digest || '');
                if (m) {
                    $('[data-sha-value]', card).textContent = m[1].toLowerCase();
                    $('[data-sha]', card).hidden = false;
                }
            });
        })
        .catch(function () { /* keep fallback links: "Latest release on GitHub" */ })
        .then(function () { if (timer) clearTimeout(timer); });
})();
