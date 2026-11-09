"""Build the Vault's static content: public/vault.json and the images in public/vault/.

Run from the repository root with an isolated interpreter:

    python3 -I scripts/build-vault.py <staging-dir>

<staging-dir> holds the staging sets gathered for the Vault:
  vault-thumbs/manifest.json + images/          thumbnails (platform youtube|linkedin)
  vault-videos/youtube/manifest.json + posters/  finished YouTube videos (+ _src/yt-meta.json: public descriptions)
  vault-videos/linkedin/manifest.json + posters/ finished LinkedIn cuts (+ link-posts.json)
  vault-videos/instagram/manifest.json + posters/ finished reels and 4:5 posts with captions
  vault-videos/finals.json                       the authoritative list of finished edits inside Claude: the YouTube,
                                                 LinkedIn and Instagram lanes show exactly its records with status "final",
                                                 each opening its artifactUrl (never YouTube)

Rules (Taylor, 9 November 2026):
  - No reel covers and no thumbnails as video posters. A video shows a poster frame only when the staging
    notes say it is a frame of the edit; otherwise the app draws a plain title tile.
  - App test runs are test fixtures and are never published: finals status "app-test" (the Thinking reels on
    SQbLAx1sAsJASHxFkPdQEy) and anything from the How To Think test job (2026-11-06-e2e01, DJavZzVFrCvg2w1imwYXn1),
    including its thumbnails, LinkedIn cut and post copy. "alternate" and "candidate" edits stay out of the lanes.
  - A finished video with no reachable file in Claude has no finals record and no card; its thumbnails and post copy
    still appear under Thumbnails and Post copy.
  - Text is copied verbatim. Nothing is written to any database.
"""
import json, os, re, sys, unicodedata
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JSON = os.path.join(ROOT, 'public', 'vault.json')
OUT_DIR = os.path.join(ROOT, 'public', 'vault')

TEST_RUN = ('DJavZzVFrCvg2w1imwYXn1', '2026-11-06-e2e01', 'SQbLAx1sAsJASHxFkPdQEy', '2026-11-06-e2er1')

# One group per finished video. Titles and dates come from the public YouTube feed where the video is public.
GROUPS = [
    dict(id='editing', youtubeId='a3TkKK29lo4'),
    dict(id='niches', title='The 50 Most Profitable Niches', date='2026-11-05', shortId='52pacfNSQLk'),
    dict(id='ai-skill', youtubeId='6t7FzrHykfA'),
    dict(id='grok-bot', youtubeId='4R4sodUAH_8'),
    dict(id='agents-call', title='My Grok Bots Had a Real Call', date='2026-10-29'),
    dict(id='grok-voice', youtubeId='HoBmgiusNZo'),
    dict(id='top-1', youtubeId='NC3l-4QtFTI'),
    dict(id='harnesses', youtubeId='vaMSQktgGr8'),
    dict(id='lead-gen', title='Lead Gen Engine - Tutorial', date='2026-10-13'),
    dict(id='icp', youtubeId='-ftUEDPk3Jo'),
]
# Staging names that point at a group.
ALIAS = {
    'How To Think With AI': 'ai-skill',
    '5 of the most highly profitable niches that you can steal': 'niches',
    'Thinking framework (How To Think With AI)': 'ai-skill',
    'Top 50 Most Profitable Industries / The 50 Most Profitable Niches': 'niches',
    'ICP Buyer Research': 'icp',
    'My Grok Bots Had a Real Call (AI agents call)': 'agents-call',
    'How AI Harnesses Can 10x Your Quality and Output': 'harnesses',
    'Using AI vision boards to build apps': 'top-1',
    'yt-icp-research-agent': 'icp', 'yt-ai-harnesses': 'harnesses', 'yt-claude-top-1-percent': 'top-1',
    'yt-grok-voice-sales-reps': 'grok-voice', 'yt-grok-bot-two-businesses': 'grok-bot', 'yt-most-valuable-ai-skill': 'ai-skill',
    'yt-video-editing-with-claude': 'editing', 'drive-lead-gen-engine-tutorial': 'lead-gen', 'drive-lead-gen-engine-tutorial-20min': 'lead-gen',
    'li-icp-buyer-research': 'icp', 'li-ai-harnesses-v2': 'harnesses', 'li-edit-videos-with-claude': 'editing',
    'li-how-to-think-with-ai-chat': 'ai-skill',
    'li-link-how-good-is-grok-bot-really': 'grok-bot', 'li-link-vision-boards': 'top-1',
    'lge-tutorial-master': 'lead-gen', 'lge-tutorial-20min': 'lead-gen', 'yt-top50-niches': 'niches',
    'li-vision-boards': 'top-1', 'li-top50-niches': 'niches',
}
# Posters the staging notes show are frames of the edit (never a cover or a thumbnail).
FRAME_POSTERS = {n + '.jpg' for n in (
    'drive-lead-gen-engine-tutorial', 'drive-lead-gen-engine-tutorial-20min',
    'ig-icp-a-reel', 'ig-icp-b-reel', 'ig-icp-c-reel', 'ig-icp-d-reel', 'ig-icp-e-reel', 'ig-icp-b-post', 'ig-icp-d-post',
    'ig-agents-call-a-reel', 'ig-agents-call-b-reel', 'ig-agents-call-c-reel',
    'ig-aih-reel-1', 'ig-aih-reel-2', 'ig-aih-reel-3', 'ig-vb-reel-1', 'ig-vb-reel-2', 'ig-vb-reel-3', 'ig-icp-legacy-reel-3')}
# Not thumbnails: the 4:5 card filed under LinkedIn is the vision-board Instagram feed video's cover image.
SKIP_THUMBS = {'linkedin-how-to-use-claude-like-the-top-1-post-4x5-draw-animate-agree'}
LIMITS = {'youtube': 5000, 'instagram-posts': 2200, 'instagram-reels': 2200, 'linkedin': 3000}


def load(p, default=None):
    if not os.path.exists(p):
        return default
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def is_test_run(*values):
    blob = json.dumps(values, ensure_ascii=False)
    return any(t in blob for t in TEST_RUN)


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def save_jpg(src, name, max_side=1280, budget=180_000):
    """Resize to max_side on the long edge and save a progressive JPG under the byte budget."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    k = min(1.0, max_side / max(w, h))
    if k < 1:
        im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
    out = os.path.join(OUT_DIR, name)
    q = 84
    while True:
        im.save(out, 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(out) <= budget or q <= 60:
            break
        q -= 4
    return 'vault/' + name, im.size


def main(stage):
    th_dir = os.path.join(stage, 'vault-thumbs')
    vv = os.path.join(stage, 'vault-videos')
    meta = {d['youtubeId']: d for d in load(os.path.join(vv, 'youtube', '_src', 'yt-meta.json'), [])}
    finals = load(os.path.join(vv, 'finals.json'))
    if finals is None:
        raise SystemExit('vault-videos/finals.json is missing: it is the list of finished edits the video lanes show.')
    finals = finals if isinstance(finals, list) else (finals.get('videos') or finals.get('finals') or finals.get('records') or [])
    tests = {r['id'] for r in finals if r.get('status') == 'app-test'}
    os.makedirs(OUT_DIR, exist_ok=True)
    for f in os.listdir(OUT_DIR):
        if f.endswith('.jpg'):
            os.remove(os.path.join(OUT_DIR, f))

    groups = []
    for g in GROUPS:
        m = meta.get(g.get('youtubeId'))
        groups.append(dict(id=g['id'], title=(m['title'] if m else g['title']), date=(m['published'][:10] if m else g['date']),
                           youtubeId=g.get('youtubeId'), shortId=g.get('shortId')))
    gids = {g['id'] for g in groups}
    items, skipped = [], []

    def group_of(*keys):
        for k in keys:
            if not k:
                continue
            if k in gids:
                return k
            if k in ALIAS:
                return ALIAS[k]
            for g in groups:
                if k and norm(k) == norm(g['title']):
                    return g['id']
        raise SystemExit('No group for ' + repr(keys))

    # 1-3. YouTube, LinkedIn and Instagram: exactly the finished edits in finals.json, each opening its artifact.
    ig = load(os.path.join(vv, 'instagram', 'manifest.json'), [])
    li = load(os.path.join(vv, 'linkedin', 'manifest.json'), [])
    series = {r['id']: r.get('series') for r in ig}
    lane_of = {'youtube': 'youtube', 'linkedin': 'linkedin', 'instagram': 'instagram'}
    for r in finals:
        if r.get('status') != 'final' or is_test_run(r.get('id'), r.get('artifactUrl')):
            skipped.append(r['id'] + ' (' + str(r.get('status')) + ')'); continue
        url = r.get('artifactUrl') or ''
        if not re.match(r'^https://claude\.ai/artifact/[A-Za-z0-9]+$', url):
            raise SystemExit('Finals record without a Claude artifact link: ' + r['id'])
        g = group_of(r['id'], series.get(r['id']))
        grp = next(x for x in groups if x['id'] == g)
        lane = lane_of[r['platform']]
        poster = None
        pname = os.path.basename(r.get('poster') or '')
        if pname in FRAME_POSTERS:
            side, budget = (540, 70_000) if lane == 'instagram' else (960, 120_000)
            poster, _ = save_jpg(r['poster'], r['id'] + '.jpg', side, budget)
        it = dict(id=r['id'], lane=lane, group=g, durationSec=r.get('durationSec'), poster=poster, artifactUrl=url,
                  finished=(r.get('editedAt') or '')[:10] or None)
        if lane == 'youtube':
            m = meta.get(grp.get('youtubeId'))
            it.update(title=r['title'], posted=m['published'][:10] if m else None, aspect='16/9')
        elif lane == 'linkedin':
            it.update(title=grp['title'], aspect='16/9')
        else:
            reel = r['kind'] == 'reel'
            it.update(bubble='reels' if reel else 'posts', title=r['title'], aspect='9/16' if reel else '4/5')
        items.append(it)

    # 4. Thumbnails: YouTube and LinkedIn only.
    order = {'posted-on-youtube': 0, 'final': 1, 'variation': 2}
    thumbs = [t for t in load(os.path.join(th_dir, 'manifest.json'), [])]
    thumbs.sort(key=lambda t: (t['platform'], order.get(t['kind'], 3)))
    seen_n = {}
    for t in thumbs:
        if is_test_run(t.get('source'), t.get('notes')) or t['id'] in SKIP_THUMBS:
            skipped.append(t['id']); continue
        g = group_of(t['videoTitle'])
        src, size = save_jpg(os.path.join(th_dir, t['file']), t['id'] + '.jpg')
        n = None
        if t['kind'] == 'variation':
            key = (t['platform'], g)
            seen_n[key] = n = seen_n.get(key, 0) + 1
        items.append(dict(id=t['id'], lane='thumbnails', bubble=t['platform'], group=g, kind=t['kind'], n=n,
                          width=t['width'], height=t['height'], src=src))

    # 5. Post copy, verbatim.
    for g in groups:
        for yid, label in ((g.get('youtubeId'), 'YouTube description'), (g.get('shortId'), 'YouTube Short description')):
            m = meta.get(yid)
            if m and (m.get('description') or '').strip():
                items.append(dict(id='yt-desc-' + yid.strip('-'), lane='post-copy', bubble='youtube', group=g['id'],
                                  label=label, text=m['description'].strip(), limit=LIMITS['youtube']))
    for r in ig:
        if r['id'] in tests or is_test_run(r.get('id'), r.get('sourceUrl'), r.get('files')) or not (r.get('caption') or '').strip():
            continue
        b = 'instagram-reels' if r['kind'] == 'reel' else 'instagram-posts'
        items.append(dict(id='cap-' + r['id'], lane='post-copy', bubble=b, group=group_of(r['series']), label=r['title'],
                          text=r['caption'].strip(), limit=LIMITS[b]))
    for r in li:
        if is_test_run(r):
            continue
        pc = r.get('postCopy') or {}
        g = group_of(r['id'])
        if (pc.get('body') or '').strip():
            items.append(dict(id='li-' + r['id'], lane='post-copy', bubble='linkedin', group=g, label='LinkedIn video post',
                              text=pc['body'].strip(), firstComment=(pc.get('firstComment') or '').strip() or None, limit=LIMITS['linkedin']))
        else:
            for i, a in enumerate(pc.get('alternatives') or []):
                if (a.get('body') or '').strip():
                    items.append(dict(id='li-%s-%d' % (r['id'], i + 1), lane='post-copy', bubble='linkedin', group=g,
                                      label='Draft %d · %s' % (i + 1, a['label'].split(' · ')[0]), text=a['body'].strip(),
                                      firstComment=(a.get('firstComment') or '').strip() or None, limit=LIMITS['linkedin']))
    for r in load(os.path.join(vv, 'linkedin', 'link-posts.json'), []):
        if is_test_run(r) or not (r.get('body') or '').strip():
            continue
        items.append(dict(id=r['id'], lane='post-copy', bubble='linkedin', group=group_of(r['id']), label='LinkedIn link post',
                          text=r['body'].strip(), firstComment=(r.get('firstComment') or '').strip() or None, limit=LIMITS['linkedin']))

    used = {i['group'] for i in items}
    out = dict(version=1,
               groups=[g for g in groups if g['id'] in used], items=items)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')

    count = {}
    for i in items:
        k = i['lane'] + ('/' + i['bubble'] if i.get('bubble') else '')
        count[k] = count.get(k, 0) + 1
    total = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    print('finals.json: %d records' % len(finals))
    for k in sorted(count):
        print('  %-28s %d' % (k, count[k]))
    vids = [i for i in items if i['lane'] in ('youtube', 'linkedin', 'instagram')]
    print('videos with an Open link: %d of %d' % (sum(1 for i in vids if i.get('artifactUrl')), len(vids)))
    print('skipped (test run or not a thumbnail):', ', '.join(skipped))
    print('images: %d files, %.1f MB' % (len(os.listdir(OUT_DIR)), total / 1e6))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
