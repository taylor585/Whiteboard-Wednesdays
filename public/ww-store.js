/* Claude storage for topics. When the app runs as a Claude artifact there is no server, so topics,
   subtopics and their links to presentations are kept in the artifact's own database (the `db`
   capability) instead. Every action mirrors app/api/ideas so the screens behave the same in both places. */
(() => {
  'use strict';
  const STATUSES = ['new','shortlisted','planned','slides_ready','recorded','edited','posted'];
  let db = null, topics = [], notes = new Map(), ready = null, uploads = null, runs = [];
  let briefs = []; // Talking points briefs, briefs/<topicId> (TALKING-POINTS.md)
  const fail = (error, status=400, extra={}) => { const e = new Error(error); e.status = status; e.result = {error, ...extra}; throw e; };
  const text = (v, max) => typeof v === 'string' && v.length <= max ? v : null;
  function day(v) { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null; const d = new Date(v+'T12:00:00Z'); return Number.isNaN(d.getTime()) || d.toISOString().slice(0,10) !== v ? null : d; }
  const shape = (id, t) => ({id, title:t.title || '', status:t.status || 'new', notes:t.notes || '', recordDate:t.recordDate || null, postDate:t.postDate || null, deckId:t.deckId || null, buyer:t.buyer === 'A' || t.buyer === 'B' ? t.buyer : null,
    createdAt:t.createdAt || '', updatedAt:t.updatedAt || '', origin:t.origin || null, skillLock:t.skillLock || null, sources:Array.isArray(t.sources) ? t.sources : [], points:(Array.isArray(t.points) ? t.points : []).slice().sort((a,b) => a.position - b.position)});
  const sorted = () => topics.slice().sort((a,b) => (a.recordDate ? 0 : 1) - (b.recordDate ? 0 : 1) || String(a.recordDate).localeCompare(String(b.recordDate)) || String(b.createdAt).localeCompare(String(a.createdAt)));
  const ref = id => db.collection('topics').doc(id);
  async function write(fn) {
    try { return await fn(); }
    catch (e) {
      if (e && e.code === 'invalid_argument') fail('Only the owner and editors can change topics on this page.', 403);
      if (e && e.code === 'quota_exceeded') fail('This page has reached its storage limit. Delete some old topics and try again.', 507);
      if (e && e.status) throw e;
      fail('Your change could not be saved. Please try again.', 503);
    }
  }
  // ---- Posting settings and the one rule that gives a video its posting day (Taylor, 10 November 2026). ----
  // Saved as settings/posting. When the document is missing the defaults apply: posting days Tuesday, Thursday and
  // Saturday (Taylor, 11 November 2026), at least 5 days after recording (Monday → that Saturday, Wednesday → next
  // Tuesday, Friday → next Thursday). Wednesday and Friday videos keep the dates the app always showed.
  //   {days:['tue','thu','sat'],      posting days, any of mon tue wed thu fri sat sun
  //    gap:5,                         editing gap: a video posts at least this many days after its recording day (1 to 14)
  //    time:'15:00',                  one posting time, UK time, for the automatic poster later
  //    mode:'manual',                 'manual' | 'auto'. Auto is saved as the intent; nothing posts itself until accounts connect
  //    platforms:{youtube,linkedin,instagram,facebook,x},   each true or false
  //    from:'2026-11-10'|null,        the day this rule started; videos that went out before it keep their dates
  //    history:[{days,gap,from}],     earlier rules, oldest first, so past weeks never move when the rule changes
  //    updatedAt:'…'}
  const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'], DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const WEEK = ['mon','tue','wed','thu','fri','sat','sun'];
  const PLATFORMS = [['youtube','YouTube'],['linkedin','LinkedIn'],['instagram','Instagram'],['facebook','Facebook'],['x','X']];
  // Recording days (Taylor, 11 November 2026: "Recording days are going to be Monday, Wednesday, and Friday"). Fixed, not
  // a setting: one topic per recording day. Before RECORD_FROM the days were Wednesday and Friday, so past weeks keep
  // their own recording days on the calendar, and bookings made then stay valid.
  const RECORD_DAYS = Object.freeze(['mon','wed','fri']), RECORD_FROM = '2026-11-11', RECORD_BEFORE = Object.freeze(['wed','fri']);
  const POSTING_DEFAULTS = Object.freeze({days:['tue','thu','sat'], gap:5, time:'15:00', mode:'manual', platforms:{youtube:true, linkedin:true, instagram:true, facebook:true, x:false}, from:null, history:[], updatedAt:null});
  // ---- Connections (Taylor, 10 November 2026): what the app knows about each account, from a real check only. ----
  // Every account is its own connection. Sign-ins are kept by Composio on Taylor's Claude account, never in the app.
  // Two sources, both real checks, neither saved by the page:
  //   direct   the Connections screen asked Composio itself (settings.js) and called connections.set(key, {...}).
  //   session  a Claude Code session ran "Check connections" (CONNECTIONS.md) and wrote the document connections/status:
  //     {updatedAt:'…', by:'session',
  //      googledrive|youtube|linkedin|instagram|facebook|x:
  //        {state:'connected'|'not_connected'|'connecting'|'attention'|'unknown',
  //         account:'name the platform returned'|null, checkedAt:'…', error:'plain words'|null,
  //         link:{url:'https://… sign-in link from Composio', createdAt:'…'}|null}}
  // A direct result wins while there is one; otherwise the session's document stands. Kept in memory only.
  // States here: 'unknown' (never checked) | 'off' | 'connecting' | 'on' | 'attention' | 'blind' (could not be checked).
  const CONN_KEYS = ['googledrive','youtube','linkedin','instagram','facebook','x'];
  const CONN_TOOLKITS = Object.freeze({googledrive:'googledrive', youtube:'youtube', linkedin:'linkedin', instagram:'instagram', facebook:'facebook', x:'twitter'});
  const DOC_STATE = {connected:'on', not_connected:'off', connecting:'connecting', attention:'attention', unknown:'blind'};
  const UNKNOWN = Object.freeze({state:'unknown', account:null, checkedAt:null, error:null, link:null, via:null});
  let connDirect = {}, connDoc = null, connRef = null;
  const str = (v, max) => typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;
  const httpsUrl = v => { try { const u = new URL(String(v)); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
  function connFromDoc(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const out = {updatedAt:str(raw.updatedAt, 40), platforms:{}};
    for (const k of CONN_KEYS) { const r = raw[k]; if (!r || typeof r !== 'object' || !DOC_STATE[r.state]) continue;
      const url = httpsUrl(r.link?.url);
      out.platforms[k] = {state:DOC_STATE[r.state], account:r.state === 'connected' ? str(r.account, 120) : null, checkedAt:str(r.checkedAt, 40) || out.updatedAt, error:str(r.error, 300), link:url ? {url, createdAt:str(r.link.createdAt, 40)} : null, via:'session'}; }
    return out;
  }
  const connGet = k => connDirect[k] || connDoc?.platforms[k] || UNKNOWN;
  const connChanged = () => window.dispatchEvent(new CustomEvent('ww:connections'));
  const connectionsApi = {KEYS:CONN_KEYS, TOOLKITS:CONN_TOOLKITS, get:connGet,
    get all() { return Object.fromEntries(CONN_KEYS.map(k => [k, connGet(k)])); },
    isConnected: k => connGet(k).state === 'on',
    // A direct check's answer for one account. Only the Connections screen calls this, and only with what Composio returned.
    set(k, v) { if (!CONN_KEYS.includes(k)) return; const s = ['off','connecting','on','attention','blind'].includes(v?.state) ? v.state : 'blind';
      connDirect[k] = {state:s, account:s === 'on' ? str(v.account, 120) : null, checkedAt:str(v.checkedAt, 40) || new Date().toISOString(), error:str(v.error, 300), link:null, via:'direct', extra:Number.isInteger(v.extra) ? v.extra : 0}; },
    // The direct route is gone (switched off, signed out): forget what it said, so nothing stale reads as Connected.
    clearDirect(keys) { for (const k of keys || CONN_KEYS) delete connDirect[k]; },
    changed:connChanged,
    get doc() { return connDoc; }, get canReadDoc() { return Boolean(connRef); },
    // Read the session's document once more (the screen calls it on open and on return to the tab; never on a timer).
    async reload() { if (!connRef) return connDoc; try { const got = await connRef.get(); connDoc = connFromDoc(got?.data?.()); } catch { /* keep what we had */ } return connDoc; },
    fromDoc:connFromDoc};
  // Posting reads this: true only for an account a real check found connected. Nothing here posts anything.
  const CONNECTED = Object.freeze(Object.defineProperties({}, Object.fromEntries(['youtube','linkedin','instagram','facebook','x'].map(k => [k, {enumerable:true, get:() => connGet(k).state === 'on'}]))));
  const isoDay = v => typeof v === 'string' && Boolean(day(v));
  const plus = (iso, n) => { const d = new Date(iso+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
  const dow = iso => new Date(iso+'T12:00:00Z').getUTCDay();
  const cleanDays = v => { const out = WEEK.filter(k => Array.isArray(v) && v.includes(k)); return out.length ? out : null; };
  const cleanGap = v => Number.isInteger(v) && v >= 1 && v <= 14 ? v : null;
  function normalise(raw) {
    const r = raw && typeof raw === 'object' ? raw : {}, d = POSTING_DEFAULTS;
    const platforms = {}; for (const [k] of PLATFORMS) platforms[k] = typeof r.platforms?.[k] === 'boolean' ? r.platforms[k] : d.platforms[k];
    const history = (Array.isArray(r.history) ? r.history : []).map(h => ({days:cleanDays(h?.days), gap:cleanGap(h?.gap), from:isoDay(h?.from) ? h.from : null})).filter(h => h.days && h.gap).slice(-20);
    return {days:cleanDays(r.days) || d.days.slice(), gap:cleanGap(r.gap) || d.gap, time:typeof r.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time) ? r.time : d.time,
      mode:r.mode === 'auto' ? 'auto' : 'manual', platforms, from:isoDay(r.from) ? r.from : null, history, updatedAt:typeof r.updatedAt === 'string' ? r.updatedAt : null};
  }
  // THE rule. Each recorded video posts on the next posting day that is at least `gap` days after its recording day,
  // one video per posting day, earlier recording first. A post date saved on a topic always wins and holds its day.
  // A posted video, or one whose day had already passed when the rule changed, keeps the day the earlier rule gave it.
  // Returns Map(topic id → 'YYYY-MM-DD'). Pure: dates in, dates out, no clock and no time zone.
  function postingPlan(list, settings) {
    const s = normalise(settings), out = new Map(), fixed = new Set();
    for (const t of list || []) if (isoDay(t.postDate)) { out.set(t.id, t.postDate); fixed.add(t.postDate); }
    const rest = (list || []).filter(t => !out.has(t.id) && isoDay(t.recordDate)).sort((a,b) => a.recordDate.localeCompare(b.recordDate) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || String(a.id).localeCompare(String(b.id)));
    let given = new Map();
    [...s.history, {days:s.days, gap:s.gap, from:s.from}].forEach((rule, i) => {
      const from = i ? rule.from : null, taken = new Set(fixed), next = new Map();
      for (const t of rest) { const was = given.get(t.id); if (was && i && (t.status === 'posted' || (from && was < from))) { next.set(t.id, was); taken.add(was); } }
      for (const t of rest) {
        if (next.has(t.id)) continue;
        let d = plus(t.recordDate, rule.gap); if (from && d < from) d = from;
        while (!rule.days.includes(DAY_KEYS[dow(d)]) || taken.has(d)) d = plus(d, 1);
        next.set(t.id, d); taken.add(d);
      }
      given = next;
    });
    for (const [id, d] of given) out.set(id, d);
    return out;
  }
  // The posting day a recording on `recordDate` would get if it were booked now (the booked topic's own day if one is there).
  function postingSlot(list, settings, recordDate) {
    const holder = (list || []).find(t => t.recordDate === recordDate);
    if (holder) return postingPlan(list, settings).get(holder.id);
    return postingPlan([...(list || []), {id:'\u0000slot', recordDate, postDate:null, createdAt:'￿'}], settings).get('\u0000slot');
  }
  // In words, for the Schedule heading: "Monday’s video posts that Saturday, Wednesday’s the next Tuesday, Friday’s the
  // next Thursday." Worked out on an empty week of recordings, Monday, Wednesday and Friday, so it states the rule itself;
  // bookings can move a single video (one per day).
  function postingSentence(settings) {
    const s = normalise(settings), week = RECORD_DAYS.map(k => ({id:k, recordDate:plus('2026-01-04', DAY_KEYS.indexOf(k))}));
    const p = postingPlan(week, {days:s.days, gap:s.gap});
    const mon = iso => Date.parse(plus(iso, -((dow(iso)+6) % 7)));
    const say = (rec, post) => { const name = DAY_NAMES[dow(post)], weeks = Math.round((mon(post) - mon(rec)) / 6048e5);
      return weeks === 0 ? 'that '+name : weeks === 1 ? 'the next '+name : name+' '+weeks+' weeks later'; };
    return week.map((t, i) => DAY_NAMES[dow(t.recordDate)]+'’s'+(i ? '' : ' video posts')+' '+say(t.recordDate, p.get(t.id))).join(', ')+'.';
  }
  const dayList = keys => { const n = WEEK.filter(k => keys.includes(k)).map(k => DAY_NAMES[DAY_KEYS.indexOf(k)]); return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ')+' and '+n[n.length-1]; };
  // Auto is only live once it is chosen AND a switched-on platform is connected (a real check said so) AND the automatic
  // poster exists. The poster is not built yet (plan Step 5), so posterLive is false and Auto stays an intent: the build
  // that adds the poster sets WWStore.posting.posterLive = true, and nothing else has to change.
  let posterLive = false;
  const connectedOn = s => PLATFORMS.filter(([k]) => s.platforms[k] && CONNECTED[k]);
  const autoLive = settings => { const s = normalise(settings); return posterLive && s.mode === 'auto' && connectedOn(s).length > 0; };
  function modeLine(settings) {
    const s = normalise(settings);
    return autoLive(s) ? 'Auto posting: each video goes out at '+s.time+' on its posting day.' : s.mode !== 'auto' ? 'Manual posting: you press Post on the day.'
      : connectedOn(s).length ? 'Auto posting is chosen, but the automatic poster is not running yet, so you still press Post on the day.' : 'Auto posting is chosen, but no account is connected yet, so you still press Post on the day.';
  }
  let posting = normalise(null), postingRef = null, planKey = null, planMap = null;
  const postingChanged = () => { planKey = null; window.dispatchEvent(new CustomEvent('ww:settings')); };
  const localToday = () => { const n = new Date(), p = v => String(v).padStart(2, '0'); return n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate()); };
  // Save from the Posting screen. A change to the days or the gap starts a new rule today and files the old one in history.
  function nextPosting(next, today = localToday()) {
    const n = normalise({...posting, ...next, platforms:{...posting.platforms, ...(next?.platforms || {})}}), ruleChanged = n.days.join() !== posting.days.join() || n.gap !== posting.gap;
    let from = posting.from, history = posting.history.slice();
    if (ruleChanged) { if (posting.from !== today) history.push({days:posting.days, gap:posting.gap, from:posting.from}); from = today; }
    return {days:n.days, gap:n.gap, time:n.time, mode:n.mode, platforms:n.platforms, from, history:history.slice(-20), updatedAt:new Date().toISOString()};
  }
  async function savePosting(next, today = localToday()) {
    if (!postingRef) fail('Saving needs the app’s database, which this preview does not have.', 503);
    const doc = nextPosting(next, today);
    await write(() => postingRef.set(doc));
    posting = normalise(doc); postingChanged();
    return posting;
  }
  const isRecordingDay = iso => isoDay(iso) && (iso < RECORD_FROM ? RECORD_BEFORE : RECORD_DAYS).includes(DAY_KEYS[dow(iso)]);
  // The next available recording slot (Taylor, 9 November 2026: "next available slot" never skips a free slot): the
  // first date from `fromIso` on that is a recording day and that no topic has as its recordDate. Pure: no clock.
  function nextFreeSlot(list, fromIso) {
    if (!isoDay(fromIso)) return null;
    const taken = new Set((list || []).map(t => t && t.recordDate).filter(Boolean));
    for (let d = fromIso, i = 0; i < 800; i++, d = plus(d, 1)) if (isRecordingDay(d) && !taken.has(d)) return d;
    return null;
  }
  const postingApi = {DEFAULTS:POSTING_DEFAULTS, RECORD_DAYS, isRecordingDay, nextFreeSlot, today:localToday, WEEK, DAY_KEYS, DAY_NAMES, PLATFORMS, CONNECTED, normalise, plan:postingPlan, slot:postingSlot, sentence:postingSentence, dayList, autoLive, modeLine,
    get settings() { return JSON.parse(JSON.stringify(posting)); }, get canSave() { return Boolean(postingRef); }, save:savePosting,
    // The document a save would write, for the Posting screen's preview line before anything is saved.
    draft:nextPosting,
    // What every screen calls: the posting day of each topic in `list`, under the saved settings. One plan per data load.
    dates(list) { if (planKey !== list) { planMap = postingPlan(list, posting); planKey = list; } return planMap; },
    dateFor(list, recordDate) { return postingSlot(list, posting, recordDate); },
    // Was (or is) this date a posting day under the rule in force on it? Weeks before a change keep their old posting days.
    isPostingDay(iso) { let rule = posting.history[0] || posting; for (const r of [...posting.history.slice(1), ...(posting.history.length ? [posting] : [])]) if (!r.from || r.from <= iso) rule = r; return rule.days.includes(DAY_KEYS[dow(iso)]); },
    get posterLive() { return posterLive; }, set posterLive(v) { posterLive = v === true; postingChanged(); },
    get mode() { return posting.mode; }, get effectiveMode() { return autoLive(posting) ? 'auto' : 'manual'; }};
  // Latest uploads per creator, fetched from YouTube's public channel feeds by scripts/scan-watchlist.mjs and
  // published next to the page as uploads.json (see SCAN.md). Nothing here comes from the page itself.
  async function loadUploads() {
    try { const r = await fetch('uploads.json', {cache:'no-cache'}); if (r.ok) uploads = await r.json(); } catch { uploads = null; }
  }
  const videos = () => (uploads?.docs || []).flatMap(d => (d.data.videos || []).map(v => ({id:v.id, handle:d.data.handle, creator:d.data.name, title:v.title, publishedAt:v.publishedAt, thumbnail:v.thumb, description:v.description || '', views:v.views || 0})));
  const fetchedFor = h => (uploads?.docs || []).find(d => d.data.handle === h)?.data || null;
  async function connect() {
    if (ready) return ready;
    ready = (async () => {
      await loadUploads();
      if (!window.claude || typeof window.claude.use !== 'function') return null;
      db = await window.claude.use('db');
      if (!db) return null;
      // Subscribe once; the first snapshot fills the cache, later ones carry edits from other tabs and devices.
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 8000);
        db.collection('topics').onSnapshot(snap => {
          topics = snap.docs.filter(d => d.exists).map(d => shape(d.id, d.data()));
          clearTimeout(timer); resolve();
          window.dispatchEvent(new CustomEvent('ww:store'));
        }, () => { clearTimeout(timer); resolve(); });
      });
      // Skill ideas: each run of the Trending Topics skill is one document, ideaRuns/<id> (see SKILL-IDEAS.md).
      db.collection('ideaRuns').onSnapshot(snap => {
        runs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()}));
        window.dispatchEvent(new CustomEvent('ww:store'));
      }, () => {});
      // Talking points briefs: one document per topic, briefs/<topicId>, written by the Talking points and Briefs screens and by
      // the Claude Code session that writes the brief (TALKING-POINTS.md). Read on those two screens as data.briefs.
      db.collection('briefs').onSnapshot(snap => {
        briefs = snap.docs.filter(d => d.exists).map(d => ({id:d.id, ...d.data()}));
        window.dispatchEvent(new CustomEvent('ww:store'));
      }, () => {});
      // Posting settings: one document. Read once, then followed where the database offers it (other tabs and devices).
      try {
        postingRef = db.doc('settings/posting');
        const got = await postingRef.get(); posting = normalise(got?.data?.()); postingChanged();
        if (typeof postingRef.onSnapshot === 'function') postingRef.onSnapshot(snap => { const n = normalise(snap?.data?.()); if (JSON.stringify(n) !== JSON.stringify(posting)) { posting = n; postingChanged(); } }, () => {});
      } catch { /* the defaults stand */ }
      // Connections: the document a Claude Code session writes after "Check connections". Read once, then followed.
      try {
        connRef = db.doc('connections/status');
        const got = await connRef.get(); connDoc = connFromDoc(got?.data?.()); connChanged();
        if (typeof connRef.onSnapshot === 'function') connRef.onSnapshot(snap => { const n = connFromDoc(snap?.data?.()); if (JSON.stringify(n) !== JSON.stringify(connDoc)) { connDoc = n; connChanged(); } }, () => {});
      } catch { /* nothing known: every account reads as not checked */ }
      // Private notes on creators, one document per handle.
      db.collection('creatorNotes').onSnapshot(snap => {
        notes = new Map(snap.docs.filter(d => d.exists).map(d => [d.id, String(d.data().note || '')]));
        window.dispatchEvent(new CustomEvent('ww:store'));
      }, () => {});
      return api;
    })();
    return ready;
  }
  const find = id => topics.find(t => t.id === id) || fail('That topic no longer exists.', 404);
  async function call(path, body) {
    const action = path.split('?')[0].split('/').filter(Boolean).pop() || '';
    if (body === undefined) {
      if (action === 'creator') { const h = new URLSearchParams(path.split('?')[1] || '').get('handle'); return {videos:videos().filter(v => v.handle === h)}; }
      let creators = [];
      try { creators = (await (await fetch('creators.json')).json()).creators.map(c => { const f = fetchedFor(c.handle); return {handle:c.handle, name:c.name, channelId:c.channelId || null, lastSuccess:f && !f.error ? f.fetchedAt : null, error:f?.error || null, note:notes.get(c.handle) || ''}; }); } catch { /* the list still renders empty */ }
      // configured: real uploads are on the page. canAdd stays off: finding a new channel needs the YouTube API.
      return {configured:Boolean(uploads), canAdd:false, store:'claude', fetchedAt:uploads?.fetchedAt || null, creators, videos:videos(), topics:sorted(), ideaRuns:db ? runs.slice().sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 6) : null, briefs:db ? briefs.slice() : null};
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) fail('A JSON object is required.');
    const now = new Date().toISOString();
    if (action === 'topic') {
      // Spark a topic from a fetched upload: a new topic titled after the video, or the video added to an existing topic.
      if (body.videoId !== undefined) {
        const v = videos().find(x => x.id === body.videoId);
        if (!v) fail('That video is not in the fetched uploads. Refresh the watchlist and try again.', 404);
        const source = {id:v.id, title:v.title, creator:v.creator, handle:v.handle, publishedAt:v.publishedAt, thumbnail:v.thumbnail};
        if (body.topicId) {
          const t = find(text(body.topicId, 64));
          if (!t.sources.some(s => s.id === v.id)) await write(() => ref(t.id).update({sources:[...t.sources, source], updatedAt:now}));
          return {id:t.id, added:true};
        }
        const id = crypto.randomUUID(), title = (text(body.title, 200) || v.title).trim().slice(0, 200);
        // Add to schedule (Taylor, 11 November 2026): the topic is made already booked, in one write, on the slot given.
        let recordDate = null, status = 'new';
        if (body.recordDate !== undefined && body.recordDate !== null) {
          if (!day(body.recordDate) || !isRecordingDay(body.recordDate)) fail('Recording days are Monday, Wednesday and Friday.');
          const holder = topics.find(x => x.recordDate === body.recordDate);
          if (holder) fail('“'+holder.title+'” is already booked for that day.', 409, {conflict:{id:holder.id, title:holder.title}});
          recordDate = body.recordDate; status = 'planned';
        }
        if (body.status !== undefined) { if (!STATUSES.includes(body.status)) fail('Choose a valid status.'); status = body.status; }
        await write(() => ref(id).set({title, status, notes:'', recordDate, postDate:null, deckId:null, createdAt:now, updatedAt:now, sources:[source], points:[]}));
        return {id, created:true, recordDate};
      }
      const title = text(body.title, 200);
      if (!title || !title.trim()) fail('Give the topic a title.');
      const id = crypto.randomUUID();
      await write(() => ref(id).set({title:title.trim(), status:'new', notes:'', recordDate:null, postDate:null, deckId:null, createdAt:now, updatedAt:now, sources:[], points:[]}));
      return {id, created:true};
    }
    if (action === 'topic-update') {
      const t = find(text(body.id, 64));
      const patch = {};
      if (body.title !== undefined) { const v = text(body.title, 200); if (!v || !v.trim()) fail('Give the topic a title of up to 200 characters.'); patch.title = v.trim(); }
      if (body.notes !== undefined) { const v = text(body.notes, 8000); if (v === null) fail('Notes can be up to 8,000 characters.'); patch.notes = v; }
      if (body.status !== undefined) { if (!STATUSES.includes(body.status)) fail('Choose a valid status.'); patch.status = body.status; }
      if (body.postDate !== undefined) { if (body.postDate !== null && !day(body.postDate)) fail('Choose a valid post date.'); patch.postDate = body.postDate; }
      if (body.deckId !== undefined) { if (body.deckId !== null && !(typeof body.deckId === 'string' && /^[a-z0-9-]{1,80}$/.test(body.deckId))) fail('Choose a presentation.'); patch.deckId = body.deckId; }
      // Who the video is for (Taylor's decision 7, 4 November 2026): A wants AI built, B buys paid ads; null clears it.
      if (body.buyer !== undefined) { if (body.buyer !== null && body.buyer !== 'A' && body.buyer !== 'B') fail('Choose who the video is for: A or B.'); patch.buyer = body.buyer; }
      if (body.recordDate !== undefined) {
        if (body.recordDate !== null) { const d = day(body.recordDate); if (!d || !isRecordingDay(body.recordDate)) fail('Recording days are Monday, Wednesday and Friday.'); }
        const holder = body.recordDate === null ? null : topics.find(x => x.recordDate === body.recordDate && x.id !== t.id);
        if (holder && body.swap !== true) fail('“'+holder.title+'” is already booked for that day.', 409, {conflict:{id:holder.id, title:holder.title}});
        if (holder) {
          // One topic per recording day: free the slot, book this topic, then give the other topic this one's old day.
          await write(() => ref(holder.id).update({recordDate:null, updatedAt:now}));
          await write(() => ref(t.id).update({...patch, recordDate:body.recordDate, updatedAt:now}));
          await write(() => ref(holder.id).update({recordDate:t.recordDate, updatedAt:now}));
          return {updated:true, swapped:holder.id};
        }
        patch.recordDate = body.recordDate;
      }
      if (!Object.keys(patch).length) fail('Nothing to change.');
      await write(() => ref(t.id).update({...patch, updatedAt:now}));
      return {updated:true};
    }
    if (action === 'topic-source-remove') {
      const t = find(text(body.topicId, 64));
      await write(() => ref(t.id).update({sources:t.sources.filter(s => s.id !== body.videoId), updatedAt:now}));
      return {removed:true};
    }
    if (action === 'creator-note') {
      const handle = text(body.handle, 240), note = text(body.note, 4000);
      if (!handle || !/^@[A-Za-z0-9._-]{1,100}$/.test(handle) || note === null) fail('Notes can be up to 4,000 characters.');
      await write(() => db.collection('creatorNotes').doc(handle).set({note, updatedAt:now}));
      return {saved:true};
    }
    if (action === 'topic-delete') { const t = find(text(body.id, 64)); await write(() => ref(t.id).delete()); return {deleted:true}; }
    const owner = id => topics.find(t => t.points.some(p => p.id === id)) || fail('That subtopic no longer exists.', 404);
    const savePoints = (t, points) => write(() => ref(t.id).update({points:points.map((p, i) => ({...p, position:i})), updatedAt:now}));
    if (action === 'point-add') {
      const t = find(text(body.topicId, 64)), title = text(body.title, 200), note = body.note === undefined ? '' : text(body.note, 4000);
      if (!title || !title.trim() || note === null) fail('Give the subtopic a title of up to 200 characters.');
      const id = crypto.randomUUID();
      await savePoints(t, [...t.points, {id, title:title.trim(), note, done:false}]);
      return {id, created:true};
    }
    if (action === 'point-update') {
      const t = owner(body.id), patch = {};
      if (body.title !== undefined) { const v = text(body.title, 200); if (!v || !v.trim()) fail('Give the subtopic a title of up to 200 characters.'); patch.title = v.trim(); }
      if (body.note !== undefined) { const v = text(body.note, 4000); if (v === null) fail('Notes can be up to 4,000 characters.'); patch.note = v; }
      if (body.done !== undefined) { if (typeof body.done !== 'boolean') fail('Choose done or not done.'); patch.done = body.done; }
      if (!Object.keys(patch).length) fail('Nothing to change.');
      await savePoints(t, t.points.map(p => p.id === body.id ? {...p, ...patch} : p));
      return {updated:true};
    }
    if (action === 'point-delete') { const t = owner(body.id); await savePoints(t, t.points.filter(p => p.id !== body.id)); return {deleted:true}; }
    if (action === 'point-move') {
      const t = owner(body.id), i = t.points.findIndex(p => p.id === body.id), j = i + Number(body.direction);
      if (![-1,1].includes(Number(body.direction))) fail('Choose a subtopic and a direction.');
      if (j < 0 || j >= t.points.length) return {moved:false};
      const points = t.points.slice(); [points[i], points[j]] = [points[j], points[i]];
      await savePoints(t, points); return {moved:true};
    }
    if (action === 'refresh') return startScan(body.handles);
    if (action === 'idea-run') {
      // Like a refresh, the run is a job for a Claude Code session: the skill reads sessions, repositories and skills.
      if (!db) fail('Skill ideas need the app’s database, which this preview does not have.', 503);
      const id = now.slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7);
      await write(() => db.collection('ideaRuns').doc(id).set({status:'requested', skill:'trending-topics-talking-points', mix:'five-and-five', count:10, createdAt:now, ideas:[], added:{}}));
      return {id, ...await startJob('ideaRuns', id, 'Topic ideas '+id, 'Run topic ideas '+id, 'SKILL-IDEAS.md')};
    }
    if (action === 'idea-start') {
      // Try again on a run whose session could not start: the same run, a new session.
      if (!db) fail('Skill ideas need the app’s database, which this preview does not have.', 503);
      const run = runs.find(r => r.id === body.id) || fail('That run of the skill is no longer here.', 404);
      return {id:run.id, ...await startJob('ideaRuns', run.id, 'Topic ideas '+run.id, 'Run topic ideas '+run.id, 'SKILL-IDEAS.md')};
    }
    if (action === 'idea-add') {
      // Shortlist and lock (Taylor's pick, 2 November): the title goes on the Shortlist word for word, and the next
      // Claude run locks it in the skill's topic register (skillLock pending → locked).
      const run = runs.find(r => r.id === body.runId) || fail('That run of the skill is no longer here.', 404);
      const idea = (run.ideas || []).find(i => i.id === body.ideaId) || fail('That idea is no longer in the run.', 404);
      const already = (run.added || {})[idea.id];
      if (already && topics.some(t => t.id === already)) return {id:already, added:false};
      const id = crypto.randomUUID(), title = String(idea.title || '').trim().slice(0, 200);
      if (!title) fail('That idea has no title.');
      const origin = {kind:'skill', skill:run.skill || 'trending-topics', runId:run.id, ideaId:idea.id, source:idea.source === 'creator' ? 'creator' : 'own', why:String(idea.why || '').slice(0, 400)};
      await write(() => ref(id).set({title, status:'shortlisted', notes:'', recordDate:null, postDate:null, deckId:null, createdAt:now, updatedAt:now, sources:[], points:[], origin, skillLock:'pending'}));
      await write(() => db.collection('ideaRuns').doc(run.id).update({added:{...(run.added || {}), [idea.id]:id}}));
      return {id, created:true};
    }
    fail('Adding a creator needs the YouTube API, which this page does not have. Ask Claude to add the channel to creators.json.', 503);
  }
  // Starting a Claude Code session in the cloud through the viewer's Claude Code Remote connector (the app declares
  // `mcp` with create_session), the same call Publish makes. Resolves {id, url}; rejects with an Error whose `code`
  // is the connector's ('not_granted', 'unavailable', ...) and whose message says it in plain words.
  const SESSION_ENV = 'env_017PLHsTGZVgThRnUnu1eoGG', SESSION_REPO = 'https://github.com/taylor585/Whiteboard-Wednesdays';
  function sessionError(e) {
    const code = e?.code || 'error';
    const why = code === 'not_granted' ? 'You did not allow the Claude Code connection, so it could not start by itself.'
      : code === 'unavailable' ? 'The Claude Code connection is not available in this view.' : 'Claude Code could not be started ('+(e?.code || e?.message || 'error')+').';
    return Object.assign(new Error(why), {code});
  }
  async function startSession({title, prompt}) {
    let mcp = null;
    try { mcp = await window.claude?.use?.('mcp'); } catch (e) { throw sessionError(e); }
    if (!mcp || typeof mcp.callTool !== 'function') throw sessionError({code:'unavailable'});
    let r;
    try { r = await createSession(mcp, {model:'claude-opus-5-5', permission_mode:'auto', environment_id:SESSION_ENV, source_url:SESSION_REPO, title:String(title).slice(0, 200), prompt}); }
    catch (e) { throw sessionError(e); }
    const p = r?.payload || {}, sid = p.ccr?.id || p.session_id || p.id || p.session?.id || null;
    return {id:sid, url:sid ? 'https://claude.ai/code/'+sid : null};
  }
  // A job document (scans/<id>, ideaRuns/<id>) gets its session: {status:'starting', session} once the session has
  // really started, or {status:'waiting', note} with the line to send in a Claude chat when it could not start.
  // The session itself sets 'running' when it begins; a start record never overwrites a status the session wrote.
  async function startJob(col, id, title, line, doc) {
    const ref = db.collection(col).doc(id);
    try {
      const session = await startSession({title, prompt:line+'. Follow '+doc+' in this repository exactly.'});
      const stamp = {...session, startedAt:new Date().toISOString()};
      let status = null;
      try { status = (await ref.get())?.data?.()?.status || null; } catch { /* write the start record anyway */ }
      await write(() => ref.update(['running','done','failed'].includes(status) ? {session:stamp} : {status:'starting', session:stamp, note:null}));
      return {started:true, session:stamp, line};
    } catch (e) {
      if (e?.status) throw e;
      const why = e?.message || 'Claude Code could not be started.';
      await write(() => ref.update({status:'waiting', note:why}));
      return {started:false, why, line, message:why+' To run it now, send “'+line+'” in a Claude chat.'};
    }
  }
  // A refresh is a job for a Claude Code session: the page cannot read YouTube itself. The request is saved as
  // scans/<id> and the session starts at once (SCAN.md); the page follows scans/<id> and reloads uploads.json on done.
  async function startScan(handles) {
    if (!db) fail('Refreshing needs the app’s database, which this preview does not have.', 503);
    const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), now = new Date().toISOString();
    const want = Array.isArray(handles) && handles.length ? handles.filter(h => typeof h === 'string').slice(0, 60) : null;
    await write(() => db.collection('scans').doc(id).set({status:'queued', handles:want, createdAt:now}));
    return {queued:true, id, ...await startJob('scans', id, 'Watchlist scan '+id, 'Run watchlist scan '+id, 'SCAN.md')};
  }
  // Follow one document (a scan) until the caller stops. Returns the unsubscribe, or null without a database.
  function watchDoc(col, id, next) {
    if (!db) return null;
    try { return db.collection(col).doc(id).onSnapshot(snap => next(snap?.exists === false ? null : snap?.data?.() || null), () => {}); } catch { return null; }
  }
  // uploads.json again, past any cache, after a scan has published a new copy.
  async function freshUploads() {
    try { const r = await fetch('uploads.json?v='+Date.now(), {cache:'no-store'}); if (r.ok) { uploads = await r.json(); return true; } } catch { /* try the plain path */ }
    await loadUploads(); return false;
  }
  const api = {call, get topics() { return sorted(); }, watchDoc, reloadUploads: async ({fresh} = {}) => { if (fresh) await freshUploads(); else await loadUploads(); window.dispatchEvent(new CustomEvent('ww:store')); }};
  // Settings and Publish keep their own documents in the same database.
  // Sessions the app starts ask for Auto, so their database saves never wait on a permission prompt (12 November 2026).
  // If the connector refuses Auto, the same session is started again without it rather than not at all.
  async function createSession(mcp, args) {
    const call = a => mcp.callTool('Claude Code Remote', 'create_session', a);
    const refused = x => /permission_mode|auto mode/i.test(typeof x === 'string' ? x : (() => { try { return JSON.stringify(x) || ''; } catch { return ''; } })());
    const plain = () => { const {permission_mode, ...rest} = args; return call(rest); };
    if (!args.permission_mode) return call(args);
    let r;
    // Any failure with Auto requested is retried once without it: a start from the page itself can be refused Auto
    // (seen 12 November 2026 as upstream_error), and a session that starts is better than none.
    try { r = await call(args); } catch (e) { void refused; return plain(); }
    if (r && (r.isError || r.error)) return plain();
    return r;
  }
  window.WWStore = {connect, db: () => db, posting:postingApi, connections:connectionsApi, startSession, createSession};
})();
