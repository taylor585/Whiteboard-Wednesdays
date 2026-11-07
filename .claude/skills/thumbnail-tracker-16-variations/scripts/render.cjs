#!/usr/bin/env node
// Render thumbnail specs (JSON) to 1280x720 PNGs, plus a feed-size preview sheet.
// Usage: node render.cjs spec.json [outDir]
// Env: THUMB_OFFLINE=1 (block Google Fonts, use bundled fonts only), THUMB_FONTS=google (old Google-hosted fonts)
// Spec: { "thumbnails": [ { "id": "...", "archetype": "verdict|equation|command|proof|syllabus|marker", ... } ] }
// See references/spec.md for every field.

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  const tries = ['playwright', '/opt/node-tools/node_modules/playwright', 'playwright-core'];
  for (const t of tries) { try { return require(t); } catch (_) {} }
  console.error('Playwright not found. Install with: npm i -g playwright (and a Chromium build).');
  process.exit(1);
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const THEMES = {
  light:  { bg: '#FAFAF8', ink: '#111111', sub: '#5b5b5b', card: '#FFFFFF', grid: true },
  cream:  { bg: '#F3EEE4', ink: '#141210', sub: '#5e574d', card: '#FFFFFF' },
  dark:   { bg: '#0B0B0D', ink: '#FFFFFF', sub: '#a9a9b2', card: '#17171B', glow: true },
  purple: { bg: '#5B2EE8', ink: '#FFFFFF', sub: '#e4dcff', card: '#FFFFFF', grad: '#7A4DFF' },
  green:  { bg: '#0E2A22', ink: '#FFFFFF', sub: '#b6d6c8', card: '#13362C', glow: true },
  red:    { bg: '#7A0E12', ink: '#FFFFFF', sub: '#ffd0d0', card: '#FFFFFF', glow: true },
};

// ---------- small building blocks ----------

function iconInner(icon, size) {
  // icon: "si:<slug>" (Simple Icons), "img:<path or url>", "glyph:<text/emoji>", "/cmd" text
  if (!icon) return '';
  if (icon.startsWith('si:')) {
    const slug = icon.slice(3);
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/${slug}.svg`;
    return `<div class="si" style="width:${size * 0.56}px;height:${size * 0.56}px;-webkit-mask:url(${url}) center/contain no-repeat;mask:url(${url}) center/contain no-repeat"></div>`;
  }
  if (icon.startsWith('img:')) {
    return `<img src="${esc(toUrl(icon.slice(4)))}" style="width:${size * 0.64}px;height:${size * 0.64}px;object-fit:contain">`;
  }
  const g = icon.startsWith('glyph:') ? icon.slice(6) : icon;
  const fs_ = g.length <= 2 ? size * 0.5 : Math.max(18, size * 0.9 / Math.max(3, g.length * 0.62));
  return `<span class="glyph" style="font-size:${fs_}px">${esc(g)}</span>`;
}

function toUrl(p) {
  if (/^(https?:|data:|file:)/.test(p)) return p;
  return 'file://' + path.resolve(p);
}

// A glossy 3D app tile. t = { icon, color, fg, size, x, y, glow, crossed, label, sad }
function tile(t, accent) {
  const size = t.size || 220;
  const color = t.color || accent;
  const fg = t.fg || '#FFFFFF';
  const glow = t.glow ? `0 0 ${size * 0.45}px ${hexA(color, 0.75)}, ` : '';
  return `
  <div class="tile" style="left:${t.x - size / 2}px;top:${t.y - size / 2}px;width:${size}px;height:${size}px;
       border-radius:${size * 0.23}px;background:linear-gradient(160deg, ${lighten(color, 0.22)} 0%, ${color} 55%, ${darken(color, 0.18)} 100%);
       box-shadow:${glow}0 ${size * 0.08}px ${size * 0.16}px rgba(0,0,0,.35), inset 0 ${size * 0.03}px 0 rgba(255,255,255,.45), inset 0 -${size * 0.04}px ${size * 0.06}px rgba(0,0,0,.18);color:${fg}">
    <div class="shine" style="border-radius:${size * 0.23}px"></div>
    ${iconInner(t.icon, size)}
    ${t.crossed ? crossSvg(size) : ''}
  </div>
  ${t.label ? `<div class="tile-label" style="left:${t.x - 200}px;top:${t.y + size / 2 + 12}px">${esc(t.label)}</div>` : ''}`;
}

function crossSvg(size) {
  return `<svg class="cross" viewBox="0 0 100 100" style="width:${size * 1.15}px;height:${size * 1.15}px;left:${-size * 0.075}px;top:${-size * 0.075}px">
    <path d="M10 12 L90 88" stroke="#E5251F" stroke-width="11" stroke-linecap="round"/>
    <path d="M90 10 L12 90" stroke="#E5251F" stroke-width="11" stroke-linecap="round"/></svg>`;
}

// Hand-drawn curved arrow from [x1,y1] to [x2,y2]; bend > 0 curves right of travel.
// Canvas size for the thumbnail being rendered (default 1280x720; LinkedIn portrait etc. set spec.canvas).
let CW = 1280, CH = 720;

function arrow(a, color) {
  if (!a) return '';
  const [x1, y1] = a.from, [x2, y2] = a.to;
  const bend = a.bend ?? 0.35;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const cx = mx - dy * bend, cy = my + dx * bend;
  // arrowhead direction = tangent at end (from control point to end)
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const h = a.head || 26;
  const p1 = [x2 - h * Math.cos(ang - 0.5), y2 - h * Math.sin(ang - 0.5)];
  const p2 = [x2 - h * Math.cos(ang + 0.5), y2 - h * Math.sin(ang + 0.5)];
  const c = a.color || color;
  const w = a.width || 7;
  return `<svg class="arrow" viewBox="0 0 ${CW} ${CH}"><g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}"/>
    <path d="M${p1[0]} ${p1[1]} L${x2} ${y2} L${p2[0]} ${p2[1]}"/></g></svg>`;
}

// Headline with optional highlighted word(s): underline (hand-drawn), box (accent fill), color, strike.
function headlineHtml(s, accent, theme) {
  if (!s.headline) return '';
  let html = esc(s.headline).replace(/\n/g, '<br>');
  const marks = [].concat(s.highlight || []);
  const style = s.highlight_style || 'underline';
  for (const m of marks) {
    const e = esc(m);
    const span = {
      underline: `<span class="hl-u">${e}<svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M3 13 C 50 5, 120 4, 197 10" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span>`,
      box: `<span class="hl-box" style="background:${accent};color:${s.box_text || '#fff'}">${e}</span>`,
      color: `<span style="color:${accent}">${e}</span>`,
      strike: `<span class="hl-strike">${e}<svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M2 12 L198 9" stroke="#E5251F" stroke-width="5" fill="none" stroke-linecap="round"/></svg></span>`,
    }[style];
    html = html.replace(e, span);
  }
  const font = { sans: 'f-sans', marker: 'f-marker', mono: 'f-mono', condensed: 'f-cond', serif: 'f-serif', hand: 'f-hand' }[s.font || 'sans'];
  const box = s.headline_box || { x: 60, y: 40, w: 1160, h: 150 };
  const align = s.headline_align || 'center';
  return `<div class="headline ${font} fit" data-maxw="${box.w}" data-maxh="${box.h}"
    style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;text-align:${align};color:${s.headline_color || theme.ink};
    justify-content:${align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'}"><div class="fit-inner" data-grow="${s.headline_max || 190}" style="font-size:${s.headline_size || 130}px">${html}</div></div>`;
}

// The creator's face. If no photo is supplied, a neutral placeholder bust keeps the composition honest.
function face(s, theme) {
  const f = s.face;
  if (!f) return '';
  if (f.frame === 'circle') return circleFace(f, theme);
  const side = f.side || 'right';
  const w = f.width || 500;
  const drop = `bottom:${-(f.drop || 0)}px`;
  const pos = (side === 'right' ? `right:${f.offset ?? -10}px` : side === 'left' ? `left:${f.offset ?? -10}px` : `left:${(f.cx ?? 640) - w / 2}px`) + ';' + drop;
  if (f.src) {
    // Expect a background-removed PNG (scripts/prep_face.py). Height drives size; width follows the photo.
    const fpos = (side === 'center' ? `left:${f.cx ?? 640}px;transform:translateX(-50%)${f.flip ? ' scaleX(-1)' : ''}` : (side === 'left' ? `left:${f.offset ?? 0}px` : `right:${f.offset ?? 0}px`) + (f.flip ? ';transform:scaleX(-1)' : '')) + ';' + drop;
    return `<img class="face" src="${esc(toUrl(f.src))}" style="${fpos};height:${f.height || 690}px;width:auto;filter:drop-shadow(0 10px 30px rgba(0,0,0,.3))">`;
  }
  const gid = 'g' + Math.random().toString(36).slice(2, 8);
  const skin = theme.ink === '#FFFFFF' ? '#3a3a42' : '#cfcac2';
  const shade = theme.ink === '#FFFFFF' ? '#24242a' : '#b7b1a7';
  return `<div class="face ph" style="${pos};width:${w}px;height:690px">
    <svg viewBox="0 0 500 690" width="${w}" height="690">
      <defs><linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient></defs>
      <path fill="url(#${gid})" d="M250 95 C 330 95 378 160 378 245 C 378 310 352 362 318 392 L 322 440
        C 410 462 470 520 486 690 L 14 690 C 30 520 90 462 178 440 L 182 392 C 148 362 122 310 122 245 C 122 160 170 95 250 95 Z"/>
    </svg>
    <div class="ph-label">${esc(f.ph || 'YOUR PHOTO')} · ${esc(f.pose || 'chin-hand')}</div>
  </div>`;
}

// Face inside a ringed circle (e.g. a brand's brass-bordered presenter frame).
function circleFace(f, theme) {
  const d = f.d || 400, cx = f.cx ?? 1040, cy = f.cy ?? 460;
  const ring = f.ring || '#8B6002', inset = f.inset || '#EFE2CB';
  const inner = f.src
    ? `<img src="${esc(toUrl(f.src))}" style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);height:${d * 1.05}px;width:auto">`
    : `<svg viewBox="0 0 500 690" style="position:absolute;left:50%;bottom:-${d * 0.06}px;transform:translateX(-50%);width:${d * 0.95}px;height:auto">
         <path fill="${f.bust || '#B9AC95'}" d="M250 95 C 330 95 378 160 378 245 C 378 310 352 362 318 392 L 322 440 C 410 462 470 520 486 690 L 14 690 C 30 520 90 462 178 440 L 182 392 C 148 362 122 310 122 245 C 122 160 170 95 250 95 Z"/></svg>
       <div class="ph-label" style="top:${d * 0.42}px;left:50%;transform:translateX(-50%);white-space:nowrap">${esc(f.ph || 'YOUR PHOTO')} · ${esc(f.pose || 'expression')}</div>`;
  return `<div class="face-circle" style="${f.shadow ? 'box-shadow:0 18px 40px rgba(0,0,0,.35);' : ''}left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px;border:${f.ring_w || 8}px solid ${ring};background:${inset}">${inner}</div>`;
}

function hexA(hex, a) {
  const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`;
}
function hexRgb(hex) {
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function mix(hex, to, t) {
  const a = hexRgb(hex), b = hexRgb(to);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
const lighten = (h, t) => mix(h, '#ffffff', t);
const darken = (h, t) => mix(h, '#000000', t);

// ---------- archetypes ----------

const LAYOUTS = {
  // Big verdict line + hero icon (optionally rivals crossed out). Object-only or with face.
  verdict(s, acc, th) {
    const withFace = !!s.face;
    const cx = withFace ? 420 : 640;
    const hero = { size: withFace ? 320 : 360, glow: true, ...(s.hero || {}), x: s.hero?.x ?? cx, y: s.hero?.y ?? 450 };
    const rivals = (s.rivals || []).map((r, i, arr) => {
      const spread = withFace ? 280 : 360;
      const x = arr.length === 1 ? cx + spread : cx + (i === 0 ? -spread : spread);
      return tile({ size: 210, crossed: true, ...r, x: r.x ?? x, y: r.y ?? 480 }, acc);
    }).join('');
    const hb = withFace ? { x: 50, y: 40, w: 760, h: 170 } : { x: 60, y: 36, w: 1160, h: 150 };
    s.headline_box = s.headline_box || hb;
    s.headline_align = s.headline_align || (withFace ? 'left' : 'center');
    const arr = s.arrow === false ? '' : arrow(s.arrow || { from: [withFace ? 640 : 900, 190], to: [hero.x + hero.size * 0.42, hero.y - hero.size * 0.45], bend: -0.35 }, th.ink);
    const pedestal = s.pedestal ? `<div class="pedestal" style="left:${hero.x - 230}px;top:${hero.y + 130}px;background:linear-gradient(${lighten(acc, .1)},${darken(acc, .45)})"></div>` : '';
    const burst = s.burst ? `<div class="burst" style="left:${hero.x - 640}px;top:${hero.y - 640}px;background:repeating-conic-gradient(from 0deg, ${hexA(acc, .35)} 0deg 6deg, transparent 6deg 18deg)"></div>` : '';
    return burst + pedestal + rivals + tile(hero, acc) + arr + headlineHtml(s, acc, th) + face(s, th);
  },

  // A + B (= C): the "stack" story.
  equation(s, acc, th) {
    const items = s.items || [];
    const n = items.length;
    const size = s.tile_size || (n > 2 ? 240 : 310);
    const gap = n > 2 ? 120 : 170;
    const total = n * size + (n - 1) * gap;
    let x = 640 - total / 2 + size / 2;
    let out = '';
    items.forEach((it, i) => {
      out += tile({ size, glow: it.glow ?? true, ...it, x, y: s.row_y || 450 }, acc);
      if (i < n - 1) {
        const op = (s.ops || [])[i] ?? '+';
        const ry = s.row_y || 450;
        if (op === '->' || op === '→') {
          out += arrow({ from: [x + size / 2 + 22, ry + 10], to: [x + size / 2 + gap - 22, ry - 6], bend: 0.18, width: 9, head: 30 }, th.ink);
        } else if (op) {
          out += `<div class="op" style="left:${x + size / 2}px;top:${ry - 75}px;width:${gap}px;color:${th.ink}">${esc(op)}</div>`;
        }
      }
      x += size + gap;
    });
    s.headline_box = s.headline_box || { x: 60, y: 36, w: 1160, h: 150 };
    return out + headlineHtml(s, acc, th) + (s.arrow ? arrow(s.arrow, th.ink) : '');
  },

  // macOS window with a slash command, face on the right, arrow from the face to the window.
  command(s, acc, th) {
    // icon may be a string ("si:claude") or a tile object ({icon, color, fg})
    const cmdIcon = !s.icon ? null : typeof s.icon === 'string' ? { icon: s.icon } : s.icon;
    const cmdColor = cmdIcon?.color || acc;
    const chips = (s.chips || []).map((c) => `<span class="chip" style="border-color:${hexA(acc, .6)};color:${acc}">${esc(c)}</span>`).join('');
    const win = `<div class="win" style="background:${th.card}">
      <div class="dots"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i></div>
      <div class="win-body">
        ${cmdIcon ? `<div class="win-tile" style="background:linear-gradient(160deg, ${lighten(cmdColor, .2)}, ${cmdColor});color:${cmdIcon.fg || '#fff'}">${iconInner(cmdIcon.icon, 150)}</div>` : ''}
        <div class="cmd f-mono fit" data-maxw="${cmdIcon ? 560 : 720}" data-maxh="170" style="color:${th.ink === '#FFFFFF' ? '#fff' : '#161616'}"><div class="fit-inner" style="font-size:124px">${esc(s.command || '/command')}</div></div>
      </div>
      ${chips ? `<div class="chips">${chips}</div>` : ''}
    </div>`;
    if (s.face === undefined) s.face = { side: 'right' };
    const arr = s.arrow === false ? '' : arrow(s.arrow || { from: [985, 610], to: [880, 360], bend: -0.4, color: acc, width: 9 }, acc);
    return win + face(s, th) + arr + (s.headline ? headlineHtml({ ...s, headline_box: s.headline_box || { x: 60, y: 40, w: 760, h: 110 }, headline_align: 'left' }, acc, th) : '');
  },

  // Proof card: stripe notifications, payments table, benchmark bars, or a rising chart.
  proof(s, acc, th) {
    const p = s.proof || { type: 'stripe' };
    let card = '';
    const blur = (v) => (p.blur ? `<span class="blur">${esc(v)}</span>` : esc(v));
    if (p.type === 'stripe') {
      card = (p.items || ['$2,500.00', '$2,500.00', '$2,500.00']).map((amt, i) => `
        <div class="notif" style="top:${i * 142}px"><div class="s-logo">S</div><div><b>Stripe</b><span class="now">now</span><br>You received a payment of ${esc(amt)}</div></div>`).join('');
      card = `<div class="proof-wrap" style="left:50px;top:${s.headline ? 215 : 150}px;width:740px;height:440px">${card}</div>`;
    } else if (p.type === 'payments') {
      const rows = (p.items || ['1,500.00', '2,500.00', '2,500.00', '1,850.00', '3,000.00']).map((a) => `<tr><td>${blur('$' + a)}</td><td>USD</td><td><span class="ok">Succeeded ✓</span></td></tr>`).join('');
      card = `<div class="paycard" style="left:60px;top:${s.headline ? 215 : 160}px"><div class="pc-title">Payments</div><table>${rows}</table></div>`;
    } else if (p.type === 'bars') {
      const bars = (p.items || []).map((b, i) => `<div class="bar-row"><div class="bar-l">${esc(b.label)}</div>
        <div class="bar" style="width:${Math.max(8, b.value) * 4.6}px;background:${i === 0 ? '#fff' : 'repeating-linear-gradient(45deg,#3a3a3a 0 6px,#222 6px 12px)'};color:${i === 0 ? '#111' : '#fff'}">${esc(b.value)}%</div></div>`).join('');
      card = `<div class="barcard" style="left:${s.face ? 60 : 200}px;top:${s.headline ? 230 : 170}px"><div class="bc-title">${esc(p.title || 'Benchmark')}</div>${bars}</div>`;
    } else if (p.type === 'card') {
      card = `<div class="rcard" style="left:${p.x ?? 60}px;top:${p.y ?? (s.headline ? 250 : 170)}px;transform:rotate(${p.rotate ?? -3}deg);border-color:${p.border || acc}">
        <div class="rc-top">${esc(p.label_top || 'REPORT')}</div>
        <div class="rc-row"><span class="rc-rank" style="background:${p.rank_bg || acc}">${esc(p.rank || '#1')}</span><span class="rc-name">${esc(p.name || '')}</span></div>
        <div class="rc-val"><span style="background:${p.value_bg || '#F6DF8C'}">${esc(p.value || '')}</span><small>${esc(p.value_label || '')}</small></div></div>`;
    } else if (p.type === 'chart') {
      card = `<div class="chartcard" style="left:60px;top:${s.headline ? 215 : 150}px">
        <div class="cc-k">${esc(p.title || 'Monthly revenue')}</div><div class="cc-v">${esc(p.value || '$12,937.00')}</div>
        ${chartSvg(p, acc)}</div>`;
    }
    if (s.face === undefined) s.face = { side: 'right' };
    const lbl = s.label ?? p.label, lpos = s.label_pos ?? p.label_pos;
    const label = lbl ? `<div class="hand-label f-hand" style="color:${th.ink};${lpos || (s.headline ? 'left:70px;top:610px' : 'left:470px;top:40px')}">${esc(lbl)}</div>` : '';
    const arr = s.arrow ? arrow(s.arrow, th.ink) : '';
    return card + face(s, th) + label + arr + (s.headline ? headlineHtml({ ...s, headline_box: s.headline_box || { x: 50, y: 30, w: 780, h: 160 }, headline_align: s.headline_align || 'left' }, acc, th) : '');
  },

  // Whiteboard or terminal syllabus for full-course videos.
  syllabus(s, acc, th) {
    const items = (s.items || []).map((it, i) => `<li><span class="num">${i + 1}.</span> ${esc(it)}</li>`).join('');
    let board;
    if (s.board === 'terminal') {
      const lines = (s.items || []).map((it, i) => `<div>${i + 1}. ${esc(it)} <span class="dots-t">${'.'.repeat(Math.max(3, 30 - it.length))}</span></div>`).join('');
      board = `<div class="terminal f-mono"><div class="t-cmd">$ ${esc(s.command || 'course --outline')}</div>
        <div class="t-box" style="color:${acc};border-color:${acc}">${esc(s.headline || 'FULL COURSE')}</div>${lines}<div class="t-ready">&gt; Ready to begin. Press Enter to start...<span class="caret"></span></div></div>`;
    } else {
      board = `<div class="whiteboard">
        ${s.icon ? `<div class="wb-icon" style="background:${acc}">${iconInner(s.icon, 110)}</div>` : ''}
        <div class="wb-title f-marker fit" data-maxw="${s.icon ? 520 : 650}" data-maxh="150" style="${s.icon ? 'left:160px;width:520px' : ''}"><div class="fit-inner" style="font-size:66px">${esc(s.headline || 'FULL COURSE').replace(/\n/g, '<br>')}</div></div>
        <ol class="wb-list f-hand">${items}</ol>
        ${s.doodle === false ? '' : doodles(s.doodle_labels)}
      </div>`;
    }
    if (s.face === undefined) s.face = { side: 'right', width: 470 };
    return board + face(s, th) + (s.tag ? `<div class="tag" style="background:${acc}">${esc(s.tag)}</div>` : '');
  },

  // Big hand-lettered statement, face on the right. For opinion and "truth" videos.
  marker(s, acc, th) {
    if (s.face === undefined) s.face = { side: 'right' };
    s.font = s.font || 'marker';
    s.headline_box_set = !!s.headline_box;
    s.headline_box = s.headline_box || { x: 50, y: 60, w: 760, h: 600 };
    s.headline_align = s.headline_align || 'left';
    const smear = s.smear ? `<div class="smear" style="top:${s.smear_y || 70}px"></div>` : '';
    // Optional hero object so the statement isn't text-only (text with no object underperforms).
    let hero = '';
    if (s.hero) {
      if (!s.headline_box_set) s.headline_box = { x: 50, y: 40, w: 760, h: 400 };
      hero = tile({ size: 200, glow: true, ...s.hero, x: s.hero.x ?? 620, y: s.hero.y ?? 560 }, acc);
      if (s.arrow !== false) hero += arrow(s.arrow || { from: [200, 500], to: [495, 585], bend: 0.3 }, acc);
    }
    // Optional chain of steps under the line, e.g. Quote → Finding → Creative.
    let chain = '';
    if (s.chain) {
      chain = `<div class="chain" style="top:${s.chain_y || 470}px">` + s.chain.map((c, i) =>
        `${i ? `<span class="chain-arrow" style="color:${acc}">→</span>` : ''}<span class="chain-step" style="border-color:${acc};${i === (s.chain_highlight ?? -1) ? 'background:#F6DF8C;' : ''}">${esc(c)}</span>`).join('') + '</div>';
    }
    return smear + headlineHtml(s, acc, th) + hero + chain + face(s, th);
  },

  // Sabri's caption bar: centred face, a contrarian command across the bottom with one red-boxed word,
  // and a handwritten proof label pointing at the head.
  caption(s, acc, th) {
    if (s.face === undefined) s.face = { side: 'center', width: 620, drop: 60 };
    const box = s.headline_box || { x: 30, y: 500, w: 1220, h: 190 };
    const band = `<div class="cap-band" style="top:${box.y - 10}px"></div>`;
    const line = headlineHtml({ ...s, font: s.font || 'condensed', headline_box: box, headline_align: 'center',
      highlight_style: s.highlight_style || 'box', headline_color: s.headline_color || '#fff', headline_size: s.headline_size || 150, headline_max: s.headline_max || 210 },
      s.box_color || '#E5251F', th);
    const label = s.label ? `<div class="hand-label f-hand" style="color:${s.label_color || '#fff'};${s.label_pos || 'left:60px;top:120px'};font-size:62px;transform:rotate(-4deg)">${esc(s.label)}</div>` : '';
    const arr = s.label && s.arrow !== false ? arrow(s.arrow || { from: [300, 215], to: [430, 300], bend: 0.35, color: s.label_color || '#fff', width: 6 }, '#fff') : '';
    return face(s, th) + band + line + label + arr;
  },

  // Sabri's before/after split: two states of one thing either side of a centred face.
  split(s, acc, th) {
    if (s.face === undefined) s.face = { side: 'center', width: 520 };
    const L = { color: '#C8322B', label: 'BEFORE', ...(s.left || {}) };
    const R = { color: '#1F9D55', label: 'AFTER', ...(s.right || {}) };
    const halves = `<div class="split-half" style="left:0;background:linear-gradient(90deg, ${hexA(L.color, .55)}, ${hexA(L.color, .12)})"></div>
      <div class="split-half" style="right:0;background:linear-gradient(270deg, ${hexA(R.color, .55)}, ${hexA(R.color, .12)})"></div>`;
    const extra = (o, x) => {
      if (o.grid) {
        const n = o.grid.n || 8, lit = o.grid.lit || 2;
        const cells = Array.from({ length: n }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('');
        return `<div class="adgrid" style="left:${x - 170}px">${cells}<span class="adgrid-cap">${esc(o.grid.caption || '')}</span></div>`;
      }
      if (o.donut) {
        const cols = o.donut_colors || ['#1C1A17', '#8B6002', '#CB8E03', '#D9CBB2'];
        let acc0 = 0; const stops = o.donut.map((v, i) => { const a = `${cols[i]} ${acc0}% ${acc0 + v}%`; acc0 += v; return a; });
        stops.push(`${cols[cols.length - 1]} ${acc0}% 100%`);
        const labels = o.donut.map((v, i) => `<span><i style="background:${cols[i]}"></i>${v}%</span>`).join('');
        return `<div class="donut-wrap" style="left:${x - 160}px"><div class="donut" style="background:conic-gradient(${stops.join(',')})"></div><div class="donut-legend">${labels}</div></div>`;
      }
      return '';
    };
    const side = (o, x) => extra(o, x) + (o.icon ? tile({ size: 230, glow: true, ...o, color: o.tile_color || o.color, label: undefined, x, y: 320 }, acc) : '') +
      (o.big ? `<div class="split-big f-cond" style="left:${x - 200}px;color:${o.text_color || '#fff'}">${esc(o.big)}</div>` : '') +
      `<div class="split-label f-cond" style="left:${x - 200}px;background:${o.color}">${esc(o.label)}</div>`;
    const arr = s.arrow === false ? '' : arrow(s.arrow || { from: [330, 130], to: [950, 130], bend: -0.12, color: th.ink, width: 8 }, th.ink);
    return halves + side(L, 230) + side(R, 1050) + face(s, th) + arr + (s.headline ? headlineHtml({ ...s, headline_box: s.headline_box || { x: 340, y: 20, w: 600, h: 90 } }, acc, th) : '');
  },

  // Pinned quote card (a real buyer quote) with the presenter beside it.
  quote(s, acc, th) {
    const q = { label: 'REAL QUOTE', text: '', ...(s.quote || {}) };
    let txt = esc(q.text).replace(/\n/g, '<br>');
    if (q.highlight) txt = txt.replace(esc(q.highlight), `<span style="color:${q.highlight_color || '#B3261E'}">${esc(q.highlight)}</span>`);
    const card = `<div class="qcard" style="border-color:${q.border || acc}">
      <span class="pin" style="background:${q.border || acc}"></span>
      <div class="q-label">${esc(q.label)}</div>
      <div class="q-text f-serif fit" data-maxw="${q.w || 640}" data-maxh="300"><div class="fit-inner" data-grow="190" style="font-size:120px">${txt}</div></div>
      ${q.missed ? `<div class="q-missed"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#B3261E" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/><path d="m16 3 5 5m0-5-5 5"/></svg><span>${esc(q.missed)}</span></div>` : ''}
    </div>`;
    if (s.face === undefined) s.face = { frame: 'circle', d: 360, cx: 1070, cy: 500 };
    return card + face(s, th) + (s.arrow ? arrow(s.arrow, acc) : '');
  },

  // Free-placement scene: objects carry the idea when there's no presenter photo.
  // elements: head, bubble, card, doc, lens, highlighter, sticky, chip (see spec.md).
  scene(s, acc, th) {
    const els = (s.elements || []).map((e) => {
      const pos = `left:${e.x || 0}px;top:${e.y || 0}px;${e.rotate ? `transform:rotate(${e.rotate}deg);` : ''}z-index:${e.z ?? 4}`;
      const hl = (t) => { let h = esc(t || '').replace(/\n/g, '<br>'); for (const m of [].concat(e.highlight || [])) h = h.replace(esc(m), `<mark style="background:${e.highlight_bg || '#F6DF8C'};color:inherit;padding:0 .12em">${esc(m)}</mark>`); for (const m of [].concat(e.red || [])) h = h.replace(esc(m), `<span style="color:${e.red_color || '#B3261E'}">${esc(m)}</span>`); return h; };
      if (e.type === 'head') {
        const w = e.w || 420, flip = e.facing === 'left' ? 'transform:scaleX(-1);' : '';
        return `<svg class="sc-head" viewBox="0 0 440 520" style="${pos};width:${w}px;height:${w * 520 / 440}px;${flip}filter:drop-shadow(0 18px 30px rgba(28,26,23,.25))">
          <path d="M150 515 L150 420 C 105 385 78 335 78 270 C 78 150 165 60 270 60 C 352 60 405 112 420 182 L 424 222 L 440 262 C 444 270 438 276 430 277 L 422 278 L 426 300 C 427 307 421 311 415 312 L 420 330 C 424 352 404 362 380 360 L 352 357 L 342 420 L 342 515 Z"
            fill="${e.fill || '#1C1A17'}" stroke="${e.stroke || acc}" stroke-width="${e.stroke_w || 8}" stroke-linejoin="round"/>
          ${e.glow ? `<circle cx="250" cy="215" r="95" fill="${e.glow}" opacity=".95"/><circle cx="250" cy="215" r="95" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>` : ''}
          ${e.icon_text ? `<text x="250" y="232" text-anchor="middle" font-family="Fraunces" font-weight="700" font-size="56" fill="${e.icon_color || '#1C1A17'}">${esc(e.icon_text)}</text>` : ''}</svg>`;
      }
      if (e.type === 'bubble') {
        const w = e.w || 520, h = e.h || 260;
        const trail = (e.trail || []).map((c, i) => `<span class="sc-dot" style="left:${c[0]}px;top:${c[1]}px;width:${c[2] || 30 - i * 8}px;height:${c[2] || 30 - i * 8}px;border-color:${e.border || acc}"></span>`).join('');
        return trail + `<div class="sc-bubble" style="${pos};width:${w}px;min-height:${h}px;border-color:${e.border || acc}">
          ${e.label ? `<div class="sc-label">${esc(e.label)}</div>` : ''}
          <div class="sc-btext f-serif fit" data-maxw="${w - 150}" data-maxh="${h - (e.label ? 120 : 90)}"><div class="fit-inner" data-grow="${e.max || 110}" style="font-size:${e.size || 70}px">${hl(e.text)}</div></div></div>`;
      }
      if (e.type === 'card') {
        return `<div class="rcard" style="${pos};width:${e.w || 520}px;border-color:${e.border || acc}">
          <div class="rc-top">${esc(e.label_top || 'REPORT')}</div>
          <div class="rc-row"><span class="rc-rank" style="background:${e.rank_bg || acc}">${esc(e.rank || '#1')}</span><span class="rc-name" style="font-size:${e.name_size || 34}px">${esc(e.name || '')}</span></div>
          <div class="rc-val"><span style="background:${e.value_bg || '#F6DF8C'};font-size:${e.value_size || 96}px">${esc(e.value || '')}</span><small>${esc(e.value_label || '')}</small></div></div>`;
      }
      if (e.type === 'doc') {
        const lines = (e.lines || []).map((l) => typeof l === 'string' ? `<p>${hl(l)}</p>` : l.kind === 'redacted' ? `<p class="redacted">${l.tag ? `<b class="sc-tag" style="background:${l.tag_bg || acc}">${esc(l.tag)}</b>` : ''}<span class="bar" style="width:${l.w || 80}%"></span></p>` : `<p class="${l.kind || ''}">${l.tag ? `<b class="sc-tag" style="background:${l.tag_bg || acc}">${esc(l.tag)}</b>` : ''}${hl(l.text)}</p>`).join('');
        return `<div class="sc-doc${e.dark ? ' dark' : ''}" style="${pos};width:${e.w || 560}px;min-height:${e.h || 400}px${e.bg ? `;background:${e.bg}` : ''}">${e.title ? `<div class="sc-doc-title">${esc(e.title)}</div>` : ''}${lines}</div>`;
      }
      if (e.type === 'lens') {
        const d = e.d || 260;
        const lbg = e.bg ? `background:${e.bg};` : '', lfg = e.fg ? `color:${e.fg};` : '';
        const lglow = e.glow ? `box-shadow:0 0 0 6px ${hexA(e.glow, .35)},0 0 80px 20px ${hexA(e.glow, .55)},0 24px 50px rgba(0,0,0,.5);` : '';
        return `<div class="sc-lens" style="${pos};width:${d}px;height:${d}px;border-color:${e.ring || '#1C1A17'};${lbg}${lfg}${lglow}"><div class="sc-lens-in f-serif" style="font-size:${e.size || 44}px">${hl(e.text)}</div>
          <span class="sc-lens-handle" style="background:${e.ring || '#1C1A17'};width:${d * 0.55}px;left:${d * 0.78}px;top:${d * 0.86}px"></span></div>`;
      }
      if (e.type === 'highlighter') {
        const w = e.w || 300;
        return `<svg viewBox="0 0 300 60" style="position:absolute;${pos};width:${w}px;height:${w / 5}px;filter:drop-shadow(0 8px 12px rgba(0,0,0,.25))">
          <rect x="40" y="10" width="200" height="40" rx="10" fill="${e.body || '#1C1A17'}"/><rect x="230" y="14" width="40" height="32" rx="6" fill="${e.cap || acc}"/>
          <path d="M40 18 L6 26 L6 34 L40 42 Z" fill="${e.tip || '#F6DF8C'}"/><rect x="70" y="24" width="120" height="6" rx="3" fill="${e.cap || acc}" opacity=".8"/></svg>`;
      }
      if (e.type === 'sticky') {
        return `<div class="sc-sticky" style="${pos};width:${e.w || 260}px;background:${e.color || '#F6DF8C'}">${e.label ? `<div class="sc-label">${esc(e.label)}</div>` : ''}<div class="sc-stext">${hl(e.text)}</div></div>`;
      }
      if (e.type === 'glow') {
        // Soft light pool: x,y is the centre.
        const d = e.d || 700;
        return `<div style="position:absolute;left:${(e.x || 0) - d / 2}px;top:${(e.y || 0) - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;z-index:${e.z ?? 1};background:radial-gradient(circle, ${hexA(e.color || acc, e.opacity ?? .55)} 0%, ${hexA(e.color || acc, (e.opacity ?? .55) * .35)} 38%, transparent 70%)"></div>`;
      }
      if (e.type === 'pin') {
        const c = e.color || '#B3261E', r = e.size || 34;
        return `<svg viewBox="0 0 40 40" style="position:absolute;left:${(e.x || 0) - r / 2}px;top:${(e.y || 0) - r / 2}px;width:${r}px;height:${r}px;z-index:${e.z ?? 9};filter:drop-shadow(0 6px 6px rgba(0,0,0,.5))">
          <circle cx="20" cy="20" r="17" fill="${c}"/><circle cx="14" cy="13" r="5" fill="#fff" opacity=".45"/></svg>`;
      }
      if (e.type === 'string') {
        // A thread between two points; sag bends it downwards.
        const [x1, y1] = e.from, [x2, y2] = e.to, sag = e.sag ?? 40;
        return `<svg viewBox="0 0 ${CW} ${CH}" style="position:absolute;inset:0;width:100%;height:100%;z-index:${e.z ?? 8};filter:drop-shadow(0 3px 3px rgba(0,0,0,.45))">
          <path d="M${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" fill="none" stroke="${e.color || '#B3261E'}" stroke-width="${e.width || 4}" stroke-linecap="round"/></svg>`;
      }
      if (e.type === 'chip') {
        const cb = e.border ? `border:${e.border};box-shadow:none;` : '', cm = e.mono ? `font-family:'IBM Plex Mono',monospace;letter-spacing:2px;border-radius:6px;` : '';
        return `<div class="sc-chip" style="${pos};background:${e.bg || '#1C1A17'};color:${e.fg || '#F5EAD8'};font-size:${e.size || 28}px;${cb}${cm}">${esc(e.text)}</div>`;
      }
      return '';
    }).join('');
    return els + headlineHtml(s, acc, th) + (s.arrows || []).map((a) => arrow(a, acc)).join('') + (s.arrow ? arrow(s.arrow, acc) : '') + face(s, th);
  },

  // Money + guest: two people side by side, a result pill, a handwritten label pointing at the guest.
  versus(s, acc, th) {
    const g = { side: 'left', width: 470, offset: 10, ph: 'GUEST PHOTO', pose: 'smiling', ...(s.guest || {}) };
    if (s.face === undefined) s.face = { side: 'right', width: 470 };
    const pill = s.pill ? `<div class="pill f-sans" style="background:${s.pill_color || acc};color:${s.pill_text || '#fff'}">${esc(s.pill)}</div>` : '';
    const label = s.label ? `<div class="hand-label f-hand" style="color:${th.ink};${s.label_pos || 'left:470px;top:70px'};font-size:60px">${esc(s.label)}</div>` : '';
    const arr = s.label && s.arrow !== false ? arrow(s.arrow || { from: [560, 160], to: [430, 250], bend: -0.35, color: acc }, acc) : '';
    const divider = '';
    return face({ face: g }, th) + divider + face(s, th) + label + arr + pill +
      (s.headline ? headlineHtml({ ...s, headline_box: s.headline_box || { x: 340, y: 30, w: 600, h: 120 } }, acc, th) : '');
  },

  // Tweet or YouTube-comment card as the hook, face on the right.
  social(s, acc, th) {
    const c = { type: 'tweet', name: 'Your Name', handle: '@yourhandle', text: '...', ...(s.card || {}) };
    const dark = c.dark ?? th.ink === '#FFFFFF';
    const fg = dark ? '#fff' : '#0f1419', sub = dark ? '#8b98a5' : '#536471', bgc = dark ? '#000' : '#fff';
    const avatar = c.avatar ? `<img class="sc-av" src="${esc(toUrl(c.avatar))}">` : `<div class="sc-av" style="background:${acc}">${esc((c.name || '?').trim()[0])}</div>`;
    const tick = c.verified === false ? '' : `<svg class="sc-tick" viewBox="0 0 24 24"><path fill="#1D9BF0" d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.65.15-.44.23-.91.23-1.4 0-2.21-1.71-3.98-3.82-3.98-.47 0-.92.08-1.34.25C14.79 2.5 13.47 1.6 12 1.6s-2.79.9-3.39 2.12c-.42-.17-.87-.25-1.34-.25-2.11 0-3.82 1.77-3.82 3.98 0 .49.08.96.23 1.4-1.3.7-2.18 2.07-2.18 3.65 0 1.5.8 2.8 1.97 3.55-.03.18-.04.35-.04.53 0 2.21 1.71 4 3.82 4 .47 0 .92-.09 1.34-.25.6 1.22 1.92 2.07 3.41 2.07 1.48 0 2.8-.85 3.39-2.07.42.16.87.25 1.34.25 2.11 0 3.82-1.79 3.82-4 0-.18-.01-.35-.04-.53 1.17-.75 1.97-2.05 1.97-3.55z"/><path fill="#fff" d="M10.6 16.2l-3.6-3.6 1.4-1.4 2.2 2.2 5-5 1.4 1.4z"/></svg>`;
    const yt = c.type === 'comment' ? `<svg class="sc-yt" viewBox="0 0 28 20"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 5.5v9l8-4.5z" fill="#fff"/></svg>` : '';
    const stats = (c.stats || (c.type === 'comment' ? [] : ['752', '1K', '53K'])).slice(0, 3);
    const icons = ['💬', '🔁', '♡'];
    const statsHtml = stats.length ? `<div class="sc-stats" style="color:${sub}">${stats.map((v, i) => `<span>${icons[i]} ${esc(v)}</span>`).join('')}</div>` : '';
    const border = c.border ? `box-shadow:0 0 0 6px ${c.border},0 30px 60px rgba(0,0,0,.35)` : 'box-shadow:0 30px 60px rgba(0,0,0,.28)';
    const card = `<div class="sc-card" style="background:${bgc};color:${fg};${border}">
      <div class="sc-head">${avatar}<div><div class="sc-name">${esc(c.name)} ${tick}</div><div class="sc-handle" style="color:${sub}">${esc(c.handle)}${c.type === 'comment' && c.when ? ' · ' + esc(c.when) : ''}</div></div>${yt}</div>
      <div class="sc-text fit" data-maxw="680" data-maxh="${stats.length ? 250 : 300}"><div class="fit-inner" style="font-size:${c.size || 84}px">${esc(c.text).replace(/\n/g, '<br>')}</div></div>
      ${statsHtml}</div>`;
    if (s.face === undefined) s.face = { side: 'right' };
    return card + face(s, th) + (s.arrow ? arrow(s.arrow, acc) : '');
  },

  // Hockey-stick curve with labelled stages and a "you are here" marker.
  trend(s, acc, th) {
    const withFace = !!s.face;
    const x0 = withFace ? 470 : 70, x1 = 1230, y0 = 640, y1 = 170;
    const pt = (t) => [x0 + (x1 - x0) * t, y0 - (y0 - y1) * Math.pow(t, 3.2)];
    let d = '';
    for (let i = 0; i <= 60; i++) { const [x, y] = pt(i / 60); d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    const stages = (s.points || []).map((p, i, arr) => {
      const t = p.t ?? (0.08 + 0.52 * (arr.length === 1 ? 0 : i / (arr.length - 1)));
      const [x, y] = pt(t);
      return `<circle cx="${x}" cy="${y}" r="9" fill="${th.ink}"/><text x="${x - 10}" y="${y - 70 - (i % 2) * 40}" font-family="Caveat" font-weight="700" font-size="40" fill="${th.ink}">${esc(p.label || p)}</text>
        <path d="M${x - 4} ${y - 60 - (i % 2) * 40} L${x} ${y - 16}" stroke="${th.ink}" stroke-width="3" stroke-linecap="round"/>`;
    }).join('');
    const mt = s.marker?.t ?? 0.86;
    const [mx, my] = pt(mt);
    const marker = s.marker === false ? '' : `<circle cx="${mx}" cy="${my}" r="34" fill="none" stroke="${th.ink}" stroke-width="5"/>
      <text x="1245" y="${my + 190}" text-anchor="end" font-family="Caveat" font-weight="700" font-size="52" fill="${th.ink}">${esc(s.marker?.label || 'You are here')}</text>
      <path d="M${Math.min(mx + 40, 1180)} ${my + 145} Q ${mx + 30} ${my + 90} ${mx + 10} ${my + 40}" fill="none" stroke="${th.ink}" stroke-width="4" stroke-linecap="round"/>`;
    const icons = (s.icons || []).map((ic, i) => {
      const [x, y] = pt(ic.t ?? 0.3 + i * 0.25);
      return tile({ size: 92, glow: false, ...ic, x, y }, acc);
    }).join('');
    const svg = `<svg class="trend" viewBox="0 0 1280 720"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="${s.curve_from || '#E5251F'}"/><stop offset="1" stop-color="${s.curve_to || acc}"/></linearGradient></defs>
      <path d="${d}" fill="none" stroke="url(#tg)" stroke-width="14" stroke-linecap="round"/>${stages}${marker}</svg>`;
    s.headline_box = s.headline_box || (withFace ? { x: 480, y: 30, w: 760, h: 150 } : { x: 60, y: 36, w: 900, h: 150 });
    s.headline_align = s.headline_align || 'left';
    if (withFace && !s.face.side) s.face.side = 'left';
    return svg + icons + headlineHtml(s, acc, th) + face(s, th);
  },

  // GitHub-style repo header, face peeking up from the bottom.
  repo(s, acc, th) {
    const [owner, name] = String(s.repo || 'owner/repo').split('/');
    const stats = (s.stats || ['11.5k stars', '1.5k installs']).map((t, i) => `<span>${i === 0 ? '☆' : '⤓'} ${esc(t)}</span>`).join('');
    const head = `<div class="repo-head fit" data-maxw="1180" data-maxh="130"><div class="fit-inner" style="font-size:96px;color:${th.ink}">${esc(owner)}/<span class="hl-u">${esc(name)}<svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M3 13 C 50 5, 120 4, 197 10" stroke="${s.underline_color || '#E5251F'}" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span></div></div>
      <div class="repo-stats" style="color:${th.sub}">${stats}</div>`;
    if (s.face === undefined) s.face = { side: 'center', width: 720, drop: 150, pose: 'looking up' };
    return head + face(s, th);
  },
};

// Proof chart: draws the user's real series (proof.points) or no line at all (proof.curve === false).
// The decorative curve is only for clearly illustrative mock-ups (proof.curve === 'illustrative').
function chartSvg(p, acc) {
  let d;
  if (Array.isArray(p.points) && p.points.length > 1) {
    const v = p.points.map(Number), lo = Math.min(...v), hi = Math.max(...v), span = hi - lo || 1;
    d = v.map((y, i) => `${i ? 'L' : 'M'}${(i / (v.length - 1) * 600).toFixed(1)} ${(205 - (y - lo) / span * 190).toFixed(1)}`).join(' ');
  } else if (p.curve === 'illustrative') {
    d = 'M0 200 C 120 190, 160 170, 230 150 S 360 120, 420 80 S 540 20, 600 10';
  } else {
    return '';
  }
  return `<svg viewBox="0 0 600 220" width="600" height="220"><path d="${d}" fill="none" stroke="${acc}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d} L600 220 L0 220Z" fill="${hexA(acc, .15)}"/></svg>`;
}

function doodles(labels) {
  const L = (labels && labels.length === 5) ? labels : ['INPUT', 'STEP', 'SYSTEM', 'OUTPUT', 'RESULT'];
  // light whiteboard doodles: boxes and arrows to imply a system diagram
  return `<svg class="doodles" viewBox="0 0 300 380"><g fill="none" stroke="#2a2a2a" stroke-width="2.4" stroke-linecap="round">
    <rect x="20" y="20" width="90" height="40" rx="4"/><rect x="170" y="20" width="100" height="40" rx="4"/>
    <rect x="95" y="130" width="110" height="44" rx="4"/><rect x="20" y="250" width="90" height="40" rx="4"/><rect x="180" y="250" width="90" height="40" rx="4"/>
    <path d="M110 40 L165 40 M160 34 L168 40 L160 46"/><path d="M65 60 L130 128 M122 126 L131 129 L129 120"/>
    <path d="M220 60 L170 128"/><path d="M150 174 L70 248 M74 238 L69 249 L80 247"/><path d="M150 174 L225 248 M214 246 L226 249 L224 238"/>
    <circle cx="150" cy="340" r="22"/><path d="M140 340 L148 348 L162 332"/></g>
    <g font-family="Caveat" font-size="20" fill="#2a2a2a"><text x="65" y="46" text-anchor="middle">${esc(L[0])}</text><text x="220" y="46" text-anchor="middle">${esc(L[1])}</text><text x="150" y="158" text-anchor="middle">${esc(L[2])}</text><text x="65" y="276" text-anchor="middle">${esc(L[3])}</text><text x="225" y="276" text-anchor="middle">${esc(L[4])}</text></g></svg>`;
}

// ---------- fonts ----------
// Fonts are bundled in assets/fonts (see assets/fonts/README.md and fonts.json, made by
// scripts/fetch_fonts.py) and loaded as local @font-face rules, so rendering needs no network.
// The Google Fonts stylesheet is added only as a fallback when a bundled file is missing.
// Env: THUMB_OFFLINE=1 never adds the Google link; THUMB_FONTS=google uses only Google (old behaviour).
const FONT_DIR = path.resolve(__dirname, '..', 'assets', 'fonts');
const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&family=Permanent+Marker&family=JetBrains+Mono:wght@500;700&family=Caveat:wght@600;700&family=Anton&family=Fraunces:ital,wght@0,600;0,700;1,600&family=IBM+Plex+Mono:wght@500;600&family=Instrument+Sans:wght@400;500;600&display=block';
const REQUIRED_FAMILIES = ['Inter Tight', 'Permanent Marker', 'JetBrains Mono', 'Caveat', 'Anton', 'Fraunces', 'IBM Plex Mono', 'Instrument Sans'];
let FONT_HEAD = null;
let FONT_NET_BLOCKED = 0; // THUMB_OFFLINE=1 blocks fonts.googleapis.com / fonts.gstatic.com and counts attempts
function fontHead() {
  if (FONT_HEAD !== null) return FONT_HEAD;
  const link = `<link href="${GOOGLE_FONTS}" rel="stylesheet">`;
  if (process.env.THUMB_FONTS === 'google') return (FONT_HEAD = link);
  let faces = [];
  try { faces = JSON.parse(fs.readFileSync(path.join(FONT_DIR, 'fonts.json'), 'utf8')).faces || []; } catch (_) {}
  const have = new Set(), missing = new Set();
  const rules = faces.map((f) => {
    const file = path.join(FONT_DIR, f.file);
    if (!fs.existsSync(file)) { missing.add(f.family); return ''; }
    have.add(f.family);
    return `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:block;src:url('${pathToFileURL(file).href}') format('woff2');${f.unicode_range ? `unicode-range:${f.unicode_range};` : ''}}`;
  }).filter(Boolean).join('\n');
  for (const fam of REQUIRED_FAMILIES) if (!have.has(fam)) missing.add(fam);
  let head = `<style>\n${rules}\n</style>`;
  if (missing.size) {
    if (process.env.THUMB_OFFLINE === '1') console.warn(`WARNING: bundled fonts missing for ${[...missing].join(', ')} and THUMB_OFFLINE=1, so system fonts will stand in. Run: python3 scripts/fetch_fonts.py`);
    else { console.warn(`WARNING: bundled fonts missing for ${[...missing].join(', ')}; falling back to Google Fonts. Run: python3 scripts/fetch_fonts.py`); head = link + '\n' + head; }
  }
  return (FONT_HEAD = head);
}

// ---------- page ----------


// Stickers (3.1): emojis, punctuation marks and extra face circles, on top of any layout.
// sticker: {type:"emoji", text, x, y, size, rotate} | {type:"mark", text, x, y, size, color, rotate, font, outline}
//          | {type:"photo", src, cx, cy, d, ring, ring_w, inset, shadow}
const MARK_FONTS = { sans: "'Inter Tight',sans-serif", cond: "'Anton',sans-serif", marker: "'Permanent Marker',cursive", serif: "'Fraunces',serif", hand: "'Caveat',cursive" };
function stickersHtml(s, th) {
  return (s.stickers || []).map((k) => {
    const rot = k.rotate ? `transform:rotate(${k.rotate}deg);` : '';
    const z = `z-index:${k.z ?? 9}`;
    if (k.type === 'emoji') {
      return `<div class="stk-emoji" style="left:${k.x || 0}px;top:${k.y || 0}px;font-size:${k.size || 90}px;${rot}${z}">${esc(k.text || '🤯')}</div>`;
    }
    if (k.type === 'mark') {
      const ol = k.outline ? `-webkit-text-stroke:${k.outline_w || 6}px ${k.outline};paint-order:stroke fill;` : '';
      return `<div class="stk-mark" style="left:${k.x || 0}px;top:${k.y || 0}px;font-size:${k.size || 120}px;color:${k.color || th.ink};font-family:${MARK_FONTS[k.font || 'sans'] || MARK_FONTS.sans};${ol}${rot}${z}">${esc(k.text || '?')}</div>`;
    }
    if (k.type === 'photo') {
      const html = circleFace({ frame: 'circle', ...k }, th);
      return html.replace('class="face-circle" style="', `class="face-circle${k.shadow === false ? '' : ' stk-shadow'}" style="${z};`);
    }
    return '';
  }).join('');
}

// Background presets (3.1). Colours come from the spec (bg_color, glow_color) so other brands keep their own palette;
// the defaults are Pecuna Factorem's (white, brand yellow #F6DF8C, ink #0A0908, gold #CB8E03).
const BG_STYLES = {
  'paper-grid':     { bg: '#FFFFFF', grid: 'rgba(0,0,0,.075)', gridSize: 40 },
  'cream-grid':     { bg: '#FAF8F4', grid: 'rgba(60,40,0,.07)', gridSize: 40 },
  'brand-yellow':   { bg: '#F6DF8C' },
  'flat':           { bg: '#FFFFFF' },
  'black-glow':     { bg: '#0A0908', glow: '#CB8E03', glowAt: '72% 45%', glowA: .38, dark: true },
  'black-spotlight':{ bg: '#0A0908', glow: '#CB8E03', glowAt: '74% 50%', glowA: .55, dark: true, vignette: 200 },
};
function bgStyle(s) {
  const p = BG_STYLES[s.bg_style];
  if (!p) return null;
  const base = s.bg_color || p.bg;
  let bg = base;
  if (p.glow) bg = `radial-gradient(circle at ${s.glow_at || p.glowAt}, ${hexA(s.glow_color || p.glow, s.glow_opacity ?? p.glowA)} 0%, ${base} 48%)`;
  let grid = p.grid ? `background-image:linear-gradient(${p.grid} 1px, transparent 1px),linear-gradient(90deg, ${p.grid} 1px, transparent 1px);background-size:${p.gridSize}px ${p.gridSize}px;` : '';
  const vig = s.vignette ?? p.vignette;
  return { bg, grid, vig };
}

function pageHtml(s) {
  CW = s.canvas?.w || 1280; CH = s.canvas?.h || 720;
  const th = { ...THEMES[s.theme || 'light'], ...(s.theme_overrides || {}) };
  const acc = s.accent || '#D97757';
  const layout = LAYOUTS[s.archetype];
  if (!layout) throw new Error(`Unknown archetype "${s.archetype}" in ${s.id}`);
  const body = layout({ ...s }, acc, th);
  let bg = th.bg;
  if (th.grad) bg = `radial-gradient(circle at 30% 20%, ${th.grad}, ${th.bg} 70%)`;
  if (th.glow) bg = `radial-gradient(circle at ${s.face ? '35%' : '50%'} 62%, ${hexA(acc, .38)} 0%, ${th.bg} 55%)`;
  if (s.bg_image) bg = `linear-gradient(rgba(0,0,0,${s.bg_dim ?? 0}), rgba(0,0,0,${s.bg_dim ?? 0})), url('${toUrl(s.bg_image)}') center/cover no-repeat`;
  let grid = th.grid && !s.bg_image ? `background-image:linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px),linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px);background-size:44px 44px;` : '';
  if (s.bg_pattern === 'dots') grid = `background-image:radial-gradient(${hexA(s.bg_pattern_color || acc, s.bg_pattern_opacity ?? .22)} 1.6px, transparent 2px);background-size:${s.bg_pattern_size || 32}px ${s.bg_pattern_size || 32}px;`;
  const preset = !s.bg_image && bgStyle(s);
  if (preset) { bg = preset.bg; grid = preset.grid; }
  const vig = preset ? preset.vig : s.vignette;
  if (vig) grid += `box-shadow:inset 0 0 ${vig === true ? 220 : vig}px rgba(0,0,0,.85);`;
  return `<!doctype html><html><head><meta charset="utf-8">
${fontHead()}
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${CW}px;height:${CH}px;overflow:hidden}
body{background:${bg};font-family:'Inter Tight',system-ui,sans-serif;position:relative}
.gridbg{position:absolute;inset:0;${grid}}
.f-sans{font-family:'Inter Tight',sans-serif;font-weight:800;letter-spacing:-.045em;line-height:.98}
.f-marker{font-family:'Permanent Marker',cursive;line-height:1.02;letter-spacing:-.01em;text-transform:uppercase}
.f-mono{font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:-.03em}
.f-cond{font-family:'Anton',sans-serif;text-transform:uppercase;line-height:1;letter-spacing:.005em}
.f-serif{font-family:'Fraunces',serif;font-weight:700;letter-spacing:-.02em;line-height:1.02}
.f-hand{font-family:'Caveat',cursive;font-weight:700}
.headline{position:absolute;display:flex;align-items:center;z-index:6}
.stk-emoji{position:absolute;line-height:1;font-family:'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif;filter:drop-shadow(0 6px 8px rgba(0,0,0,.28))}
.stk-mark{position:absolute;line-height:1;font-weight:900;filter:drop-shadow(0 4px 4px rgba(0,0,0,.22))}
.stk-shadow{box-shadow:0 18px 40px rgba(0,0,0,.35)}
.fit-inner{display:inline-block;white-space:nowrap}
.hl-u,.hl-strike{position:relative;display:inline-block}
.hl-u svg{position:absolute;left:-2%;bottom:-.16em;width:104%;height:.26em}
.hl-strike svg{position:absolute;left:-3%;top:.32em;width:106%;height:.3em}
.hl-box{padding:0 .14em;border-radius:.08em;display:inline-block;line-height:1.05}
.tile{position:absolute;display:flex;align-items:center;justify-content:center;z-index:3}
.tile .shine{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%);pointer-events:none}
.tile .si{background:currentColor;position:relative}
.tile .glyph{font-weight:800;position:relative;font-family:'JetBrains Mono',monospace;letter-spacing:-.04em}
.tile-label{position:absolute;width:400px;text-align:center;font:700 34px 'Inter Tight';color:inherit;z-index:3}
.cross{position:absolute;z-index:4}
.arrow{position:absolute;inset:0;width:100%;height:100%;z-index:7;filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))}
.op{position:absolute;text-align:center;font:800 140px 'Inter Tight';line-height:150px;z-index:3}
.face{position:absolute;bottom:0;z-index:5}
.face.ph{display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(-12px 0 30px rgba(0,0,0,.25))}
.ph-label{position:absolute;top:300px;font:700 18px 'JetBrains Mono';letter-spacing:.08em;color:rgba(255,255,255,.85);background:rgba(0,0,0,.45);padding:6px 12px;border-radius:6px}
.pedestal{position:absolute;width:460px;height:90px;border-radius:50%;z-index:2;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.burst{position:absolute;width:1280px;height:1280px;border-radius:50%;z-index:1;-webkit-mask:radial-gradient(circle, #000 0, #000 30%, transparent 60%)}
.win{position:absolute;left:40px;top:150px;width:820px;height:430px;border-radius:26px;box-shadow:0 30px 70px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.06);z-index:4}
.dots{display:flex;gap:12px;padding:24px 28px}.dots i{width:20px;height:20px;border-radius:50%;display:block}
.win-body{display:flex;align-items:center;gap:30px;padding:40px 48px 0}
.win-tile{width:150px;height:150px;border-radius:34px;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 10px 24px rgba(0,0,0,.2)}
.win-tile .si{background:currentColor}
.cmd{display:flex;align-items:center;height:170px}
.chips{display:flex;gap:14px;padding:44px 48px}
.chip{white-space:nowrap;border:3px solid;border-radius:40px;padding:8px 22px;font:700 30px 'JetBrains Mono'}
.proof-wrap{position:absolute;z-index:4}
.notif{position:absolute;left:0;width:720px;height:124px;background:rgba(255,255,255,.96);border-radius:22px;display:flex;gap:18px;align-items:center;padding:0 24px;font:600 31px 'Inter Tight';color:#222;box-shadow:0 14px 34px rgba(0,0,0,.25)}
.notif b{font-weight:800}.notif .now{float:right;color:#888;font-weight:600;font-size:24px}
.notif>div:last-child{flex:1}
.s-logo{width:76px;height:76px;border-radius:18px;background:#635BFF;color:#fff;font:900 46px 'Inter Tight';display:flex;align-items:center;justify-content:center;flex:none}
.paycard{position:absolute;width:640px;background:#fff;border-radius:18px;padding:26px 32px;box-shadow:0 20px 50px rgba(0,0,0,.18);z-index:4;font-family:'Inter Tight';color:#222}
.pc-title{font-weight:800;font-size:40px;margin-bottom:14px}
.paycard table{width:100%;border-collapse:collapse;font-size:27px;font-weight:600}
.paycard td{padding:11px 4px;border-top:1px solid #eee}
.ok{background:#D7F7DF;color:#0A7A2E;padding:4px 12px;border-radius:8px;font-size:23px;font-weight:700}
.blur{filter:blur(7px)}
.barcard{position:absolute;width:760px;background:#151515;border-radius:22px;padding:30px 34px;z-index:4;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,.35)}
.bc-title{font:700 22px 'JetBrains Mono';color:#aaa;margin-bottom:20px}
.bar-row{display:flex;align-items:center;gap:20px;margin:16px 0}.bar-l{width:160px;font:700 24px 'Inter Tight';color:#ccc}
.bar{height:74px;border-radius:12px;display:flex;align-items:center;justify-content:flex-end;padding-right:18px;font:800 34px 'Inter Tight'}
.chartcard{position:absolute;width:680px;background:#fff;border-radius:20px;padding:28px 40px;box-shadow:0 20px 50px rgba(0,0,0,.18);z-index:4;color:#222}
.cc-k{font:600 24px 'Inter Tight';color:#777}.cc-v{font:800 64px 'Inter Tight';letter-spacing:-.03em;margin-bottom:10px}
.hand-label{position:absolute;font-size:64px;z-index:7;line-height:1}
.whiteboard{position:absolute;left:24px;top:24px;width:820px;height:672px;background:#FBFBF9;border-radius:10px;border:10px solid #CFCFD4;box-shadow:0 20px 50px rgba(0,0,0,.35);z-index:3;overflow:hidden}
.wb-icon{position:absolute;left:30px;top:30px;width:110px;height:110px;border-radius:24px;display:flex;align-items:center;justify-content:center;color:#fff}.wb-icon .si{background:#fff}
.wb-title{position:absolute;left:40px;top:28px;width:650px;height:150px;display:flex;align-items:center;color:#1b1b1b}
.wb-list{position:absolute;left:46px;top:200px;list-style:none;font-size:56px;color:#1b1b1b;line-height:1.08}
.wb-list .num{display:inline-block;width:44px}
.doodles{position:absolute;right:20px;top:230px;width:300px;height:380px;opacity:.85}
.terminal{position:absolute;left:24px;top:40px;width:800px;height:640px;background:#111214;border-radius:18px;padding:40px 46px;color:#e8e8e8;font-size:30px;line-height:1.55;box-shadow:0 30px 70px rgba(0,0,0,.5);z-index:3;font-weight:500}
.t-cmd{color:#e8e8e8;margin-bottom:22px}.t-box{display:inline-block;border:3px solid;padding:10px 22px;margin-bottom:26px;font-weight:700}
.dots-t{color:#6b6b6b}.t-ready{margin-top:24px;color:#cfcfcf}.caret{display:inline-block;width:16px;height:34px;background:#e8e8e8;vertical-align:middle;margin-left:6px}
.tag{position:absolute;left:60px;bottom:40px;color:#fff;font:800 40px 'Inter Tight';padding:8px 20px;border-radius:10px;z-index:6}
.sc-bubble{position:absolute;background:#FFFBF3;border:5px solid;border-radius:48% 52% 46% 54% / 55% 50% 50% 45%;padding:46px 70px 40px;box-shadow:0 24px 50px rgba(28,26,23,.22);display:flex;flex-direction:column;justify-content:center;color:#1C1A17}
.sc-dot{position:absolute;border-radius:50%;background:#FFFBF3;border:4px solid;z-index:4;box-shadow:0 6px 12px rgba(28,26,23,.18)}
.sc-label{font:600 18px/1 'IBM Plex Mono',monospace;letter-spacing:3px;color:#5c5750;margin-bottom:12px;text-transform:uppercase}
.sc-bubble .sc-label{text-align:center}
.sc-btext{display:flex;align-items:center;font-weight:700;line-height:1.02;letter-spacing:-1.5px}
.sc-doc{position:absolute;background:#FFFBF3;border-radius:10px;padding:28px 32px;box-shadow:0 26px 60px rgba(28,26,23,.25);color:#1C1A17;font:600 34px/1.35 'Inter Tight',sans-serif}
.sc-doc p.muted{font-size:24px;font-weight:500}
.sc-doc.dark{background:#1E1B17;color:#F5EAD8;box-shadow:0 26px 60px rgba(0,0,0,.6),0 0 0 1px rgba(245,234,216,.08)}
.sc-doc.dark .sc-doc-title{color:#CB8E03;border-bottom-color:rgba(245,234,216,.14)}
.sc-doc p.redacted{display:flex;align-items:center;height:34px}.sc-doc p.redacted .bar{display:inline-block;height:26px;background:#000;border-radius:3px}
.sc-doc.dark p.redacted .bar{background:#050505;box-shadow:inset 0 0 0 1px rgba(245,234,216,.07)}
.sc-doc p{margin:0 0 14px}.sc-doc p.muted{color:#9a9184}.sc-doc-title{font:600 16px/1 'IBM Plex Mono',monospace;letter-spacing:3px;color:#5c5750;margin-bottom:18px;border-bottom:2px solid #e6dccb;padding-bottom:14px}
.sc-tag{display:inline-block;color:#fff;font:700 15px/1 'IBM Plex Mono',monospace;letter-spacing:1px;padding:6px 8px;border-radius:5px;margin-right:10px;vertical-align:3px}
.sc-lens{position:absolute;border-radius:50%;border:16px solid;background:radial-gradient(circle at 35% 30%,#ffffff,#FFF6DD);box-shadow:0 24px 50px rgba(28,26,23,.3),inset 0 0 30px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;text-align:center;color:#1C1A17}
.sc-lens-in{font-weight:700;line-height:1.05;letter-spacing:-1px;padding:16px}
.sc-lens-handle{position:absolute;height:30px;border-radius:15px;transform:rotate(45deg);transform-origin:left center;z-index:-1}
.sc-sticky{position:absolute;padding:20px 22px;box-shadow:0 18px 30px rgba(28,26,23,.22);color:#1C1A17;border-radius:4px}
.sc-stext{font:700 30px/1.15 'Inter Tight',sans-serif}
.sc-chip{position:absolute;white-space:nowrap;font-weight:700;font-family:'Inter Tight',sans-serif;padding:10px 18px;border-radius:999px;box-shadow:0 10px 20px rgba(0,0,0,.2)}
.face-circle{position:absolute;border-radius:50%;overflow:hidden;z-index:5;box-shadow:0 18px 40px rgba(28,26,23,.28)}
.face-circle .ph-label{position:absolute}
.rcard{position:absolute;width:640px;background:#FFFBF3;border:4px solid;border-radius:18px;padding:26px 32px;z-index:4;box-shadow:0 22px 50px rgba(28,26,23,.22);font-family:'Inter Tight',sans-serif;color:#1C1A17}
.rc-top{font:600 18px/1 'IBM Plex Mono',monospace;letter-spacing:2px;color:#5c5750;margin-bottom:18px}
.rc-row{display:flex;align-items:center;gap:16px}.rc-rank{color:#fff;font:800 34px/1 'Inter Tight';padding:10px 14px;border-radius:10px}
.rc-name{font:700 40px/1.1 'Fraunces',serif;letter-spacing:-.5px}
.rc-val{display:flex;align-items:baseline;gap:14px;margin-top:20px}.rc-val span{font:700 110px/1 'Fraunces',serif;padding:0 10px;letter-spacing:-3px}.rc-val small{font:500 24px/1.2 'IBM Plex Mono',monospace;color:#5c5750}
.qcard{position:absolute;left:56px;top:96px;width:780px;height:470px;background:#FFFBF3;border:5px solid;border-radius:20px;padding:40px 46px;z-index:4;box-shadow:0 26px 60px rgba(28,26,23,.22);color:#1C1A17}
.qcard .pin{position:absolute;top:-14px;left:50%;width:28px;height:28px;border-radius:50%;box-shadow:0 4px 8px rgba(0,0,0,.3)}
.q-label{font:600 20px/1 'IBM Plex Mono',monospace;letter-spacing:3px;color:#5c5750;margin-bottom:20px}
.q-text{height:300px;display:flex;align-items:center;font-weight:700;line-height:1;letter-spacing:-2px}
.q-missed{position:absolute;right:30px;bottom:24px;display:flex;align-items:center;gap:10px;font:600 22px/1 'IBM Plex Mono',monospace;color:#B3261E}
.chain{position:absolute;left:50px;display:flex;align-items:center;gap:14px;z-index:6}
.chain-step{font:700 36px/1 'Inter Tight',sans-serif;color:#1C1A17;background:#FFFBF3;border:4px solid;border-radius:14px;padding:16px 22px}
.chain-arrow{font:800 48px/1 'Inter Tight'}
.adgrid{position:absolute;top:190px;width:340px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;z-index:3}
.adgrid i{display:block;aspect-ratio:9/16;border-radius:10px;background:rgba(255,255,255,.28);border:3px solid rgba(255,255,255,.35)}
.adgrid i.on{background:#FFFBF3;border-color:#CB8E03;box-shadow:0 0 24px rgba(203,142,3,.6)}
.adgrid-cap{grid-column:1/-1;font:600 22px/1.2 'IBM Plex Mono',monospace;color:#fff;text-align:center;margin-top:6px}
.donut-wrap{position:absolute;top:170px;width:320px;display:grid;justify-items:center;gap:14px;z-index:3}
.donut{width:270px;height:270px;border-radius:50%;-webkit-mask:radial-gradient(circle,transparent 0 44%,#000 45%);mask:radial-gradient(circle,transparent 0 44%,#000 45%);box-shadow:0 10px 30px rgba(0,0,0,.25)}
.donut-legend{display:flex;gap:14px;font:700 28px/1 'Inter Tight';color:#fff}.donut-legend span{display:flex;align-items:center;gap:6px}.donut-legend i{display:block;width:16px;height:16px;border-radius:4px;border:2px solid #fff}
.cap-band{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.78) 30%);z-index:5}
.split-half{position:absolute;top:0;bottom:0;width:50%;z-index:1}
.split-big{position:absolute;top:210px;width:400px;text-align:center;font-size:150px;line-height:1;z-index:4;text-shadow:0 6px 24px rgba(0,0,0,.35)}
.split-label{position:absolute;bottom:78px;width:400px;text-align:center;font-size:64px;color:#fff;padding:6px 0;border-radius:10px;z-index:6;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.pill{position:absolute;left:30px;bottom:34px;font-size:78px;padding:6px 24px 10px;border-radius:14px;z-index:7;box-shadow:0 10px 30px rgba(0,0,0,.35);letter-spacing:-.03em}
.vs-divider{position:absolute;left:638px;top:60px;width:4px;height:600px;z-index:4}
.sc-card{position:absolute;left:50px;top:110px;width:770px;border-radius:30px;padding:36px 42px 30px;z-index:4;font-family:'Inter Tight'}
.sc-head{display:flex;align-items:center;gap:18px;margin-bottom:22px;position:relative}
.sc-av{width:84px;height:84px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font:800 40px 'Inter Tight';flex:none}
.sc-name{font:800 34px 'Inter Tight';display:flex;align-items:center;gap:8px}.sc-tick{width:32px;height:32px}
.sc-handle{font:500 26px 'Inter Tight'}.sc-yt{position:absolute;right:0;top:4px;width:62px;height:44px}
.sc-text{font-weight:800;letter-spacing:-.035em;line-height:1.02;height:auto}
.sc-stats{display:flex;gap:46px;margin-top:22px;font:600 28px 'Inter Tight'}
.trend{position:absolute;inset:0;width:1280px;height:720px;z-index:3}
.repo-head{position:absolute;left:40px;top:40px;width:1200px;height:130px;display:flex;align-items:center;justify-content:center;font-family:'Inter Tight';font-weight:800;letter-spacing:-.04em}
.repo-stats{position:absolute;left:0;width:1280px;top:182px;display:flex;justify-content:center;gap:40px;font:600 34px 'Inter Tight';z-index:6}
.smear{position:absolute;left:-20px;width:820px;height:190px;background:#111;z-index:4;clip-path:polygon(2% 18%,96% 0,100% 70%,88% 100%,4% 86%,0 40%)}
</style></head><body><div class="gridbg"></div>${body}${stickersHtml(s, th)}
<script>
document.fonts.ready.then(()=>{
  document.querySelectorAll('.fit').forEach(el=>{
    const inner=el.querySelector('.fit-inner'); const mw=+el.dataset.maxw, mh=+el.dataset.maxh;
    let fs=parseFloat(inner.style.fontSize);
    const fits=()=>{const r=inner.getBoundingClientRect();return r.width<=mw&&r.height<=mh;};
    const max=+inner.dataset.grow||0;
    while(max&&fs<max&&fits()){fs+=4;inner.style.fontSize=fs+'px';}
    while((inner.getBoundingClientRect().width>mw||inner.getBoundingClientRect().height>mh)&&fs>18){fs-=2;inner.style.fontSize=fs+'px';}
  });
  document.body.dataset.ready='1';
});
</script></body></html>`;
}

// Feed preview: every thumbnail at desktop-grid and phone sizes with a fake title, to check it reads small.
function previewHtml(items) {
  const cards = (w) => items.map((t) => `<div class="c" style="width:${w}px"><img src="${t.id}.${t.format === 'jpg' ? 'jpg' : 'png'}" style="width:${w}px;height:${Math.round(w * (t.canvas?.h || 720) / (t.canvas?.w || 1280))}px"><p style="font-size:${w > 300 ? 15 : 12}px">${esc(t.title || t.headline || t.id)}</p></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{background:#0f0f0f;color:#f1f1f1;font-family:Roboto,Arial,sans-serif;padding:24px;width:${Math.max(1280, items.length * 376 + 48)}px}
h2{font-size:16px;color:#aaa;margin:18px 0 10px;font-weight:500}.row{display:flex;flex-wrap:wrap;gap:16px}
.c img{border-radius:10px;display:block;object-fit:cover}.c p{margin-top:8px;font-weight:600;line-height:1.3}
</style></head><body><h2>Desktop home feed (360px)</h2><div class="row">${cards(360)}</div>
<h2>Phone feed / sidebar (168px)</h2><div class="row">${cards(168)}</div></body></html>`;
}

async function main() {
  const specPath = process.argv[2];
  if (!specPath) { console.error('Usage: node render.cjs spec.json [outDir]'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const list = spec.thumbnails || [spec];
  const outDir = path.resolve(process.argv[3] || spec.out || path.dirname(specPath));
  fs.mkdirSync(outDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  let current = '';
  page.on('response', (r) => {
    if (r.status() >= 400) {
      const m = r.url().match(/simple-icons@[^/]+\/icons\/([^.]+)\.svg/);
      console.warn(m ? `WARNING [${current}]: logo "si:${m[1]}" not found in Simple Icons 13.21.0 - use img:<official logo file> (or glyph:<text> as a stopgap)` : `WARNING [${current}]: failed to load ${r.url()} (${r.status()})`);
    }
  });
  page.on('requestfailed', (r) => console.warn(`WARNING [${current}]: failed to load ${r.url()}`));
  for (const s of list) {
    current = s.id;
    const html = pageHtml(s);
    const htmlPath = path.join(outDir, `${s.id}.html`);
    fs.writeFileSync(htmlPath, html);
    // Each thumbnail can set its own canvas and scale (e.g. 1280x720 at scale 1.5 = a 1920x1080 file).
    const pg = await browser.newPage({ viewport: { width: CW, height: CH }, deviceScaleFactor: s.scale || 1 });
    pg.on('response', (r) => { if (r.status() >= 400) console.warn(`WARNING [${s.id}]: failed to load ${r.url()} (${r.status()})`); });
    if (process.env.THUMB_OFFLINE === '1') await pg.route(/^https?:\/\/fonts\.(googleapis|gstatic)\.com\//, (r) => { FONT_NET_BLOCKED++; return r.abort(); });
    await pg.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
    await pg.waitForSelector('body[data-ready="1"]', { timeout: 20000 });
    const ext = s.format === 'jpg' ? 'jpg' : 'png';
    const outFile = path.join(outDir, `${s.id}.${ext}`);
    await pg.screenshot(ext === 'jpg' ? { path: outFile, type: 'jpeg', quality: s.quality || 90 } : { path: outFile });
    await pg.close();
    const kb = Math.round(fs.statSync(outFile).size / 1024);
    if (kb > 2000) console.warn(`WARNING [${s.id}]: ${kb} KB is over the 2 MB limit YouTube and LinkedIn use; set "format": "jpg"`);
    if (!spec.keep_html) fs.unlinkSync(htmlPath);
    console.log('rendered', outFile, `${(s.canvas?.w || 1280) * (s.scale || 1)}x${(s.canvas?.h || 720) * (s.scale || 1)}`, `${kb} KB`);
  }
  const prev = path.join(outDir, '_feed-preview.html');
  fs.writeFileSync(prev, previewHtml(list));
  await page.setViewportSize({ width: Math.max(1330, list.length * 376 + 100), height: 400 });
  await page.goto('file://' + prev, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, '_feed-preview.png'), fullPage: true });
  fs.unlinkSync(prev);
  console.log('rendered', path.join(outDir, '_feed-preview.png'));
  if (process.env.THUMB_OFFLINE === '1') console.log(`offline: blocked ${FONT_NET_BLOCKED} Google Fonts request(s)`);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
