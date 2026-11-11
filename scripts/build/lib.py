import os
import json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

ICON = {
 'arrow': '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
 'book': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
 'code': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
 'tool': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>',
 'chat': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
 'info': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
 'bolt': '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
}

def head(title, desc, path, depth, ld=None, extra_head='', body_attrs=''):
    up = '../' * depth
    url = 'https://learntav.com/' + path
    ldscript = ''
    if ld:
        ldscript = '\n    <script type="application/ld+json">\n    %s\n    </script>' % ld
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{url}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="https://learntav.com/assets/images/og-image.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{desc}">

    <link rel="icon" type="image/png" href="{up}assets/images/favicon.png">
    <link rel="apple-touch-icon" href="{up}assets/images/favicon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap" rel="stylesheet">

    <!-- Shared layout: resolves theme pre-paint, renders header/footer -->
    <script src="{up}assets/js/layout.js"></script>
    <script src="{up}assets/js/site-config.js" defer></script>
    <link rel="stylesheet" href="{up}assets/css/modern.css">{ldscript}{extra_head}
</head>
<body{body_attrs}>
    <!-- Header + mobile menu injected by assets/js/layout.js -->
    <div id="site-header"></div>
    <script>LearnTAVLayout.mount();</script>

    <main id="main">
'''

def foot(depth, extra_scripts=''):
    up = '../' * depth
    return f'''    </main>

    <!-- Footer injected by assets/js/layout.js -->
    <div id="site-footer">
        <noscript>
            <p>
                <a href="{up}contact/index.html">Contact</a> &middot;
                <a href="{up}pricing/index.html">Pricing</a> &middot;
                <a href="{up}legal/privacy/index.html">Privacy</a> &middot;
                <a href="https://www.instagram.com/learntav_llc/" rel="noopener noreferrer">Instagram (@learntav_llc)</a> &middot;
                <a href="https://www.facebook.com/profile.php?id=61593091894765" rel="noopener noreferrer">Facebook (LearnTAV)</a> &middot;
                <a href="https://www.youtube.com/channel/UC9ksUX7uSH0yPYjETWThdGA" rel="noopener noreferrer">YouTube (learntavOFFICIAL)</a>
            </p>
        </noscript>
    </div>
    <script>LearnTAVLayout.mount();</script>

    <script src="{up}assets/js/modern.js"></script>{extra_scripts}
</body>
</html>
'''

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write(content)

# ---------- shared fragments (identical text everywhere) ----------
COST_NOTICE = f'''<div class="notice warn" role="note">{ICON['info']}<p><strong>Not included in the course price:</strong> external AI subscriptions, API credits, hosting, domains and other third-party tools. Some have free tiers and some cost money, and prices are set by those providers. Ask us before you enrol if you'd like help estimating what your project might need.</p></div>'''

def price_card(kind, up):
    g = kind == 'group'
    label = 'Group' if g else 'Private'
    total = '99' if g else '199'
    key = 'group' if g else 'private'
    tagline = ('Learn alongside other beginners and share ideas along the way.' if g else
               'One-on-one pacing and project guidance, built around you.')
    extras = ('<li><span data-cfg="pricing.group.size">Up to 5 students</span> per group</li>' if g else
              '<li><strong>Personalized one-on-one pacing</strong></li><li><strong>Project guidance tailored to your goal</strong></li>')
    return f'''<div class="price-card{'' if g else ' featured'} reveal">
                    <span class="pill{'' if g else ' pill-brand'} price-tag">{label} course</span>
                    <p class="muted">{tagline}</p>
                    <div class="price-amount"><span class="num" data-cfg="pricing.{key}.total">${total}</span><span class="per">per person · full course</span></div>
                    <p class="price-note">Total for all four live one-hour (60-minute) sessions.</p>
                    <ul class="tick-list">
                        <li>4 live one-hour sessions</li>
                        <li>Setup guidance</li>
                        <li>Prompting fundamentals</li>
                        <li>Building with AI</li>
                        <li>Debugging &amp; deployment fundamentals</li>
                        <li>A hands-on project</li>
                        {extras}
                    </ul>
                    <a class="btn {'btn-outline' if g else 'btn-cta'} btn-lg" href="{up}enroll/index.html?plan={key}">Request a {label} spot {ICON['arrow']}</a>
                </div>'''

COMPLETION = 'Whether you finish a deployed app depends on your project&rsquo;s scope and how your learning progresses. We&rsquo;ll help you choose a project that fits the four hours.'


# ---------- products ----------
def load_products():
    with open(os.path.join(ROOT, 'data', 'products.json')) as f:
        return json.load(f)

def product(slug):
    return next(p for p in load_products() if p['slug'] == slug)

def product_card(p, up):
    """Equal-weight product card used on the home page and /products/."""
    v = p['visual']
    if v['type'] == 'phone':
        visual = (f'<div class="pcard-visual pcard-visual-phone"><div class="phone phone-sm">'
                  f'<img src="{up}{v["src"]}" alt="{v["alt"]}" width="{v["width"]}" height="{v["height"]}" loading="lazy" decoding="async"></div></div>')
    else:
        chips = ''.join(f'<li class="pill">{c}</li>' for c in v.get('chips', []))
        visual = (f'<div class="pcard-visual pcard-visual-icon"><img src="{up}{v["src"]}" alt="{v["alt"]}" width="96" height="96" loading="lazy" decoding="async">'
                  f'<ul class="pcard-chips" aria-label="What it includes">{chips}</ul></div>')
    sec = p['secondaryCta']
    ext = sec.get('external', True)
    sec_href = sec['url'] if ext else up + sec['url']
    sec_attrs = ' target="_blank" rel="noopener noreferrer"' if ext else ''
    return f'''<article class="pcard reveal" id="product-{p['slug']}">
                    {visual}
                    <div class="pcard-body">
                        <span class="pill pill-brand pcard-badge">{p['badge']}</span>
                        <h3 class="h3">{p['name']}</h3>
                        <p class="pcard-tagline">{p['tagline']}</p>
                        <p>{p['description']}</p>
                        <p class="small muted">{p['meta']}</p>
                        <div class="btn-row">
                            <a class="btn btn-primary" href="{up}{p['detailPath']}index.html">{p['primaryCta']} {ICON['arrow']}</a>
                            <a class="btn btn-outline" href="{sec_href}"{sec_attrs}>{sec['label']}</a>
                        </div>
                    </div>
                </article>'''

def product_cards(up):
    return '\n                '.join(product_card(p, up) for p in load_products())
