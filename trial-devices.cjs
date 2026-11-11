// Device library trial deck spec: all eight visual devices and the recording tools.
// Build: node skill/scripts/build-trial.cjs trial-devices.cjs [--artifact OUT_DIR]
// All quotations, figures and copy come from dist/ww-report.pdf, the live paid ads deck or its retained assets.
module.exports=({path,uri,dist,assets,arrow,source})=>{
assets.AD=uri(dist('ww-ad.png'),'image/png');
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
source.verifyQuotes(dist('ww-report.pdf'),quotes.map(([id,,text])=>({id,text})),{first:12,last:13});

const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const wall=quotes.map(([id,src,q],i)=>'<figure class="d-q'+(id==='RED-008'?' is-pick':'')+'" style="--r:'+(i%3-1)*0.7+'deg"><blockquote>“'+(id==='RED-008'?esc(q).replace('no answer','<mark>no answer</mark>').replace('books at the place next door instead.','<mark>books at the place next door instead.</mark>'):esc(q))+'”</blockquote><figcaption>'+id+' · '+src+'</figcaption></figure>').join('');

// Zoom target: the RED-008 quote cell on page 13, as page fractions. Highlights come from the PDF word coordinates.
const found=source.findHighlights(dist('ww-report.pdf'),13,['no answer','books at the place next door instead.'],{within:{y0:40,y1:150}});
const zoomStyle=source.zoomVars(found.width/found.height,{x0:.345,x1:.655,y0:.071,y1:.164});
const hl=found.rects.map(([x,y,w,h],i)=>'<rect class="d-hl" style="--d:'+(i*140)+'ms" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1.5"/>').join('');

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
const attr=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const hot=hotspots.map((h,i)=>'<button class="d-hot" type="button" style="left:'+h.x+'%;top:'+h.y+'%" aria-pressed="false" aria-label="'+(i+1)+': '+attr(h.label)+'" data-label="'+attr(h.label)+'" data-h="'+attr(h.h)+'" data-p="'+attr(h.p)+'" data-s="'+attr(h.s)+'">'+(i+1)+'</button>').join('');
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
 parts:['<figure class="d-frame" style="'+zoomStyle+'"><div class="d-page"><img src="'+page+'" width="2483" height="3512" alt="ICP-Research-Radar report page 13: Real-Life Quotes rows 8 to 10 and the Strategic Interpretation table."><svg viewBox="0 0 '+found.width+' '+found.height+'" aria-hidden="true">'+hl+'</svg></div></figure><div class="micro">ICP-RESEARCH-RADAR · REPORT PAGE 13 OF 154</div>',
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

return {deck,register,tools:true,file:'whiteboard-trial-devices.html',brandProfile:'skill/examples/pecuna-brand.json',title:'Device Library Trial',artifactTitle:'Whiteboard Device Library',header:'DEVICE LIBRARY TRIAL · NOT PUBLISHED',eyebrow:'EIGHT DEVICES · RECORDING TOOLS',intro:'Every visual device and recording tool, on real content from Our paid ads process.'};
};
