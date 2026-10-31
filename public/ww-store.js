/* Claude storage for topics. When the app runs as a Claude artifact there is no server, so topics,
   subtopics and their links to presentations are kept in the artifact's own database (the `db`
   capability) instead. Every action mirrors app/api/ideas so the screens behave the same in both places. */
(() => {
  'use strict';
  const STATUSES = ['new','shortlisted','planned','slides_ready','recorded','edited','posted'];
  let db = null, topics = [], notes = new Map(), ready = null, uploads = null;
  const fail = (error, status=400, extra={}) => { const e = new Error(error); e.status = status; e.result = {error, ...extra}; throw e; };
  const text = (v, max) => typeof v === 'string' && v.length <= max ? v : null;
  function day(v) { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null; const d = new Date(v+'T12:00:00Z'); return Number.isNaN(d.getTime()) || d.toISOString().slice(0,10) !== v ? null : d; }
  const shape = (id, t) => ({id, title:t.title || '', status:t.status || 'new', notes:t.notes || '', recordDate:t.recordDate || null, postDate:t.postDate || null, deckId:t.deckId || null,
    createdAt:t.createdAt || '', updatedAt:t.updatedAt || '', sources:Array.isArray(t.sources) ? t.sources : [], points:(Array.isArray(t.points) ? t.points : []).slice().sort((a,b) => a.position - b.position)});
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
      return {configured:Boolean(uploads), canAdd:false, store:'claude', fetchedAt:uploads?.fetchedAt || null, creators, videos:videos(), topics:sorted()};
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
        await write(() => ref(id).set({title, status:'new', notes:'', recordDate:null, postDate:null, deckId:null, createdAt:now, updatedAt:now, sources:[source], points:[]}));
        return {id, created:true};
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
      if (body.recordDate !== undefined) {
        if (body.recordDate !== null) { const d = day(body.recordDate); if (!d || ![3,5].includes(d.getUTCDay())) fail('Recording days are Wednesday and Friday.'); }
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
    fail('Adding a creator needs the YouTube API, which this page does not have. Ask Claude to add the channel to creators.json.', 503);
  }
  // A refresh is a job for a Claude Code session: the page cannot read YouTube itself. The request is saved as
  // scans/<id>; the page then tries to start the session through the viewer's Claude Code Remote connector, and
  // says plainly when it cannot, so the request can be run from a Claude chat instead.
  async function startScan(handles) {
    if (!db) fail('Refreshing needs the app’s database, which this preview does not have.', 503);
    const id = new Date().toISOString().slice(0, 10)+'-'+Math.random().toString(36).slice(2, 7), now = new Date().toISOString();
    const want = Array.isArray(handles) && handles.length ? handles.filter(h => typeof h === 'string').slice(0, 60) : null;
    await write(() => db.collection('scans').doc(id).set({status:'queued', handles:want, createdAt:now}));
    // Starting the session from the page needs the connector permission, which froze the Claude desktop app
    // (31 October: its local connectors tried to start and one failed), so the page only queues the request.
    const started = false, why = 'The fetch runs from a Claude chat.', sessionId = null;
    await write(() => db.collection('scans').doc(id).update(started ? {status:'started', sessionId, startedAt:new Date().toISOString()} : {status:'waiting', note:why}));
    return {queued:true, id, started, why, message:started ? 'A Claude Code session is fetching the latest uploads. They appear here when it publishes, usually within a few minutes.' : why+' To run it now, tell Claude: “Run watchlist scan '+id+'”.'};
  }
  const api = {call, get topics() { return sorted(); }, reloadUploads: async () => { await loadUploads(); window.dispatchEvent(new CustomEvent('ww:store')); }};
  // Settings and Publish keep their own documents in the same database.
  window.WWStore = {connect, db: () => db};
})();
