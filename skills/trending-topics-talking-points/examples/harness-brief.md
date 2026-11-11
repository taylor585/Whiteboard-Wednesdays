# TRENDING TOPICS: How AI Harnesses Can 10x Your Quality and Output

SOURCE: Harness Chassis Builder - No Schedules (skill harness-chassis-builder-no-schedules)
FORMAT: Trending Topic Brief v2 (references/brief-format.md)

# AT A GLANCE

**PROMISE:** Wrap your AI in a harness and it stops interrupting, drifting, forgetting and bluffing, so quality and output both go up.

**TOTAL LENGTH:** about 35 to 40 minutes (theory 25, two examples 12).

| Section | Job | Length |
|---|---|---|
| Cold open | Show the payoff first | 0:45 |
| ACT 1: THE PROBLEM | Five failure characters the viewer recognises | 6 to 8 min |
| The turn | Problems are missing parts of a chassis | 1 min |
| ACT 2: THE SYSTEM | Eleven segments in run order, crossing off every problem | 12 to 15 min |
| ACT 2 examples (Segments 12 and 13) | live client app run + Harbour & Hearth paid ads harness | 12 min |
| ACT 3: THE PROOF | Quality x Output, with real numbers | 2 min |
| Close | CTA and next video | 1 min |

---

# READ BEFORE YOU RECORD

- **Hook:** same model, same prompt, two different results. The difference is the harness.
- **Act 1 characters (stick these up first):** The Interrupter, The Drifter, The Goldfish, The Bluffer, The Loose Cannon.
- **Act 2 one-liners, in order:** Harness the big, long jobs. AI answers its own questions first, then asks you once. Five locks keep piece twenty as good as piece one. One page that says what must stay true. Green: just do it. Amber: decide and log. Red: ask. Rules and progress live in files, so nothing gets forgotten. A script, not the AI, decides when it's finished. A separate AI marks the work, never its own homework. Tests before building, never sends twice, caps the spend. It keeps working until the checker says done. Your decisions first, then proof everything was done.
- **Have open before you press record:** a finished run folder, a terminal ready to run the checker three times, an evaluator verdict showing a fail.
- **Run order for today:** Act 1 problems (Claude and Codex) > what a harness is > how it fixes each problem (Segments 1 to 11) > Example 1 live client app, LIVE (Segment 12) > Example 2 Harbour & Hearth, built not run (Segment 13) > proof > close.
- **Say on camera at Example 2:** "We're not running this one, just to save credits. I'll show you everything it would do."
- **Bring:** your before and after numbers, and your story behind the no-schedules rule.
- **Angle check:** Nick Saraev posted "AI HARNESS: An In-Depth Explanation" this fortnight. Ours is different: a real business harness, live on client work, with the checker refusing to finish on camera.
- **Verify first:** the Anthropic and arXiv sources the skill cites.

---

# COLD OPEN (about 45 seconds)

**HOOK:** "Same model, same prompt, two completely different results. One drifts by piece ten, forgets your rules and tells you it's finished when it isn't. The other runs for hours and comes back with proof every requirement was met. The difference isn't the model. It's the harness."

**SHOW:** a finished run folder, a passing checker, the final report.

---

# ACT 1: THE PROBLEM (AI without a harness)

Every problem below was reverse-engineered from a specific line in the skill. The "Fixed by" column names the rule that solves it; Act 2 shows each fix.

## Character 1: The Interrupter (stops and asks when it does not need to)

This is the one you most want to lead with.

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P1 | It asks you questions it could answer from your brief or files | It never looked first | Kickoff: "harvest answers from the brief, assets and prior instructions before asking anything" |
| P2 | Questions arrive one at a time, drip-fed across hours | Nobody listed the blocking decisions up front | Kickoff Q8: inventory every owner decision now and ask them together |
| P3 | You come back after lunch and it has been waiting on you all along | Questions surface mid-run | Q8 plus the RED tier: only dependent work pauses |
| P4 | "Shall I proceed?" again and again | Every choice treated as needing approval | GREEN and AMBER tiers; "activate once" |
| P5 | It asks again for permission you already gave | Permissions are not recorded | "Previously granted authorisation persists within its limits"; "record the exact scope of any permission received" |
| P6 | Asks about trivia (names, spacing, order) | No sense of what is small | GREEN: micro-choices, no log needed |
| P7 | First error and it stops and hands the problem to you | No self-unblocking routine | "What can I verify or change within our permissions to fix this without bothering the owner?" |
| P8 | One open question freezes the whole job | Everything treated as dependent | "Pause only dependent RED work; continue independent work" |
| P9 | You have to keep typing "continue" | The model decides when to stop | Loop driver: stopping requires the finish line, not the model's judgement |

## Character 2: The Drifter (output slowly stops matching what you asked for)

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P10 | Style or voice wanders by the tenth piece | No named identity | Identity lock |
| P11 | Terminology, colours and formats become inconsistent | Nothing says what must stay identical | Sameness lock |
| P12 | Every hook and opening sounds the same | Nothing says what must differ | Difference lock |
| P13 | Piece 20 is noticeably lazier than piece 1 | Fatigue | Fatigue lock: "where would piece 20 be tempted to coast?" |
| P14 | "Make it on-brand" produces anything | Instruction is not testable | "'On-brand' is not testable"; locks must be checkable |
| P15 | It uses your skill or SOP once, then improvises | Skill not tied to every repetition | Skill bindings: by step and repetition, every section, every script |
| P16 | Mediocre, generic result | No quality bar was set | Kickoff Q2: what would make it world class, and what would let it down |
| P17 | You change your mind and it keeps following the old instruction (or the reverse: it ignores a rule halfway through) | No order of authority | "Never let a stale contract override the owner"; contract re-read every node |
| P18 | It drifts, then keeps building on the drifted work | Errors compound | "Repair any breach before continuing dependent work" |

## Character 3: The Goldfish (forgets)

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P19 | Long chats: it forgets the rules you set at the start | Context rot | Contract re-read in full at every node |
| P20 | After the chat is compressed, the rules quietly go missing | Summaries drop details | "Compaction must not replace the full contract with a summary" plus the PreCompact hook |
| P21 | It forgets to save its place before memory runs out | Saving relies on remembering | MR-7: checkpoint is mechanical, never remembered |
| P22 | New session = explaining everything again | State only lived in the chat | Four run files; "required state must not exist only in conversation" |
| P23 | New session re-runs the interview or re-asks for approval | No resume path | "Existing ACTIVE contract: resume without another interview or approval" |
| P24 | After a crash, nobody knows where it got to | No next action recorded | Checkpoint with "the exact next action"; "enough for a different agent or human to continue cold" |
| P25 | Too much in its head at once; quality drops | Everything loaded up front | "Keep pointers until the payload is needed"; offload long logs to files |
| P26 | It quietly rewrites its own progress notes | Markdown is easy to overwrite | Locked state kept in JSON |

## Character 4: The Bluffer (says it is right when it is not)

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P27 | "All done!" when it is not | Done is an opinion | MR-2: done is a ledger state; checker script must pass |
| P28 | It marks its own homework and gives itself an A | Self-review is lenient | MR-3: independent evaluator |
| P29 | The reviewer is talked round by the worker's explanation | Reviewer read the transcript | Evaluator sees artefacts only, never the transcript |
| P30 | Review is all praise | Sycophancy | "List problems before any praise" |
| P31 | Same blind spots in the checker as in the worker | Same model, same context | Fresh context; different model family for important work |
| P32 | A test fails, so it changes the test | Moving the goalposts | MR-4: never edit a test, feature or constraint to pass |
| P33 | "I checked the file" (it did not) | No proof required | "Do not claim to have read a file without reading it"; visible re-reads |
| P34 | "Success!" because the tool said 200 OK, but the output is wrong | Status confused with correctness | "A success status alone may not prove the requested artifact is correct; inspect the result" |
| P35 | It looks polished, but the button does nothing | Judged by appearance | App evaluator clicks through the build. "The screen looked polished, and that did not matter." |
| P36 | Invented numbers, testimonials or claims ("rated 4.9 by 2,000 customers") | Nothing forbids it | ALWAYS/NEVER framing cannot invent claims; Truthfulness axis is pass/fail |
| P37 | Guesses presented as facts | No separation | Kickoff separates facts, assumptions and genuine gaps |
| P38 | Research padded with duplicates, paraphrase passed off as quotes | Hitting a quota at any cost | Research rubric: shortfall ledger instead of padding |
| P39 | Blocked part quietly reported as finished | Pressure to look complete | "Never claim the blocked part is complete"; "checkpoint report" label |
| P40 | You cannot tell why it made a choice | Decisions not logged, or rebuilt afterwards | Live ledger: "never reconstruct the ledger from memory" |
| P41 | It pretends to follow a process it does not have | Missing skill invented | "Do not silently invent missing manuals"; disclose substitutions |

## Character 5: The Loose Cannon (does risky or wasteful things)

| # | What you see | Why it happens | Fixed by |
|---|---|---|---|
| P42 | It takes silence as a yes | No approval rule | "Never treat silence or elapsed time as approval" |
| P43 | It writes "approved" in its own log and carries on | Self-authorising | "A log entry cannot authorise an action" |
| P44 | On restart it sends the email, payment or publish a second time | Crash happened after the action, before the record | Reconcile with reality first; "never blindly repeat a send, payment, publish" |
| P45 | Same failing step retried again and again | No retry rule | "Avoid repeating an unchanged failed operation" |
| P46 | Loop runs all night and burns money | No cap | MR-5: iteration cap always set |
| P47 | Fix attempts go round in circles | No limit on repairs | Repair cap of four, then logged for review |
| P48 | Builds new features on top of something already broken | Never checks the base | MR-6: smoke test first; a failing smoke test is the current job |
| P49 | Creates random folders, overwrites another job's files | No workspace rules | "Do not create folders without an explicit request"; "never overwrite another run's state" |
| P50 | Passwords and keys end up in logs | Nothing excludes them | "Exclude credentials from run files and reports" |
| P51 | Helper agents ignore the rules | They never saw them | Each helper gets the full contract verbatim; results checked before merging |
| P52 | Over-engineered agent setups that break | Machinery added "just in case" | "Smallest durable runtime"; extra machinery must name the failure it fixes |
| P53 | Ad reporting with estimated spend or a verdict on a 1-day-old ad | No hard gates | Campaign rubric: spend_as_of from a live read; 72-hour rule; "a worker statement is never evidence" |

## Bonus problems (one line each, use if time allows)

- P54: Work runs in timed slices (every 20 or 30 minutes), so it keeps restarting cold and never finishes in one push. Fixed by MR-0, no schedules. **Tell your own story here.**
- P55: Upgrading your prompt silently drops old rules. Fixed by MR-1: v2 only adds, never removes.
- P56: Information gets lost when work is handed between prompts or tools. Fixed by: one skill owns the whole job.
- P57: Final summary buries what you need to act on. Fixed by: report leads with "decisions to review".
- P58: Process forced onto a five-minute task. Fixed by: "about ten messages is a heuristic, not a reason to impose process on a small task."

---


# THE TURN (about 1 minute)

**SAY:** "Each of those five characters is a missing part. The model is the engine. The harness is the chassis."

**DRAW:** interview → contract → prepare runtime → execute → verify → checkpoint → report

**QUOTE:** "The plan says what we will do; the contract says what must stay true; the ledger says what we decided."

---

# ACT 2: THE SYSTEM (how the harness solves every problem, in run order)

## SEGMENT 1: When to use a harness at all

**IN 5 TO 10 WORDS:** Harness the big, long jobs. Skip it for quick ones.

**WHY SHOULD PEOPLE CARE?:** You stop wasting setup time on small tasks, and you stop losing big jobs halfway through.

**WHEN TO USE IT:** The job spans more than one session or context window, runs for hours, needs to survive a restart, or repeats enough pieces that drift is likely (about ten messages or more is a rough guide).

**WHEN NOT TO USE IT:** Quick questions, brainstorming, small edits, one-off fixes.

**PROBLEMS IT SOLVES:** P55, P56, P58

**SAY:** It is not for everything. The skill itself says process on a small task is a mistake. When it is used, one skill owns the whole job, with no hand-offs to lose detail, and upgrades only ever add rules, never quietly drop old ones.

**QUOTE FROM THE SOURCE:** "About ten messages is a heuristic, not a reason to impose process on a small task."

**DRAW:** a dial from "quick question" to "overnight build", with the harness zone on the right.

**DEMO:** none.

**CROSS OFF:** P55, P56, P58.

---

## SEGMENT 2: The kickoff, nine questions it answers itself

**IN 5 TO 10 WORDS:** AI answers its own questions first, then asks you once.

**WHY SHOULD PEOPLE CARE?:** You brief it once and walk away. No drip-fed questions, and no coming back from lunch to find it has been waiting for you.

**WHEN TO USE IT:** At the start of every new harness job, before any work begins.

**WHEN NOT TO USE IT:** When resuming a job that already has an active contract (it goes straight back to work, with no second interview). Also not for small tasks or for fixing a broken part of an existing run.

**PROBLEMS IT SOLVES:** P1, P2, P3, P15, P16, P37

**SAY:** Before asking anything, it reads your brief, files and past instructions. It answers nine questions itself, separates facts from guesses, and brings you only the real gaps, all at once. Question 8 lists every decision that would block the run, so nothing surfaces at 2am.

**THE NINE:** what done means; what world class looks like; what could go wrong; which skills; where each skill is used; master rules; review gates; owner decisions that would block; how memory stays fresh.

**QUOTE FROM THE SOURCE:** "Harvest answers from the brief, assets and prior instructions before asking anything."

**DRAW:** nine boxes, seven ticked by the AI, two circled "ask Taylor".

**DEMO:** start a real job (10 UGC scripts). Show the nine answers appearing, then the short batch of questions.

**CROSS OFF:** The Interrupter: P1, P2, P3.

---

## SEGMENT 3: The five locks

**IN 5 TO 10 WORDS:** Five locks keep piece twenty as good as piece one.

**WHY SHOULD PEOPLE CARE?:** Your 20th ad, script or page matches the first in voice and quality, and you stop rewriting the later ones.

**THE FIVE:** Identity (one named voice), Sameness (what stays identical), Difference (what must not repeat), Let-down (what would make it fail), Fatigue (where it would start to coast).

**WHEN TO USE IT:** Any job with several pieces, or with a brand, voice or style to hold.

**WHEN NOT TO USE IT:** Do not force a lock the job does not need. App screens should repeat, so no Difference lock there. Research wants consistent evidence over variety. A single one-off piece needs few locks.

**PROBLEMS IT SOLVES:** P10, P11, P12, P13, P14

**SAY:** Every lock must be something a stranger could test. "Make it on-brand" is not a lock.

**QUOTE FROM THE SOURCE:** "Where would piece 20 be tempted to coast, and what quality floor must it still clear?"

**DRAW:** five padlocks with one word under each.

**DEMO:** the locks section of the contract from Segment 2's job.

**CROSS OFF:** The Drifter: P10 to P14.

---

## SEGMENT 4: The Work Contract, activated once

**IN 5 TO 10 WORDS:** One page that says what must stay true.

**WHY SHOULD PEOPLE CARE?:** You and the AI agree what good looks like before it starts, and you approve it once, not every five minutes.

**WHEN TO USE IT:** Every harness job, straight after the kickoff.

**WHEN NOT TO USE IT:** Small edits. And never let an old contract overrule a newer instruction from you; your new instruction updates the contract.

**PROBLEMS IT SOLVES:** P4, P5, P15, P17, P36, P41, P42

**SAY:** One or two pages. ALWAYS and NEVER rules that can never invent claims. Every step names a skill or says "none". You say "Active" once.

**QUOTE FROM THE SOURCE:** "Never treat silence or elapsed time as approval."

**DRAW:** a one-page contract with eight headings.

**DEMO:** scroll the contract: job and done, locks, framing, skill bindings, permissions.

**CROSS OFF:** P4, P5, P15, P36, P42.

---

## SEGMENT 5: Green, amber and red decisions, plus the live ledger

**IN 5 TO 10 WORDS:** Green: just do it. Amber: decide and log. Red: ask.

**WHY SHOULD PEOPLE CARE?:** It stops asking you about trivia, but never does anything risky without you. And you can see every decision it made and why.

**WHEN TO USE IT:** Throughout every run. Green for micro-choices (names, spacing). Amber is the default for normal choices. Red for publishing, sending, spending, deleting or legal claims that you have not already approved.

**WHEN NOT TO USE IT:** Do not make red a blanket rule: if you already approved something, mentioning it does not need asking again. Do not use amber for anything that affects safety, permissions or correctness.

**PROBLEMS IT SOLVES:** P4, P6, P7, P8, P40, P43, P45

**SAY:** When it hits a blocker, it asks itself first. Only work that depends on a red decision waits; everything else carries on.

**QUOTE FROM THE SOURCE:** "What can I verify or change within our permissions to fix this without bothering the owner?"

**DRAW:** traffic lights, with the ledger line underneath: `[#] · [step] · DECIDED · WHY · REVERSIBLE · REVIEW`

**DEMO:** type `ledger` mid-run; point at a REVIEW: yes.

**CROSS OFF:** the rest of The Interrupter.

---

## SEGMENT 6: Memory lives in files, not the chat

**IN 5 TO 10 WORDS:** Rules and progress live in files, so nothing gets forgotten.

**WHY SHOULD PEOPLE CARE?:** You never re-explain a job. A crash, a new chat or a long conversation picks up exactly where it stopped, with the rules intact.

**WHEN TO USE IT:** Any job that will outlive one chat or context window, or run for hours.

**WHEN NOT TO USE IT:** A five-message task. And do not start a second memory system alongside one the project already uses.

**PROBLEMS IT SOLVES:** P17 to P26, P33

**SAY:** Six files hold the job. Before every piece of work it re-reads the whole contract, and says so out loud ("Contract re-read; starting screen 4"), so it can't claim to have checked something it didn't. Before the chat is compressed, a hook saves a snapshot automatically.

**THE CYCLE:** re-read contract → load skills → do the work → check against evidence → checkpoint → continue.

**QUOTE FROM THE SOURCE:** "The transcript summary is not the contract."

**DRAW:** a filing cabinet with six drawers; the cycle as a wheel.

**DEMO:** close the session mid-run, open a new one, type "resume". It picks up at the exact next step with no questions.

**CROSS OFF:** The Goldfish: P19 to P26.

---

## SEGMENT 7: Done is a ledger state, not an opinion

**IN 5 TO 10 WORDS:** A script, not the AI, decides when it's finished.

**WHY SHOULD PEOPLE CARE?:** You stop finding half-finished work that was reported as done.

**WHEN TO USE IT:** Every requirement that can be checked, and at the finish of every harness run.

**WHEN NOT TO USE IT:** Qualities with no objective check (craft, storytelling) go to the evaluator instead. Do not create box-ticking tests for low-impact edits.

**PROBLEMS IT SOLVES:** P27, P32, P39

**SAY:** Every requirement becomes a row in a file. The AI cannot finish until a script confirms every row has evidence, checked by someone other than the worker.

**QUOTE FROM THE SOURCE:** "Done is a ledger state, not an opinion."

**DRAW:** a checklist with a padlock on the "DONE" box.

**DEMO:** run the checker three times:
1. Row unverified: "Completion string may NOT be emitted."
2. Row marked verified by "worker": still blocked.
3. Verified by the evaluator with evidence: passes.

**LINE TO SAY:** "The AI can't talk its way past a script."

**CROSS OFF:** P27, P32, P39.

---

## SEGMENT 8: The worker never grades its own homework

**IN 5 TO 10 WORDS:** A separate AI marks the work, never its own homework.

**WHY SHOULD PEOPLE CARE?:** Mistakes get caught before they reach a client, not after.

**WHEN TO USE IT:** At every milestone and at the finish. Use a different model family for anything client-facing, involving spend, or making legal claims.

**WHEN NOT TO USE IT:** Never as a replacement for the worker's own checks; it is in addition. Never give the evaluator the worker's history or past evaluations.

**PROBLEMS IT SOLVES:** P28 to P31, P34, P35, P36, P38, P47

**SAY:** Fresh context, finished work only, problems listed before any praise, hard pass marks. Four repair attempts, then it is flagged for you.

**QUOTE FROM THE SOURCE:** "The screen looked polished, and that did not matter."

**DRAW:** two desks with a wall between them; only the finished work passes through.

**DEMO:** an evaluator verdict with a fail and its defect list, then the fix and the pass. Optional: the UGC script that claims "rated 4.9 by 2,000 customers" failing on truthfulness alone.

**CROSS OFF:** The Bluffer.

---

## SEGMENT 9: Safety rails

**IN 5 TO 10 WORDS:** Tests before building, never sends twice, caps the spend.

**WHY SHOULD PEOPLE CARE?:** No double-sent emails, no surprise bills, no building on top of broken work.

**WHEN TO USE IT:** The smoke test for app builds, before any new work. The restart check whenever a run resumes after sending, publishing or paying for anything. Caps on every unattended run.

**WHEN NOT TO USE IT:** The smoke test is for apps; scripts and research do not need one. Do not add extra machinery that does not fix a named problem.

**PROBLEMS IT SOLVES:** P44, P46, P48 to P53

**SAY:** On restart it checks what actually happened before retrying anything. Helpers get the full contract. The setup stays as small as possible.

**QUOTE FROM THE SOURCE:** "Never blindly repeat a send, payment, publish or other consequential operation."

**DRAW:** guard rails either side of a road.

**DEMO (optional):** a failing smoke test becoming the current job.

**CROSS OFF:** The Loose Cannon.

---

## SEGMENT 10: The loop driver, and why no schedules

**IN 5 TO 10 WORDS:** It keeps working until the checker says done.

**WHY SHOULD PEOPLE CARE?:** It works for hours without you typing "continue", and it never runs up a bill overnight.

**WHEN TO USE IT:** Only after you have approved unattended running and the contract is active.

**WHEN NOT TO USE IT:** Never without an iteration cap. Never on a timer, schedule or interval. Not needed for short, supervised runs.

**PROBLEMS IT SOLVES:** P9, P46, P54

**SAY:** A Stop hook will not let the session end until the checker passes or the cap is reached. Blockers are logged, never treated as "done".

**QUOTE FROM THE SOURCE:** "The loop cannot shorten a run; it can only prevent the model from stopping before the finish line."

**DRAW:** a circular arrow with a padlock on the exit marked "checker passes" and a counter marked "cap: 60".

**DEMO:** show the command: `/ralph-loop "<loop prompt>" --max-iterations 60 --completion-promise "CHASSIS DONE"`

**STORY:** your real reason for the no-schedules rule.

**CROSS OFF:** P9, P54.

---

## SEGMENT 11: The report that leads with what you need

**IN 5 TO 10 WORDS:** Your decisions first, then proof everything was done.

**WHY SHOULD PEOPLE CARE?:** Five minutes tells you exactly what needs you and what was delivered.

**WHEN TO USE IT:** At the end of every run. At the end of an unfinished session, as a "checkpoint report".

**WHEN NOT TO USE IT:** Never call an unfinished run complete; label it a checkpoint report.

**PROBLEMS IT SOLVES:** P57, P39, P40

**SAY:** Decisions to review first, with how to reverse each. Then the ledger, which skill ran where, every lock, leftovers, the nine answers and every requirement with its evidence.

**QUOTE FROM THE SOURCE:** "Report states the actual completion status and leads with decisions to review."

**DRAW:** a report page with "YOUR DECISIONS" boxed at the top.

**DEMO:** scroll a real final report.

**CROSS OFF:** P57.

---

## SEGMENT 12: Example 1, LIVE: a real client app harness

**IN 5 TO 10 WORDS:** A real client app, built feature by feature, unattended.

**WHY SHOULD PEOPLE CARE?:** This is the difference between "AI helped me code" and "AI shipped a client's features while I did other work", with proof each one works.

**WHEN TO USE IT:** App builds with several features, more than one session of work, and a repo the agent can run and test.

**WHEN NOT TO USE IT:** A one-line bug fix, or an app with no way to run or test it (fix that first; the smoke test needs something to hit).

**PROBLEMS IT SOLVES:** P1 to P3, P19 to P24, P27, P28, P32, P35, P46, P48

**SAY:** "This is a client app we're building right now. I'm going to start a harness on it live, walk away, and we'll come back later to see exactly how far it got and what it decided without me."

**QUOTE FROM THE SOURCE:** "A failing smoke test becomes the current node; new features wait."

**DRAW:** a row of feature boxes, each with a tick box; a "smoke test" gate in front of the row; a loop arrow with "cap: 60".

**DEMO:** follow the live run script in Appendix A, steps 1 to 6: paste the kickoff prompt, show the nine answers it writes itself, say "Active", show features.json (every feature starts passes:false), start the loop, then show PROGRESS.md filling. Later in the video or a follow-up: Appendix A step 7, the check-in.

**CROSS OFF:** P1, P2, P3, P27, P35, P48 (point at each on the board as it happens live).

---

## SEGMENT 13: Example 2, BUILT NOT RUN: Harbour & Hearth paid ads campaign

**IN 5 TO 10 WORDS:** One harness runs research, emails, ads, scripts and page.

**WHY SHOULD PEOPLE CARE?:** A whole campaign is 20-plus pieces. Without a harness, piece 20 is worse than piece 1 and the claims drift. With one, every piece hits the same bar and nothing goes live without your sign-off.

**WHEN TO USE IT:** Multi-asset campaigns: emails, statics, video scripts and a landing page for one offer, one ICP.

**WHEN NOT TO USE IT:** A single ad or a single email. And never let it launch spend: staging stays paused until you approve.

**PROBLEMS IT SOLVES:** P10 to P16, P36, P38, P42, P43, P53

**SAY:** "Harbour & Hearth is a made-up brand, so I can show you the whole thing. We're not running this one, just to save credits, but here's every question it answers, every skill it uses and every check it has to pass."

**QUOTE FROM THE SOURCE:** "A worker statement is never evidence."

**DRAW:** one ICP box at the top, arrows down to four lanes (emails, statics, scripts, landing page), all passing through one "evaluator" gate, then a padlocked "PAUSED, awaiting approval" box.

**DEMO:** scroll Appendix B: the brief, the nine answers, the five locks, the skill bindings table, the constraints rows, then the campaign-stage rubric ("paused state", "72-hour rule").

**CROSS OFF:** P10 to P14, P36, P42, P53.

---

# ACT 3: THE PROOF

**DRAW:** Quality × Output = 10x
- Quality: locks, re-reads, the evaluator, the done check. No drift, no fake "done".
- Output: questions asked once, amber decisions made without you, no "continue" babysitting, cold resume, less rework.

**NUMBERS (presenter fills in):**
- Before: ______ pieces per day, ______ rounds of rework, ______ interruptions
- After: ______ / ______ / ______

**RECAP:** all five Act 1 characters crossed out.

---

# CLOSE

**CTA:** free download (the checker script or a starter contract).

**NEXT VIDEO:** "Next week, Vision Boards: how we decide what to build before the harness builds it."

---

# PREP CHECKLIST

- [ ] A finished run folder (contract, plan, progress, constraints, final report)
- [ ] the client app repo open in Claude Code, app runnable, Appendix A prompts ready to paste
- [ ] Appendix B open on screen for the Harbour & Hearth walkthrough
- [ ] Checker demo files for the three runs in Segment 7
- [ ] An evaluator verdict showing a fail
- [ ] Ralph Wiggum plugin installed, if showing the loop
- [ ] Your story behind the no-schedules rule
- [ ] Your before and after numbers
- [ ] Verify before quoting on camera: the skill cites Anthropic engineering posts (Nov 2025, Mar 2026) and arXiv papers dated 2026, which have not been independently checked



---

# PACKAGING

## TITLES (A/B set)

| # | Title | Formula | Chars | Intent | Score |
|---|---|---|---|---|---|
| 1 | How AI Harnesses Can 10x Your Quality and Output | Stakes / multiplier | 48 | Both | 85 |
| 2 | Your AI Isn't Dumb. It Has No Harness. | Reframe | 38 | Both | 75 |
| 3 | I Tested an AI Harness on a Real Client App | I tested | 43 | Both | 80 |

**RECOMMENDED PAIR:** title 1 with thumbnail line "It can't lie about done."

## THUMBNAIL LINES

- With title 1: "It can't lie about done." (proof: the checker refusing, on screen)
- With title 2: "Same model. 10x output." (verdict)
- With title 3: "Built while I slept." (result; only if the live run shows real progress)

## DESCRIPTION

**LINE 1:** How we stop Claude and Codex drifting, interrupting and bluffing on long jobs: a real business harness, live.

**LINE 2:** Get the harness starter contract: [your link]

**BODY:**
- Why AI answers its own questions first, then asks you once
- The five locks that keep piece twenty as good as piece one
- Green, amber, red: how it decides without bothering you
- Why a script, not the AI, decides when it's done

**CHAPTERS:** from transcript after recording. Planned: Same model, different results / Five AI failure types / What a harness is / Kickoff and the five locks / Decisions and memory / The done check / Live client app build / Campaign harness walkthrough / Proof and next steps

**STANDING BLOCKS:** Pecuna Factorem call link, socials, disclosure if any affiliate link.

**HASHTAGS:** none (Taylor's rule overrides).

---

# APPENDIX A: LIVE CLIENT APP RUN SCRIPT

**Client:** a real client app in progress (name it on camera only if the client has agreed). Keep any personal or user data off screen.

**Before you record:** open the the client app repo in Claude Code (desktop app, so you can show it). Make sure the app can run locally or in the cloud session.

**Step 1: kickoff prompt (paste this):**

```
Use the harness-chassis-builder-no-schedules skill.

Job: continue building the the client app app end to end. Read the repo, README, open issues/PRs and any brief in the project first, and harvest every answer you can before asking me anything.

Deliverable class: app/system.
Run the full nine-question kickoff and show all nine answers on screen.
Write INTERVIEW.md, CONTRACT.md, PLAN.md, PROGRESS.md, CONSTRAINTS.json and features.json in a harness/ folder in the repo.
features.json: list every remaining user-visible feature, each passes:false, one per iteration.
Write init.sh and a smoke test for this app before any new work.
Decision tiers: GREEN micro-choices; AMBER decide and log; RED = anything touching production data, payments, deploys or user personal data.
Ask me only the genuine gaps and the Q8 owner decisions, all together, in one message.
```

**Step 2:** while it reads, say: "Watch: it's answering its own questions from the repo first." Point at the board (The Interrupter, P1).

**Step 3:** show the nine answers and the short list of questions. Answer them. Say "Active".

**Step 4:** open `harness/features.json`. Say: "Every feature starts as false. It only flips to true with end-to-end evidence." Open `CONSTRAINTS.json`: "And the AI can't mark these verified itself."

**Step 5: start the loop (paste):**

```
/ralph-loop "Read harness/CONTRACT.md in full, then PLAN.md, PROGRESS.md, CONSTRAINTS.json and features.json. Run init.sh and the smoke test first; if it fails, fixing it is the current node. Take the next eligible feature and run the node cycle: re-read, load bound skills, perform, gate-check, checkpoint. At each PLAN milestone run the independent evaluation with the EVALUATOR PACKET and record its verdict. Log every AMBER decision as it is made. Never edit a test, feature row or constraint row to make it pass. If a node is blocked, record it in PROGRESS and continue with an independent node. Output the exact words CHASSIS DONE only when PLAN has no eligible node and python3 scripts/check_constraints.py harness/CONSTRAINTS.json exits 0." --max-iterations 40 --completion-promise "CHASSIS DONE"
```

If the ralph-wiggum plugin is not installed, say so and paste the same prompt as a normal message; it still runs the node cycle, you just re-enter it yourself.

**Step 6:** say: "Now I walk away. No timers, no schedule. It keeps going until the checker passes or it hits the cap of 40."

**Step 7: the check-in (later, paste):**

```
ledger
Then show: features passing vs remaining (python3 scripts/check_features.py harness/features.json), CONSTRAINTS rows verified vs not (python3 scripts/check_constraints.py harness/CONSTRAINTS.json), every REVIEW: yes decision, and the exact next action from PROGRESS.md.
```

Show on camera: the ledger, the feature count moving, any evaluator fail and its repair, and "decisions for you" at the top.

---

# APPENDIX B: HARBOUR & HEARTH CAMPAIGN HARNESS (built, not run)

## The client (made up)

**Harbour & Hearth** is a premium UK home-fragrance brand: hand-poured soy candles and reed diffusers, sold direct online, average order £48. Founder: Ellie Marsh, Cornwall. Launching the **"Winter Harbour" collection** (3 scents) for November with Meta ads.

**Their requests:**
1. ICP research from real buyer reviews (Reddit, Trustpilot).
2. A 5-email launch sequence (teaser, launch, social proof, last chance, thank-you).
3. 6 static ad images (2 per scent) with headlines.
4. 3 promotional video scripts: a UGC unboxing, a founder-to-camera story, a 15-second product demo.
5. A landing page for the collection.
6. The Meta campaign staged and paused, ready for approval.

## The nine kickoff answers (what the harness would write)

1. **Done means:** 5 emails, 6 statics, 3 scripts with storyboards, 1 landing page live on staging, 1 Meta campaign staged PAUSED, every CONSTRAINTS row verified with evidence.
2. **World class:** every hook uses a real buyer phrase; the page loads fast and matches the ads; the 20th piece is as sharp as the first. Let down in performance if claims are invented; let down in aesthetics if the statics look like stock templates.
3. **What could go wrong:** invented reviews or "bestseller" claims; voice drifting between email and video; hooks repeating; ads going live without approval; spend reported without a live read. Each becomes a lock, NEVER rule or RED permission.
4. **Skills:** icp-buyer-research-verified-evidence-quality-gate, breakthrough-advertising-mastery, world-class-copywriting, llm-image-creator, ugc-script-creator, creative-storyboard-architect, finishing-touches-copy-and-scripts, fable-website-funnel-design, web-and-funnel-design-quality-gate-approved, meta-ads-creation-and-management.
5. **Where each is used:** see the bindings table below; every email, every static, every script, every page section.
6. **Master rules:** the five locks below, plus ALWAYS/NEVER framing.
7. **Review gates:** after research, after copy, after creative, after the page, after staging. Independent evaluator at each, using the research-section, ugc-script and campaign-stage rubrics.
8. **Owner decisions (asked once, up front):** offer and discount (e.g. 15% launch code?), budget and dates, approval to stage in Meta, who signs off before activation.
9. **Memory:** contract re-read before every asset; four run files plus CONSTRAINTS.json; PreCompact hook; resume from PROGRESS.

## The five locks

- **Identity:** "Coastal calm": warm, unhurried, sensory, British. Named in the contract; changing it needs Ellie's sign-off.
- **Sameness:** the same 3 scent names, the same offer wording, the same colour palette (sea-glass green, driftwood, cream) and fonts in every asset.
- **Difference:** no two hooks open the same way; each email has a different job; the 3 scripts use 3 different formats.
- **Let-down:** performance: any claim without a source fails; aesthetics: any static that reads as a template fails.
- **Fatigue:** static 6 and email 5 must still use a real buyer phrase and pass the same evaluator thresholds.

**ALWAYS:** quote real buyer language; say "hand-poured in Cornwall" only because the brief says so. **NEVER:** invent reviews, star ratings, "bestseller" or stock counts; activate any ad; report spend without a live read.

## Skill bindings

| Step | Skill | Used on |
|---|---|---|
| ICP research | icp-buyer-research-verified-evidence-quality-gate | the research stage, once |
| Angles and offer | breakthrough-advertising-mastery | before any copy |
| Emails | world-class-copywriting, then finishing-touches-copy-and-scripts | each of the 5 emails |
| Static images | llm-image-creator | each of the 6 statics |
| Video scripts | ugc-script-creator, then finishing-touches-copy-and-scripts | each of the 3 scripts |
| Storyboards | creative-storyboard-architect | each script |
| Landing page | fable-website-funnel-design | each page section |
| Page QA | web-and-funnel-design-quality-gate-approved | the finished page |
| Meta staging | meta-ads-creation-and-management | campaign, ad sets, ads (PAUSED) |

## Decision tiers

- **GREEN:** word choice inside the locks, image crops, section spacing.
- **AMBER (decide and log):** email order, which buyer quote leads which ad, page section order.
- **RED (Ellie decides):** discount size, budget, launch date, activating anything in Meta.

## Sample CONSTRAINTS rows

| id | check | verified by |
|---|---|---|
| C-01 | 5 emails, 6 statics, 3 scripts, 1 page, 1 staged campaign exist at their paths | evaluator |
| C-02 | Every hook quotes a phrase traceable to the research report | evaluator (quote + source) |
| C-03 | No review, rating, "bestseller" or stock claim without a source | evaluator |
| C-04 | Scent names, offer wording and palette identical in all assets | evaluator |
| C-05 | Every Meta object reads back PAUSED from the platform | ground truth (Meta read-back) |
| C-06 | Every ad URL carries utm_source, utm_medium, utm_campaign, utm_content | ground truth |
| C-07 | Landing page passes the funnel quality gate on mobile and desktop | evaluator (screenshots) |

## The evaluator moments to describe

- **Research:** "ten graded quotes, each with a URL and date, or a shortfall ledger. No padding."
- **Scripts:** the ugc-script rubric fails a script on truthfulness alone, the "rated 4.9 by 2,000 customers" example.
- **Staging:** the campaign-stage rubric: paused read-back, UTMs, no verdict on any ad under 72 hours, approval recorded against exact ad IDs.

## The loop it would use

```
/ralph-loop "<the fixed loop prompt, as in Appendix A, with Harbour & Hearth paths>" --max-iterations 50 --completion-promise "CHASSIS DONE"
```

**Line to say:** "And that's where we'd press go. We're not running it today, just to save credits."
