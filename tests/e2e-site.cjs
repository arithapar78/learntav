const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE='http://localhost:8765';
let pass=0, fail=0;
const ok=(c,m)=>{ if(c){pass++;console.log('  ✓',m)} else {fail++;console.log('  ✗ FAIL',m)} };
async function fill(p){
  await p.fill('#f-name','Ada Lovelace'); await p.fill('#f-email','ada@example.com');
  await p.selectOption('#f-age','15 - 18'); await p.selectOption('#f-exp','None');
  await p.fill('#f-avail','Weekday evenings'); await p.fill('#f-goal','A plant app');
  await p.check('#f-ack');
}
(async()=>{
  const b=await chromium.launch();
  // 1 no endpoint
  console.log('0. shipped config'); { const c0=await b.newContext(); const p0=await c0.newPage(); await p0.goto(BASE+'/enroll/'); await p0.waitForTimeout(300); ok(await p0.evaluate(()=>LearnTAVConfig.enrollment.endpoint)==='https://formspree.io/f/xppdzpwn','endpoint is the Formspree form'); ok(!(await p0.locator('#endpointNotice').isVisible()),'no not-live notice when endpoint set'); ok((await p0.evaluate(()=>LearnTAVConfig.enrollment.fallbackFormUrl)).includes('1FAIpQLSfBJwP5hFVhluQdWbiBJy0xx3wj0n9r7iOTfJajNcQshGFYIA'),'fallback Google Form kept'); ok(await p0.evaluate(()=>LearnTAVConfig.enrollment.paymentEnabled)===false,'payments disabled'); await c0.close(); }
  console.log('1. no endpoint configured');
  let c=await b.newContext(); let p=await c.newPage();
  await p.addInitScript(()=>{}); await p.route('**/assets/js/site-config.js', async r=>{ const res=await r.fetch(); r.fulfill({response:res,body:(await res.text()).replace(/endpoint: '[^']*'/,"endpoint: ''")}); }); await p.goto(BASE+'/enroll/?plan=private'); await p.waitForTimeout(300);
  ok(await p.locator('#endpointNotice').isVisible(),'not-live notice shown up front');
  ok((await p.getAttribute('#fallbackLink1','href')).includes('1FAIpQLSfBJwP5hFVhluQdWbiBJy0xx3wj0n9r7iOTfJajNcQshGFYIA'),'fallback link is the Google Form');
  ok(await p.locator('#sumTotal').innerText()==='$199' && await p.locator('#sumSize').innerText()==='One-on-one','private preselect: $199, one-on-one');
  await p.check('input[value=group]'); ok(await p.locator('#sumTotal').innerText()==='$99' && await p.locator('#sumSize').innerText()==='Up to 5 students','group: $99, up to 5 students');
  await fill(p); await p.click('#submitBtn'); await p.waitForTimeout(300);
  ok((await p.locator('#formStatus').getAttribute('class')).includes('error'),'error shown (no silent success)');
  ok((await p.locator('#formStatus').innerText()).includes('Nothing was sent'),'says nothing was sent');
  ok(await p.inputValue('#f-name')==='Ada Lovelace','answers preserved');
  ok(!(await p.locator('#submitBtn').isDisabled()),'button re-enabled');
  await c.close();

  // validation
  console.log('2. validation');
  c=await b.newContext(); p=await c.newPage(); await p.route('https://formspree.io/**',r=>r.abort()); await p.goto(BASE+'/enroll/'); 
  await p.click('#submitBtn'); await p.waitForTimeout(200);
  const vis=await p.$$eval('.field-error',els=>els.filter(e=>!e.hidden).map(e=>e.id));
  ok(['err-name','err-email','err-age','err-experience','err-availability','err-ack'].every(x=>vis.includes(x)),'required errors: '+vis.join(','));
  ok(await p.evaluate(()=>document.activeElement.id)==='f-name','focus moves to first invalid field');
  await p.fill('#f-email','nope'); await p.click('#submitBtn'); ok((await p.innerText('#err-email')).includes('doesn'),'bad email message');
  await p.fill('#f-start','2020-01-01'); await p.click('#submitBtn'); ok(await p.locator('#err-startDate').isVisible(),'past start date rejected');
  ok(await p.getAttribute('#f-name','aria-invalid')==='true','aria-invalid set');
  await c.close();

  // endpoint scenarios
  async function withEndpoint(handler){
    const c=await b.newContext(); const p=await c.newPage(); const reqs=[];
    await p.route('https://formspree.io/f/xppdzpwn', async r=>{ reqs.push(JSON.parse(r.request().postData()||'{}')); await handler(r,reqs.length); });
    await p.goto(BASE+'/enroll/'); 
    return {c,p,reqs};
  }
  console.log('3. success path');
  let t=await withEndpoint(r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
  await fill(t.p); await t.p.fill('#f-start','2099-01-05'); await t.p.click('#submitBtn'); await t.p.waitForTimeout(400);
  ok((await t.p.locator('#formStatus').getAttribute('class')).includes('success'),'success panel');
  const txt=await t.p.innerText('#formStatus'); ok(/LT-[A-Z0-9]{6}/.test(txt) && txt.includes('ada@example.com') && txt.includes('not yet a confirmed booking'),'confirmation shows reference, email, inquiry-not-booking');
  ok(await t.p.locator('#submitBtn').isDisabled(),'submit locked after success');
  await t.p.evaluate(()=>document.getElementById('enrollForm').requestSubmit()); await t.p.waitForTimeout(200);
  ok(t.reqs.length===1,'duplicate submit blocked (1 request)');
  const body=t.reqs[0]; ok(body.name==='Ada Lovelace'&&body.plan==='Group'&&body.totalPerStudent==='$99'&&body.classSize==='Up to 5 students'&&body.ageRange==='15 - 18'&&body.preferredStartDate==='2099-01-05'&&body.timezone&&body.availability&&body.projectGoals==='A plant app'&&body._replyto==='ada@example.com'&&/^LT-/.test(body.reference),'payload has all fields');
  await t.c.close();

  console.log('4. server error then retry');
  let n=0; t=await withEndpoint(r=>{ n++; return n===1?r.fulfill({status:500,contentType:'application/json',body:'{"error":"Server exploded"}'}):r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}); });
  await fill(t.p); await t.p.click('#submitBtn'); await t.p.waitForTimeout(400);
  ok((await t.p.locator('#formStatus').getAttribute('class')).includes('error') && (await t.p.innerText('#formStatus')).includes('Server exploded'),'500 shows error with message');
  ok(!(await t.p.locator('#submitBtn').isDisabled()),'button re-enabled after failure');
  await t.p.click('#retryBtn'); await t.p.waitForTimeout(400);
  ok((await t.p.locator('#formStatus').getAttribute('class')).includes('success'),'retry succeeds'); await t.c.close();

  console.log('5. 200 with error body / network failure');
  t=await withEndpoint(r=>r.fulfill({status:200,contentType:'application/json',body:'{"error":"Form not found"}'}));
  await fill(t.p); await t.p.click('#submitBtn'); await t.p.waitForTimeout(400);
  ok((await t.p.locator('#formStatus').getAttribute('class')).includes('error'),'2xx with error body treated as failure'); await t.c.close();
  t=await withEndpoint(r=>r.abort('failed'));
  await fill(t.p); await t.p.click('#submitBtn'); await t.p.waitForTimeout(500);
  const e5=await t.p.innerText('#formStatus'); console.log('   [text]',JSON.stringify(e5.slice(0,160))); ok(e5.includes('couldn’t confirm')&&e5.includes('did not get a confirmation'),'network failure: honest "could not confirm" message'); await t.c.close();

  console.log('6. honeypot');
  t=await withEndpoint(r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
  await fill(t.p); await t.p.evaluate(()=>{document.querySelector('[name=_gotcha]').value='spam'}); await t.p.click('#submitBtn'); await t.p.waitForTimeout(300);
  ok(t.reqs.length===0,'bot submission sends nothing'); await t.c.close();

  console.log('7. analytics stays disabled');
  c=await b.newContext(); p=await c.newPage(); const gt=[]; p.on('request',r=>{ if(/googletagmanager|google-analytics|doubleclick/.test(r.url())) gt.push(r.url()); });
  for (const u of ['/','/education/vibe-coding-101/','/products/trophy-case/','/enroll/','/ai-tools/power-tracker/']) { await p.goto(BASE+u); await p.waitForTimeout(400); }
  ok(gt.length===0,'no Google analytics/tag requests on key pages');
  ok(!(await p.locator('#consentBanner').count()) && await p.evaluate(()=>typeof window.gtag==='undefined' && typeof window.dataLayer==='undefined'),'no gtag, dataLayer or consent banner');
  ok((await c.cookies()).length===0,'no cookies set'); await c.close();

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
})().catch(e=>{console.error('ERR',e);process.exit(2)});
