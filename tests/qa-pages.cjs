// Page-level QA: console errors, failed requests, overflow, broken images,
// alt text, reduced-motion visibility, keyboard focus, 404 on same-origin assets.
// Usage: serve the repo (python3 -m http.server 8765) then
//   PLAYWRIGHT_PATH=/path/to/node_modules/playwright node tests/qa-pages.cjs
const { chromium, devices } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('fs'), path = require('path');
const BASE = 'http://localhost:8765';
const pages = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { if (['website-backup','node_modules','.git','docs','tests','scripts','memory-bank','data'].includes(e.name)) continue; const p=path.join(d,e.name); if(e.isDirectory()) walk(p); else if(e.name.endsWith('.html')) pages.push('/'+p.replace(/index\.html$/,'')); } })('.');
let bad = 0; const fail = (m)=>{ bad++; console.log('  ✗', m); };
(async () => {
  const b = await chromium.launch();
  for (const [name, opts] of [['desktop',{viewport:{width:1280,height:900}}],['iphone',devices['iPhone 14']],['reduced-motion',{viewport:{width:1280,height:900},reducedMotion:'reduce'}]]) {
    const c = await b.newContext(opts); const p = await c.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push('pageerror '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('console '+m.text()); });
    p.on('response',r=>{ if(r.url().startsWith(BASE) && r.status()>=400) errs.push(r.status()+' '+r.url()); });
    for (const u of pages) {
      errs.length=0;
      await p.goto(BASE+u, {waitUntil:'load'}); await p.waitForTimeout(350);
      // ignore third-party (fonts) failures offline; flag everything else
      const real = errs.filter(e=>!/fonts\.g/.test(e));
      if (real.length) fail(`${name} ${u}: ${real.join(' | ')}`);
      const r = await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
        noalt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,
        broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length,
        h1:document.querySelectorAll('h1').length,
        hidden: name==='reduced-motion' ? [...document.querySelectorAll('.reveal,.animate-on-scroll,.service-card,.feature')].filter(e=>getComputedStyle(e).opacity==='0').length : 0}));
      if (r.sw>r.cw+1) fail(`${name} ${u}: horizontal overflow ${r.sw}>${r.cw}`);
      if (r.noalt) fail(`${name} ${u}: ${r.noalt} img without alt`);
      if (r.broken) fail(`${name} ${u}: ${r.broken} broken img`);
      if (name==='desktop' && r.h1!==1 && !/prompt-energy-optimizer|^\/privacy/.test(u)) fail(`${u}: ${r.h1} h1`);
      if (r.hidden) fail(`${name} ${u}: ${r.hidden} elements invisible under reduced motion`);
    }
    console.log(name, 'checked', pages.length, 'pages'); await c.close();
  }
  // keyboard: skip link first, then nav; dropdown reachable and operable
  const c = await b.newContext({viewport:{width:1280,height:900}}); const p = await c.newPage(); await p.goto(BASE+'/');
  await p.keyboard.press('Tab'); const first = await p.evaluate(()=>document.activeElement.className); if(!/skip-link/.test(first)) fail('first Tab stop is not the skip link: '+first); else console.log('  ✓ skip link is first tab stop');
  for (let i=0;i<4;i++) await p.keyboard.press('Tab');
  const ae = await p.evaluate(()=>document.activeElement.className); console.log('  focus after 4 more tabs:', ae.split(' ')[0]);
  await p.focus('.nav-menu-btn'); await p.keyboard.press('Enter'); if(!(await p.locator('#productsMenu').isVisible())) fail('Products dropdown does not open with Enter'); else console.log('  ✓ Products dropdown opens with keyboard');
  await p.keyboard.press('Tab'); const inMenu = await p.evaluate(()=>document.activeElement.closest('#productsMenu')!==null); if(!inMenu) fail('Tab does not move into dropdown'); else console.log('  ✓ Tab moves into dropdown links');
  await p.keyboard.press('Escape'); if(await p.locator('#productsMenu').isVisible()) fail('Esc does not close dropdown'); else console.log('  ✓ Esc closes dropdown');
  // focus visible on form control
  await p.goto(BASE+'/enroll/'); await p.focus('#f-name'); const outline = await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle); if(outline==='none') fail('no focus outline on form field'); else console.log('  ✓ form field shows focus outline');
  // form labels
  const unlabeled = await p.evaluate(()=>[...document.querySelectorAll('#enrollForm input:not([type=hidden]):not([name=_gotcha]), #enrollForm select, #enrollForm textarea')].filter(e=>!e.labels||!e.labels.length).map(e=>e.name)); if(unlabeled.length) fail('unlabeled fields: '+unlabeled); else console.log('  ✓ every enrollment field has a label');
  await b.close(); console.log(bad? `\n${bad} issue(s)`:'\nall page QA checks passed'); process.exit(bad?1:0);
})();
