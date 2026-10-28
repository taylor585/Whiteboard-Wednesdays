#!/usr/bin/env python3
"""Usage: SKILLS_DIR=<folder with performance-poster and thumbnail-tracker> python3 scripts/build-post-package.py <work folder> public/post-packages.json
The work folder holds brief.txt, youtube-description.txt, linkedin-post.txt, linkedin-first-comment.txt,
instagram-caption.txt, titles.txt, package.json and the variety specs it lists.

Build public/post-packages.json from a Performance Poster work folder and Thumbnail Tracker variety specs.
The check counts are the checker's own output (check_post.py --json), never typed by hand."""
import json, os, subprocess, sys, pathlib
SK = pathlib.Path(os.environ.get('SKILLS_DIR', str(pathlib.Path.home()/'.claude/skills')))  # the folder holding performance-poster/ and thumbnail-tracker/
CHECK = SK/'performance-poster/scripts/check_post.py'
W = pathlib.Path(sys.argv[1]); OUT = pathlib.Path(sys.argv[2])
def run(kind, f, *extra):
    r = subprocess.run(['python3', str(CHECK), kind, str(W/f), '--brief', str(W/'brief.txt'), '--json', *extra], capture_output=True, text=True)
    d = json.loads(r.stdout); rows = d['rows']
    n = lambda lv: sum(1 for x in rows if x['level'] == lv)
    return {'pass': n('PASS'), 'warn': n('WARN'), 'fail': n('FAIL'), 'warnings': [x['check'] + (': ' + x['detail'] if x['detail'] else '') for x in rows if x['level'] == 'WARN']}
def split(f):
    t = (W/f).read_text().rstrip('\n'); body, _, tags = t.rpartition('\n\n'); return body, tags
def tiles(spec):
    out = []
    for t in json.loads((W/spec).read_text())['thumbnails']:
        out.append({'id': t['id'], 'theme': t['theme'], 'bg': t['bg_style'], 'font': t['font'], 'headline': t['headline'], 'highlight': t.get('highlight', ''),
                    'mark': t.get('highlight_style', ''), 'accent': t.get('accent', ''), 'color': t.get('headline_color', ''),
                    'stickers': [{'type': s['type'], 'text': s['text']} for s in t.get('stickers', []) if s['type'] in ('emoji', 'mark')]})
    return out
def variety(spec):
    r = subprocess.run(['python3', str(SK/'thumbnail-tracker/scripts/variety.py'), 'check', str(W/spec)], capture_output=True, text=True)
    return r.stdout.strip().splitlines()[-1]
meta = json.loads((W/'package.json').read_text())
yt, yt_tags = split('youtube-description.txt'); li, li_tags = split('linkedin-post.txt'); ig, ig_tags = split('instagram-caption.txt')
pkg = dict(meta)
pkg['platforms'] = {
  'youtube': {'label': 'YouTube', 'kind': 'Description', 'heading': meta['title'], 'body': yt, 'tags': yt_tags, 'check': run('youtube', 'youtube-description.txt'), 'titleCheck': run('title', 'titles.txt')},
  'linkedin': {'label': 'LinkedIn', 'kind': 'Post', 'heading': li.split('\n')[0], 'body': li, 'tags': li_tags, 'firstComment': (W/'linkedin-first-comment.txt').read_text().strip(), 'check': run('linkedin', 'linkedin-post.txt')},
  'instagram': {'label': 'Instagram Reel', 'kind': 'Caption', 'heading': ig.split('\n')[0], 'body': ig, 'tags': ig_tags, 'check': run('instagram', 'instagram-caption.txt', '--format', 'reel', '--end-card', 'link in bio')}}
pkg['thumbnails'] = [tiles(s) for s in meta.pop('specs')]
pkg['varietyCheck'] = [variety(s) for s in json.loads((W/'package.json').read_text())['specs']]
# Add or replace this video's package; other videos' packages are kept.
old = json.loads(OUT.read_text())['packages'] if OUT.exists() else []
data = {'about': 'Packages written by Claude Code with Performance Poster and Thumbnail Tracker. The Post screen shows them; it never generates or posts on its own.',
        'packages': sorted([p for p in old if p['id'] != pkg['id']] + [pkg], key=lambda p: p['postDate'])}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
for k, v in pkg['platforms'].items(): print(k, v['check']['pass'], 'pass', v['check']['warn'], 'warn', v['check']['fail'], 'fail')
print('variety', pkg['varietyCheck'])
