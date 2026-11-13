# Watchlist scan: how uploads get into the app

The app cannot read YouTube itself (browsers block it), so a Claude Code session fetches the creators' latest uploads and publishes them next to the page. No key, no quota and no schedule: it runs when Taylor presses **Refresh creators** on Inspiration (`#/watchlist`, the command field's quiet second verb since 13 November 2026), or when he says "Run watchlist scan <id>" in a Claude chat.

## What the app does (since 11 November 2026; Inspiration since 13 November 2026)

1. **Refresh creators** writes `scans/<id>` to the app artifact's database with `status: "queued"`, `handles` (or null) and `createdAt`. The page chooses the id (`YYYY-MM-DD-xxxxx`) so it can show the group before the connector answers.
2. It starts a Claude Code session itself, through Taylor's Claude Code Remote connector (`create_session`, the same call Publish makes), with the prompt `Run watchlist scan <id>. Follow SCAN.md in this repository exactly.` and saves `status: "starting"` and `session: {id, url, startedAt}` on the scan.
   If the connector is refused or unavailable it saves `status: "waiting"` and `note` (the reason) instead. If the connector has not answered within 60 seconds, the page saves `status: "waiting"` itself and leaves the call open (a late start still moves the scan on to `starting`). Either way Inspiration shows the line to send in a Claude chat, `Run watchlist scan <id>`, with Copy and Try again.
3. Inspiration follows the `scans` collection and shows the latest scan as the REFRESH group at its place in the stream: Starting, Waiting for Claude to allow the Claude Code connection, then Running with the elapsed time against "about 2 minutes" and Open the session, then "Done · N new uploads", or Failed with the reason and Try again. The earlier uploads stay under it until the new ones land. A scan that is running when the page opens is shown as running.
4. On `done` it fetches `uploads.json` again past the cache and redraws the uploads, each with Spark (onto the Topics shortlist), Add to schedule and Dismiss.

## Source

YouTube's public channel feed, `https://www.youtube.com/feeds/videos.xml?channel_id=<id>`: the latest 15 uploads per channel with title, date, description and thumbnail. Each creator's channel ID is stored in `public/creators.json` (`channelId`). To add a creator, add its handle, name and channel ID there (the ID is the `externalId` on the channel page).

## Steps for the session

1. If a scan document was named, set `scans/<id>` to `status: "running"` and `runningAt` first (ArtifactData on https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea), so Inspiration says Running. Leave `session` as the app wrote it. You may also write `progress: [{label: "Fetching 42 creators", done, total}]` as creators finish; Inspiration draws it as a tick meter.
2. In this repository, on a fresh checkout of `main`, run `node scripts/scan-watchlist.mjs --out public/uploads.json`. Pass `--handles @a,@b` to limit it to the handles listed in the scan document, if it names any. The script prints one line per creator and never invents a video; a creator whose feed fails is recorded with its error.
3. Publish `public/uploads.json` to the Whiteboard Wednesdays app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) as the file `uploads.json`, on top of the live version, leaving every other file as it is. Do not republish the page itself unless it changed.
4. If a scan document was named, mark it done in the artifact database, only after the publish in step 3 succeeded: `scans/<id>` with `status: "done"`, `finishedAt`, and `fetched` (the count). The app re-reads `uploads.json` when it sees `done`. If the fetch or the publish failed, write `status: "failed"` and `reason` (one plain sentence Taylor can act on) instead.
5. Commit `public/uploads.json` to `main` through a pull request only if Taylor asks for the data in the repository; otherwise the published file is enough.

The app reads `uploads.json` on load (`public/ww-store.js`), shows each creator's uploads on Inspiration and on the creator pages, and shows when they were fetched. Topics no longer lists uploads: it is the review step for what was sparked.
