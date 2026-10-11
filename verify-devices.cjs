// Chromium checks for whiteboard-trial-devices.html. Usage: node verify-devices.cjs http://127.0.0.1:8863/whiteboard-trial-devices.html
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.argv[2]||'http://127.0.0.1:8863/whiteboard-trial-devices.html',out=process.env.QA_OUTPUT||'/tmp';
// [slide id, reveal count, images expected on the slide]
const slides=[['device-counts',4,0],['device-wall',3,0],['device-zoom',3,1],['device-morph',3,0],['device-annotate',5,1],['device-feed',3,2],['device-tap',2,1],['device-path',3,2]];
const results=[],errors=[];
const check=(v,msg)=>{if(!v)throw Error('FAILED: '+msg);results.push(msg);};
const settle=page=>page.waitForFunction(()=>[...document.querySelectorAll('#canvas .part.revealed')].every(e=>getComputedStyle(e).opacity==='1')&&document.getAnimations().every(a=>a.playState!=='running'),null,{timeout:8000}).then(()=>page.evaluate(()=>document.fonts.ready));
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const go=async(page,id)=>{await page.goto(base+'#/presentation/trial-devices/slide/'+id);await page.locator('#player').waitFor({state:'visible'});};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const fresh=async(width,opts={})=>{const c=await browser.newContext({viewport:{width,height:width<700?844:900},...opts});const p=await c.newPage();p.on('pageerror',e=>errors.push(width+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(width+': '+m.text());});p.setDefaultTimeout(10000);return [c,p];};
 for(const width of [375,390,768,1280]){
  const [c,page]=await fresh(width);
  for(const [id,max,imgs] of slides){
   await go(page,id);
   check((await page.locator('.source-note').textContent()).startsWith('Source:'),'audience source line '+id+' '+width);
   for(let n=1;n<=max;n++){
    await page.locator('#next').click();
    check(await page.locator('#canvas .part.revealed').count()===n,'reveal '+n+' '+id+' '+width);
    check(await noOverflow(page),'no overflow reveal '+n+' '+id+' '+width);
    if(n===max||[390,1280].includes(width)){await settle(page);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/dev-'+id+'-r'+n+'-'+width+'.png',fullPage:true});}
   }
   check(await page.evaluate(n=>{const i=[...document.querySelectorAll('#canvas img')];return i.length===n&&i.every(i=>i.complete&&i.naturalWidth>0)&&!document.querySelector('#canvas .asset-error');},imgs),'images decoded ('+imgs+') '+id+' '+width);
  }
  await c.close();
 }
 // Device behaviour.
 {const [c,page]=await fresh(1280);
  await go(page,'device-counts');await page.locator('#next').click();await page.waitForTimeout(1100);
  check(await page.locator('#canvas .d-num').first().textContent()==='222','count reaches its sourced value');
  await go(page,'device-wall');await page.locator('#next').click();await page.locator('#next').click();await settle(page);
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-q:not(.is-pick)')).opacity==='0.16'&&getComputedStyle(document.querySelector('.d-q.is-pick')).transform!=='none'),'quote wall lifts RED-008 and fades the rest');
  await go(page,'device-zoom');await page.locator('#next').click();await settle(page);
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-page')).transform==='none'),'zoom starts on the whole page');
  await page.locator('#next').click();await settle(page);
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-page')).transform!=='none'),'zoom moves in on reveal 2');
  await go(page,'device-morph');await page.locator('#next').click();await page.locator('#next').click();
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-drop')).textDecorationLine.includes('line-through')&&getComputedStyle(document.querySelector('.d-keep')).textDecorationLine==='none'),'morph strikes dropped words only');
  await go(page,'device-annotate');
  for(let n=1;n<=5;n++){await page.locator('#next').click();if(n>1)check(await page.evaluate(k=>getComputedStyle(document.querySelector('.d-a'+k)).opacity==='1'&&(k===4||getComputedStyle(document.querySelector('.d-a'+(k+1))).opacity==='0'),n-1),'annotation '+(n-1)+' appears on its own reveal');}
  await go(page,'device-feed');await page.locator('#next').click();await page.locator('#next').click();await settle(page);
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-feed-inner')).transform!=='none'),'feed scrolls the ad into view');
  await go(page,'device-tap');await page.locator('#next').click();const before=await page.locator('#progress').textContent();
  for(let i=0;i<4;i++){await page.locator('.d-hot').nth(i).click();check((await page.locator('.d-tap-panel h3').textContent()).length>5&&await page.locator('.d-hot').nth(i).getAttribute('aria-pressed')==='true','hotspot '+(i+1)+' explains its section');}
  check(await page.locator('#progress').textContent()===before,'hotspots never advance the slide');
  await go(page,'device-path');await page.locator('#next').click();await page.locator('#next').click();
  check(await page.evaluate(()=>document.getAnimations().some(a=>a.animationName==='d-travel')),'path marker travels along the new connector');
  await c.close();}
 // Recording tools at desktop and phone.
 for(const width of [1280,390]){
  const [c,page]=await fresh(width);const prog=()=>page.locator('#progress').textContent();
  await go(page,'device-zoom');
  await page.locator('#tool-spot').click();check(await page.locator('#d-spot').isVisible()&&await page.locator('#tool-spot').getAttribute('aria-pressed')==='true','spotlight on '+width);
  await page.mouse.move(300,400);check(await page.evaluate(()=>document.querySelector('#d-spot').style.getPropertyValue('--x')==='300px'),'spotlight follows the pointer '+width);
  await page.locator('#canvas').click({position:{x:4,y:4}});check((await prog()).includes('reveal 1'),'slide still advances under spotlight '+width);
  await page.keyboard.press('s');check(!(await page.locator('#d-spot').isVisible()),'S toggles spotlight off '+width);
  await page.keyboard.press('p');check(await page.locator('#d-pen').isVisible(),'P turns pen on '+width);
  const b=await page.locator('#d-pen').boundingBox();
  await page.mouse.move(b.x+40,b.y+60);await page.mouse.down();await page.mouse.move(b.x+160,b.y+120,{steps:8});await page.mouse.up();
  const ink=()=>page.evaluate(()=>{const p=document.querySelector('#d-pen');const d=p.getContext('2d').getImageData(0,0,p.width,p.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;});
  check(await ink()>50,'pen draws '+width);check((await prog()).includes('reveal 1'),'drawing never advances the slide '+width);
  await page.keyboard.press('c');check(await ink()===0,'C clears the drawing '+width);
  await page.mouse.move(b.x+40,b.y+60);await page.mouse.down();await page.mouse.move(b.x+120,b.y+90,{steps:5});await page.mouse.up();
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>location.hash.endsWith('device-morph'));
  check(await ink()===0,'drawing clears on slide change '+width);
  await page.locator('.d-chip [data-stop="pen"]').click();check(!(await page.locator('#d-pen').isVisible()),'chip stops pen '+width);
  await page.locator('#tool-presenter').click();check(await page.locator('#d-presenter').isVisible(),'presenter panel opens '+width);
  check((await page.locator('#d-now').textContent()).includes('Keep their words. Add one.'),'presenter shows the current slide '+width);
  check((await page.locator('#d-next').textContent()).startsWith('Reveal 1:'),'presenter shows the next reveal '+width);
  check((await page.locator('#d-notes').textContent()).includes('Device: words that morph'),'presenter shows notes '+width);
  await page.locator('#d-timer-toggle').click();await page.waitForTimeout(700);check((await page.locator('#d-timer').textContent())!=='00:00.0','presenter timer runs '+width);
  await page.locator('#d-close-presenter').click();
  await page.keyboard.press('r');check(await page.locator('#tool-cues').getAttribute('aria-pressed')==='true','R starts cue recording '+width);
  await page.waitForTimeout(300);await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);await page.keyboard.press('ArrowRight');
  await page.keyboard.press('r');
  const cues=await page.locator('#d-cuelist').inputValue();const lines=cues.trim().split('\n');
  check(await page.locator('#d-presenter').isVisible()&&lines.length===4&&/^00:00\.\d  device-morph  reveal 0\/3/.test(lines[1])&&/device-morph  reveal 2\/3  Words that morph$/.test(lines[3]),'cue list records each reveal with time and device '+width);
  await c.close();
 }
 // Reduced motion and reading view.
 {const [c,page]=await fresh(390,{reducedMotion:'reduce'});
  await go(page,'device-zoom');check(await page.locator('#canvas .part.revealed').count()===3,'reduced motion shows the complete slide');
  check(await page.evaluate(()=>getComputedStyle(document.querySelector('.d-page')).transitionDuration==='0s'),'reduced motion removes the camera move');
  await go(page,'device-counts');check(await page.locator('#canvas .d-num').nth(3).textContent()==='154','reduced motion shows final counts');
  await page.locator('#reading-link').click();await page.locator('#reading-view').waitFor({state:'visible'});
  check(await page.locator('#reading-view .reading-slide').count()===8&&await page.locator('#reading-view .part').count()===26,'reading view shows all 8 slides and 26 parts');
  check(await noOverflow(page),'reading view no overflow');
  await page.screenshot({path:out+'/dev-reading-390.png',fullPage:true});
  await c.close();}
 await browser.close();
 if(errors.length)throw Error('Runtime errors: '+errors.join(' | '));
 console.log(results.length+' checks passed, no runtime errors.');
})().catch(e=>{console.error(e.message);process.exit(1);});
