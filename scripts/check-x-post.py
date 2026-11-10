#!/usr/bin/env python3
"""Check one X (Twitter) variation against the house rules in PUBLISH.md, "The X post".

    python3 -I scripts/check-x-post.py <variation.json> --brief brief.txt --transcript transcript.txt [--registry registry.json] [--json]

<variation.json> is the variation exactly as it is written to the job:
    {"kind": "single" | "thread", "body": "<the first post>", "replies": ["<each post after it, in order>"]}
A single is one post plus one reply that carries [YOUTUBE LINK]. A thread is 4 to 6 posts in all, the last one carrying
[YOUTUBE LINK]. Lengths are counted the way X counts them: every link 23, every emoji 2, and 2 for any character outside
X's single-weight ranges (arrows, the ellipsis character, Chinese, Japanese and Korean), after Unicode NFC, against 280.
public/x-count.js counts the same way for the app; scripts/tests/ holds both to one set of vectors.

It fails a variation that is too long, links in the wrong place, carries a placeholder, a figure or a quoted phrase that
is not in the brief or the transcript, more than one hashtag, engagement bait or wrong-crowd words. It cannot judge
whether a claim is fair: the session still checks every claim against the transcript and records it in qa/claims.json.
Exit code 0 with no FAIL, 1 with any FAIL, 2 when the file cannot be read.
"""
import json, re, sys, unicodedata

LIMIT, LINK, YT = 280, 23, '[YOUTUBE LINK]'
THREAD_MIN, THREAD_MAX = 4, 6
HOOK_WARN = 140
ONE = ((0, 4351), (8192, 8205), (8208, 8223), (8242, 8247))
URL_RE = re.compile(r"https?://[^\s<>\"']+|\b(?:[a-z0-9-]+\.)+(?:com|co\.uk|org|net|io|ai|app|dev|co|uk|me|tv|ly|be)\b(?:/[^\s<>\"']*)?", re.I)
_B = '[©®‼-㊙\U0001F000-\U0001FAFF]'
_M = '(?:️|[\U0001F3FB-\U0001F3FF])?'
EMOJI_RE = re.compile('[\U0001F1E6-\U0001F1FF]{2}|[0-9#*]️?⃣|' + _B + _M + '(?:‍' + _B + _M + ')*')
PLACEHOLDER_RE = re.compile(r'\[(?:[A-Z][A-Z0-9 _/-]{2,}|your [^\]\n]{2,40})\]|\bX:XX\b')   # Performance Poster's own
HASHTAG_RE = re.compile(r'(?<![\w&])#([A-Za-z_]\w*)')
BAIT = ['like if you', 'like this if', 'repost if', 'retweet if', 'rt if', 'share if you agree', 'tag someone', 'tag a friend',
        'comment yes', 'type yes', 'reply yes', 'follow for more', 'follow me for']
WRONG_CROWD = [r'make money (?:online|with ai)', r'side hustle', r'passive income', r'get rich', r'quit your (?:job|9-?5)',
               r'financial freedom', r'start (?:an|your own) agency', r'dropshipping', r'no experience needed', r'\$\d+k?/(?:day|month|mo)\b']
WORDS = {0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
         11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen',
         19: 'nineteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety',
         100: 'hundred', 1000: 'thousand'}


def strip_url_tail(m):
    tail = re.search(r'[.,;:!?)\]]+$', m)
    return tail.group(0) if tail else ''


def urls(text):
    """Every link X would make in the text, without the punctuation that follows it."""
    out = []
    for m in URL_RE.finditer(text.replace(YT, ' ')):
        u = m.group(0)
        out.append(u[:len(u) - len(strip_url_tail(u))])
    return out


def x_len(text):
    """Weighted length, as X counts it."""
    n = 0
    t = unicodedata.normalize('NFC', str(text or ''))
    n += LINK * t.count(YT)
    t = t.replace(YT, '')

    def url(m):
        nonlocal n
        n += LINK
        return strip_url_tail(m.group(0))
    t = URL_RE.sub(url, t).replace('\uE000', '')
    n += 2 * len(EMOJI_RE.findall(t))
    t = EMOJI_RE.sub('', t)
    for ch in t:
        c = ord(ch)
        n += 1 if any(a <= c <= b for a, b in ONE) else 2
    return n


def norm(s):
    s = unicodedata.normalize('NFKC', str(s or '')).lower().replace('’', "'").replace('‘', "'")
    return re.sub(r"[^a-z0-9']+", ' ', s).strip()


def figures(text):
    """Figures a reader would take as fact: digits (with , . % k m), outside links."""
    t = URL_RE.sub(' ', text.replace(YT, ' '))
    return [m.group(0) for m in re.finditer(r'(?<![\w.])\d[\d,]*(?:\.\d+)?', t)]


def figure_known(fig, source_raw, source_norm):
    plain = fig.replace(',', '')
    if re.search(r'(?<![\d.])' + re.escape(plain) + r'(?![\d])', source_raw.replace(',', '')):
        return True
    try:
        v = float(plain)
    except ValueError:
        return False
    if v != int(v):
        return False
    v = int(v)
    if v in WORDS:
        return re.search(r'\b' + WORDS[v] + r'\b', source_norm) is not None
    if 20 < v < 100 and v % 10:
        return re.search(r'\b' + WORDS[v - v % 10] + ' ' + WORDS[v % 10] + r'\b', source_norm) is not None
    if v >= 1000 and v % 1000 == 0 and v // 1000 in WORDS:
        return re.search(r'\b' + WORDS[v // 1000] + r' thousand\b', source_norm) is not None
    return False


def quotes(text):
    """Phrases in double quotation marks of three words or more: these must be Taylor's exact words."""
    out = []
    for m in re.finditer(r'[“"]([^“”"\n]{3,300})[”"]', text):
        if len(norm(m.group(1)).split()) >= 3:
            out.append(m.group(1))
    return out


def check(v, brief='', transcript='', registry=None):
    """Returns (rows, summary). rows are (level, text) with level PASS, WARN or FAIL."""
    rows = []
    def add(ok, text, warn=False):
        rows.append(('PASS' if ok else 'WARN' if warn else 'FAIL', text))
        return ok

    kind = v.get('kind')
    body = v.get('body')
    replies = v.get('replies')
    if not add(kind in ('single', 'thread'), 'kind is "single" or "thread"'):
        return rows, summary(rows, v, [])
    if not add(isinstance(body, str) and body.strip() != '' and isinstance(replies, list) and all(isinstance(r, str) and r.strip() for r in replies),
               'body and every reply are text, none empty'):
        return rows, summary(rows, v, [])
    posts = [body] + replies
    counts = [x_len(p.strip()) for p in posts]

    if kind == 'single':
        add(len(replies) == 1, 'A single is one post and one reply for the link (%d replies)' % len(replies))
    else:
        add(THREAD_MIN <= len(posts) <= THREAD_MAX, 'A thread is %d to %d posts (%d)' % (THREAD_MIN, THREAD_MAX, len(posts)))
    for i, (p, n) in enumerate(zip(posts, counts)):
        add(n <= LIMIT, 'Post %d of %d: %d of %d as X counts it' % (i + 1, len(posts), n, LIMIT))
    add(len({norm(p) for p in posts}) == len(posts), 'No post repeats another')

    # Links: none in the first post; the YouTube link, once, in the last post, and no other link anywhere.
    add(not urls(body) and YT not in body, 'First post has no link (the hook keeps the whole post)')
    add(posts[-1].count(YT) == 1, 'Last post carries [YOUTUBE LINK] exactly once')
    add(all(YT not in p for p in posts[:-1]), '[YOUTUBE LINK] is only in the last post')
    other = [u for p in posts for u in urls(p)]
    add(not other, 'No other link anywhere' + (': ' + ', '.join(other) if other else ''))
    ph = sorted({m for p in posts for m in PLACEHOLDER_RE.findall(p) if m != YT})
    add(not ph, 'No placeholder left to fill' + (': ' + ', '.join(ph) if ph else ''))

    # The hook: the first post opens with words, and its first line is short enough to read at a glance.
    first = body.strip().split('\n')[0]
    add(not re.match(r'\s*[@#]', body), 'First post does not open with @ or # (a post that opens with @ is shown as a reply)')
    add(x_len(first) <= HOOK_WARN, 'Hook line is %d (aim for %d or fewer)' % (x_len(first), HOOK_WARN), warn=True)
    if kind == 'thread':
        add(not re.search(r'(?m)^\s*\(?\d+\s*[/.)]', '\n'.join(posts)), 'No thread numbering (X draws the thread itself)', warn=True)

    # Hashtags: labels, not reach. None or one, from the audited registry.
    tags = [t for p in posts for t in HASHTAG_RE.findall(p)]
    add(len(tags) <= 1, 'Hashtags: %d (0 or 1)' % len(tags))
    if registry is not None:
        for t in tags:
            st = registry.get(t.lower())
            if st is None:
                add(False, '#%s is not in the hashtag registry: audit it first' % t, warn=True)
            else:
                add(st != 'AVOID', '#%s is %s in the registry' % (t, st))

    # Proof is real: every figure is in the brief or the transcript, every quoted phrase is Taylor's exact words.
    src_raw = brief + '\n' + transcript
    src_norm = norm(src_raw)
    tr_norm = norm(transcript)
    missing = [f for p in posts for f in figures(p) if not figure_known(f, src_raw, src_norm)]
    if brief or transcript:
        add(not missing, 'Every figure is in the brief or the transcript' + (': not found ' + ', '.join(missing) if missing else ''))
    else:
        add(False, 'No brief or transcript given: figures and quotes were not checked', warn=True)
    qs = [q for p in posts for q in quotes(p)]
    if transcript:
        bad = [q for q in qs if norm(q) not in tr_norm]
        add(not bad, 'Every quoted phrase is in the transcript word for word' + (': not found “' + '”, “'.join(bad) + '”' if bad else ''))
    elif qs:
        add(False, 'Quoted phrases were not checked: no transcript given', warn=True)

    low = '\n'.join(posts).lower()
    bait = [b for b in BAIT if b in low]
    add(not bait, 'No engagement bait' + (': ' + ', '.join(bait) if bait else ''))
    wrong = [m.group(0) for w in WRONG_CROWD for m in re.finditer(w, low)]
    add(not wrong, 'No wrong-crowd words' + (': ' + ', '.join(wrong) if wrong else ''))
    emoji = [len(EMOJI_RE.findall(p)) for p in posts]
    add(max(emoji) <= 2, 'Emoji: at most 2 in a post (most %d)' % max(emoji), warn=True)
    add(not re.search(r'\b[A-Z]{5,}\b', '\n'.join(posts).replace(YT, '')), 'No words in capitals', warn=True)
    return rows, summary(rows, v, counts, len(tags))


def summary(rows, v, counts, tags=0):
    fails = sum(1 for r in rows if r[0] == 'FAIL')
    warns = sum(1 for r in rows if r[0] == 'WARN')
    kind = v.get('kind')
    what = 'single post' if kind == 'single' else 'thread of %d' % len(counts) if kind == 'thread' else 'not an X variation'
    length = ('%d of %d' % (counts[0], LIMIT) if kind == 'single' else 'longest %d of %d' % (max(counts), LIMIT)) if counts else 'not counted'
    line = '%s · %s · %s · %d hashtag%s · %d WARN' % ('PASS' if not fails else 'FAIL (%d)' % fails, what, length, tags, '' if tags == 1 else 's', warns)
    return {'fails': fails, 'warns': warns, 'chars': max(counts) if counts else 0, 'counts': counts, 'posts': len(counts),
            'hashtags': tags, 'exceptions': [], 'line': line}


def load_registry(path):
    """Performance Poster's registry.json: {tags: [{tag, status | platforms}]} or {"#Tag": {...}}. Returns {tag: status}."""
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    rows = d.get('tags', d) if isinstance(d, dict) else d
    out = {}
    items = rows.items() if isinstance(rows, dict) else ((r.get('tag') or r.get('hashtag') or '', r) for r in rows)
    for tag, r in items:
        if not isinstance(r, dict) or not tag:
            continue
        st = r.get('x') or r.get('status') or r.get('verdict')
        if not isinstance(st, str):
            pl = r.get('platforms') or r.get('status') or {}
            vals = [str(x).upper() for x in pl.values()] if isinstance(pl, dict) else []
            # X has no page of its own in the registry: a tag to avoid anywhere is avoided here too.
            st = 'AVOID' if 'AVOID' in vals else 'USE' if 'USE' in vals else (vals[0] if vals else 'LISTED')
        out[str(tag).lstrip('#').lower()] = st.upper()
    return out


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    def opt(name):
        return argv[argv.index(name) + 1] if name in argv and argv.index(name) + 1 < len(argv) else None
    paths = [a for a in args if a not in (opt('--brief'), opt('--transcript'), opt('--registry'))]
    if len(paths) != 1:
        print(__doc__); return 2
    def read(p):
        if not p:
            return ''
        with open(p, encoding='utf-8') as f:
            return f.read()
    try:
        with open(paths[0], encoding='utf-8') as f:
            v = json.load(f)
        brief, transcript = read(opt('--brief')), read(opt('--transcript'))
        registry = load_registry(opt('--registry')) if opt('--registry') else None
    except (OSError, ValueError) as e:
        print('Cannot read: %s' % e); return 2
    if not isinstance(v, dict):
        print('The variation must be one JSON object: {kind, body, replies}'); return 2
    rows, s = check(v, brief, transcript, registry)
    if '--json' in argv:
        print(json.dumps({**s, 'checks': [{'level': a, 'text': b} for a, b in rows]}, ensure_ascii=False, indent=1))
    else:
        for a, b in rows:
            print('%-4s  %s' % (a, b))
        print(s['line'])
    return 1 if s['fails'] else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
