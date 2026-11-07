# Variety pack: every round gives a real choice

Added in 3.1.0 (27 October 2026) at Taylor's request, after the "Motion Planning" round. That was the first round with light backgrounds, brand yellow, heavy condensed capitals, boxed words and emoji. Taylor's words: "we've never used some of these different variations before… I want this level of variety every single time: the design, headlines, typography, underscores, and emojis versus no emojis."

**Evidence level: house rule.** This rule is about giving Taylor real options and a real split test. It isn't a measured lift. The research behind it supports varying rather than templating: Nick's 62 near-identical template thumbnails had a 15K median against 66.5K for his varied era (`thumbnail-framework.md` §1 and §10). Which variation wins is decided by YouTube's Test & Compare, not by this file.

Rendered example: `assets/variety/_index.jpg`, made from `examples/variety-motion-planning.json` (planned from `examples/variety/brief.json`).

## 1. The six axes

Every round of 4 or more thumbnails varies all six. `scripts/variety.py check` enforces the checkable ones.

| Axis | Options | Rule for a round of 5 |
|---|---|---|
| **Ground** | light or dark | 3 light + 2 dark (Taylor: "a couple black, and mostly the other ones with lighter backgrounds"). FAIL if one is missing. |
| **Background** | `bg_style`: `paper-grid` (white + grid), `cream-grid`, `brand-yellow`, `flat`, `black-glow`, `black-spotlight`, or a `bg_image` | At least 3 different. Never two the same in a round of 5. |
| **Typeface** | `condensed` (Anton, heavy capitals), `sans` (Inter Tight 800), `marker` (Permanent Marker), `serif` (Fraunces), `hand` (Caveat), `mono` | At least 3 different. |
| **Case** | CAPS or Title/sentence case (`condensed` and `marker` are always capitals) | Both present. |
| **Mark** | `underline` (hand-drawn), `box` (knock-out word), `color` (one word in the accent), `strike` | At least 3 different. One mark per thumbnail. |
| **Emoji** | stickers with emoji, or none | Both present: about 3 with and 2 without. Emoji are a test variable, not a default. |

**Objects-only rounds (the default under master rule 6):** from 3.3, see `references/design/objects-only-standard.md` §7 and `scripts/hero/variety_check.py`. In short: the variety recipe is the standard's three looks per video, bold dark / bold bright / on-brand cream, with looks 1 and 3 sharing the words (`references/design/objects-only-standard.md` §1 rule 10). The five-slot face recipe below applies only when Taylor has supplied phone photos.

**Faces:** one big face per thumbnail, **only from phone photos Taylor supplied** (master rule 6: never a still from a video; with none supplied, every slot is objects only). Taylor, 27 Oct 2026: "you only need one picture of me… really big". Several faces are allowed in one wildcard only (`count: 6`). The checker warns if more than one thumbnail has several faces, and fails with `--strict`.

The line and the title rules don't change. The thumbnail line is 2–5 words, and no two thumbnails in a round share background, typeface and mark (the checker fails duplicates).

## 2. The default recipe (what the planner writes)

`python3 scripts/variety.py plan brief.json spec.json` writes these five from one line and one face, in the brand's palette (Pecuna Factorem by default):

| # | Ground | Background | Typeface and case | Mark | Emoji | Source |
|---|---|---|---|---|---|---|
| 1 | light | `paper-grid` (white + grid) | condensed CAPS | red underline | yes, plus red ? | **Taylor's pick** (MP1, "I really like the first one") |
| 2 | light | `brand-yellow` | sans Title case + punctuation ("???") | boxed word | yes | **Taylor's pick** (MP2, "I really like that yellow one") |
| 3 | light | `cream-grid` | marker CAPS + "?!" | red word (colour) | no, marks only | new |
| 4 | dark | `black-glow` | condensed CAPS | highlight box | no (clean) | new |
| 5 | dark | `black-spotlight` | serif Title case | gold underline | yes | from MP5 and the W4 winner's serif |

`mood` changes the stickers and punctuation: `confused` (🤯 😵‍💫, ?, ???), `bold` (🔥 🚀, !, !) or `calm` (👀 ✅, →, .). Pass `emojis` to override. `count: 6` adds the multi-face wildcard.

After planning, adjust by eye. Move a sticker that collides with a word, and nudge the headline box. Then **re-run `check`**, render, and look at every image and `_feed-preview.png` at 168px (master rule 3).

## 3. Split testing

- Pick two from **different grounds or different typefaces**, so the test teaches something. Taylor's first test (27 Oct 2026) was MP1 (white, condensed CAPS, underline) against MP2 (yellow, sans, box), both with one big face.
- Upload both, plus a third if wanted, to YouTube Studio → the video → Thumbnail → Test & Compare. It picks a winner on watch time.
- Log the winner and the axes it won on in `examples/packaging-log.csv`, so the next round's recipe leans on what worked (`learning-loop.md`).

## 4. Renderer tools added for this

Full fields are in `spec.md` (Background presets, Stickers).

- **`bg_style`:** background presets with brand-overridable colours (`bg_color`, `glow_color`, `glow_at`, `glow_opacity`). No more compositing backgrounds by hand.
- **`stickers`:** emoji (`type: emoji`, no bubble, soft shadow), punctuation marks (`type: mark`, any bundled font, optional outline for busy backgrounds) and extra face circles (`type: photo`). They work on **any** layout, not only `scene`.
- **Faces:** the main face is still `face` (`frame: "circle"`). For confused, sceptical or surprised looks, ask Taylor for phone photos of those expressions. **Never pull stills from the recording** (master rule 6). The planner writes the pose into the placeholder, so a missing photo says what to shoot.

## 5. Checks before showing a round

- [ ] `python3 scripts/variety.py check spec.json` shows 0 FAIL, and any WARN is explained.
- [ ] Every image and `_feed-preview.png` has been looked at, and each line reads at 168px.
- [ ] No sticker covers a word, the face's eyes or the timestamp corner (x 1150–1270, y 660–710).
- [ ] Emoji fit the video's tone. Don't put 🤯 on a calm how-to unless that's the test.
- [ ] In the hand-over, say which two you'd split test, and why.
