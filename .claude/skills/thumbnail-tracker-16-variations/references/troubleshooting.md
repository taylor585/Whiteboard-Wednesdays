# Troubleshooting

Every technical problem met while building and using the skill (October 2026), with its fix. Each entry gives the symptom, the cause, the fix and where the fix lives. Paths are relative to the skill root.

## Contents

1. YouTube data collection
2. Data quality
3. Transcription
4. Rendering
5. Layout and fit fixes in the renderer
6. Tracking, watching and auditing
7. Research workflow
8. Packaging the skill
9. Quick reference

## 1. YouTube data collection

### yt-dlp per-video lookups and watch pages are bot-blocked

- **Symptom:** `yt-dlp` on a single video returns `HTTP Error 429: Too Many Requests`, then `Sign in to confirm you're not a bot`. Fetching `youtube.com/watch?v=...` returns a 3KB bot wall; a web-fetch tool returns only YouTube's footer links.
- **Cause:** YouTube blocks anonymous per-video requests from server IP ranges. The channel listing (`--flat-playlist`) still works.
- **Fix:** use yt-dlp only for channel listings. Get descriptions, exact views, likes, publish dates, real link URLs and chapters from YouTube's public `youtubei/v1/next` endpoint, one request a second. If a request fails, the field is left empty and the run continues.
- **Where:** `scripts/fetch_videos.py`. Audit mode gets a single video's title and channel from YouTube's oEmbed endpoint (`scripts/audit.py`), which has no view count; run `track_channel.py` on the channel for views and the outlier ratio.

### yt-dlp warns "No supported JavaScript runtime could be found"

- **Symptom:** a warning that only deno is enabled and some formats may be missing.
- **Cause:** newer yt-dlp wants a JavaScript runtime for full video extraction.
- **Fix:** none needed. The skill never downloads videos through yt-dlp; flat-playlist listings work without a runtime.
- **Where:** `scripts/track_channel.py`, `scripts/watch.py` (listing only).

### The transcript endpoint returns 400

- **Symptom:** `get_transcript failed: HTTP Error 400: Bad Request`. Retrying with two WEB client versions and an ANDROID client gave 400 every time.
- **Cause:** the `youtubei/v1/get_transcript` endpoint rejects anonymous requests.
- **Fix:** transcripts were dropped from the dossier. To see how a video opens, the user supplies a transcript or the video file, and `transcribe.py` makes one locally.
- **Where:** `scripts/fetch_videos.py` (docstring says so); `scripts/transcribe.py`.

### @SabriSuby returns 404

- **Symptom:** `YouTube said: ERROR - Requested entity was not found` and `HTTP Error 404` for `https://www.youtube.com/@SabriSuby/videos`.
- **Cause:** that handle doesn't exist. His channel is `@SabriSubyOfficial` (channel ID UCAxUtcgLiq_gopO87VaZM5w). `@KingKongDigital` is his agency's channel, not his.
- **Fix:** use `@SabriSubyOfficial`. When a handle 404s, search YouTube for the creator's name and read the handle from the results before guessing again.
- **Where:** `references/research/data/README.md` lists the three correct handles.

### The channel page has video IDs but no titles

- **Symptom:** parsing `ytInitialData` from the `/videos` page finds 30 video IDs with empty titles.
- **Cause:** YouTube's newer `lockupViewModel` markup nests titles differently, and the page only holds the first 30 uploads.
- **Fix:** list channels with `yt-dlp --flat-playlist --print "%(id)s\t%(view_count)s\t%(duration)s\t%(title)s"`, which returns every upload.
- **Where:** `scripts/track_channel.py` (`list_videos`).

### LinkedIn returns 429

- **Symptom:** a request for a creator's LinkedIn activity page returns HTTP 429.
- **Cause:** LinkedIn blocks automated access. The three researched creators also aren't active LinkedIn posters.
- **Fix:** no LinkedIn scraping. With the user's agreement, the LinkedIn rules are adapted from the YouTube research and labelled as untested on LinkedIn. Replace them with the user's own LinkedIn analytics once they have 10 or more posts.
- **Where:** `references/frameworks/linkedin-framework.md`.

## 2. Data quality

### YouTube hides some view counts

- **Symptom:** a few rows in a channel listing have no view count (4 of Liam Ottley's 60; 6 of 100 in another run). The first version stored them as 0, so they topped the "weakest 10", pulled medians down (40,000 instead of 43,500 on Liam's 60) and showed as "0K x0.0" on contact sheets.
- **Cause:** the flat listing sometimes omits the count, and the per-video page that would have it is bot-blocked.
- **Fix:** hidden counts are stored as `None`, shown as "?", and left out of every median, outlier ratio and ranking. `summary.txt` lists which videos were hidden. In the data TSVs they are blank.
- **Where:** `scripts/track_channel.py`, `scripts/watch.py`, `scripts/group_stats.py`.

### Listing view counts are rounded

- **Symptom:** flat-playlist views come back as 316,000 or 40,000, not exact figures.
- **Cause:** YouTube rounds the counts in listings to about two significant figures.
- **Fix:** fine for medians and ratios. When an exact number matters (a proof figure, a case study), use the dossier's `views (exact)` from `fetch_videos.py`.
- **Where:** `scripts/fetch_videos.py`; noted in `SKILL.md`.

### The scraper's hashtags field picks up "#1"

- **Symptom:** the dossier's `hashtags` list shows "#1"-style hits on 29 of 30 of Nick's latest videos and 9 of 30 of Riley's, from text such as "customer #1" and numbered chapters. Real hashtags: Sabri 0, Nick 0, Riley 7.
- **Cause:** the field is a raw `#\w+` match, and `\w` includes digits.
- **Fix:** don't trust the field. Count hashtags from the description text yourself, keeping only a `#` followed by a letter (for example `re.findall(r'(?<!\w)#[A-Za-z]\w*', description)`). Every teardown prompt says so, and the published hashtag figures were counted this way.
- **Where:** `scripts/fetch_videos.py` (the field itself is unchanged); `references/research/method.md`.

### Two outlier definitions gave different ratios

- **Symptom:** the same video scored x7.05 in the tracker and x7.29 in the watch digest.
- **Cause:** the tracker divided by the median of the 10 uploads either side; the first watch digest divided by the median of the latest 30.
- **Fix:** both now use the neighbour definition through the shared `add_outliers` function.
- **Where:** `scripts/track_channel.py` (`add_outliers`), imported by `scripts/watch.py` and `scripts/fetch_videos.py`.

### Teardown JSON files have different shapes

- **Symptom:** a script expecting `{"videos": [...]}` fails on `nick-latest30.json` with `AttributeError: 'list' object has no attribute 'keys'`.
- **Cause:** the latest-30 teardowns were written by different analysts. Some files are a plain list, and field names vary (`like_rate` vs `like_rate_pct`).
- **Fix:** check the type before reading: `v = d if isinstance(d, list) else d.get('videos')`. The top-20 files all use `videos[]` and `rules[]`.
- **Where:** `references/research/data/README.md`.

## 3. Transcription

### faster-whisper fails with a PyAV `metadata_errors` TypeError

- **Symptom:** `TypeError: open() got an unexpected keyword argument 'metadata_errors'` from `av/container/core.py`.
- **Cause:** faster-whisper's own audio loader expects a different PyAV version from the one installed.
- **Fix:** don't let faster-whisper decode the file. ffmpeg decodes it to 16 kHz mono `s16le` PCM on stdout, numpy turns that into a float array, and the array goes straight to the model, so PyAV is never used.
- **Where:** `scripts/transcribe.py`.

### faster-whisper isn't installed

- **Symptom:** `ModuleNotFoundError: No module named 'faster_whisper'`.
- **Fix:** `pip install faster-whisper`. The model downloads from Hugging Face on first use, so the first run needs network access. ffmpeg must be on the path.
- **Where:** `scripts/transcribe.py` (docstring).

## 4. Rendering

### Never run "playwright install"

- **Symptom:** `import playwright` fails in Python; it's tempting to install Playwright and download a browser.
- **Cause:** the renderer is a Node script. Node Playwright and Chromium are already installed (`/opt/node-tools/node_modules/playwright`, browsers in `/opt/pw-browsers`). The Python package isn't needed.
- **Fix:** run `node scripts/render.cjs`. Never run `playwright install` or `npx playwright install`; use the preinstalled Chromium. If Playwright really is missing on another machine, the renderer says so and exits.
- **Where:** `scripts/render.cjs` (`loadPlaywright` tries `playwright`, `/opt/node-tools/node_modules/playwright`, then `playwright-core`).

### Rendering needs network for fonts and logos

- **Symptom:** blank or fallback fonts, or missing logos, when the network or proxy blocks `fonts.googleapis.com`, `fonts.gstatic.com` or `cdn.jsdelivr.net`.
- **Cause:** versions before 3.0 loaded every font from Google Fonts. Logos written as `si:<slug>` load from Simple Icons on jsDelivr.
- **Fix:**
  - **Fonts:** 3.0 bundles the fonts as local `@font-face` files in `assets/fonts/`, with their licences, so rendering needs no font network. Google Fonts is added only as a fallback when a bundled file is missing. `THUMB_OFFLINE=1` blocks Google Fonts entirely; `THUMB_FONTS=google` restores the old behaviour. `scripts/fetch_fonts.py` rebuilds the bundle.
  - **Logos:** Simple Icons still need network. Offline, use `img:<path to the official logo file>`, or `glyph:<text>` as a stopgap.
- **Where:** `scripts/render.cjs` (fonts section), `assets/fonts/`, `scripts/fetch_fonts.py`.

### A logo slug doesn't exist

- **Symptom:** an empty tile; jsDelivr returns 404 for, say, `si:chatgpt`.
- **Cause:** Simple Icons 13.21.0 has no icon by that name (`si:openai` exists; `si:chatgpt` doesn't). Missing logos used to fail silently.
- **Fix:** the renderer now prints `WARNING [...]: logo "si:<slug>" not found in Simple Icons 13.21.0`. Use the right slug, or `img:` with the official logo file.
- **Where:** `scripts/render.cjs`.

### Output is over 2 MB

- **Symptom:** a PNG, especially at `scale` above 1, is too big for YouTube or LinkedIn.
- **Fix:** the renderer warns when a file is over 2,000 KB. Set `"format": "jpg"` (quality 90).
- **Where:** `scripts/render.cjs`; `references/design/spec.md`.

## 5. Layout and fit fixes in the renderer

These came from test runs and were fixed in `scripts/render.cjs` unless stated otherwise.

| Symptom | Cause | Fix |
|---|---|---|
| Command text (`command` layout) never shrank and ran into the face | Its font size was set in a CSS rule, so the fit script read `NaN` from the inline style and skipped the loop | The font size is now an inline style on `.fit-inner` |
| `TypeError: icon.startsWith is not a function` in the `command` layout | `command.icon` accepted only a string | It now accepts a string or a tile object `{icon, color}` |
| An empty `ops` entry still drew "+" | A falsy check (`|| '+'`) treated `""` as missing | Uses `?? '+'`, so `""` leaves the operator out |
| Arrow characters in `ops` rendered tiny and thin | Text glyph at operator size | Use `ops: [" "]` plus a hand-drawn `arrow` |
| Two-word chips wrapped inside their pill | Chip width is fixed | Keep chips to one word |
| Underline under a word on line 1 of a two-line headline hit line 2 | The underline sits below the line box | Use `highlight_style: "color"` on two-line headlines |
| Headlines didn't grow to fill their box | Fit only shrank text | Auto-fit now grows and shrinks (`data-grow`, `headline_max`) |
| Trend layout: stage labels collided and "You are here" ran off the edge | Fixed label positions | Labels alternate heights; the marker label is right-aligned inside the frame |
| `scene` bubble text overflowed | Padding and fit box too tight | `.sc-bubble` padding 46px 70px 40px; fit width reduced by 150px |
| A card covered text and the bottom-right timestamp corner | Default position | Card repositioned |
| `split` labels had the wrong colours and clipped | Label colour and box size | Fixed per side |
| Sticky-note labels were centred by accident | `.sc-label{text-align:center}` applied to every label | Scoped to `.sc-bubble` |
| The 4:5 LinkedIn version had dead space at the bottom and the lens handle ran into the corner | Positions copied from the 16:9 layout | Repositioned for 1080×1350; `canvas` sets the size |
| Feed preview showed the thumbnail line instead of the paired title | `package.py` didn't pass the title into each spec | Each spec gets its paired title before rendering (`scripts/package.py`) |
| "YOUR PHOTO · pose" placeholder sits in the timestamp corner | Placeholder bust label position | Harmless: it disappears when a real photo is used. Don't count it as a checklist failure |

Known limits, not bugs: the `syllabus` whiteboard always draws the same system diagram; `marker` has no hero-object field (use `verdict` with a tile when you need an object); four or more thumbnails wrap the desktop feed row.

## 6. Tracking, watching and auditing

### First watch run flagged nothing as NEW

- **Symptom:** a two-day-old video with 407K views was flagged only as an outlier on the first run.
- **Cause:** NEW needed a previous run to compare against.
- **Fix:** on the first run, NEW now means published in the last 7 days. Growth figures (views gained) still need two runs.
- **Where:** `scripts/watch.py`.

### Old videos have no publish date or views per day in the digest

- **Cause:** publish dates come from the channel RSS feed, which covers only about the latest 15 uploads.
- **Fix:** none needed; the digest leaves those fields blank. Use `fetch_videos.py` for exact dates.
- **Where:** `scripts/watch.py` (docstring).

### Audit feed test included the audited thumbnail, or a random mix

- **Symptom:** the distinctiveness score compared a thumbnail with itself, or with thumbnails from other years.
- **Cause:** `--feed` sampled 11 random files from the folder.
- **Fix:** the audited video is always excluded. With a tracked channel, the feed uses the uploads published around the video; otherwise a fixed-seed random sample, and the report says which.
- **Where:** `scripts/audit.py`.

### Audit sheet labels overlapped

- **Symptom:** "Squint test: does one shape still dominate?" ran into "Value test: does it hold without colour?".
- **Fix:** the labels were shortened ("Squint test", and the value test label) so they no longer run into each other.
- **Where:** `scripts/audit.py`.

### The "2h+" line missed most courses

- **Symptom:** `summary.txt` counted only 2 long videos for a channel whose course outliers ran 1h50m to 3h05m.
- **Fix:** the line now uses a 90-minute cut-off ("90min+ videos").
- **Where:** `scripts/track_channel.py`.

### Seeding a watch snapshot by hand fails

- **Symptom:** `FileNotFoundError: watch-test/snapshots/nicksaraev.jsonl`.
- **Cause:** `watch.py add` doesn't create `snapshots/` until the first run.
- **Fix:** `mkdir -p <state>/snapshots` before writing a seed file, or just do a first `run`.

### `report.html` shows no images when shared

- **Cause:** it loads thumbnails from the relative `thumbs/` folder.
- **Fix:** share the whole workdir (zip it), or publish the page together with its `thumbs/` files.

## 7. Research workflow

### Teardown agents wouldn't write files

- **Symptom:** the three latest-30 teardown agents wrote plans instead of files; resumed agents still refused.
- **Cause:** plan mode was on when they started, and a resumed agent keeps that state.
- **Fix:** start a fresh agent to write the files from the saved analyses. When one still refused, another fresh agent wrote Sabri's files and the cross-creator summary.

### Background work stopped after a worker restart

- **Symptom:** "This session's worker process was restarted" (four times during the build).
- **Fix:** check what each background task finished (files on disk, logs such as `fetch.log`) and rerun only what's missing. Fetches are safe to rerun; they overwrite the same files. `track_channel.py` skips thumbnails it already has.

## 8. Packaging the skill

### The validator rejected "<" in the description

- **Symptom:** `Validation failed: Description cannot contain angle brackets (< or >)`.
- **Cause:** the skill packager won't accept `<` or `>` in the frontmatter description.
- **Fix:** reword without angle brackets (write "under 70 characters", not "<70").
- **Where:** `SKILL.md` frontmatter.

### Scripts fail with a relative path

- **Symptom:** `node scripts/render.cjs spec.json out/` fails when run from the output folder.
- **Fix:** run scripts by absolute path, `<skill-dir>/scripts/...`, and run Python scripts with `python3 -I`.

## 9. Quick reference

| Symptom | Fix | Where |
|---|---|---|
| 429 / "Sign in to confirm you're not a bot" on a video | Use `youtubei/v1/next` | `scripts/fetch_videos.py` |
| Transcript endpoint 400 | Ask for a transcript or file | `scripts/transcribe.py` |
| @SabriSuby 404 | `@SabriSubyOfficial` | `research/data/README.md` |
| LinkedIn 429 | No scraping; adapted rules | `frameworks/linkedin-framework.md` |
| Hashtags show "#1" | Regex on description: `#` + letter | `research/method.md` |
| Views missing | Shown as "?", excluded | `scripts/track_channel.py` |
| PyAV `metadata_errors` | ffmpeg s16le into numpy | `scripts/transcribe.py` |
| Fonts or logos blank | Bundled fonts; `img:` for logos offline | `scripts/render.cjs`, `assets/fonts/` |
| Playwright missing in Python | Use Node; never `playwright install` | `scripts/render.cjs` |
| Text overflow or overlap | See section 5 | `scripts/render.cjs` |
| "<" rejected on packaging | Reword the description | `SKILL.md` |
