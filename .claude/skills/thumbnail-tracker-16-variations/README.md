# Thumbnail Tracker - 16 Variations

A Claude skill that makes YouTube and LinkedIn packaging (thumbnails, titles, descriptions, LinkedIn posts), with every rule traceable to research or to the user's own rules. It also tracks channels, watches competitors and audits thumbnails.

- `SKILL.md` is what the agent reads first: master rules, a "which file for which ask" router, and the workflows.
- `START-HERE.md` has example prompts.
- `COVERAGE.md` maps every topic to its file.
- `BUILD-STATUS.md` says what was verified.

## Requirements

- Python 3.10+ with `pip install -r requirements.txt` (yt-dlp, pillow, numpy). Optional: faster-whisper for `transcribe.py`, rembg for `prep_face.py`.
- Node 18+ with Playwright and Chromium (`package.json` pins Playwright 1.56.1) for rendering. Use an existing Chromium where one is installed.
- FFmpeg for `transcribe.py`.
- **Network:**
  - YouTube is needed for tracking, watching and fetching dossiers;
  - Simple Icons is needed for `si:` logos;
  - fonts are bundled, so rendering otherwise works offline.

## Commands

```bash
# Render thumbnails from a spec (PNG/JPG, any canvas; scale 1.5 → 1920×1080)
node scripts/render.cjs /abs/spec.json /abs/out
THUMB_OFFLINE=1 node scripts/render.cjs /abs/spec.json /abs/out   # block Google Fonts entirely

# Package a video: validate → render → checks → board.html (→ app vault)
python3 scripts/package.py batch.json /abs/out [--vault <app>/public/thumbnails]

# Validate JSON against the schemas
python3 scripts/validate.py examples/*.json [--schema spec|batch|brand] [-q]

# Transcribe a video (faster-whisper, CPU) → transcript, SRT, draft chapters
python3 scripts/transcribe.py video.mp4 /abs/out/transcript

# Research
python3 scripts/fetch_videos.py <out> --channel @handle --baseline 30 --all-dossiers   # dossiers
python3 scripts/track_channel.py @handle <workdir> [--limit 100]                      # thumbnails + outliers
python3 scripts/group_stats.py <workdir>/videos.tsv tags.tsv                          # group medians
python3 scripts/watch.py add @handle --dir <state> ; python3 scripts/watch.py run --dir <state>
python3 scripts/audit.py <image|URL|video id> <out> [--feed <thumbs dir>] [--benchmark <json>]
python3 scripts/prep_face.py photo.jpg /abs/out/face.png
python3 scripts/hero/build_hero.py spec.json out/        # objects-only standard: JSON spec -> lit 3D thumbnail (3.2)
python3 scripts/variety.py plan brief.json spec.json   # a varied 5-thumbnail round (3.1)
python3 scripts/variety.py check spec.json             # FAIL if a round is too samey

# Maintenance
python3 scripts/gallery.py            # re-render assets/layouts/ from examples/sample-spec.json
python3 scripts/fetch_fonts.py        # re-download bundled fonts + rebuild assets/fonts/fonts.json
python3 scripts/verify_research.py    # every ×-figure in the research docs must exist in the data
python3 scripts/imgdiff.py a.jpg b.jpg
python3 -m unittest discover tests    # 38 tests; THUMB_SKIP_RENDER=1 skips the render tests
python3 scripts/package_skill.py [--dist DIR] [--skip-tests] [--skip-render]   # build the zip + manifest
```

**CTA library PDF:** edit `references/brand/cta-library.md` and `assets/cta/cta-library.html`, then render the HTML to PDF with Playwright (`page.pdf({format:'A4', printBackground:true})`) to `assets/cta/Pecuna-Factorem-CTA-Library.pdf`.

## Folder map

| Path | What's there |
|---|---|
| `references/frameworks/` | the thumbnail, headline, description and LinkedIn frameworks |
| `references/design/` | playbook (the design standard), layouts, scene design, renderer spec, image prompts |
| `references/research/` | method, the original Nick Saraev study, the 20 laws, per-creator breakdowns, raw data |
| `references/brand/` | Pecuna Factorem house style, brand profile, CTA library |
| `references/*.md` | platforms, brief template, learning loop, quality, workflows, app handoff, troubleshooting |
| `schemas/` | `spec`, `batch`, `brand` and `hero` JSON schemas (checked by `scripts/validate.py`) |
| `scripts/` | renderer, packager, research tools, maintenance |
| `tests/` | unit tests, render regression (`tests/golden/`), routing eval (`tests/evals/routing.json`) |
| `assets/fonts/` | bundled fonts (17 woff2) with licences: OFL-1.1, and Apache-2.0 for Permanent Marker |
| `assets/layouts/` | a rendered example of each of the 14 layouts + `_index.png` |
| `assets/case-study/` | the "Read their mind" rounds and before/after |
| `assets/research/` | contact sheets of each creator's all-time top 20 |
| `assets/cta/` | the CTA library PDF and its HTML source |
| `examples/` | sample specs, the ICP worked example, brand profile, packaging log |

## Licences

- Fonts keep their own licences in `assets/fonts/`.
- Research thumbnails in `assets/research/` and `references/research/data/` are third-party images and data, kept for internal analysis only. Don't republish them.
- The skill never uploads anything to YouTube or LinkedIn.
