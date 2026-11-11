from lib import *

SESS = [
 ('Prompting Fundamentals', 'How to describe what you want so an AI assistant gives you useful results: clear goals, context, and follow-up questions.'),
 ('AI Coding Tools Setup', 'Install and configure an AI coding environment, such as Claude, Cursor or VS Code with an AI assistant, and learn to steer it.'),
 ('Direct AI to Build', 'Guide an AI assistant to build your project, then review, test and refine what it produces.'),
 ('Debug &amp; Deploy', 'Use AI to find and fix problems, and learn the fundamentals of getting a project online.'),
]

def curriculum(up_unused=None, detailed=False):
    out = []
    for i, (t, s) in enumerate(SESS, 1):
        out.append(f'''<li class="session reveal">
                    <div class="session-n">Session<strong>{i}</strong></div>
                    <div><h3 class="h3">{t}</h3><p>{s}</p><p class="meta">1 hour · live</p></div>
                </li>''')
    return '\n                '.join(out)

def faq(items):
    return '\n'.join(f'<details><summary>{q}</summary><div>{a}</div></details>' for q, a in items)

FAQ_COMMON = [
 ('How big are group classes?', '<p>Group classes have a maximum of <strong>5 students</strong>. Private classes are one-on-one.</p>'),
 ('Do I need coding experience?', '<p>No. Vibe Coding 101 is designed for beginners. You learn to describe what you want, review what the AI produces, and guide it toward a working result.</p>'),
 ('How much does it cost?', '<p>The group course is <strong>$99 per person</strong> and the private course is <strong>$199 per person</strong>, each for the full four-session, four-hour course. Third-party AI subscriptions, API credits, hosting and domains are not included.</p>'),
 ('Is enrolling the same as booking?', '<p>No. Submitting the form is an enrollment inquiry. We&rsquo;ll email you to confirm scheduling and share payment details. Nothing is charged through this website.</p>'),
 ('Will I finish a deployed app?', f'<p>{COMPLETION}</p>'),
 ('Can I talk to someone first?', '<p>Yes. We offer a free, optional 15-minute introductory conversation. It&rsquo;s never required to enrol.</p>'),
]

# ======================= HOME =======================
studio = f'''<figure class="reveal">
                <div class="studio" role="img" aria-label="Illustration of a conversation where a learner describes an app idea and an AI assistant helps build a simple plant-watering tracker.">
                    <div class="studio-bar" aria-hidden="true"><span class="studio-dot"></span><span class="studio-dot"></span><span class="studio-dot"></span><span class="studio-title">My first app</span></div>
                    <div class="studio-body" aria-hidden="true">
                        <div class="studio-chat">
                            <div class="bubble bubble-you"><span class="bubble-label">You</span>I want a simple app to track when I water my plants.</div>
                            <div class="bubble bubble-ai"><span class="bubble-label">AI assistant</span>Let&rsquo;s start small: a plant list, a last-watered date, and a &ldquo;due today&rdquo; view. Want me to build that first?</div>
                            <div class="bubble bubble-you"><span class="bubble-label">You</span>Yes, and mark overdue ones<span class="caret"></span></div>
                        </div>
                        <div class="studio-preview">
                            <span class="mock-status">Preview</span>
                            <div class="mock-app">
                                <h4>My plants</h4>
                                <div class="mock-row"><span class="mock-check done"></span>Basil · watered today</div>
                                <div class="mock-row"><span class="mock-check"></span>Fern · due today</div>
                                <div class="mock-row"><span class="mock-check"></span>Cactus · due in 6 days</div>
                            </div>
                        </div>
                    </div>
                </div>
                <figcaption class="studio-caption">Illustration of the kind of conversation you&rsquo;ll practice. Not a real student project.</figcaption>
            </figure>'''

ld_home = '''{
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "LearnTAV",
      "alternateName": "Learning Takes a Village",
      "description": "Practical, hands-on AI education: learn to build real things with AI.",
      "url": "https://learntav.com",
      "logo": "https://learntav.com/assets/images/logo.png",
      "sameAs": [
        "https://www.instagram.com/learntav_llc/",
        "https://www.facebook.com/profile.php?id=61593091894765",
        "https://www.youtube.com/channel/UC9ksUX7uSH0yPYjETWThdGA"
      ]
    }'''

home = head('LearnTAV | Learn to Build Real Things With AI',
            'Hands-on AI education for beginners. Vibe Coding 101 is four live one-hour sessions: $99 group or $199 private for the full course. No coding experience required.',
            '', 0, ld_home)
home += f'''
    <section class="hero-split" aria-labelledby="hero-title">
        <div class="hero-bg"><div class="hero-gradient"></div><div class="hero-grid"></div></div>
        <div class="container hero-split-grid">
            <div>
                <p class="eyebrow">Learning Takes a Village</p>
                <h1 id="hero-title">Build Something <em>Real</em> With AI.</h1>
                <p class="lead">Go from an idea to a working application with hands-on AI coding education. No coding experience required.</p>
                <div class="btn-row">
                    <a class="btn btn-cta btn-lg" href="education/vibe-coding-101/index.html">Explore Vibe Coding 101 {ICON['arrow']}</a>
                    <a class="btn btn-outline btn-lg" href="#how-it-works">See How It Works</a>
                </div>
                <ul class="hero-pills" aria-label="Course at a glance">
                    <li class="pill pill-brand">4 live one-hour sessions</li>
                    <li class="pill">From <strong data-cfg="pricing.group.total">$99</strong> for the full course</li>
                    <li class="pill"><span data-cfg="pricing.group.size">Up to 5 students</span> per group</li>
                    <li class="pill">Beginner friendly</li>
                </ul>
            </div>
            {studio}
        </div>
    </section>

    <section class="section" aria-labelledby="flagship-title">
        <div class="container">
            <div class="flagship reveal">
                <div class="stack">
                    <p class="eyebrow">Flagship course</p>
                    <h2 class="h2" id="flagship-title">Vibe Coding 101</h2>
                    <p class="lead" style="color: var(--text-on-dark-muted)">Four live one-hour sessions that teach you to direct AI tools to build a real project, even if you&rsquo;ve never written code.</p>
                    <ul class="tick-list">
                        <li>Prompting fundamentals and AI coding tools setup</li>
                        <li>Direct AI to build your project</li>
                        <li>Debugging and deployment fundamentals</li>
                    </ul>
                    <div class="btn-row">
                        <a class="btn btn-white btn-lg" href="education/vibe-coding-101/index.html">See the course {ICON['arrow']}</a>
                        <a class="btn btn-outline btn-lg" href="enroll/index.html">Start Learning</a>
                    </div>
                </div>
                <div class="flagship-price">
                    <div class="row"><span class="who">Group<span class="sub">per person · full course</span></span><span class="amt" data-cfg="pricing.group.total">$99</span></div>
                    <div class="row"><span class="who">Private<span class="sub">per person · full course</span></span><span class="amt" data-cfg="pricing.private.total">$199</span></div>
                    <p class="small" style="color: var(--text-on-dark-muted); margin-top: var(--space-3)">Four hours in total. AI subscriptions, API credits, hosting and domains are extra.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="products-title" id="products">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Our products</p>
                <h2 class="h2" id="products-title">Meet What We&rsquo;ve Built</h2>
                <p class="section-description">Real products. Real problems. Built with AI.</p>
            </div>
            <div class="pcard-grid">
                {product_cards('')}
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="paths-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Choose your path</p>
                <h2 class="h2" id="paths-title">Learn it. Build it. Explore the tools.</h2>
                <p class="section-description">Start with a course, hire us to prototype an idea, or try the free tools we&rsquo;ve built.</p>
            </div>
            <div class="grid-3">
                <a class="card card-link reveal" href="education/index.html">
                    <div class="card-icon">{ICON['book']}</div>
                    <h3 class="h3">Learn</h3>
                    <p>Hands-on, beginner-friendly AI education led by real people. Start with Vibe Coding 101.</p>
                    <span class="link-arrow">Explore programs {ICON['arrow']}</span>
                </a>
                <a class="card card-link reveal" href="consulting/app-builds/index.html">
                    <div class="card-icon">{ICON['code']}</div>
                    <h3 class="h3">Build</h3>
                    <p>Need a prototype? We build custom AI-assisted prototypes and offer focused consulting. Request a quote.</p>
                    <span class="link-arrow">Request a quote {ICON['arrow']}</span>
                </a>
                <a class="card card-link reveal" href="ai-tools/index.html">
                    <div class="card-icon">{ICON['tool']}</div>
                    <h3 class="h3">Explore Tools</h3>
                    <p>Free tools and guides, including EcoPrompt, our extension for understanding AI energy use.</p>
                    <span class="link-arrow">Browse tools {ICON['arrow']}</span>
                </a>
            </div>
        </div>
    </section>

    <section class="section" id="how-it-works" aria-labelledby="how-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">How it works</p>
                <h2 class="h2" id="how-title">From idea to something you can show.</h2>
            </div>
            <ol class="steps">
                <li class="step reveal"><div class="step-num" aria-hidden="true">1</div><h3 class="h3">Tell us your idea</h3><p>Send an enrollment inquiry. Pick group or private and tell us what you&rsquo;d like to build. A rough idea is plenty.</p></li>
                <li class="step reveal"><div class="step-num" aria-hidden="true">2</div><h3 class="h3">We confirm the details</h3><p>We email you to agree on times and share payment details. Nothing is charged through the website.</p></li>
                <li class="step reveal"><div class="step-num" aria-hidden="true">3</div><h3 class="h3">Build in four live sessions</h3><p>Learn to prompt, set up your tools, direct AI to build, then debug and deploy.</p></li>
            </ol>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="curr-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Curriculum preview</p>
                <h2 class="h2" id="curr-title">Four sessions. Four hours.</h2>
                <p class="section-description">Each session is one live hour and builds on the last.</p>
            </div>
            <ol class="curriculum" style="max-width: 860px; margin-inline: auto;">
                {curriculum()}
            </ol>
            <p class="small muted" style="text-align:center; margin-top: var(--space-6)">{COMPLETION}</p>
        </div>
    </section>

    <section class="section" aria-labelledby="proof-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Student projects</p>
                <h2 class="h2" id="proof-title">What learners build.</h2>
                <p class="section-description">We only publish things we can stand behind. As more learners finish, their projects will appear here with their permission.</p>
            </div>
            <div class="proof">
                <a class="card card-link reveal" href="resources/blog/secondserve-tie-bootcamp/index.html">
                    <span class="pill pill-brand" style="align-self:flex-start; margin-bottom: var(--space-4)">Student story</span>
                    <h3 class="h3">SecondServe: a food-waste prototype built at TiE</h3>
                    <p>Four high school students went to a summer entrepreneurship bootcamp and came out with a working prototype that turns unsold bakery and restaurant food into cheap, fresh meals, built with AI tools by people without an engineering background.</p>
                    <span class="link-arrow">Read the story {ICON['arrow']}</span>
                </a>
                <div class="card placeholder-card reveal">
                    <h3 class="h3">Your project could be next</h3>
                    <p>Vibe Coding 101 ends with a hands-on project of your own. Learners who want to share theirs can have it featured here.</p>
                    <p class="small muted">No testimonials or results are shown until we have them with permission.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="free-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Free resources</p>
                <h2 class="h2" id="free-title">Try it before you commit.</h2>
            </div>
            <div class="grid-3">
                <a class="card card-link reveal" href="ai-tools/power-tracker/index.html"><div class="card-icon">{ICON['bolt']}</div><h3 class="h3">EcoPrompt</h3><p>A free Chrome extension that helps you see and reduce the energy used by your AI prompts.</p><span class="link-arrow">Learn more {ICON['arrow']}</span></a>
                <a class="card card-link reveal" href="resources/guides/index.html"><div class="card-icon">{ICON['book']}</div><h3 class="h3">Free guides</h3><p>Plain-language guides on getting started with AI, prompting and responsible use.</p><span class="link-arrow">Read the guides {ICON['arrow']}</span></a>
                <a class="card card-link reveal" href="resources/tools/index.html"><div class="card-icon">{ICON['tool']}</div><h3 class="h3">Tool directory</h3><p>A curated look at AI tools for conversation, building apps, design and content.</p><span class="link-arrow">Browse tools {ICON['arrow']}</span></a>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="price-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Pricing</p>
                <h2 class="h2" id="price-title">One course. Two ways to take it.</h2>
                <p class="section-description">Prices are per person for the full four-session course.</p>
            </div>
            <div class="price-grid">
                {price_card('group', '')}
                {price_card('private', '')}
            </div>
            <div style="max-width: 920px; margin: var(--space-8) auto 0">{COST_NOTICE}</div>
            <p class="small muted" style="text-align:center; margin-top: var(--space-4)"><a class="link-arrow" href="pricing/index.html">Full pricing details {ICON['arrow']}</a></p>
        </div>
    </section>

    <section class="section section-sunken" aria-labelledby="faq-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Questions, answered.</h2></div>
            <div class="faq">
                {faq(FAQ_COMMON)}
            </div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Ready to build something real?</h2>
                <p class="cta-description">Send an enrollment inquiry in about two minutes. We&rsquo;ll follow up by email with scheduling and payment details.</p>
                <div class="cta-actions">
                    <a class="btn btn-white btn-lg" href="enroll/index.html">Start Learning {ICON['arrow']}</a>
                    <a class="btn btn-outline btn-lg" href="education/vibe-coding-101/index.html">Explore Vibe Coding 101</a>
                </div>
                <p class="cta-email">Questions first? Email <a href="mailto:hello@learntav.com">hello@learntav.com</a>. A free 15-minute intro conversation is available.</p>
            </div>
        </div>
    </section>
'''
home += foot(0)
write('index.html', home)

# ======================= COURSE =======================
ld_course = '''{
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Vibe Coding 101",
      "description": "Four live one-hour sessions teaching beginners to direct AI tools to build a real project.",
      "provider": {"@type": "Organization", "name": "LearnTAV", "sameAs": "https://learntav.com"},
      "timeRequired": "PT4H",
      "offers": [
        {"@type": "Offer", "name": "Group course", "price": "99", "priceCurrency": "USD"},
        {"@type": "Offer", "name": "Private course", "price": "199", "priceCurrency": "USD"}
      ]
    }'''
course = head('Vibe Coding 101 | Learn to Build With AI | LearnTAV',
              'Vibe Coding 101: four live one-hour sessions to learn prompting, AI coding tools, building and debugging. $99 group or $199 private. No coding experience required.',
              'education/vibe-coding-101/', 2, ld_course)
course += f'''
    <section class="hero-split hero-dark" aria-labelledby="course-title">
        <div class="container hero-split-grid">
            <div>
                <p class="eyebrow">Flagship course · 4 hours</p>
                <h1 id="course-title">Vibe Coding <em>101</em></h1>
                <p class="lead">Learn to direct AI tools to build a real project, even if you&rsquo;ve never written a line of code. Four live one-hour sessions, built around a hands-on project.</p>
                <div class="btn-row">
                    <a class="btn btn-white btn-lg" href="../../enroll/index.html">Request a spot {ICON['arrow']}</a>
                    <a class="btn btn-outline btn-lg" href="#pricing">See pricing</a>
                </div>
                <ul class="hero-pills" aria-label="Course facts">
                    <li class="pill">4 live sessions</li>
                    <li class="pill">1 hour each</li>
                    <li class="pill">Group <strong data-cfg="pricing.group.total">$99</strong> · <span data-cfg="pricing.group.size">Up to 5 students</span></li>
                    <li class="pill">Private <strong data-cfg="pricing.private.total">$199</strong></li>
                </ul>
                <p class="small" style="margin-top: var(--space-3)">Prices are per person for the full course. Free optional 15-minute intro conversation available.</p>
            </div>
            <div>
                <div class="card" style="background: rgba(255,255,255,.08); border-color: var(--border-on-dark); box-shadow:none">
                    <h2 class="h3" style="color:#fff; margin-bottom: var(--space-4)">The course at a glance</h2>
                    <ul class="tick-list" style="color:#fff">
                        <li style="color:#fff">4 live one-hour sessions (4 hours total)</li>
                        <li style="color:#fff">Setup guidance for your AI coding tools</li>
                        <li style="color:#fff">Prompting fundamentals</li>
                        <li style="color:#fff">Building with AI, plus debugging and deployment fundamentals</li>
                        <li style="color:#fff">A hands-on project of your own</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="who-title">
        <div class="container">
            <div class="grid-2" style="align-items:start">
                <div class="reveal stack">
                    <p class="eyebrow">Who it&rsquo;s for</p>
                    <h2 class="h2" id="who-title">Curious beginners who want to make something.</h2>
                    <p class="lead">&ldquo;Vibe coding&rdquo; means describing what you want in plain language, reviewing what an AI assistant produces, and guiding it until it works. You make the decisions; the AI does the typing.</p>
                    <p>It&rsquo;s a fit for students, adults changing careers, entrepreneurs, professionals and small teams, with no coding background needed.</p>
                </div>
                <div class="card reveal">
                    <h3 class="h3">What to realistically expect</h3>
                    <ul class="tick-list">
                        <li>You&rsquo;ll understand how to prompt and steer an AI coding assistant.</li>
                        <li>You&rsquo;ll work on a real project of your own, scoped to fit four hours.</li>
                        <li>You&rsquo;ll learn how to debug with AI and the basics of deployment.</li>
                        <li>You won&rsquo;t become a professional engineer in four hours. This is a strong foundation.</li>
                    </ul>
                    <p class="small muted" style="margin-top: var(--space-4)">{COMPLETION}</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" id="curriculum" aria-labelledby="curr-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Curriculum</p>
                <h2 class="h2" id="curr-title">Four live sessions, one hour each.</h2>
            </div>
            <ol class="curriculum" style="max-width: 860px; margin-inline: auto;">
                {curriculum()}
            </ol>
        </div>
    </section>

    <section class="section" id="pricing" aria-labelledby="price-title">
        <div class="container">
            <div class="section-head reveal">
                <p class="eyebrow">Pricing</p>
                <h2 class="h2" id="price-title">Group or private. Per person, full course.</h2>
                <p class="section-description">Choose what fits how you like to learn. Prices cover all four sessions.</p>
            </div>
            <div class="price-grid">
                {price_card('group', '../../')}
                {price_card('private', '../../')}
            </div>
            <div class="table-wrap" style="max-width: 920px; margin: var(--space-10) auto 0">
                <table class="compare">
                    <caption class="visually-hidden">Group versus private course comparison</caption>
                    <thead><tr><th scope="col">&nbsp;</th><th scope="col">Group</th><th scope="col">Private</th></tr></thead>
                    <tbody>
                        <tr><th scope="row">Full-course price</th><td><strong data-cfg="pricing.group.total">$99</strong> per person</td><td><strong data-cfg="pricing.private.total">$199</strong> per person</td></tr>
                        <tr><th scope="row">Live sessions</th><td>4 × 1 hour</td><td>4 × 1 hour</td></tr>
                        <tr><th scope="row">Pacing</th><td>Shared with the group</td><td>Personalized, one-on-one</td></tr>
                        <tr><th scope="row">Project guidance</th><td>Hands-on project</td><td>Hands-on project with guidance tailored to you</td></tr>
                        <tr><th scope="row">Group size</th><td data-cfg="pricing.group.size">Up to 5 students</td><td>Just you</td></tr>
                    </tbody>
                </table>
            </div>
            <div style="max-width: 920px; margin: var(--space-8) auto 0">{COST_NOTICE}</div>
        </div>
    </section>

    <section class="section section-sunken" id="requirements" aria-labelledby="prep-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Before you enrol</p><h2 class="h2" id="prep-title">What you&rsquo;ll need.</h2></div>
            <div class="grid-2">
                <div class="card reveal"><h3 class="h3">Your computer &amp; setup</h3>
                    <ul class="tick-list">
                        <li>A Mac, Windows or Chromebook computer</li>
                        <li>A reliable internet connection</li>
                        <li>An up-to-date web browser, preferably Chrome</li>
                        <li>Access to VS Code and an AI coding assistant, where supported on your device</li>
                        <li><strong>No previous coding experience required</strong></li>
                    </ul>
                </div>
                <div class="stack reveal">
                    <div class="notice" role="note">{ICON['info']}<p><strong>About Chromebooks:</strong> Chromebooks can have compatibility limitations with desktop coding tools, and we can&rsquo;t promise every device supports the same setup. If you plan to use a Chromebook, tell us in your enrollment inquiry so we can talk through your options before you commit.</p></div>
                    <div class="notice warn" role="note">{ICON['info']}<p><strong>Accounts and costs:</strong> some AI tools require an account or paid API credits. These are <strong>not included</strong> in the course price.</p></div>
                </div>
            </div>
        </div>
    </section>

    <section class="section" aria-labelledby="faq-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Course FAQ</p><h2 class="h2" id="faq-title">Questions about Vibe Coding 101.</h2></div>
            <div class="faq">
                {faq(FAQ_COMMON + [
                  ('Can I use a Chromebook?', '<p>Possibly, but Chromebooks may have compatibility limitations with desktop coding tools such as VS Code. We can&rsquo;t promise every device supports the same setup, so please mention your device in your inquiry.</p>'),
                  ('What tools will I use?', '<p>We work with AI coding assistants such as Claude, Cursor, and VS Code with AI extensions. Exactly which tools you use depends on your project and budget.</p>'),
                  ('What if I can&rsquo;t attend a session?', '<p>Tell us when you submit your inquiry and we&rsquo;ll talk through scheduling when we reach out.</p>'),
                ])}
            </div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Ready to build your first project?</h2>
                <p class="cta-description">Send an enrollment inquiry. It&rsquo;s not a booking or a payment. We&rsquo;ll follow up with scheduling and payment details.</p>
                <div class="cta-actions">
                    <a class="btn btn-white btn-lg" href="../../enroll/index.html?plan=group">Group · <span data-cfg="pricing.group.total">$99</span> {ICON['arrow']}</a>
                    <a class="btn btn-outline btn-lg" href="../../enroll/index.html?plan=private">Private · <span data-cfg="pricing.private.total">$199</span></a>
                </div>
            </div>
        </div>
    </section>
'''
course += foot(2)
write('education/vibe-coding-101/index.html', course)
print('ok')
