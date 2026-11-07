# The headline (title) framework

How we write YouTube titles, and why. It's built from the packaging research on Nick Saraev, Sabri Suby and Riley Brown (who and how: `references/research/method.md`; findings: `references/research/overview.md`).

## The framework in four steps

1. **Promise and search term.** Write the one promise the video makes, and the noun people would type into YouTube (the tool, topic or outcome). Collect the real proof said in the video (numbers, results).
2. **Draft 10 titles across at least 5 formulas** (§2). Only use formulas the video can honestly deliver: no "I tested" without a test, no time-box beyond the running time, no "full course" under about an hour. Prefer formulas in their working phase (§1b); never revive a worn-out one.
3. **Score each title 0–100** (§4): both intents 25, topic in the first 4 words 15, ≤60 characters 15, an evidenced formula 15, one promise 10, a thumbnail that adds something 10, plain words 10. Penalties: plain "How to" −20, worn-out formula −10, anything the video doesn't deliver −30.
4. **Pick an A/B set of 3 from different formulas** and pair each with a thumbnail line that adds to it. After publishing, follow §5 and `references/learning-loop.md`.

**Brand rules on top (Pecuna Factorem, `references/brand/house-style.md`):**
- 70 characters or fewer (the brief said "under 70"; 70 is the hard limit `scripts/package.py` checks);
- the main hook in the first 40 characters;
- real figures only;
- never name a client;
- the thumbnail line must not repeat the title.

**Worked example:** §7, plus `examples/icp-buyer-research/titles-scored.md`.

## Where the evidence comes from

Built from 90 videos (the latest 30 long-form uploads each from Sabri Suby, Nick Saraev and Riley Brown, October 2026), scored by outlier ratio (views ÷ the median of the 10 uploads either side), then checked against each creator's **all-time top 20** (top 10 by views + top 10 breakouts, 60 videos) and their full upload history (Nick 320, Sabri 473, Riley 194). Full evidence: `references/research/overview.md` (laws, confidence), `references/research/creators.md` (per creator, by era) and `references/research/data/`. Numbers are medians; n is small, so treat them as strong signals, not laws.

**Era warning.** Raw views mostly measure age and channel size. Breakout ratios from a creator's early, small-channel years are inflated (Sabri's 2019–21 breakouts reach 85× against neighbours with ~3–10K views). Weight recent hits over old ones.

## Contents
0. The framework in four steps (above)
1. Rules that held across all three channels
1b. What the all-time hits add
2. Formula library
3. Writing a batch of titles
4. Scoring a title
5. Title testing after publishing
6. Things that didn't hold
7. Worked example: the ICP Buyer Research video

## 1. Rules that held across all three channels

1. **Serve search and browse at once.** Put a searchable noun (the tool, topic or outcome people type) next to a browse hook (a test, a verdict, a clock, a surprise).
   - Titles doing both: median **1.24×** (n=33).
   - Browse-only: 0.62×.
   - Search-only: 0.665×.
   - Example: "I Tested The Viral Github Repo To Reverse Engineer Anything" (8.2× in the latest-30 snapshot; 9.22× in the later all-time data). "Github repo" and "reverse engineer" are searchable; "I tested" and "viral" are the hook.
2. **Avoid plain how-to titles.**
   - "How to X" has a median of **0.49×** (n=11) in the latest 30. Across full histories, titles starting "How to" sit near each channel's median (1.16–1.37×), mostly from older search-driven years, so it's a "today" rule: plain how-to no longer breaks out.
   - The two that hit rode a named brand or a launch the same week ("How to Use ChatGPT Sites to Build Anything", 2.6×).
   - If it's a tutorial, give it a frame: a test, a clock, a count, a result.
3. **Name the thing, early.** The product, tool or outcome sits in the first 3–4 words in most hits. Mobile truncates around 60 characters, so the hook must survive the cut.
4. **One promise.** The title carries the facts; the thumbnail carries the verdict or the proof (`references/design/playbook.md`).

## 1b. What the all-time hits add

1. **Long courses are the most reliable big format.**
   - Nick: titles with "course" have a median of **4.15×** (n=11). His top two by views are courses (35.6× and 27.4×).
   - Riley: uploads of 60+ minutes have a median of **2.58×** (n=18), against 0.87× for under 30 minutes.
   - Sabri doesn't make them (60+ min: 1.02×, n=7).
   - This is only for a genuinely complete course; see the full-course row below.
2. **Formulas wear out. Every channel's breakout engine changed by era:**
   - Nick's income claims ("…$X/mo") were his 2024 breakouts. Their median by era fell from 1.36× to 0.73× to 0.46×.
   - Sabri's "How [Brand] Brainwashes You…" exposés were his 2024–25 engine (median 5.35×). His 5 most recent are at 1.15×, and a near-copy of his 35× hit opened at 0.65×.
   - Riley's "no-code" and "I/We built" wording stopped appearing in his latest 60 uploads.

   Borrow a creator's **current** working formula, or an old one in a fresh topic. Never copy a formula from its tired phase.
3. **Stakes beat demos.** A challenge with a partner or a price tag ("Can I Vibecode a $250M App Better Than a Pro Developer?", 38.6×) and a career-stake reframe ("What I'd Learn Instead of Automation in 2026", 26.4×) are the biggest non-course hits.
   - Riley: "We built/made" titles have a median of 4.18× (n=6), against 0.94× for "I built" (n=12).
4. **Numbers work when they are the feat.** Examples: "Learn 95% of Codex in 30 minutes" (6.2×), Sabri's time-box titles on marketing, sales and ads topics, e.g. "17 Years of Marketing Advice in 46 Mins" (n=8, median 4.15×). Decorative numbers still don't help.
5. **Put the year in evergreen titles and refresh it.** Nick retitles old courses with the coming year: a February 2024 upload now reads "(2026)" at 10.4×. His titles with a year have a median of 1.51× (n=37), against 0.95× for the channel.
6. **News titles raise the floor but rarely break out.** None of Riley's top 20 uses his current "X Just Changed" or "Insane… But" titles (medians 1.35× and 1.42×). Single-launch explainers beat roundups ("Deepseek Explained", 10.8×).
7. **Collaborators help.** Riley has a guest on 8 of his top 20, which contradicts the recent-30 signal that guest videos miss.

## 2. Formula library

Pick the formula from what the video actually delivers. Each one lists when it fits, the evidence, and a template.

| Formula | Use when | Evidence | Template |
|---|---|---|---|
| **Time-box** | The video teaches a big skill compactly | Sabri recent n=5, all ≥3.3×, median **4.68×**; all-time n=8 on marketing/sales topics, median 4.15×, minimum 1.71×. It missed on self-help topics (0.66×, 0.53×). Riley's "Learn 95% of Codex in 30 minutes" got 6.2×; his 20-minute Excel guide got 0.19× (0.13× in the earlier snapshot). It needs a broad, desirable skill the audience already wants | "Learn 97% of {Skill} in {N} Minutes" · "Give Me {N} Minutes and I'll Make You {Outcome}" |
| **Reframe** | You can flip a belief about a hard thing | Sabri n=2, 3.47× | "{Hard Thing} Isn't Hard, It's Misunderstood" · "{Goal} Is Hard Until You {Mechanism}" |
| **What I'd do instead** | Career or strategy shift | Nick 26.4× (all-time #4 by views) and 4.72× on a repeat | "Here's What I'd Learn Instead of {X} in {Year}" |
| **I tested** (cost, time or object) | You actually ran the experiment | Pooled n=7, **1.66×**, the most portable formula. High variance | "I Tested {Trending Thing} {So You Don't Have To / To Do X}" · "I Spent {$N / N Hours} {Doing X}" |
| **Listicle-N** | Several distinct capabilities or tips | Riley n=4, 1.9× | "{N} Insane Things {Tool} Can Do ({Payoff})" · "{N} {Agents/Tools} That Do My Work for Me (Steal These)" |
| **Lessons learned** | Experience or authority content | Sabri n=3, 1.8× | "It Took Me {N} Years To Learn These {N} Truths" · "Everything I Learned From {Rare Access}" |
| **Two-story news** | Two launches the same week | Riley n=4, 1.4× | "{A} Is Insane… But {B} Is EVEN Bigger" |
| **X just changed** | A single launch or update | Pooled n=7, 1.12× | "{Tool} Just Changed A LOT (Here's What's New)" |
| **Most important** | A big-picture take | Nick 2.76× (n=1) | "The Most Important Video You'll Watch About {Topic}" |
| **Cheap result** | A surprising price-to-quality gap | Nick 2.17× (n=1) | "{Tool} {Does Impressive Thing} For Just ${Small}" |
| **Full course** | Complete courses, ~1 hour+ (Nick 2–6 hours, Riley 1–2 hours beginner courses) | All-time: Nick "course" titles median **4.15×** (n=11, top 35.6×); Riley 60+ min median 2.58× (n=18). Short "guides" under an hour: 0.19–0.94× at the latest snapshot (e.g. Riley's 20-minute Excel guide, 0.19×) | "{TOPIC} FULL COURSE {N} HOURS (Build & Sell)" · "{Tool} for Beginners: The Last Tutorial You'll Ever Need" |
| **Challenge with stakes** | You raced, bet or competed with someone, ideally on camera | Riley "We built/made" median 4.18× (n=6), top 38.6×; misses exist (0.51×, 0.84×) | "Can I {Build X} Better Than {Pro}? ({Constraint})" · "We Built {X} in {Time}" |
| **Single-launch explainer** | One big launch, explained the same week | Riley 5.2–10.8× (n=4) | "{Launch} Explained: {What It Means for You}" |
| **Contrarian verdict** | You have an honest negative take on a hyped tool | Nick 6.03× (n=1) | "{Hyped Tool} Sucks, Actually" |
| **Secret or exposed** | An investigation of how something works | Sabri 2024–25 median 5.35× (n=7, top 35.5×); his latest 5 only 1.15×. Strong format, but the luxury-brand topic is tired; use it on a fresh industry | "How {Industry} Brainwash You To {Action}" |

Formulas that underperformed: income claims after 2024 (Nick, era medians 1.36× → 0.73× → 0.46×), Sabri's 2020-style long "Step-By-Step" keyword titles when reused now (0.56–0.91×), warning or fear titles about a model launch (Nick, 0.51×; fear about the viewer's own career worked, see above), bold-promise titles ("Everyone Who Uses This Makes $1 Million", 0.44×) and "the one thing" titles (0.71×).

## 3. Writing a batch of titles

1. Find the video's **one promise** and its **searchable noun** (from the transcript or the user's summary).
2. Draft **10 titles across at least 5 formulas**. Only use a formula the video can honestly deliver: no "I tested" without a test, no time-box beyond the video's length, no "full course" under about an hour.
3. For each, record the formula, the character count, the intent (search, browse or both) and the creator style it borrows.
4. Score them (section 4). Keep the top 3 as the **A/B set**, made of different formulas so the test teaches you something.

## 4. Scoring a title (0–100)

| Check | Points |
|---|---|
| Both intents (searchable noun + browse hook) | 25 |
| Named tool, topic or outcome in the first 4 words | 15 |
| ≤ 60 characters (or the hook survives a cut at 60) | 15 |
| Formula with evidence ≥ 1.4× in section 2 | 15 |
| One promise, no stacked claims | 10 |
| The thumbnail line adds something the title doesn't (a verdict, proof or emotion) | 10 |
| Plain words a viewer would use; no jargon the audience doesn't search | 10 |

Subtract 20 for a plain "How to…" without a frame, 10 for a formula in its worn-out phase (section 1b), and 30 for anything the video doesn't deliver. The score ranks a batch; it doesn't predict views.

## 5. Title testing after publishing

Nick retitled his newest video three times in two days, keeping the "Viral … Repo" skeleton and swapping the proof frame ("I Tested" → "I Spent 24 Hrs Testing" → "I Tested … To Reverse Engineer Anything"). Ship with the top title, and keep titles 2 and 3 ready. If YouTube's Test & Compare supports titles on the user's channel, run them there; otherwise swap manually after 24–48 hours if click-through is below the channel's norm. Keep the searchable noun constant between variants so search ranking isn't reset.

## 6. Things that didn't hold

- **Numbers in titles:** in the latest 30 they went with *lower* ratios on Sabri and Nick (0.75× vs 1.06×, 0.79× vs 1.22×) and higher on Riley (all-time: 1.15× with a digit vs 0.88× without), where the numbers are counts and clocks. Use a number when it's the promise (a clock, a count, a cost), not as decoration.
- **ALL-CAPS intensifiers:** misses on Sabri and Nick, but part of Riley's news-anchor voice. Match the channel's voice; don't add caps for energy.
- **Sub-10-minute videos** underperformed on two channels (n=11). That's a format note, but it changes which formulas fit.

## 7. Worked example: the ICP Buyer Research video

- **Promise:** "Your Meta ads land the wrong people; buyer research fixes it." **Search terms:** Meta ads, ICP research, AI agent. **Proof in the video:** 88% fit, 40/25/15%, £1,000 a month, 90%, 24 hours.
- **The 10 titles,** across 10 formulas: `examples/icp-buyer-research/titles-scored.md`. Top scores:
  - "Why Your Meta Ads Land the Wrong People (And How to Fix It)" (88);
  - "I Built an AI Agent That Finds Your Buyers' Exact Words" (86);
  - "Why AI Ad Scripts Don't Convert (And the 90% Fix)" (84).
- **Recommended:** title 1 (55 characters), paired with the D1 thumbnail "Read their mind." The line adds the emotion; the title gives the facts.
- **Published by Taylor:** "I Built an ICP Research AI Agent That Finds Your Ideal Clients On Meta" (70 characters, about 80).
  - **Gains:** four searchable terms (both intents, 25 points); "ICP" is word 4.
  - **Loses:** length. It's at the brand limit and over 60, so "On Meta" is cut on mobile.
  - A fair trade for search. The 48-hour click-through rate decides (`references/learning-loop.md`).
