// Calibration trial deck spec: three representative moments from Our paid ads process.
// Build: node skill/scripts/build-trial.cjs trial-calibration.cjs [--artifact OUT_DIR]
// Crop of report page 13 (220 dpi), row RED-008: pdftoppm -f 13 -l 13 -r 220 -png dist/ww-report.pdf, crop (640,160)-(1702,442).
module.exports=({path,uri,dist,assets,arrow})=>{
assets.AD=uri(dist('ww-ad.png'),'image/png');
assets.CROP=uri(path.join(__dirname,'trial-red008-p13.png'),'image/png');
const coin='{{COIN}}',ad='{{AD}}',crop='{{CROP}}';

// Highlight boxes in crop pixels, from pdftotext -bbox word coordinates on page 13.
const marks=[[216,169,156,38],[385,169,97,38],[28,215,472,38]];
const highlight=marks.map(([x,y,w,h],i)=>'<rect class="t-mark" style="--d:'+(i*120)+'ms" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>').join('');

const deck={slides:[
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

const register=[{id:'trial-calibration',title:'Calibration trial',description:'Three representative moments from Our paid ads process, rebuilt for the three-slide approval checkpoint. Not published.',cover:ad,source:'',reading:'?view=reading',brand:{name:'Pecuna Factorem',surface:'#ffffff',ink:'#1c1a17',accent:'#8b6002',font:'hand',logo:coin},sourceNote:'Calibration trial from the retained paid ads deck. Cadre Crew research and illustrative assets, not launched advertising.'}];

const css=`
/* Trial-only layouts, scoped to t-* kinds. */
.t-mark{fill:#f6df8c;mix-blend-mode:multiply;transform-box:fill-box;transform-origin:left center}
.revealed .t-mark{animation:t-sweep 320ms ease-out both;animation-delay:calc(var(--d) + 120ms)}
.parts.t-open{grid-template-columns:1fr;gap:20px}.t-open .lead{margin:0}.t-open .statement{margin:6px 0 0}.t-page{max-width:900px}
.t-page{margin:0;padding:22px 26px 18px;background:var(--tint);border-left:3px solid var(--accent)}.t-crop{position:relative;margin-top:10px;background:#fff;box-shadow:6px 8px 0 color-mix(in srgb,var(--ink) 6%,transparent)}.t-crop{overflow:hidden}.t-crop-inner{position:relative}.t-crop img,.t-crop svg{display:block;width:100%;height:auto}.t-crop svg{position:absolute;inset:0;height:100%}
.parts.t-transform{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto 1fr;gap:24px 56px}.t-transform .part:nth-child(2){align-self:start}.t-transform .part:nth-child(1){grid-column:1;grid-row:1}.t-transform .part:nth-child(2){grid-column:1;grid-row:2}.t-transform .part:nth-child(3){grid-column:2;grid-row:1/span 2;display:flex;align-items:center;gap:12px}
.t-map{display:grid;grid-template-columns:minmax(0,1.3fr) 56px minmax(0,1fr);gap:14px 16px;align-items:center;margin:14px 0}.t-map span{font:italic 700 19px/1.4 WWBody}.t-map b{font-size:40px;line-height:1.05;font-weight:600}
.t-asset{margin:0;flex:1;background:var(--tint);padding:18px;text-align:center}.t-asset img{display:block;width:min(100%,430px);height:auto;margin:auto}
.parts.t-flow{grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 64px}.t-flow .part{position:relative}.t-flow .part:nth-child(5){grid-column:1/-1;border-top:3px solid var(--accent);padding-top:6px}
.t-flow .part>.t-link{position:absolute;left:-60px;top:62px}.t-step{border-top:3px solid var(--accent);padding-top:14px}.t-step h3{font-size:31px;margin:6px 0}.t-step p,.t-flow .part:first-child p{font-size:16px}
.t-moment{margin:0 0 6px;aspect-ratio:1/0.72;overflow:hidden;position:relative;background:#2541e0}.t-moment img{position:absolute;width:125%;left:-14%;bottom:0;display:block}
@media(max-width:900px){.parts.t-transform{display:flex;flex-direction:column;gap:24px}.t-transform .part:nth-child(3){display:block}.t-transform .part:nth-child(3)>.t-link{transform:rotate(90deg);margin:0 0 8px 4px;width:40px}.t-asset img{width:min(100%,460px)}.parts.t-flow{grid-template-columns:1fr 1fr}.t-flow .part:nth-child(3)>.t-link{display:none}}
@media(max-width:640px){.parts.t-open,.parts.t-transform,.parts.t-flow{display:flex;flex-direction:column;gap:22px}.t-transform .part:nth-child(3){display:block}.t-link{transform:rotate(90deg);margin:0 0 6px 4px;width:40px}.t-flow .part>.t-link,.t-flow .part:nth-child(3)>.t-link{position:static;display:block}.t-map{grid-template-columns:1fr;gap:4px}.t-map .t-link{margin:2px 0 6px}.t-map b{font-size:36px;margin-bottom:10px}.t-page{padding:16px 14px}.t-crop-inner{width:208%}.t-moment{max-width:300px}}
@media(prefers-reduced-motion:reduce){.revealed .t-mark{animation:none}}
`;

return {deck,register,css,tools:false,file:'whiteboard-trial-calibration.html',brandProfile:'skill/examples/pecuna-brand.json',title:'Calibration Trial',artifactTitle:'Paid Ads Calibration Trial',header:'CALIBRATION TRIAL · NOT PUBLISHED',eyebrow:'THREE-SLIDE APPROVAL CHECKPOINT',intro:'Three moments from Our paid ads process, rebuilt for review before any wider change.'};
};
