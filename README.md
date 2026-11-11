# LearnTAV website

Static site (plain HTML/CSS/JS, no build required to serve). Live at https://learntav.com.

## Preview
```
python3 -m http.server 8000     # then open http://localhost:8000
```

## Structure
- `index.html`, `education/`, `pricing/`, `enroll/`, `products/`, `consulting/`, `ai-tools/`, `resources/`, `about/`, `contact/`, `legal/`
- `assets/css/` tokens.css (brand tokens), modern.css (base), product.css (product-style components)
- `assets/js/` layout.js (shared header/footer), site-config.js (prices, course, enrollment settings), enroll.js, product-page.js, modern.js
- `data/products.json`: product list used by the home page and `/products/`
- `scripts/build/`: generators for the generated pages (`python3 scripts/build/build_all.py`)
- `scripts/check-site.mjs`: links, prices, group size, banned claims, sitemap
- `tests/`: browser tests (need Playwright). `docs/`: plan and audit notes

## Settings you may change (`assets/js/site-config.js`)
Prices, group size, the Formspree endpoint and the fallback Google Form. After editing a price or size, update the matching text in the HTML (or re-run the generators) and run `node scripts/check-site.mjs`.

## Rules we follow
No analytics, no payments on the site, no unverified testimonials or statistics. See `docs/AUDIT-NOTES.md`.

## Deploy
Static hosting from `main` (see CNAME). Commit and push only after review.
