/* Creator page (Taylor's pick C-A, 26 October 2026): opened from a creator in Topics or the watchlist at
   #/creator/@handle. Everything shown comes from the creator's stored uploads; nothing is invented while
   the YouTube connection is off, and the page says so. */
(() => {
  'use strict';
  const root = document.querySelector('#creator');
  if (!root || !window.WWIdeas) return;
  const {api, esc, thumb, spark, topicsFor} = window.WWIdeas;
  const DAY = 86400000, DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const date = v => new Intl.DateTimeFormat('en-GB', {weekday:'short',day:'numeric',month:'short'}).format(new Date(v));
  let handle = null, videos = null, loading = null;
  const data = () => window.WWIdeas.data;
  const creator = () => (data().creators || []).find(c => c.handle.toLowerCase() === String(handle).toLowerCase());
  // Full details (with descriptions) come from the creator endpoint; the main payload is the fallback.
  async function details(h) {
    if (loading === h) return;
    loading = h;
    try { const result = await api('/creator?handle='+encodeURIComponent(h)); if (handle === h) { videos = result.videos || []; render(); } }
    catch { if (handle === h) { videos = null; render(); } }
    finally { if (loading === h) loading = null; }
  }
  function render() {
    if (!handle) return;
    const c = creator();
    if (!c) {
      root.innerHTML = '<div class="cr-missing"><h1 id="cr-name">Creator not found</h1><p>'+(data().creators?.length ? 'This creator is not on your watchlist.' : 'Loading your creators…')+'</p><a href="#/topics">Back to Topics</a></div>';
      return;
    }
    const list = (videos || (data().videos || []).filter(v => v.handle === c.handle)).slice().sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
    const month = list.filter(v => Date.parse(v.publishedAt) >= Date.now() - 30*DAY);
    const days = new Map(); for (const v of list) { const d = new Date(v.publishedAt).getDay(); days.set(d, (days.get(d) || 0) + 1); }
    const usual = [...days].sort((a,b) => b[1] - a[1]).slice(0, 2).filter(x => x[1] > 1 || list.length < 3).map(x => DAYS[x[0]].slice(0, 3)).join(' · ');
    const taken = (data().topics || []).filter(t => t.sources.some(s => s.handle === c.handle)).length;
    const weeks = [3,2,1,0].map(w => list.filter(v => { const age = (Date.now() - Date.parse(v.publishedAt)) / DAY; return age >= w*7 && age < (w+1)*7; }).length);
    const peak = Math.max(1, ...weeks);
    const connected = data().configured || list.length;
    const url = 'https://www.youtube.com/'+encodeURIComponent(c.handle);
    root.innerHTML = '<nav class="cr-crumbs" aria-label="Breadcrumb"><a href="#/topics">Topics</a><span aria-hidden="true">›</span><a href="#/topics">Your creators</a><span aria-hidden="true">›</span><span aria-current="page">'+esc(c.name)+'</span></nav>'+
      '<header class="cr-banner"><div class="cr-who"><h1 id="cr-name" tabindex="-1">'+esc(c.name)+'</h1><a class="cr-handle" href="'+url+'" target="_blank" rel="noopener noreferrer">'+esc(c.handle)+' on YouTube ↗</a></div>'+
      '<div class="cr-rhythm"><span class="micro">UPLOADS PER WEEK · LAST 4 WEEKS</span>'+(connected ? '<div class="cr-bars">'+weeks.map((n, i) => '<span class="cr-bar"><i style="height:'+(6 + n/peak*46)+'px"></i><span>'+(i === 3 ? 'This week' : (3-i)+'w ago')+' · '+n+'</span></span>').join('')+'</div>' : '<p>Appears once the YouTube connection is on.</p>')+'</div>'+
      '<dl class="cr-stats"><div><dt>'+(connected ? month.length : '–')+'</dt><dd>uploads in 30 days</dd></div><div><dt>'+(usual || '–')+'</dt><dd>usual posting days</dd></div><div><dt>'+(list[0] ? date(list[0].publishedAt) : '–')+'</dt><dd>last upload</dd></div><div><dt>'+taken+'</dt><dd>'+(taken === 1 ? 'topic' : 'topics')+' taken from them</dd></div></dl></header>'+
      '<p id="cr-status" class="cr-status" role="status"></p>'+
      '<div class="cr-layout"><section class="cr-videos" aria-labelledby="cr-videos-h"><h2 id="cr-videos-h">Latest uploads</h2>'+
      (list.length ? '<div class="cr-grid">'+list.slice(0, 12).map(v => {
        const linked = topicsFor(v.id).length;
        return '<article class="cr-video">'+thumb(v, c.name)+'<h3><a href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a></h3><span class="cr-meta">'+date(v.publishedAt)+'</span>'+
          (v.description ? '<p class="cr-desc">'+esc(v.description)+'</p>' : '')+(linked ? '<a class="cr-in" href="#/topics">In Topics ✓</a>' : '<button type="button" class="cr-spark" data-spark="'+esc(v.id)+'">Spark a topic</button>')+'</article>';
      }).join('')+'</div>'
      : '<div class="cr-empty"><h3>'+(data().configured ? 'No uploads stored yet.' : 'Live uploads for '+esc(c.name)+' appear here once the YouTube connection is switched on.')+'</h3><p>'+(data().configured ? 'Refresh uploads in the Creator watchlist to load them.' : 'It still needs Google API approval and its key. Until then you can keep notes on '+esc(c.name)+' and open their channel on YouTube.')+'</p><a href="'+url+'" target="_blank" rel="noopener noreferrer">Open '+esc(c.name)+' on YouTube ↗</a></div>')+
      '</section><aside class="cr-note"><label for="cr-note-text">Your note on '+esc(c.name)+'</label><textarea id="cr-note-text" rows="6" maxlength="4000" placeholder="Why you follow them, what to watch for">'+esc(c.note || '')+'</textarea><span class="cr-note-hint">Saves when you click away. Only you see it.</span></aside></div>';
    if (!data().ready) root.querySelector('#cr-note-text').disabled = true;
  }
  root.addEventListener('click', async event => {
    const b = event.target.closest('[data-spark]'); if (!b) return;
    b.disabled = true; b.textContent = 'Sparking…';
    if (await spark(b.dataset.spark)) root.querySelector('#cr-status').textContent = 'Sparked. It waits on the Topics shortlist.';
    else { b.disabled = false; b.textContent = 'Spark a topic'; }
  });
  root.addEventListener('change', async event => {
    if (event.target.id !== 'cr-note-text') return;
    const c = creator(); if (!c) return;
    try { await api('/creator-note', {handle:c.handle, note:event.target.value}); c.note = event.target.value; root.querySelector('#cr-status').textContent = 'Note saved.'; }
    catch (error) { root.querySelector('#cr-status').textContent = error.message; }
  });
  window.addEventListener('ww:data', () => { if (!root.hidden && document.activeElement?.id !== 'cr-note-text') render(); });
  window.addEventListener('ww:route', event => {
    if (event.detail[0] !== 'creator') { handle = null; return; }
    handle = event.detail[1] || ''; videos = null; render();
    if (data().ready && creator()) details(creator().handle);
    root.querySelector('h1')?.focus?.();
  });
  // A direct link can arrive before the creator list loads; fetch details once it has.
  window.addEventListener('ww:data', () => { if (handle && videos === null && data().ready && creator() && !loading) details(creator().handle); });
})();
