# Whiteboard Wednesdays verification

## Local verification, 7 October 2026

The executable browser harness passed 548 assertions with no runtime errors. It covers every reveal in all 26 slides at 375, 390, 768 and 1280px, with no horizontal page overflow at those widths.

Interaction coverage: library and chapter navigation, click/keyboard reveals, Back, Replay, notes, fullscreen entry/exit and slide changes, the full-window fallback, canonical direct links, refresh, browser Back/Forward, reduced motion and the complete reading view.

An injected second deck proves independent published branding, browser-only previews, slide/reveal positions and survey answers. It is not in the production register or static output. Previous embedded demonstrations unload when switching decks or hiding their reveal.

Document coverage: lazy PDF and campaign board loading, separate PDF link, failed PDF retry/recovery, failed deck source recovery, missing deck/slide links and missing slide/cover/logo images. Survey passing, review and disqualification paths were exercised.

Preservation comparison: original slide text, notes, HTML and survey data are identical to the retained approved source. Explicit reveal arrays are the only content-package addition. All copied image, PDF, SVG, font and licence assets are byte-identical. The reading page's return link now opens the shared viewer.

An independent read-only code review identified fullscreen transition, skip-link routing, hidden media, reading-link and missing-asset issues. Fixes were added with regression tests. The router also now decodes encoded identifiers safely.

Screenshots were inspected for the desktop and mobile library, source-to-creative slide, research and expanded email. Screenshots are captured only after reveal opacity reaches 1.

## Device limitations

Automated checks use Chromium at the listed viewport widths, not physical phones. Native PDF scrolling and true browser fullscreen vary by mobile browser. The separate PDF link and full-window presentation mode remain available. Private access requires the authorised ChatGPT account; no public audience has been requested.

## Deployment verification

The private hosted site passed the same 548 browser assertions on 7 October 2026. The second presentation exists only as a browser test fixture, not a published deck. The hosted harness supplies private authentication to its intercepted register fetch and waits for the campaign board URL before checking replay.

All 17 non-HTML deployed files were byte-identical to the tested local files. The four HTML files preserve the complete local content with only an additional Cloudflare security script inserted by the host. Anonymous access returned HTTP 401. Sites access read-back confirmed one owner, no additional users, no groups and no external visitors.

The final source update contains only this verification record and test-harness corrections. Application files remain identical to the hosted version tested above. Sites version 1 is retained for rollback. The older paid ads site, native Page and original approved local presentation were not changed.
