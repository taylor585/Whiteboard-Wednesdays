# Posting: what a posting session does

Taylor, 10 November 2026: "I don't want to have to be posting these manually... I should just be able to upload the Google Drive links and it should do everything for me perfectly, end to end, and get these posted for me." His decisions: a finished video posts by itself on its posting day and time, and he can hold it or change a pick before then; X is included (his own X developer app and credits); sign-ins live in his Composio connection, one connection per account (Google Drive, YouTube, LinkedIn, Instagram, Facebook, X); Instagram and Facebook take the same reel, 4:5 post and caption; Manual posting stays possible (Posting settings: Manual | Auto).

**The rule (PUBLISH.md "Posting", CLAUDE.md "Posting").** Only a posting session posts: a session whose first line is one of the three lines below, following this file. It posts only a job that reached Ready to post (`jobs/<id>.status: "final"`), only to platforms that are switched on and connected, on the job's posting day and time when Posting is Auto, or when Taylor presses **Post now** (Manual or Auto). Never a review copy. Never a job on Hold. Production sessions (every `Run` and `Continue` line in PUBLISH.md) never post.

Write to the app's database (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) with ArtifactData, every write pinned to the version you read (`if_version`). Never touch other jobs, other reel jobs, creator notes or settings. Read connections and post only through the **Composio** connector (`COMPOSIO_MANAGE_CONNECTIONS`, `COMPOSIO_MULTI_EXECUTE_TOOL` with the tool slugs below, `COMPOSIO_PROXY_EXECUTE` only where this file names it, `COMPOSIO_REMOTE_WORKBENCH` only for moving a file). Never type a key, token or password anywhere: Composio holds the sign-ins.

The rules that decide what is due, what a receipt allows and what text goes out are code, so the page and the session agree: `public/posting-core.js` (loaded by the page and by `scripts/posting-plan.mjs`). Use the script; never work them out by hand.

## The lines

| Line | Started by | What it does |
|---|---|---|
| `Post job <id>` | the app's **Post now** (Manual or Auto), or Taylor in a chat | posts the video job `jobs/<id>` and its reel job (`reels/<rid>` with `jobId: <id>`) to every platform still to post, now, whatever the day |
| `Post due jobs` | the daily scheduled task ("The scheduled tasks" below) | reads `settings/posting`; does nothing unless `mode` is `"auto"`; posts every job that is due today |
| `Retry posting <id>` | the hourly retry (a one-off scheduled task this file creates), the watchdog, or Taylor in a chat | the same as `Post job <id>`, but only receipts that are `failed` with `retryAt` passed, or `posting` that the watchdog found stuck; never a `check` |

## What the job holds (one writer per field)

On `jobs/<id>`:

| Field | Written by | What it is |
|---|---|---|
| `schedule: {day, time, tz: "Europe/London", at, late, planned, by: "app" \| "session" \| "taylor", setAt}` | the app when Taylor presses Ready to post, or any session that sets `final` (PUBLISH.md "At finish") | the posting day (`YYYY-MM-DD`, London), the posting time (`HH:MM`, London), and `at`, the same moment in UTC. Computed by `WWPostingCore.scheduleFor(<the topic's posting day from WWStore.posting.dates>, settings/posting, now)`: a posting day still ahead keeps it; a job ready after its slot passed goes on the next posting day (`late: true`). The app re-writes it when Posting settings change, until anything has posted. The session never re-derives it, except `scripts/posting-plan.mjs schedule` when `schedule` is missing on a `final` job (write it with `by: "session"`) |
| `hold: {on: true \| false, at, by: "taylor"}` | app only (Hold and Release) | while `on`, nothing posts: not on its day, not on Post now, not on a retry |
| `postTo: {youtube?, linkedin?, x?, instagram?, facebook?}` | app only | Taylor's switch for this video. A missing key follows Posting settings (`settings/posting.platforms`). Instagram and Facebook here cover the reel job too |
| `posting: {youtube, linkedin, x}` | posting session only | one receipt per platform (shape below) |
| `postingRun: {line, sessionId, requestedAt, startedAt, endedAt, attemptId, result, note}` | app (`line`, `sessionId`, `requestedAt` on Post now); session (the rest) | the latest posting session |
| `alert: {level: "look" \| "info", text, at, platforms}` | posting session only (cleared by the next run that has nothing to say) | one plain sentence the Publish screen shows on the job |
| `stored: {files: [{kind, name, where: "drive" \| "youtube-private", id, url, bytes, sha256, width, height, seconds, round, storedAt}]}` | production session ("At finish" in PUBLISH.md) | the full-quality files a posting session uses. `kind`: `master`, `linkedin`, `thumb.youtube`, `thumb.linkedin`, `thumb.post` |
| `youtubePrivate: {videoId, url, uploadedAt, thumbnailSet, title, round}` | production session ("At finish") | the master already uploaded to YouTube as **private** |
| `youtubeUrl` | the posting session after YouTube is public, or the app (Taylor posting by hand) | the watch link that fills `[YOUTUBE LINK]` |

On `reels/<rid>` (the reel job): `posting: {"instagram/<reelId>/reel", "instagram/<reelId>/post", "facebook/<reelId>/reel", "facebook/<reelId>/post"}` (posting session only) and `stored: {files: [{reelId, kind: "reel" | "post" | "cover", where: "drive", id, url, bytes, sha256}]}` (production session, "At finish"). A posting session writes only these two fields (and `alert`) on a reel job: the PUBLISH.md rule "never write `jobs/<id>` from a reel job" is about production sessions and still holds for them.

**A receipt** (`posting.<key>`): `{state: "posting" | "posted" | "failed" | "check" | "skipped", attemptId, startedAt, postedAt, url, id, error, reason, retries, retryAt}`. Moves only through `WWPostingCore.transition` (`node scripts/posting-plan.mjs step --entry <file> --event start|ok|fail|unclear|skip|clear`), which refuses an illegal move (exit 3):
- no receipt, `skipped`, or `failed` with `retryAt` passed and `retries` ≤ 1 → `start` → `posting`;
- `posting` → `ok` → `posted` (with `url` and `id`); `fail` (the platform answered no and created nothing) → `failed`, `retries` + 1, `retryAt` an hour later on the first failure, none on the second; `unclear` (a timeout, a 5xx, a lost answer) → `check`;
- `check` → only after reading the platform back: found → `ok`; not found and the platform can be read → `fail`; LinkedIn (cannot be read) stays `check` until Taylor clears it on Publish ("It is posted" / "It isn't: try again").
- never `start` on `posting`, `posted` or `check`.

## Before posting (every line)

1. Read `settings/posting`, the job (`jobs/<id>`) and its reel job (`reels` where `jobId` is the job's id). For `Post due jobs` list `jobs` and `reels` (`query.limit: 1000`).
2. **Connections, read only:** `COMPOSIO_MANAGE_CONNECTIONS` with `toolkits: [{name: "youtube", action: "list"}, {name: "linkedin", action: "list"}, {name: "twitter", action: "list"}, {name: "instagram", action: "list"}, {name: "facebook", action: "list"}, {name: "googledrive", action: "list"}]`. A platform is connected only when its list shows an ACTIVE account. Never use `action: "add"` here (it creates a sign-in link; Taylor connects on Settings). Write the result to a file as `{youtube: true|false, linkedin, x, instagram, facebook}` (X is the `twitter` toolkit).
   Then one harmless read per connected account, so the receipt names the right account: `YOUTUBE_LIST_CHANNEL_VIDEOS {mine: true, maxResults: 1}`, `LINKEDIN_GET_MY_INFO {}`, `TWITTER_USER_LOOKUP_ME {}` (costs $0.01: once per run, never per post), `INSTAGRAM_GET_IG_USER_MEDIA {ig_user_id: "me", limit: 1}`, `FACEBOOK_LIST_MANAGED_PAGES {limit: 25}` (take the Page whose name is in `settings/connections.facebookPage` when the Connections screen saved one, else the only Page; two Pages and none saved → Facebook `skipped`, reason "choose the Facebook Page in Settings"). A read that fails means that platform is not connected for this run.
3. **What is due:** for `Post due jobs`, `node scripts/posting-plan.mjs due --settings settings.json --jobs jobs.json --reels reels.json --connected connected.json`. It returns `mode`, `today` (London), `due`, `missed`, `waiting`, `held`. `mode: "manual"` → write nothing and end ("Posting is Manual: nothing posts by itself"). For each `missed` write `alert: {level: "look", text: "This video's posting day (<day>) passed without it going out. Press Post now if you still want it posted."}` and post nothing for it. For `Post job <id>` the job is due whenever it is `final` and not held (any day, any mode); a job that is not `final` or is on Hold → write `postingRun.result: "refused"` with the reason and end.
4. **The plan:** for each due job, `node scripts/posting-plan.mjs plan --job job.json --reel reel.json --settings settings.json --connected connected.json`. Each step has `platform`, `key`, `act` (`post`, `done`, `wait`, `look`, `skip`, `none`), `why`, the filled texts and the file. Follow it exactly: post only `act: "post"`; write `skip` receipts with their `why` for steps that are `skip` because a platform is switched off or not connected (`transition … --event skip --data '{"reason":"not connected"}'`), so the screen shows "Skipped: not connected"; never let one platform's skip or failure stop another. Re-run `plan` after YouTube posts (its link changes LinkedIn, X and the reels from `wait` to `post`).
5. Write `postingRun: {attemptId: <date -u +%Y%m%dT%H%M%SZ>-<4 random>, startedAt, result: "running"}` once per run.

## Never double-post

For every step with `act: "post"`, in this order and never otherwise:
1. Re-read the document (job or reel job). If `hold.on` is now true, stop the whole run (Taylor held it while you were posting): write `postingRun.result: "held"` and end. If the receipt is no longer what `plan` saw, re-run `plan`.
2. Write the receipt `posting` (`transition --event start --data '{"attemptId":"…"}'`) **pinned to the version you just read**. If the write is refused for a version conflict, re-read and go back to 1: another session got there first.
3. Only then call the platform.
4. Clear answer, created → `ok` with the post's `url` and `id`. Clear answer, nothing created (a 4xx with an error body: bad media, rule refused) → `fail`. Anything unclear (timeout, 5xx, a tool error with no body, a session that lost the answer) → `unclear` → `check`, then read back straight away (each platform's "Read back" below): found → `ok`; not found → `fail`.
5. A step whose receipt says `posting` when the run starts is someone else's attempt or a stuck one: never start it again. The watchdog handles stuck ones ("Stuck posting" below).

## The order and each platform

YouTube → LinkedIn → X → Instagram → Facebook. Instagram and Facebook wait for YouTube to be public (their captions say the full video is on YouTube); LinkedIn and X wait for the YouTube link (their first comment and reply carry it). With YouTube switched off or not connected, Taylor's own `youtubeUrl` (saved when he posted it by hand) fills the link; with neither, LinkedIn and X wait, and the run says so in `alert`.

### YouTube

- **Usual case, private upload done at finish** (`youtubePrivate.videoId`): `YOUTUBE_UPDATE_VIDEO {video_id, privacy_status: "public", title, description}` (title and description from the plan: the picked YouTube post, no placeholder). This is the "posting day = make public" step. Then `YOUTUBE_GET_VIDEO_DETAILS_BATCH {id: [videoId], parts: ["status", "snippet"]}`: `status.privacyStatus` must be `public`.
- **No private upload** (YouTube was connected only after the job finished): upload from the stored full-quality master (`stored.files[kind: "master"]`, on Drive). Route A, through Composio storage: `GOOGLEDRIVE_DOWNLOAD_FILE {fileId}` gives `downloaded_file_content` with an `s3key`; then `YOUTUBE_UPLOAD_VIDEO {title, description, tags: [the post's hashtags without #], categoryId: "27", privacyStatus: "public", videoFilePath: {name, mimetype: "video/mp4", s3key}}`. Route B (fallback, needs Taylor's own Google OAuth client in the environment, not set up): a resumable `videos.insert` upload from this container. If neither works, `fail` with "The master could not be moved to YouTube: post it by hand from Drive" and carry on with the others (LinkedIn and X then wait for his link).
- **Thumbnail:** `YOUTUBE_UPDATE_THUMBNAIL {videoId, thumbnailUrl: <public URL of the 1280×720 pick, under 2 MB>}` (at finish when the private upload was made; here only when it was not, `youtubePrivate.thumbnailSet` false). A refusal because the channel is not phone-verified does not fail the post: note it in `alert` ("Verify your YouTube channel by phone so custom thumbnails can be set").
- **The link:** `https://www.youtube.com/watch?v=<videoId>`. Write it as the receipt's `url` and as `youtubeUrl` on the job (one write).
- **Read back:** `YOUTUBE_LIST_CHANNEL_VIDEOS {mine: true, maxResults: 10}`, matching the title.
- Topic: once YouTube is posted, update `topics/<topicId>` with `status: "posted"` only (an `update`, nothing else; never other topics), then list `topics` once to confirm it still reads (CLAUDE.md).

### LinkedIn (personal profile)

1. `LINKEDIN_UPLOAD_VIDEO {video_url: <public URL of the stored LinkedIn cut>}` (or `file: {name, mimetype: "video/mp4", s3key}`): waits until ready and returns the `urn:li:video:…`.
2. `LINKEDIN_CREATE_VIDEO_POST {video_urn, commentary: <the picked body, at most 3,000 characters>, visibility: "PUBLIC"}`: returns the post URN (`urn:li:share:…` or `urn:li:ugcPost:…`). The receipt's `url` is `https://www.linkedin.com/feed/update/<urn>/`.
3. `LINKEDIN_GET_MY_INFO {}` (once per run) for the member id, then `LINKEDIN_CREATE_COMMENT_ON_POST {target_urn: <post urn>, object: <post urn>, actor: "urn:li:person:<id>", message: {text: <the first comment with the real YouTube link, at most 1,250 characters>}}`. The comment is its own receipt field on the LinkedIn receipt (`comment: {state, id}`); a failed comment never re-posts the video: retry only the comment.
- **Read back: not possible** (LinkedIn does not let the member's own posts be listed). An unclear answer stays `check`, and the run writes `alert: {level: "look", text: "LinkedIn did not answer clearly. Check your LinkedIn profile: if the post is there, press It is posted on Publish; if not, press It isn't: try again."}`. Never retry LinkedIn by itself after an unclear answer.

### X

Only when the job's X pick exists and `plan` shows no errors (every post 280 or fewer as `public/x-count.js` counts, the YouTube link filled in the last post, no other placeholder, no link in the first post).
1. The image: the polished YouTube thumbnail (1280×720). Put it into Composio storage (the workbench's `upload_local_file` gives an `s3key`) and `TWITTER_UPLOAD_MEDIA {media: {name, mimetype: "image/jpeg", s3key}, media_category: "tweet_image"}` → `media_id`. Never a clip of any video (PUBLISH.md "The X post").
2. The first post: `TWITTER_CREATION_OF_A_POST {text: <post 1>, media_media_ids: [media_id]}` → its id. Receipt `url`: `https://x.com/<username>/status/<id>` (username from `TWITTER_USER_LOOKUP_ME`).
3. Each later post, in order: `TWITTER_CREATION_OF_A_POST {text, reply_in_reply_to_tweet_id: <the id of the post before it>}`. The receipt keeps `replies: [{n, id, state}]`; a run that finds the first post `posted` and a reply missing posts only the missing replies, each under the last one that is there.
- **Read back:** `TWITTER_GET_USER_POSTS {id: <user id>, max_results: 10, start_time: <the attempt's startedAt>}`, matching the first post's text.
- Cost: about $0.015 a post and $0.20 for the post with the link (Taylor's own credits). Never post the thread twice to "fix" a reply.

### Instagram (Business or Creator account)

For each finished reel of the reel job (`reels/<rid>.finals`, in reel order), first the 9:16 reel, then its 4:5 post:
1. The file: the stored full-size file (`stored.files[reelId, kind]`), put on a **temporary public URL** (below).
2. `INSTAGRAM_POST_IG_USER_MEDIA {ig_user_id: "me", media_type: "REELS", video_url, caption: <the reel's caption>, cover_url: <public URL of the reel's 1080×1920 cover>, share_to_feed: true}` → container id. The 4:5 post is a video too: the same call with the post file, `caption` the post caption, no `cover_url`, `share_to_feed: true` (Instagram publishes every API video as a reel; the 4:5 shape shows uncropped in the grid).
3. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH {ig_user_id: "me", creation_id, max_wait_seconds: 300}` → media id. Then `INSTAGRAM_GET_IG_USER_MEDIA {ig_user_id: "me", limit: 5, fields: "id,permalink,timestamp,caption"}` for the `permalink` (the receipt `url`).
- Before the first Instagram post of a run: `INSTAGRAM_GET_IG_USER_CONTENT_PUBLISHING_LIMIT {ig_user_id: "me"}`; with fewer than 4 left, post nothing on Instagram (`fail`, permanent: "Instagram's daily posting limit is reached; it posts on the next run").
- **Read back:** `INSTAGRAM_GET_IG_USER_MEDIA` since the attempt's start, matching the caption's first line.

### Facebook (a Page, never a profile)

The same files and the same captions as Instagram (Taylor, 10 November 2026). Never render or write anything for Facebook.
- **The 4:5 post and, until the reel route is proven, the reel:** `FACEBOOK_CREATE_VIDEO_POST {page_id, file_url: <the same temporary public URL>, description: <the caption>, published: true}`.
- **The reel as a Facebook Reel (unproven; use only once the live test has passed and `settings/connections.facebookReels` is `true`):** Meta's Page Reels API through `COMPOSIO_PROXY_EXECUTE {toolkit_slug: "facebook", method: "POST", endpoint: "/<page_id>/video_reels", parameters: [{name: "upload_phase", value: "start", type: "query"}]}` → `video_id`; then `POST https://rupload.facebook.com/video-upload/v21.0/<video_id>` with header `file_url: <public URL>`; then `POST /<page_id>/video_reels` with `upload_phase=finish`, `video_id`, `video_state=PUBLISHED`, `description=<caption>`. Reels must be 3 to 90 seconds (ours are 60 s or less).
- **Read back:** `COMPOSIO_PROXY_EXECUTE {toolkit_slug: "facebook", method: "GET", endpoint: "/<page_id>/videos", parameters: [{name: "fields", value: "id,description,created_time,permalink_url", type: "query"}]}`, matching the caption.

### Temporary public hosting (for Meta, LinkedIn and the thumbnail)

Meta and LinkedIn fetch the file themselves from a public URL. Private artifact pages and large Drive files cannot be fetched.
- **Route 1 (preferred, one connector): Composio storage.** In `COMPOSIO_REMOTE_WORKBENCH`, fetch the stored file from Drive with `run_composio_tool("GOOGLEDRIVE_DOWNLOAD_FILE", {"fileId": …})` and call `upload_local_file(<path>)`, which returns `s3key` and `s3_url`; use `s3_url` as `video_url` / `file_url` and `s3key` where a tool takes a file object. Each workbench cell has a hard 180 s limit: split a download that takes longer.
- **Route 2 (fallback): a Supabase Storage signed URL**, bucket `ww-posting-temp` (private), object `<jobId>/<attemptId>/<name>`, signed for 2 hours. Delete the object straight after the publish call answers, success or not.
- Composio's stored copies expire by themselves; never write a temporary URL into a receipt or onto the job (receipts carry the platform's own link).

## After each run

- Write `postingRun: {endedAt, result: "posted" | "partial" | "nothing" | "held" | "refused" | "failed", note}` with a plain sentence, for example "Posted to YouTube, LinkedIn and X. Instagram and Facebook are skipped: not connected." and the job's `alert` when something needs Taylor (cleared to `null` when nothing does).
- **Retry, once, an hour later:** when any receipt became `failed` with a `retryAt`, create one one-off scheduled task (only when none exists for this job: `list_triggers` first) with `create_trigger {name: "Retry posting <id>", prompt: "Retry posting <id>", run_once_at: <the earliest retryAt>, create_new_session_on_fire: true, connectors: ["Composio"], notifications: {push: true}, initiation: "human_schedule"}`. A second failure has no `retryAt`: `alert` level `look` and a push notification ("YouTube refused the video twice: <error>. Open Publish to post it by hand or press Post now.").
- **What Taylor is told, and where:** (1) Publish, on the job: the row per platform (Scheduled, Posting, Posted with its link, Skipped: not connected, Off, Needs a look) and `alert`; (2) the Schedule's posting card: Scheduled or Posted with the links; (3) a push notification from the scheduled task when a run ends with something to look at (its last message says, in one sentence, what posted and what did not); (4) nothing else: no email unless Taylor asks.
- **A partial success is normal and safe:** each platform has its own receipt, so a re-run posts only what is missing. "Posted 3 of 5" on the screen means the other two are skipped, waiting, or need a look, each with its own line.

## Hold, cancel and changes

- **Hold** (Publish) writes `hold.on: true`; every run re-reads it before each platform and stops. **Release** writes `hold.on: false`; on Auto, the next daily run posts it when its day has come (up to two days late), otherwise Taylor presses Post now.
- **Change a pick** before posting: picks stay editable on Publish until that platform's receipt is `posting` or `posted`; the posting session always reads the picks at the moment it posts.
- **Cancel one platform**: switch it off for this video (`postTo`); a receipt already `posted` stays (delete on the platform itself, by hand).
- **Manual mode**: no daily posting; Post now posts at once.
- Nothing posted is ever deleted or edited by a session.

## Stuck posting (the watchdog)

A receipt on `posting` for more than 30 minutes with no session running it (its `postingRun.sessionId` session is not `working`, via `get_session`) is read back on its platform: found → `ok`; not found → `fail` (a normal retry follows); LinkedIn → `check` and an alert.

## The scheduled tasks (create them only after Taylor's accounts are connected; the main session runs these, not a job session)

Both are fresh sessions in the app's environment (`env_017PLHsTGZVgThRnUnu1eoGG`) on this repository. `CRON_TZ=Europe/London` keeps them on UK time across the clock change. The daily poster's minute is the posting time saved in `settings/posting.time` (default 15:00, so `0 15`); when Taylor changes the posting time, `update_trigger` it to match.

**1. The daily poster**
```json
{"name": "Whiteboard Wednesdays: post due videos",
 "cron_expression": "CRON_TZ=Europe/London 0 15 * * *",
 "create_new_session_on_fire": true,
 "environment_id": "env_017PLHsTGZVgThRnUnu1eoGG",
 "connectors": ["Composio"],
 "notifications": {"push": true},
 "initiation": "human_request",
 "prompt": "Post due jobs. Follow POSTING.md in the taylor585/Whiteboard-Wednesdays repository exactly (clone it if it is not here). Read settings/posting in the Whiteboard Wednesdays app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) and stop at once, posting nothing, unless its mode is \"auto\". Then post only jobs that are Ready to post, due today in Europe/London and not on Hold, only to platforms switched on and connected in Composio, writing every receipt to the job before and after each platform call as POSTING.md says. Never post a review copy, never post anything twice, and end with one sentence saying what posted and what did not."}
```
The posting time is a scheduled minute, not a jittered one: it is the time Taylor chose for his posts.

**2. The watchdog**
```json
{"name": "Whiteboard Wednesdays: watchdog",
 "cron_expression": "CRON_TZ=Europe/London 17 * * * *",
 "create_new_session_on_fire": true,
 "environment_id": "env_017PLHsTGZVgThRnUnu1eoGG",
 "connectors": ["Composio"],
 "notifications": {"push": true},
 "initiation": "human_request",
 "prompt": "Watchdog for the Whiteboard Wednesdays app (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea). Follow POSTING.md \"The watchdog\" in the taylor585/Whiteboard-Wednesdays repository exactly. Read jobs and reels. End at once, writing nothing, when no job or reel job is stuck. Stuck means: status starting for 10 minutes or more, or running, building or finishing with no stage time in the last 90 minutes, and its session (session.id, via get_session) not working; or a posting receipt on posting for 30 minutes or more with its posting session not working. Restart at most one stuck production step per job with the same line the app's Try again sends (the line PUBLISH.md gives for session.step), at most twice per job per day (record watchdog: {restarts, lastAt} on the job), and only by starting a new Claude Code session with create_session, never by doing the work yourself. Resolve a stuck posting receipt by reading the platform back as POSTING.md says. Never post anything new, never touch a job on Hold or one Taylor stopped (error \"Stopped by Taylor\"), and end with one sentence on what you restarted."}
```
Hourly at minute 17 (off the hour, as scheduling guidance asks for recurring tasks).

### The watchdog

1. List `jobs` and `reels`. A production step is stuck by the same limits the app shows (`publish.js` `STUCK_MIN`, `reels.js` `STUCK_MIN`): `starting` 10 minutes; `running`, `building`, `finishing` 90 minutes with no newer stage time. Before calling it stuck, `get_session {session_id: session.id}`: a session whose `status_bucket` is `working` is not stuck.
2. Restart with exactly the line the app's Try again would send: for a Video job, `session.step` `pack` → `Run Publish job <id>`; `finals` → `Continue Publish job <id> from pack`; `pilot` / `review` → `… from pilot` / `… from review`; `thumbs` → `… from thumbnails`. For a reel job, `session.step` `pack` → `Run Reels job <id>`; `recordings`, `options`, `music` → `Continue Reels job <id> from recordings|options|music`. Use `create_session {environment_id: "env_017PLHsTGZVgThRnUnu1eoGG", source_url: "https://github.com/taylor585/Whiteboard-Wednesdays", title: "Watchdog restart: <title>", prompt: <the line>. Follow PUBLISH.md in this repository exactly …}` with the same prompt text the app builds (`sessionPrompt` in publish.js, `prompt()` in reels.js), then write `session: {id, url, step, requestedAt, startedAt}` and `watchdog: {restarts, lastAt}` pinned to the version read. At most two restarts per job per day; a third stuck step writes `alert` and stops.
3. Stuck posting: "Stuck posting" above.
4. Never restart a job that is `failed` (Taylor's Try again does that), on Hold, or stopped by Taylor.

## Proven and unproven (10 November 2026; the live-tests agent confirms each before it is relied on)

| Part | Status | What the live test must show |
|---|---|---|
| Composio tool names and parameters in this file | verified by schema read (`COMPOSIO_GET_TOOL_SCHEMAS`) | — |
| A scheduled session gets the Composio connector (`connectors: ["Composio"]`) and the app database | unproven | one fire of a test task lists connections and reads `settings/posting` |
| YouTube: private upload at finish from Composio storage (`GOOGLEDRIVE_DOWNLOAD_FILE` s3key → `YOUTUBE_UPLOAD_VIDEO`) for a 100 to 400 MB master | unproven (file size, 180 s workbench cell, Drive account) | one private upload of a real master, then `YOUTUBE_UPDATE_VIDEO` to public on a throwaway video |
| YouTube: `YOUTUBE_UPDATE_VIDEO privacy_status: public` | unproven | the flip on the test upload |
| YouTube: custom thumbnail | unproven (channel must be phone-verified) | `YOUTUBE_UPDATE_THUMBNAIL` on the test upload |
| Google Drive: full-quality files into "Whiteboard Wednesdays finals/<title>" | unproven: `GOOGLEDRIVE_UPLOAD_FILE` takes at most 5 MB, so videos go through `GOOGLEDRIVE_UPLOAD_FROM_URL` from a temporary public URL | a 300 MB file arrives whole (size and checksum match) |
| Temporary public URL (Composio `upload_local_file` `s3_url`, or Supabase signed URL) fetchable by Meta and LinkedIn | unproven | Instagram and LinkedIn accept a file from it |
| LinkedIn: `LINKEDIN_UPLOAD_VIDEO` of a 100 MB+ cut, post, first comment | unproven | one post with comment |
| X: image post and link reply | unproven (needs Taylor's developer app and credits) | one post with the thumbnail and a reply |
| Instagram: reel and 4:5 video post via `video_url` | unproven | one reel and one 4:5 post |
| Facebook: Page video post (`FACEBOOK_CREATE_VIDEO_POST file_url`) | unproven | one Page video |
| Facebook: Page reel through `COMPOSIO_PROXY_EXECUTE` (`/video_reels`, `rupload.facebook.com`) | unproven, and `rupload.facebook.com` may not be on the proxy's allowed domain | one reel; until then reels go up as Page videos |
| The page starting `Post job <id>` with `create_session` | proven pattern (the same call starts every Publish session today) | — |
