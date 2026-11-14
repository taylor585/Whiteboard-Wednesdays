# Output to CODEX

How a finished Whiteboard Wednesdays video gets from Claude to Codex. Set by Taylor on 14 November 2026.

## In one line

When a video is finished, Claude's **Whiteboard Wednesday Output** skill puts every finished file into the Google Drive folder **Output To CODEX** with fixed names. Every day at 18:00 (UK time) Codex checks that folder, finds each finished video by its title, and takes it from there.

## Who does what

| Step | Who | What |
|---|---|---|
| 1 | Taylor | Finishes the video (YouTube video, LinkedIn video, 4x5 post, Instagram reel, winning thumbnails, post copy) and tells Claude it's finished. |
| 2 | Claude (skill `whiteboard-wednesday-output`) | Copies the files into Output To CODEX with the names below, then writes the Post Copy document **last**. Runs the name check. Never posts. |
| 3 | Codex (daily automation, 18:00 UK) | Lists the folder, finds each complete video, and acts on it. Never renames, moves or deletes Taylor's files. |

## Where it is

Google Drive → Whiteboard Wednesdays → **Output To CODEX** (https://drive.google.com/drive/folders/1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t)

```
Output To CODEX/                    1VneU3aGiwJ3dX7akYjjspnVXuXw03Y2t
├── Post Copy/                      1gKimsHJbaaalQVj6BzbR1OS08tmCJ9ic
│   └── <title> - Post Copy                       (Google Doc)
├── Post Videos/                    1Um3RjVrYlnfMYl8heH5AQv_POsiEy5OV
│   ├── <title> - YouTube.mp4
│   ├── <title> - LinkedIn.mp4
│   ├── <title> - Instagram and Facebook - Reel.mp4
│   └── <title> - Instagram and Facebook - 4x5.mp4
├── Post Thumbnail/                 1zfb0oOWA_cK8dSpqradxNO6e_DOfgyqN
│   ├── <title> - Thumbnail - YouTube.jpg         (1280 × 720)
│   └── <title> - Thumbnail - LinkedIn.jpg        (1920 × 1080)
└── Setup/                          1jmJauazJHYD027DTF03H2t6vej-lnD4J
    ├── Output to CODEX                           (this document)
    └── Codex daily automation prompt
```

Files sit flat in each subfolder, with no folder per video. Every name starts with the exact video title, then ` - `. That's how one video's files are grouped.

## Naming rules (master rules)

1. **Videos:** the platform is in the name. `<title> - YouTube`, `<title> - LinkedIn`, `<title> - Instagram and Facebook - Reel`, `<title> - Instagram and Facebook - 4x5`. The reel and the 4x5 both go to Instagram and Facebook, so each one gets `- Reel` or `- 4x5` at the end to tell them apart. Two reels: `- Reel 1`, `- Reel 2`, `- 4x5 1`, `- 4x5 2`.
2. **Thumbnails:** the name says which video it belongs to, never what is on the image. YouTube and LinkedIn only: `<title> - Thumbnail - YouTube`, `<title> - Thumbnail - LinkedIn`. These are always the winning thumbnails.
3. **Post copy:** one Google Doc, `<title> - Post Copy`, with these headings in this order:
   - Heading 1: the video title, exactly as written
   - **Winning thumbnails**: which file won for YouTube and which for LinkedIn
   - **LinkedIn post** (with a **First comment** subheading when there is one)
   - **YouTube description** (first line `Title: …`)
   - **Instagram and Facebook copy - 4x5 post**
   - **Instagram and Facebook copy - Reel**

In file names, `:` becomes ` -`, `/` and `\` become `-`, and `* ? " < > |` are removed. The document's heading keeps the exact title.

## When a video counts as ready

A video is ready for Codex only when **its Post Copy document exists** and every file in the rules is in place. Claude always writes the Post Copy document last, so a half-copied set is never mistaken for a finished one.

## Rules that never change

- Never a second Output To CODEX folder, and never a folder per video.
- Only finished files: never review copies, drafts or reel covers. Thumbnails are YouTube and LinkedIn only.
- One file per name. A re-run asks Taylor first, and replacing a file moves the old one to the Drive bin.
- Claude's skill never posts. Codex only reads the folder. It never renames, moves or deletes the files.
- Setup holds only the setup documents, never outputs.

## Where this is saved

- GitHub: `taylor585/Whiteboard-Wednesdays` → `.claude/skills/whiteboard-wednesday-output/` (this file, `SKILL.md`, `Setup/Codex daily automation prompt.md`)
- Desktop: `DESKTOP FOLDERS/Whiteboard Wednesdays/.claude/skills/whiteboard-wednesday-output/` (the same checkout)
- Google Drive: `Output To CODEX/Setup/` and `AI Skills 💸/Whiteboard Wednesday Output/`
- Claude: `~/.claude/skills/whiteboard-wednesday-output/`
