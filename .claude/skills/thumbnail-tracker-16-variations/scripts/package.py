#!/usr/bin/env python3
"""Turn one packaging batch (titles + thumbnail specs + descriptions) into rendered thumbnails,
a review board, and (optionally) a vault entry for the Whiteboard Wednesdays Thumbnails page.

Usage:
  python3 package.py batch.json <out_dir> [--vault <app>/public/thumbnails]

batch.json:
{
  "video":  {"title_working": "...", "slug": "meta-ads-agent", "duration": "16:20", "summary": "..."},
  "titles": [{"text": "...", "formula": "i-tested", "style": "nick", "intent": "both", "score": 92}],
  "thumbnails": [ <render.cjs specs; each may set "pair": index into titles> ],
  "descriptions": [{"style": "sabri", "text": "...full description..."}],
  "linkedin": [{"angle": "problem", "pair": 0, "mode": "native|link", "text": "...full post..."}],
  "ab": {"titles": [0, 1, 2], "thumbnails": ["t1", "t3"]},
  "notes": "what to finish by hand"
}

Validates batch.json against schemas/batch.schema.json first (problems print as `SCHEMA:` lines;
errors stop the run before rendering). Writes to out_dir: the images (via render.cjs), _feed-preview.png, board.html (a self-contained review page
with feed/search previews, scores, copy buttons; open it locally) and batch.json (normalised).
With --vault: copies batch.json + PNGs to <vault>/<YYYY-MM-DD>-<slug>/ and updates <vault>/index.json,
which the app's Thumbnails page reads. Commit those files on a branch; they publish with the app.
"""
import argparse
import datetime as dt
import html
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from validate import format_lines, load_schema, validate  # noqa: E402


def schema_check(batch, name='batch.json'):
    """Validate a batch against schemas/batch.schema.json, plus unique thumbnail ids.
    Returns (lines, hard_error). Lines start with 'SCHEMA:'."""
    errs, warns = validate(batch, load_schema('batch'))
    ids = [t.get('id') for t in batch.get('thumbnails', []) if isinstance(t, dict)]
    for d in sorted({i for i in ids if ids.count(i) > 1 and i is not None}):
        errs.append(('$.thumbnails', f'duplicate thumbnail id "{d}" (each id is a file name)'))
    return format_lines(name, errs, warns), bool(errs)


def ext(t):
    return 'jpg' if t.get('format') == 'jpg' else 'png'


def check(batch):
    problems = []
    for i, t in enumerate(batch.get('titles', [])):
        if len(t['text']) > 70:
            problems.append(f"title {i + 1} is {len(t['text'])} characters; mobile cuts around 60")
    for d in batch.get('descriptions', []):
        stamps = re.findall(r'^\s*((?:\d+:)?\d{1,2}:\d{2})\b', d['text'], re.M)
        if stamps:
            secs = []
            for s in stamps:
                p = [int(x) for x in s.split(':')]
                secs.append(sum(v * 60 ** k for k, v in enumerate(reversed(p))))
            if secs[0] != 0:
                problems.append(f"{d.get('style', 'description')}: chapters must start at 0:00")
            if len(secs) < 3:
                problems.append(f"{d.get('style', 'description')}: YouTube needs at least 3 chapters")
            if any(b - a < 10 for a, b in zip(secs, secs[1:])):
                problems.append(f"{d.get('style', 'description')}: chapters must be at least 10s apart and ascending")
        if re.search(r'https?://\S*(?:ref|affiliate|/s/)\S*', d['text'], re.I) and not re.search(r'affiliate|commission|sponsor', d['text'], re.I):
            problems.append(f"{d.get('style', 'description')}: looks like a referral link but has no disclosure")
    titles = [t['text'].lower() for t in batch.get('titles', [])]
    for i, p in enumerate(batch.get('linkedin', [])):
        name = f"linkedin {i + 1} ({p.get('angle', '')})"
        text = p['text']
        hook = text.strip().split('\n')[0]
        if len(hook) > 140:
            problems.append(f"{name}: first line is {len(hook)} characters; keep the hook under ~140 so it shows before '…see more'")
        if hook.strip().lower().rstrip('.') in [t.rstrip('.') for t in titles]:
            problems.append(f"{name}: hook repeats a YouTube title word for word")
        if len(text) > 3000:
            problems.append(f"{name}: {len(text)} characters; LinkedIn's limit is 3,000")
        tags = re.findall(r'(?<![\w&])#[A-Za-z]\w*', text)
        if not 3 <= len(tags) <= 5:
            problems.append(f"{name}: {len(tags)} hashtags; use 3–5")
    return problems


def placeholders(batch):
    """Unfilled [PLACEHOLDER] tokens in descriptions and LinkedIn posts: not errors, but things to finish by hand."""
    texts = [d['text'] for d in batch.get('descriptions', [])] + [p['text'] for p in batch.get('linkedin', [])]
    return sorted({m for t in texts for m in re.findall(r'\[(?:[A-Z][A-Z0-9 _/-]{2,}|your [^\]\n]{2,40})\]', t)})


def board(batch, out):
    e = html.escape
    titles = batch.get('titles', [])
    thumbs = batch.get('thumbnails', [])
    def ttl(t):
        p = t.get('pair')
        return titles[p]['text'] if isinstance(p, int) and p < len(titles) else (titles[0]['text'] if titles else t.get('title', ''))
    first_desc = batch.get('descriptions', [{}])[0].get('text', '')
    snippet = ' '.join(first_desc.split())[:150]
    pairs = ''.join(f"""<div class="pair"><div class="feed"><img src="{e(t['id'])}.{ext(t)}" alt=""><b>{e(ttl(t))}</b><span>Your channel · 3 hours ago</span></div>
      <div class="search"><img src="{e(t['id'])}.{ext(t)}" alt=""><div><b>{e(ttl(t))}</b><span>Your channel</span><p>{e(snippet)}…</p></div></div>
      <div class="meta">{e(t.get('archetype', ''))}<br>“{e(t.get('headline') or t.get('command') or '')}”</div></div>""" for t in thumbs)
    trows = ''.join(f"""<tr><td>{e(t['text'])}<small>{e(t.get('formula', ''))} · {e(t.get('style', ''))} · {e(t.get('intent', ''))} · {len(t['text'])} chars</small></td>
      <td class="n">{t.get('score', '')}</td><td><button data-copy="{e(t['text'])}">Copy</button></td></tr>""" for t in titles)
    lis = ''.join(f"""<section class="d"><h3>{e(p.get('angle', '').title())} · {e(p.get('mode', ''))} · {len(p['text'])} chars</h3><pre>{e(p['text'])}</pre><button data-copy="{e(p['text'])}">Copy post</button></section>""" for p in batch.get('linkedin', []))
    descs = ''.join(f"""<section class="d"><h3>{e(d.get('style', '').title())} style</h3><pre>{e(d['text'])}</pre><button data-copy="{e(d['text'])}">Copy description</button></section>""" for d in batch.get('descriptions', []))
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(batch['video'].get('title_working', 'Package'))}</title><style>
body{{font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px 16px 60px;background:#fff;color:#1c1a17}}main{{max-width:1180px;margin:auto}}
h1{{font-weight:500;letter-spacing:-.5px}}h2{{margin-top:40px;border-bottom:1px solid #d8d5cf;padding-bottom:8px;font-weight:500}}
.pair{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) 160px;gap:18px;padding:16px 0;border-bottom:1px solid #eee;align-items:start}}
@media(max-width:800px){{.pair{{grid-template-columns:minmax(0,1fr)}}}}
.feed{{background:#0f0f0f;color:#f1f1f1;padding:10px;border-radius:8px;display:grid;gap:4px}}.feed span{{color:#aaa;font-size:12px}}
img{{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:6px;display:block}}
.search{{display:grid;grid-template-columns:160px minmax(0,1fr);gap:12px;border:1px solid #d8d5cf;border-radius:8px;padding:10px}}.search b{{display:block}}.search span,.search p{{font-size:12px;color:#5c5750;margin:4px 0;display:block}}
.meta{{font:12px/1.4 ui-monospace,monospace;color:#5c5750}}table{{width:100%;border-collapse:collapse}}td{{border-bottom:1px solid #eee;padding:10px 6px;vertical-align:top}}
td small{{display:block;color:#5c5750;font-size:12px;margin-top:3px}}.n{{font-variant-numeric:tabular-nums;text-align:right}}
pre{{white-space:pre-wrap;background:#f7f6f3;border:1px solid #e5e2dc;border-radius:6px;padding:14px;font:13px/1.5 system-ui,sans-serif}}
button{{font:inherit;font-size:13px;border:1px solid #d8d5cf;background:#fff;border-radius:5px;padding:6px 10px;cursor:pointer}}
.warn{{border-left:3px solid #8b6002;background:#faf6ea;padding:10px 14px}}</style></head><body><main>
<p style="color:#5c5750;font:12px ui-monospace,monospace;letter-spacing:1px">PACKAGE BOARD · {e(batch.get('created', ''))}</p>
<h1>{e(batch['video'].get('title_working', ''))}</h1>
{''.join(f'<p class="warn">{e(p)}</p>' for p in batch.get('problems', []))}
<h2>Title + thumbnail pairs</h2>{pairs}
<h2>Titles</h2><table>{trows}</table>
<h2>Descriptions</h2>{descs}
{f'<h2>LinkedIn posts</h2><p class="warn">Adapted from the YouTube research; not yet tested on LinkedIn.</p>{lis}' if lis else ''}
{f'<h2>Finish by hand</h2><p>{e(batch.get("notes", ""))}</p>' if batch.get('notes') or batch.get('placeholders') else ''}
{f'<p class="warn">Fill these placeholders before publishing: {e(", ".join(batch["placeholders"]))}</p>' if batch.get('placeholders') else ''}
</main><script>document.addEventListener('click',ev=>{{const b=ev.target.closest('[data-copy]');if(!b)return;navigator.clipboard.writeText(b.dataset.copy).then(()=>{{const o=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=o,1200)}})}})</script></body></html>"""
    open(os.path.join(out, 'board.html'), 'w').write(page)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('batch')
    ap.add_argument('out')
    ap.add_argument('--vault')
    a = ap.parse_args()
    batch = json.load(open(a.batch))
    lines, hard = schema_check(batch, os.path.basename(a.batch))
    for line in lines:
        print(line)
    if hard:
        sys.exit('SCHEMA: fix the errors above before rendering (python3 scripts/validate.py <batch.json>)')
    os.makedirs(a.out, exist_ok=True)
    batch.setdefault('created', dt.date.today().isoformat())
    slug = batch['video'].get('slug') or re.sub(r'[^a-z0-9]+', '-', batch['video'].get('title_working', 'video').lower()).strip('-')[:50]
    batch['video']['slug'] = slug
    batch['problems'] = check(batch)
    batch['placeholders'] = placeholders(batch)

    # The feed preview captions each thumbnail with its paired YouTube title, as viewers will see it.
    for t in batch['thumbnails']:
        p = t.get('pair')
        if isinstance(p, int) and p < len(batch.get('titles', [])):
            t['title'] = batch['titles'][p]['text']
    spec_path = os.path.join(os.path.abspath(a.out), '_spec.json')
    json.dump({'thumbnails': batch['thumbnails']}, open(spec_path, 'w'), indent=1)
    r = subprocess.run(['node', os.path.join(HERE, 'render.cjs'), spec_path, os.path.abspath(a.out)], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    if r.returncode != 0:
        sys.exit('render failed')
    batch['warnings'] = [l for l in (r.stdout + r.stderr).splitlines() if l.startswith('WARNING')]
    json.dump(batch, open(os.path.join(a.out, 'batch.json'), 'w'), indent=1, ensure_ascii=False)
    board(batch, a.out)
    print(f"board: {os.path.join(a.out, 'board.html')}")
    for p in batch['problems']:
        print('CHECK:', p)
    if batch['placeholders']:
        print('NOTE: placeholders to fill by hand:', ', '.join(batch['placeholders']))

    if a.vault:
        entry = f"{batch['created']}-{slug}"
        dest = os.path.join(a.vault, entry)
        os.makedirs(dest, exist_ok=True)
        shutil.copy(os.path.join(a.out, 'batch.json'), dest)
        for t in batch['thumbnails']:
            shutil.copy(os.path.join(a.out, f"{t['id']}.{ext(t)}"), dest)
        idx_path = os.path.join(a.vault, 'index.json')
        idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {'batches': []}
        idx['batches'] = [b for b in idx['batches'] if b['id'] != entry]
        idx['batches'].insert(0, {'id': entry, 'title': batch['video'].get('title_working', ''), 'created': batch['created'],
                                  'thumbnails': len(batch['thumbnails']), 'titles': len(batch.get('titles', [])),
                                  'descriptions': len(batch.get('descriptions', [])),
                                  'linkedin': len(batch.get('linkedin', []))})
        json.dump(idx, open(idx_path, 'w'), indent=1, ensure_ascii=False)
        print(f'vault: {dest} (index updated)')


if __name__ == '__main__':
    main()
