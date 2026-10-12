#!/usr/bin/env python3
"""check_brief.py: the gate a Trending Topic Brief must pass before it is delivered.

Usage: python3 check_brief.py <brief.md> [more briefs...]

Checks (see references/brief-format.md):
  1. Every section heading is present, in order: AT A GLANCE, READ BEFORE YOU RECORD, COLD OPEN,
     ACT 1: THE PROBLEM, THE TURN, ACT 2: THE SYSTEM, ACT 3: THE PROOF, CLOSE, PREP CHECKLIST.
  2. Act 1 defines problems as P-numbers (table rows "| P1 |" or bullets "- P54:").
  3. Act 2 has at least one "SEGMENT n:" card, and every card has every field, each non-empty.
  4. Every "IN 5 TO 10 WORDS" line is 5 to 10 words.
  5. Every Act 1 problem appears in at least one card's PROBLEMS IT SOLVES ("P19 to P26" ranges count).
  6. Every card solves at least one Act 1 problem, and names no problem Act 1 does not define.
  7. Act 3 has a NUMBERS line.
Exit 0: all briefs pass. Exit 1: any BLOCKING line. Exit 2: a file is missing.
"""
import re
import sys

SECTIONS = ['AT A GLANCE', 'READ BEFORE YOU RECORD', 'COLD OPEN', 'ACT 1: THE PROBLEM', 'THE TURN',
            'ACT 2: THE SYSTEM', 'ACT 3: THE PROOF', 'CLOSE', 'PREP CHECKLIST']
FIELDS = ['IN 5 TO 10 WORDS', 'WHY SHOULD PEOPLE CARE?', 'WHEN TO USE IT', 'WHEN NOT TO USE IT',
          'PROBLEMS IT SOLVES', 'SAY', 'QUOTE FROM THE SOURCE', 'DRAW', 'DEMO', 'CROSS OFF']


def heading_text(line):
    m = re.match(r'^#{1,6}\s+(.*)$', line)
    return m.group(1).strip().strip('*').strip() if m else None


def problem_refs(text):
    """P-numbers in text, expanding 'P19 to P26' and 'P19-P26'."""
    refs = set()
    for a, b in re.findall(r'\bP(\d+)\s*(?:to|-|–)\s*P(\d+)\b', text):
        refs.update(range(int(a), int(b) + 1))
    refs.update(int(n) for n in re.findall(r'\bP(\d+)\b', text))
    return refs


def field_value(block, field):
    """Value after 'FIELD:' or '**FIELD:**' (an optional '(qualifier)' allowed), up to the next field."""
    label = re.escape(field.rstrip(':'))
    pat = re.compile(r'^\s*\*{0,2}' + label + r'(?:\s*\([^)]*\))?:?\*{0,2}:?\*{0,2}\s*(.*)$', re.M)
    m = pat.search(block)
    if not m:
        return None
    rest = block[m.end():]
    nxt = re.search(r'^\s*\*{0,2}[A-Z][A-Z0-9 ?/()\-]{1,40}:\*{0,2}', rest, re.M)
    tail = rest[:nxt.start()] if nxt else rest
    return (m.group(1) + '\n' + tail).strip()


def words(text):
    clean = re.sub(r'[*_`"“”]', '', text.splitlines()[0] if text else '')
    return [w for w in clean.split() if re.search(r'\w', w)]


def check(path):
    try:
        text = open(path, encoding='utf-8').read()
    except FileNotFoundError:
        print(f'{path}: file not found', file=sys.stderr)
        return None
    problems = []
    lines = text.splitlines()

    # 1. Sections, in order.
    positions = {}
    for i, line in enumerate(lines):
        h = heading_text(line)
        if not h:
            continue
        up = h.upper()
        for s in SECTIONS:
            if s not in positions and up.startswith(s):
                positions[s] = i
    for s in SECTIONS:
        if s not in positions:
            problems.append(f'missing section heading "{s}"')
    found = [s for s in SECTIONS if s in positions]
    if [positions[s] for s in found] != sorted(positions[s] for s in found):
        problems.append('sections are out of order; expected ' + ' > '.join(SECTIONS))

    def section(name):
        if name not in positions:
            return ''
        start = positions[name]
        later = [p for p in positions.values() if p > start]
        return '\n'.join(lines[start + 1:min(later) if later else len(lines)])

    # 2. Act 1 problems.
    act1 = section('ACT 1: THE PROBLEM')
    defined = {int(n) for n in re.findall(r'^\s*(?:\|\s*|[-*]\s*)P(\d+)\b', act1, re.M)}
    if 'ACT 1: THE PROBLEM' in positions and not defined:
        problems.append('Act 1 defines no problems (expected rows like "| P1 |" or bullets "- P1:")')

    # 3 to 6. Act 2 segment cards.
    act2 = section('ACT 2: THE SYSTEM')
    starts = [m for m in re.finditer(r'^#{1,6}\s+\**SEGMENT\s+(\d+)\s*:\s*(.*)$', act2, re.M)]
    if 'ACT 2: THE SYSTEM' in positions and not starts:
        problems.append('Act 2 has no "SEGMENT n:" cards')
    solved = set()
    for k, m in enumerate(starts):
        block = act2[m.end():starts[k + 1].start() if k + 1 < len(starts) else len(act2)]
        name = f'SEGMENT {m.group(1)} ({m.group(2).strip()})'
        for f in FIELDS:
            v = field_value(block, f)
            if v is None:
                problems.append(f'{name}: missing field "{f}"')
            elif not v.strip():
                problems.append(f'{name}: field "{f}" is empty')
        one_liner = field_value(block, 'IN 5 TO 10 WORDS')
        if one_liner:
            n = len(words(one_liner))
            if not 5 <= n <= 10:
                problems.append(f'{name}: "IN 5 TO 10 WORDS" has {n} words: {one_liner.splitlines()[0]!r}')
        refs = problem_refs(field_value(block, 'PROBLEMS IT SOLVES') or '')
        if not refs:
            problems.append(f'{name}: PROBLEMS IT SOLVES names no P-number')
        unknown = sorted(refs - defined) if defined else []
        if unknown:
            problems.append(f'{name}: solves problems Act 1 does not define: ' + ', '.join(f'P{u}' for u in unknown))
        solved |= refs
    uncrossed = sorted(defined - solved)
    if uncrossed:
        problems.append('Act 1 problems no segment solves: ' + ', '.join(f'P{u}' for u in uncrossed))

    # 7. Act 3 numbers.
    if 'ACT 3: THE PROOF' in positions and not re.search(r'NUMBERS', section('ACT 3: THE PROOF')):
        problems.append('Act 3 has no NUMBERS line for the presenter')

    status = 'PASS' if not problems else 'FAIL'
    print(f'{status}  {path}: {len(defined)} problems, {len(starts)} segments, {len(solved & defined)} crossed off')
    for p in problems:
        print(f'  BLOCKING  {p}')
    return not problems


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    results = [check(p) for p in sys.argv[1:]]
    if any(r is None for r in results):
        return 2
    if all(results):
        print('All briefs pass. Deliver them.')
        return 0
    print('Fix every BLOCKING line, then re-run before delivering.', file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())
