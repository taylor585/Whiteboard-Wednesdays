# Whiteboard Wednesdays

Preserve the approved whiteboard design and all existing presentation content.
The editable application assets are in public/. The dist/ directory is generated. Add decks through public/presentations.js, using unique stable IDs, per-deck published brand profiles and local assets. Do not publish test fixtures.
Keep the Sites project ID in .openai/hosting.json unchanged. Preserve private access and the older paid ads site.
Official logo only. Default white, ink #1C1A17, gold #8B6002, evidence highlight #F6DF8C. Bundled Caveat, Instrument Sans, IBM Plex Mono and Fraunces carry their licences.
Test tabs, history, direct links, isolated state, reduced motion and both phone widths before publication. Browser-only brand previews are never shared saved settings.
Skill integration: locate this existing Sites project, validate the new or selected deck, update the presentation register, preserve old links, test and publish the exact source, then return the direct deck link. Never create one site per deck.

Read README.md for installation, design preview, server and verification commands.
The shared GitHub repository is https://github.com/taylor585/Whiteboard-Wednesdays on main.
The header uses plain text tabs and a thin dark underline, as selected on 12 October 2026. Do not restore the icon pills.
The Video ideas integration awaits Google API approval and a server-side key. Do not claim live YouTube retrieval works until it is connected and tested.
Design changes can be made without access to the private hosted app: run the public/ static preview or the full local server.
The weekly production process (planning, slides, recording, editing, posting) is in PROCESS.md, updated 16 October 2026. Plan the Topics screen around it.


## Owner instruction update: 15 October 2026

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

## Handover: 16 October 2026

Taylor asked for Codex to take over building and publishing the remaining work: getting all four presentations live, the 2C creator watchlist cards with real thumbnails, and the Topics planner on the 16 October schedule. The full brief is in HANDOVER-CODEX.md. PROCESS.md holds the current weekly schedule.
