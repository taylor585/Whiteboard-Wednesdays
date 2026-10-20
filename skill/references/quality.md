# Quality: the bar, the gates and honest reporting

Technical checks and editorial quality are separate. Passing every automated check does not prove a deck teaches well or looks premium, and a beautiful slide with one wrong word in a quote is a failure. This file defines both, and how to report them.

## The quality scorecard

Score every calibration and every finished deck, slide by slide where useful, 1 to 5 on each dimension, then weight:

| Dimension | Weight | 5 looks like |
| --- | --- | --- |
| Evidence fidelity | 25% | Every quote verbatim and proven, every figure with its page, every highlight on real words, illustrative work labelled |
| Clarity of the single idea | 20% | Each slide and each reveal carries one idea a first-time viewer gets at phone size |
| Visual craft | 15% | The habits in `visual-language.md`: white space, one gold accent, handwriting only for emphasis, real artefacts large |
| Motion and reveals | 15% | Every reveal has a reason, timings match `motion-and-reveals.md`, no motion without meaning |
| Phone readability | 15% | Stacked in story order, nothing microscopic, no overflow, touch targets 44px |
| Brand fidelity | 10% | Confirmed profile, exact logo, correct fonts, client creative in client branding |

Weighted score = sum of (score × weight) × 20, out of 100. **Target: 85 or more, no dimension below 4, and every hard gate below passed.** This is the house standard, not a measured property of any audience. Record the score with the evidence for each mark; never score your own work as approved by the user.

## Hard gates

The full verification checklist for Whiteboard Wednesdays work. `scripts/verify-trial.cjs` automates most of it for trials. The project's `verify.cjs` covers the live decks. Record a new defect class here when you find one.

## Before editing

- Confirm the deploying source tree (`library-and-publishing.md`).
- Record SHA-256 hashes of every file in the static directory and any approved trial. Compare after the final edit; any unexpected change blocks delivery.
- Check that the SKILL.md copies you were given match by hash before trusting a summary of them.

## Build-time gates (`build-trial.cjs` stops on failure)

- Unique slide IDs.
- One reveal entry per part; reveal groups start at 1 and are contiguous.
- Every slide has an audience `source` line starting "Source:".
- Variety rule: no consecutive repeated `kind`, and at least three kinds in a deck of three or more slides, unless listed in `repeatAllowed`.
- Every quotation passes `verifyQuotes` against the PDF.
- The deck's brand profile is confirmed by the user for this deck ID, and ink and accent reach 4.5:1 on the surface.
- No unresolved TODO placeholder anywhere in a slide.
- Trials are never written inside the static build directory.

## Content and evidence

- Every quotation exact; adapted copy labelled; public discussion never called a testimonial.
- Every figure has a page you opened.
- Highlights sit on the actual words, checked on screenshots at desktop and phone width.
- No presenter notes, build labels, placeholders or invented results visible on any slide.
- Official logo crisp and unaltered; fonts bundled with licences.

## Rendering (all four widths: 375, 390, 768, 1280px)

- Every reveal of every slide shows exactly the parts in its reveal group, with no horizontal overflow.
- The expected number of images per slide (count `<img` in the slide HTML) is decoded, and no `.asset-error` fallback appears.
- Pending parts are inert.
- Screenshots are taken after fonts load, after every revealed part reaches opacity 1 and after animations finish, scrolled to the top.
- Inspect the screenshots yourself. Automated checks did not catch any of these past defects:
  - a lifted quote overlapping its neighbours
  - an annotation loop crossing a headline
  - hotspots covering text
  - a headline breaking mid-word on phones
  - a blank band above a zoomed page

## Interaction

- Back, Replay, empty-canvas click, ArrowRight, ArrowLeft, Space.
- Notes open. Fullscreen entry, a reveal inside fullscreen and exit, keeping position.
- Browser Back and Forward, refresh, chapter selection, final slide returns to the library.
- Tab arrow keys never move slides.
- Missing slide ID shows the recovery message.
- Reading view opens in the page, shows every slide and part, and keys inside it never move slides.

## Devices and tools

- Run each present device's behaviour check (see the Tests line in `device-library.md`).
- Run each tool's checks at 1280 and 390px (see `recording-tools.md`).
- Interactive device parts are buttons and never advance the slide.

## Reduced motion

- Every slide shows complete at once. The zoom has no transition; counts show final values; strokes are drawn; no marker travels.

## Known defect classes (and the check that catches them)

| Defect | Check |
| --- | --- |
| Presenter notes shown under the slide | Every slide has `source`; assert the visible line starts "Source:" |
| Image check passes with no images | Assert the expected count and no `.asset-error` |
| Sticky tab bar over content in screenshots | Scroll to the top before capture |
| Reading-view parts counted as slide parts | Scope selectors to `#canvas` |
| Viewer logo 404 outside `dist` | Substitute the logo path, as `build-trial.cjs` does |
| Blob script blocked on private preview hosts | Build with `--artifact` (same-origin content file) |
| Query-string reading link unreachable on private hosts | Reading view opens within the page |
| Highlight drift from hand placement | `findHighlights` from PDF word coordinates |
| An assumed brand treated as approved | Brand gate: a user confirmation for this deck ID |
| Placeholder copy shipped | Build refuses TODO |
| Installed skill missing its references and scripts | Install the whole folder from the zip, then run `npm run doctor` |
| Quote altered by a single character | `verifyQuotes` at build time |

## Full interaction gate for the live library

Beyond what `verify-trial.cjs` covers, a deck going into the live library also needs:

- Library, tabs, chapter selector, canvas click, keyboard, Back, Replay, notes and final-slide return.
- Direct slide links in a fresh context, refresh, browser Back and Forward, missing and encoded IDs.
- Full-screen entry, slide change and exit keeping position, plus the full-window fallback where native full screen is unsupported.
- Reduced motion and the complete reading view. Hidden controls must not stay focusable.
- The actual PDF and campaign board: separate links, loading failure, retry, replay and media cleanup. Test blocked embeds and native PDF limits; a HEAD response does not prove a document renders.
- Survey incomplete, passing, review and DQ outcomes.
- A second, distinct deck injected only through the test harness, to prove independent answers, brands, preview settings and positions. Confirm it is absent from the production register and archive.
- Fresh-session published branding after a browser-only preview; tab focus never leaking into slide navigation.
- Missing content script, cover, logo and asset recovery.
- Runtime errors inspected, not only screenshots.
- Contrast on real rendered surfaces (buttons, gold labels, highlights) at 4.5:1 or more; visible focus indicators; touch targets at least 44px; colour never the only signal for qualification, active navigation or errors.

Use actual current content, not a toy slide. Reuse the project's `verify.cjs` for the live decks and extend it for changed behaviour. Historical test totals are not evidence for a new run.

## Content gate

- Every requested point maps to a slide or visible example, and asset and method pairs are in the intended order.
- Read every finished slide and example top to bottom: no internal build labels, placeholder copy, fake results or missing content.
- A broken or blank image is a defect, not a delivery caveat.
- Emails, scripts and page examples are complete and readable, never thumbnails hiding weak work.

## Hosted and independent gate

- Test the actual deployed files. If private QA intercepts browser requests, each same-origin fetch must carry the authorised header, or the test may receive a login page instead of the script; keep the header off other origins.
- Wait for the real embedded URL to load, not an initial blank frame.
- For a new viewer or a substantial structural change, get an independent read-only review when available and authorised. Review against the brief and concrete failure cases, fix findings and rerun regressions. A reviewer's opinion supplements browser evidence; neither replaces the other.
- Distinguish emulated widths from real Safari and iPhone testing, and say when physical devices were not tested. Keep the separate PDF link and full-window fallback usable; never assert every browser behaves identically for native PDF or full screen.

## Honest reporting

- State what ran: the number of checks, which widths, and which pages.
- State what did not run: physical iPhone or Safari, the hosted site, anything blocked by access.
- Never call your own inspection approval.
- Keep status short: verified complete, complete but unverified, and anything required that was not started.
- Never claim that a planned skill was built, a saved source was deployed or a skill was used when it was not loaded.
