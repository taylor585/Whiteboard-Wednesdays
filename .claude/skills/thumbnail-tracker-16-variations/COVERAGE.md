# Coverage map: everything from the build conversation, and where it lives

This skill was built over one long conversation with Taylor Cunningham (Pecuna Factorem), 11–13 October 2026. Every topic, finding, decision and preference from it is listed here with the file that holds it. If something isn't on this list, it isn't in the skill.

## 1. What makes a good thumbnail, and how we make them

| Topic | File |
|---|---|
| What makes a good thumbnail (six things) | `references/frameworks/thumbnail-framework.md` §1 |
| The 10-step thumbnail method | `references/frameworks/thumbnail-framework.md` §2 |
| Layout decision tree (13 layouts + scene) | `references/frameworks/thumbnail-framework.md` §3; examples `references/design/layouts.md`, `assets/layouts/` |
| Thumbnail line rules (2–5 words, angles, full stop, one mark, numbers, the speaker's own words, don't repeat the title) | `references/frameworks/thumbnail-framework.md` §4; `references/design/playbook.md` §4 |
| Face, objects, proof rules | `references/frameworks/thumbnail-framework.md` §5 |
| Colour, light, contrast; light vs dark; bright tint on dark | `references/frameworks/thumbnail-framework.md` §6 |
| Checks: 168px, squint, greyscale, timestamp corner, play-button zone | `references/frameworks/thumbnail-framework.md` §7; `references/quality.md` |
| Thumbnail scorecard 0–100 (house heuristic) | `references/frameworks/thumbnail-framework.md` §8 |
| The ten elements (Nick study) | `references/design/playbook.md` §2; `references/research/nick-thumbnail-audit.md` |
| What underperformed; templates going stale | `references/frameworks/thumbnail-framework.md` §10; `references/design/playbook.md` §5 |
| Pre-publish checklist | `references/design/playbook.md` §6 |
| **Pecuna thumbnails with no phone photo (the default): the objects-only standard, the six approved examples square inch by square inch, hero objects per promise** | `references/design/objects-only-standard.md`; `examples/objects-only-2026-11/`; `scripts/hero/` |
| Flat no-photo scenes for other brands | `references/design/scene-design.md` |
| "Make it pop": the pop recipe | `references/design/scene-design.md` §2 |
| Dark patterns: Spotlight, Research board, Redacted dossier | `references/design/scene-design.md` §3; `examples/read-their-mind-dark.json` |
| When not to go dark | `references/design/scene-design.md` §4 |
| Object vocabulary (lens, doc, card, bubble, head, sticky, highlighter, chip, glow, pin, string) | `references/design/scene-design.md` §5; `references/design/spec.md` |
| Case study: "Read their mind", A–C light, B picked, D1–D3 dark, D1 won, every change and why | `references/design/scene-design.md` §1; `assets/case-study/`; `examples/icp-buyer-research/decisions.md` |
| Scenes the renderer can't draw (image-model prompts) | `references/design/image-prompts.md` |
| Renderer fields, coordinates, gotchas | `references/design/spec.md`; `schemas/spec.schema.json` |
| Sizes from one design (YouTube, LinkedIn video, LinkedIn 4:5, link preview) | `SKILL.md` "Sizes from one design"; `references/platforms.md`; `references/design/scene-design.md` §6 |

## 2. The experts we researched, and what we found

| Topic | File |
|---|---|
| Who: Nick Saraev, Sabri Suby (@SabriSubyOfficial), Riley Brown | `references/research/method.md` |
| The original audit of all ~320 of Nick Saraev's thumbnails (eras, ten elements, courses) | `references/research/nick-thumbnail-audit.md` |
| Sample 1: latest 30 long-form uploads each (90 videos) | `references/research/method.md` |
| Sample 2: all-time top 10 by views + top 10 breakouts each (60 videos) | `references/research/method.md` |
| Outlier ratio (views ÷ median of 10 uploads either side), thresholds | `references/research/method.md`; `references/research/overview.md` §1 |
| Era confounds (old breakouts inflated; Sabri's 2019–21) | `references/research/overview.md` §1; `references/frameworks/headline-framework.md` intro |
| The 20 verified laws, with evidence, confidence and what each feeds | `references/research/overview.md` §2 |
| Things that didn't hold | `references/research/overview.md` §3; `references/frameworks/headline-framework.md` §6 |
| Formula life cycles (formulas wear out) | `references/research/overview.md` §4 |
| Open questions to test on our channel | `references/research/overview.md` §5; `references/learning-loop.md` |
| Each creator one by one: signature, titles by era, winning thumbnails, descriptions, borrow now, worn out, style recipe | `references/research/creators.md` |
| Contact sheets of each creator's top 20 | `assets/research/top-hits-nick.jpg`, `-sabri.jpg`, `-riley.jpg` |
| Raw data (every upload; latest-30 and top-20 teardowns) | `references/research/data/` + README |
| Research report page (private artifact) | link in `references/design/playbook.md` §7 |
| How to research another creator the same way (rubric) | `references/research/method.md`; `references/workflows.md` |

## 3. Headlines (titles)

| Topic | File |
|---|---|
| The 4-step headline framework | `references/frameworks/headline-framework.md` (top) |
| Rules that held: search + browse (1.24×), avoid plain how-to (0.49×), name it early, one promise | `references/frameworks/headline-framework.md` §1 |
| All-time additions: courses, formulas wear out, stakes, numbers as the feat, year refresh, news titles, collaborators | `references/frameworks/headline-framework.md` §1b |
| Formula library with evidence and templates | `references/frameworks/headline-framework.md` §2 |
| Scoring 0–100 with penalties | `references/frameworks/headline-framework.md` §4 |
| Title testing and retitling | `references/frameworks/headline-framework.md` §5; `references/learning-loop.md` |
| Brand title rules (70 characters or fewer, hook in the first 40) | `references/frameworks/headline-framework.md` (top); `references/brand/house-style.md` |
| Worked example: 10 ICP titles, recommended vs Taylor's published title | `references/frameworks/headline-framework.md` §7; `examples/icp-buyer-research/titles-scored.md` |

## 4. Descriptions

| Topic | File |
|---|---|
| The description framework: each part and why | `references/frameworks/description-framework.md` (top table) |
| Main finding: descriptions don't decide the click | `references/frameworks/description-framework.md`; `references/research/overview.md` law 17 |
| Chapters, disclosure and hashtag research (laws 18–20) | `references/research/overview.md`; `references/frameworks/description-framework.md` |
| The three creator styles (Sabri, Nick, Riley) | `references/frameworks/description-framework.md` |
| House style: pinned WhatsApp CTA on line 1; a blank line between every bullet, chapter and paragraph; a space after 👉 | `references/brand/house-style.md` |
| CTA library (6 CTAs) + PDF | `references/brand/cta-library.md`; `assets/cta/` |
| Final ICP description as published | `examples/icp-buyer-research/description-final.txt` |
| Checks (chapters, disclosure, placeholders) | `scripts/package.py`; `references/quality.md` |

## 5. LinkedIn

| Topic | File |
|---|---|
| LinkedIn post framework (adapted from the YouTube research, untested) | `references/frameworks/linkedin-framework.md` |
| Hook angles carried over from the top videos | `references/frameworks/linkedin-framework.md` |
| Native video vs link share; which file to use | `references/frameworks/linkedin-framework.md`; `references/platforms.md` |
| The 3 ICP LinkedIn posts | `examples/icp-buyer-research/linkedin-posts.md` |
| LinkedIn checks (hook ≤ 140, not the title, ≤ 3,000, 3–5 hashtags) | `scripts/package.py` |

## 6. Brand, preferences and delivery

| Topic | File |
|---|---|
| Pecuna Factorem colours, fonts, logo, red = problem / green = fix | `references/brand/brand-profile.md`; `examples/brand-pecuna.json` |
| UK English, no client names, real figures only | `references/brand/house-style.md`; `SKILL.md` master rules |
| No presenter photos yet → object scenes | `references/brand/brand-profile.md` |
| Deliver files directly for simple asks; no plans | `references/brand/house-style.md` (Delivery); `SKILL.md` master rule 4 |
| Label every file with platform and size; explain teaser chips ("NEW VIDEO · 39 MIN") | `references/brand/house-style.md` (Delivery) |
| Copy-and-paste text in one box | `references/brand/house-style.md`; `SKILL.md` |
| Platform sizes and their sources | `references/platforms.md` |
| The packaging brief format | `references/brief-template.md`; `examples/icp-buyer-research/brief.md` |

## 7. Tools, app and operations

| Topic | File |
|---|---|
| Package / Create / Titles only / Description only workflows | `SKILL.md` |
| Track / Watch / Audit workflows | `references/workflows.md` |
| Rendering (render.cjs), packaging (package.py), transcription (transcribe.py), dossiers (fetch_videos.py), faces (prep_face.py) | `scripts/`; `README.md` |
| Whiteboard Wednesdays app: vault model (no API credits), Thumbnails page, `--vault` | `references/whiteboard-wednesdays.md` |
| After publishing: CTR at 48 hours, retitle protocol, log | `references/learning-loop.md`; `examples/packaging-log.csv` |
| Published ICP package (D1, Taylor's title) awaiting CTR | `references/learning-loop.md`; `examples/packaging-log.csv` |
| Known failures and fixes | `references/troubleshooting.md` |
| Quality gates and honest reporting | `references/quality.md` |
| Fonts bundled with licences | `assets/fonts/` |
| Tests and routing eval | `tests/`; `tests/evals/routing.json` |
| What was verified in this build | `BUILD-STATUS.md` |
