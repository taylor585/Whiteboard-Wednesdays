# Whiteboard Wednesdays skill: changelog

## v1.1, 12 October 2026

Built from what the two private trials taught: the calibration trial and the device library trial (eight devices, four recording tools). Every v1.0 rule is kept. These changes add to it or sharpen it. v1.0 is recoverable from git (commit 99c0fab, SHA-256 928bbef357ad0cc8b2bd773460827a65abf107336fcef8f2d01d4ed466634d1a).

### New capabilities

- **Visual device library (new section 5A).** Eight tested devices: animated counts, quote wall, zoom into the source, words that morph, marker annotations, in-feed preview, tap the page and path animation. Each has its job, when to use it, a hard evidence rule, markup, motion, phone behaviour and tests, in `references/device-library.md`.
  *Why:* the approved deck used the same three moves (fade, arrow, highlight) throughout. The trial showed variety makes it "pop" without faking anything.
- **Recording tools (new section 5B).** Spotlight, pen, presenter view and a recording cue list for Subi Shots, in `references/recording-tools.md`.
  *Why:* Whiteboard Wednesdays are recorded, and the tools make that easier and the edit faster.
- **Reusable kit in `scripts/`:**
  - `device-kit.css` and `device-kit.js`: the devices and tools.
  - `source-tools.cjs`: quote proof, PDF highlights and zoom geometry.
  - `build-trial.cjs`: one-file trials.
  - `verify-trial.cjs`: generic browser checks.

  *Why:* future decks reuse tested code instead of rebuilding it.

### New rules

- **Variety rule (master rules, section 3).** No two consecutive slides use the same device, and a deck of three or more slides uses at least three. Exceptions are recorded in the slide map. The build enforces it.
- **Honest devices (master rules).** Every device shows real, sourced content and never decorates.
- **Proof of quotations (section 2).** Every quotation is checked against the PDF at build time; one changed character stops the build. Figures carry the page they came from.
- **Highlights from the PDF (section 2).** Highlights on page crops come from the PDF's own word coordinates, not hand placement. On phones, crop to the quote column.
- **Story order (section 3).** Depth, breadth, focus, transformation, asset, context, reasoning, journey, as a starting point.
- **Motion exceptions (section 8).** The 200ms baseline stays. Named exceptions where the movement carries meaning: zoom 600ms, feed scroll 700ms, counts 800ms, letters about 35ms apart, path marker about 700ms, marker strokes about 420ms.
- **Hotspot placement (section 8).** Hotspots go in clear space, never over the words they explain.

### Fixes to weaknesses found in the trials

1. **Source of truth (section 1):** confirm which tree deploys before editing. The repository was `dist` while the Mac copy was reported as Vinext `public/`.
2. **Trial location (sections 1 and 6):** trials are one file outside the static build directory, reuse the viewer verbatim and are never registered. The builder refuses to write inside `dist`.
3. **`source` versus `note` (section 9):** documented. Without `source`, the viewer showed presenter notes to the audience.
4. **Image checks (section 11):** assert the expected image count and no error fallback. A broken image used to pass vacuously.
5. **Screenshots (section 11):** scroll to the top before capturing, so sticky bars do not overlay content.
6. **No image tool (section 5):** use real page crops and retained assets, and say no new image was generated.
7. **Viewer logo path (section 9):** documented, and substituted by the builder.

Also found while building:
- Scope test selectors to `#canvas`.
- A private claude.ai page needs the `--artifact` build and an in-page reading view.

### Clarifications

- A new "Calibration or device trial" mode in section 1.
- `subi-shots` added to the specialist skills, as the consumer of the cue list.
- Reusing an approved asset does not require reloading the skill that made it, but never claim a skill was used if it was not loaded.
- Delivery (section 12): when the installed copy is on a machine this session cannot reach, give the copy steps and the new hash, and say installation is the user's to complete.

### Not changed

- The live site, its viewer (`dist/library.js`, `dist/whiteboard.css`), its register and both decks. Adding the devices and tools to the live viewer is a separate, approved step.
- Publishing rules, private access, brand defaults, logo gate, calibration gate and all v1.0 verification gates.

### Verification of this release

- Both trials rebuilt from the kit:
  - The original harnesses passed 250 (calibration) and 327 (devices) checks.
  - The new generic harness passed 199 and 480.
  - No runtime errors, at 375, 390, 768 and 1280px.
- Negative tests: one changed character in RED-008 stopped the build, and a repeated device stopped the build.
- All 30 files in `dist` are byte-identical before and after.
- Not tested: a physical iPhone or Safari.
