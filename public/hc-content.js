(()=>{
// AI Harnesses deck. Source: Harness Chassis Builder - No Schedules skill (SKILL.md) and Taylor's Trending Topic Brief.
// Every element marked data-verbatim must match the skill text exactly; build-hc-reading.cjs checks this.
const SRC='Harness Chassis Builder - No Schedules skill';
const quote=(text,where)=>'<figure class="hc-quote"><blockquote data-verbatim>'+text+'</blockquote><figcaption>'+SRC+', '+where+'</figcaption></figure>';
const cross=(who,list)=>'<p class="hc-cross"><span class="micro">Crosses off</span><b>'+who+'</b>'+list.map(p=>'<span>'+p+'</span>').join('')+'</p>';
const icon={
 interrupter:'<svg class="hc-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 12h48v30H30l-12 10v-10H8z"/><path d="M27 22c0-4 10-5 10 1 0 4-5 4-5 8"/><circle cx="32" cy="36" r="1.6"/></svg>',
 drifter:'<svg class="hc-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M6 44c10-14 16 6 26-8s14 2 24-14"/><path d="M47 21l9 1-2 9"/><path d="M6 52h52" stroke-dasharray="3 5"/></svg>',
 goldfish:'<svg class="hc-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 32c8-12 26-14 38 0-12 14-30 12-38 0z"/><path d="M46 32l12-10v20z"/><circle cx="18" cy="30" r="1.8"/><path d="M28 12c2-3 6-3 8 0M40 8c1-2 4-2 5 0" stroke-dasharray="2 3"/></svg>',
 bluffer:'<svg class="hc-icon" viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="10" width="44" height="44" rx="4" stroke-dasharray="5 4"/><path d="M20 33l8 8 16-18"/></svg>',
 cannon:'<svg class="hc-icon" viewBox="0 0 64 64" aria-hidden="true"><circle cx="28" cy="38" r="16"/><path d="M39 26l7-7"/><path d="M48 10l2 5M56 16l-5 2M54 8l-4 6"/></svg>'
};
const cast=[
 ['The Interrupter',icon.interrupter,'Stops and asks when it does not need to.','P1 to P9'],
 ['The Drifter',icon.drifter,'Output slowly stops matching what you asked for.','P10 to P18'],
 ['The Goldfish',icon.goldfish,'Forgets your rules, its progress and its place.','P19 to P26'],
 ['The Bluffer',icon.bluffer,'Says it is right when it is not.','P27 to P41'],
 ['The Loose Cannon',icon.cannon,'Does risky or wasteful things.','P42 to P53']
];
const arrow='<svg class="hc-arrow" viewBox="0 0 40 16" aria-hidden="true"><path d="M2 8h34M29 2l7 6-7 6"/></svg>';
const kickoffPrompt=`Use the harness-chassis-builder-no-schedules skill.
Job: build Scentwise, a perfume-matching web app for women, end to end from an empty repo. Read this brief and every file in the project first, and answer every question you can before asking me anything.
Deliverable class: app/system.
The app must include:
1. Skin-type selector: dry, oily, combination, normal and sensitive, with a one-line explainer for each.
2. Scent slideshow: swipeable cards for each recommended fragrance, showing notes, strength and how long it lasts.
3. Research connection: every recommendation comes from the skin-type research database in data/scent-research.json. Each match shows its source. No source, no claim.
4. Product pages, a basket and a full checkout, using the payment provider's test mode only.
5. Upsells: a larger size or a gift set, offered before payment.
6. Cross-sells: a matching body lotion or a discovery set, offered in the basket and after purchase.
7. An order confirmation page and a preview of the confirmation email.
Run the full nine-question kickoff and show all nine answers on screen.
Write INTERVIEW.md, CONTRACT.md, PLAN.md, PROGRESS.md, CONSTRAINTS.json and features.json in a harness/ folder.
features.json: every user-visible feature, each passes:false, one per iteration.
Write init.sh and a smoke test before any feature work.
Decision tiers: GREEN micro-choices; AMBER decide and log; RED = live payments, deploying, storing a customer's skin or personal data, and any claim about what suits a skin type that the research database does not support.
Ask me only the genuine gaps and the Q8 owner decisions, all together, in one message.`;
const loopPrompt=`/ralph-loop "Read harness/CONTRACT.md in full, then PLAN.md, PROGRESS.md, CONSTRAINTS.json and features.json. Run init.sh and the smoke test first; if it fails, fixing it is the current node. Take the next eligible feature and run the node cycle: re-read, load bound skills, perform, gate-check, checkpoint. At each PLAN milestone run the independent evaluation with the EVALUATOR PACKET and record its verdict. Log every AMBER decision as it is made. Never edit a test, feature row or constraint row to make it pass. If a node is blocked, record it in PROGRESS and continue with an independent node. Output the exact words CHASSIS DONE only when PLAN has no eligible node and python3 scripts/check_constraints.py harness/CONSTRAINTS.json exits 0. If no eligible node remains while RED items are open, write the checkpoint report to PROGRESS first, then output CHASSIS DONE." --max-iterations 60 --completion-promise "CHASSIS DONE"`;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

window.WW={slides:[
{
 id:'cold-open',title:'Same model. Different result.',section:'00 / Cold open',kind:'hc-versus',
 parts:[
  '<div class="hc-lane hc-without"><div class="micro">Without a harness</div><ol class="hc-timeline"><li><b>Piece 1</b><span>Sharp, on brief.</span></li><li><b>Piece 10</b><span>Drifting. Your rules have gone quiet.</span></li><li><b>Piece 20</b><span>“All done!” It is not.</span></li></ol></div>',
  '<div class="hc-lane hc-with"><div class="micro">With a harness</div><ol class="hc-timeline"><li><b>Piece 1</b><span>Sharp, on brief.</span></li><li><b>Piece 10</b><span>Contract re-read. Same bar.</span></li><li><b>Piece 20</b><span>Proof every requirement was met.</span></li></ol><pre class="hc-mini-term">$ python3 scripts/check_constraints.py CONSTRAINTS.json\nAll rows verified.</pre></div>',
  '<p class="statement hc-punch">The difference isn’t the model. <span>It’s the harness.</span></p>'
 ],
 reveals:[1,2,3],
 source:'Source: Illustrative comparison of two runs. The checker line is real output from the skill’s check_constraints.py, shortened.',
 note:'Hook, about 45 seconds. SAY: “Same model, same prompt, two completely different results. One drifts by piece ten, forgets your rules and tells you it’s finished when it isn’t. The other runs for hours and comes back with proof every requirement was met. The difference isn’t the model. It’s the harness.” SHOW after this slide: a finished run folder, a passing checker and the final report. The piece-by-piece lanes are a teaching illustration, not measured results.'
},
{
 id:'five-failures',title:'Five ways AI lets you down',section:'01 / The problem',kind:'hc-cast',
 parts:[
  ...cast.map(([name,svg,line,range])=>'<div class="hc-char">'+svg+'<h3>'+name+'</h3><p>'+line+'</p><span class="micro">'+range+'</span></div>'),
  '<div class="hc-counts"><div><span class="hc-count" style="--to:58"><span class="hc-sr">58</span></span><small>problems, each traced to a line in the skill</small></div><div><span class="hc-count" style="--to:5"><span class="hc-sr">5</span></span><small>characters you will recognise</small></div><div><span class="hc-count" style="--to:11"><span class="hc-sr">11</span></span><small>parts of the harness that fix them</small></div></div>'
 ],
 reveals:[1,2,3,4,5,6],
 source:'Source: Problem list P1 to P58 and the five characters: Trending Topic Brief, Act 1. Each problem is reverse-engineered from a named rule in the '+SRC+'.',
 note:'Stick the five characters up on the board first. Lead with The Interrupter, the one viewers feel most. P54 to P58 are bonus problems; use them only if time allows. Counts: 58 problems (P1 to P58), 5 characters, 11 system segments, all from the brief.'
},
{
 id:'interrupter',title:'The Interrupter: always asking, never finishing',section:'01 / The problem · 1 of 5',kind:'hc-chat',
 parts:[
  '<div class="hc-chatlog"><p class="hc-msg"><time>09:12</time>Quick question before I start: what tone should the scripts use?</p><p class="hc-msg"><time>10:40</time>Script 2 is drafted. Shall I proceed?</p></div>',
  '<div class="hc-chatlog"><p class="hc-msg"><time>13:05</time>I hit an error. How would you like me to handle it?</p><p class="hc-msg hc-waiting"><time>15:30</time>Still waiting for your reply…</p><small>Illustrative chat, not a real transcript.</small></div>',
  '<ul class="hc-problems"><li><b>P1</b>Asks what your brief already says</li><li><b>P4</b>“Shall I proceed?” again and again</li><li><b>P9</b>You keep typing “continue”</li></ul><details class="hc-more"><summary>Six more Interrupter problems</summary><ul class="hc-problems"><li><b>P2</b>Drip-feeds questions across hours</li><li><b>P3</b>Waits on you all lunch</li><li><b>P5</b>Re-asks for permission you gave</li><li><b>P6</b>Asks about trivia</li><li><b>P7</b>Hands you the first error</li><li><b>P8</b>One question freezes the whole job</li></ul></details>'
 ],
 reveals:[1,2,3],
 source:'Source: P1 to P9: Trending Topic Brief, Character 1. Chat messages are illustrative.',
 note:'This is the one to lead with. Each of P1 to P9 is fixed later: kickoff harvesting (Segment 2), Q8 owner decisions asked together, GREEN and AMBER tiers (Segment 5), the self-unblocking question, and the loop driver (Segment 10).'
},
{
 id:'drifter',title:'The Drifter: piece 20 isn’t piece 1',section:'01 / The problem · 2 of 5',kind:'hc-drift',
 parts:[
  '<div class="hc-piece hc-p1"><div class="micro">Piece 1</div><p>Hook uses a real buyer phrase.</p><p>Warm, British voice.</p><p>“Sea-glass green” as specified.</p></div>',
  '<div class="hc-piece hc-p10"><div class="micro">Piece 10</div><p>Hook: “Are you tired of…?”</p><p>Voice turning into hype.</p><p>“Seaglass” spelt a new way.</p></div>',
  '<div class="hc-piece hc-p20"><div class="micro">Piece 20</div><p>Same opening as piece 9.</p><p>Half the length, half the care.</p><p>“Bestselling” appears from nowhere.</p></div>',
  '<ul class="hc-problems"><li><b>P10</b>No named identity, so style wanders</li><li><b>P13</b>Piece 20 is lazier than piece 1</li><li><b>P14</b>“Make it on-brand” is not testable</li></ul><details class="hc-more"><summary>Six more Drifter problems</summary><ul class="hc-problems"><li><b>P11</b>Nothing says what stays identical</li><li><b>P12</b>Nothing says what must differ</li><li><b>P15</b>Uses your SOP once, then improvises</li><li><b>P16</b>No quality bar was ever set</li><li><b>P17</b>Old and new instructions fight</li><li><b>P18</b>Builds on the drifted work</li></ul></details>'
 ],
 reveals:[1,2,3,4],
 source:'Source: P10 to P18: Trending Topic Brief, Character 2. The three pieces are an illustrative drift, not output from a real run.',
 note:'Walk left to right: same job, three moments. Point at what changed: hook pattern, voice, terminology, invented claim. Then the causes. The fix is the five locks (Segment 3) and the contract re-read (Segment 6).'
},
{
 id:'goldfish',title:'The Goldfish: forgets your rules mid-job',section:'01 / The problem · 3 of 5',kind:'hc-memory',
 parts:[
  '<div class="hc-strip"><div class="hc-seg hc-rules"><span class="micro">Message 1</span><b>Your rules</b><span>Voice, sources, never invent ratings.</span></div></div>',
  '<div class="hc-strip"><div class="hc-seg hc-cut"><span class="micro">Message 80</span><b>Chat compressed</b><span>A summary replaces the detail.</span></div></div>',
  '<div class="hc-strip"><div class="hc-seg hc-lost"><span class="micro">Message 81</span><b><s>Your rules</s></b><span>Quietly missing. Nobody noticed.</span></div></div>',
  '<ul class="hc-problems"><li><b>P19</b>Forgets rules set at the start</li><li><b>P20</b>Rules vanish after compression</li><li><b>P22</b>New session, explain it all again</li></ul><details class="hc-more"><summary>Five more Goldfish problems</summary><ul class="hc-problems"><li><b>P21</b>Forgets to save its place</li><li><b>P23</b>Re-runs the interview</li><li><b>P24</b>After a crash, nobody knows where it got to</li><li><b>P25</b>Too much in its head at once</li><li><b>P26</b>Rewrites its own progress notes</li></ul></details>'
 ],
 reveals:[1,2,3,4],
 source:'Source: P19 to P26: Trending Topic Brief, Character 3. Message numbers are illustrative.',
 note:'Context rot in one picture: the rules lived only in the chat, and the chat was compressed. Fix: memory lives in files and the full contract is re-read at every node (Segment 6).'
},
{
 id:'bluffer',title:'The Bluffer: says “done” when it isn’t',section:'01 / The problem · 4 of 5',kind:'hc-claim',
 parts:[
  '<p class="hc-bubble">All done! Every script is finished and checked.</p>',
  '<ul class="hc-receipts"><li><b>P28</b>It marked its own homework.</li><li><b>P32</b>A test failed, so it changed the test.</li><li><b>P34</b>“200 OK”, but the output is wrong.</li><li><b>P35</b>The button looks polished and does nothing.</li><li><b>P36</b>“rated 4.9 by 2,000 customers”, with no source.</li><li><b>P39</b>The blocked part was reported as finished.</li></ul>',
  '<p class="statement">Without a harness, “done” is <span class="hc-hand-mark">an opinion</span>.</p>'
 ],
 reveals:[1,2,3],
 source:'Source: P27 to P41: Trending Topic Brief, Character 4. The rating example is the failing case in the skill’s ugc-script rubric. The chat bubble is illustrative.',
 note:'Read the bubble in a confident voice, then reveal the receipts. Remaining Bluffer problems for the voice-over: P29 reviewer talked round by the transcript, P30 all praise, P31 same blind spots, P33 claims to have read a file it did not, P37 guesses as facts, P38 padded research, P40 no reason for a choice, P41 pretends to follow a process it lacks.'
},
{
 id:'loose-cannon',title:'The Loose Cannon: costly, risky mistakes',section:'01 / The problem · 5 of 5',kind:'hc-hazard',
 parts:[
  '<ol class="hc-seq"><li>Email sent</li><li class="hc-crash">Crash, before the record was saved</li><li>Restart: “Was it sent?”</li><li class="hc-bad">Sent again</li></ol>',
  '<div class="hc-tiles"><p><b>P42</b>Takes silence as a yes</p><p><b>P43</b>Writes “approved” in its own log</p><p><b>P46</b>Loop runs all night and burns money</p><p><b>P48</b>Builds on something already broken</p><p><b>P49</b>Overwrites another job’s files</p><p><b>P50</b>Passwords end up in logs</p></div>',
  '<p class="hc-aside"><b>P53</b> Ad reporting with estimated spend, or a verdict on a one-day-old ad.</p>'
 ],
 reveals:[1,2,3],
 source:'Source: P42 to P53: Trending Topic Brief, Character 5. The send sequence illustrates P44.',
 note:'P44 is the scary one: the crash happened after the action and before the record, so a naive restart repeats it. Also in this family: P45 retries the same failing step, P47 repair attempts go in circles, P51 helpers never saw the rules, P52 over-engineered setups.'
},
{
 id:'the-turn',title:'The fix isn’t a smarter model',section:'02 / The turn',kind:'hc-chassis',
 parts:[
  '<p class="statement">Each character is a missing part. <span>The model is the engine. The harness is the chassis.</span></p>',
  '<ol class="hc-rail"><li>Interview</li><li>Contract</li><li>Prepare runtime</li><li>Execute</li><li>Verify</li><li>Checkpoint</li><li>Report</li></ol>',
  quote('The plan says what we will do; the contract says what must stay true; the ledger says what we decided.','opening section')
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+': “interview → contract → prepare runtime → execute → verify → checkpoint → report”.',
 note:'About one minute. SAY: “Each of those five characters is a missing part. The model is the engine. The harness is the chassis.” Draw the seven stages left to right, then read the quote. Everything in Act 2 follows this run order.'
},
{
 id:'when-to-use',title:'Harness the jobs that eat your week',section:'03 / The system · 01',kind:'hc-dial',
 parts:[
  '<div class="hc-scale"><span>Quick question</span><span>Small edit</span><span>Brainstorm</span><span class="hc-zone">Multi-session build</span><span class="hc-zone">Overnight run</span></div><p class="hc-scale-key"><span>Skip the harness</span><span>Harness zone</span></p>',
  '<ul class="hc-criteria"><li>Spans more than one session or context window</li><li>Runs for hours</li><li>Must survive a restart</li><li>Repeats enough pieces that drift is likely</li></ul>',
  quote('About ten messages is a heuristic, not a reason to impose process on a small task.','§1 Entry and scope')+cross('Bonus',['P55','P56','P58'])
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+', §1 Entry and scope and MR-1.',
 note:'In 5 to 10 words: harness the big, long jobs; skip it for quick ones. SAY: it is not for everything. One skill owns the whole job, so no hand-offs lose detail (P56), and upgrades only ever add rules, never quietly drop old ones (P55, MR-1).'
},
{
 id:'kickoff',title:'Brief it once, then walk away',section:'03 / The system · 02',kind:'hc-nine',
 parts:[
  '<ol class="hc-grid9"><li class="hc-t">Done means</li><li class="hc-t">World class</li><li class="hc-t">What could go wrong</li><li class="hc-t">Which skills</li><li class="hc-t">Where each skill is used</li><li class="hc-t">Master rules</li><li class="hc-t">Review gates</li><li class="hc-o">Owner decisions</li><li class="hc-t">Memory</li></ol>',
  '<p class="hc-key"><span class="hc-tick-key"></span>All nine answered first, from your brief, files and past instructions.</p>',
  '<p class="hc-key"><span class="hc-ring-key"></span>Only real gaps and owner decisions come to you: together, once.</p>',
  quote('Harvest answers from the brief, assets and prior instructions before asking anything.','§2 Kickoff')+cross('The Interrupter',['P1','P2','P3'])
 ],
 reveals:[1,2,3,4],
 source:'Source: '+SRC+', §2 Kickoff: the nine questions.',
 note:'SAY: before asking anything it reads your brief, files and past instructions, answers nine questions itself, separates facts from guesses, and brings you only the real gaps, all at once. Question 8 lists every decision that would block the run, so nothing surfaces at 2am. DEMO: start a real job (10 UGC scripts) and show the nine answers appear, then the short batch of questions. Not used when resuming an ACTIVE contract.'
},
{
 id:'five-locks',title:'Piece 20 as good as piece 1',section:'03 / The system · 03',kind:'hc-locks',
 parts:[
  '<div class="hc-lock"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><h3>Identity</h3><p>One named voice, refined throughout.</p></div>',
  '<div class="hc-lock"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><h3>Sameness</h3><p>What stays identical: terms, colours, evidence standard.</p></div>',
  '<div class="hc-lock"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><h3>Difference</h3><p>What must not repeat: hooks, openings, angles.</p></div>',
  '<div class="hc-lock"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><h3>Let-down</h3><p>What would make it fail, in performance and in looks.</p></div>',
  '<div class="hc-lock"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><h3>Fatigue</h3><p>Where piece 20 would start to coast.</p></div>',
  quote('where would piece 20 be tempted to coast, and what quality floor must it still clear?','§2 Five lock questions')+'<p class="hc-rule"><span class="hc-v" data-verbatim>“On-brand” is not testable.</span> Every lock must be something a stranger could check.</p>'+cross('The Drifter',['P10','P11','P12','P13','P14'])
 ],
 reveals:[1,2,3,4,5,6],
 source:'Source: '+SRC+', §2 Five lock questions.',
 note:'In 5 to 10 words: five locks keep piece twenty as good as piece one. Do not force a lock the job does not need: app screens may repeat, so set variety only where function warrants it, and research wants consistent evidence over variety. DEMO: the locks section of the contract from the kickoff job.'
},
{
 id:'contract',title:'Agree what good looks like, once',section:'03 / The system · 04',kind:'hc-contract',
 parts:[
  '<div class="hc-page"><div class="hc-page-head"><b>WORK CONTRACT: 10 UGC scripts</b><span class="hc-stamp">ACTIVE</span></div><ol><li>Job and done</li><li>Testable locks</li><li>Framing: ALWAYS and NEVER</li><li>Skill bindings</li><li>Decision permissions</li><li>Blockers</li><li>Re-read and review</li><li>Ledger and final report</li></ol></div>',
  '<div class="hc-framing"><p><b>ALWAYS</b> truthful framing. Framings can never invent experience, evidence or claims.</p><p><b>NEVER</b> <q data-verbatim>remove, weaken or edit a test, a feature row or a constraint row so that it passes.</q></p><p><b>Skill bindings</b> every step names a skill, or says “none”.</p></div>',
  '<p class="hc-say">You say <span class="hc-hand-mark">“Active”</span> once.</p>'+quote('Never treat silence or elapsed time as approval.','§2 Activate once'),
  cross('The Interrupter and The Bluffer',['P4','P5','P15','P36','P42'])
 ],
 reveals:[1,2,3,4],
 source:'Source: '+SRC+', §3 Work Contract template and §2 Activate once. The job name is illustrative.',
 note:'In 5 to 10 words: one page that says what must stay true. One or two pages. ALWAYS and NEVER rules that can never invent claims. Every step names a skill or says none. A newer instruction from you updates the contract; an old contract never overrules you. DEMO: scroll the real contract: job and done, locks, framing, skill bindings, permissions.'
},
{
 id:'decision-tiers',title:'It stops asking you about trivia',section:'03 / The system · 05',kind:'hc-tiers',
 parts:[
  '<div class="hc-light hc-green"><b>Green</b><span>Just do it. Names, spacing. No log.</span></div>',
  '<div class="hc-light hc-amber"><b>Amber</b><span>Decide, log it, keep going. The default.</span></div>',
  '<div class="hc-light hc-red"><b>Red</b><span>Ask. Publishing, sending, spending, deleting or legal claims you have not already approved.</span></div>',
  '<div class="hc-ledger"><div class="micro">The live ledger</div><code data-verbatim>[#] · [step] · DECIDED: [what] · WHY: [reason; blocker if any] · REVERSIBLE: yes/no · REVIEW: yes/no</code><code>07 · script 4 · DECIDED: lead with the buyer’s own phrase · WHY: strongest line in the research · REVERSIBLE: yes · REVIEW: yes</code><small>Second line is an illustrative entry.</small></div>',
  quote('What can I verify or change within our permissions to fix this without bothering the owner?','§4 Blocker handling')+cross('The Interrupter',['P6','P7','P8'])+cross('The Bluffer and The Loose Cannon',['P40','P43','P45'])
 ],
 reveals:[1,2,3,4,5],
 source:'Source: '+SRC+', §4 Decision tiers and blocker handling.',
 note:'In 5 to 10 words: Green, just do it. Amber, decide and log. Red, ask. When it hits a blocker it asks itself first. Only work that depends on a red decision waits; everything else carries on. Red is not a blanket rule: something you already approved does not need asking again. DEMO: type ledger mid-run and point at a REVIEW: yes.'
},
{
 id:'memory-files',title:'It picks up exactly where it stopped',section:'03 / The system · 06',kind:'hc-cabinet',
 parts:[
  '<ul class="hc-drawers"><li><code>INTERVIEW.md</code>The nine questions and answers</li><li><code>CONTRACT.md</code>What must stay true</li><li><code>PLAN.md</code>Steps, current step, next action</li><li><code>PROGRESS.md</code>Evidence, blockers, live ledger</li><li><code>CONSTRAINTS.json</code>Every requirement as a row</li><li><code>features.json</code>App work: every feature, passes:false</li></ul>',
  '<ol class="hc-wheel"><li>Re-read contract</li><li>Load skills</li><li>Do the work</li><li>Check against evidence</li><li>Checkpoint</li><li>Continue</li></ol>',
  '<p class="hc-say">Said out loud, every time: <q data-verbatim>Contract re-read; starting screen 4.</q></p>'+quote('The transcript summary is not the contract.','Appendix H, PreCompact hook')+cross('The Goldfish',['P19 to P26'])
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+', §5 run files, §6 node cycle and Appendix H.',
 note:'In 5 to 10 words: rules and progress live in files, so nothing gets forgotten. Four run files plus the two v2 JSON files. Locked state is JSON because the skill notes the model is less likely to overwrite JSON than Markdown. Before compression, a PreCompact hook snapshots the run files automatically. DEMO: close the session mid-run, open a new one, type resume. It picks up at the exact next step with no questions.'
},
{
 id:'done-gate',title:'No more false “all done”',section:'03 / The system · 07',kind:'hc-terminal',
 parts:[
  '<div class="hc-term"><div class="micro">Run 1 · a row is unverified</div><pre>$ python3 scripts/check_constraints.py CONSTRAINTS.json\nCONSTRAINTS: 1/2 rows verified with evidence\n  BLOCKING  C-02  [unverified]  not verified\n<mark>Completion string may NOT be emitted.</mark>\nexit 1</pre></div>',
  '<div class="hc-term"><div class="micro">Run 2 · the worker marks it verified</div><pre>$ python3 scripts/check_constraints.py CONSTRAINTS.json\nCONSTRAINTS: 1/2 rows verified with evidence\n  BLOCKING  C-02  [verified]  verified by the worker, not by the evaluator or a ground-truth check\n<mark>Completion string may NOT be emitted.</mark>\nexit 1</pre></div>',
  '<div class="hc-term hc-pass"><div class="micro">Run 3 · evaluator, with evidence</div><pre>$ python3 scripts/check_constraints.py CONSTRAINTS.json\nCONSTRAINTS: 2/2 rows verified with evidence\nAll rows verified. Completion string may be emitted if PLAN has no eligible node.\nexit 0</pre></div>',
  quote('Done is a ledger state, not an opinion.','MR-2')+'<p class="statement">The AI can’t talk its way past a script.</p>'+cross('The Bluffer',['P27','P32','P39'])
 ],
 reveals:[1,2,3,4],
 source:'Source: Real output from the skill’s scripts/check_constraints.py (Appendix I), run on 13 October 2026 against three two-row demonstration files.',
 note:'In 5 to 10 words: a script, not the AI, decides when it is finished. DEMO: run the checker three times live. 1, a row unverified. 2, the same row marked verified by “worker”: still blocked. 3, verified by the evaluator with evidence: passes. LINE: “The AI can’t talk its way past a script.” Qualities with no objective check (craft, storytelling) go to the evaluator instead.'
},
{
 id:'evaluator',title:'Mistakes caught before clients see them',section:'03 / The system · 08',kind:'hc-wall',
 parts:[
  '<div class="hc-desks"><div class="hc-desk"><b>Worker</b><span>Does the job. Knows the whole story.</span></div><div class="hc-partition" aria-hidden="true"><span>finished work only</span></div><div class="hc-desk"><b>Evaluator</b><span>Fresh context. Sees the artefacts, never the transcript.</span></div></div>',
  '<ul class="hc-criteria"><li>Problems listed before any praise</li><li>Hard pass marks on every axis</li><li>A different model family for client, spend or legal work</li><li>Four repair attempts, then flagged for you</li></ul>',
  '<pre class="hc-json">{\n  "verdict": "fail",\n  "problems_first": [\n    "Script 7 says \\"rated 4.9 by 2,000 customers\\"; no source in the run"\n  ],\n  "scores": {\n    "Truthfulness and framing": {"score": 1, "threshold": 5}\n  }\n}</pre><small>Illustrative verdict in the skill’s output shape, built from its ugc-script rubric, Example B.</small>',
  quote('The screen looked polished, and that did not matter.','app-screen rubric, Example B')+cross('The Bluffer',['P28 to P31','P34','P35','P36','P38','P47'])
 ],
 reveals:[1,2,3,4],
 source:'Source: '+SRC+', MR-3, §6 step 4, Appendix C evaluator packet and Appendix D rubrics.',
 note:'In 5 to 10 words: a separate AI marks the work, never its own homework. Fresh context, finished work only, problems before praise, hard pass marks. Four repair attempts, then flagged. Never a replacement for the worker’s own checks; it is in addition. DEMO: an evaluator verdict with a fail and its defect list, then the fix and the pass.'
},
{
 id:'safety-rails',title:'No double sends, no surprise bills',section:'03 / The system · 09',kind:'hc-rails',
 parts:[
  '<div class="hc-road"><ul><li>Smoke test before any new build</li><li>Iteration cap on every unattended run</li><li>Repair cap of four</li><li>No credentials in run files</li><li>No new folders without a request</li></ul><div class="hc-lane-line" aria-hidden="true"></div><ul><li>Check what really happened before any retry</li><li>Never repeat an unchanged failed step</li><li>Helpers get the full contract</li><li>Smallest runtime that works</li><li>Never overwrite another run’s files</li></ul></div>',
  quote('Never blindly repeat a send, payment, publish or other consequential operation.','§8 Checkpoint and resume'),
  cross('The Loose Cannon',['P44','P46','P48','P49','P50','P51','P52'])
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+', MR-5, MR-6, §1, §5, §7 and §8.',
 note:'In 5 to 10 words: tests before building, never sends twice, caps the spend. On restart it checks what actually happened before retrying anything. The smoke test is for apps; scripts and research do not need one. Extra machinery must name the failure it fixes. DEMO (optional): a failing smoke test becoming the current job.'
},
{
 id:'loop-driver',title:'It works for hours without you',section:'03 / The system · 10',kind:'hc-loop',
 parts:[
  '<svg class="hc-loop-svg" viewBox="0 0 320 240" role="img" aria-label="A loop that repeats the node cycle. Its exit opens only on the exact words CHASSIS DONE, and a counter caps it at 60 iterations."><path class="hc-loop-path" d="M160 40a80 80 0 1 1-80 80"/><path class="hc-loop-path" d="M70 131l10-12 10 12"/><text x="160" y="116" text-anchor="middle">node cycle</text><text x="160" y="140" text-anchor="middle" class="hc-svg-small">re-read · work · check</text><g transform="translate(106 64)"><rect x="-10" y="6" width="20" height="16" rx="3"/><path d="M-6 6v-5a6 6 0 0 1 12 0v5"/></g><text x="72" y="50" text-anchor="middle" class="hc-svg-small">exit: CHASSIS DONE</text><rect class="hc-counter" x="10" y="190" width="96" height="34" rx="4"/><text x="58" y="212" text-anchor="middle" class="hc-svg-mono">cap: 60</text></svg>',
  '<pre class="hc-cmd">/ralph-loop "&lt;loop prompt&gt;" --max-iterations 60 --completion-promise "CHASSIS DONE"</pre><p class="hc-small">A Stop hook re-feeds the same prompt until the model prints CHASSIS DONE, which it may only do once the checker passes, or until the cap is reached. Blockers are logged, never treated as done.</p>',
  '<div class="hc-mr0"><div class="micro">MR-0 · No schedules, ever</div><p>No timers, no cron, <q data-verbatim>never in slices that fire every 20 or 30 minutes</q>. One continuous run, start to finish.</p></div>'+quote('The loop cannot shorten a run; it can only prevent the model from stopping before the finish line.','Appendix E, loop driver'),
  cross('The Interrupter and bonus',['P9','P54'])
 ],
 reveals:[1,2,3,4],
 source:'Source: '+SRC+', MR-0, MR-5, §6 step 6 and Appendix E. The ralph-wiggum plugin is the one the skill names.',
 note:'In 5 to 10 words: it keeps working until the checker says done. Only after you have approved unattended running and the contract is active. Never without an iteration cap; never on a timer, schedule or interval. STORY: tell your real reason for the no-schedules rule here. Cancel with /cancel-ralph. Check the ralph-wiggum plugin is installed before demonstrating.'
},
{
 id:'final-report',title:'Five minutes to see what needs you',section:'03 / The system · 11',kind:'hc-report',
 parts:[
  '<div class="hc-page hc-report-page"><div class="hc-boxed"><div class="micro">1 · Your decisions</div><p>#07 · lead quote for script 4 · REVIEW: yes · Reverse: swap to the second-ranked quote.</p><p>#12 · script 9 kept at 45 seconds · REVIEW: yes · Reverse: trim the middle beat.</p><small>Illustrative entries.</small></div></div>',
  '<ol class="hc-report-list" start="2"><li>All decisions: the full ledger</li><li>Which skill ran where</li><li>Every lock: held, repaired or open</li><li>Leftovers and next action</li><li>The nine answers, in full</li><li>Every requirement, its evidence and each evaluator verdict</li></ol>',
  quote('Report states the actual completion status and leads with decisions to review.','§10 Acceptance check')+'<p class="hc-small">Unfinished? It is labelled a <b>checkpoint report</b>, never “complete”.</p>'+cross('Bonus',['P57'])
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+', §9 Final and session report and §10.',
 note:'In 5 to 10 words: your decisions first, then proof everything was done. Five minutes tells you exactly what needs you and what was delivered. Also closes P39 and P40. DEMO: scroll a real final report.'
},
{
 id:'three-clients',title:'Three new clients, one week, no chaos',section:'04 / In practice · 1 of 2',kind:'hc-clients',
 parts:[
  '<p class="hc-promise">Manage more clients, run tasks for longer, make fewer mistakes.</p><div class="hc-clientgrid"><div class="hc-client"><div class="micro">Client A · dental clinic</div><h3>harness/clinic/</h3><p class="hc-voice">Voice lock: calm, clinical, reassuring</p></div><div class="hc-client"><div class="micro">Client B · business coach</div><h3>harness/coach/</h3><p class="hc-voice">Voice lock: direct, numbers-led</p></div><div class="hc-client"><div class="micro">Client C · skincare brand</div><h3>harness/skincare/</h3><p class="hc-voice">Voice lock: warm, sensory, British</p></div></div>',
  '<table class="hc-table hc-deliv"><caption class="micro">Each harness delivers the same four things, in its own client’s voice</caption><thead><tr><th>Deliverable</th><th>What’s in it</th><th>Skill bound to it</th></tr></thead><tbody><tr><th>Video scripts</th><td>Ad scripts, plus the confirmation-page video script</td><td>ugc-script-creator, then finishing-touches-copy-and-scripts</td></tr><tr><th>Email sequences</th><td>Lead nurture emails, plus the confirmation call script</td><td>world-class-copywriting</td></tr><tr><th>Static images</th><td>Ad statics with designed headlines</td><td>llm-image-creator</td></tr><tr><th>Qualifying questions</th><td>Questions that sort good-fit leads from tyre kickers</td><td>qualifying-question-mastery</td></tr></tbody></table>',
  '<p class="statement hc-punch">Three contracts, three sets of locks. <span>Nothing bleeds between clients.</span></p>'+quote('Never overwrite another run\'s state.','§1 Entry and scope')+cross('The Drifter and The Loose Cannon',['P11','P15','P49'])
 ],
 reveals:[1,2,3],
 source:'Source: '+SRC+', §1, §2 and §3. The three clients are illustrative; skill names are from Taylor’s skill library.',
 note:'SAY: “Here’s where this pays. Say you sign three clients in the same week: a dental clinic, a business coach and a skincare brand. Without a harness, by Thursday the coach’s emails start sounding like the clinic. With one harness per client, each has its own folder, its own contract and its own voice lock.” Walk the four deliverables: video scripts including the confirmation-page video, email sequences covering lead nurture and the confirmation call script, static images and qualifying questions. Each row is bound to a named skill, so every piece uses the same method. The clients are examples, not real accounts.'
},
{
 id:'app-half',title:'Half an app design from one harness',section:'04 / In practice · 2 of 2',kind:'hc-split',
 parts:[
  '<div class="hc-half" role="img" aria-label="A bar split in two: about half delivered by the harness, half still needing people"><span class="hc-half-done">About 50%: the harness</span><span class="hc-half-left">The rest: you and your team</span></div>',
  '<div class="hc-halves"><div><h3>One harness delivers</h3><ul><li>Screen map and user journeys</li><li>Design tokens and reusable components</li><li>Working screens, each passing its smoke test</li><li>Checkout running in test mode</li><li>features.json with evidence for every pass</li><li>A report leading with your decisions</li></ul></div><div><h3>Still needs people</h3><ul><li>Brand direction and photography</li><li>Real research data and claims sign-off</li><li>Live payments and deployment</li><li>Testing with real customers</li><li>The final design polish</li></ul></div></div>',
  '<p class="statement">Fewer staff, more clients.<br><span class="hc-hand-mark">Then the revenue to hire.</span></p>'
 ],
 reveals:[1,2,3],
 source:'Source: “About half” is Taylor’s target for a single harness run on a complex app design, not a measured result. The split follows the RED tier and smoke-test rules in the '+SRC+'.',
 note:'SAY: “On a complicated app, one harness won’t finish the job, and it shouldn’t. What it does is get you roughly half way: the screens, the components, a working checkout in test mode, all tested, with a report of what it decided. The other half is the work that needs a person: brand, real data, going live, real customers.” Then the business point: someone with little or no staff can take on far more clients, and that revenue is what lets you hire. Treat 50% as your own working figure; only give a number on camera you can stand behind.'
},
{
 id:'app-build',title:'Eight features, built without babysitting',section:'05 / Example 1 · app build',kind:'hc-runsheet',
 parts:[
  '<div class="hc-build"><div class="hc-gate"><b>Smoke test</b><span>init.sh first</span></div>'+arrow+'<ol class="hc-features hc-named"><li>F-001 Skin-type selector</li><li>F-002 Scent slideshow</li><li>F-003 Research-backed matches</li><li>F-004 Product pages</li><li>F-005 Basket and checkout</li><li>F-006 Upsells</li><li>F-007 Cross-sells</li><li>F-008 Order confirmation</li></ol><span class="hc-cap">cap: 60</span></div><p class="hc-small">Scentwise is a made-up brand. Every feature starts <code>passes:false</code> and flips only with end-to-end evidence.</p>',
  '<div class="hc-redlist"><div class="micro">Red: it asks you first</div><ul><li>Taking real payments</li><li>Deploying the app</li><li>Storing a customer’s skin or personal data</li><li>Any “suits your skin” claim the research doesn’t back</li></ul></div><ol class="hc-steps"><li>Paste the kickoff prompt</li><li>It answers its own questions from the brief</li><li>Answer the short list. Say “Active”.</li><li>Start the loop and walk away</li><li class="hc-later">Later: type <code>ledger</code> and check in</li></ol>',
  quote('A failing smoke test becomes the current node; new features wait.','§6 step 2')+cross('Example 1',['P1','P2','P3','P27','P35','P36','P48'])
 ],
 reveals:[1,2,3],
 source:'Source: Scentwise is a fictional app used to show a harness on a complex build. No app, research database or results exist.',
 note:'SAY: “Let’s give it something genuinely hard: a perfume-matching app with a skin-type selector, a scent slideshow wired to a research database, a full checkout, upsells and cross-sells.” Eight features, one per iteration, each starting at passes:false. The smoke test runs before any feature. Point at the red list: payments, deploying, personal data and unsupported skin claims always come back to you. The research rule is the Bluffer fix in action: no source, no claim. Cap of 60 follows the skill’s guide of about two iterations per node plus spare. Do not imply the app or its research exists; it is a worked example.'
},
{
 id:'app-prompts',title:'Copy these two prompts',section:'05 / Example 1 · app build',kind:'hc-prompt',
 parts:[
  '<div class="hc-promptbox"><div class="micro" id="hc-p1">Step 1 · kickoff prompt</div><pre tabindex="0" aria-labelledby="hc-p1">'+esc(kickoffPrompt)+'</pre></div>',
  '<div class="hc-promptbox"><div class="micro" id="hc-p5">Step 4 · loop prompt</div><pre tabindex="0" aria-labelledby="hc-p5">'+esc(loopPrompt)+'</pre></div>',
  '<div class="hc-promptbox hc-checkin"><div class="micro">Later · the check-in</div><pre>ledger\npython3 scripts/check_features.py harness/features.json\npython3 scripts/check_constraints.py harness/CONSTRAINTS.json</pre><p class="hc-small">Then show: features passing vs remaining, constraint rows verified vs not, every REVIEW: yes decision and the exact next action from PROGRESS.md.</p></div>'
 ],
 reveals:[1,2,3],
 source:'Source: Kickoff written for this example; loop prompt follows the skill’s fixed loop prompt (Appendix E) with harness/ paths.',
 note:'Paste these on camera if you run it. The kickoff lists all seven parts of the app and draws the red line around payments, deploying, personal data and unsupported skin claims. The loop prompt includes the skill’s clause for open red items, so the run writes a checkpoint report and stops cleanly instead of spinning to its cap. If the ralph-wiggum plugin is not installed, say so and paste the same loop prompt as a normal message; it still runs the node cycle, you just re-enter it yourself.'
},
{
 id:'harbour-hearth',title:'Fifteen pieces, one standard, nothing live',section:'06 / Example 2 · built, not run',kind:'hc-lanes',
 parts:[
  '<div class="hc-brief"><div class="micro">Fictional brand</div><p><b>Premium UK home fragrance.</b> Hand-poured soy candles and reed diffusers, sold direct. Average order £48. Launching the “Winter Harbour” collection, three scents, for November, with Meta ads.</p></div>',
  '<div class="hc-flow"><div class="hc-icp">One ICP, from the buyer reviews it would research</div><div class="hc-fan" aria-hidden="true"></div><ul class="hc-lanes4"><li><b>5</b>emails</li><li><b>6</b>static ads</li><li><b>3</b>video scripts</li><li><b>1</b>landing page</li></ul></div>',
  '<div class="hc-flow"><div class="hc-evalgate">Evaluator gate</div>'+arrow.replace('hc-arrow','hc-arrow hc-down')+'<div class="hc-paused"><svg viewBox="0 0 48 56" aria-hidden="true"><path d="M14 24v-8a10 10 0 0 1 20 0v8"/><rect x="6" y="24" width="36" height="28" rx="4"/></svg><b>PAUSED, awaiting approval</b><span>Meta campaign staged. Nothing goes live without Ellie.</span></div></div>'
 ],
 reveals:[1,2,3],
 source:'Source: Harbour & Hearth, its founder and its collection are made up for this demonstration. Brief: Trending Topic Brief, Appendix B. Not run; no campaign exists.',
 note:'Say on camera: “We’re not running this one, just to save credits. I’ll show you everything it would do.” Then: “Harbour & Hearth is a made-up brand, so I can show you the whole thing: every question it answers, every skill it uses and every check it has to pass.” Without a harness, piece 15 of a 15-piece campaign is worse than piece 1 and the claims drift.'
},
{
 id:'hh-locks',title:'Every piece sounds like the same brand',section:'06 / Example 2 · built, not run',kind:'hc-matrix',
 parts:[
  '<dl class="hc-locklist"><div><dt>Identity</dt><dd>“Coastal calm”: warm, unhurried, sensory, British.</dd></div><div><dt>Sameness</dt><dd>Same three scent names, offer wording, palette and fonts everywhere.</dd></div><div><dt>Difference</dt><dd>No two hooks open the same way; three scripts, three formats.</dd></div><div><dt>Let-down</dt><dd>Any unsourced claim fails. Any static that reads as a template fails.</dd></div><div><dt>Fatigue</dt><dd>Static 6 and email 5 still use a real buyer phrase.</dd></div></dl><div class="hc-swatches" aria-label="Palette named in the brief"><span class="hc-sw-sea">sea-glass green</span><span class="hc-sw-drift">driftwood</span><span class="hc-sw-cream">cream</span></div>',
  '<table class="hc-table"><caption class="micro">Skill bindings</caption><tbody><tr><th>ICP research</th><td>icp-buyer-research-verified-evidence-quality-gate</td></tr><tr><th>Angles and offer</th><td>breakthrough-advertising-mastery</td></tr><tr><th>Each email</th><td>world-class-copywriting, then finishing-touches-copy-and-scripts</td></tr><tr><th>Each static</th><td>llm-image-creator</td></tr><tr><th>Each script</th><td>ugc-script-creator, then finishing-touches-copy-and-scripts</td></tr><tr><th>Storyboards</th><td>creative-storyboard-architect</td></tr><tr><th>Page sections</th><td>fable-website-funnel-design</td></tr><tr><th>Page QA</th><td>web-and-funnel-design-quality-gate-approved</td></tr><tr><th>Meta staging</th><td>meta-ads-creation-and-management (PAUSED)</td></tr></tbody></table>',
  '<div class="hc-framing"><p><b>ALWAYS</b> quote real buyer language.</p><p><b>NEVER</b> invent reviews, star ratings, “bestseller” or stock counts; activate any ad; report spend without a live read.</p><p><b>RED</b> Ellie decides discount size, budget, launch date and anything going live.</p></div>'
 ],
 reveals:[1,2,3],
 source:'Source: Trending Topic Brief, Appendix B: five locks, skill bindings, framing and decision tiers. Palette colours are named in the brief; swatch shades are illustrative.',
 note:'Scroll Appendix B on screen alongside this slide. AMBER for this campaign: email order, which buyer quote leads which ad, page section order. GREEN: word choice inside the locks, image crops, section spacing.'
},
{
 id:'hh-constraints',title:'Nothing goes live without proof',section:'06 / Example 2 · built, not run',kind:'hc-rows',
 parts:[
  '<table class="hc-table hc-ctable"><thead><tr><th>Row</th><th>Check</th><th>Verified by</th><th>Status</th></tr></thead><tbody><tr><td>C-01</td><td>5 emails, 6 statics, 3 scripts, 1 page, 1 staged campaign exist at their paths</td><td>evaluator</td><td>unverified</td></tr><tr><td>C-02</td><td>Every hook quotes a phrase traceable to the research report</td><td>evaluator (quote + source)</td><td>unverified</td></tr><tr><td>C-03</td><td>No review, rating, “bestseller” or stock claim without a source</td><td>evaluator</td><td>unverified</td></tr><tr><td>C-04</td><td>Scent names, offer wording and palette identical in all assets</td><td>evaluator</td><td>unverified</td></tr><tr><td>C-05</td><td>Every Meta object reads back PAUSED from the platform</td><td>ground truth (Meta read-back)</td><td>unverified</td></tr><tr><td>C-06</td><td>Every ad URL carries utm_source, utm_medium, utm_campaign, utm_content</td><td>ground truth</td><td>unverified</td></tr><tr><td>C-07</td><td>Landing page passes the funnel quality gate on mobile and desktop</td><td>evaluator (screenshots)</td><td>unverified</td></tr></tbody></table><small>Not run, so every row stays unverified.</small>',
  '<ul class="hc-gates"><li><b>Paused state</b>read back from the platform</li><li><b>UTMs</b>no UTM, no launch</li><li><b>72-hour rule</b>no verdict on any ad live under 72 hours</li><li><b>Spend</b>only with spend_as_of from a live read</li><li><b>Approval</b>recorded against exact ad IDs</li></ul>',
  quote('A worker statement is never evidence.','campaign-stage rubric')+cross('Example 2',['P10 to P14','P36','P42','P53'])
 ],
 reveals:[1,2,3],
 source:'Source: Rows C-01 to C-07: Trending Topic Brief, Appendix B. Gates: '+SRC+', campaign-stage rubric.',
 note:'Evaluator moments to describe: research, ten graded quotes each with a URL and date, or a shortfall ledger, no padding. Scripts: the ugc-script rubric fails a script on truthfulness alone (the rated 4.9 example). Staging: paused read-back, UTMs, no verdict under 72 hours, approval against exact ad IDs. LINE: “And that’s where we’d press go. We’re not running it today, just to save credits.”'
},
{
 id:'proof',title:'Better work, and more of it',section:'07 / The proof',kind:'hc-equation',
 parts:[
  '<div class="hc-factor"><h3>Quality</h3><ul><li>Locks hold piece 20 to piece 1’s bar</li><li>Contract re-read at every step</li><li>An independent evaluator</li><li>A script decides done</li></ul></div>',
  '<div class="hc-factor"><h3>Output</h3><ul><li>Questions asked once</li><li>Amber decisions made without you</li><li>No “continue” babysitting</li><li>Cold resume after any crash</li><li>Less rework</li></ul></div>',
  '<table class="hc-table hc-numbers"><thead><tr><th></th><th>Pieces per day</th><th>Rounds of rework</th><th>Interruptions</th></tr></thead><tbody><tr><th>Before</th><td class="hc-fill"></td><td class="hc-fill"></td><td class="hc-fill"></td></tr><tr><th>After</th><td class="hc-fill"></td><td class="hc-fill"></td><td class="hc-fill"></td></tr></tbody></table><small>Taylor’s own before and after figures, written in on the board.</small>'
 ],
 reveals:[1,2,3],
 source:'Source: Quality and output factors: Trending Topic Brief, Act 3. Before and after figures are supplied by the presenter; none are claimed here.',
 note:'About two minutes. Fill in your real before and after numbers before recording: pieces per day, rounds of rework, interruptions. The board leaves them blank on purpose so no figure is invented. The episode title promises 10x; only say it on this slide if your numbers support it.'
},
{
 id:'recap',title:'All five failures, fixed',section:'07 / The proof',kind:'hc-cast',
 parts:cast.map(([name,svg],i)=>'<div class="hc-char hc-done">'+svg+'<h3><span class="hc-strike">'+name+'</span></h3><p>'+['Kickoff, tiers and the loop','Locks and the re-read','Files, not the chat','Checker and evaluator','Rails and caps'][i]+'</p></div>'),
 reveals:[1,2,3,4,5],
 source:'Source: Fixes mapped in the Trending Topic Brief, Act 1 “Fixed by” columns.',
 note:'RECAP: cross out each character on the board as you name its fix. The Interrupter: kickoff, decision tiers and the loop driver. The Drifter: five locks and the contract re-read. The Goldfish: memory in files. The Bluffer: the checker and the evaluator. The Loose Cannon: safety rails and caps.'
},
{
 id:'close',title:'Get the checker, free',section:'08 / Close',kind:'hc-close',
 parts:[
  '<div class="hc-cta"><div class="micro">Free download</div><p class="statement">The checker script.</p><p class="hc-small">Link in the description.</p></div>',
  '<div class="hc-next"><div class="micro">Next week</div><h3>Vision Boards</h3><p>How we decide what to build before the harness builds it.</p></div>'
 ],
 reveals:[1,2],
 source:'Source: Close and next video: Trending Topic Brief.',
 note:'About one minute. CTA: free download of the checker script, the one demonstrated on the done-gate slide. The brief also offered a starter contract as the alternative; swap it in here if you prefer. Next video: “Next week, Vision Boards: how we decide what to build before the harness builds it.”'
}
]};
})();
