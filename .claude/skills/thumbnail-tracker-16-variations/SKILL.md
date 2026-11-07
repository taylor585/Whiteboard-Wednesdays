---
name: thumbnail-tracker-16-variations
description: "Thumbnail Tracker - 16 Variations. Package YouTube videos with research-backed thumbnails, titles, descriptions and LinkedIn posts for Pecuna Factorem. Every thumbnail round gives 16 variations to choose from: 8 layouts x 2 grounds, lit 3D type and objects, 11 backgrounds, emoji stickers, a numbered contact sheet and a variety check, then the picks get polished and sized for LinkedIn. Objects only unless Taylor supplies a phone photo (never a frame from a video). Also scores titles, writes house-style descriptions and LinkedIn posts, applies the CTA library, and draws on research into Nick Saraev, Sabri Suby and Riley Brown. Use whenever someone mentions YouTube thumbnails, titles or headlines, thumbnail variations, descriptions, chapters, CTAs, LinkedIn video posts or sizes, making a thumbnail pop, what makes a good thumbnail, CTR, or analysing a channel, even if they never say 'tracker'."
---

# Thumbnail Tracker - 16 Variations (4.0.0)

Make the packaging that earns the click: thumbnail, title, description and LinkedIn post. Every rule is traceable to research or to the user's own rules. The skill renders real files, checks them, and explains its choices. Don't stop at advice when the tools can make the thing.

## Master rules

1. **Proof is real.** Use only numbers, results and quotes said in the video or supplied by the user. Never invent results, testimonials or posts. Never name a client the user hasn't cleared ("a med spa client").
2. **Brand first.**
   - For Pecuna Factorem (Taylor Cunningham), always apply `references/brand/house-style.md` and `references/brand/brand-profile.md`. That means the pinned WhatsApp CTA on line 1 of descriptions, a blank line between every bullet, chapter and paragraph, UK English and 3–5 hashtags.
   - For any other brand, ask for colours and fonts before rendering. Don't reuse Pecuna's.
3. **Look at every image before showing it,** including `_feed-preview.png`. Check it at 168px wide.
4. **Label every file with its platform and size.** Give copy-and-paste text in one text box. Simple asks (re-send, sizes, "what did we choose") get the answer or files straight away, with no plan.
5. **Be honest about evidence.** Separate research (with n and confidence) from house rules and brand rules. Scores rank options; they don't predict views.
6. **MASTER RULE: never a photo of Taylor taken from a video.** Taylor, 2 Nov 2026: "never, ever take a photo of me from the video ever again." No frames, screenshots, webcam stills or Reel grabs, ever. Only photos Taylor supplies from his phone. If he hasn't supplied one in this conversation, the thumbnail is **objects only** (`scene`, `references/design/scene-design.md`). Decide that yourself, without asking. `scripts/prep_face.py` refuses video files and photos without camera EXIF unless `--phone-photo` confirms Taylor supplied it.

## Which file for which ask

Find the matching row, follow its section, and open only the files listed.

| The user asks for… | Follow | Read |
|---|---|---|
| A full package ("package this video") | **Package a video** | `references/frameworks/headline-framework.md`, `references/frameworks/thumbnail-framework.md`, `references/frameworks/description-framework.md` (+ `references/frameworks/linkedin-framework.md`) |
| Titles or headlines only | **Titles only** | `references/frameworks/headline-framework.md` |
| A description, chapters, hashtags or a CTA | **Description only** | `references/frameworks/description-framework.md`, `references/brand/house-style.md`, `references/brand/cta-library.md` |
| A thumbnail (with a face) | **Create thumbnails** | `references/frameworks/thumbnail-framework.md`, `references/design/layouts.md`, `references/design/spec.md` |
| "Give me variations", "five thumbnails", any round of 4+ thumbnails, "more variety", "different backgrounds / fonts / emoji" | **Create thumbnails** (step 3, variety pack) | `references/design/variety.md`, then `references/design/spec.md` |
| **Any Pecuna thumbnail with no phone photo (the default), "objects only", "like the Harness / Grok ones", "3D", "punchy", "redo this thumbnail"** | **Create thumbnails** (step 5, the objects-only standard) | `references/design/objects-only-standard.md`, then the nearest spec in `examples/objects-only-2026-11/` |
| A no-photo thumbnail for another brand, or "make it pop / darker" on a flat `scene` | **Create thumbnails** (step 5b) | `references/design/scene-design.md`, then `references/design/spec.md` |
| LinkedIn (or other) sizes of a finished thumbnail | **Sizes from one design** | `references/platforms.md`, `references/design/scene-design.md` §6 |
| A LinkedIn post | **Package** step 6 | `references/frameworks/linkedin-framework.md` |
| "What makes a good thumbnail?" | Answer from the framework | `references/frameworks/thumbnail-framework.md` §1, §9–10 |
| "How do we choose headlines / descriptions?", "explain the framework" | Explain the framework, with its evidence | the matching file in `references/frameworks/` |
| "Who did we research?", "what did the research find?" | Answer from the research | `references/research/method.md`, `references/research/overview.md`, `references/research/nick-thumbnail-audit.md` |
| "In Nick's / Sabri's / Riley's style" | Package or Create with that creator's recipe | `references/research/creators.md` + `assets/research/top-hits-nick.jpg`, `top-hits-sabri.jpg` or `top-hits-riley.jpg` |
| "Is this thumbnail good?", "why no clicks?" | **Audit** | `references/workflows.md` (Audit), `references/frameworks/thumbnail-framework.md` §7–8 |
| Analyse a channel or competitor | **Track** | `references/workflows.md` (Track), `references/research/method.md` |
| Watch channels for breakouts | **Watch** | `references/workflows.md` (Watch) |
| "It's published, now what?", "should I change the title?" | Learning loop | `references/learning-loop.md` |
| Save to the app's Thumbnails page | Package with `--vault` | `references/whiteboard-wednesdays.md` |
| Something fails (fetching, rendering, transcribing) | Fix | `references/troubleshooting.md` |

When a request spans rows, combine them or use Package. A brief in the shape of `references/brief-template.md` speeds everything up.

## Setup

```bash
pip install -r <skill-dir>/requirements.txt      # yt-dlp, pillow, numpy (faster-whisper, rembg optional)
# Rendering: Node + Playwright with Chromium. Fonts are bundled in assets/fonts; logos (Simple Icons) need network.
python3 -m unittest discover <skill-dir>/tests    # optional self-check
```

If something is blocked, say exactly what, and carry on with whatever still works.

## Package a video

Input: a video file, a transcript, or a brief (`references/brief-template.md`). Output: a batch to choose from, rendered and checked.

1. **Content.** For a file, run `python3 <skill-dir>/scripts/transcribe.py <file> <out>/transcript`. Find:
   - the one promise;
   - the search term;
   - the real proof;
   - the 3–5 strongest moments;
   - the speaker's best lines.
2. **Settings.** Use the app's `public/skills/thumbnail-tracker.json` if present, or the brand profile (`examples/brand-pecuna.json`). The style blend chooses which creator's *current* recipe to lean on (`references/research/creators.md`).
3. **Titles.** Follow the headline framework: 10 titles across ≥5 formulas, scored, then an A/B set of 3.
4. **Thumbnails.** Follow the thumbnail framework and make a round of 16 (4.0; **Create thumbnails**, step 5): 8 layouts × 2 grounds, with 4–6 different lines spread across them, each paired with a title (`pair`). Every one has a line that adds to its title. With no phone photo, build them objects only (master rule 6).
5. **Descriptions.** Follow the description framework and house style: three versions (one per creator style), or one in house style for Pecuna Factorem, chapters from real timestamps, real links or placeholders, and a disclosure for any affiliate link.
6. **LinkedIn,** if they post there: 3 posts (one per top title angle) using the LinkedIn framework, plus the 1920×1080 and 1080×1350 versions of the picked thumbnail. Say the LinkedIn rules are adapted, not tested.
7. **Build.** Write `batch.json` (schema: `schemas/batch.schema.json`), then run:

   ```bash
   python3 <skill-dir>/scripts/package.py batch.json <out> [--vault <app>/public/thumbnails]
   ```

   It validates the batch, renders, checks titles, chapters, disclosure and LinkedIn (`CHECK:`), lists placeholders (`NOTE:`), and writes `board.html`.
8. **Inspect** every image and the board. Fix until no `CHECK:`, `SCHEMA:` or `WARNING` lines are left unexplained (`references/quality.md`).
9. **Deliver:**
   - the board;
   - the recommended title + thumbnail pair and the A/B set;
   - the description in one text box;
   - the LinkedIn posts;
   - the labelled files;
   - what's left to finish by hand.

   Log the package (`references/learning-loop.md`). The model answer is `examples/icp-buyer-research/`.

### Titles only

Headline framework steps 1–4. Give the 10 scored titles, the A/B set with character counts, and the thumbnail line each should pair with. No rendering unless asked.

### Description only

Use real timestamps or chapter times from the user; never guess them. Build to the description framework and house style. Run `package.py` on a batch containing the description to check chapters, disclosure and placeholders. Deliver in one copy-and-paste box.

## Create thumbnails

1. **Inputs:** the title or topic, the audience, the one promise. Optional: a face photo, brand, logos, real proof.
2. **Lines:** write 3–5 and keep the best 2–4 (thumbnail framework §4).
3. **Layouts:** choose from the decision tree (thumbnail framework §3, examples in `references/design/layouts.md`). Start from the matching entry in `examples/sample-spec.json`.
   - **Variety (every round is 16 from 4.0; objects-only rounds are checked with `scripts/hero/variety_check.py`, step 5).** Only a round with faces, **when Taylor has supplied phone photos**, uses this older face recipe (Taylor's rule from 27 Oct 2026): vary the ground (light and dark both present; the old "3 light + 2 dark" mix was for rounds of 5), the background (`bg_style`), the typeface and case (CAPS and not), the mark (underline, box, colour), and emoji vs no emoji, with one big face each **only when Taylor has supplied phone photos**; otherwise every slot is objects only (master rule 6). Start from `python3 <skill-dir>/scripts/variety.py plan brief.json spec.json` (Taylor's picks are slots 1 and 2), adapt the layouts by eye, and run `python3 <skill-dir>/scripts/variety.py check spec.json` until it shows 0 FAIL (`references/design/variety.md`). Use `stickers` for emoji, ? marks and extra faces.
4. **Face (only a phone photo Taylor supplied; master rule 6):** `python3 <skill-dir>/scripts/prep_face.py photo.jpg /abs/out/face.png [--phone-photo]`, then `"face": {"src": ...}`. Never pull a still from a video. With no supplied photo, go to step 5 (objects only) and say a phone photo is the biggest upgrade.
5. **No phone photo (the default for Pecuna, master rule 6): build to the objects-only standard.** Taylor approved it on 2 Nov 2026 ("I want them to look exactly like this"). Read `references/design/objects-only-standard.md`, copy the nearest spec from `examples/objects-only-2026-11/` or `examples/objects-only-2026-11-round2/`, change only the words (4 or fewer), the hero object and the logos, and make the three looks (bold dark, bold bright, on-brand; looks 1 and 3 share the words). Then:

   ```bash
   python3 <skill-dir>/scripts/hero/build_hero.py <work>/a.json <work>/b.json <work>/c.json <work>/out   # 1280x720 JPGs
   python3 <skill-dir>/scripts/hero/build_hero.py <work>/a.json <work>/out --size 1920x1080            # LinkedIn video cover
   ```

   **16 variations every round (4.0, Taylor's rule from 7 Nov 2026: "16 so we have plenty to choose from"):** build 16 thumbnails per round: all 8 layouts, each twice on two different grounds (one dark, one light), with 4–6 different lines spread across them, emoji on 20–50%, at least 4 fonts and 4 accents. Copy the slot table from `examples/think-16-2026-11/` (16 specs, one per slot) and change the words and heroes. Check with `variety_check.py` (it scales its limits to 16: each layout, ground or hero at most twice, each layout + ground pair once). Then make the numbered contact sheet and the 168 px strip:

   ```bash
   python3 <skill-dir>/scripts/hero/contact_sheet.py <work>/out <work>/Contact-sheet-16.jpg --title "<video title>" --strip <work>/Check-168px-16.png
   ```

   Deliver the contact sheet first; Taylor picks by number. The 16 are strong drafts; the 2–4 he picks get the polish pass (spacing, sizes, lighting), the feed mock beside the references, and the LinkedIn sizes.

   **Vary every round (3.3):** each thumbnail gets its own layout, ground and hero, from `references/design/objects-only-standard.md` §7 (8 layouts, 11 grounds, 12 type finishes, 3D colour blocks, hand-drawn circles and arrows, emoji stickers, 16 hero objects). Make 16 per round, from the slot table above (the 3.3 rule of 4 per video is replaced). Tag each spec with a `look` block and run `python3 <skill-dir>/scripts/hero/variety_check.py <work>/*.json --history <recent specs>` until it shows 0 FAIL. The worked example is `examples/think-variety-2026-11/`.

   Fix every `WARNING:` (a fifth word, the timestamp corner). Make the 168 px colour + greyscale strip and the feed mock beside the references (`examples/objects-only-2026-11/` has both). Never draw flat boxes: every element is lit, extruded and shadowed by the kit.
   - **5b. Other brands, or a flat `scene`:** use `scene` with one hero object (`references/design/scene-design.md` §2 pop recipe), start from `examples/read-their-mind-final.json`. For scenes neither renderer can draw, use `references/design/image-prompts.md` and `bg_image`.
6. **Render:**

   ```bash
   node <skill-dir>/scripts/render.cjs /abs/spec.json /abs/out
   ```

   This produces PNG or JPG files (`format`), any `canvas`, and `scale: 1.5` for 1920×1080. (Objects-only specs render with `scripts/hero/build_hero.py` instead; see step 5.)
7. **Check:** thumbnail framework §7 and `variety.py check` for rounds of 4+. Then score with §8 and recommend an A/B pair from different grounds or typefaces.
8. **Deliver:**
   - the images and feed preview;
   - for each one: layout, line, paired title and why it earns the click;
   - what to finish by hand.

### Sizes from one design

Get the 1280×720 approved first. Then:
- **1920×1080:** the same spec plus `scale: 1.5`;
- **1080×1350:** a re-laid-out copy with `canvas: {w:1080,h:1350}`, a "NEW VIDEO · N MIN" chip and a calm bottom;
- **link-preview check:** a resize to 1200×675 cropped to 627.

Name the files `YouTube-thumbnail-1280x720.jpg`, `LinkedIn-video-cover-1920x1080.jpg` and `LinkedIn-image-post-1080x1350.jpg`. Say which LinkedIn file goes with which kind of post (`references/platforms.md`).

## Track, Watch, Audit

The full procedures are in `references/workflows.md`:
- `scripts/track_channel.py` for any channel's thumbnails and outliers;
- `scripts/watch.py` for a competitor watchlist with breakout digests (confirm any schedule with the user first);
- `scripts/audit.py` for phone-size, squint and feed tests against a benchmark.

## Limits

- The research is a snapshot from 12 October 2026, based on public views. There's no CTR, search or link-click data, so description rules are medium confidence. The LinkedIn rules are untested.
- Platform sizes are third-party consensus (`references/platforms.md`).
- The renderer makes concepts and A/B candidates. Photo composites and photoreal scenes need an image model or a designer.
- It never uploads to YouTube or LinkedIn. It gives the user the files.

## Reference documents

| File | Read it when |
|---|---|
| `references/frameworks/thumbnail-framework.md` | making, judging or explaining any thumbnail (what makes a good one, method, decision tree, scorecard) |
| `references/frameworks/headline-framework.md` | writing, scoring or explaining titles (4 steps, formula library, worked example) |
| `references/frameworks/description-framework.md` | writing or explaining descriptions (each part and why) |
| `references/frameworks/linkedin-framework.md` | LinkedIn posts (hook, structure, native vs link) |
| `references/design/playbook.md` | the ten elements, copy rules, flops and checklist (the design standard) |
| `references/design/layouts.md` | choosing a layout; a rendered example of each |
| `references/design/variety.md` | every round of 4+ thumbnails: the six variety axes, the default 5-slot recipe, split testing, stickers and background presets |
| `references/design/objects-only-standard.md` | **the Pecuna look from 2 Nov 2026:** the 12 rules, all six approved thumbnails broken down layer by layer with coordinates and finishes, how to make a new one, which hero object acts out which promise, what was wrong before |
| `references/design/scene-design.md` | flat no-photo scenes for other brands, the pop recipe, the "Read their mind" case study (superseded for Pecuna by the objects-only standard) |
| `references/design/spec.md` | renderer fields and coordinates |
| `references/design/image-prompts.md` | scenes the renderer can't draw |
| `references/research/method.md` | who we researched, how, and the rubric for studying a creator |
| `references/research/nick-thumbnail-audit.md` | the original 320-thumbnail study of Nick Saraev |
| `references/research/overview.md` | the 20 research laws with evidence, confidence and what each feeds |
| `references/research/creators.md` | Nick, Sabri and Riley one by one; "in their style" recipes |
| `references/research/data/` | raw data (every upload, both teardowns) for checking figures |
| `references/brand/house-style.md` | Pecuna Factorem layout, copy and delivery rules |
| `references/brand/brand-profile.md` | Pecuna colours, fonts, logo, presenter |
| `references/brand/cta-library.md` | approved CTAs (PDF in `assets/cta/`) |
| `references/platforms.md` | sizes and rules per platform, with sources |
| `references/brief-template.md` | the packaging brief format |
| `references/learning-loop.md` | after publishing: CTR at 48 hours, retitling, logging |
| `references/quality.md` | gates before delivery; honest reporting |
| `references/workflows.md` | Track, Watch, Audit step by step |
| `references/whiteboard-wednesdays.md` | the app vault (`--vault`) |
| `references/troubleshooting.md` | known failures and fixes |

Scripts, schemas, tests and assets are listed in `README.md`. `START-HERE.md` has example prompts. `COVERAGE.md` maps every topic to its file.
