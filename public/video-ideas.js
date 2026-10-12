(() => {
  'use strict';
  const root = document.querySelector('#video-ideas');
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data = {creators:[], videos:[], savedIds:[], configured:false}, days = 30, busy = false, candidate = null;
  const saved = () => new Set(data.savedIds);
  const date = value => new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric'}).format(new Date(value));
  async function api(path, body) {
    const response = await fetch('/api/ideas' + path, body === undefined ? {cache:'no-store'} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The YouTube connection is not configured yet. Your creator list is ready.');
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'The request could not be completed. Please try again.');
    return result;
  }
  function announce(message) { $('#ideas-status').textContent = message; }
  function renderCreators() {
    const selected = $('#ideas-creator').value;
    $('#ideas-creator').innerHTML = '<option value="all">All creators</option>' + data.creators.map(c => '<option value="'+esc(c.handle)+'">'+esc(c.name)+'</option>').join('');
    if (data.creators.some(c => c.handle === selected)) $('#ideas-creator').value = selected;
    $('#ideas-watchlist-count').textContent = data.creators.length + ' creators';
    $('#ideas-watchlist').innerHTML = data.creators.map(c => '<a href="https://www.youtube.com/'+encodeURIComponent(c.handle)+'" target="_blank" rel="noopener noreferrer">'+esc(c.name)+'<small>'+esc(c.error ? 'Refresh failed' : c.lastSuccess ? 'Updated '+date(c.lastSuccess) : 'Awaiting first refresh')+'</small></a>').join('');
  }
  function render() {
    const query = $('#ideas-search').value.trim().toLocaleLowerCase(), channel = $('#ideas-creator').value, onlySaved = $('#ideas-saved').checked;
    const cutoff = Date.now() - days * 86400000, now = Date.now();
    const videos = data.videos.filter(v => (onlySaved ? saved().has(v.id) : Date.parse(v.publishedAt) >= cutoff && Date.parse(v.publishedAt) <= now) && (channel === 'all' || v.handle === channel) && v.title.toLocaleLowerCase().includes(query)).sort((a,b)=> Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
    $('#ideas-count').textContent = !data.configured && !data.videos.length ? data.creators.length+' creators ready' : videos.length + (videos.length === 1 ? ' video' : ' videos') + (onlySaved ? ' · saved ideas, all dates' : ' · last '+days+' days');
    $('#ideas-refresh').disabled = busy || !data.configured;
    $('#ideas-add').disabled = !data.configured;
    $('#ideas-periods').hidden = onlySaved;
    const failed = data.creators.filter(c=>c.error);
    $('#ideas-warning').hidden = !failed.length;
    $('#ideas-warning').textContent = failed.length + ' creator refresh'+(failed.length===1?'':'es')+' failed. Previously loaded videos remain visible. Retry refresh to check for missing uploads.';
    if (!videos.length) {
      const title = !data.configured ? 'Your creators are ready.' : onlySaved ? 'No saved ideas match.' : busy ? 'Checking your creators…' : 'No videos match these filters.';
      const detail = !data.configured ? 'The YouTube API connection still needs to be configured before uploads can appear here.' : onlySaved ? 'Save a source video from the recent uploads view, or clear your filters.' : 'Try another creator, clear the search or choose a wider time window.';
      $('#ideas-results').innerHTML = '<div class="vi-empty"><h2>'+title+'</h2><p>'+detail+'</p></div>';
      return;
    }
    $('#ideas-results').innerHTML = '<div class="vi-grid">'+videos.map(v => {
      const url = 'https://www.youtube.com/watch?v='+encodeURIComponent(v.id);
      const thumb = /^https:\/\/i(?:[0-9])?\.ytimg\.com\//.test(v.thumbnail || '') ? v.thumbnail : '';
      return '<article class="vi-video"><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+(thumb?'<img src="'+esc(thumb)+'" loading="lazy" alt="Original thumbnail for '+esc(v.title)+'">':'<span class="vi-missing">Thumbnail unavailable</span>')+'</a><div class="vi-creator">'+esc(v.creator)+' · <time datetime="'+esc(v.publishedAt)+'">'+date(v.publishedAt)+'</time></div><h2><a href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h2><div class="vi-actions"><button data-save="'+esc(v.id)+'" aria-pressed="'+saved().has(v.id)+'">'+(saved().has(v.id)?'Saved idea':'Save idea')+'</button><a href="'+url+'" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div></article>';
    }).join('')+'</div>';
  }
  async function load(auto=false) {
    try { data = await api(''); renderCreators(); render(); announce(data.configured ? 'Watchlist loaded. Refresh to check for new uploads.' : 'YouTube API connection is not configured yet.'); if(auto && location.hash.startsWith('#/video-ideas') && data.configured && data.creators.some(c=>!c.lastSuccess || Date.now()-Date.parse(c.lastSuccess)>=3600000)) await refresh(); }
    catch (error) {
      try { const response = await fetch('creators.json'); const seed = await response.json(); data.creators = seed.creators; } catch { /* Keep the readable connection error. */ }
      renderCreators(); render(); announce(error.message);
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
  $('#ideas-refresh').addEventListener('click',refresh);
  $('#ideas-search').addEventListener('input',render);
  $('#ideas-creator').addEventListener('change',render);
  $('#ideas-saved').addEventListener('change',render);
  root.querySelectorAll('[data-ideas-days]').forEach(b=>b.addEventListener('click',()=>{days=Number(b.dataset.ideasDays);root.querySelectorAll('[data-ideas-days]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
  $('#ideas-results').addEventListener('click',async event=>{
    const button=event.target.closest('[data-save]'); if(!button) return;
    button.disabled=true; const id=button.dataset.save, value=!saved().has(id);
    try { await api('/save',{id,saved:value}); data.savedIds=value?[...new Set([...data.savedIds,id])]:data.savedIds.filter(x=>x!==id); render(); announce(value?'Idea saved to your watchlist.':'Idea removed from saved ideas.'); }
    catch(error) {button.disabled=false; announce(error.message);}
  });
  const dialog=document.querySelector('#creator-dialog'), form=document.querySelector('#creator-form'), handle=document.querySelector('#creator-handle'), status=document.querySelector('#creator-status'), confirm=document.querySelector('#creator-confirm');
  $('#ideas-add').addEventListener('click',()=>{candidate=null;confirm.hidden=true;status.textContent='';dialog.showModal();handle.focus();});
  document.querySelector('#creator-close').addEventListener('click',()=>dialog.close());
  handle.addEventListener('input',()=>{candidate=null;confirm.hidden=true;status.textContent='';});
  form.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Looking up this creator…';try{candidate=await api('/resolve',{handle:handle.value});status.textContent=candidate.name+' · '+candidate.handle;confirm.hidden=false;}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
  confirm.addEventListener('click',async()=>{if(!candidate)return;confirm.disabled=true;try{await api('/creators',{handle:candidate.handle});dialog.close();await load();announce(candidate.name+' added. Refresh to load their uploads.');}catch(error){status.textContent=error.message;}finally{confirm.disabled=false;}});
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/video-ideas'))load(true);});
  load(true);
})();
