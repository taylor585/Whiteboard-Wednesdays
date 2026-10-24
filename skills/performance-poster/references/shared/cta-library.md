# Call to action library (text source)

The approved CTAs for Pecuna Factorem. This file is the source of truth. The printable PDF is `assets/cta/Pecuna-Factorem-CTA-Library.pdf`, built from `assets/cta/cta-library.html`. When a CTA is added or changed, update this file and the HTML, then rebuild the PDF by rendering the HTML to PDF with Playwright (see `README.md`).

Add new CTAs at the top, with the date and the video they were first used on. Keep one main CTA per post. CTA 01 is the default for YouTube descriptions; LinkedIn posts use CTA 04 or 05 unless Taylor says otherwise.

| # | Name | Exact text | Use | First used |
|---|---|---|---|---|
| 01 (pinned) | Personal chat (WhatsApp) | `Want to chat? Give me a message on WhatsApp. This is my personal number 👉 https://pecunafactorem.com/contact` | line 1 of every YouTube description (Taylor's rule). Ask before also using it on LinkedIn posts or as a pinned comment | ICP Buyer Research, 13 Oct 2026 |
| 02 | Book a call (done for you) | `Want this built for your agency or business? Book a call: [BOOKING LINK]` | YouTube description, after the summary | ICP Buyer Research |
| 03 | How we can help (closing) | `If you'd like help building ICP research for your clients, creating your own video-script skill, or feeling confident speaking on camera, get in touch:` + the contact link on its own line | the end of descriptions, after the chapters; edit the services to match the video | ICP Buyer Research |
| 04 | LinkedIn, native video | `Want this built for your business? Book a call: [BOOKING LINK]` | the last line of a native-video post | ICP Buyer Research |
| 05 | LinkedIn, link share | `Full walkthrough, including the live report: [YOUTUBE LINK]` | a post pointing to YouTube; change the best moment for each video | ICP Buyer Research |
| 06 | Skill build | `Want help building your own video-script skill? Book a call: [BOOKING LINK]` | videos about AI scripts, Claude skills or speaking on camera | ICP Buyer Research |

**Notes:**
- Always put a space between 👉 and the link.
- CTA 01 says WhatsApp but links to the website contact page. If that page doesn't open WhatsApp, consider a direct `https://wa.me/<number>` link, so viewers aren't surprised.
- Where `[BOOKING LINK]` is unknown, the published ICP description used the contact link instead.
