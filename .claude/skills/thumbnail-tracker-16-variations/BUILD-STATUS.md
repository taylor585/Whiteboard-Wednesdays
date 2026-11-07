# Thumbnail Tracker build status

## 3.1.0 (27 October 2026): variety pack

- Unit tests: `python3 -m unittest discover tests`, with the 38 existing tests plus 12 new variety tests. The render regression against `tests/golden/` still matches after the renderer additions.
- `scripts/variety.py check` was run on the real rounds from this build: the planned round passes 7/7; the Motion Planning round fails 2 (marks, emoji), which is correct.
- The planned round was rendered with Taylor's real face stills and checked by eye, along with the placeholder example in `assets/variety/_index.jpg`.
- Not re-run for 3.1: the routing eval with a fresh agent (2 new cases were added to `tests/evals/routing.json`).

# Thumbnail Tracker 3.0: build status

Version 3.0.0, built 13 October 2026 in a cloud workspace. This file records what was actually run and checked, and what is still open.

## Verified in this build

- **Unit tests:** `python3 -m unittest discover tests` ran 38 tests, all passing, covering:
  - packager checks (title length, chapters, disclosure, LinkedIn hook and hashtags, placeholders including `[your link]`);
  - schema validation (all examples pass; bad specs, batches and brands fail);
  - the `fetch_videos.py` hashtag fix (`#1` no longer counted);
  - the research-figure check;
  - render regression.
- **Research figures:** `scripts/verify_research.py` checked 264 ×-figures (132 distinct) in `references/research/overview.md` and `creators.md`. All 264 matched the shipped data or the recomputed cross-creator medians. Four figures exist only in the original teardowns, and are whitelisted with source comments.
- **Render regression with bundled fonts and Google Fonts blocked (`THUMB_OFFLINE=1`):** all 11 reference images matched the earlier Google-font renders. The mean absolute difference was 0.028–0.120 out of 255, and the 99th percentile 0–6. All 14 sample layouts matched (mean 0.00–0.085). The D1 Spotlight and thought-bubble renders were also checked by eye.
- **Renderer fix:** a CSS class collision (`.sc-handle`) made the @handle in the `social` layout render rotated across the headline. The lens handle is now `.sc-lens-handle`; scene output is unchanged.
- **Packager:** fixed so board.html and the `--vault` copy use the real image format (`jpg` or `png`).
- **End to end, offline:** the ICP batch ran through `scripts/package.py`. It passed schema validation, rendered 5 thumbnails plus the feed preview and board, showed zero `CHECK:` lines, and listed the expected placeholders as `NOTE:` lines.
- **Schemas:** every file in `examples/` validates (spec, batch, brand).
- **Routing eval** (`tests/evals/routing.json`): a fresh agent that read only `SKILL.md` named the expected section and files for 20 of 20 requests, including "what makes a good thumbnail", "which experts did we research", "break down the headline framework" and "make it pop".
- **Coverage audit:** an independent agent read the full conversation transcript (23 user turns, 171 assistant turns) against the skill. It found 5 small gaps and 11 inconsistencies, all fixed:
  - the Liam Ottley "topic, not template" lesson;
  - round-1 decisions;
  - who picked A vs B;
  - the 4K/50MB note;
  - the Watch proof point;
  - the working title;
  - round numbering;
  - dark vs light wording;
  - the course threshold (about 1 hour);
  - description versions;
  - the 70-character rule;
  - the 8.2× vs 9.22× snapshot;
  - the LinkedIn source;
  - CTA 01 scope;
  - an overstated evidence label;
  - a stale memory path.
- **Paths:** every backticked path in the docs resolves inside the skill.
- **Package:** `scripts/package_skill.py` builds the zip and `PACKAGE-MANIFEST.json` (sha256 per file), re-reads every hash, and re-runs the tests in a fresh extraction. The results of the final build are appended below.

## Still open (not verified)

- **No click-through data.** The research uses public views and outlier ratios, with no CTR, search-traffic or link-click data. Title rules are strong signals; description rules are medium confidence.
- **The research is a snapshot from 12 October 2026.** Ratios of recent uploads keep moving.
- **The LinkedIn framework is adapted from YouTube and untested on LinkedIn.**
- **Platform sizes** are third-party consensus. Google's and LinkedIn's own help pages weren't reachable.
- **The ICP package's real performance is unknown.** Taylor published his own title, "I Built an ICP Research AI Agent That Finds Your Ideal Clients On Meta", with the D1 thumbnail. Log the 48-hour CTR in `examples/packaging-log.csv`.
- **Scores are heuristics.** The title and thumbnail scorecards are house heuristics for ranking, not validated predictors.
- **Simple Icons logos (`si:`) still need the network.** Fonts don't.
- **Transcription needs faster-whisper and its model files,** which weren't re-tested in this build (tested in 1.x).
- **No presenter photos exist yet,** so face layouts were only tested with placeholders.

## Final build (13 October 2026)

- `scripts/package_skill.py` produced `thumbnail-tracker-3.0.0.zip`:
  - 156 files (about 5.9 MB unpacked, 5.2 MB zipped);
  - SKILL.md frontmatter valid (description 849 characters);
  - every file hash re-verified from the zip;
  - in a fresh extraction, all 38 tests passed, including the render tests.
- Nothing was skipped for size.
