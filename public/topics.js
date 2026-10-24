/* Topics: the production line, built on the weekly process in PROCESS.md (16 October 2026).
   Monday plan and slides, Tuesday post and edit, Wednesday record, Thursday edit, Friday record. */
(() => {
  'use strict';
  const root = document.querySelector('#topics');
  if (!root || !window.WWIdeas) return;
  const {api, esc} = window.WWIdeas;
  const $ = s => root.querySelector(s);
  const STATUSES = [['new','New'],['shortlisted','Shortlisted'],['planned','Planned'],['slides_ready','Slides ready'],['recorded','Recorded'],['edited','Edited'],['posted','Posted']];
  const label = s => (STATUSES.find(x => x[0] === s) || STATUSES[0])[1];
  const rank = s => Math.max(0, STATUSES.findIndex(x => x[0] === s));
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); };
  const monday = d => add(d, -((d.getDay()+6) % 7));
  const fmt = (d, o={weekday:'short',day:'numeric',month:'short'}) => new Intl.DateTimeFormat('en-GB', o).format(d);
  // Every date follows from the recording day. Wednesday's video is edited on Thursday; Friday's by the next Monday.
  // Wednesday's video posts the next Tuesday and Friday's the next Thursday (Taylor, 24 October), unless set by hand.
  function schedule(t) {
    if (!t.recordDate) return null;
    const r = parse(t.recordDate), wed = r.getDay() === 3;
    const suggested = add(r, 6);
    return {plan:monday(r), record:r, edit:add(r, wed ? 1 : 3), post:t.postDate ? parse(t.postDate) : suggested, suggested, custom:Boolean(t.postDate)};
  }
  let week = monday(today()), selected = null, mode = 'book', bookDate = null;
  const data = () => window.WWIdeas.data;
  const topics = () => data().topics || [];
  const ready = () => Boolean(data().ready);
  const byDate = d => topics().find(t => t.recordDate === iso(d));
  const openSlots = (count=12) => { const out = []; let d = today(); while (out.length < count) { if ([3,5].includes(d.getDay()) && !byDate(d)) out.push(d); d = add(d, 1); } return out; };
  function status(message) { $('#tp-status').textContent = message; }
  async function mutate(path, body, success) {
    const focus = document.activeElement?.id;
    try { const result = await api(path, body); await window.WWIdeas.reload(); if (success) status(success); if (focus) document.getElementById(focus)?.focus(); return result; }
    catch (error) {
      if (error.status === 409 && error.result?.conflict && body.recordDate && !body.swap) {
        if (confirm('“'+error.result.conflict.title+'” is already booked for '+fmt(parse(body.recordDate))+'. Swap the two topics?')) return mutate(path, {...body, swap:true}, 'Swapped the two recording slots.');
        status('Booking cancelled. That day is already taken.'); return null;
      }
      status(error.message); return null;
    }
  }
  function strip() {
    const days = [0,1,2,3,4].map(i => add(week, i)), now = iso(today());
    const wed = byDate(days[2]), fri = byDate(days[4]);
    const weekTopics = [wed, fri].filter(Boolean);
    const planned = weekTopics.filter(t => rank(t.status) >= rank('planned')).length, slides = weekTopics.filter(t => rank(t.status) >= rank('slides_ready')).length;
    const postsOn = d => topics().filter(t => { const s = schedule(t); return s && iso(s.post) === iso(d); });
    const postTue = postsOn(days[1]), postThu = postsOn(days[3]);
    const cells = [
      ['Plan + slides','plan', weekTopics.length ? planned+' of 2 planned · '+slides+' of 2 slides ready' : 'Plan this week’s two topics. Finish last week’s edits.'],
      ['Post + edit','post', postTue.length ? 'Post: '+postTue.map(t => t.title).join(' · ') : 'Nothing booked to post'],
      ['Record','record', wed ? wed.title : 'Not booked yet'],
      ['Post + edit','post', (postThu.length ? 'Post: '+postThu.map(t => t.title).join(' · ') : 'Nothing booked to post')+(wed ? ' · Edit: '+wed.title : '')],
      ['Record','record', fri ? fri.title : 'Not booked yet'],
    ];
    $('#tp-strip').innerHTML = days.map((d, i) => '<li class="tp-day'+(iso(d) === now ? ' is-today' : '')+'"'+(iso(d) === now ? ' aria-current="date"' : '')+'><span class="tp-day-name">'+fmt(d,{weekday:'long'})+'</span><span class="tp-day-date">'+fmt(d,{day:'numeric',month:'short'})+'</span><span class="tp-tag tp-tag-'+cells[i][1]+'">'+cells[i][0]+'</span><span class="tp-day-line">'+esc(cells[i][2])+'</span></li>').join('');
    const thisWeek = iso(week) === iso(monday(today()));
    $('#tp-week-title').textContent = (thisWeek ? 'This week' : 'Week of '+fmt(week,{day:'numeric',month:'long'}))+' · '+fmt(week,{day:'numeric',month:'short'})+' to '+fmt(add(week,4),{day:'numeric',month:'short'});
    $('#tp-today').hidden = thisWeek;
  }
  function cell(name, d, extra='') { return '<span class="tp-cell'+extra+'"><span class="tp-cell-label">'+name+'</span>'+(d ? fmt(d) : '–')+'</span>'; }
  function rows() {
    let html = '';
    for (let w = 0; w < 3; w++) {
      const start = add(week, 7*w);
      html += '<h3 class="tp-week">Week of '+fmt(start,{day:'numeric',month:'short'})+(w === 0 && iso(start) === iso(monday(today())) ? ' <span class="micro">THIS WEEK</span>' : '')+'</h3>';
      for (const d of [add(start,2), add(start,4)]) {
        const t = byDate(d);
        if (!t) { html += '<button type="button" class="tp-row tp-row-empty" data-book="'+iso(d)+'"'+(ready() ? '' : ' disabled')+'><span class="tp-row-title">+ Pick a topic</span><span class="tp-cell"><span class="tp-cell-label">Record</span>'+fmt(d)+'</span></button>'; continue; }
        const s = schedule(t);
        html += '<button type="button" class="tp-row'+(selected === t.id ? ' is-selected' : '')+'" data-select="'+esc(t.id)+'" aria-pressed="'+(selected === t.id)+'"><span class="tp-row-title">'+esc(t.title)+'</span>'+cell('Plan & slides', s.plan)+cell('Record', s.record, ' tp-cell-strong')+cell('Edit', s.edit)+cell('Post', s.post, s.custom ? '' : ' tp-cell-suggested')+'<span class="tp-pill tp-pill-'+esc(t.status)+'">'+label(t.status)+'</span></button>';
      }
    }
    $('#tp-rows').innerHTML = html;
  }
  // The topic panel also lists booked days, so a clash can be resolved by swapping the two topics.
  function slotOptions(current, withBooked=false) {
    let slots = openSlots();
    if (withBooked) { slots = []; for (let d = today(); slots.length < 12; d = add(d, 1)) if ([3,5].includes(d.getDay())) slots.push(d); }
    if (current && !slots.some(d => iso(d) === current)) slots.unshift(parse(current));
    return '<option value="">Not scheduled</option>'+slots.sort((a,b) => a-b).map(d => { const holder = byDate(d), mine = iso(d) === current; return '<option value="'+iso(d)+'"'+(mine ? ' selected' : '')+'>'+fmt(d,{weekday:'long',day:'numeric',month:'short'})+(holder && !mine ? ' · swap with “'+esc(holder.title.length > 28 ? holder.title.slice(0,27)+'…' : holder.title)+'”' : '')+'</option>'; }).join('');
  }
  function unscheduled() {
    const list = topics().filter(t => !t.recordDate && t.status !== 'posted');
    $('#tp-unscheduled').innerHTML = list.length ? list.map(t => '<article class="tp-card'+(selected === t.id ? ' is-selected' : '')+'"><button type="button" class="tp-card-open" data-select="'+esc(t.id)+'"><span class="tp-card-title">'+esc(t.title)+'</span><span class="tp-card-meta">'+label(t.status)+' · '+t.sources.length+' source'+(t.sources.length === 1 ? '' : 's')+(t.points.length ? ' · '+t.points.length+' subtopic'+(t.points.length === 1 ? '' : 's') : '')+'</span></button><label class="tp-card-schedule"><span>Schedule for</span><select data-schedule="'+esc(t.id)+'"'+(ready() ? '' : ' disabled')+'>'+slotOptions(null).replace('Not scheduled','Choose a day…')+'</select></label></article>').join('')
      : '<p class="tp-empty">'+(ready() ? 'Nothing waiting. Save videos from the Creator watchlist with “Save as topic”, or add a new topic.' : 'Topics are saved on the app’s server, so they appear on the live site rather than in this preview.')+'</p>';
  }
  function panel() {
    const t = topics().find(x => x.id === selected);
    if (!t) { $('#tp-panel').innerHTML = '<div class="tp-panel-empty"><h2>Choose a topic</h2><p>Open a topic to see its notes, source videos and subtopics.</p></div>'; return; }
    const s = schedule(t), next = STATUSES[rank(t.status)+1];
    $('#tp-panel').innerHTML = '<div class="tp-panel-head"><span class="tp-pill tp-pill-'+esc(t.status)+'">'+label(t.status)+'</span><button type="button" class="tp-close" data-act="close" aria-label="Close topic">×</button></div>'+
      '<label class="tp-field"><span>Title</span><input id="tp-f-title" data-field="title" maxlength="200" value="'+esc(t.title)+'"></label>'+
      '<div class="tp-field-row"><label class="tp-field"><span>Status</span><select id="tp-f-status" data-field="status">'+STATUSES.map(([v,l]) => '<option value="'+v+'"'+(v === t.status ? ' selected' : '')+'>'+l+'</option>').join('')+'</select></label>'+
      '<label class="tp-field"><span>Recording day</span><select id="tp-f-record" data-field="recordDate">'+slotOptions(t.recordDate, true)+'</select></label></div>'+
      (s ? '<dl class="tp-dates"><div><dt>Plan &amp; slides</dt><dd>'+fmt(s.plan)+'</dd></div><div><dt>Record</dt><dd>'+fmt(s.record)+'</dd></div><div><dt>Edit</dt><dd>'+fmt(s.edit)+'</dd></div><div><dt>Post</dt><dd>'+fmt(s.post)+'</dd></div></dl>'+
        '<label class="tp-field"><span>Post date'+(s.custom ? '' : ' (suggested '+fmt(s.suggested)+')')+'</span><input type="date" id="tp-f-post" data-field="postDate" value="'+(t.postDate || '')+'"></label>'+(s.custom ? '<button type="button" class="tp-link" data-act="post-reset">Use the suggested Tuesday</button>' : '') : '')+
      '<label class="tp-field"><span>Notes and angle</span><textarea id="tp-f-notes" data-field="notes" rows="5" maxlength="8000">'+esc(t.notes)+'</textarea></label>'+
      '<h3 class="tp-panel-sub">Subtopics <span class="micro">PREPARED MONDAY WITH THE SLIDES</span></h3><ol class="tp-points">'+t.points.map((p, i) =>
        '<li class="tp-point'+(p.done ? ' is-done' : '')+'"><input type="checkbox" id="tp-p-done-'+esc(p.id)+'" data-point-done="'+esc(p.id)+'"'+(p.done ? ' checked' : '')+' aria-label="Done: '+esc(p.title)+'"><div class="tp-point-body"><input id="tp-p-title-'+esc(p.id)+'" data-point-field="title" data-point="'+esc(p.id)+'" maxlength="200" value="'+esc(p.title)+'" aria-label="Subtopic title"><textarea id="tp-p-note-'+esc(p.id)+'" data-point-field="note" data-point="'+esc(p.id)+'" rows="2" maxlength="4000" placeholder="Note" aria-label="Note for '+esc(p.title)+'">'+esc(p.note)+'</textarea></div><div class="tp-point-tools"><button type="button" data-point-move="-1" data-point="'+esc(p.id)+'"'+(i === 0 ? ' disabled' : '')+' aria-label="Move up">↑</button><button type="button" data-point-move="1" data-point="'+esc(p.id)+'"'+(i === t.points.length-1 ? ' disabled' : '')+' aria-label="Move down">↓</button><button type="button" data-point-delete="'+esc(p.id)+'" aria-label="Delete subtopic">×</button></div></li>').join('')+'</ol>'+
      '<form class="tp-point-add" id="tp-point-form"><input id="tp-new-point" maxlength="200" placeholder="New subtopic" aria-label="New subtopic title" required><button type="submit">+ Add subtopic</button></form>'+
      '<h3 class="tp-panel-sub">Source videos</h3>'+(t.sources.length ? '<ul class="tp-sources">'+t.sources.map(v => '<li><a href="https://www.youtube.com/watch?v='+encodeURIComponent(v.id)+'" target="_blank" rel="noopener noreferrer">'+esc(v.title)+'</a><span>'+esc(v.creator)+'</span><button type="button" class="tp-link" data-remove-source="'+esc(v.id)+'">Remove</button></li>').join('')+'</ul>' : '<p class="tp-muted">No source videos yet. Use “Save as topic” in the Creator watchlist to add one.</p>')+
      '<div class="tp-panel-actions">'+(next ? '<button type="button" class="tp-dark" data-act="next">Mark as '+next[1].toLowerCase()+'</button>' : '')+'<button type="button" class="tp-link tp-danger" data-act="delete">Delete topic</button></div>';
    if (!ready()) $('#tp-panel').querySelectorAll('input,select,textarea,button:not([data-act=close])').forEach(e => e.disabled = true);
  }
  function render() {
    strip(); rows(); unscheduled(); panel();
    $('#topics-new').disabled = !ready();
    if (!ready()) status('Topics are saved on the app’s server. This preview shows the layout only.');
    else if ($('#tp-status').textContent.startsWith('Topics are saved')) status('');
  }
  root.addEventListener('click', async event => {
    const t = event.target;
    const select = t.closest('[data-select]'); if (select) { selected = select.dataset.select; render(); $('#tp-panel').scrollIntoView({block:'nearest'}); $('#tp-f-title')?.focus(); return; }
    const book = t.closest('[data-book]'); if (book) { openPick('book', book.dataset.book); return; }
    if (t.closest('#tp-prev')) { week = add(week, -7); render(); return; }
    if (t.closest('#tp-next')) { week = add(week, 7); render(); return; }
    if (t.closest('#tp-today')) { week = monday(today()); render(); $('#tp-prev').focus(); return; }
    if (t.closest('#topics-new')) { openPick('new'); return; }
    const act = t.closest('[data-act]')?.dataset.act;
    const topic = topics().find(x => x.id === selected);
    if (act === 'close') { selected = null; render(); return; }
    if (!topic) return;
    if (act === 'next') { const next = STATUSES[rank(topic.status)+1]; if (next) await mutate('/topic-update', {id:topic.id, status:next[0]}, 'Marked as '+next[1].toLowerCase()+'.'); return; }
    if (act === 'post-reset') { await mutate('/topic-update', {id:topic.id, postDate:null}, 'Post date set back to the suggested day.'); return; }
    if (act === 'delete') { if (confirm('Delete “'+topic.title+'”? Its subtopics go too. Source videos stay in the watchlist.')) { await mutate('/topic-delete', {id:topic.id}, 'Topic deleted.'); selected = null; render(); } return; }
    const remove = t.closest('[data-remove-source]'); if (remove) { await mutate('/topic-source-remove', {topicId:topic.id, videoId:remove.dataset.removeSource}, 'Source removed.'); return; }
    const move = t.closest('[data-point-move]'); if (move) { await mutate('/point-move', {id:move.dataset.point, direction:Number(move.dataset.pointMove)}); return; }
    const del = t.closest('[data-point-delete]'); if (del) { await mutate('/point-delete', {id:del.dataset.pointDelete}, 'Subtopic deleted.'); return; }
  });
  root.addEventListener('change', async event => {
    const t = event.target, topic = topics().find(x => x.id === selected);
    if (t.dataset.schedule) { const value = t.value; if (value) await mutate('/topic-update', {id:t.dataset.schedule, recordDate:value}, 'Booked for '+fmt(parse(value))+'.'); return; }
    if (!topic) return;
    if (t.dataset.field) {
      const field = t.dataset.field; let value = t.value;
      if (field === 'recordDate' || field === 'postDate') value = value || null;
      if (field === 'title' && !value.trim()) { t.value = topic.title; status('A topic needs a title.'); return; }
      await mutate('/topic-update', {id:topic.id, [field]:value}, 'Saved.');
      return;
    }
    if (t.dataset.pointDone) { await mutate('/point-update', {id:t.dataset.pointDone, done:t.checked}); return; }
    if (t.dataset.pointField) {
      if (t.dataset.pointField === 'title' && !t.value.trim()) { status('A subtopic needs a title.'); return; }
      await mutate('/point-update', {id:t.dataset.point, [t.dataset.pointField]:t.value}, 'Saved.');
    }
  });
  root.addEventListener('submit', async event => {
    if (event.target.id !== 'tp-point-form') return;
    event.preventDefault();
    const input = $('#tp-new-point'), topic = topics().find(x => x.id === selected);
    if (!topic || !input.value.trim()) return;
    await mutate('/point-add', {topicId:topic.id, title:input.value.trim()}, 'Subtopic added.');
    $('#tp-new-point')?.focus();
  });
  // One dialog books an empty slot (an existing topic or a new title) or creates an unscheduled topic.
  const pick = document.querySelector('#tp-pick-dialog'), pickForm = document.querySelector('#tp-pick-form'), pickTopic = document.querySelector('#tp-pick-topic'), pickNew = document.querySelector('#tp-pick-new'), pickStatus = document.querySelector('#tp-pick-status');
  function openPick(kind, date) {
    mode = kind; bookDate = date || null;
    const waiting = topics().filter(t => !t.recordDate && t.status !== 'posted');
    document.querySelector('#tp-pick-title').textContent = kind === 'new' ? 'New topic' : 'Book this recording';
    document.querySelector('#tp-pick-when').textContent = kind === 'new' ? 'It starts as New and waits in “Not scheduled yet”.' : fmt(parse(date),{weekday:'long',day:'numeric',month:'long'})+' · plan and slides on '+fmt(monday(parse(date)),{weekday:'long',day:'numeric',month:'short'});
    pickTopic.innerHTML = '<option value="">Choose a waiting topic…</option>'+waiting.map(t => '<option value="'+esc(t.id)+'">'+esc(t.title)+'</option>').join('');
    pickTopic.hidden = pickTopic.previousElementSibling.hidden = kind === 'new' || !waiting.length;
    pickNew.previousElementSibling.textContent = kind === 'new' || !waiting.length ? 'Topic title' : 'Or a new topic title';
    pickNew.value = ''; pickStatus.textContent = '';
    pickForm.querySelector('[type=submit]').textContent = kind === 'new' ? 'Create topic' : 'Book';
    pick.showModal(); (pickTopic.hidden ? pickNew : pickTopic).focus();
  }
  document.querySelector('#tp-pick-close').addEventListener('click', () => pick.close());
  pickForm.addEventListener('submit', async event => {
    event.preventDefault();
    const title = pickNew.value.trim(), existing = pickTopic.hidden ? '' : pickTopic.value;
    if (!title && !existing) { pickStatus.textContent = 'Choose a topic or type a new title.'; return; }
    const button = pickForm.querySelector('[type=submit]'); button.disabled = true;
    try {
      let id = existing;
      if (!id) id = (await api('/topic', {title})).id;
      if (mode === 'book') await api('/topic-update', {id, recordDate:bookDate});
      pick.close(); selected = id; await window.WWIdeas.reload();
      status(mode === 'book' ? 'Booked for '+fmt(parse(bookDate))+'.' : 'Topic created.');
    } catch (error) { pickStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
  window.addEventListener('ww:data', render);
  window.addEventListener('ww:route', event => { if (event.detail[0] === 'topics') render(); });
  render();
})();
