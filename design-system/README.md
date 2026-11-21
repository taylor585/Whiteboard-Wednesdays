# Whiteboard Wednesdays design system: Idea Cards

Chosen by Taylor on 21 November 2026: board 07 "Trading cards" ("Idea Cards") on the Video Ideas Board design canvas (https://claude.ai/artifact/1YVni6Cy3sj7RUwD1Rw8Cd, artboard `project/Cards.dc.html`). It replaces the Brass Rule system of 10 November 2026 on every app screen.

**The look in one line:** a white page, Rubik for everything, ink #1B1B1F, thick ink edges on round cards, hard offset shadows in a pastel, pastel numbered tiles, soft grey rows, spaced-caps eyebrows and dashed "+ add" placeholders. Playful but clean: no gradients, no emoji.

| File | What it is |
| --- | --- |
| `public/whiteboard.css` (top block) | **The source of truth.** Every `--ww-*` token the app screens use. Change a value there, never in a screen's stylesheet. |
| `public/cards.css` | The app base (buttons, fields, focus) and the shared components below, as `.ww-*` classes. Loaded straight after `whiteboard.css`. |
| `design-system/tokens.json` | The same tokens as data, with each one's CSS name, use and contrast. Keep it in step with `whiteboard.css`. |
| `design-system/reference.html` | A one-page visual reference. It loads the real `public/whiteboard.css` and `public/cards.css`, so it always shows the live tokens. Open it straight from the folder. |

## Colour

| Role | Token | Value | Contrast and rule |
| --- | --- | --- | --- |
| Page, cards | `--ww-surface` | #FFFFFF | |
| Ink | `--ww-ink` | #1B1B1F | 17.2:1 on white. Text, card and control edges, primary buttons, the focus ring. |
| Card body | `--ww-body-ink` | #46454F | 9.4:1 on white |
| Muted | `--ww-muted` | #5B5A57 | 6.9:1 on white, 6.2:1 on stage. Eyebrows, captions. |
| Faint | `--ww-faint` | #8C877E | 3.6:1. Small dashed edges only, never text. |
| Dash | `--ww-dash` | #B8B4AC | The "+ add" dashed edge (decoration; the label carries the meaning). |
| Stage | `--ww-stage` | #F4F2EE | Soft grey rows, empty tiles, today's cell, boards. Ink on stage 15.4:1. |
| Line | `--ww-line` | #E4E1DA | Dividers inside a card; decoration only. |
| Sky | `--ww-sky` | #7AD3FF | Hero shadow, tile 1, the accent bar. Ink on sky 10.3:1. |
| Pink | `--ww-pink` | #FFB4D2 | Tile 2. Ink on pink 10.4:1. |
| Mint | `--ww-mint` | #A8E6B4 | Tile 3, done. Ink on mint 12.0:1. |
| Sun | `--ww-sun` | #FFE27A | The NEW chip, the chosen state (always with an ink edge), posting. Ink on sun 13.4:1. |
| Washes | `--ww-sky-wash` … `--ww-sun-wash` | #E8F7FF, #FFEAF2, #E6F7EA, #FFF6D1 | Card art panels and soft fills. |
| Accent text | `--ww-accent-ink` | #0B5E8A | 7.0:1 on white. Text that must read as the accent. |
| Status | `--ww-success`, `--ww-warn` | #1E6B45, #9A3412 | Status lines only, with the diamond and the words. |

Rules: pastels are **fills and marks, never text** (each is under 2:1 on white). Ink reads on every pastel at 10:1 or more. The pastels are equal: run tiles sky → pink → mint → sun. The logo's marker band keeps its own #F6DF8C (`--ww-logo-band`). `--ww-gold` (#8B6002) is legacy, kept only for the Presentations wall's Caveat notes and gold tack.

## Type

Rubik (`public/ww-rubik.ttf`, variable 300 to 900, SIL OFL 1.1, licence beside it) for everything: headings, body, controls and labels. `--ww-font-mono` is kept as a token name for labels, dates and counts but now points at Rubik with tabular figures. Caveat stays on the Presentations wall and the Topics board's handwritten parts.

| Use | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Page title (`--ww-size-title`) | 34px on phones up to 46px | 800 | -0.02em |
| Hero card title | 28px, line-height 1.05 | 800 | -0.015em |
| Section heading (`--ww-size-h2`) | 26px | 800 | -0.015em |
| Small headings (`h3`, `h4`) | 20px, 18px | 700 | -0.01em |
| Row text | 18px | 500 | |
| Body (`--ww-size-body`) | 16px, line-height 1.5 | 400 | |
| Card text | 14px, line-height 1.45 | 400 | |
| Eyebrow (`--ww-size-eyebrow`) | 13px to 15px, caps | 700 | +0.12em |
| Label, date, count (`--ww-size-micro`) | 12px, caps | 700 | +0.12em. Never under 11px. |

## Shape, edges and depth

- **Radii:** cards 22px (`--ww-radius-card`), hero cards and boards 26px, rows and art panels 16px, media 14px, controls 12px, numbered tiles 10px, chips and pills 999px. Avatars and lamps stay round.
- **Edges:** cards 3px ink (`--ww-edge-card`), hero cards 4px (`--ww-edge-hero`), controls 2px ink (`--ww-edge-control`), placeholders 3px dashed #B8B4AC (`--ww-edge-dashed`). The tab bar and the calendar are headed by a 3px ink rule (`--ww-ledger`). Hairlines (`--ww-line`) only divide things inside a card.
- **Shadows:** hard offsets, never a blur. The hero card: 10px 10px 0 sky (`--ww-shadow-hero`), one per screen. A lifted, open or chosen card: 6px (`--ww-shadow-card`) in `--ww-pop`, which is sky unless a card sets it to pink, mint or sun.
- **Tilt:** a hero card sits at -2deg (`--ww-tilt`) and straightens on hover and focus. Nothing else tilts.

## Components (`public/cards.css`)

| Component | Class | Anatomy |
| --- | --- | --- |
| Card | `.ww-card` | White, 3px ink edge, 22px corners, 14px padding, 12px gap. `__top` (number and chip), `__art` (sky-wash panel, 16px corners), `__title` (28px 800), `__text` (14px body-ink), `__foot` (2px ink rule, 12px caps). |
| Hero card | `.ww-card.ww-card--hero` | 4px edge, 26px corners, 10px sky shadow, -2deg tilt. `--pink`, `--mint`, `--sun` change the pop colour; `--lift` adds the 6px shadow to an ordinary card. |
| Chip | `.ww-chip` | 999px pill, 12px caps 700, stage fill. `--new` (sun), `--sky`, `--pink`, `--mint`, `--line` (outlined). |
| Numbered tile | `.ww-tile` | 36px square, 10px corners, 800 figure. In a `.ww-rows` list the tiles run sky, pink, mint, sun. |
| Row | `.ww-rows > .ww-row` | Stage fill, 16px corners, 16px × 18px padding, tile + 18px 500 text. |
| Button | `.ww-btn`, `.ww-btn--primary` | 999px pill, 2px ink edge, 15px 700. Primary is ink with white text. Plain `<button>` on app screens gets a 2px ink edge and 12px corners from the base. |
| "+ add" | `.ww-add` | 3px dashed #B8B4AC, 22px corners, muted 16px 700 label that turns ink on hover. |
| Count | `.ww-count` | The "1 card in the deck" box: stage fill, 12px corners, 15px 500. |
| Tab | `.app-nav a` and the lane rows | Plain text tabs, 17px 500, muted; the current one 700 ink with a 4px rounded ink underline (drawn by `motion.css`). The bar sits on a 3px ink rule. No icon pills. |
| Eyebrow | `.ww-eyebrow`, `.micro` | 13px caps 700, +0.12em, muted. A page eyebrow is led by a 24 × 4px rounded sky bar. |
| Empty state | `.ww-empty` | A dashed card with one line and, when there is one, the next step. |
| Focus | every control | 3px ink outline, 3px offset. |

## What the rebrand did not touch

The logo's design (the L1 "Highlighter" lockup and marker band, the favicon mark, the official coin): only its type changed, to Rubik Regular over Rubik ExtraBold (`scripts/build-logo.py`). Also untouched: the per-deck brand profiles in `presentations.js`, the deck stylesheets, the deck player (its controls keep a 1px edge, 6px corners and their own faces through the `:where(#player,#chapters,#brand-dialog)` rules), the Vault thumbnails, and the wall's pinned covers and Caveat notes.

## Adding a screen

Use the tokens and the `.ww-*` components; do not invent colours, radii or shadows. One hero card per screen at most. Check 375, 390, 768 and 1280px, reduced motion, and that `document.documentElement.scrollWidth` equals `clientWidth`.
