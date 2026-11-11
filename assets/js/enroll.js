/* ========================================
   Enrollment inquiry form.

   Delivery: the form POSTs JSON to config.enrollment.endpoint (a Formspree
   form that forwards to hello@learntav.com). It never opens the visitor's
   email app.

   Guarantees:
   - The visitor sees "Inquiry received" ONLY after the server answered 2xx.
   - Any other outcome (no endpoint, offline, timeout, 4xx/5xx, bad reply)
     shows an explicit error, keeps what they typed, and offers the
     fallback Google Form and a copy-my-answers button. It cannot fail
     silently.
   - It is an INQUIRY. No payment is taken or implied.
   ======================================== */
(function () {
    'use strict';

    var form = document.getElementById('enrollForm');
    if (!form) return;

    var CFG = window.LearnTAVConfig || {};
    var ENR = CFG.enrollment || {};
    var statusEl = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var TIMEOUT_MS = 20000;
    var submitting = false;
    var submitted = false;

    /* ---------- prices / summary ---------- */
    function plan() { return form.elements.plan.value === 'private' ? 'private' : 'group'; }

    function price(p) {
        var fallback = { group: 99, private: 199 };
        var pr = CFG.pricing && CFG.pricing[p];
        return (CFG.pricing ? CFG.pricing.symbol : '$') + (pr ? pr.total : fallback[p]);
    }

    function sizeText(p) {
        if (p === 'private') return 'One-on-one';
        var n = CFG.pricing && CFG.pricing.group ? CFG.pricing.group.size : 5;
        return 'Up to ' + n + ' students';
    }

    function updateSummary() {
        var p = plan();
        document.getElementById('sumPlan').textContent = p === 'private' ? 'Private' : 'Group';
        document.getElementById('sumTotal').textContent = price(p);
        document.getElementById('sumSize').textContent = sizeText(p);
    }

    try {
        var q = new URLSearchParams(window.location.search).get('plan');
        if (q === 'private' || q === 'group') form.elements.plan.value = q;
    } catch (e) { /* ignore */ }

    try {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && !form.elements.timezone.value) form.elements.timezone.value = tz;
    } catch (e) { /* ignore */ }

    // Preferred start date can't be in the past.
    (function () {
        var d = new Date();
        var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        form.elements.startDate.min = iso;
    })();

    form.querySelectorAll('input[name="plan"]').forEach(function (r) { r.addEventListener('change', updateSummary); });
    updateSummary();

    /* ---------- not-live notice ---------- */
    var fallbackUrl = ENR.fallbackFormUrl || '';
    var notice = document.getElementById('endpointNotice');
    if (!ENR.endpoint && notice) {
        var a = document.getElementById('fallbackLink1');
        if (a && fallbackUrl) a.href = fallbackUrl;
        notice.hidden = false;
    }

    /* ---------- sanitizing ---------- */
    var CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
    function clean(v, max) {
        return String(v == null ? '' : v).replace(CTRL, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
    }
    function cleanMultiline(v, max) {
        return String(v == null ? '' : v).replace(CTRL, '').replace(/[<>]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, max);
    }
    function esc(v) {
        return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }

    /* ---------- validation ---------- */
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

    function setError(name, msg) {
        var el = document.getElementById('err-' + name);
        var input = form.elements[name];
        if (!el) return;
        if (msg) { el.textContent = msg; el.hidden = false; if (input) input.setAttribute('aria-invalid', 'true'); }
        else { el.hidden = true; el.textContent = ''; if (input) input.removeAttribute('aria-invalid'); }
    }

    function reference() {
        var chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', out = '';
        var arr = new Uint8Array(6);
        (window.crypto || window.msCrypto).getRandomValues(arr);
        arr.forEach(function (n) { out += chars[n % chars.length]; });
        return 'LT-' + out;
    }

    function collect() {
        var f = form.elements;
        return {
            course: 'Vibe Coding 101',
            plan: plan() === 'private' ? 'Private' : 'Group',
            totalPerStudent: price(plan()),
            classSize: sizeText(plan()),
            name: clean(f.name.value, 100),
            email: clean(f.email.value, 160).toLowerCase(),
            ageRange: clean(f.age.value, 30),
            experience: clean(f.experience.value, 80),
            preferredStartDate: clean(f.startDate.value, 10),
            availability: clean(f.availability.value, 300),
            timezone: clean(f.timezone.value, 80),
            projectGoals: cleanMultiline(f.goal.value, 1000),
            questions: cleanMultiline(f.questions.value, 1000),
            wantsIntroCall: f.intro.checked ? 'yes' : 'no',
            acknowledgedInquiryOnly: f.ack.checked ? 'yes' : 'no',
            _gotcha: f._gotcha.value
        };
    }

    function validate(d) {
        var bad = [];
        function fail(k, m) { bad.push(k); setError(k, m); }
        ['name', 'email', 'age', 'experience', 'startDate', 'availability', 'timezone', 'ack'].forEach(function (k) { setError(k, ''); });
        if (!d.name) fail('name', 'Please enter the student’s name.');
        if (!d.email) fail('email', 'Please enter an email address.');
        else if (!EMAIL_RE.test(d.email)) fail('email', 'That email address doesn’t look right.');
        if (!d.ageRange) fail('age', 'Please choose an age range (or “Prefer not to say”).');
        if (!d.experience) fail('experience', 'Please choose a coding experience level.');
        if (d.preferredStartDate) {
            if (!DATE_RE.test(d.preferredStartDate) || d.preferredStartDate < form.elements.startDate.min) fail('startDate', 'Please pick a start date that is today or later.');
        }
        if (!d.availability) fail('availability', 'Tell us when you’re generally available.');
        if (!d.timezone) fail('timezone', 'Please enter your time zone.');
        if (d.acknowledgedInquiryOnly !== 'yes') fail('ack', 'Please confirm you understand this is an inquiry.');
        return bad;
    }

    /* ---------- status ---------- */
    function show(kind, title, html) {
        statusEl.className = 'form-status ' + kind;
        statusEl.innerHTML = '<h3>' + title + '</h3>' + html;
        statusEl.hidden = false;
        statusEl.focus();
        statusEl.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }

    function lock(on) {
        submitting = on;
        submitBtn.disabled = on || submitted;
        submitBtn.textContent = on ? 'Sending…' : (submitted ? 'Inquiry sent' : 'Send enrollment inquiry');
        submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    }

    function plainText(d, ref) {
        return [
            'Enrollment inquiry: ' + d.course + (ref ? ' (' + ref + ')' : ''),
            'Format: ' + d.plan + ' (' + d.totalPerStudent + ' per student, ' + d.classSize + ')',
            'Name: ' + d.name, 'Email: ' + d.email, 'Age range: ' + d.ageRange,
            'Coding experience: ' + d.experience,
            'Preferred start date: ' + (d.preferredStartDate || 'not given'),
            'Availability: ' + d.availability, 'Time zone: ' + d.timezone,
            'Intro conversation: ' + d.wantsIntroCall,
            'Project goals: ' + (d.projectGoals || '(none)'), 'Questions: ' + (d.questions || '(none)')
        ].join('\n');
    }

    function failure(d, reason, uncertain) {
        lock(false);
        var fb = fallbackUrl ? '<a class="btn btn-outline" href="' + esc(fallbackUrl) + '" target="_blank" rel="noopener noreferrer">Use the sign-up form instead</a>' : '';
        show('error', uncertain ? 'We couldn’t confirm your inquiry was received' : 'We couldn’t send your inquiry',
            '<p><strong>' + (uncertain ? 'We did not get a confirmation, so please don’t assume it arrived.' : 'Nothing was sent.') + '</strong> ' + esc(reason) + ' Your answers are still here, so you can try again, use the sign-up form, or email <a href="mailto:hello@learntav.com">hello@learntav.com</a>.</p>' +
            '<div class="btn-row"><button type="button" class="btn btn-primary" id="retryBtn">Try again</button>' + fb +
            '<button type="button" class="btn btn-outline" id="copyBtn">Copy my answers</button></div>');
        var retry = document.getElementById('retryBtn');
        if (retry) retry.addEventListener('click', function () { form.requestSubmit(); });
        var copy = document.getElementById('copyBtn');
        if (copy) copy.addEventListener('click', function () {
            var txt = plainText(d, '');
            var done = function () { copy.textContent = 'Copied'; };
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { copy.textContent = 'Copy failed. Select the text manually'; });
            else copy.textContent = 'Copy not supported here';
        });
    }

    /* ---------- submit ---------- */
    form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (submitting || submitted) return;

        var d = collect();

        // Honeypot: a filled hidden field means a bot. Don't show success.
        if (d._gotcha) { return; }

        var errors = validate(d);
        if (errors.length) {
            var first = form.elements[errors[0]];
            show('error', 'Please fix the highlighted fields', '<p>' + errors.length + ' field' + (errors.length > 1 ? 's need' : ' needs') + ' attention.</p>');
            if (first) first.focus();
            return;
        }

        var endpoint = ENR.endpoint;
        if (!endpoint) {
            failure(d, 'Our online form isn’t switched on yet.');
            return;
        }

        var ref = reference();
        var payload = Object.assign({}, d, {
            reference: ref,
            _subject: 'Vibe Coding 101 inquiry (' + d.plan + '): ' + d.name,
            _replyto: d.email,
            submittedAt: new Date().toISOString()
        });

        lock(true);
        var ctrl = 'AbortController' in window ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctrl ? ctrl.signal : undefined
        }).then(function (res) {
            clearTimeout(timer);
            return res.json().catch(function () { return {}; }).then(function (body) { return { res: res, body: body }; });
        }).then(function (r) {
            if (r.res.ok && !(r.body && r.body.error)) {
                submitted = true;
                lock(false);
                show('success', 'Inquiry received',
                    '<p>Thank you, ' + esc(d.name) + '. We received your inquiry (reference <strong>' + esc(ref) + '</strong>).</p>' +
                    '<p>We&rsquo;ll email you at <strong>' + esc(d.email) + '</strong> to confirm times and share payment details. <strong>This is not yet a confirmed booking and nothing has been charged.</strong> Not seeing our email? Check your spam folder, or write to <a href="mailto:hello@learntav.com">hello@learntav.com</a> and quote your reference.</p>');
                return;
            }
            var msg = (r.body && (r.body.error || (r.body.errors && r.body.errors[0] && r.body.errors[0].message))) || ('The server replied with status ' + r.res.status + '.');
            failure(d, msg);
        }).catch(function (err) {
            clearTimeout(timer);
            failure(d, err && err.name === 'AbortError' ? 'The request timed out.' : 'We couldn’t reach the server. Check your connection.', true);
        });
    });
})();
