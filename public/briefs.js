// Briefs (#/briefs and #/briefs/<topicId>, Taylor, 11 November 2026): the one-page briefs written from Talking points,
// laid out to record from. Recording view hides the app's chrome and enlarges the type; Print gives one page.
// "Turn into presentation" starts a session ("Build deck from brief <topicId>", TALKING-POINTS.md) that builds the deck
// with the Whiteboard Wednesdays skill and adds it to Presentations. Documents: briefs/<topicId> (shape in TALKING-POINTS.md).
(() => {
  'use strict';
  const root = document.getElementById('briefs');
  if (!root) return;
  const M = window.WWMotion, T = window.WWTalk;
  if (!T) return;
  const { esc, fmt, ACTIVE } = T;
  let view = null, current = null, deckBusy = false, deckRefused = null, deckError = '', copied = false;

  const topicOf = id => T.topics().find(t => t.id === id) || null;
  const recordDay = b => topicOf(b.topicId || b.id)?.recordDate || null;
  const deckIdOf = b => b?.deck?.deckId || topicOf(b?.topicId || b?.id)?.deckId || null;
  const longDay = iso => fmt(iso, { weekday: 'long', day: 'numeric', month: 'long' });
  const stamp = iso => { const d = new Date(iso); return isNaN(d) ? '' : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d); };
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : null;

  function head() {
    return '<div class="br-head"><div class="micro">BRIEFS · RECORD FROM HERE</div><h1 id="br-heading">Briefs</h1>'
      + '<p>One page per video: the promise, the cold open, the 4 talking points with their proof, and the close. Record straight from it, or turn it into a presentation.</p></div>';
  }
  function stateLine(b) {
    if (b.status === 'failed') return '<span class="br-state is-warn">Could not finish: ' + esc(b.error || 'the session stopped without saying why.') + '</span>';
    if (b.status === 'running') return '<span class="br-state is-run">' + (b.sections ? 'Writing a new version' : 'Being written') + '</span>';
    if (b.status === 'starting') return '<span class="br-state is-run">Starting</span>';
    if (b.status === 'requested') return '<span class="br-state is-run">Waiting for a session</span>';
    return '<span class="br-state is-ok">Ready to record</span>';
  }
  function listRow(b) {
    const problem = T.problem?.(b.topicId || b.id);
    if (problem) return problemRow(b, problem);
    const id = b.topicId || b.id, iso = recordDay(b), pts = b.sections?.points || [], open = b.status === 'ready' || !!b.sections;
    const title = open ? '<a href="#/briefs/' + encodeURIComponent(id) + '">' + esc(b.title) + '</a>' : esc(b.title);
    return '<li class="br-row" data-id="' + esc(id) + '">'
      + '<div class="br-when">' + (iso ? '<span class="br-dow">Records ' + esc(fmt(iso, { weekday: 'short' })) + '</span><b>' + esc(fmt(iso, { day: 'numeric', month: 'short' })) + '</b>' : '<span class="br-dow">Not booked</span>') + '</div>'
      + '<div class="br-row-body"><h3>' + title + '</h3>' + (pts.length ? '<ol class="br-mini">' + pts.map((p, i) => '<li><span>' + String(i + 1).padStart(2, '0') + '</span>' + esc(p.title) + '</li>').join('') + '</ol>' : '') + stateLine(b)
      + (ACTIVE.includes(b.status) && b.session?.url ? ' <a class="br-link" href="' + esc(b.session.url) + '" target="_blank" rel="noopener">Open the session</a>' : '') + '</div>'
      + '<div class="br-row-act">' + (open ? '<a class="br-go" href="#/briefs/' + encodeURIComponent(id) + '">Open brief</a>' : b.status === 'failed' ? '<button type="button" class="br-go" data-act="create" data-id="' + esc(id) + '">Try again</button>' : '') + '</div></li>';
  }
  // Every shortlisted topic, and every booked one not yet posted, shows here too, even before it has a brief
  // (Taylor, 12 November 2026: "It should be added to the briefs"), latest recording first, with Create brief.
  function waitingRow(t) {
    const id = esc(t.id), problem = T.problem?.(t.id), busy = T.busy?.(t.id);
    if (problem) return problemRow({ topicId: t.id, title: t.title }, problem).replace('class="br-row"', 'class="br-row" data-wait');
    return '<li class="br-row" data-id="' + id + '" data-wait>'
      + '<div class="br-when">' + (t.recordDate ? '<span class="br-dow">Records ' + esc(fmt(t.recordDate, { weekday: 'short' })) + '</span><b>' + esc(fmt(t.recordDate, { day: 'numeric', month: 'short' })) + '</b>' : '<span class="br-dow">Not booked</span><b>Shortlist</b>') + '</div>'
      + '<div class="br-row-body"><h3>' + esc(t.title) + '</h3>' + (problem ? '<span class="br-state is-warn">' + esc(problem) + '</span>' : busy ? '<span class="br-state is-run">Starting</span>' : '<span class="br-state">No brief yet</span>') + '</div>'
      + '<div class="br-row-act"><button type="button" class="br-go" data-act="create" data-id="' + id + '"' + (busy ? ' disabled' : '') + '>' + (problem ? 'Try again' : 'Create brief') + '</button></div></li>';
  }
  function problemRow(b, problem) {
    const id = b.topicId || b.id, iso = recordDay(b);
    return '<li class="br-row" data-id="' + esc(id) + '">'
      + '<div class="br-when">' + (iso ? '<span class="br-dow">Records ' + esc(fmt(iso, { weekday: 'short' })) + '</span><b>' + esc(fmt(iso, { day: 'numeric', month: 'short' })) + '</b>' : '<span class="br-dow">Not booked</span><b>Shortlist</b>') + '</div>'
      + '<div class="br-row-body"><h3>' + esc(b.title) + '</h3><span class="br-state is-warn">' + esc(problem) + ' Nothing has started. Try again, or send “Create talking points ' + esc(id) + '” in a Claude chat.</span></div>'
      + '<div class="br-row-act"><button type="button" class="br-go" data-act="create" data-id="' + esc(id) + '">Try again</button></div></li>';
  }
  function list() {
    const all = [...T.briefMap().values()];
    const L = T.lists ? T.lists() : { booked: [], short: [] }, have = T.briefMap();
    const waiting = [...L.booked, ...L.short].filter(t => !have.has(t.id));
    const byDay = (a, b) => String(recordDay(b) || '').localeCompare(String(recordDay(a) || '')) || String(b.updatedAt).localeCompare(String(a.updatedAt));
    const ready = all.filter(b => b.status === 'ready').sort(byDay), rest = all.filter(b => b.status !== 'ready').sort(byDay);
    let h = head();
    if (!window.WWIdeas?.data) h += '<p class="br-empty" role="status">Loading your briefs…</p>';
    else if (!all.length && !waiting.length) h += '<div class="br-blank"><p><b>No briefs yet.</b></p><p>Shortlist or book a topic and it appears here with Create brief; the brief shows when Claude has written it.</p></div>';
    else {
      h += '<section class="br-group" aria-labelledby="br-g-ready"><h2 id="br-g-ready">Ready to record <span class="br-count">' + String(ready.length).padStart(2, '0') + '</span></h2>'
        + (ready.length ? '<ol class="br-rows">' + ready.map(listRow).join('') + '</ol>' : '<p class="br-empty">None ready yet.</p>') + '</section>';
      if (waiting.length) h += '<section class="br-group" aria-labelledby="br-g-wait"><h2 id="br-g-wait">No brief yet <span class="br-count">' + String(waiting.length).padStart(2, '0') + '</span></h2><ol class="br-rows">' + waiting.map(waitingRow).join('') + '</ol></section>';
      if (rest.length) h += '<section class="br-group" aria-labelledby="br-g-work"><h2 id="br-g-work">In progress <span class="br-count">' + String(rest.length).padStart(2, '0') + '</span></h2><ol class="br-rows">' + rest.map(listRow).join('') + '</ol></section>';
    }
    return h;
  }

  function deckControl(b) {
    const id = b.topicId || b.id, d = b.deck || {}, deckId = deckIdOf(b), line = 'Build deck from brief ' + id;
    if (deckId) return '<a class="br-btn" href="#/presentation/' + encodeURIComponent(deckId) + '">Open presentation</a>';
    if (deckRefused) return '<button type="button" class="br-btn" data-act="deck">Turn into presentation</button><div class="br-deck-note"><p class="br-state is-warn">' + esc(deckRefused) + ' Nothing has started. Send this in a Claude chat, or try again:</p><div class="br-line"><code>' + esc(line) + '</code><button type="button" class="br-copy" data-act="copy"' + M.done('br:deck', copied) + '>' + M.label(copied, 'Copy', 'Copied') + '</button></div></div>';
    if (deckBusy || d.status === 'starting') return '<span class="br-btn is-busy" role="status">Starting the build</span>';
    if (d.status === 'requested') return '<button type="button" class="br-btn" data-act="deck">Turn into presentation</button><p class="br-deck-note br-state is-run">Waiting for a session. Press again, or send “' + esc(line) + '” in a Claude chat.</p>';
    if (d.status === 'running') return '<span class="br-btn is-busy" role="status">Building the presentation</span>' + (d.session?.url ? '<a class="br-link" href="' + esc(d.session.url) + '" target="_blank" rel="noopener">Open the session</a>' : '');
    if (d.status === 'failed' || deckError) return '<button type="button" class="br-btn" data-act="deck">Try again</button><p class="br-deck-note br-state is-warn">The presentation was not built: ' + esc(deckError || d.error || 'the session stopped without saying why.') + '</p>';
    return '<button type="button" class="br-btn" data-act="deck"' + (b.sections ? '' : ' disabled') + '>Turn into presentation</button>';
  }
  function sheet(b) {
    const s = b.sections || {}, pts = (s.points || []).slice(0, 4), iso = recordDay(b), rec = document.body.classList.contains('br-recording');
    const sources = (b.sources || []).filter(x => x && (x.title || x.url));
    const run = [['br-cold', 'Cold open'], ...pts.map((p, i) => ['br-p' + (i + 1), String(i + 1).padStart(2, '0') + ' ' + p.title]), ['br-close', 'Close'], ['br-prep', 'Prep']];
    let h = '<div class="br-top"><a class="br-back" href="#/briefs">← All briefs</a><div class="br-actions" role="group" aria-label="Brief actions">'
      + '<button type="button" class="br-go" data-act="record" aria-pressed="' + rec + '">' + (rec ? 'Leave recording view' : 'Recording view') + '</button>'
      + '<button type="button" class="br-btn" data-act="print">Print</button>' + deckControl(b) + '</div></div>';
    if (b.status !== 'ready') h += '<p class="br-banner">' + stateLine(b) + (b.status === 'running' && b.sections ? ' This is the last version; it updates when Claude has finished.' : '') + '</p>';
    h += '<div class="br-stage"><nav class="br-run" aria-label="Running order"><span class="br-run-h">Running order</span><ol>' + run.map(([id, label]) => '<li><a href="#' + id + '" data-jump="' + id + '">' + esc(label) + '</a></li>').join('') + '</ol></nav>'
      + '<article class="br-sheet" aria-labelledby="br-title"><header class="br-sheet-head"><div class="micro">BRIEF · ' + (iso ? 'RECORDS ' + esc(fmt(iso, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()) : 'NOT BOOKED YET') + '</div>'
      + '<h1 id="br-title">' + esc(b.title) + '</h1>'
      + (s.atAGlance ? '<div class="br-glance"><span class="br-label">At a glance</span><p>' + esc(s.atAGlance) + '</p></div>' : '') + '</header>'
      + (s.coldOpen ? '<section class="br-cold" id="br-cold" aria-labelledby="br-cold-h"><h2 class="br-label" id="br-cold-h">Cold open</h2><p>' + esc(s.coldOpen) + '</p></section>' : '')
      + '<ol class="br-points">' + pts.map((p, i) => '<li id="br-p' + (i + 1) + '"><span class="br-n" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><div class="br-pt"><h2><span class="br-sr">Talking point ' + (i + 1) + ': </span>' + esc(p.title) + '</h2>'
        + ((p.beats || []).length ? '<ul class="br-beats">' + p.beats.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '')
        + (p.proof ? '<p class="br-proof"><span class="br-label">Proof</span>' + esc(p.proof) + '</p>' : '') + '</div></li>').join('') + '</ol>'
      + (s.close ? '<section class="br-close" id="br-close" aria-labelledby="br-close-h"><h2 class="br-label" id="br-close-h">Close</h2><p>' + esc(s.close) + '</p></section>' : '')
      + ((s.prep || []).length ? '<section class="br-prep" id="br-prep" aria-labelledby="br-prep-h"><h2 class="br-label" id="br-prep-h">Prep</h2><ul>' + s.prep.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>' : '')
      + '<footer class="br-foot">' + (sources.length ? '<h2 class="br-label">Sources</h2><ol class="br-sources">' + sources.map(x => { const u = safeUrl(x.url); return '<li>' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(x.title || u) + '</a> <span>' + esc(host(u)) + '</span>' : esc(x.title)) + '</li>'; }).join('') + '</ol>' : '')
      + '<p class="br-honest">Written by Claude from web research' + (b.updatedAt ? ', ' + esc(stamp(b.updatedAt)) : '') + '. Open a source before you quote it on camera.</p></footer>'
      + '</article></div>';
    return h;
  }
  function one(id) {
    const b = T.briefMap().get(id);
    if (!window.WWIdeas?.data) return '<p class="br-empty" role="status">Loading the brief…</p>';
    if (!b) return '<div class="br-top"><a class="br-back" href="#/briefs">← All briefs</a></div><div class="br-blank"><p><b>This brief is not here.</b></p><p>It may not have been written yet. Create it from <a href="#/briefs">all briefs</a>.</p></div>';
    if (!b.sections) return '<div class="br-top"><a class="br-back" href="#/briefs">← All briefs</a></div><div class="br-blank"><p><b>' + esc(b.title) + '</b></p><p>' + stateLine(b) + (b.session?.url ? ' <a class="br-link" href="' + esc(b.session.url) + '" target="_blank" rel="noopener">Open the session</a>' : '') + '</p></div>';
    return sheet(b);
  }
  function render() {
    if (root.hidden || !view) return;
    const f = document.activeElement?.closest?.('#briefs [data-act]')?.dataset.act;
    root.innerHTML = view === 'list' ? list() : one(current);
    if (f) root.querySelector('[data-act="' + f + '"]')?.focus({ preventScroll: true });
  }
  function recording(on) {
    document.body.classList.toggle('br-recording', on);
    render();
    root.querySelector('[data-act=record]')?.focus({ preventScroll: true });
  }

  async function deck() {
    const b = T.briefMap().get(current), store = window.WWStore?.db?.();
    if (!b) return;
    deckRefused = null; deckError = ''; copied = false;
    if (!store) { deckError = 'building a presentation needs the app’s database, which this preview does not have.'; render(); return; }
    deckBusy = true; render();
    const ref = store.collection('briefs').doc(current), now = new Date().toISOString(), line = 'Build deck from brief ' + current;
    try { await ref.update({ deck: { status: 'requested', requestedAt: now }, updatedAt: now }); }
    catch (e) { deckBusy = false; deckError = 'the request could not be saved (' + (e?.code || 'error') + ').'; render(); return; }
    let session;
    try { session = await T.startSession('Deck from brief: ' + b.title, line + '. Follow TALKING-POINTS.md in this repository exactly.'); }
    catch (e) { deckBusy = false; deckRefused = T.refusal(e); render(); return; }
    const at = new Date().toISOString();
    try { await ref.update({ deck: { status: 'starting', requestedAt: now, session: { ...session, startedAt: at } }, updatedAt: at }); } catch { /* the session writes its own status */ }
    deckBusy = false; render();
  }
  root.addEventListener('click', async e => {
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); const t = document.getElementById(jump.dataset.jump); if (t) { t.scrollIntoView({ block: 'start' }); t.tabIndex = -1; t.focus({ preventScroll: true }); } return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'record') recording(!document.body.classList.contains('br-recording'));
    else if (b.dataset.act === 'print') window.print();
    else if (b.dataset.act === 'create' && b.dataset.id) { const p = T.create(b.dataset.id); render(); await p; render(); }
    else if (b.dataset.act === 'deck') deck();
    else if (b.dataset.act === 'copy') {
      if (!await T.copyText('Build deck from brief ' + current)) { deckError = 'copy was blocked by the browser. Select the line and copy it instead.'; render(); return; }
      copied = true; M.stamp('on:br:deck'); render();
      setTimeout(() => { if (copied) { M.stamp('off:br:deck'); copied = false; render(); } }, 1800);
    }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('br-recording') && !document.querySelector('dialog[open]')) { e.preventDefault(); recording(false); } });
  addEventListener('ww:data', () => { if (!root.hidden) render(); });
  // Leaving the brief always leaves recording view, so the app's tabs are never hidden on another screen.
  addEventListener('hashchange', () => { if (!/^#\/briefs\/./.test(location.hash)) document.body.classList.remove('br-recording'); });
  addEventListener('ww:route', e => {
    const bits = e.detail || [];
    if (bits[0] !== 'briefs') { view = null; return; }
    const next = bits[1] ? 'one' : 'list', id = bits[1] || null, changed = view && (next !== view || id !== current);
    if (id !== current) { deckBusy = false; deckRefused = null; deckError = ''; copied = false; }
    view = next; current = id;
    if (changed && !M.arriving(root)) M.enter(root, 'screen');
    render();
  });
})();
