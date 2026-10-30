/* Creator watchlist: the upload inbox (Taylor's pick W2-B, 26 October 2026).
   New uploads are grouped by week. Each one is sparked into Topics or marked seen; seen marks are a
   per-browser convenience kept in localStorage. Creators are listed by name and open their own page. */
(() => {
  'use strict';
  const root = document.querySelector('#video-ideas');
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = {creators:[], videos:[], topics:[], configured:false, ready:false}, busy = false, candidate = null, who = null, saving = null;
  const date = value => new Intl.DateTimeFormat('en-GB', {weekday:'short',day:'numeric',month:'short'}).format(new Date(value));
  const short = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short'}).format(new Date(value));
  const DAY = 86400000, WINDOW = 30;
  // Inside a Claude artifact there is no server, so topics are kept in the page's own database (ww-store.js).
  let store = null;
  async function api(path, body) {
    if (store) return store.call(path, body);
    const response = await fetch('/api/ideas' + path, body === undefined ? {cache:'no-store'} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The YouTube connection is not configured yet. Your creator list is ready.');
    const result = await response.json();
    if (!response.ok) { const error = new Error(result.error || 'The request could not be completed. Please try again.'); error.status = response.status; error.result = result; throw error; }
    return result;
  }
  function announce(message) { $('#ideas-status').textContent = message; }
  // Seen marks live only in this browser. Storage can be unavailable, so every access is guarded.
  const seen = new Set((() => { try { return JSON.parse(localStorage.getItem('ww-seen') || '[]'); } catch { return []; } })());
  function keepSeen() { try { localStorage.setItem('ww-seen', JSON.stringify([...seen].slice(-800))); } catch { /* seen marks just will not persist */ } }
  // Thumbnails: the stored image first, then YouTube's always-16:9 medium size, then a plain initial.
  // A 16:9 frame with object-fit:cover crops the black bars that YouTube bakes into 4:3 sizes.
  const safeThumb = url => /^https:\/\/i[0-9]?\.ytimg\.com\//.test(url || '') ? url : '';
  function thumb(v, name) {
    const first = safeThumb(v.thumbnail), fallback = /^[A-Za-z0-9_-]{6,20}$/.test(v.id) ? 'https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg' : '';
    const src = first || fallback;
    const initial = '<span class="vi-thumb-empty" aria-hidden="true">'+esc((name || '?').trim().charAt(0).toUpperCase())+'</span>';
    return '<a class="vi-thumb" data-own-fallback data-name="'+esc(name || '?')+'" href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">'+(src ? '<img src="'+esc(src)+'"'+(first && fallback && first !== fallback ? ' data-fallback="'+esc(fallback)+'"' : '')+' width="320" height="180" loading="lazy" alt="">' : initial)+'</a>';
  }
  // YouTube answers a missing video with a 120×90 grey stand-in rather than an error, so treat that as missing too.
  // Listening on the document covers thumbnails on the creator page and in Topics as well.
  document.addEventListener('load', event => { const img = event.target; if (img instanceof HTMLImageElement && img.closest('.vi-thumb') && img.naturalWidth <= 120) img.dispatchEvent(new Event('error')); }, true);
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.closest('.vi-thumb')) return;
    if (img.dataset.fallback) { const next = img.dataset.fallback; delete img.dataset.fallback; img.src = next; return; }
    const name = img.closest('.vi-thumb').dataset.name || '?';
    img.replaceWith(Object.assign(document.createElement('span'), {className:'vi-thumb-empty', textContent:name.trim().charAt(0).toUpperCase()}));
  }, true);
  const topicsFor = id => (data.topics || []).filter(t => t.sources.some(s => s.id === id));
  const recent = () => data.videos.filter(v => { const t = Date.parse(v.publishedAt); return t >= Date.now() - WINDOW*DAY && t <= Date.now(); });
  const unread = list => list.filter(v => !seen.has(v.id) && !topicsFor(v.id).length);
  // Shared by the creator page and Topics: one spark makes a new topic with the video as its source.
  async function spark(id) {
    if (!data.ready) { announce('Topics need the app’s saved data, which is not available here.'); return false; }
    try { await api('/topic', {videoId:id}); seen.add(id); keepSeen(); await load(); announce('Sparked into Topics. It waits on the shortlist.'); return true; }
    catch (error) { announce(error.message); return false; }
  }
  // Avatar shelf, design WL-B (Taylor, 30 October 2026): creators with new uploads first, a yellow count, and a grid of everyone behind "All".
  const initials = name => name.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const SHELF = 9;
  function whoList() {
    const counts = new Map();
    for (const v of unread(recent())) counts.set(v.handle, (counts.get(v.handle) || 0) + 1);
    const all = unread(recent()).length;
    const order = [...data.creators].sort((a, b) => (counts.get(b.handle) || 0) - (counts.get(a.handle) || 0));
    const shown = order.slice(0, SHELF);
    if (who && !shown.some(c => c.handle === who)) { const c = order.find(x => x.handle === who); if (c) shown[SHELF - 1] = c; }
    const av = c => '<button type="button" class="vi-av'+(counts.get(c.handle) ? '' : ' is-quiet')+'" data-who="'+esc(c.handle)+'" aria-pressed="'+(who === c.handle)+'"><span class="vi-mono" aria-hidden="true">'+esc(initials(c.name))+'</span>'+(counts.get(c.handle) ? '<b>'+counts.get(c.handle)+'<span class="vi-sr"> new</span></b>' : '')+'<span class="vi-av-name">'+esc(c.name)+'</span></button>';
    $('#ideas-who').innerHTML = '<button type="button" class="vi-av is-all" data-who="" aria-pressed="'+!who+'"><span class="vi-mono" aria-hidden="true">ALL</span>'+(all ? '<b>'+all+'<span class="vi-sr"> new</span></b>' : '')+'<span class="vi-av-name">Everyone</span></button>'+shown.map(av).join('')+
      (data.creators.length > SHELF ? '<button type="button" class="vi-av is-more" data-more aria-expanded="'+!$('#ideas-grid').hidden+'" aria-controls="ideas-grid"><span class="vi-mono" aria-hidden="true">+'+(data.creators.length - SHELF)+'</span><span class="vi-av-name">All '+data.creators.length+'</span></button>' : '');
    $('#ideas-grid').innerHTML = [...data.creators].sort((a, b) => a.name.localeCompare(b.name)).map(c => '<button type="button" data-who="'+esc(c.handle)+'" aria-pressed="'+(who === c.handle)+'"><span class="vi-mono" aria-hidden="true">'+esc(initials(c.name))+'</span><span>'+esc(c.name)+'</span>'+(counts.get(c.handle) ? '<b>'+counts.get(c.handle)+'</b>' : '')+'</button>').join('');
  }
  // Command strip, design W3-A: the connection as a status light beside the search and the three actions.
  function connection() {
    const last = data.creators.map(c => c.lastSuccess).filter(Boolean).sort().pop();
    $('#ideas-conn').innerHTML = data.configured
      ? '<i class="vi-lamp is-on" aria-hidden="true"></i><span><b>YouTube connected</b><span>'+(busy ? 'Checking creators…' : last ? 'Checked '+date(last) : 'Not checked yet')+' · '+data.creators.length+' creators</span></span>'
      : '<i class="vi-lamp" aria-hidden="true"></i><span><b>Not connected</b><span>Uploads need the YouTube connection</span></span>';
  }
  function item(v) {
    const linked = topicsFor(v.id), isNew = !seen.has(v.id) && !linked.length, url = 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id);
    const creator = data.creators.find(c => c.handle === v.handle);
    return '<article class="vi-mail'+(isNew ? '' : ' is-read')+(linked.length ? ' is-sparked' : '')+'" data-video="'+esc(v.id)+'"><span class="vi-dot" '+(isNew ? 'role="img" aria-label="New"' : 'aria-hidden="true"')+'></span>'+thumb(v, v.creator)+
      '<div class="vi-mail-body"><a class="vi-chip" href="#/creator/'+encodeURIComponent(v.handle)+'">'+esc(creator?.name || v.creator)+'</a><h4><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h4><span class="vi-mail-meta"><time datetime="'+esc(v.publishedAt)+'">'+date(v.publishedAt)+'</time></span></div>'+
      '<div class="vi-mail-actions">'+(linked.length ? '<a class="vi-in" href="#/topics">In Topics ✓</a>' : '<button type="button" class="vi-dark" data-spark="'+esc(v.id)+'">Spark a topic</button>')+
      '<button type="button" class="vi-link" data-topic="'+esc(v.id)+'">Add to a topic</button>'+(isNew ? '<button type="button" class="vi-link" data-seen="'+esc(v.id)+'">Seen</button>' : '')+'</div></article>';
  }
  function feed() {
    const query = $('#ideas-search').value.trim().toLocaleLowerCase();
    const list = recent().filter(v => (!who || v.handle === who) && v.title.toLocaleLowerCase().includes(query)).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const creator = who && data.creators.find(c => c.handle === who);
    let head = creator ? '<div class="vi-feed-head"><h2>'+esc(creator.name)+'</h2><a href="#/creator/'+encodeURIComponent(creator.handle)+'">Open '+esc(creator.name)+'’s page →</a></div>' : '';
    if (!list.length) {
      const message = !data.configured && !data.videos.length
        ? '<h2>Uploads arrive here once YouTube is connected.</h2><p>Live retrieval still needs Google API approval and its key. Your '+data.creators.length+' creators are listed by name; open any of them to see their page and your notes.</p>'
        : query ? '<h2>No headlines match.</h2><p>Try another search or choose all creators.</p>'
        : '<h2>No uploads in the last '+WINDOW+' days.</h2><p>Refresh uploads to check again.</p>';
      $('#ideas-feed').innerHTML = head+'<div class="vi-empty">'+message+'</div>'; return;
    }
    const groups = [['This week', 0, 7], ['Last week', 7, 14], ['Earlier this month', 14, WINDOW]];
    $('#ideas-feed').innerHTML = head+groups.map(([label, from, to]) => {
      const part = list.filter(v => { const age = (Date.now() - Date.parse(v.publishedAt)) / DAY; return age >= from && age < to; });
      return part.length ? '<div class="vi-group"><h3 class="micro">'+label+'</h3>'+part.map(item).join('')+'</div>' : '';
    }).join('');
  }
  function tray() {
    const waiting = (data.topics || []).filter(t => t.sources.length && !t.recordDate && ['new','shortlisted'].includes(t.status));
    $('#ideas-tray').innerHTML = '<h2 class="micro" id="ideas-tray-h">TOPICS TRAY</h2><p>Sparked videos wait on the Topics shortlist for Monday’s planning.</p>'+(waiting.length ? '<ol>'+waiting.slice(0, 8).map(t => '<li>'+esc(t.title)+'</li>').join('')+'</ol>' : '<p class="vi-tray-empty">Nothing sparked yet.</p>')+'<a class="vi-tray-go" href="#/topics">Open Topics →</a>';
  }
  function render() {
    const fresh = unread(recent()).length;
    $('#ideas-heading').textContent = fresh ? fresh+' new since you last looked' : 'Creator watchlist';
    $('#ideas-refresh').disabled = busy || !data.configured;
    $('#ideas-add').disabled = !data.configured;
    $('#ideas-seen').disabled = !fresh;
    $('#ideas-seen-label').textContent = fresh ? 'Mark '+fresh+' seen' : 'Mark all seen';
    const failed = data.creators.filter(c => c.error);
    $('#ideas-warning').hidden = !failed.length;
    $('#ideas-warning').textContent = failed.length + ' creator refresh'+(failed.length===1?'':'es')+' failed. Previously loaded videos remain visible. Retry refresh to check for missing uploads.';
    connection(); whoList(); feed(); tray();
  }
  function emit() { window.dispatchEvent(new CustomEvent('ww:data', {detail:data})); }
  async function load(auto=false) {
    try { data = {...await api(''), ready:true}; data.topics ||= []; render(); emit(); announce(data.configured ? 'Watchlist loaded. Refresh to check for new uploads.' : 'The YouTube connection is not switched on yet.'); if(auto && location.hash.startsWith('#/watchlist') && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) await refresh(); }
    catch (error) {
      try { const response = await fetch('creators.json'); const seed = await response.json(); data.creators = seed.creators; } catch { /* Keep the readable connection error. */ }
      if (!store && window.WWStore) { store = await window.WWStore.connect().catch(() => null); if (store) return load(auto); }
      data.ready = false; render(); emit(); announce(error.message);
    }
  }
  async function refresh() {
    if (busy || !data.configured) return;
    busy = true; render(); let successes=0, failures=0;
    for (const [index,c] of data.creators.entries()) {
      announce('Checking '+c.name+' · '+(index+1)+' of '+data.creators.length);
      try { await api('/refresh',{handle:c.handle}); successes++; }
      catch { failures++; }
    }
    busy=false; await load(); announce('Refresh finished: '+successes+' creators updated'+(failures?', '+failures+' could not be refreshed.':'.')); render();
  }
  function choose(handle) {
    who = handle || null; render();
    history.replaceState(null, '', who ? '#/watchlist/creator/'+encodeURIComponent(who) : '#/watchlist');
  }
  $('#ideas-refresh').addEventListener('click', refresh);
  $('#ideas-search').addEventListener('input', () => feed());
  $('#ideas-seen').addEventListener('click', () => { for (const v of recent()) seen.add(v.id); keepSeen(); render(); announce('All caught up.'); });
  root.addEventListener('click', async event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.dataset.more !== undefined) { const g = $('#ideas-grid'); g.hidden = !g.hidden; b.setAttribute('aria-expanded', String(!g.hidden)); return; }
    if (b.dataset.who !== undefined) { const fromGrid = !!b.closest('#ideas-grid'); if (fromGrid) $('#ideas-grid').hidden = true; choose(b.dataset.who); $('#ideas-who [data-who="'+CSS.escape(b.dataset.who)+'"]')?.focus(); return; }
    if (b.dataset.seen) { seen.add(b.dataset.seen); keepSeen(); render(); return; }
    if (b.dataset.spark) { b.disabled = true; b.textContent = 'Sparking…'; if (!await spark(b.dataset.spark)) { b.disabled = false; b.textContent = 'Spark a topic'; } return; }
    if (b.dataset.topic) openTopicDialog(b.dataset.topic);
  });
  // Add to a topic: a new topic, or add the video as another source for an existing one.
  const topicDialog = document.querySelector('#topic-dialog'), topicForm = document.querySelector('#topic-form'), existing = document.querySelector('#topic-existing'), topicStatus = document.querySelector('#topic-dialog-status');
  function openTopicDialog(id) {
    if (!data.ready) { announce('Topics need the app’s saved data, which is not available here.'); return; }
    const video = data.videos.find(v => v.id === id); if (!video) return;
    saving = video;
    document.querySelector('#topic-dialog-video').textContent = video.title+' · '+video.creator;
    const open = data.topics.filter(t => t.status !== 'posted');
    existing.innerHTML = open.length ? open.map(t => '<option value="'+esc(t.id)+'">'+esc(t.title)+(t.recordDate ? ' · '+short(t.recordDate+'T12:00:00Z') : '')+'</option>').join('') : '<option value="">No open topics yet</option>';
    topicForm.elements['topic-dest'].value = 'new'; existing.disabled = true;
    topicForm.querySelector('[value=existing]').disabled = !open.length;
    topicStatus.textContent = ''; topicDialog.showModal();
  }
  topicForm.addEventListener('change', () => { existing.disabled = topicForm.elements['topic-dest'].value !== 'existing'; });
  document.querySelector('#topic-dialog-close').addEventListener('click', () => topicDialog.close());
  topicForm.addEventListener('submit', async event => {
    event.preventDefault(); if (!saving) return;
    const button = topicForm.querySelector('[type=submit]'), toExisting = topicForm.elements['topic-dest'].value === 'existing';
    button.disabled = true; topicStatus.textContent = 'Saving…';
    try {
      await api('/topic', toExisting ? {videoId:saving.id, topicId:existing.value} : {videoId:saving.id});
      seen.add(saving.id); keepSeen();
      topicDialog.close(); await load(); announce(toExisting ? 'Added to the topic as another source.' : 'Saved as a new topic. Find it on the Topics shortlist.');
    } catch (error) { topicStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  const dialog=document.querySelector('#creator-dialog'), form=document.querySelector('#creator-form'), handle=document.querySelector('#creator-handle'), status=document.querySelector('#creator-status'), confirm=document.querySelector('#creator-confirm');
  $('#ideas-add').addEventListener('click',()=>{candidate=null;confirm.hidden=true;status.textContent='';dialog.showModal();handle.focus();});
  document.querySelector('#creator-close').addEventListener('click',()=>dialog.close());
  handle.addEventListener('input',()=>{candidate=null;confirm.hidden=true;status.textContent='';});
  form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Looking up this creator…';try{candidate=await api('/resolve',{handle:handle.value});status.textContent=candidate.name+' · '+candidate.handle;confirm.hidden=false;}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
  confirm.addEventListener('click',async()=>{if(!candidate)return;confirm.disabled=true;try{await api('/creators',{handle:candidate.handle});dialog.close();await load();announce(candidate.name+' added. Refresh to load their uploads.');}catch(error){status.textContent=error.message;}finally{confirm.disabled=false;}});
  window.addEventListener('ww:route', event => {
    const bits = event.detail;
    if (bits[0] !== 'watchlist') return;
    who = bits[1] === 'creator' && bits[2] ? bits[2] : null; render();
    if (data.ready && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) refresh();
  });
  window.addEventListener('ww:store', () => { if (store) load(); });
  // An in-page confirmation, because a Claude artifact cannot show the browser's own confirm box.
  function ask(message, yes='Confirm') {
    const dialog = document.querySelector('#ww-confirm');
    return new Promise(resolve => {
      dialog.querySelector('#ww-confirm-text').textContent = message;
      dialog.querySelector('#ww-confirm-yes').textContent = yes;
      const back = document.activeElement;
      const done = value => { dialog.onclose = null; if (dialog.open) dialog.close(); back?.focus?.(); resolve(value); };
      dialog.querySelector('#ww-confirm-yes').onclick = () => done(true);
      dialog.querySelector('#ww-confirm-no').onclick = () => done(false);
      dialog.onclose = () => done(false);
      dialog.showModal();
    });
  }
  // Shared with Topics, Schedule and the creator page so every screen uses one data load and one request helper.
  window.WWIdeas = {api, esc, ask, thumb, spark, topicsFor, get data() { return data; }, reload: () => load(), openTopicDialog};
  load(location.hash.startsWith('#/watchlist') || location.hash.startsWith('#/video-ideas'));
})();
