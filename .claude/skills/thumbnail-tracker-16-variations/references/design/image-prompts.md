# Image-model prompts for scenes the renderer can't draw

The renderer handles type, logo tiles, cards, charts and layout. It can't paint scenes: 3D mascots, voxel worlds, glowing hero objects, a person holding something, a stylised portrait. When a concept needs one, write a prompt for an image model and composite the result:

1. Generate the scene with an empty zone where the text goes (the prompts below reserve it).
2. Put it behind the layout with `"bg_image": "/abs/path/scene.png"` (and `"bg_dim": 0.25` if text needs more contrast), or use it as a hero tile with `"icon": "img:/abs/path/object.png"`.
3. Render, then run the feed preview as usual.

Write prompts for whichever model the user has: Nano Banana / Gemini image, GPT-image, Midjourney, Flux, Ideogram. Keep the structure below; adjust only the syntax (e.g. `--ar 16:9` for Midjourney).

## Prompt structure

```
[Subject, one clear object or character] + [style] + [lighting] + [background] + [composition and empty zone] + [constraints]
```

- **One subject.** Thumbnails fail when the scene has two focal points.
- **Style words that match the playbook:** "glossy 3D app-icon style, soft studio lighting, subtle bloom", "clean product render", "voxel / Minecraft style", "flat vector sticker with thick outline".
- **Reserve the text zone explicitly:** "leave the top third empty, plain background", "subject in the right half, left half empty".
- **Ask for no text.** Image models misspell; all words come from the renderer. Add "no text, no letters, no logos".
- **Aspect ratio:** 16:9, 1280×720 or larger.

## Templates

**Hero object (verdict, equation):**
```
A single glossy 3D [object, e.g. "golden trophy shaped like an asterisk"] centred, rendered like a premium app icon,
soft studio lighting with gentle bloom, [colour] rim light, plain [cream / near-black] background,
object occupies the lower 60% of the frame, top third completely empty, no text, no letters, 16:9.
```

**Mascot / villain (the crying-crab move):**
```
A cute, slightly sad 3D cartoon [creature] mascot with big glossy eyes and one tear, Pixar-like clay render,
bright [colour] body, soft shadow on a plain white background, character on the right half,
left half empty, no text, 16:9.
```

**World / spectacle (game, voxel, sci-fi):**
```
A dramatic voxel-art scene of [scene], cinematic low angle, volumetric light, high detail,
main subject on the right two-thirds, clear sky area top-left for a headline, no text, 16:9.
```

**Background plate behind a face:**
```
A softly blurred modern [office / studio / server room] at night, warm practical lights,
shallow depth of field, darker on the right side where a person will be composited, no people, no text, 16:9.
```

## Rules

- Never generate a real, identifiable person (the user's own face comes from their photo via `scripts/prep_face.py`).
- Don't recreate another company's logo with an image model. Use `si:` icons or the official logo file.
- When a generated object stands in for a real product result (e.g. a revenue figure), label it as illustrative or don't use it.
