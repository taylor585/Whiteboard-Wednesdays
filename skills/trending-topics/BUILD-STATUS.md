# Trending Topics v3.1 build status

Version 3.1.0, 19 October 2026: two tables (our work, creators). Version 3.0.0 was rebuilt creators-first on 17 October 2026 in the shared cloud workspace (v2.0.0 was 13 October).

## Verified

- `quick_validate.py` (skill-creator): valid; description 987 characters.
- `tests/test_skill.py`: 11 offline tests pass. They cover the gold brief passing; failures for a missing act heading, a 12-word one-liner, an uncrossed problem, a missing segment field, fewer than 3 titles, an over-long description LINE 1 and missing CHAPTERS; the outlier maths; window inference; and a failed channel being logged without stopping the run.
- `check_brief.py examples/harness-brief.md`: PASS (58 problems, 13 segments, 58 crossed off, PACKAGING present).
- Live scan, 13 October 2026, `--core-only`: all 11 core channels scanned, no failures. Full scan on 12 October: 44 channels in about 24 seconds, no failures.
- First real Pick run (12 October): 91 sessions found, 10 read in depth, 15 signals, 5 topics scored (`examples/picks-2026-W42.md`).
- Client names removed from every committed file (checked by search).
- The packaged archive is extracted fresh, re-validated, tested and compared against `PACKAGE-MANIFEST.json` before release.

## Open

- Plan the week has been run on one brief at full depth (the harness video), not yet on three in one pass.
- Package mode's real chapter timestamps need a recorded video's transcript; only planned chapters have been written so far.
- The open questions in `references/research-findings.md` §7 need our own channel's data after the first uploads.
- Layer C deep study (latest 30 + all-time top 20) is done for Nick Saraev, Sabri Suby and Riley Brown only; Sergio C, Jeremy Haynes and Alex Finn are next.
- The talking points step (after the pick) is built for Claude Code. On claude.ai without session tools, it falls back to asking Taylor for a short note.
- Plan the week has not yet been run on a creators-first pick; the first is week 43.
