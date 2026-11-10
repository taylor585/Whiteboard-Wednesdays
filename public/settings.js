/* Settings (Taylor's pick SE-B Skill library, 30 October 2026), opened from the cog top right on every screen.
   The library of installed skills sits on the left; the jobs that use them sit on the right, grouped by screen.
   Choose a skill and every job it can do lights up; choose a job to hand it that skill; Save writes the choice to
   the artifact database (settings/skills). A Publish job copies these when it starts, so a change applies to the next video.
   Phase 7 (4 November 2026, Taylor's decision 7): the booking link is saved here once (settings/links) and goes into
   every post's book-a-call line. It must be a real https link: posts never carry a placeholder such as [BOOKING LINK].
   Connect GitHub (Taylor's pick, direction A, 9 November 2026): one status line under the heading. It reads Claude Code
   Remote's list_repos with Taylor's own connector and says Connected only when the repo comes back with can_push true.
   Connect opens claude.ai/connect-github in a new tab; the line checks again on open and on return to the tab, never on a timer. */
(() => {
  'use strict';
  const root = document.querySelector('#settings');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Versions and descriptions checked against the synced skills on 3 November 2026 (PACKAGE-MANIFEST.json and CHANGELOG.md).
  const SKILLS = [
    {id:'suby-shots-master-poster', name:'Suby Shots · Master Poster', ver:'3.10', kind:'edit', does:'Edits the YouTube master, the LinkedIn cut and the reels, with the Variety Pack first. Replaced by With Katana on 3 November.'},
    {id:'suby-shots-with-katana', name:'Suby Shots · With Katana', ver:'5.0', kind:'edit', does:'The newest edit: Katana, Blender and motion graphics together, the Variety Pack first, and reels from a highlight pack you record on your phone.'},
    {id:'thumbnail-tracker-16-variations', name:'Thumbnail Tracker - 16 Variations', ver:'4.0.0', kind:'thumb', does:'Sixteen thumbnails a round: 8 layouts on light and dark grounds, lit 3D type and objects, a numbered contact sheet and a variety check, every one in YouTube and LinkedIn sizes. Objects only unless you send a phone photo.'},
    {id:'thumbnail-tracker', name:'Thumbnail Tracker', ver:'3.2', kind:'thumb', does:'Five thumbnails a round, three light and two dark, from the packaging research. Objects only unless you send a phone photo.'},
    {id:'performance-poster', name:'Performance Poster', ver:'1.2.1', kind:'post', does:'Titles, descriptions, posts and captions, checked against each platform.'},
    {id:'finishing-touches-copy-and-scripts', name:'Finishing touches copy and scripts', ver:'', kind:'post', does:'Polishes copy in your voice.'},
    {id:'whiteboard-wednesdays', name:'Whiteboard Wednesdays', ver:'2.0', kind:'deck', does:'Builds the presentation decks. Replaced by Reels and Variety on 20 October.'},
    {id:'suby-shots-reels-and-variety', name:'Suby Shots · Reels and Variety', ver:'1.0', kind:'deck', does:'The newest deck builder: a Variety Pack and a vision board of every slide, then the full deck in the library.'},
    {id:'trending-topics', name:'Trending topics', ver:'4.0', kind:'topic', does:'Finds rising topics for the shortlist.'}];
  const JOBS = [
    ['Publish', 'From Drive links to finished, posted videos', [['publishEdit','Video editing','edit','Variety Pack and the finished edits'], ['publishThumbs','Thumbnails','thumb','Sixteen a round for YouTube and LinkedIn'], ['publishPosts','Posts and captions','post','Two variations per platform']]],
    // Reels (Phase 8a, 4 November 2026): the reel lane's own skills, so changing the Video edit never changes the reels.
    ['Reels', 'From one recording to finished reels', [['reelsEdit','Reel highlight pack and edit','edit','Six reels, three highlights each; later the cut and build'], ['reelsCopy','Script polish','post','The fluency pass on every reel script'], ['reelsPosts','Reel captions','post','Checked captions for each reel']]],
    ['Presentations', 'Whiteboard decks', [['decks','Deck building','deck','New decks and slides']]],
    ['Topics', 'Ideas and angles', [['topics','Topic ideas','topic','Angles for the shortlist']]]];
  const DEFAULTS = {publishEdit:'suby-shots-with-katana', publishThumbs:'thumbnail-tracker-16-variations', publishPosts:'performance-poster', reelsEdit:'suby-shots-with-katana', reelsCopy:'finishing-touches-copy-and-scripts', reelsPosts:'performance-poster', decks:'suby-shots-reels-and-variety', topics:'trending-topics'};
  // Honest connection states: nothing here claims a connection the app has not made.
  const CONNECTIONS = [
    ['Google Drive','Publish reads your Drive links. Full-quality finals go to “Whiteboard Wednesdays finals” in your Drive once the one-time Drive set-up is in the environment settings (PUBLISH.md, Full-quality delivery).','Reading: links shared “Anyone with the link”. Uploading: needs the one-time set-up',true],
    ['Claude Code','Runs each Publish job: the edit, the thumbnails and the posts, and the reel highlight pack.','Asks you once, the first time you press Generate',false],
    ['YouTube','Uploads for the Creator watchlist, and posting.','Not connected',true],
    ['LinkedIn and Instagram','Posting from Post all.','Not connected',true]];
  // The booking link (settings/links). A placeholder, a bare word or anything that is not https is refused.
  const bookingProblem = v => { v = String(v || '').trim(); if (!v) return 'Paste your booking link.'; if (/[\[\]{}<>\s]/.test(v)) return 'That looks like a placeholder, not a link. Paste the real booking page address.';
    let u; try { u = new URL(v); } catch { return 'That is not a link. It should start with https://'; }
    return u.protocol !== 'https:' ? 'Use the https:// address of your booking page.' : !/\.[a-z]{2,}$/i.test(u.hostname) ? 'That address has no proper domain.' : ''; };
  let links = {booking:null, updatedAt:null}, linksRef = null, bookingDraft = '', linkMsg = '';
  let saved = {...DEFAULTS}, draft = {...DEFAULTS}, chosen = 'finishing-touches-copy-and-scripts', ref = null, savedAt = null, loaded = false;
  const skill = id => SKILLS.find(s => s.id === id);
  const changes = () => Object.keys(draft).filter(k => draft[k] !== saved[k]).length;
  const when = iso => new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(iso));
  function mono(name) { return name.replace(/[^\p{L} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
  // Two plain text lanes under the heading, like Publish's Video and Reels: Skills (#/settings) and Posting (#/settings/posting).
  let lane = 'skills';
  const laneTabs = () => '<nav class="se-lanes" aria-label="Settings lanes"><a href="#/settings"'+(lane === 'skills' ? ' aria-current="page"' : '')+'>Skills</a><a href="#/settings/posting"'+(lane === 'posting' ? ' aria-current="page"' : '')+'>Posting</a></nav>';
  function render() {
    if (lane === 'posting') return renderPosting();
    const pick = skill(chosen), n = changes();
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · SKILLS AND CONNECTIONS</div><h1 id="se-heading">Your skills</h1><p>Pick a skill on the left, then the jobs it should run. A Publish job copies these when it starts, so a change applies to the next video.</p>'+laneTabs()+ghHtml()+'</div>'+
      '<div class="se-lib"><div class="se-shelf" role="group" aria-label="Installed skills">'+SKILLS.map(s => '<button type="button" class="se-card" data-skill="'+s.id+'" aria-pressed="'+(s.id === chosen)+'"><b>'+esc(s.name)+'</b><small>'+(s.ver ? 'v'+s.ver+' · ' : '')+'installed</small><span>'+esc(s.does)+'</span></button>').join('')+'</div>'+
      '<div class="se-slots">'+JOBS.map(([screen, sub, jobs]) => '<section class="se-grp" aria-label="'+esc(screen)+'"><h2>'+esc(screen)+' <span class="micro">'+esc(sub)+'</span></h2><div class="se-row">'+jobs.map(([key, label, kind, note]) => {
        const hot = pick && pick.kind === kind, now = skill(draft[key]) || {id:draft[key], name:draft[key]};
        return '<button type="button" class="se-job'+(hot ? ' is-hot' : '')+(draft[key] !== saved[key] ? ' is-changed' : '')+'" data-job="'+key+'"'+(hot ? '' : ' aria-disabled="true"')+' aria-label="'+esc(label)+': '+esc(now.name)+(hot && now.id !== pick.id ? '. Press to use '+esc(pick.name) : '')+'"><span class="micro">'+esc(label)+'</span><span class="se-sk"><i aria-hidden="true">'+esc(mono(now.name))+'</i>'+esc(now.name)+'</span><small>'+esc(note)+'</small></button>';
      }).join('')+'</div></section>').join('')+
      linksHtml()+
      '<section class="se-grp" aria-label="Connections"><h2>Connections <span class="micro">What each part of the app needs</span></h2><div class="se-conns">'+CONNECTIONS.map(c => '<div class="se-conn"><i class="se-dot'+(c[3] ? ' is-off' : '')+'" aria-hidden="true"></i><div><b>'+esc(c[0])+'</b><span>'+esc(c[1])+'</span></div><em>'+esc(c[2])+'</em></div>').join('')+'</div></section></div></div>'+
      '<div class="se-save">'+(n ? '<span class="se-chg">'+n+' change'+(n > 1 ? 's' : '')+'</span>' : '')+'<span class="se-when" role="status">'+(n ? 'Not saved yet' : savedAt ? 'Saved '+esc(when(savedAt)) : ref ? 'Using the defaults' : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…')+'</span><span class="se-note">Jobs already running keep their skills.</span><button type="button" class="se-btn" id="se-save"'+(n && ref ? '' : ' disabled')+'>Save skills</button></div>';
  }
  function linkState() {
    const p = bookingProblem(bookingDraft), same = bookingDraft.trim() === (links.booking || '');
    return {p, same, can:!!linksRef && !p && !same};
  }
  function linkStatus() {
    const {p, same} = linkState();
    return linkMsg || (!bookingDraft.trim() && !links.booking ? 'Not saved yet. Without it, Claude Code stops before writing the posts and asks you here.' : same && links.booking ? 'Saved'+(links.updatedAt ? ' '+when(links.updatedAt) : '')+'. Every post’s book-a-call line uses it.' : p || 'Not saved yet');
  }
  function linksHtml() {
    const {can, p} = linkState();
    return '<section class="se-grp" aria-label="Links for posts"><h2>Links for posts <span class="micro">Saved once, used in every post</span></h2><div class="se-links">'+
      '<label class="se-field" for="se-booking"><span>Booking link</span><input id="se-booking" type="url" inputmode="url" autocomplete="url" spellcheck="false" maxlength="500" placeholder="https://…" value="'+esc(bookingDraft)+'"'+(linksRef ? '' : ' disabled')+(p && bookingDraft.trim() ? ' aria-invalid="true"' : '')+' aria-describedby="se-booking-st"></label>'+
      '<button type="button" class="se-btn se-btn-sm" id="se-booking-save"'+(can ? '' : ' disabled')+'>Save link</button>'+
      '<p class="se-link-st'+(p && bookingDraft.trim() && !linkMsg ? ' is-bad' : '')+'" id="se-booking-st" role="status">'+esc(linksRef ? linkStatus() : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…')+'</p>'+
      '<p class="se-note">Goes in the YouTube description and the LinkedIn post, where they say “Book a call”. Posts never carry a placeholder: if this is empty, Claude Code stops before writing them and asks you.</p></div></section>';
  }
  // Typing updates only the button and the status line, so the field keeps its caret.
  root.addEventListener('change', e => { if (lane === 'posting') postingChange(e); });
  root.addEventListener('input', e => {
    if (e.target.id !== 'se-booking') return;
    bookingDraft = e.target.value; linkMsg = '';
    const {can, p} = linkState(), st = root.querySelector('#se-booking-st'), btn = root.querySelector('#se-booking-save');
    if (btn) btn.disabled = !can;
    if (st) { st.textContent = linkStatus(); st.classList.toggle('is-bad', !!(p && bookingDraft.trim())); }
    if (p && bookingDraft.trim()) e.target.setAttribute('aria-invalid', 'true'); else e.target.removeAttribute('aria-invalid');
  });
  root.addEventListener('click', async e => {
    if (lane === 'posting') return postingClick(e);
    const ga = e.target.closest('[data-gh]');
    if (ga) { const a = ga.dataset.gh; if (a === 'connect') { gh = {s:'wait'}; setTimeout(ghPaint); } else if (a === 'manage') {} else if (a === 'allow') ghAllow(); else ghCheck(true); return; }
    const card = e.target.closest('[data-skill]');
    if (card) { chosen = card.dataset.skill; render(); root.querySelector('[data-skill="'+chosen+'"]').focus(); return; }
    const job = e.target.closest('[data-job]');
    if (job && job.getAttribute('aria-disabled') !== 'true') { draft[job.dataset.job] = chosen; render(); root.querySelector('[data-job="'+job.dataset.job+'"]').focus(); return; }
    if (e.target.closest('#se-booking-save')) {
      const {can} = linkState(); if (!can) return;
      const btn = root.querySelector('#se-booking-save'); btn.disabled = true; btn.textContent = 'Saving…';
      try { const at = new Date().toISOString(), booking = bookingDraft.trim(); await linksRef.set({booking, updatedAt:at}); links = {booking, updatedAt:at}; bookingDraft = booking; linkMsg = ''; window.dispatchEvent(new CustomEvent('ww:settings')); }
      catch { linkMsg = 'Could not save the link. Try again.'; }
      render(); root.querySelector('#se-booking')?.focus(); return;
    }
    if (e.target.closest('#se-save') && ref && changes()) {
      const btn = root.querySelector('#se-save'); btn.disabled = true; btn.textContent = 'Saving…';
      try { const at = new Date().toISOString(); await ref.set({slots:draft, updatedAt:at}); saved = {...draft}; savedAt = at; render(); }
      catch { render(); root.querySelector('.se-when').textContent = 'Could not save. Try again.'; }
    }
  });
  // ---- Posting (Taylor, 10 November 2026; direction A "The week" from the three-direction board). ----
  // The week is drawn the way the Schedule draws it: tap a day and it becomes a posting day. Saved as settings/posting
  // through WWStore.posting (the shape and the rule live in ww-store.js); the Schedule, the Topics board and the library
  // wall redraw on ww:settings. Platforms are honest: no account is connected, and nothing here posts anything.
  const P = () => window.WWStore?.posting;
  const PLAT_NOTES = {youtube:'The full video, title and description', linkedin:'The LinkedIn cut and its post', instagram:'The reel and the 4:5 post', facebook:'Follows Instagram: the same reel and 4:5 post', x:'No X post is written yet'};
  const MODE_NOTE = {manual:'<b>Manual posting.</b> You press Post on the day. Nothing goes out by itself.', auto:'<b>Auto posting is chosen.</b> No account is connected yet, so posts stay manual: you still press Post on the day.'};
  let pDraft = null, pBase = '', pMsg = '', pBusy = false;
  const pick4 = s => ({days:s.days.slice(), gap:s.gap, time:s.time, mode:s.mode, platforms:{...s.platforms}});
  const pSaved = () => pick4(P().settings);
  // The draft starts as the saved settings; while it is untouched it follows them (a late load, another tab).
  const pReset = () => { pDraft = pSaved(); pBase = JSON.stringify(pDraft); };
  const pUntouched = () => !pDraft || JSON.stringify(pDraft) === pBase;
  const pChanges = () => { const a = pSaved(), d = pDraft; return (a.days.join() !== d.days.join()) + (a.gap !== d.gap) + (a.time !== d.time) + (a.mode !== d.mode) + Object.keys(a.platforms).filter(k => a.platforms[k] !== d.platforms[k]).length; };
  const dayFmt = isoDay => new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'}).format(new Date(isoDay+'T12:00:00Z')).replace(',', '');
  // What the rule on screen means for the next Wednesday and Friday recordings, bookings included.
  function previewHtml() {
    const now = new Date(), pad = v => String(v).padStart(2, '0'), today = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
    const next = wd => { const d = new Date(today+'T12:00:00Z'); while (d.getUTCDay() !== wd) d.setUTCDate(d.getUTCDate()+1); return d.toISOString().slice(0, 10); };
    const would = P().draft(pDraft, today), topics = window.WWIdeas?.data?.topics || [];
    return [['Wednesday', next(3)], ['Friday', next(5)]].sort((a, b) => a[1].localeCompare(b[1])).map(([name, rec]) => name+'’s video posts <mark>'+esc(dayFmt(P().slot(topics, would, rec)))+'</mark>').join('. ')+'.';
  }
  function renderPosting() {
    const p = P();
    if (!p) { root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · POSTING</div><h1 id="se-heading">Posting</h1><p>Posting settings could not load. Reload the page.</p>'+laneTabs()+'</div>'; return; }
    if (!pDraft) pReset();
    const d = pDraft, n = pChanges(), at = p.settings.updatedAt, names = {mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday'};
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · POSTING</div><h1 id="se-heading">Posting</h1><p>Choose the days your videos go out. The Schedule follows as soon as you save.</p>'+laneTabs()+'</div>'+
      '<div class="po"><section class="po-grp"><h2 id="po-days-h">Posting days <span class="micro">Tap a day to switch it on or off</span></h2><div class="po-week" role="group" aria-labelledby="po-days-h">'+p.WEEK.map(k => { const on = d.days.includes(k), rec = k === 'wed' || k === 'fri';
        return '<button type="button" class="po-day" id="po-day-'+k+'" data-day="'+k+'" aria-pressed="'+on+'" aria-label="'+names[k]+(rec ? ', recording day' : '')+'"><b>'+names[k].slice(0, 3)+'</b><span class="po-tags"><span class="po-tag is-rec'+(rec ? '' : ' is-off')+'">Rec</span><span class="po-tag is-post'+(on ? '' : ' is-off')+'">Post</span></span></button>'; }).join('')+'</div>'+
      '<p class="po-preview" id="po-preview" role="status">'+previewHtml()+'</p></section>'+
      '<section class="po-two"><label class="po-field" for="po-time"><span>Posting time</span><input type="time" id="po-time" value="'+esc(d.time)+'" required><small>UK time. Used when posts go out by themselves</small></label>'+
      '<div class="po-field" role="group" aria-labelledby="po-gap-h"><span id="po-gap-h">Time to edit</span><span class="po-step"><button type="button" id="po-gap-less" data-gap="-1" aria-label="One day less"'+(d.gap <= 1 ? ' disabled' : '')+'>−</button><output id="po-gap" aria-live="polite">'+d.gap+'</output><button type="button" id="po-gap-more" data-gap="1" aria-label="One day more"'+(d.gap >= 14 ? ' disabled' : '')+'>+</button></span><small>At least '+d.gap+' day'+(d.gap > 1 ? 's' : '')+' between recording and posting</small></div></section>'+
      '<section class="po-grp"><h2 id="po-mode-h">How posts go out</h2>'+
        '<div class="pm pm-a" id="po-mode" role="radiogroup" aria-labelledby="po-mode-h" aria-describedby="po-mode-note" data-live="'+p.autoLive(d)+'">'+
          '<label><input type="radio" name="po-mode" id="po-mode-manual" value="manual"'+(d.mode === 'manual' ? ' checked' : '')+'><span>Manual posting</span><small>You press Post on the day.</small></label>'+
          '<label><input type="radio" name="po-mode" id="po-mode-auto" value="auto"'+(d.mode === 'auto' ? ' checked' : '')+'><i aria-hidden="true"></i><span>Auto posting</span><small>Each video goes out at the posting time, once accounts are connected.</small></label></div>'+
        '<p class="pm-note" id="po-mode-note">'+(p.autoLive(d) ? '<b>Auto posting.</b> Each video goes out at '+esc(d.time)+' on its posting day.' : MODE_NOTE[d.mode])+'</p></section>'+
      '<section class="po-grp"><h2>Platforms <span class="micro">Where each video is posted</span></h2><div class="po-plats">'+p.PLATFORMS.map(([k, name]) => '<label class="po-plat" for="po-plat-'+k+'"><input class="po-tick" type="checkbox" id="po-plat-'+k+'" data-plat="'+k+'"'+(d.platforms[k] ? ' checked' : '')+'><span class="po-box" aria-hidden="true"></span><span class="po-plat-text"><b>'+name+'</b><small>'+PLAT_NOTES[k]+'</small></span><em>'+(p.CONNECTED[k] ? 'Connected' : 'Not connected')+'</em></label>').join('')+'</div>'+
        '<p class="po-honest"><i class="se-dot is-off" aria-hidden="true"></i><span>No account is connected yet. Automatic posting starts once they are. Until then you post from Publish.</span></p></section>'+
      '<div class="se-save">'+(n ? '<span class="se-chg">'+n+' change'+(n > 1 ? 's' : '')+'</span>' : '')+'<span class="se-when" id="po-when" role="status">'+esc(pMsg || (n ? 'Not saved yet' : at ? 'Saved '+when(at) : p.canSave ? 'Using the defaults: Tuesday and Thursday' : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…'))+'</span><span class="se-note">Videos already posted keep their dates.</span><button type="button" class="se-btn" id="po-save"'+(n && p.canSave && !pBusy ? '' : ' disabled')+'>'+(pBusy ? 'Saving…' : 'Save posting settings')+'</button></div></div>';
  }
  const pRedraw = id => { pMsg = ''; renderPosting(); if (id) document.getElementById(id)?.focus({preventScroll:true}); };
  async function postingClick(e) {
    const day = e.target.closest('[data-day]');
    if (day) { const k = day.dataset.day, on = pDraft.days.includes(k); pMsg = '';
      if (on && pDraft.days.length === 1) pMsg = 'Keep at least one posting day.'; else pDraft.days = P().WEEK.filter(x => x === k ? !on : pDraft.days.includes(x));
      renderPosting(); document.getElementById(day.id)?.focus({preventScroll:true}); return; }
    const gap = e.target.closest('[data-gap]');
    if (gap) { pDraft.gap = Math.max(1, Math.min(14, pDraft.gap + Number(gap.dataset.gap))); pMsg = ''; renderPosting(); const b = document.getElementById(gap.id); (b && !b.disabled ? b : document.getElementById(gap.id === 'po-gap-less' ? 'po-gap-more' : 'po-gap-less'))?.focus({preventScroll:true}); return; }
    if (e.target.closest('#po-save') && pChanges() && P().canSave && !pBusy) {
      pBusy = true; pMsg = ''; renderPosting();
      try { await P().save(pDraft); pReset(); } catch (err) { pMsg = err?.message || 'Could not save. Try again.'; }
      pBusy = false; renderPosting(); document.getElementById('po-save')?.blur?.();
    }
  }
  function postingChange(e) {
    const t = e.target;
    if (t.id === 'po-time') { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) pDraft.time = t.value; pRedraw('po-time'); return; }
    if (t.name === 'po-mode') { pDraft.mode = t.value === 'auto' ? 'auto' : 'manual'; pRedraw('po-mode-'+pDraft.mode); return; }
    if (t.dataset.plat) { pDraft.platforms[t.dataset.plat] = t.checked; pRedraw(t.id); }
  }
  // A save here, or in another tab, moves the screen on; unsaved changes on screen are kept.
  window.addEventListener('ww:settings', () => { if (!P() || pBusy || !pUntouched()) return; pReset(); if (lane === 'posting' && !root.hidden) { const id = root.contains(document.activeElement) ? document.activeElement.id : ''; renderPosting(); if (id) document.getElementById(id)?.focus({preventScroll:true}); } });
  window.addEventListener('ww:data', () => { if (lane === 'posting' && !root.hidden && pDraft && P()) { const el = document.getElementById('po-preview'); if (el) el.innerHTML = previewHtml(); } });
  async function load() {
    try { await window.WWStore?.connect(); const db = window.WWStore?.db?.(); if (db) { ref = db.doc('settings/skills'); const d = (await ref.get()).data(); if (d?.slots) { saved = {...DEFAULTS, ...d.slots}; draft = {...saved}; savedAt = d.updatedAt || null; } } }
    catch { ref = null; }
    try { const db = window.WWStore?.db?.(); if (db) { linksRef = db.doc('settings/links'); const d = (await linksRef.get()).data(); if (d && typeof d.booking === 'string' && !bookingProblem(d.booking)) links = {booking:d.booking, updatedAt:d.updatedAt || null}; bookingDraft = links.booking || ''; window.dispatchEvent(new CustomEvent('ww:settings')); } }
    catch { linksRef = null; }
    loaded = true; if (!root.hidden) render();
  }
  // ---- Connect GitHub: one honest status line. ----
  const GH_REPO = 'taylor585/Whiteboard-Wednesdays', GH_LINK = 'https://claude.ai/connect-github', CCR = 'Claude Code Remote';
  let gh = {s:'checking'}, ghToken = 0, ghBusy = false;
  const GH = {
    checking:['wait','Checking GitHub…','',null],
    on:['on','GitHub connected.','<span class="se-gh-repo">'+GH_REPO+' · can push</span>',['link','Manage']],
    off:['off','GitHub is not connected.','Publish jobs need it to open your repo.',['btn','Connect GitHub']],
    wait:['wait','Connecting GitHub.','Finish in the claude.ai tab, then come back.',['check','Check now']],
    readonly:['err','GitHub can’t push to your repo.','Publish jobs need to push to '+GH_REPO+'. Give the Claude GitHub App access to it.',['btn','Fix on claude.ai']],
    ask:['off','GitHub not checked yet.','Checking asks you once to allow Claude Code Remote.',['check','Check GitHub',true]],
    perm:['err','GitHub check is switched off.','Allow Claude Code Remote for this app so it can check.',['allow','Allow',true]],
    permMenu:['err','GitHub check is switched off.','Turn Claude Code Remote on in this app’s Permissions menu, then check again.',['check','Check again']],
    reauth:['err','GitHub can’t be checked.','Reconnect Claude Code Remote in claude.ai Settings, Connectors.',['check','Check again',true]],
    noserver:['err','GitHub can’t be checked.','Add Claude Code Remote in claude.ai Settings, Connectors.',['check','Check again',true]],
    down:['err','GitHub can’t be checked right now.','Claude Code Remote didn’t answer. Nothing has changed.',['check','Check again']],
    notool:['off','GitHub can’t be checked from here.','Your Claude Code Remote connection doesn’t offer the repo check in this view.',['link','Open GitHub settings']],
    preview:['off','GitHub can’t be checked in this preview.','The app checks it when it is opened in Claude.',null]};
  const ext = '<span class="se-gh-x" aria-hidden="true">↗</span>', newTab = ' target="_blank" rel="noopener noreferrer" data-gh="connect"';
  function ghHtml() {
    const [dot, lead, text, act] = GH[gh.s] || GH.down;
    const a = !act ? '' : act[0] === 'link' ? '<a class="se-gh-link" id="se-gh-act" href="'+GH_LINK+'"'+newTab.replace('connect', 'manage')+'>'+act[1]+ext+'<span class="sr">(opens claude.ai in a new tab)</span></a>'
      : act[0] === 'btn' ? '<a class="se-gh-btn" id="se-gh-act" href="'+GH_LINK+'"'+newTab+'>'+act[1]+ext+'<span class="sr">(opens claude.ai in a new tab)</span></a>'
      : '<button type="button" class="se-gh-btn'+(act[2] ? '' : ' is-ghost')+'" id="se-gh-act" data-gh="'+act[0]+'"'+(ghBusy ? ' disabled' : '')+'>'+act[1]+'</button>';
    return '<div class="se-gh" id="se-gh" data-state="'+gh.s+'"><i class="se-gh-dot is-'+dot+'" aria-hidden="true"></i><p role="status" tabindex="-1"><b>'+lead+'</b>'+(text ? ' <span>'+text+'</span>' : '')+'</p>'+a+'</div>';
  }
  // Repaint only the line, so typing elsewhere keeps its caret; focus follows the action if it had it.
  function ghPaint() {
    const el = root.querySelector('#se-gh'); if (!el) return;
    const had = el.contains(document.activeElement);
    el.outerHTML = ghHtml();
    if (had) (root.querySelector('#se-gh-act') || root.querySelector('#se-gh p'))?.focus?.();
  }
  const permCodes = ['not_in_manifest','not_granted','approval_required','consent_required'];
  function ghFromError(c) {
    return c === 'needs_reauth' ? 'reauth' : ['server_not_connected','selection_required','server_not_found'].includes(c) ? 'noserver'
      : permCodes.includes(c) ? 'perm' : ['blocked_by_policy','capability_disabled','capability_removed'].includes(c) ? 'notool' : 'down';
  }
  // manual: a press of Check now / Check GitHub / Check again. Without it, a viewer not yet asked is not asked.
  async function ghCheck(manual) {
    if (ghBusy) return;
    const t = ++ghToken, was = gh.s; ghBusy = true;
    if (!['on','wait'].includes(was) || manual) { if (was !== 'wait') gh = {s:'checking'}; ghPaint(); }
    let next;
    try {
      const mcp = await window.claude?.use?.('mcp');
      if (!mcp) next = 'preview';
      else {
        const perms = await Promise.resolve(window.claude.use('permissions')).catch(() => null);
        const ps = perms?.state ? await perms.state('mcp:'+CCR).catch(() => 'unavailable') : null;
        if (ps === 'denied') next = 'perm';
        else if (ps === 'prompt' && !manual) next = 'ask';
        else {
          const lt = await mcp.listTools(CCR), srv = (lt?.servers || []).find(x => x.server === CCR);
          if (!srv || !(srv.tools || []).length) next = 'noserver';
          else if (srv.authStatus === 'needs_reauth') next = 'reauth';
          else if (!srv.tools.some(x => x.name === 'list_repos')) next = 'notool';
          else {
            const r = await mcp.callTool(CCR, 'list_repos', {query:'Whiteboard-Wednesdays', limit:20}, {cache:false});
            const repos = r?.payload?.repos;
            if (!Array.isArray(repos)) next = 'notool';
            else { const hit = repos.find(x => String(x?.full_name || '').toLowerCase() === GH_REPO.toLowerCase());
              next = !hit ? 'off' : hit.can_push === true ? 'on' : 'readonly'; }
          }
        }
      }
    } catch (e) { next = ghFromError(e?.code); }
    if (t !== ghToken) return;
    ghBusy = false;
    // Coming back mid-connect is not a failure: the line keeps waiting until GitHub answers yes or Taylor presses Check now.
    if (was === 'wait' && !manual && next === 'off') next = 'wait';
    gh = {s:next, at:new Date().toISOString()}; ghPaint();
  }
  async function ghAllow() {
    const perms = await Promise.resolve(window.claude?.use?.('permissions')).catch(() => null);
    try { if (!perms?.manage) throw 0; await perms.manage(); ghCheck(true); }
    catch { gh = {s:'permMenu'}; ghPaint(); }
  }
  const settingsOpen = () => !root.hidden && /^#\/settings/.test(location.hash);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && settingsOpen()) ghCheck(false); });
  // links.booking is null until a valid https link is saved; Publish copies it into the job with Approve both.
  // posting: the saved Posting settings (settings/posting). postingMode is what Taylor chose ('manual' | 'auto');
  // postingLive is what actually happens today: 'manual' until an account is connected, whatever was chosen.
  window.WWSettings = {get skills() { return {...saved}; }, get links() { return {...links}; }, bookingProblem, name: id => skill(id)?.name || id,
    get posting() { return P()?.settings || null; }, get postingMode() { return P()?.mode || 'manual'; }, get postingLive() { return P()?.effectiveMode || 'manual'; }};
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'settings') { lane = e.detail[1] === 'posting' ? 'posting' : 'skills'; if (lane === 'posting' && P() && pUntouched()) pReset(); render(); if (lane === 'skills') ghCheck(false); } });
  load();
})();
