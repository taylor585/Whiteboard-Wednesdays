// Motion gate (hybrid R "Ruled and pressed", 10 November 2026). The timings and the moves are in motion.css; this file only
// decides WHEN something may play, so that every entrance plays once:
//   enter(root, kind)   a screen root has just changed (kind "screen", "lane" or "week"): sets data-enter on it for 400ms.
//                       A redraw inside those 400ms carries on from where the entrance had got to instead of replaying;
//                       any later redraw (a database snapshot, the 15 second timer, typing) finds no attribute at all.
//   stamp(key)          a one-off moment has just happened (a lane changed, a stage started, a slot was booked, a Copy).
//   attr(key, name)     for the render that follows: ' data-m="name" style="--m-skip:-…ms"' while the stamp is under
//                       400ms old, and nothing after that. The negative delay keeps a re-rendered element in step.
// The same shape as the Vault's "animate" flag, shared by every screen. Nothing here reads or writes saved data.
(() => {
  'use strict';
  const WINDOW = 400, MOST = 12;
  const live = new Map(), stamps = new Map(), now = () => performance.now();
  function end(root) {
    const s = live.get(root); if (!s) return;
    s.obs.disconnect(); clearTimeout(s.timer); live.delete(root); root.removeAttribute('data-enter');
  }
  // Keep a redraw in step with the entrance already under way, leave out what is off screen, and never move more than
  // twelve things at once.
  function sync(root) {
    const s = live.get(root); if (!s || !root.getAnimations) return;
    const t = now() - s.t0; if (t >= WINDOW) { end(root); return; }
    const all = root.getAnimations({subtree:true}).filter(a => a.animationName && a.effect && a.effect.target);
    const cards = all.filter(a => a.animationName === 'm-in' && !a.effect.pseudoElement);
    let room = MOST - new Set(all.filter(a => !cards.includes(a)).map(a => a.effect.target)).size;
    for (const a of cards) {
      const r = a.effect.target.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight || r.width === 0 || room-- <= 0) a.cancel();
    }
    for (const a of all) if (a.playState !== 'idle' && typeof a.currentTime === 'number' && a.currentTime < t - 20) a.currentTime = t;
  }
  function enter(root, kind) {
    if (!root) return;
    if (live.has(root)) { end(root); void root.offsetWidth; }
    const s = {t0:now(), kind, fresh:true, obs:new MutationObserver(() => sync(root))};
    s.obs.observe(root, {childList:true, subtree:true});
    s.timer = setTimeout(() => end(root), WINDOW);
    setTimeout(() => { s.fresh = false; }, 0);
    live.set(root, s); root.dataset.enter = kind;
    queueMicrotask(() => sync(root));
  }
  // True while the screen's own arrival is being drawn by the same route change: a lane or view inside it stays still.
  const arriving = root => { const s = live.get(root); return !!s && s.kind === 'screen' && s.fresh; };
  const stamp = key => { stamps.set(key, now()); };
  function since(key) {
    const t0 = stamps.get(key); if (t0 === undefined) return null;
    const t = now() - t0; if (t >= WINDOW) { stamps.delete(key); return null; }
    return t;
  }
  // A marked card that turns out to be off screen once it is drawn simply stands there: no entrance out of view.
  let pruning = false;
  function prune() {
    pruning = false;
    document.querySelectorAll('[data-m~=in],[data-m~=in2]').forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom <= 0 || r.top >= innerHeight) el.removeAttribute('data-m'); });
  }
  const attr = (key, name) => {
    const t = since(key); if (t === null) return '';
    if (!pruning && /^in/.test(name)) { pruning = true; queueMicrotask(prune); }
    return ' data-m="'+name+'" style="--m-skip:-'+Math.round(t)+'ms"';
  };
  // A confirmation button's state: the highlight while it is on, fading in when it has just gone on and back when just off.
  const done = (key, on) => on ? ' data-done'+attr('on:'+key, 'fill') : attr('off:'+key, 'unfill');
  // Two labels in one box, so Copy and Copied (with its tick) take the same room. a and b are already-escaped HTML.
  const label = (on, a, b) => on ? '<span class="m-cf is-on" data-alt="'+a+'"><span>'+b+'<i class="m-tick" aria-hidden="true"></i></span></span>' : '<span class="m-cf" data-alt="'+b+'">'+a+'</span>';
  // Publish and Reels stages: compare the job on screen with the last render of it. The stage that has just started
  // running gets its gold bar drawn (one bar at most), the one that has just finished turns ink. A first look at a job,
  // a look after time away from it, or a look while the screen is arriving (quiet) marks nothing.
  const seen = new Map();
  function stages(id, list, quiet) {
    const last = seen.get(id), was = last && !quiet && now() - last.at < 20000 ? last.is : null;
    const is = new Map((list || []).map(s => [s.name, s.state || 'wait'])); let drawn = false;
    if (was) for (const [name, state] of is) {
      if (state === 'run' && was.get(name) !== 'run' && !drawn) { stamp('stage:'+id+':'+name+':run'); drawn = true; }
      if (state === 'done' && was.get(name) === 'run') stamp('stage:'+id+':'+name+':done');
    }
    seen.clear(); seen.set(id, {is, at:now()});
  }
  const stage = (id, s) => s.state === 'run' ? attr('stage:'+id+':'+s.name+':run', 'draw') : s.state === 'done' ? attr('stage:'+id+':'+s.name+':done', 'ink') : '';
  window.WWMotion = {enter, arriving, stamp, since, attr, done, label, stages, stage, sync};
})();
