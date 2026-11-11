# Whiteboard Wednesdays releases

## 2.0.0, 13 October 2026

Restructured as a complete, self-contained archive, modelled on the Subi Shots v2 layout, so the skill reproduces the approved quality on any machine.

- **Brand first, as the master rule.** Ask which brand each deck uses (Pecuna Factorem offered as the default) and wait. Record the user's answer with evidence and the deck ID. The builder refuses unconfirmed brands, brands confirmed for another deck, and colours below 4.5:1 contrast.
- **Everything bundled:**
  - a verbatim snapshot of the approved slide player, the official coin, the four fonts with licences, and three schemas
  - the full Cadre Crew worked example (real report, assets, specs, built output)
  - a test suite and a hash manifest
- **Thirteen focused references**, replacing one long file:
  - branding, visual language (why it looks premium), every layout in the live player, the eight devices with variations
  - motion and zooming in and out, assets and images, evidence, story structure, demonstration assets
  - recording tools, Subi Shots handoff, library and publishing, quality
- **Quality scorecard:**
  - Weights: evidence fidelity 25%, single idea 20%, visual craft 15%, motion 15%, phone readability 15%, brand fidelity 10%.
  - Target 85 with no dimension below 4.
- **New scripts:** `check-quotes.cjs`, `new-deck.cjs`, `doctor.cjs`, `package_skill.py` and `tests/run-tests.cjs`.
- **Builder changes:** a bundled-viewer fallback, `--brand` and `--out`, the brand gate, and refusal of unresolved TODO placeholders.
- **All v1.1 rules retained** and checked by a coverage script before release.

## 1.1.0, 12 October 2026

- Eight visual devices: animated counts, quote wall, zoom into the source, words that morph, marker annotations, in-feed preview, tap the page and path animation.
- Recording tools: spotlight, pen, presenter view and a recording cue list for Subi Shots.
- Variety rule, build-time quotation proof, PDF-coordinate highlights, motion exceptions, source-of-truth and trial-location rules, and new QA defect classes.
- Reusable device kit, trial builder and generic verifier.

## 1.0.0, 7 to 11 October 2026

The original method: master rules, evidence mapping, story before artwork, five simplicity passes, three-slide calibration, the Pecuna Factorem brand and logo gate, demonstration assets, reveal choreography, the shared library contract, publishing into the existing private Sites library, and verification gates.
