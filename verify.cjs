const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'dist/whiteboard-content.js'),'utf8'),ctx);
const deck=ctx.window.WW,base=process.argv[2]||'http://127.0.0.1:8862/';
const failures=[],results=[];
const check=(v,msg)=>{if(!v)throw Error(msg);results.push(msg);};
async function run(){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 if(process.env.SITE_QA_TOKEN)await context.route('**/*',async r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)await r.continue({headers:{...r.request().headers(),'OAI-Sites-Authorization':'Bearer '+process.env.SITE_QA_TOKEN}});else await r.continue();});
 const page=await context.newPage();page.on('pageerror',e=>failures.push(e.message));page.setDefaultTimeout(10000);
 const go=async(id)=>{await page.goto(base+'#/presentation/paid-ads-process/slide/'+id);await page.locator('#player').waitFor({state:'visible'});};
 for(const width of [375,390,768,1280]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.locator('.deck-card').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  check(await page.locator('.deck-card').count()===2,'two genuine library cards '+width);
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'library no overflow '+width);
  await page.screenshot({path:'/private/tmp/ww-library-'+width+'.png',fullPage:true});
  for(const s of deck.slides){
   await go(s.id);await page.locator('#replay').click();
   for(let n=1;n<=Math.max(...s.reveals);n++){await page.locator('#next').click();check(await page.locator('.part.revealed').count()===s.reveals.filter(x=>x<=n).length,'reveal '+s.id+' '+n+' at '+width);}
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'slide no overflow '+s.id+' '+width);
   check(await page.locator('#canvas h2').textContent()===s.title,'title '+s.id+' '+width);
   if(['creative','research','email'].includes(s.id)&&[390,1280].includes(width)){await page.waitForFunction(()=>[...document.querySelectorAll('.part.revealed')].every(e=>getComputedStyle(e).opacity==='1'));await page.screenshot({path:'/private/tmp/ww-'+s.id+'-'+width+'.png',fullPage:true});}
  }
 }
 await go('research');await page.locator('#next').click();await page.locator('#next').click();await page.locator('#back').click();check((await page.locator('#progress').textContent()).includes('reveal 1'),'back one reveal');
 await page.locator('#replay').click();check((await page.locator('#progress').textContent()).includes('reveal 0'),'replay');
 await page.locator('#canvas').click({position:{x:10,y:10}});check((await page.locator('#progress').textContent()).includes('reveal 1'),'empty space reveal');
 await page.locator('#canvas').focus();await page.keyboard.press('ArrowRight');check((await page.locator('#progress').textContent()).includes('reveal 2'),'keyboard reveal');
 await page.locator('#fullscreen').click();check(await page.locator('body').evaluate(e=>e.classList.contains('presentation')),'fullscreen entry');await page.locator('#exit-presentation').click();check((await page.locator('#progress').textContent()).includes('reveal 2'),'fullscreen preserves reveal');
 await page.locator('#notes-button').click();check(await page.locator('#notes').isVisible(),'presenter notes');
 await page.locator('#fullscreen').click();await page.locator('#next').click();await page.locator('#next').click();await page.waitForURL('**/live-report');check(await page.locator('body').evaluate(e=>e.classList.contains('presentation')),'fullscreen survives next slide');await page.locator('#exit-presentation').click();await go('research');
 await page.evaluate(()=>document.documentElement.requestFullscreen=undefined);await page.locator('#fullscreen').click();check(await page.locator('body').evaluate(e=>e.classList.contains('presentation')),'mobile full-window fallback');await page.locator('#exit-presentation').click();
 const beforeSkip=page.url();await page.locator('.skip').evaluate(e=>e.click());check(page.url()===beforeSkip,'skip link does not alter slide route');
 await page.locator('#index-button').click();await page.locator('[data-chapter="3"]').click();check(page.url().endsWith('/evidence'),'chapter selector');
 await page.goBack();await page.waitForURL('**/research');await page.goForward();await page.waitForURL('**/evidence');check(true,'browser history');
 await page.reload();await page.locator('#player').waitFor({state:'visible'});check((await page.locator('#canvas h2').textContent())===deck.slides[3].title,'direct link refresh');
 await go('live-report');check(await page.locator('iframe[src]').count()===0,'PDF lazy before reveal');await page.locator('#next').click();await page.locator('iframe[src*="ww-report.pdf"]').waitFor();check(true,'PDF embedded');check((await page.locator('.document-bar a').getAttribute('href'))==='ww-report.pdf','PDF separate link');
 await go('vision-board');await page.locator('#next').click();await page.locator('iframe[src*="ww-board.html"]').waitFor();await page.frameLocator('.board-frame').locator('body').waitFor();check(true,'campaign board loaded');
 await page.locator('#replay').click();check(await page.locator('.board-frame').getAttribute('src')==='about:blank','hidden demo unloaded on replay');await page.locator('#next').click();await page.locator('iframe[src*="ww-board.html"]').waitFor();check(true,'demo reload after replay');
 await go('survey');await page.locator('#next').click();
 for(let i=0;i<5;i++){await page.locator('[data-question="'+i+'"]').click();await page.locator('.survey-options input').first().check();}
 check((await page.locator('.route-result').textContent()).includes('Provisional fit'),'survey passing route');
 await page.locator('[data-question="0"]').click();await page.locator('.survey-options input').nth(2).check();check((await page.locator('.route-result').textContent()).includes('Not a fit'),'survey DQ route');
 await page.locator('.survey-options input').nth(1).check();check((await page.locator('.route-result').textContent()).includes('Human fit'),'survey review route');
 await page.goto(base+'#/presentation/missing');await page.locator('#message').waitFor({state:'visible'});check((await page.locator('#message-title').textContent())==='Presentation not found','missing deck');
 await page.goto(base+'#/presentation/paid-ads-process/slide/missing');await page.waitForFunction(()=>document.querySelector('#message-title').textContent==='Slide not found');check(true,'missing slide');
 await page.goto(base+'ww-guide.html');check(await page.locator('h2').count()>=26,'complete reading view');
 await page.emulateMedia({reducedMotion:'reduce'});await go('research');check(await page.locator('.part.pending').count()===0,'reduced motion complete slide');await page.emulateMedia({reducedMotion:'no-preference'});
 const fixture={...JSON.parse(JSON.stringify(deck)),slides:[{id:'fixture',title:'Second test presentation',section:'Test only',kind:'stack',parts:['<p>Independent content</p>',deck.slides.find(s=>s.id==='survey').parts[0]],reveals:[1,2],note:'Only injected by the test harness.'}]};
 await context.route('**/presentations.js',async r=>{const response=await r.fetch({headers:{...r.request().headers(),...(process.env.SITE_QA_TOKEN?{'OAI-Sites-Authorization':'Bearer '+process.env.SITE_QA_TOKEN}:{})}});const body=(await response.text())+"\nwindow.presentationRegister.push({...window.presentationRegister[0],id:'test-only',title:'Second test presentation',source:'test-only.js',brand:{...window.presentationRegister[0].brand,name:'Fictional QA brand',accent:'#174b67'}});";await r.fulfill({response,body});});
 await context.route('**/test-only.js',r=>r.fulfill({contentType:'text/javascript',body:'window.WW='+JSON.stringify(fixture)}));
 await page.goto(base);await page.locator('.deck-card').nth(1).waitFor();await page.locator('#tab-paid-ads-process').click();await page.locator('#player').waitFor({state:'visible'});await page.locator('#next').click();
 const progress=await page.locator('#progress').textContent();await page.locator('#tab-paid-ads-process').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');check(await page.locator('#progress').textContent()===progress,'tab arrows do not advance slide');await page.keyboard.press('Enter');await page.waitForURL('**/fixture');
 const tabProgress=await page.locator('#progress').textContent();await page.keyboard.press('ArrowRight');check(await page.locator('#progress').textContent()===tabProgress,'tab focus preserved after activation');check(await page.locator('#tab-paid-ads-process').evaluate(e=>e===document.activeElement),'tab arrow after activation moves focus');
 check((await page.locator('#brand-name').textContent())==='Fictional QA brand','separate published branding');await page.locator('#next').click();await page.locator('#next').click();check(await page.locator('.survey-options input:checked').count()===0,'new deck survey empty');await page.locator('.survey-options input').first().check();
 await page.locator('#tab-paid-ads-process').click();await page.waitForURL('**/opening');check(await page.locator('#progress').textContent()===progress,'deck reveal restored');check((await page.locator('#brand-name').textContent())==='Pecuna Factorem','original branding restored');
 await page.locator('#brand-button').click();await page.locator('[name="name"]').fill('Fictional preview');await page.locator('#brand-form button[type="submit"]').click();check(await page.locator('#brand-preview').isVisible(),'browser preview labelled');
 await page.locator('#tab-test-only').click();await page.waitForURL('**/fixture');check((await page.locator('#brand-name').textContent())==='Fictional QA brand','preview isolated');check(await page.locator('.survey-options input:checked').count()===1,'survey answer restored');
 await go('survey');await page.locator('#next').click();check(await page.locator('.survey-options input:checked').count()===0,'survey answers isolated');
 await go('vision-board');await page.locator('#next').click();await page.locator('#tab-test-only').click();await page.waitForURL('**/fixture');check(await page.locator('#canvas iframe').count()===0,'previous demo unloaded');
 await page.setViewportSize({width:375,height:812});await page.locator('.tabs-hint').waitFor({state:'visible'});check(true,'mobile tabs scroll hint');
 await context.unroute('**/presentations.js');await context.unroute('**/test-only.js');await page.reload();await go('opening');check((await page.locator('#brand-name').textContent())==='Pecuna Factorem','fresh load published brand');
 await context.route('**/whiteboard-content.js',r=>r.abort());await page.reload();await page.waitForFunction(()=>document.querySelector('#message-title').textContent==='Unable to open presentation');check(true,'failed content load recovery');await context.unroute('**/whiteboard-content.js');
 await context.route('**/ww-ad.png',r=>r.abort());await go('creative');for(let n=0;n<3;n++)await page.locator('#next').click();await page.locator('.asset-error').waitFor();check(true,'missing image readable fallback');await context.unroute('**/ww-ad.png');
 await context.route('**/ww-report.pdf',r=>r.abort());await go('live-report');await page.locator('#next').click();await page.locator('.embed-error').waitFor();check(true,'missing PDF retry state');await context.unroute('**/ww-report.pdf');await page.locator('.embed-error button').click();await page.locator('iframe[src*="ww-report.pdf"]').waitFor();check(true,'PDF retry recovers');
 await context.route('**/ww-coin.svg',r=>r.abort());await context.route('**/ww-ad.png',r=>r.abort());await page.goto(base);await page.locator('.deck-cover .asset-error').waitFor();check(true,'cover image fallback');await page.locator('#tab-paid-ads-process').click();await page.locator('.deck-head .asset-error').waitFor();check(true,'logo image fallback');await page.locator('#library-button').click();await page.locator('.deck-card').first().waitFor();check(true,'logo failure navigation safe');
 check(failures.length===0,'no browser runtime errors: '+failures.join(';'));
 console.log(JSON.stringify({checks:results.length,failures,lastChecks:results.slice(-45)},null,2));await browser.close();
}
run().catch(e=>{console.error(e);process.exit(1);});
