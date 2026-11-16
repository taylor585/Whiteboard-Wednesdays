// Manager (#/manager, the first tab and the screen the app opens on; Taylor, 16 November 2026, vision board direction A
// in a two-by-two grid): every Pres: chat as a floating orb in one of four cards. Ready to post · Edited, missing a reel
// on top; Deck built, ready to record · Topic in a chat underneath. Tap an orb for its parts, its questions and a check
// for each. The page cannot read the chats itself: the Manager chat writes manager/status each time it reports
// ("Update please"), and the page only reads it. Presses are saved to manager/answers, which the Manager chat reads and
// passes on to the right chat in Taylor's own words. Nothing here posts or starts a session. Shapes are in MANAGER.md.
(() => {
  'use strict';
  const root = document.getElementById('manager');
  if (!root) return;
  const CATS = [
    { k: 'ready', name: 'Ready to post', none: 'Nothing is fully ready yet.' },
    { k: 'reel', name: 'Edited, missing a reel', none: 'No edited video is waiting on a reel.' },
    { k: 'deck', name: 'Deck built, ready to record', none: 'No finished deck is waiting to be filmed.' },
    { k: 'topic', name: 'Topic in a chat', none: 'No topics waiting.' }
  ];
  const NAME = Object.fromEntries(CATS.map(c => [c.k, c.name]));
  const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const db = () => window.WWStore?.db?.() || null;

  let status = null, answers = { asks: {}, parts: {} }, loaded = false, open = null, saveNote = '', watching = false, drawnFor = '';

  const videos = () => (Array.isArray(status?.videos) ? status.videos : []).filter(v => v && v.id && NAME[v.category]);
  const byId = id => videos().find(v => v.id === id) || null;
  const askKey = (v, a, i) => v.id + ':' + (a.id || slug(a.question) || i);
  const partKey = (v, p) => v.id + ':' + slug(p.name);
  const waiting = v => (v.asks || []).filter((a, i) => !answers.asks[askKey(v, a, i)]).length;
  const when = iso => { const d = new Date(iso); return isNaN(d) ? '' : new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d); };

  // ---- Layout: orbs on a staggered grid inside each card, sized so their labels always fit (fit() below) ----
  const MIN = 108;
  function spots(n, w, h) {
    if (!n) return { size: 0, at: [] };
    let cols = Math.max(1, Math.min(n, Math.round(Math.sqrt(n * w / h))));
    let rows = Math.ceil(n / cols);
    while (cols > 1 && Math.ceil(n / (cols - 1)) * (w / (cols - 1)) <= h * 1.05 && Math.ceil(n / (cols - 1)) === rows) cols--;
    cols = Math.min(cols, Math.max(1, Math.floor(w * 0.92 / MIN)));
    rows = Math.ceil(n / cols);
    const cw = w / cols, rh = h / rows;
    const size = Math.max(84, Math.min(168, cw * 0.86, rh * 0.84));
    const at = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
      const shift = (cols - inRow) * cw / 2;
      const nudge = (c % 2 ? 0.1 : -0.06) * Math.max(0, rh - size);
      at.push([shift + cw * (c + 0.5), rh * (r + 0.5) + nudge]);
    }
    return { size, at, rows };
  }
  function fit(el) {
    el.querySelectorAll('.mg-orb .mg-ol').forEach(l => {
      const box = l.parentNode.clientWidth * 0.74;
      let fs = Math.min(18, Math.max(12, l.parentNode.clientWidth / 7.5));
      l.style.fontSize = fs + 'px';
      while (fs > 11 && (l.scrollWidth > l.clientWidth + 0.5 || l.offsetHeight > box)) { fs -= 0.5; l.style.fontSize = fs + 'px'; }
    });
  }
  function place() {
    const phone = matchMedia('(max-width:767px)').matches;
    root.querySelectorAll('.mg-card').forEach(card => {
      const field = card.querySelector('.mg-field'), orbs = [...field.querySelectorAll('.mg-orb')];
      if (phone) { orbs.forEach(o => { o.style.left = o.style.top = ''; o.style.setProperty('--sz', Math.min(132, Math.max(96, (field.clientWidth - 24) / 3)) + 'px'); }); fit(field); return; }
      // Never let an orb shrink below MIN (a long word like "Orchestrator" needs it): grow the field instead.
      field.style.height = '';
      let { size, at, rows } = spots(orbs.length, field.clientWidth, field.clientHeight);
      if (orbs.length && size < MIN) {
        field.style.height = Math.ceil(rows * MIN / 0.84) + 'px';
        ({ size, at } = spots(orbs.length, field.clientWidth, field.clientHeight));
      }
      orbs.forEach((o, i) => {
        const extra = Math.min(16, Number(o.dataset.wait || 0) * 8), sz = Math.min(size + extra, size * 1.12);
        o.style.setProperty('--sz', sz + 'px');
        o.style.left = (at[i][0] - sz / 2) + 'px';
        o.style.top = Math.max(0, Math.min(field.clientHeight - sz, at[i][1] - sz / 2)) + 'px';
      });
      fit(field);
    });
  }

  // ---- Drawing ----
  function orb(v, i) {
    const w = waiting(v);
    return '<button type="button" class="mg-orb is-' + v.category + (open === v.id ? ' is-open' : '') + '" data-id="' + esc(v.id) + '" data-wait="' + w + '"'
      + ' style="--bob:' + (3 + (i % 5) * 0.3).toFixed(1) + 's;--bob-at:-' + ((i * 0.83) % 3).toFixed(2) + 's"'
      + ' aria-expanded="' + (open === v.id) + '" aria-controls="mg-drawer"'
      + ' aria-label="' + esc((v.title || v.short) + '. ' + NAME[v.category] + (v.when ? '. ' + v.when : '') + (w ? '. ' + w + ' waiting on you' : '')) + '">'
      + '<span class="mg-ol">' + esc(v.short || v.title) + '</span>'
      + (w ? '<span class="mg-flag" aria-hidden="true">' + w + '</span>' : '') + '</button>';
  }
  function card(c) {
    const list = videos().filter(v => v.category === c.k);
    const wait = list.reduce((n, v) => n + waiting(v), 0);
    return '<section class="mg-card is-' + c.k + '" aria-labelledby="mg-c-' + c.k + '"><div class="mg-card-head"><h2 id="mg-c-' + c.k + '">' + c.name + '</h2><span class="mg-count">' + list.length + '</span></div>'
      + '<div class="mg-field">' + (list.length ? list.map(orb).join('') : '<p class="mg-none">' + c.none + '</p>') + '</div>'
      + '<div class="mg-foot">' + (wait ? wait + ' waiting on you' : 'Nothing waiting on you') + '</div></section>';
  }
  function drawer() {
    const v = open && byId(open);
    if (!v) return '<p class="mg-hint">Tap an orb to see what it needs.</p>';
    const parts = (v.parts || []).map(p => {
      const key = partKey(v, p), mine = answers.parts[key];
      const done = p.done || !!mine;
      return '<li class="mg-part' + (done ? ' is-done' : '') + '"><span class="mg-pn">' + esc(p.name) + '</span><span class="mg-ps">'
        + (p.done ? '✓ ' + esc(p.note || 'done') : mine ? '✓ you checked this' : esc(p.note || 'to do')) + '</span>'
        + (p.done ? '' : '<button type="button" class="mg-check" data-part="' + esc(key) + '" aria-pressed="' + !!mine + '">' + (mine ? 'Undo' : '✓ Check') + '</button>') + '</li>';
    }).join('');
    const asks = (v.asks || []).map((a, i) => {
      const key = askKey(v, a, i), got = answers.asks[key]?.answer;
      return '<div class="mg-ask"><p>' + esc(a.question) + '</p><div class="mg-opts">' + (a.options || ['Done']).map((o, j) =>
        '<button type="button" class="mg-opt' + (j === 0 ? ' is-first' : '') + (got === o ? ' is-picked' : '') + '" data-ask="' + esc(key) + '" data-answer="' + esc(o) + '" aria-pressed="' + (got === o) + '">' + esc(o) + '</button>').join('')
        + '</div>' + (got ? '<span class="mg-sent">◆ Saved. The Manager chat passes it on at its next update.</span>' : '') + '</div>';
    }).join('');
    return '<div class="mg-d-head"><div class="micro">' + esc(NAME[v.category]) + '</div><h3>' + esc(v.title || v.short) + '</h3>'
      + (v.when ? '<p class="mg-when">' + esc(v.when) + '</p>' : '') + (v.chat ? '<p class="mg-chat">Chat · ' + esc(v.chat) + '</p>' : '') + '</div>'
      + '<div><div class="mg-lab">Parts</div><ul class="mg-parts">' + (parts || '<li class="mg-part"><span class="mg-ps">No parts listed yet.</span></li>') + '</ul></div>'
      + '<div><div class="mg-lab">Waiting on you</div>' + (asks || '<p class="mg-hint">Nothing waiting on you here.</p>') + '</div>'
      + (saveNote ? '<p class="mg-save" role="status">' + esc(saveNote) + '</p>' : '');
  }
  function head() {
    const n = videos().length;
    const title = status ? (WORDS[n] || n) + ' video' + (n === 1 ? '' : 's') + ' in the air' : 'Manager';
    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return '<div class="mg-head"><div class="micro">MANAGER · ' + esc(date) + '</div><h1 id="mg-heading">' + esc(title) + '</h1>'
      + (status?.summary ? '<p>' + esc(status.summary) + '</p>' : '')
      + (status?.updatedAt ? '<p class="mg-updated">Updated ' + esc(when(status.updatedAt)) + ' by the Manager chat. Say "Update please" there to refresh.</p>' : '') + '</div>';
  }
  function render() {
    if (root.hidden) return;
    const keep = document.activeElement?.closest?.('#manager') ? document.activeElement.dataset : null;
    if (!status) {
      root.innerHTML = head() + '<div class="mg-empty"><p>' + (loaded || !db()
        ? 'No report yet. Say "Update please" in the Manager chat and every Pres: chat lands here as an orb.'
        : 'Loading the Manager report…') + '</p></div>';
      return;
    }
    root.innerHTML = head() + '<div class="mg-grid">' + CATS.map(card).join('') + '</div><div class="mg-drawer" id="mg-drawer" aria-live="polite">' + drawer() + '</div>';
    place();
    if (keep?.id) root.querySelector('.mg-orb[data-id="' + CSS.escape(keep.id) + '"]')?.focus({ preventScroll: true });
    else if (keep?.part) root.querySelector('[data-part="' + CSS.escape(keep.part) + '"]')?.focus({ preventScroll: true });
    else if (keep?.ask) root.querySelector('[data-ask="' + CSS.escape(keep.ask) + '"][data-answer="' + CSS.escape(keep.answer) + '"]')?.focus({ preventScroll: true });
  }

  function paint() {
    if (root.hidden || !status) return;
    const d = root.querySelector('#mg-drawer');
    if (!d) return render();
    root.querySelectorAll('.mg-orb').forEach(o => {
      const v = byId(o.dataset.id); if (!v) return;
      const w = waiting(v), on = open === v.id;
      o.dataset.wait = w; o.classList.toggle('is-open', on); o.setAttribute('aria-expanded', String(on));
      let f = o.querySelector('.mg-flag');
      if (w && !f) { f = document.createElement('span'); f.className = 'mg-flag'; f.setAttribute('aria-hidden', 'true'); o.append(f); }
      if (f) { if (w) f.textContent = w; else f.remove(); }
    });
    root.querySelectorAll('.mg-card').forEach(c => {
      const k = [...c.classList].find(x => x.startsWith('is-')).slice(3);
      const n = videos().filter(v => v.category === k).reduce((t, v) => t + waiting(v), 0);
      c.querySelector('.mg-foot').textContent = n ? n + ' waiting on you' : 'Nothing waiting on you';
    });
    const keep = document.activeElement?.closest?.('#mg-drawer') ? { ...document.activeElement.dataset } : null;
    d.innerHTML = drawer();
    if (keep?.part) d.querySelector('[data-part="' + CSS.escape(keep.part) + '"]')?.focus({ preventScroll: true });
    else if (keep?.ask) d.querySelector('[data-ask="' + CSS.escape(keep.ask) + '"][data-answer="' + CSS.escape(keep.answer) + '"]')?.focus({ preventScroll: true });
  }

  // ---- Saving presses (manager/answers; read back by the Manager chat) ----
  async function save(next) {
    const store = db();
    if (!store) { saveNote = 'Saving needs the app’s database, which this preview does not have.'; paint(); return; }
    const prev = answers;
    answers = next; saveNote = ''; paint();
    try { await store.collection('manager').doc('answers').set({ ...answers, updatedAt: new Date().toISOString() }); }
    catch (e) { answers = prev; saveNote = 'Could not save that (' + (e?.code || 'error') + '). Try again.'; paint(); }
  }
  root.addEventListener('click', e => {
    const o = e.target.closest('.mg-orb');
    if (o) {
      open = open === o.dataset.id ? null : o.dataset.id; saveNote = '';
      paint();
      if (open && matchMedia('(max-width:767px)').matches) root.querySelector('#mg-drawer')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      return;
    }
    const p = e.target.closest('[data-part]');
    if (p) {
      const parts = { ...answers.parts };
      if (parts[p.dataset.part]) delete parts[p.dataset.part]; else parts[p.dataset.part] = { checked: true, at: new Date().toISOString() };
      return save({ ...answers, parts });
    }
    const a = e.target.closest('[data-ask]');
    if (a) {
      const asks = { ...answers.asks }, cur = asks[a.dataset.ask];
      if (cur?.answer === a.dataset.answer) delete asks[a.dataset.ask];
      else asks[a.dataset.ask] = { answer: a.dataset.answer, at: new Date().toISOString() };
      return save({ ...answers, asks });
    }
  });

  // ---- Data ----
  async function watch() {
    if (watching) return;
    watching = true;
    try { await window.WWStore?.connect?.(); } catch { /* the empty state explains */ }
    const follow = (id, next) => {
      const store = db();
      if (!store) return;
      try { store.collection('manager').doc(id).onSnapshot(snap => next(snap?.exists === false ? null : snap?.data?.() || null), () => {}); } catch { /* no live updates */ }
    };
    follow('status', d => {
      const key = JSON.stringify(d);
      if (key === drawnFor) return;
      drawnFor = key; status = d; loaded = true;
      if (open && !byId(open)) open = null;
      render();
    });
    follow('answers', d => {
      const n = { asks: d?.asks || {}, parts: d?.parts || {} };
      if (JSON.stringify(n) === JSON.stringify(answers)) return;
      answers = n; paint();
    });
    setTimeout(() => { loaded = true; if (!status) render(); }, 8000);
    render();
  }
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (!root.hidden && status) place(); }, 120); });
  addEventListener('ww:route', e => { if (e.detail?.[0] === 'manager') { render(); watch(); } });
  if (document.fonts) document.fonts.ready.then(() => { if (!root.hidden && status) place(); });
  // For a local preview without the database: WWManager.show(statusObject) draws a report by hand. Never saved.
  window.WWManager = { show(d) { status = d; loaded = true; render(); } };
})();
