# Whiteboard Wednesdays

Full editable source for the presentation library and Video ideas screen.

## Access from Claude

Repository: https://github.com/taylor585/Whiteboard-Wednesdays

Clone this repository into Claude Code, or select it in Claude's GitHub integration. This repository is public and needs no ChatGPT sign-in to read. A Claude chat that can only fetch web pages cannot necessarily execute or edit a repository; use Claude Code or a GitHub-connected coding environment for design changes.

The hosted ChatGPT Sites app remains owner-private. Localhost addresses only work on the computer running the preview. Neither address is needed to edit this source or run a separate preview.

## Design preview without installation

Run from the repository root:

```sh
python3 -m http.server 8862 --directory public
```

Open http://localhost:8862/#/library on that same machine. This shows both presentations, the approved clean underline header, and the Video ideas layout. Live video retrieval and saved ideas require the full server below. No API key is needed for design work.

## Full application

Use Node.js 22.13 or newer. Prefer a checkout path without a colon.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sweet_shaman.sql
npm run dev -- --port 8864
```

Open http://localhost:8864/#/library. The migration command uses local storage only.

## Where to edit

- `public/index.html`: application header, navigation and Video ideas markup.
- `public/library.css`, `public/library.js`: library styling, routing and presentation shell.
- `public/video-ideas.css`, `public/video-ideas.js`: creator watchlist interface.
- `public/presentations.js`: presentation register.
- `public/whiteboard-content.js`, `public/lge-content.js`: existing presentation content.
- `public/hc-content.js`, `public/hc.css`: AI Harnesses presentation and its deck-scoped styles. Rebuild `public/hc-reading.html` with `node build-hc-reading.cjs <path to the Harness Chassis Builder - No Schedules SKILL.md>`, which also proves every quotation against the skill.
- `public/`: all retained images, fonts, licences, reading views and PDF assets.
- `app/api/ideas/[[...path]]/route.ts`: server-side watchlist, refresh and saved ideas.
- `youtube-api.mjs`: YouTube Data API adapter.
- `db/schema.ts`, `drizzle/`: storage schema and migration.
- `SKILL.md`: presentation authoring guidance.

`dist/` is generated build output. Do not edit it.

## Verification

```sh
node --test youtube-api.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Check both navigation tabs and presentations at 375, 390, 768 and 1280 pixel widths after design edits.

Browser suites run against the static preview: `node verify-hc.cjs http://127.0.0.1:8862/` for AI Harnesses. `verify.cjs`, `verify-lge.cjs` and `verify-lge-prompt.cjs` read `dist/`; point a temporary `dist` symlink at `public` to run them against the preview. Set `PLAYWRIGHT_PATH` if Playwright is installed globally.

## YouTube status and credentials

The watchlist contains 42 creators selected from Taylor's subscriptions. The API integration is implemented but not yet connected or verified with live uploads. Google API enablement and credential approval remain pending. The layout works without credentials and reports that state honestly.

The production runtime needs a server-only `YOUTUBE_API_KEY` restricted to YouTube Data API v3. Never put a key, credential bundle, bypass token or real local database in this repository. Reusable credentials belong in the authorised encrypted vault and platform secret store. Do not enable billing or paid services.

## Publishing

GitHub is the shared editable source. A GitHub push does not publish the ChatGPT Sites app. Publishing requires the existing Sites deployment workflow and Taylor's launch approval. Preserve the existing project ID and private audience. Do not create a replacement site or change visibility to solve Claude access.
