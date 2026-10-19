# Research framework

Exactly how much we research, of whom, and how often. Keep to these numbers so every week's picks are comparable with the last.

## 1. The three research layers

| Layer | What | How many | Which creators | When |
|---|---|---|---|---|
| **A. Creator scan** (Table Two) | Each core creator's winners and fresh uploads | Per channel: the latest **30** long-form uploads by listing (outlier ratio, the Core winners table, any date) plus the latest **~15** uploads by RSS (exact dates and views); fresh window **14 days**; Shorts excluded | **Core 10** (11 channels) every run; the secondary watchlist only with `--with-secondary`, as support | Every Pick run |
| **B. Our work** (Table One, then talking points) | Every Claude Code session, every GitHub repo pushed, every skill updated | **All** sessions updated in the last **30 days**, every non-trivial one read in depth by parallel agents (one per project group, about 30 sessions each at most); every repo pushed in the window with no session; the skills manifest | n/a | Every Pick run; re-read per topic in Plan the week |
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

The 42-creator app watchlist in `public/creators.json` (Taylor's own YouTube subscriptions), minus the core overlap. Off by default; add with `--with-secondary`. Many are off-niche (Diary of a CEO, Cleo Abram, NetworkChuck); they can support a core theme, never set one, and are ranked in a separate table.

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
| Outlier ratio | views ÷ median of the 10 listed uploads either side | The main ranking signal: did it beat the creator's own normal? Under 0.7 under, 0.7 to 1.4 normal, over 1.4 over, 2+ hit |
| Core winner | a core creator's long-form upload at 1.4× or more, any date, in the latest 30 listed | The evidence a topic is proven |
| Views per day | best views ÷ age in days (needs an RSS date) | Freshness only; never ranks topics (it favours big channels) |
| HOT | Top 10 by views per day in the window, per tier | Heat signal |
| NEW | Published inside the window | Freshness |
| OUTLIER | Ratio 2 or more | Breakout signal |

## 4. Sample-size rules

- **n = 1 or 2:** an anecdote. Mention, never build on.
- **One channel:** a signal. Use with the creator named.
- **Same direction on all three researched channels:** a law (still medians on small n).
- A theme is **proven** with 2+ core creators with a winner on it, or one at 5× or more; **promising** with one creator between 1.4× and 5×; **unproven** otherwise.
- A single 100×-plus viral is an anomaly: count it, but prove the theme with other creators.
- Ratios under about 3 weeks old are provisional. Re-score before learning from them.
- Off-niche viral numbers never outrank a niche signal.

## 5. Window and cadence

- **Winners from the latest 30 long-form uploads** (often 2 to 4 months), plus a **14-day window** for freshness and for our talking points. A 14-day window alone was too thin: most creators post 2 to 6 long-form videos a fortnight, too few to see what beats their normal.
- Runs are on demand (Taylor asks for this week's topics). No schedule is required; if Taylor wants a standing weekly run, confirm the day, time and timezone first.
- Each week's picks are saved in the chat, so the next run can deprioritise topics from the last 4 weeks.

## 6. What every run must record

- Channels scanned, failures, core winners, in-window uploads, themes written to `lane-b.md`.
- Sessions indexed and read, repos read, skills listed, and anything that could not be read.
- For Plan the week: talking points written per topic.
- Which numbers are rounded (listing) and which exact (RSS).
- Which creators were unavailable and why.
