# Trending Topics v3.1

A Claude Code skill that finds Whiteboard Wednesdays video topics in two separate tables: our own work (every Claude Code session, GitHub repo and skill from the last 30 days) and what our creator list has already proven (each creator's breakout videos). It scores each table with its own rubric, then writes record-ready Trending Topic Briefs with titles and descriptions for the topics Taylor picks.

## Layout

```
trending-topics/
  SKILL.md                 the workflow the agent follows
  START-HERE.md            first run and the prompts to use
  BUILD-STATUS.md          verified vs open
  CHANGELOG.md
  PACKAGE-MANIFEST.json    file hashes for the packaged release
  requirements.txt         optional Python dependency (yt-dlp)
  agents/openai.yaml       display name and default prompt for Codex
  references/              how we do each part (format, headlines, descriptions, research, scoring...)
  scripts/                 scan_creators.py, check_brief.py, build_manifest.py
  tests/                   offline tests
  examples/                gold brief, first pick sheet, first scan
```

## Commands

```bash
# Scan the core creators (the only source of topics)
python3 scripts/scan_creators.py --out <dir> --days 14
python3 scripts/scan_creators.py --out <dir> --days 14 --with-secondary   # add the app watchlist as support
python3 scripts/scan_creators.py --out <dir> --no-ytdlp           # RSS only

# Gate a brief (or several)
python3 scripts/check_brief.py brief1.md brief2.md brief3.md

# Tests (offline)
python3 tests/test_skill.py

# Release
python3 scripts/build_manifest.py
# then package with the skill-creator: python3 -m scripts.package_skill <skill-dir> <out-dir>
```

## What check_brief.py enforces

1. Headings in order: AT A GLANCE, READ BEFORE YOU RECORD, COLD OPEN, ACT 1: THE PROBLEM, THE TURN, ACT 2: THE SYSTEM, ACT 3: THE PROOF, CLOSE, PREP CHECKLIST, PACKAGING.
2. Act 1 problems numbered P1, P2...
3. Every Act 2 card has all ten fields, non-empty.
4. Every one-liner is 5 to 10 words.
5. Every Act 1 problem is crossed off; every card solves at least one.
6. Act 3 has NUMBERS.
7. PACKAGING has at least 3 titles (70 characters or fewer), LINE 1 of 150 characters or fewer, LINE 2 and CHAPTERS.

## Data sources

- Creators (topics): public YouTube channel RSS and listings. No API key needed.
- Our work (Table 1 and talking points): Claude Code remote session tools (`list_sessions`, `list_events`), GitHub (`list_repos`, read-only clones) and the synced skills manifest.
- Packaging research: the thumbnail-tracker skill's study of Nick Saraev, Sabri Suby and Riley Brown, summarised in `references/research-findings.md`.
