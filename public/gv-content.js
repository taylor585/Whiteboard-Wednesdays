/* Grok Voice WILL Replace Sales Reps! (id: grok-voice).
   Rebuilt 19 October 2026 from the designs Taylor approved in the Whiteboard Wednesdays - Variety Pack (round 1).
   Sources: Taylor's "Grok Voice outbound system" handover brief (20 pages, 19 Oct 2026) and SpaceXAI's Grok Voice 3.0
   announcement (x.ai/news/grok-voice-3, 14 Oct 2026). Pecuna Factorem brand. */
(()=>{
const say=(text,start)=>text.split(' ').map((w,i)=>'<span class="gv-w'+(/^(AI|recorded|stop|’stop’)/.test(w.replace(/[^\w’]/g,''))?' gv-k':'')+'" style="--d:'+(start+i*150)+'ms">'+w+'</span>').join(' ');
const tick='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5 11-12"/></svg>';
const log=[['support','resolved'],['sales','purchased'],['support','resolved'],['support','handed to a person'],['sales','callback booked'],['support','resolved']];
window.WW={
 slides:[
  {
   id:'starlink',
   title:'Grok Voice is already selling',
   section:'00 / Cold open',
   kind:'gv-hook-log',
   parts:[
    '<div class="gv-log-wrap"><div class="micro">Illustrative call log</div><div class="gv-log" aria-hidden="true"><div class="gv-feed">'+Array.from({length:16},(_,i)=>'<span>call '+(19984+i).toLocaleString('en-GB')+' · '+log[i%6][0]+' · <b>'+log[i%6][1]+'</b></span>').join('')+'</div></div><p class="gv-small">An illustration of the scale. The figures beside it are the real ones.</p></div>',
    '<div class="gv-day"><div class="micro">Starlink, every day</div><span class="gv-big">20,000</span><small>customer calls answered by Grok Voice</small></div>',
    '<div class="gv-pair"><div><span class="gv-mid">70%</span><small>roughly, resolved with no human in the loop</small></div><div><span class="gv-mid">1 in 4</span><small>sales calls ends in a purchase before the caller hangs up</small></div></div>'
   ],
   reveals:[1,2,3],
   source:'Source: SpaceXAI, “Grok Voice 3.0”, x.ai/news/grok-voice-3, 14 October 2026. Company figures, not independently audited. The call log is illustrative.',
   note:'Hook, about 30 seconds. SAY: “Twenty thousand calls a day. Seventy per cent sorted without a human. One in four sales calls ends in a purchase before the caller hangs up. That is Grok Voice at Starlink, right now.” The scrolling log is an illustration of the scale, not real call records; the three numbers are SpaceXAI’s published figures. Earlier figure if asked: in April xAI reported a 20% sales conversion rate on the same line (x.ai/news/grok-voice-think-fast-1, 23 April 2026).'
  },
  {
   id:'their-numbers',
   title:'Their numbers, not ours',
   section:'00 / Cold open',
   kind:'gv-hook-card',
   parts:[
    '<figure class="gv-post"><div class="gv-by"><span class="gv-av" aria-hidden="true">xAI</span><span>SpaceXAI<small>Grok Voice 3.0 announcement · 14 October 2026</small></span></div><blockquote data-verbatim>Roughly 70% are resolved with no human in the loop, and <span class="gv-sweep">one in four sales calls ends in a purchase before the caller hangs up.</span></blockquote></figure>',
    '<div class="gv-sticky" style="--r:4deg">Their numbers. Not audited. Not cold leads.</div>',
    '<p class="statement gv-punch">So we built two reps on the same model. <span>Here is exactly how.</span></p>'
   ],
   reveals:[1,2,3],
   source:'Source: SpaceXAI, x.ai/news/grok-voice-3, 14 October 2026; the quotation is word for word. None of these figures are Pecuna Factorem results.',
   note:'About 30 seconds. Read the sentence, let the highlight land on “one in four sales calls”, then slap the sticky note: these are SpaceX’s own numbers about its own product, nobody has audited them, and these are people calling Starlink who already want it, not cold leads. Turn: “So we built two outbound reps on the same model. Here is exactly how they work, and where they are today.”'
  },
  {
   id:'problem',
   title:'Why outbound calling breaks',
   section:'01 / The problem',
   kind:'gv-pains gv-ch-ink',
   parts:[
    '<div class="gv-pain"><span class="gv-strike">Slow to staff</span><p>Every good caller has to be found, trained and kept.</p></div>',
    '<div class="gv-pain"><span class="gv-strike">Hard to keep consistent</span><p>Every caller says it differently, on a good day and a bad one.</p></div>',
    '<div class="gv-pain"><span class="gv-strike">Generic scripts</span><p>The words come from the seller, not from the buyer.</p></div>',
    '<p class="statement">What if every call started from <span class="gv-sweep">what buyers actually say</span>?</p>'
   ],
   reveals:[1,2,3,4],
   source:'Source: Handover brief, section 03, slide 2 key message. Qualitative by design: no industry statistics are claimed.',
   note:'About 40 seconds. Keep this qualitative; the brief says no invented industry statistics. SAY: “Outbound calling breaks in three places. It’s slow to staff. It’s hard to keep consistent, because every caller says it differently. And the scripts are written by the seller, in the seller’s words.” Each problem is struck through as you name it. The last line is the turn into the system.'
  },
  {
   id:'reps',
   title:'Meet Charlotte and Madison',
   section:'02 / The reps',
   kind:'gv-say gv-ch-marker',
   parts:[
    '<div class="gv-rep"><div class="gv-speaker"><i aria-hidden="true"></i>Charlotte · UK · Grok voice eve</div><blockquote class="gv-script" data-verbatim>'+say('Hi, is that [first name]? This is Charlotte, an AI assistant calling from Pecuna Factorem. Just so you know, the call is recorded for quality. Have you got a quick minute?',200)+'</blockquote><p class="gv-small">Weekdays 09:00 to 17:30 UK time · bank holidays skipped · screened against TPS and CTPS</p></div>',
    '<div class="gv-rep"><div class="gv-speaker"><i aria-hidden="true"></i>Madison · US · Grok voice ara</div><blockquote class="gv-script" data-verbatim>'+say('Hi, is that [first name]? This is Madison, an AI assistant calling from Pecuna Factorem. If you’d rather not get calls from us, just say ‘stop’ at any time and I’ll take you off our list. The call is recorded for quality. Do you have a quick minute?',200)+'</blockquote><p class="gv-small">Weekdays 09:00 to 17:00 in the lead’s own time zone · federal and state holidays skipped · consent always required</p></div>',
    '<p class="gv-goal"><b>One goal on every call:</b> book a 20-minute strategy call. Second best, agree to send the booking link.</p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 09 (reps, voices, calling windows, registers, openings word for word, goal on every call).',
   note:'About one minute. Each opening reads itself word by word at talking pace; “AI” and “recorded” are highlighted as they are spoken. SAY: “Two reps. Charlotte calls the UK, Madison calls the US. They have names and voices, and they say plainly that they are AI, in the first sentence, every time.” Point out that Madison gives the opt-out straight after the business name. Aim for under three minutes per call. Prices and proof only ever come from the get_offer tool, never from the model. Never say “sounds human”.'
  },
  {
   id:'call-path',
   title:'How a call works',
   section:'03 / The system',
   kind:'gv-signal gv-ch-ink',
   parts:[
    '<div class="gv-lane"><div class="gv-wire" aria-hidden="true"></div><ol class="gv-stations"><li style="--d:600ms"><b>Lead</b>opted in, with a consent record</li><li style="--d:1300ms"><b>Dispatcher</b>allowed to ring now?</li><li style="--d:2000ms"><b>Phone line</b>UK: Twilio path · US: Telnyx</li><li style="--d:2700ms"><b>Grok Voice 3.0</b>the conversation</li><li class="gv-end"><b>Calendar</b>20-minute call booked</li></ol><div class="gv-dot" aria-hidden="true"></div></div>',
    '<div class="gv-under"><p><b>Every step checks the rules before the next one runs.</b> Consent, TPS, CTPS or DNC, the do-not-call list, local calling hours and holidays, and at most 3 attempts, 24 hours apart.</p><p><b>Only approved knowledge reaches the call.</b> The call server bridges the line to Grok Voice with a lean prompt and 10 tools, and guards for silence, talk-over, call screeners, opt-outs and safety stops.</p></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 08 (architecture and the life of one call) and section 13.',
   note:'About 90 seconds. Let the gold dot travel the line: each station flashes as the call passes it. 1) Leads are imported with consent records; the importer’s consented-only mode skips anyone without one. 2) Every few minutes in calling hours the dispatcher picks leads that pass every rule. 3) The carrier dials and streams the audio to our server. 4) The server bridges it to Grok Voice; the rep speaks first, within 2 seconds. 5) Mid-call the rep can find free slots and book. After the call it is scored, reflected on and its objections counted, and Taylor reviews everything on the dashboard. UK carrier: built on the Twilio path; the final UK carrier is still being chosen.'
  },
  {
   id:'research',
   title:'It starts with research',
   section:'04 / The words',
   kind:'gv-grid gv-ch-marker',
   parts:[
    '<div class="gv-matrix"><div class="gv-cols" aria-hidden="true"><span>Buyer 1</span><span>Buyer 2</span><span>Buyer 3</span></div><div class="gv-cells">'+Array.from({length:9},(_,i)=>'<div class="gv-cell" style="--d:'+(150+i*140)+'ms">'+'<i></i>'.repeat(10)+'</div>').join('')+'</div><div class="gv-rows micro">Rows: feeling the problem · comparing solutions · ready to buy</div></div>',
    '<div class="gv-eq"><p>3 buyer types<br>× 3 buying stages<br>× 10 of each</p><p class="gv-eq-sum">= 90 fears, 90 desires, 90 questions, 90 past experiences and 90 verbatim quotes</p></div>',
    '<p class="statement gv-punch">It doesn’t ask the client who their customers are. <span>It reads what buyers say to each other where nobody is selling to them.</span></p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 11, counted from the full 154-page sample report. The client in the sample report is never named.',
   note:'About one minute. Nine cells pop in, one per buyer type and stage, and each fills with ten dots. SAY: “Before a single line of script is written, we build a research report on the people who buy. Three buyer types, three buying stages each, and for every stage ten fears, ten desires, ten questions, ten past experiences and ten verbatim quotes. It reads forums, one-star and five-star reviews: what buyers say when nobody is selling to them.” One stage in the sample found only 8 genuine questions and left two rows empty rather than pad them; that honesty is worth saying. Always “a sample client report”, never the client’s name.'
  },
  {
   id:'research-to-words',
   title:'Research becomes the words',
   section:'04 / The words',
   kind:'gv-tiles',
   parts:[
    '<div class="gv-tile"><span>Fears and past experiences</span><b>Objection handlers, ready before they cost the sale</b></div>',
    '<div class="gv-tile"><span>Questions</span><b>FAQ answers the rep looks up mid-call</b></div>',
    '<div class="gv-tile"><span>Quotes and words to mirror</span><b>Openers in the buyer’s own words</b></div>',
    '<div class="gv-tile"><span>Words and claims to avoid</span><b>Never-say lists the reps cannot cross</b></div>',
    '<div class="gv-tile"><span>Buying stage</span><b>When to say it: empathy, comparison or clear terms</b></div>',
    '<div class="gv-tile"><span>Qualify and disqualify</span><b>The qualifying question and the minimum budget rule</b></div>',
    '<div class="gv-tile"><span>The buyer types themselves</span><b>Roleplay prospects that test the reps before they ring anyone</b></div>'
   ],
   reveals:[1,2,3,4,5,6,7],
   source:'Source: Handover brief, section 11, “How it becomes what the reps say”, and section 10.',
   note:'About one minute; one tile per reveal. SAY: “This is the bit nobody else does. Every section of the report turns into something the rep actually says, or refuses to say.” Example for the first tile: “we’ve tried agencies before” is a past experience in the report, so it becomes an objection handler, ready before it costs the sale. For Pecuna’s own reps this is already in the knowledge base as drafts: 33 “how do you / why you” answers per rep, 5 new objection handlers per rep and 14 deeper report questions per rep.'
  },
  {
   id:'approval',
   title:'Nothing is said until approved',
   section:'05 / Control',
   kind:'gv-drafts gv-ch-ink',
   parts:[
    '<div class="gv-states"><span class="gv-chip">Draft</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><span class="gv-chip gv-chip-on">Approved</span><svg class="gv-arrow" viewBox="0 0 44 18" aria-hidden="true"><path d="M2 9h38M32 2l8 7-8 7"/></svg><span class="gv-chip">Retired</span></div><p class="gv-lede">Drafts never reach a call. <span class="gv-sweep">Only approved rows are ever used</span>, and approving a new version retires the old one in one click.</p>',
    '<div class="gv-odo-wrap"><div class="micro">Drafts waiting for Taylor, live count on 19 October 2026</div><div class="gv-odo">'+[['166','objection drafts'],['100','FAQ drafts'],['12','talk-track drafts']].map((n,j)=>'<div><div class="gv-digits" role="img" aria-label="'+n[0]+'">'+n[0].split('').map((d,i)=>'<span><ol style="--v:'+d+';--d:'+(j*250+i*120)+'ms">'+'0123456789'.split('').map(x=>'<li>'+x+'</li>').join('')+'</ol></span>').join('')+'</div><small>'+n[1]+'</small></div>').join('')+'</div></div>',
    '<figure class="gv-zoom"><div class="gv-zoom-frame"><div class="gv-zoom-page" style="--ox:0%;--oy:45%"><img src="gv-brief-p10.png" alt="The handover brief, page 10: drafts waiting for Taylor, live count on 19 October 2026: 166 objection drafts, 100 FAQ drafts, 12 talk-track drafts" width="1450" height="372"><span class="gv-hit" style="left:3.3%;top:26.9%;width:30.7%;height:35.8%"></span></div></div><figcaption class="micro">The source: handover brief, page 10</figcaption></figure>',
    '<div class="gv-lean"><div class="gv-circled"><span class="gv-mid">12,000</span><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M30 8C8 12 2 50 8 72s40 26 70 20 22-50 8-70S50 0 22 14"/></svg></div><p><span class="gv-hand">characters per rep, down from about 35,000</span> The core script and top objections stay in the prompt; everything else is looked up mid-call. No match? The rep says <q data-verbatim>Taylor can tell you on the call</q> rather than improvise.</p></div>'
   ],
   reveals:[1,2,3,4],
   source:'Source: Handover brief, section 10 (draft, approved, retired; live draft counts from the database on 19 October 2026; the lean prompt and the 12,000-character target). Page 10 shown as rendered.',
   note:'About 90 seconds. SAY: “Here is the rule that makes this safe. The reps can only say what a human has approved. Everything else is a draft, and drafts never reach a call.” The counters roll to the real database counts on 19 October, then zoom into the brief to show where they come from: 166 objection drafts, 100 FAQ drafts and 12 talk-track drafts waiting for Taylor (278 knowledge drafts in all). They are a backlog, not results. Then the circled 12,000: everything in the prompt made it 33,000 (UK) to 35,000 (US) characters, too big for fast realtime voice, so it was split.'
  },
  {
   id:'objection-loop',
   title:'The objection loop',
   section:'05 / Control',
   kind:'gv-loop',
   parts:[
    '<svg class="gv-loop-svg" viewBox="0 0 520 330" role="img" aria-label="A loop of five steps: raise, draft, approve, live, stats, and back to raise"><path class="gv-loop-path" d="M260 50A170 120 0 1 1 259.9 50"/><path class="gv-loop-head" d="M-9 -8L2 0L-9 8" transform="translate(359.9 72.9) rotate(27)"/><g class="gv-stop"><circle cx="260" cy="50" r="9"/><text x="260" y="30" text-anchor="middle">1 Raise</text></g><g class="gv-stop"><circle cx="421.7" cy="132.9" r="9"/><text x="440" y="139" text-anchor="start">2 Draft</text></g><g class="gv-stop gv-stop-on"><circle cx="359.9" cy="267.1" r="11"/><text x="360" y="306" text-anchor="middle">3 Approve</text></g><g class="gv-stop"><circle cx="160.1" cy="267.1" r="9"/><text x="160" y="306" text-anchor="middle">4 Live</text></g><g class="gv-stop"><circle cx="98.3" cy="132.9" r="9"/><text x="80" y="139" text-anchor="end">5 Stats</text></g></svg>',
    '<ol class="gv-steps"><li><b>Raise</b>A prospect objects. A rules-only detector counts it after the call: no AI model, no cost.</li><li><b>Draft</b>New handlers arrive as drafts: a daily routine proposes 10 (5 UK, 5 US), plus call reflections and the research.</li><li><b>Approve</b>Taylor sees each draft beside the live text and clicks Approve or Discard.</li><li><b>Live</b>The approved version replaces the old one within about 5 minutes.</li><li><b>Stats</b>Raised on how many calls, won how often. The lowest win rates are next to rewrite.</li></ol>',
    '<div class="gv-standard"><div class="micro">The objection standard, enforced in code</div><p>Label the concern, one concrete insight, one calibrated question. Then tie the value back and offer two real free times. Every spoken line under 45 words. <span class="gv-sweep">A draft that falls short is refused before it reaches the database.</span></p></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 12. The objection stats view has 0 rows today because there have been no real calls.',
   note:'About 90 seconds. The gold loop draws itself round the five stops. SAY: “Objections are where calls are won or lost, so they get a loop of their own. Every objection is counted, every improvement is written to a standard, and nothing goes live until a human approves it.” Then the standard: turn one labels the concern, gives one insight and asks one calibrated question; turn two ties the value to the research and offers two real free times; one backup attempt, then a polite give-up rule, and any opt-out is honoured at once. Be honest: the stats step has no data yet. Win rate will show association, not proof that the answer caused the win.'
  },
  {
   id:'booking',
   title:'Booked into your calendar',
   section:'06 / On the call',
   kind:'gv-phone gv-ch-marker',
   parts:[
    '<div class="gv-handset" aria-label="Illustrative call transcript"><div class="micro">Illustrative call</div><p class="gv-bb" style="--d:200ms"><b>Rep</b>I can do Wednesday 21 October at 2pm, or Thursday 22 October at 10am. Which suits you better?</p><p class="gv-bb gv-me" style="--d:1100ms"><b>Prospect</b>Wednesday works. It’s sam at example dot co dot uk.</p><p class="gv-bb" style="--d:2000ms"><b>Rep</b>Lovely. That’s sam@example.co.uk, and the invite is on its way for Wednesday at 2pm.</p></div>',
    '<ul class="gv-rules"><li><b>Live free slots</b>from the calendar, up to 14 days ahead, in the prospect’s own time zone</li><li><b>08:00 to 20:00</b>their time, at least 60 minutes ahead, spread across mornings and afternoons</li><li><b>Two real options</b>read out in plain words; if a slot has just gone, the two nearest are offered</li><li><b>Email captured</b>and written to the contact before booking; unclear ones are read back letter by letter</li></ul>',
    '<p class="gv-small gv-fallback"><b>Not ready to pick a time?</b> The rep agrees to send the booking link instead.</p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 13 (booking and email rows), section 08 tools and section 09 goal. The call is illustrative: no real call has taken place.',
   note:'About one minute. The call appears line by line on the phone. Say it is illustrative: no live calls yet. The rules beside it are real and unit-tested, and booking and email capture are also played end to end in the offline dress rehearsal. One booking per call. Booking is GoHighLevel live slots, or a booking link; no other calendar or CRM integration exists, so do not promise one.'
  },
  {
   id:'real-phone-life',
   title:'Built for real phone life',
   section:'06 / On the call',
   kind:'gv-checks',
   parts:[
    '<ul class="gv-checklist">'+[['Call screeners','one fixed line says who is calling and why'],['Phone menus','only keys that lead to a person; never pay or voicemail'],['Dead air','after 7 seconds: “Hello, are you still there?”'],['Talk-over','the rep’s audio stops at once']].map((t,i)=>'<li><span class="gv-box" style="--d:'+(250+i*350)+'ms">'+tick+'</span><span><b>'+t[0]+'</b>'+t[1]+'</span></li>').join('')+'</ul>',
    '<ul class="gv-checklist">'+[['Callbacks','“Ring me Thursday at 2” is rung then, in their time zone'],['Answering machines','hang up; no voicemail drops, by design'],['Wrong numbers','apologise, pitch nothing, never ring again'],['Safety stops','a child or a distressed person: stop selling, a kind goodbye']].map((t,i)=>'<li><span class="gv-box" style="--d:'+(250+i*350)+'ms">'+tick+'</span><span><b>'+t[0]+'</b>'+t[1]+'</span></li>').join('')+'</ul>',
    '<p class="gv-small">Every behaviour ticked here is unit-tested and played end to end, for both reps, in the offline dress rehearsal.</p>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 13 (call behaviour and safety; all eight shown are marked rehearsed).',
   note:'About one minute. Each box ticks as you name it. This is the slide that answers “will it embarrass us?”. Tell two as stories: the call screener (the model is muted, one fixed line, and a person who picks up hears the full opening) and safety stops (999 or 911 in an emergency, sales tools refused by the server, the lead held for Taylor’s review). Also true: “Where did you get my number?” is answered from the lead’s own consent record, and every call has a 30-minute hard limit.'
  },
  {
   id:'compliance',
   title:'Compliance by design',
   section:'07 / Safe to use',
   kind:'gv-rulebook gv-ch-ink',
   parts:[
    '<div class="gv-rule"><h3>Consent and leads</h3><p>Opted-in leads only, each with where and when they opted in. <span class="gv-sweep">The code refuses any US lead without written consent</span> covering AI-voice calls. UK consent is required by default, and TPS and CTPS screening still runs.</p></div>',
    '<div class="gv-rule"><h3>On every call</h3><p><span class="gv-sweep">AI disclosure, business name and recording notice</span> in the opening. Opt-outs go on the do-not-call list at once, for both reps, permanently. No voicemail messages.</p></div>',
    '<div class="gv-rule"><h3>Abandoned and silent calls</h3><p>If the AI has not spoken within 2 seconds, a short information message plays and the number is paused for 72 hours. <span class="gv-sweep">A brake pauses a rep if its abandoned rate goes above 3%.</span></p></div>',
    '<div class="gv-rule"><h3>Data and privacy</h3><p>Find and erase everything held on a person on request. Recordings in private storage. <span class="gv-sweep">The database is locked to the server-side key.</span></p></div>',
    '<p class="statement gv-punch">Built to the UK and US calling rules. <span>Legal sign-off in progress.</span></p>'
   ],
   reveals:[1,2,3,4,5],
   source:'Source: Handover brief, section 14 (compliance and consent) and section 06 (approved wording). Lawyer review is pending; this is not a claim of legal approval.',
   note:'About 90 seconds. Each rule’s key phrase is highlighted as you say it. SAY: “Compliance isn’t left to the script. It’s enforced by the code and checked on every call.” For Tuned Reps clients, the client is the caller of record and the data controller; Pecuna is the processor. Caller of record, AI disclosure and recording notice are required as true in the client config, with no setting to turn them off. Never say “fully compliant”, “legally approved” or “TCPA-certified”. Still with Taylor and the lawyer: consent wording (including Pennsylvania’s AI-voice rule, in force 18 October 2026), DNC subscription, the do-not-call policy, recording retention and the privacy notice.'
  },
  {
   id:'dashboard',
   title:'Your reps, working',
   section:'08 / What you see',
   kind:'gv-promise gv-ch-marker',
   parts:[
    '<div class="gv-speaker"><i aria-hidden="true"></i>The dashboard promise, from the package copy</div><blockquote class="gv-script" data-verbatim>'+say('Your reps, working. Every call your reps make, with the recording, the transcript and what happened next. Approve what they say before they say it. See who booked, who said not now, and why.',200)+'</blockquote>',
    '<ul class="gv-pages"><li><b>Calls</b>every call, with the recording, the transcript, the outcome and the score</li><li><b>Review</b>flagged calls, return calls and proposal drafts waiting on you</li><li><b>Openers</b>which opening lines book the most calls</li><li><b>Knowledge</b>each draft beside the live text it would replace: Approve or Discard</li></ul>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, sections 16 (the dashboard pages) and 20 (the dashboard copy, word for word). No call data is shown because there have been no real calls.',
   note:'About one minute. The promise reads itself word by word. A private web app behind a password, with every page and recording guarded. Client copies carry the client’s own name, logo, colours and rep names. Full page list: Overview, Calls, Call detail, Offers, Review, Openers, Wins and Losses, Knowledge. If you show mock-mode screens on camera (2,500 generated calls), label them illustrative; they are not data.'
  },
  {
   id:'tests',
   title:'Engineering you can check',
   section:'09 / Proof of build',
   kind:'gv-proof gv-ch-ink',
   parts:[
    '<figure class="gv-zoom"><div class="gv-zoom-frame"><div class="gv-zoom-page" style="--ox:0%;--oy:100%"><img src="gv-brief-p17.png" alt="The handover brief, page 17, Testing and rehearsal: 619 backend tests, all passing; 117 dashboard tests in 20 files, all passing; 28 calls in the offline dress rehearsal, 647 checks, every one green" width="1450" height="406"><span class="gv-hit" style="left:0.8%;top:54.8%;width:32.6%;height:43.8%"></span></div></div><figcaption class="micro">The source: handover brief, page 17 · 619 backend tests · 117 dashboard tests · 28 rehearsed calls, 647 checks</figcaption></figure>',
    '<div class="gv-lanes"><div class="gv-lane-on"><h3>What the rehearsal proves</h3><p>The whole call path joins up: dispatcher, signed webhooks, media bridge, guards, tools, booking, opt-out, saving, scoring and reflection. 14 whole calls per rep, with every outside service faked.</p></div><div><h3>What it doesn’t prove</h3><p>Real audio quality and latency on a phone line, how the real model behaves, carrier delivery, or a real calendar accepting the booking. <span class="gv-sweep">That is what six test calls per rep are for.</span></p></div></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 17, page 17 shown as rendered. Test totals from the run at commit 98c9c95 on 19 October 2026 and the dress rehearsal run the same day.',
   note:'About one minute. Start on the whole page, then the zoom lands on the 619. PARTNER VERSION: SWAP IN this slide early, and add the core update model (one codebase; client differences only from configuration and a prompt overlay; every improvement runs on Pecuna’s own reps first, is tagged core-vX.Y.Z and rolls out to a pilot client, then everyone; rollback means pinning the previous tag; no tags exist yet). SAY: “Nothing can be proved on a real phone line until the accounts are live, so we tested it the hard way, offline, with every outside service faked.” Be exact about the limits on the right.'
  },
  {
   id:'package',
   title:'What a client gets',
   section:'10 / The package',
   kind:'gv-notes gv-ch-marker',
   parts:[
    '<div class="gv-board">'+[['Buyer research report','3 buyer types × 3 stages, turned into openers, objections, FAQs and roleplay prospects',-3],['10,000 opted-in leads','screened against TPS, CTPS or the National DNC, each with its consent record',2],['Two AI reps','each calling 8 hours a day, 5 days a week, with their own names and voices',-2],['Their own database','never shared with Pecuna or another client',3],['A branded dashboard','the client’s name, logo, colours and rep names',-1]].map((t,i)=>'<div class="gv-note'+(i===4?' gv-note-alt':'')+'" style="--r:'+t[2]+'deg;--d:'+(150+i*300)+'ms"><span class="gv-pin" aria-hidden="true"></span><b>'+t[0]+'</b><small>'+t[1]+'</small></div>').join('')+'</div>',
    '<div class="gv-price"><div><span class="gv-big">$15,000</span><small>one-off setup: report, leads, building and scripting both reps, accounts and database, branded dashboard, test calls, go-live</small></div><div><span class="gv-mid">Monthly</span><small>to be confirmed</small></div></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 20 (the package and pricing). Only the one-off setup fee is settled; the monthly fee is still Taylor’s decision.',
   note:'About one minute. The five notes slap onto the board one after another. The productised version is called Tuned Reps, by Pecuna Factorem; on screen we keep the Pecuna brand. SAY the package in one breath, then the price: “$15,000 one-off setup. The monthly fee is still being confirmed, so I won’t quote one.” Do not quote a monthly figure, tiers, internal costs, margins or the lead supplier’s price. Grok voices available: Eve, Ara, Rex, Sal and Leo. Optional partner extra: Grok Voice’s public rate is about $0.08 a minute of connected time.'
  },
  {
   id:'setup',
   title:'From form to first call',
   section:'10 / The package',
   kind:'gv-track',
   parts:[
    '<ol class="gv-stops">'+[['Day 0','Contract and setup paid'],['Days 1 to 3','Onboarding form and kick-off call'],['Days 2 to 9','Buyer research report'],['Days 3 to 10','Accounts, phone checks, leads screened and imported'],['Days 9 to 14','Scripts written from the report; the client approves the drafts'],['Days 13 to 16','Rehearsal, test calls, sign-off, go live']].map((t,i)=>'<li style="--d:'+(200+i*300)+'ms"><span class="gv-stop-dot" aria-hidden="true">'+(i<5?i+1:'✓')+'</span><b>'+t[0]+'</b><small>'+t[1]+'</small></li>').join('')+'</ol>',
    '<div class="gv-form"><div class="micro">One onboarding form, twelve steps</div><p>Business, brand, offer, customers, buyer insight, FAQs and objections, calendar, calling, reps, compliance, integrations, review. It never asks for keys or passwords.</p><p class="gv-small">Planned at about three weeks; four if UK number checks or approvals are slow. Then a week-one review on day 5 of live calling.</p></div>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 20 (from onboarding form to go-live; planned timeline). The research report duration is still to be confirmed.',
   note:'About 45 seconds. Gold fills along the track stop by stop. PARTNER VERSION: SWAP IN with the setup flow: one onboarding form produces one client config file; the setup script writes the client folder, applies every migration to the client’s own database, loads knowledge, offers and openers as drafts, generates the client’s prompt overlay with a leak check, and refuses Pecuna’s own database. It never buys numbers, spends credit or deploys. Say “planned”: no client has been set up yet, and the onboarding form is not yet deployed.'
  },
  {
   id:'status',
   title:'Where it stands today',
   section:'11 / Status',
   kind:'gv-stamp gv-ch-ink',
   parts:[
    '<div class="gv-zero"><span class="gv-huge">0</span><p>real calls so far. So there are no booking rates, results or testimonials to show you yet, and we won’t invent any.</p></div>',
    '<div class="gv-stamped">Built · tested · rehearsed<small>Not live yet · results to come</small></div>',
    '<div class="gv-golive"><div class="micro">Before the first live call</div><ol><li>xAI credits, offers approved, the calendar connected, phone lines and the server set up</li><li>Compliance sign-off with the lawyer</li><li>Six test calls per rep to Taylor’s own phone, each checked</li><li>Then a 50-call soft launch per rep</li></ol></div>'
   ],
   reveals:[1,2,3],
   source:'Source: Handover brief, section 19 (status and what blocks go-live) and section 06 (no results; the live database held 0 calls on 19 October 2026).',
   note:'About one minute. Let the stamp slam. Honesty is the strength here. SAY: “Built, tested, rehearsed. Not live yet. Zero real calls, so I’m not going to show you a booking rate.” Go-live is Taylor’s decision: test calls first, then a 50-call soft launch per rep. If asked about the UK carrier: the UK rep is built on the Twilio path; the final UK carrier is still being chosen. The US rep uses Telnyx.'
  },
  {
   id:'close',
   title:'Book 20 minutes with Taylor',
   section:'12 / Next step',
   kind:'gv-invite gv-ch-marker',
   parts:[
    '<div class="gv-card"><div class="gv-card-top"><span>Invitation</span><span>20 minutes</span></div><div class="gv-card-body"><div class="gv-cal" aria-hidden="true"><small>Next step</small><b>20</b></div><div><h3>A 20-minute call with Taylor</h3><p>See the reps, the research and the dashboard, and whether it fits your calendar.</p></div></div><span class="gv-done" aria-hidden="true">'+tick+'</span></div>',
    '<blockquote class="gv-one" data-verbatim>Two honest AI reps, scripted from real buyer research, approved line by line by a human, calling only people who agreed to be called, and booking the meeting straight into the calendar.</blockquote>'
   ],
   reveals:[1,2],
   source:'Source: Handover brief, section 21 (“In one sentence”) and section 03, slide 16 call to action.',
   note:'About 30 seconds. The invite rises in and gets its tick: the deck ends on the thing the reps produce, a booked call. Then read the one sentence slowly. Come back to the title honestly if you used it: Grok Voice is already closing inbound sales calls at Starlink; whether it replaces reps for outbound is what our first live calls will show, and we will show those numbers when we have them.'
  }
 ]
};
})();
