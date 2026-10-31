# Watchlist scan: how uploads get into the app

The app cannot read YouTube itself (browsers block it), so a Claude Code session fetches the creators' latest uploads and publishes them next to the page. No key, no quota and no schedule: it runs when Taylor presses **Refresh uploads** on the Creator watchlist, or when he says "Run watchlist scan <id>" in a Claude chat.

## Source

YouTube's public channel feed, `https://www.youtube.com/feeds/videos.xml?channel_id=<id>`: the latest 15 uploads per channel with title, date, description and thumbnail. Each creator's channel ID is stored in `public/creators.json` (`channelId`). To add a creator, add its handle, name and channel ID there (the ID is the `externalId` on the channel page).

## Steps for the session

1. In this repository, on a fresh checkout of `main`, run `node scripts/scan-watchlist.mjs --out public/uploads.json`. Pass `--handles @a,@b` to limit it to the handles listed in the scan document, if it names any. The script prints one line per creator and never invents a video; a creator whose feed fails is recorded with its error.
2. Publish `public/uploads.json` to the Whiteboard Wednesdays app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) as the file `uploads.json`, on top of the live version, leaving every other file as it is. Do not republish the page itself unless it changed.
3. If a scan document was named, mark it done in the artifact database: `scans/<id>` with `status: "done"`, `finishedAt`, and `fetched` (the count). If the fetch failed, write `status: "failed"` and the reason instead.
4. Commit `public/uploads.json` to `main` through a pull request only if Taylor asks for the data in the repository; otherwise the published file is enough.

The app reads `uploads.json` on load (`public/ww-store.js`), shows each creator's uploads in the Creator watchlist, on the creator pages and as Sparks on Topics, and shows when they were fetched.
