#!/usr/bin/env node
// Static consistency checks. Run from repo root: node scripts/check-site.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const skip = new Set(['website-backup', 'node_modules', '.git', 'memory-bank', 'docs']);
const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(root);

// Load config
const ctx = { window: {}, document: { readyState: 'complete', querySelectorAll: () => [] } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/site-config.js'), 'utf8'), ctx);
const CFG = ctx.window.LearnTAVConfig;
const allowed = new Set([CFG.pricing.group.total, CFG.pricing.private.total]);

let errors = 0;
const err = (f, m) => { errors++; console.error(`✗ ${path.relative(root, f)}: ${m}`); };

const banned = [/googletagmanager|google-analytics|gtag\(/i, /\bG-[A-Z0-9]{8,}\b/, /tinyurl/i, /data-track/, /Group size to be confirmed/i, /\$10\s*(\/|a |per )\s*month/i, /Trophy Case Pro/i, /available (on|in) the (Apple )?App Store/i, /on Google Play/i, /G-XXXXXXXX/, /hundreds of (students|learners)/i, /95% of/i, /Sarah Chen|Michael Rodriguez|Kevin Liu/, /over 1,000 professionals/i, /\$100\b|\$200\b/, /guaranteed/i];
const priceRe = /\$(\d{2,4})\b/g;

for (const f of htmlFiles) {
  const rel = path.relative(root, f);
  const html = fs.readFileSync(f, 'utf8');

  // links
  for (const m of html.matchAll(/\s(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(u)) continue;
    let target = path.resolve(path.dirname(f), u);
    if (!fs.existsSync(target)) err(f, `broken link ${u}`);
    else if (fs.statSync(target).isDirectory() && !fs.existsSync(path.join(target, 'index.html'))) err(f, `dir without index ${u}`);
  }

  for (const b of banned) if (b.test(html)) err(f, `banned/unsupported phrase ${b}`);

  // prices (skip blog article stats)
  if (!rel.startsWith('resources/blog/')) {
    for (const m of html.matchAll(priceRe)) {
      if (!allowed.has(Number(m[1]))) err(f, `unexpected price $${m[1]}`);
    }
  }

  // group size must match config everywhere it is written
  for (const m of html.matchAll(/up to (\d+) students/gi)) {
    if (Number(m[1]) !== CFG.pricing.group.size) err(f, `group size ${m[1]} != config ${CFG.pricing.group.size}`);
  }
  for (const m of html.matchAll(/data-cfg="pricing\.group\.size"[^>]*>([^<]*)</g)) {
    const expect = `Up to ${CFG.pricing.group.size} students`;
    if (m[1].trim() !== expect) err(f, `static group size "${m[1]}" != "${expect}"`);
  }
  // external product links must be the verified ones
  for (const m of html.matchAll(/href="(https:\/\/chromewebstore[^"]*)"/g)) {
    if (m[1] !== 'https://chromewebstore.google.com/detail/ecoprompt/plmljdpofjiehkgfchbadaidahedooid') err(f, `unexpected store URL ${m[1]}`);
  }
  for (const m of html.matchAll(/href="(https:\/\/trophy-case[^"]*)"/g)) {
    const ok = ['https://trophy-case-trophy-case.vercel.app', 'https://trophy-case-trophy-case.vercel.app/privacy.html'];
    if (!ok.includes(m[1])) err(f, `unexpected Trophy Case URL ${m[1]}`);
  }

  // data-cfg static fallbacks must match config
  for (const m of html.matchAll(/data-cfg="pricing\.(group|private)\.total"[^>]*>([^<]*)</g)) {
    const expect = CFG.pricing.symbol + CFG.pricing[m[1]].total;
    if (m[2].trim() !== expect) err(f, `static ${m[2]} != config ${expect}`);
  }
}

// Analytics stays off: no config, no tracking scripts anywhere.
if (CFG.analytics) err(path.join(root, 'assets/js/site-config.js'), 'analytics config present; analytics must stay disabled');
if (CFG.enrollment.paymentEnabled) err(path.join(root, 'assets/js/site-config.js'), 'paymentEnabled must stay false');

// Sitemap entries exist
const sm = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const m of sm.matchAll(/<loc>https:\/\/learntav\.com\/([^<]*)<\/loc>/g)) {
  const p = m[1] === '' ? 'index.html' : (m[1].endsWith('/') ? m[1] + 'index.html' : m[1]);
  if (!fs.existsSync(path.join(root, p))) err(path.join(root, 'sitemap.xml'), `missing page ${m[1]}`);
}

console.log(`${htmlFiles.length} pages checked, ${errors} problem(s).`);
process.exit(errors ? 1 : 0);
