# LearnTAV redesign — audit and plan

## 1. Audit (Phase 1)

**Stack.** Static multi-page site (plain HTML/CSS/JS), served by GitHub Pages (`CNAME` = www.learntav.com). No build step, no package.json. Shared header/footer are injected by `assets/js/layout.js`; styles are `assets/css/tokens.css` (brand tokens, light + dark) imported by `modern.css`. `main.css`, `contact.css`, `responsive-accessibility.css`, `route-protection.css` and `main.js` are only used by the Supabase-era pages (`dashboard/`, `profile/`, `settings/`).

**Forms / integrations.** There is no server. Every "form" is an external Google Form link:
- Vibe Coding 101 enrollment: `forms.gle/53NuP8WamvBh3x716` (fields: name, age bracket, source, what to build, comments — **no email, no group/private choice**).
- Consulting / contact / app-builds / school: other Google Forms.
- `enrollment-handler.js`, `consult-handler.js`, `assets/auth/*`, `database-setup.sql`: dormant Supabase code, not loaded by any marketing page. No payment integration exists. No analytics is configured.
- Tools: EcoPrompt links to the Chrome Web Store; two extension ZIPs in `assets/extensions/`; `power-tracker-school/` is a standalone school landing page.

**Pricing contradictions.** `education/index.html` says "Group ($100) or Private ($200)". The Vibe Coding 101 page shows no price at all.

**Unsupported claims found (all removed or replaced).**
- Home: "Trusted by professionals from Healthcare/Finance/…" strip; three named testimonials (Sarah Chen, Dr. Michael Rodriguez, Kevin Liu) with outcome metrics.
- Consulting + app-builds: the same invented testimonials. Case studies page: "95% Team Adoption" and similar.
- Education: "95% of our students complete…", "Join hundreds of students…".
- Newsletter: "Join over 1,000 professionals", "increased productivity 40%" issue teaser. Blog: "How a Clinic Improved Care with AI" (no article exists).
- Kept: the SecondServe/TiE student story (a real, linked article), team bios, Chrome Web Store link.

**Live site.** Fetching www.learntav.com returned an older deployed version of the homepage (pre-token-system). Debate It's page returned structure only (no CSS), so the reference was applied as direction (product-style nav, UI previews, tight hierarchy), not copied. No headless browser is available to me, so visual QA is by static checks and a local server.

## 2. Plan

| Phase | Work |
|---|---|
| 2 | `assets/js/site-config.js` (single source for pricing, course, enrollment, contact). New nav: Learn · Build · Tools · About · Pricing, CTA *Start Learning*. New footer. `assets/css/product.css` layered on `modern.css` (hero preview, steps, pricing cards, accordion, forms, reveal, reduced-motion). |
| 3 | Homepage rebuilt to the specified section order. Vibe Coding 101 page rebuilt as flagship conversion page. |
| 4 | `/pricing/` and `/enroll/` (inquiry only; no payment). Config-driven price display with static fallbacks; `scripts/check-site.mjs` verifies every price on every page matches config. |
| 5 | Education, Consulting, App Builds, Case Studies, Contact, Resources, Newsletter, Blog, About cleaned and aligned; fake social proof removed. |
| 6 | Link checker, price checker, sitemap/canonical, accessibility spot checks, README/deploy notes. |

## 3. Decisions that need the business
- **Enrollment** posts to Formspree (`site-config.js → enrollment.endpoint`); the Google Form is the fallback.
- **Group size** is 5 (config). Analytics: none, by decision. See `docs/AUDIT-NOTES.md` for accuracy findings.

## 4. Preview, test, deploy
- Regenerate generated pages (home, course, pricing, enroll, education, products, Trophy Case): `python3 scripts/build/build_all.py`. Products come from `data/products.json`.
- Preview: `python3 -m http.server 8000` in the repo root, open http://localhost:8000.
- Test: `node scripts/check-site.mjs` (broken links, price consistency with `assets/js/site-config.js`, banned/unsupported claims, sitemap targets).
- Changing a price: edit `assets/js/site-config.js`, then update the matching static fallback text (`$99`/`$199`) in HTML and re-run the check. It tells you which files disagree.
- Tests: serve the site, then `PLAYWRIGHT_PATH=<path to playwright> node tests/e2e-site.cjs` (enrollment + analytics-off) and `node tests/qa-pages.cjs` (console errors, overflow, alt text, keyboard, reduced motion).
- Deploy: GitHub Pages from `main` (CNAME present). Not deployed by this work; commit and push only when you approve.

## 5. Adding a third product
1. Add an object to `data/products.json` (same fields as the existing two; `visual.type` is `phone` or `icon`).
2. Copy `trophy_case()` in `scripts/build/pages_products.py` to a new function for its detail page (or hand-write `products/<slug>/index.html`), call it from `build_all.py`.
3. Add the slug to the nav `children` list and footer column in `assets/js/layout.js`, add the URL to `sitemap.xml`, run `python3 scripts/build/build_all.py` then `node scripts/check-site.mjs`.
The home page and `/products/` pick up the new card automatically.
