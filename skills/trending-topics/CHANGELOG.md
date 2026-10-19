# Trending Topics releases

## 4.0.0 — 19 October 2026

Everything learned while picking weeks 42 and 43, built in. See `references/research-findings.md` §10.

- **The two tables have Taylor's names:** "Table One: Your own work" and "Table Two: Ideas from creators". They are scored separately and never mixed.
- **Topic register** (`scripts/topics.py`): lock titles word for word, then mark them planned, recorded or published. Locked titles show above both tables every run, and only what the register lists as planned, recorded or published in 4 weeks is left out.
- **Session indexer** (`scripts/index_sessions.py`): saved `list_sessions` pages become the 30-day index and research groups (by title tag or repo, split at 30). It says PAGE MORE until the window is covered.
- **Research agent prompts** (`references/agent-prompts.md`) for session groups, sensitive client groups and repos (work done in Codex, on the desktop or by routines).
- **Pick sheet gate** (`scripts/check_picks.py`): locked titles, both headings, scores, creator URLs, research counts, a confidential scrub list, the closing line.
- **Version check** (`scripts/version_check.py`) at the start of every run, so an old attached copy is caught.
- **The claim ladder:** live, working, rehearsed, half-built, blocked. A status column in Table One, and no title claims more than its status allows.
- **"Things we noticed"** section for risks found during research (a public repo with client material, an app without a login).
- **"Sell what we built":** briefs on our own skills give each advanced capability its own showcase segment.
- **Working with Taylor:** files in `video-plans/`, tables shown in the chat too, and no stalling with questions when a recording is close.
- **New Lock and Recorded modes**, a new two-table example, and 24 offline tests (up from 13).

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
