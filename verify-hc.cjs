// Browser checks for the AI Harnesses deck. Serve public/ first, e.g. python3 -m http.server 8862 --directory public
// Usage: node verify-hc.cjs [baseUrl]   (QA_OUTPUT sets the screenshot folder)
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const out=process.env.QA_OUTPUT||'/tmp';
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/public/hc-content.js','utf8'),ctx);const deck=ctx.window.WW;
const reg={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/public/presentations.js','utf8'),reg);const register=reg.window.presentationRegister;
let checks=0;const ok=(v,label)=>{assert(v,label);checks++;};
const base=process.argv[2]||'http://127.0.0.1:8862/';const id='ai-harnesses';
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const c=await b.newContext();const p=await c.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!new URL(r.url()).pathname.startsWith('/api/'))errors.push(r.status()+' '+r.url())});// /api/ideas needs the full server, not the static preview
 const go=async s=>{await p.goto(base+'#/presentation/'+id+'/slide/'+s);await p.locator('#player').waitFor({state:'visible'});await p.evaluate(()=>document.fonts.ready);};
 for(const w of [375,390,768,1280]){
  await p.setViewportSize({width:w,height:900});await p.goto(base);await p.locator('.deck-card').first().waitFor();
  ok(await p.locator('.deck-card').count()===register.length,'library lists every registered deck '+w);
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'library overflow '+w);
  for(const s of deck.slides){
   await go(s.id);await p.locator('#replay').click();
   ok((await p.locator('#canvas h2').innerText())===s.title,'title '+s.id);
   ok((await p.locator('#canvas .source-note').innerText())===s.source,'source line, not notes '+s.id);
   for(let n=1;n<=Math.max(...s.reveals);n++){await p.locator('#next').click();ok(await p.locator('#canvas .part.revealed').count()===s.reveals.filter(x=>x<=n).length,'reveal '+s.id+' '+n);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+s.id+' '+n+' '+w);}
   ok(await p.locator('#canvas .asset-error').count()===0,'no asset errors '+s.id);
   const clipped=await p.evaluate(()=>[...document.querySelectorAll('#canvas .part *')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>innerWidth+1||r.left<-1)&&!e.closest('pre')}).map(e=>e.className||e.tagName).slice(0,3));
   ok(clipped.length===0,'nothing outside viewport '+s.id+' '+w+' '+clipped.join(','));
   if(w===1280||w===390){await p.waitForTimeout(900);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:out+'/hc '+String(deck.slides.indexOf(s)+1).padStart(2,'0')+' '+s.id+' '+w+'.png',fullPage:true});}
  }
 }
 await p.setViewportSize({width:1280,height:900});
 // keyboard, canvas click, back, replay, notes
 await go('done-gate');await p.locator('#replay').click();await p.locator('#canvas').click({position:{x:5,y:5}});ok(await p.locator('#canvas .part.revealed').count()===1,'canvas click reveals');
 await p.keyboard.press('ArrowRight');ok(await p.locator('#canvas .part.revealed').count()===2,'keyboard reveals');
 await p.locator('#back').click();ok(await p.locator('#canvas .part.revealed').count()===1,'back reverses');
 await p.locator('#notes-button').click();ok((await p.locator('#notes').innerText()).includes('a script, not the AI'),'presenter notes panel');
 // selecting text in a prompt does not advance
 await go('app-prompts');await p.locator('#replay').click();await p.locator('#next').click();await p.locator('.hc-promptbox pre').first().selectText();await p.locator('.hc-promptbox pre').first().click();ok(await p.locator('#canvas .part.revealed').count()===1,'selected prompt text does not advance');
 // V1.1 expanders: opening one never advances the slide; the reading view shows them open
 await go('interrupter');await p.locator('#replay').click();for(let i=0;i<3;i++)await p.locator('#next').click();await p.locator('#canvas .hc-more summary').click();ok(await p.locator('#canvas .hc-more').evaluate(e=>e.open),'expander opens');ok(p.url().endsWith('/interrupter'),'expander click does not advance');ok(await p.locator('#canvas .hc-more summary').evaluate(e=>e.getBoundingClientRect().height>=44),'expander target at least 44px');
 // reveal-linked device states
 await go('kickoff');await p.locator('#replay').click();await p.locator('#next').click();ok(await p.locator('.hc-t').first().evaluate(e=>getComputedStyle(e,'::after').opacity)==='0','ticks hidden before their reveal');await p.locator('#next').click();await p.waitForTimeout(260);ok(await p.locator('.hc-t').first().evaluate(e=>getComputedStyle(e,'::after').opacity)==='1','ticks shown on reveal 2');
 await go('contract');await p.locator('#replay').click();await p.locator('#next').click();ok(await p.locator('.hc-stamp').evaluate(e=>getComputedStyle(e).opacity)==='0','stamp waits for Active');
 // counts land on real figures
 await go('five-failures');await p.locator('#replay').click();for(let i=0;i<6;i++)await p.locator('#next').click();await p.waitForTimeout(950);ok(await p.locator('.hc-count').first().evaluate(e=>getComputedStyle(e).getPropertyValue('--hc-n').trim())==='58','count reaches 58');
 // fullscreen survives slide change and exit keeps position
 await go('loop-driver');await p.locator('#fullscreen').click();await p.locator('#next').click();for(let i=0;i<4;i++)await p.locator('#next').click();ok(await p.locator('body').evaluate(e=>e.classList.contains('presentation')),'full-window survives slide change');await p.locator('#exit-presentation').click();ok(p.url().endsWith('/final-report'),'position kept after exit');
 // direct link in a fresh context, refresh, history
 const fresh=await b.newContext();const f=await fresh.newPage();await f.goto(base+'#/presentation/'+id+'/slide/harbour-hearth');await f.locator('#player').waitFor({state:'visible'});ok((await f.locator('#canvas h2').innerText())==='Harbour & Hearth','fresh direct link');await f.reload();await f.locator('#player').waitFor({state:'visible'});ok((await f.locator('#canvas h2').innerText())==='Harbour & Hearth','refresh keeps slide');
 await f.locator('#next').click();await f.locator('#next').click();await f.locator('#next').click();await f.locator('#next').click();await f.waitForURL('**/hh-locks');await f.goBack();await f.waitForURL('**/harbour-hearth');ok((await f.locator('#canvas h2').innerText())==='Harbour & Hearth','browser Back');await f.goForward();await f.waitForURL('**/hh-locks');ok((await f.locator('#canvas h2').innerText())==='Locks and bindings','browser Forward');
 await f.goto(base+'#/presentation/'+id+'/slide/no-such-slide');await f.locator('#message').waitFor({state:'visible'});ok((await f.locator('#message-title').innerText())==='Slide not found','missing slide recovery');await fresh.close();
 // isolated state across decks and tab keyboard
 await go('drifter');await p.locator('#replay').click();await p.locator('#next').click();await p.locator('#next').click();
 await p.locator('#tab-lead-gen-engine').click();await p.waitForFunction(()=>document.documentElement.dataset.deckFont==='lge');ok((await p.locator('#brand-name').textContent())==='Lead Gen Engine','other deck brand');
 await p.locator('#tab-ai-harnesses').click();await p.waitForURL('**/drifter');await p.waitForFunction(()=>document.documentElement.dataset.deckFont==='hand');ok(await p.locator('#canvas .part.revealed').count()===2,'deck position isolated and restored');ok((await p.locator('#brand-name').textContent())==='Pecuna Factorem','published brand restored');ok((await p.locator('#deck-logo').getAttribute('src'))==='ww-coin.svg','official logo');
 const progress=await p.locator('#progress').textContent();await p.locator('#tab-ai-harnesses').focus();await p.keyboard.press('ArrowLeft');await p.keyboard.press('ArrowRight');ok(await p.locator('#progress').textContent()===progress,'tab arrows do not advance slide');
 // browser-only brand preview never persists
 await p.locator('#brand-button').click();await p.locator('#brand-form [name=name]').fill('Preview only');await p.locator('#brand-form button[type=submit]').click();ok(!(await p.locator('#brand-preview').isHidden()),'preview labelled');await p.goto(base+'#/presentation/'+id+'/slide/drifter');await p.reload();await p.locator('#player').waitFor({state:'visible'});ok((await p.locator('#brand-name').textContent())==='Pecuna Factorem','preview not saved after reload');
 // reduced motion
 await p.emulateMedia({reducedMotion:'reduce'});for(const s of ['kickoff','five-locks','recap']){await go(s);ok(await p.locator('#canvas .part.pending').count()===0,'reduced motion shows everything '+s);}
 ok(await p.locator('.hc-strike').first().evaluate(e=>getComputedStyle(e,'::after').animationName)==='none','reduced motion: no strike animation');await p.emulateMedia({reducedMotion:'no-preference'});
 // reading view
 for(const w of [375,390,768,1280]){await p.setViewportSize({width:w,height:900});await p.goto(base+'hc-reading.html');ok(await p.locator('article').count()===deck.slides.length+1,'reading view complete '+w);ok(await p.locator('.part').count()===deck.slides.reduce((n,s)=>n+s.parts.length,0),'reading part count '+w);ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'reading overflow '+w);ok(await p.locator('details.hc-more:not([open])').count()===0,'reading view expanders open '+w);if(w===1280)ok(await p.locator('.hc-t').first().evaluate(e=>getComputedStyle(e,'::after').opacity)==='1','reading view shows device end state');}
 ok(errors.length===0,errors.join('\n'));await b.close();
 console.log(JSON.stringify({passed:checks,slides:deck.slides.length,widths:[375,390,768,1280],errors}));
})().catch(e=>{console.error(e.message);process.exit(1)});
