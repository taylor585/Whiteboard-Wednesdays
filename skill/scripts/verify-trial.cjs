#!/usr/bin/env node
// Whiteboard Wednesdays trial verifier v2.0 (Playwright + Chromium).
// Usage: node verify-trial.cjs <deck-spec.cjs> <page-url> [--dist DIR]
// Set PLAYWRIGHT_PATH if playwright is not resolvable, QA_OUTPUT for screenshots, CHROMIUM_PATH for a specific browser.
// Covers: every reveal at 375/390/768/1280px with no horizontal overflow; expected images decoded (counted from the
// slide HTML) and no asset-error fallback; audience source lines; navigation, keyboard, history, fullscreen, notes,
// missing-slide recovery; reduced motion; the reading view; each device present in the deck; the recording tools.
// Screenshots are taken only after fonts load and every revealed part reaches opacity 1, scrolled to the top.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:null;};
const distDir=path.resolve(opt('--dist')||'dist');
const spec=require(path.resolve(argv[0]))({fs,path,dist:p=>path.join(distDir,p),uri:()=>'',assets:{},arrow:'<svg class="t-link"></svg>',source:{verifyQuotes:()=>0,findHighlights:()=>({width:1,height:1,rects:[]}),zoomVars:()=>''}});
const base=argv[1],out=process.env.QA_OUTPUT||'/tmp',deckId=spec.register[0].id;
const slides=spec.deck.slides.map(s=>({id:s.id,kind:s.kind,title:s.title,reveals:s.reveals,max:Math.max(...s.reveals),parts:s.parts.length,imgs:s.parts.join('').split('<img').length-1}));
const results=[],errors=[];
const check=(v,msg)=>{if(!v)throw Error('FAILED: '+msg);results.push(msg);};
const settle=page=>page.waitForFunction(()=>[...document.querySelectorAll('#canvas .part.revealed')].every(e=>getComputedStyle(e).opacity==='1')&&document.getAnimations().every(a=>a.playState!=='running'),null,{timeout:8000}).then(()=>page.evaluate(()=>document.fonts.ready));
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const go=async(page,id)=>{await page.goto(base+'#/presentation/'+deckId+'/slide/'+id);await page.locator('#player').waitFor({state:'visible'});};
const has=k=>slides.find(s=>s.kind===k);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const fresh=async(width,opts={})=>{const c=await browser.newContext({viewport:{width,height:width<700?844:900},...opts});const p=await c.newPage();p.on('pageerror',e=>errors.push(width+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(width+': '+m.text());});p.setDefaultTimeout(10000);return [c,p];};
 const prog=page=>page.locator('#progress').textContent();

 // 1. Every slide, every reveal, four widths.
 for(const width of [375,390,768,1280]){
  const [c,page]=await fresh(width);
  for(const s of slides){
   await go(page,s.id);
   check(await page.locator('#canvas h2').textContent()===s.title,'title '+s.id+' '+width);
   check((await page.locator('.source-note').textContent()).startsWith('Source:'),'audience source line, not presenter note '+s.id+' '+width);
   check(await page.locator('#canvas .part.revealed').count()===0,'starts unrevealed '+s.id+' '+width);
   for(let n=1;n<=s.max;n++){
    await page.locator('#next').click();
    check(await page.locator('#canvas .part.revealed').count()===s.reveals.filter(r=>r<=n).length,'reveal group '+n+' shows exactly its parts '+s.id+' '+width);
    check(await noOverflow(page),'no overflow reveal '+n+' '+s.id+' '+width);
    if(n===s.max||[390,1280].includes(width)){await settle(page);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/v-'+s.id+'-r'+n+'-'+width+'.png',fullPage:true});}
   }
   check((await prog(page)).includes('complete'),'reaches complete '+s.id+' '+width);
   check(await page.evaluate(n=>{const i=[...document.querySelectorAll('#canvas img')];return i.length===n&&i.every(i=>i.complete&&i.naturalWidth>0)&&!document.querySelector('#canvas .asset-error');},s.imgs),s.imgs+' images decoded, no asset error '+s.id+' '+width);
   check(await page.evaluate(()=>[...document.querySelectorAll('#canvas .part.pending')].every(p=>p.inert)),'pending parts inert '+s.id+' '+width);
  }
  check(await page.evaluate(()=>{const l=document.querySelector('#deck-logo');return l.complete&&l.naturalWidth>0;}),'logo rendered '+width);
  await c.close();
 }

 // 2. Navigation and recovery.
 for(const width of [1280,390]){
  const [c,page]=await fresh(width);const first=slides[0],second=slides[1];
  await go(page,first.id);
  await page.locator('#next').click();if(first.max>1){await page.locator('#next').click();await page.locator('#back').click();check((await prog(page)).includes('reveal 1'),'Back reverses one reveal '+width);}
  await page.locator('#replay').click();check((await prog(page)).includes('reveal 0'),'Replay resets '+width);
  await page.locator('#canvas').click({position:{x:4,y:4}});check((await prog(page)).includes('reveal 1')||(await prog(page)).includes('complete'),'empty canvas click reveals '+width);
  await page.locator('#replay').click();await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight');check(!(await prog(page)).includes('reveal 0'),'ArrowRight reveals '+width);
  await page.keyboard.press('ArrowLeft');check((await prog(page)).includes('reveal 0'),'ArrowLeft reverses '+width);
  await page.locator('#notes-button').click();check(await page.locator('#notes').isVisible(),'notes open '+width);
  await page.locator('#fullscreen').click();check(await page.evaluate(()=>document.body.classList.contains('presentation')),'fullscreen entry '+width);
  await page.locator('#next').click();const p1=await prog(page);await page.locator('#exit-presentation').click();check((await prog(page))===p1,'fullscreen exit keeps position '+width);
  if(second){
   for(let i=0;i<=first.max;i++){if(page.url().endsWith(second.id))break;await page.locator('#next').click();}
   await page.waitForFunction(id=>location.hash.endsWith(id),second.id);
   await page.goBack();await page.waitForFunction(id=>location.hash.endsWith(id),first.id);check(true,'browser Back '+width);
   await page.goForward();await page.waitForFunction(id=>location.hash.endsWith(id),second.id);check(true,'browser Forward '+width);
   await page.reload();await page.locator('#player').waitFor({state:'visible'});check((await page.locator('#canvas h2').textContent())===second.title,'refresh keeps slide '+width);
  }
  await page.locator('#index-button').click();await page.locator('#chapter-list [data-chapter="'+(slides.length-1)+'"]').click();await page.waitForFunction(id=>location.hash.endsWith(id),slides[slides.length-1].id);check(true,'chapter selection '+width);
  await page.locator('#tab-'+deckId).focus();await page.keyboard.press('ArrowRight');check(page.url().endsWith(slides[slides.length-1].id),'tab arrow keys do not move slides '+width);
  await page.goto(base+'#/presentation/'+deckId+'/slide/no-such-slide');await page.locator('#message').waitFor({state:'visible'});check((await page.locator('#message-title').textContent())==='Slide not found','missing slide recovery '+width);
  await go(page,first.id);await page.locator('#reading-link').click();await page.locator('#reading-view').waitFor({state:'visible'});
  check(await page.locator('#reading-view .reading-slide').count()===slides.length&&await page.locator('#reading-view .part').count()===slides.reduce((n,s)=>n+s.parts,0),'reading view shows every slide and part '+width);
  await page.keyboard.press('ArrowRight');await page.locator('#close-reading').click();check((await prog(page)).includes('reveal 0'),'keys in the reading view do not move slides '+width);
  await c.close();
 }

 // 3. Reduced motion.
 {const [c,page]=await fresh(390,{reducedMotion:'reduce'});
  for(const s of slides){await go(page,s.id);check(await page.locator('#canvas .part.revealed').count()===s.parts,'reduced motion shows complete slide '+s.id);}
  await c.close();}

 // 4. Devices present in this deck.
 {const [c,page]=await fresh(1280);
  const reveal=async n=>{for(let i=0;i<n;i++)await page.locator('#next').click();};
  if(has('d-counts')){await go(page,has('d-counts').id);await reveal(1);await page.waitForTimeout(1100);check(await page.evaluate(()=>{const n=document.querySelector('#canvas .d-num');return n.textContent===n.dataset.count;}),'device counts: reaches its sourced value');}
  if(has('d-wall')){await go(page,has('d-wall').id);await reveal(2);await settle(page);check(await page.evaluate(()=>getComputedStyle(document.querySelector('#canvas .d-q:not(.is-pick)')).opacity==='0.16'&&getComputedStyle(document.querySelector('#canvas .d-q.is-pick')).transform!=='none'),'device wall: lifts the pick, fades the rest');}
  if(has('d-zoom')){await go(page,has('d-zoom').id);await reveal(1);await settle(page);check(await page.evaluate(()=>getComputedStyle(document.querySelector('#canvas .d-page')).transform==='none'),'device zoom: starts on the whole page');await reveal(1);await settle(page);check(await page.evaluate(()=>getComputedStyle(document.querySelector('#canvas .d-page')).transform!=='none'),'device zoom: moves in on reveal 2');}
  if(has('d-morph')){await go(page,has('d-morph').id);await reveal(2);check(await page.evaluate(()=>getComputedStyle(document.querySelector('#canvas .d-drop')).textDecorationLine.includes('line-through')&&getComputedStyle(document.querySelector('#canvas .d-keep')).textDecorationLine==='none'),'device morph: strikes dropped words only');}
  if(has('d-annot')){const s=has('d-annot');await go(page,s.id);await reveal(1);for(let k=1;k<s.max;k++){await reveal(1);check(await page.evaluate(k=>getComputedStyle(document.querySelector('#canvas .d-a'+k)).opacity==='1'&&(!document.querySelector('#canvas .d-a'+(k+1))||getComputedStyle(document.querySelector('#canvas .d-a'+(k+1))).opacity==='0'),k),'device annotations: mark '+k+' appears on its own reveal');}}
  if(has('d-feed')){await go(page,has('d-feed').id);await reveal(2);await settle(page);check(await page.evaluate(()=>getComputedStyle(document.querySelector('#canvas .d-feed-inner')).transform!=='none'),'device feed: scrolls the asset into view');}
  if(has('d-tap')){await go(page,has('d-tap').id);await reveal(1);const before=await prog(page);const n=await page.locator('#canvas .d-hot').count();for(let i=0;i<n;i++){await page.locator('#canvas .d-hot').nth(i).click();check((await page.locator('#canvas .d-tap-panel h3').textContent()).length>3&&await page.locator('#canvas .d-hot').nth(i).getAttribute('aria-pressed')==='true','device tap: hotspot '+(i+1)+' explains its section');}check((await prog(page))===before,'device tap: hotspots never advance the slide');}
  if(has('d-path')){await go(page,has('d-path').id);await reveal(2);check(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName==='d-travel')),'device path: marker travels the new connector');}
  await c.close();}

 // 5. Recording tools.
 if(spec.tools)for(const width of [1280,390]){
  const [c,page]=await fresh(width);const s=slides[0];await go(page,s.id);
  await page.locator('#tool-spot').click();check(await page.locator('#d-spot').isVisible(),'spotlight on '+width);
  await page.mouse.move(300,400);check(await page.evaluate(()=>document.querySelector('#d-spot').style.getPropertyValue('--x')==='300px'),'spotlight follows the pointer '+width);
  await page.locator('#canvas').click({position:{x:4,y:4}});check(!(await prog(page)).includes('reveal 0'),'slide still advances under spotlight '+width);
  await page.keyboard.press('s');check(!(await page.locator('#d-spot').isVisible()),'S toggles spotlight '+width);
  const p0=await prog(page);await page.keyboard.press('p');const b=await page.locator('#d-pen').boundingBox();
  await page.mouse.move(b.x+40,b.y+60);await page.mouse.down();await page.mouse.move(b.x+160,b.y+120,{steps:8});await page.mouse.up();
  const ink=()=>page.evaluate(()=>{const p=document.querySelector('#d-pen');const d=p.getContext('2d').getImageData(0,0,p.width,p.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;});
  check(await ink()>50&&(await prog(page))===p0,'pen draws without moving the slide '+width);
  await page.keyboard.press('c');check(await ink()===0,'C clears the drawing '+width);
  await page.locator('.d-chip [data-stop="pen"]').click();check(!(await page.locator('#d-pen').isVisible()),'chip stops pen '+width);
  await page.keyboard.press('v');check(await page.locator('#d-presenter').isVisible()&&(await page.locator('#d-now').textContent()).includes(s.title),'presenter view shows the current slide '+width);
  await page.locator('#d-timer-toggle').click();await page.waitForTimeout(600);check((await page.locator('#d-timer').textContent())!=='00:00.0','presenter timer runs '+width);
  await page.locator('#d-close-presenter').click();
  await page.keyboard.press('r');await page.waitForTimeout(250);await page.locator('#replay').click();await page.keyboard.press('ArrowRight');await page.keyboard.press('r');
  const lines=(await page.locator('#d-cuelist').inputValue()).trim().split('\n');
  check(lines.length>=3&&/^\d\d:\d\d\.\d  /.test(lines[1]),'cue list records timed reveals '+width);
  await c.close();
 }
 await browser.close();
 if(errors.length)throw Error('Runtime errors: '+errors.join(' | '));
 console.log(results.length+' checks passed, no runtime errors.');
})().catch(e=>{console.error(e.message);process.exit(1);});
