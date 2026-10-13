# AI Harnesses deck, 13 October 2026 (branch, not published)

New third deck `ai-harnesses`, 27 slides, from Taylor's Trending Topic Brief and the Harness Chassis Builder - No Schedules skill. Added through `public/presentations.js` with the Pecuna Factorem brand profile, official `ww-coin.svg`, deck-scoped `hc.css`, cover `hc-cover.png` and reading page `hc-reading.html`. No other deck's content or assets changed. `index.html` gains one stylesheet link.

- `build-hc-reading.cjs`: 19 verbatim quotations proven against the skill text (SHA-256 0b5b7e18ff4991dedafdf749995a41e42a040b18b51c7f7d5c50a3b307ca3996); unique stable IDs; contiguous reveal groups; source and note on every slide; no consecutive repeated device; no em or double dashes.
- `verify-hc.cjs`: 1257 assertions passed in local Chromium against the static preview at 375, 390, 768 and 1280px. Every reveal of every slide, overflow, asset errors, notes kept off the slide, keyboard, canvas click, Back, text selection, reveal-linked device states, count-up end values, full-window mode, fresh direct links, refresh, Back/Forward, missing slide recovery, isolated state across decks, tab arrows, browser-only brand preview not persisting, reduced motion and the complete reading view. No runtime errors; the only filtered responses are `/api/ideas` 404s, which need the full server.
- Regression: `verify.cjs` 928 checks, `verify-lge.cjs` 933 checks and `verify-lge-prompt.cjs` passed against the same preview. `verify.cjs` already timed out on unchanged main because the library page no longer shows tabs; its navigation now opens a deck before clicking tabs, and its arrow count covers the third tab. Deck-count assertions are now three.
- Done-gate slide output is real output from the skill's `check_constraints.py` on three demonstration files.
- Not done: full Vinext build, hosted test, physical iPhone/Safari test, independent reviewer, publication. No image generation tool was available; visuals are HTML, CSS and SVG diagrams, and the cover is a rendered HTML drawing.

# Current release verification, 9 October 2026

The paid ads deck contains 29 slides: three Andromeda opening slides followed by all 26 existing slides. Lead Gen Engine remains a separate real 29-slide deck. The historical one-deck statements below apply only to the old release.

Local Chromium checks: `verify.cjs` passed 928 assertions, `verify-lge.cjs` passed 933 assertions, and `verify-lge-prompt.cjs` passed clipboard, navigation, reading and denied-copy checks at four widths. No runtime errors. Widths: 375, 390, 768, 1280px. Chapter checks now resolve stable IDs instead of obsolete indices. Reveal overflow checks were strengthened. Test-only fixtures are not in the production register.

All 27 other dist files are byte-identical to Sites version 4 (c8ebd57e8d86314229e5513362d833ef3fafad6f). Only paid-ad content, its reading page and narrowly scoped CSS differ. All original slide objects and survey data are preserved. Official logos, research PDF, board, images, fonts, licences and all Lead Gen Engine files are unchanged. The full supplied SKILL.md is saved unchanged with SHA-256 928bbef357ad0cc8b2bd773460827a65abf107336fcef8f2d01d4ed466634d1a.

Existing source and Sites current version were reconciled before release. Version 4 remains the rollback target: appgprj_6ac6451343708191b9bea328756578d7~appgver_90bbdeadf08481919836ad398a9d84ba. Access policy revision 1 remains custom, sole owner, no groups or external visitors.

Published successfully as Sites version 5, source commit 6ea0fae85df87b10cc307e07fc96c55cdff68152, deployment appgdep_6ac8a3f5e7a08191951ff44de846b6a9. Native Sites save/deploy returned succeeded. The matching archive was produced with git archive from that exact pushed commit. The Sites workflow helper was unavailable in this environment; source was synchronised through the existing authenticated Sites Git remote, and the archive was supplied directly to the native publish tool.

Hosted browser QA and deployed-byte comparison were attempted but blocked by the environment proxy (HTTP CONNECT 403; Chromium ERR_TUNNEL_CONNECTION_FAILED). No hosted assertion count, anonymous-access result, or served-byte identity is claimed for this release. This is an environment reachability failure, not a detected Site failure. Access was read back through Sites and remains unchanged.

Captured 116 complete-slide screenshots after fonts and transitions settled, across all four widths. Inspected desktop and phone contact sheets and individual opening-slide renders. The native PDF preview is not certified by these screenshots; its separate-document fallback and embed navigation passed local checks. These are Chromium checks, not physical Safari/iPhone tests. The separate PDF link and full-window fallback remain available.

---

# Historical record (7 October, not current release evidence)

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

## Source handover, 12 October 2026

Restored text-only underlined main navigation from Taylor's supplied screenshot. Removed the two navigation icons and dark active pill. Preserved presentation content and the Video ideas implementation.

Current source is public/, with server routes in app/. README.md and CLAUDE.md now document the correct source paths and static/full-server preview commands for Claude. Generated dist output, dependencies, local databases and secrets are excluded.

Passed this session: full Vinext build, TypeScript noEmit check, all four YouTube adapter tests. Browser tool rejected the preview tab under its URL policy, so no new rendered screenshot or responsive browser pass is claimed for this header change. YouTube live API retrieval remains pending credential approval. No production publication or access-policy change was performed.
