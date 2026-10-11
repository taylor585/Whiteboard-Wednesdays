# Three-slide calibration trial, 11 October 2026

`whiteboard-trial-calibration.html` is a self-contained, unpublished trial for the three-slide approval checkpoint. It sits outside `dist`, so it is not part of the Sites static build. The live deck, register, viewer, assets and skill are unchanged. Rebuild it with `node build-trial-calibration.cjs`. Open `?view=reading` on the same file for the complete reading view.

The trial reuses `dist/library.js`, `dist/whiteboard.css` and `dist/library.css` verbatim. There is one runtime substitution: the viewer's default `ww-coin.svg` path points at the same coin bytes inlined in the file. Fonts and images are the bundled originals. Font licences remain in `dist/ww-*-license.txt`.

## Source state used

This GitHub checkout is the buildless `dist` source matching Sites version 5 (29 slides). The handover describes a later local Mac tree with `package.json`, `app/route.ts` and `public/`. That tree is not in this repository, so it was not inspected or used here. Reconcile the two before any change to the live deck.

SKILL.md here matches SHA-256 928bbef357ad0cc8b2bd773460827a65abf107336fcef8f2d01d4ed466634d1a.

## The three moments

| Slide | Live source | Change under trial |
| --- | --- | --- |
| The buyer comes first. | `opening` | The abstract "Their own words" card becomes the actual report page 13 row (RED-008), with yellow highlights placed from the PDF word coordinates. Question, then evidence, then conclusion. |
| Their words become the idea. | `creative`, `ad-copy` | Word-by-word mapping from the highlighted source words to the authored headline. The finished static is shown at up to 430px wide rather than 340px. |
| Who owns the next action? | `campaign`, `landing`, `email` | The single text rail becomes five reveals: busy-desk moment, AI answers, operator follows through, clinic handoff, then the answer. Each step has its own drawn SVG connector. |

All wording is retained from the live deck, the landing page prototype or the saved email. The RED-008 quotation was verified against `dist/ww-report.pdf` page 13 (r/MedSpa, public discussion). "No answer. Next clinic?" is labelled authored copy.

## Five simplicity passes

1. Meaning: one takeaway per slide. Buyer language comes first. Adaptation is traceable. A human owns the next action.
2. Structure: one teaching point per reveal. Presenter detail stays in notes. Each slide has a short audience-facing source line.
3. Visual: real evidence image instead of a described card. The large finished asset replaces the thumbnail. Connectors are editable SVG.
4. Sequence: source, transformation, output. Moment, then each owner in order.
5. Audience: the phone crop zooms to the quote column so the text stays readable. At 900px and below, the transformation stacks so the mapping and ad stay legible.

Retained deliberately: the complete quotation, the illustrative and not-launched labels, and "Scope depends on your systems."

## Verification

`verify-trial.cjs` (Chromium via Playwright) passed 246 checks with no runtime errors. It covers:

- every reveal state of all three slides at 375, 390, 768 and 1280px, with no horizontal overflow
- one decoded image per slide and no asset-error fallback
- inert pending parts and a rendered coin
- Back, Replay, empty-canvas click, ArrowRight, ArrowLeft and Space
- notes, fullscreen entry and exit with state preserved
- browser Back and Forward, refresh, and chapter selection
- returning to the library after the final slide
- tab arrow keys not advancing a slide
- missing-slide recovery
- reduced motion: complete slides with no animations
- reading view: all 11 parts, no overflow

Screenshots were captured after fonts loaded and transitions settled, then inspected at all four widths.

Not tested: physical iPhone or Safari, hosted delivery, or the live private site. Claude's environment has no authorised browser session for it.

## Skill weaknesses observed (proposed, not applied)

1. **Source of truth.** Section 9 and CLAUDE.md describe `dist` authoring, but the handover reports a Vinext `public/` tree locally. Proposed addition: before editing, confirm which tree deploys. Check `.openai/hosting.json` and the git remote and branch, and record any divergence between machines.
2. **Trial location.** The calibration gate does not say where a trial may live. Proposed addition: build trials as a self-contained file outside the static build directory, reusing the shared viewer verbatim and never registered.
3. **`source` field.** The content schema lists `note` but not `source`. The viewer prints `note` under the slide when `source` is absent, so presenter notes become audience-facing. Proposed addition: document `source` as the short audience line and `note` as presenter-only.
4. **False-pass image checks.** The viewer replaces a broken image with an error paragraph, so "all images decoded" can pass with zero images. Proposed gate: assert the expected image count per slide and the absence of `.asset-error`.
5. **Screenshot capture.** Full-page captures taken after clicking Next keep the scroll offset, so the sticky tabs bar overlays content. Proposed gate: scroll to the top before capturing.
6. **Evidence visuals.** Section 5 assumes an image-generation tool, and none was available here. Proposed addition: an actual report-page crop with highlights placed from PDF word coordinates (`pdftotext -bbox`) is an approved evidence visual. On phones, crop to the quote column instead of scaling the full row down.
7. **Viewer default logo.** `library.js` hard-codes `ww-coin.svg` relative to the page, so any page outside `dist` requests a missing file. Low priority for the live site. Note it for previews.
