# Handing a recording to Subi Shots

Whiteboard Wednesdays makes and presents the deck. Subi Shots edits the screen recording of that presentation, adding speech-timed graphics and sentence focus zooms. This file covers what to pass across, so the edit respects the deck.

## Before recording

1. Open the deck in full screen with "Present full screen". The recording tools stay in the control bar.
2. Press **Record cues (R)** at the moment the screen recording starts, or note the offset if you cannot start them together.
3. Present normally. Use Spotlight (S) to direct attention and Pen (P) for live marks; both are captured in the recording.
4. Press **Record cues** again at the end and copy the cue list from the presenter panel.

## What to give Subi Shots

- **The recording**, landscape, with clear audio. It is the source of truth for timing.
- **The cue list:** one line per reveal: time from the start, slide ID, reveal number and device. Example:

```
# Start your screen recording when you press Record cues. Times are from that moment.
00:00.0  device-zoom  reveal 0/3  Zoom into the source
00:04.8  device-zoom  reveal 1/3  Zoom into the source
00:11.2  device-zoom  reveal 2/3  Zoom into the source
```

- **The deck's confirmed brand profile**, as a candidate. Subi Shots still asks the user to confirm colours and fonts for the video: that is its own master rule.
- **The reading view or deck spec**, for exact on-screen wording and evidence IDs.
- **The source PDF and assets**, if Subi Shots should rebuild a graphic rather than reuse the recorded slide.

## Rules for the edit

- **Boards are evidence.** Keep slides visible while they are being explained, including static holds. Prefer a crop or a callout in unused space over replacing a slide with a new graphic.
- **Quotes and figures stay exact.** A graphic that restates a slide uses the same verified wording, IDs and page references.
- **The spoken narration controls timing.** The cue list helps align zooms with reveals; it does not override what was actually said.
- **Do not double-zoom.** If a slide already zooms (`d-zoom`), let the slide's own camera carry it. Add a Subi Shots focus only on a different detail or a different sentence.
- **Illustrative stays labelled.** If an illustrative asset appears full screen in the edit, keep its "illustrative, not launched" label visible.

## Limits

Record cues logs times only. It does not record video or audio, and does not run Subi Shots. Times are relative to pressing the button, so a late start shifts every cue by the same amount; note the offset.
