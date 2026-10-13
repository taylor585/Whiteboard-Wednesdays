# Whiteboard Wednesdays v2

An executable Claude Code and Codex skill for evidence-led, image-led presentations: a clean whiteboard, one gold accent, a teacher's handwriting, real evidence shown exactly, and progressive reveals. The agent supplies the editorial judgement. The scripts build one-file trial pages from the approved slide player, prove quotations against the source PDF, and test every reveal at four screen sizes.

## Brand before anything

The first step is always to ask which brand the deck uses. Pecuna Factorem is offered as the default; another brand needs its colours, fonts and official logo. The answer is recorded in a brand profile (`schemas/brand.schema.json`) with the user's words as evidence and the deck's ID. `build-trial.cjs` refuses any deck without that confirmation. See `references/branding.md`.

## Requirements

- Node 20 or newer
- poppler-utils (`pdftotext`, `pdfinfo`, `pdftoppm`) for quotation proof, highlights and page renders
- Playwright with Chromium, for browser verification (`npm install`; `npx playwright install chromium` if no browser is found; or set `PLAYWRIGHT_PATH` and `CHROMIUM_PATH`)
- Python 3, only to package the skill

Run `npm run doctor` to check.

## Commands

```bash
npm run doctor                                             # check this machine
node scripts/new-deck.cjs <deck-id> <folder>               # start a deck spec and an unconfirmed brand file
node scripts/check-quotes.cjs report.pdf quotes.json       # prove quotations (add --first N --last N)
node scripts/build-trial.cjs deck.cjs [--brand brand.json] [--out page.html] [--artifact OUT_DIR]
node scripts/verify-trial.cjs deck.cjs http://127.0.0.1:8000/page.html
npm test                                                   # the full self-test
npm run demo                                               # rebuild the worked example
npm run package                                            # build the zip and hash manifest into dist/
```

- `build-trial.cjs` uses the project's own `dist` viewer when run inside the Whiteboard Wednesdays project (or with `--dist`), and the bundled snapshot in `viewer/` and `assets/` anywhere else. It prints which.
- It validates the brand confirmation and contrast, unique IDs, reveal groups, audience source lines, the variety rule and unresolved TODO placeholders before writing, and refuses to write inside the static build directory.
- `--artifact` writes `index.html` and a same-origin `trial-content.js` for a private claude.ai page, where scripts built from blob URLs are blocked.
- `verify-trial.cjs` needs the page served over HTTP. Any static server works, for example `python3 -m http.server`.

## What is included

| Folder | Contents |
| --- | --- |
| `references/` | Thirteen guides: branding, visual language, layouts, devices, motion and zoom, assets and images, evidence, story structure, demonstration assets, recording tools, Subi Shots handoff, library and publishing, quality |
| `scripts/` | Builder, verifier, quotation checker, source tools, device kit, deck starter, doctor, packager |
| `schemas/` | Brand profile, deck spec, register entry |
| `viewer/` | Verbatim snapshot of the approved slide player (`library.js`, `whiteboard.css`, `library.css`) |
| `assets/` | The official Pecuna Factorem coin, four fonts and their licences |
| `examples/` | Pecuna brand profile, unconfirmed template, deck template, and the Cadre Crew worked example with its real report, assets, specs and built output |
| `tests/` | `run-tests.cjs` |
| `agents/` | `openai.yaml` for Codex |

## The worked example

`examples/cadre-crew/` holds two deck specs:
- `trial-calibration.cjs`: the three-slide calibration.
- `trial-devices.cjs`: all eight devices and the recording tools.

Beside them are the files they use: the 154-page ICP-Research-Radar report, page renders, the Cadre Crew ad, landing page and phone view. The built pages are in `output/`. The quotations are real public discussion quotes and are proven against the report on every build. The ad, landing page and email are illustrative and were never launched. The example contains client research, so share the archive accordingly.

## Live site boundaries

The live Whiteboard Wednesdays site is private, hosted on Sites (project ID in the project's `.openai/hosting.json`), and serves the `dist` folder. This skill never publishes, changes access or creates a new site on its own. The live slide player does not yet include the device kit or recording tools; adding them is a shared-viewer change that needs approval and a regression run on every deck.

## Licences

Caveat, Instrument Sans, IBM Plex Mono and Fraunces are under the SIL Open Font Licence 1.1; their licence texts are in `assets/`. The Pecuna Factorem coin is the client's own mark: use it only for Pecuna Factorem work. Playwright is Apache 2.0. The Cadre Crew report and assets belong to their owners and are included as a private worked example.
