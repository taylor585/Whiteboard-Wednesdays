# Codex daily automation prompt: Output To CODEX

Copy everything below the line into Codex.

---

You are setting up a daily automation for Taylor's Whiteboard Wednesdays videos. Read this whole brief before you build anything, and ask Taylor if any part is unclear.

## What it does

Every day at **18:00 Europe/London** (UK time, so it follows the clocks going forward and back), check one Google Drive folder, **Output To CODEX**. Find every finished video in it that you haven't handled yet, and get it ready to post on each platform. Claude puts the finished files there. Your job starts once they're in the folder.

## Where it is

- Google Drive folder: **Output To CODEX**
- Link: https://drive.google.com/drive/folders/1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t
- Folder ID: `1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t` (inside Taylor's main Whiteboard Wednesdays folder)

Always use the folder IDs, not folder names, because names can be changed.

| Subfolder | ID | Holds |
|---|---|---|
| Post Copy | `1gKimsHJbaaalQVj6BzbR1OS08tmCJ9ic` | one Google Doc per video with all the post text |
| Post Videos | `1Um3RjVrYlnfMYl8heH5AQv_POsiEy5OV` | the finished video files |
| Post Thumbnail | `1zfb0oOWA_cK8dSpqradxNO6e_DOfgyqN` | the winning YouTube and LinkedIn thumbnails |
| Setup | `1jmJauazJHYD027DTF03H2t6vej-lnD4J` | this prompt and the process document. Ignore it when you look for videos. |

```
Output To CODEX/
├── Post Copy/       <title> - Post Copy                (Google Doc)
├── Post Videos/     <title> - YouTube.mp4
│                    <title> - LinkedIn.mp4
│                    <title> - Instagram and Facebook - Reel.mp4
│                    <title> - Instagram and Facebook - 4x5.mp4
├── Post Thumbnail/  <title> - Thumbnail - YouTube.jpg   (1280 × 720)
│                    <title> - Thumbnail - LinkedIn.jpg  (1920 × 1080)
└── Setup/           (ignore)
```

There are no folders per video. All of one video's files sit side by side in the three subfolders, and every name starts with the video title.

## How everything is named

`<title>` is the video title. In file names, `:` becomes ` -`, `/` and `\` become `-`, and `* ? " < > |` are removed. The Google Doc's first heading has the exact title.

**Post Videos** (the extension may be `.mp4` or `.mov`):

| File | Platform | Format |
|---|---|---|
| `<title> - YouTube.mp4` | YouTube | 16:9 long video, 1080p |
| `<title> - LinkedIn.mp4` | LinkedIn | the LinkedIn cut |
| `<title> - Instagram and Facebook - Reel.mp4` | Instagram Reels **and** Facebook Reels (the same file for both) | 9:16 |
| `<title> - Instagram and Facebook - 4x5.mp4` | Instagram feed **and** Facebook feed (the same file for both) | 4:5, 1080 × 1350 |

A video can have two reels. Then they are named `- Reel 1` / `- Reel 2` and `- 4x5 1` / `- 4x5 2`.

**Post Thumbnail** (only YouTube and LinkedIn have one; the name says which video it belongs to, never what is on it):

| File | Use |
|---|---|
| `<title> - Thumbnail - YouTube.jpg` | the YouTube video's thumbnail |
| `<title> - Thumbnail - LinkedIn.jpg` | the LinkedIn video's cover |

**Post Copy**: one Google Doc named `<title> - Post Copy`. Export it as text or Markdown (Drive export `text/plain` or `text/markdown`) and read it by its headings, which always appear in this order:

| Heading | What's under it | Goes with |
|---|---|---|
| Heading 1: the exact video title | nothing | |
| `Winning thumbnails` | `YouTube: <file name> …` and `LinkedIn: <file name> …` | which thumbnail file to use. `Not picked yet` means you must not post that platform yet. |
| `LinkedIn post` | the post text; maybe a `First comment` subheading with the first comment | `<title> - LinkedIn.mp4` + `<title> - Thumbnail - LinkedIn.jpg` |
| `YouTube description` | first line `Title: <YouTube title>`, then the description | `<title> - YouTube.mp4` + `<title> - Thumbnail - YouTube.jpg` |
| `Instagram and Facebook copy - 4x5 post` | the caption (`- 4x5 post 1`, `- 4x5 post 2` when there are two) | `<title> - Instagram and Facebook - 4x5.mp4` |
| `Instagram and Facebook copy - Reel` | the caption (`- Reel 1`, `- Reel 2` when there are two) | `<title> - Instagram and Facebook - Reel.mp4` |

A first comment or post may contain the placeholder `[YOUTUBE LINK]`. Swap it for the real YouTube link once the YouTube video is live. Never post the placeholder itself.

## When a video is ready

Each run:

1. List the files in Post Copy, Post Videos and Post Thumbnail, skipping any in the bin.
2. Each Google Doc in Post Copy named `<title> - Post Copy` is one video. **The Post Copy doc is always written last**, so if there's no doc, the video isn't finished yet. Leave it alone.
3. A video is **complete** when its doc exists and all of these files exist under its exact `<title> - ` prefix: YouTube video, LinkedIn video, the reel (or Reel 1 and Reel 2), the 4x5 (or 4x5 1 and 4x5 2), the YouTube thumbnail and the LinkedIn thumbnail. If anything is missing, do not process it. Report what's missing, and check again at the next run.
4. Skip any video you've already handled (see "Keeping track").
5. Handle each new complete video, one platform at a time: YouTube first, so its link can fill `[YOUTUBE LINK]`, then LinkedIn, then Instagram, then Facebook.

## Keeping track

Keep a record of every video you have handled: the title, the Drive file IDs you used, what you did on each platform, any links, and the date. Use Drive file IDs, not names, to tell whether a file is new or changed. If a file with an already-handled title is replaced later (new file ID), don't act on it again by yourself. Report it to Taylor instead. Keep this record in your own storage, not in the Output folders.

## Rules

- Read only. Never rename, move, edit or delete anything in Output To CODEX, and never add files to Post Copy, Post Videos or Post Thumbnail.
- Only YouTube and LinkedIn get a thumbnail. Instagram and Facebook use the video files as they are.
- Facebook gets exactly the same reel, 4x5 video and captions as Instagram.
- Never post a platform whose thumbnail is `Not picked yet`, and never post a video that's missing any of its files.
- If anything is unclear (two docs for one title, a name that doesn't fit the rules, a file that won't open), stop for that video and tell Taylor. Don't guess.
- Never put passwords or keys in the Drive folder or in any document.

## Each run's report

At the end of every run, send Taylor a short report:
- each video found: complete / waiting (and what's missing) / already handled
- what you did for each new complete video, per platform, with links
- anything that needs his attention

If nothing is new, say "Output To CODEX checked at 18:00: nothing new."

## Before you switch it on

Build it, then run it once by hand against the folder and show Taylor what it found and what it would do, without posting anything. Only schedule the daily 18:00 run once Taylor approves.
