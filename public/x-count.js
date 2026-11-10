/* X (Twitter) post length, counted the way X counts it (PUBLISH.md "The X post"; scripts/check-x-post.py holds the same
   rules and scripts/tests/ proves the two agree on the same vectors). Every link counts 23 whatever its length, every
   emoji 2, and so does any character outside X's single-weight ranges (arrows, the ellipsis, Chinese, Japanese and
   Korean); the text is measured after Unicode NFC. [YOUTUBE LINK] counts as the link it becomes. Nothing here posts:
   intent() only builds the address that opens X's own compose box with the text filled in, for Taylor to post by hand. */
(() => {
  'use strict';
  const LIMIT = 280, LINK = 23, YT = '[YOUTUBE LINK]';
  const ONE = [[0, 4351], [8192, 8205], [8208, 8223], [8242, 8247]];
  const URL_RE = /https?:\/\/[^\s<>"']+|\b(?:[a-z0-9-]+\.)+(?:com|co\.uk|org|net|io|ai|app|dev|co|uk|me|tv|ly|be)\b(?:\/[^\s<>"']*)?/gi;
  const EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]️?⃣|[©®‼-㊙\u{1F000}-\u{1FAFF}](?:️|[\u{1F3FB}-\u{1F3FF}])?(?:‍[©®‼-㊙\u{1F000}-\u{1FAFF}](?:️|[\u{1F3FB}-\u{1F3FF}])?)*/gu;
  function len(text) {
    let n = 0;
    let t = String(text ?? '').normalize('NFC').split(YT).join('\uE000');
    t = t.replace(//g, () => { n += LINK; return ''; });
    t = t.replace(URL_RE, m => { n += LINK; return (m.match(/[.,;:!?)\]]+$/) || [''])[0]; });
    t = t.replace(EMOJI_RE, () => { n += 2; return ''; });
    for (const ch of t) { const c = ch.codePointAt(0); n += ONE.some(([a, b]) => c >= a && c <= b) ? 1 : 2; }
    return n;
  }
  const intent = text => 'https://x.com/intent/post?text=' + encodeURIComponent(String(text ?? ''));
  window.WWX = {len, intent, LIMIT, LINK, YT};
})();
