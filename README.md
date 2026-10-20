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

Open http://localhost:8862/#/library on that same machine. This shows all six presentations, the approved clean underline header, and the Creator watchlist and Topics layouts. Live video retrieval and saved topics require the full server below. No API key is needed for design work.

## Full application

Use Node.js 22.13 or newer. Prefer a checkout path without a colon.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sweet_shaman.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_topics.sql
npm run dev -- --port 8864
```

Open http://localhost:8864/#/library. The migration commands use local storage only. On Sites, the platform applies the files in `drizzle/` when the app is published; `0001_topics.sql` adds topics and copies any old saved ideas into them.

## Heading style

Use the Creator watchlist’s simple Instrument Sans heading style across the app: black, medium-weight page headings, with responsive sizing. Presentation titles and reading views use simple sans-serif headings; retain the Lead Gen Engine brand font and fonts demonstrated inside slide artwork.

## Where to edit

- `public/index.html`: application header, navigation, Creator watchlist and Topics markup.
- `public/library.css`, `public/library.js`: library styling, routing and presentation shell.
- `public/video-ideas.css`, `public/video-ideas.js`: Creator watchlist (design 2C: one row per creator that expands to its videos, with Save as topic).
- `public/topics.css`, `public/topics.js`: Topics tab (week strip and production line, built on PROCESS.md).
- `public/presentations.js`: presentation register.
- `public/whiteboard-content.js`, `public/lge-content.js`, `public/vb-content.js`, `public/ah-content.js`, `public/gv-content.js`: presentation content (paid ads, Lead Gen Engine, Vision Boards, AI Harnesses, Grok Voice).
- `public/vb.css`, `public/vb.js`, `public/ah.css`, `public/gv.css`: slide styles and behaviour scoped to the Vision Boards (`vb-`), AI Harnesses (`hc-`) and Grok Voice (`gv-`) decks.
- `public/`: all retained images, fonts, licences, reading views and PDF assets.
- `app/api/ideas/[[...path]]/route.ts`: server-side watchlist, refresh, topics and subtopics.
- `youtube-api.mjs`: YouTube Data API adapter.
- `db/schema.ts`, `drizzle/`: storage schema and migrations (generate new ones with `npm run db:generate`).
- `SKILL.md`: presentation authoring guidance.

`dist/` is generated build output. Do not edit it.

## Verification

```sh
node --test youtube-api.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Check all three navigation tabs and every presentation at 375, 390, 768 and 1280 pixel widths after design edits.

## YouTube status and credentials

The watchlist contains 42 creators selected from Taylor's subscriptions. The API integration is implemented but not yet connected or verified with live uploads. Google API enablement and credential approval remain pending. The layout works without credentials and reports that state honestly.

The production runtime needs a server-only `YOUTUBE_API_KEY` restricted to YouTube Data API v3. Never put a key, credential bundle, bypass token or real local database in this repository. Reusable credentials belong in the authorised encrypted vault and platform secret store. Do not enable billing or paid services.

## Publishing

GitHub is the shared editable source. A GitHub push does not publish the ChatGPT Sites app. Publishing requires the existing Sites deployment workflow and Taylor's launch approval. Preserve the existing project ID and private audience. Do not create a replacement site or change visibility to solve Claude access.
