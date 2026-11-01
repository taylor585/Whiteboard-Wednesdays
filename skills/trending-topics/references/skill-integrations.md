# How this skill works with our other skills

Trending Topics finds the topic and writes the plan. Other skills make the assets. Load a skill only when its step is actually happening, and never claim a skill was used if it was not loaded.

| Step | Skill | What it does here | Hand-off |
|---|---|---|---|
| Breaking a skill down for Act 1 and Act 2 | the topic's own skill (for example `harness-chassis-builder-no-schedules`, `vision-board`) | The source to reverse-engineer line by line | Read its SKILL.md and every reference file in full |
| Thumbnail render and audit | `thumbnail-tracker` | Renders the thumbnail lines we wrote, audits at phone size, tracks results | Pass the A/B title + thumbnail line pairs from PACKAGING |
| Turning a brief into slides | `whiteboard-wednesdays` | Builds the deck (three-slide calibration first) in Pecuna Factorem branding | Pass the brief; segment headlines become slide titles, one-liners become reveals, quotes stay verbatim |
| Spoken script polish | `finishing-touches-copy-and-scripts` | Makes any scripted lines (cold open, close) sound like Taylor | Pass the HOOK and CLOSE lines only |
| Post-production | `suby-shots` | Edits the recording with speech-timed graphics | Pass the recording plus the brief's segment one-liners and the whiteboard recording cue list |
| Examples that run a harness on camera | `harness-chassis-builder-no-schedules` | The live example's kickoff and loop | Appendix prompts in the brief |
| Campaign examples | `breakthrough-advertising-mastery`, `world-class-copywriting`, `llm-image-creator`, `ugc-script-creator`, `fable-website-funnel-design` | Only when an example actually produces those assets | Name them in the example's skill bindings table |
| A chosen topic we have no work on yet | `funnel-hacking-forensics` and others | Do the smallest real piece of work before recording, for talking points | A "before you record" task in the brief's PREP CHECKLIST |

## Order of a full week

1. Trending Topics: Pick (Table One our work, Table Two creators) → Taylor chooses 3 → talking points → Plan the week (3 briefs with PACKAGING).
2. Whiteboard Wednesdays: a deck per brief, if Taylor wants slides.
3. Record, reading each brief's READ BEFORE YOU RECORD.
4. Suby Shots: edit.
5. Thumbnail Tracker: render and audit the thumbnails from PACKAGING; after publishing, track results.
6. Next Pick run deprioritises what was recorded in the last 4 weeks.
