# Research findings

Every piece of research behind this skill: what we did, why it was worth doing, and what we found. Read this before picking topics or writing packaging, so decisions rest on evidence we already have rather than starting from zero.

Dates are October 2026. YouTube numbers move daily; re-run the scan for anything current.

## Contents

1. Packaging research: Nick Saraev, Sabri Suby, Riley Brown (150 videos, 987 uploads)
2. The first creator scan (44 channels, 14 days)
3. The first chat research run (91 sessions)
4. The first pick sheet and what Taylor chose
5. The first manual topic research (before the skill existed)
6. What building the first brief taught us
7. Open questions to test on our own channel

---

## 1. Packaging research: Nick Saraev, Sabri Suby, Riley Brown

### What we did

- **Latest 30:** the 30 latest long-form uploads from each creator (90 videos, published 29 May to 10 October 2026). Every title, thumbnail and description tagged; five per creator studied in depth.
- **All-time top 20:** per creator, the top 10 by views plus the top 10 breakouts by outlier ratio, 180 seconds or longer (60 videos).
- **Full histories for base rates:** every upload on each channel (Nick 320, Sabri 473, Riley 194).
- Scored with the **outlier ratio**: views ÷ median views of the 10 uploads either side. Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2 or more a hit.
- Full data and per-creator detail live in the thumbnail-tracker skill (`references/research/overview.md`, `creators.md`, `data/`).

### Why it was valuable

- Raw views mostly measure channel size and video age. The outlier ratio shows what actually beat a creator's own normal, which is what we want to copy.
- It replaced opinions ("numbers in titles help") with base rates, and showed several popular rules are wrong (section "Did not hold" below).
- It showed formulas wear out by era, so we copy what works now, not what worked in 2021.
- It gives our headlines and descriptions references their evidence (`headlines.md`, `descriptions.md`).

### What we found: the laws

"Law" = same direction on all three channels, or a strong single-channel pattern the all-time check backed. Medians, small n.

| # | Law | Key evidence |
|---|---|---|
| 1 | Serve search and browse at once | Both intents 1.24× (n=33); browse-only 0.62×; search-only 0.665× |
| 2 | Plain how-to no longer breaks out | 0.49× (n=11) latest 30 |
| 3 | Time-box on a broad money skill | Sabri 4.68× (n=5); 4.15× on marketing/sales/ads (n=8); misses on self-help and niche tools |
| 4 | Long complete courses are the most reliable big format | Nick "course" 4.15× (n=11); 2 h+ 3.55× (n=19); Riley 60+ min 2.58× (n=18) |
| 5 | Stakes beat demos | Riley "We built" 4.18× vs "I built" 0.94×; Nick career reframe 26.42× |
| 6 | Fear works about the viewer's path, not a launch | Nick launch warnings 0.51×; career fear 26.42× |
| 7 | "I tested" is the most portable formula | Pooled 1.66× (n=7), high variance |
| 8 | Year in evergreen titles, refreshed | Nick 1.51× (n=37), Sabri 1.21×, Riley 1.93× |
| 9 | Numbers only when they are the feat | Durations and counts help; money claims do not |
| 10 | Formulas wear out | Nick income claims 1.36× → 0.73× → 0.46× |
| 11 | News raises the floor, rarely breaks out | Riley "Just <verb>" 1.35× (n=14); single-launch explainers 5.2 to 10.8× |
| 12 | Always have a thumbnail line | No-line pooled 0.465× (n=10) |
| 13 | Prefer a line that adds to the title | Sabri 1.49× vs 0.62×; Nick reversed; Riley flat |
| 14 | Show real proof on the thumbnail | Sabri proof label 2.785× (n=6); Nick proof screens 10.74×, 6.05×, 9.22× |
| 15 | House layouts give recognition, not lift | Caption bar (Sabri), proof screen (Nick), duo (Riley) |
| 16 | Products are the characters | A tool logo or UI on 13 of Nick's top 20 (style, not performance) |
| 17 | The description does not decide the click | Each channel's biggest hit had a funnel-only description |
| 18 | Chapters are a habit, not a lever | Nick 24/30, Riley 29/30, Sabri 0/30 |
| 19 | Disclose affiliate and sponsor links | Nick dropped "Some give me kickbacks" from newer videos |
| 20 | Real hashtags are essentially unused | Nick 0/30, Sabri 0/30, Riley 7/30 (partner tags) |

### What did not hold

| Popular claim | Finding |
|---|---|
| Never repeat the title on the thumbnail | Channel-specific; softened to "always have a line, prefer adding" |
| Numbers in titles help | Two channels negative; only feat numbers work |
| ALL-CAPS emphasis | Misses on Sabri and Nick; only Riley's news voice |
| Avoid scene composites | Sabri's staged storefront is his best all-time layout (9.04×); the topic was tired |
| Guest videos miss | Collaborators are on 8 of Riley's top 20 |
| No-text thumbnails always fail | Logo-only hits exist (Nick 14.33×) |
| Dark vs light backgrounds matter | Half of Nick's top 20 each way |

### Confounds to remember

Channel size and era inflate old breakouts (Sabri's 2019 to 21 ratios of 10 to 85× against tiny neighbours). Courses behave like a different product. Launch weeks lift everything. Videos under about 3 weeks old have provisional ratios. Sponsored videos were flagged or excluded. There is no click-through or search data; everything is inferred from views.

---

## 2. The first creator scan (12 October 2026)

### What we did

`scan_creators.py --days 14` across **44 channels** (11 core channels for the 10 core creators, plus 33 from the app watchlist). RSS for exact dates and views on the latest ~15 uploads, yt-dlp for the 30 latest long-form uploads per channel and their outlier ratios. 24 seconds, 0 failures. Snapshot: `examples/scan-2026-10-12-core.md`.

### Why it was valuable

- It gave real numbers where web search could not: searching for view counts returned nothing reliable (section 5).
- It showed what our audience is clicking on this fortnight, not in general.
- It caught a direct competitor overlap before we recorded.

### What we found

| Theme (14 days) | Heat | Best evidence |
|---|---|---|
| Reverse engineering / viral repos | Hot | Nick Saraev "I Tested The Viral Github Repo To Reverse Engineer Anything", 553k, 10.5× outlier, under 2 days old |
| ChatGPT Dots / GPT-6 updates | Hot | Skill Leap AI 193.6k (4.71×), Paul J Lipsky 232k (2.43×), Riley Brown, Alex Finn |
| Grok Bot agents making money | Hot | Riley Brown 169.8k, Alex Finn 103k, The Calum Johnson Show "Grok Made Me $10K In 14 Days" |
| Claude updates and builds | Warm to hot | Paul J Lipsky "The New Claude Motion Is Awesome" 78.8k in 1.2 days; Nick's Claude game build |
| AI harnesses / agentic workflows | Warm | Nick Saraev "AI Harness, Explained" 53.7k (0.6×); David Ondrej "Stop coding, build Software Factories instead" 40k in under a day |
| Funnels and landing pages | Warm | Jeremy Haynes call funnel training 15.7k (1.15×); Sabri Suby landing page course 44.3k |
| Meta ads post-Andromeda | Warm | Sergio C new video 6.1k in under a day; his earlier Andromeda video 208k (20.8×) |
| Social media shifts | Warm | GaryVee Instagram 39.6k; Daniel Priestley "Next Social Media Boom" 11.1k |

Other lessons:
- **Competitor overlap is heat, not a block.** Nick had just explained harnesses; our angle became "a real business harness on client work, with the checker refusing to finish on camera".
- **Off-niche secondary channels dominate raw rankings** (Diary of a CEO, Cleo Abram at 300k+ views per day). The scan now ranks core and secondary separately.
- **Daniel Priestley's screenshot channel is @KeyPersonOfInfluence**, not @DanielPriestley. Both are now in `creators.json`.
- Spot checks against Taylor's screenshots matched, allowing for growth (Sergio 4.7k → 6.1k, Paul J Lipsky 97k → 99.6k, Skill Leap AI 22k → 23.7k).

---

## 3. The first chat research run (12 October 2026)

### What we did

Read our Claude Code sessions from 28 September to 12 October: **91 sessions** in the window, **10 read in depth** with `list_events`, 15 work signals written. Checked the skills manifest: **15 skills updated** in the window.

### Why it was valuable

Our real work is the proof no creator can copy. It turned "what's trending" into "what's trending that we can show for real".

### What we found (client names removed)

| Signal | Proof available | Topic potential |
|---|---|---|
| Thumbnail Tracker v2 built from research on three creators | 20 evidence-graded rules; a thumbnail through 9 documented changes; 12-request routing test | High: "we studied every upload" |
| Finishing Touches Copy and Scripts skill (new) | Taylor's rewrite vs Claude's: words per sentence 9.9 → 16.2, fragments 6 → 1, joining words 11 → 26; a fresh agent met every target | High: "make AI scripts sound like you" |
| Harness Chassis Builder (No Schedules) | Full brief, checker demo, 9 parallel test agents running about 270 generations on a client app | High: chosen for W42 |
| Suby Shots repurposing pipeline | One recording → 3 Reels (34, 41, 38 s), a 1:29 feed video, LinkedIn cuts; loudness −14.5 to −14.7 LUFS; sync within 3 ms | Medium: honest lesson, the picker missed the two best moments |
| Whiteboard Wednesdays skill v1.1 | 8 visual devices, 4 recording tools, quotes checked against the PDF automatically | Medium |
| Vision Board skill | Updated in window; Jarvis build log | Medium |
| GitHub import/export skill | Resumable uploads, checked re-download, approval gate | Low to medium |

Process lessons:
- Session list and transcript results were too large to return inline (68k to 1M+ characters); read them from the saved file with a small extractor.
- About 60 of the 91 sessions were one client's app; collapse a single project into one or two signals.
- Most transcript events are tool calls; the latest one or two pages of a session usually hold the outcome.

---

## 4. The first pick sheet (week 2026-W42)

Five picks, scored out of 50 (`examples/picks-2026-W42.md`):

| # | Topic | Score |
|---|---|---|
| 1 | We studied every upload from Nick, Sabri and Riley (thumbnails) | 47 |
| 2 | Make AI scripts sound like you | 46 |
| 3 | How AI Harnesses Can 10x Your Quality and Output | 44 |
| 4 | Using AI Vision Boards To Build Apps Faster and Better | 40 |
| 5 | One video, six assets (repurposing pipeline) | 40 |

Market-only that week: ChatGPT Dots, Grok Bot agents, funnels (we had the funnel-hacking skill but had not run it in the window), Meta ads post-Andromeda (already covered by our paid ads deck).

**Taylor chose the harness video to record first**, titled "How AI Harnesses Can 10x Your Quality and Output", with a live client app example and a made-up paid ads campaign example. The gold brief is `examples/harness-brief.md`.

---

## 5. The first manual topic research (before the skill existed)

- Web searches for "AI harness" videos found explainers ("What Is an AI Agent Harness?", "Agent Harness explained in 8 min") but **no reliable view counts**. That gap is why `scan_creators.py` exists.
- Aggregators put Nick Saraev's 4-hour Claude Code course at about 1.4M views; consistent with law 4 (courses).
- The app's Video ideas page cannot fetch YouTube until the Google API key is approved, so the skill reads public RSS and listings instead.
- Taylor's first three topic titles were set by hand: AI Harnesses, Vision Boards, Funnel Hacking. The skill now produces these from evidence.

---

## 6. What building the first brief taught us

- `check_brief.py` caught real gaps in our own hand-written run sheet: 3 Act 1 problems never crossed off, one segment missing DRAW and DEMO, and the two top blocks missing. A brief is only record-ready once the checker passes.
- Reverse-engineering the harness skill line by line gave **58 problems** in 5 characters (The Interrupter, The Drifter, The Goldfish, The Bluffer, The Loose Cannon) and **11 Act 2 segments**. That depth is the bar.
- Taylor needs **READ BEFORE YOU RECORD** to be usable in one glance: the hook, the characters, every one-liner in order, what to have open.
- Examples need full context to run on camera: a live example (real client, prompts to paste, check-in prompt) and a built-not-run example (made-up client, nine answers, locks, skill bindings, constraint rows), with the line "we're not running this one, just to save credits".

---

## 7. Open questions to test on our own channel

1. Do multiplier titles ("Can 10x Your…") beat "I tested" titles for our audience? A/B the first three uploads.
2. Does a proof thumbnail (passing checker, real result) beat a face-and-verdict thumbnail for us?
3. Does a time-box work on our core topic (AI for marketing), or is it Sabri-specific?
4. Do our live-build examples hold retention better than theory segments? Check audience retention at each act boundary.
5. Year refresh: retitle evergreen briefs with the coming year and compare 30 days before and after.
