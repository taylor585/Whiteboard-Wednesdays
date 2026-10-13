# Branding first: required for every deck

Brand is the first decision, before sources are mapped or a single slide is drafted. This is the master rule. A deck that looks right but carries the wrong brand has to be rebuilt, and an assumed brand silently becomes "approved" if nobody asks.

## The question

Ask, in your first message about a new deck:

> Before I start, which brand should this deck use? Pecuna Factorem is ready to go: white background, ink #1C1A17, gold #8B6002, Caveat headings and the official coin. Or send another brand's colours, fonts and official logo file, and I'll set it up.

Wait for the answer. Silence is not agreement. A logo, a website or a previous deck can inform a proposal, but none of them is an approval on its own.

- If the user already answered for this deck in the current conversation, use that answer; do not ask again.
- For a new deck, ask even when the last deck used Pecuna Factorem. Offer it as the default: "Same Pecuna Factorem brand as last time?"
- If the user has no brand yet, propose two or three coherent directions using the bundled fonts, and wait for a choice.
- Client creative shown inside a deck (their ad, their landing page) always keeps the client's own branding. That is evidence, not the deck brand, and needs no question.

## Record the answer

The coding agent writes the profile; the user never edits JSON. Use `schemas/brand.schema.json`. `examples/brand-template.json` is an unconfirmed starting point, and `scripts/new-deck.cjs` creates one next to each new deck.

```json
{
  "name": "Pecuna Factorem",
  "surface": "#ffffff",
  "ink": "#1c1a17",
  "accent": "#8b6002",
  "font": "hand",
  "logo": "../assets/ww-coin.svg",
  "confirmation": {
    "confirmed": true,
    "by": "user",
    "at": "2026-10-13T09:30:00Z",
    "evidence": "Taylor replied 'Yes, Pecuna Factorem as usual' in the chat on 13 October 2026.",
    "decks": ["client-onboarding"]
  }
}
```

- `evidence` quotes or describes what the user actually said, and where. Never invent it.
- `decks` lists the deck IDs this answer covers. `build-trial.cjs` refuses any other deck, so a confirmation cannot leak into new work.
- Never set `confirmed` to true to get past the build gate. The gate exists to make you ask.
- `examples/pecuna-brand.json` is the real, confirmed profile for the paid ads deck and its two trials only.

The build also refuses ink or accent below 4.5:1 contrast on the surface. If a supplied brand fails, propose an accessible variant (usually a darker accent) and get agreement before using it.

Inspect the brand pack first: exact logo files, approved colourways, typefaces and usage limits, before making any visual. The Whiteboard Wednesdays site shell keeps its own look; each deck supplies its own published brand profile.

## Pecuna Factorem, the house brand

| Token | Value | Where it shows |
| --- | --- | --- |
| Surface | White `#FFFFFF` | Slide background. Never off-white or grey |
| Ink | `#1C1A17` | All text and the phone frame |
| Gold accent | `#8B6002` | The rule under every title, numbers, connectors, top and left borders, active tab, outlines |
| Evidence highlight | `#F6DF8C` with dark ink | Only on exact source words. Never a whole paragraph |
| Tint | Gold mixed 7% into white | Panels that need separating: creative stage, email body, document bar. Never a grey box |
| Line | Ink mixed 17% into white | Hairlines between rows |
| Muted | Ink mixed 75% into white | Section labels, captions, source lines |

Tint, line and muted are derived in `viewer/whiteboard.css` from the three brand colours, so another brand inherits a matching set automatically.

These are the verified tokens of this reference brand, not a universal recolouring rule. A supplied brand overrides them.

### Typefaces

| Role | Font | File | Use for |
| --- | --- | --- | --- |
| Heading (hand) | Caveat | `assets/ww-caveat.ttf` | Slide titles, statements, numbers, hand-drawn emphasis |
| Body | Instrument Sans | `assets/ww-body.ttf` | Evidence, emails, scripts, explanations, controls |
| Labels | IBM Plex Mono | `assets/ww-mono.ttf` | Section labels, sources, page references, uppercase micro text |
| Editorial alternative | Fraunces | `assets/ww-display.ttf` | Heading option `editorial` for a quieter, print-like deck |

All four are under the SIL Open Font Licence 1.1; their licence files sit beside them in `assets/` and must travel with them.

The brand's `font` token picks the heading face: `hand` (Caveat), `clean` (Instrument Sans) or `editorial` (Fraunces). These three tokens are aliases for the bundled fonts, not support for arbitrary font files. Handwriting is for teaching and emphasis only. Dense evidence, emails, scripts and controls always stay in body type so they read at phone size.

## Logo fidelity gate

- Use the exact official file. For Pecuna Factorem that is `assets/ww-coin.svg`, a vector. Never an AI reconstruction, a traced copy or typed initials.
- Inspect it at native size and at display size, comparing it with the approved original down to the tiny lettering: 88px in the deck header (76px on phones), 128px in the library heading, up to 220px on a logo slide.
- Preserve aspect ratio, clear space and the complete coin. No clipping, no text over it, no enlargement of a small raster.
- Do not redraw a raster logo as an invented vector. Recover a better official file or keep it within its usable size.
- Overlay the real logo on generated images in HTML or as a separate layer. Never ask an image model to draw it.
- A missing logo must leave the header readable and navigable, never collapsed or replaced with a different mark.

## Another brand

1. Collect hex colours, heading and body font names, and the official logo file. Map them to surface, ink and accent, and show the user any value you proposed.
2. If the heading font is one of the bundled three, set `font` to its token.
3. For a supplied typeface, bundle the licensed files under unique names (never overwrite `ww-*.ttf`) with their licence. Define a distinct font family. Add a backwards-compatible token mapping in the shared viewer, declare the token in the deck's profile and in any preview selector, and reset heading and body when leaving the deck. Test it against an unchanged Pecuna deck in both switching directions and in a fresh session. A font is only "saved" if the renderer actually loads it.
4. Never silently substitute a decorative font for a missing brand font. Pick a supported fallback and say so.
5. Check contrast on real rendered surfaces: buttons, gold labels and highlights, as well as body text.

## Published brand versus browser preview

The site's "Preview branding" dialog changes colours, logo and heading font in that browser only. It is labelled as a preview and is never a saved setting. A real brand change goes into the deck's published profile (its register entry), is committed to source, and is tested in a fresh session.
