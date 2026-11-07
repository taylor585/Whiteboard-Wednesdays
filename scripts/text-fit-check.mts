// Text fit check: renders every text beat of the episode at its settled frames and measures the text (PUBLISH.md "Text fit check").
// Run inside the skill working copy:  npx tsx src/textfit/check.mts [--ids a,b] [--out jobs/<job>/qa/text-fit.json]
// Exits 1 when any beat has an overlap, off-frame or clipped text, so the session stops before review.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {BEATS} from '../v3/episode';

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const ids = arg('--ids')?.split(',');
const out = arg('--out') ?? 'text-fit-report.json';
const shots = arg('--shots');
const browserExecutable = process.env.SUBI_BROWSER ?? (fs.existsSync('/opt/pw-browsers/chromium') ? undefined : '/usr/bin/chromium');
const BLOCK = new Set(['overlap', 'off-frame', 'clipped']);

// Stand-ins: the check measures text only, so missing background clips (the live screen, the camera, a push shot's clean clip)
// are replaced by a plain grey clip while it runs and removed again at the end. Real files are never touched.
const standIns: string[] = [];
const grey = path.resolve('public/v3/.textfit-grey.mp4');
const need = ['public/v3/base.mp4', 'public/v3/cam_full.mp4', ...BEATS.filter(b => b.type === 'push').map(b => `public/v3/clean-${b.id}.mp4`)];
if (need.some(f => !fs.existsSync(f))) {
  const secs = Math.ceil(Math.max(...BEATS.map(b => b.t1))) + 60;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x333333:s=1920x1080:r=1:d=${secs}`, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', grey]);
  for (const f of need) if (!fs.existsSync(f)) { fs.copyFileSync(grey, f); standIns.push(f); }
}
const cleanUp = () => { for (const f of standIns) fs.rmSync(f, {force: true}); fs.rmSync(grey, {force: true}); };
process.on('exit', cleanUp);
if (standIns.length) console.log(`Stand-in clips for the text check (removed at the end): ${standIns.length}`);
const serveUrl = await bundle({entryPoint: path.resolve('src/textfit/TextFit.tsx'), publicDir: path.resolve('public')});
const beats = BEATS.filter(b => !ids || ids.includes(b.id));
const report: any[] = []; let bad = 0;
for (const b of beats) {
  const frames = Math.max(1, Math.round(b.t1 * 30) - Math.round(b.t0 * 30));
  // settled frames: two thirds in, and the last frame before the exit motion starts (exits take the last 12 to 20 frames)
  const at = [...new Set([Math.round(frames * 0.66), Math.max(0, frames - 22)])];
  for (const frame of at) {
    let found: any = null; const logs: string[] = [];
    try {
      const inputProps = {id: b.id};
      const composition = await selectComposition({serveUrl, id: 'TextFit', inputProps, browserExecutable, chromiumOptions: {gl: 'swangle'}});
      await renderStill({serveUrl, composition, inputProps, frame, browserExecutable, chromiumOptions: {gl: 'swangle'}, scale: shots ? 0.5 : 0.05,
        output: shots ? path.join(shots, `${b.id}-${frame}.jpg`) : path.join('/tmp', `tf-${process.pid}.jpg`), imageFormat: 'jpeg',
        onBrowserLog: l => { if (l.text.startsWith('TEXTFIT ')) found = JSON.parse(l.text.slice(8)); else if (l.type === 'error') logs.push(l.text); }});
    } catch (e) { found = {id: b.id, lines: 0, issues: [{kind: 'render-error', text: String(e).slice(0, 300)}]}; }
    const issues = (found?.issues ?? []);
    const blocking = issues.filter((i: any) => BLOCK.has(i.kind));
    if (blocking.length) bad++;
    report.push({id: b.id, type: b.type, variant: (b as any).variant ?? null, t0: b.t0, t1: b.t1, frame, sec: +(b.t0 + frame / 30).toFixed(2), lines: found?.lines ?? 0, issues});
    console.log(`${blocking.length ? 'FAIL' : issues.length ? 'warn' : 'ok  '} ${b.id} @${(b.t0 + frame / 30).toFixed(1)}s ${issues.map((i: any) => i.kind + ': ' + i.text.slice(0, 40) + (i.other ? ' × ' + i.other.slice(0, 40) : '')).join(' | ')}`);
  }
}
fs.writeFileSync(out, JSON.stringify({checkedAt: new Date().toISOString(), beats: beats.length, failing: bad, report}, null, 1));
console.log(`\n${bad ? 'FAIL' : 'PASS'}: ${bad} failing checks across ${beats.length} beats. Report: ${out}`);
process.exitCode = bad ? 1 : 0;
