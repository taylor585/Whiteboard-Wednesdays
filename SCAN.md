# Watchlist scan: how uploads get into the app

The app cannot read YouTube itself (browsers block it), so a Claude Code session fetches the creators' latest uploads and publishes them next to the page. No key, no quota and no schedule: it runs when Taylor presses **Refresh** on the Creator watchlist, or when he says "Run watchlist scan <id>" in a Claude chat.

## What the app does (since 11 November 2026)

1. **Refresh** writes `scans/<id>` to the app artifact's database with `status: "queued"`, `handles` (or null) and `createdAt`.
2. It starts a Claude Code session itself, through Taylor's Claude Code Remote connector (`create_session`, the same call Publish makes), with the prompt `Run watchlist scan <id>. Follow SCAN.md in this repository exactly.` and saves `status: "starting"` and `session: {id, url, startedAt}` on the scan.
   If the connector is refused or unavailable it saves `status: "waiting"` and `note` (the reason) instead, and the Watchlist shows the line to send in a Claude chat, with Copy and Try again.
3. The Watchlist follows `scans/<id>` and shows the state beside the controls: Starting, then Fetching uploads (with Open the session), then "Updated just now · N new", or a plain failure line with Try again.
4. On `done` it fetches `uploads.json` again past the cache and redraws the inbox.

## Source

YouTube's public channel feed, `https://www.youtube.com/feeds/videos.xml?channel_id=<id>`: the latest 15 uploads per channel with title, date, description and thumbnail. Each creator's channel ID is stored in `public/creators.json` (`channelId`). To add a creator, add its handle, name and channel ID there (the ID is the `externalId` on the channel page).

## Steps for the session

1. If a scan document was named, set `scans/<id>` to `status: "running"` and `runningAt` first (ArtifactData on https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea), so the Watchlist says Fetching uploads. Leave `session` as the app wrote it.
2. In this repository, on a fresh checkout of `main`, run `node scripts/scan-watchlist.mjs --out public/uploads.json`. Pass `--handles @a,@b` to limit it to the handles listed in the scan document, if it names any. The script prints one line per creator and never invents a video; a creator whose feed fails is recorded with its error.
3. Publish `public/uploads.json` to the Whiteboard Wednesdays app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) as the file `uploads.json`, on top of the live version, leaving every other file as it is. Do not republish the page itself unless it changed.
4. If a scan document was named, mark it done in the artifact database, only after the publish in step 3 succeeded: `scans/<id>` with `status: "done"`, `finishedAt`, and `fetched` (the count). The app re-reads `uploads.json` when it sees `done`. If the fetch or the publish failed, write `status: "failed"` and `reason` (one plain sentence Taylor can act on) instead.
5. Commit `public/uploads.json` to `main` through a pull request only if Taylor asks for the data in the repository; otherwise the published file is enough.

The app reads `uploads.json` on load (`public/ww-store.js`), shows each creator's uploads in the Creator watchlist, on the creator pages and as Sparks on Topics, and shows when they were fetched.
