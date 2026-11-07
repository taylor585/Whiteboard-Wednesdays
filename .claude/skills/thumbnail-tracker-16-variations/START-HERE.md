# Start using Thumbnail Tracker - 16 Variations

Install it by uploading the zip as a skill (claude.ai → Settings → Capabilities → Skills), or extract the `thumbnail-tracker/` folder into `~/.claude/skills/`. It replaces earlier versions, because the name `thumbnail-tracker` is the same.

## What to say to it

| You want | Say something like |
|---|---|
| Everything for a new video | "Use Thumbnail Tracker to package this video: thumbnails, 10 titles, the description and LinkedIn posts." Attach the video, transcript or a brief (`references/brief-template.md`). |
| Just titles | "Give me 10 headlines for this video and your top 3 to test." |
| Just the description | "Write the YouTube description with these chapters." It uses the Pecuna house style automatically: WhatsApp CTA on line 1, spaced layout. |
| A thumbnail with no photo | "Make a thumbnail with objects instead of my face." |
| More impact | "Make this thumbnail darker and make it pop. Give me three versions." |
| All the sizes | "Give me the YouTube and LinkedIn versions of the one we picked." |
| Understand the method | "What makes a good thumbnail?" · "Break down the headline framework." · "How do we choose descriptions?" · "Which experts did we research and what did we find?" |
| A creator's style | "Package this in Sabri's style." |
| A second opinion | "Is this thumbnail any good?" (attach it, or give a YouTube link) |
| Research a channel | "What's working for @somecreator?" · "Watch these three channels and tell me what breaks out." |
| After publishing | "It's been 48 hours. CTR is 3.1% vs 4.5% average. What should I change?" |

## What you get

Every package comes with:
- rendered thumbnails labelled by platform and size;
- a feed preview at desktop and phone sizes;
- scored titles with an A/B set;
- the description in one copy-and-paste box;
- LinkedIn posts;
- `board.html`, a review page with copy buttons.

It tells you what's left to finish by hand, such as placeholders or a photo to shoot.

## First run check (optional)

```bash
cd thumbnail-tracker
python3 -m unittest discover tests
node scripts/render.cjs "$PWD/examples/read-their-mind-final.json" /tmp/tt-check
```

The second command renders the "Read their mind" D1 Spotlight thumbnail in all three sizes.

## The model answer

`examples/icp-buyer-research/` holds the full run for the ICP Buyer Research video:
- the brief;
- 10 scored titles;
- three rounds of thumbnails;
- the final files;
- the description as published;
- LinkedIn posts;
- every decision and why.

## Objects-only standard (3.2, the default when Taylor hasn't sent a phone photo)

- "Redo this thumbnail in the objects-only standard: the words are '9 steps. One hour.' and the video is about building a harness in Claude Code."
- "Three looks (dark, bright, on-brand) for the Vision Boards video, like the Harness and Grok ones."
- "Give me the LinkedIn sizes of A1."
