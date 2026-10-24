(() => {
  'use strict';
  const root = document.querySelector('#video-ideas');
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = {creators:[], videos:[], topics:[], configured:false, ready:false}, days = 30, busy = false, candidate = null, open = null, saving = null;
  const details = new Map(), loadingDetails = new Set();
  const date = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric'}).format(new Date(value));
  const short = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short'}).format(new Date(value));
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
  // Thumbnails: the stored image first, then YouTube's always-16:9 medium size, then a plain initial.
  // A 16:9 frame with object-fit:cover crops the black bars that YouTube bakes into 4:3 sizes.
  const safeThumb = url => /^https:\/\/i[0-9]?\.ytimg\.com\//.test(url || '') ? url : '';
  function thumb(v, name) {
    const first = safeThumb(v.thumbnail), fallback = /^[A-Za-z0-9_-]{6,20}$/.test(v.id) ? 'https://i.ytimg.com/vi/'+v.id+'/mqdefault.jpg' : '';
    const src = first || fallback;
    const initial = '<span class="vi-thumb-empty" aria-hidden="true">'+esc((name || '?').trim().charAt(0).toUpperCase())+'</span>';
    return '<a class="vi-thumb" data-own-fallback href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">'+(src ? '<img src="'+esc(src)+'"'+(first && fallback && first !== fallback ? ' data-fallback="'+esc(fallback)+'"' : '')+' width="320" height="180" loading="lazy" alt="">' : initial)+'</a>';
  }
  // YouTube answers a missing video with a 120×90 grey stand-in rather than an error, so treat that as missing too.
  root.addEventListener('load', event => { const img = event.target; if (img instanceof HTMLImageElement && img.closest('.vi-thumb') && img.naturalWidth <= 120) img.dispatchEvent(new Event('error')); }, true);
  root.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.closest('.vi-thumb')) return;
    if (img.dataset.fallback) { const next = img.dataset.fallback; delete img.dataset.fallback; img.src = next; return; }
    const name = img.closest('.vi-row')?.querySelector('.vi-row-name')?.textContent || '?';
    img.replaceWith(Object.assign(document.createElement('span'), {className:'vi-thumb-empty', textContent:name.trim().charAt(0).toUpperCase()}));
  }, true);
  function topicsFor(id) { return (data.topics || []).filter(t => t.sources.some(s => s.id === id)); }
  function inPeriod(v) { const t = Date.parse(v.publishedAt), now = Date.now(); return t >= now - days * 86400000 && t <= now; }
  function renderCreators() {
    const selected = $('#ideas-creator').value;
    $('#ideas-creator').innerHTML = '<option value="all">All creators</option>' + data.creators.map(c => '<option value="'+esc(c.handle)+'">'+esc(c.name)+'</option>').join('');
    if (data.creators.some(c => c.handle === selected)) $('#ideas-creator').value = selected;
  }
  function videoCard(v, creator) {
    const url = 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id), linked = topicsFor(v.id);
    const description = v.description === undefined ? '' : v.description.trim();
    const descId = 'vi-desc-'+esc(v.id);
    return '<article class="vi-item">'+thumb(v, creator.name)+'<div class="vi-item-body"><div class="vi-item-date"><time datetime="'+esc(v.publishedAt)+'">'+date(v.publishedAt)+'</time></div><h3><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h3>'+
      (description ? '<p class="vi-desc" id="'+descId+'">'+esc(description)+'</p>'+(description.length > 180 ? '<button type="button" class="vi-more" aria-expanded="false" aria-controls="'+descId+'">More</button>' : '') : v.description === undefined ? '<p class="vi-desc vi-desc-wait">Loading description…</p>' : '')+
      '</div><div class="vi-item-actions"><button type="button" class="vi-dark" data-topic="'+esc(v.id)+'">+ Save as topic</button><a href="'+url+'" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>'+
      (linked.length ? '<a class="vi-linked" href="#/schedule">In '+linked.length+' topic'+(linked.length === 1 ? '' : 's')+' →</a>' : '')+'</div></article>';
  }
  function panel(creator, videos) {
    if (!videos.length) {
      const message = !data.configured && !data.videos.length ? 'No uploads loaded yet. The YouTube connection is still being set up.' : creator.error ? creator.error : $('#ideas-search').value.trim() ? 'No headlines match your search.' : 'No uploads in the last '+days+' days.';
      return '<p class="vi-panel-empty">'+esc(message)+'</p>'+panelFoot(creator);
    }
    const rich = details.get(creator.handle);
    const list = videos.map(v => rich?.find(r => r.id === v.id) || (rich ? {...v, description:''} : v));
    if (!rich) loadDetails(creator.handle);
    return list.map(v => videoCard(v, creator)).join('')+panelFoot(creator);
  }
  function panelFoot(creator) {
    return '<div class="vi-panel-foot"><a href="#/watchlist/creator/'+encodeURIComponent(creator.handle)+'">Link to this creator</a><a href="https://www.youtube.com/'+encodeURIComponent(creator.handle)+'" target="_blank" rel="noopener noreferrer">Channel on YouTube ↗</a></div>';
  }
  async function loadDetails(handle) {
    if (!data.ready || loadingDetails.has(handle) || details.has(handle)) return;
    loadingDetails.add(handle);
    try { const result = await api('/creator?handle='+encodeURIComponent(handle)); details.set(handle, result.videos); }
    catch { details.set(handle, []); }
    finally { loadingDetails.delete(handle); if (open === handle) render(); }
  }
  function render() {
    const query = $('#ideas-search').value.trim().toLocaleLowerCase(), channel = $('#ideas-creator').value;
    $('#ideas-refresh').disabled = busy || !data.configured;
    $('#ideas-add').disabled = !data.configured;
    const failed = data.creators.filter(c => c.error);
    $('#ideas-warning').hidden = !failed.length;
    $('#ideas-warning').textContent = failed.length + ' creator refresh'+(failed.length===1?'':'es')+' failed. Previously loaded videos remain visible. Retry refresh to check for missing uploads.';
    let total = 0;
    const rows = data.creators.filter(c => channel === 'all' || c.handle === channel).map((c, index) => {
      const all = data.videos.filter(v => v.handle === c.handle);
      const videos = all.filter(v => inPeriod(v) && v.title.toLocaleLowerCase().includes(query)).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
      if (query && !videos.length) return '';
      total += videos.length;
      const latest = all.reduce((m, v) => Math.max(m, Date.parse(v.publishedAt) || 0), 0);
      const expanded = open === c.handle, id = 'vi-row-'+index;
      return '<div class="vi-row'+(expanded ? ' is-open' : '')+'" data-handle="'+esc(c.handle)+'"><button type="button" class="vi-row-head" id="'+id+'-btn" aria-expanded="'+expanded+'" aria-controls="'+id+'-panel"><span class="vi-row-name">'+esc(c.name)+'</span><span class="vi-row-handle">'+esc(c.handle)+'</span><span class="vi-row-latest">'+(latest ? '<span class="vi-row-label">Latest </span>'+short(latest) : c.error ? 'Refresh failed' : 'No uploads yet')+'</span><span class="vi-row-count">'+videos.length+(videos.length === 1 ? ' video' : ' videos')+'</span><svg class="vi-chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="vi-row-panel" id="'+id+'-panel" role="region" aria-labelledby="'+id+'-btn"'+(expanded ? '' : ' hidden')+'>'+(expanded ? panel(c, videos) : '')+'</div></div>';
    }).join('');
    $('#ideas-count').textContent = !data.configured && !data.videos.length ? data.creators.length+' creators ready' : data.creators.length+' creators · '+total+(total === 1 ? ' video' : ' videos')+' in the last '+days+' days';
    $('#ideas-rows').innerHTML = rows || '<div class="vi-empty"><h2>No headlines match.</h2><p>Try another search, choose all creators or pick a wider time window.</p></div>';
  }
  function emit() { window.dispatchEvent(new CustomEvent('ww:data', {detail:data})); }
  async function load(auto=false) {
    try { data = {...await api(''), ready:true}; data.topics ||= []; details.clear(); renderCreators(); render(); emit(); announce(data.configured ? 'Watchlist loaded. Refresh to check for new uploads.' : 'YouTube API connection is not configured yet.'); if(auto && location.hash.startsWith('#/watchlist') && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) await refresh(); }
    catch (error) {
      try { const response = await fetch('creators.json'); const seed = await response.json(); data.creators = seed.creators; } catch { /* Keep the readable connection error. */ }
      if (!store && window.WWStore) { store = await window.WWStore.connect().catch(() => null); if (store) return load(auto); }
      data.ready = false; renderCreators(); render(); emit(); announce(error.message);
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
  function setOpen(handle, scroll=false) {
    open = handle; render();
    history.replaceState(null, '', handle ? '#/watchlist/creator/'+encodeURIComponent(handle) : '#/watchlist');
    if (scroll && handle) root.querySelector('.vi-row.is-open')?.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  $('#ideas-refresh').addEventListener('click',refresh);
  $('#ideas-search').addEventListener('input',render);
  $('#ideas-creator').addEventListener('change',()=>{ const value = $('#ideas-creator').value; setOpen(value === 'all' ? null : value); });
  root.querySelectorAll('[data-ideas-days]').forEach(b=>b.addEventListener('click',()=>{days=Number(b.dataset.ideasDays);root.querySelectorAll('[data-ideas-days]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));render();}));
  $('#ideas-rows').addEventListener('click', event => {
    const head = event.target.closest('.vi-row-head');
    if (head) { const handle = head.closest('.vi-row').dataset.handle; setOpen(open === handle ? null : handle); root.querySelector('.vi-row[data-handle="'+CSS.escape(handle)+'"] .vi-row-head')?.focus(); return; }
    const more = event.target.closest('.vi-more');
    if (more) { const expanded = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', String(expanded)); more.textContent = expanded ? 'Less' : 'More'; document.getElementById(more.getAttribute('aria-controls'))?.classList.toggle('is-full', expanded); return; }
    const save = event.target.closest('[data-topic]');
    if (save) openTopicDialog(save.dataset.topic);
  });
  // Save as topic: a new topic, or add the video as another source for an existing one.
  const topicDialog = document.querySelector('#topic-dialog'), topicForm = document.querySelector('#topic-form'), existing = document.querySelector('#topic-existing'), topicStatus = document.querySelector('#topic-dialog-status');
  function openTopicDialog(id) {
    if (!data.ready) { announce('Topics are saved on the server, which is not available in this preview.'); return; }
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
      topicDialog.close(); await load(); announce(toExisting ? 'Added to the topic as another source.' : 'Saved as a new topic. Find it under Topics.');
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
    if (bits[1] === 'creator' && bits[2]) { open = bits[2]; $('#ideas-creator').value = 'all'; render(); requestAnimationFrame(() => root.querySelector('.vi-row.is-open')?.scrollIntoView({block:'start'})); }
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
  // Shared with topics.js so both screens use one data load and one request helper.
  window.WWIdeas = {api, esc, ask, get data() { return data; }, reload: () => load(), openTopicDialog};
  load(location.hash.startsWith('#/watchlist') || location.hash.startsWith('#/video-ideas'));
})();
