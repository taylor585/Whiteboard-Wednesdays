#!/usr/bin/env python3
"""Autopilot picks (Taylor, 10 November 2026: "Claude will make every creative pick itself ... so nothing waits on you").

Each subcommand reads what the session already made and checked, and prints the pick as JSON with a one-line reason and
the evidence, so every automatic pick is the same every time and can be read back afterwards (PUBLISH.md "Autopilot").
No pick is ever made from something that failed its check: a thumbnail with a variety FAIL, a post with a checker FAIL or
a placeholder, a reel option the copy guard or the split-screen check refused.

    python3 -I scripts/autopilot-pick.py files    <check.json> [--topics topics.json] [--title "<typed title>"]
    python3 -I scripts/autopilot-pick.py variety  <pack.json> [--failed id,id] [--at <iso time>]
    python3 -I scripts/autopilot-pick.py thumbs   <thumbRound.json>
    python3 -I scripts/autopilot-pick.py posts    <pack.json with platforms>
    python3 -I scripts/autopilot-pick.py reels    <options.json> [--music on|off] [--n 2]
    python3 -I scripts/autopilot-pick.py winners  <highlight pack.json> [--music on|off] [--n 2]
    python3 -I scripts/autopilot-pick.py music    <reels document.json>

Exit 0 with a pick; 3 when autopilot must stop and ask Taylor ("needsYou" in the JSON says why); 2 on unreadable input.
"""
import json, re, sys

PLACEHOLDER = re.compile(r'\[(?:[A-Z][A-Z0-9 _/-]{2,}|your [^\]\n]{2,40})\]|\bX:XX\b')
YT_LINK = '[YOUTUBE LINK]'
STOP = set('a an the and or of to in on for with how what why your you my is are it its this that do does can'.split())


def out(obj, code=0):
    print(json.dumps(obj, indent=1, ensure_ascii=False)); return code


def load(path):
    try:
        with open(path, encoding='utf-8') as f: return json.load(f)
    except (OSError, ValueError) as e:
        print(json.dumps({'error': f'cannot read {path}: {e}'})); sys.exit(2)


def norm(x): return re.sub(r'[^\w]+', ' ', str(x or '').lower(), flags=re.U).strip()
def words(x): return [w for w in norm(x).split() if w and w not in STOP]


# ---- Check the files ----------------------------------------------------------------------------------------------------
def match_topic(text, topics, recorded=None):
    """The Schedule's matching recording: a booked topic whose recordDate is the main recording's camera date, else the
    title words (the same rule as the Publish screen's matchTopic: an exact title, then the booked topic sharing the most
    words, then any topic sharing words). Nothing on a guess with no shared word."""
    live = [t for t in topics if t.get('status') != 'posted']
    if recorded:
        same_day = [t for t in live if t.get('recordDate') == str(recorded)[:10]]
        if len(same_day) == 1: return same_day[0], 'booked for ' + same_day[0]['recordDate'] + ', the day the main recording was made'
    if not str(text or '').strip(): return None, ''
    for t in live:
        if norm(t.get('title')) == norm(text): return t, 'the same title'
    tw = words(text)
    near = lambda a, b: a == b or (len(a) > 3 and len(b) > 3 and a[:5] == b[:5])
    scored = sorted(((sum(1 for w in words(t.get('title')) if any(near(w, x) for x in tw)) + (0.5 if t.get('recordDate') else 0), i, t) for i, t in enumerate(live)), key=lambda x: (-x[0], x[1]))
    if scored and scored[0][0] >= 1: return scored[0][2], 'shares words with the folder name'
    return None, ''


def pick_files(check, topics, typed=None):
    """Accept when the classifier is sure of every file: every source accept, exactly one main (one file or its parts),
    every reel an accepted phone recording, at most five. Otherwise autopilot stops here (an allowed stop)."""
    src = check.get('sources') or []
    unsure = [s.get('name') or s.get('driveId') for s in src if (s.get('decision') or 'ask') != 'accept' and s.get('role') != 'skip']
    mains = [s for s in src if s.get('role') == 'main']
    reels = [s for s in src if s.get('role') == 'reel']
    bad = []
    if unsure: bad.append('the file check is not sure of ' + ', '.join(map(str, unsure)))
    if not mains: bad.append('no main recording')
    if any(s.get('kind') != 'youtube-recording' for s in mains): bad.append('a main file is not a YouTube recording')
    if len(mains) > 1:
        parts = sorted(s.get('part') or 0 for s in mains)
        if parts != list(range(1, len(mains) + 1)): bad.append('the parts of the main recording are not numbered 1 to %d' % len(mains))
        if len({((s.get('probe') or {}).get('width'), (s.get('probe') or {}).get('height')) for s in mains}) > 1:
            bad.append('the parts are not all one size')
    if any(s.get('kind') != 'phone-recording' or s.get('decision') != 'accept' for s in reels): bad.append('a reel file is not an accepted phone recording')
    if len(reels) > 5: bad.append('more than five phone takes')
    if bad:
        note = 'Claude could not tell your files apart: ' + '; '.join(bad) + '. Choose what each file is, then Confirm and continue.'
        return {'accept': False, 'needsYou': {'reason': 'files', 'note': note}, 'evidence': {'sources': len(src), 'unsure': unsure}}, 3
    recorded = next((s.get('recorded') for s in mains if s.get('recorded')), None)
    name = typed or check.get('folderName') or (mains[0].get('name') or '').rsplit('.', 1)[0]
    topic, why = match_topic(name, topics, recorded)
    title = typed or (topic or {}).get('title') or name
    title_from = 'typed' if typed else 'topic' if topic else 'folder'
    reason = ('Every file is clear: ' + ('%d-part main recording' % len(mains) if len(mains) > 1 else 'the main recording') +
              (' and %d phone take%s' % (len(reels), '' if len(reels) == 1 else 's') if reels else '') + '. ' +
              ('Title as you typed it.' if typed else 'Title from your Schedule: “%s”, %s.' % (topic['title'], why) if topic else 'Title from the folder name: no booked topic matched it.'))
    return {'accept': True, 'title': title, 'titleFrom': title_from, 'topicId': (topic or {}).get('id'), 'reels': len(reels), 'path': 'B' if reels else 'A',
            'roles': {s.get('driveId'): s.get('role') for s in src}, 'reason': reason,
            'evidence': {'sources': len(src), 'decisions': sorted({s.get('decision') for s in src}), 'recorded': recorded, 'topicMatch': why or None}}, 0


# ---- The Variety Pack ---------------------------------------------------------------------------------------------------
PROVEN = ('APPROVED BEFORE',)
FRESH = ('NEW', 'ROUND')


def pick_variety(pack, failed=(), at=None):
    """Approve every design on the published pack that passed the build and text-fit checks. The pack itself is built half
    proven, half fresh (build.py's quota), so approving every passing design keeps that balance; where a moment has two
    candidates (Katana, Blender, stories) both are approved and the skill's lock step (Part 1B step 7) rotates between them.
    Designs pre-ticked as approved before keep their own documents; a design marked NOT CHOSEN is left alone."""
    failed = set(failed); approve, skipped, proven, fresh = [], [], 0, 0
    for sec in pack.get('sections') or []:
        for a in sec.get('assets') or []:
            tag = str(a.get('tag') or '')
            if tag.startswith('NOT CHOSEN'): skipped.append({'id': a['id'], 'why': 'not chosen'}); continue
            if a['id'] in failed or a.get('textFit') == 'fail': skipped.append({'id': a['id'], 'why': 'failed the text-fit check'}); continue
            if tag.startswith(PROVEN): proven += 1; continue                   # already pre-ticked (Run step 7)
            if tag.startswith(FRESH): fresh += 1
            approve.append(a['id'])
    total = proven + fresh
    share = round(fresh / total, 3) if total else None
    note = 'Picked by Claude on autopilot (Taylor, 10 November 2026): it passed the build and text-fit checks. Press Change if you do not want it.'
    decisions = {i: {'status': 'approved', 'note': note, 'at': at, 'by': 'claude', 'autopilot': True} for i in approve}
    reason = 'Approved all %d new designs that passed the build and text-fit checks; %d approved before were already ticked (%s fresh).' % (len(approve), proven, '%d%%' % round(share * 100) if share is not None else 'no')
    return {'decisions': decisions, 'approved': approve, 'skipped': skipped, 'reason': reason,
            'evidence': {'proven': proven, 'fresh': fresh, 'freshShare': share, 'balanced': share is None or 0.35 <= share <= 0.65, 'failed': sorted(failed)}}, 0


# ---- Thumbnails ---------------------------------------------------------------------------------------------------------
def score_of(x): s = x.get('score'); return float(s.get('total') if isinstance(s, dict) else s or 0)


def pick_thumbs(round_):
    """The highest Thumbnail Tracker scorecard (0-100, framework section 8) for YouTube, the same design for LinkedIn, and the
    runner-up on the other ground as the Test & Compare (A/B) spare. Only from a round whose variety check has 0 FAIL."""
    vs = [v for v in round_.get('variations') or [] if v.get('id')]
    if (round_.get('check') or {}).get('fails', 0): return {'needsYou': {'reason': 'qa', 'note': 'The thumbnail variety check still fails.'}}, 3
    if not vs: return {'needsYou': {'reason': 'qa', 'note': 'No thumbnails were written to pick from.'}}, 3
    if not any(v.get('score') is not None for v in vs): return {'error': 'no scorecard on any variation: score each one first (thumbnail framework section 8)'}, 2
    rank = sorted(vs, key=lambda v: (-score_of(v), int(v.get('n') or 99)))
    best = rank[0]; ground = best.get('ground')
    spare = next((v for v in rank[1:] if v.get('ground') and v.get('ground') != ground), None)
    picks = {'thumbs.youtube': best['id'], 'thumbs.linkedin': best['id'], 'thumbs.ab': spare['id'] if spare else None}
    reason = 'Thumbnail %s scored highest on the scorecard (%g of 100)%s; LinkedIn uses the same design%s.' % (
        best.get('n') or best['id'], score_of(best), ': ' + str(best.get('words')) if best.get('words') else '', ', and %s (%g, on the %s ground) is kept as the A/B spare' % (spare.get('n') or spare['id'], score_of(spare), spare.get('ground')) if spare else '')
    return {'picks': picks, 'reason': reason, 'evidence': {'scores': {v['id']: score_of(v) for v in rank}, 'check': (round_.get('check') or {}).get('line')}}, 0


# ---- Posts --------------------------------------------------------------------------------------------------------------
def usable(v, key):
    texts = [v.get('title'), v.get('body')] + [v.get('firstComment')] + list(v.get('replies') or [])
    allow_yt = lambda t, i: i >= 2   # the first comment and the replies may carry [YOUTUBE LINK]
    for i, t in enumerate(texts):
        for m in set(PLACEHOLDER.findall(str(t or ''))):
            if not (allow_yt(t, i) and m == YT_LINK): return False, 'still has ' + m
    if int((v.get('checker') or {}).get('fails') or 0): return False, 'the checker still fails it'
    return True, ''


def pick_posts(pack):
    """Per platform: the variation with the fewest checker warnings, then (YouTube) the best-scoring title from the
    headline check, then variation 1. Never a variation with a FAIL or a placeholder. Each platform's polished thumbnail
    is its pick too."""
    picks, why, ev = {}, [], {}
    for pl in pack.get('platforms') or []:
        k, posts = pl.get('key'), pl.get('posts') or []
        if not k: continue
        cand = []
        for i, v in enumerate(posts):
            ok, bad = usable(v, k)
            ch = v.get('checker') or {}
            ev.setdefault(k, []).append({'v': 'v%d' % (i + 1), 'usable': ok, 'why': bad, 'warns': int(ch.get('warns') or 0), 'titleScore': v.get('titleScore')})
            if ok: cand.append((int(ch.get('warns') or 0), -float(v.get('titleScore') or 0), i))
        if not cand: return {'needsYou': {'reason': 'qa', 'note': 'No %s post passed its check.' % (pl.get('label') or k)}, 'evidence': ev}, 3
        w, ts, i = sorted(cand)[0]
        picks[k + '.post'] = 'v%d' % (i + 1)
        if pl.get('thumbnails'): picks[k + '.thumb'] = pl['thumbnails'][0]['id']
        why.append('%s variation %d (%d warning%s%s)' % (pl.get('label') or k, i + 1, w, '' if w == 1 else 's', ', title scored %g' % -ts if ts else ''))
    return {'picks': picks, 'reason': 'Fewest checker warnings, variation 1 on a tie: ' + '; '.join(why) + '.', 'evidence': ev}, 0


# ---- Reels --------------------------------------------------------------------------------------------------------------
def option_ok(o, max_s=60):
    split = o.get('split') or {}
    reasons = []
    if o.get('guard') != 'pass': reasons.append('copy guard')
    if split.get('pass') is not True: reasons.append('not split screen' if split else 'no split-screen check')
    if not (0 < float(o.get('seconds') or 0) <= max_s): reasons.append('over %g s' % max_s)
    if any(not (b.get('silent') is True and b.get('face') is False) for b in o.get('broll') or []): reasons.append('B-roll not silent and face-free')
    return not reasons, reasons


def pick_reels(options, music=True, n=2):
    """Path B: the best n options that pass the copy guard AND the split-screen check (Taylor, 10 November 2026: the reel
    must come out split screen), by the session's reel score, then option order. Music on each from the Settings default."""
    reels = [o for o in options.get('reels') or [] if o.get('id')]
    max_s = float(options.get('maxSeconds') or 60)
    ok, refused = [], {}
    for k, o in enumerate(reels):
        good, why = option_ok(o, max_s)
        (ok.append((-score_of(o), k, o)) if good else refused.__setitem__(o['id'], why))
    if not ok: return {'needsYou': {'reason': 'qa', 'note': 'No reel option passed the copy guard and the split-screen check.'}, 'evidence': {'refused': refused}}, 3
    chosen = [o for _, _, o in sorted(ok)[:n]]
    keep = {o['id']: {'music': bool(music), 'by': 'claude'} for o in chosen}
    reason = 'Kept %s: the best %d of %d that passed the copy guard and the split-screen check%s; music %s (your Settings default).' % (
        ', '.join('option ' + o['id'] for o in chosen), len(chosen), len(reels), ' (%s refused)' % ', '.join('%s: %s' % (i, ', '.join(w)) for i, w in refused.items()) if refused else '', 'on' if music else 'off')
    return {'keep': keep, 'reason': reason, 'evidence': {'scores': {o['id']: score_of(o) for o in reels}, 'split': {o['id']: (o.get('split') or {}).get('line') for o in reels}, 'refused': refused}}, 0


def pick_winners(pack, music=True, n=2):
    """Path A: the best n scripts by the session's script score, then pack order. Taylor then records them (an allowed stop)."""
    ideas = [i for i in pack.get('ideas') or [] if i.get('id')]
    if len(ideas) < n: return {'needsYou': {'reason': 'qa', 'note': 'The highlight pack has fewer than %d reels.' % n}}, 3
    chosen = [i for _, _, i in sorted((-score_of(x), k, x) for k, x in enumerate(ideas))[:n]]
    winners = {i['id']: {'music': bool(music), 'by': 'claude'} for i in chosen}
    reason = 'Picked %s: the highest-scoring %d of %d scripts; music %s (your Settings default). Record them on your phone next.' % (
        ' and '.join('“%s”' % (i.get('name') or i['id']) for i in chosen), n, len(ideas), 'on' if music else 'off')
    return {'winners': winners, 'reason': reason, 'evidence': {'scores': {i['id']: score_of(i) for i in ideas}}}, 0


def pick_music(doc):
    """Every built reel with music on gets the first track the session proposed from Taylor's Drive music folder (the
    proposals are ranked); with no proposal, the first track in the library; with no library, music off for that reel."""
    tracks = [t for t in (doc.get('music') or {}).get('tracks') or [] if t.get('n') is not None]
    props = (doc.get('music') or {}).get('proposals') or {}
    picks, why = {}, []
    for b in doc.get('built') or []:
        if not b.get('music'): continue
        rid = b.get('id'); first = next((t for n in props.get(rid) or [] for t in tracks if str(t['n']) == str(n)), None) or (tracks[0] if tracks else None)
        if first: picks[rid] = {'track': first['n'], 'off': False, 'by': 'claude'}; why.append('Reel %s: “%s”%s' % (rid, first.get('title') or first['n'], ' (proposed first)' if props.get(rid) else ' (first in your folder)'))
        else: picks[rid] = {'track': None, 'off': True, 'by': 'claude'}; why.append('Reel %s: no music (your music folder could not be listed)' % rid)
    return {'musicPicks': picks, 'reason': ('Music from your Drive folder: ' + '; '.join(why) + '.') if why else 'No reel has music on.', 'evidence': {'tracks': len(tracks), 'proposals': props}}, 0


def main(argv):
    if len(argv) < 2 or argv[0] not in ('files', 'variety', 'thumbs', 'posts', 'reels', 'winners', 'music'):
        print(__doc__); return 2
    cmd, path, rest = argv[0], argv[1], argv[2:]
    opt = lambda k, d=None: rest[rest.index(k) + 1] if k in rest and rest.index(k) + 1 < len(rest) else d
    data = load(path)
    if cmd == 'files':
        tp = opt('--topics'); topics = load(tp) if tp else []
        if isinstance(topics, dict): topics = [{'id': k, **v} for k, v in topics.items()]
        r, c = pick_files(data, topics, opt('--title'))
    elif cmd == 'variety': r, c = pick_variety(data, [x for x in (opt('--failed', '') or '').split(',') if x], opt('--at'))
    elif cmd == 'thumbs': r, c = pick_thumbs(data.get('thumbRound', data))
    elif cmd == 'posts': r, c = pick_posts(data.get('pack', data))
    elif cmd == 'reels': r, c = pick_reels(data.get('options', data), opt('--music', 'on') != 'off', int(opt('--n', 2)))
    elif cmd == 'winners': r, c = pick_winners(data.get('pack', data), opt('--music', 'on') != 'off', int(opt('--n', 2)))
    else: r, c = pick_music(data)
    return out(r, c)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
