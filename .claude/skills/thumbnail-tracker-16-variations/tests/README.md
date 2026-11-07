# Tests

Run from the skill root:

```bash
python3 -m unittest discover tests
```

Needs Python 3.9+ with Pillow and numpy. The render test also needs Node with Playwright and
Chromium; without them it skips with a reason, and the rest still run. No network is needed:
the renderer uses the bundled fonts in `assets/fonts/`.

| File | What it checks |
|---|---|
| `test_package_checks.py` | `package.check`: titles over 70 characters, chapters not starting at 0:00, fewer than 3 chapters, chapters under 10 s apart, referral links without a disclosure, LinkedIn hooks over 140 characters, hooks that repeat a title, hashtag count outside 3–5, posts over 3,000 characters. `package.placeholders` (including `[your link]`). `package.schema_check` (duplicate ids). `fetch_videos.hashtags` ignores `#1`, `#17` and `&#39;`. |
| `test_schemas.py` | Every `examples/*.json` validates against `schemas/`; the Pecuna brand profile shape is accepted; broken specs, batches and brands fail; unknown thumbnail fields are warnings only. |
| `test_research_figures.py` | Runs `scripts/verify_research.py`: every `N.NN×` figure in `references/research/overview.md` and `creators.md` traces back to `references/research/data/` or the documented whitelist. |
| `test_render_regression.py` | Renders `examples/read-their-mind-final.json` with `THUMB_OFFLINE=1` (Google Fonts blocked) and compares each image with `tests/golden/`: mean absolute difference < 2.0/255 and 99th percentile < 40. |

`tests/evals/` holds the skill's trigger and routing evals. They are data, not unit tests.

## Render regression

The goldens (`yt-D1-spotlight.jpg`, `li-video-D1-1920x1080.jpg`, `li-post-D1-1080x1350.jpg`)
were rendered by the 2.x renderer, which loaded Google-hosted fonts. Results with the bundled
fonts (3.0.0):

| Image | Mean abs. diff (/255) | 99th percentile |
|---|---|---|
| yt-D1-spotlight.jpg | 0.071 | 3 |
| li-video-D1-1920x1080.jpg | 0.060 | 2 |
| li-post-D1-1080x1350.jpg | 0.043 | 0 |

Print the numbers on any run with `THUMB_REGRESSION_REPORT=1 python3 -m unittest discover tests`.
Skip the render test on purpose with `THUMB_SKIP_RENDER=1`.

If a deliberate design change moves the output, re-render and replace the goldens:

```bash
THUMB_OFFLINE=1 node scripts/render.cjs examples/read-their-mind-final.json /tmp/golden
cp /tmp/golden/{yt-D1-spotlight,li-video-D1-1920x1080,li-post-D1-1080x1350}.jpg tests/golden/
```

To compare any two folders of renders: `python3 scripts/imgdiff.py dirA dirB`.

## Packaging

`python3 scripts/package_skill.py` builds the zip, checks it, extracts it to a temp folder and
runs this suite there (`--skip-render` skips the render test). Test output written under
`tests/output/` is never packaged.
