# Trending Topics releases

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
