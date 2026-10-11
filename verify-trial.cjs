// Chromium checks for whiteboard-trial-calibration.html. Usage: node verify-trial.cjs http://127.0.0.1:8863/whiteboard-trial-calibration.html
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.argv[2]||'http://127.0.0.1:8863/whiteboard-trial-calibration.html',out=process.env.QA_OUTPUT||'/tmp';
const slides=[['trial-opening','The buyer comes first.',3],['trial-transformation','Their words become the idea.',3],['trial-mechanism','Who owns the next action?',5]];
const results=[],errors=[];
const check=(v,msg)=>{if(!v)throw Error('FAILED: '+msg);results.push(msg);};
const settle=page=>page.waitForFunction(()=>[...document.querySelectorAll('.part.revealed')].every(e=>getComputedStyle(e).opacity==='1')&&document.getAnimations().every(a=>a.playState!=='running')).then(()=>page.evaluate(()=>document.fonts.ready));
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const fresh=async(width,opts={})=>{const c=await browser.newContext({viewport:{width,height:width<700?844:900},...opts});const p=await c.newPage();p.on('pageerror',e=>errors.push(width+': '+e.message));p.on('console',m=>{if(m.type()==='error')errors.push(width+': '+m.text());});p.setDefaultTimeout(10000);return [c,p];};
 for(const width of [375,390,768,1280]){
  const [c,page]=await fresh(width);
  for(const [id,title,max] of slides){
   await page.goto(base+'#/presentation/trial-calibration/slide/'+id);await page.locator('#player').waitFor({state:'visible'});
   check(await page.locator('#canvas h2').textContent()===title,'title '+id+' '+width);
   check((await page.locator('.source-note').textContent()).startsWith('Source:'),'audience source line, not presenter note '+id+' '+width);
   check(await page.locator('.part.revealed').count()===0,'starts unrevealed '+id+' '+width);
   for(let n=1;n<=max;n++){
    await page.locator('#next').click();
    check(await page.locator('.part.revealed').count()===n,'reveal '+n+' '+id+' '+width);
    check(await page.locator('.part.pending').count()===max-n,'pending hidden '+n+' '+id+' '+width);
    check(await noOverflow(page),'no overflow reveal '+n+' '+id+' '+width);
    await settle(page);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/trial-'+id+'-r'+n+'-'+width+'.png',fullPage:true});
   }
   check(await page.evaluate(()=>{const i=[...document.querySelectorAll('#canvas img')];return i.length===1&&i.every(i=>i.complete&&i.naturalWidth>0)&&!document.querySelector('.asset-error');}),'finished image decoded, no asset error '+id+' '+width);
   check(await page.evaluate(()=>[...document.querySelectorAll('.part.pending')].every(p=>p.inert)),'pending parts inert '+id+' '+width);
  }
  check(await page.evaluate(()=>{const l=document.querySelector('#deck-logo');return l.complete&&l.naturalWidth>0&&l.getBoundingClientRect().width>=70;}),'coin logo rendered '+width);
  await c.close();
 }
 // Interaction gates at desktop and phone.
 for(const width of [1280,390]){
  const [c,page]=await fresh(width);
  await page.goto(base);await page.locator('#player').waitFor({state:'visible'});
  check(page.url().endsWith('#/presentation/trial-calibration/slide/trial-opening'),'bare file opens first slide '+width);
  const prog=()=>page.locator('#progress').textContent();
  await page.locator('#next').click();await page.locator('#next').click();await page.locator('#back').click();check((await prog()).includes('reveal 1'),'Back reverses one reveal '+width);
  await page.locator('#replay').click();check((await prog()).includes('reveal 0'),'Replay resets '+width);
  await page.locator('#canvas').click({position:{x:4,y:4}});check((await prog()).includes('reveal 1'),'empty canvas click reveals '+width);
  await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight');check((await prog()).includes('reveal 2'),'ArrowRight reveals '+width);
  await page.keyboard.press('ArrowLeft');check((await prog()).includes('reveal 1'),'ArrowLeft reverses '+width);
  await page.keyboard.press('Space');check((await prog()).includes('reveal 2'),'Space reveals '+width);
  await page.locator('#notes-button').click();check(await page.locator('#notes').isVisible()&&(await page.locator('#notes').textContent()).includes('page 13'),'notes open with source '+width);
  await page.locator('#fullscreen').click();check(await page.evaluate(()=>document.body.classList.contains('presentation')),'fullscreen entry '+width);
  await page.locator('#next').click();check((await prog()).includes('complete'),'reveal inside fullscreen '+width);
  await page.locator('#exit-presentation').click();check(!(await page.evaluate(()=>document.body.classList.contains('presentation')))&&(await prog()).includes('complete'),'fullscreen exit preserves state '+width);
  await page.locator('#next').click();await page.waitForFunction(()=>location.hash.endsWith('trial-transformation'));check(true,'last reveal advances slide '+width);
  await page.goBack();await page.waitForFunction(()=>location.hash.endsWith('trial-opening'));check((await page.locator('#canvas h2').textContent())==='The buyer comes first.','browser Back restores slide '+width);
  await page.goForward();await page.waitForFunction(()=>location.hash.endsWith('trial-transformation'));check(true,'browser Forward '+width);
  await page.reload();await page.locator('#player').waitFor({state:'visible'});check((await page.locator('#canvas h2').textContent())==='Their words become the idea.','refresh keeps slide '+width);
  await page.locator('#index-button').click();await page.locator('#chapter-list [data-chapter="2"]').click();await page.waitForFunction(()=>location.hash.endsWith('trial-mechanism'));check(true,'chapter selection '+width);
  for(let i=0;i<5;i++)await page.locator('#next').click();await page.locator('#next').click();await page.locator('#library').waitFor({state:'visible'});check(true,'final slide returns to library '+width);
  await page.locator('#tab-trial-calibration').focus();await page.keyboard.press('ArrowRight');check(await page.locator('#library').isVisible(),'tab arrow key does not navigate '+width);
  await page.goto(base+'#/presentation/trial-calibration/slide/missing');await page.locator('#message').waitFor({state:'visible'});check((await page.locator('#message-title').textContent())==='Slide not found','missing slide recovery '+width);
  await page.goto(base+'#/presentation/trial-calibration/slide/trial-transformation');await page.locator('#player').waitFor({state:'visible'});
  await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();
  check((await prog()).includes('complete'),'transformation complete '+width);await page.locator('.t-asset img').click();await page.waitForFunction(()=>location.hash.endsWith('trial-mechanism'));check(true,'non-interactive asset click advances like canvas space '+width);
  await c.close();
  const [rc,rp]=await fresh(width,{reducedMotion:'reduce'});
  await rp.goto(base+'#/presentation/trial-calibration/slide/trial-mechanism');await rp.locator('#player').waitFor({state:'visible'});
  check(await rp.locator('.part.revealed').count()===5,'reduced motion shows complete slide '+width);
  check(await rp.evaluate(()=>document.getAnimations().length===0),'reduced motion runs no animations '+width);
  await rp.screenshot({path:out+'/trial-reduced-'+width+'.png',fullPage:true});
  await rp.goto(base.split('#')[0]+'?view=reading');await rp.locator('.reading-slide').first().waitFor();
  check(await rp.locator('.reading-slide').count()===3&&await rp.locator('.reading-slide .part').count()===11,'reading view shows all 11 parts '+width);
  check(await noOverflow(rp),'reading view no overflow '+width);
  await rp.screenshot({path:out+'/trial-reading-'+width+'.png',fullPage:true});
  await rc.close();
 }
 await browser.close();
 if(errors.length)throw Error('Runtime errors: '+errors.join(' | '));
 console.log(results.length+' checks passed, no runtime errors.');
})().catch(e=>{console.error(e.message);process.exit(1);});
