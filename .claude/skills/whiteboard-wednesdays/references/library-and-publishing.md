# Library contract and publishing

The Whiteboard Wednesdays site is one private library holding every deck. New decks join it; they never get their own site.

## Find the canonical site and the deploying source

- Retained live locator: `https://whiteboard-wednesdays.mantamarketingltd.chatgpt.site`. It is a locator, not proof of what is deployed.
- `.openai/hosting.json` holds the authoritative Sites project ID and static directory (`dist`). Never change the project ID.
- Before editing, confirm which tree deploys.
  - The project has existed as a buildless `dist` tree and, on one machine, as a Vinext tree with `package.json`, `app/route.ts` and `public/`.
  - Check the git remote, branch and latest commit, and whether the working tree is clean. Record any divergence in plain words.
  - Edit only the deploying source. Never hand-edit generated output as source, and never reset or commit someone else's uncommitted work wholesale.
- Do not hardcode a machine-specific path into future work.
- For an existing deck, inspect its source, register, styles, asset files, notes and current live version. Preserve the approved original and a recoverable version. Never treat a historical screenshot or an older feature branch as authority over the current source.
- Read the current register and viewer before changing their interfaces. The contract below is the verified reference, not permission to overwrite a later compatible version.
- For Sites, read its current instructions for preparing source, access, packaging and publication. Never hardcode tool signatures or credentials into this skill. For viewer changes, use the coding skill's implementation and regression checks.

## Register

`dist/presentations.js` assigns `window.presentationRegister` to an ordered array of entries (`schemas/register-entry.schema.json`):

```javascript
{
  id: 'paid-ads-process',
  title: 'Our paid ads process',
  description: 'A short, factual description of the presentation.',
  cover: 'ww-ad.png',
  source: 'whiteboard-content.js',
  reading: 'ww-guide.html',
  brand: { name: 'Pecuna Factorem', surface: '#ffffff', ink: '#1c1a17', accent: '#8b6002', font: 'hand', logo: 'ww-coin.svg' },
  sourceNote: 'Sources and the status of any illustrative examples.'
}
```

- The description and source note above illustrate the fields; when updating, keep the entry's real wording.
- New decks get unique IDs and asset filenames. Never overwrite shared fonts or another deck's image because filenames match.
- No filler decks to make the library look full.

## Content package

The deck's source script assigns `window.WW = {slides, survey?}`. The shared loader consumes and clears this global, loading decks one at a time to avoid races. Each slide has `id`, `title`, `section`, `kind`, `parts`, `reveals`, `source` and `note`:

- `reveals`: one positive integer per part, starting at 1 and contiguous; several parts may share a group.
- Slide IDs are unique within the deck and stable once published, because links use them.
- `kind` must be a layout in `layouts.md`, a device in `device-library.md`, or a new, tested layout.
- `source` is the short line the audience sees under the slide; `note` is for the presenter. The viewer prints `note` under the slide whenever `source` is missing, so always give both.
- HTML is trusted, authored and source-controlled. Never insert raw report text or user HTML without escaping.
- The viewer's default logo is the relative path `ww-coin.svg`, which only resolves inside `dist`. A page served elsewhere must substitute it, as `build-trial.cjs` does.

## Survey mount

`kind: 'survey'` needs exactly this markup, once per rendered slide:

```html
<div id="survey-demo">
  <div class="survey-questions"></div>
  <fieldset>
    <legend></legend>
    <div class="survey-options"></div>
  </fieldset>
  <div class="route-result" aria-live="polite"></div>
</div>
```

The survey data has `questions`, each with `id`, `question` and `options`; each option has `id`, `label` and `route`. The viewer recognises `DQ` and `REVIEW`; other approved options lead to provisional fit after completion. Never invent a backend or send survey data anywhere. The reading page shows the questions and options as ordinary text.

## Navigation and isolation

- Canonical links: `/#/presentation/{deck-id}/slide/{slide-id}`, with encoded IDs. They work in a fresh session.
- Presentation tabs sit under the site header, separate from chapters; the active tab has a gold underline. On phones they scroll sideways with an overflow hint. Tab arrow keys move between tabs and never move slides.
- Slide and reveal position, survey answers and preview brand are kept per deck ID during the visit. There is no cross-device sync, so never claim it.
- Switching deck cancels stale loads and pauses or unloads media. Hiding a reveal pauses video and audio and unloads embedded boards.
- Missing decks, slides, scripts, covers, logos and assets show readable recovery states.
- The skip link moves focus without breaking the route. Back, Forward and refresh keep the right deck and slide.

## Documents and reading view

- Embeds use lazy `data-src`, an accessible title, a sensible height and a separate-document link. They handle HTTP failure, timeout and retry. A successful HEAD request does not prove the document renders, so inspect the frame.
- Every deck has a complete reading page with all slides and sources in order; its return link opens the shared viewer.

## Publish into the existing library

1. Resolve the project and current source with Sites. Read the manifest, project instructions, register and deployed version. Confirm the audience without changing it.
2. Build or revise the selected deck in the authorised project location. Ask before creating new folders. Do not create another site or duplicate the viewer.
3. Validate content, source fidelity, branding, assets, unique IDs, reveal arrays and local links. Update the real cover and reading page.
4. Run the browser and visual gates in `quality.md`. Preserve unrelated decks and exact stable URLs. Use test-only injected fixtures, never a published dummy deck.
5. When publication is authorised, push the exact tested source with the current Sites helper and package its static output. Keep credentials in memory and hidden input, never in arguments, source or logs.
6. Keep the previous successful version ID and commit for rollback. Deploy the exact pushed commit and matching archive. Do not modify the older paid ads site or native Page.
7. Reuse saved version and deployment IDs on retries. Never create duplicates after an uncertain result. Poll only a non-terminal deployment, then read back its result.
8. Test the hosted site with authorised access. Compare served scripts, styles, images, fonts and PDF with the tested bytes. The host may inject a security script into HTML; confirm that is the only difference.
9. Confirm anonymous access is blocked and the allowed audience is unchanged. Never put an owner bypass token in a link or bundle.
10. Return the library URL and direct deck link, what was tested, the saved version and any device limits. A localhost link is never the phone solution.

Before editing, hash the untouched decks, assets and reading pages; compare after. An unexpected difference blocks publication. Shared viewer changes need regression checks on every existing deck, not only a byte comparison.

Adding the device kit or recording tools to the live viewer is a shared-viewer change: it needs the user's approval and a full regression run on every deck.

## Delivering the skill itself

- When the user asks for this skill, deliver the whole package as a zip (`scripts/package_skill.py`), whose single folder holds `SKILL.md`, references, scripts, schemas, viewer, assets, examples and tests, with its hash manifest. An explicit request for only `SKILL.md` takes precedence.
- A package is not an installation. Installing means copying the whole folder (not just `SKILL.md`) into the agent's skills directory, then running `npm run doctor` there. When that machine is out of reach, give the exact steps and the archive hash, and say installation is the user's to complete. Remind them to start a new Codex or Claude Code session.
- Do not rewrite a production skill automatically because an example could be better. Change it within the user's authorisation, preserve working content, and keep the installed copy and the portable package in sync.
