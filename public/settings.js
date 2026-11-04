/* Settings (Taylor's pick SE-B Skill library, 30 October 2026), opened from the cog top right on every screen.
   The library of installed skills sits on the left; the jobs that use them sit on the right, grouped by screen.
   Choose a skill and every job it can do lights up; choose a job to hand it that skill; Save writes the choice to
   the artifact database (settings/skills). A Publish job copies these when it starts, so a change applies to the next video. */
(() => {
  'use strict';
  const root = document.querySelector('#settings');
  if (!root) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Versions and descriptions checked against the synced skills on 3 November 2026 (PACKAGE-MANIFEST.json and CHANGELOG.md).
  const SKILLS = [
    {id:'suby-shots-master-poster', name:'Suby Shots · Master Poster', ver:'3.10', kind:'edit', does:'Edits the YouTube master, the LinkedIn cut and the reels, with the Variety Pack first. Replaced by With Katana on 3 November.'},
    {id:'suby-shots-with-katana', name:'Suby Shots · With Katana', ver:'5.0', kind:'edit', does:'The newest edit: Katana, Blender and motion graphics together, the Variety Pack first, and reels from a highlight pack you record on your phone.'},
    {id:'thumbnail-tracker', name:'Thumbnail Tracker', ver:'3.2', kind:'thumb', does:'Five thumbnails a round, three light and two dark, from the packaging research. Objects only unless you send a phone photo.'},
    {id:'performance-poster', name:'Performance Poster', ver:'1.2.1', kind:'post', does:'Titles, descriptions, posts and captions, checked against each platform.'},
    {id:'finishing-touches-copy-and-scripts', name:'Finishing touches copy and scripts', ver:'', kind:'post', does:'Polishes copy in your voice.'},
    {id:'whiteboard-wednesdays', name:'Whiteboard Wednesdays', ver:'2.0', kind:'deck', does:'Builds the presentation decks. Replaced by Reels and Variety on 20 October.'},
    {id:'suby-shots-reels-and-variety', name:'Suby Shots · Reels and Variety', ver:'1.0', kind:'deck', does:'The newest deck builder: a Variety Pack and a vision board of every slide, then the full deck in the library.'},
    {id:'trending-topics', name:'Trending topics', ver:'4.0', kind:'topic', does:'Finds rising topics for the shortlist.'}];
  const JOBS = [
    ['Publish', 'From Drive links to finished, posted videos', [['publishEdit','Video editing','edit','Variety Pack and the finished edits'], ['publishThumbs','Thumbnails','thumb','Five a round for YouTube and LinkedIn'], ['publishPosts','Posts and captions','post','Two variations per platform']]],
    ['Presentations', 'Whiteboard decks', [['decks','Deck building','deck','New decks and slides']]],
    ['Topics', 'Ideas and angles', [['topics','Topic ideas','topic','Angles for the shortlist']]]];
  const DEFAULTS = {publishEdit:'suby-shots-with-katana', publishThumbs:'thumbnail-tracker', publishPosts:'performance-poster', decks:'suby-shots-reels-and-variety', topics:'trending-topics'};
  // Honest connection states: nothing here claims a connection the app has not made.
  const CONNECTIONS = [
    ['Google Drive','Publish reads your Drive links. Finished files are not put back on Drive yet.','Links must be shared “Anyone with the link”',true],
    ['Claude Code','Runs each Publish job: the edit, the thumbnails and the posts.','Asks you once, the first time you press Generate',false],
    ['YouTube','Uploads for the Creator watchlist, and posting.','Not connected',true],
    ['LinkedIn and Instagram','Posting from Post all.','Not connected',true]];
  let saved = {...DEFAULTS}, draft = {...DEFAULTS}, chosen = 'finishing-touches-copy-and-scripts', ref = null, savedAt = null, loaded = false;
  const skill = id => SKILLS.find(s => s.id === id);
  const changes = () => Object.keys(draft).filter(k => draft[k] !== saved[k]).length;
  const when = iso => new Intl.DateTimeFormat('en-GB', {weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}).format(new Date(iso));
  function mono(name) { return name.replace(/[^\p{L} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
  function render() {
    const pick = skill(chosen), n = changes();
    root.innerHTML = '<div class="se-head"><a class="se-back" href="#/library">← Back</a><div class="micro">SETTINGS · SKILLS AND CONNECTIONS</div><h1 id="se-heading">Your skills</h1><p>Pick a skill on the left, then the jobs it should run. A Publish job copies these when it starts, so a change applies to the next video.</p></div>'+
      '<div class="se-lib"><div class="se-shelf" role="group" aria-label="Installed skills">'+SKILLS.map(s => '<button type="button" class="se-card" data-skill="'+s.id+'" aria-pressed="'+(s.id === chosen)+'"><b>'+esc(s.name)+'</b><small>'+(s.ver ? 'v'+s.ver+' · ' : '')+'installed</small><span>'+esc(s.does)+'</span></button>').join('')+'</div>'+
      '<div class="se-slots">'+JOBS.map(([screen, sub, jobs]) => '<section class="se-grp" aria-label="'+esc(screen)+'"><h2>'+esc(screen)+' <span class="micro">'+esc(sub)+'</span></h2><div class="se-row">'+jobs.map(([key, label, kind, note]) => {
        const hot = pick && pick.kind === kind, now = skill(draft[key]) || {id:draft[key], name:draft[key]};
        return '<button type="button" class="se-job'+(hot ? ' is-hot' : '')+(draft[key] !== saved[key] ? ' is-changed' : '')+'" data-job="'+key+'"'+(hot ? '' : ' aria-disabled="true"')+' aria-label="'+esc(label)+': '+esc(now.name)+(hot && now.id !== pick.id ? '. Press to use '+esc(pick.name) : '')+'"><span class="micro">'+esc(label)+'</span><span class="se-sk"><i aria-hidden="true">'+esc(mono(now.name))+'</i>'+esc(now.name)+'</span><small>'+esc(note)+'</small></button>';
      }).join('')+'</div></section>').join('')+
      '<section class="se-grp" aria-label="Connections"><h2>Connections <span class="micro">What each part of the app needs</span></h2><div class="se-conns">'+CONNECTIONS.map(c => '<div class="se-conn"><i class="se-dot'+(c[3] ? ' is-off' : '')+'" aria-hidden="true"></i><div><b>'+esc(c[0])+'</b><span>'+esc(c[1])+'</span></div><em>'+esc(c[2])+'</em></div>').join('')+'</div></section></div></div>'+
      '<div class="se-save">'+(n ? '<span class="se-chg">'+n+' change'+(n > 1 ? 's' : '')+'</span>' : '')+'<span class="se-when" role="status">'+(n ? 'Not saved yet' : savedAt ? 'Saved '+esc(when(savedAt)) : ref ? 'Using the defaults' : loaded ? 'Saving needs the app’s database, which this preview does not have' : 'Loading…')+'</span><span class="se-note">Jobs already running keep their skills.</span><button type="button" class="se-btn" id="se-save"'+(n && ref ? '' : ' disabled')+'>Save skills</button></div>';
  }
  root.addEventListener('click', async e => {
    const card = e.target.closest('[data-skill]');
    if (card) { chosen = card.dataset.skill; render(); root.querySelector('[data-skill="'+chosen+'"]').focus(); return; }
    const job = e.target.closest('[data-job]');
    if (job && job.getAttribute('aria-disabled') !== 'true') { draft[job.dataset.job] = chosen; render(); root.querySelector('[data-job="'+job.dataset.job+'"]').focus(); return; }
    if (e.target.closest('#se-save') && ref && changes()) {
      const btn = root.querySelector('#se-save'); btn.disabled = true; btn.textContent = 'Saving…';
      try { const at = new Date().toISOString(); await ref.set({slots:draft, updatedAt:at}); saved = {...draft}; savedAt = at; render(); }
      catch { render(); root.querySelector('.se-when').textContent = 'Could not save. Try again.'; }
    }
  });
  async function load() {
    try { await window.WWStore?.connect(); const db = window.WWStore?.db?.(); if (db) { ref = db.doc('settings/skills'); const d = (await ref.get()).data(); if (d?.slots) { saved = {...DEFAULTS, ...d.slots}; draft = {...saved}; savedAt = d.updatedAt || null; } } }
    catch { ref = null; }
    loaded = true; if (!root.hidden) render();
  }
  window.WWSettings = {get skills() { return {...saved}; }, name: id => skill(id)?.name || id};
  window.addEventListener('ww:route', e => { if (e.detail[0] === 'settings') render(); });
  load();
})();
