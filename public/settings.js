/* Settings (Taylor's pick SE-B Skill library, 30 October 2026), opened from the cog top right on every screen.
   The library of installed skills sits on the left; the jobs that use them sit on the right, grouped by screen.
   Choose a skill and every job it can do lights up; choose a job to hand it that skill; Save writes the choice to
   the artifact database (settings/skills). A Publish job copies these when it starts, so a change applies to the next video.
   Phase 7 (4 November 2026, Taylor's decision 7): the booking link is saved here once (settings/links) and goes into
   every post's book-a-call line. It must be a real https link: posts never carry a placeholder such as [BOOKING LINK].
   Connect GitHub (Taylor's pick, direction A, 9 November 2026): one status line under the heading. It reads Claude Code
   Remote's list_repos with Taylor's own connector and says Connected only when the repo comes back with can_push true.
   Connect opens claude.ai/connect-github in a new tab; the line checks again on open and on return to the tab, never on a timer.
   Connections (Taylor, 10 November 2026): a third lane, #/settings/connections, one card per account. See the block below. */
(() => {
  'use strict';
  const root = document.querySelector('#settings');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Versions and descriptions checked against the synced skills on 3 November 2026 (PACKAGE-MANIFEST.json and CHANGELOG.md);
  // Split Screen Katana 5.1.0 (PACKAGE-MANIFEST.json) added and made the Video and Reel edit default on 10 November 2026 (Taylor).
  const SKILLS = [
    {id:'suby-shots-master-poster', name:'Suby Shots · Master Poster', ver:'3.10', kind:'edit', does:'Edits the YouTube master, the LinkedIn cut and the reels, with the Variety Pack first. Replaced by With Katana on 3 November.'},
    {id:'suby-shots-split-screen-katana', name:'Suby Shots · Split Screen Katana', ver:'5.1.0', kind:'edit', does:'The newest edit: everything in With Katana, and every reel is split screen. Your face from the phone take fills the bottom half; Katana, Blender, story films, B-roll and web clips fill the top half. 60 seconds or less.'},
    {id:'suby-shots-with-katana', name:'Suby Shots · With Katana', ver:'5.0', kind:'edit', does:'Katana, Blender and motion graphics together, the Variety Pack first, and full-frame reels from a highlight pack you record on your phone. Replaced by Split Screen Katana on 10 November.'},
    {id:'thumbnail-tracker-16-variations', name:'Thumbnail Tracker - 16 Variations', ver:'4.0.0', kind:'thumb', does:'Sixteen thumbnails a round: 8 layouts on light and dark grounds, lit 3D type and objects, a numbered contact sheet and a variety check, every one in YouTube and LinkedIn sizes. Objects only unless you send a phone photo.'},
    {id:'thumbnail-tracker', name:'Thumbnail Tracker', ver:'3.2', kind:'thumb', does:'Five thumbnails a round, three light and two dark, from the packaging research. Objects only unless you send a phone photo.'},
    {id:'performance-poster', name:'Performance Poster', ver:'1.2.1', kind:'post', does:'Titles, descriptions, posts and captions, checked against each platform.'},
    {id:'finishing-touches-copy-and-scripts', name:'Finishing touches copy and scripts', ver:'', kind:'post', does:'Polishes copy in your voice.'},
    {id:'whiteboard-wednesdays', name:'Whiteboard Wednesdays', ver:'2.0', kind:'deck', does:'Builds the presentation decks. Replaced by Reels and Variety on 20 October.'},
    {id:'suby-shots-reels-and-variety', name:'Suby Shots · Reels and Variety', ver:'1.0', kind:'deck', does:'The newest deck builder: a Variety Pack and a vision board of every slide, then the full deck in the library.'},
    {id:'trending-topics-talking-points', name:'Trending Topics - Talking Points', ver:'5.4.1', kind:'topic', does:'Finds the week\'s 7 videos (a month of 30 on request) from three engines: what 16 AI and paid-media giants post on X, your own work of the last 30 days, and your creators\' breakouts. Every video gets 4 main talking points.'},
    {id:'trending-topics', name:'Trending topics', ver:'4.0', kind:'topic', does:'Finds rising topics for the shortlist. Replaced by Trending Topics - Talking Points on 11 November.'}];
  const JOBS = [
    ['Publish', 'From Drive links to finished, posted videos', [['publishEdit','Video editing','edit','Variety Pack and the finished edits'], ['publishThumbs','Thumbnails','thumb','Sixteen a round for YouTube and LinkedIn'], ['publishPosts','Posts and captions','post','Two variations per platform']]],
    // Reels (Phase 8a, 4 November 2026): the reel lane's own skills, so changing the Video edit never changes the reels.
    ['Reels', 'From one recording to finished reels', [['reelsEdit','Reel highlight pack and edit','edit','Six reels, three highlights each; then split-screen reels: your face below, the motion above'], ['reelsCopy','Script polish','post','The fluency pass on every reel script'], ['reelsPosts','Reel captions','post','Checked captions for each reel']]],
    ['Presentations', 'Whiteboard decks', [['decks','Deck building','deck','New decks and slides']]],
    ['Topics', 'Ideas and angles', [['topics','Topic ideas','topic','Angles for the shortlist']]]];
  const DEFAULTS = {publishEdit:'suby-shots-split-screen-katana', publishThumbs:'thumbnail-tracker-16-variations', publishPosts:'performance-poster', reelsEdit:'suby-shots-split-screen-katana', reelsCopy:'finishing-touches-copy-and-scripts', reelsPosts:'performance-poster', decks:'suby-shots-reels-and-variety', topics:'trending-topics-talking-points'};
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
  // Three plain text lanes under the heading, like Publish's Video and Reels: Skills (#/settings), Posting (#/settings/posting)
  // and Connections (#/settings/connections, a card opened at #/settings/connections/<account>).
  let lane = 'skills';
  const laneTabs = () => '<nav class="se-lanes" aria-label="Settings lanes">'+[['skills', '#/settings', 'Skills'], ['posting', '#/settings/posting', 'Posting'], ['connections', '#/settings/connections', 'Connections']].map(([k, href, name]) => '<a href="'+href+'"'+(lane === k ? ' aria-current="page"'+M.attr('se-lane', 'draw') : '')+'>'+name+'</a>').join('')+'</nav>';
  // Motion (motion.js): the change chip fades in when the first change is made, and a save shows Saved on its button for 1.8s.
  const M = window.WWMotion; let chgN = 0, pChgN = 0, flash = '';
  const chip = (n, was, key) => { if (n && !was) M.stamp(key); return n ? '<span class="se-chg"'+M.attr(key, 'fade')+'>'+n+' change'+(n > 1 ? 's' : '')+'</span>' : ''; };
  function savedFlash(key, id, text) { flash = key; M.stamp('on:'+key); M.stamp('se-saved'); setTimeout(() => { if (flash !== key) return; flash = ''; const b = document.getElementById(id); if (!b || !b.hasAttribute('data-done')) return; b.removeAttribute('data-done'); b.style.removeProperty('--m-skip'); b.dataset.m = 'unfill'; b.innerHTML = M.label(false, text, 'Saved'); }, 1800); }
  function render() {
    if (lane === 'posting') return renderPosting();
    if (lane === 'connections') return renderConnections();
    const pick = skill(chosen), n = changes();
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · SKILLS</div><h1 id="se-heading">Your skills</h1><p>Pick a skill on the left, then the jobs it should run. A Publish job copies these when it starts, so a change applies to the next video.</p>'+laneTabs()+ghHtml()+'</div>'+
      '<div class="se-lib"><div class="se-shelf" role="group" aria-label="Installed skills">'+SKILLS.map(s => '<button type="button" class="se-card" data-skill="'+s.id+'" aria-pressed="'+(s.id === chosen)+'"><b>'+esc(s.name)+'</b><small>'+(s.ver ? 'v'+s.ver+' · ' : '')+'installed</small><span>'+esc(s.does)+'</span></button>').join('')+'</div>'+
      '<div class="se-slots">'+JOBS.map(([screen, sub, jobs]) => '<section class="se-grp" aria-label="'+esc(screen)+'"><h2>'+esc(screen)+' <span class="micro">'+esc(sub)+'</span></h2><div class="se-row">'+jobs.map(([key, label, kind, note]) => {
        const hot = pick && pick.kind === kind, now = skill(draft[key]) || {id:draft[key], name:draft[key]};
        return '<button type="button" class="se-job'+(hot ? ' is-hot' : '')+(draft[key] !== saved[key] ? ' is-changed' : '')+'" data-job="'+key+'"'+(hot ? '' : ' aria-disabled="true"')+' aria-label="'+esc(label)+': '+esc(now.name)+(hot && now.id !== pick.id ? '. Press to use '+esc(pick.name) : '')+'"><span class="micro">'+esc(label)+'</span><span class="se-sk"><i aria-hidden="true">'+esc(mono(now.name))+'</i>'+esc(now.name)+'</span><small>'+esc(note)+'</small></button>';
      }).join('')+'</div></section>').join('')+
      linksHtml()+(window.WWAutopilot?.settingsHtml?.() || '')+
      '</div></div>'+
      '<div class="se-save">'+chip(n, chgN, 'se-chg')+'<span class="se-when" role="status"'+(n ? '' : M.attr('se-saved', 'fade'))+'>'+(n ? 'Not saved yet' : savedAt ? 'Saved '+esc(when(savedAt)) : ref ? 'Using the defaults' : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…')+'</span><span class="se-note">Jobs already running keep their skills.</span><button type="button" class="se-btn" id="se-save"'+(n && ref ? '' : ' disabled')+M.done('skills', flash === 'skills' && !n)+'>'+M.label(flash === 'skills' && !n, 'Save skills', 'Saved')+'</button></div>';
    chgN = n;
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
  root.addEventListener('change', e => { if (lane === 'posting') postingChange(e); else if (lane === 'connections') cxChange(e); });
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
    if (lane === 'connections' && cxClick(e)) return;
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
      try { const at = new Date().toISOString(); await ref.set({slots:draft, updatedAt:at}); saved = {...draft}; savedAt = at; savedFlash('skills', 'se-save', 'Save skills'); render(); }
      catch { render(); root.querySelector('.se-when').textContent = 'Could not save. Try again.'; }
    }
  });
  // ---- Posting (Taylor, 10 November 2026; direction A "The week" from the three-direction board). ----
  // The week is drawn the way the Schedule draws it: tap a day and it becomes a posting day. Saved as settings/posting
  // through WWStore.posting (the shape and the rule live in ww-store.js); the Schedule, the Topics board and the library
  // wall redraw on ww:settings. Platforms are honest: no account is connected, and nothing here posts anything.
  const P = () => window.WWStore?.posting;
  const PLAT_NOTES = {youtube:'The full video, title and description', linkedin:'The LinkedIn cut and its post', instagram:'The reel and the 4:5 post', facebook:'Follows Instagram: the same reel and 4:5 post', x:'No X post is written yet'};
  // The note under the toggle is the one place that says Auto is not running; the hollow gold dot is the same one the toggle's Auto half carries.
  // It follows the real connection state (WWStore.connections): which accounts a check found connected, and whether the poster exists.
  const names = list => { const n = list.map(x => x[1]); return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ')+' and '+n[n.length - 1]; };
  function autoWhy(d) {
    const p = P(), on = p.PLATFORMS.filter(([k]) => p.CONNECTED[k]), used = on.filter(([k]) => d.platforms[k]);
    return !on.length ? 'No account is connected, so you still press Post on the day.'
      : !used.length ? names(on)+' '+(on.length > 1 ? 'are' : 'is')+' connected but switched off below, so you still press Post on the day.'
      : names(used)+' '+(used.length > 1 ? 'are' : 'is')+' connected, but the automatic poster is not built yet, so you still press Post on the day.';
  }
  const modeNote = d => P().autoLive(d) ? '<i class="se-dot" aria-hidden="true"></i><span><b>Auto posting.</b> Each video goes out at '+esc(d.time)+' on its posting day.</span>'
    : d.mode === 'auto' ? '<i class="se-dot is-off" aria-hidden="true"></i><span><b>Auto is chosen, but not running yet.</b> '+autoWhy(d)+'</span>' : '<span><b>Manual posting.</b> You press Post on the day. Nothing goes out by itself.</span>';
  // Each platform row carries the state of its own account and links to its card on Connections.
  const CONN_TAG = {on:'Connected', off:'Not connected', attention:'Needs attention', connecting:'Connecting', blind:'Can’t check', unknown:'Not checked'};
  const connTag = k => { const s = C()?.get(k).state || 'unknown'; return '<em class="is-'+s+'"><a href="#/settings/connections/'+k+'">'+CONN_TAG[s]+'<span class="sr"> · open the '+k+' card on Connections</span></a></em>'; };
  function honestLine() {
    const p = P(), on = p.PLATFORMS.filter(([k]) => p.CONNECTED[k]), off = p.PLATFORMS.filter(([k]) => !p.CONNECTED[k]);
    return (on.length ? 'Connected: '+names(on)+'.'+(off.length ? ' Not yet: '+names(off)+'.' : '')+' Nothing posts by itself yet: you post from Publish.' : 'No account is connected yet. Automatic posting starts once they are. Until then you post from Publish.')+' <a href="#/settings/connections">Open Connections</a>';
  }
  const saveBar = () => { const p = P(), n = pChanges(), at = p.settings.updatedAt;
    const c = chip(n, pChgN, 'po-chg'); pChgN = n;
    return c+'<span class="se-when" id="po-when" role="status"'+(n || pMsg ? '' : M.attr('se-saved', 'fade'))+'>'+esc(pMsg || (n ? 'Not saved yet' : at ? 'Saved '+when(at) : p.canSave ? 'Using the defaults: '+p.dayList(p.DEFAULTS.days) : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…'))+'</span><span class="se-note">Videos already posted keep their dates.</span><button type="button" class="se-btn" id="po-save"'+(n && p.canSave && !pBusy ? '' : ' disabled')+M.done('posting', flash === 'posting' && !n)+'>'+(pBusy ? 'Saving…' : M.label(flash === 'posting' && !n, 'Save posting settings', 'Saved'))+'</button>'; };
  // With Auto chosen and nothing connected the toggle's note already says so, so the line under Platforms steps back.
  const honestHidden = d => d.mode === 'auto' && !P().autoLive(d);
  let pDraft = null, pBase = '', pMsg = '', pBusy = false;
  const pick4 = s => ({days:s.days.slice(), gap:s.gap, time:s.time, mode:s.mode, platforms:{...s.platforms}});
  const pSaved = () => pick4(P().settings);
  // The draft starts as the saved settings; while it is untouched it follows them (a late load, another tab).
  const pReset = () => { pDraft = pSaved(); pBase = JSON.stringify(pDraft); };
  const pUntouched = () => !pDraft || JSON.stringify(pDraft) === pBase;
  const pChanges = () => { const a = pSaved(), d = pDraft; return (a.days.join() !== d.days.join()) + (a.gap !== d.gap) + (a.time !== d.time) + (a.mode !== d.mode) + Object.keys(a.platforms).filter(k => a.platforms[k] !== d.platforms[k]).length; };
  const dayFmt = isoDay => new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', timeZone:'UTC'}).format(new Date(isoDay+'T12:00:00Z')).replace(',', '');
  // What the rule on screen means for the next Monday, Wednesday and Friday recordings, bookings included.
  function previewHtml() {
    const now = new Date(), pad = v => String(v).padStart(2, '0'), today = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
    const next = wd => { const d = new Date(today+'T12:00:00Z'); while (d.getUTCDay() !== wd) d.setUTCDate(d.getUTCDate()+1); return d.toISOString().slice(0, 10); };
    const would = P().draft(pDraft, today), topics = window.WWIdeas?.data?.topics || [];
    return P().RECORD_DAYS.map(k => [P().DAY_NAMES[P().DAY_KEYS.indexOf(k)], next(P().DAY_KEYS.indexOf(k))]).sort((a, b) => a[1].localeCompare(b[1])).map(([name, rec]) => name+'’s video posts <mark>'+esc(dayFmt(P().slot(topics, would, rec)))+'</mark>').join('. ')+'.';
  }
  function renderPosting() {
    const p = P();
    if (!p) { root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · POSTING</div><h1 id="se-heading">Posting</h1><p>Posting settings could not load. Reload the page.</p>'+laneTabs()+'</div>'; return; }
    if (!pDraft) pReset();
    const d = pDraft, names = {mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday'};
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · POSTING</div><h1 id="se-heading">Posting</h1><p>Choose the days your videos go out. The Schedule follows as soon as you save.</p>'+laneTabs()+'</div>'+
      '<div class="po"><section class="po-grp"><h2 id="po-days-h">Posting days <span class="micro">Tap a day to switch it on or off</span></h2><div class="po-week" role="group" aria-labelledby="po-days-h">'+p.WEEK.map(k => { const on = d.days.includes(k), rec = p.RECORD_DAYS.includes(k);
        return '<button type="button" class="po-day" id="po-day-'+k+'" data-day="'+k+'" aria-pressed="'+on+'" aria-label="'+names[k]+', posting day'+(rec ? ', also a recording day' : '')+'"><b>'+names[k].slice(0, 3)+'</b><span class="po-tags"><span class="po-tag is-rec'+(rec ? '' : ' is-off')+'">Rec</span><span class="po-tag is-post'+(on ? '' : ' is-off')+'">Post</span></span></button>'; }).join('')+'</div>'+
      '<p class="po-preview" id="po-preview" role="status">'+previewHtml()+'</p></section>'+
      '<section class="po-two"><label class="po-field" for="po-time"><span>Posting time</span><input type="time" id="po-time" value="'+esc(d.time)+'" required><small>The time posts go out once Auto posting is on. UK time.</small></label>'+
      '<div class="po-field" role="group" aria-labelledby="po-gap-h"><span id="po-gap-h">Time to edit</span><span class="po-step"><button type="button" id="po-gap-less" data-gap="-1" aria-label="One day less"'+(d.gap <= 1 ? ' disabled' : '')+'>−</button><output id="po-gap" aria-live="polite">'+d.gap+'</output><button type="button" id="po-gap-more" data-gap="1" aria-label="One day more"'+(d.gap >= 14 ? ' disabled' : '')+'>+</button></span><small>At least '+d.gap+' day'+(d.gap > 1 ? 's' : '')+' between recording and posting</small></div></section>'+
      '<section class="po-grp"><h2 id="po-mode-h">How posts go out</h2>'+
        '<div class="pm pm-a" id="po-mode" role="radiogroup" aria-labelledby="po-mode-h" data-live="'+p.autoLive(d)+'">'+
          '<label><input type="radio" name="po-mode" id="po-mode-manual" value="manual"'+(d.mode === 'manual' ? ' checked' : '')+'><span>Manual posting</span><small>You press Post on the day.</small></label>'+
          '<label><input type="radio" name="po-mode" id="po-mode-auto" value="auto" aria-describedby="po-mode-note"'+(d.mode === 'auto' ? ' checked' : '')+'><i aria-hidden="true"></i><span>Auto posting</span><small>Each video goes out at the posting time, once accounts are connected.</small></label></div>'+
        '<p class="pm-note" id="po-mode-note" role="status">'+modeNote(d)+'</p></section>'+
      '<section class="po-grp"><h2>Platforms <span class="micro">Where each video is posted</span></h2><div class="po-plats">'+p.PLATFORMS.map(([k, name]) => '<label class="po-plat" for="po-plat-'+k+'"><input class="po-tick" type="checkbox" id="po-plat-'+k+'" data-plat="'+k+'"'+(d.platforms[k] ? ' checked' : '')+'><span class="po-box" aria-hidden="true"></span><span class="po-plat-text"><b>'+name+'</b><small>'+PLAT_NOTES[k]+'</small></span>'+connTag(k)+'</label>').join('')+'</div>'+
        '<p class="po-honest" id="po-honest"'+(honestHidden(d) ? ' hidden' : '')+'><i class="se-dot is-off" aria-hidden="true"></i><span>'+honestLine()+'</span></p></section>'+
      '<div class="se-save" id="po-savebar">'+saveBar()+'</div></div>';
  }
  const pRedraw = id => { pMsg = ''; renderPosting(); if (id) document.getElementById(id)?.focus({preventScroll:true}); };
  // A mode change leaves the toggle itself in the page, so its thumb slides; only what depends on the mode is rewritten.
  function pModeInPlace() {
    const g = document.getElementById('po-mode'), note = document.getElementById('po-mode-note'), bar = document.getElementById('po-savebar'), honest = document.getElementById('po-honest');
    if (!g || !note || !bar) return renderPosting();
    g.dataset.live = String(P().autoLive(pDraft)); note.innerHTML = modeNote(pDraft); bar.innerHTML = saveBar(); if (honest) honest.hidden = honestHidden(pDraft);
  }
  async function postingClick(e) {
    const day = e.target.closest('[data-day]');
    if (day) { const k = day.dataset.day, on = pDraft.days.includes(k); pMsg = '';
      if (on && pDraft.days.length === 1) pMsg = 'Keep at least one posting day.'; else pDraft.days = P().WEEK.filter(x => x === k ? !on : pDraft.days.includes(x));
      renderPosting(); document.getElementById(day.id)?.focus({preventScroll:true}); return; }
    const gap = e.target.closest('[data-gap]');
    if (gap) { pDraft.gap = Math.max(1, Math.min(14, pDraft.gap + Number(gap.dataset.gap))); pMsg = ''; renderPosting(); const b = document.getElementById(gap.id); (b && !b.disabled ? b : document.getElementById(gap.id === 'po-gap-less' ? 'po-gap-more' : 'po-gap-less'))?.focus({preventScroll:true}); return; }
    if (e.target.closest('#po-save') && pChanges() && P().canSave && !pBusy) {
      pBusy = true; pMsg = ''; renderPosting();
      try { await P().save(pDraft); pReset(); savedFlash('posting', 'po-save', 'Save posting settings'); } catch (err) { pMsg = err?.message || 'Could not save. Try again.'; }
      pBusy = false; renderPosting(); document.getElementById('po-save')?.blur?.();
    }
  }
  function postingChange(e) {
    const t = e.target;
    if (t.id === 'po-time') { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t.value)) pDraft.time = t.value; pRedraw('po-time'); return; }
    if (t.name === 'po-mode') { pDraft.mode = t.value === 'auto' ? 'auto' : 'manual'; pMsg = ''; pModeInPlace(); return; }
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
  let gh = {s:'checking'}, cc = {s:'checking'}, ghToken = 0, ghBusy = false, ghShown = null;
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
    ghShown = gh.s;
    return '<div class="se-gh" id="se-gh" data-state="'+gh.s+'"><i class="se-gh-dot is-'+dot+'" aria-hidden="true"'+M.attr('se-gh', 'fade')+'></i><p role="status" tabindex="-1"'+M.attr('se-gh', 'fade')+'><b>'+lead+'</b>'+(text ? ' <span>'+text+'</span>' : '')+'</p>'+a+'<a class="se-gh-link se-gh-all" href="#/settings/connections">All connections</a></div>';
  }
  // Repaint only the line, so typing elsewhere keeps its caret; focus follows the action if it had it.
  function ghPaint() {
    const el = root.querySelector('#se-gh'); if (!el) return cxPaint();   // on the Connections lane GitHub is a card
    if (gh.s !== ghShown) M.stamp('se-gh');   // the words cross-fade when the state changes; the dot with them
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
    let next, ccNext = null;
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
          else if (!srv.tools.some(x => x.name === 'list_repos')) { next = 'notool'; ccNext = srv.tools.some(x => x.name === 'create_session') ? 'on' : 'notool'; }
          else {
            ccNext = srv.tools.some(x => x.name === 'create_session') ? 'on' : 'notool';
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
    // Claude Code's own card: allowed when its connector answered with create_session, otherwise the same reason as GitHub.
    cc = {s:ccNext || (['on','off','readonly','wait'].includes(next) ? 'on' : next)};
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
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && settingsOpen()) { if (lane !== 'posting') ghCheck(false); cxCheck(false); } });
  // ---- Connections (Taylor, 10 November 2026; the reviewed "Wiring" hybrid, shipped as the plain plate list). ----
  // One card per account, each its own connection: Google Drive, YouTube, LinkedIn, Instagram, Facebook, X, then Claude Code
  // and GitHub. Sign-ins are kept by Composio on Taylor's Claude account; no password or key is ever typed into this app.
  // A card says Connected only after a real check, and only ever shows an account name the check returned.
  // Two routes to that check (CONNECTIONS.md):
  //   direct   the page asks Composio itself: COMPOSIO_MANAGE_CONNECTIONS, action "list" (and "add" for a sign-in link).
  //            No other Composio tool is ever called from the page. On open and on return to the tab, never on a timer.
  //            X is left out of the automatic list and checked only on a press.
  //   session  when the page cannot reach Composio, a Claude Code session does the same and writes connections/status,
  //            which the page reads (WWStore.connections). "Check connections" and "Connect <account>" start that session.
  const C = () => window.WWStore?.connections;
  const CX_TOOL = 'COMPOSIO_MANAGE_CONNECTIONS', CX_NAME = 'Composio';
  const CX_ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', CX_REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';   // the same as Publish (publish.js)
  const CX_DASH = 'https://dashboard.composio.dev';
  const ACCOUNTS = [
    {k:'googledrive', name:'Google Drive', does:'Where Publish reads your recordings and saves the finished files.',
      steps:['Sign in with the Google account whose Drive holds your recordings and finals.', 'Allow access, then come back to this tab.'],
      more:'A link shared as “Anyone with the link” can be read without this.'},
    {k:'youtube', name:'YouTube', does:'Where the full video will go, with its title, description and thumbnail.',
      steps:['Sign in with the Google account that owns the channel.', 'Choose the right channel or brand account, then allow.', 'Come back to this tab.'],
      more:'Custom thumbnails need a phone-verified channel. Uploading a full video this way has not been tested yet.'},
    {k:'linkedin', name:'LinkedIn', does:'Where the LinkedIn cut and its post will go: your personal profile.',
      steps:['Sign in to LinkedIn and allow posting as you.', 'Come back to this tab.'],
      more:'Company Page posting has not been checked.'},
    {k:'instagram', name:'Instagram', does:'Where your reels and 4:5 posts will go.', pre:'Needs a Business or Creator account. Personal accounts are refused.',
      steps:['Sign in, pick the Instagram account, then approve.', 'Come back to this tab.'],
      more:'If the sign-in goes through Facebook, the Instagram account has to be linked to your Facebook Page.'},
    {k:'facebook', name:'Facebook', does:'Where the same reel, 4:5 post and caption will go: your Page.', pre:'Pages only. Nothing can post to a personal profile.',
      steps:['Sign in to Facebook as yourself.', 'Tick the Page your videos go to, then approve.', 'Come back to this tab.'],
      more:'You need to be allowed to create posts on that Page. Reels on a Page have not been tested yet.'},
    {k:'x', name:'X', does:'Where the X post or thread will go.', pre:'Needs your own X developer app with credits. X charges for each post.', gated:true,
      outside:[['Make a developer account and an app in X’s developer portal.', 'Open X developer portal', 'https://developer.x.com/en/portal/dashboard'],
        ['Add credits to it. X charges for each post: about $0.015, or $0.20 when the post has a link.', 'Open X products and credits', 'https://developer.x.com/en/portal/products'],
        ['In Composio’s dashboard, add X with your app’s client ID and secret. If Composio shows a callback address, paste it into your X app and give the app Read and write.', 'Open Composio dashboard', CX_DASH]],
      steps:['Press Connect X, then sign in to X and allow your app.', 'Come back to this tab.'],
      more:'X is checked only when you press, never by itself, because X charges for lookups.'}];
  const acct = k => ACCOUNTS.find(a => a.k === k);
  // Hub line: [dot, what it means, [action, label, primary]]. The lead sentence is always the same.
  const HUB = {
    checking:['wait', 'Checking with Composio…', null],
    on:['on', 'Reachable. The app checks each account itself.', ['hub-check', 'Check now', false]],
    ask:['off', 'Not checked yet. Checking asks you once to allow Composio for this app.', ['hub-check', 'Check connections', true]],
    perm:['err', 'Composio is switched off for this app, so the app can’t check.', ['hub-allow', 'Allow', true]],
    permMenu:['err', 'Turn Composio on in this app’s Permissions menu, then check again.', ['hub-check', 'Check again', false]],
    reauth:['err', 'Composio needs reconnecting in claude.ai Settings, Connectors.', ['hub-check', 'Check again', false]],
    noserver:['err', 'Composio is not answering on your Claude account. Add or choose it in claude.ai Settings, Connectors.', ['hub-check', 'Check again', false]],
    none:['off', 'This app can’t reach Composio by itself, so Claude Code checks for it.', null],
    notool:['off', 'Your Composio connection doesn’t offer the connection check in this view, so Claude Code checks for it.', null],
    down:['err', 'Composio didn’t answer. Nothing has changed.', ['hub-check', 'Check again', false]],
    bad:['err', 'Composio answered in a way the app can’t read, so Claude Code checks for it.', ['hub-check', 'Check again', false]],
    preview:['off', 'Can’t check in this preview. The app checks when it is opened in Claude.', null]};
  let hub = {s:'checking'}, cxServer = CX_NAME, cxToken = 0, cxBusy = false, cxLoud = false, cxKeys = [], cxNext = null, cxOpen = null, cxShown = {};
  let pend = {};      // per account, while connecting: {stage:'adding'|'link'|'wait'|'session'|'err', url, at, msg, via}
  let sess = null;    // the Claude Code session asked to check: {line, at, s:'starting'|'run'|'err', url, why}
  let xReady = false; try { xReady = localStorage.getItem('ww-x-ready') === '1'; } catch { /* the tick is simply asked again */ }
  const direct = () => hub.s === 'on';
  const cxFromError = c => c === 'needs_reauth' ? 'reauth' : ['server_not_connected','selection_required','server_not_found'].includes(c) ? 'noserver'
    : permCodes.includes(c) ? 'perm' : ['blocked_by_policy','capability_disabled','capability_removed'].includes(c) ? 'notool' : 'down';
  // The account name, only from what the check returned. Nothing is made up when it is missing.
  function nameFrom(info) {
    const seen = {}; (function walk(o, depth) { if (!o || typeof o !== 'object' || depth > 3) return;
      for (const [key, v] of Object.entries(o)) { if (typeof v === 'string') { const kk = key.toLowerCase().replace(/_/g, ''); if (v.trim() && !/^https?:/i.test(v) && seen[kk] === undefined) seen[kk] = v.trim(); } else walk(v, depth + 1); } })(info, 0);
    const name = seen.displayname || seen.name || seen.title || seen.username || seen.screenname || seen.handle || seen.localizedfirstname || seen.givenname || '', mail = seen.emailaddress || seen.email || '';
    return (name && mail && name !== mail ? name+' · '+mail : name || mail).slice(0, 120) || null;
  }
  // Composio's "list" answer for one toolkit → what the card may say.
  function fromList(entry, at) {
    if (!entry || typeof entry !== 'object' || !Array.isArray(entry.accounts)) return {state:'blind', error:'Composio did not answer for this account.', checkedAt:at};
    const st = a => String(a?.status || '').toLowerCase(), live = entry.accounts.filter(a => st(a) === 'active');
    if (live.length) { const a = live.find(x => x.is_default) || live[0]; return {state:'on', account:nameFrom(a.user_info), checkedAt:at, extra:live.length - 1}; }
    const bad = entry.accounts.find(a => /expired|failed|inactive|error|revoked|disabled/.test(st(a)));
    return bad ? {state:'attention', error:'Composio says this sign-in has '+st(bad)+'. Reconnect it.', checkedAt:at} : {state:'off', checkedAt:at};
  }
  const results = p => { const r = p?.data?.results ?? p?.results; return r && typeof r === 'object' && !Array.isArray(r) ? r : null; };
  // manual: a press. Without it a viewer who has not been asked about Composio is not asked. keys: which accounts to list
  // (default: every account except X; X joins on its own press and while its sign-in is being waited for).
  async function cxCheck(manual, keys) {
    const cx = C(); if (!cx) return;
    if (cxBusy) { if (manual) cxNext = [manual, keys]; return; }   // a press during a check is run straight after it
    const t = ++cxToken, was = hub.s; cxBusy = true;
    const list = (keys || cx.KEYS.filter(k => k !== 'x' || pend.x?.stage === 'wait'));
    cxKeys = list; cxLoud = manual || was !== 'on';
    if (cxLoud) cxPaint();
    let next, got = null; const at = new Date().toISOString();
    try {
      const mcp = await window.claude?.use?.('mcp');
      if (!mcp) next = 'preview';
      else {
        const lt = await mcp.listTools(), all = (lt?.servers || []).filter(x => x.kind !== 'artifact');
        // The connector is found by the tool it offers; its usual name is only the fallback.
        const srv = all.find(x => (x.tools || []).some(tl => tl.name === CX_TOOL)) || all.find(x => x.server === CX_NAME);
        if (!srv) next = 'none';
        else if (srv.authStatus === 'needs_reauth') next = 'reauth';
        else if (!(srv.tools || []).length) next = 'noserver';
        else if (!srv.tools.some(tl => tl.name === CX_TOOL)) next = 'notool';
        else {
          cxServer = srv.server;
          const perms = await Promise.resolve(window.claude.use('permissions')).catch(() => null);
          const ps = perms?.state ? await perms.state('mcp:'+cxServer).catch(() => 'unavailable') : null;
          if (ps === 'denied') next = 'perm';
          else if (ps === 'prompt' && !manual) next = 'ask';
          else {
            const r = await mcp.callTool(cxServer, CX_TOOL, {toolkits:list.map(k => ({name:cx.TOOLKITS[k], action:'list'}))}, {cache:false});
            got = results(r?.payload);
            next = got ? 'on' : 'bad';
          }
        }
      }
    } catch (e) { next = cxFromError(e?.code); }
    if (t !== cxToken) return;
    cxBusy = false;
    if (next === 'on') {
      for (const k of list) {
        const v = fromList(got[cx.TOOLKITS[k]], at), p = pend[k];
        // Back from the sign-in tab before Composio has it: keep waiting. A press of Check now gets the plain answer.
        if (p?.stage === 'wait' && v.state !== 'on' && !manual) continue;
        if (p && (v.state === 'on' || p.stage === 'wait')) delete pend[k];
        cx.set(k, v);
      }
    } else if (next !== 'down') cx.clearDirect();   // a refusal: nothing it said before may still read as Connected
    hub = {s:next, at};
    if (next !== 'on') await cx.reload();           // the session's document is what the cards fall back to
    reconcile(); cxPaint(); cx.changed();
    if (cxNext) { const n = cxNext; cxNext = null; cxCheck(n[0], n[1]); }
  }
  async function cxAllow() {
    const perms = await Promise.resolve(window.claude?.use?.('permissions')).catch(() => null);
    try { if (!perms?.manage) throw 0; await perms.manage(); cxCheck(true); }
    catch { hub = {s:'permMenu'}; cxPaint(); }
  }
  // The sign-in link, from Composio's "add" answer for that toolkit. Only an https link is ever put on the button.
  function linkFrom(payload, tk) {
    const e = results(payload)?.[tk]; let url = null;
    (function walk(o, depth) { if (url || !o || typeof o !== 'object' || depth > 3) return;
      for (const [key, v] of Object.entries(o)) { if (url) return; if (typeof v === 'string') { if (/redirect|auth|link|url/i.test(key) && /^https:\/\//.test(v)) { try { url = new URL(v).href; } catch { /* not a link */ } } } else walk(v, depth + 1); } })(e, 0);
    const said = [e?.error, e?.message, e?.instruction, payload?.error].find(v => typeof v === 'string' && v.trim());
    return {url, said:said ? String(said).trim().slice(0, 240) : ''};
  }
  // Connect and Reconnect are the same press: fetch a fresh sign-in link and put it on the button in the same place.
  async function cxConnect(k) {
    const a = acct(k), cx = C(); if (!a || !cx || ['adding','session'].includes(pend[k]?.stage)) return;
    const at = new Date().toISOString();
    if (!direct()) {
      pend[k] = {stage:'session', at}; cxPaint(k);
      const ok = await startCheck('Connect '+a.name, 'Connections: connect '+a.name, k);
      if (!ok) { pend[k] = {stage:'err', msg:(sess?.why || 'Claude Code could not be started.')+' Nothing has started. Try again, or send “Connect '+a.name+'” in a Claude chat.'}; sess = null; }
      cxPaint(k); return;
    }
    pend[k] = {stage:'adding', at}; cxPaint(k);
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const r = await mcp.callTool(cxServer, CX_TOOL, {toolkits:[{name:cx.TOOLKITS[k], action:'add'}]}, {cache:false});
      const {url, said} = linkFrom(r?.payload, cx.TOOLKITS[k]);
      pend[k] = url ? {stage:'link', url, at} : {stage:'err', msg:'Composio did not give a sign-in link.'+(said ? ' It said: “'+said+'”' : '')+(k === 'x' ? ' Check the three set-up steps, then try again.' : ' Try again.')};
    } catch (e) {
      const s = cxFromError(e?.code);
      pend[k] = {stage:'err', msg:e?.code === 'tool_error' ? 'Composio refused: “'+String(e.message || 'no reason given').slice(0, 240)+'”'+(k === 'x' ? ' Check the three set-up steps, then try again.' : '') : s === 'down' ? 'Composio didn’t answer. No sign-in was started. Try again.' : 'The app can’t reach Composio now. No sign-in was started.'};
      if (s !== 'down' && e?.code !== 'tool_error') { cx.clearDirect(); hub = {s, at}; await cx.reload(); }
    }
    cxPaint(k);
  }
  // The fallback: a Claude Code session does the check (or fetches the sign-in link) and writes connections/status.
  async function startCheck(line, title, key) {
    const at = new Date().toISOString(); sess = {line, at, s:'starting', key:key || null}; cxPaint();
    try {
      const mcp = await window.claude?.use?.('mcp'); if (!mcp) throw {code:'unavailable'};
      const r = await mcp.callTool(CCR, 'create_session', {model:'claude-opus-5-5', environment_id:CX_ENV, source_url:CX_REPO, title, prompt:line+'. Follow CONNECTIONS.md in this repository exactly: use only COMPOSIO_MANAGE_CONNECTIONS (and COMPOSIO_WAIT_FOR_CONNECTIONS where it says), write the result to connections/status in the Whiteboard Wednesdays app artifact, never post anything, and never print or store a password, key or token.'});
      const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
      sess = {line, at, s:'run', key:key || null, url:sid ? 'https://claude.ai/code/'+sid : null}; cxPaint(); return true;
    } catch (e) {
      sess = {line, at, s:'err', key:key || null, why:e?.code === 'not_granted' || permCodes.includes(e?.code) ? 'You did not allow the Claude Code connection, so it could not start by itself.' : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || 'error')+').'};
      cxPaint(); return false;
    }
  }
  // What the session wrote, against what this page is waiting for.
  function reconcile() {
    const cx = C(); if (!cx) return; const doc = cx.doc;
    if (sess?.s === 'run' && doc?.updatedAt && doc.updatedAt >= sess.at) sess = null;
    // The session writes the sign-in link first (state connecting), then the answer. The card shows the link from the
    // document itself, so the page's own note is dropped as soon as the document has caught up with the press.
    for (const k of Object.keys(pend)) { const p = pend[k], d = doc?.platforms[k];
      if (!d || !(d.checkedAt >= p.at)) continue;
      if (p.stage === 'session' || (p.via === 'session' && d.state !== 'connecting')) delete pend[k]; }
  }
  // What one card shows now: its state, the words, and its one main action.
  function cardView(a) {
    const k = a.k, c = C().get(k), p = pend[k], nm = esc(a.name), fall = !direct();
    const checked = c.checkedAt ? 'Checked '+esc(when(c.checkedAt))+(c.via === 'session' ? ' by Claude Code' : '') : '';
    const btn = (act, label, solid) => '<button type="button" class="se-gh-btn'+(solid ? '' : ' is-ghost')+'" id="cx-act-'+k+'" data-cx="'+act+'" data-k="'+k+'">'+label+'</button>';
    if (p?.stage === 'adding' || p?.stage === 'session') return {s:'connecting', dot:'wait', label:'Connecting', sub:p.stage === 'adding' ? 'Getting the sign-in link from Composio…' : 'Claude Code is fetching the sign-in link. It appears here in about a minute.', act:''};
    if (p?.stage === 'link') return {s:'connecting', dot:'wait', label:'Connecting', sub:'The sign-in link is ready. It opens in a new tab.', act:'<a class="se-gh-btn" id="cx-act-'+k+'" href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer" data-cx="link" data-k="'+k+'">Open '+nm+' sign-in'+ext+'<span class="sr">(opens in a new tab)</span></a>'};
    if (p?.stage === 'wait') return {s:'connecting', dot:'wait', label:'Connecting', sub:p.via === 'session' ? 'Finish in the sign-in tab. Claude Code is waiting and confirms it here.' : 'Finish in the sign-in tab, then come back. The app checks by itself.', act:p.via === 'session' ? '' : btn('check', 'Check now', false)};
    const err = p?.stage === 'err' ? p.msg : c.error || '';
    if (cxBusy && cxLoud && cxKeys.includes(k) && (c.state === 'unknown' || cxKeys.length === 1)) return {s:'checking', dot:'wait', label:'Checking…', sub:'', act:''};
    const linkLive = c.link && Date.now() - Date.parse(c.link.createdAt || c.checkedAt || 0) < 18e5;   // a sign-in link is offered for 30 minutes
    if (c.state === 'on') return {s:'on', dot:'on', label:c.account ? 'Connected as '+esc(c.account) : 'Connected', sub:[c.account ? '' : 'The check did not return the account name.', checked].filter(Boolean).join(' '), err, act:btn('connect', 'Reconnect '+nm, false)};
    if (c.state === 'attention') return {s:'attention', dot:'err', label:'Needs attention', sub:checked, err, act:btn('connect', 'Reconnect '+nm, true)};
    if (c.state === 'connecting' && linkLive) return {s:'connecting', dot:'wait', label:'Connecting', sub:'The sign-in link is ready. It opens in a new tab.', act:'<a class="se-gh-btn" id="cx-act-'+k+'" href="'+esc(c.link.url)+'" target="_blank" rel="noopener noreferrer" data-cx="link" data-k="'+k+'">Open '+nm+' sign-in'+ext+'<span class="sr">(opens in a new tab)</span></a>'};
    if (c.state === 'off' || c.state === 'connecting') return {s:'off', dot:'off', label:'Not connected', sub:checked, err, act:a.gated && !xReady ? btn('setup', 'Set up '+nm, true) : btn('connect', 'Connect '+nm, true)};
    if (c.state === 'blind' || (fall && hub.s !== 'checking')) return {s:'blind', dot:'blind', label:'Can’t check from here', sub:checked, err, act:hub.s === 'ask' ? btn('hub-check', 'Check connections', false) : direct() ? btn('check', 'Check '+nm, false) : hub.s === 'preview' || !C().canReadDoc ? '' : btn('session', k === 'x' ? 'Check X' : 'Check connections', false)};
    return {s:'unknown', dot:'blind', label:'Not checked yet', sub:k === 'x' ? 'X is checked only when you press.' : '', err, act:direct() ? btn('check', 'Check '+nm, true) : ''};
  }
  function cardHtml(a) {
    const v = cardView(a), k = a.k, open = cxOpen === k;
    if (cxShown[k] !== undefined && cxShown[k] !== v.s+'|'+v.label) M.stamp('cx-'+k);   // the words cross-fade only when the state really changed
    cxShown[k] = v.s+'|'+v.label;
    let body = '';
    if (open) {
      const ol = a.outside ? '<ol class="cx-steps">'+a.outside.map(([text, label, href]) => '<li><span>'+esc(text)+'</span><a class="se-gh-btn is-ghost" href="'+href+'" target="_blank" rel="noopener noreferrer">'+esc(label)+ext+'<span class="sr">(opens in a new tab)</span></a></li>').join('')+'</ol>'+
        '<p class="cx-secret">Never type the client ID or secret into this app or a chat. They go into Composio’s dashboard only.</p>'+
        '<label class="cx-tick" for="cx-x-ready"><input class="po-tick" type="checkbox" id="cx-x-ready"'+(xReady ? ' checked' : '')+'><span class="po-box" aria-hidden="true"></span><span><b>I’ve done these three</b><small>Your own tick. The app can’t check them.</small></span></label>'+
        '<ol class="cx-steps" start="4">'+a.steps.map(s => '<li><span>'+esc(s)+'</span></li>').join('')+'</ol>'+
        (v.s === 'off' || v.s === 'unknown' ? '<button type="button" class="se-gh-btn'+(xReady ? '' : ' is-ghost')+'" id="cx-act2-'+k+'" data-cx="connect" data-k="'+k+'">Connect '+esc(a.name)+'</button>' : '')
        : '<ol class="cx-steps">'+['Press '+(v.s === 'on' || v.s === 'attention' ? 'Reconnect' : 'Connect')+' '+a.name+', then the sign-in button that takes its place. It opens in a new tab.', ...a.steps].map(s => '<li><span>'+esc(s)+'</span></li>').join('')+'</ol>';
      const cc = C().get(k);
      body = '<div class="cx-body" id="cx-body-'+k+'">'+(a.pre ? '<p class="cx-pre">'+esc(a.pre)+'</p>' : '')+ol+
        (direct() && !['connecting','checking','unknown'].includes(v.s) ? '<p class="cx-row"><button type="button" class="se-gh-btn is-ghost" data-cx="check" data-k="'+k+'" id="cx-chk-'+k+'">Check '+esc(a.name)+' now</button></p>' : '')+
        (cc.extra > 0 ? '<p class="cx-more">Composio holds '+(cc.extra + 1)+' sign-ins for '+esc(a.name)+'. The default one is shown. Remove the others in Composio’s dashboard.</p>' : '')+
        '<p class="cx-more">'+esc(a.more)+' To disconnect, remove the sign-in in <a href="'+CX_DASH+'" target="_blank" rel="noopener noreferrer">Composio’s dashboard'+ext+'</a>.</p></div>';
    }
    return '<li class="cx-card'+(open ? ' is-open' : '')+'" id="cx-'+k+'" data-state="'+v.s+'"><div class="cx-plate"><i class="se-gh-dot is-'+v.dot+'" aria-hidden="true"'+M.attr('cx-'+k, 'fade')+'></i>'+
      '<div class="cx-id"><h3>'+esc(a.name)+'</h3><p>'+esc(a.does)+'</p></div>'+
      '<div class="cx-st" id="cx-st-'+k+'" role="status" tabindex="-1"'+M.attr('cx-'+k, 'fade')+'><b>'+v.label+'</b>'+(v.sub ? '<small>'+v.sub+'</small>' : '')+(v.err ? '<small class="cx-err">'+esc(v.err)+'</small>' : '')+'</div>'+
      '<div class="cx-acts">'+v.act+'<button type="button" class="cx-open" id="cx-open-'+k+'" data-cx="open" data-k="'+k+'" aria-expanded="'+open+'"'+(open ? ' aria-controls="cx-body-'+k+'"' : '')+'>'+(open ? 'Close' : a.gated ? 'Steps' : 'Details')+'<span class="sr"> '+esc(a.name)+'</span></button></div></div>'+body+'</li>';
  }
  // Claude Code and GitHub, folded in from the Skills lane. Their check is the GitHub one (ghCheck), unchanged.
  const CC = {
    checking:['wait', 'Checking…', '', null], on:['on', 'Allowed for this app', 'Publish and this screen can start Claude Code.', null],
    ask:['off', 'Not allowed yet', 'Claude asks you once. Allowing it also checks GitHub.', ['check', 'Allow and check', true]],
    perm:['err', 'Switched off for this app', 'Allow Claude Code Remote so jobs can start.', ['allow', 'Allow', true]],
    permMenu:['err', 'Switched off for this app', 'Turn Claude Code Remote on in this app’s Permissions menu, then check again.', ['check', 'Check again', false]],
    reauth:['err', 'Needs attention', 'Reconnect Claude Code Remote in claude.ai Settings, Connectors.', ['check', 'Check again', false]],
    noserver:['err', 'Not connected', 'Add Claude Code Remote in claude.ai Settings, Connectors.', ['check', 'Check again', false]],
    down:['err', 'Can’t check right now', 'Claude Code Remote didn’t answer. Nothing has changed.', ['check', 'Check again', false]],
    notool:['off', 'Can’t check from here', 'Your Claude Code Remote connection can’t start sessions in this view.', null],
    preview:['off', 'Can’t check in this preview', 'The app checks it when it is opened in Claude.', null]};
  const GH_LABEL = {checking:'Checking…', on:'Connected', off:'Not connected', wait:'Connecting', readonly:'Needs attention', ask:'Not checked yet', perm:'Can’t check from here', permMenu:'Can’t check from here', reauth:'Can’t check from here', noserver:'Can’t check from here', down:'Can’t check right now', notool:'Can’t check from here', preview:'Can’t check in this preview'};
    function sysHtml(k, name, does, dot, label, text, act) {
    const key = 'cx-'+k; if (cxShown[k] !== undefined && cxShown[k] !== label) M.stamp(key); cxShown[k] = label;
    return '<li class="cx-card" id="cx-'+k+'" data-state="'+(k === 'github' ? gh.s : cc.s)+'"><div class="cx-plate"><i class="se-gh-dot is-'+dot+'" aria-hidden="true"'+M.attr(key, 'fade')+'></i><div class="cx-id"><h3>'+name+'</h3><p>'+does+'</p></div>'+
      '<div class="cx-st" id="cx-st-'+k+'" role="status" tabindex="-1"'+M.attr(key, 'fade')+'><b>'+label+'</b>'+(text ? '<small>'+text+'</small>' : '')+'</div><div class="cx-acts">'+act+'</div></div></li>';
  }
  function hubHtml() {
    const hs = cxBusy && cxLoud ? 'checking' : hub.s, [dot, text, act] = HUB[hs] || HUB.down, cx = C(), doc = cx.doc, canSession = cx.canReadDoc && !['on','checking','ask','preview'].includes(hs);
    if (cxShown.hub !== undefined && cxShown.hub !== hs) M.stamp('cx-hub'); cxShown.hub = hs;
    const solidSession = canSession && !(act && act[2]);
    const a = (act ? '<button type="button" class="se-gh-btn'+(act[2] ? '' : ' is-ghost')+'" id="cx-hub-act" data-cx="'+act[0]+'"'+(cxBusy ? ' disabled' : '')+'>'+act[1]+'</button>' : '')+
      (canSession ? '<button type="button" class="se-gh-btn'+(solidSession ? '' : ' is-ghost')+'" id="cx-hub-sess" data-cx="session"'+(sess?.s === 'starting' ? ' disabled' : '')+'>Check with Claude Code</button>' : '');
    const s = !sess ? (canSession && doc?.updatedAt ? 'Last checked by Claude Code '+esc(when(doc.updatedAt))+'.' : '')
      : sess.s === 'starting' ? 'Starting Claude Code…'
      : sess.s === 'run' ? 'Claude Code is on it (“'+esc(sess.line)+'”, started '+esc(when(sess.at))+'). This page updates when it reports back.'+(sess.url ? ' <a href="'+esc(sess.url)+'" target="_blank" rel="noopener noreferrer">Open the session'+ext+'</a>' : '')
      : esc(sess.why)+' Nothing has started. Try again, or send “'+esc(sess.line)+'” in a Claude chat.';
    return '<div class="cx-hub" id="cx-hub" data-state="'+hs+'"><i class="se-gh-dot is-'+dot+'" aria-hidden="true"'+M.attr('cx-hub', 'fade')+'></i><p id="cx-hub-st" role="status" tabindex="-1"'+M.attr('cx-hub', 'fade')+'><b>Sign-ins are kept by Composio on your Claude account.</b> <span>'+text+(hs === 'on' && hub.at ? ' Checked '+esc(when(hub.at))+'.' : '')+'</span></p><div class="cx-hub-acts">'+a+'</div>'+
      (s ? '<p class="cx-sess" id="cx-sess" role="status">'+s+'</p>' : '')+'</div>';
  }
  // Honest count: what is connected, what is not, and what nobody could check.
  function sumHtml(views) {
    const n = s => views.filter(v => v === s).length, on = n('on'), off = n('off'), att = n('attention'), wait = n('connecting'), chk = n('checking'), blind = views.length - on - off - att - wait - chk;
    return [on+' of '+views.length+' connected', off ? off+' not connected' : '', att ? att+' need'+(att > 1 ? '' : 's')+' attention' : '', wait ? wait+' connecting' : '', chk ? chk+' being checked' : '', blind ? blind+' not checked' : ''].filter(Boolean).join(' · ');
  }
  function cxInner() {
    const cards = ACCOUNTS.map(cardHtml), g = GH[gh.s] || GH.down, c = CC[cc.s] || CC.down;
    const actFor = (act, id) => !act ? '' : act[0] === 'link' ? '<a class="se-gh-btn is-ghost" id="'+id+'" href="'+GH_LINK+'"'+newTab.replace('connect', 'manage')+'>'+act[1]+ext+'<span class="sr">(opens claude.ai in a new tab)</span></a>'
      : act[0] === 'btn' ? '<a class="se-gh-btn" id="'+id+'" href="'+GH_LINK+'"'+newTab+'>'+act[1]+ext+'<span class="sr">(opens claude.ai in a new tab)</span></a>'
      : '<button type="button" class="se-gh-btn'+(act[2] ? '' : ' is-ghost')+'" id="'+id+'" data-gh="'+act[0]+'"'+(ghBusy ? ' disabled' : '')+'>'+act[1]+'</button>';
    const sys = sysHtml('claudecode', 'Claude Code', 'Runs each Publish job: the edit, the thumbnails, the posts and the reels.', c[0], c[1], c[2], actFor(c[3], 'cx-act-claudecode'))+
      sysHtml('github', 'GitHub', 'Lets Claude Code open your repo for each job.', g[0], GH_LABEL[gh.s] || GH_LABEL.down, g[2] || (gh.s === 'on' ? '' : g[1]), actFor(g[3] && (gh.s === 'ask' && cc.s === 'ask' ? null : g[3]), 'se-gh-act'));
    const views = [...ACCOUNTS.map(a => cardView(a).s), cc.s === 'on' ? 'on' : cc.s === 'checking' ? 'checking' : 'blind', gh.s === 'on' ? 'on' : gh.s === 'off' ? 'off' : gh.s === 'readonly' ? 'attention' : gh.s === 'wait' ? 'connecting' : gh.s === 'checking' ? 'checking' : 'blind'];
    return hubHtml()+'<p class="cx-sum" id="cx-sum">'+sumHtml(views)+'</p>'+
      '<section class="cx-grp" aria-labelledby="cx-h-acc"><h2 id="cx-h-acc">Accounts <span class="micro">Each one is its own sign-in</span></h2><ul class="cx-list">'+cards.join('')+'</ul></section>'+
      '<section class="cx-grp" aria-labelledby="cx-h-sys"><h2 id="cx-h-sys">Claude <span class="micro">What runs the jobs</span></h2><ul class="cx-list">'+sys+'</ul></section>'+
      '<p class="cx-foot">Nothing is posted from this screen. Connecting an account only lets the app use it once posting is switched on. No password or key is ever typed into this app.</p>';
  }
  function renderConnections() {
    if (!C()) { root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · CONNECTIONS</div><h1 id="se-heading">Connections</h1><p>Connections could not load. Reload the page.</p>'+laneTabs()+'</div>'; return; }
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · CONNECTIONS</div><h1 id="se-heading">Connections</h1><p>One card per account. Each is connected, checked and reconnected by itself. A card says Connected only after a real check.</p>'+laneTabs()+'</div><div class="cx" id="cx">'+cxInner()+'</div>';
  }
  // Repaint the cards only; focus stays on the same control, or moves to the card's action or status when that control has gone.
  function cxPaint(focusKey) {
    if (lane !== 'connections' || root.hidden) return;
    const box = root.querySelector('#cx'); if (!box) return renderConnections();
    const el = document.activeElement, had = box.contains(el) ? el : null, id = had?.id, card = had?.closest('.cx-card')?.id.slice(3);
    box.innerHTML = cxInner();
    const k = focusKey || card;
    if (focusKey || had) ((!focusKey && id && document.getElementById(id)) || (k && (document.getElementById('cx-act-'+k) || document.getElementById('cx-st-'+k))) || document.getElementById('cx-hub-act') || document.getElementById('cx-hub-st'))?.focus?.({preventScroll:true});
  }
  function cxClick(e) {
    const el = e.target.closest('[data-cx]'); if (!el) return false;
    const act = el.dataset.cx, k = el.dataset.k;
    if (act === 'open') { cxOpen = cxOpen === k ? null : k; history.replaceState(null, '', '#/settings/connections'+(cxOpen ? '/'+cxOpen : '')); cxPaint(); document.getElementById('cx-open-'+k)?.focus({preventScroll:true}); }
    else if (act === 'setup') { cxOpen = k; history.replaceState(null, '', '#/settings/connections/'+k); cxPaint(); document.querySelector('#cx-body-'+k+' a')?.focus(); }
    else if (act === 'connect') cxConnect(k);
    // The link itself opens the sign-in; the card only notes that it was pressed, after the browser has followed it.
    else if (act === 'link') setTimeout(() => { const p = pend[k], d = C().get(k); pend[k] = {stage:'wait', at:p?.at || new Date().toISOString(), via:p?.via || (d.via === 'session' ? 'session' : undefined)}; cxPaint(k); });
    else if (act === 'check') { if (pend[k]?.stage === 'err') delete pend[k]; cxCheck(true, k ? [k] : undefined); }
    else if (act === 'session') startCheck(k === 'x' ? 'Check connections with X' : 'Check connections', 'Connections: check');
    else if (act === 'hub-check') cxCheck(true);
    else if (act === 'hub-allow') cxAllow();
    return true;
  }
  function cxChange(e) {
    if (e.target.id !== 'cx-x-ready') return;
    xReady = e.target.checked; try { localStorage.setItem('ww-x-ready', xReady ? '1' : '0'); } catch { /* kept for this visit only */ }
    cxPaint(); document.getElementById('cx-x-ready')?.focus({preventScroll:true});
  }
  window.addEventListener('ww:connections', () => { reconcile(); if (root.hidden) return; if (lane === 'connections') cxPaint(); else if (lane === 'posting' && P() && pDraft) { const id = root.contains(document.activeElement) ? document.activeElement.id : ''; renderPosting(); if (id) document.getElementById(id)?.focus({preventScroll:true}); } });
  // links.booking is null until a valid https link is saved; Publish copies it into the job with Approve both.
  // posting: the saved Posting settings (settings/posting). postingMode is what Taylor chose ('manual' | 'auto');
  // postingLive is what actually happens today: 'manual' until an account is connected, whatever was chosen.
  window.WWSettings = {get skills() { return {...saved}; }, get links() { return {...links}; }, bookingProblem, name: id => skill(id)?.name || id,
    get posting() { return P()?.settings || null; }, get postingMode() { return P()?.mode || 'manual'; }, get postingLive() { return P()?.effectiveMode || 'manual'; },
    // One real check of the accounts, for any screen that needs the answer now (never call it on a timer).
    checkConnections: () => cxCheck(false)};
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'settings') { const was = lane; lane = e.detail[1] === 'posting' ? 'posting' : e.detail[1] === 'connections' ? 'connections' : 'skills'; if (was !== lane && !M.arriving(root)) { M.stamp('se-lane'); M.enter(root, 'lane'); } if (lane === 'posting' && P() && pUntouched()) pReset();
    if (lane === 'connections') { cxOpen = acct(e.detail[2]) ? e.detail[2] : null; cxShown = {}; }
    render(); if (lane !== 'posting') ghCheck(false); cxCheck(false);
    if (lane === 'connections' && cxOpen) document.getElementById('cx-'+cxOpen)?.scrollIntoView({block:'nearest'}); } });
  load();
})();
