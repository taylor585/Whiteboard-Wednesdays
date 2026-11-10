/* The posting engine's pure rules (Taylor, 10 November 2026: "it should do everything for me perfectly, end to end, and
   get these posted for me"). No clock, no database, no network: dates, jobs and settings in, answers out. The same file
   runs in the page (window.WWPostingCore, read by posting.js) and in a posting session (scripts/posting-plan.mjs loads
   it with Node), so the screen and the session can never disagree about what is due, what a receipt means, or what
   text goes out. POSTING.md is the runbook that uses it. Nothing here posts anything. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.WWPostingCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TZ = 'Europe/London';
  // The fixed order (PUBLISH.md "Posting"): YouTube first, because its link goes into LinkedIn's first comment and X's reply.
  const ORDER = ['youtube', 'linkedin', 'x', 'instagram', 'facebook'];
  const LABEL = {youtube:'YouTube', linkedin:'LinkedIn', x:'X', instagram:'Instagram', facebook:'Facebook'};
  const STATES = ['posting', 'posted', 'failed', 'check', 'skipped'];
  const RETRY_MS = 3600e3, MAX_RETRIES = 1, LATE_DAYS = 2, REEL_LATE_DAYS = 14;
  const YT_PH = '[YOUTUBE LINK]';
  // The skill's placeholder pattern, the same as public/publish.js.
  const PH = /\[(?:[A-Z][A-Z0-9 _\/-]{2,}|your [^\]\n]{2,40})\]|\bX:XX\b/g;
  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  // ---- UK time ------------------------------------------------------------------------------------------------------
  const parts = ms => { const o = {}; for (const p of new Intl.DateTimeFormat('en-GB', {timeZone:TZ, hourCycle:'h23', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'}).formatToParts(new Date(ms))) o[p.type] = p.value; return o; };
  const offsetMin = ms => { const p = parts(ms); return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000) / 60000); };
  const toMs = v => typeof v === 'number' ? v : Date.parse(v);
  // The London calendar day ('YYYY-MM-DD') and wall time ('HH:MM') of an instant.
  const londonDay = v => { const p = parts(toMs(v)); return p.year + '-' + p.month + '-' + p.day; };
  const londonTime = v => { const p = parts(toMs(v)); return p.hour + ':' + p.minute; };
  // A London wall time as a UTC instant. A time that does not exist (the spring-forward hour) moves an hour on; a time that
  // happens twice (the autumn hour) is the first of the two.
  function londonToUtc(day, time) {
    const [y, m, d] = day.split('-').map(Number), [h, mi] = time.split(':').map(Number), wall = Date.UTC(y, m - 1, d, h, mi);
    let t = wall - offsetMin(wall) * 60000; const off2 = offsetMin(t); if (off2 !== offsetMin(wall)) t = wall - off2 * 60000;
    const same = x => londonDay(x) === day && londonTime(x) === time;
    if (same(t - 3600e3)) t -= 3600e3;  // the autumn hour: the first of the two
    return new Date(t).toISOString();
  }
  const plusDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const dayDiff = (a, b) => Math.round((Date.parse(a + 'T12:00:00Z') - Date.parse(b + 'T12:00:00Z')) / 864e5);
  const dowKey = iso => DAY_KEYS[new Date(iso + 'T12:00:00Z').getUTCDay()];

  // ---- The schedule -------------------------------------------------------------------------------------------------
  // The posting day and time a job gets when it reaches Ready to post. planDay is its topic's posting day from the one rule
  // in ww-store.js (WWStore.posting.dates), or null when the job has no booked topic. A day still ahead keeps its time; a
  // job ready after its slot has passed goes out on the next posting day from now ("late").
  function scheduleFor(planDay, settings, now) {
    const s = settings || {}, time = /^([01]\d|2[0-3]):[0-5]\d$/.test(s.time || '') ? s.time : '15:00', days = Array.isArray(s.days) && s.days.length ? s.days : ['tue', 'thu'];
    const nowMs = toMs(now);
    if (planDay && /^\d{4}-\d{2}-\d{2}$/.test(planDay) && toMs(londonToUtc(planDay, time)) > nowMs) return {day:planDay, time, tz:TZ, at:londonToUtc(planDay, time), late:false, planned:planDay};
    let d = londonDay(nowMs);
    for (let i = 0; i < 15; i++, d = plusDays(d, 1)) if (days.includes(dowKey(d)) && toMs(londonToUtc(d, time)) > nowMs) break;
    return {day:d, time, tz:TZ, at:londonToUtc(d, time), late:Boolean(planDay), planned:planDay || null};
  }

  // ---- Which platforms, and are they connected -----------------------------------------------------------------------
  // Connections arrive through WWStore.posting.CONNECTED: today a frozen object of false, later live. A value counts as
  // connected only when it is exactly true, or an object that says so ({connected: true} or {state: 'connected'}).
  const isConnected = (connected, k) => { const v = connected ? connected[k] : undefined; return v === true || Boolean(v && typeof v === 'object' && (v.connected === true || v.state === 'connected')); };
  // On for this job: the job's own switch (postTo, written when Taylor changes one on Publish), else Posting settings.
  const isOn = (job, settings, k) => typeof job?.postTo?.[k] === 'boolean' ? job.postTo[k] : Boolean(settings?.platforms?.[k]);

  // ---- Receipts and the state machine ---------------------------------------------------------------------------------
  // One receipt per thing posted: on the video job posting.youtube, posting.linkedin and posting.x; on the reel job one per
  // reel and shape, posting["instagram/A/reel"], posting["instagram/A/post"], posting["facebook/A/reel"], …
  //   {state: 'posting'|'posted'|'failed'|'check'|'skipped', attemptId, startedAt, postedAt, url, id, error, reason, retries, retryAt}
  // The writer pins every write to the version it read, and writes 'posting' BEFORE it calls the platform.
  function transition(entry, event, at, data = {}) {
    const e = entry && typeof entry === 'object' ? entry : null, s = e?.state || null, t = typeof at === 'number' ? new Date(at).toISOString() : at;
    const bad = why => { const x = new Error(why); x.code = 'illegal'; throw x; };
    if (event === 'start') {
      if (s === 'posting') bad('already posting: never start a second attempt; read the platform back first');
      if (s === 'posted') bad('already posted: never post twice');
      if (s === 'check') bad('needs a look: only Taylor clears a check');
      if (s === 'failed' && !retryable(e, t)) bad('failed and not retryable yet');
      if (!data.attemptId) bad('an attemptId is required');
      return {state:'posting', attemptId:data.attemptId, startedAt:t, postedAt:null, url:null, id:null, error:null, reason:null, retries:e?.retries || 0, retryAt:null};
    }
    if (event === 'ok') { if (s !== 'posting' && s !== 'check') bad('only an attempt in progress can be posted'); return {...e, state:'posted', postedAt:t, url:data.url || null, id:data.id || null, error:null, retryAt:null}; }
    if (event === 'fail') {  // the platform said no and nothing was created
      if (s !== 'posting' && s !== 'check') bad('only an attempt in progress can fail');
      const retries = (e.retries || 0) + (s === 'posting' ? 1 : 0), again = retries <= MAX_RETRIES && data.permanent !== true;
      return {...e, state:'failed', error:String(data.error || 'failed').slice(0, 300), retries, retryAt:again ? new Date(toMs(t) + RETRY_MS).toISOString() : null};
    }
    if (event === 'unclear') { if (s !== 'posting') bad('only an attempt in progress can be unclear'); return {...e, state:'check', error:String(data.error || 'no clear answer from the platform').slice(0, 300)}; }
    if (event === 'skip') { if (s === 'posting' || s === 'posted' || s === 'check') bad('cannot skip ' + s); return {...(e || {}), state:'skipped', reason:String(data.reason || 'skipped'), error:null, at:t}; }
    if (event === 'clear') { if (s !== 'check') bad('only a check can be cleared'); return data.posted ? {...e, state:'posted', url:data.url || e.url || null, postedAt:e.postedAt || t, error:null} : {...e, state:'failed', error:'Taylor checked: it was not posted', retries:0, retryAt:t}; }
    bad('unknown event ' + event);
  }
  // A failed receipt may start again only once, an hour after it failed (retryAt), unless Taylor cleared it.
  const retryable = (e, at) => e?.state === 'failed' && Boolean(e.retryAt) && (e.retries || 0) <= MAX_RETRIES && toMs(at) >= toMs(e.retryAt);
  // What a posting run does with one receipt: 'post' (start it), 'done' (posted), 'wait' (in progress or a retry later),
  // 'look' (check, or failed for good: tell Taylor), 'skip' (do not post it now, with the reason).
  function decide(entry, {on, connected, held, at}) {
    const s = entry?.state || null;
    if (s === 'posted') return {act:'done'};
    if (s === 'posting') return {act:'wait', why:'already posting'};
    if (s === 'check') return {act:'look', why:'needs a look'};
    if (held) return {act:'skip', why:'on hold'};
    if (!on) return {act:'skip', why:'switched off'};
    if (!connected) return {act:'skip', why:'not connected'};
    if (s === 'failed') return retryable(entry, at) ? {act:'post', retry:true} : entry.retryAt && (entry.retries || 0) <= MAX_RETRIES ? {act:'wait', why:'retry at ' + entry.retryAt} : {act:'look', why:'failed twice'};
    return {act:'post'};
  }

  // ---- Texts ---------------------------------------------------------------------------------------------------------
  const placeholders = (x, allowYt) => [...new Set(String(x || '').match(PH) || [])].filter(m => !(allowYt && m === YT_PH));
  // Fill [YOUTUBE LINK] (the only placeholder allowed, and only where a link reply or first comment carries it).
  function fill(text, youtubeUrl) {
    const t = String(text ?? '');
    const out = youtubeUrl ? t.split(YT_PH).join(youtubeUrl) : t;
    return {text:out.trim(), left:placeholders(out)};
  }
  const pickOf = (job, key) => { const pl = (job?.pack?.platforms || []).find(p => p?.key === key), i = /^v(\d+)$/.exec(job?.picks?.[key + '.post'] || '')?.[1]; return pl && i ? pl.posts?.[+i - 1] || null : null; };
  const thumbOf = (job, key) => { const pl = (job?.pack?.platforms || []).find(p => p?.key === key); return (pl?.thumbnails || []).find(t => t.id === job?.picks?.[key + '.thumb']) || (pl?.thumbnails || [])[0] || null; };
  // X: the first post and every reply, filled and counted the way X counts them (len is public/x-count.js's WWX.len).
  // Errors stop the X post: a missing link, any other placeholder, a post over 280, a link in the first post.
  function xThread(post, youtubeUrl, len, limit = 280) {
    const errors = [];
    if (!post) return {posts:[], errors:['no X post picked']};
    const raw = [post.body || '', ...(Array.isArray(post.replies) ? post.replies : [])];
    if (post.kind === 'single' && raw.length !== 2) errors.push('a single post needs exactly one reply');
    if (post.kind === 'thread' && (raw.length < 4 || raw.length > 6)) errors.push('a thread has 4 to 6 posts');
    const yt = raw.map(t => String(t).split(YT_PH).length - 1);
    if (yt.reduce((a, b) => a + b, 0) !== 1 || yt[raw.length - 1] !== 1) errors.push('[YOUTUBE LINK] must be in the last post, once');
    if (/https?:\/\//i.test(raw[0]) || yt[0]) errors.push('no link in the first post');
    if (!youtubeUrl && yt.some(Boolean)) errors.push('the YouTube link is not there yet');
    const posts = raw.map((t, i) => { const f = fill(t, youtubeUrl), n = len ? len(f.text) : [...f.text].length;
      if (f.left.length) errors.push('post ' + (i + 1) + ' still has ' + f.left.join(', '));
      if (!f.text) errors.push('post ' + (i + 1) + ' is empty');
      if (n > limit) errors.push('post ' + (i + 1) + ' is ' + n + ' of ' + limit);
      return {n:i + 1, text:f.text, count:n, replyTo:i ? i : null, media:i === 0 ? 'thumbnail' : null}; });
    return {posts, errors:[...new Set(errors)]};
  }
  // Everything a posting run sends, per platform, in order, from the job's picks (and the reel job's finals and captions).
  // Never a review copy: a file is used only when it is quality 'full', a YouTube private upload, or a stored file.
  function plan(job, reel, {settings, connected, youtubeUrl, len, now} = {}) {
    const at = now || new Date().toISOString(), yt = youtubeUrl || job?.youtubeUrl || job?.posting?.youtube?.url || null, held = Boolean(job?.hold?.on);
    const stored = Array.isArray(job?.stored?.files) ? job.stored.files : [], file = kind => stored.find(f => f.kind === kind && !f.review) || null;
    const steps = [];
    const add = (platform, key, what, extra) => { const e = (key === platform ? job?.posting : reel?.posting)?.[key]; const d = decide(e, {on:isOn(job, settings, platform), connected:isConnected(connected, platform), held, at}); steps.push({platform, key, what, ...d, state:e?.state || null, ...extra}); };
    const ytPost = pickOf(job, 'youtube'), li = pickOf(job, 'linkedin'), x = pickOf(job, 'x');
    const ytFile = job?.youtubePrivate?.videoId ? {kind:'youtube-private', videoId:job.youtubePrivate.videoId} : file('master');
    add('youtube', 'youtube', 'video', {title:ytPost?.title || null, description:fill(ytPost?.body).text, file:ytFile, thumbnail:thumbOf(job, 'youtube'), errors:[!ytPost && 'no YouTube post picked', !ytFile && 'no full-quality master stored', ytPost && placeholders(ytPost.title).concat(placeholders(ytPost.body)).length && 'the YouTube text still has a placeholder'].filter(Boolean)});
    const liC = fill(li?.firstComment, yt), liF = file('linkedin');
    add('linkedin', 'linkedin', 'video', {commentary:fill(li?.body).text, firstComment:liC.text, file:liF, cover:thumbOf(job, 'linkedin'), errors:[!li && 'no LinkedIn post picked', !liF && 'no full-quality LinkedIn cut stored', liC.left.length && 'the first comment still has ' + liC.left.join(', '), li && placeholders(li.body).length && 'the LinkedIn post still has a placeholder'].filter(Boolean)});
    const xt = xThread(x, yt, len);
    add('x', 'x', x?.kind === 'thread' ? 'thread' : 'post', {posts:xt.posts, image:thumbOf(job, 'youtube'), errors:xt.errors});
    // Reels: Instagram, then Facebook, the same files and caption for both (Taylor, 10 November 2026). They wait for YouTube.
    const ids = reel && reel.status === 'final' ? [...new Set((reel.finals || []).map(f => f.reelId).filter(Boolean))] : [];
    for (const platform of ['instagram', 'facebook']) {
      if (!reel || reel.status !== 'final') { steps.push({platform, key:platform, what:'reels', act:reel ? 'skip' : 'none', why:reel ? 'reels not finished yet' : 'no reel job', state:null, errors:[]}); continue; }
      for (const id of ids) for (const shape of ['reel', 'post']) {
        const f = (reel.finals || []).find(z => z.reelId === id && z.kind === shape), cap = (reel.captions || []).find(c => c.reelId === id && c.kind === shape) || (reel.captions || []).find(c => c.reelId === id);
        const st = (Array.isArray(reel.stored?.files) ? reel.stored.files : []).find(z => z.reelId === id && z.kind === shape) || null, c = fill(cap?.text);
        add(platform, platform + '/' + id + '/' + shape, shape, {reelId:id, caption:c.text, file:st || (f ? {kind:shape, url:f.url, onReviewPage:true} : null), cover:(reel.finals || []).find(z => z.reelId === id && z.kind === 'cover') || null,
          errors:[!f && !st && 'no ' + shape + ' file', !cap && 'no caption', c.left.length && 'the caption still has ' + c.left.join(', ')].filter(Boolean),
          warnings:/link in bio/i.test(c.text) ? ['the caption says "link in bio", written before 10 November 2026'] : []});
      }
    }
    // Instagram and Facebook wait until YouTube is live (their captions say the full video is on YouTube).
    const ytLive = Boolean(yt) || !isOn(job, settings, 'youtube');
    for (const s of steps) if (['instagram', 'facebook'].includes(s.platform) && s.act === 'post' && !ytLive) { s.act = 'wait'; s.why = 'waits for the YouTube video'; }
    for (const s of steps) if (['linkedin', 'x'].includes(s.platform) && s.act === 'post' && !yt && isOn(job, settings, 'youtube')) { s.act = 'wait'; s.why = 'waits for the YouTube link'; }
    for (const s of steps) if (s.act === 'post' && s.errors.length) { s.act = 'look'; s.why = s.errors.join('; '); }
    return steps;
  }

  // ---- What is due --------------------------------------------------------------------------------------------------
  // The daily run ("Post due jobs"): nothing unless Posting is Auto. A video job is due when it is Ready to post, not on
  // Hold, its scheduled time has come today in London (or up to two days ago and nothing went out: a missed run), and a
  // platform still has something to post. Its reel job rides with it; reels that finished after the video went out post
  // on a later run (up to 14 days after the posting day). Anything older is reported as missed, never posted by itself.
  function due({jobs = [], reels = [], settings = {}, connected = {}, now}) {
    const at = now || new Date().toISOString(), today = londonDay(at), out = {mode:settings.mode === 'auto' ? 'auto' : 'manual', today, due:[], missed:[], waiting:[], held:[]};
    if (out.mode !== 'auto') return out;
    for (const j of jobs) {
      if (!j || j.status !== 'final' || !j.schedule?.day) continue;
      const r = reels.find(x => x && x.jobId === j.id && x.status !== 'failed') || null, age = dayDiff(today, j.schedule.day);
      if (j.hold?.on) { out.held.push({jobId:j.id}); continue; }
      if (age < 0 || toMs(j.schedule.at || londonToUtc(j.schedule.day, j.schedule.time || '15:00')) > toMs(at)) { out.waiting.push({jobId:j.id, day:j.schedule.day}); continue; }
      const steps = plan(j, r, {settings, connected, now:at}), todo = steps.filter(s => s.act === 'post' || (s.act === 'wait' && /YouTube|retry/.test(s.why || '')));
      if (!todo.length) continue;
      const nothingOut = !steps.some(s => s.state === 'posted' || s.state === 'posting');
      const onlyReels = todo.every(s => ['instagram', 'facebook'].includes(s.platform));
      if (age > (onlyReels && !nothingOut ? REEL_LATE_DAYS : LATE_DAYS)) { out.missed.push({jobId:j.id, day:j.schedule.day, platforms:[...new Set(todo.map(s => s.platform))]}); continue; }
      out.due.push({jobId:j.id, reelsId:r?.id || null, day:j.schedule.day, late:age > 0, platforms:[...new Set(todo.map(s => s.platform))]});
    }
    return out;
  }

  // ---- One row per platform, for the screen -----------------------------------------------------------------------------
  // Scheduled · Posting · Posted (with links) · Skipped: not connected · Off · Waiting · Needs a look · On hold.
  function rows(job, reel, {settings, connected, now} = {}) {
    const at = now || new Date().toISOString(), steps = plan(job, reel, {settings, connected, now:at});
    return ORDER.map(k => {
      const mine = steps.filter(s => s.platform === k), states = mine.map(s => s.state), urls = mine.map(s => (k === 'youtube' || k === 'linkedin' || k === 'x' ? job?.posting?.[s.key] : reel?.posting?.[s.key])?.url).filter(Boolean);
      const on = isOn(job, settings, k), conn = isConnected(connected, k), n = mine.length, posted = states.filter(s => s === 'posted').length;
      let state, text;
      if (n && posted === n) { state = 'posted'; text = 'Posted'; }
      else if (states.includes('posting')) { state = 'posting'; text = 'Posting…'; }
      else if (states.includes('check') || mine.some(s => s.act === 'look')) { state = 'look'; text = 'Needs a look'; }
      else if (mine.some(s => s.state === 'failed' && s.act === 'wait')) { state = 'retry'; text = 'Failed: tries again once, an hour later'; }
      else if (posted) { state = 'partial'; text = 'Posted ' + posted + ' of ' + n; }
      else if (!on) { state = 'off'; text = 'Off for this video'; }
      else if (!conn) { state = 'skipped'; text = 'Skipped: not connected'; }
      else if (job?.hold?.on) { state = 'held'; text = 'On hold'; }
      else if (mine.some(s => s.act === 'none')) { state = 'none'; text = 'No reels for this video'; }
      else if (mine.some(s => s.why === 'reels not finished yet')) { state = 'waiting'; text = 'Waits for the reels to finish'; }
      else { state = 'scheduled'; text = 'Scheduled'; }
      const rec = s => (k === 'youtube' || k === 'linkedin' || k === 'x' ? job?.posting : reel?.posting)?.[s.key];
      const why = state === 'look' ? (mine.map(rec).find(e => e?.state === 'check')?.error || mine.map(s => s.why).find(w => w && w !== 'needs a look') || '') : (mine.map(rec).find(e => e?.state === 'failed')?.error || '');
      return {key:k, label:LABEL[k], state, text, urls, on, connected:conn, why, items:n};
    });
  }
  return {TZ, ORDER, LABEL, STATES, YT_PH, RETRY_MS, MAX_RETRIES, londonDay, londonTime, londonToUtc, plusDays, scheduleFor, isConnected, isOn, transition, retryable, decide, placeholders, fill, xThread, plan, due, rows};
});
