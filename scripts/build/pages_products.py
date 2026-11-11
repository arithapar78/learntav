"""Products index and Trophy Case product page.

Add a third product: add an entry to data/products.json, copy
product_page_trophy_case() below as a template for its detail page, and
re-run scripts/build/build_all.py. The home page and /products/ pick the
new card up automatically.
"""
from lib import *

TC = product('trophy-case')
INSTALL_URL = 'https://trophy-case-trophy-case.vercel.app'   # live app (QR + install steps encode this)
IMG = 'assets/images/trophy-case/'

SVG = {
 'share': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/></svg>',
 'plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
 'dots': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
 'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12l5 5L20 7"/></svg>',
 'phone': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
 'compass': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5z"/></svg>',
 'chrome': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 8h9M8.5 14l-4.5 7.8M15.5 14L11 21.8"/></svg>',
 'qr': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v1M14 20h1M18 18h3v3h-3z"/></svg>',
}

def phone(src, alt, cls='', w=684, h=900, eager=False):
    load = 'eager' if eager else 'lazy'
    prio = ' fetchpriority="high"' if eager else ''
    return (f'<div class="phone {cls}"><img src="{{up}}{IMG}{src}" alt="{alt}" width="{w}" height="{h}" '
            f'loading="{load}" decoding="async"{prio}></div>')

STEPS = [
 ('Capture Your Wins', 'Snap a photo of a certificate, medal, program, or other achievement. Add the details manually or use AI to help fill them in.'),
 ('Discover What Matters', 'Set a goal, and let AI help rank your achievements by relevance and suggest three next steps.'),
 ('Keep Growing', 'Use Scout, your AI achievement coach, to explore opportunities, review accomplishments, and plan your next move.'),
]

FEATURES = [
 ('Timeline', 'timeline.jpg', 'Trophy Case Timeline tab with saved achievements, search and category filters',
  'Save, organize, search, edit, and revisit achievements.',
  ['Up to five photos per achievement', 'Category filters and search', 'Full-screen photo viewing'], None),
 ('Ranked', 'ranked.jpg', 'Trophy Case Ranked tab asking the user to set a goal',
  'Set a personal goal and receive AI-assisted rankings of your achievements, along with three suggested next steps.',
  ['Rankings are suggestions, not verdicts'], 'AI feature: needs a Google sign-in.'),
 ('Scout', 'scout.jpg', 'Trophy Case Scout tab asking the user to sign in to use AI',
  'Chat with an AI coach that can use your goal and achievement information as context. Attach photos, PDFs, or text files.',
  ['Scout can suggest saving an achievement. Nothing is saved until you confirm'], 'AI feature: needs a Google sign-in.'),
 ('Me', 'me.jpg', 'Trophy Case Me tab showing a profile card with totals and a category chart',
  'View your profile, an AI-generated summary, strengths supported by your achievements, a category chart, and achievements grouped by category.',
  ['Export a shareable profile card as an image'], 'The summary is an AI feature: needs a Google sign-in.'),
]

PRIVACY = [
 ('Stored on your device', 'Achievements and photos are stored locally in your browser using IndexedDB.'),
 ('No automatic cloud sync', 'There is no automatic cloud synchronization of achievements. The account system stores identity and session information, not your achievement library.'),
 ('Photos are cleaned on save', 'Photos are resized and re-encoded when saved, which removes the original EXIF metadata (such as location).'),
 ('Back up, restore, export', 'You can back up and restore your data, and export it.'),
 ('You can delete it', 'You can delete your account, and separately delete your data stored on the device.'),
 ('AI uses a server', 'AI features are processed on a server. When you use them, the relevant information is sent for that request, for example your goal and the text of your achievements. Not everything always stays on your device.'),
 ('Sign-in for AI only', 'Google sign-in is required for AI features. Features that don&rsquo;t use AI work signed out.'),
 ('Ages 13 and up', 'People under 13 can&rsquo;t sign in.'),
]

def faq_items():
    return [
     ('Is Trophy Case free?', '<p>Yes, Trophy Case is currently free to use. There is no subscription or checkout in the app today.</p>'),
     ('Do I need to download it from an App Store?', '<p>No. Trophy Case is an installable web app (a progressive web app), not an App Store or Google Play app. You open it in your phone&rsquo;s browser and add it to your Home Screen. Follow the steps above.</p>'),
     ('Does it work offline?', '<p>Core features that use your saved achievements can work without a connection once the app has loaded on your device. AI features (photo reading, Ranked, Scout and the profile summary) need an internet connection.</p>'),
     ('Where are my achievements stored?', '<p>On your device, in your browser&rsquo;s storage (IndexedDB). Our servers don&rsquo;t keep your achievements or photos, and nothing syncs to the cloud automatically. If you have an account, it holds identity and session information only.</p>'),
     ('Can parents use it?', '<p>Yes. Trophy Case is built for students aged 13&ndash;18 and for parents who want to record a young person&rsquo;s wins. The app works without an account. AI features need a Google sign-in, and people under 13 can&rsquo;t sign in.</p>'),
     ('Do I need an account?', '<p>Not for saving, searching and organizing achievements. An account (Google sign-in) is needed only for the AI features: photo reading, Ranked, Scout and the profile summary.</p>'),
     ('Can I export or back up my achievements?', '<p>Yes. You can create a backup file and restore it later, and export your data. The Me tab can also save a shareable profile card as an image.</p>'),
     ('What happens if I clear my browser data or change phones?', '<p>Because achievements are stored only on your device, clearing site data, uninstalling, or losing or replacing the device can erase them <strong>unless you have a backup</strong>. Make a backup file regularly, and restore it on your new phone.</p>'),
    ]

def faq_html(items):
    return '\n'.join(f'<details><summary>{q}</summary><div>{a}</div></details>' for q, a in items)

def install_panel(kind, up):
    if kind == 'iphone':
        steps = [
         ('qr', f'Scan the QR code or open <small>{INSTALL_URL}</small> in <strong>Safari</strong>.'),
         ('share', 'Tap the <strong>Share</strong> button (the square with an upward arrow).'),
         ('plus', 'Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong>.'),
         ('check', 'Tap <strong>&ldquo;Add&rdquo;</strong>.'),
         ('phone', 'Open Trophy Case from the new Home Screen icon.'),
        ]
    else:
        steps = [
         ('chrome', f'Open <small>{INSTALL_URL}</small> in <strong>Chrome</strong>.'),
         ('dots', 'Tap the <strong>three-dot menu</strong> in the top-right corner.'),
         ('plus', 'Select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>, depending on your device.'),
         ('check', 'Confirm by tapping <strong>&ldquo;Install&rdquo;</strong> or <strong>&ldquo;Add&rdquo;</strong>.'),
         ('phone', 'Open Trophy Case from your Home Screen.'),
        ]
    items = ''.join(f'<li class="install-step"><span class="n" aria-hidden="true">{i}</span><p>{t}</p><span class="ico">{SVG[ic]}</span></li>'
                    for i, (ic, t) in enumerate(steps, 1))
    note = ('<p class="small muted install-note">Menu names and icons can differ between devices and browser versions. If you don&rsquo;t see these exact labels, look for an option that adds the page to your Home Screen.</p>' if kind == 'android' else
            '<p class="small muted install-note">Use Safari for these steps. Button positions can vary slightly between iOS versions.</p>')
    label = 'iPhone' if kind == 'iphone' else 'Android'
    return (f'<div class="install-panel" role="tabpanel" id="panel-{kind}" aria-labelledby="tab-{kind}"{" hidden" if kind == "android" else ""}>'
            f'<h3 class="visually-hidden">{label} instructions</h3><ol class="install-steps">{items}</ol>{note}</div>')


def trophy_case():
    up = '../../'
    ld = f'''{{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Trophy Case",
      "description": "A phone-first achievement tracker and AI-powered coach for students ages 13 to 18 and their parents.",
      "url": "https://learntav.com/products/trophy-case/",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Any modern web browser (installable web app)",
      "offers": {{"@type": "Offer", "price": "0", "priceCurrency": "USD"}},
      "publisher": {{"@type": "Organization", "name": "LearnTAV", "url": "https://learntav.com"}}
    }}'''
    h = head('Trophy Case | AI-Powered Achievement Tracker | LearnTAV',
             'Save your achievements, track your progress, and discover your next steps with Trophy Case, the AI-powered achievement tracker for students.',
             'products/trophy-case/', 2, ld,
             body_attrs=' class="page-product"')
    h += f'''
    <section class="hero-split" aria-labelledby="tc-title">
        <div class="hero-bg"><div class="hero-gradient"></div><div class="hero-grid"></div></div>
        <div class="container hero-split-grid">
            <div>
                <span class="pill pill-brand" style="margin-bottom: var(--space-4)">Live Product · Installable web app</span>
                <h1 id="tc-title">Every Achievement. <em>One Place.</em></h1>
                <p class="lead">From your first certificate to your biggest milestone, Trophy Case helps you save what you&rsquo;ve accomplished, understand what matters, and plan what comes next.</p>
                <div class="btn-row">
                    <a class="btn btn-cta btn-lg" href="#get">Get Trophy Case {ICON['arrow']}</a>
                    <a class="btn btn-outline btn-lg" href="#how-it-works">See How It Works</a>
                </div>
                <p class="small muted" style="margin-top: var(--space-4)">For students ages 13&ndash;18 and their parents. No App Store needed. <a class="link-arrow" style="min-height:0;display:inline" href="#install">Add it to your Home Screen</a>.</p>
            </div>
            <figure class="hero-phone reveal">
                {phone('timeline.jpg', 'Screenshot of the Trophy Case Timeline with saved achievements', 'phone-lg', eager=True)}
                <figcaption class="phone-cap">Real screenshot of the live app. Sample entries added for illustration.</figcaption>
            </figure>
        </div>
    </section>

    <div id="features">
    <section class="section section-sunken" id="how-it-works" aria-labelledby="how-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">How it works</p><h2 class="h2" id="how-title">Capture. Discover. Keep growing.</h2></div>
            <ol class="steps">
                {''.join(f'<li class="step reveal"><div class="step-num" aria-hidden="true">{i}</div><h3 class="h3">{t}</h3><p>{d}</p></li>' for i,(t,d) in enumerate(STEPS,1))}
            </ol>
        </div>
    </section>

    <section class="section" aria-labelledby="feat-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Four core features</p><h2 class="h2" id="feat-title">Everything in four tabs.</h2><p class="section-description">Trophy Case is organized into Timeline, Ranked, Scout and Me. Screens below are from the live app.</p></div>
            <div class="grid-2">
                {''.join(f"""<article class="card feature-tile reveal"><div><span class="pill pill-brand tag">{n}</span><h3 class="h3">{d}</h3><ul class="tick-list">{''.join(f'<li>{x}</li>' for x in bullets)}</ul>{f'<p class="small muted" style="margin-top: var(--space-3)">{ai}</p>' if ai else ''}</div>{phone(img, alt, w=684, h=900).replace('{up}', up)}</article>""" for (n, img, alt, d, bullets, ai) in FEATURES)}
            </div>
            <p class="small muted" style="text-align:center; margin-top: var(--space-6)">Screenshots are real captures of the live app with sample entries. Ranked and Scout are shown signed out, where they ask you to set a goal or sign in.</p>
        </div>
    </section>
    </div>

    <section class="section section-sunken" id="privacy" aria-labelledby="priv-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Privacy-first design</p><h2 class="h2" id="priv-title">Your achievements belong to you.</h2><p class="section-description">Here is how Trophy Case handles your information, in plain terms.</p></div>
            <ul class="facts">
                {''.join(f'<li class="reveal"><strong>{t}</strong>{d}</li>' for t, d in PRIVACY)}
            </ul>
            <p class="small muted" style="max-width: 760px; margin: var(--space-6) auto 0; text-align:center">No app can promise perfect privacy or security. Read the full <a class="link-arrow" style="min-height:0;display:inline" href="https://trophy-case-trophy-case.vercel.app/privacy.html" target="_blank" rel="noopener noreferrer">Trophy Case privacy policy</a> for details.</p>
        </div>
    </section>

    <section class="section" id="get" aria-labelledby="get-title">
        <div class="container">
            <div class="card get-card reveal">
                <div class="stack">
                    <p class="eyebrow">Get Trophy Case</p>
                    <h2 class="h2" id="get-title">Your Trophy Case Is Ready.</h2>
                    <p class="lead">No App Store required. Add Trophy Case directly to your Home Screen and open it like an app.</p>
                    <div><a class="btn btn-cta btn-xl" href="{INSTALL_URL}" target="_blank" rel="noopener noreferrer">Open Trophy Case {ICON['arrow']}</a></div>
                    <div class="copy-row">
                        <code id="tcLink">{INSTALL_URL}</code>
                        <button type="button" class="btn btn-outline" id="copyLinkBtn" data-copy="{INSTALL_URL}">Copy link</button>
                        <span id="copyStatus" class="small muted" role="status" aria-live="polite"></span>
                    </div>
                </div>
                <div class="qr only-desktop">
                    <img src="{up}{IMG}install-qr.svg" alt="QR code that opens {INSTALL_URL} on your phone" width="200" height="200" loading="lazy">
                    <p>On a computer? Scan with your phone&rsquo;s camera.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section section-sunken" id="install" aria-labelledby="install-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">Install</p><h2 class="h2" id="install-title">Put It on Your Home Screen</h2><p class="section-description">Takes about 30 seconds. Then it opens like a normal app.</p></div>
            <div style="text-align:center">
                <div class="seg-tabs" role="tablist" aria-label="Choose your phone" id="installTabs">
                    <button type="button" role="tab" id="tab-iphone" aria-controls="panel-iphone" aria-selected="true">iPhone</button>
                    <button type="button" role="tab" id="tab-android" aria-controls="panel-android" aria-selected="false" tabindex="-1">Android</button>
                </div>
            </div>
            <div id="installPanels" style="text-align:left">
                {install_panel('iphone', up)}
                {install_panel('android', up)}
            </div>
            <div style="text-align:center; margin-top: var(--space-8)"><a class="btn btn-cta btn-lg" href="{INSTALL_URL}" target="_blank" rel="noopener noreferrer">Open Trophy Case</a></div>
        </div>
    </section>

    <section class="section" aria-labelledby="faq-title">
        <div class="container">
            <div class="section-head reveal"><p class="eyebrow">FAQ</p><h2 class="h2" id="faq-title">Questions about Trophy Case.</h2></div>
            <div class="faq">{faq_html(faq_items())}</div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content cta-band">
                <h2 class="cta-title">Start Collecting Your Wins.</h2>
                <p class="cta-description">Built by LearnTAV, alongside <a href="{up}ai-tools/power-tracker/index.html" style="color:#fff; text-decoration:underline">EcoPrompt</a>. Real products, built with AI.</p>
                <div class="cta-actions"><a class="btn btn-white btn-lg" href="#get">Get Trophy Case {ICON['arrow']}</a></div>
            </div>
        </div>
    </section>
'''
    h = h.replace('{up}', up)
    h += foot(2, '\n    <script src="../../assets/js/product-page.js" defer></script>')
    write('products/trophy-case/index.html', h)


def products_index():
    up = '../'
    h = head('Products | Trophy Case and EcoPrompt | LearnTAV',
             'LearnTAV\'s two live products: Trophy Case, an AI-powered achievement tracker for students, and EcoPrompt, a Chrome extension for AI energy awareness.',
             'products/', 1)
    h += f'''
    <section class="page-header">
        <div class="container">
            <div class="page-header-content">
                <span class="section-tag">Products</span>
                <h1 class="page-title">Meet What We&rsquo;ve Built</h1>
                <p class="page-description">Real products. Real problems. Built with AI.</p>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <div class="pcard-grid">
                {product_cards(up)}
            </div>
            <p class="small muted" style="text-align:center; margin-top: var(--space-8)">Want something built for you? <a class="link-arrow" style="min-height:0;display:inline" href="{up}consulting/app-builds/index.html">Request a quote</a>. Want to learn to build your own? <a class="link-arrow" style="min-height:0;display:inline" href="{up}education/vibe-coding-101/index.html">Try Vibe Coding 101</a>.</p>
        </div>
    </section>
'''
    h += foot(1)
    write('products/index.html', h)


if __name__ == '__main__':
    trophy_case()
    products_index()
    print('products ok')
