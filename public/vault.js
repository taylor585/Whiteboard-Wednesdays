// Vault (#/vault): every finished video, thumbnail and caption (direction B "Lanes", Taylor's pick, 9 November 2026).
// Content is static: vault.json and the images in vault/, built by scripts/build-vault.py. Nothing is saved anywhere.
(() => {
  'use strict';
  const root = document.getElementById('vault');
  if (!root) return;
  const LANES = [
    { id: 'youtube', label: 'YouTube' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'instagram', label: 'Instagram', subs: [['posts', 'Posts'], ['reels', 'Reels']] },
    { id: 'facebook', label: 'Facebook', subs: [['posts', 'Posts'], ['reels', 'Reels']] },
    { id: 'thumbnails', label: 'Thumbnails', subs: [['youtube', 'YouTube'], ['linkedin', 'LinkedIn']] },
    { id: 'post-copy', label: 'Post copy', subs: [['youtube', 'YouTube descriptions'], ['instagram-posts', 'Instagram posts'], ['instagram-reels', 'Instagram reels'], ['linkedin', 'LinkedIn posts']] },
  ];
  const LANE = Object.fromEntries(LANES.map(l => [l.id, l]));
  const EMPTY = { 'instagram-posts': 'No Instagram post captions yet.', 'instagram-reels': 'No Instagram reel captions yet.' };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const num = n => n.toLocaleString('en-GB');
  const day = d => d ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d + 'T12:00')) : '';
  const dur = s => { if (s == null || s === '') return ''; s = Math.round(Number(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? h + ':' + String(m).padStart(2, '0') + ':' + x : m + ':' + x; };
  const chars = t => [...t].length;
  let data = null, loading = null, lane = 'youtube', sub = null, animate = true;
  const open = new Map(), full = new Set();
  let prevHash = '', curHash = location.hash;
  addEventListener('hashchange', () => { prevHash = curHash; curHash = location.hash; });

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch('vault.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw Error(r.status); return r.json(); })
      .then(d => { data = d; data.group = Object.fromEntries(d.groups.map(g => [g.id, g])); return d; })
      .catch(e => { loading = null; throw e; });
    return loading;
  }
  // The same reel and 4:5 post go to Instagram and Facebook (Taylor, 10 November 2026): vault.json's "shared" names the
  // lane each shared lane takes its items from, so the Facebook lane shows the Instagram records and nothing is stored twice.
  const from = l => (data && data.shared && data.shared[l]) || l;
  const items = (l, b) => data.items.filter(i => i.lane === from(l) && (!b || i.bubble === b));
  // A caption written for a lane that others share is their caption too.
  const also = it => Object.entries((data && data.shared) || {}).filter(([, src]) => it.bubble.startsWith(src + '-')).map(([to]) => LANE[to] && LANE[to].label).filter(Boolean);
  // Columns per grid at the current width, so "one row" is exactly one row.
  function cols(shape) {
    const w = innerWidth;
    if (shape === 'text') return w >= 900 ? 2 : 1;
    if (shape === 'tall') return w >= 1200 ? 5 : w >= 768 ? 4 : 2;
    return w >= 1200 ? 4 : w >= 768 ? 3 : 2;
  }

  function head() {
    return '<div class="va-head"><div class="micro">VAULT · FINISHED WORK</div><h1 id="va-heading">Vault</h1>'
      + '<p>Every finished video, thumbnail and caption in one place. Open an edit, or copy the words for a post.</p></div>';
  }
  function bar() {
    const L = LANE[lane];
    let h = '<div class="va-bar"><nav class="va-lanes" aria-label="Vault sections">'
      + LANES.map(l => '<a href="#/vault/' + l.id + '"' + (l.id === lane ? ' aria-current="page"' : '') + '>' + esc(l.label) + '</a>').join('') + '</nav>';
    if (L.subs) h += '<nav class="va-bubbles" aria-label="' + esc(L.label) + ' filter">' + L.subs.map(([id, label]) =>
      '<a href="#/vault/' + lane + '/' + id + '"' + (id === sub ? ' aria-current="true"' : '') + '>' + esc(label) + ' <i>' + (data ? items(lane, id).length : '') + '</i></a>').join('') + '</nav>';
    return h + '</div>';
  }

  function tile(kicker, title, d) {
    return '<span class="va-tile" style="height:100%"><span class="va-k">' + esc(kicker) + '</span><b>' + esc(title) + '</b></span>' + (d ? '<span class="va-dur">' + d + '</span>' : '');
  }
  function openLink(it, title) {
    return '<a class="va-btn" href="' + esc(it.artifactUrl) + '" target="_blank" rel="noopener" aria-label="Open ' + esc(title) + ' in Claude">Open</a>';
  }
  function videoCard(it, i) {
    const d = dur(it.durationSec);
    const kicker = it.lane === 'linkedin' ? 'LinkedIn cut' : 'YouTube';
    const media = it.poster ? '<img src="' + esc(it.poster) + '" alt="" loading="lazy">' + (d ? '<span class="va-dur">' + d + '</span>' : '') : tile(kicker, it.title, d);
    const when = it.posted ? 'Posted ' + day(it.posted) : (it.lane === 'youtube' ? 'Not on YouTube · finished ' : 'Finished ') + day(it.finished);
    return '<article class="va-card' + fx(i) + '"><div class="va-media" style="aspect-ratio:' + it.aspect + '">' + media + '</div>'
      + '<div class="va-info">' + (it.poster ? '<b>' + esc(it.title) + '</b>' : '') + '<span class="va-meta">' + esc(when) + (d ? ' · ' + d : '') + '</span></div>'
      + '<div class="va-act">' + openLink(it, it.title) + '</div></article>';
  }
  function igCard(it, i) {
    const d = dur(it.durationSec);
    const kind = it.bubble === 'reels' ? 'Reel' : '4:5 post';
    const media = it.poster ? '<img src="' + esc(it.poster) + '" alt="" loading="lazy">' + (d ? '<span class="va-dur">' + d + '</span>' : '') : tile(kind, it.title, d);
    return '<article class="va-card va-tall' + fx(i) + '"><div class="va-media" style="aspect-ratio:' + it.aspect + '">' + media + '</div>'
      + '<div class="va-info">' + (it.poster ? '<b>' + esc(it.title) + '</b>' : '') + '<span class="va-meta">' + kind + (d ? ' · ' + d : '') + '</span></div>'
      + '<div class="va-act">' + openLink(it, it.title) + '</div></article>';
  }
  function thumbCard(it, i) {
    const name = it.kind === 'posted-on-youtube' ? 'Posted on YouTube' : it.kind === 'final' ? 'Final pick' : 'Variation ' + it.n;
    const g = data.group[it.group];
    return '<article class="va-card' + fx(i) + '"><a class="va-media" href="' + esc(it.src) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true" style="aspect-ratio:' + it.width + '/' + it.height + '">'
      + '<img src="' + esc(it.src) + '" alt="" loading="lazy" width="' + it.width + '" height="' + it.height + '"></a>'
      + '<div class="va-info"><b>' + name + '</b><span class="va-meta">' + it.width + ' × ' + it.height + '</span></div>'
      + '<div class="va-act"><a class="va-btn" href="' + esc(it.src) + '" target="_blank" rel="noopener" aria-label="Open ' + esc(name + ', ' + g.title) + '">Open</a>'
      + '<a class="va-link" href="' + esc(it.src) + '" download="' + esc(it.id) + '.jpg">Download</a></div></article>';
  }
  function copyCard(it, i) {
    const n = chars(it.text), long = !full.has(it.id);
    let h = '<article class="va-copy' + fx(i) + '"><div class="va-pf">' + esc(it.label) + '</div>'
      + '<p class="va-text' + (long ? ' is-clamped' : '') + '" id="t-' + esc(it.id) + '">' + esc(it.text) + '</p>'
      + '<button type="button" class="va-toggle" data-more="' + esc(it.id) + '" aria-controls="t-' + esc(it.id) + '" aria-expanded="' + !long + '" hidden>' + (long ? 'Show all' : 'Show less') + '</button>';
    if (it.firstComment) h += '<div class="va-fc"><span class="va-pf">First comment</span><p>' + esc(it.firstComment) + '</p>'
      + '<div class="va-act"><button type="button" class="va-toggle" data-copy="' + esc(it.id) + '" data-part="comment">Copy comment</button></div></div>';
    const too = also(it);
    return h + '<div class="va-act"><span class="va-meta">' + num(n) + ' of ' + num(it.limit) + ' characters'
      + (too.length ? '<span class="va-also">Also the ' + esc(too.join(' and ')) + ' caption</span>' : '') + '</span>'
      + '<button type="button" class="va-btn" data-copy="' + esc(it.id) + '">Copy</button></div></article>';
  }
  let fxi = 0;
  const fx = () => { const i = fxi++; return animate && !reduced.matches && i < 8 ? ' va-in" style="--i:' + i : ''; };

  function groups(list, shape, card) {
    const key = lane + '/' + sub;
    const by = new Map();
    list.forEach(it => { if (!by.has(it.group)) by.set(it.group, []); by.get(it.group).push(it); });
    const order = data.groups.filter(g => by.has(g.id)).sort((a, b) => b.date.localeCompare(a.date));
    if (!open.has(key)) open.set(key, new Set(order.slice(0, 1).map(g => g.id)));
    const isOpen = open.get(key), c = cols(shape);
    return order.map(g => {
      const list = by.get(g.id), on = isOpen.has(g.id), all = full.has(key + '|' + g.id), show = all ? list : list.slice(0, c);
      const id = 'vg-' + lane + '-' + sub + '-' + g.id;
      let h = '<section class="va-group"><h2 class="va-gh-h"><button type="button" class="va-gh" data-group="' + esc(g.id) + '" aria-expanded="' + on + '" aria-controls="' + id + '">'
        + '<span class="va-gt"><span class="va-gn">' + esc(g.title) + '</span><span class="va-gm">' + day(g.date) + ' · ' + list.length + (list.length === 1 ? ' item' : ' items') + '</span></span>'
        + '<span class="va-chev" aria-hidden="true"></span></button></h2><div class="va-gbody" id="' + id + '"' + (on ? '' : ' hidden') + '>';
      if (on) {
        h += '<div class="va-grid is-' + shape + '">' + show.map(card).join('') + '</div>';
        if (list.length > show.length) h += '<div class="va-more"><button type="button" data-all="' + esc(g.id) + '">Show all ' + list.length + '</button></div>';
      }
      return h + '</div></section>';
    }).join('');
  }

  function body() {
    fxi = 0;
    if (lane === 'youtube' || lane === 'linkedin') {
      const list = items(lane).slice().sort((a, b) => (b.posted || b.finished).localeCompare(a.posted || a.finished));
      return list.length ? '<div class="va-videos">' + list.map(videoCard).join('') + '</div>' : '<p class="va-empty">No finished ' + LANE[lane].label + ' videos yet.</p>';
    }
    const list = items(lane, sub);
    if (!list.length) return '<p class="va-empty">' + esc(EMPTY[sub] || (from(lane) === 'instagram' ? 'No ' + LANE[lane].label + ' ' + sub + ' yet.' : 'Nothing here yet.')) + '</p>';
    if (from(lane) === 'instagram') return groups(list, 'tall', igCard);
    if (lane === 'thumbnails') return groups(list, 'wide', thumbCard);
    return groups(list, 'text', copyCard);
  }

  function paint() {
    root.innerHTML = head() + bar() + '<div class="va-body" aria-live="polite">' + (data ? body() : '<p class="va-status" role="status">Loading the vault…</p>') + '</div>';
    animate = false;
    const cur = root.querySelector('.va-lanes [aria-current]');
    if (cur) { const n = cur.parentElement, r = cur.getBoundingClientRect(), nr = n.getBoundingClientRect(); if (r.right > nr.right - 20) n.scrollLeft += r.right - nr.right + 20; else if (r.left < nr.left + 20) n.scrollLeft -= nr.left + 20 - r.left; }
    clampCheck();
    stuck();
  }
  // Show the "Show all" toggle only on captions that are actually cut off.
  function clampCheck() {
    root.querySelectorAll('[data-more]').forEach(b => {
      const t = document.getElementById(b.getAttribute('aria-controls'));
      b.hidden = !(full.has(b.dataset.more) || t.scrollHeight > t.clientHeight + 2);
    });
  }
  function stuck() { const b = root.querySelector('.va-bar'); if (b) b.classList.toggle('is-stuck', b.getBoundingClientRect().top <= 0 && scrollY > 0); }

  async function show(bits) {
    const l = LANE[bits[1]] ? bits[1] : 'youtube';
    if (bits[1] && !LANE[bits[1]]) history.replaceState(null, '', '#/vault');
    const L = LANE[l];
    let s = null;
    if (L.subs) {
      s = L.subs.some(([id]) => id === bits[2]) ? bits[2] : L.subs[0][0];
      if (bits[2] && s !== bits[2]) history.replaceState(null, '', '#/vault/' + l);
    }
    const same = l === lane && s === sub && root.querySelector('.va-body');
    const barTop = root.querySelector('.va-bar') ? root.querySelector('.va-bar').getBoundingClientRect().top + scrollY : null;
    const wasInside = prevHash.startsWith('#/vault');
    lane = l; sub = s; animate = !same;
    paint();
    // Inside the Vault, keep the filters where they were instead of jumping to the top of the page.
    if (wasInside && barTop != null) scrollTo(0, Math.min(scrollY, barTop));
    if (!data) {
      try { await load(); if (lane === l && sub === s) { animate = true; paint(); } }
      catch { root.querySelector('.va-body').innerHTML = '<p class="va-status" role="status">The vault could not be loaded. Check your connection and try again.<button type="button" data-retry>Try again</button></p>'; }
    }
  }

  async function copy(text, btn, done) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.append(ta); ta.select(); try { ok = document.execCommand('copy'); } catch { ok = false; } ta.remove();
    }
    const t = document.getElementById('toast');
    if (t) { t.textContent = ok ? 'Copied to the clipboard.' : 'Copy did not work here. Select the text and copy it instead.'; t.hidden = false; clearTimeout(copy.timer); copy.timer = setTimeout(() => { t.hidden = true; }, 2400); }
    if (!ok) return;
    const was = btn.textContent; btn.textContent = done; btn.classList.add('is-done');
    setTimeout(() => { btn.textContent = was; btn.classList.remove('is-done'); }, 1600);
  }

  root.addEventListener('click', e => {
    const g = e.target.closest('[data-group]');
    if (g) { const set = open.get(lane + '/' + sub); set.has(g.dataset.group) ? set.delete(g.dataset.group) : set.add(g.dataset.group); const y = g.getBoundingClientRect().top; repaint(); const n = root.querySelector('[data-group="' + CSS.escape(g.dataset.group) + '"]'); n.focus({ preventScroll: true }); scrollBy(0, n.getBoundingClientRect().top - y); return; }
    const a = e.target.closest('[data-all]');
    if (a) { full.add(lane + '/' + sub + '|' + a.dataset.all); const gid = a.dataset.all; repaint(); root.querySelector('[data-group="' + CSS.escape(gid) + '"]').closest('.va-group').querySelectorAll('.va-card,.va-copy')[cols(from(lane) === 'instagram' ? 'tall' : lane === 'thumbnails' ? 'wide' : 'text')]?.querySelector('a,button')?.focus({ preventScroll: true }); return; }
    const m = e.target.closest('[data-more]');
    if (m) { const id = m.dataset.more, t = document.getElementById(m.getAttribute('aria-controls')); full.has(id) ? full.delete(id) : full.add(id); const on = full.has(id); t.classList.toggle('is-clamped', !on); m.setAttribute('aria-expanded', String(on)); m.textContent = on ? 'Show less' : 'Show all'; return; }
    const c = e.target.closest('[data-copy]');
    if (c) { const it = data.items.find(i => i.id === c.dataset.copy); if (it) copy(c.dataset.part === 'comment' ? it.firstComment : it.text, c, c.dataset.part === 'comment' ? 'Copied' : 'Copied'); return; }
    if (e.target.closest('[data-retry]')) show(['vault', lane, sub]);
  });
  function repaint() { const y = scrollY; animate = false; root.querySelector('.va-body').innerHTML = body(); clampCheck(); scrollTo(0, y); }

  let lastCols = null;
  addEventListener('resize', () => {
    if (root.hidden || !data) return;
    const k = [cols('wide'), cols('tall'), cols('text')].join();
    if (k !== lastCols) { lastCols = k; repaint(); } else clampCheck();
  });
  addEventListener('scroll', () => { if (!root.hidden) stuck(); }, { passive: true });
  addEventListener('ww:route', e => { if (e.detail[0] === 'vault') { lastCols = [cols('wide'), cols('tall'), cols('text')].join(); show(e.detail); } });
})();
