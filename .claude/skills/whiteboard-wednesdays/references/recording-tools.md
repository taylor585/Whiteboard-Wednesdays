# Recording tools

Four presenter tools in `scripts/device-kit.js`, for presenting and recording Whiteboard Wednesdays. They sit in the control bar, next to the progress counter, so they stay visible in full-screen mode. They are presenter aids; they never become slide content, and they never change the deck.

Enable them in a trial spec with `tools: true`. `build-trial.cjs` then includes the script and calls `WWDeviceKit(deck)` after the viewer starts. Adding them to the live site's viewer is a separate change. It needs the user's approval and a full regression run on every existing deck.

The kit learns the current slide and reveal by watching the viewer's `#progress` status text and the URL. If a future viewer changes that text format ("reveal 2 / 3", "complete"), update `current()` in `device-kit.js`.

## Spotlight (S)

- **What it does:** dims the screen except for a circle around the pointer, so the audience looks where you are talking.
- **Behaviour:** a fixed overlay with `pointer-events:none`, so clicks still reach the slide and reveals still advance. It turns off pen mode, because the two compete for attention.
- **Limits:** follows a mouse or pen pointer; on touch screens it follows the last touch.
- **Tests:** visible when on; follows the pointer; a canvas click still advances; S toggles it.

## Pen (P) and Clear (C)

- **What it does:** draw freehand in gold over the slide while you explain, then clear it.
- **Behaviour:** the drawing layer sits over the slide area but outside `#canvas`. Strokes therefore never count as a reveal click. Strokes clear automatically when the slide changes, so annotations never carry onto the wrong slide. The layer resizes with the slide and keeps existing strokes when it does.
- **Limits:** strokes are not saved. Use marker annotations (device 5) for marks the audience should see every time.
- **Tests:** a drag draws pixels without changing progress; C clears; changing slide clears; the status chip's "Stop pen" turns it off.

## Presenter (V)

- **What it does:** a panel showing a timer, the current slide and reveal, the text of the next reveal (or the next slide's title) and the presenter notes.
- **Behaviour:** an in-page panel on the right. "Open in a second window" opens a plain presenter window from the same page and keeps it updated, for two-screen setups.
- **Limits:** sandboxed viewers, including private claude.ai pages, often block second windows. The page says so and the in-page panel remains. On a phone the panel covers the slide; close it to present.
- **Tests:** opens; shows the current slide title; shows the next reveal; the timer runs.

## Record cues (R)

- **What it does:** while you record your screen, logs the time of every reveal and slide change. When you stop, it shows a cue list you can copy.
  ```
  # Start your screen recording when you press Record cues. Times are from that moment.
  00:00.0  device-zoom  reveal 0/3  Zoom into the source
  00:04.8  device-zoom  reveal 1/3  Zoom into the source
  00:11.2  device-zoom  reveal 2/3  Zoom into the source
  ```
- **Hand-off:** the list goes to `subi-shots` for post-production: timed zooms, focus moments and on-screen captions aligned to each reveal.
- **Limits:**
  - Times are relative to pressing Record cues, so start the screen recording at the same moment, or note the offset.
  - It does not record video or audio, and does not run Subi Shots.
  - Copying uses the clipboard where allowed and otherwise selects the text for manual copying.
- **Tests:** after starting, one reveal and stopping, the list has a header and at least two timed lines in the format above.

## Status chip

While any tool is on, a chip at the bottom left says so ("Recording cues", "Pen on", "Spotlight on") with a Stop button. This means a recording never captures a tool you forgot was running.

## Keyboard

S, P, C, V and R work whenever the slide player is showing. They do not fire while typing in a field, while a dialog is open or in the reading view. They never conflict with the viewer's own keys (arrows, Space, Escape).
