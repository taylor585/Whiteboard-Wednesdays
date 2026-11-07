# The objects-only standard (approved 2 November 2026)

This is how every Pecuna Factorem thumbnail looks from now on when there's no phone photo of Taylor, which, under master rule 6, is the default. Taylor on the six that set it: *"These are much better… it's got the variation, everything's punchy, this is brilliant. I want them to look exactly like this."*

The six are in `examples/objects-only-2026-11/` (specs, JPGs, feed mock, 168 px check, before/after). They rebuild pixel-for-pixel with `scripts/hero/build_hero.py`, and `tests/test_hero.py` proves it. **Don't redesign the look. Copy the nearest example, change the words and the hero, keep everything else.**

## Contents

1. What makes it punchy (the rules)
2. The six, square inch by square inch
3. How to make a new one
4. Hero objects: which object acts out which promise
5. What was wrong before (don't repeat it)
6. The reference thumbnails this was built from
7. Variety: layouts, grounds, type, marks, stickers and the checker (3.3)
8. 16 variations per round (4.0)

## 1. What makes it punchy (the rules)

Every rule below is visible in all six. The numbers are at 1280×720.

| # | Rule | How it's done in the kit |
|---|---|---|
| 1 | **4 words or fewer,** in 2–3 stacked lines, filling 40–55% of the frame's height. The biggest word is the number or the verdict ("80%", "DONE.", "20,000"). | `text` layers; sizes 130–330 px; the schema rejects a fifth word. |
| 2 | **Type has dimension.** Gradient face (light at the top), bevel highlight on the top-left edges, extrusion to the bottom-right (dx .35, dy 1, depth 10–26 px), a thick dark outline on the bold set, a hard contact shadow and a soft 14 px-blur shadow. | `type3d()`; finishes in `palettes.TYPE`. |
| 3 | **One colour family plus one accent.** A1 dark red + white/red. A2 warm white + gold. A3 cream/ink + gold highlighter + one red word. B1 blue-black + gold + green. B2 cool grey + red. B3 cream/ink + gold. Never a second accent. | `studio` presets; finishes. |
| 4 | **Everything is lit.** A radial light pool (55%×65% ellipse) behind the hero; a 220 px inset vignette; 10% film grain over the whole frame; every object carries a bevel + specular highlight; dark-set objects also get a rim light from the top-right. | `studio()`, `page()`, filters `gloss`, `glossSoft`, `rim`. |
| 5 | **One hero object that acts out the words,** plus at most two supporting objects. The clock *is* the 2 hours. The gauge *is* 20→80. The empty headset *is* "no human". The handset *is* the calls. | `clock`, `gauge`, `headset`, `handset`; see §4. |
| 6 | **Logos are objects, not icons.** As tall as a line of type (120–340 px), extruded 14–24 px, glossy, sometimes tilted 5–8°. Codex = the OpenAI mark + the word "Codex". | `logo` layers; `palettes.LOGO`; `assets/logos/`. |
| 7 | **Objects sit on something.** On the bold set, an elliptical floor shadow under each object. On the on-brand set, the whiteboard ledge at y 585 and the objects rest on it. | `floor_shadow`, `ledge`. |
| 8 | **Depth of field.** Supporting objects that are far away are blurred 2–6 px (the call buttons in B1). | `blur` on `call_button`. |
| 9 | **The timestamp corner (x 1150–1270, y 660–710) is empty.** | `build_hero.py` warns; `test_hero.py` fails. |
| 10 | **Three looks per round:** bold dark, bold bright, on-brand cream. Looks 1 and 3 use the **same words**, so a Test & Compare between them measures style alone. | the naming: `-objects-dark`, `-objects-bright`, `-on-brand`. |
| 11 | **Every word is said in the video** or is on the current thumbnail. No faces (master rule 6). | brief + `test_no_face_layers`. |
| 12 | **It reads at 168 px and in greyscale.** | `check-168px.png`; make one for every round. |

The two type systems:

| | Bold set (looks 1 and 2) | On-brand set (look 3) |
|---|---|---|
| Face | Anton, caps, 130–330 px, letter-spacing 1 px, line-height .92 | Fraunces Black (900), caps, 128–170 px, letter-spacing −3 px |
| Finish | `white-outline`, `red-outline`, `gold`/`gold-outline`, `charcoal` | `ink-serif`, `red-serif` for one word |
| Extrusion | 10–26 px, dark sides, gloss on the face | 4 px, warm grey sides (`#bdb6a8→#cfc9bc`), no gloss, 18% shadow |
| Mark | the colour itself (gold or red) is the mark | a ragged highlighter stroke (`marker`, #F6DF8C, multiply, −1.2° tilt) behind the first line |

## 2. The six, square inch by square inch

Coordinates are at 1280×720; (x, y) for type is the baseline-left, for objects the centre. The 3×3 map says what sits in each ninth of the frame (TL, TC, TR / ML, MC, MR / BL, BC, BR).

### A1 · AI Harnesses · bold dark (`AI-Harnesses-A1-objects-dark`)

Paired title: "I Built an AI Harness So Claude Code Can Run for 24 Hours". Words: **2 HOURS. / NOTHING / DONE.**

| | Left | Centre | Right |
|---|---|---|---|
| Top | "2 HOURS." | light pool starts | Claude logo |
| Middle | "NOTHING" | alarm clock (bells) | clock face, red wedge |
| Bottom | "DONE." in red | clock feet | OpenAI logo; timestamp corner clear |

Layers, back to front:
1. **Backdrop** `dark-red`: base `#0e0807`, light `#7a2412` at (74%, 46%), so the glow sits behind the clock and logos, not the words. Vignette .55. Grain 10%.
2. **Claude logo** 230 px at (1135, 160), rotated 8°, `claude-terracotta` (face `#f39a74→#c4532c`, sides `#5e220f→#250c04`), extrusion 22, no floor shadow (it floats), rim light on.
3. **Alarm clock** r 160 at (890, 430), rotated −9°, black case, chrome bells and bezel, cream face, 60 ticks, red wedge from 12 to 2 (`elapsed_h: 2`), hour hand at 2, minute hand at 12, floor shadow under it, rim light on. This is the hero: two hours gone, nothing to show.
4. **OpenAI logo** 200 px at (1140, 520), rotated −6°, `chrome` (face white→`#8f96a1`), extrusion 18, floor shadow, rim light. It clears the timestamp corner (its bottom edge is at y 620, left edge x 1040; the mark's arm ends above 660).
5. **"2 HOURS."** Anton 170 px, baseline (46, 205), `white-outline`, extrusion 14.
6. **"NOTHING"** Anton 160 px, baseline (46, 385), `white-outline`, extrusion 14.
7. **"DONE."** Anton 170 px, baseline (46, 565), `red-outline` (face `#ff5a45→#c90f05`), extrusion 16. The red word is the verdict and the only red in the frame apart from the clock wedge, which rhymes with it.

Why it works: the words own the left half, the objects own the right half, and nothing crosses the middle. The light pool makes the clock the brightest object; the red wedge and the red "DONE." say the same thing twice, once in words and once in a picture.

### A2 · AI Harnesses · bold bright (`AI-Harnesses-A2-objects-bright`)

Words: **SAME AI. / 80%**

| | Left | Centre | Right |
|---|---|---|---|
| Top | "SAME AI." | light pool | gauge arc (red→green) |
| Middle | "80%" top | gauge arc, ghost needle at 20 | live needle at 80 |
| Bottom | "80%" bottom | Claude hub | gauge base; timestamp corner clear |

1. **Backdrop** `warm-white`: base `#d9d3c6`, light white at (62%, 38%). The vignette darkens the corners enough for the white outlines to read.
2. **Gauge** r 330 at (905, 500): a chrome half-dome, a near-white dial, a six-segment arc red→orange→amber→yellow→lime→green at r .8, ticks every 10, a ghost needle at 20 (45% grey), a black live needle at 80, a dark glossy hub cap. Floor shadow under the dome.
3. **Claude logo** 120 px at (905, 462), `claude-terracotta`, extrusion 10, no floor shadow: it sits on the hub, so the needle swings around Claude.
4. **"SAME AI."** Anton 160 px, baseline (50, 190), `charcoal` (face `#2c2c2c→#050505`, light grey sides), extrusion 10, 30% shadow. Dark type on a light ground needs no outline.
5. **"80%"** Anton 330 px, baseline (34, 600), `gold-outline` (face `#fff36b→#f5b400`, sides `#8a5200→#2a1700`, outline `#1a1100` 10 px), extrusion 26. The biggest thing in the frame, and the gold is the accent.

Why it works: "SAME AI." sets up the question, "80%" and the needle answer it, and the 20 is still there as a ghost, so the before-and-after is in one object.

### A3 · AI Harnesses · on-brand (`AI-Harnesses-A3-objects-on-brand`)

Words: **2 HOURS. / NOTHING / DONE.** (same as A1, on purpose)

| | Left | Centre | Right |
|---|---|---|---|
| Top | highlighter + "2 HOURS." | board | board |
| Middle | "NOTHING" | board | brass clock |
| Bottom | "DONE." in red | Claude + Codex keycaps on the ledge | clock on the ledge; timestamp corner clear |

1. **Backdrop** `cream-board`: base `#efe9dc`, light white at (40%, 30%), over `#FBF8F1`. A lit whiteboard, not a flat cream.
2. **Highlighter stroke** (44, 70) 520×128, #F6DF8C, multiply, ragged edges, tilted −1.2°, under the first line only.
3. **"2 HOURS."**, **"NOTHING"** Fraunces Black 136 px, baselines (56, 182) and (56, 330), `ink-serif` (face `#2a2826→#0e0d0c`, 4 px warm-grey extrusion, 18% shadow).
4. **"DONE."** 136 px, baseline (56, 478), `red-serif` (#B3261E).
5. **Ledge** at y 585: a lit aluminium tray (white→`#eceae4` top, `#b7b2a8` front, a 3 px highlight line), full width. Everything below rests on it.
6. **Brass alarm clock** r 140 at (1110, 355), rotated −6°, `brass` (case `#f0d58a→#8B6002`, pale bells), red 2-hour wedge.
7. **Claude keycap** 185 px at (675, 482), rotated −6°: a dished white cap on a grey skirt, the terracotta Claude mark at 50% of the cap, "Claude" in Fraunces 800 under it.
8. **Codex keycap** 185 px at (880, 492), rotated 5°, the OpenAI mark in ink, "Codex".

Why it works: same words as A1, so a Test & Compare between A1 and A3 measures the style alone. It's our brand (cream, ink, gold, Fraunces) at the reference thumbnails' scale, not the thin serif at 15% height we had before.

### B1 · Grok · bold dark (`Grok-B1-objects-dark`)

Paired title: "Grok Voice Will Replace Your Sales". Words: **20,000 / CALLS A DAY**

| | Left | Centre | Right |
|---|---|---|---|
| Top | "20,000" | blue halo | call button (blurred) |
| Middle | "20,000" / "CALLS A DAY" | Grok mark | call buttons |
| Bottom | "CALLS A DAY" | call button (blurred, far) | big call button; timestamp corner clear |

1. **Backdrop** `dark-blue`: base `#04060b`, light `#17345f` at (72%, 42%).
2. **Far call buttons** (depth of field): d 92 at (1195, 120) blur 2; d 70 at (700, 600) blur 6; d 78 at (1215, 470) blur 2. Glossy green discs (`#21c35a`) with a white handset glyph, each rotated differently.
3. **Grok mark** 340 px at (930, 330), rotated −6°, `grok-black-chrome` (face `#6b7484→#0b0d12`), extrusion 24, a blue glow `#2f8cff` at 75% with a white-blue core, rim light. The biggest logo in any of the six: Riley-sized.
4. **Near call buttons**: d 120 at (1080, 590) sharp; d 64 at (1150, 300) blur 2. Calls streaming out of Grok.
5. **"20,000"** Anton 215 px, baseline (40, 300), `gold-outline`, extrusion 22, rim light.
6. **"CALLS A DAY"** Anton 130 px, baseline (46, 470), `white-outline`, extrusion 12, rim light.

Why it works: a single huge lit logo on black is the Riley Brown recipe. The green buttons are the only other colour, they're small, and they're the subject (calls). The gold number is the proof.

### B2 · Grok · bold bright (`Grok-B2-objects-bright`)

Words: **70% / NO HUMAN.**

| | Left | Centre | Right |
|---|---|---|---|
| Top | "70%" | light pool | small Grok mark |
| Middle | "70%" / "NO HUMAN." | headset band | headset ear cup |
| Bottom | "NO HUMAN." | boom mic, red tip | floor shadow; timestamp corner clear |

1. **Backdrop** `cool-grey`: base `#b9bfc9`, light white at (70%, 30%): a spotlight on an empty desk.
2. **Headset** s 450 at (915, 395), rotated −8°: a glossy black band, two ear cups, a boom mic with a red tip, the Grok mark printed on the right cup. Nobody is wearing it, which is the point.
3. **Grok mark** 150 px at (1165, 120), `grok-graphite`, extrusion 14, no floor shadow.
4. **"70%"** Anton 300 px, baseline (40, 345), `red-outline`, extrusion 24.
5. **"NO HUMAN."** Anton 150 px, baseline (46, 545), `charcoal`, extrusion 10.

Why it works: the empty headset acts out "no human" without a face, and the red 70% is the only saturated colour.

### B3 · Grok · on-brand (`Grok-B3-objects-on-brand`)

Words: **20,000 / CALLS / A DAY.** (same as B1)

| | Left | Centre | Right |
|---|---|---|---|
| Top | highlighter + "20,000" | board | board |
| Middle | "CALLS" | board | handset |
| Bottom | "A DAY." | Grok keycap on the ledge | handset on the ledge, coiled cord; timestamp corner clear |

1. **Backdrop** `cream-board` over `#FBF8F1`.
2. **Highlighter stroke** (44, 82) 600×150.
3. **"20,000"** Fraunces Black 170 px, baseline (56, 214); **"CALLS"** 128 px at (56, 366); **"A DAY."** 128 px at (56, 500), all `ink-serif`.
4. **Ledge** at y 585.
5. **Coiled cord** from (1200, 515) to (1262, 600), 9 loops, ink, with a soft gloss. It runs off the bottom edge, so the handset is plugged in.
6. **Handset** w 400 at (1035, 455), rotated −6°, `ink` finish (face `#3a3631→#1C1A17`), extrusion 16, floor shadow.
7. **Grok keycap** 195 px at (735, 482), rotated −5°, ink mark, "Grok".

## 3. How to make a new one

1. **Read the brief.** The words (4 or fewer, said in the video), the paired title, and the one promise. No phone photo in the conversation means objects only; don't ask.
2. **Pick the hero** from §4. One object that acts out the words. At most two supporting objects (a logo, a keycap, a call button).
3. **Copy the nearest example spec** from `examples/objects-only-2026-11/`. Make three: `-objects-dark`, `-objects-bright`, `-on-brand`. Looks 1 and 3 share the words.
4. **Change only:** `id`, `title`, `words`, the `text` layers, the hero layer, and the logo files. Keep the studio preset, the finishes, the positions and the extrusion depths unless an object needs room.
5. **Build:** `python3 <skill-dir>/scripts/hero/build_hero.py a.json b.json c.json <out>`. Fix every `WARNING:` (fifth word, timestamp corner).
6. **Check:** the feed mock beside the reference thumbnails (`examples/objects-only-2026-11/feed-mock.jpg` shows how), a 168 px strip in colour and greyscale, and look at every image.
7. **Deliver:** the JPGs named `<Video>-<look>-YouTube-1280x720.jpg`, the feed mock, the check strip, one line per thumbnail (hero, words, title, why), and the headline log updated.
8. **Sizes:** `--size 1920x1080` for the LinkedIn video cover; add `layout_1080x1350` to the spec for the 4:5 post.

If the brief needs an object the kit doesn't have, add it to `scripts/hero/kit.py` as a function that returns an SVG layer, with a floor shadow, a gradient fill and the `gloss` filter, then register it in `build_hero.layer_html` and the schema. Don't draw flat shapes.

## 4. Hero objects: which object acts out which promise

| The promise is about… | Hero | Kit | Supporting |
|---|---|---|---|
| time wasted, deadlines, hours | alarm clock with the elapsed wedge | `clock` | the tool's logo |
| before → after, a percentage, effectiveness | gauge, ghost needle at before, live needle at after | `gauge` | the tool's logo on the hub |
| calls, phones, voice agents | handset (on-brand) or call buttons streaming (bold) | `handset`, `call_button`, `cord` | the voice tool's logo |
| no human, hands-off, automated | an empty headset | `headset` | logo on the ear cup |
| a tool or platform | its logo as the hero, Riley-sized (300+ px), with a glow | `logo` with `glow` | small objects of the job |
| choosing between tools | two keycaps side by side | `keycap` ×2 | a clock or gauge |
| a number of things (files, steps, parts) | the number as the hero word, 300+ px | `text` | a stack of keycaps or a clock |
| planning, storyboarding, motion, "before you build" | a film clapperboard with the tool's logo on the slate | `clapperboard` | `???` in red-outline type; the tool's keycap |
| seeing it before it's built, a demo, a walkthrough | a glossy phone playing the board (play button, scrubber) | `phone` | none: the phone carries it |
| a price, a cost, "£X a month" | a 3D price tag with the figure on it, or a gold coin stack | `price_tag`, `coin_stack` | the product's logo |
| an AI that does a person's job (rep, assistant, agent) | the product's logo wearing a headset (headset layer centred on the logo, s ≈ 1.85 × logo size) | `logo` + `headset` | none |

Objects we still need (add when a brief calls for them): a document stack, a stopwatch, a padlock, a magnifying glass (port the lens from `scene-design.md` into the kit).

**Round 2 examples (3 Nov 2026):** `examples/objects-only-2026-11-round2/`. Vision Boards ("How to Build an App With Claude (Without Rebuilds)"): V1 dark "MOTION PLANNING???" with a Claude clapperboard; V2 bright "BOARD IT FIRST." with a phone playing the board; V3 on-brand with the clapperboard and a Claude keycap on the ledge. Grok Bot ("How Good Is Grok Bot Really"): G1 dark "£752/MONTH AI SALES REP" with the Grok logo wearing a headset; G2 bright "£752 A MONTH" with a price tag and a coin stack; G3 on-brand with a Grok keycap and a brass coin stack.

## 5. What was wrong before (don't repeat it)

| Before (rounds 1–2, October 2026) | Why it failed | The standard |
|---|---|---|
| Flat colour blocks behind flat words ("80%" black on a yellow rectangle) | no light, no depth; "it looks so flat" | extruded, bevelled, lit type |
| A thin serif headline at ~15% of the frame's height | the smallest headline on the page | 40–55% of the height |
| Logos as 40 px chips in a corner | nobody could tell which tool the video was about | logos 120–340 px, as 3D objects |
| Benchmark cards, small labels, "SpaceX · Starlink" in italics | unreadable at 168 px, so it was clutter | 4 words, nothing small |
| Taylor's face in a circle in the bottom-right | covered by the timestamp; and master rule 6 | objects only; corner empty |
| Webcam frames pulled from the video | soft, badly lit; master rule 6 | never |
| A fine-detail clock and checklist on a flat cream ground | detail died at feed size | one hero object with bold shapes |

## 6. The reference thumbnails this was built from

Taylor's references (2 Nov 2026): Cole Gordon ("I'VE HIT $10M/yr 8 TIMES"; "MASTER EVERY OBJECTION"), Codie Sanchez ("STOP BEING BROKE") and Riley Brown ("NEW CHATGPT" with a giant lit OpenAI knot and a glossy blue mascot). What they share, and what the standard copies: 2–4 words in heavy narrow caps filling 40–55% of the height; one line on a solid colour block; logos as big as faces; at most three elements; one saturated accent; the thumbnail carries the emotion or number, the title carries the context.

Where the references use faces, the standard uses hero objects. If Taylor supplies phone photos, a face can take the hero's place on the bold set (big, cut out, at an edge) and the objects move to supporting roles. Nothing else changes.


## 7. Variety: layouts, grounds, type, marks, stickers and the checker (3.3)

Taylor, 7 Nov 2026: "How can we add more variety?" Rounds 1–2 all used one layout (words left, hero right), five grounds and two typefaces, so they looked like siblings. From 3.3 every round must vary, and `scripts/hero/variety_check.py` enforces it. The proof round is `examples/think-variety-2026-11/` ("How To Think With AI"): six thumbnails, six layouts, six grounds, four type styles, emoji on two.

### Layouts (every thumbnail in a round has its own)

| Layout | What it looks like | Use it when | Example |
|---|---|---|---|
| `words-left` | words in the left half, hero in the right | the default; a number or verdict to shout | A1, B1, V1, G1 |
| `centre-hero` | the hero object in the middle, words in a band across the bottom (Riley's "NEW CHATGPT") | one object says it all | T1: glowing bulb, "THINK FIRST." |
| `hero-dominant` | the hero fills ~60–70% of the frame and runs off the edge; 1–3 words | the object is striking on its own (brain, logo, clock) | T2: giant brain, "DON'T OUTSOURCE THINKING." |
| `versus` | two objects facing each other with a big VS (or arrow) between them; the losing one gets ❌, the winning one ✅ | comparisons, before/after, old way vs new way | T3: PROMPT bubble vs THINK bulb |
| `words-on-object` | the words are printed on the hero (a speech bubble, a price tag, a screen, a clock face) | the object can "say" the line | T4: Claude asks "WHAT DO YOU THINK?" |
| `stacked-centre` | big centred words, small objects orbiting them in the corners | an idea with several parts; no single hero | T5: "AI THINKS. YOU DECIDE." |
| `diagonal` | words and hero tilted along a diagonal (−6° to −12°) | energy, urgency (build it when a brief needs it) | — |
| `on-brand-ledge` | cream whiteboard, Fraunces, objects on the ledge | the on-brand look in every round | A3, B3, V3, G3, T6 |

### Grounds (11 studio presets)

`dark-red`, `dark-blue`, `dark-purple`, `dark-green` (dark set); `warm-white`, `cool-grey`, `sky` (bright set); `brand-yellow` (our old yellow, kept for recognition), `hot-orange` (loud); `cream-board`, `paper-grid` + `dot_grid` layer (on-brand and paper). No two in a round.

### Type styles (finishes)

| Finish | Face | Use |
|---|---|---|
| `white-outline`, `red-outline`, `gold`, `gold-outline`, `green-outline`, `purple-glow`, `charcoal` | Anton caps, extruded | the bold set |
| `black-sans`, `white-sans` | Inter Tight Black, extruded | a cleaner, modern look (T2, and inside speech bubbles) |
| `ink-serif`, `red-serif` | Fraunces Black | on-brand |
| `marker-red` | Permanent Marker | a handwritten note; use sparingly |

At least 3 different type styles per round of 4+.

### Marks (how one word is singled out)

- `block3d`: a lit, extruded colour block behind one word (Cole Gordon's red box with depth). T2 red, T5 blue.
- `circle_mark`: a hand-drawn marker ring around a word (T6). Make `rx` ≈ half the word's width + 30 px.
- `arrow_mark`: a hand-drawn curved arrow, with an optional Caveat note at its tail. Never route it across words.
- `marker`: the highlighter stroke (on-brand).
- the colour of the word itself (gold or red on the bold set).

### Stickers

`emoji` layers: Noto Color Emoji with a white die-cut edge, a drop shadow and a slight tilt. Good ones: 🤯 😱 🤔 🔥 ✅ ❌ 👀 ⚠️. One or two per thumbnail, and only on some thumbnails in a round (the checker fails "all" or "none" in rounds of 5+). They aren't words, but they must not cover a word or sit in the timestamp corner.

### Hero objects added in 3.3

`lightbulb` (an idea; optional logo as the filament), `brain` (thinking), `speech_bubble` (the AI speaks; words or a logo inside). With 3.2.1's clapperboard, phone, coin stack and price tag, the kit has 16 hero objects.

### The variety checker

```bash
python3 <skill-dir>/scripts/hero/variety_check.py <work>/*.json --history <last published specs>
```

Every spec needs a `look` block: `{"layout", "ground", "font", "accent", "hero", "emoji"}`.
- **FAIL:** two thumbnails share a layout, a ground or a hero; fewer than 3 fonts or 3 accents in a round of 4+; emoji on all or none in a round of 5+.
- **WARN:** a thumbnail repeats the layout *and* ground of a recent published one (`--history`); no wildcard layout in the round.

### Round recipe (3.3)

For each video, make **4**: bold dark, bold bright, on-brand (looks 1 and 3 share the words, as before), plus **one wildcard** in a layout and ground the other three don't use. For a single-headline test like "How To Think With AI", make **6**, one per layout.


## 8. 16 variations per round (4.0)

Taylor, 7 Nov 2026: "how many can we get every time? 16? so we have plenty to choose from?" From 4.0 every round is **16 thumbnails**. Worked example: `examples/think-16-2026-11/` ("How To Think With AI"), with `Contact-sheet-16.jpg` and `Check-168px-16.png`.

**The slot table** (copy it; change words and heroes):

| # | Layout | Ground | Type | Emoji |
|---|---|---|---|---|
| 1 | centre-hero | dark-purple | Anton | |
| 2 | centre-hero | hot-orange | Inter Tight | ✓ |
| 3 | hero-dominant | brand-yellow | Inter Tight + 3D block | |
| 4 | hero-dominant | dark-blue | Anton | |
| 5 | versus | sky | Anton | ✓ |
| 6 | versus | dark-red | Inter Tight in bubble | ✓ |
| 7 | words-on-object | dark-green | Inter Tight in bubble | |
| 8 | words-on-object | warm-white | Inter Tight in bubble | |
| 9 | stacked-centre | paper-grid | Anton + 3D block | ✓ |
| 10 | stacked-centre | cool-grey | Anton + 3D block | ✓ |
| 11 | diagonal | brand-yellow | Inter Tight, tilted −8° | |
| 12 | diagonal | dark-purple | Anton, tilted −7° | |
| 13 | on-brand-ledge | cream-board | Fraunces + hand-drawn circle | |
| 14 | on-brand-ledge | paper-grid | Fraunces + hand-drawn circle | |
| 15 | words-left | dark-green | Anton | |
| 16 | words-left | sky | Inter Tight + 3D block | ✓ |

**Lines:** write 4–6 (the checker fails fewer than 4) and spread them so each appears 2–4 times in different looks. "How To Think With AI" used 11.

**Rules the checker applies to 16:** each layout, ground and hero at most twice; each layout + ground pair once; at least 4 fonts and 4 accents; emoji on 20–50%.

**Process:** build all 16 → `variety_check.py` 0 FAIL → `contact_sheet.py` → look at every one → fix anything crowded (words under objects, overflowing blocks, the timestamp corner) → deliver the sheet → Taylor picks by number → polish the picks → feed mock + LinkedIn sizes.
