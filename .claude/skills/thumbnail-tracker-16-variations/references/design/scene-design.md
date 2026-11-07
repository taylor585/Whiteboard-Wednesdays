# Scene design: thumbnails with no presenter photo, and how to make them pop

> **Superseded for Pecuna Factorem (2 Nov 2026).** Taylor rejected flat `scene` thumbnails ("so flat… where is the professionalism") and approved the objects-only standard: `references/design/objects-only-standard.md`, built with `scripts/hero/build_hero.py`. Use this file for other brands, and for the object vocabulary and the pop recipe's lighting logic, which the standard keeps (one hero, one light pool, bright accent only, bottom-right clear).

Read this when the user has no face photo, wants objects instead of a face, or asks to make a thumbnail "pop", "darker", "more contrast" or "stand out more". The field reference is in `references/design/spec.md` (the `scene` archetype). This file covers **which objects to use and why**, with a worked case study.

**Evidence level.** The case study is a design decision the user made by eye, not a measured result. The principles below are standard visual hierarchy, and they line up with the research (one idea, one line, visible proof). They are not yet proven on views. Ship the dark and light versions as a Test & Compare pair when you can.

## Contents
1. Case study: "Read their mind" (light → dark, 7 versions)
2. The pop recipe (checklist + spec fields)
3. Three dark patterns and when to use each
4. When not to go dark
5. Object vocabulary for scenes
6. Sizes from one design (YouTube + LinkedIn)

## 1. Case study: "Read their mind"

**Brief.** A 39-minute video about an AI agent that researches a business's ideal customer profiles (ICPs). The working title was "ICP Buyer Research"; the paired YouTube title was "I Built an AI Agent That Finds Your Buyers' Exact Words". There's no presenter photo. The proof comes from the video itself: one ICP scored an **88% fit**, and a real buyer fear reads "someone googles med spa, tries calling, no answer, books at the place next door instead". The client stays unnamed ("med spa client").

Images: `assets/case-study/` (1–6 are the versions in order, `before-after-B-to-D1.jpg`, `7-D1-linkedin-4x5.jpg`). Spec: `examples/read-their-mind-final.json` (the winner and its LinkedIn sizes). The earlier rounds are in `examples/read-their-mind.json` (light) and `examples/read-their-mind-dark.json` (dark).

### Round 2: three light ideas with no photo (cream brand background)

Round 1 was five face-placeholder concepts (`examples/icp-buyer-research/thumbnails/round1-concepts/`). Taylor liked the line "Read their mind." but had no photos, so round 2 rebuilt it from objects.

| Version | Objects | What it said | Verdict |
|---|---|---|---|
| A · Thought bubble | Head profile, thought bubble "No answer. Next clinic.", ICP report card "88%" | "This is what they're thinking" | Clear, but three objects compete. The head is generic clip-art. |
| **B · Report + lens** | ICP report page with the real FEAR quote highlighted, a magnifying glass enlarging "No answer. Next clinic.", a chip "#1 ICP · 88% fit" | "We found their exact words in the research" | **Picked by the user.** One metaphor (the lens) carries the whole promise: research that finds the exact words. |
| C · Mind x-ray | Head, three labelled notes (fear, their words, report) with arrows into the brain | "Everything feeds their mind" | Too many words for 168px. It reads as a diagram, not a thumbnail. |

**Who picked what.** Claude recommended A (the thought bubble). Taylor picked B (the magnifying glass), and was right by the framework's own logic, which is the lesson below.

**Lesson from round 2.** The winning object **acts out the video's promise**: a lens over a report means "we look closely and find the real words". A head or a bubble only illustrates the topic. Pick the object that does what the video does.

### Round 3: making B pop (the user asked for "more black, make the background pop")

Three dark versions, each with one idea:
- D1 Spotlight: a light pool behind the lens.
- D2 Research board: a dot grid, a pin and red string.
- D3 Redacted dossier: everything blacked out except what's under the lens.

**D1 won.** Here is every change from B to D1, and why it works:

| # | Change | Spec | Why it works |
|---|---|---|---|
| 1 | Cream ground → near-black | `theme: "dark"`, `theme_overrides: {bg: "#0A0908", glow: false}` | A dark ground stands out when the surrounding feed is light. The niche is mixed: Riley uses dark grounds on 17 of his top 20, about half of Nick's top 20 are dark, and Nick's recent clean era is light. So choose the opposite of the feed you're competing in, and test light vs dark. `glow: false` turns off the theme's automatic glow, so you decide where the light goes. |
| 2 | One light pool behind the hero | `{type: "glow", x, y, d: 900, color: "#CB8E03", opacity: .55, z: 1}` centred on the lens | The eye goes to the brightest spot. Put the brightest spot on the object that carries the promise, and nowhere else. |
| 3 | Darkened edges | `vignette: 260` | Pulls the corners down, frames the centre and hides empty space. |
| 4 | The lens becomes lit glass | `ring: "#CB8E03"`, `glow: "#CB8E03"`, `bg: "radial-gradient(circle at 35% 30%,#FFFDF6,#F6DF8C)"` | A bright ring, a halo and a warm fill turn a flat circle into a light source. It's the one thing you see at 168px. |
| 5 | The report page dims | `doc.dark: true`, `highlight_bg: "rgba(246,223,140,.28)"` | Supporting evidence stays readable but sits one level below the hero. Two contrast levels (hero bright, evidence dim) instead of everything shouting. |
| 6 | Cream headline, bright-brass underline | `headline_color: "#F5EAD8"`, `accent: "#CB8E03"` | On dark, use the **bright** accent. The deep brand gold (#8B6002) disappears on black (see `references/design/spec.md` gotchas). |
| 7 | Chip flips to bright brass with dark text | `bg: "#CB8E03", fg: "#0A0908"` | It stays a secondary highlight that echoes the lens colour, so the frame has one accent family. |
| 8 | Handle cleared from the timestamp | lens moved to x 735, y 185 | YouTube's duration badge covers the bottom-right (about x 1150–1270, y 660–710). |
| 9 | Checked at phone size | `_feed-preview.png` | "No answer. Next clinic." is still readable at 168px wide. If it isn't, cut words, don't shrink the font. |

What stayed the same: the headline, the real quote, one red phrase ("Next clinic." in red = the problem), and the one-object metaphor. **Darkening is a lighting change, not a redesign.**

### Why not D2 or D3
- **D2 Research board** suits a "connecting the clues" video. Here the string and pins add a second idea (connection) to the lens idea (finding).
- **D3 Redacted dossier** is the most dramatic, but it hides the real quote, which is the proof. Use it when the hook is a secret, not a finding.

## 2. The pop recipe

Use it for any scene (or face layout) that feels flat. Apply it in this order and stop when it pops:

1. **Name the hero.** One object that acts out the promise. Everything else is evidence or decoration.
2. **Dark ground:** `theme: "dark"` + `theme_overrides: {bg: "#0A0908", glow: false}`. Use a near-black from the brand's ink, not pure #000.
3. **One light pool** behind the hero: `glow` element, `d` 700–1000, `opacity` .4–.6, in the bright accent.
4. **Vignette** 200–300.
5. **Light the hero itself:** a bright ring or outline, a halo (`lens.glow`), and a warm inner fill. The hero must be the brightest thing in the frame.
6. **Dim the evidence:** `doc.dark`, muted lines, translucent highlight.
7. **Bright accent only:** swap deep brand colours for their bright tint on dark (gold #8B6002 → #CB8E03). Keep one accent family. Red only for the problem phrase.
8. **Cream text, not white:** #F5EAD8 is softer and still contrasts.
9. **Check:** at 168px, in greyscale (squint test), with the bottom-right corner clear, and next to the user's last 5 thumbnails in `_feed-preview.png`.

## 3. Three dark patterns

| Pattern | Use when the video… | Key elements | Example |
|---|---|---|---|
| **Spotlight** | reveals one finding, insight or number | `glow` behind the hero, lit `lens` or `card`, `doc.dark` | D1 (`examples/read-their-mind-final.json`) |
| **Research board** | connects evidence, shows a process or investigation | `bg_pattern: "dots"`, cream `doc` pinned with `pin`, `string` from pin to hero | D2 (`examples/read-their-mind-dark.json`) |
| **Redacted dossier** | exposes a secret or something hidden | `doc.dark` with `kind: "redacted"` lines, one revealed line under a glowing lens, a mono stamp `chip` (`border`, `mono`) | D3 (same file) |

## 4. When not to go dark

- The user's last 5 uploads are already dark. Contrast with your own feed matters as much as with the niche.
- The brand is light-led and the video is a calm how-to or course. Light/cream did well for Nick (see `references/design/playbook.md` §2.8).
- Faces on very dark grounds need rim light. Without a lit photo, a dark face layout looks muddy.

When unsure, render both and ship them as a Test & Compare pair.

## 5. Object vocabulary for scenes

| Element | Says | Good for |
|---|---|---|
| `lens` | "we looked closely and found it" | research, audits, finding the real reason |
| `doc` (+ tags, highlight) | "here's the evidence" | reports, transcripts, quotes, findings |
| `doc` redacted | "this is hidden" | secrets, insider methods |
| `card` (rank + value) | "here's the score" | rankings, fit scores, benchmarks |
| `bubble` + `head` | "this is what they think" | customer psychology, objections |
| `sticky` | "a note to remember" | tips, single rules |
| `highlighter` | "mark this bit" | copywriting, editing |
| `chip` | label or stamp | proof figure, "NEW VIDEO", rank |
| `glow` | where to look | the hero, always only one |
| `pin` + `string` | "these are connected" | investigations, frameworks |

Rule: at most one hero + two supporting objects. More than that fails at 168px (lesson from version C).

## 6. Sizes from one design

Design at 1280×720, then:
- **YouTube:** as is (`format: "jpg"`, under 2MB).
- **LinkedIn native video cover:** the same spec + `scale: 1.5` → 1920×1080. LinkedIn's play button sits in the centre, so make sure the hero's key words aren't dead centre.
- **LinkedIn 4:5 post (1080×1350):** re-lay out the scene with `canvas: {w:1080, h:1350}`:
  - chips across the top ("NEW VIDEO · N MIN" + the proof chip);
  - the headline large on one line;
  - the evidence page in the middle;
  - the hero overlapping its lower right, with the light pool moved to the hero;
  - the bottom ~150px kept calm.

  Example: `li-post-D1-1080x1350` in `examples/read-their-mind-final.json`.
- **LinkedIn link preview (1200×627):** LinkedIn builds it from the YouTube thumbnail by cropping about 24px from the top and bottom. Keep the headline and chips more than 30px from the top edge.
