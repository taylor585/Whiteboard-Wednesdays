# Renderer spec (scripts/render.cjs)

```bash
node scripts/render.cjs spec.json out_dir
```

Output: `<id>.png` (1280×720) for each thumbnail, plus `_feed-preview.png` showing all of them at 360px (desktop feed) and 168px (phone feed) with their titles on a dark YouTube-style background.

A spec file is `{ "thumbnails": [ {...}, {...} ] }`. Fonts are bundled in `assets/fonts/` (`fonts.json` manifest, licences included) and load locally, so rendering works offline. Only logos from Simple Icons **13.21.0** (pinned, via jsDelivr, `si:` icons) need network access. Environment flags:
- `THUMB_OFFLINE=1` blocks all Google Fonts requests and never adds the fallback link;
- `THUMB_FONTS=google` uses Google Fonts only (for comparisons);
- `THUMB_SKIP_RENDER=1` makes the tests skip rendering.

If a bundled font file is missing, the renderer warns and falls back to Google Fonts. The renderer prints a `WARNING` for any logo or asset that fails to load. Read the output.

## Common fields

| Field | Values | Notes |
|---|---|---|
| `id` | string | File name. |
| `title` | string | The YouTube title. Shown under the thumbnail in the feed preview. |
| `archetype` | `verdict` `equation` `command` `proof` `syllabus` `marker` `versus` `social` `trend` `repo` `caption` `split` `quote` `scene` | Layout. |
| `theme` | `light` (grid) `cream` `dark` `purple` `green` `red` | Dark themes get an accent glow behind the subject. |
| `accent` | hex | One accent colour. Defaults to Claude orange `#D97757`. |
| `headline` | string, `\n` for line breaks | The thumbnail line. Auto-shrinks to fit its box. |
| `highlight` | string or list | Exact substring(s) of `headline` to mark. |
| `highlight_style` | `underline` `box` `color` `strike` | Hand-drawn underline is the default. |
| `font` | `sans` `marker` `mono` `condensed` `serif` `hand` | `sans` = Inter Tight 800 (default). `marker` = Permanent Marker caps. |
| `headline_size` | px | Starting size (default 130). Auto-fit then **grows** the line to fill its box (up to `headline_max`, default 190) or shrinks it to fit. A shorter line therefore renders bigger. |
| `headline_max` | px | Upper limit for the auto-grow. |
| `headline_box` | `{x,y,w,h}` | Override where the line sits. |
| `headline_align` | `left` `center` `right` | |
| `face` | `{src, side, width, height, pose, offset, drop, flip, cx}` or `null` | `src` = background-removed PNG from `scripts/prep_face.py`. Without `src`, a grey placeholder bust labelled with `pose` is drawn. `side`: `right` (default), `left`, `center` (`cx` sets the centre x). `width` sizes the placeholder bust, `height` sizes a real photo. `drop` pushes it down by N px (head peeking up), `flip` mirrors it so the eyes face the content. Set `"face": null` to drop the face from layouts that default to one. |
| `face.frame` | `"circle"` | Puts the face (photo or placeholder) in a ringed circle, for brands that frame the presenter that way. Set `cx`, `cy`, `d` (diameter), `ring` (colour), `ring_w`, `inset` (background inside the circle), `bust` (placeholder colour) and `ph` (placeholder name). |
| `canvas` | `{w, h}` | Canvas size in px (default 1280×720). Use `{w:1080,h:1350}` for a LinkedIn 4:5 post. Only `scene` places everything by coordinates; other layouts assume 16:9. |
| `scale` | number | Pixel density of the output: `1.5` on a 1280×720 canvas gives a 1920×1080 file (LinkedIn native video). |
| `format` | `"png"` (default) or `"jpg"` | JPG keeps big files under the 2MB limit; the renderer warns when a file is over 2MB. |
| `bg_image` | path or URL | Full-bleed background (e.g. a scene from an image model, see `references/design/image-prompts.md`). `bg_dim` 0–0.6 darkens it for text contrast. |
| `arrow` | `{from:[x,y], to:[x,y], bend, color, width}` or `false` | Hand-drawn curved arrow. `bend` ±0.2–0.5 sets the curve. |

## Icons

Used by `hero`, `rivals`, `items` and `icon`:
- `si:<slug>`: any logo in Simple Icons 13.21.0 (e.g. `si:claude`, `si:openai`, `si:meta`, `si:n8n`, `si:make`, `si:stripe`, `si:youtube`, `si:googlegemini`, `si:shopify`, `si:hubspot`). Check the slug at simpleicons.org. Use the company slug, not the product: ChatGPT is `si:openai` (`si:chatgpt` doesn't exist). A wrong or missing slug renders an empty tile and prints a WARNING. Newer brands (Higgsfield, many AI startups) aren't in Simple Icons at all: use `img:` with the official logo file from the brand's site or press kit, and use `glyph:<short text>` only as a stopgap (long words are unreadable at phone size).
- `img:<path or url>`: your own logo/image file.
- `glyph:<text>`: text or an emoji drawn in the tile, e.g. `glyph:/btw`, `glyph:$`, `glyph:🦀`.

Tile object: `{icon, color, fg, size, glow, crossed, label, x, y}`. `color` is the tile colour (use the brand colour), `crossed: true` adds the red X.

## Archetype fields

**verdict**: `hero` (tile), `rivals` (list of tiles, crossed by default), `burst` (true = light rays), `pedestal` (true = podium under the hero). With a `face`, the hero shifts left and the line aligns left.

**equation**: `items` (2–3 tiles), `ops` (operators between them, default `+`; e.g. `["+", "="]`). Use `"->"` for a hand-drawn arrow ("from this to that") and `""` for nothing. Also `tile_size`, `row_y`.

**command**: `icon` (string, or a tile object `{icon, color, fg}` to use the brand's own tile colour instead of the accent), `command` (e.g. `/routines`, auto-shrinks to fit), `chips` (up to 3 tags, one or two short words each). Face defaults to the right with an arrow pointing at the window.

**proof**: `proof: {type, items, title, value, blur, points, curve, label, label_pos}`
- `stripe`: `items` = amounts → stacked "You received a payment of …" notifications.
- `payments`: `items` = amounts → payments table with green "Succeeded" badges. `blur: true` blurs amounts.
- `bars`: `items` = `[{label, value}]` (percent) → benchmark bars, the first one is highlighted.
- `chart`: `title`, `value` → a revenue card. The line is drawn from `points` (the user's real series, any numbers, e.g. monthly totals). Without `points` there's no line, just the number. `curve: "illustrative"` draws a decorative rising line for mock-ups only. Never present that line as real data.
- `label` (handwritten note) and `label_pos` (CSS, e.g. `"left:470px;top:40px"`) can sit inside `proof` or at the top level. With a headline, the label defaults to below the card. Optional `arrow`.

**syllabus**: `board` (`whiteboard` default, or `terminal`), `headline` (board title), `items` (4–6 modules), `icon`, `command` (terminal only), `tag` (e.g. `"4 HOURS"`). `doodle_labels`: exactly 5 short words for the whiteboard system doodle, matched to the topic (e.g. `["PROMPT","AD","AUCTION","CLICK","SALE"]`). `doodle: false` removes it.

**marker**: big hand-lettered line on the left, face on the right. Add `hero` (a tile) to put an object under the line with an arrow. The playbook says text with no object underperforms, so use it unless the statement alone is the hook. `smear: true` adds a black brush band behind the first line (white text works best with `headline_color: "#fff"` in that case).

**versus** (money + guest): `guest` (`{src, pose}`, left side; placeholder says GUEST PHOTO), face on the right, `pill` (result badge such as `"$20K/Mo"`, bottom-left) with `pill_color`, `label` (handwritten note, e.g. `"ex-plumber"`) with an arrow at the guest. Optional `headline`. Only use real, permitted results and a guest who agreed to appear.

**social** (tweet or comment card): `card: {type: "tweet"|"comment", name, handle, avatar, text, stats, verified, border, dark, size, when}`. `text` is the hook in 2–5 words (it auto-fits). `stats` = up to 3 strings (replies, reposts, likes) for tweets. `border` adds a coloured frame (Nick used yellow). Use the user's own account or a clearly made-up one. Never fake a real person's post.

**trend** (hockey-stick curve): `headline`, `points` (2–4 stage labels along the curve, strings or `{label, t}`), `marker` (`{label, t}` "You are here" circle, `false` to hide), `icons` (tiles placed on the curve: `{icon, color, t}`), `curve_from`/`curve_to` colours. With a `face`, the face goes left and the curve right.

**repo** (GitHub-style header): `repo` (`"owner/name"`, the name is underlined), `stats` (2 strings, e.g. `["11.5k stars", "1.5k installs"]`). The face defaults to the bottom centre, pushed down so the head peeks up (shoot this photo looking up at the text).

**caption** (Sabri's caption bar): a centred face on a dark theme, and a `headline` of 2–4 words in condensed white caps across the bottom over a dark fade. `highlight` puts one word in a red box (`box_color` changes it). `label` is the handwritten proof note with an arrow at the head ("$300m in ad spend"); move it with `label_pos`, and set `label_color` for light themes. Real proof only.

**split** (before/after): `left` and `right` are `{icon, tile_color, label, color, big}`. `icon` draws a tile, `big` draws a big word or number instead (e.g. `"$0"` / `"$1M"`, `"DAY 7"` / `"DAY 30"`), `label` sits in a colour bar at the bottom, and `color` tints that half. The face is centred, with an arrow from left to right (`arrow: false` removes it).

**quote** (pinned quote card): `quote: {label, text, highlight, highlight_color, border, missed, w}`. `text` uses `\n` for line breaks; `highlight` colours one phrase (red for the problem); `missed` adds a small red missed-call mark with a label. The face defaults to a circle at bottom right. Real quotes only, with no names of private people.

**proof `card` type:** `proof: {type: "card", label_top, rank, name, value, value_label, x, y, rotate, border, rank_bg, value_bg}` draws a ranked report card (e.g. "#1 · Growth-stage med spas · 88% fit score").

**marker `chain`:** `chain: ["Quote", "Finding", "Creative"]` draws linked step tiles under the line. `chain_highlight` is the index to highlight; `chain_y` sets the vertical position.

**split extras:** a side can show `grid: {n, lit, caption}` (an ad-set grid with `lit` tiles glowing, e.g. "only a couple get spend") or `donut: [40, 25, 15]` (an objection or segment donut with a legend) instead of an icon.

**scene** (free placement, for thumbnails built from objects when there's no presenter photo; which objects to use and how to make them pop is in `references/design/scene-design.md`): `elements` is a list of objects, each with `x`, `y`, an optional `rotate` and `z`. The headline fields work as normal. Extra arrows go in `arrows: [...]`.
- `head`: line-art side profile `{w, fill, stroke, facing: "right"|"left", glow, icon_text}`. `glow` adds a lit "brain" disc; `icon_text` writes inside it (e.g. `"“ ”"` for "their words").
- `bubble`: thought bubble `{w, h, label, text, red, highlight, trail: [[x, y, size], ...], max}`. `trail` draws the rising dots from the head.
- `card`: ranked report card `{w, label_top, rank, name, name_size, value, value_size, value_label}`.
- `doc`: report page `{w, h, title, lines: [text | {tag, tag_bg, text, kind: "muted"}], highlight}`.
- `lens`: magnifying glass `{d, text, red, size, ring}`.
- `highlighter`: marker pen `{w, cap, tip}`.
- `sticky`: sticky note `{w, color, label, text}`.
- `chip`: pill label `{text, bg, fg, size, border, mono}`. `border` (e.g. `"3px solid #CB8E03"`) with `bg: "transparent"` and `mono: true` makes a rubber stamp.
- `glow`: soft light pool `{x, y, d, color, opacity}` (x, y = centre). Put it behind the hero object on a dark ground.
- `pin`: push pin `{x, y, color, size}` (x, y = centre).
- `string`: thread between two points `{from: [x, y], to: [x, y], sag, color, width}`, for pin-board "connecting the evidence" looks.
- `doc` extras: `dark: true` (charcoal page, cream text, brass title), `bg`, `highlight_bg` (use a translucent yellow on dark pages), and redacted lines `{kind: "redacted", tag, w}` (a black bar `w`% wide).
- `lens` extras: `bg` (any CSS background, e.g. a cream-to-yellow gradient), `fg`, `glow` (colour of a light halo around the ring).

Scene-level background options (any archetype): `bg_pattern: "dots"` with `bg_pattern_color`, `bg_pattern_opacity` and `bg_pattern_size`; `vignette: true` or a number in px darkens the edges. For a black ground use `theme: "dark"` with `theme_overrides: {bg: "#0A0908", glow: false}` and add your own `glow` element where you want the light.

Examples: `examples/read-their-mind.json` (thought bubble, report and lens, mind x-ray, plus LinkedIn 1920×1080 and 1080×1350) and `examples/read-their-mind-dark.json` (spotlight, research board, redacted dossier).

## Background presets (3.1, any layout)

`bg_style` replaces hand-made backgrounds. Colours come from the spec, so other brands keep their own palette. The defaults below are Pecuna Factorem's.

| `bg_style` | Looks like | Override with |
|---|---|---|
| `paper-grid` | white with a 40px grid | `bg_color` |
| `cream-grid` | warm off-white with a faint grid | `bg_color` |
| `brand-yellow` | flat #F6DF8C | `bg_color` |
| `flat` | flat white | `bg_color` |
| `black-glow` | near-black #0A0908, soft gold glow on the right | `bg_color`, `glow_color`, `glow_at` (CSS position, default `72% 45%`), `glow_opacity` |
| `black-spotlight` | near-black, stronger glow behind the face, vignette 200 | as above; `vignette` overrides |

A `bg_image` wins over `bg_style`. Use `theme: "dark"` with the black presets, so default text colours are light.

## Stickers (3.1, any layout)

`stickers` is a list drawn on top of any layout (z-index 9 unless `z` is set):

- `{type: "emoji", text, x, y, size, rotate}`: a colour emoji (Noto Color Emoji) with a soft shadow and no bubble. `x`/`y` are the top-left corner and `size` is the font size in px (90–120 reads well).
- `{type: "mark", text, x, y, size, color, rotate, font, outline, outline_w}`: big punctuation or a short symbol ("?", "!", "?!", "→"). `font` is `sans` (default), `cond`, `marker`, `serif` or `hand`. `outline` adds a stroke (e.g. `#FFFFFF`) where it overlaps a photo.
- `{type: "photo", src, cx, cy, d, ring, ring_w, inset, shadow}`: an extra face circle with the same fields as `face.frame: "circle"`. Taylor prefers one big face, so use extra faces in one wildcard per round at most (`references/design/variety.md`).

Stickers replace the old trick of using `chip` elements with a transparent background for emoji (chips carry a shadow bubble). `scripts/variety.py plan` writes stickers for you.

## Coordinates

The canvas is 1280×720. The face occupies roughly x 790–1280. YouTube's timestamp covers roughly x 1150–1270, y 660–710, so keep text and key objects out of that corner.

## Gotchas

- Underlines sit just below the text. On a two-line headline, an underline on line 1 can touch line 2. Mark a word on the last line, or use `highlight_style: "color"`.
- Dark brand colours (deep gold, navy) lose contrast on the `dark` theme. Use `light` or `cream`, or a brighter tint as the accent.
- `arrow.color` defaults to the theme ink (accent in `command`). Set it if you want the accent colour.
- Run scripts by absolute path (`node <skill-dir>/scripts/render.cjs <abs spec> <abs out>`). Relative image paths in a spec resolve from the working directory.
