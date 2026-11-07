# Whiteboard Wednesdays app handoff (the vault)

Thumbnail Tracker feeds the Whiteboard Wednesdays app (repository `taylor585/Whiteboard-Wednesdays`). The app stores, reviews and copies packaging batches. **It doesn't generate them.**

## Why a vault, not generation in the app

Generating inside the app would call the Claude API, which charges per use. Taylor decided (October 2026) that "most of the time we will be doing it in here anyway". So Claude Code generates the batches with this skill, and the app is a **vault**: a Thumbnails page where batches are stored, reviewed, picked and copied.

## How a batch gets into the app

```bash
python3 <skill-dir>/scripts/package.py batch.json <out> --vault <app>/public/thumbnails
```

- This copies `batch.json` and the rendered images to `<app>/public/thumbnails/<YYYY-MM-DD>-<slug>/`.
- It updates `<app>/public/thumbnails/index.json` (id, title, created, counts of thumbnails, titles, descriptions and LinkedIn posts), which the Thumbnails page reads.
- Commit those files on a branch and open a pull request, following the repository's own `CLAUDE.md` for publishing. Never push to the default branch directly.

## Settings the skill reads

- `public/skills/thumbnail-tracker.json` in the app, if present: brand colours, face cut-out, style blend (which creator's formulas to lean on), batch size and description blocks.
- When it's absent, use `examples/brand-pecuna.json` for Pecuna Factorem, or ask.

## Planned app features (from the October 2026 design mock-ups)

These were planned in the app, not in this skill. They're recorded so the skill's outputs fit them:
- a Thumbnails tab;
- a settings cog where skills are added, each tied to a page;
- creator watchlist cards under the 7/14/30-day selector.

The vault format above is the contract between the two.
