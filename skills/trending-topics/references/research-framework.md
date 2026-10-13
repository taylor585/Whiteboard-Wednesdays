# Research framework

Exactly how much we research, of whom, and how often. Keep to these numbers so every week's picks are comparable with the last.

## 1. The three research layers

| Layer | What | How many | Which creators | When |
|---|---|---|---|---|
| **A. Our work** (Lane A) | Our Claude Code sessions and newly built skills | Every session in the last **14 days**; about **10** read in depth | n/a | Every Pick run |
| **B. Weekly scan** (Lane B) | Creator uploads in the window | Per channel: the latest **~15** uploads by RSS (exact dates and views) plus the latest **30** long-form uploads by listing (outlier ratio); window **14 days**; Shorts excluded | **Core 10** (11 channels) every run; **secondary 33** (app watchlist) on full runs | Every Pick run |
| **C. Deep packaging study** | Titles, thumbnails, descriptions, by era | Per creator: **latest 30** long-form + **all-time top 20** (top 10 by views + top 10 breakouts, 180 s or longer) + **full upload history** for base rates; **5** studied in depth | Done: Nick Saraev, Sabri Suby, Riley Brown. Next in line: Sergio C, Jeremy Haynes, Alex Finn | When adding a priority creator, when a formula looks tired, or about every quarter |

Layer C is the thumbnail-tracker skill's research rubric (`thumbnail-tracker/references/research-rubric.md`, collection with `fetch_videos.py --baseline 30 --all-dossiers`). This skill uses its findings; it does not repeat the study each week.

## 2. Which creators, and why

### Core 10 (`references/creators.json`, weight 1 to 3)

| Creator | Channel | Weight | Why they are on the list |
|---|---|---|---|
| Nick Saraev | @nicksaraev | 3 | Claude Code, AI automation, selling AI services; closest to our build content; researched in depth |
| Sabri Suby | @SabriSubyOfficial | 3 | Direct response, funnels, ads; closest to our marketing content; researched in depth |
| Riley Brown | @rileybrownai | 3 | AI app building, agents; researched in depth |
| Sergio C | @ImSergioCardenas | 3 | Meta ads post-Andromeda; our paid ads audience |
| Jeremy Haynes | @JeremyHaynesTraining | 2 | Paid ads and agency growth |
| Alex Finn | @AlexFinnOfficial | 2 | AI coding, one-person business |
| The Calum Johnson Show | @thecalumjohnsonshow | 2 | AI agents and online business |
| Skill Leap AI | @SkillLeapAI | 2 | AI tool walkthroughs |
| Paul J Lipsky | @PaulJLipsky | 2 | Weekly AI news: the fastest launch signal |
| Daniel Priestley | @KeyPersonOfInfluence (2), @DanielPriestley (1) | 2 / 1 | Entrepreneurship and business trends |

### Secondary (weight 1)

The 42-creator app watchlist in `public/creators.json` (Taylor's own YouTube subscriptions), minus the core overlap. Read automatically when the Whiteboard Wednesdays repo is present. Many are off-niche (Diary of a CEO, Cleo Abram, NetworkChuck); they show wider attention, never outrank core evidence, and are ranked in a separate table.

### Adding or removing a creator

Add when all four hold:
1. Their audience overlaps Pecuna Factorem's buyers (business owners, marketers, agency operators using AI).
2. They post long-form at least twice a month.
3. At least one of their last 30 long-form uploads is 2× or more (they produce breakouts worth learning from).
4. Taylor wants to follow them.

Remove when a creator has had no in-window upload in 3 consecutive runs, or has drifted off-niche. Process: `creator-research.md`, "Adding or removing a creator".

## 3. The numbers we read

| Measure | Definition | Use |
|---|---|---|
| Outlier ratio | views ÷ median of the 10 listed uploads either side | Did it beat the creator's own normal? Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2+ hit |
| Views per day | best views ÷ age in days (needs an RSS date) | Momentum of a fresh upload |
| HOT | Top 10 by views per day in the window, per tier | Heat signal |
| NEW | Published inside the window | Freshness |
| OUTLIER | Ratio 2 or more | Breakout signal |

## 4. Sample-size rules

- **n = 1 or 2:** an anecdote. Mention, never build on.
- **One channel:** a signal. Use with the creator named.
- **Same direction on all three researched channels:** a law (still medians on small n).
- A theme is **hot** with 2+ core creators in the window or any HOT/OUTLIER upload; **warm** with 1 creator at normal performance; **cold** with older uploads only.
- Ratios under about 3 weeks old are provisional. Re-score before learning from them.
- Off-niche viral numbers never outrank a niche signal.

## 5. Window and cadence

- **14-day window** for both lanes. Shorter misses slower creators; longer blurs what is current.
- Runs are on demand (Taylor asks for this week's topics). No schedule is required; if Taylor wants a standing weekly run, confirm the day, time and timezone first.
- Each week's picks are saved in the chat, so the next run can deprioritise topics from the last 4 weeks.

## 6. What every run must record

- Window dates, sessions found and read, signals written.
- Channels scanned, failures, in-window uploads.
- Which numbers are rounded (listing) and which exact (RSS).
- Which creators were unavailable and why.
