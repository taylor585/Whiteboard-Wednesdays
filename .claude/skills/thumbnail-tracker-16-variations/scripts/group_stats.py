#!/usr/bin/env python3
"""Compare groups of thumbnails (eras, templates, layouts) from a track_channel.py run.

Usage:
  python3 group_stats.py <workdir>/videos.tsv tags.tsv

tags.tsv: one line per video you tagged, "<index or video id><TAB><tag>[,<tag>...]".
Tag by eye from the contact sheets, e.g.:
  1   repo-header,face-looking-up
  5   trend-curve
  12  course,whiteboard
Ranges work too: "1-24<TAB>era-clean-3d".

Prints, per tag: number of videos, median views, median outlier ratio, share of videos at x2+,
and the best example. Hidden view counts are skipped. Untagged videos form "(untagged)".
Requires nothing beyond the standard library.
"""
import statistics
import sys


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    rows = []
    for line in open(sys.argv[1]).read().splitlines()[1:]:
        p = line.split('\t', 5)
        if len(p) < 6:
            continue
        rows.append({'i': int(p[0]), 'id': p[1], 'v': int(p[2]) if p[2] else None,
                     'o': float(p[4]) if p[4] else None, 't': p[5]})
    by_i = {r['i']: r for r in rows}
    by_id = {r['id']: r for r in rows}
    tags = {}
    for line in open(sys.argv[2]):
        if not line.strip() or line.startswith('#'):
            continue
        key, _, t = line.rstrip('\n').partition('\t')
        names = [x.strip() for x in t.split(',') if x.strip()]
        key = key.strip()
        if '-' in key and all(x.isdigit() for x in key.split('-', 1)):
            a, b = map(int, key.split('-', 1))
            targets = [by_i[i] for i in range(a, b + 1) if i in by_i]
        elif key.isdigit():
            targets = [by_i[int(key)]] if int(key) in by_i else []
        else:
            targets = [by_id[key]] if key in by_id else []
        for r in targets:
            for n in names:
                tags.setdefault(n, []).append(r)
    tagged = {r['i'] for rs in tags.values() for r in rs}
    tags['(untagged)'] = [r for r in rows if r['i'] not in tagged]

    print(f"{'tag':<28}{'n':>4}{'median views':>14}{'median x':>10}{'x2+':>7}  best example")
    for name, rs in sorted(tags.items(), key=lambda kv: -statistics.median([r['o'] for r in kv[1] if r['o'] is not None] or [0])):
        known = [r for r in rs if r['v'] is not None and r['o'] is not None]
        if not known:
            continue
        mv = int(statistics.median(r['v'] for r in known))
        mo = statistics.median(r['o'] for r in known)
        hit = sum(1 for r in known if r['o'] >= 2) / len(known)
        best = max(known, key=lambda r: r['o'])
        print(f"{name:<28}{len(known):>4}{mv:>14,}{mo:>10.2f}{hit:>7.0%}  #{best['i']} x{best['o']} {best['t'][:50]}")
    print('\nSmall groups (n < 5) are anecdotes, not patterns. Topic and timing confound every group.')


if __name__ == '__main__':
    main()
