# Whiteboard Wednesdays v2 build status

Version 2.0.0, built on 13 October 2026 in a cloud workspace, from the `claude/intelligent-ritchie-v73vdb` branch of the Whiteboard Wednesdays repository.

## Added in v2

- A brand-first master rule, with a build gate. A deck builds only with a brand profile the user confirmed for that deck ID; the profile records their actual words as evidence and passes a 4.5:1 contrast check.
- A complete, self-contained package in the Subi Shots layout:
  - start-here guide, README, changelog, build status and hash manifest
  - thirteen references, three schemas
  - a verbatim viewer snapshot, assets with licences, examples, tests and `agents/openai.yaml`
- New references written from the live player's actual styles and slides:
  - visual language (why it looks premium), every layout with live examples
  - motion and zoom rules, assets and images, evidence, story structure, demonstration assets
  - Subi Shots handoff, library and publishing, quality scorecard
- New scripts: doctor, quotation checker, deck starter, packager and a test suite. The builder gained the bundled-viewer fallback, `--brand`, `--out` and refusal of unresolved TODO placeholders.

## Verified in this environment

- **Doctor:** Node 22, poppler-utils, Python 3, Playwright and Chromium all present; bundled viewer, fonts and coin found.
- **`npm test`, 9 of 9 passed:**
  - Both worked examples built with the bundled viewer, and their output is byte-identical to the shipped reference pages.
  - All 10 bundled quotations are verbatim in the report.
  - The build refused an altered quotation, a repeated device, an unconfirmed brand and a brand confirmed for a different deck, writing nothing each time.
  - Browser verification passed 199 checks (calibration) and 480 checks (devices) at 375, 390, 768 and 1280px, with no runtime errors.
- **Byte-identical copies:** the bundled `viewer/` files, the coin, all four fonts, the report PDF and the example images match the live site's `dist/` originals.
- **Project-viewer builds:** inside the project, built with the project's own `dist` viewer, they are byte-identical to the bundled-viewer builds. The one exception is a presenter note naming the report's path.
- **Original regression harnesses:** 250 checks passed on the calibration trial and 327 on the device trial. One device check ("drawing clears on slide change") was intermittent: the harness read the drawing after the URL changed but before the slide redrew. It now waits for the new slide; the kit's behaviour was unchanged.
- **Documents:**
  - Every rule from v1.1 was found in the package by an 84-rule coverage check.
  - No em dashes, double dashes or US spellings in prose.
  - Every file path named in the documents exists.
- **Live site:** all 30 files in the live site's `dist/` are unchanged. Nothing was published and access was not changed.

The archive itself is verified after packaging: manifest hashes re-read from the zip, a fresh extraction tested in a clean folder with no project `dist`, and skill-creator validation. The results are recorded in the repository's `TRIAL-CALIBRATION.md` and in the release message.

## Not verified

- Physical iPhone and Safari behaviour. All browser checks used Chromium at emulated widths.
- The hosted site. This workspace cannot reach the private Sites deployment.
- The device kit and recording tools inside the live site's slide player; they are not added there yet.
- Installation on Taylor's Mac. The previously installed copy contained only `SKILL.md`, without its references or scripts. Install the whole folder.
- A new deck on a new subject built end to end with this version. The worked example is the paid ads deck.
