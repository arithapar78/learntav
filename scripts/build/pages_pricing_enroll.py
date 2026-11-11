from lib import *
from pages_home_course import faq, FAQ_COMMON, curriculum

# ======================= PRICING =======================
p = head('Pricing | Vibe Coding 101 | LearnTAV',
         'Vibe Coding 101 pricing: $99 per person for the group course or $199 per person for the private course. Four live one-hour sessions, four hours total.',
         'pricing/', 1)
p += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Pricing</span>
                <h1 class="page-title">Simple, upfront pricing.</h1>
                <p class="page-description">Vibe Coding 101 is four live one-hour sessions: four hours in total. The price shown is per person for the full course.</p>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="plans-title">
        <div class="container">
            <h2 class="visually-hidden" id="plans-title">Course plans</h2>
            <div class="price-grid">
                {price_card('group', '../')}
                {price_card('private', '../')}
            </div>
            <div style="max-width: 920px; margin: var(--space-8) auto 0" class="stack">
                {COST_NOTICE}
                <div class="notice" role="note">{ICON['info']}<p><strong>Enrolling is an inquiry, not a booking.</strong> After you submit the form we&rsquo;ll email you to confirm scheduling and share payment details. This website doesn&rsquo;t take payments. We offer a free, optional 15-minute introductory conversation if you&rsquo;d like to talk first.</p></div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="compare-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Compare</p><h2 class="h2" id="compare-title">Group or private?</h2></div>
            <div class="table-wrap" style="max-width: 920px; margin-inline:auto">
                <table class="compare">
                    <caption class="visually-hidden">Group versus private course comparison</caption>
                    <thead><tr><th scope="col">&nbsp;</th><th scope="col">Group</th><th scope="col">Private</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">Full-course price</th><td><strong data-cfg="pricing.group.total">$99</strong> per person</td><td><strong data-cfg="pricing.private.total">$199</strong> per person</td></tr>
                        <tr><th scope="row">Live sessions</th><td>4 × 1 hour (4 hours)</td><td>4 × 1 hour (4 hours)</td></tr>
                        <tr><th scope="row">Setup guidance</th><td>Included</td><td>Included</td></tr>
                        <tr><th scope="row">Prompting, building, debugging &amp; deployment fundamentals</th><td>Included</td><td>Included</td></tr>
                        <tr><th scope="row">Hands-on project</th><td>Included</td><td>Included</td></tr>
                        <tr><th scope="row">Personalized one-on-one pacing</th><td>&mdash;</td><td>Included</td></tr>
                        <tr><th scope="row">One-on-one project guidance</th><td>&mdash;</td><td>Included</td></tr>
                        <tr><th scope="row">Group size</th><td data-cfg="pricing.group.size">Up to 5 students</td><td>One-on-one</td></tr>
                    </tbody>
                </table>
            </div>
            <p class="small muted" style="max-width:920px; margin: var(--space-4) auto 0">{COMPLETION}</p>
        </div>
    </section>

    <section class="section" aria-labelledby="custom-title">
        <div class="container">
            <div class="grid-2">
                <div class="card reveal"><h2 class="h3" id="custom-title">Custom builds &amp; consulting</h2><p>Need a prototype or focused guidance on using AI in your work? Every project is different, so we scope it with you first. We don&rsquo;t publish fixed prices for this work.</p><a class="btn btn-outline" href="../consulting/app-builds/index.html">Request a Quote {ICON['arrow']}</a></div>
                <div class="card reveal"><h2 class="h3">Free resources</h2><p>Not ready to enrol? Start with our free guides, the tool directory and EcoPrompt, our free Chrome extension.</p><a class="btn btn-outline" href="../resources/index.html">Browse free resources {ICON['arrow']}</a></div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="faq-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Pricing questions.</h2></div>
            <div class="faq">{faq(FAQ_COMMON)}</div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Pick your format and send an inquiry.</h2>
                <p class="cta-description">It takes about two minutes. Nothing is charged on this site.</p>
                <div class="cta-actions">
                    <a class="btn btn-white btn-lg" href="../enroll/index.html?plan=group">Group · <span data-cfg="pricing.group.total">$99</span></a>
                    <a class="btn btn-outline btn-lg" href="../enroll/index.html?plan=private">Private · <span data-cfg="pricing.private.total">$199</span></a>
                </div>
            </div>
        </div>
    </section>
'''
p += foot(1)
write('pricing/index.html', p)

# ======================= ENROLL =======================
e = head('Start Learning | Enrollment Inquiry | LearnTAV',
         'Send an enrollment inquiry for Vibe Coding 101. Choose group ($99) or private ($199). This is an inquiry, not a booking; we will email scheduling and payment details.',
         'enroll/', 1)
e += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Enrollment inquiry</span>
                <h1 class="page-title">Start Learning</h1>
                <p class="page-description">Tell us a little about you and what you&rsquo;d like to build. We&rsquo;ll email you to arrange times and payment. <strong>Submitting this form doesn&rsquo;t book a spot or charge you.</strong></p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container enroll-layout">
            <div class="card form-card">
                <div class="notice warn" id="endpointNotice" role="note" hidden>{ICON['info']}<p><strong>Heads up:</strong> our online enrollment form isn&rsquo;t switched on yet. Please use the <a id="fallbackLink1" href="#" target="_blank" rel="noopener noreferrer">sign-up form</a> instead, or email <a href="mailto:hello@learntav.com">hello@learntav.com</a>.</p></div>
                <form id="enrollForm" novalidate>
                    <div class="hp" aria-hidden="true"><label>Leave this field empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>

                    <fieldset class="form-section">
                        <legend>1. Choose your format</legend>
                        <div class="choice-grid" role="radiogroup" aria-label="Group or private">
                            <label class="choice"><input type="radio" name="plan" value="group" checked><span class="choice-box"><strong>Group · <span data-cfg="pricing.group.total">$99</span></strong><span>Per student, full course. <span data-cfg="pricing.group.size">Up to 5 students</span> per group</span></span></label>
                            <label class="choice"><input type="radio" name="plan" value="private"><span class="choice-box"><strong>Private · <span data-cfg="pricing.private.total">$199</span></strong><span>Per student, full course. One-on-one pacing</span></span></label>
                        </div>
                    </fieldset>

                    <fieldset class="form-section">
                        <legend>2. About the student</legend>
                        <div class="field"><label for="f-name">Student&rsquo;s full name <span class="req" aria-hidden="true">*</span></label><input class="input" id="f-name" name="name" type="text" autocomplete="name" required maxlength="100" aria-describedby="err-name"><span class="field-error" id="err-name" hidden></span></div>
                        <div class="field"><label for="f-email">Email <span class="req" aria-hidden="true">*</span> <span class="hint">(where we&rsquo;ll reply. A parent&rsquo;s email is fine)</span></label><input class="input" id="f-email" name="email" type="email" autocomplete="email" required maxlength="160" aria-describedby="err-email"><span class="field-error" id="err-email" hidden></span></div>
                        <div class="field"><label for="f-age">Age range <span class="req" aria-hidden="true">*</span></label>
                            <select class="select" id="f-age" name="age" required aria-describedby="err-age"><option value="">Select one</option><option>10 - 14</option><option>15 - 18</option><option>19 - 25</option><option>25 +</option><option>Prefer not to say</option></select><span class="field-error" id="err-age" hidden></span></div>
                        <div class="field"><label for="f-exp">Prior coding experience <span class="req" aria-hidden="true">*</span></label>
                            <select class="select" id="f-exp" name="experience" required aria-describedby="err-experience"><option value="">Select one</option><option>None</option><option>A little (tutorials or small experiments)</option><option>Some (I&rsquo;ve built small things)</option><option>Experienced</option></select><span class="field-error" id="err-experience" hidden></span></div>
                    </fieldset>

                    <fieldset class="form-section">
                        <legend>3. Schedule &amp; project</legend>
                        <div class="field"><label for="f-start">Preferred start date <span class="hint">(optional)</span></label><input class="input" id="f-start" name="startDate" type="date" aria-describedby="err-startDate"><span class="field-error" id="err-startDate" hidden></span></div>
                        <div class="field"><label for="f-avail">General availability <span class="req" aria-hidden="true">*</span></label><input class="input" id="f-avail" name="availability" type="text" required maxlength="300" placeholder="e.g. weekday evenings, weekends" aria-describedby="err-availability"><span class="field-error" id="err-availability" hidden></span></div>
                        <div class="field"><label for="f-tz">Time zone <span class="req" aria-hidden="true">*</span></label><input class="input" id="f-tz" name="timezone" type="text" required maxlength="80" aria-describedby="err-timezone"><span class="field-error" id="err-timezone" hidden></span></div>
                        <div class="field"><label for="f-goal">Project goals <span class="hint">(optional. What would you like to build? A rough idea is fine)</span></label><textarea class="textarea" id="f-goal" name="goal" maxlength="1000"></textarea></div>
                        <div class="field"><label for="f-q">Questions for us <span class="hint">(optional. Mention your device here if you use a Chromebook)</span></label><textarea class="textarea" id="f-q" name="questions" maxlength="1000"></textarea></div>
                        <div class="check"><input type="checkbox" id="f-intro" name="intro"><label for="f-intro">I&rsquo;d like the free, optional 15-minute introductory conversation first.</label></div>
                    </fieldset>

                    <fieldset class="form-section">
                        <legend>4. Confirm</legend>
                        <div class="stack">
                        {COST_NOTICE}
                        <div class="check"><input type="checkbox" id="f-ack" name="ack" required aria-describedby="err-ack"><label for="f-ack">I understand this is an enrollment <strong>inquiry</strong>, not a confirmed booking or payment, and that third-party tool costs aren&rsquo;t included. <span class="req" aria-hidden="true">*</span></label></div>
                        <span class="field-error" id="err-ack" hidden></span>
                        <p class="small muted">We use your details only to reply about this inquiry. See our <a class="link-arrow" style="min-height:0; display:inline" href="../legal/privacy/index.html">privacy policy</a>. We never ask for card or payment details here.</p>
                        <button class="btn btn-cta btn-lg" type="submit" id="submitBtn">Send enrollment inquiry</button>
                        </div>
                    </fieldset>

                    <div class="form-status" id="formStatus" role="status" aria-live="polite" tabindex="-1" hidden></div>
                </form>
            </div>

            <aside class="card order-summary" aria-labelledby="summary-title">
                <h2 class="h3" id="summary-title">Your selection</h2>
                <dl>
                    <div><dt>Course</dt><dd>Vibe Coding 101</dd></div>
                    <div><dt>Format</dt><dd id="sumPlan">Group</dd></div>
                    <div><dt>Sessions</dt><dd>4 × 1 hour (4 hours)</dd></div>
                    <div><dt>Class size</dt><dd id="sumSize">Up to 5 students</dd></div>
                </dl>
                <div class="order-total"><span>Full-course total, per person</span><span class="amt" id="sumTotal" data-cfg="pricing.group.total">$99</span></div>
                <p class="small muted" style="margin-top: var(--space-4)">Pending confirmation. Nothing is charged by submitting this form. We&rsquo;ll email scheduling and payment details.</p>
                <p class="small muted">{COMPLETION}</p>
            </aside>
        </div>
    </section>
'''
e += foot(1, '\n    <script src="../assets/js/enroll.js" defer></script>')
write('enroll/index.html', e)
print('ok')
