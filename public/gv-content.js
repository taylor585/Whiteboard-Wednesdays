/* Grok Voice WILL Replace Sales Reps! (id: grok-voice).
   Built 19 October 2026 from Taylor's "Grok Voice outbound system" handover brief (20 pages, 19 Oct 2026)
   and SpaceXAI's Grok Voice 3.0 announcement (x.ai/news/grok-voice-3, 14 Oct 2026). Pecuna Factorem brand. */
window.WW={
 slides:[
  {
   id:'starlink',
   title:'Grok Voice is already selling',
   section:'00 / Cold open',
   kind:'gv-proof',
   parts:[
    '<div class="gv-counts"><div><span class="gv-big">20,000</span><small>Starlink customer calls answered by Grok Voice every day</small></div><div><span class="gv-count gv-pct" style="--to:70"><span class="gv-sr">70%</span></span><small>roughly, resolved with no human in the loop</small></div><div><span class="gv-ratio">1 in 4</span><small>sales calls ends in a purchase before the caller hangs up</small></div></div>',
    '<figure class="gv-quote"><blockquote data-verbatim>Roughly 70% are resolved with no human in the loop, and one in four sales calls ends in a purchase before the caller hangs up.</blockquote><figcaption class="micro">SpaceXAI, Grok Voice 3.0 announcement, 14 October 2026</figcaption></figure>',
    '<div class="gv-caveat"><b>Their figures, not ours.</b> Self-reported by SpaceX and xAI. Nobody has audited them, and these are people calling Starlink, not cold leads.</div>',
    '<p class="statement gv-punch">So we built two reps on it. <span>Here is exactly how.</span></p>'
   ],
   reveals:[1,2,3,4],
   source:'Source: SpaceXAI, “Grok Voice 3.0”, x.ai/news/grok-voice-3, 14 October 2026. Company figures, not independently audited. None of these are Pecuna Factorem results.',
   note:'Hook, about 45 seconds. SAY: “Twenty thousand calls a day. Seventy per cent sorted without a human. One in four sales calls ends in a purchase before the caller hangs up. That is Grok Voice at Starlink, right now.” Then be straight: these are SpaceX’s own numbers about its own product, not audited, and they are inbound callers who already want Starlink. Earlier figure if asked: in April xAI reported a 20% sales conversion rate on the same line (x.ai/news/grok-voice-think-fast-1, 23 April 2026). Turn: “So we built two outbound reps on the same model. Here is exactly how they work, and where they are today.”'
  },
  {
   id:'problem',
   title:'Why outbound calling breaks',
   section:'01 / The problem',
   kind:'gv-pains',
   parts:[
    '<div class="gv-pain"><span class="gv-strike">Slow to staff</span><p>Every good caller has to be found, trained and kept.</p></div>',
    '<div class="gv-pain"><span class="gv-strike">Hard to keep consistent</span><p>Every caller says it differently, on a good day and a bad one.</p></div>',
    '<div class="gv-pain"><span class="gv-strike">Generic scripts</span><p>The words come from the seller, not from the buyer.</p></div>',
    '<p class="statement">What if every call started from <mark>what buyers actually say</mark>?</p>'
   ],
   reveals:[1,2,3,4],
   source:'Source: Handover brief, section 03, slide 2 key message. Qualitative by design: no industry statistics are claimed.',
   note:'About 40 seconds. Keep this qualitative; the brief says no invented industry statistics. SAY: “Outbound calling breaks in three places. It’s slow to staff. It’s hard to keep consistent, because every caller says it differently. And the scripts are written by the seller, in the seller’s words.” Reveal the last line as the turn into the system.'
  },
  {
   id:'reps',
   title:'Meet Charlotte and Madison',
   section:'02 / The reps',
   kind:'gv-reps',
   parts:[
    '<article class="gv-rep"><div class="gv-rep-head"><span class="gv-flag">UK</span><h3>Charlotte</h3></div><dl><dt>Grok voice</dt><dd>eve</dd><dt>Calls</dt><dd>Weekdays 09:00 to 17:30 UK time, bank holidays skipped in every UK nation</dd><dt>Screens against</dt><dd>TPS and CTPS</dd></dl></article>',
    '<article class="gv-rep"><div class="gv-rep-head"><span class="gv-flag">US</span><h3>Madison</h3></div><dl><dt>Grok voice</dt><dd>ara</dd><dt>Calls</dt><dd>Weekdays 09:00 to 17:00 in the lead’s own time zone, federal and state holidays skipped</dd><dt>Screens against</dt><dd>National Do Not Call Registry, consent always required</dd></dl></article>',
    '<div class="gv-wall"><div class="micro">The opening, word for word</div><blockquote data-verbatim>Hi, is that [first name]? This is Charlotte, an AI assistant calling from Pecuna Factorem. Just so you know, the call is recorded for quality. Have you got a quick minute?</blockquote><blockquote data-verbatim>Hi, is that [first name]? This is Madison, an AI assistant calling from Pecuna Factorem. If you’d rather not get calls from us, just say ‘stop’ at any time and I’ll take you off our list. The call is recorded for quality. Do you have a quick minute?</blockquote></div>',
    '<p class="gv-goal"><b>One goal on every call:</b> book a 20-minute strategy call. Second best, agree to send the booking link.</p>'
   ],
   reveals:[1,2,3,4],
   source:'Source: Handover brief, section 09 (reps, voices, calling windows, registers, openings verbatim, goal on every call).',
   note:'About one minute. SAY: “Two reps. Charlotte calls the UK, Madison calls the US. They have names and voices, and they say plainly that they are AI, in the first sentence, every time.” Read one opening aloud exactly as written. Point out that Madison gives the opt-out straight after the business name. The goal: book a 20-minute call, aim for under three minutes. Prices and proof only ever come from the get_offer tool, never from the model. Do not say “sounds human”: the reps never pretend to be people.'
  },
  {
   id:'call-path',
   title:'How a call works',
   section:'03 / The system',
   kind:'gv-flow',
   parts:[
    '<ol class="gv-path"><li><b>Opted-in leads</b><span>Consent source and date on every row</span></li><li><b>Dispatcher</b><span>Who may be rung right now</span></li><li><b>Phone network</b><span>UK: Twilio path. US: Telnyx</span></li><li class="gv-dark"><b>The person’s phone</b><span>Hears the name, “AI assistant”, the recording notice</span></li></ol>',
    '<div class="gv-hub"><div class="gv-node"><b>Call server</b><span>Media bridge, tools and guards: silence guard, barge-in, screeners, opt-out, safety stops, 30-minute cap</span></div><svg class="gv-link" viewBox="0 0 120 40" aria-hidden="true"><path class="gv-draw" d="M6 14h104M100 6l10 8-10 8M114 28H10M20 20l-10 8 10 8"/></svg><div class="gv-node gv-accent"><b>xAI Grok Voice 3.0</b><span>Realtime speech to speech. Charlotte: eve. Madison: ara.</span></div></div>',
    '<div class="gv-after"><div class="gv-node"><b>GoHighLevel calendar</b><span>Live free slots, book the 20-minute call, send the invite</span></div><div class="gv-node"><b>After every call</b><span>Score, reflect, count objections, draft a proposal (never sent automatically)</span></div><div class="gv-node gv-brain"><b>Supabase: the brain</b><span>Leads, calls and every word the reps may say. <mark>Only approved rows reach a call.</mark></span></div><div class="gv-node gv-dark"><b>Dashboard</b><span>Listen, read transcripts, approve or discard drafts</span></div></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 08, Figure 1 (architecture) and “The life of one call”, redrawn in the Pecuna style.',
   note:'About 90 seconds. Walk it left to right. 1) Leads are imported with consent records; the importer’s consented-only mode skips anyone without one. 2) Every few minutes in calling hours the dispatcher picks leads that pass every rule: consent, TPS/CTPS or DNC, the do-not-call list, local hours and holidays, at most 3 attempts 24 hours apart. 3) The carrier dials and streams audio to our server, which bridges it to Grok Voice with the rep’s voice and a lean prompt built from approved knowledge. The rep speaks first, within 2 seconds. 4) Mid-call the rep can use 10 tools, including looking up approved knowledge, finding free slots and booking. 5) After the call it is scored, reflected on and its objections counted. Taylor reviews everything on the dashboard. UK carrier: the UK rep is built on the Twilio path; the final UK carrier is still being chosen.'
  },
  {
   id:'research',
   title:'It starts with research',
   section:'04 / The words',
   kind:'gv-equation',
   parts:[
    '<div class="gv-factor"><span class="gv-count" style="--to:3"><span class="gv-sr">3</span></span><h3>buyer types</h3><p>Ideal customer profiles, ranked by commercial fit</p></div>',
    '<div class="gv-factor"><span class="gv-times">×</span><span class="gv-count" style="--to:3"><span class="gv-sr">3</span></span><h3>buying stages</h3><p>Feeling the problem, comparing solutions, ready to buy</p></div>',
    '<div class="gv-factor"><span class="gv-times">×</span><span class="gv-count" style="--to:10"><span class="gv-sr">10</span></span><h3>of each, per stage</h3><p>Fears, desires, questions, past experiences and verbatim quotes</p></div>',
    '<div class="gv-sum"><p class="statement">It doesn’t ask the client who their customers are. <span>It reads what buyers say to each other where nobody is selling to them.</span></p><p class="gv-small">Every quote is verbatim and linked to its source. The full sample report runs to 154 pages.</p></div>'
   ],
   reveals:[1,2,3,4],
   source:'Source: Handover brief, section 11, counted from the full 154-page sample report. The client in the sample report is never named.',
   note:'About one minute. SAY: “Before a single line of script is written, we build a research report on the people who buy. Three buyer types, three buying stages each, and for every stage ten fears, ten desires, ten questions, ten past experiences and ten verbatim quotes. It reads forums, one-star and five-star reviews: what buyers say when nobody is selling to them.” That is 30 of each per buyer type and 90 across the report (one stage in the sample found only 8 genuine questions and left two rows empty rather than pad them; that honesty is worth saying). Always “a sample client report”, never the client’s name.'
  },
  {
   id:'research-to-words',
   title:'Research becomes the words',
   section:'04 / The words',
   kind:'gv-map',
   parts:[
    '<div class="gv-row"><span>Fears and past experiences</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>Objection handlers, answered before they cost the sale</b></div>',
    '<div class="gv-row"><span>Questions</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>FAQ answers the rep looks up mid-call</b></div>',
    '<div class="gv-row"><span>Quotes and words to mirror</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>Openers in the buyer’s own words</b></div>',
    '<div class="gv-row"><span>Words and claims to avoid</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>Never-say lists the reps cannot cross</b></div>',
    '<div class="gv-row"><span>Buying stage</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>When to say it: empathy, comparison or clear terms</b></div>',
    '<div class="gv-row"><span>Qualify and disqualify</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>The qualifying question and the minimum budget rule</b></div>',
    '<div class="gv-row"><span>The buyer types themselves</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><b>Roleplay prospects that test the reps before they ring anyone</b></div>'
   ],
   reveals:[1,2,3,4,5,6,7],
   source:'Source: Handover brief, section 11, “How it becomes what the reps say”, and section 10.',
   note:'About one minute; one row per reveal. SAY: “This is the bit nobody else does. Every section of the report turns into something the rep actually says, or refuses to say.” Example for row one: “we’ve tried agencies before” is a past experience in the report, so it becomes an objection handler, ready before it costs the sale. For Pecuna’s own reps this is already in the knowledge base as drafts: 33 “how do you / why you” answers per rep, 5 new objection handlers per rep and 14 deeper report questions per rep.'
  },
  {
   id:'approval',
   title:'Nothing is said until approved',
   section:'05 / Control',
   kind:'gv-gate',
   parts:[
    '<div class="gv-states"><span class="gv-chip">Draft</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><span class="gv-chip gv-chip-on">Approved</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><span class="gv-chip">Retired</span></div><p class="gv-small">Only approved rows are ever used. Drafts are filtered out twice, in the database query and in the code. Approving a new version retires the old one, so approval is one click.</p>',
    '<div class="gv-waiting"><div class="micro">Drafts waiting for Taylor, live count on 19 October 2026</div><div class="gv-tally"><div><span class="gv-count" style="--to:166"><span class="gv-sr">166</span></span><small>objection drafts</small></div><div><span class="gv-count" style="--to:100"><span class="gv-sr">100</span></span><small>FAQ drafts</small></div><div><span class="gv-count" style="--to:12"><span class="gv-sr">12</span></span><small>talk-track drafts</small></div></div></div>',
    '<div class="gv-lean"><h3>Lean on purpose</h3><p>Everything in the prompt made it 33,000 to 35,000 characters, too big for fast realtime voice. Now the core script and top objections stay in the prompt, about <b>12,000 characters</b> per rep, and the rest is looked up mid-call. No match? The rep says <q data-verbatim>Taylor can tell you on the call</q> rather than improvise.</p></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 10 (draft, approved, retired; live draft counts from the database on 19 October 2026; the lean prompt and the 12,000-character target).',
   note:'About one minute. SAY: “Here is the rule that makes this safe. The reps can only say what a human has approved. Everything else is a draft, and drafts never reach a call.” The counts are real database counts on 19 October: 166 objection drafts, 100 FAQ drafts and 12 talk-track drafts waiting for Taylor (278 knowledge drafts in all). They are a backlog, not results. The lean prompt: approved knowledge is kept in memory and refreshed every 5 minutes, so a call never waits on the database.'
  },
  {
   id:'objection-loop',
   title:'The objection loop',
   section:'05 / Control',
   kind:'gv-loop',
   parts:[
    '<svg class="gv-loop-svg" viewBox="0 0 520 330" role="img" aria-label="A loop of five steps: raise, draft, approve, live, stats, and back to raise"><path class="gv-loop-path" d="M260 50A170 120 0 1 1 259.9 50"/><path class="gv-loop-head" d="M-9 -8L2 0L-9 8" transform="translate(359.9 72.9) rotate(27)"/><g class="gv-stop"><circle cx="260" cy="50" r="9"/><text x="260" y="30" text-anchor="middle">1 Raise</text></g><g class="gv-stop"><circle cx="421.7" cy="132.9" r="9"/><text x="440" y="139" text-anchor="start">2 Draft</text></g><g class="gv-stop gv-stop-on"><circle cx="359.9" cy="267.1" r="11"/><text x="360" y="306" text-anchor="middle">3 Approve</text></g><g class="gv-stop"><circle cx="160.1" cy="267.1" r="9"/><text x="160" y="306" text-anchor="middle">4 Live</text></g><g class="gv-stop"><circle cx="98.3" cy="132.9" r="9"/><text x="80" y="139" text-anchor="end">5 Stats</text></g></svg>',
    '<ol class="gv-steps"><li><b>Raise</b>A prospect objects. A rules-only detector counts it after the call: no AI model, no cost.</li><li><b>Draft</b>New handlers arrive as drafts: a daily routine proposes 10 (5 UK, 5 US), plus call reflections and the research.</li><li><b>Approve</b>Taylor sees each draft beside the live text and clicks Approve or Discard.</li><li><b>Live</b>The approved version replaces the old one within about 5 minutes.</li><li><b>Stats</b>Raised on how many calls, won how often. The lowest win rates are next to rewrite.</li></ol>',
    '<div class="gv-standard"><div class="micro">The objection standard, enforced in code</div><p>Label the concern, one concrete insight, one calibrated question. Then tie the value back and offer two real free times. Every spoken line under 45 words. <mark>A draft that falls short is refused before it reaches the database.</mark></p></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 12. The objection stats view has 0 rows today because there have been no real calls.',
   note:'About 90 seconds. SAY: “Objections are where calls are won or lost, so they get a loop of their own. Every objection is counted, every improvement is written to a standard, and nothing goes live until a human approves it.” Then the standard: turn one labels the concern, gives one insight and asks one calibrated question; turn two ties the value to the research and offers two real free times; one backup attempt, then a polite give-up rule, and any opt-out is honoured at once. Be honest: the stats step has no data yet, because there have been no real calls. Win rate will show association, not proof that the answer caused the win.'
  },
  {
   id:'booking',
   title:'Booked into your calendar',
   section:'06 / On the call',
   kind:'gv-chat',
   parts:[
    '<div class="gv-call"><div class="micro">Illustrative exchange, built from the documented booking rules</div><p class="gv-line gv-ai"><b>Rep</b>I can do Wednesday 21 October at 2pm, or Thursday 22 October at 10am. Which suits you better?</p><p class="gv-line gv-them"><b>Prospect</b>Wednesday works. It’s sam at example dot co dot uk.</p><p class="gv-line gv-ai"><b>Rep</b>Lovely. That’s sam@example.co.uk, and the invite is on its way for Wednesday at 2pm.</p></div>',
    '<ul class="gv-rules"><li><b>Live free slots</b>from the calendar, up to 14 days ahead, in the prospect’s own time zone</li><li><b>08:00 to 20:00</b>their time, at least 60 minutes ahead, spread across mornings and afternoons</li><li><b>Two real options</b>read out in plain words; if a slot has just gone, the two nearest are offered</li><li><b>Email captured</b>and written to the contact before booking, so the invite arrives; unclear ones are read back letter by letter</li></ul>',
    '<p class="gv-small gv-fallback"><b>Not ready to pick a time?</b> The rep agrees to send the booking link instead.</p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 13 (booking and email rows), section 08 tools and section 09 goal. The exchange is illustrative: no real call has taken place.',
   note:'About one minute. Read the exchange as a demonstration, and say it is illustrative: no live calls yet. The rules underneath are real and unit-tested, and booking and email capture are also played end to end in the offline dress rehearsal. One booking per call. Booking is GoHighLevel live slots, or a booking link; no other calendar or CRM integration exists, so do not promise one.'
  },
  {
   id:'real-phone-life',
   title:'Built for real phone life',
   section:'06 / On the call',
   kind:'gv-tiles',
   parts:[
    '<ul class="gv-grid"><li><b>Call screeners</b>Google Call Screen, iPhone Call Screening, BT Call Guardian: one fixed line says who is calling and why.</li><li><b>Phone menus</b>Only keys that lead to a person. Never pay or voicemail. A looping menu ends the call for a later retry.</li><li><b>Dead air</b>After 7 seconds: “Hello, are you still there?” After 8 more, a fixed goodbye.</li><li><b>Talk-over</b>When the prospect talks over the rep, the audio stops at once.</li></ul>',
    '<ul class="gv-grid"><li><b>Callbacks</b>“Ring me Thursday at 2” is resolved in the lead’s time zone, and the dispatcher rings then, not before.</li><li><b>Answering machines</b>Hang up. No voicemail drops, by design.</li><li><b>Wrong numbers</b>Apologise, pitch nothing, add the number to the do-not-call list for both reps.</li><li><b>Safety stops</b>A child, a distressed person or an emergency: stop selling, a short kind goodbye, lead held for review.</li></ul>',
    '<p class="gv-small"><span class="gv-tick" aria-hidden="true">✓</span> Every behaviour here is unit-tested and played end to end, for both reps, in the offline dress rehearsal.</p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 13 (call behaviour and safety; all eight shown are marked rehearsed).',
   note:'About one minute. This is the slide that answers “will it embarrass us?”. Pick two to tell as stories: the call screener (the model is muted, one fixed line, and a person who picks up hears the full opening) and safety stops (999 or 911 in an emergency, sales tools refused by the server). Also true but not shown: fast replies (first word within 2 seconds is a target, not a measured phone-line figure), “Where did you get my number?” answered from the lead’s own consent record, and a 30-minute hard limit per call.'
  },
  {
   id:'compliance',
   title:'Compliance by design',
   section:'07 / Safe to use',
   kind:'gv-quad',
   parts:[
    '<div class="gv-box"><h3>Consent and leads</h3><p>Opted-in leads only, each with where and when they opted in. US calls need prior express written consent covering AI-voice calls; the code refuses any US lead without it. UK consent is required by default, and TPS and CTPS screening still runs.</p></div>',
    '<div class="gv-box"><h3>On every call</h3><p>AI disclosure, business name and recording notice in the opening. Opt-outs go on the do-not-call list at once, for both reps, permanently. No voicemail messages.</p></div>',
    '<div class="gv-box"><h3>Abandoned and silent calls</h3><p>If the AI has not spoken within 2 seconds, a short information message plays and the number is paused for 72 hours. A brake pauses a rep if its abandoned rate goes above 3%.</p></div>',
    '<div class="gv-box"><h3>Data and privacy</h3><p>Find and erase everything held on a person on request. Recordings in private storage. The database is locked to the server-side key.</p></div>',
    '<p class="statement gv-built">Built to the UK and US calling rules. <span>Legal sign-off in progress.</span></p>'
   ],
   reveals:[1,2,3,4,5],
   source:'Source: Handover brief, section 14 (compliance and consent), section 06 (approved wording). Lawyer review is pending; this is not a claim of legal approval.',
   note:'About 90 seconds. SAY: “Compliance isn’t left to the script. It’s enforced by the code and checked on every call.” For Tuned Reps clients, the client is the caller of record and the data controller; Pecuna is the processor. Caller of record, AI disclosure and recording notice are required as true in the client config, with no setting to turn them off. Never say “fully compliant”, “legally approved” or “TCPA-certified”. Still with Taylor and the lawyer: consent wording (including Pennsylvania’s AI-voice rule, in force 18 October 2026), DNC subscription, the do-not-call policy, recording retention and the privacy notice.'
  },
  {
   id:'dashboard',
   title:'Your reps, working',
   section:'08 / What you see',
   kind:'gv-screen',
   parts:[
    '<div class="gv-app" aria-label="Illustrative dashboard layout"><nav class="gv-side"><span class="gv-on">Overview</span><span>Calls</span><span>Offers</span><span>Review</span><span>Openers</span><span>Wins &amp; Losses</span><span>Knowledge</span></nav><div class="gv-panes"><div class="gv-pane"><div class="micro">Calls</div><p>Every call the agents made, with the recording, the transcript, the outcome and the score.</p></div><div class="gv-pane"><div class="micro">Review</div><p>Waiting on you: flagged calls, return calls and proposal drafts.</p></div><div class="gv-pane gv-pane-wide"><div class="micro">Knowledge</div><p>Each draft beside the live text it would replace. <span class="gv-btn">Approve</span> <span class="gv-btn gv-btn-quiet">Discard</span></p></div></div><span class="gv-stamp">Illustrative</span></div>',
    '<figure class="gv-quote gv-quote-small"><blockquote data-verbatim>Your reps, working. Every call your reps make, with the recording, the transcript and what happened next. Approve what they say before they say it. See who booked, who said not now, and why.</blockquote><figcaption class="micro">The dashboard promise, from the package copy</figcaption></figure>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, sections 16 and 20. The layout is an illustration of the real page structure; it shows no call data because there have been no real calls.',
   note:'About one minute. A private web app behind a password, with every page and recording guarded. Client copies carry the client’s own name, logo, colours and rep names. Pages: Overview, Calls, Call detail, Offers, Review, Openers, Wins and Losses, Knowledge. If you show mock-mode screens on camera (2,500 generated calls), label them illustrative; they are not data. Deployment: the Review page’s flagged-calls section and the Knowledge page’s objection stats need a redeploy to appear on the live dashboard.'
  },
  {
   id:'tests',
   title:'Engineering you can check',
   section:'09 / Proof of build',
   kind:'gv-counts',
   parts:[
    '<div class="gv-tally gv-tally-big"><div><span class="gv-count" style="--to:619"><span class="gv-sr">619</span></span><small>backend tests, all passing</small></div><div><span class="gv-count" style="--to:117"><span class="gv-sr">117</span></span><small>dashboard tests, all passing</small></div><div><span class="gv-count" style="--to:28"><span class="gv-sr">28</span></span><small>whole calls in the offline dress rehearsal: 647 checks, every one green</small></div></div>',
    '<div class="gv-proves"><div><h3>What the rehearsal proves</h3><p>The whole call path joins up: dispatcher, signed webhooks, media bridge, guards, tools, booking, opt-out, saving, scoring and reflection. 14 whole calls per rep, with fake phone lines, a fake voice session and a fake calendar.</p></div><div><h3>What it doesn’t prove</h3><p>Real audio quality and latency on a phone line, how the real model behaves, carrier delivery, or a real calendar accepting the booking. <mark>That is what six test calls per rep are for.</mark></p></div></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 17. Test totals from the run at commit 98c9c95 on 19 October 2026 and the dress rehearsal run the same day.',
   note:'About one minute. PARTNER VERSION: SWAP IN this slide early, and add the core update model (one codebase; client differences only from configuration and a prompt overlay; every improvement runs on Pecuna’s own reps first, is tagged core-vX.Y.Z and rolls out to a pilot client, then everyone; rollback means pinning the previous tag; no tags exist yet). SAY: “Nothing can be proved on a real phone line until the accounts are live, so we tested it the hard way, offline, with every outside service faked.” Be exact about the limits on the right.'
  },
  {
   id:'package',
   title:'What a client gets',
   section:'10 / The package',
   kind:'gv-package',
   parts:[
    '<ul class="gv-kit"><li><b>Buyer research report</b>3 buyer types × 3 stages, turned into the reps’ openers, objections, FAQs and roleplay prospects</li><li><b>10,000 opted-in leads</b>matched to the buyer types, screened against TPS, CTPS or the National DNC and the client’s own list, each with its consent record</li><li><b>Two AI reps</b>each calling 8 hours a day, 5 days a week, with their own names, voices and regions</li><li><b>Their own database</b>never shared with Pecuna or another client</li><li><b>A branded dashboard</b>with the client’s name, logo, colours and rep names</li></ul>',
    '<div class="gv-price"><div><span class="gv-big">$15,000</span><small>one-off setup: report, leads, building and scripting both reps, accounts and database, branded dashboard, test calls, go-live</small></div><div><span class="gv-big gv-tbc">Monthly</span><small>to be confirmed</small></div></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 20 (the package and pricing). Only the one-off setup fee is settled; the monthly fee is still Taylor’s decision.',
   note:'About one minute. The productised version is called Tuned Reps, by Pecuna Factorem; on screen we keep the Pecuna brand. SAY the package in one breath, then the price: “$15,000 one-off setup. The monthly fee is still being confirmed, so I won’t quote one.” Do not quote a monthly figure, tiers, internal costs, margins or the lead supplier’s price. Grok voices available: Eve, Ara, Rex, Sal and Leo. Optional partner extra: Grok Voice’s public rate is about $0.08 a minute of connected time.'
  },
  {
   id:'setup',
   title:'From form to first call',
   section:'10 / The package',
   kind:'gv-timeline',
   parts:[
    '<ol class="gv-days"><li><b>Day 0</b>Contract and setup paid</li><li><b>Days 1 to 3</b>Onboarding form and kick-off call</li><li><b>Days 2 to 9</b>Buyer research report</li><li><b>Days 3 to 10</b>Accounts, telephony checks, leads sourced, screened and imported</li><li><b>Days 9 to 14</b>Setup script; scripts written from the report; the client approves the drafts</li><li class="gv-day-on"><b>Days 13 to 16</b>Deploy, rehearsal, test calls, sign-off, go live</li></ol>',
    '<div class="gv-form"><div class="micro">One onboarding form, twelve steps</div><p>Business, brand, offer, customers, buyer insight, FAQs and objections, calendar, calling, reps, compliance, integrations, review. It never asks for keys or passwords.</p><p class="gv-small">Planned at about three weeks; four if UK number checks or approvals are slow. Then a week-one review on day 5 of live calling.</p></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 20 (from onboarding form to go-live; planned timeline). The research report duration is still to be confirmed.',
   note:'About 45 seconds. PARTNER VERSION: SWAP IN with the setup flow: one onboarding form produces one client config file; the setup script writes the client folder, applies every migration to the client’s own database, loads knowledge, offers and openers as drafts, generates the client’s prompt overlay with a leak check, and refuses Pecuna’s own database. It never buys numbers, spends credit or deploys. Say “planned”: no client has been set up yet. The onboarding form is not yet deployed.'
  },
  {
   id:'status',
   title:'Where it stands today',
   section:'11 / Status',
   kind:'gv-checklist',
   parts:[
    '<ul class="gv-status"><li class="gv-done">Built</li><li class="gv-done">Tested</li><li class="gv-done">Rehearsed</li><li class="gv-next">Live calls</li></ul>',
    '<div class="gv-zero"><span class="gv-big">0</span><p>real calls so far. So there are no booking rates, results or testimonials to show you yet, and we won’t invent any.</p></div>',
    '<div class="gv-golive"><div class="micro">Before the first live call</div><ol><li>xAI credits, offers approved, the calendar connected, phone lines and the server set up</li><li>Compliance sign-off with the lawyer</li><li>Six test calls per rep to Taylor’s own phone, each checked</li><li>Then a 50-call soft launch per rep</li></ol></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 19 (status and what blocks go-live) and section 06 (no results; the live database held 0 calls on 19 October 2026).',
   note:'About one minute. Honesty is the strength here. SAY: “Built, tested, rehearsed. Not live yet. Zero real calls, so I’m not going to show you a booking rate.” Go-live is Taylor’s decision: test calls first, then a 50-call soft launch per rep. If asked about the UK carrier: the UK rep is built on the Twilio path; the final UK carrier is still being chosen. The US rep uses Telnyx.'
  },
  {
   id:'close',
   title:'Book 20 minutes with Taylor',
   section:'12 / Next step',
   kind:'gv-close',
   parts:[
    '<blockquote class="gv-one" data-verbatim>Two honest AI reps, scripted from real buyer research, approved line by line by a human, calling only people who agreed to be called, and booking the meeting straight into the calendar.</blockquote>',
    '<div class="gv-cta"><div class="micro">Next step</div><p class="statement">A 20-minute call.</p><p class="gv-small">See the reps, the research and the dashboard, and whether it fits your calendar.</p></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 21 (“In one sentence”) and section 03, slide 16 call to action.',
   note:'About 30 seconds. Read the one sentence slowly. Then the call to action: book a 20-minute call with Taylor. Come back to the title honestly if you used it: Grok Voice is already closing inbound sales calls at Starlink; whether it replaces reps for outbound is what our first live calls will show, and we will show those numbers when we have them.'
  }
 ]
};
