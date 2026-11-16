# Manager screen

The Manager is the first tab and the screen the app opens on (`#/manager`; an empty hash lands there, and `#/library` still
opens Presentations). Taylor picked direction A from the Manager vision board on 16 November 2026, laid out two by two:

| Top left | Top right |
|---|---|
| Ready to post: all four videos done (YouTube, LinkedIn, reel, 4:5 post) | Edited, missing a reel: YouTube and LinkedIn edited end to end, no reel yet |
| **Bottom left** | **Bottom right** |
| Deck built, ready to record: the Whiteboard Wednesdays presentation is finished | Topic in a chat: only a topic so far |

Every Pres: chat is one orb. An orb grows a little with the number of questions waiting on Taylor, and its label always
fits inside its circle. Tap an orb to see its parts, its questions and a check for each. The orbs float (the one ambient
loop on this screen, stopped under reduced motion).

## Where the data comes from

The page cannot read the chats on Taylor's Mac. The **Manager chat** (the session running the
`whiteboard-wednesdays-manager` skill) can. Each time it reports ("Update please"), it also writes one document into the
app's database with ArtifactData, and the page follows it live. The page never writes `manager/status`.

### `manager/status` (written by the Manager chat, replaced whole each time)

```json
{
  "updatedAt": "2026-11-16T10:30:00Z",
  "summary": "One sentence: what to film today, what is running, any loose end.",
  "videos": [
    {
      "id": "blender",
      "short": "Blender",
      "title": "Full title as booked",
      "category": "ready | reel | deck | topic",
      "when": "Posts Thu 19 Nov",
      "chat": "Pres: Blender",
      "topicId": "optional topics/<id>",
      "parts": [{ "name": "YouTube", "done": true, "note": "32:05" }, { "name": "Reel", "done": false, "note": "record today" }],
      "asks": [{ "id": "thumb", "question": "Use thumbnail t15 on YouTube and LinkedIn?", "options": ["Yes, t15", "Show all 16"] }]
    }
  ]
}
```

- `category` is one of the four keys only. Put a recorded but unedited video in `reel` until a fifth category is agreed.
- `short` is what the orb shows: a word or two. `id` and each ask's `id` stay stable between reports, so Taylor's answers
  still match.
- Every Pres: chat gets an orb, and so does every topic booked in `topics` that has no chat yet. Posted videos drop off.

### `manager/answers` (written by the page when Taylor presses)

```json
{
  "asks": { "<videoId>:<askId>": { "answer": "Yes, t15", "at": "ISO time" } },
  "parts": { "<videoId>:<part-name-slug>": { "checked": true, "at": "ISO time" } },
  "updatedAt": "ISO time"
}
```

On each update the Manager chat reads `manager/answers` first, passes each new answer or check to the right chat in
Taylor's own words (it never posts or publishes anything itself), then writes the fresh `manager/status`. Once an answer has
been acted on, drop that ask from the status. The page then stops showing it. Leave old keys in `manager/answers`.

## Code

`public/manager.js` and `public/manager.css`; the shell wiring is in `public/library.js` and `public/index.html`. For a
local preview without the database, run `WWManager.show(status)` in the console. Never publish a status fixture.
