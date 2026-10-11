// Builds whiteboard-trial-calibration.html: a self-contained three-slide calibration trial.
// Reuses dist/library.js, dist/whiteboard.css and dist/library.css verbatim, with assets inlined.
// Output sits outside dist, so it is never part of the published Sites build.
const fs=require('node:fs'),path=require('node:path');
const dist=p=>path.join(__dirname,'dist',p);
const uri=(file,type)=>'data:'+type+';base64,'+fs.readFileSync(file).toString('base64');
const assets={COIN:uri(dist('ww-coin.svg'),'image/svg+xml'),AD:uri(dist('ww-ad.png'),'image/png')};
const coin='{{COIN}}',ad='{{AD}}';
// Crop of report page 13 (rendered at 220 dpi), row RED-008. Regenerate with:
// pdftoppm -f 13 -l 13 -r 220 -png dist/ww-report.pdf p && crop (640,160)-(1702,442)
assets.CROP=uri(path.join(__dirname,'trial-red008-p13.png'),'image/png');
const crop='{{CROP}}';

// Highlight boxes in crop pixels, from pdftotext -bbox word coordinates on page 13.
const marks=[[216,169,156,38],[385,169,97,38],[28,215,472,38]];
const highlight=marks.map(([x,y,w,h],i)=>'<rect class="t-mark" style="--d:'+(i*120)+'ms" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>').join('');
const arrow='<svg class="t-link" viewBox="0 0 64 24" aria-hidden="true"><path d="M2 12 H58 M48 3 L58 12 L48 21"/></svg>';

let deck={slides:[
{
 id:'trial-opening',title:'The buyer comes first.',section:'Trial 1 of 3 / Opening visual',kind:'t-open',reveals:[1,2,3],
 source:'Source: ICP-Research-Radar, Cadre Crew, report page 13, RED-008. Public r/MedSpa discussion.',
 parts:[
  '<p class="lead">Our unique paid ads process starts before we write an advert.</p><p class="hand statement">What are they afraid of?<br>What do they actually want?</p>',
  '<figure class="t-page"><div class="micro">ICP-RESEARCH-RADAR / REPORT PAGE 13 / RED-008</div><div class="t-crop"><div class="t-crop-inner"><img src="'+crop+'" width="1062" height="282" alt="Report page 13, row 8: i know exactly how many clients we\'re losing to this. someone googles medspa, tries calling, no answer, books at the place next door instead. Source r/MedSpa, RED-008."><svg viewBox="0 0 1062 282" aria-hidden="true">'+highlight+'</svg></div></div><figcaption>Actual report page crop. Public discussion quote from r/MedSpa, not a client testimonial.</figcaption></figure>',
  '<p class="hand statement">A campaign they recognise.</p><p>Research informs the argument. Specialist skills turn it into the assets.</p>'
 ],
 note:'Approved opening wording retained from slide “opening”. Change under trial: the actual report row replaces the abstract “Their own words” card, so the audience sees real buyer language before any claim about it. Highlights are placed from the PDF word coordinates on page 13 and cover only “no answer” and “books at the place next door instead.”, matching the live deck. Verified against dist/ww-report.pdf on 11 October 2026.'
},
{
 id:'trial-transformation',title:'Their words become the idea.',section:'Trial 2 of 3 / Research to finished asset',kind:'t-transform',reveals:[1,2,3],
 source:'Source: RED-008, report page 13. The headline and static are authored, illustrative creative, not launched advertising.',
 parts:[
  '<div class="micro">THE EXACT SOURCE / RED-008 · P. 13</div><blockquote>“someone googles medspa, tries calling, <mark>no answer</mark>, <mark>books at the place next door instead.</mark>”</blockquote><small>Public discussion excerpt, not a client testimonial.</small>',
  '<div class="micro">ADAPTED HEADLINE / AUTHORED COPY, NOT A QUOTE</div><div class="t-map"><span><mark>no answer</mark></span>'+arrow+'<b class="hand">No answer.</b><span><mark>books at the place next door instead.</mark></span>'+arrow+'<b class="hand">Next clinic?</b></div><p>A missed ring can become somebody else’s booking.</p>',
  arrow+'<figure class="t-asset"><img src="'+ad+'" width="1122" height="1402" alt="Cadre Crew static advert. Headline: No answer. Next clinic? Subhead: AI call handling. Human follow-up. Button: Request a clinic audit. A black desk phone on a blue panel."><figcaption>Finished static in the client’s own branding · LLM Image Creator · illustrative, not launched</figcaption></figure>'
 ],
 note:'Uses the live deck’s exact quotation, highlights, adapted headline and approved ad copy line. Change under trial: the word-by-word mapping makes the adaptation inspectable, and the finished static is shown large enough to read rather than at 340px. The headline is authored copy; it does not claim every missed call becomes a competitor booking.'
},
{
 id:'trial-mechanism',title:'Who owns the next action?',section:'Trial 3 of 3 / Sequential mechanism',kind:'t-flow',reveals:[1,2,3,4,5],
 source:'Source: Cadre Crew landing page prototype and saved nurture email. Illustrative workflow, not a launched integration.',
 parts:[
  '<figure class="t-moment"><img src="'+ad+'" alt="Detail from the Cadre Crew static: an unanswered black desk phone"></figure><div class="micro">THE MOMENT</div><h3>The front desk is busy.</h3><p>Your receptionist can be helping the patient in front of them while the next one calls somewhere else.</p>',
  arrow+'<div class="t-step"><span class="number">01</span><h3>AI answers</h3><p>Captures the enquiry and booking intent.</p></div>',
  arrow+'<div class="t-step"><span class="number">02</span><h3>Your operator follows through</h3><p>Updates the CRM and handles the next action.</p></div>',
  arrow+'<div class="t-step"><span class="number">03</span><h3>Your clinic takes the handoff</h3><p>An appointment or a clear human escalation.</p></div>',
  '<p class="hand statement">AI answers the call.<br>A human owns what happens next.</p><small>One Ops Lead oversees the work. Example workflow. Scope depends on your systems.</small>'
 ],
 note:'All step wording is taken from the retained landing page prototype (ww-landing.png) and the saved nurture email. Change under trial: the mechanism is revealed one owner at a time, each with its own drawn connector, starting from the concrete missed-call moment instead of a single text rail. Not a description of a launched service integration.'
}
]};

let register=[{id:'trial-calibration',title:'Calibration trial',description:'Three representative moments from Our paid ads process, rebuilt for the three-slide approval checkpoint. Not published.',cover:ad,source:'',reading:'?view=reading',brand:{name:'Pecuna Factorem',surface:'#ffffff',ink:'#1c1a17',accent:'#8b6002',font:'hand',logo:coin},sourceNote:'Calibration trial from the retained paid ads deck. Cadre Crew research and illustrative assets, not launched advertising.'}];

// TRIAL=devices builds the device-library trial from trial-devices.cjs with the same shell.
const spec=process.env.TRIAL==='devices'?require('./trial-devices.cjs')({fs,path,uri,dist,assets,arrow}):null;
if(spec){deck=spec.deck;register=spec.register;}
const label={title:spec?spec.title:'Calibration Trial',artifactTitle:spec?spec.artifactTitle:'Paid Ads Calibration Trial',header:spec?spec.header:'CALIBRATION TRIAL · NOT PUBLISHED',eyebrow:spec?spec.eyebrow:'THREE-SLIDE APPROVAL CHECKPOINT',intro:spec?spec.intro:'Three moments from Our paid ads process, rebuilt for review before any wider change.',file:spec?spec.file:'whiteboard-trial-calibration.html'};
const fonts={'ww-caveat.ttf':0,'ww-body.ttf':0,'ww-display.ttf':0,'ww-mono.ttf':0};
let css=fs.readFileSync(dist('whiteboard.css'),'utf8');
for(const f in fonts)css=css.replace('url('+f+')','url('+uri(dist(f),'font/ttf')+')');
css+=fs.readFileSync(dist('library.css'),'utf8');
const trialCss=`
/* Trial-only layouts, scoped to t-* kinds. */
.trial-flag{display:inline-block;font:11px WWMono;letter-spacing:1px;background:#f6df8c;color:#1c1a17;padding:4px 8px;margin-left:12px;vertical-align:middle}
.t-link{display:block;width:56px;height:24px;flex:none;fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:90;stroke-dashoffset:0}
.revealed .t-link{animation:t-draw 260ms ease-out}@keyframes t-draw{from{stroke-dashoffset:90}to{stroke-dashoffset:0}}
.t-mark{fill:#f6df8c;mix-blend-mode:multiply;transform-box:fill-box;transform-origin:left center}
.revealed .t-mark{animation:t-sweep 320ms ease-out both;animation-delay:calc(var(--d) + 120ms)}@keyframes t-sweep{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.parts.t-open{grid-template-columns:1fr;gap:20px}.t-open .lead{margin:0}.t-open .statement{margin:6px 0 0}.t-page{max-width:900px}
.t-page{margin:0;padding:22px 26px 18px;background:var(--tint);border-left:3px solid var(--accent)}.t-crop{position:relative;margin-top:10px;background:#fff;box-shadow:6px 8px 0 color-mix(in srgb,var(--ink) 6%,transparent)}.t-crop{overflow:hidden}.t-crop-inner{position:relative}.t-crop img,.t-crop svg{display:block;width:100%;height:auto}.t-crop svg{position:absolute;inset:0;height:100%}
.parts.t-transform{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto 1fr;gap:24px 56px}.t-transform .part:nth-child(2){align-self:start}.t-transform .part:nth-child(1){grid-column:1;grid-row:1}.t-transform .part:nth-child(2){grid-column:1;grid-row:2}.t-transform .part:nth-child(3){grid-column:2;grid-row:1/span 2;display:flex;align-items:center;gap:12px}
.t-map{display:grid;grid-template-columns:minmax(0,1.3fr) 56px minmax(0,1fr);gap:14px 16px;align-items:center;margin:14px 0}.t-map span{font:italic 700 19px/1.4 WWBody}.t-map b{font-size:40px;line-height:1.05;font-weight:600}
.t-asset{margin:0;flex:1;background:var(--tint);padding:18px;text-align:center}.t-asset img{display:block;width:min(100%,430px);height:auto;margin:auto}
.parts.t-flow{grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 64px}.t-flow .part{position:relative}.t-flow .part:nth-child(5){grid-column:1/-1;border-top:3px solid var(--accent);padding-top:6px}
.t-flow .part>.t-link{position:absolute;left:-60px;top:62px}.t-step{border-top:3px solid var(--accent);padding-top:14px}.t-step h3{font-size:31px;margin:6px 0}.t-step p,.t-flow .part:first-child p{font-size:16px}
.t-moment{margin:0 0 6px;aspect-ratio:1/0.72;overflow:hidden;position:relative;background:#2541e0}.t-moment img{position:absolute;width:125%;left:-14%;bottom:0;display:block}
.tabs-wrap{top:env(safe-area-inset-top,0px)}body.reading-mode main,body.reading-mode .tabs-wrap,body.reading-mode .header-actions{display:none}.reading-bar{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.reading-wrap{max-width:1180px;margin:auto;padding:24px 4vw 64px}.reading-slide{border-top:1px solid var(--line);padding:28px 0}.reading-slide h2{font:600 clamp(36px,4vw,56px)/1.08 var(--heading),cursive;margin:10px 0 24px}.reading-slide .note{background:var(--tint);padding:16px;font-size:14px;margin-top:24px}
@media(max-width:900px){.parts.t-transform{display:flex;flex-direction:column;gap:24px}.t-transform .part:nth-child(3){display:block}.t-transform .part:nth-child(3)>.t-link{transform:rotate(90deg);margin:0 0 8px 4px;width:40px}.t-asset img{width:min(100%,460px)}.parts.t-flow{grid-template-columns:1fr 1fr}.t-flow .part:nth-child(3)>.t-link{display:none}}
@media(max-width:640px){.parts.t-open,.parts.t-transform,.parts.t-flow{display:flex;flex-direction:column;gap:22px}.t-transform .part:nth-child(3){display:block}.t-link{transform:rotate(90deg);margin:0 0 6px 4px;width:40px}.t-flow .part>.t-link,.t-flow .part:nth-child(3)>.t-link{position:static;display:block}.t-map{grid-template-columns:1fr;gap:4px}.t-map .t-link{margin:2px 0 6px}.t-map b{font-size:36px;margin-bottom:10px}.t-page{padding:16px 14px}.t-crop-inner{width:208%}.t-moment{max-width:300px}}
@media(prefers-reduced-motion:reduce){.revealed .t-link,.revealed .t-mark{animation:none}}
`;
const viewer=fs.readFileSync(dist('library.js'),'utf8');
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
// --artifact DIR: page plus a same-origin content file, for viewers whose CSP blocks blob: scripts.
const artifactDir=process.argv[2]==='--artifact'?process.argv[3]:null,artifact=!!artifactDir;
const sourceLine=artifact?"window.__trialDeck=deck;register[0].source='trial-content.js';":"register[0].source=URL.createObjectURL(new Blob(['window.WW='+JSON.stringify(deck)+';'],{type:'text/javascript'}));";

const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${label.title}</title><meta name="description" content="Whiteboard Wednesdays three-slide calibration trial. Not published.">
<!-- Fonts: Caveat, Instrument Sans, IBM Plex Mono and Fraunces under the SIL Open Font Licence 1.1. Licence texts: dist/ww-*-license.txt. -->
<style>${css}${trialCss}${spec?spec.css:''}</style></head><body>
<a class="skip" href="#canvas">Skip to presentation</a>
<header class="site-header"><a href="#/library" class="site-name">Whiteboard<br><b>Wednesdays</b><span class="micro">${label.header}</span></a><div class="header-actions"><button id="library-button">Library</button><button id="brand-button" hidden>Preview branding</button><button id="fullscreen" hidden>Present full screen</button></div></header>
<div class="tabs-wrap"><nav id="presentation-tabs" role="tablist" aria-label="Presentations"></nav><span class="tabs-hint" hidden>Scroll for more →</span></div>
<main><section id="library"><div class="library-heading"><div><div class="micro">${label.eyebrow} <span class="trial-flag">TRIAL</span></div><h1>Ideas worth<br><em>showing.</em></h1><p>${label.intro}</p></div><img data-asset="COIN" alt="Pecuna Factorem original coin"></div><div id="library-cards"></div></section>
<section id="player" hidden role="tabpanel"><div class="deck-head"><img id="deck-logo" alt=""><div><div id="brand-name" class="micro"></div><div id="deck-title" class="deck-title"></div><small id="brand-preview" hidden>Browser-only brand preview</small></div><button id="index-button">Chapters <span id="chapter-count"></span></button></div><article id="canvas" tabindex="-1" aria-label="Presentation slide"></article><div class="controls"><button id="back">← Back</button><button id="replay">Replay slide</button><button id="exit-presentation">Exit full screen</button><span id="progress" aria-live="polite"></span><button id="next" class="primary">Next reveal →</button></div><div class="under-controls"><span>Click empty slide space to reveal · ← → or Space</span><a id="reading-link">Complete reading view</a><button id="notes-button" aria-expanded="false">Source &amp; presenter notes</button></div><aside id="notes" hidden></aside></section>
<section id="message" hidden role="status"><h1 id="message-title"></h1><p id="message-detail"></p><a href="#/library">Return to library</a></section></main>
<dialog id="chapters"><div class="dialog-head"><h2>Chapters</h2><button data-close>Close</button></div><nav id="chapter-list" aria-label="Presentation chapters"></nav></dialog>
<dialog id="brand-dialog"><div class="dialog-head"><h2>Preview your brand.</h2><button data-close>Close</button></div><p>These changes apply only in this browser. They are never saved as published branding.</p><form id="brand-form"><label>Brand name<input name="name" maxlength="70"></label><label>Original logo<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div class="colour-fields"><label>Background<input type="color" name="surface"></label><label>Text<input type="color" name="ink"></label><label>Accent<input type="color" name="accent"></label></div><label>Heading font<select name="font"><option value="hand">Caveat · whiteboard</option><option value="editorial">Fraunces · editorial</option><option value="clean">Instrument Sans · clean</option></select></label><p id="contrast-status" role="status"></p><button type="submit" class="primary">Apply browser preview</button><button type="button" id="reset-brand">Restore published brand</button></form></dialog>
<section id="reading-view" class="reading-wrap" hidden aria-label="Complete reading view"></section>
<div id="toast" hidden role="status"></div>
<script id="viewer-source" type="text/plain">${viewer.replace(/<\/script/gi,'<\\/script')}</script>
<script>
(()=>{
const assets=${json(assets)},urls={};
for(const k in assets){const [h,b]=assets[k].split(',');const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);urls[k]=URL.createObjectURL(new Blob([u],{type:h.slice(5,-7)}));}
const fill=v=>{let t=JSON.stringify(v);for(const k in urls)t=t.split('{{'+k+'}}').join(urls[k]);return JSON.parse(t);};
const deck=fill(${json(deck)}),register=fill(${json(register)});
document.querySelectorAll('[data-asset]').forEach(i=>i.src=urls[i.dataset.asset]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reading=document.getElementById('reading-view');
reading.innerHTML='<div class="reading-bar"><div class="micro">COMPLETE READING VIEW · ALL REVEALS SHOWN</div><button id="close-reading" class="primary">Back to the presentation</button></div>'+deck.slides.map((s,i)=>'<article class="reading-slide" id="read-'+s.id+'"><div class="micro">'+String(i+1).padStart(2,'0')+' · '+esc(s.section)+'</div><h2>'+esc(s.title)+'</h2><div class="parts '+s.kind+'">'+s.parts.map(p=>'<section class="part revealed">'+p+'</section>').join('')+'</div><p class="note">'+esc(s.source)+' '+esc(s.note)+'</p></article>').join('')+'<p class="note">'+esc(register[0].sourceNote)+'</p>';
const openReading=()=>{document.body.classList.add('reading-mode');reading.hidden=false;scrollTo(0,0);document.getElementById('close-reading').focus();};
document.getElementById('close-reading').onclick=()=>{document.body.classList.remove('reading-mode');reading.hidden=true;scrollTo(0,0);};
document.addEventListener('click',e=>{if(e.target.closest('#reading-link')){e.preventDefault();openReading();}},true);
document.addEventListener('keydown',e=>{if(!reading.hidden)e.stopPropagation();},true);
if(new URLSearchParams(location.search).get('view')==='reading')openReading();
${sourceLine}
window.presentationRegister=register;
if(!location.hash)history.replaceState(null,'','#/presentation/'+register[0].id);
const viewer=document.createElement('script');viewer.textContent=document.getElementById('viewer-source').textContent.replace("logo:'ww-coin.svg'","logo:'"+urls.COIN+"'");document.body.append(viewer);
${spec?spec.js:''}
})();
</script></body></html>`;
if(artifact){
 const page=html.replace(/^<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">/,'').replace('<title>'+label.title+'</title>','<title>'+label.artifactTitle+'</title>').replace('</head><body>','').replace(/<\/body><\/html>$/,'');
 fs.writeFileSync(path.join(artifactDir,'index.html'),page);fs.writeFileSync(path.join(artifactDir,'trial-content.js'),'window.WW=window.__trialDeck;delete window.__trialDeck;\n');
 console.log('Wrote artifact page to',artifactDir,(page.length/1e6).toFixed(2)+' MB');
}else{
 fs.writeFileSync(path.join(__dirname,label.file),html);
 console.log('Wrote '+label.file,(html.length/1e6).toFixed(2)+' MB');
}
