# Connections: what the app checks and what a Claude Code session does

Taylor, 10 November 2026: "I want our Google Drive connected, our YouTube connected, our LinkedIn connected. LinkedIn and Instagram are not the same connection; they should be separated out. Facebook is missing as well." and "Make sure that all of the connections are singular."

Settings has a third lane, **Connections** (`#/settings/connections`, one card opened at `#/settings/connections/<account>`), with one card per account, each its own connection: Google Drive, YouTube, LinkedIn, Instagram, Facebook, X, then Claude Code and GitHub.

## The rules

1. **Every account is its own connection.** Never join two accounts in one card, one sign-in or one status. Facebook and Instagram are separate even though the same reel goes to both.
2. **A card says Connected only after a real check**, and only ever shows an account name the check returned. No saved guess, no sample name, nothing assumed from an earlier day.
3. **Secrets never go into the app, the repo, the database or a chat.** Sign-ins are kept by Composio on Taylor's Claude account. X's client ID and secret are typed into Composio's own dashboard by Taylor, nowhere else.
4. **Nothing here posts anything.** Connecting an account only makes it available. The automatic poster is a later build (`WWStore.posting.posterLive` is false until it exists).
5. **Checks run on open and on return to the tab, never on a timer.** X is checked only on a press, because X charges for lookups.
6. From the page, the only Composio tool ever called is `COMPOSIO_MANAGE_CONNECTIONS`, and only its `list` and `add` actions. Never declare or call `COMPOSIO_MULTI_EXECUTE_TOOL` or any other Composio tool from the page: it would hand the page every account Composio holds.

## The two routes to a real check

**Direct.** When the app page has the Composio connector, it finds it in `listTools()` by the tool `COMPOSIO_MANAGE_CONNECTIONS` (the name "Composio" is only the fallback), reads `permissions.state('mcp:<server>')` without prompting, and calls

    COMPOSIO_MANAGE_CONNECTIONS {toolkits:[{name:'youtube', action:'list'}, …]}

for `googledrive`, `youtube`, `linkedin`, `instagram`, `facebook` (and `twitter` only on a press of Check X, or while X's sign-in is being waited for). The answer, as observed on 10 November 2026, is `{successful, data:{results:{<toolkit>:{toolkit, status, accounts:[{id, status, is_default, user_info}]}}}}`. An account whose `status` is `active` means Connected; the name comes from its `user_info`; `expired`, `failed`, `inactive`, `error`, `revoked` or `disabled` means Needs attention; no account (or only `initiated`) means Not connected; a toolkit missing from the answer means Can't check.

**Connect** and **Reconnect** call the `add` action for that one toolkit and put the returned sign-in link (`redirect_url`) on a real link button that opens in a new tab. When Taylor comes back to the tab the page runs one `list`. The shape of the `add` answer has not been observed yet (calling it starts a sign-in), so the page accepts any https link under a key named like `redirect_url`, `url`, `link` or `auth…` inside that toolkit's result, and shows Composio's own words when there is none.

**Session (fallback).** When the page cannot reach Composio (the connector is not declared for the app, is switched off, needs reconnecting, or does not answer in a shape the page knows), the hub line at the top says why, every card falls back to the document `connections/status`, and the buttons start a Claude Code session through Claude Code Remote `create_session` (the same environment and repository as Publish). The session lines are below.

## The document `connections/status`

Written only by a Claude Code session, read by the page (`WWStore.connections` in `public/ww-store.js`), never written by the page.

    {updatedAt:'2026-11-10T09:41:00.000Z',     // when this session last wrote; the page clears "Claude Code is on it" when this moves
     by:'session',
     googledrive: {state, account, checkedAt, error, link},
     youtube:     {…}, linkedin: {…}, instagram: {…}, facebook: {…}, x: {…}}

- `state`: `'connected'` | `'not_connected'` | `'connecting'` | `'attention'` | `'unknown'`.
- `account`: the name the platform or Composio returned (channel name, Page name, handle, name and email), or `null`. Only with `connected`. Never a guess.
- `checkedAt`: ISO time of the check that produced this state.
- `error`: one plain sentence for `attention` or `unknown` (for example "Composio says this sign-in has expired."), otherwise `null`. Never a token, key or raw response.
- `link`: `{url, createdAt}` while `state` is `connecting` (the sign-in link from `add`), otherwise `null`. The page offers a link for 30 minutes after `createdAt`.

Write with `update` (it merges top-level fields), so a session that checks one account leaves the others alone. Always set `updatedAt` in the same write.

## Session lines

Every session: load `COMPOSIO_MANAGE_CONNECTIONS` (and `COMPOSIO_WAIT_FOR_CONNECTIONS` for Connect). Use no other Composio tool. Never post, upload, delete or remove anything. Never call the `remove` or `rename` actions. Never print or store a password, key or token. Write to `connections/status` in the app artifact (https://claude.ai/artifact/WCzdc2u9RBzuzqz5JhHwea) with ArtifactData.

### `Check connections`

1. Call `COMPOSIO_MANAGE_CONNECTIONS` once with action `list` for `googledrive`, `youtube`, `linkedin`, `instagram`, `facebook`. Do not list `twitter`.
2. Map each toolkit as in "The two routes" above: `active` → `connected` with the account name from `user_info` (name and email together when both are there, as "Name · email"); a lapsed status → `attention` with one sentence; no account → `not_connected`; missing from the answer → `unknown`.
3. If Composio cannot be reached at all, write `unknown` for the five with `error:'Composio could not be reached from Claude Code.'`.
4. `update` `connections/status` with the five accounts, `by:'session'` and `updatedAt`. Leave `x` as it was.
5. Reply with one line per account. Do not start any sign-in.

### `Check connections with X`

The same, and also list `twitter` and write `x`. Use only the `list` action for it: never `TWITTER_USER_LOOKUP_ME` or any other X call (each one is charged).

### `Connect <account>`

`<account>` is one of Google Drive, YouTube, LinkedIn, Instagram, Facebook, X (toolkits `googledrive`, `youtube`, `linkedin`, `instagram`, `facebook`, `twitter`). One account per session, never two.

1. Call `COMPOSIO_MANAGE_CONNECTIONS` with action `add` for that one toolkit.
2. Straight away `update` `connections/status`: that account as `{state:'connecting', account:null, checkedAt:<now>, error:null, link:{url:<the redirect_url>, createdAt:<now>}}`, with `updatedAt`. The app turns it into the sign-in button. Also give Taylor the link in your reply.
3. If Composio gives no link (for X this means the developer app's details are not in Composio yet), write `{state:'not_connected', error:<Composio's reason in one plain sentence>, link:null}` and stop.
4. Wait for Taylor to finish the sign-in: `COMPOSIO_WAIT_FOR_CONNECTIONS` for that toolkit, or `list` every 30 seconds, for up to 10 minutes.
5. `update` the account with the result: `connected` with the returned account name, or `not_connected` with `error:'The sign-in was not finished within 10 minutes. Press Connect to try again.'`; `link:null` either way; `updatedAt`.
6. Reconnecting adds a second sign-in in Composio. Do not remove the old one: say in your reply that it can be removed in Composio's dashboard.

## What each account needs (shown on its card)

- **Google Drive**: the Google account whose Drive holds the recordings and finals. Links shared as "Anyone with the link" are readable without it.
- **YouTube**: the Google account that owns the channel; choose the channel or brand account during sign-in. Custom thumbnails need a phone-verified channel. Uploading a full video through this connection is untested.
- **LinkedIn**: the personal profile. Company Page posting has not been checked.
- **Instagram**: a Business or Creator account; personal accounts are refused. If the sign-in goes through Facebook, the account must be linked to the Facebook Page.
- **Facebook**: Pages only; Taylor ticks the Page during sign-in and needs to be allowed to create posts on it. Page reels are untested.
- **X**: Taylor's own X developer app (https://developer.x.com/en/portal/dashboard), credits on it (https://developer.x.com/en/portal/products), and its client ID and secret entered in Composio's dashboard (https://dashboard.composio.dev; Composio removed its shared X app in February 2026, https://docs.composio.dev/toolkits/twitter). Connect X becomes the main button only after Taylor ticks "I've done these three", which is his own tick and is not verified. Unverified: the callback address and the Read and write permission the X app needs.

## The app's capability declaration

The publish that ships this lane must restate the whole set once (anything stored but not restated is revoked); later publishes omit `capabilities` again:

    {"db": {}, "mcp": {"servers": [
      {"server": "Claude Code Remote", "tools": ["create_session", "list_repos"]},
      {"server": "Composio", "tools": ["COMPOSIO_MANAGE_CONNECTIONS"]}]}}

Whether the page really gets Composio in `listTools()` under that name is settled only by opening the published app: if it does not, the hub line says so and the session route is what works.
