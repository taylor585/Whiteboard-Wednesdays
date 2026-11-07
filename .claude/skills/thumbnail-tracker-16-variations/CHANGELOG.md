# Thumbnail Tracker releases

## 4.0.0 (7 November 2026): Thumbnail Tracker - 16 Variations

Renamed at Taylor's request: the skill is now **Thumbnail Tracker - 16 Variations** (`name: thumbnail-tracker-16-variations`). It replaces `thumbnail-tracker`; disable or delete the old one on claude.ai so the two don't compete.

- **16 variations per round:** all 8 layouts, each on two grounds; 4–6 lines; emoji on 20–50%; at least 4 fonts and 4 accents. Slot table and process: `references/design/objects-only-standard.md` §8.
- **`variety_check.py` scales with the round:** each layout, ground or hero at most ceil(n/8) times (twice in a 16), each layout + ground pair once, 4 fonts/accents and 4 lines in rounds of 12+.
- **`scripts/hero/contact_sheet.py`:** a numbered 4×4 contact sheet (Taylor picks by number) and the 168 px colour + greyscale strip.
- **`diagonal` layout:** `type3d(rot=...)` tilts a line around its baseline.
- **Example:** `examples/think-16-2026-11/` ("How To Think With AI"), 16 specs, thumbnails, contact sheet and strip.

## 3.3.0 (7 November 2026): variety

Taylor: "How can we add more variety to our thumbnail tracker skill?", then "let's test it out using a headline like this: How To Think With AI".

- **8 layouts** (`words-left`, `centre-hero`, `hero-dominant`, `versus`, `words-on-object`, `stacked-centre`, `diagonal`, `on-brand-ledge`), each with when to use it: `references/design/objects-only-standard.md` §7.
- **11 grounds:** new `brand-yellow`, `dark-purple`, `dark-green`, `hot-orange`, `paper-grid` (+ `dot_grid` layer) and `sky`.
- **Type:** Inter Tight Black (`black-sans`, `white-sans`), `purple-glow`, `green-outline`, Permanent Marker (`marker-red`); Caveat for arrow notes.
- **Marks:** `block3d` (a lit 3D colour block behind a word), `circle_mark` (hand-drawn ring), `arrow_mark` (hand-drawn arrow with optional note).
- **Stickers:** `emoji` (Noto Color Emoji, die-cut white edge, shadow, tilt).
- **Hero objects:** `lightbulb` (with a coiled filament, or a logo as the filament), `brain`, `speech_bubble`. 16 in all.
- **`scripts/hero/variety_check.py`:** FAILs a round that repeats a layout, ground or hero, uses fewer than 3 fonts or accents, or puts emoji on all or none; WARNs on repeating recent published looks or having no wildcard. Every example spec now carries a `look` block.
- **Round recipe:** 4 per video (bold dark, bold bright, on-brand, wildcard).
- **Example:** `examples/think-variety-2026-11/` ("How To Think With AI"): six thumbnails, six layouts, six grounds.
- Timestamp-corner check now understands centred text and narrow Anton.
- Tests: `tests/test_variety_hero.py`.

## 3.2.1 (3 November 2026): four new hero objects, round 2 examples

- **New kit objects** (`scripts/hero/kit.py`, registered in `build_hero.py` and `schemas/hero.schema.json`): `clapperboard` (planning, motion), `phone` (a demo playing, with play button and scrubber), `coin_stack` (gold coins with the currency symbol, visible coin edges), `price_tag` (a 3D shop tag with the price on it).
- **Round 2 examples** in `examples/objects-only-2026-11-round2/`: the Vision Boards ("Motion Planning???") and Grok Bot ("£752 / $1,003 a Month") redos, three looks each, with the feed mock and the 168 px strip.
- The standard's hero-object table (§4) now covers planning, demos, prices and "an AI that does a person's job" (the logo wearing a headset).
- `tests/test_hero.py`: the round 2 specs validate and build with no warnings.

## 3.2.0 (2 November 2026): the objects-only standard

Taylor approved the six objects-only redesigns of the AI Harnesses and Grok thumbnails ("much better… it's got the variation, everything's punchy, this is brilliant. I want them to look exactly like this") and asked for every square inch to be baked into the skill.

- **`references/design/objects-only-standard.md`:** the 12 rules that make it punchy, each of the six broken down layer by layer (3×3 map, coordinates, sizes, finishes, extrusions, rotations, why), how to make a new one, a table of hero objects per promise, and what was wrong before.
- **`scripts/hero/`:** `kit.py` (SVG lighting: bevel, specular and rim filters; extruded 3D type and logos; alarm clock, gauge, keycap, headset, handset, call button, ledge, highlighter stroke, coiled cord; lit studio backdrops with vignette and grain), `palettes.py` (named finishes and studio presets), `build_hero.py` (JSON spec → 1280×720, 1920×1080 or 1080×1350 JPG, with warnings for a fifth word or anything under the timestamp), `render_hero.cjs` (2× Playwright render). `schemas/hero.schema.json` validates specs and rejects a fifth word.
- **`examples/objects-only-2026-11/`:** the six specs, their JPGs, the feed mock beside the reference thumbnails, the 168 px colour + greyscale strip, and the before/after of the rim-light pass.
- **Up a notch:** a rim light from the top-right on the dark set's type, logos and clock, and a brighter two-layer halo on the Grok mark. The compositions are unchanged.
- **`assets/logos/`:** Claude, OpenAI and Grok marks (SVG, with sources and licences).
- **Tests:** `tests/test_hero.py` (8 tests): the schema holds the 4-word rule, the six specs validate, the timestamp corner is clear, each video has the three looks, no face layers, and every spec rebuilds to its golden (MAD ≤ 2).
- `SKILL.md` step 5 is now the standard; the flat `scene` archetype stays for other brands (step 5b).

## 3.1.1 (2 November 2026): master rule, no photos of Taylor from video

Taylor: "Let's make it a master rule that we never, ever take a photo of me from the video ever again. I'll always supply a photo from my phone… or if I don't supply one… we just use objects."

- Master rule 6 in `SKILL.md`, and the same rule in `references/brand/house-style.md`, `references/brand/brand-profile.md` and `references/design/variety.md` (which used to say "pull stills from the recording").
- `scripts/prep_face.py` refuses video files outright, and refuses a photo without camera EXIF (a frame or screenshot) unless `--phone-photo` confirms Taylor supplied it. Tested in `tests/test_prep_face_guard.py`.

## 3.1.0 (27 October 2026): variety pack

Taylor asked for "this level of variety every single time" after the Motion Planning round (light and yellow backgrounds, heavy capitals, boxed words, emoji). He picked MP1 (white, condensed CAPS, red underline) and MP2 (brand yellow, sans, boxed word), each with one big face, as his first split test.

- **Variety pack rule** (`references/design/variety.md`): every round of 4+ varies the ground (3 light + 2 dark), the background, the typeface and case, the mark, and emoji vs no emoji, with one big face each.
- **`scripts/variety.py`:**
  - `plan` writes a 5-slot round (6 with a multi-face wildcard) from a one-line brief, in the brand's palette;
  - `check` reports the six axes and FAILs samey rounds. Run on earlier rounds, it catches the Motion Planning round's gaps: only 2 marks, emoji on all five.
- **Renderer, additive only:**
  - `bg_style` background presets (`paper-grid`, `cream-grid`, `brand-yellow`, `flat`, `black-glow`, `black-spotlight`) with `bg_color`, `glow_color`, `glow_at` and `glow_opacity`;
  - `stickers` on any layout: `emoji` (no shadow bubble), `mark` (big ?, !, ?! in any bundled font, optional outline) and `photo` (extra face circles);
  - an optional `shadow` flag on circle faces.

  All 11 golden renders and the 14 sample layouts are unchanged.
- **Schema:** the new fields are added to `spec.schema.json`.
- **Example:** `examples/variety/brief.json` → `examples/variety-motion-planning.json`, rendered in `assets/variety/_index.jpg` (placeholder faces).
- **Tests:** `tests/test_variety.py` (12 tests): the plan passes its own check, the 2-dark/3-light mix, one face each, the wildcard, samey rounds fail, CLI exit codes, and that the example renders.
- **SKILL.md:** a routing row for variation requests, step 3 (variety pack), step 7 (variety check and A/B from different grounds), and the reference table.


## 3.0.0 (13 October 2026)

- **A complete archive:**
  - `START-HERE.md`, `README.md`, `BUILD-STATUS.md`, `CHANGELOG.md`;
  - `COVERAGE.md`, mapping every topic from the build conversation to its file;
  - `PACKAGE-MANIFEST.json`, with a sha256 for every file;
  - `agents/openai.yaml`.
- **Frameworks, one file each:**
  - `thumbnail-framework.md` (new): what makes a good thumbnail, a 10-step method, a layout decision tree, line rules, face/objects/proof, colour and light, checks, a 0–100 scorecard, each expert's winners, what failed;
  - `headline-framework.md`: the 4-step framework and a worked example;
  - `description-framework.md`: each part and why, the worked example;
  - `linkedin-framework.md`.
- **Research, complete:**
  - `nick-thumbnail-audit.md` (new): the original 320-thumbnail study;
  - `method.md`: who, how and both samples;
  - `overview.md`, `creators.md` and the raw data.
- **Design:** `layouts.md` (new), with a rendered example of all 14 layouts in `assets/layouts/`. `examples/sample-spec.json` now covers all 14.
- **Brand:**
  - `brand-profile.md` (new);
  - `cta-library.md` (new, text source for the PDF);
  - house-style delivery preferences;
  - `examples/brand-pecuna.json`.
- **Operations (all new):**
  - `platforms.md` (sizes, sources, confidence);
  - `brief-template.md`;
  - `learning-loop.md` (after publishing);
  - `quality.md` (gates);
  - `troubleshooting.md`;
  - `whiteboard-wednesdays.md` (the app vault);
  - `workflows.md` (Track, Watch, Audit).
- **Worked example:** `examples/icp-buyer-research/` holds the brief, titles, three thumbnail rounds, the finals, the description as published, LinkedIn posts and decisions. `examples/packaging-log.csv` is new.
- **Code:**
  - bundled fonts with licences (offline rendering);
  - JSON schemas with a stdlib validator wired into `package.py`;
  - `gallery.py`, `verify_research.py` and `package_skill.py`;
  - unit tests and a render regression test;
  - a routing eval;
  - the hashtag regex in `fetch_videos.py` fixed.
- `SKILL.md` was rewritten as a short router with master rules. The detailed Track, Watch and Audit procedures moved to `references/workflows.md`.

## 2.1 (13 October 2026)

- The Pecuna Factorem house style: the pinned WhatsApp CTA on line 1 and the spaced description layout.
- The CTA library PDF.

## 2.0 (12 October 2026)

- The router table.
- `scene-design.md`: the "Read their mind" case study, the pop recipe and the dark patterns.
- The research folder:
  - `overview.md` (20 laws);
  - `creators.md`;
  - raw data;
  - contact sheets.
- Titles-only and description-only flows.
- Placeholder notes in `package.py`.
- The skill keeps the same name.

## 1.x (11–12 October 2026)

- Track, Watch, Audit and Create modes.
- Renderer layouts.
- Package mode (titles, thumbnails, descriptions, `board.html`, the app vault).
- Research into the latest 30 uploads and all-time top 20 of Nick Saraev, Sabri Suby and Riley Brown.
- LinkedIn copy rules.
- Dark scene elements.
