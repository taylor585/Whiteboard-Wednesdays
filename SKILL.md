---
name: whiteboard-wednesdays
description: Ask which brand a deck uses first, then create, refine and publish evidence-led, image-led Whiteboard Wednesdays presentations with progressive whiteboard reveals, eight visual devices (animated counts, quote wall, zoom into the source, words that morph, marker annotations, in-feed preview, tap the page, path animation), recording tools (spotlight, pen, presenter view, recording cue list), proven quotations, exact branding, readable phone layouts and a shared private presentation library. Use for new decks, three-slide calibration trials, presentation revisions, making a deck more visual, varied or "pop", preparing a deck to record, viewer or survey repairs and adding approved decks to the existing Whiteboard Wednesdays site. Do not use for ordinary website redesigns, generic document summaries or installing unrelated skills. Produce PowerPoint only when explicitly requested, explaining which web interactions cannot transfer.
metadata:
  version: "2.0.0"
---

# Whiteboard Wednesdays

Turn the user's research and assets into a presentation that teaches one useful idea at a time, on a clean whiteboard, with real evidence shown exactly and finished examples shown large. The default deliverable is a working presentation with progressive reveals, source notes, a reading view and phone layouts. Before a full deck, deliver a private three-slide calibration trial. This skill includes working code in `scripts/`: build and test real pages rather than describing them.

## Master rule: brand comes first

**Before starting a deck, ask which brand it uses, and wait for the answer. Do not map sources, draft slides or build a trial until the brand is confirmed.** This applies to every new deck, including one that will obviously use the house brand.

Ask: "Before I start, which brand should this deck use? Pecuna Factorem is ready to go (white, ink #1C1A17, gold #8B6002, Caveat headings, the official coin), or send another brand's colours, fonts and official logo file."

Read `references/branding.md`. Record the answer in a brand profile with the user's actual words as evidence and this deck's ID in `decks`. `build-trial.cjs` refuses a deck without that confirmation. Never mark a profile confirmed yourself. If the user already answered for this deck in the conversation, use that answer without asking again. Client creative shown inside a deck keeps the client's own branding and needs no question.

## Master rules

- One useful idea at a time. Build a visual presentation, not a document pasted into slides.
- Preserve the user's approved wording, evidence, branding and design direction. Fix specific defects without replacing approved work.
- Read the source before writing. Exact quotations stay exact and are proven against the PDF. Keep quotation, interpretation, adapted copy and illustrative output visibly separate.
- Use the exact official logo, never a reconstruction, trace or typed substitute.
- Show finished, image-led examples with real readable copy, large enough to read. A description of an asset is not the asset.
- Vary the devices: no two consecutive slides with the same kind, and at least three kinds in a deck of three or more slides. Every device shows real, sourced content and never decorates.
- Run five simplicity passes, and obtain the three-slide approval checkpoint for a new deck or materially new direction.
- Deliver progressive reveals, source notes, a reading view and phone access. A localhost link is never cross-device delivery.
- Reuse the existing library. Preserve unrelated decks, stable links and the private audience. Never create one site per deck.
- Skill use does not authorise publication, spending, client contact or unrelated file changes. Honour the current request and folder permissions.
- Write British English without em dashes or double dashes in prose. Quotations and code keep their own characters.
- Verify in the actual destination. Distinguish source checks, browser emulation and physical devices. Never call your own review approval.

## Start

Use the directory containing this file as the skill root. Run `node scripts/doctor.cjs` (or `npm run doctor`). It checks Node, poppler-utils, Playwright and Chromium, and the bundled viewer, fonts and logo.

- **Inside the Whiteboard Wednesdays project**, run builds from the project root so the project's own `dist` viewer is used, matching what will present the deck.
- **Elsewhere**, the bundled snapshot in `viewer/` and `assets/` is used automatically, and the builder says which one it used.

Read `README.md` for commands. The worked example in `examples/cadre-crew/` is a complete, verified deck spec with its real sources: read it before writing a new one.

## Production workflow

0. **Brand.** Ask the brand question above and wait. Create the deck spec and an unconfirmed brand profile with `node scripts/new-deck.cjs <deck-id> <folder>`, then record the user's answer in the profile.
1. **Locate.** Choose the mode (new deck, trial, targeted revision, publish, plan or skill file) from `references/story-structure.md`. For an existing deck, confirm which source tree deploys before editing (`references/library-and-publishing.md`), and hash untouched files.
2. **Evidence.** Read the whole report and its rendered pages. Build the evidence map and prove every quotation with `scripts/check-quotes.cjs` or `source.verifyQuotes` in the spec. Give every figure its page. See `references/evidence.md`.
3. **Story.** Write the slide map: ID, takeaway, device, source, reveal order, note, asset. Apply the variety rule and run the five simplicity passes. See `references/story-structure.md`.
4. **Design.** For each slide, choose a layout (`references/layouts.md`) or device (`references/device-library.md`) by its single idea. Apply the house look (`references/visual-language.md`), the asset order of preference (`references/assets-and-images.md`) and the motion rules, including when and how to zoom (`references/motion-and-reveals.md`).
5. **Calibrate.** Build the three-slide trial with `node scripts/build-trial.cjs <spec>` and check it with `node scripts/verify-trial.cjs <spec> <url>` at 375, 390, 768 and 1280px. Inspect the screenshots yourself. Show it privately: a private claude.ai page (build with `--artifact`) or a private file, never the live site. Then **stop and wait for approval**.
6. **Build.** Expand to the full deck within the approved direction. Load the specialist skill whose craft each asset needs, and follow each asset with its method slide (`references/demonstration-assets.md`). Add the recording tools with `tools: true` when the deck will be recorded (`references/recording-tools.md`).
7. **Verify.** Run every gate in `references/quality.md`, look at every slide at desktop and phone size after fonts and motion settle, and score the deck on the quality scorecard. The target is 85 or more with no dimension below 4. Fix, then re-verify.
8. **Publish, only when authorised.** Follow the ten steps in `references/library-and-publishing.md`: one library, a stable ID, the register entry, tested bytes, rollback kept and private access unchanged.
9. **Deliver and learn.** Return the viewable deck first: the private trial link, or the live library and direct deck links. Then report briefly what is verified, what is unverified and what was not started. For a recording, hand the cue list to Subi Shots (`references/subi-shots-handoff.md`). Record new defect classes in `references/quality.md`.

## Defaults

- Pecuna Factorem when the user confirms it: white, ink, gold, Caveat headings, Instrument Sans body, IBM Plex Mono labels, the official coin.
- One idea per reveal, a reveal of about 200ms, and the approved longer motions only where the movement carries meaning.
- Real evidence first: the actual page, the retained asset, then a generated image only when it clarifies a concrete scene.
- Three to five word headlines; complete emails, scripts and evidence in readable panels.
- Phone layouts stack in story order. Nothing is scaled into microscopic text.
- Trials live outside the static build directory and are never registered.

## Boundaries

- Never publish, change access, contact a client or spend money without explicit authority for that action.
- Never create a separate site per deck or a filler deck in the library.
- Never invent quotations, figures, results, testimonials, report pages, logos or software attribution. A reference creator informs storytelling; do not claim to know their software.
- Never hand off localhost as the phone solution.
- The live site's viewer does not yet include the device kit. Adding it is a shared-viewer change needing approval and a regression run on every deck.
- A package is not an installation. Installing on another machine means copying the whole folder; verify it there with `npm run doctor`.

## Reference documents

- `references/branding.md`: the brand question, profiles and confirmation, Pecuna tokens, fonts, logo gate, other brands, previews.
- `references/visual-language.md`: why the look reads as premium, the building blocks, variations in how information is displayed.
- `references/layouts.md`: every slide layout the viewer supports, with live examples and reveal groupings.
- `references/device-library.md`: the eight devices, their evidence rules, markup, motion, tests and variations.
- `references/motion-and-reveals.md`: reveal choreography, timings, zooming in and out, connectors, full screen, reduced motion.
- `references/assets-and-images.md`: which assets to use, the example's real assets, image briefs, prompt pattern, checks.
- `references/evidence.md`: the evidence map, quotation proof, figures, highlights on real pages, labelling.
- `references/story-structure.md`: modes, slide map, variety rule, story order, research-to-asset sequence, five passes, calibration gate.
- `references/demonstration-assets.md`: ads, landing pages, emails, scripts, method slides, survey, vision board.
- `references/recording-tools.md`: spotlight, pen, presenter view, recording cues.
- `references/subi-shots-handoff.md`: passing a recorded presentation to Subi Shots.
- `references/library-and-publishing.md`: source of truth, register, content package, navigation, documents, publishing.
- `references/quality.md`: the quality scorecard, hard gates, defect classes and honest reporting.

## Scripts and data

- `scripts/build-trial.cjs`: builds a one-file trial. It validates brand, IDs, reveals, sources, placeholders and variety.
- `scripts/verify-trial.cjs`: the browser verifier.
- `scripts/check-quotes.cjs` and `scripts/source-tools.cjs`: quotation proof, PDF highlights and zoom geometry.
- `scripts/device-kit.css` and `scripts/device-kit.js`: the devices and recording tools.
- `scripts/new-deck.cjs`: starts a deck.
- `scripts/doctor.cjs`: checks this machine's dependencies.
- `scripts/package_skill.py`: builds the zip and its hash manifest.
- `schemas/`: brand profile, deck spec and register entry.
- `viewer/` and `assets/`: verbatim snapshots of the approved viewer, official coin, fonts and licences.
- `examples/`: the Pecuna brand profile, an unconfirmed template, the deck template and the Cadre Crew worked example with its built output.
- `tests/run-tests.cjs` (`npm test`): builds, quotation proof, negative tests and browser verification.

## Reminder: enforce always

Ask the brand first. One useful idea at a time. Read the source and prove every quotation. Keep quotations distinct from adaptations. Use the official logo. Vary the devices and keep each one honest. Run five simplicity passes. Obtain the three-slide checkpoint. Show finished assets large, not promises or prompts. Follow each asset with its method. Keep phone reading, reveals, source access and media cleanup working. Reuse the library and keep it private. Publish only within authority. Test the real destination and state limits honestly.
