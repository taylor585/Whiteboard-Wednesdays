// Verifies the Vision Boards deck (id: vision-boards).
// Usage: python3 -m http.server 8862 --directory public & node verify-vb.cjs [baseUrl]
// Optional: VISION_BOARD_SKILL=/path/to/vision-board checks every on-slide quotation verbatim against the skill.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'public/vb-content.js'),'utf8'),ctx);
const deck=ctx.window.WW,base=process.argv[2]||'http://127.0.0.1:8862/',shots=process.env.VB_SHOTS||'';
const results=[],errors=[];const check=(v,msg)=>{if(!v)throw Error('FAILED: '+msg);results.push(msg);};
// Content gate
const ids=deck.slides.map(s=>s.id);check(new Set(ids).size===ids.length,'slide IDs are unique');
for(const s of deck.slides){
 check(s.parts.length===s.reveals.length,s.id+': one reveal per part');
 const groups=[...new Set(s.reveals)].sort((a,b)=>a-b);check(groups[0]===1&&groups.every((g,i)=>g===i+1),s.id+': reveal groups start at 1 and are contiguous');
 check(s.source&&s.note,s.id+': has an audience source line and presenter notes');
 check(!/[—]|\s--\s/.test([s.title,s.source,s.note,...s.parts].join(' ').replace(/<pre[\s\S]*?<\/pre>/g,'')),s.id+': no em dashes or double dashes in prose');
}
const kinds=deck.slides.map(s=>s.kind);kinds.slice(1).forEach((k,i)=>check(k!==kinds[i],'variety: '+deck.slides[i].id+' and '+deck.slides[i+1].id+' use different devices'));
check(new Set(kinds).size>=3,'deck uses at least three devices');
const quotes=deck.slides.flatMap(s=>s.parts.join('').match(/<blockquote>“([^”]+)”<\/blockquote>/g)||[]).map(q=>q.slice(13,-14));
if(process.env.VISION_BOARD_SKILL){
 const dir=process.env.VISION_BOARD_SKILL,norm=t=>t.replace(/\s+/g,'');
 const text=norm([path.join(dir,'SKILL.md'),...fs.readdirSync(path.join(dir,'references')).map(f=>path.join(dir,'references',f))].map(f=>fs.readFileSync(f,'utf8')).join('\n'));
 quotes.forEach(q=>check(text.includes(norm(q)),'quotation verbatim in skill: '+q.slice(0,50)));
}else console.log('NOTE: set VISION_BOARD_SKILL to verify',quotes.length,'quotations against the skill.');
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const watch=page=>{page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
 for(const width of (process.env.VB_WIDTHS||'375,390,768,1280').split(',').map(Number)){
  const context=await browser.newContext({viewport:{width,height:width<700?800:900}});const page=await context.newPage();watch(page);page.setDefaultTimeout(10000);
  await page.goto(base+'#/library');await page.locator('.deck-card').first().waitFor();
  check(await page.locator('.deck-card').count()===3,width+': library shows all three decks');
  check(await page.locator('.deck-card img[src="vb-cover.svg"]').evaluate(i=>i.complete&&i.naturalWidth>0),width+': cover renders');
  for(const s of deck.slides){
   await page.goto(base+'#/presentation/vision-boards/slide/'+s.id);await page.locator('#player').waitFor({state:'visible'});
   await page.waitForFunction(id=>location.hash.endsWith('/slide/'+id),s.id);
   await page.evaluate(()=>document.fonts.ready);
   const max=Math.max(...s.reveals);
   for(let i=0;i<max;i++)await page.locator('#next').click();
   check((await page.locator('#progress').textContent()).includes('complete'),width+' '+s.id+': all reveals shown');
   await page.waitForTimeout(s.kind==='vb-chaos'||s.kind==='vb-loop'?6000:950);
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' '+s.id+': no horizontal overflow');
   check(await page.locator('#canvas .asset-error').count()===0,width+' '+s.id+': no asset errors');
   check(await page.locator('#canvas .part.pending').count()===0,width+' '+s.id+': nothing left hidden');
   if(shots){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(shots,width+'-'+String(deck.slides.indexOf(s)+1).padStart(2,'0')+'-'+s.id+'.png'),fullPage:true});}
  }
  await context.close();
 }
 // Fresh-context direct link, back/forward, missing slide, regression on other decks
 {const context=await browser.newContext();const page=await context.newPage();watch(page);
  await page.goto(base+'#/presentation/vision-boards/slide/three-motions');await page.locator('#canvas h2').waitFor();
  check((await page.locator('#canvas h2').textContent())==='Three kinds of motion','direct slide link works in a fresh session');
  check(await page.locator('#tab-vision-boards').getAttribute('aria-selected')==='true','vision-boards tab is active');
  await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();
  await page.waitForFunction(()=>location.hash.endsWith('/inspect-it'));await page.goBack();await page.waitForFunction(()=>location.hash.endsWith('/three-motions'));
  check(true,'browser Back returns to the previous slide');
  await page.goto(base+'#/presentation/vision-boards/slide/nope');await page.locator('#message').waitFor({state:'visible'});
  check((await page.locator('#message-title').textContent())==='Slide not found','missing slide shows recovery');
  for(const [deckId,title] of [['paid-ads-process',null],['lead-gen-engine',null]]){await page.goto(base+'#/presentation/'+deckId);await page.waitForFunction(id=>document.getElementById('tab-'+id)?.getAttribute('aria-selected')==='true'&&!document.getElementById('player').hidden,deckId);check(await page.locator('#canvas h2').count()===1,'regression: '+deckId+' still opens');}
  await page.goto(base+'#/presentation/vision-boards/slide/live-board');await page.locator('#canvas h2').waitFor();
  check(await page.locator('#deck-logo').getAttribute('src')==='ww-coin.svg','published brand logo is the official coin');
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.locator('#next').click();await page.locator('#next').click();
  await page.locator('[data-vb-copy="vb-kickoff"]').click();await page.waitForFunction(()=>document.querySelector('.vb-copy-status').textContent.length>0);
  check((await page.locator('.vb-copy-status').first().textContent()).startsWith('Prompt copied'),'kickoff prompt copy button works');
  check((await page.locator('#progress').textContent()).includes('reveal 2'),'copy button click does not advance the slide');
  // live motion scene
  await page.goto(base+'#/presentation/vision-boards/slide/inspect-it');await page.locator('#canvas h2').waitFor();await page.locator('#next').click();await page.locator('#next').click();
  const frame=page.frameLocator('#canvas iframe.vb-demo-frame');await frame.locator('[data-vb-play]').waitFor();
  const handle=await page.locator('#canvas iframe.vb-demo-frame').elementHandle();const f=await handle.contentFrame();
  await f.waitForFunction(()=>window.__vb&&true);
  const sample=()=>f.evaluate(()=>[getComputedStyle(document.getElementById('ticket')).opacity,getComputedStyle(document.getElementById('camera')).transform,document.getElementById('typed').textContent,document.getElementById('phase').textContent].join('|'));
  await f.evaluate(()=>window.__vb.seek(5600));const a=await sample();await f.evaluate(()=>window.__vb.seek(1200));const b=await sample();await f.evaluate(()=>window.__vb.seek(5600));const c=await sample();
  check(a===c&&a!==b,'motion scene: seeking forwards, backwards and forwards gives the same frame');
  await frame.locator('[data-vb-play]').click();await page.waitForTimeout(600);check(await f.evaluate(()=>window.__vb.time>5600),'motion scene: Play advances the timeline');
  await frame.locator('#reduce').click();await page.waitForTimeout(300);
  check((await frame.locator('[data-vb-time]').textContent())==='Static view','motion scene: Reduced view shows the static endpoint');
  check(await f.evaluate(()=>getComputedStyle(document.getElementById('ticket')).opacity==='1'&&document.getElementById('typed').textContent.length>60),'motion scene: reduced endpoint shows the ticket and full text');
  check((await page.locator('#progress').textContent()).includes('reveal 2'),'interacting with the scene does not advance the slide');
  await page.locator('#back').click();check(await page.locator('#canvas iframe.vb-demo-frame').getAttribute('src')==='about:blank','hiding the reveal unloads the scene');
  await context.close();}
 // Reduced motion and reading view
 {const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();watch(page);
  await page.goto(base+'#/presentation/vision-boards/slide/what-we-fix');await page.locator('#canvas h2').waitFor();
  check(await page.locator('#canvas .part.pending').count()===0,'reduced motion shows every part at once');
  check((await page.locator('#canvas .vb-num').evaluateAll(es=>es.map(e=>getComputedStyle(e).getPropertyValue('--n').trim()).join(',')))==='5,31,15,2','reduced motion shows final counts');
  await page.goto(base+'vb-reading.html');const parts=deck.slides.reduce((n,s)=>n+s.parts.length,0);
  check(await page.locator('.vb-reading .part').count()===parts,'reading view contains all '+parts+' parts');
  check(await page.locator('.vb-reading article').count()===deck.slides.length,'reading view contains every slide');
  await context.close();}
 await browser.close();
 const real=errors.filter(e=>!/favicon|api\/ideas|Failed to load resource/.test(e));
 check(real.length===0,'no runtime errors'+(real.length?': '+real.join(' | '):''));
 console.log(results.length+' checks passed');
}
run().catch(e=>{console.error(e.message);console.error('runtime errors:',errors.join(' | '));process.exit(1);});
