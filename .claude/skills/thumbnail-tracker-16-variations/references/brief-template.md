# Packaging brief template

Give the skill a brief in this shape, or fill it in from the user's message and transcript before packaging. It's modelled on Taylor's brief for the ICP video (`examples/icp-buyer-research/brief.md`). Any missing field is fine: the skill works from what's there and says what it assumed.

```text
You're helping with YouTube packaging for a finished video. Give me:
1. <N> thumbnail concepts
2. <N> title options
3. a full YouTube description
(4. LinkedIn posts, if posting there)

Use the thumbnail tracker skill.

THE VIDEO
- Brand: <brand> (<presenter>). <UK/US> English.
- Working title: <...>. Length <mm:ss>, <16:9>, <edit state>.
- Audience: <who, what they run, what they want>.
- Core promise: <the one promise, in a sentence or two>.
- Format: <talking head / screen recording / both>.

STORY / KEY POINTS (in order)
1. <problem>
2. <mechanism / insight>
3. <the tool / method>
...

STRONGEST LINES FOR THUMBNAILS / TITLES (the presenter's own words)
- "<line>"

CHAPTERS (exact timestamps for the description)
0:00 <...>

VISUAL ASSETS AVAILABLE FOR THUMBNAILS
- <photos, frames, on-screen graphics, logos>
- Brand look: <colours with hex>, <fonts>, <logo rules>, <colour meanings>

RULES
- <client names to avoid>
- <figures allowed: only those said in the video>
- <title length, hook position, thumbnail text length>
- <description must-haves, CTA, hashtags, placeholders>

OUTPUT
For each thumbnail concept: text on the image, layout, colours, why it earns the click, which title it pairs with.
Then rank the top 3 title + thumbnail pairs.
```

**How the skill uses each field:**
- the **promise** and **audience** feed headline step 1 and thumbnail step 1;
- **strongest lines** become thumbnail lines;
- **chapters** go straight into the description, and are never guessed;
- **visual assets** decide face vs scene and the proof available;
- **rules** override defaults.
