# Trending Topics v2

A Claude Code skill that finds Whiteboard Wednesdays video topics from two sources (our recent Claude Code work and our creator list), scores them with our packaging research, and writes record-ready Trending Topic Briefs with titles and descriptions.

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
# Lane B: scan creators (core + app watchlist when the repo is present)
python3 scripts/scan_creators.py --out <dir> --days 14            # full
python3 scripts/scan_creators.py --out <dir> --days 14 --core-only
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

- Our sessions: Claude Code remote session tools (`list_sessions`, `list_events`).
- Creators: public YouTube channel RSS and listings. No API key needed.
- Packaging research: the thumbnail-tracker skill's study of Nick Saraev, Sabri Suby and Riley Brown, summarised in `references/research-findings.md`.
