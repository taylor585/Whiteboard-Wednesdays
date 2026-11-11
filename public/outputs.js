/* Ready to post (Taylor, 10 November 2026): the finished outputs of one video, in his order, one ruled section a platform.
     1. YouTube: the edited video, then its thumbnail (the A/B spare under it), then the title and the description.
     2. LinkedIn: the LinkedIn cut, then its cover, then the post and the first comment.
     3. Instagram reels, one block a reel: the reel, then its 4:5 post, then the caption with its hashtags. Facebook takes
        the same files and captions, said in one line (no second section).
     4. X: each post with its own Copy, then the image to attach.
   Picked by the independent review of the three directions on the board "Ready to post: three directions": direction A's
   ruled sheet, with B's stage and gold rule behind the video only and B's proportions (video wider than the thumbnail,
   the words full width below both files), and C's Copy above its text on a phone (at the right of the label on a desk).

   Downloads say exactly what happens (the app cannot read another page's files or start a download itself):
   - a full-quality video on Drive: "Download from Drive" opens Drive's own download address in a new tab;
   - no full-quality file yet: "Full quality not on Drive yet", and the review copy is offered as what it is;
   - reels, 4:5 posts and covers live on the reel job's review page: "Open the reel's page to download";
   - images: Drive's download when the session uploaded one, else "Open the image".
   There is no Download all: the files live in two or three places and every save is its own press. The count at the top
   says what was pressed here, never what was downloaded.

   Rendering: publish.js and reels.js rebuild their screen on every database snapshot and timer tick, so everything here is
   drawn from the state below (open texts, the Copy just pressed, the pressed set), never kept in the DOM. The pressed set
   is kept per job in this browser only. Previews are stills: nothing plays here, so nothing restarts on a redraw.
   Motion only through WWMotion (a Copy's fill is stamped once); entrances follow the screen's own data-enter.
   Nothing here posts, writes the database or changes a file. */
(() => {
  'use strict';
  const M = window.WWMotion;
  // Its stylesheet joins the head from here, so the page's first paint never waits for it (index.html loads only this script).
  if (!document.querySelector('link[href="outputs.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'outputs.css'; document.head.appendChild(l); }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const httpsUrl = u => { try { const x = new URL(String(u || '').trim()); return x.protocol === 'https:' ? x.href : null; } catch { return null; } };
  // The same placeholder rule as publish.js: nothing with one is ever copied. [YOUTUBE LINK] fills from the saved link.
  const PH = /\[(?:[A-Z][A-Z0-9 _\/-]{2,}|your [^\]\n]{2,40})\]|\bX:XX\b|\{\{|\}\}/, YT_PH = '[YOUTUBE LINK]';
  const LIMIT = {title:100, description:5000, post:3000, comment:1250, caption:2200, x:280};
  // FOLLOW-UP SWITCH (not on): save thumbnails and covers inside the app under a tidy name with downloads.save, once the
  // session copies them into the app's own asset store (files[].asset = "/_blob/<id>") and the app declares assets and
  // downloads. Until both exist this stays false and images open on Drive or their page.
  const ASSET_SAVE = false;

  // ---- State that outlives every redraw ----
  let lastRc = null;               // the reel job's ready data last drawn (its captions are copied from here)
  const bad = new Set();           // images that would not load here: drawn as words from then on
  const open = new Set();          // texts opened with Show all
  let copied = '', copyTimer = 0;  // the Copy just pressed (its Copied label for 1.8 s)
  let jobId = '', pressed = {};    // what Taylor pressed on this screen, per job, in this browser only
  const store = id => 'ww-ready-pressed:'+id;
  function loadPressed(id) {
    if (id === jobId) return;
    jobId = id; pressed = {};
    try { const v = JSON.parse(localStorage.getItem(store(id)) || '{}'); if (v && typeof v === 'object') pressed = v; } catch { pressed = {}; }
  }
  function press(key) {
    if (!jobId || pressed[key]) return;
    pressed[key] = new Date().toISOString();
    try { localStorage.setItem(store(jobId), JSON.stringify(pressed)); } catch {}
    document.querySelectorAll('[data-op-mark="'+CSS.escape(key)+'"]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-op-count]').forEach(el => { const keys = (el.dataset.opCount || '').split(' ').filter(Boolean); el.textContent = keys.filter(k => pressed[k]).length; });
  }

  // ---- Small parts ----
  const out = '<svg class="op-ic" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.5 2.5h6v6M11.5 2.5 3 11" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const idOf = k => String(k).replace(/[^\w-]/g, '-');
  const mark = k => '<span class="op-pressed micro" data-op-mark="'+esc(k)+'"'+(pressed[k] ? '' : ' hidden')+'>Pressed</span>';
  const bytes = n => !(+n > 0) ? '' : n >= 1e9 ? (n / 1e9).toFixed(1)+' GB' : Math.round(n / 1e6)+' MB';
  const clock = s => { s = Math.max(0, Math.round(+s || 0)); return s >= 3600 ? Math.floor(s/3600)+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0') : Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const res = (w, h) => +h ? (+h >= 2160 ? '4K' : +h === 1080 || +w === 1920 ? '1080p' : +h === 720 ? '720p' : w+' × '+h) : '';
  const driveId = u => { const s = String(u || ''); return (s.match(/\/file\/(?:u\/\d+\/)?d\/([\w-]{20,})/) || s.match(/[?&]id=([\w-]{20,})/) || [])[1] || null; };
  // Drive's own download address: one press starts the file in a new tab. confirm=t skips Drive's "cannot scan for viruses"
  // question on files over 100 MB.
  const driveDl = id => 'https://drive.usercontent.google.com/download?id='+encodeURIComponent(id)+'&export=download&confirm=t';
  const ext = (href, key, cls, label, extra) => '<a class="'+cls+'" id="op-a-'+idOf(key)+'" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" data-op-press="'+esc(key)+'"'+(extra || '')+'>'+label+out+'</a>';
  const count = (text, kind) => { const n = kind === 'x' && window.WWX ? window.WWX.len(text) : [...String(text)].length, lim = LIMIT[kind];
    return '<span class="op-n'+(n > lim ? ' is-over' : '')+'">'+n.toLocaleString('en-GB')+' / '+lim.toLocaleString('en-GB')+(kind === 'x' ? ' as X counts' : '')+'</span>'; };

  // A text to post: its label, count and Copy on one row (Copy above the text on a phone), then the text in full, or its
  // first whole paragraphs with Show all. Never cut mid-sentence.
  function textBlock(key, label, shown, copyable, kind, why, pk) {
    const paras = String(shown || '').trim().split(/\n{2,}/), long = shown.length > 560 && paras.length > 4;
    let keep = paras.length;
    if (long) { keep = 0; let n = 0; for (const p of paras) { n += p.length; keep++; if (n > 420) break; } }
    const isOpen = open.has(key), on = copied === key;
    const btn = '<button type="button" class="op-act op-cp" id="op-cp-'+idOf(key)+'" data-op-copy="'+esc(key)+'" data-op-key="'+esc(pk)+'"'+(copyable ? '' : ' disabled aria-describedby="op-why-'+idOf(key)+'"')+(M ? M.done('op:'+key, on) : '')+'>'+(M ? M.label(on, 'Copy '+esc(label.toLowerCase()), 'Copied') : esc(on ? 'Copied' : 'Copy '+label.toLowerCase()))+'</button>';
    const body = paras.map((p, i) => '<p'+(long && !isOpen && i >= keep ? ' hidden' : '')+'>'+esc(p).split(esc(YT_PH)).join('<mark class="op-ph">'+esc(YT_PH)+'</mark>')+'</p>').join('');
    return '<div class="op-text"><div class="op-text-h"><b>'+esc(label)+'</b>'+count(shown, kind)+mark(pk)+btn+'</div>'+
      (copyable ? '' : '<p class="op-warn" id="op-why-'+idOf(key)+'">'+esc(why)+'</p>')+
      '<div class="op-box">'+body+'</div>'+
      (long ? '<button type="button" class="op-more" id="op-more-'+idOf(key)+'" data-op-more="'+esc(key)+'" aria-expanded="'+isOpen+'">'+(isOpen ? 'Show less' : 'Show all · '+(paras.length - keep)+' more paragraphs')+'</button>' : '')+'</div>';
  }
  const beat = (n, label, key, body, cls) => '<div class="op-bt'+(cls ? ' '+cls : '')+'"><div class="op-bl"><span class="micro">'+n+' · '+esc(label)+'</span>'+(key ? mark(key) : '')+'</div>'+body+'</div>';
  // Posting status row of the posting engine: it mounts here, one slot a platform (WWPostingSlot(platform, ctx) → HTML).
  const slot = (p, ctx) => { let h = ''; try { h = typeof window.WWPostingSlot === 'function' ? String(window.WWPostingSlot(p, ctx) || '') : ''; } catch { h = ''; } return '<div class="op-post-slot" data-platform="'+p+'">'+h+'</div>'; };

  // A still of the video (never a player: the app cannot play another page's files), on the stage under the gold rule.
  function still(img, len, href, label, tall) {
    const pic = img && !bad.has(img) ? '<img src="'+esc(img)+'" alt="'+esc(label)+'" loading="lazy">' : '<span class="op-still-t">'+esc(label)+'</span>';
    const inner = '<span class="op-still'+(tall ? ' is-tall' : '')+'">'+pic+(len ? '<span class="op-len">'+esc(len)+'</span>' : '')+(href ? '<span class="op-watch">Watch'+out+'</span>' : '')+'</span>';
    return '<div class="op-stage">'+(href ? '<a class="op-still-a" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Watch '+esc(label)+' on its page">'+inner+'</a>' : inner)+'</div>';
  }

  // ---- The video's files ----
  // Full quality: the finals entry marked full (Drive), with the cut's own Drive record for its name, size and picture.
  function videoFile(job, p) {
    const cut = (job.cuts || {})[p === 'youtube' ? 'master' : 'linkedin'] || {}, finals = Array.isArray(job.finals) ? job.finals : [];
    const f = finals.find(x => x && x.platform === p && x.quality === 'full'), r = finals.find(x => x && x.platform === p && x.quality !== 'full');
    const full = f && cut.full && (!driveId(f.url) || driveId(f.url) === cut.full.driveId) ? cut.full : null;
    const id = f ? driveId(f.url) || cut.full?.driveId || null : null;
    const review = httpsUrl(r?.url) || httpsUrl(cut.url) || httpsUrl(job.reviewUrl);
    return {id, full, f, review, seconds:full?.seconds || cut.seconds || null, label:f?.label || r?.label || (p === 'youtube' ? 'YouTube master' : 'LinkedIn cut')};
  }
  function videoBeat(job, p, key, img) {
    const v = videoFile(job, p), len = v.seconds ? clock(v.seconds) : '';
    const fullLine = v.full ? [v.full.height ? res(v.full.width, v.full.height) : '', len, bytes(v.full.bytes)].filter(Boolean) : [];
    const act = v.id
      ? ext(driveDl(v.id), key, 'op-act op-dl', 'Download from Drive')+
        '<p class="op-spec">Opens Google Drive'+(fullLine.length ? ' · '+esc(fullLine.join(' · ')) : '')+'</p>'+
        (v.full?.name ? '<p class="op-spec op-name">'+esc(v.full.name)+'</p>' : '')+
        (v.review ? ext(v.review, key+'.review', 'op-sub', 'Watch the review copy (720p)', ' data-op-nocount') : '')
      : '<p class="op-none">Full quality not on Drive yet</p>'+
        (v.review ? ext(v.review, key, 'op-act op-act-out', 'Open the review copy') +'<p class="op-spec op-rev">Review copy · 720p · not for upload</p>' : '<p class="op-spec">No review copy is linked yet.</p>');
    return beat(1, p === 'youtube' ? 'Video' : 'Video', key, still(img, len, v.review, v.label)+act, 'op-video');
  }
  // Images: the polished file (thumbFinals) for its Drive copy; the pick itself for the picture.
  function imageFile(job, t, size) {
    const files = job.pack?.thumbFinals?.files || [];
    return files.find(x => x && x.id === t.id && (!size || String(x.size || '').replace(/x/i, '×') === size)) || null;
  }
  function imageAct(ctx, t, key, size, noun, cls) {
    const file = imageFile(ctx.job, t, size), d = file?.drive, did = d?.driveId || driveId(d?.url), full = ctx.thumbFull(t);
    const name = [ctx.job.title || ctx.job.folderName || 'video', noun, size].filter(Boolean).join(' ');
    if (ASSET_SAVE && file?.asset) return '<button type="button" class="op-act" data-op-save="'+esc(key)+'" data-op-asset="'+esc(file.asset)+'" data-op-name="'+esc(slug(name)+'.jpg')+'">Download '+esc(noun.toLowerCase())+'</button><p class="op-spec">'+esc(size || '')+' · JPG</p>';
    if (did) return ext(driveDl(did), key, 'op-act op-dl'+(cls ? ' '+cls : ''), 'Download from Drive')+'<p class="op-spec">Opens Google Drive · '+esc(size || t.size || '')+' · JPG</p>';
    if (full) return ext(full, key, 'op-act op-act-out'+(cls ? ' '+cls : ''), 'Open the image')+'<p class="op-spec">'+esc(size || t.size || '')+' · on your review page</p>';
    return '<p class="op-none">The image is not linked yet.</p>';
  }
  const slug = s => String(s).toLowerCase().replace(/×/g, 'x').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pic = (ctx, t, alt) => { const u = t && ctx.thumbImg(t); return u && !bad.has(u) ? '<img class="op-img" src="'+esc(u)+'" alt="'+esc(alt)+'" loading="lazy">' : '<span class="op-img op-img-t">'+esc(alt)+'</span>'; };

  // ---- Sections ----
  const head = (n, name, note, cls) => '<div class="op-pf-h'+(cls ? ' '+cls : '')+'"><span class="op-idx">'+n+'</span><h3>'+esc(name)+'</h3>'+(note ? '<span class="micro">'+esc(note)+'</span>' : '')+'</div>';
  function youtube(ctx, keys) {
    const pl = ctx.plats().find(p => p.key === 'youtube'); if (!pl) return '';
    const t = ctx.chosenThumb(pl), v = ctx.chosenPost(pl), spare = (pl.thumbnails || []).find(x => t && x.id !== t.id);
    keys.push('yt.video', 'yt.thumb', 'yt.title', 'yt.desc');
    const thumbBody = t ? pic(ctx, t, 'YouTube thumbnail')+imageAct(ctx, t, 'yt.thumb', '1280×720', 'YouTube thumbnail')+
        (spare ? '<p class="op-spare"><span class="micro">A/B spare</span> '+(() => { const f = imageFile(ctx.job, spare, '1280×720'), did = f?.drive?.driveId || driveId(f?.drive?.url), u = did ? driveDl(did) : ctx.thumbFull(spare);
          return u ? ext(u, 'yt.spare', 'op-sub', did ? 'Download the spare from Drive' : 'Open the spare', ' data-op-nocount') : ''; })()+'</p>' : '')
      : '<p class="op-none">Pick a thumbnail below.</p>';
    const words = v ? textBlock('youtube|title', 'Title', ctx.fill(v.title || '').trim(), !!ctx.partText('youtube|title'), 'title', 'This title still has a placeholder.', 'yt.title')+
        textBlock('youtube|body', 'Description', ctx.fill(v.body || '').trim(), !!ctx.partText('youtube|body'), 'description', 'This description still has a placeholder.', 'yt.desc')
      : '<p class="op-none">Pick a title and description below.</p>';
    return '<section class="op-pf" data-platform="youtube" aria-labelledby="op-h-yt">'+head('01', 'YouTube', 'Post first').replace('<h3>', '<h3 id="op-h-yt">')+
      '<div class="op-files">'+videoBeat(ctx.job, 'youtube', 'yt.video', t && ctx.thumbImg(t))+beat(2, 'Thumbnail', 'yt.thumb', thumbBody, 'op-image')+'</div>'+
      beat(3, 'Title and description', '', words, 'op-words')+slot('youtube', ctx)+'<div class="op-yt">'+ctx.ytField()+'</div></section>';
  }
  function linkedin(ctx, keys) {
    const pl = ctx.plats().find(p => p.key === 'linkedin'); if (!pl) return '';
    const t = ctx.chosenThumb(pl), v = ctx.chosenPost(pl), parts = v ? ctx.parts(pl, v) : [];
    keys.push('li.video', 'li.thumb', 'li.post'); if (v?.firstComment) keys.push('li.comment');
    // A separate LinkedIn image (4:5 post), when the job has one, sits in this section under the cover.
    const img45 = (ctx.job.pack?.thumbFinals?.files || []).find(f => f && /linkedin/i.test(f.use || '') && /1080.?1350/.test(f.size || ''));
    const cover = t ? pic(ctx, t, 'LinkedIn video cover')+imageAct(ctx, t, 'li.thumb', '1920×1080', 'LinkedIn cover')+
        (img45 ? '<p class="op-spare"><span class="micro">4:5 image</span> '+ext(httpsUrl(img45.drive?.url) || httpsUrl(img45.url) || '#', 'li.img45', 'op-sub', 'Open the 4:5 image', ' data-op-nocount')+'</p>' : '')
      : '<p class="op-none">Pick a cover below.</p>';
    const ytWait = 'Waits for your YouTube link: paste it under YouTube once the video is live.';
    const words = v ? textBlock('linkedin|body', 'Post', ctx.fill(v.body || '').trim(), !!ctx.partText('linkedin|body'), 'post', 'This post still has a placeholder.', 'li.post')+
        (parts.some(x => x[0] === 'comment') ? textBlock('linkedin|comment', 'First comment', ctx.fill(v.firstComment || '').trim(), !!ctx.partText('linkedin|comment'), 'comment', ctx.job.youtubeUrl ? 'This comment still has a placeholder.' : ytWait, 'li.comment') : '')
      : '<p class="op-none">Pick a post below.</p>';
    return '<section class="op-pf" data-platform="linkedin" aria-labelledby="op-h-li">'+head('02', 'LinkedIn', 'After YouTube is live').replace('<h3>', '<h3 id="op-h-li">')+
      '<div class="op-files">'+videoBeat(ctx.job, 'linkedin', 'li.video', t && ctx.thumbImg(t))+beat(2, 'Cover', 'li.thumb', cover, 'op-image')+'</div>'+
      beat(3, 'Post and first comment', '', words, 'op-words')+slot('linkedin', ctx)+'</section>';
  }
  // Reels: from the reel job's own finals and captions (reels.js hands them over as rc).
  function reels(rc, keys, n, opts) {
    const o = opts || {}; lastRc = rc;
    if (!rc) return o.none ? '<section class="op-pf" data-platform="instagram" aria-labelledby="op-h-rl">'+head(n, 'Instagram reels', '').replace('<h3>', '<h3 id="op-h-rl">')+'<p class="op-none">'+o.none+'</p>'+slot('instagram', o.ctx)+'</section>' : '';
    const items = rc.items || [];
    const blocks = items.map((it, i) => {
      const k = 'rl.'+it.id; keys.push(k+'.reel', k+'.post', k+'.caption'); if (it.postCaption && it.postCaption !== it.caption) keys.push(k+'.postcap');
      const page = rc.reviewUrl;
      const fileAct = (f, key, label) => { if (!f) return '<p class="op-none">Not written yet.</p>';
        const did = f.drive?.driveId || driveId(f.drive?.url), u = did ? driveDl(did) : page || httpsUrl(f.url);
        return (u ? ext(u, key, 'op-act '+(did ? 'op-dl' : 'op-page'), did ? 'Download from Drive' : label) : '')+'<p class="op-spec">'+esc([did ? 'Opens Google Drive' : '', f.detail].filter(Boolean).join(' · '))+'</p>'; };
      const capKey = 'reels|'+it.id, okCap = it.caption && !PH.test(it.caption);
      const words = it.caption ? textBlock(capKey, 'Caption with hashtags', it.caption.trim(), okCap, 'caption', 'This caption still has a placeholder. Ask Claude Code to write it again.', k+'.caption')+
          (it.postCaption && it.postCaption.trim() !== it.caption.trim() ? textBlock(capKey+'|post', '4:5 post caption', it.postCaption.trim(), !PH.test(it.postCaption), 'caption', 'This caption still has a placeholder.', k+'.postcap') : '<p class="op-note">The 4:5 post uses the same caption.</p>')
        : '<p class="op-none">No caption written yet.</p>';
      return '<div class="op-reel"><div class="op-reel-h"><span class="micro">Reel '+(i+1)+' of '+items.length+(it.len ? ' · '+esc(it.len) : '')+(it.music ? ' · '+esc(it.music) : '')+'</span><h4>'+esc(it.name)+'</h4></div>'+
        '<div class="op-files op-files-reel">'+beat(1, 'Reel', k+'.reel', still(it.image, it.len, page, it.name, true)+fileAct(it.reel, k+'.reel', 'Open the reel’s page to download'), 'op-video')+
        beat(2, '4:5 post', k+'.post', '<div class="op-stage"><span class="op-still is-45">'+(it.image && !bad.has(it.image) ? '<img src="'+esc(it.image)+'" alt="'+esc(it.name)+'" loading="lazy">' : '<span class="op-still-t">'+esc(it.name)+'</span>')+'</span></div>'+fileAct(it.post, k+'.post', 'Open the reel’s page to download')+
          (it.cover ? '<p class="op-spare"><span class="micro">Cover</span> '+ext(page || httpsUrl(it.cover.url) || '#', k+'.cover', 'op-sub', 'Open the cover', ' data-op-nocount')+'</p>' : ''), 'op-image')+'</div>'+
        beat(3, 'Caption and hashtags', '', words, 'op-words')+'</div>';
    }).join('');
    return '<section class="op-pf" data-platform="instagram" aria-labelledby="op-h-rl">'+head(n, 'Instagram reels', rc.path === 'B' ? 'Path B · '+items.length+' reels' : items.length+(items.length === 1 ? ' reel' : ' reels')).replace('<h3>', '<h3 id="op-h-rl">')+
      (items.length ? blocks : '<p class="op-none">No reel is finished yet.</p>')+
      '<p class="op-fb">Facebook gets the same reels, 4:5 posts and captions: post them there too. Nothing extra to download.</p>'+slot('instagram', o.ctx)+slot('facebook', o.ctx)+
      '<details class="op-howto"><summary>Posting on Instagram by hand</summary><ol><li>Post the 9:16 file as a Reel. At the crop step choose <b>Original</b>: Instagram starts on a square that cuts the top and bottom off.</li><li>Post the 4:5 file as a post, and open the crop out before Next. A post’s crop cannot be changed after it is shared.</li><li>Set the cover from the cover image.</li><li>Post on or after the day the YouTube video goes out: each caption says the full video is on YouTube.</li></ol></details></section>';
  }
  function x(ctx, keys, n0) {
    const pl = ctx.plats().find(p => p.key === 'x'); if (!pl) return '';
    const v = ctx.chosenPost(pl); const yt = ctx.plats().find(p => p.key === 'youtube'), t = yt && ctx.chosenThumb(yt);
    if (!v) return '<section class="op-pf" data-platform="x">'+head(n0, 'X', 'Last')+'<p class="op-none">Pick an X post below.</p>'+slot('x', ctx)+'</section>';
    const ps = ctx.parts(pl, v), n = ps.length;
    const posts = ps.map(([part, label, txt], i) => { keys.push('x.'+part);
      const name = label[0].toUpperCase()+label.slice(1), wait = /reply|post \d/.test(label) && String(txt).includes(YT_PH) && !ctx.job.youtubeUrl;
      return textBlock('x|'+part, name, ctx.fill(txt).trim(), !!ctx.partText('x|'+part), 'x', wait ? 'Waits for your YouTube link: paste it under YouTube once the video is live.' : 'This post still has a placeholder or is over 280.', 'x.'+part)+
        (i === 0 && window.WWX && ctx.partText('x|body') ? '<p class="op-xopen">'+ext(window.WWX.intent(ctx.partText('x|body')), 'x.open', 'op-sub', 'Open X with '+(n > 1 && v.kind === 'thread' ? 'post 1' : 'this post'), ' data-op-nocount')+'</p>' : ''); }).join('');
    const img = t ? pic(ctx, t, 'YouTube thumbnail to attach')+imageAct(ctx, t, 'x.img', '1280×720', 'YouTube thumbnail', '')+'<p class="op-note">'+esc(pl.note || 'Attach the YouTube thumbnail to the first post.')+'</p>' : '<p class="op-none">'+esc(pl.note || 'Attach the YouTube thumbnail to the first post.')+'</p>';
    return '<section class="op-pf" data-platform="x" aria-labelledby="op-h-x">'+head(n0, 'X', 'Last').replace('<h3>', '<h3 id="op-h-x">')+
      '<div class="op-files op-files-x">'+beat(1, v.kind === 'thread' ? 'Thread, post by post' : 'Post and reply', '', posts, 'op-words')+beat(2, 'Image to attach', '', img, 'op-image')+'</div>'+
      '<p class="op-note">Open X fills in the first post for you to post yourself. Add '+(v.kind === 'thread' ? 'each later post' : 'the reply')+' under it by hand. Nothing is posted from here.</p>'+slot('x', ctx)+'</section>';
  }

  // The posting day: the topic's slot under the Posting settings (the same rule as Schedule), with the posting time.
  function postingLine(job) {
    const P = window.WWStore?.posting, list = window.WWIdeas?.data?.topics || [], t = list.find(x => x.id === job.topicId);
    if (!P || !t) return '';
    let iso = null; try { iso = P.dates(list).get(t.id) || null; } catch { iso = null; }
    if (!iso) return '';
    const d = new Date(iso+'T12:00:00Z'), day = new Intl.DateTimeFormat('en-GB', {weekday:'long', day:'numeric', month:'long', timeZone:'UTC'}).format(d);
    return 'Posting <b>'+esc(day)+(P.settings?.time ? ', '+esc(P.settings.time)+' UK' : '')+'</b>';
  }
  function frame(inner, keys, job, note) {
    const n = keys.filter(k => pressed[k]).length;
    const folder = httpsUrl(job?.driveFolder?.url);
    return '<div class="op-sum"><span class="op-count micro">Pressed <b data-op-count="'+esc(keys.join(' '))+'">'+n+'</b> of '+keys.length+'</span>'+
      '<span class="op-sum-note">Counts what you pressed here, on this device. Each file has its own button; nothing is posted from here.</span>'+
      (folder ? '<span class="op-folder">'+ext(folder, 'folder', 'op-sub', 'Open the Drive folder', ' data-op-nocount')+'<small>Drive’s Download gives zip files, split over 2 GB.</small></span>' : '')+'</div>'+inner;
  }

  // ---- What publish.js and reels.js call ----
  // The Video job at Ready to post: YouTube, LinkedIn, the reels of this video, then X.
  function video(ctx) {
    const job = ctx.job; loadPressed('job:'+job.id);
    const keys = [], rc = ctx.reel && window.WWReels?.readyCtx ? window.WWReels.readyCtx(ctx.reel) : null;
    const rlBody = !ctx.reel ? '' : rc && ctx.reel.status === 'final' ? reels(rc, keys, '03', {ctx})
      : reels(null, keys, '03', {ctx, none:ctx.reel ? 'The reels are not finished yet: '+esc(window.WWReels?.label?.(ctx.reel) || ctx.reel.status)+'. <a class="op-sub" href="#/publish/reels/'+encodeURIComponent(ctx.reel.id)+'">Open the reel job</a>' : 'No reels for this video.'});
    const body = youtube(ctx, keys)+linkedin(ctx, keys)+rlBody+x(ctx, keys, rlBody ? '04' : '03');
    const line = postingLine(job);
    return '<section class="op" aria-labelledby="pb-fin-h" data-own-fallback><div class="op-head"><h2 id="pb-fin-h" tabindex="-1">Ready to post</h2><p class="op-meta">'+(line ? '<span>'+line+'</span>' : '')+'<span>YouTube first, then LinkedIn, Instagram and Facebook, then X</span></p>'+
      (job.finalNote ? '<p class="op-final">'+esc(job.finalNote)+'</p>' : '')+'</div>'+frame('<div class="op-list">'+body+'</div>', keys, job)+'</section>';
  }
  // The Reels lane on its own (#/publish/reels/<id>, status final): the same reel blocks.
  function reelsLane(rc) {
    loadPressed('reels:'+rc.id); const keys = [];
    const body = reels(rc, keys, '01', {ctx:{reel:rc.r}});
    return '<section class="op op-reels" aria-labelledby="rl-ready-h" data-own-fallback><div class="op-head"><h2 id="rl-ready-h" tabindex="-1">Your reels are ready to post</h2>'+(rc.finalNote ? '<p class="op-final">'+esc(rc.finalNote)+'</p>' : '')+'</div>'+frame('<div class="op-list">'+body+'</div>', keys, rc.r)+'</section>';
  }

  // ---- Presses: one listener for the whole page; the texts come from the screen that drew them ----
  const textFor = key => { const [k, part] = key.split('|');
    if (k === 'reels') { const rc = lastRc; const it = rc?.items.find(x => x.id === part); const post = key.endsWith('|post');
      const t = it && (post ? it.postCaption : it.caption); return t && !PH.test(t) ? t.trim() : null; }
    return window.WWPublish?.readyText ? window.WWPublish.readyText(key) : null; };
  function repaintCopy(key) {
    document.querySelectorAll('[data-op-copy="'+CSS.escape(key)+'"]').forEach(b => {
      const had = document.activeElement === b, on = copied === key, label = b.closest('.op-text')?.querySelector('.op-text-h b')?.textContent || '';
      b.removeAttribute('data-done'); b.removeAttribute('data-m'); b.removeAttribute('style');
      const tmp = document.createElement('div'); tmp.innerHTML = '<button'+(M ? M.done('op:'+key, on) : '')+'></button>';
      const src = tmp.firstChild; for (const a of src.attributes) b.setAttribute(a.name, a.value);
      b.innerHTML = M ? M.label(on, 'Copy '+esc(label.toLowerCase()), 'Copied') : (on ? 'Copied' : 'Copy '+esc(label.toLowerCase()));
      if (had) b.focus();
    });
  }
  document.addEventListener('click', async e => {
    const a = e.target.closest?.('a[data-op-press]');
    if (a && a.closest('.op')) { if (!a.hasAttribute('data-op-nocount')) press(a.dataset.opPress); return; }
    const b = e.target.closest?.('button'); if (!b || !b.closest('.op') || b.disabled) return;
    if (b.dataset.opMore) { const k = b.dataset.opMore; open.has(k) ? open.delete(k) : open.add(k);
      const box = b.closest('.op-text'); const ps = [...box.querySelectorAll('.op-box p')]; const isOpen = open.has(k);
      let keep = 0, n = 0; for (const p of ps) { n += p.textContent.length; keep++; if (n > 420) break; }
      ps.forEach((p, i) => { p.hidden = !isOpen && i >= keep; });
      b.setAttribute('aria-expanded', isOpen); b.textContent = isOpen ? 'Show less' : 'Show all · '+(ps.length - keep)+' more paragraphs'; return; }
    if (b.dataset.opCopy) { const key = b.dataset.opCopy, t = textFor(key); if (!t) return;
      try { await navigator.clipboard.writeText(t); } catch { const box = b.closest('.op-text'); if (box && !box.querySelector('.op-blocked')) box.insertAdjacentHTML('beforeend', '<p class="op-warn op-blocked" role="status">Copy was blocked by the browser. Select the text and copy it instead.</p>'); return; }
      const before = copied; copied = key; if (M) M.stamp('on:op:'+key); if (before && before !== key) { if (M) M.stamp('off:op:'+before); repaintCopy(before); }
      repaintCopy(key); press(b.dataset.opKey || key);
      clearTimeout(copyTimer); copyTimer = setTimeout(() => { if (copied === key) { copied = ''; if (M) M.stamp('off:op:'+key); repaintCopy(key); } }, 1800); return; }
    if (b.dataset.opSave && ASSET_SAVE) { // FOLLOW-UP: in-app save of an image the session copied into the app's asset store.
      let dl = null; try { dl = await window.claude?.use?.('downloads'); } catch { dl = null; } if (!dl) return;
      try { const blob = await (await fetch(b.dataset.opAsset)).blob(); await dl.save({filename:b.dataset.opName, data:blob}); press(b.dataset.opSave); } catch {}
    }
  });
  // A still that will not load here shows its words instead (another page's image may be refused by this host).
  document.addEventListener('error', e => { const i = e.target; if (i?.tagName !== 'IMG' || !i.closest('.op')) return;
    bad.add(i.getAttribute('src')); const s = document.createElement('span'); s.className = i.classList.contains('op-img') ? 'op-img op-img-t' : 'op-still-t'; s.textContent = i.alt || 'Preview not available here'; i.replaceWith(s); }, true);

  window.WWOutputs = {video, reelsLane, pressed: () => ({...pressed}), state: () => ({open:[...open], copied, jobId})};
})();
