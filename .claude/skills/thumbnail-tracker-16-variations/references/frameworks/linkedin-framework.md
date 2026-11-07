# LinkedIn posts

**Status: adapted from the YouTube research (`references/research/overview.md`), not tested on LinkedIn.** Nick Saraev, Sabri Suby and Riley Brown don't post on LinkedIn in a way we could study, and LinkedIn blocks automated collection. The rules below carry over what held on YouTube, reshaped for a feed with no search box. Once the user has 10+ posts, read their LinkedIn analytics (impressions, "see more" clicks, comments) and replace these defaults with what their own account shows.

## What carries over from YouTube, and what doesn't

| YouTube finding | On LinkedIn |
|---|---|
| Titles that work for search and browse beat browse-only ones (1.24× vs 0.62×). | No search intent in the feed. Keep the **browse** half: the buyer's problem or the surprising claim. Put the searchable noun ("Meta ads", "ICP research") in the first line anyway, because LinkedIn search and hashtags still use it. |
| Every thumbnail needs a line. | Every post needs a **hook line**, written fresh. It must not repeat the YouTube title word for word. |
| Plain how-to titles flopped (0.49×). | "How to X" openers are just as flat in the feed. Lead with the problem, the result or the confession. |
| Real proof beats claims. | Put one real figure or quote in the first three lines. No figure the video doesn't contain. |
| Descriptions didn't separate hits from misses. | The post body matters more on LinkedIn than the YouTube description does, because it is the content. Most readers never click through. |
| Chapters help viewers navigate. | No chapters. Turn "What you'll learn" into 3–5 short lines. |

## Hook angles that carry over from the all-time YouTube hits

These won on YouTube and need no search box, so they're the best bets for a feed:
- **Career stake:** "What I'd do instead of X this year" (Nick, 26.4×). This is fear about the reader's own path, not about a tool.
- **Challenge with stakes:** "We tried to beat a pro developer with no code" (Riley's "We built" titles: median 4.18×).
- **Time-box:** "N years of [skill] in one post" (Sabri, median 4.15× on marketing and sales topics; it missed on self-help).
- **Honest verdict:** "[Hyped tool] is overrated. Here's what we use." (Nick, 6.03×).
- **Proof screen:** lead with the real result, then how (Nick's test and stunt hits).

Avoid hooks in their worn-out phase on YouTube: income claims, "X just changed" news and plain "How to…".

## Structure

1. **Hook (line 1, under ~140 characters).** The problem in the buyer's words, or the one surprising claim. Mobile cuts the post at "…see more" after roughly 140–210 characters (third-party figures; check in the composer preview). Everything that earns the click sits above it.
2. **Proof (line 2–3).** One real number, quote or result from the video. Example: "Our top ICP for a med spa client scored an 88% fit."
3. **Blank line**, then **body**: 3–5 short lines (one idea each, 1–2 sentences). First person, a story from the video, not a list of features. White space between lines.
4. **Takeaway (one line).** The single thing to do differently.
5. **Call to action.** Pick one (see below).
6. **Hashtags.** 3–5, the same set as the YouTube description where they fit.

Length: 900–1,500 characters is a good default. The hard limit is 3,000.

UK or US English follows the user's brand. Never name a client the user hasn't cleared for publication ("a med spa client").

## Native video or link share

The user decides; the skill writes both versions when asked.

| | Native video (upload the file to LinkedIn) | YouTube link share |
|---|---|---|
| Thumbnail | 1920×1080 (`scale: 1.5`), uploaded as the video cover | 1200×627, pulled from the YouTube thumbnail automatically |
| Call to action | "Comment 'ICP' and I'll send you the template" or "Book a call: [BOOKING LINK]" | "Full walkthrough on YouTube: [YOUTUBE LINK]" |
| Link placement | No link needed in the post. | Link in the post, or in the first comment. Many guides claim posts with links get less reach; this is untested on the user's account, so treat it as an A/B to run, not a rule. |
| Video length | Native video can run up to 10 minutes (15 minutes on desktop, per third-party guides; LinkedIn's own pages weren't reachable, so see `references/platforms.md`). For long videos, post a 1–3 minute cut and point to the full video. | Any length. |

A 1080×1350 image teaser (the 4:5 thumbnail with a "NEW VIDEO" chip) is the third option. It takes the most room in the mobile feed and pairs with the link-share copy.

## Writing a batch

Write 3 posts, one per top title angle (problem, "I built", result/contrarian), so the user can rotate them over a few weeks rather than post one. Each one gets:
- `angle`: which title or formula it comes from (`pair` index into `titles`);
- `mode`: `native` or `link`;
- `text`: the full post.

Put them in `batch.json` under `linkedin` (see `scripts/package.py`). The packager checks the hook length, total length and hashtag count, lists any unfilled placeholders as `NOTE:` lines, and adds the posts to `board.html` with copy buttons.

## Checks before delivering

- The hook works on its own with nothing else visible.
- The hook isn't the YouTube title copied.
- Every number is said in the video.
- No client names, no private individuals.
- 3–5 hashtags.
- Placeholders (`[BOOKING LINK]`) are listed in "what to finish by hand".
