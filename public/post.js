/* Post screen (Taylor's pick P-A, built 28 October 2026): upload the three videos, then show the posts and
   thumbnails Claude Code wrote with Performance Poster and Thumbnail Tracker (post-packages.json). The app is
   the vault: it never generates or posts on its own, and uploaded files stay on this device. */
(() => {
  'use strict';
  const root = document.querySelector('#post');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const SLOTS = [['youtube','YouTube','Upload video','16:9'],['linkedin','LinkedIn','Upload video','16:9 or 1:1'],['instagram','Instagram Reel','Upload reel','9:16']];
  const BG = {'paper-grid':'#FFFFFF','brand-yellow':'#F6DF8C','cream-grid':'#F5F3EE','flat':'#F5F3EE','black-glow':'#1C1A17','black-spotlight':'#1C1A17'};
  const FONT = {condensed:'800 {s}px WWBody,Arial,sans-serif', sans:'700 {s}px WWBody,Arial,sans-serif', marker:'700 {s}px WWHand,cursive', serif:'700 {s}px WWEditorial,Georgia,serif', hand:'700 {s}px WWHand,cursive', mono:'500 {s}px WWMono,monospace'};
  const files = {}, edited = {};
  let packages = null, pkg = null, shown = false, round = -1, win = null, frames = [], skills = [], db = null, failed = false;
  const day = v => new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'}).format(new Date(v+'T12:00:00Z'));
  const size = b => b > 1e9 ? (b/1e9).toFixed(1)+' GB' : b > 1e6 ? (b/1e6).toFixed(1)+' MB' : Math.max(1, Math.round(b/1e3))+' KB';
  const time = s => Math.floor(s/60)+':'+String(Math.round(s % 60)).padStart(2, '0');
  function shape(w, h) { const r = w/h; return r > 1.6 ? '16:9' : r > 0.9 && r < 1.1 ? '1:1' : r < 0.65 ? '9:16' : r > 1.1 ? '4:3' : '4:5'; }
  async function load() {
    try { const r = await fetch('post-packages.json', {cache:'no-cache'}); if (!r.ok) throw Error(); packages = (await r.json()).packages || []; }
    catch { packages = []; failed = true; }
    const today = new Date().toISOString().slice(0, 10);
    pkg = packages.slice().sort((a,b) => (a.postDate < today) - (b.postDate < today) || a.postDate.localeCompare(b.postDate))[0] || null;
    try { await window.WWStore?.connect(); db = window.WWStore?.db?.() || null; } catch { db = null; }
    if (db) db.collection('skills').onSnapshot(snap => { skills = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()})); renderSkills(); }, () => {});
    render();
  }
  // Part 1: the upload boxes. Files never leave this device; each one gets a local preview link.
  function slot([key, label, button, want]) {
    const f = files[key];
    const warn = f && f.shape && !want.split(' or ').includes(f.shape) ? '<p class="po-warn">This is '+f.shape+'. '+label+' expects '+want+'.</p>' : '';
    return '<div class="po-up" data-slot="'+key+'"><div class="po-up-h"><span class="po-pl po-pl-'+key+'">'+label+'</span><span class="micro">'+want+'</span></div>'+
      (f ? '<div class="po-file"><video src="'+f.url+'#t=0.5" muted playsinline preload="metadata" aria-label="'+esc(label)+' preview"></video><div><b>'+esc(f.file.name)+'</b><small>'+(f.shape ? f.shape+' · '+time(f.dur)+' · '+f.w+'×'+f.h+' · ' : '')+size(f.file.size)+'</small><span class="po-file-acts"><label class="po-link">Replace<input type="file" accept="video/*" data-pick="'+key+'" hidden></label><button type="button" class="po-link" data-remove="'+key+'">Remove</button></span></div></div>'+warn
         : '<label class="po-drop"><span class="po-btn po-btn-ink">＋ '+button+'</span><small>or drag it here</small><input type="file" accept="video/*" data-pick="'+key+'" hidden></label>')+'</div>';
  }
  function pick(key, file) {
    if (!file || !file.type.startsWith('video/')) { status('That file is not a video. Choose an MP4, MOV or WebM file.'); return; }
    if (files[key]) URL.revokeObjectURL(files[key].url);
    const url = URL.createObjectURL(file), entry = files[key] = {file, url};
    const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.src = url;
    v.onloadedmetadata = () => { if (files[key] !== entry) return; Object.assign(entry, {w:v.videoWidth, h:v.videoHeight, dur:v.duration, shape:shape(v.videoWidth, v.videoHeight)}); if (key === 'youtube') frames = []; render(); };
    v.onerror = () => { if (files[key] === entry) render(); };
    render();
  }
  // Part 2: one block per platform, laid out like Taylor's "Ready to post" reference.
  function block(key) {
    const p = pkg.platforms[key], f = files[key], c = p.check, fill = (pkg.toFill || {})[key] || [];
    const meta = [p.label, f && f.dur ? time(f.dur) : null, f && f.shape, 'posts '+day(pkg.postDate)].filter(Boolean).join(' · ');
    const text = edited[key] ?? (p.body+'\n\n'+p.tags);
    return '<article class="po-block po-block-'+key+'"><div class="po-vid'+(key === 'instagram' ? ' po-tall' : '')+'">'+(f ? '<video src="'+f.url+'" controls playsinline preload="metadata" aria-label="'+esc(p.label)+' video"></video>' : '<p>Upload the '+esc(p.label)+' video above to preview it here.</p>')+'</div>'+
      '<div class="po-copy"><div class="po-meta">'+esc(meta.toUpperCase())+'</div><h3>'+esc(p.heading)+'</h3>'+
      '<div class="po-check micro">'+esc(p.kind)+' (checked: '+c.fail+' fail'+(c.fail === 1 ? '' : 's')+')'+(edited[key] !== undefined ? ' <span class="po-flag">Edited since the check</span>' : '')+'</div>'+
      '<div class="po-text" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="'+esc(p.label+' '+p.kind.toLowerCase())+'" data-text="'+key+'">'+esc(text)+'</div>'+
      (p.firstComment ? '<div class="po-check micro">First comment</div><div class="po-text po-text-sm" data-first="'+key+'">'+esc(p.firstComment)+'</div>' : '')+
      '<div class="po-acts"><button type="button" class="po-btn po-btn-cream" data-copy="'+key+'">Copy '+esc(p.kind.toLowerCase())+'</button>'+(p.firstComment ? '<button type="button" class="po-btn po-btn-ghost" data-copy-first="'+key+'">Copy first comment</button>' : '')+'<span class="po-copied" data-copied="'+key+'" role="status"></span></div>'+
      (fill.length ? '<p class="po-fill"><b>To fill before posting:</b> '+fill.map(esc).join(', ')+'</p>' : '')+'</div></article>';
  }
  // Part 3: Thumbnail Tracker's variety pack, five at a time, using frames of the uploaded YouTube video as the face.
  function tile(t, i) {
    const lines = t.headline.split('\n').map(l => esc(l).replace(new RegExp('('+t.highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')+')', 'i'), '<mark>$1</mark>'));
    const stick = (t.stickers || []).slice(0, 2).map((s, k) => '<span class="po-st po-st'+k+(s.type === 'mark' ? ' po-st-mark' : '')+'" aria-hidden="true">'+esc(s.text)+'</span>').join('');
    return '<div class="po-tc'+(win === i ? ' po-won' : '')+'"><div class="po-tile po-bg-'+esc(t.bg)+' po-f-'+esc(t.font)+' po-m-'+esc(t.mark)+'" style="--acc:'+esc(t.accent || '#8B6002')+';--hc:'+esc(t.color || '#1C1A17')+'" role="img" aria-label="Thumbnail '+(i+1)+': '+esc(t.headline.replace('\n', ' '))+'">'+
      '<i class="po-face" style="'+(frames[i] ? 'background-image:url('+frames[i]+')' : '')+'"></i><b>'+lines.join('<br>')+'</b>'+stick+'</div>'+
      '<label class="po-win"><input type="radio" name="po-win" value="'+i+'"'+(win === i ? ' checked' : '')+' data-win="'+i+'"><span class="po-bub" aria-hidden="true"></span>'+(win === i ? 'Winner' : 'Pick')+'</label>'+
      '<small class="po-axes">'+esc([t.theme, t.bg.replace('-', ' '), t.font, t.mark].join(' · '))+'</small></div>';
  }
  function render() {
    if (packages === null) { root.innerHTML = '<p class="po-status">Loading your posts…</p>'; return; }
    const ready = pkg && ['youtube','linkedin','instagram'].every(k => pkg.platforms[k]);
    root.innerHTML = '<div class="po-head"><div><div class="micro">POST'+(pkg ? ' · '+esc(pkg.title.toUpperCase())+' · POSTS '+esc(day(pkg.postDate).toUpperCase()) : '')+'</div><h1 id="po-heading">Ready to post</h1>'+
      '<p>Upload the videos, then bring in the posts and thumbnails Claude wrote for this video. Check them, pick a thumbnail and take everything to each platform in one go.</p>'+
      (packages.length > 1 ? '<label class="po-pickv">Video <select data-video>'+packages.map(p => '<option value="'+esc(p.id)+'"'+(p === pkg ? ' selected' : '')+'>'+esc(p.title)+' · posts '+esc(day(p.postDate))+'</option>').join('')+'</select></label>' : '')+'</div>'+
      '<div class="po-top"><button type="button" class="po-cog" data-cog aria-expanded="false" aria-controls="po-skills"><span aria-hidden="true">⚙</span> Skills</button><button type="button" class="po-btn po-btn-ink" data-postall'+(shown ? '' : ' disabled')+'>Post all</button></div></div>'+
      '<aside class="po-skills" id="po-skills" hidden aria-label="Skills"></aside>'+
      '<h2 class="po-h2"><span class="micro">01</span> Upload the content</h2><div class="po-ups">'+SLOTS.map(slot).join('')+'</div>'+
      '<div class="po-gens"><button type="button" class="po-btn po-btn-ink po-big" data-gen'+(ready ? '' : ' disabled')+'>'+(shown ? 'Show the posts again' : 'Generate post')+'</button><small>Uses '+esc(pkg?.skills?.post || 'Performance Poster')+'</small>'+
      '<button type="button" class="po-btn po-btn-ghost po-big" data-thumbs'+(pkg?.thumbnails?.length ? '' : ' disabled')+'>Generate thumbnail</button><small>Uses '+esc(pkg?.skills?.thumb || 'Thumbnail Tracker')+' · five at a time</small></div>'+
      '<p class="po-status" role="status">'+(failed ? 'The saved posts could not be loaded. Check your connection and reload.' : !pkg ? 'No posts are saved yet. Ask Claude to package the next video with Performance Poster and Thumbnail Tracker, and they will appear here.' : '')+'</p>'+
      (shown && ready ? '<h2 class="po-h2"><span class="micro">02</span> Generated posts</h2><p class="po-note">Written by Claude with '+esc(pkg.skills.post)+' and checked with its checker before saving. '+esc(pkg.source || '')+'</p>'+['youtube','linkedin','instagram'].map(block).join('') : '')+
      (round >= 0 ? '<div class="po-thead"><h2 class="po-h2"><span class="micro">03</span> Thumbnail</h2>'+(round < pkg.thumbnails.length - 1 ? '<button type="button" class="po-link" data-more>Generate 5 more</button>' : '<span class="po-last">Last saved round ('+(round+1)+' of '+pkg.thumbnails.length+')</span>')+'</div><p class="po-note">'+esc(pkg.skills.thumb)+' variety pack: 3 light and 2 dark backgrounds, different typefaces and marks, with and without emoji ('+esc((pkg.varietyCheck || [])[round] || 'not checked')+').'+(files.youtube ? ' Faces are frames from your YouTube video.' : ' Upload the YouTube video to use its frames.')+'</p><div class="po-tiles">'+pkg.thumbnails[round].map(tile).join('')+'</div>'+(win !== null ? '<button type="button" class="po-btn po-btn-ghost" data-dl>Download winner (1280×720 PNG)</button>' : '') : '')+
      '<dialog class="po-dialog" aria-labelledby="po-dh"></dialog>';
    renderSkills();
  }
  function renderSkills() {
    const el = root.querySelector('#po-skills'); if (!el) return;
    const base = [['post', pkg?.skills?.post || 'Performance Poster', 'Writes the YouTube description, LinkedIn post and Instagram caption, then checks them.'], ['thumb', pkg?.skills?.thumb || 'Thumbnail Tracker', 'Plans each round of thumbnails as a variety pack and checks it.']];
    el.innerHTML = '<div class="po-sk-h"><b>Skills</b><button type="button" class="po-link" data-cog>Close</button></div><p>Claude runs these skills from your Claude account when it packages a video. This list records which skill each button uses.</p>'+
      base.map(([use, name, what]) => '<div class="po-sk"><b>'+esc(name)+'</b><small>'+esc(what)+'</small><span class="micro">USED BY '+(use === 'post' ? 'GENERATE POST' : 'GENERATE THUMBNAIL')+'</span></div>').join('')+
      skills.map(s => '<div class="po-sk"><b>'+esc(s.name)+'</b><small>'+esc(s.file || '')+'</small><label class="micro">USED BY <select data-skill-use="'+esc(s.id)+'"><option value="post"'+(s.use === 'post' ? ' selected' : '')+'>Generate post</option><option value="thumb"'+(s.use === 'thumb' ? ' selected' : '')+'>Generate thumbnail</option></select></label><button type="button" class="po-link" data-skill-del="'+esc(s.id)+'">Remove</button></div>').join('')+
      '<label class="po-drop po-drop-sm"><span>＋ Add a skill file</span><small>'+(db ? '.md, .zip or .skill. Only the name is saved here. Add the skill itself to your Claude account so Claude can use it.' : 'Saved skill lists need the Claude app. Open this page in Claude to keep them.')+'</small><input type="file" accept=".md,.zip,.skill" data-skill-file hidden'+(db ? '' : ' disabled')+'></label>';
  }
  const status = t => { const el = root.querySelector('.po-status'); if (el) el.textContent = t; };
  // Seek through the YouTube upload and keep five frames for the thumbnail faces.
  function grab(url, n) {
    return new Promise(resolve => {
      const v = document.createElement('video'), out = [], c = document.createElement('canvas'); c.width = 360; c.height = 360;
      let i = 0; v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
      const done = () => { v.removeAttribute('src'); v.load(); resolve(out); };
      const next = () => { if (i >= n) return done(); v.currentTime = Math.max(0.1, v.duration * (0.12 + i * 0.18)); };
      v.onloadeddata = next; v.onerror = done;
      v.onseeked = () => { const s = Math.min(v.videoWidth, v.videoHeight); try { c.getContext('2d').drawImage(v, (v.videoWidth-s)/2, (v.videoHeight-s)/2, s, s, 0, 0, 360, 360); out.push(c.toDataURL('image/jpeg', .82)); } catch { out.push(''); } i++; next(); };
      setTimeout(done, 15000);
    });
  }
  async function thumbs(nextRound) {
    if (nextRound >= pkg.thumbnails.length) { status('That is every saved round for this video. Ask Claude for another round with Thumbnail Tracker and it will appear here.'); return; }
    round = nextRound; win = null;
    if (files.youtube && !frames.length) { render(); status('Taking frames from your YouTube video…'); frames = await grab(files.youtube.url, 5); }
    render(); root.querySelector('.po-tiles')?.scrollIntoView({block:'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  // Draw the chosen thumbnail at 1280×720 so it can go straight into YouTube Studio.
  async function download() {
    const t = pkg.thumbnails[round][win], c = document.createElement('canvas'), x = c.getContext('2d'); c.width = 1280; c.height = 720;
    await Promise.all(['WWBody','WWHand','WWEditorial'].map(f => document.fonts.load('700 40px '+f).catch(() => {})));
    const dark = t.theme === 'dark'; x.fillStyle = BG[t.bg] || '#FFFFFF'; x.fillRect(0, 0, 1280, 720);
    if (t.bg.endsWith('grid')) { x.strokeStyle = 'rgba(28,26,23,.09)'; x.lineWidth = 2; for (let g = 40; g < 1280; g += 40) { x.beginPath(); x.moveTo(g, 0); x.lineTo(g, 720); x.stroke(); } for (let g = 40; g < 720; g += 40) { x.beginPath(); x.moveTo(0, g); x.lineTo(1280, g); x.stroke(); } }
    if (dark) { const r = x.createRadialGradient(960, 360, 40, 960, 360, 560); r.addColorStop(0, t.bg === 'black-glow' ? 'rgba(246,223,140,.28)' : 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(28,26,23,0)'); x.fillStyle = r; x.fillRect(0, 0, 1280, 720); }
    const face = frames[win];
    x.save(); x.beginPath(); x.arc(960, 360, 240, 0, Math.PI*2); x.closePath(); x.fillStyle = dark ? '#1C1A17' : '#5C5750'; x.fill();
    if (face) { const img = new Image(); img.src = face; await img.decode().catch(() => {}); x.clip(); x.drawImage(img, 720, 120, 480, 480); }
    x.restore(); x.lineWidth = 12; x.strokeStyle = t.accent || '#8B6002'; x.beginPath(); x.arc(960, 360, 240, 0, Math.PI*2); x.stroke();
    const lines = t.headline.split('\n'), font = FONT[t.font] || FONT.sans;
    let s = 150; const fit = () => { x.font = font.replace('{s}', s); return Math.max(...lines.map(l => x.measureText(l).width)); };
    while (s > 40 && (fit() > 640 || s * 1.05 * lines.length > 480)) s -= 4;
    x.textBaseline = 'alphabetic'; const top = 360 - (lines.length * s * 1.05) / 2 + s * .85;
    lines.forEach((line, n) => {
      const y = top + n * s * 1.05, at = line.toUpperCase().indexOf(t.highlight.toUpperCase());
      const pre = at >= 0 ? line.slice(0, at) : line, word = at >= 0 ? line.slice(at, at + t.highlight.length) : '', post = at >= 0 ? line.slice(at + t.highlight.length) : '';
      let px = 40; x.fillStyle = t.color || (dark ? '#FFFFFF' : '#1C1A17'); x.fillText(pre, px, y); px += x.measureText(pre).width;
      if (word) {
        const w = x.measureText(word).width;
        if (t.mark === 'box') { x.fillStyle = t.accent || '#F6DF8C'; x.fillRect(px - 8, y - s * .82, w + 16, s * .98); x.fillStyle = '#1C1A17'; }
        else if (t.mark === 'color') x.fillStyle = t.accent || '#8B6002';
        x.fillText(word, px, y);
        if (t.mark === 'underline') { x.fillStyle = t.accent || '#8B6002'; x.fillRect(px, y + s * .1, w, Math.max(6, s * .07)); }
        px += w; x.fillStyle = t.color || (dark ? '#FFFFFF' : '#1C1A17');
      }
      x.fillText(post, px, y);
    });
    (t.stickers || []).filter(st => st.type === 'emoji').slice(0, 2).forEach((st, k) => { x.font = '96px sans-serif'; x.fillText(st.text, k ? 1120 : 680, k ? 640 : 130); });
    c.toBlob(b => save(b, 'YouTube-thumbnail-1280x720.png'), 'image/png');
  }
  function save(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  const textOf = key => root.querySelector('[data-text="'+key+'"]')?.innerText.trim() ?? (pkg.platforms[key].body+'\n\n'+pkg.platforms[key].tags);
  async function copy(text, key, what) {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); try { document.execCommand('copy'); } finally { t.remove(); } }
    const el = root.querySelector('[data-copied="'+key+'"]'); if (el) { el.textContent = what+' copied'; setTimeout(() => { el.textContent = ''; }, 2500); }
  }
  // Post all gathers everything for a final look; it never posts. Platform posting needs approvals and a server.
  function postAll() {
    const d = root.querySelector('.po-dialog'), t = round >= 0 && win !== null ? pkg.thumbnails[round][win] : null;
    d.innerHTML = '<h2 id="po-dh">Post all three</h2><p>Everything for <b>'+esc(pkg.title)+'</b>, posting '+esc(day(pkg.postDate))+'.</p><ul class="po-sum">'+
      ['youtube','linkedin','instagram'].map(k => { const p = pkg.platforms[k], f = files[k]; return '<li><b>'+esc(p.label)+'</b><span>'+esc(p.heading)+'</span><small>'+(f ? esc(f.file.name) : 'No video uploaded yet')+' · checked: '+p.check.fail+' fails'+(edited[k] !== undefined ? ' · edited since the check' : '')+(k === 'youtube' ? ' · thumbnail: '+(t ? esc(t.headline.replace('\n', ' '))+' ('+esc(t.bg.replace('-', ' '))+')' : 'not picked yet') : '')+'</small></li>'; }).join('')+'</ul>'+
      '<p class="po-note">Posting straight to YouTube, LinkedIn and Instagram needs each platform to approve this app and a server to send the files, so nothing is posted from here yet. Download the package, then paste each post and upload each file on its platform.</p>'+
      '<div class="po-acts"><button type="button" class="po-btn po-btn-ink" data-dl-posts>Download posts (.txt)</button>'+(t ? '<button type="button" class="po-btn po-btn-ghost" data-dl>Download thumbnail</button>' : '')+'<button type="button" class="po-link" data-close>Close</button></div>';
    d.showModal();
  }
  function postsText() {
    return ['youtube','linkedin','instagram'].map(k => { const p = pkg.platforms[k]; return '=== '+p.label.toUpperCase()+' ('+p.kind+') ===\n'+(k === 'youtube' ? 'Title: '+pkg.title+'\n\n' : '')+textOf(k)+(p.firstComment ? '\n\nFirst comment:\n'+p.firstComment : '')+((pkg.toFill || {})[k]?.length ? '\n\nTo fill before posting: '+pkg.toFill[k].join(', ') : ''); }).join('\n\n\n')+'\n';
  }
  root.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-gen')) { shown = true; render(); root.querySelector('.po-block')?.scrollIntoView({block:'nearest'}); return; }
    if (b.hasAttribute('data-thumbs')) return thumbs(round < 0 ? 0 : round);
    if (b.hasAttribute('data-more')) return thumbs(round + 1);
    if (b.hasAttribute('data-remove')) { const k = b.dataset.remove; URL.revokeObjectURL(files[k].url); delete files[k]; if (k === 'youtube') frames = []; return render(); }
    if (b.hasAttribute('data-copy')) return copy(textOf(b.dataset.copy), b.dataset.copy, pkg.platforms[b.dataset.copy].kind);
    if (b.hasAttribute('data-copy-first')) return copy(pkg.platforms[b.dataset.copyFirst].firstComment, b.dataset.copyFirst, 'First comment');
    if (b.hasAttribute('data-cog')) { const s = root.querySelector('#po-skills'), top = root.querySelector('.po-top'); s.hidden = !s.hidden; s.style.top = (top.offsetTop + top.offsetHeight + 10)+'px'; root.querySelector('.po-cog').setAttribute('aria-expanded', String(!s.hidden)); return; }
    if (b.hasAttribute('data-postall')) return postAll();
    if (b.hasAttribute('data-dl')) return download();
    if (b.hasAttribute('data-dl-posts')) return save(new Blob([postsText()], {type:'text/plain'}), pkg.id+'-posts.txt');
    if (b.hasAttribute('data-close')) return root.querySelector('.po-dialog').close();
    if (b.hasAttribute('data-skill-del') && db) { try { await db.collection('skills').doc(b.dataset.skillDel).delete(); } catch { status('That skill could not be removed. Please try again.'); } }
  });
  root.addEventListener('change', async e => {
    const t = e.target;
    if (t.matches('[data-pick]')) return pick(t.dataset.pick, t.files[0]);
    if (t.matches('[data-win]')) { win = Number(t.value); return render(); }
    if (t.matches('[data-video]')) { pkg = packages.find(p => p.id === t.value); shown = false; round = -1; win = null; for (const k in edited) delete edited[k]; return render(); }
    if (t.matches('[data-skill-file]') && t.files[0] && db) {
      const f = t.files[0], id = f.name.replace(/\.(md|zip|skill)$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60) || 'skill';
      try { await db.collection('skills').doc(id).set({name:f.name.replace(/\.(md|zip|skill)$/i, ''), file:f.name, use:'post', addedAt:new Date().toISOString()}); } catch { status('That skill could not be saved. Please try again.'); }
    }
    if (t.matches('[data-skill-use]') && db) { try { await db.collection('skills').doc(t.dataset.skillUse).update({use:t.value}); } catch { status('That change could not be saved. Please try again.'); } }
  });
  root.addEventListener('input', e => { const k = e.target.dataset?.text; if (k && edited[k] === undefined) { edited[k] = ''; const flag = e.target.parentElement.querySelector('.po-check'); if (flag && !flag.querySelector('.po-flag')) flag.insertAdjacentHTML('beforeend', ' <span class="po-flag">Edited since the check</span>'); } if (k) edited[k] = e.target.innerText; });
  root.addEventListener('dragover', e => { const z = e.target.closest('.po-up'); if (z) { e.preventDefault(); z.classList.add('po-over'); } });
  root.addEventListener('dragleave', e => { e.target.closest('.po-up')?.classList.remove('po-over'); });
  root.addEventListener('drop', e => { const z = e.target.closest('.po-up'); if (!z) return; e.preventDefault(); z.classList.remove('po-over'); pick(z.dataset.slot, e.dataTransfer.files[0]); });
  window.addEventListener('ww:route', event => { if (event.detail[0] === 'post') { if (packages === null) load(); else render(); } });
})();
