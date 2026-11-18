# Manager screen

The Manager is the first tab and the screen the app opens on (`#/manager`; an empty hash lands there, and `#/library` still
opens Presentations). Taylor picked direction A from the Manager vision board on 16 November 2026 (four cards, two by
two), and on 18 November 2026 picked P4 "Pentagon" from the pentagon vision board: five cards on a drawn gold pentagon.

| Slot | Card |
|---|---|
| Top (the point) | Editing live: recorded, and an edit, render or re-render is running now |
| Middle left | Ready to post: all four videos done (YouTube, LinkedIn, reel, 4:5 post) |
| Middle right | Edited, missing a reel: YouTube and LinkedIn finished, no reel and no edit running |
| Bottom left | Deck built, ready to record: the Whiteboard Wednesdays presentation is finished |
| Bottom right | Topic in a chat: only a topic so far |

A gold ruled pentagon joins the centres of the five cards (gold only as the line, never a fill). The round **Update**
press sits at the heart: it reads `manager/status` again at once, redraws all five cards and every count, shows when it
checked, and writes `manager/refresh` (`{requestedAt, from}`) as a request for a fresh report. The page still cannot read
the chats itself; a fresh report comes from the Manager chat. On phones the cards stack and Update sits above them.

Every Pres: chat is one orb. An orb grows a little with the number of questions waiting on Taylor, and its label always
fits inside its circle. Tap an orb to see its parts, its questions and a check for each. The orbs float (the one ambient
loop on this screen, stopped under reduced motion).

## Where the data comes from

The page cannot read the chats on Taylor's Mac. The **Manager chat** (the session running the
`whiteboard-wednesdays-manager` skill) can. Each time it reports ("Update please"), it also writes one document into the
app's database with ArtifactData, and the page follows it live. The page never writes `manager/status`; it writes only `manager/answers` and `manager/refresh`.

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
      "category": "live | ready | reel | deck | topic",
      "when": "Posts Thu 19 Nov",
      "chat": "Pres: Blender",
      "topicId": "optional topics/<id>",
      "parts": [{ "name": "YouTube", "done": true, "note": "32:05" }, { "name": "Reel", "done": false, "note": "record today" }],
      "asks": [{ "id": "thumb", "question": "Use thumbnail t15 on YouTube and LinkedIn?", "options": ["Yes, t15", "Show all 16"] }]
    }
  ]
}
```

- `category` is one of the five keys only. A recorded video whose edit is running goes in `live`, not `reel`.
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
