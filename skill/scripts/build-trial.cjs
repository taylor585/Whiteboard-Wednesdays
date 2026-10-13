#!/usr/bin/env node
// Whiteboard Wednesdays trial builder v2.0.
// Builds a self-contained, unpublished trial page from a deck spec, reusing the project's own viewer verbatim:
// dist/library.js, dist/whiteboard.css, dist/library.css and the bundled fonts. Add the device kit, and the
// recording tools when the spec asks for them. Write the output outside the static build directory.
//
// Usage: node build-trial.cjs <deck-spec.cjs> [--brand PROFILE.json] [--dist DIR] [--out FILE] [--artifact OUT_DIR]
//   --brand     the confirmed brand profile (default: the spec's brandProfile). Required: see references/branding.md
//   --dist      the project's static build directory (default: dist, relative to the working directory). When it holds
//               library.js, the project's own viewer is used; otherwise the bundled snapshot in viewer/ and assets/ is used
//   --out       write the page here instead of the spec's file
//   --artifact  also write OUT_DIR/index.html + OUT_DIR/trial-content.js for a private preview host whose
//               content security policy blocks blob: scripts (for example a claude.ai private page)
//
// A deck spec exports ({fs, path, uri, dist, assets, arrow, source}) => spec, where spec has:
//   deck {slides:[{id,title,section,kind,parts,reveals,source,note}]}, register [one entry],
//   css (deck-only layouts), tools (true to add the recording tools), file (output path, relative to the spec),
//   title, artifactTitle, header, eyebrow, intro (page labels).
// Asset placeholders such as {{AD}} in slide HTML are replaced at runtime with blob URLs, so each image is embedded once.
const fs=require('node:fs'),path=require('node:path');
const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf(k);return i>=0?argv[i+1]:null;};
const specPath=path.resolve(argv[0]||'');
if(!argv[0]||!fs.existsSync(specPath)){console.error('Usage: node build-trial.cjs <deck-spec.cjs> [--dist DIR] [--artifact OUT_DIR]');process.exit(2);}
const skillDir=path.resolve(__dirname,'..');
const distDir=path.resolve(opt('--dist')||'dist'),hasProject=fs.existsSync(path.join(distDir,'library.js'));
// Project files win: decks must match the viewer that will actually present them.
const viewerDir=hasProject?distDir:path.join(skillDir,'viewer'),assetDir=hasProject?distDir:path.join(skillDir,'assets');
const dist=p=>path.join(hasProject?distDir:assetDir,p);
console.log('Viewer: '+(hasProject?'project '+path.relative(process.cwd(),distDir):'bundled snapshot (no project dist found)'));
const uri=(file,type)=>'data:'+type+';base64,'+fs.readFileSync(file).toString('base64');
const mime=f=>({'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'})[path.extname(f).toLowerCase()]||'application/octet-stream';
const assets={};
const arrow='<svg class="t-link" viewBox="0 0 64 24" aria-hidden="true"><path d="M2 12 H58 M48 3 L58 12 L48 21"/></svg>';
const source=require('./source-tools.cjs');
const spec=require(specPath)({fs,path,uri,dist,assets,arrow,source});
const {deck,register}=spec;

// Brand-first gate: a deck builds only with a brand profile the user confirmed for this deck ID.
const brandPath=opt('--brand')?path.resolve(opt('--brand')):spec.brandProfile?path.resolve(path.dirname(specPath),spec.brandProfile):null;
if(!brandPath||!fs.existsSync(brandPath))throw Error('Brand first: give a confirmed brand profile with --brand or spec.brandProfile. Ask the user which brand this deck uses (see references/branding.md).');
const brand=JSON.parse(fs.readFileSync(brandPath,'utf8')),c=brand.confirmation||{};
for(const k of ['name','surface','ink','accent','font','logo'])if(!brand[k])throw Error('Brand profile is missing '+k+': '+brandPath);
if(!(c.confirmed===true&&c.by==='user'&&c.at&&c.evidence&&c.evidence.trim()))throw Error('Brand first: '+path.basename(brandPath)+' is not confirmed by the user. Ask, wait for the answer and record it; never mark it confirmed yourself.');
if(!(c.decks||[]).includes(register[0].id))throw Error('Brand first: '+path.basename(brandPath)+' is confirmed for '+((c.decks||[]).join(', ')||'no decks')+', not '+register[0].id+'. Ask whether this brand applies to the new deck.');
const lum=h=>{const v=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
for(const k of ['ink','accent'])if(ratio(brand[k],brand.surface)<4.5)throw Error('Brand '+k+' '+brand[k]+' is below 4.5:1 on '+brand.surface+'. Propose an accessible variant and get agreement.');
const logoFile=path.resolve(path.dirname(brandPath),brand.logo);
assets.COIN=uri(logoFile,mime(logoFile));
register[0].brand={name:brand.name,surface:brand.surface,ink:brand.ink,accent:brand.accent,font:brand.font,logo:'{{COIN}}'};

// Structural validation before anything is written.
const ids=new Set();
for(const s of deck.slides){
 if(ids.has(s.id))throw Error('Duplicate slide id: '+s.id);ids.add(s.id);
 if(s.reveals.length!==s.parts.length)throw Error(s.id+': reveals must have one entry per part');
 const groups=[...new Set(s.reveals)].sort((a,b)=>a-b);if(groups.some((g,i)=>g!==i+1))throw Error(s.id+': reveal groups must start at 1 and be contiguous');
 if(!s.source||!s.source.startsWith('Source:'))throw Error(s.id+': give a short audience-facing source line starting "Source:"');
 if(/\bTODO\b/.test([s.title,s.section,s.source,s.note,...s.parts].join(' ')))throw Error(s.id+': unresolved TODO placeholder. Replace it with real, sourced content.');
}
// Variety rule: no two consecutive slides use the same device or layout, and at least three different ones per deck.
const kinds=deck.slides.map(s=>s.kind),allowed=new Set(spec.repeatAllowed||[]);
kinds.forEach((k,i)=>{if(i&&k===kinds[i-1]&&!allowed.has(deck.slides[i].id))throw Error('Variety rule: '+deck.slides[i].id+' repeats the '+k+' device. Record an exception in spec.repeatAllowed if it is deliberate.');});
if(deck.slides.length>=3&&new Set(kinds).size<3)throw Error('Variety rule: use at least three different devices.');

let css=fs.readFileSync(path.join(viewerDir,'whiteboard.css'),'utf8');
for(const f of ['ww-caveat.ttf','ww-body.ttf','ww-display.ttf','ww-mono.ttf'])css=css.replace('url('+f+')','url('+uri(path.join(assetDir,f),'font/ttf')+')');
css+=fs.readFileSync(path.join(viewerDir,'library.css'),'utf8')+fs.readFileSync(path.join(__dirname,'device-kit.css'),'utf8')+(spec.css||'');
const kit=spec.tools?fs.readFileSync(path.join(__dirname,'device-kit.js'),'utf8'):'';
const viewer=fs.readFileSync(path.join(viewerDir,'library.js'),'utf8');
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const artifactDir=opt('--artifact');
const sourceLine=artifactDir?"window.__trialDeck=deck;register[0].source='trial-content.js';":"register[0].source=URL.createObjectURL(new Blob(['window.WW='+JSON.stringify(deck)+';'],{type:'text/javascript'}));";
const kitStart=spec.tools?'WWDeviceKit(deck);':'';

const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${spec.title}</title><meta name="description" content="Whiteboard Wednesdays trial. Not published.">
<!-- Fonts: Caveat, Instrument Sans, IBM Plex Mono and Fraunces under the SIL Open Font Licence 1.1. Licence texts: ww-*-license.txt beside the font files. -->
<style>${css}</style></head><body>
<a class="skip" href="#canvas">Skip to presentation</a>
<header class="site-header"><a href="#/library" class="site-name">Whiteboard<br><b>Wednesdays</b><span class="micro">${spec.header}</span></a><div class="header-actions"><button id="library-button">Library</button><button id="brand-button" hidden>Preview branding</button><button id="fullscreen" hidden>Present full screen</button></div></header>
<div class="tabs-wrap"><nav id="presentation-tabs" role="tablist" aria-label="Presentations"></nav><span class="tabs-hint" hidden>Scroll for more →</span></div>
<main><section id="library"><div class="library-heading"><div><div class="micro">${spec.eyebrow} <span class="trial-flag">TRIAL</span></div><h1>Ideas worth<br><em>showing.</em></h1><p>${spec.intro}</p></div><img data-asset="COIN" alt="${brand.name.replace(/"/g,'&quot;')} official logo"></div><div id="library-cards"></div></section>
<section id="player" hidden role="tabpanel"><div class="deck-head"><img id="deck-logo" alt=""><div><div id="brand-name" class="micro"></div><div id="deck-title" class="deck-title"></div><small id="brand-preview" hidden>Browser-only brand preview</small></div><button id="index-button">Chapters <span id="chapter-count"></span></button></div><article id="canvas" tabindex="-1" aria-label="Presentation slide"></article><div class="controls"><button id="back">← Back</button><button id="replay">Replay slide</button><button id="exit-presentation">Exit full screen</button><span id="progress" aria-live="polite"></span><button id="next" class="primary">Next reveal →</button></div><div class="under-controls"><span>Click empty slide space to reveal · ← → or Space</span><a id="reading-link">Complete reading view</a><button id="notes-button" aria-expanded="false">Source &amp; presenter notes</button></div><aside id="notes" hidden></aside></section>
<section id="message" hidden role="status"><h1 id="message-title"></h1><p id="message-detail"></p><a href="#/library">Return to library</a></section></main>
<dialog id="chapters"><div class="dialog-head"><h2>Chapters</h2><button data-close>Close</button></div><nav id="chapter-list" aria-label="Presentation chapters"></nav></dialog>
<dialog id="brand-dialog"><div class="dialog-head"><h2>Preview your brand.</h2><button data-close>Close</button></div><p>These changes apply only in this browser. They are never saved as published branding.</p><form id="brand-form"><label>Brand name<input name="name" maxlength="70"></label><label>Original logo<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div class="colour-fields"><label>Background<input type="color" name="surface"></label><label>Text<input type="color" name="ink"></label><label>Accent<input type="color" name="accent"></label></div><label>Heading font<select name="font"><option value="hand">Caveat · whiteboard</option><option value="editorial">Fraunces · editorial</option><option value="clean">Instrument Sans · clean</option></select></label><p id="contrast-status" role="status"></p><button type="submit" class="primary">Apply browser preview</button><button type="button" id="reset-brand">Restore published brand</button></form></dialog>
<section id="reading-view" class="reading-wrap" hidden aria-label="Complete reading view"></section>
<div id="toast" hidden role="status"></div>
<script id="viewer-source" type="text/plain">${viewer.replace(/<\/script/gi,'<\\/script')}</script>
${kit?'<script>'+kit.replace(/<\/script/gi,'<\\/script')+'</script>':''}
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
${kitStart}
})();
</script></body></html>`;
if(artifactDir){
 const page=html.replace(/^<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">/,'').replace('<title>'+spec.title+'</title>','<title>'+spec.artifactTitle+'</title>').replace('</head><body>','').replace(/<\/body><\/html>$/,'');
 fs.mkdirSync(artifactDir,{recursive:true});
 fs.writeFileSync(path.join(artifactDir,'index.html'),page);fs.writeFileSync(path.join(artifactDir,'trial-content.js'),'window.WW=window.__trialDeck;delete window.__trialDeck;\n');
 console.log('Wrote private preview to',artifactDir,(page.length/1e6).toFixed(2)+' MB');
}else{
 const out=opt('--out')?path.resolve(opt('--out')):path.resolve(path.dirname(specPath),spec.file);
 if(hasProject&&out.startsWith(distDir+path.sep))throw Error('Refusing to write a trial inside the static build directory: '+out);
 fs.writeFileSync(out,html);
 console.log('Wrote '+path.relative(process.cwd(),out),(html.length/1e6).toFixed(2)+' MB');
}
module.exports={spec};
