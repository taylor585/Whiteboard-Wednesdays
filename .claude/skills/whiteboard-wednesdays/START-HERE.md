# Start using Whiteboard Wednesdays v2

Give the agent your research and assets and say:

> Use Whiteboard Wednesdays to turn this research into a presentation. Show me a three-slide calibration trial first, with real evidence, varied visual devices and progressive reveals, checked at phone and desktop sizes.

The agent must first ask **which brand the deck uses**, and wait for your answer. Pecuna Factorem is offered as the ready default: white, ink #1C1A17, gold #8B6002, Caveat headings and the official coin. Or supply another brand's colours, fonts and official logo. The build refuses to run until your answer is recorded for that deck, so the agent cannot assume it.

You do not need to plan slides, write prompts or mark animations. The skill reads the sources, proves every quotation against the PDF, maps the story, chooses layouts and devices, builds a private trial, tests it at four screen sizes and shows it to you. It then waits for your approval before building the full deck.

## Install on another computer

Unzip the archive somewhere durable. Copy the whole `whiteboard-wednesdays` folder (not just `SKILL.md`) into your skills directory:

```bash
cp -R whiteboard-wednesdays ~/.claude/skills/whiteboard-wednesdays     # Claude Code
cp -R whiteboard-wednesdays ~/.codex/skills/whiteboard-wednesdays      # Codex
cd ~/.claude/skills/whiteboard-wednesdays
npm install          # optional: Playwright, for browser verification
npm run doctor
```

Then start a new Claude Code or Codex session so it discovers the skill. The doctor command lists anything missing. `pdftotext`, `pdfinfo` and `pdftoppm` come from poppler-utils (`brew install poppler` on a Mac). Browser checks need Playwright's Chromium (`npx playwright install chromium`).

## Test the included example

```bash
npm test                      # builds both example trials, proves the quotes, runs the negative tests and browser checks
npm run demo                  # rebuilds examples/cadre-crew/output/*.html
```

Open `examples/cadre-crew/output/whiteboard-trial-devices.html` in a browser to see all eight devices and the recording tools, or `whiteboard-trial-calibration.html` for the three-slide calibration. Click empty slide space or press the right arrow to reveal.

The example uses real Cadre Crew research and illustrative, not launched, assets. **This archive contains client research**: share it only with people allowed to see it.

## Your first deck

```bash
node scripts/new-deck.cjs my-deck ~/decks/my-deck
```

This creates a starter deck spec and an unconfirmed brand file. Ask the agent to fill them from your sources. After you confirm the brand, it builds the trial with `scripts/build-trial.cjs` and verifies it with `scripts/verify-trial.cjs`.

See `BUILD-STATUS.md` for what has been verified and what has not.
