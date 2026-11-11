from lib import *
from pages_home_course import faq, FAQ_COMMON, curriculum

# ---------- Education overview ----------
e = head('Learn | AI Education for Beginners | LearnTAV',
         'Hands-on AI education from LearnTAV. Start with Vibe Coding 101: four live one-hour sessions, $99 group or $199 private for the full course.',
         'education/', 1)
e += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Learn</span>
                <h1 class="page-title">Learn to build real things with AI.</h1>
                <p class="page-description">Practical, hands-on programs for beginners, students, entrepreneurs, professionals and small teams. No coding experience required.</p>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="programs-title">
        <div class="container">
            <h2 class="visually-hidden" id="programs-title">Programs</h2>
            <div class="flagship reveal">
                <div class="stack">
                    <p class="eyebrow">Flagship course</p>
                    <h3 class="h2">Vibe Coding 101</h3>
                    <p class="lead" style="color: var(--text-on-dark-muted)">Learn to direct AI tools to build a real project. Four live one-hour sessions, four hours in total.</p>
                    <ul class="tick-list">
                        <li>Prompting fundamentals and tools setup</li>
                        <li>Building with AI and a hands-on project</li>
                        <li>Debugging and deployment fundamentals</li>
                    </ul>
                    <div class="btn-row">
                        <a class="btn btn-white btn-lg" href="vibe-coding-101/index.html">Course details {ICON['arrow']}</a>
                        <a class="btn btn-outline btn-lg" href="../enroll/index.html">Start Learning</a>
                    </div>
                </div>
                <div class="flagship-price">
                    <div class="row"><span class="who">Group<span class="sub">per person · full course</span></span><span class="amt" data-cfg="pricing.group.total">$99</span></div>
                    <div class="row"><span class="who">Private<span class="sub">per person · full course</span></span><span class="amt" data-cfg="pricing.private.total">$199</span></div>
                    <p class="small" style="color: var(--text-on-dark-muted); margin-top: var(--space-3)">Third-party AI subscriptions, API credits, hosting and domains are not included.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="curr-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Curriculum</p><h2 class="h2" id="curr-title">What the four sessions cover.</h2></div>
            <ol class="curriculum" style="max-width: 860px; margin-inline:auto">{curriculum()}</ol>
        </div>
    </section>

    <section class="section" aria-labelledby="stories-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Student projects</p><h2 class="h2" id="stories-title">What learners build.</h2></div>
            <div style="max-width: 860px; margin-inline:auto">
                <a class="card card-link reveal" href="../resources/blog/secondserve-tie-bootcamp/index.html">
                    <span class="pill pill-brand" style="align-self:flex-start; margin-bottom: var(--space-4)">Student story</span>
                    <h3 class="h3">Fixing food waste in a summer: building SecondServe at TiE</h3>
                    <p>Four high school students went to TiE&rsquo;s summer entrepreneurship bootcamp and came out with a working prototype that turns unsold bakery and restaurant food into cheap, fresh meals. Built with AI tools, by people with no engineering background.</p>
                    <span class="link-arrow">Read the story {ICON['arrow']}</span>
                </a>
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="why-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Our approach</p><h2 class="h2" id="why-title">Learning takes a village.</h2></div>
            <div class="grid-4">
                <div class="card reveal"><h3 class="h3">Build from day one</h3><p>You work on a real project, not slides.</p></div>
                <div class="card reveal"><h3 class="h3">Beginner first</h3><p>Plain language, no assumed experience.</p></div>
                <div class="card reveal"><h3 class="h3">Responsible AI</h3><p>We talk honestly about what AI gets wrong and what it costs.</p></div>
                <div class="card reveal"><h3 class="h3">Real people</h3><p>Live sessions with LearnTAV instructors.</p></div>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="price-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Pricing</p><h2 class="h2" id="price-title">Group or private.</h2></div>
            <div class="price-grid">{price_card('group','../')}{price_card('private','../')}</div>
            <div style="max-width: 920px; margin: var(--space-8) auto 0">{COST_NOTICE}</div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Ready to start?</h2>
                <p class="cta-description">Send an enrollment inquiry. We&rsquo;ll follow up with scheduling and payment details. Nothing is charged on this site.</p>
                <div class="cta-actions"><a class="btn btn-white btn-lg" href="../enroll/index.html">Start Learning {ICON['arrow']}</a></div>
            </div>
        </div>
    </section>
'''
e += foot(1)
write('education/index.html', e)

# ---------- Case studies -> honest examples page ----------
c = head('Examples | Custom Builds & Consulting | LearnTAV',
         'Examples of what LearnTAV builds and teaches. We publish only work we can stand behind and have permission to share.',
         'consulting/case-studies/', 2)
c += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Examples</span>
                <h1 class="page-title">Work we can stand behind.</h1>
                <p class="page-description">We publish stories only when they are real and we have permission to share them. Client case studies will appear here as that happens.</p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="proof">
                <a class="card card-link reveal" href="../../resources/blog/secondserve-tie-bootcamp/index.html">
                    <span class="pill pill-brand" style="align-self:flex-start; margin-bottom: var(--space-4)">Student story</span>
                    <h2 class="h3">SecondServe: a food-waste prototype built at TiE</h2>
                    <p>A working prototype from four high school students, built with AI tools at a summer entrepreneurship bootcamp.</p>
                    <span class="link-arrow">Read the story {ICON['arrow']}</span>
                </a>
                <div class="card placeholder-card reveal">
                    <h2 class="h3">Client case studies</h2>
                    <p>None published yet. We&rsquo;d rather show nothing than invent results.</p>
                    <a class="btn btn-outline" href="../app-builds/index.html">Request a Quote {ICON['arrow']}</a>
                </div>
            </div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Have a project in mind?</h2>
                <p class="cta-description">Tell us about it and we&rsquo;ll scope it with you. Custom builds and consulting are quoted individually.</p>
                <div class="cta-actions"><a class="btn btn-white btn-lg" href="../../contact/index.html">Discuss your project {ICON['arrow']}</a></div>
            </div>
        </div>
    </section>
'''
c += foot(2)
write('consulting/case-studies/index.html', c)
print('ok')
