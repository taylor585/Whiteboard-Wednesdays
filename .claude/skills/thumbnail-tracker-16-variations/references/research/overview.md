# The research, broken down

What the Thumbnail Tracker rules are built on: two samples from three creators (Nick Saraev, Sabri Suby, Riley Brown), the laws that held, the ones that didn't, and what is still open. Each law names the skill file and section it feeds, so you can trace any rule in `references/frameworks/headline-framework.md`, `references/design/playbook.md`, `references/frameworks/description-framework.md` or `references/frameworks/linkedin-framework.md` back to its evidence. Per-creator detail is in `references/research/creators.md`.

## Contents

1. Method
2. The verified laws
3. Things that didn't hold
4. Formula life cycles, per creator
5. Open questions: what to test on the user's own channel
6. Data files

## 1. Method

### The two samples

| | Latest 30 | All-time top 20 |
|---|---|---|
| What | The 30 latest long-form uploads per creator | Per creator, the top 10 by views plus the top 10 breakouts by outlier ratio (≥180 s, no duplicates) |
| Size | 90 videos | 60 videos |
| When | Published 29 May to 10 Oct 2026, collected Oct 2026 | Drawn from the full upload histories: Nick 320, Sabri 473, Riley 194 uploads |
| Depth | Every title, thumbnail and description tagged; 5 "deep five" per creator | Every thumbnail viewed and every description read; base rates from the full `all.tsv` lists |

The all-time sample is survivors only: it shows what winners look like, not what separates them from losers in the same year. Title rules from it lean on base rates across every upload; thumbnail and description rules from it are weaker.

### The outlier ratio

Outlier = a video's views ÷ the median views of the 10 uploads either side of it on the same channel.

| Band | Ratio |
|---|---|
| Under | below 0.7 |
| Normal | 0.7 to 1.4 |
| Over | above 1.4 |
| Hit | 2 or more |

A ratio of 1.0 means "as good as its neighbours". It removes most of the channel-size effect that raw views carry, but not all of it (see confounds).

### How to read medians and n

- Every figure such as "1.24× (n=33)" is the **median** outlier ratio of the n videos in that group. A median ignores one freak hit; a mean would not.
- Compare a group against its channel's typical value, not against 1.0 alone. Channel medians in the latest 30: Sabri 1.06, Nick 0.815, Riley 1.015. Across Nick's full history (320 long-form uploads) the median is 0.955. Recomputed from `all.tsv` for long-form (≥180 s): Sabri 1.08 (n=420), Riley 0.955 (n=188).
- **n is small.** Most formula and layout groups have n of 1 to 7 inside one channel. Treat n of 1 or 2 as an anecdote, a single channel as a signal, and only the same direction on all three channels as a "law".
- "Pooled" means every video with that tag across all three channels.
- Tags such as intent, formula and line-vs-title were assigned by three different analysts, so the same label can mean slightly different things across channels.
- The two snapshots were taken at different moments, and `all.tsv` windows can include older uploads, so many latest-30 ratios moved (Nick's "Fable 5 Is Back…" went from 2.69 to 1.37). Group medians from the latest-30 study are quoted as computed then. Where a single video's ratio differs, this file gives the newer all-time figure and says so.

### Confounds

- **Era and channel size.** Raw views mostly measure age and channel size. Breakouts from a small channel are inflated: Sabri's 10 breakouts all date from 2019–21, when neighbouring uploads had 3,300–9,600 views, so their 10–85× ratios are weak evidence. Riley's channel median grew from 13.5K to 100K views, and older bands produced ratios of 2+ twice as often (35% vs 17%). 7 of Nick's top 10 by views are from 2025–26. Weight recent hits over old ones.
- **Format.** Multi-hour courses behave like a different product. Nick's 19 uploads of 2 hours or more have a median of 3.55, so several "title" findings are really format findings.
- **Topic heat.** Launch weeks lift whatever is published in them (GPT-6 Astra explains much of Riley's #15 and #13; DevDay was the biggest event in the latest-30 window).
- **Video age.** The newest 5 per channel were 2 to 19 days old when collected, with neighbours on one side only. Their ratios are provisional.
- **Sponsored and paid videos.** Sabri's two paid book ads in his top 10 by views (JF4rjHOZbLo, mOQbtHp3WBU; like rates 0.28% and 0.37% against 1.86–4.65% organic) are excluded from every rule. Riley's 111-second xrmNhW5ABg4 is excluded for length. Sponsored integrations in the latest 30 (Riley's ASUS, Convex and HubSpot videos) were kept but flagged; they cluster with misses.
- **No CTR or search data.** Everything is inferred from views.

## 2. The verified laws

"Law" means the same direction on all three channels, or a strong single-channel pattern that the all-time check backed. With this n, each is a strong signal, not a proven rule. Confidence levels are those given in the source teardowns.

### Titles

1. **Serve search and browse at once: a searchable noun plus a browse hook.**
   - Evidence: titles doing both, pooled median 1.24× (n=33); browse-only 0.62× (n=39); search-only 0.665× (n=18). Top intent group on every channel: Sabri 1.3 (n=11), Nick 1.46 (n=12), Riley 1.175 (n=10).
   - Confidence: medium-low (intent is a judgement call by three analysts).
   - All-time check: **confirms**, indirectly. Intent was not re-tagged, but the biggest hits pair a tool or skill noun with a stake ("Can I Vibecode a $250M App Better Than a Pro Developer? (With No Code)", 38.6×).
   - Feeds: `references/frameworks/headline-framework.md` §1.1, §4 (25 points); `references/frameworks/linkedin-framework.md` (carry-over table).

2. **Plain how-to titles no longer break out; give a tutorial a frame.**
   - Evidence: latest 30, `how-to` pooled 0.49× (n=11); Sabri 0.5 (n=6), Nick 0.41 (n=3), Riley 1.375 (n=2: 0.14 and 2.61). The only hits rode a brand or a launch ("How to Use ChatGPT Sites to Build Anything (Insane)", 2.61×).
   - Full histories, titles starting "How to": Nick 1.16× (n=43), Sabri 1.34× (n=108, mostly 2019–21), Riley 1.37× (n=12).
   - Confidence: medium.
   - All-time check: **softens**. Plain how-to was fine in the search era; it is weak today.
   - Feeds: `references/frameworks/headline-framework.md` §1.2, §4 (minus 20); `references/frameworks/linkedin-framework.md`.

3. **A time-box on a broad, wanted money skill.**
   - Evidence: Sabri latest 30, `time-box` n=5, median 4.68×, all at 3.3× or more. Full history: 10 time-box titles, median 3.39×; the 8 on marketing, sales or ads, median 4.15×, minimum 1.71×. Self-help versions missed (0.66×, 0.53×). Riley: "Learn 95% of Codex in 30 minutes" 6.2×; but "Master Claude for Excel in 20 Minutes (Full Guide)" 0.19× (0.13× in the latest-30 snapshot).
   - Confidence: medium-high for Sabri; medium elsewhere.
   - All-time check: **strengthens**; now seen on two channels, with a topic boundary.
   - Feeds: `references/frameworks/headline-framework.md` §1b.4, §2 (Time-box); `references/frameworks/linkedin-framework.md` (hook angles).

4. **Long, complete courses are the most reliable big format.**
   - Evidence (full histories, long-form): Nick "course" titles 4.15× (n=11), 60+ min 2.12× (n=54), under 30 min 0.87×; ≥2 h 3.55× (n=19). Riley 60+ min 2.58× (n=18), under 30 min 0.87×. Sabri doesn't make them (60+ min 1.02×, n=7). Nick's top two by views are courses (35.62×, 27.37×).
   - Short "guides" don't: Riley's "Master Claude for Excel in 20 Minutes (Full Guide)" 0.19× and "Cursor 3.0 Ultimate Guide: Beginner to Pro in 60 min" 0.94× (0.13× and 0.58× in the latest-30 snapshot). Nick's course misses: #44 0.94×, #16 1.14×.
   - Confidence: high (Nick, Riley).
   - All-time check: **strengthens** Nick's latest-30 course family (2.76, n=3); **contradicts** Riley's latest-30 full-course signal (0.355, n=2).
   - Feeds: `references/frameworks/headline-framework.md` §1b.1, §2 (Full course), §3 ("no full course under about an hour"); `references/design/playbook.md` §2.6, §3 (Syllabus).

5. **Stakes beat demos: a challenge, a price tag or the viewer's career.**
   - Evidence: Riley "We built/made" 4.18× (n=6) against "I built" 0.94× (n=12); "Can I Vibecode a $250M App…" 38.6×. Nick "What I'd Learn Instead of Automation in 2026" 26.42×, and the same skeleton again on "Here's What I'd Learn Instead of AI Automation in 2027" (4.72× all-time; 4.65× in the latest-30 snapshot).
   - Not sufficient alone: Riley's same series also produced 0.84× and 0.51×.
   - Confidence: medium (Riley); medium-high (Nick's career skeleton, proven twice).
   - All-time check: **new**.
   - Feeds: `references/frameworks/headline-framework.md` §1b.3, §2 (Challenge with stakes, What I'd do instead); `references/frameworks/linkedin-framework.md` (career stake, challenge).

6. **Fear works about the viewer's path, not about a model launch.**
   - Evidence: Nick's `warning` titles n=3, median 0.51× ("Do not talk to Claude's new voice mode" 0.38×). His career-fear video is 26.42×, and the "AI ruined me." thumbnail sits on a 6.62× hit.
   - Confidence: medium-high.
   - All-time check: **confirms**.
   - Feeds: `references/frameworks/headline-framework.md` §2 (underperformers), §1b.3; `references/design/playbook.md` §2.9 (Marker).

7. **"I tested" is the most portable formula, but the object carries it.**
   - Evidence: pooled n=7, median 1.66× (Nick n=5 1.66, Riley n=2 4.2). High variance: Nick 0.41× to 9.22× (the 9.22× was 8.22× in the latest-30 snapshot). Nick's "I Tested / I Spent / I Tried" titles in his newest band: n=7, 1.67×.
   - Confidence: medium.
   - All-time check: **confirms**.
   - Feeds: `references/frameworks/headline-framework.md` §2 (I tested); `references/design/playbook.md` §3 (Repo, Proof).

8. **Put the year in evergreen titles and refresh it.**
   - Evidence (full histories): titles with a year, Nick 1.51× (n=37), Sabri 1.21× (n=25), Riley 1.93× (n=7). A Feb 2024 Nick upload now reads "How to Scrape Any Website in Make.com (2026)" at 10.37×.
   - Confidence: medium.
   - All-time check: **new**.
   - Feeds: `references/frameworks/headline-framework.md` §1b.5.

9. **Numbers help when they are the feat, not decoration.**
   - Evidence: latest 30, a number in the title went with lower ratios on Sabri (0.75 vs 1.06) and Nick (0.79 vs 1.22), higher on Riley (1.215 vs 0.9, item counts). Full history: Riley digit 1.15× (n=90) vs none 0.88× (n=101). Nick carries a time span or scale number on 9 of his top 20 (10 counting a title variant). Sabri's money figures sit on hits ("$80,000 Watches" 11.06×) and misses (Disney "$950k" 1.15×).
   - Confidence: low.
   - All-time check: **softens** "numbers don't help" into "durations, counts and scale help; money claims don't".
   - Feeds: `references/frameworks/headline-framework.md` §1b.4, §6; `references/design/playbook.md` §4 (numbers).

10. **Formulas wear out; borrow the current one, or an old one on a fresh topic.**
    - Evidence: Nick income claims fell 1.36× → 0.73× → 0.46× by era. Sabri's brainwash exposés fell from 5.35× (n=7) to 1.15× (n=5), and a near-copy of his 35.45× hit opened at 0.65× (0.62× in the latest-30 snapshot). Riley's no-code wording is absent from his latest 68 uploads, and its last four uses were all below 1.
    - Confidence: medium.
    - All-time check: **new**.
    - Feeds: `references/frameworks/headline-framework.md` §1b.2, §4 (minus 10); `references/frameworks/linkedin-framework.md` (hooks to avoid).

11. **News titles raise the floor but rarely break out; one launch, one verdict beats a roundup.**
    - Evidence: Riley full history, "Just <verb>" 1.35× (n=14), "Insane… But" 1.42× (n=4; 1.395 in the latest 30), best ratios 3.27× and 2.62×. Pooled `x-just-changed` 1.12× (n=7). Single-launch explainers and verdicts: "Deepseek Explained" 10.84×, "Claude Code Replaced Cursor for Me… Here's Why" 9.9×.
    - Confidence: medium.
    - All-time check: **softens** Riley's latest-30 rule 1 to a floor-raiser.
    - Feeds: `references/frameworks/headline-framework.md` §1b.6, §2 (Two-story news, X just changed, Single-launch explainer).

### Thumbnails

12. **Always have a line.**
    - Evidence: no-line thumbnails were the weakest group on every channel: Sabri 0.45 (n=3), Nick 0.54 (n=4), Riley 0.31 (n=3); pooled 0.465× (n=10), 8 of 10 under 0.7.
    - All-time: 4 of Nick's top 20 carry no text, 3 of them pre-2025, and each names the tool with a logo or screen. 19 of Riley's 20 show a face with a median of 4 words. All 8 of Sabri's organic top-view thumbnails carry 5 words or fewer.
    - Confidence: medium.
    - All-time check: **confirms** for current uploads. Nick's own teardown reads his no-text hits as a partial contradiction: a recognisable logo can stand in for the line.
    - Feeds: `references/design/playbook.md` §2.1, §6 (checklist), §7, §7b.

13. **Prefer a line that adds to the title (verdict, proof, emotion); repeating isn't fatal.**
    - Evidence: latest 30, complements vs repeats: Sabri 1.49 (n=22) vs 0.62 (n=5); Nick 0.815 (n=14) vs 1.04 (n=12); Riley 1.11 (n=11) vs 1.04 (n=16). All-time hits: Riley complements 9.69 vs repeats 6.2; Sabri's organic hits all complement; Nick's hits repeat on 10 (median 10.56) vs complement on 6 (7.58), mostly courses.
    - Confidence: low; channel-specific.
    - All-time check: **confirms** on Sabri and Riley, not on Nick.
    - Feeds: `references/design/playbook.md` §2.1, §4; `references/frameworks/headline-framework.md` §1.4, §4 (10 points).

14. **Show real proof on the thumbnail.**
    - Evidence: Sabri, a handwritten proof label ("$300m in ad spend") 2.785× (n=6) vs 0.685× without (n=24). Nick's proof-screen hits: a "Succeeded" payments table 10.74×, "You Are Hired!" 6.05×, repo stars 9.22×.
    - Confidence: medium-high (Nick's proof template); one channel for the label.
    - All-time check: **strengthens**.
    - Feeds: `references/design/playbook.md` §2.5, §3 (Proof, Repo), §7, §7b.

15. **Layouts that won, by creator.** A recognisable house layout gives recognition, not lift.

    | Layout | Creator | Evidence | Renderer key |
    |---|---|---|---|
    | Caption bar | Sabri | latest n=7, 3.77× | `caption` |
    | Before/after split | Sabri | latest n=4, 1.64×, all ≥1.43× | `split` |
    | Staged "secret" storefront scene | Sabri | 4 brainwash hits, median 9.04× | none (see `references/design/image-prompts.md`) |
    | Fake-post card | Sabri | one 15.53× hit | `social` |
    | Proof screen | Nick | 10.74×, 6.05×, 9.22× | `proof`, `repo` |
    | Syllabus / course card | Nick | courses, see law 4 | `syllabus` |
    | Duo (two faces) | Riley | all-time n=5, 9.9× | `versus` |
    | Solo face right + headline | Riley | all-time n=9, 9.2× | `verdict`, `command` |
    | Desk anchor | Riley | latest n=10, 1.25×; on hits and misses; 2.83× as the lowest of his top 20 | none |
    | Mascot arena | Riley | latest n=3, 1.12× | none |

    - Confidence: medium-low (one channel each, mixed with title formula and age).
    - All-time check: **confirms** the caption bar (NTmWqnPIb2s 11.82×); **contradicts** the latest-30 advice to avoid scene composites (the layout was fine; the brainwash topic was tired); finds Riley's current layouts the weakest of his winners.
    - Feeds: `references/design/playbook.md` §3 (Caption bar, Before/after split), §7, §7b.

16. **Products are the characters (a style law, not a performance one).** All three put a glossy brand object at the centre: Sabri's Meta tile and held products, Nick's 3D app tiles and Claude-asterisk mascots, Riley's flanking logos and product mascots. A tool logo or tool UI is on 13 of Nick's top 20.
    - Confidence: high as a description; no evidence it causes views.
    - All-time check: **confirms**.
    - Feeds: `references/design/playbook.md` §2.4, §7.

### Descriptions

17. **The description doesn't decide the click; write it to convert and help.**
    - Evidence: each channel's biggest latest-30 hit had a funnel-only description: Nick's 9.22× hit opens with the Maker School CTA and carries a stale Claude Code course summary; Sabri's opens with a boilerplate playbook link; Riley's with "This is an Agent Native Episode." Nick's top outlier (35.62×) has 7 bare chapters. Sabri's template B vs A gap (1.43 vs 0.56) is a time confound: B was added to old winners.
    - Line 1: Riley's own-product CTAs sat on 9.9×, 7.54× and 5.93× hits; four of his latest-30 videos under 0.3× (#6, #7, #14, #29) open with, or reach by line 3, a sponsor CTA.
    - Confidence: medium (no CTR or search data).
    - All-time check: **confirms**.
    - Feeds: `references/frameworks/description-framework.md` (main finding, template line 1 and 2); `references/frameworks/linkedin-framework.md` (carry-over table).

18. **Chapters are a house habit, not a lever; add them for viewers.**
    - Evidence: latest 30, Nick 24/30, Riley 29/30, Sabri 0/30. On Nick's channel, chapters present 0.69 vs absent 1.08 (n=6). All-time: Nick 16/20 (the 4 without are all 2024), Riley 18/20 (the two without are 5 and 10 minutes long), Sabri 1/20.
    - Confidence: medium.
    - All-time check: **confirms**.
    - Feeds: `references/frameworks/description-framework.md` (template step 3, chapter rules; numbered chapters for listicles).

19. **Disclose affiliate, referral and sponsor links.** A compliance rule, not a performance one.
    - Evidence: Nick's Higgsfield referral links carry no disclosure in the latest 30 (#13, #17, #18, #21, #25, #30). "Some give me kickbacks" appears on 14 of his all-time top 20, so the omission is a recent drop. Riley uses "@ChatGPT #ChatGPT_Partner" and "Thanks to @OpenAI for sponsoring this video."
    - Confidence: high (direct counts).
    - All-time check: **new** (shows the drop).
    - Feeds: `references/frameworks/description-framework.md` (standing blocks, checks before delivering).

20. **Real hashtags are essentially unused.**
    - Evidence: latest 30, Sabri 0/30, Nick 0/30, Riley 7/30 (mostly required partner tags). All-time: Nick 0/20, Riley 1/20 (the one sponsored video); Sabri 0 to 12 on hits (8–12 on three brainwash exposés). The scraper's hashtag field is unreliable: it counts "customer #1" and numbered chapters.
    - Confidence: high (a count, not an inference).
    - All-time check: **confirms**.
    - Feeds: `references/frameworks/description-framework.md` (step 5, hashtags). `references/frameworks/linkedin-framework.md` keeps 3–5 hashtags, which is untested on LinkedIn.

## 3. Things that didn't hold

| Claim | Why it fails | Source |
|---|---|---|
| "Never repeat the title on the thumbnail" | Sabri yes (1.49 vs 0.62), Nick reversed (0.815 vs 1.04), Riley flat (1.11 vs 1.04). Softened to "always have a line; prefer adding" | latest 30 |
| Numbers in titles help | 2 channels negative, 1 positive; only feat numbers work | latest 30, all-time |
| ALL-CAPS emphasis words | Misses on Sabri (0.5 vs 1.245) and Nick (0.59 vs 0.84); stronger on Riley (1.14 vs 0.495), where caps are his news voice | latest 30 |
| Sub-10-minute videos underperform | Sabri n=5 0.39, Nick n=6 0.46; Riley posted none. Two of three, so a format note | latest 30 |
| Guest videos miss | Riley's latest guests 0.775 (n=2), but collaborators are on 8 of his top 20. A co-builder is not an interview guest | both |
| Avoid scene composites | Sabri's latest scene composites 0.62 (n=3), yet his staged storefront scene is his best all-time layout (9.04×). The topic was tired | both |
| Brand breakdowns are weak | Latest 0.62 (n=6), but the brainwash exposé was his 2024–25 engine | both |
| Full courses miss on Riley | Latest 0.355 (n=2), and both videos have since risen (0.19×, 0.94×); full history 60+ min 2.58× (n=18) | both |
| Template B descriptions lift views | 1.43 vs 0.56 is time and reverse causation | latest 30 |
| No-text thumbnails always fail | Nick's logo-only hits (14.33×, 6.67×, 6.41×, 2.13×) and Riley's no-text 17.86× | all-time |
| The effort frame "I Spent 24 Hrs Testing" | Lost in Nick's #1 title rotation and shipped on #3 at 0.41× | latest 30 |
| Dark vs light backgrounds | Roughly half of Nick's top 20 are dark, half light | all-time |
| Desk anchor as a performance driver | On hits and misses (n=10, 1.25×) | latest 30 |

### Observed outside the three creators (audit mode, 12 October 2026)

- **Liam Ottley,** n=1 each:
  - his 328K video won mainly because it was part of his long-course series, not because of the thumbnail;
  - his near-identical "A Reset is Coming" curve (Nick's version reached 306K) came in below his usual views.
- **Lesson:** the topic carried Nick's video, not the template. Copying a winning layout doesn't copy the result. This feeds `references/frameworks/thumbnail-framework.md` §10.

## 4. Formula life cycles, per creator

### Nick Saraev (index bands from `all.tsv`, keyword-matched, approximate)

| Era | Formula | Median |
|---|---|---|
| #201–320 (2024) | Income claim ("Generates $20K/mo") | 1.36 (n=17) |
| #201–320 (2024) | "Watch Me Build…" production line | 0.88 (n=20) |
| #81–200 (2024–25) | Income claim | 0.73 (n=14) |
| #81–200 | "Watch me…" | 6.05 (n=3) |
| #81–200 | Course | 20.55 (n=2) |
| #1–80 (late 2025–26) | Income claim | 0.46 (n=2) |
| #1–80 | Course | 3.55 (n=9) |
| #1–80 | I Tested / I Spent / I Tried | 1.67 (n=7) |

Money moved from "I made" to "you can sell" ("sell" titles 1.48×, n=30), then gave way to ALL-CAPS courses, tests of trending objects and contrarian verdicts.

### Sabri Suby

| Era | Formula | Median |
|---|---|---|
| 2019–21 | Long keyword how-to with a hype parenthetical ("Step-By-Step", "(Crazy)") | breakouts 10.85–84.55×, inflated by 3,300–9,600 neighbour medians |
| 2024–26 reuse | "Step-By-Step" titles | 0.56–0.91× |
| 2024–25 (index 75–99) | Brainwash exposé | 5.35 (n=7) |
| 2025–26 (index 1–68) | Brainwash exposé | 1.15 (n=5); Oct 2026 remake 0.65 |
| 2024–26 | Mastery time-box | 3.39 (n=10); 4.15 on marketing, sales or ads (n=8) |

The time-box is the only formula that has held from 2024 into 2026.

### Riley Brown (title counts per index band, newest first: 1–30 / 31–60 / 61–100 / 101–140 / 141–194)

| Formula | Counts by band | Median (full history) |
|---|---|---|
| No-code wording | 0 / 0 / 5 / 11 / 13 | 1.18 (n=27); last four uses below 1 |
| "We/I built…" | 0 / 0 / 7 / 8 / 3 | "We built" 4.18 (n=6); "I built" 0.94 (n=12) |
| "$" stakes | 0 / 1 / 6 / 5 / 0 | n/a |
| "Just <verb>" | 3 / 9 / 1 / 1 / 0 | 1.35 (n=14) |
| "Insane… But" | 4 / 0 / 0 / 0 / 0 | 1.42 (n=4) |

He moved from viewer-identity promises and build challenges (2024–25) to product-news framing (2026). The news formulas give a steadier floor but top out at 3.27×.

## 5. Open questions: what to test on the user's own channel

1. **Complement vs repeat.** The three channels disagree. Run it through YouTube's Test & Compare (thumbnail line only, same title) on the user's next 3–5 uploads.
2. **Title intent.** "Both" won everywhere, but tagging is subjective. Tag the user's own back catalogue with one consistent rule and recompute.
3. **Time-box beyond marketing.** It missed on self-help and on a niche tool (Excel). Does it work on the user's core topic?
4. **Year refresh.** Retitle two evergreen videos with next year's number and compare their ratios 30 days before and after.
5. **Course threshold.** Riley's 64-minute "Beginner to Pro in 60 min" guide sits at 0.94× (0.58× in the latest-30 snapshot) while his longer beginner courses won. Where does the user's audience draw the line?
6. **Collaboration.** Does a co-builder challenge ("We built") lift the user's channel the way it lifted Riley's?
7. **Description line 1.** Nick's teardown suggests a keyword sentence in lines 1–2; nobody tested it. Worth an A/B only if search traffic matters to the user.
8. **Young ratios.** Re-score any upload under 30 days old before learning from it.
9. **LinkedIn.** Every LinkedIn rule is adapted, not tested. After 10+ posts, replace the defaults with the user's analytics (`references/frameworks/linkedin-framework.md`).

## 6. Data files

The per-video tables behind every figure here (both samples, plus each creator's full upload list with the outlier column) are in `references/research/data/`. Read `references/research/data/README.md` first: it says what each file holds, how it was built and which snapshot it reflects.
