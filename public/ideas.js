/* Ideas Board (#/ideas, 21 November 2026): every video idea not yet recorded, one trading card each (Taylor's pick,
   board 07 "Idea Cards" on the Video Ideas Board canvas). Cards live in the artifact database as ideas/<id> through
   WWStore.board (ww-store.js). "+ Draw a card" adds one; "Send to Topics" books it the way CLAUDE.md's booking rule says
   (first free Monday, Wednesday or Friday, or the matching topic instead of a second one) and the card stays on the board.
   Routes: #/ideas, #/ideas/new (the drawn card open), #/ideas/tag/<tag> (one tag). */
(() => {
  'use strict';
  const root = document.getElementById('ideas-board');
  if (!root) return;
  const M = window.WWMotion;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const store = () => window.WWStore?.board;
  const pad = n => String(n).padStart(3, '0');
  const KINDS = ['sky', 'pink', 'mint', 'sun'];
  const DONE = ['recorded', 'edited', 'posted'];
  const fmt = (iso, o) => { const d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : new Intl.DateTimeFormat('en-GB', o).format(d); };
  const stampDay = iso => fmt(iso, {day:'numeric', month:'short', year:'numeric'}).toUpperCase();
  const recDay = iso => fmt(iso, {weekday:'short', day:'numeric', month:'short'});
  const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let view = {tag:null, drawing:false}, busy = new Set(), status = '', statusLink = '', draft = {title:'', altTitle:'', pitch:'', tags:''}, connecting = false, keep = null;

  const today = () => window.WWStore?.posting?.today?.() || new Date().toISOString().slice(0, 10);
  const daysSince = iso => { const a = new Date(iso + 'T12:00:00'), b = new Date(today() + 'T12:00:00'); return isNaN(a) ? 99 : Math.round((b - a) / 864e5); };
  // A card's state comes from its topic: booked (a recording day), on the Topics shortlist, recorded, or still only an idea.
  function stateOf(card) {
    const t = store()?.topicOf(card);
    if (t && DONE.includes(t.status)) return {kind:'done', chip:'RECORDED', line:'Recorded' + (t.recordDate ? ' ' + recDay(t.recordDate) : '') + '.', topic:t};
    if (t && t.recordDate && t.recordDate < today()) return {kind:'booked', chip:'BOOKED', line:'Was booked for ' + recDay(t.recordDate) + '; not marked recorded yet.', topic:t};
    if (t && t.recordDate) return {kind:'booked', chip:'BOOKED', line:'Records ' + recDay(t.recordDate) + '.', topic:t};
    if (t) return {kind:'listed', chip:'IN TOPICS', line:'On the Topics shortlist, no recording day yet.', topic:t};
    return {kind:'idea', chip:daysSince(card.addedAt) <= 14 ? 'NEW' : 'IDEA', line:'', topic:null};
  }
  const order = {idea:0, listed:1, booked:2, done:3};
  function cards() {
    const all = store()?.cards || [];
    return all.map(c => ({c, s:stateOf(c)})).sort((a, b) => (a.s.kind === 'done') - (b.s.kind === 'done') || a.c.no - b.c.no);
  }
  function tagCounts(list) {
    const m = new Map();
    for (const {c} of list) for (const t of c.tags) { const k = slug(t); if (!m.has(k)) m.set(k, {label:t, n:0}); m.get(k).n++; }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label));
  }

  function head(count) {
    return '<div class="ib-head"><div><p class="ib-eyebrow">COLLECT THEM ALL</p><h1 id="ib-heading">Ideas Board</h1>'
      + '<p class="ib-lede">Every video idea not yet recorded, one card each. Draw a card to add one; send it to Topics to book its recording day. Cards stay on the board.</p></div>'
      + '<p class="ib-count">' + count + ' card' + (count === 1 ? '' : 's') + ' in the deck</p></div>';
  }
  function filters(list) {
    // The tags two or more cards share, at most 8, plus the one being shown; one-off tags stay on their card.
    const tags = tagCounts(list).filter(([k, t], i) => k === view.tag || (t.n > 1 && i < 8));
    if (!tags.length) return '';
    const link = (href, label, n, on) => '<a class="ib-tag" href="' + href + '"' + (on ? ' aria-current="true"' : '') + '>' + esc(label) + ' <span>' + n + '</span></a>';
    return '<nav class="ib-tags" aria-label="Filter cards by tag">' + link('#/ideas', 'All', list.length, !view.tag)
      + tags.map(([k, t]) => link('#/ideas/tag/' + encodeURIComponent(k), t.label, t.n, view.tag === k)).join('') + '</nav>';
  }
  function chip(s) { return '<span class="ib-chip is-' + s.kind + (s.chip === 'NEW' ? ' is-new' : '') + '">' + s.chip + '</span>'; }
  function actions(c, s) {
    const wait = busy.has(c.id);
    if (s.kind === 'booked' || s.kind === 'done') return '<p class="ib-when">' + esc(s.line) + ' <a href="#/schedule">Open the schedule</a></p>';
    if (s.kind === 'listed') return '<p class="ib-when">' + esc(s.line) + '</p><button type="button" class="ib-btn" data-act="send" data-id="' + esc(c.id) + '"' + (wait ? ' disabled' : '') + '>' + (wait ? 'Booking…' : 'Book next free day') + '</button>';
    return '<button type="button" class="ib-btn" data-act="send" data-id="' + esc(c.id) + '"' + (wait ? ' disabled' : '') + '>' + (wait ? 'Sending…' : 'Send to Topics') + '</button>';
  }
  function card({c, s}, i) {
    const kind = KINDS[(c.no - 1 + KINDS.length) % KINDS.length];
    return '<li class="ib-card is-' + kind + (s.kind === 'done' ? ' is-done' : '') + '" data-id="' + esc(c.id) + '" style="--ib-tilt:' + ['-1.5deg', '1deg', '-.5deg', '1.5deg'][i % 4] + '"><article aria-labelledby="ib-t-' + esc(c.id) + '">'
      + '<div class="ib-top"><span class="ib-no">#' + pad(c.no) + '</span>' + chip(s) + '</div>'
      + '<div class="ib-art" aria-hidden="true"><span>' + pad(c.no) + '</span><i></i></div>'
      + '<h2 class="ib-title" id="ib-t-' + esc(c.id) + '">' + esc(c.title) + '</h2>'
      + (c.altTitle ? '<p class="ib-alt">Alt title: ' + esc(c.altTitle) + '</p>' : '')
      + (c.pitch ? '<p class="ib-pitch">' + esc(c.pitch) + '</p>' : '')
      + '<div class="ib-act">' + actions(c, s) + '</div>'
      + '<footer class="ib-foot"><span>' + esc((c.tags[0] || 'Idea').toUpperCase()) + '</span><time datetime="' + esc(c.addedAt) + '">' + esc(stampDay(c.addedAt)) + '</time></footer>'
      + '</article></li>';
  }
  function drawTile(next) {
    if (!view.drawing) return '<li class="ib-draw"><a href="#/ideas/new" class="ib-draw-btn">+ Draw a card</a></li>';
    return '<li class="ib-card is-sun is-form" style="--ib-tilt:0deg"><form class="ib-form" aria-labelledby="ib-form-h">'
      + '<div class="ib-top"><span class="ib-no" id="ib-form-h">#' + pad(next) + ' · new card</span><span class="ib-chip is-new">NEW</span></div>'
      + '<label><span>Title</span><input name="title" maxlength="200" required autocomplete="off" placeholder="The video in one line" value="' + esc(draft.title) + '"></label>'
      + '<label><span>Alt title <small>optional</small></span><input name="altTitle" maxlength="200" autocomplete="off" value="' + esc(draft.altTitle) + '"></label>'
      + '<label><span>Pitch <small>one line</small></span><textarea name="pitch" rows="3" maxlength="600" placeholder="Why someone watches it">' + esc(draft.pitch) + '</textarea></label>'
      + '<label><span>Tags <small>comma separated</small></span><input name="tags" maxlength="160" autocomplete="off" placeholder="Claude, Lead gen" value="' + esc(draft.tags) + '"></label>'
      + '<div class="ib-form-act"><button type="submit" class="ib-btn is-primary">Add to the board</button><a class="ib-btn" href="#/ideas">Cancel</a></div></form></li>';
  }

  function render() {
    if (root.hidden) return;
    const B = store();
    const all = B?.ready ? cards() : [];
    const shown = view.tag ? all.filter(({c}) => c.tags.some(t => slug(t) === view.tag)) : all;
    const live = all.filter(x => x.s.kind !== 'done').length;
    let h = head(live) + filters(all);
    h += '<p class="ib-status" role="status" aria-live="polite">' + esc(status) + (statusLink ? ' ' + statusLink : '') + '</p>';
    if (!B || !B.ready) {
      h += '<p class="ib-empty">' + (connecting ? 'Opening the board…' : 'The Ideas Board reads the app’s saved data, which is not available in this preview. Open the app in Claude to see and add cards.') + '</p>';
    } else {
      const next = (B.cards.reduce((m, c) => Math.max(m, c.no), 0)) + 1;
      h += '<ol class="ib-grid" aria-label="Idea cards">' + (view.tag ? '' : drawTile(next)) + shown.map(card).join('') + '</ol>';
      if (view.tag && !shown.length) h += '<p class="ib-empty">No cards carry that tag. <a href="#/ideas">Show all cards</a></p>';
    }
    const a = document.activeElement && root.contains(document.activeElement) ? document.activeElement : null, focus = a?.name || null, sel = a && typeof a.selectionStart === 'number' ? [a.selectionStart, a.selectionEnd] : null;
    if (a?.dataset.id) keep = {id:a.dataset.id, act:a.dataset.act};
    root.innerHTML = h;
    // A database snapshot redraws the board; the pressed card's button keeps the focus.
    if (keep && !view.drawing) { const b = root.querySelector('[data-act="' + keep.act + '"][data-id="' + CSS.escape(keep.id) + '"]') || root.querySelector('.ib-card[data-id="' + CSS.escape(keep.id) + '"] :is(a,button)'); if (b && (a || document.activeElement === document.body)) b.focus({preventScroll:true}); }
    if (view.drawing) { const f = root.querySelector('.ib-form [name="' + (focus || 'title') + '"]'); if (f && (focus || !draft.title)) { f.focus({preventScroll:!!focus}); if (focus && sel) try { f.setSelectionRange(sel[0], sel[1]); } catch { /* not a text field */ } } }
  }
  const say = (msg, link = '') => { status = msg; statusLink = link; render(); };

  async function send(id) {
    const B = store(); if (!B || busy.has(id)) return;
    busy.add(id); render();
    try {
      const r = await B.toTopics(id), P = window.WWStore.posting;
      const S = await window.WWStore.connect().catch(() => null);
      let post = null; try { post = r.recordDate && S && P ? P.dates(S.topics).get(r.topicId) || null : null; } catch { post = null; }
      M?.stamp?.('ib:sent:' + id);
      say(r.booked ? 'Booked for ' + recDay(r.recordDate) + (post ? ' · posts ' + recDay(post) : '') + '. The card stays on the board.'
        : r.recordDate ? 'Linked to the topic already booked for ' + recDay(r.recordDate) + '. The card stays on the board.' : 'Linked to its topic. The card stays on the board.',
        '<a href="#/topics">Open Topics</a>');
      window.WWIdeas?.reload?.();
    } catch (e) { say(e?.message || 'That could not be saved. Please try again.'); }
    finally { busy.delete(id); render(); }
  }
  async function add(form) {
    const B = store(); if (!B) return;
    const body = Object.fromEntries(new FormData(form));
    if (!String(body.title || '').trim()) { say('Give the idea a title first.'); form.title?.focus(); return; }
    try {
      const r = await B.add(body);
      draft = {title:'', altTitle:'', pitch:'', tags:''};
      status = 'Card #' + pad(r.no) + ' is on the board.'; statusLink = '';
      M?.stamp?.('ib:added');
      if (location.hash === '#/ideas/new') history.replaceState(null, '', '#/ideas');
      view.drawing = false; render();
      root.querySelector('.ib-card[data-id="' + r.id + '"] .ib-btn')?.focus();
      keep = {id:r.id, act:'send'};
    } catch (e) { say(e?.message || 'That card could not be saved. Please try again.'); }
  }

  root.addEventListener('click', e => { const b = e.target.closest('[data-act="send"]'); if (b) send(b.dataset.id); });
  root.addEventListener('input', e => { if (e.target.form?.classList.contains('ib-form')) draft[e.target.name] = e.target.value; });
  root.addEventListener('submit', e => { if (e.target.classList.contains('ib-form')) { e.preventDefault(); add(e.target); } });
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && view.drawing) { e.preventDefault(); location.hash = '#/ideas'; } });
  window.addEventListener('ww:store', () => { if (!root.hidden) render(); });
  window.addEventListener('ww:route', async e => {
    const bits = e.detail || [];
    if (bits[0] !== 'ideas') return;
    const next = {tag:bits[1] === 'tag' && bits[2] ? slug(bits[2]) : null, drawing:bits[1] === 'new'};
    const changed = next.tag !== view.tag;
    view = next; status = ''; statusLink = ''; keep = null;
    if (changed && !M?.arriving?.(root)) M?.enter?.(root, 'lane');
    if (!store()?.ready && window.WWStore && !connecting) { connecting = true; render(); await window.WWStore.connect().catch(() => null); connecting = false; }
    render();
  });
})();
