/* Using AI Vision Boards To Build Apps Faster and Better.
   Source: "Vision Boards - video plan" (Trending Topic Brief v2) and the Vision Board Studio skill, version 3.
   Every quotation shown on a slide is checked verbatim against the skill by verify-vb.cjs. */
(()=>{
const fixes=(...ids)=>'<p class="vb-fixes"><span class="micro">Crosses off</span>'+ids.map(id=>'<s>'+id+'</s>').join('')+'</p>';
const quote=(text,where)=>'<figure class="vb-quote"><blockquote>“'+text+'”</blockquote><figcaption>Vision Board Studio skill, '+where+'</figcaption></figure>';
const one=(text)=>'<p class="vb-one">'+text+'</p>';
const plist=items=>'<ol class="vb-plist">'+items.map(([id,t])=>'<li><b>'+id+'</b><span>'+t+'</span></li>').join('')+'</ol>';
const copyPanel=(id,label,text)=>'<div class="vb-copy"><div class="vb-copy-top"><span class="micro">'+label+'</span><button type="button" data-vb-copy="'+id+'">Copy prompt</button></div><textarea id="'+id+'" readonly rows="11" aria-label="'+label+'">'+text+'</textarea><p class="vb-copy-status" role="status"></p></div>';

const kickoff=`Use the vision-board skill.

Subject: the Video ideas screen in this repo (public/index.html, public/video-ideas.js, public/video-ideas.css, app/api/ideas). Depth: review for a build.
Audience: Taylor, deciding how the screen should work once the YouTube connection is live.
Read the code first. Only draw code paths you have checked in the repo, and label anything not built yet as PROPOSED.
Use the Whiteboard Wednesdays brand from CLAUDE.md (white, ink #1C1A17, gold #8B6002, highlight #F6DF8C; Caveat, Instrument Sans, IBM Plex Mono).
Ask me only what would materially change the board, all at once. State every other assumption.
Write the acts first (cover, world, states, core journey, empty/error/recovery, mobile, decisions), then build the single riskiest scene with play, pause, scrub and reduced motion before expanding.
Record every open question as a decision row with a stable ID.`;
const checkin=`Show the board's current version, the scenes built, every decision row with its status, and the motion contracts marked "product behaviour". List anything still labelled PROPOSED.`;

const families=[
 ['Fade and rise','Supporting information','fade'],
 ['Shared object','A card becomes a screen','shared'],
 ['Mask reveal','Uncovering a new area','mask'],
 ['Path draw and travel','Showing a journey','path'],
 ['Stagger and assembly','Parts become one result','stagger'],
 ['Restrained spring','Confirmation','spring'],
 ['Depth and parallax','Spatial layers','depth'],
 ['Morph','Continuity between shapes','morph'],
 ['Camera pan and zoom','Presenting only, never built','camera'],
 ['Type, count, chart','Streaming or changing data','type'],
 ['Character loops','Expressing state','character'],
 ['Video and 3D','Detail DOM cannot show','video']
];

window.WW={slides:[
{
 id:'draw-it-first',title:'Draw it. Then build it.',section:'00 / Cold open',kind:'vb-morph',
 parts:[
  '<p class="vb-hook">Every change you make <span class="vb-swap"><s class="vb-old">after the AI has coded your app</s><ins class="vb-new">on a board</ins></span> costs <span class="vb-swap"><s class="vb-old">code.</s><ins class="vb-new">nothing.</ins></span></p>',
  '<p class="vb-verbs">So we make the AI <b>draw</b> it, <b>animate</b> it and <b>agree</b> it first.</p>',
  '<p class="vb-promise"><span class="micro">The promise</span>Stop paying for rebuilds.</p>'
 ],
 reveals:[1,2,3],
 source:'Opening hook and promise from the video plan. Authored lines, not quotations.',
 note:'SAY: "Every change you make after the AI has coded your app costs code. Every change you make on a board costs nothing. So we make the AI draw it, animate it and agree it first." Reveal 1 shows the old line; reveal 2 crosses it out and writes the board version. SHOW: the Jarvis board playing one scene, then its decision register scrolling past, only if you have confirmed the Jarvis app can be shown publicly. About 45 seconds.'
},
{
 id:'what-we-fix',title:'What we fix today',section:'00 / Cold open',kind:'vb-counts',
 parts:[
  '<div class="vb-count"><b class="vb-num" style="--to:5" aria-hidden="true"></b><span class="vb-sr">5</span><p>failure characters anyone building with AI will recognise</p></div>',
  '<div class="vb-count"><b class="vb-num" style="--to:31" aria-hidden="true"></b><span class="vb-sr">31</span><p>specific problems, each traced to a line in the skill</p></div>',
  '<div class="vb-count"><b class="vb-num" style="--to:15" aria-hidden="true"></b><span class="vb-sr">15</span><p>segments of the system, in the order a board is made</p></div>',
  '<div class="vb-count"><b class="vb-num" style="--to:2" aria-hidden="true"></b><span class="vb-sr">2</span><p>worked examples: one live, one built but not run</p></div>'
 ],
 reveals:[1,2,3,4],
 source:'Counts from the video plan: five Act 1 characters, problems P1 to P31, Segments 1 to 15, Examples in Segments 16 and 17.',
 note:'Orientation slide. Every number is countable in the plan: 5 characters, P1 to P31, twelve system segments plus three showcase segments, two examples. Keep it to about 20 seconds.'
},
{
 id:'rebuild-loop',title:'The Rebuild Loop',section:'01 / The problem · Character 1',kind:'vb-loop',
 parts:[
  '<div class="vb-loop-art"><svg viewBox="0 0 420 320" role="img" aria-label="A loop: you prompt, the AI codes it, you finally see it, you dislike it, and you prompt again."><path class="vb-loop-path" id="vb-loop-path" d="M210 40 C330 40 380 110 380 160 C380 230 320 280 210 280 C100 280 40 230 40 160 C40 100 90 40 210 40 Z"/><circle class="vb-loop-dot" r="10"/><g class="vb-loop-stops"><g transform="translate(210 40)"><circle r="7"/><text y="-16">You prompt</text></g><g transform="translate(380 160)"><circle r="7"/><text class="vb-end" x="-16" y="7">AI codes it</text></g><g transform="translate(210 280)"><circle r="7"/><text y="32">You finally see it</text></g><g transform="translate(40 160)"><circle r="7"/><text class="vb-start" x="16" y="7">You hate it</text></g></g><text class="vb-loop-centre" x="210" y="222">£ per lap</text></svg></div><p class="vb-tag">You only see it once it is coded.</p>',
  plist([['P1','You only see the design after the AI has coded it, then you hate it'],['P2','Every change of mind costs another build'],['P3','The AI picks a look you never asked for'],['P4','Everything comes out as cards, black backgrounds and neon'],['P5','“Make it premium” produces nothing specific']])
 ],
 reveals:[1,2],
 source:'Act 1, Character 1 of the video plan. Problems P1 to P5, each reverse-engineered from a line in the Vision Board Studio skill.',
 note:'Stick this character up first. The loop is the cost: every lap is another build. Fixed later by: a picture before code (Segments 5 and 7), a named look (Segment 4). Do not read all five rows; pick P1 and P4 and tell your own version.'
},
{
 id:'guessing-game',title:'The Guessing Game',section:'01 / The problem · Character 2',kind:'vb-contrast',
 parts:[
  '<div class="vb-two"><figure><figcaption class="micro">What you pictured</figcaption><svg viewBox="0 0 220 172" role="img" aria-label="A simple three-step booking flow"><rect x="10" y="20" width="56" height="110" rx="6"/><rect x="82" y="20" width="56" height="110" rx="6"/><rect x="154" y="20" width="56" height="110" rx="6"/><path d="M66 75h16M138 75h16"/><text x="38" y="150">Pick</text><text x="110" y="150">Confirm</text><text x="182" y="150">Done</text></svg></figure><figure class="vb-them"><figcaption class="micro">What the AI built</figcaption><svg viewBox="0 0 220 172" role="img" aria-label="A busy dashboard with charts, tiles and a sidebar"><rect x="10" y="12" width="40" height="136" rx="4"/><rect x="58" y="12" width="70" height="44" rx="4"/><rect x="136" y="12" width="74" height="44" rx="4"/><path d="M62 120 L82 92 L100 106 L124 74"/><rect x="136" y="64" width="74" height="84" rx="4"/><rect x="58" y="64" width="70" height="84" rx="4" class="vb-ghost"/><text x="110" y="168">Dashboard</text></svg></figure></div><p class="vb-tag">You and the AI imagine different apps.</p>',
  plist([['P6','You and the AI picture different apps'],['P7','The prototype looks like features that do not exist yet'],['P8','The builder cannot tell decoration from requirement'],['P9','The plan names code and services that do not exist'],['P10','Assumptions are buried, so nobody challenges them']])
 ],
 reveals:[1,2],
 source:'Act 1, Character 2 of the video plan. Problems P6 to P10. Both sketches are illustrative.',
 note:'The gap between the two pictures is the problem: nothing shared was agreed before code. Fixed later by: framing the decision (Segment 2) and "true or labelled" (Segment 3).'
},
{
 id:'open-loop',title:'The Open Loop',section:'01 / The problem · Character 3',kind:'vb-annot',
 parts:[
  '<div class="vb-chat" aria-label="Three build sessions in which the same question comes back"><p><span class="micro">Monday</span>Should payment be taken at booking?<svg class="vb-ring" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="M30 4 C150 0 300 3 386 8 C397 22 398 78 388 94 C260 99 120 98 16 94 C3 78 2 22 36 6"/></svg></p><p><span class="micro">Wednesday</span>Wait, are we charging at booking or at the visit?<svg class="vb-ring" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="M30 4 C150 0 300 3 386 8 C397 22 398 78 388 94 C260 99 120 98 16 94 C3 78 2 22 36 6"/></svg></p><p><span class="micro">Friday</span>Can we revisit payment timing?<svg class="vb-ring" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="M30 4 C150 0 300 3 386 8 C397 22 398 78 388 94 C260 99 120 98 16 94 C3 78 2 22 36 6"/></svg></p></div>',
  '<p class="vb-marker-note">Same question. Three times. Never written down.</p>',
  plist([['P11','The same open questions come back mid-build'],['P12','Decisions get argued again because nobody wrote them down'],['P13','A later change quietly overwrites what was approved'],['P14','Three documents disagree and nobody knows which wins'],['P15','Nobody approves anything, or a sketch gets a signing ceremony']])
 ],
 reveals:[1,2,3],
 source:'Act 1, Character 3 of the video plan. Problems P11 to P15. The three messages are an illustrative example.',
 note:'Read the three messages, then reveal the marker circles. Fixed later by: the decision register (Segment 10) and sign, freeze, amend (Segment 11). Depth (Segment 1) fixes P15.'
},
{
 id:'motion-mess',title:'The Motion Mess',section:'01 / The problem · Character 4',kind:'vb-chaos',
 parts:[
  '<div class="vb-chaos-stage" role="img" aria-label="Six interface tiles all spinning, bouncing and sliding at once, so none of the movement explains anything."><i></i><i></i><i></i><i></i><i></i><i></i><p>Everything moves. Nothing explains.</p></div>',
  plist([['P16','Things move everywhere and explain nothing'],['P17','A presentation camera move gets built into the product'],['P18','The builder guesses timings and triggers'],['P19','Text typewrites so slowly you cannot read it'],['P20','People who turn motion off see nothing'],['P21','It autoplays and you cannot stop or rewind it'],['P29','A static screenshot cannot show how the app should feel'],['P30','The animation looks different every time you replay or record it']])
 ],
 reveals:[1,2],
 source:'Act 1, Character 4 of the video plan. Problems P16 to P21, P29 and P30. The moving tiles deliberately show bad motion and stop after a few cycles.',
 note:'Let the tiles misbehave for a moment, then reveal the list. Point out P17: a camera move built into the product. Fixed later by: three kinds of motion (Segment 8), inspectable behaviour (Segment 9) and the motion engine (Segments 13 and 14). Reduced motion shows the tiles still.'
},
{
 id:'lost-story',title:'The Lost Story',section:'01 / The problem · Character 5',kind:'vb-pins',
 parts:[
  '<div class="vb-file"><div class="vb-file-bar micro">board-final-v7.html · sent by email</div><div class="vb-file-body"><div class="vb-row"><b class="vb-pin">1</b><span class="vb-tofu" aria-hidden="true">□□□□ □□□ □□□□□</span></div><div class="vb-row"><b class="vb-pin">2</b><span class="vb-shrunk" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div><div class="vb-row"><b class="vb-pin">3</b><span class="vb-cap">Final page screenshot</span></div><div class="vb-row"><b class="vb-pin">4</b><span class="vb-happy">Happy path only</span></div></div></div>',
  '<ol class="vb-legend"><li><b>1</b>Fonts and images missing once it is sent (P25)</li><li><b>2</b>Screens shrunk until nobody can read them, no mobile version (P24, P26)</li><li><b>3</b>A caption that labels instead of proving a point (P23)</li><li><b>4</b>Only the happy path, so errors surprise everyone (P28)</li></ol><p class="vb-also"><b>Also:</b> feedback only in a live meeting (P22), a ten-minute idea gets a three-day board (P27), every walkthrough means screen-recording and retakes (P31).</p>'
 ],
 reveals:[1,2],
 source:'Act 1, Character 5 of the video plan. Problems P22 to P28 and P31. The sent file is an illustrative mock-up.',
 note:'Nobody else can follow it. Walk the four pins on the file. Fixed later by: captions that claim (Segment 6), the board renders itself (Segment 12), studio-grade export (Segment 15), depth (Segment 1) for P27.'
},
{
 id:'the-turn',title:'Move it onto the board',section:'02 / The turn',kind:'vb-rail',
 parts:[
  '<p class="vb-statement">Each of those is a decision being made in code, where it is expensive.</p>',
  '<ol class="vb-steps"><li>Brief</li><li>Direction</li><li>Story (acts)</li><li>Hardest scene</li><li>Full board</li><li>Decisions</li><li>Sign-off</li><li class="vb-build">Build</li></ol><div class="vb-cost"><span>Changing your mind here costs nothing</span><span>Here it costs code</span></div>',
  quote('Turn a brief into a visual explanation of what should be built, how it behaves, and what needs deciding.','SKILL.md')
 ],
 reveals:[1,2,3],
 source:'The turn, from the video plan. Quotation verified against Vision Board Studio skill version 3, SKILL.md.',
 note:'SAY: "Each of those is a decision being made in code, where it\'s expensive. A vision board moves every one of them onto a board, where changing your mind costs nothing." DRAW the eight steps if you are working on the physical whiteboard. About one minute.'
},
{
 id:'choose-depth',title:'Choose the depth',section:'03 / The system · Segment 1',kind:'vb-ladder',
 parts:[
  one('Match the board’s depth to the decision you need.'),
  '<ol class="vb-ladder-steps"><li><b>Explore</b><span>Stop when the direction can be compared or discussed</span></li><li><b>Explain</b><span>Stop when a reader understands the journey and behaviour</span></li><li><b>Review for a build</b><span>Stop when the responsible reviewer can make the outstanding decisions</span></li><li><b>Present</b><span>Stop when the requested output has been rendered and inspected</span></li></ol>',
  quote('Do not require a signature for exploration or for work the user has already authorised.','SKILL.md')+fixes('P15','P27')
 ],
 reveals:[1,2,3],
 source:'Depth table and quotation from Vision Board Studio skill version 3, SKILL.md.',
 note:'WHY CARE: you never spend three days boarding a ten-minute idea, and you never build a big app from a sketch. WHEN NOT: do not jump to review-for-build with gates and signatures when you are only exploring a look. DEMO: the depth table in the skill.'
},
{
 id:'frame-decision',title:'Frame the decision',section:'03 / The system · Segment 2',kind:'vb-funnel',
 parts:[
  one('Read the brief first. Ask only what changes it.'),
  '<div class="vb-funnel-art"><div class="vb-in"><span>Brief</span><span>References</span><span>Assets</span><span>Code</span></div><svg viewBox="0 0 300 120" aria-hidden="true" preserveAspectRatio="none"><path d="M4 6 H296 L190 114 H110 Z"/></svg><div class="vb-out">A short list of real questions</div></div>',
  '<table class="vb-table"><caption class="micro">From the intake table: each row has a sensible fallback</caption><thead><tr><th>Establish</th><th>Sensible fallback</th></tr></thead><tbody><tr><td>Audience and next decision</td><td>State the assumed reader and decision</td></tr><tr><td>Subject and current or proposed scope</td><td>Mark unverified behaviour as proposed</td></tr><tr><td>Brand references and assets</td><td>Proposed direction using available fonts and assets</td></tr><tr><td>Significant states and transitions</td><td>Include the central journey and its likely recovery path</td></tr></tbody></table>',
  quote('Ask only for missing information that would materially change the work; otherwise proceed with stated, reversible assumptions.','SKILL.md')+fixes('P6','P10')
 ],
 reveals:[1,2,3,4],
 source:'Intake rows from Vision Board Studio skill version 3, references/intake.md (four of nine rows shown). Quotation from SKILL.md.',
 note:'SAY: it inspects your references and assets before asking anything, and anything it has to assume is stated and reversible. WHEN NOT: a narrow revision inspects only the affected scenes. DEMO: the intake table with its sensible fallback column.'
},
{
 id:'true-or-labelled',title:'True or labelled',section:'03 / The system · Segment 3',kind:'vb-stamps',
 parts:[
  one('Everything on the board is true or labelled.'),
  '<ul class="vb-stamp-list"><li><b class="vb-stamp">Simulated</b><span>Demo data inside a scene</span></li><li><b class="vb-stamp">Demonstrated</b><span>A state shown on the board</span></li><li><b class="vb-stamp">Proposed</b><span>Not built yet, such as live YouTube retrieval in our Video ideas screen</span></li><li><b class="vb-stamp">Verified</b><span>Checked in the repo, such as <code>public/video-ideas.js</code></span></li></ul>',
  quote('Distinguish simulated data, demonstrated states, proposed behaviour, and verified existing functionality.','SKILL.md')+fixes('P7','P8','P9')
 ],
 reveals:[1,2,3],
 source:'Labels and quotation from Vision Board Studio skill version 3, SKILL.md. The file path exists in this repository; live YouTube retrieval is not yet connected.',
 note:'SAY: on the Jarvis board every service and file was checked in the repo before it was drawn, so a builder could search the code for anything the board named. Simulated data is labelled as simulated. WHEN NOT: a purely conceptual campaign needs no repository; label it conceptual. DEMO: the Jarvis act naming a real service, then the same name in the code.'
},
{
 id:'name-the-look',title:'Name the look',section:'03 / The system · Segment 4',kind:'vb-look',
 parts:[
  '<p class="vb-premium"><s>Make it premium.</s></p>',
  '<div class="vb-spec"><div class="vb-fonts"><span class="micro">Typography</span><p class="vb-f-hand">Caveat for teaching</p><p class="vb-f-body">Instrument Sans for reading</p><p class="vb-f-mono">IBM PLEX MONO FOR LABELS</p></div><div class="vb-swatches"><span class="micro">Palette</span><span style="--c:#ffffff">White<br><code>#FFFFFF</code></span><span style="--c:#1c1a17">Ink<br><code>#1C1A17</code></span><span style="--c:#8b6002">Gold<br><code>#8B6002</code></span><span style="--c:#f6df8c">Highlight<br><code>#F6DF8C</code></span></div><div class="vb-comp"><span class="micro">Composition</span><p>White board. One idea per frame. One gold underline.</p></div></div>',
  quote('Avoid describing a board as premium or cinematic without specifying the actual visual choices.','references/creative-production.md')+fixes('P3','P4','P5')
 ],
 reveals:[1,2,3],
 source:'Worked example: the Whiteboard Wednesdays brand recorded in this project. Quotation from Vision Board Studio skill version 3, references/creative-production.md.',
 note:'SAY: typography, palette, composition, imagery and density, named specifically. One representative scene proves the direction. A provisional look stays labelled "proposed" until approved. This slide uses our own brand as the worked example. DEMO: the Jarvis world-and-tokens act.'
},
{
 id:'acts-first',title:'Acts before pixels',section:'03 / The system · Segment 5',kind:'vb-strip',
 parts:[
  one('Write the story before animating a single pixel.'),
  '<ol class="vb-acts"><li><span>Cover</span></li><li><span>World</span></li><li><span>States</span></li><li><span>Core journey</span></li><li><span>Feature acts</span></li><li><span>Edges and mobile</span></li><li><span>Sign-off</span></li></ol>',
  '<div class="vb-jarvis"><p><b>Jarvis board:</b> a cover and 14 numbered acts, written before any layout.</p><p class="vb-chip-line"><span>“per Act 12”</span><span>“Act 05’s strip”</span></p><p class="vb-small">The act numbers became the team’s language.</p></div>',
  quote('Give each scene a job, a clear composition, a caption explaining its significance, and the event leading to the next state.','SKILL.md')+fixes('P28')
 ],
 reveals:[1,2,3,4],
 source:'Act spine and Jarvis history from Vision Board Studio skill version 3, references/build-log.md (supplied project history). Quotation from SKILL.md.',
 note:'WHY CARE: you agree the journey, including what happens when things go wrong, before anyone designs a screen. WHEN NOT: a single motion study may need only one transition and two endpoint frames. DEMO: the act list from the build log.'
},
{
 id:'captions-claim',title:'Every caption makes a claim',section:'03 / The system · Segment 6',kind:'vb-caption',
 parts:[
  one('Every caption says what the frame proves.'),
  '<div class="vb-capframes"><figure class="vb-bad"><div class="vb-frame" aria-hidden="true"></div><figcaption><s>Final page screenshot</s><span class="micro">A label</span></figcaption></figure><figure class="vb-good"><div class="vb-anatomy"><span class="micro">Act 02 · What goes · What remains</span><b>38 routes collapse into one.</b><span>The argument, with the load-bearing words in bold.</span></div><div class="vb-frame" aria-hidden="true"></div><figcaption><span class="micro">Eyebrow / Claim. / Argument</span></figcaption></figure></div>',
  quote('Use scenes with stable IDs, captions with a point, and visible transition triggers.','references/anatomy.md')+fixes('P23','P24')
 ],
 reveals:[1,2,3],
 source:'Jarvis caption example from references/build-log.md. Quotation from Vision Board Studio skill version 3, references/anatomy.md.',
 note:'SAY: "38 routes collapse into one." is a claim. "Final page screenshot" is a label. Scenes are sized so the screens are readable, with a stacked mobile layout. WHEN NOT: do not bury engineering detail in captions; keep it in expandable notes. DEMO: two Jarvis captions side by side with a label-style caption.'
},
{
 id:'hardest-first',title:'Hardest moment first',section:'03 / The system · Segment 7',kind:'vb-grid',
 parts:[
  one('Build the hardest moment first, then copy it.'),
  '<div class="vb-frames" role="img" aria-label="Twelve empty scene frames. One is circled as the riskiest scene, to be proven before the others are built."><i></i><i></i><i></i><i></i><i></i><i class="vb-risk"><svg viewBox="0 0 100 70" aria-hidden="true" preserveAspectRatio="none"><path d="M10 12 C40 -6 96 2 94 34 C92 66 30 72 8 54 C-6 40 2 20 26 8"/></svg></i><i></i><i></i><i></i><i></i><i></i><i></i></div>',
  '<ul class="vb-checks"><li>Composition</li><li>Timing</li><li>Reduced-motion version</li><li>Export</li></ul><p class="vb-small">Prove all four on one scene before duplicating it.</p>',
  quote('Choose the moment carrying the greatest uncertainty or visual value.','SKILL.md')+fixes('P1','P2')
 ],
 reveals:[1,2,3,4],
 source:'Method and quotation from Vision Board Studio skill version 3, SKILL.md, working method step 4.',
 note:'WHY CARE: the riskiest part is proven before you pay to repeat it across thirty scenes. WHEN NOT: it is not an extra approval stop unless one is actually required. DEMO: the Jarvis orb\'s six states.'
},
{
 id:'three-motions',title:'Three kinds of motion',section:'03 / The system · Segment 8',kind:'vb-roles',
 parts:[
  one('Only product motion becomes a build requirement.'),
  '<div class="vb-role-row"><div class="vb-role vb-yes"><b>Product behaviour</b><span>Build it</span></div><div class="vb-role vb-no"><b>Presentation guidance</b><span>Camera moves and labels. Do not build</span></div><div class="vb-role vb-no"><b>Atmosphere</b><span>Restrained loops. Do not build</span></div></div>',
  '<table class="vb-table vb-contract"><caption class="micro">The skill’s motion contract example row</caption><tbody><tr><th>id</th><td><code>motion-submit</code></td><th>role</th><td>product</td></tr><tr><th>trigger</th><td>confirm</td><th>target</th><td>summary card</td></tr><tr><th>from → to</th><td>form visible → result visible</td><th>timing</th><td>320 ms, ease-out</td></tr><tr><th>interruption</th><td>repeated submit ignored while pending; cancel returns to form</td><th>reduced state</th><td>static result and state strip</td></tr></tbody></table>',
  quote('Only the first category becomes a product implementation requirement.','SKILL.md')+fixes('P16','P17','P18')
 ],
 reveals:[1,2,3,4],
 source:'Motion roles and contract row from Vision Board Studio skill version 3, references/motion.md (row shortened to eight of its fields). Quotation from SKILL.md.',
 note:'SAY: the contract records trigger, start and end states, timing, easing, what happens if interrupted, and the reduced-motion version. WHEN NOT: do not animate everything; one dominant movement per reading area unless concurrency is the point. DEMO: the motion contract example row in the skill.'
},
{
 id:'inspect-it',title:'Play, pause, scrub',section:'03 / The system · Segment 9',kind:'vb-embed',
 parts:[
  one('Play, pause, scrub, and still readable without motion.'),
  '<div class="document-bar"><span>Live motion scene built on the skill’s own V3 runtime. Illustrative booking app, demo data.</span><a href="vb-motion-demo.html" target="_blank" rel="noopener">Open the scene on its own ↗</a></div><iframe class="board-frame vb-demo-frame" data-src="vb-motion-demo.html" title="Playable motion scene: a booking slot becomes a confirmed ticket, with play, pause, replay, timeline scrubber and reduced view" loading="lazy"></iframe>',
  quote('Provide play, pause, replay, and scrubbing for substantial demonstrations.','SKILL.md')+fixes('P19','P20','P21')
 ],
 reveals:[1,2,3],
 source:'Scene built for this presentation with Vision Board Studio skill version 3, assets/vb-runtime.js. Illustrative app and demo data; no real clinic or booking system.',
 note:'Press Play, pause half way, drag the scrubber backwards, then press "Reduced view": spatial movement stops, the endpoint frame and full text remain. SAY: reduced motion is designed separately: endpoint frames and full text, not just faster animation. The role strip under the phone lights up product, presentation and atmosphere as each plays. DEMO afterwards: scrub the Jarvis board, then toggle reduced motion.'
},
{
 id:'decision-register',title:'The decision register',section:'03 / The system · Segment 10',kind:'vb-register',
 parts:[
  one('Every open question becomes a numbered decision.'),
  '<div class="vb-reg"><p class="micro">Jarvis v2: ten open questions, written down first</p><ul class="vb-ids"><li>D-01</li><li>D-02</li><li>D-03</li><li>D-04</li><li>D-05</li><li>D-06</li><li>D-07</li><li>D-08</li><li>D-09</li><li>D-10</li></ul><p class="micro">Jarvis v3: numbering continues, never restarts</p><ul class="vb-ids vb-new-ids"><li>D-11 <span>voice stack</span></li><li>D-12 <span>launch theatre</span></li><li>D-13 <span>graphite logo</span></li></ul></div>',
  '<p class="vb-row-anatomy"><span>Stable ID</span><span>Question</span><span>Rationale</span><span>Alternatives</span><span>Consequence</span><span>Owner</span><span>Status</span></p>',
  quote('Do not pre-tick acceptance, invent a reviewer, or equate a downloaded HTML file with approval.','references/register.md')+fixes('P11','P12')
 ],
 reveals:[1,2,3,4],
 source:'Jarvis decision history from references/build-log.md (supplied project history). Row fields and quotation from Vision Board Studio skill version 3, references/register.md.',
 note:'SAY: the Jarvis board started with ten open questions written down, and each became a register row. Numbering continues across versions and never restarts. WHEN NOT: do not manufacture decisions for a simple creative study. DEMO: the Jarvis register.'
},
{
 id:'sign-freeze-amend',title:'Sign, freeze, amend',section:'03 / The system · Segment 11',kind:'vb-versions',
 parts:[
  one('Approve once, freeze it, amend as a new version.'),
  '<div class="vb-vers"><div class="vb-ver vb-locked"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><b>v2</b><span>Signed and frozen. Stays byte-identical.</span></div><svg class="vb-arrow" viewBox="0 0 160 40" aria-hidden="true"><path d="M4 20 H150 M138 8 L152 20 L138 32"/></svg><div class="vb-ver"><b>v3</b><span>A copy, an amendment note, D-11 to D-13, a fresh signature.</span></div></div><p class="vb-amend micro">Amendment: D-11 to D-13</p>',
  '<p class="vb-statement vb-smaller">The signed board outranks other design documents for the build.</p><p class="vb-small">Only when approval is actually required. A name typed in a demo field is not approval.</p>',
  quote('Preserve the exact approved bytes and create amendments as a new version.','references/gate.md')+fixes('P13','P14')
 ],
 reveals:[1,2,3,4],
 source:'Jarvis v2 and v3 history from references/build-log.md (supplied project history). Rules and quotation from Vision Board Studio skill version 3, references/gate.md.',
 note:'SAY: Jarvis v2 froze when signed. v3 was a copy, an amendment note, three new decisions and a fresh signature; v2 stayed byte-identical. WHEN NOT: not for exploration, and never a fake signature. DEMO: v2 and v3 side by side.'
},
{
 id:'renders-itself',title:'The board renders itself',section:'03 / The system · Segment 12',kind:'vb-outputs',
 parts:[
  one('The board renders itself into a video for review.'),
  '<div class="vb-branch"><div class="vb-src">Board</div><svg viewBox="0 0 120 200" aria-hidden="true" preserveAspectRatio="none"><path d="M0 100 C60 100 50 20 120 20 M0 100 H120 M0 100 C60 100 50 180 120 180"/></svg><ul><li><b>MP4</b><span>Review in your own time</span></li><li><b>Portable HTML</b><span>Runtime and assets embedded, checked with the network blocked</span></li><li><b>Phone and print</b><span>Readable on any device</span></li></ul></div>',
  quote('A capture tool records its viewport; it does not automatically convert a long page into a well-paced walkthrough.','references/delivery.md')+fixes('P22','P25','P26')
 ],
 reveals:[1,2,3],
 source:'Delivery and capture rules from Vision Board Studio skill version 3, references/delivery.md and references/capture.md.',
 note:'SAY: the same timeline drives the preview and the capture. Portable HTML embeds its runtime and assets, checked by loading with the network blocked. WHEN NOT: do not record a long scrolling page and call it a walkthrough; compose a presentation stage first. DEMO: play the rendered walkthrough MP4 if available.'
},
{
 id:'one-timeline',title:'One timeline, three outputs',section:'04 / Showcase · Segment 13',kind:'vb-timeline',
 parts:[
  one('One timeline drives the preview, the scrubber and the video.'),
  '<div class="vb-tl"><div class="vb-tl-bar"><span class="vb-head" aria-hidden="true"></span><span class="micro vb-t0">0 s</span><span class="micro vb-t1">84 s</span></div><ol class="vb-seeks"><li><code>seek(40 s)</code></li><li><code>seek(12 s)</code></li><li><code>seek(40 s)</code></li><li><b>Same frame.</b></li></ol><div class="vb-tl-outs"><span>Preview</span><span>Scrubber</span><span>MP4</span></div></div>',
  '<ul class="vb-facts"><li>Every frame is a function of time, backwards or forwards</li><li>Text streams in at a set number of characters per second</li><li>Real video clips locked to the same clock</li><li>Waits for fonts, images and video before rendering a frame</li><li>If anything fails to load, it fails loudly</li></ul>',
  quote('Keep time-driven output a function of explicit time and fixed inputs.','SKILL.md')+fixes('P29','P30')
 ],
 reveals:[1,2,3,4],
 source:'Runtime behaviour from Vision Board Studio skill version 3, references/runtime.md. The 84-second length is the skill’s examples/video-stage-demo.html. Quotation from SKILL.md.',
 note:'SELL LINE: "This isn\'t a mock-up tool. It\'s a motion engine: every frame is a function of time, it scrubs backwards and forwards, and it renders its own 1080p video with a report." DEMO: open examples/video-stage-demo.html (the 84-second Vision Board Method stage): play it, scrub backwards to a mid-point, replay; same frame every time.'
},
{
 id:'twelve-motions',title:'Twelve kinds of motion',section:'04 / Showcase · Segment 14',kind:'vb-families',
 parts:[
  one('Twelve motion families, each chosen for what it explains.'),
  '<ol class="vb-fam">'+families.map(([n,w,k])=>'<li class="vb-fam-'+k+'"><span class="vb-fam-art" aria-hidden="true"><i></i><i></i><i></i></span><b>'+n+'</b><span>'+w+'</span></li>').join('')+'</ol>',
  quote('These are design options, not features automatically implemented by the runtime.','references/motion.md')+fixes('P16')
 ],
 reveals:[1,2,3],
 source:'Motion vocabulary from Vision Board Studio skill version 3, references/motion.md. Each tile plays its family once when revealed.',
 note:'SAY: "Assembly when parts become one result. A shared object when a card becomes a screen. A path when you want to show a journey. A camera move only to present, and it is labelled so the developer never builds it. Each one gets a contract with timings and a reduced-motion version." WHEN NOT: never as decoration. DEMO: the Jarvis orb\'s states and Assembly act; the SIGNAL ad creative board (examples/ad-creative-board.html) for campaign motion.'
},
{
 id:'studio-export',title:'Board to 1080p video',section:'04 / Showcase · Segment 15',kind:'vb-export',
 parts:[
  one('Board to 1080p video, stills and report, automatically.'),
  '<pre class="vb-cmd"><code>node vision-board/scripts/capture.mjs \\\n  --page stage.html --out walkthrough-v3.mp4 \\\n  --width 1920 --height 1080 --fps 30 --crf 18 \\\n  --stills 0,60,120 --stills-dir stills</code></pre>',
  '<div class="vb-deliver"><div class="vb-mp4"><b>MP4</b><span>H.264 · 1920 × 1080 · 30 fps · BT.709 tags</span></div><div class="vb-stills"><i></i><i></i><i></i><span>Stills you choose</span></div><div class="vb-report"><b>Report</b><code>source hash</code><code>browser version</code><code>dimensions</code><code>frame count</code><code>duration</code></div></div><ul class="vb-guards"><li>Refuses to overwrite an existing video</li><li>Blocks remote assets by default</li><li>A verifier checks repeatable seeks</li></ul>',
  quote('For export, verify dimensions, frames, duration, and sampled output; do not infer success from a filename.','SKILL.md')+fixes('P22','P31')
 ],
 reveals:[1,2,3,4],
 source:'Capture command, output format and report fields from Vision Board Studio skill version 3, references/capture.md. Report fields are named, not sample values.',
 note:'SAY: "One command captures the authored timeline to H.264 MP4 at whatever size you set, 1920 by 1080 at 30 frames by default in our runs, with proper colour tags. It writes still frames you pick and a JSON report with the source hash, browser version, frame count and duration. It refuses to overwrite a video and blocks remote assets so you know the file is truly portable. Then a verifier seeks the board out of order to prove every frame repeats." WHEN NOT: when the board still has open motion problems; render a short section first. DEMO: the capture command and a rendered MP4 plus its report, if one has been rendered for the live example.'
},
{
 id:'live-board',title:'Live: a board for our own app',section:'05 / Examples · Segment 16',kind:'vb-prompt',
 parts:[
  '<div class="vb-live"><p class="vb-one">We board a real screen live, before any code.</p><p class="vb-label-line"><b class="vb-stamp">Proposed</b> The Video ideas screen waits on Google API approval for its YouTube connection, so the board shows proposed behaviour.</p><ol class="vb-run"><li>Paste the kickoff prompt into Claude Code with the repo open</li><li>It reads the real code before drawing anything</li><li>Its short question list and the act list</li><li>The riskiest scene: play, scrub, reduced motion</li><li>The decision register</li></ol></div>',
  copyPanel('vb-kickoff','Step 1 · Kickoff prompt',kickoff),
  copyPanel('vb-checkin','Check-in later',checkin)+fixes('P1','P6','P11')
 ],
 reveals:[1,2,3],
 source:'Appendix A of the video plan. Live YouTube retrieval is not connected or tested; anything not built is labelled PROPOSED.',
 note:'SAY: "This is our own Whiteboard Wednesdays app. The Video ideas screen is waiting on the YouTube connection. Let\'s board how it should work before anyone codes it." In the header the screen is the "Creator watchlist" tab. Step 2: while it reads, say "It\'s checking the real code before it draws anything." (P9). Step 3: answer its questions. Step 4: scrub the riskiest scene and toggle reduced motion. Step 5: "These are the questions that would have come back mid-build." Point at P1, P6 and P11 as each happens.'
},
{
 id:'kinfolk-brief',title:'Kinfolk Clinics: the brief',section:'05 / Examples · Segment 17',kind:'vb-brief',
 parts:[
  '<div class="vb-client"><p class="vb-made-up micro">Made-up client · Built, not run</p><p class="vb-client-name">Kinfolk Clinics</p><p>Four family physiotherapy clinics in Leeds. They want a booking app that replaces phone booking.</p><ol class="vb-asks"><li>Book, move or cancel in under a minute</li><li>Choose a clinician by specialism and availability</li><li>Reminders and a waiting list that fills cancelled slots</li><li>Intake form before the first visit</li><li>Front-desk view of the day</li></ol></div>',
  '<table class="vb-table"><caption class="micro">Intake answers the board would record</caption><tbody><tr><th>Audience and next decision</th><td>Practice manager deciding scope for phase 1</td></tr><tr><th>Subject and scope</th><td>New app. Everything is PROPOSED; no existing system to verify</td></tr><tr><th>Format</th><td>Responsive HTML board; phone-first scenes</td></tr><tr><th>Brand</th><td>Proposed until Kinfolk approves: warm sage, chalk white, charcoal; one humanist sans</td></tr><tr><th>Fidelity</th><td>Core booking journey detailed; front-desk view simplified</td></tr><tr><th>Key states</th><td>Slot available, slot taken mid-booking, cancellation, waiting-list offer, intake incomplete, payment declined</td></tr><tr><th>Owner and approvals</th><td>Practice manager signs phase 1</td></tr><tr><th>Constraints</th><td>Accessible for older patients: large targets, readable static mode</td></tr></tbody></table>'
 ],
 reveals:[1,2],
 source:'Appendix B of the video plan. Kinfolk Clinics is a made-up client; no real business, data or endorsement is implied.',
 note:'SAY: "Kinfolk Clinics is made up, so I can show you everything. We\'re not running this one, just to save credits. I\'ll show you everything it would produce." WHY CARE: it shows what a client gets before a single line of their app is written.'
},
{
 id:'kinfolk-acts',title:'Kinfolk: eleven acts',section:'05 / Examples · Segment 17',kind:'vb-strip',
 parts:[
  '<ol class="vb-acts vb-acts-num"><li><span><small>01</small>The Promise</span></li><li><span><small>02</small>World and Tokens <em>(proposed)</em></span></li><li><span><small>03</small>States of a Slot</span></li><li><span><small>04</small>Core Journey: Book</span></li><li><span><small>05</small>Move and Cancel</span></li><li><span><small>06</small>The Waiting List</span></li><li><span><small>07</small>Intake</span></li><li><span><small>08</small>Front Desk</span></li><li><span><small>09</small>Edges: slot lost, payment declined, no signal</span></li><li><span><small>10</small>Mobile and Large Text</span></li><li><span><small>11</small>Decisions and Sign-off</span></li></ol>',
  '<table class="vb-table vb-motion-table"><caption class="micro">Sample motion contracts</caption><thead><tr><th>id</th><th>role</th><th>trigger</th><th>from → to</th><th>duration</th><th>reduced state</th></tr></thead><tbody><tr><td><code>motion-slot-confirm</code></td><td>product behaviour</td><td>tap Confirm</td><td>slot card → confirmed ticket</td><td>320 ms ease-out</td><td>static ticket with “Booked” label</td></tr><tr><td><code>motion-waitlist-offer</code></td><td>product behaviour</td><td>slot freed</td><td>waiting-list banner appears</td><td>240 ms</td><td>banner present, no slide</td></tr><tr class="vb-not-built"><td><code>camera-act-04</code></td><td>presentation guidance</td><td>scene enters</td><td>wide → phone close-up</td><td>1200 ms</td><td>close-up frame only</td></tr></tbody></table><p class="vb-small">The camera move is presentation guidance, so it never reaches the build.</p>'
 ],
 reveals:[1,2],
 source:'Acts and motion contracts from Appendix B of the video plan. Made-up client; nothing here was generated by running the skill.',
 note:'Point out Act 09, the edges, and that the camera row is presentation guidance and will not be built. Callback to Segment 8.'
},
{
 id:'kinfolk-decisions',title:'What Kinfolk signs',section:'05 / Examples · Segment 17',kind:'vb-register',
 parts:[
  '<table class="vb-table vb-decisions"><thead><tr><th>ID</th><th>Question</th><th>Consequence</th><th>Status</th></tr></thead><tbody><tr><td>D-01</td><td>Can patients pick a named clinician, or only a specialism?</td><td>Changes the booking screen and availability logic</td><td><span class="vb-status">proposed</span></td></tr><tr><td>D-02</td><td>Hold a slot for 5 minutes while the patient finishes booking?</td><td>Prevents double booking; needs a timer state</td><td><span class="vb-status">proposed</span></td></tr><tr><td>D-03</td><td>Waiting list offers by text, app, or both?</td><td>Changes notification setup and cost</td><td><span class="vb-status">proposed</span></td></tr><tr><td>D-04</td><td>Is payment taken at booking or at the visit?</td><td>Adds or removes the payment-declined path</td><td><span class="vb-status">proposed</span></td></tr><tr><td>D-05</td><td>Does the front desk see medical intake answers?</td><td>Data access and privacy decision</td><td><span class="vb-status">proposed</span></td></tr></tbody></table>',
  '<p class="vb-statement vb-smaller">That is what Kinfolk would sign before any code.</p>'+fixes('P4','P5','P7','P12','P17')
 ],
 reveals:[1,2],
 source:'Sample decision register from Appendix B of the video plan. Every row is proposed; nothing is pre-ticked or signed.',
 note:'SAY: "And that\'s what Kinfolk would sign before any code. We\'re not running it today, just to save credits." Note D-04 is the Open Loop question from Act 1, now a row with a consequence.'
},
{
 id:'proof',title:'Rebuild rounds: before and after',section:'06 / The proof',kind:'vb-proof',
 parts:[
  '<div class="vb-axes"><div class="vb-axis"><span class="micro">Rebuild rounds per app</span><div class="vb-bars"><span>Before boards</span><span>After boards</span></div></div><div class="vb-axis"><span class="micro">Days to first approved screen</span><div class="vb-bars"><span>Before boards</span><span>After boards</span></div></div></div>',
  '<p class="vb-statement vb-smaller">Drawn live from our own projects.</p>'
 ],
 reveals:[1,2],
 source:'Figures are drawn live by the presenter from Pecuna Factorem project history. No figures are pre-filled on this slide.',
 note:'DRAW the bars on the board with your real numbers: before boards ___ rebuild rounds per app, ___ days to first approved screen; after boards ___ / ___. Jarvis line ("slices 1 to 5 shipped in two days with zero design churn") ONLY if you have verified it: the skill\'s sources file calls it supplied project history, not independently verified.'
},
{
 id:'recap',title:'All five, crossed out',section:'06 / The proof',kind:'vb-recap',
 parts:[
  '<ul class="vb-cast"><li><s>The Rebuild Loop</s><span>A picture before code</span></li><li><s>The Guessing Game</s><span>True or labelled, shared story</span></li><li><s>The Open Loop</s><span>Numbered decisions, frozen versions</span></li><li><s>The Motion Mess</s><span>Three roles, one timeline</span></li><li><s>The Lost Story</s><span>Captions that claim, a board that renders itself</span></li></ul>'
 ],
 reveals:[1],
 source:'Recap of the five Act 1 characters and the segments that fix them, from the video plan.',
 note:'Each name is struck through one after another. Read the fix under each in one breath.'
},
{
 id:'next',title:'Draw it. Then build it.',section:'07 / Close',kind:'vb-close',
 parts:[
  '<div class="vb-cta"><p class="micro">Free download</p><p class="vb-cta-line">The vision board shell</p><p>Link in the description.</p></div>',
  '<div class="vb-nextvid"><p class="micro">Next video</p><p class="vb-statement vb-smaller">The board decides what to build. Last week’s harness builds it.</p><img src="ww-coin.svg" alt="Pecuna Factorem official coin logo" width="120" height="120"></div>'
 ],
 reveals:[1,2],
 source:'Close and next-video line from the video plan.',
 note:'CTA: the plan allows the board shell or the motion contract template; this slide offers the board shell to match the description. Put the real link in the description before posting. NEXT VIDEO: "The board decides what to build. Last week\'s harness builds it."'
}
]};
})();
