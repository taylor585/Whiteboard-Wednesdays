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

Open http://localhost:8862/#/library on that same machine. This shows all ten presentations, the approved clean underline header, and the Creator watchlist, Topics and Schedule layouts. Live video retrieval and saved topics require the full server below. No API key is needed for design work.

## Full application

Use Node.js 22.13 or newer. Prefer a checkout path without a colon.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sweet_shaman.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_topics.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_topic_deck.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_creator_note.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0004_topic_buyer.sql
npm run dev -- --port 8864
```

Open http://localhost:8864/#/library. The migration commands use local storage only. On Sites, the platform applies the files in `drizzle/` when the app is published; `0001_topics.sql` adds topics and copies any old saved ideas into them.

## Heading style

Since 10 November 2026 (Taylor's pick of the L1 "Highlighter" logo and its typography) the app screens use Instrument Sans for headings, body and controls and IBM Plex Mono for labels, dates and counts, all through the `--ww-*` tokens at the top of `public/whiteboard.css`. Page titles and section headings are Regular 400 with tight tracking; card titles, small headings and figures are Bold 700. The app faces are real weights (a variable Instrument Sans, four static IBM Plex Mono files), never a synthesised bold. The deck player, presentation titles and reading views keep their own faces (Instrument Sans, IBM Plex Mono, Caveat, Fraunces); retain the Lead Gen Engine brand font and fonts demonstrated inside slide artwork.

## Where to edit

- `public/index.html`: application header, navigation, Creator watchlist, Topics and Schedule markup.
- `public/whiteboard.css`: the brand tokens (`--ww-*`: colour roles, radii, faces, key sizes), the `@font-face` rules and the base styles the decks share. Change a brand value here, once.
- `public/ww-logo.svg`, `public/favicon.svg`, `scripts/build-logo.py`: the Highlighter lockup ("Whiteboard" over "Wednesdays" on the highlight marker band) and the small W-on-highlight mark used as the favicon and the phone header mark, outlined to paths from the bundled fonts (`pip install fonttools uharfbuzz`, then `python3 -I scripts/build-logo.py`).
- `public/ww-sans.ttf`, `public/ww-sans-italic.ttf` (Instrument Sans variable, weight 400 to 700, licence `ww-sans-license.txt`) and `public/ww-mono-medium.ttf`, `public/ww-mono-semibold.ttf`, `public/ww-mono-bold.ttf` (IBM Plex Mono 500, 600 and 700, licence `ww-mono-license.txt`; the 400 is `ww-mono.ttf`): the app screens' faces, SIL OFL 1.1, unmodified from the google/fonts repository (`ofl/instrumentsans`, `ofl/ibmplexmono`). `ww-body.ttf`, `ww-mono.ttf`, `ww-caveat.ttf` and `ww-display.ttf` stay for the decks and the Presentations wall.
- `public/library.css`, `public/library.js`: library styling, routing and presentation shell.
- `public/vault.css`, `public/vault.js`, `public/vault.json`, `public/vault/`: the Vault (`#/vault`, Taylor's pick B "Lanes", 9 November 2026): every finished video (Open goes to the Claude artifact holding the edit), thumbnail and post caption, grouped by video. Static content only; rebuild it with `python3 -I scripts/build-vault.py <staging-dir>` (the script's header lists the staging inputs and rules).
- `public/video-ideas.css`, `public/video-ideas.js`: Creator watchlist (`#/watchlist`), the upload inbox (Taylor's pick W2-B, 26 October 2026): creators by name, uploads grouped by week, Spark a topic, Seen (kept in this browser only) and the Topics tray.
- `public/brainstorm.css`, `public/brainstorm.js`: Topics tab (`#/topics`), creators and ideas (Taylor's pick BC, 26 October 2026): the creator database with a profile and private note, then Sparks, Shortlist, Recording schedule and Posting schedule side by side.
- `public/creator.css`, `public/creator.js`: creator page (`#/creator/@handle`, Taylor's pick C-A): channel banner, upload rhythm, latest uploads with Spark a topic, and the private note. Stats only come from stored uploads.
- `public/topics.css`, `public/topics.js`: Schedule tab (`#/schedule`), a four-week calendar with one row per week (Taylor's pick S2-B, 30 October 2026) and calendar-lens filters, the topic panel (including who the video is for: buyer A or B) and the not-scheduled list, built on PROCESS.md.
- `public/publish.css`, `public/publish.js`: Publish tab (`#/publish`): Drive links in, the Variety Pack platform by platform, finals and Post all. Jobs are artifact database documents `jobs/<id>` (fields: sources, skills, status `queued|running|check|found|pack|finishing|pilot|review|ask|posts|final`, stages, pack, picks, finals; PUBLISH.md lists them all) that a Claude Code session fills in. On `posts` Taylor picks one of five thumbnails and one of two posts per platform and copies each text; posting stays by hand.
- `public/reels.css`, `public/reels.js`: the Reels lane inside Publish (`#/publish/reels`, `#/publish/reels/<id>`): one main recording in (a Video job's, or a Drive file or folder link), the Reel highlight pack (six reels, three highlights each with the value to the viewer and its times), and Taylor's two winners with an optional Add music tick each. Reel jobs are artifact database documents `reels/<id>` (PUBLISH.md "Reels jobs"), never fields on `jobs/<id>`.
- `public/x-count.js`, `scripts/check-x-post.py`: X (Twitter), added 10 November 2026. Every Publish job writes an X post from the video transcript (a single post and a short thread; PUBLISH.md "The X post"). `check-x-post.py` is the pass/fail check the session runs on each variation; `x-count.js` counts a post the way X does (links 23, emoji 2, limit 280) for the Publish screen and the Vault's "X posts" bubble, and builds the Open X compose link. The two are held to one set of vectors in `scripts/tests/fixtures/x/`. Nothing is ever posted automatically, and X is not connected.
- `public/settings.css`, `public/settings.js`: Settings (`#/settings`, the cog top right): the skill library and the jobs that use each skill, saved as `settings/skills`, and the booking link for posts, saved once as `settings/links`.
- `public/ww-store.js`: when the app runs as a Claude artifact with no server, topics and creator notes are saved in the artifact's own database (collections `topics` and `creatorNotes`).
- `public/presentations.js`: presentation register.
- `public/whiteboard-content.js`, `public/lge-content.js`, `public/vb-content.js`, `public/ah-content.js`, `public/gv-content.js`: presentation content (paid ads, Lead Gen Engine, Vision Boards, AI Harnesses, Grok Voice).
- `public/vb.css`, `public/vb.js`, `public/ah.css`, `public/gv.css`: slide styles and behaviour scoped to the Vision Boards (`vb-`), AI Harnesses (`hc-`) and Grok Voice (`gv-`) decks.
- `public/gb-content.js`, `public/gb.css`, `public/gb.js`, `public/gb-reading.html`: the How Powerful Is Grok Bot Really? deck (`gb-`), ported from its approved Variety Pack designs; `gb.js` plays each slide's motion one click at a time.
- `public/ss-content.js`, `public/ss.css`, `public/ss.js`, `public/ss-reading.html`: the How to Edit Videos with Claude Easily deck (`ss-`), ported the same way from its approved Variety Pack designs (30 October 2026).
- `public/cw-content.js`, `public/cw.css`, `public/cw.js`, `public/cw-reading.html`: the I Ran an AI Call Centre for a Week deck (`cw-`), ported the same way from its approved Variety Pack designs (4 November 2026). Source: the Tuned Reps week one report.
- `public/`: all retained images, fonts, licences, reading views and PDF assets.
- `app/api/ideas/[[...path]]/route.ts`: server-side watchlist, refresh, topics and subtopics.
- `youtube-api.mjs`: YouTube Data API adapter.
- `db/schema.ts`, `drizzle/`: storage schema and migrations (generate new ones with `npm run db:generate`).
- `SKILL.md`: presentation authoring guidance.

`dist/` is generated build output. Do not edit it.

## Verification

```sh
node --test youtube-api.test.mjs
node --test scripts/tests/test_x_count.mjs
python3 -I scripts/tests/test_check_x_post.py
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Check all four navigation tabs and every presentation at 375, 390, 768 and 1280 pixel widths after design edits.

## YouTube status and credentials

The watchlist contains 42 creators selected from Taylor's subscriptions. The API integration is implemented but not yet connected or verified with live uploads. Google API enablement and credential approval remain pending. The layout works without credentials and reports that state honestly.

The production runtime needs a server-only `YOUTUBE_API_KEY` restricted to YouTube Data API v3. Never put a key, credential bundle, bypass token or real local database in this repository. Reusable credentials belong in the authorised encrypted vault and platform secret store. Do not enable billing or paid services.

## Publishing

GitHub is the shared editable source. A GitHub push does not update the app. After merging to main, Claude republishes `public/index.html` and the changed `public/` files to the existing artifact https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea, keeping its `db` capability, where saved topics live. Never publish the app to a new artifact. The retired ChatGPT Sites project is left untouched; do not publish to it or delete it.
