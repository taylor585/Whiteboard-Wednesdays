# QA gates

The full verification checklist for Whiteboard Wednesdays work. `scripts/verify-trial.cjs` automates most of it for trials. The project's `verify.cjs` covers the live decks. Record a new defect class here when you find one.

## Before editing

- Confirm the deploying source tree (SKILL.md section 1).
- Record SHA-256 hashes of every file in the static directory and any approved trial. Compare after the final edit; any unexpected change blocks delivery.
- Check that the SKILL.md copies you were given match by hash before trusting a summary of them.

## Build-time gates (`build-trial.cjs` stops on failure)

- Unique slide IDs.
- One reveal entry per part; reveal groups start at 1 and are contiguous.
- Every slide has an audience `source` line starting "Source:".
- Variety rule: no consecutive repeated `kind`, and at least three kinds in a deck of three or more slides, unless listed in `repeatAllowed`.
- Every quotation passes `verifyQuotes` against the PDF.
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
| Quote altered by a single character | `verifyQuotes` at build time |

## Honest reporting

- State what ran: the number of checks, which widths, and which pages.
- State what did not run: physical iPhone or Safari, the hosted site, anything blocked by access.
- Never call your own inspection approval.
