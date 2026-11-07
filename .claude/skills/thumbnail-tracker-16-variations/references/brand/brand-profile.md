# Brand profile: Pecuna Factorem

The default brand for this skill's owner, Taylor Cunningham. The machine-readable version is `examples/brand-pecuna.json` (schema: `schemas/brand.schema.json`). For any other brand, ask for colours and fonts first, and don't reuse these.

| Role | Value | Use |
|---|---|---|
| Ground (light) | #F5EAD8 cream | default thumbnail background (`theme: "cream"`, `theme_overrides.bg`) |
| Ground (dark) | #0A0908 near-black | dark / pop versions (`theme: "dark"`, `glow: false`) |
| Ink | #1C1A17 | text on light grounds; the head and ink objects |
| Accent | #8B6002 brass | underline, chips and rings on light grounds |
| Accent (bright) | #CB8E03 bright brass | the accent on dark grounds; deep brass disappears on black |
| Highlight | #F6DF8C | evidence highlight, lens fill, sticky notes |
| Problem | red (#B3261E in renders) | the problem phrase ("Next clinic."), FEAR tags |
| Fix | green | the fix side of a split |
| Cream text on dark | #F5EAD8 | headlines on dark grounds |

**Typography:**
- Fraunces for headlines (`font: "serif"`);
- Instrument Sans for body;
- IBM Plex Mono for small labels (doc titles, chips with `mono: true`);
- all bundled in `assets/fonts/` with their licences.

**Logo:** the official logo mark only. Never redraw or recolour it, and never use a logo that implies an endorsement.

**Presenter:** Taylor Cunningham. **Master rule (2 Nov 2026): never use a photo of Taylor taken from a video** (no frames, screenshots, webcam stills or Reel grabs). Only photos he supplies from his phone, cut out with `scripts/prep_face.py`. With none supplied, use object-only scenes (`references/design/scene-design.md`) without asking.

**Voice and copy:**
- UK English.
- Real figures only.
- Never name a client ("a med spa client").
- Lines are taken from Taylor's own words where possible ("Read their mind.", "No answer. Next clinic.", "Diagnose before you write.", "AI doesn't know how to speak to humans.").
