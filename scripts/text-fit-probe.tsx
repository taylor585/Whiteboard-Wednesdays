// Text-fit probe for the suby-shots-with-katana v3 episode (PUBLISH.md "Text fit check").
// Copied into the skill working copy as src/textfit/TextFit.tsx; renders one beat through the
// skill's own EpisodeBeat and measures every visible line of text in the browser, so a label
// that runs into another, leaves the frame or is cut off by its panel is caught before review.
import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot} from 'remotion';
import {EpisodeBeat} from '../v3/Episode';
import {BEATS, findBeat} from '../v3/episode';

type Box = {x0: number; y0: number; x1: number; y1: number};
type Line = Box & {el: number; text: string; tilt: number};
const W = 1920, H = 1080, SAFE = 40, TOL = 2;

const opacityOf = (el: Element | null, root: Element) => {
  let o = 1;
  for (let e = el; e && e !== root.parentElement; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.visibility === 'hidden' || s.display === 'none') return 0;
    o *= parseFloat(s.opacity || '1');
  }
  return o;
};
// The nearest ancestor that cuts off what spills out of it (overflow or a rectangular clip-path inset with no reveal).
const clipperOf = (el: Element, root: Element): Box | null => {
  for (let e = el.parentElement; e && e !== root; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.overflow !== 'visible' || s.overflowX !== 'visible' || s.overflowY !== 'visible') {
      const r = e.getBoundingClientRect(); return {x0: r.left, y0: r.top, x1: r.right, y1: r.bottom};
    }
  }
  return null;
};
// Rotation of an element on screen (sum of its own and its ancestors' 2D rotations), to undo the inflation of an axis-aligned
// box around a tilted line (a sticky note at -2.5 degrees otherwise looks like its lines touch).
const angleOf = (el: Element, root: Element) => {
  let a = 0;
  for (let e: Element | null = el; e && e !== root; e = e.parentElement) {
    const t = getComputedStyle(e).transform; const m = t && t !== 'none' && t.match(/matrix\(([^)]*)\)/);
    if (m) { const [ma, mb] = m[1].split(',').map(parseFloat); a += Math.atan2(mb, ma); }
  }
  return a;
};
const untilt = (b: Box, a: number): Box => {
  const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); if (s < 0.005) return b;
  const W0 = b.x1 - b.x0, H0 = b.y1 - b.y0, d = c * c - s * s; if (d <= 0.2) return b;
  const w = (W0 * c - H0 * s) / d, h = (H0 * c - W0 * s) / d; if (w <= 0 || h <= 0) return b;
  const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; return {x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2};
};
const inter = (a: Box, b: Box) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

export const measure = (root: HTMLElement) => {
  const o = root.getBoundingClientRect();
  const els: Element[] = []; const lines: Line[] = []; const issues: {kind: string; text: string; other?: string; px?: number; box?: Box}[] = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const text = (n.textContent || '').trim(); if (!text) continue;
    const el = n.parentElement!; if (el.closest('svg') && el.tagName.toLowerCase() !== 'text') continue;
    if (opacityOf(el, root) < 0.6) continue;
    // decoration, not reading text: a giant outline numeral (transparent fill) or anything marked data-textfit="decor"
    const st = getComputedStyle(el);
    if (el.closest('[data-textfit="decor"]') || ((st.color === 'transparent' || st.color.endsWith(', 0)')) && parseFloat(st.webkitTextStrokeWidth || '0') > 0) || parseFloat(st.fontSize) >= 400) continue;
    const cp = getComputedStyle(el).clipPath; // a hand-reveal still in progress is not a settled label
    const ins = cp && cp.match(/inset\(([^)]*)\)/);
    if (ins && ins[1].split(/\s+/).some(v => parseFloat(v) > 1)) continue;
    let idx = els.indexOf(el); if (idx < 0) { els.push(el); idx = els.length - 1; }
    const r = document.createRange(); r.selectNodeContents(n);
    const clip = clipperOf(el, root); const tilt = angleOf(el, root);
    for (const q of Array.from(r.getClientRects())) {
      if (q.width < 2 || q.height < 2) continue;
      const b: Line = {x0: q.left - o.left, y0: q.top - o.top, x1: q.right - o.left, y1: q.bottom - o.top, el: idx, text, tilt};
      lines.push(b);
      if (b.x0 < -TOL || b.y0 < -TOL || b.x1 > W + TOL || b.y1 > H + TOL) issues.push({kind: 'off-frame', text, box: b});
      else if (b.x0 < SAFE || b.y0 < SAFE || b.x1 > W - SAFE || b.y1 > H - SAFE) issues.push({kind: 'outside-safe-area', text, box: b});
      if (clip) { const c = {x0: clip.x0 - o.left, y0: clip.y0 - o.top, x1: clip.x1 - o.left, y1: clip.y1 - o.top};
        const cut = (b.x1 - b.x0) * (b.y1 - b.y0) - inter(b, c); if (cut > 40) issues.push({kind: 'clipped', text, px: Math.round(cut), box: b}); }
    }
  }
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const a = lines[i], b = lines[j]; if (a.el === b.el) continue;
    const ea = els[a.el], eb = els[b.el]; if (ea.contains(eb) || eb.contains(ea)) continue;
    // ignore the few pixels where one line's descenders sit on the next line's ascenders
    const shrink = (x: Box): Box => { const h = (x.y1 - x.y0) * 0.18; return {x0: x.x0 + 2, y0: x.y0 + h, x1: x.x1 - 2, y1: x.y1 - h}; };
    const px = inter(shrink(untilt(a, a.tilt)), shrink(untilt(b, b.tilt))); if (px > 60) issues.push({kind: 'overlap', text: a.text, other: b.text, px: Math.round(px)});
  }
  return {lines: lines.length, issues};
};

const Probe: React.FC<{id: string; variant?: string}> = ({id, variant}) => {
  const ref = useRef<HTMLDivElement>(null); const [h] = useState(() => delayRender('text-fit'));
  useEffect(() => {
    let done = false;
    const go = async () => { await (document as any).fonts?.ready; await new Promise(r => setTimeout(r, 250));
      if (done) return; done = true;
      const res = ref.current ? measure(ref.current) : {lines: 0, issues: [{kind: 'no-root', text: ''}]};
      console.log('TEXTFIT ' + JSON.stringify({id, ...res})); continueRender(h); };
    go(); return () => { done = true; };
  }, []);
  return <AbsoluteFill ref={ref}><EpisodeBeat id={id} variant={variant} /></AbsoluteFill>;
};

const Root = () => <Composition id="TextFit" component={Probe} durationInFrames={30} fps={30} width={W} height={H}
  defaultProps={{id: BEATS[0].id} as {id: string; variant?: string}}
  calculateMetadata={async ({props}) => { const b = findBeat(props.id)!; return {durationInFrames: Math.max(1, Math.round(b.t1 * 30) - Math.round(b.t0 * 30))}; }} />;
registerRoot(Root);
