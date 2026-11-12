// Talking points (#/talking-points, Taylor, 11 November 2026): the shortlisted topics and every booked recording that has
// not posted yet, each with its 4 main talking points. "Create outline" writes briefs/<topicId> and starts a Claude Code
// session ("Create talking points <topicId>", TALKING-POINTS.md) that researches the topic and writes a one-page brief,
// read on the Briefs screen (briefs.js). The page itself never writes a brief's content, a topic's points or its dates.
(() => {
  'use strict';
  const root = document.getElementById('talking-points');
  if (!root) return;
  const M = window.WWMotion;
  const ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmt = (iso, o) => new Intl.DateTimeFormat('en-GB', o).format(new Date(iso + 'T12:00'));
  const STATUS = { new: 'New', shortlisted: 'Shortlisted', planned: 'Planned', slides_ready: 'Slides ready', recorded: 'Recorded', edited: 'Edited' };
  const ACTIVE = ['requested', 'starting', 'running'];

  // ---- Shared with briefs.js: the data the screens read, and the one way a session is started from the page. ----
  const data = () => window.WWIdeas?.data || null;
  const topics = () => data()?.topics || [];
  const briefMap = () => new Map((data()?.briefs || []).map(b => [b.id || b.topicId, b]));
  const db = () => window.WWStore?.db?.() || null;
  // Starts a Claude Code session in the cloud through the viewer's Claude Code Remote connector, the same call Publish makes.
  async function startSession(title, prompt) {
    const mcp = await window.claude?.use?.('mcp');
    if (!mcp) throw { code: 'unavailable' };
    const r = await (window.WWStore?.createSession || ((m, a) => m.callTool('Claude Code Remote', 'create_session', a)))(mcp, { model: 'claude-opus-5-5', permission_mode: 'auto', environment_id: ENV, source_url: REPO, title, prompt });
    const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
    return { id: sid, url: sid ? 'https://claude.ai/code/' + sid : null };
  }
  const refusal = e => e?.code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.'
    : e?.code === 'unavailable' ? 'The Claude Code connection is not available in this view.'
    : 'Claude Code could not be started (' + (e?.code || e?.message || 'error') + ').';
  async function copyText(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }
  window.WWTalk = { startSession, refusal, copyText, briefMap, topics, esc, fmt, STATUS, ACTIVE };

  // ---- This screen ----
  const pending = new Set(), refused = new Map(), errors = new Map();
  let copied = '';
  function lists() {
    const all = topics();
    const booked = all.filter(t => t.recordDate && t.status !== 'posted').sort((a, b) => b.recordDate.localeCompare(a.recordDate)); // Latest recording first, always (Taylor, 12 November 2026)
    const short = all.filter(t => t.status === 'shortlisted' && !t.recordDate).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return { booked, short };
  }
  const lineFor = id => 'Create talking points ' + id;

  function when(t) {
    if (!t.recordDate) return '<div class="tk-when"><span class="tk-dow">Not booked</span><b class="tk-date">Shortlist</b></div>';
    return '<div class="tk-when"><span class="tk-dow">' + (['recorded', 'edited'].includes(t.status) ? 'Recorded ' : 'Records ') + esc(fmt(t.recordDate, { weekday: 'short' })) + '</span><b class="tk-date">' + esc(fmt(t.recordDate, { day: 'numeric', month: 'short' })) + '</b></div>';
  }
  function points(t) {
    const p = t.points || [];
    if (!p.length) return '<p class="tk-none">No outline yet</p>';
    return '<ol class="tk-points">' + p.map((x, i) => '<li><span class="tk-n">' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(x.title) + '</span></li>').join('') + '</ol>';
  }
  function copyLine(id, line) {
    const on = copied === id;
    return '<div class="tk-line"><code>' + esc(line) + '</code><button type="button" class="tk-copy" data-act="copy" data-id="' + esc(id) + '"' + M.done('tk:' + id, on) + '>' + M.label(on, 'Copy', 'Copied') + '</button></div>';
  }
  function action(t, b) {
    const id = esc(t.id), session = b?.session?.url ? ' <a class="tk-link" href="' + esc(b.session.url) + '" target="_blank" rel="noopener">Open the session</a>' : '';
    if (errors.has(t.id)) return '<p class="tk-state is-warn">' + esc(errors.get(t.id)) + '</p><button type="button" class="tk-go" data-act="create" data-id="' + id + '">Try again</button>';
    if (refused.has(t.id)) { const r = refused.get(t.id); return '<p class="tk-state is-warn">' + esc(r.why) + ' Nothing has started.</p><p class="tk-hint">Send this in a Claude chat, or try again:</p>' + copyLine(t.id, r.line) + '<button type="button" class="tk-quiet" data-act="create" data-id="' + id + '">Try again</button>'; }
    if (pending.has(t.id) || b?.status === 'starting') return '<p class="tk-state is-run" role="status">Starting Claude Code</p>' + session;
    if (b?.status === 'requested') return '<p class="tk-state is-run">Waiting for a session to pick it up.</p><p class="tk-hint">Send this in a Claude chat, or try again:</p>' + copyLine(t.id, lineFor(t.id)) + '<button type="button" class="tk-quiet" data-act="create" data-id="' + id + '">Try again</button>';
    if (b?.status === 'running') return '<p class="tk-state is-run" role="status">' + (b.sections ? 'Writing a new version' : 'Researching and writing the brief') + '</p>' + session + (b.sections ? ' <a class="tk-link" href="#/briefs/' + encodeURIComponent(t.id) + '">Open current brief</a>' : '');
    if (b?.status === 'failed') return '<p class="tk-state is-warn">Could not finish: ' + esc(b.error || 'the session stopped without saying why.') + '</p><button type="button" class="tk-go" data-act="create" data-id="' + id + '">Try again</button>';
    if (b?.status === 'ready') return '<p class="tk-state is-ok">Brief ready</p><a class="tk-go" href="#/briefs/' + encodeURIComponent(t.id) + '">Open brief</a><button type="button" class="tk-quiet" data-act="create" data-id="' + id + '">Rewrite outline</button>';
    return '<button type="button" class="tk-go" data-act="create" data-id="' + id + '">Create outline</button><p class="tk-hint">Claude researches what is new and writes a one-page brief.</p>';
  }
  function row(t, briefs) {
    const b = briefs.get(t.id), ready = b?.status === 'ready' || (b?.sections && b?.status !== 'failed');
    const title = ready ? '<a href="#/briefs/' + encodeURIComponent(t.id) + '">' + esc(t.title) + '</a>' : esc(t.title);
    const meta = t.recordDate ? esc(STATUS[t.status] || t.status) + ' · ' + esc(fmt(t.recordDate, { weekday: 'long', day: 'numeric', month: 'long' })) : '';
    return '<li class="tk-row" data-id="' + esc(t.id) + '">' + when(t)
      + '<div class="tk-body"><h3 class="tk-title">' + title + '</h3>' + (meta ? '<p class="tk-meta">' + meta + '</p>' : '<div class="tk-gap"></div>') + points(t) + '</div>'
      + '<div class="tk-act">' + action(t, b) + '</div></li>';
  }
  function group(key, title, list, briefs, empty) {
    return '<section class="tk-group" aria-labelledby="tk-g-' + key + '"><h2 id="tk-g-' + key + '">' + esc(title) + ' <span class="tk-count">' + String(list.length).padStart(2, '0') + '</span></h2>'
      + (list.length ? '<ol class="tk-rows">' + list.map(t => row(t, briefs)).join('') + '</ol>' : '<p class="tk-empty">' + esc(empty) + '</p>') + '</section>';
  }
  function render() {
    if (root.hidden) return;
    const focus = document.activeElement?.closest?.('#talking-points [data-act]');
    const key = focus ? focus.dataset.act + ':' + focus.dataset.id : null;
    const d = data(), { booked, short } = lists(), briefs = briefMap();
    let h = '<div class="tk-head"><div class="micro">TALKING POINTS · BEFORE THE CAMERA</div><h1 id="tk-heading">Talking points</h1>'
      + '<p>Your shortlist and every booked recording that has not posted yet. Create an outline and Claude researches the topic, writes the 4 talking points and a one-page brief to record from.</p></div>';
    if (!d) h += '<p class="tk-empty" role="status">Loading your topics…</p>';
    else if (!booked.length && !short.length) h += '<div class="tk-blank"><p><b>Nothing to outline yet.</b></p><p>Shortlist an angle or book a recording on <a href="#/topics">Topics</a>, and it appears here.</p></div>';
    else h += group('booked', 'On the recording schedule', booked, briefs, 'No recordings are booked that have not posted.') + group('short', 'Shortlisted', short, briefs, 'Nothing is on the shortlist.');
    root.innerHTML = h;
    if (key) root.querySelector('[data-act="' + key.split(':')[0] + '"][data-id="' + CSS.escape(key.split(':').slice(1).join(':')) + '"]')?.focus({ preventScroll: true });
  }

  async function create(id) {
    const t = topics().find(x => x.id === id), store = db();
    if (!t) return;
    errors.delete(id); refused.delete(id);
    if (!store) { errors.set(id, 'Creating an outline needs the app’s database, which this preview does not have.'); render(); return; }
    pending.add(id); render();
    const now = new Date().toISOString(), ref = store.collection('briefs').doc(id), had = briefMap().get(id);
    try {
      if (had) await ref.update({ title: t.title, status: 'requested', error: null, requestedAt: now, updatedAt: now });
      else await ref.set({ topicId: id, title: t.title, status: 'requested', createdAt: now, requestedAt: now, updatedAt: now });
    } catch (e) { pending.delete(id); errors.set(id, 'Could not save the request (' + (e?.code || 'error') + ').'); render(); return; }
    const line = lineFor(id);
    let session;
    try { session = await startSession('Talking points: ' + t.title, line + '. Follow TALKING-POINTS.md in this repository exactly.'); }
    catch (e) { refused.set(id, { why: refusal(e), line }); pending.delete(id); render(); return; }
    const at = new Date().toISOString();
    // If this record cannot be saved the session still runs and writes its own status ('running') when it starts.
    try { await ref.update({ status: 'starting', session: { ...session, requestedAt: now, startedAt: at }, updatedAt: at }); } catch { /* see above */ }
    pending.delete(id); render();
  }
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === 'create') { create(id); return; }
    if (b.dataset.act === 'copy') {
      const r = refused.get(id), ok = await copyText(r ? r.line : lineFor(id));
      if (!ok) { errors.set(id, 'Copy was blocked by the browser. Select the line and copy it instead.'); render(); return; }
      copied = id; M.stamp('on:tk:' + id); render();
      setTimeout(() => { if (copied === id) { M.stamp('off:tk:' + id); copied = ''; render(); } }, 1800);
    }
  });
  addEventListener('ww:data', () => { if (!root.hidden && !document.activeElement?.closest?.('#talking-points input')) render(); });
  addEventListener('ww:route', e => { if (e.detail?.[0] === 'talking-points') render(); });
})();
