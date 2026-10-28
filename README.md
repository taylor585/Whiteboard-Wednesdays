# Whiteboard Wednesdays

Full editable source for the presentation library and Video ideas screen.

## Access from Claude

Repository: https://github.com/taylor585/Whiteboard-Wednesdays

Clone this repository into Claude Code, or select it in Claude's GitHub integration. This repository is public and needs no ChatGPT sign-in to read. A Claude chat that can only fetch web pages cannot necessarily execute or edit a repository; use Claude Code or a GitHub-connected coding environment for design changes.

The app Taylor uses is the private Claude artifact https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea (since 24 October 2026; the ChatGPT Sites app is retired). Localhost addresses only work on the computer running the preview. Neither address is needed to edit this source or run a separate preview.

## Design preview without installation

Run from the repository root:

```sh
python3 -m http.server 8862 --directory public
```

Open http://localhost:8862/#/library on that same machine. This shows all eight presentations, the approved clean underline header, and the Creator watchlist, Topics and Schedule layouts. Live video retrieval and saved topics require the full server below. No API key is needed for design work.

## Full application

Use Node.js 22.13 or newer. Prefer a checkout path without a colon.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sweet_shaman.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_topics.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_topic_deck.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_creator_note.sql
npm run dev -- --port 8864
```

Open http://localhost:8864/#/library. The migration commands use local storage only. On Sites, the platform applies the files in `drizzle/` when the app is published; `0001_topics.sql` adds topics and copies any old saved ideas into them.

## Heading style

Use the Creator watchlist’s simple Instrument Sans heading style across the app: black, medium-weight page headings, with responsive sizing. Presentation titles and reading views use simple sans-serif headings; retain the Lead Gen Engine brand font and fonts demonstrated inside slide artwork.

## Where to edit

- `public/index.html`: application header, navigation, Creator watchlist, Topics, Schedule and Post markup.
- `public/library.css`, `public/library.js`: library styling, routing and presentation shell.
- `public/video-ideas.css`, `public/video-ideas.js`: Creator watchlist (`#/watchlist`), the upload inbox (Taylor's pick W2-B, 26 October 2026): creators by name, uploads grouped by week, Spark a topic, Seen (kept in this browser only) and the Topics tray.
- `public/brainstorm.css`, `public/brainstorm.js`: Topics tab (`#/topics`), creators and ideas (Taylor's pick BC, 26 October 2026): the creator database with a profile and private note, then Sparks, Shortlist, Recording schedule and Posting schedule side by side.
- `public/creator.css`, `public/creator.js`: creator page (`#/creator/@handle`, Taylor's pick C-A): channel banner, upload rhythm, latest uploads with Spark a topic, and the private note. Stats only come from stored uploads.
- `public/topics.css`, `public/topics.js`: Schedule tab (`#/schedule`, renamed from Post & Record on 28 October 2026), a four-week recording and posting timeline with calendar-lens filters (Taylor's picks S-C and P-C, 26 October 2026), the topic panel and the not-scheduled list, built on PROCESS.md.
- `public/post.css`, `public/post.js`: Post tab (`#/post`, Taylor's pick P-A, 28 October 2026). Upload the YouTube, LinkedIn and Instagram videos (they stay on the device), then show the posts and thumbnails saved in `public/post-packages.json`: each platform with its video, title, checked caption, hashtags and Copy, a five-thumbnail variety round with winner bubbles and a 1280×720 PNG download, the skills cog and Post all (a review and download; nothing is posted).
- `public/post-packages.json`, `scripts/build-post-package.py`: the post vault. Claude Code writes each video's posts with Performance Poster and plans its thumbnails with Thumbnail Tracker, then runs `SKILLS_DIR=<skills folder> python3 scripts/build-post-package.py <work folder> public/post-packages.json`, which stores the checker's own counts. The app never generates or posts on its own.
- `public/ww-store.js`: when the app runs as a Claude artifact with no server, topics and creator notes are saved in the artifact's own database (collections `topics` and `creatorNotes`).
- `public/presentations.js`: presentation register.
- `public/whiteboard-content.js`, `public/lge-content.js`, `public/vb-content.js`, `public/ah-content.js`, `public/gv-content.js`: presentation content (paid ads, Lead Gen Engine, Vision Boards, AI Harnesses, Grok Voice).
- `public/vb.css`, `public/vb.js`, `public/ah.css`, `public/gv.css`: slide styles and behaviour scoped to the Vision Boards (`vb-`), AI Harnesses (`hc-`) and Grok Voice (`gv-`) decks.
- `public/gb-content.js`, `public/gb.css`, `public/gb.js`, `public/gb-reading.html`: the How Powerful Is Grok Bot Really? deck (`gb-`), ported from its approved Variety Pack designs; `gb.js` plays each slide's motion one click at a time.
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

Check all four navigation tabs and every presentation at 375, 390, 768 and 1280 pixel widths after design edits.

## YouTube status and credentials

The watchlist contains 42 creators selected from Taylor's subscriptions. The API integration is implemented but not yet connected or verified with live uploads. Google API enablement and credential approval remain pending. The layout works without credentials and reports that state honestly.

The production runtime needs a server-only `YOUTUBE_API_KEY` restricted to YouTube Data API v3. Never put a key, credential bundle, bypass token or real local database in this repository. Reusable credentials belong in the authorised encrypted vault and platform secret store. Do not enable billing or paid services.

## Publishing

GitHub is the shared editable source. A GitHub push does not update the app. After merging to main, Claude republishes `public/index.html` and the changed `public/` files to the existing artifact https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea, keeping its `db` capability, where saved topics live. Never publish the app to a new artifact. The retired ChatGPT Sites project is left untouched; do not publish to it or delete it.
