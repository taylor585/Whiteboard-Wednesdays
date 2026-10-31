# Whiteboard Wednesdays

Preserve the approved whiteboard design and all existing presentation content.
The editable application assets are in public/. The dist/ directory is generated. Add decks through public/presentations.js, using unique stable IDs, per-deck published brand profiles and local assets. Do not publish test fixtures.
Keep .openai/hosting.json unchanged (the retired Sites project, kept for history and local tooling). Keep the older paid ads site untouched.
Official logo only. Default white, ink #1C1A17, gold #8B6002, evidence highlight #F6DF8C. Bundled Caveat, Instrument Sans, IBM Plex Mono and Fraunces carry their licences.
Test tabs, history, direct links, isolated state, reduced motion and both phone widths before publication. Browser-only brand previews are never shared saved settings.
Skill integration: validate the new or selected deck, update the presentation register, preserve old links, test, merge, republish the Claude app (see Hosting decision below), then return the deck's route. Never create one site or artifact per deck.

Read README.md for installation, design preview, server and verification commands.
The shared GitHub repository is https://github.com/taylor585/Whiteboard-Wednesdays on main.
The header uses plain text tabs and a thin dark underline, as selected on 12 October 2026. Do not restore the icon pills.
Creator uploads come from YouTube's public channel feeds (no key): `scripts/scan-watchlist.mjs` fetches them and the result is published next to the page as `uploads.json` (see SCAN.md), on Taylor's Refresh uploads press or when he asks in a chat. There is no schedule. Adding a creator means adding its handle, name and channel ID to `public/creators.json`. The YouTube Data API is still not connected; do not claim it is.
Design changes can be made without access to the private hosted app: run the public/ static preview or the full local server.
The weekly production process (planning, slides, recording, editing, posting) is in PROCESS.md, updated 16 October 2026. Plan the Topics and Schedule screens around it.
Navigation since 30 October 2026: Presentations (`#/library`, L2-C whiteboard wall) · Creator watchlist (`#/watchlist`, WL-B avatar shelf + W3-A command strip + W2-B inbox) · Topics (`#/topics`, board first with TC-C creator cards beside it) · Schedule (`#/schedule`, S2-B four-week calendar) · Publish (`#/publish`: Drive links in, Variety Pack platform by platform, finals, Post all; the Studio and Post screens merged into it on 30 October). The settings cog, top right on every screen, opens `#/settings` (SE-B skill library; saved in the artifact database as `settings/skills`). Publish jobs live in the artifact database as `jobs/<id>`, written by the app and by the Claude Code session that runs them. Taylor cancelled the black and gold rebrand on 28 October 2026: keep the approved white design. Each creator has a page at `#/creator/@handle` (C-A). On phones the tab row scrolls sideways inside itself.


## Hosting decision: 24 October 2026

Taylor retired the ChatGPT Sites app. This supersedes every ChatGPT Sites and Codex publishing instruction below.

- The app Taylor uses from now on is the Claude artifact https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea.
- Publish after merging to main: republish `public/index.html` to that URL with the Artifact tool, passing each changed file from `public/` in `files` at the same published path. Omit `capabilities` on redeploy so the `db` capability carries forward. Never publish the app to a new artifact.
- Saved topics and creator notes live in that artifact's own database (collections `topics` and `creatorNotes`, through `public/ww-store.js`), not in D1. Read or change them with ArtifactData, never wipe them, and after a publish that touches topics, list the collection once to confirm it still reads.
- The artifact is private to Taylor's claude.ai account. Sharing is through its Share menu, which only Taylor changes.
- The full server (`app/`, `drizzle/`, D1, YouTube refresh) does not run inside the artifact. Keep it working for local tests. In the artifact the Creator watchlist, creator pages and Topics sparks read `uploads.json` (SCAN.md).
- Leave the ChatGPT Sites project and the older paid ads site untouched: do not publish to them or delete them. Codex has no publishing role; HANDOVER-CODEX.md is historical.
- Delivery: report the artifact URL and version, the merged commit, and the checks actually run.

## Owner instruction update: 15 October 2026

Its hosting parts (the Sites identities, steps 8 to 10 and the live URL in the delivery definition) are superseded by the 24 October hosting decision above. The rest still applies.

Taylor explicitly requests access to this app without any visitor login and wants Claude to own editing, testing, merging and publishing. This supersedes the earlier private-access instruction above for Whiteboard Wednesdays only. Keep the older paid ads site untouched. Do not change Taylor's Codex app account as a way to access the site.

### Source and hosting identities

- Shared source: https://github.com/taylor585/Whiteboard-Wednesdays, branch main.
- Existing Sites project: appgprj_6ac6451343708191b9bea328756578d7.
- Existing Sites URL: https://whiteboard-wednesdays.mantamarketingltd.chatgpt.site/.
- Last verified Sites owner: mantamarketingltd@gmail.com, from a Sites read on 13 October 2026. This is the site owner identity, not an instruction to change Taylor's canonical email.
- GitHub main was verified at c0de78ad399a887390fb35846a6c369ba1dfc611 before this documentation update.
- On 15 October 2026 the current Codex account's Sites get_site call returned project_not_found. This is an access blocker, not proof that the site was deleted. Browser login and the native Sites connector are separate access paths.
- No GitHub Pages site or Actions deployment workflow existed when checked on 15 October 2026. Do not claim merge-to-live deployment is configured.
- Preserve the current live saved version as rollback before publishing. Never create a replacement Sites project or silently migrate hosting. A different hosting URL requires Taylor's explicit agreement.

### Claude owns the complete implementation

Use Claude Code or an execution-capable coding environment with authenticated GitHub write access. A read-only web fetch of this public repository is insufficient. Work in an existing authorised checkout; Taylor prohibits creating folders without an explicit request.

1. Read this file, README.md, PROCESS.md and the relevant presentation source before changing anything. Fetch main, inspect git status, preserve concurrent work and branch from the current remote main. Keep changes scoped to Taylor's request.
2. For a presentation preview run `python3 -m http.server 8862 --directory public` and open `http://localhost:8862/#/library`. Use the full server from README.md for API and persistent-data features. A static preview does not prove the backend works.
3. Run the README verification commands: the YouTube adapter tests, TypeScript checking and the production build. Use Node.js 22.13 or newer and the lockfile. Fix failures before merging.
4. Use browser automation available to Claude to test at 375, 390, 768 and 1280px. Open every deck from the library, advance every slide to its final slide, verify direct links and browser history, and measure document scrollWidth against clientWidth. Check runtime errors after interactions.
5. The library must show Our paid ads process, Lead Gen Engine Demo Walkthrough, Using AI vision boards to build apps, and How AI Harnesses Can 10x Your Quality and Output. Keep the plain text navigation and thin dark underline.
6. Verify `#/presentation/vision-boards`, `#/presentation/ai-harnesses/slide/done-gate` and the legacy `#/video-ideas` route. Verify Creator watchlist opens. Keep its honest unconfigured state until live YouTube retrieval is actually connected and tested.
7. Push the branch, open a GitHub PR, inspect the diff, run required checks, and merge the finished tested change. Use `gh pr create`, `gh pr checks` and `gh pr merge` where available. Do not force-push main or bypass branch protections. Re-read remote main after merge to record the shipping commit.
8. Publish using a genuinely configured and authorised hosting route. A GitHub push alone does not update Sites. Native Sites publishing currently requires its owning account or a permitted editor; no independently authenticated Claude-to-Sites publisher has been established. Do not copy ChatGPT session cookies or temporary credentials into GitHub.
9. If an approved GitHub deployment workflow is later configured, invoke that exact workflow and inspect its run through completion. Do not assume workflow presence proves deployment success. Keep any required backend and secrets server-side.
10. Verify the deployed asset or build commit, then repeat the live browser acceptance checks. For Taylor's no-login requirement, test an unauthenticated HTTP request and a signed-out browser. An already signed-in tab is not proof of anonymous access.

### Definition of delivery

Return the live URL, shipping commit, deployment version or run ID, rollback reference and actual checks performed. Clearly distinguish merged source from published output. Do the implementation, tests and merge yourself instead of passing those tasks to Codex. If the only remaining blocker is hosting access, identify that exact blocker; do not claim the app is live or ask another agent to redo the build.

Reference: https://learn.chatgpt.com/docs/sites. Public Sites can be open to signed-out visitors; audience sharing and authentication inside application code are separate controls. Changing public access still requires authorised access to the existing project.

## Handover: 16 and 17 October 2026

Claude built, tested and merged the 2C creator watchlist (real 16:9 thumbnails) and the Topics planner on the 16 October schedule (17 October). PROCESS.md holds the current weekly schedule. Retired on 24 October 2026: Codex no longer publishes, and HANDOVER-CODEX.md is kept only as history.
