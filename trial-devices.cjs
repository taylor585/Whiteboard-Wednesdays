// Device-library trial: eight visual devices plus recording tools, built with the calibration shell.
// Build: TRIAL=devices node build-trial-calibration.cjs [--artifact DIR]
// All quotations, figures and copy come from dist/ww-report.pdf, the live paid ads deck or its retained assets.
module.exports=({fs,path,uri,dist,assets,arrow})=>{
assets.LANDING=uri(dist('ww-landing.png'),'image/png');
// Report page 13 rendered at 300 dpi: pdftoppm -f 13 -l 13 -r 300 -png dist/ww-report.pdf (64-colour palette PNG).
assets.PAGE=uri(path.join(__dirname,'trial-report-p13.png'),'image/png');
const ad='{{AD}}',landing='{{LANDING}}',page='{{PAGE}}',coin='{{COIN}}';

// Verbatim quotes RED-001 to RED-010, report pages 12 and 13. Checked against the report text at build time.
const quotes=[
 ['RED-001','r/MedSpa','We\'re trying to decide between using Aesthetix CRM or Podium\'s new expanded CRM capabilities (incl. Podium VOIP phones).'],
 ['RED-002','r/MedSpa','Lesson: When comparing software, support + migration + flexibility matter more than having 47 features you\'ll barely use.'],
 ['RED-003','r/MedSpa','RepeatMD seems focused on rewards and in-app purchases. Any practice owners have first-hand experience, good or bad?'],
 ['RED-004','r/MedSpa','Practice Management Software / EMR / CRM. Changing later is SOOO painful. And you lose data every time you make a change.'],
 ['RED-005','r/MedSpa','I\'m looking into softwares I need, and know I\'ll need a CRM and a booking software.'],
 ['RED-006','r/MedSpa','I’m looking for recommendations for a software solution that can handle everything in one place: patient records, appointment booking, staff scheduling, sales, and inventory management, all synced together.'],
 ['RED-007','r/MedSpa','Right now we’re looking at Pabau, and on paper it seems pretty solid, but it’s hard to know how these platforms really perform once you’re deep into daily use.'],
 ['RED-008','r/MedSpa','i know exactly how many clients we\'re losing to this. someone googles medspa, tries calling, no answer, books at the place next door instead.'],
 ['RED-009','r/MedSpa','Right now, we use PatientNow Pro as our EMR and HubSpot as our CRM to manage leads. The problem is, PatientNow Pro doesn’t integrate with HubSpot natively.'],
 ['RED-010','r/MedSpaGrowth','If you’re choosing software this year, here’s a breakdown of the most talked-about med spa platforms and what they’re generally known for.']
];
// Whitespace is removed on both sides because raw extraction drops inter-word spaces; every other character must match.
const norm=s=>s.replace(/\s+/g,'');
const report=norm(require('node:child_process').execFileSync('pdftotext',['-f','12','-l','13','-raw',dist('ww-report.pdf'),'-']).toString());
for(const [id,,q] of quotes)if(!report.includes(norm(q)))throw Error('Quote not found verbatim in report: '+id);

const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const wall=quotes.map(([id,src,q],i)=>'<figure class="d-q'+(id==='RED-008'?' is-pick':'')+'" style="--r:'+(i%3-1)*0.7+'deg"><blockquote>“'+(id==='RED-008'?esc(q).replace('no answer','<mark>no answer</mark>').replace('books at the place next door instead.','<mark>books at the place next door instead.</mark>'):esc(q))+'”</blockquote><figcaption>'+id+' · '+src+'</figcaption></figure>').join('');

// Zoom geometry. Page aspect from the PDF (595.92 x 842.88 pt). Region = the RED-008 quote cell, as page fractions.
const pageAspect=595.92/842.88,region={x0:.345,x1:.655,y0:.071,y1:.164};
const zoom=a=>{const f=pageAspect*a,L=(1-f)/2,s=(1/f)/(region.x1-region.x0),yc=(region.y0+region.y1)/2;
 return {box:'width:'+(f*100).toFixed(3)+'%;left:'+(L*100).toFixed(3)+'%',to:'translate('+((-L/f-s*region.x0)*100).toFixed(3)+'%,'+((s*(region.y1-region.y0)<.5?.06-s*region.y0:.5-s*yc)*100).toFixed(3)+'%) scale('+s.toFixed(4)+')'};};
const zd=zoom(.72),zp=zoom(.86);
// Highlights in PDF points, from pdftotext -bbox: "no answer", "books", "at the place next door instead."
const hl=[[280.1,107.4,51.5,12.8],[335.3,107.4,32,12.8],[218.5,122.4,154.7,12.8]].map(([x,y,w,h],i)=>'<rect class="d-hl" style="--d:'+(i*140)+'ms" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1.5"/>').join('');

const words=[['“someone',0],['googles',0],['medspa,',0],['tries',0],['calling,',0],['no answer',1],[',',0],['books',0],['at',0],['the',0],['place',0],['next',1],['door',0],['instead.”',0]];
const morphQuote=words.map(([w,k])=>'<span class="'+(k?'d-keep':'d-drop')+'">'+w+'</span>').join(' ').replace(' <span class="d-drop">,</span>','<span class="d-drop">,</span>');
let li=0;const letters=(t,c)=>'<span class="'+c+'">'+[...t].map(ch=>ch===' '?' ':'<span class="d-l" style="--i:'+(li++)+'">'+ch+'</span>').join('')+'</span>';
const headline='<p class="d-head hand" aria-label="No answer. Next clinic?"><span aria-hidden="true">'+letters('No answer.','k')+' '+letters('Next','k')+' '+letters('clinic?','a')+'</span></p>';

// Annotation strokes in ad pixels (1122 x 1402). pathLength=1 lets CSS draw each stroke.
const stroke=(d)=>'<path class="halo" pathLength="1" d="'+d+'"/><path class="ink" pathLength="1" d="'+d+'"/>';
const badge=(n,x,y)=>'<g class="badge"><circle cx="'+x+'" cy="'+y+'" r="34"/><text x="'+x+'" y="'+(y+15)+'" text-anchor="middle">'+n+'</text></g>';
const annotations=[
 stroke('M58 198 C70 128 430 116 714 138 C872 158 884 342 782 432 C620 488 136 478 52 396 C14 344 24 238 98 204')+badge(1,862,168),
 stroke('M70 592 C190 602 310 585 446 597')+stroke('M92 608 C210 614 322 600 432 610')+badge(2,492,545),
 stroke('M56 616 L502 608 L498 720 L60 724 Z')+badge(3,548,664),
 stroke('M1088 650 C1090 730 1040 800 952 846')+stroke('M952 846 L992 812')+stroke('M952 846 L1004 852')+badge(4,1088,610)
].map((g,i)=>'<g class="d-a d-a'+(i+1)+'">'+g+'</g>').join('');
const note=(n,h,p,s)=>'<div class="d-note"><span class="d-n">'+n+'</span><div><h3>'+h+'</h3><p>'+p+'</p><small>'+s+'</small></div></div>';

const hotspots=[
 {x:44,y:35,label:'Headline',h:'The buyer’s own moment',p:'The headline mirrors the research language “no answer”.',s:'RED-008 · report p. 13 · adapted headline'},
 {x:94.5,y:23.8,label:'Three-step panel',h:'Who owns follow-up?',p:'Define the operator’s responsibilities and the Ops Lead’s oversight.',s:'RED-002 · report p. 7 · support ownership'},
 {x:97.7,y:90,label:'Scope note',h:'Will this work with our setup?',p:'Check the existing CRM, booking tools and handoffs before recommending scope.',s:'RED-009 · report p. 8 · systems fit'},
 {x:36,y:84.4,label:'Call to action',h:'What am I agreeing to?',p:'Review scope, fees and terms after discovery, before ongoing delivery.',s:'RED-002 · report p. 7 · commitment'}
];
const hot=hotspots.map((h,i)=>'<button class="d-hot" type="button" data-hot="'+i+'" style="left:'+h.x+'%;top:'+h.y+'%" aria-pressed="false" aria-label="'+(i+1)+': '+h.label+'">'+(i+1)+'</button>').join('');
const wire='<div class="d-wire" aria-hidden="true">'+arrow+'<span class="d-dot"></span></div>';
const count=(n,label,src)=>'<div class="d-count"><b class="d-num" data-count="'+n+'">'+n+'</b><p>'+label+'</p><small>'+src+'</small></div>';
const placeholder='<div class="d-post d-ghost" aria-hidden="true"><div class="d-post-head"><i></i><span></span></div><div class="d-ghost-lines"><span></span><span></span></div><div class="d-ghost-img"></div></div>';

const S=(n,name)=>'Device '+n+' of 8 / '+name;
const deck={slides:[
{id:'device-counts',title:'The depth behind one line.',section:S(1,'Animated counts'),kind:'d-counts',reveals:[1,2,3,4],
 source:'Source: ICP-Research-Radar, Cadre Crew. Report pp. 5 and 85, and the 154-page PDF. Selected qualitative evidence, not a population study.',
 parts:[count(222,'Reddit comments reviewed','Report p. 5'),count(90,'evidence records selected, 30 per ICP','Report p. 5'),count(48,'contributing subreddits','Report p. 85'),count(154,'pages in the complete report','ICP-Research-Radar PDF')],
 note:'Device: animated counts. Use only real, sourced figures; each number counts up when revealed and shows its final value in the reading view and with reduced motion. The 90 records span three ICPs; med spas are one of them. Not a population study.'},
{id:'device-wall',title:'Ten quotes. One scene.',section:S(2,'Quote wall'),kind:'d-wall',reveals:[1,2,3],
 source:'Source: ICP-Research-Radar, report pp. 12–13, Real-Life Quotes RED-001 to RED-010. Public discussion quotes, not client testimonials.',
 parts:['<div class="d-wall-grid">'+wall+'</div>',
  '<p class="d-wall-cap"><b>RED-008 shows a scene.</b> A search, a call, no answer, a booking elsewhere.</p><small>The quote is exact. This reading of it is ours.</small>',
  '<p class="hand statement">Pick the quote they can picture.</p>'],
 note:'Device: quote wall. Every quote is verbatim from the report and checked at build time. Reveal 2 fades the wall and lifts RED-008. Shows breadth before focus, so the chosen line is not cherry-picked out of sight.'},
{id:'device-zoom',title:'One line from 154 pages.',section:S(3,'Zoom into the source'),kind:'d-zoom',reveals:[1,2,3],
 source:'Source: ICP-Research-Radar, Cadre Crew, report page 13, RED-008. Public r/MedSpa discussion.',
 parts:['<figure class="d-frame"><div class="d-page"><img src="'+page+'" width="2483" height="3512" alt="ICP-Research-Radar report page 13: Real-Life Quotes rows 8 to 10 and the Strategic Interpretation table."><svg viewBox="0 0 595.92 842.88" aria-hidden="true">'+hl+'</svg></div></figure><div class="micro">ICP-RESEARCH-RADAR · REPORT PAGE 13 OF 154</div>',
  '<p class="d-zoom-cap"><b>RED-008 · r/MedSpa</b><br>“someone googles medspa, tries calling, no answer, books at the place next door instead.”</p><small>Public discussion quote, not a client testimonial.</small>',
  '<p class="hand statement">Keep the source, page and meaning.</p>'],
 note:'Device: zoom into the source. Reveal 1 shows the whole real page for context; reveal 2 moves in to the RED-008 cell and highlights only the words used. Highlights are placed from PDF word coordinates. The camera move is 600ms, a deliberate exception to the 200ms baseline.'},
{id:'device-morph',title:'Keep their words. Add one.',section:S(4,'Words that morph'),kind:'d-morph',reveals:[1,2,3],
 source:'Source: RED-008, report page 13. “No answer. Next clinic?” is authored copy, not a quotation.',
 parts:['<div class="micro">THE EXACT SOURCE / RED-008 · P. 13</div><blockquote class="d-quote">'+morphQuote+'</blockquote>',
  '<p><b>Drop what the ad does not need.</b> Keep the words that carry the moment.</p>',
  '<div class="micro">ADAPTED HEADLINE / AUTHORED COPY</div>'+headline+'<p class="d-legend"><span class="k">Kept from the quote</span> <span class="a">Added by us</span></p>'],
 note:'Device: words that morph. Shows exactly which source words survive into the headline and which word was added. Keeps the boundary between quotation and adaptation visible.'},
{id:'device-annotate',title:'Every mark has a reason.',section:S(5,'Marker annotations'),kind:'d-annot',reveals:[1,2,3,4,5],
 source:'Source: Cadre Crew static (illustrative, not launched) and the live deck’s image method notes.',
 parts:['<figure class="d-ad"><img src="'+ad+'" width="1122" height="1402" alt="Cadre Crew static advert. Headline: No answer. Next clinic? Subhead: AI call handling. Human follow-up. Button: Request a clinic audit. A black desk phone on a blue panel."><svg viewBox="0 0 1122 1402" aria-hidden="true">'+annotations+'</svg></figure>',
  note(1,'The buyer’s own moment','The selected headline makes the research situation immediate.','RED-008 · report p. 13 · adapted headline'),
  note(2,'How it works, at a glance','AI call handling. Human follow-up.','Service mechanism from the Cadre Crew offer'),
  note(3,'One next step','Request a clinic audit. It starts with a 30-minute discovery call.','An audit, not a promised booking'),
  note(4,'The problem made concrete','The headline earns the first look. The phone makes the problem concrete.','Client branding retained')],
 note:'Device: marker annotations. Strokes are editable SVG drawn over the real asset, one decision per reveal, with numbers matching the notes. Never annotate a claim the asset does not make.'},
{id:'device-feed',title:'See it where they scroll.',section:S(6,'In-feed preview'),kind:'d-feed',reveals:[1,2,3],
 source:'Source: Cadre Crew static and approved ad copy. Illustrative feed mock-up; grey blocks stand in for other posts. Not a platform interface.',
 parts:['<div class="d-phone" role="img" aria-label="Illustrative phone feed with the Cadre Crew ad between two placeholder posts"><div class="d-screen"><div class="d-feed-inner">'+placeholder+'<div class="d-post"><div class="d-post-head"><i></i><b>Cadre Crew</b><em>Ad</em></div><p>A missed ring can become somebody else’s booking.</p><img src="'+ad+'" width="1122" height="1402" alt=""><div class="d-cta">Request a clinic audit</div></div>'+placeholder+'</div></div></div>',
  '<p><b>Check it at phone size.</b> The frame is a 320px-wide feed. Read the headline as a scroller would.</p><small>Illustrative mock-up, not a platform interface.</small>',
  '<div class="thumbnail-proof"><img src="'+ad+'" width="200" alt="Cadre Crew advert at 200 CSS pixels wide"><div><div class="micro">200 PX CHECK</div><p>Can the headline be read at feed size?</p><small>Then check the placement crop and safe zones.</small></div></div>'],
 note:'Device: in-feed preview. Shows the finished creative at the size buyers meet it. Placeholder posts carry no invented brands, text or engagement figures.'},
{id:'device-tap',title:'Tap the page. See why.',section:S(7,'Tap the page'),kind:'d-tap',reveals:[1,2],
 source:'Source: Cadre Crew landing page prototype; objections from report pp. 7, 8 and 13. Proposed mapping, not measured behaviour.',
 parts:['<div class="d-tapwrap"><div class="d-tap-img"><img src="'+landing+'" width="1100" height="630" alt="Cadre Crew landing page hero: No answer. Next clinic? AI answers the call. A human owns what happens next. Three-step panel and Request a clinic audit button.">'+hot+'</div><div class="d-tap-panel" aria-live="polite"><div class="micro">TAP A NUMBER</div><p>Each numbered part of the page answers a buyer question from the research.</p></div></div>',
  '<p><b>The reading order is designed.</b> Recognition, then ownership, then systems fit, then commitment.</p><small>Proposed attention path, not measured eye tracking. Test comprehension and qualified bookings.</small>'],
 note:'Device: tap the page. Numbered hotspots are real buttons, so tapping them never advances the slide. Each maps a page element to its research objection and page reference.'},
{id:'device-path',title:'Give each asset a job.',section:S(8,'Path animation'),kind:'d-path',reveals:[1,2,3],
 source:'Source: RED-008, report p. 13, and the retained Cadre Crew ad, landing page and email. Illustrative campaign, not launched.',
 parts:['<div class="micro">01 / PAID AD</div><h3>No answer. Next clinic?</h3><img src="'+ad+'" width="1122" height="1402" alt="Cadre Crew advert"><p>Make the lost-booking consequence recognisable.</p>',
  wire+'<div class="micro">02 / LANDING PAGE</div><h3>Who owns the next action?</h3><img src="'+landing+'" width="1100" height="630" alt="Cadre Crew landing page hero"><p>Explain AI handling, human follow-up and the clinic handoff.</p>',
  wire+'<div class="micro">03 / EMAIL</div><h3>What still needs answering?</h3><div class="d-mail"><small>Subject</small><b>No answer. Next clinic?</b><p>A human owns what happens next.</p></div><p>Return to the source, then explain systems fit and responsibility.</p>'],
 note:'Device: path animation. A marker travels along each connector as the next asset appears, so the audience follows one buyer through three assets. Wording from the live campaign slide.'}
]};

const register=[{id:'trial-devices',title:'Device library trial',description:'All eight visual devices and the recording tools, built on real content from Our paid ads process. Not published.',cover:ad,source:'',reading:'?view=reading',brand:{name:'Pecuna Factorem',surface:'#ffffff',ink:'#1c1a17',accent:'#8b6002',font:'hand',logo:coin},sourceNote:'Device trial from the retained paid ads deck. Cadre Crew research and illustrative assets, not launched advertising.'}];

const css=`
/* Device library trial. */
#player{position:relative}
.d-counts .part,.parts.d-counts{min-width:0}.parts.d-counts{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px 40px}.d-count{border-top:3px solid var(--accent);padding-top:10px}.d-num{display:block;font:600 clamp(64px,7vw,104px)/1 WWHand,cursive;color:var(--accent);font-variant-numeric:tabular-nums}.d-count p{font-size:18px;margin:8px 0 0}
.parts.d-wall{grid-template-columns:1fr}.d-wall-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px 22px}.d-q{margin:0;transform:rotate(var(--r));transition:opacity 300ms ease,transform 300ms ease}.d-q blockquote{font:italic 600 15px/1.42 WWBody,Arial,sans-serif;margin:0 0 6px}.d-q figcaption{font:11px WWMono,monospace;color:var(--muted)}
.parts.d-wall:has(.part:nth-child(2).revealed) .d-q:not(.is-pick){opacity:.16}.parts.d-wall:has(.part:nth-child(2).revealed) .d-q.is-pick{transform:scale(1.32);position:relative;z-index:2;background:var(--surface);box-shadow:0 0 0 16px var(--surface),0 6px 28px 16px color-mix(in srgb,var(--ink) 10%,transparent)}
.d-q:not(.is-pick) mark,.parts.d-wall:not(:has(.part:nth-child(2).revealed)) .is-pick mark{background:none;padding:0}.d-wall-cap{font-size:20px}
.parts.d-zoom{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:20px 48px}.d-zoom .part:first-child{grid-row:span 2}
.d-frame{position:relative;aspect-ratio:1/.72;overflow:hidden;background:var(--tint);margin:0 0 8px}.d-page{position:absolute;top:0;height:100%;${zd.box};transform-origin:0 0;transition:transform 600ms cubic-bezier(.6,0,.2,1);box-shadow:0 2px 12px color-mix(in srgb,var(--ink) 18%,transparent)}.d-page img,.d-page svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.parts.d-zoom:has(.part:nth-child(2).revealed) .d-page{transform:${zd.to}}
.d-hl{fill:#f6df8c;mix-blend-mode:multiply;transform-box:fill-box;transform-origin:left center;transform:scaleX(0)}.parts.d-zoom:has(.part:nth-child(2).revealed) .d-hl{animation:t-sweep 320ms ease-out both;animation-delay:calc(var(--d) + 620ms)}
.d-zoom-cap{font:italic 600 22px/1.4 WWBody,Arial,sans-serif}
.parts.d-morph{grid-template-columns:1fr}.d-quote{font:italic 700 clamp(26px,3vw,40px)/1.4 WWBody,Arial,sans-serif;max-width:1000px}.d-quote span{transition:opacity 300ms ease,color 300ms ease}
.parts.d-morph:has(.part:nth-child(2).revealed) .d-drop{opacity:.28;text-decoration:line-through;text-decoration-color:var(--accent)}.parts.d-morph:has(.part:nth-child(2).revealed) .d-keep{background:#f6df8c;color:#1c1a17;padding:0 4px}
.d-head{font-size:clamp(52px,7vw,96px);line-height:1.05;margin:8px 0 12px}.d-head .k,.d-head .a{white-space:nowrap}.d-head .k{box-shadow:inset 0 -.18em 0 #f6df8c}.d-head .a{color:var(--accent);border-bottom:3px dashed var(--accent)}.d-l{display:inline-block}.revealed .d-l{animation:d-rise 260ms ease-out both;animation-delay:calc(var(--i) * 35ms)}@keyframes d-rise{from{opacity:0;transform:translateY(.35em)}to{opacity:1;transform:none}}
.d-legend{display:flex;gap:24px;font-size:14px}.d-legend .k{box-shadow:inset 0 -.4em 0 #f6df8c}.d-legend .a{color:var(--accent);border-bottom:2px dashed var(--accent)}
.parts.d-annot{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px 48px}.d-annot .part:first-child{grid-row:span 4}.d-ad{position:relative;margin:0;max-width:470px}.d-ad img,.d-ad svg{display:block;width:100%;height:auto}.d-ad svg{position:absolute;inset:0;height:100%}
.d-a{opacity:0}.d-a path{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}.d-a .halo{stroke:#fff;stroke-width:20}.d-a .ink{stroke:#8b6002;stroke-width:9}.badge circle{fill:#8b6002;stroke:#fff;stroke-width:5}.badge text{font:600 46px WWHand,cursive;fill:#fff}
${[1,2,3,4].map(n=>`.parts.d-annot:has(.part:nth-child(${n+1}).revealed) .d-a${n}{opacity:1}.parts.d-annot:has(.part:nth-child(${n+1}).revealed) .d-a${n} path{animation:d-draw 420ms ease-out forwards}`).join('')}
@keyframes d-draw{to{stroke-dashoffset:0}}
.d-note{display:flex;gap:16px;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:10px}.d-n{flex:none;width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--surface);display:grid;place-items:center;font:600 26px WWHand,cursive}.d-note h3{font-size:30px;margin:0 0 4px}.d-note p{margin:0;font-size:17px}
.parts.d-feed{grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:24px 64px}.d-feed .part:first-child{grid-row:span 2}
.d-phone{width:min(100%,336px);border:8px solid var(--ink);border-radius:34px;padding:8px;background:var(--ink)}.d-screen{height:560px;overflow:hidden;border-radius:24px;background:#f3f2f0}.d-feed-inner{padding:10px;display:grid;gap:12px;transition:transform 700ms cubic-bezier(.6,0,.2,1)}
.parts.d-feed:has(.part:nth-child(2).revealed) .d-feed-inner{transform:translateY(-252px)}
.d-post{background:#fff;border-radius:10px;padding:10px;font-size:13px;line-height:1.35}.d-post p{margin:6px 0 8px}.d-post img{display:block;width:100%;height:auto}.d-post-head{display:flex;align-items:center;gap:8px}.d-post-head i{width:26px;height:26px;border-radius:50%;background:#d9d6d0}.d-post-head b{font-size:13px}.d-post-head em{font-style:normal;font-size:11px;color:#5c5750}.d-post-head span{width:90px;height:9px;border-radius:4px;background:#d9d6d0}
.d-cta{margin-top:8px;padding:9px;text-align:center;font-weight:600;background:#2541e0;color:#fff;border-radius:6px}.d-ghost-lines span{display:block;height:8px;border-radius:4px;background:#e4e1dc;margin:10px 0}.d-ghost-lines span+span{width:60%}.d-ghost-img{height:170px;border-radius:6px;background:#e4e1dc}
.parts.d-tap{grid-template-columns:1fr}.d-tapwrap{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:32px;align-items:start}.d-tap-img{position:relative;border:1px solid var(--line)}.d-tap-img img{display:block;width:100%;height:auto}
.d-hot{position:absolute;transform:translate(-50%,-50%);width:44px;height:44px;min-height:44px;padding:0;border-radius:50%;background:var(--accent);color:#fff;border:3px solid #fff;font:600 24px WWHand,cursive;box-shadow:0 2px 8px rgba(0,0,0,.25)}.d-hot:hover{background:var(--ink)}.d-hot[aria-pressed=true]{background:var(--ink);outline:3px solid #f6df8c}
.d-tap-panel{border-left:3px solid var(--accent);padding-left:18px}.d-tap-panel h3{margin:6px 0}
.parts.d-path{grid-template-columns:repeat(3,minmax(0,1fr));gap:28px 64px}.d-path .part{position:relative;border-top:3px solid var(--accent);padding-top:14px}.d-path h3{font-size:30px;margin:6px 0 10px}.d-path img{display:block;height:230px;width:100%;object-fit:contain;object-position:left top}.d-path p{font-size:16px}
.d-wire{position:absolute;left:-60px;top:28px;width:56px;height:24px}.d-wire .t-link{transform:none;margin:0}.d-dot{position:absolute;left:0;top:7px;width:10px;height:10px;border-radius:50%;background:#f6df8c;border:2px solid var(--accent);opacity:0}.revealed .d-dot{animation:d-travel 700ms ease-in-out 120ms}@keyframes d-travel{0%{opacity:1;transform:translateX(0)}85%{opacity:1;transform:translateX(42px)}100%{opacity:0;transform:translateX(46px)}}
.d-mail{background:var(--tint);padding:16px;height:230px}.d-mail small{margin:0;font:11px WWMono,monospace}.d-mail b{display:block;font-size:20px;margin:4px 0 12px}.d-mail p{font-size:17px}
/* Recording tools. */
.d-tools{display:flex;flex-wrap:wrap;gap:6px}.d-tools button{font-size:13px;padding:8px 12px}.d-tools button[aria-pressed=true]{background:var(--ink);color:var(--surface);border-color:var(--ink)}
#d-spot{position:fixed;inset:0;z-index:30;pointer-events:none;background:radial-gradient(circle at var(--x,50%) var(--y,50%),transparent 0,transparent 130px,rgba(28,26,23,.64) 172px)}
#d-pen{position:absolute;z-index:31;touch-action:none;cursor:crosshair}
.d-chip{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:34;display:flex;gap:10px;align-items:center;background:var(--ink);color:var(--surface);padding:8px 8px 8px 14px;border-radius:24px;font:12px WWMono,monospace}.d-chip button{min-height:36px;padding:6px 12px;font-size:12px}
#d-presenter{position:fixed;top:0;right:0;bottom:0;width:min(400px,100%);z-index:33;background:var(--surface);border-left:1px solid var(--line);box-shadow:-8px 0 24px rgba(0,0,0,.12);padding:calc(18px + env(safe-area-inset-top,0px)) 20px 20px;overflow:auto;display:grid;gap:14px;align-content:start}
#d-presenter h2{font:600 32px WWHand,cursive;margin:0}.d-timer{font:600 44px/1 WWMono,monospace;font-variant-numeric:tabular-nums}.d-row{display:flex;gap:8px;flex-wrap:wrap}.d-box{background:var(--tint);padding:12px;font-size:14px}.d-box b{display:block;font-size:16px}#d-cuelist{width:100%;min-height:150px;font:12px/1.5 WWMono,monospace;border:1px solid var(--line);padding:8px}
@media(max-width:900px){.parts.d-counts{grid-template-columns:1fr 1fr}.d-wall-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.parts.d-zoom,.parts.d-annot,.parts.d-feed{display:flex;flex-direction:column;gap:22px}.d-tapwrap{grid-template-columns:1fr}.parts.d-path{grid-template-columns:1fr;gap:20px}.d-wire{position:static;transform:rotate(90deg);margin:0 0 8px 4px;width:40px}.d-path .part{border-top:0;padding-top:0}.d-path img,.d-mail{height:auto;max-height:260px}}
@media(max-width:640px){.d-wall-grid{grid-template-columns:1fr 1fr;gap:14px}.parts.d-wall:has(.part:nth-child(2).revealed) .d-q.is-pick{transform:scale(1.06)}.parts.d-counts{display:grid;grid-template-columns:1fr 1fr}.d-frame{aspect-ratio:1/.86}.d-page{${zp.box}}.parts.d-zoom:has(.part:nth-child(2).revealed) .d-page{transform:${zp.to}}.d-quote{font-size:24px}.d-head{font-size:50px}.d-note h3{font-size:26px}.d-tools button{font-size:12px;padding:8px 10px}}
@media(prefers-reduced-motion:reduce){.d-page,.d-feed-inner,.d-q,.d-quote span{transition:none}.revealed .d-l,.revealed .d-dot{animation:none}.d-dot{display:none}.parts.d-zoom .d-hl{animation:none!important;transform:none}.d-a path{animation:none!important;stroke-dashoffset:0}}
`;

function tools(deck){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const $=s=>document.querySelector(s),el=(t,a={},h='')=>{const e=document.createElement(t);Object.assign(e,a);e.innerHTML=h;return e;};
 const strip=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();};
 const current=()=>{const id=decodeURIComponent(location.hash.split('/').pop()||'');const i=deck.slides.findIndex(s=>s.id===id);const t=$('#progress')?.textContent||'';const m=t.match(/reveal (\d+) \/ (\d+)/);const s=deck.slides[i];return {i,s,step:m?+m[1]:(s?Math.max(...s.reveals):0),max:s?Math.max(...s.reveals):0};};
 const fmt=ms=>{const t=Math.max(0,ms)/1000;return String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(1).padStart(4,'0');};
 // Toolbar.
 const bar=el('div',{className:'d-tools'},'<button type="button" id="tool-spot" aria-pressed="false" title="Spotlight (S)">Spotlight</button><button type="button" id="tool-pen" aria-pressed="false" title="Pen (P)">Pen</button><button type="button" id="tool-clear" title="Clear drawing (C)">Clear</button><button type="button" id="tool-presenter" aria-pressed="false" title="Presenter view (V)">Presenter</button><button type="button" id="tool-cues" aria-pressed="false" title="Record cues (R)">Record cues</button>');
 bar.setAttribute('role','group');bar.setAttribute('aria-label','Recording tools');$('#progress').before(bar);
 // Spotlight.
 const spot=el('div',{id:'d-spot',hidden:true});document.body.append(spot);
 addEventListener('pointermove',e=>{spot.style.setProperty('--x',e.clientX+'px');spot.style.setProperty('--y',e.clientY+'px');},{passive:true});
 // Pen layer sits over the slide but outside #canvas, so strokes never trigger a reveal.
 const pen=el('canvas',{id:'d-pen',hidden:true});$('#player').append(pen);const ctx=pen.getContext('2d');let drawing=null;
 const place=()=>{const c=$('#canvas'),r=devicePixelRatio||1;const keep=pen.width?(()=>{const t=document.createElement('canvas');t.width=pen.width;t.height=pen.height;t.getContext('2d').drawImage(pen,0,0);return t;})():null;
  Object.assign(pen.style,{left:c.offsetLeft+'px',top:c.offsetTop+'px',width:c.offsetWidth+'px',height:c.offsetHeight+'px'});const w=Math.round(c.offsetWidth*r),h=Math.round(c.offsetHeight*r);if(pen.width!==w||pen.height!==h){pen.width=w;pen.height=h;if(keep)ctx.drawImage(keep,0,0);}};
 const clear=()=>ctx.clearRect(0,0,pen.width,pen.height);
 const pt=e=>{const b=pen.getBoundingClientRect(),r=pen.width/b.width;return [(e.clientX-b.left)*r,(e.clientY-b.top)*r];};
 pen.addEventListener('pointerdown',e=>{e.preventDefault();pen.setPointerCapture(e.pointerId);drawing=pt(e);});
 pen.addEventListener('pointermove',e=>{if(!drawing)return;const p=pt(e),r=devicePixelRatio||1;ctx.strokeStyle='#8b6002';ctx.lineWidth=5*r;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...drawing);ctx.lineTo(...p);ctx.stroke();drawing=p;});
 const end=()=>{drawing=null;};pen.addEventListener('pointerup',end);pen.addEventListener('pointercancel',end);pen.addEventListener('click',e=>e.stopPropagation());
 // Status chip.
 const chip=el('div',{className:'d-chip',hidden:true});chip.setAttribute('role','status');document.body.append(chip);
 // Presenter panel.
 const panel=el('aside',{id:'d-presenter',hidden:true},'<div class="d-row" style="justify-content:space-between;align-items:center"><h2>Presenter</h2><button type="button" id="d-close-presenter">Close</button></div><div><div class="d-timer" id="d-timer">00:00.0</div><div class="d-row"><button type="button" id="d-timer-toggle">Start timer</button><button type="button" id="d-timer-reset">Reset</button><button type="button" id="d-second">Open in a second window</button></div></div><div class="d-box"><span class="micro">NOW</span><b id="d-now"></b></div><div class="d-box"><span class="micro">NEXT</span><b id="d-next"></b></div><div class="d-box"><span class="micro">NOTES</span><p id="d-notes"></p></div><div id="d-cues" hidden><span class="micro">CUE LIST FOR SUBI SHOTS</span><textarea id="d-cuelist" readonly aria-label="Recorded cue list"></textarea><div class="d-row"><button type="button" id="d-copy">Copy cue list</button></div></div>');
 panel.setAttribute('aria-label','Presenter view');document.body.append(panel);
 let timer={on:false,start:0,acc:0},second=null;const elapsed=()=>timer.acc+(timer.on?performance.now()-timer.start:0);
 const nextText=c=>{if(!c.s)return '';if(c.step<c.max){const i=c.s.reveals.findIndex(r=>r===c.step+1);return 'Reveal '+(c.step+1)+': '+strip(c.s.parts[i]).slice(0,170);}const n=deck.slides[c.i+1];return n?'Next slide: '+n.title:'End of the deck';};
 const render=()=>{const c=current();if(!c.s)return;const now=c.s.title+' · reveal '+c.step+' of '+c.max,next=nextText(c);$('#d-now').textContent=now;$('#d-next').textContent=next;$('#d-notes').textContent=c.s.note;$('#d-timer').textContent=fmt(elapsed());
  if(second&&!second.closed){const d=second.document;d.getElementById('t').textContent=fmt(elapsed());d.getElementById('n').textContent=now;d.getElementById('x').textContent=next;d.getElementById('o').textContent=c.s.note;}};
 setInterval(()=>{if(timer.on||cues.on){render();if(cues.on)chip.querySelector('span').textContent='● Recording cues '+fmt(performance.now()-cues.t0);}},250);
 $('#d-timer-toggle').onclick=()=>{if(timer.on){timer.acc=elapsed();timer.on=false;}else{timer.start=performance.now();timer.on=true;}$('#d-timer-toggle').textContent=timer.on?'Pause timer':'Start timer';render();};
 $('#d-timer-reset').onclick=()=>{timer={on:false,start:0,acc:0};$('#d-timer-toggle').textContent='Start timer';render();};
 $('#d-second').onclick=()=>{second=window.open('','ww-presenter','width=520,height=720');if(!second){notify('This viewer blocks second windows. Use the panel here instead.');return;}second.document.title='Presenter · Whiteboard Wednesdays';second.document.body.innerHTML='<div style="font:16px system-ui;padding:20px;display:grid;gap:14px"><div id="t" style="font:600 44px monospace"></div><div><small>NOW</small><b id="n" style="display:block"></b></div><div><small>NEXT</small><b id="x" style="display:block"></b></div><div><small>NOTES</small><p id="o"></p></div></div>';render();};
 const notify=t=>{const n=$('#toast');n.textContent=t;n.hidden=false;setTimeout(()=>n.hidden=true,4500);};
 const setPresenter=on=>{panel.hidden=!on;$('#tool-presenter').setAttribute('aria-pressed',String(on));if(on)render();};
 $('#d-close-presenter').onclick=()=>setPresenter(false);
 // Cue recording for post-production.
 const cues={on:false,t0:0,list:[]};
 const logCue=()=>{if(!cues.on)return;const c=current();if(!c.s)return;const last=cues.list[cues.list.length-1];if(last&&last.id===c.s.id&&last.step===c.step)return;cues.list.push({t:performance.now()-cues.t0,id:c.s.id,step:c.step,max:c.max,device:c.s.section.split('/ ')[1]||''});};
 const setCues=on=>{cues.on=on;$('#tool-cues').setAttribute('aria-pressed',String(on));if(on){cues.t0=performance.now();cues.list=[];logCue();}else{$('#d-cuelist').value='# Start your screen recording when you press Record cues. Times are from that moment.\n'+cues.list.map(q=>fmt(q.t)+'  '+q.id+'  reveal '+q.step+'/'+q.max+'  '+q.device).join('\n');$('#d-cues').hidden=false;setPresenter(true);}chipState();};
 $('#d-copy').onclick=()=>{const t=$('#d-cuelist');const fallback=()=>{t.focus();t.select();notify('Selected. Copy it with your keyboard.');};try{navigator.clipboard.writeText(t.value).then(()=>notify('Cue list copied.'),fallback);}catch{fallback();}};
 // Tool switching.
 const state={spot:false,pen:false};
 function chipState(){const parts=[];if(cues.on)parts.push('<span>● Recording cues</span><button type="button" data-stop="cues">Stop</button>');if(state.pen)parts.push('<span>Pen on</span><button type="button" data-stop="pen">Stop pen</button>');if(state.spot)parts.push('<span>Spotlight on</span><button type="button" data-stop="spot">Stop</button>');chip.innerHTML=parts.join('');chip.hidden=!parts.length;}
 chip.addEventListener('click',e=>{const b=e.target.closest('[data-stop]');if(!b)return;if(b.dataset.stop==='cues')setCues(false);else setTool(b.dataset.stop,false);});
 function setTool(name,on){state[name]=on;if(name==='pen'&&on)state.spot=false;if(name==='spot'&&on)state.pen=false;spot.hidden=!state.spot;pen.hidden=!state.pen;if(state.pen)place();$('#tool-spot').setAttribute('aria-pressed',String(state.spot));$('#tool-pen').setAttribute('aria-pressed',String(state.pen));chipState();}
 $('#tool-spot').onclick=()=>setTool('spot',!state.spot);$('#tool-pen').onclick=()=>setTool('pen',!state.pen);$('#tool-clear').onclick=clear;$('#tool-presenter').onclick=()=>setPresenter(panel.hidden);$('#tool-cues').onclick=()=>setCues(!cues.on);
 document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]')||document.querySelector('dialog[open]')||$('#player').hidden||document.body.classList.contains('reading-mode'))return;const k=e.key.toLowerCase();if(k==='s')setTool('spot',!state.spot);else if(k==='p')setTool('pen',!state.pen);else if(k==='c')clear();else if(k==='v')setPresenter(panel.hidden);else if(k==='r')setCues(!cues.on);});
 // Counts, hotspots and slide changes.
 const countUp=()=>document.querySelectorAll('#canvas .part.revealed .d-num:not([data-done])').forEach(n=>{n.dataset.done='1';const to=+n.dataset.count;if(reduced.matches){n.textContent=to;return;}const t0=performance.now();const tick=t=>{const p=Math.min(1,(t-t0)/800);n.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick);};n.textContent='0';requestAnimationFrame(tick);});
 const hot=__HOTSPOTS__;
 document.addEventListener('click',e=>{const b=e.target.closest('.d-hot');if(!b)return;const wrap=b.closest('.d-tapwrap'),h=hot[+b.dataset.hot];wrap.querySelectorAll('.d-hot').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const p=wrap.querySelector('.d-tap-panel');p.innerHTML='';p.append(el('div',{className:'micro'},(+b.dataset.hot+1)+' / '+h.label.toUpperCase()),el('h3',{},''),el('p',{},''),el('small',{},''));p.querySelector('h3').textContent=h.h;p.querySelector('p').textContent=h.p;p.querySelector('small').textContent=h.s;});
 let lastSlide=null;
 const onChange=()=>{const c=current();if(c.s&&c.s.id!==lastSlide){lastSlide=c.s.id;clear();}countUp();logCue();if(state.pen)requestAnimationFrame(place);if(!panel.hidden||(second&&!second.closed))render();};
 new MutationObserver(onChange).observe($('#progress'),{childList:true,characterData:true,subtree:true});
 addEventListener('resize',()=>{if(state.pen)place();});onChange();
}
const js='('+tools.toString().replace('__HOTSPOTS__',JSON.stringify(hotspots.map(({label,h,p,s})=>({label,h,p,s}))))+')(deck);';

return {deck,register,css,js,title:'Device Library Trial',artifactTitle:'Whiteboard Device Library',header:'DEVICE LIBRARY TRIAL · NOT PUBLISHED',eyebrow:'EIGHT DEVICES · RECORDING TOOLS',intro:'Every visual device and recording tool, on real content from Our paid ads process.',file:'whiteboard-trial-devices.html'};
};
