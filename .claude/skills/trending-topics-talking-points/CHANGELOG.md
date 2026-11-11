# Trending Topics releases

## 5.4.1 — 11 November 2026

- **Renamed to Trending Topics - Talking Points.** The slash command is `/trending-topics-talking-points`, and the folder is `skills/trending-topics-talking-points/`.

## 5.4.0 — 11 November 2026

- **Main talking points column:** 4 per video, from Gate 6. Five agents research each post, its thread and the news or episode around it. Points 1 to 3 are what the giant actually said; point 4 is the takeaway for a business owner. `plan_sheet.py` blocks a video without exactly 4.

## 5.3.0 — 10 November 2026

- **The two frameworks, written down and enforced:**
  - **Framework 1, the scan:** 16 giants × last 10 posts, about 160.
  - **Framework 2, choosing the 30:** gate 1 drops the noise; gate 2 keeps what a business owner can use; gate 3 merges into threads; gate 4 makes it ours; gate 5 scores with Part T.
  - **Picking rules:** the worthy line is 30/50, at least 10 paid media, no giant leading more than 3, no repeated title openings, and things that expire go first.
- `plan_sheet.py` blocks a plan that breaks Framework 2's rules.

## 5.2.0 — 10 November 2026

- **The one-line plan table** (# · Day · Video · Giant · Lane · Score), rendered by the new `scripts/plan_sheet.py` from a plan file, so every week and month sheet looks the same. It runs `check_picks.py` itself.
- The exact month-run steps are in `references/twitter-engine.md`, and everything learned is in `references/research-findings.md` §11.

## 5.1.0 — 10 November 2026

- **16 giants:** 8 AI and 8 paid media, about 160 posts a run. Ralph Burns and John Moran (Tier 11) are added. The other 16 move to a bench that is not scanned.
- **Month run:** the 160 posts are whittled down to the best 30, giving one video per day (`## This month: 30 videos`). `check_picks.py` checks the 30 days.

## 5.0.0 — 10 November 2026

- **Three engines, in this order:** 1. Twitter engine, 2. My work engine (was Table One), 3. YouTube engine (was Table Two).
- **The Twitter engine.** It studies the last 10 X posts of 15 AI giants and 15 paid-media giants (`references/giants.json`, with handles verified on 10 Nov), using web search only. `scripts/x_posts.py` dates every post from its X ID, keeps the 10 newest per giant and lists anyone with nothing found. Part T scoring: spread ×3 · fresh ×2 · fit ×2 · proof · promise · open.
- **7 videos a week.** The pick sheet now opens with "This week: 7 videos", one per day, Monday to Sunday, for the Sunday run. `check_picks.py` checks the 7 days, the three engines in order, a link on every Twitter row and the "Giants researched" line.
- **New modes:** Study a giant ("study Karpathy's last 10 posts") and Giants (swap people in or out).
- Learned from the 10 Nov test: the AI giants are well indexed and most paid-media giants are not, so for those the engine also reads their blogs, podcasts and YouTube. Search results rarely show likes, so Twitter rows score on spread, not engagement.

## 4.0.0 — 19 October 2026

Everything learned while picking weeks 42 and 43, built in. See `references/research-findings.md` §10.

- **The two tables have Taylor's names:** "Table One: Your own work" and "Table Two: Ideas from creators". They are scored separately and never mixed.
- **Topic register** (`scripts/topics.py`): lock titles word for word (or a working title), rename a working title to its final title with its history kept, then mark it planned, recorded or published. Locked titles show above both tables every run, and only what the register lists as planned, recorded or published in 4 weeks is left out.
- **Session indexer** (`scripts/index_sessions.py`): saved `list_sessions` pages become the 30-day index and research groups (by title tag or repo, split at 30). It says PAGE MORE until the window is covered.
- **Research agent prompts** (`references/agent-prompts.md`) for session groups, sensitive client groups and repos (work done in Codex, on the desktop or by routines).
- **Pick sheet gate** (`scripts/check_picks.py`): locked titles, both headings, scores, creator URLs, research counts, a confidential scrub list, the closing line.
- **Version check** (`scripts/version_check.py`) at the start of every run, so an old attached copy is caught.
- **The claim ladder:** live, working, rehearsed, half-built, blocked. A status column in Table One, and no title claims more than its status allows.
- **"Things we noticed"** section for risks found during research (a public repo with client material, an app without a login).
- **"Sell what we built":** briefs on our own skills give each advanced capability its own showcase segment.
- **Working with Taylor:** files in `video-plans/`, tables shown in the chat too, and no stalling with questions when a recording is close.
- **The video topics list** (`video-plans/Video topics list.md`): Taylor's standing list, with each title and a short summary in Taylor's words, kept until Taylor removes a topic.
- **New Lock, Recorded and Video topics list modes**, a new two-table example, and 24 offline tests (up from 13).

## 3.1.0 — 19 October 2026

Two tables. Taylor asked for the pick sheet to list our own work and other creators separately, and for our work to cover every chat and project from the last 30 days. See `references/research-findings.md` §9.

- Pick returns Table 1 (our work) and Table 2 (creators), scored with separate rubrics. Neither gates the other.
- Table 1 reads everything: every session updated in the last 30 days (paged to the end, read by parallel agents per project group), every GitHub repo pushed in the window with no session (read-only, nothing run), and every skill updated in the window.
- An earlier pick sheet is no longer a reason to skip something we built; only a recorded or fully planned topic is.
- New our-work rubric: wow ×3, proof ×2, demo ×2, fit, freshness, creator echo.
- Rewritten `chat-research.md` and `pick-output.md`; updated SKILL.md, scoring, framework, week pack, quality, START-HERE, README.

## 3.0.0 — 17 October 2026

Creators first. Taylor rejected the v2 week 43 picks because they started from our own sessions; see `references/research-findings.md` §8.

- Pick now uses the core creator list only. Our own work is used for talking points after Taylor chooses (Plan the week and Build one), never to choose, add or rank a topic.
- `scan_creators.py`: core-only by default (`--with-secondary` adds the app watchlist as support; `--core-only` kept as a no-op); new Core winners table (each creator's long-form uploads at 1.4× or more from the latest 30, any date); in-window tables ranked by outlier ratio instead of views per day.
- New scoring: creator proof ×3, spread ×2, viewer promise ×2, freshness, fit, open lane. "No work of ours" is no longer a gate.
- Rewritten: `research-to-topics.md`, `creator-research.md` (proven themes by subject and by promise/format), `scoring.md`, `pick-output.md` (6 topics, creator evidence only), `chat-research.md` (talking points by topic). Updated: SKILL.md, framework, week pack, quality, integrations, START-HERE, README.
- Pick returns 6 topics; a title Taylor names is saved word for word as chosen.
- Pick sheets and week packs save to `video-plans/` in the working directory so Taylor can open them.
- New example `examples/picks-2026-W43.md`; test for the Core winners table and the core-only default.

## 2.0.0 — 13 October 2026

- New references: `headlines.md` (titles, thumbnail lines, one-liners, slide headlines, formula library and scoring, from the packaging research), `descriptions.md` (template, three styles, checks), `research-findings.md` (every piece of research so far: what, why, what we found), `research-to-topics.md` (how research becomes a topic, angle, format and title), `research-framework.md` (how many videos, which creators, which numbers, cadence, sample-size rules), `skill-integrations.md`, `quality.md`.
- Brief format v2: required PACKAGING section (A/B titles, thumbnail lines, description) and example appendices (live and built-not-run).
- `check_brief.py` enforces PACKAGING: 3+ titles, LINE 1 of 150 characters or fewer, LINE 2, CHAPTERS.
- New Package mode.
- Gold example now includes the live client app example, the built-not-run Harbour & Hearth campaign example and PACKAGING; client names removed.
- Historical examples: the first pick sheet (W42) and the first core scan.
- Offline tests (`tests/test_skill.py`), `PACKAGE-MANIFEST.json`, `START-HERE.md`, `BUILD-STATUS.md`, `agents/openai.yaml`, `requirements.txt`.

## 1.0.0 — 12 October 2026

- Weekly loop: Pick (5 topics), Plan the week (3 briefs), Build one, Scan only, Creators.
- Lane A chat research from Claude Code sessions; Lane B creator scan (RSS plus yt-dlp outlier ratios); core 10 creators verified, app watchlist as secondary.
- Trending Topic Brief format with ACT 1/2/3, segment cards, AT A GLANCE and READ BEFORE YOU RECORD; `check_brief.py` gate; harness brief as the gold example.
