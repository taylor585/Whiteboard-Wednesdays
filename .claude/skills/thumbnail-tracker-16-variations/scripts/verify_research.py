#!/usr/bin/env python3
"""Check that every outlier multiplier quoted in the research docs exists in the source data.

Usage: python3 scripts/verify_research.py [--json] [docs...]
Default docs: references/research/overview.md and creators.md.

A figure is any decimal followed by "×" (e.g. 9.22×, 0.955×). It counts as verified when it
matches (trailing zeros trimmed):
  - any number in references/research/data/*.json (rounded to 3, 2 or 1 dp), or
  - the "outlier" column of references/research/data/*.tsv (rounded to 2 or 1 dp), or
  - WHITELIST below: cross-creator medians recomputed from those files in the original study
    (research/cross-creator.md, which is not shipped with the skill).
Prints unmatched figures with file:line and exits 1 if there are any. Stdlib only.
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "references" / "research"
DATA = RESEARCH / "data"
FIGURE = re.compile(r"(?<![\d.])(\d+\.\d+)\s?×")

# Cross-creator medians and group medians recomputed from the data files in the original study.
WHITELIST = {
    "4.15", "2.12", "0.87", "1.51", "1.16", "1.02", "1.21", "1.34", "2.58", "1.93", "1.37", "0.955",
    "1.08", "0.95", "3.39", "1.64", "0.47", "0.465", "1.24", "0.62", "0.665", "0.49", "1.66", "4.68",
    "1.9", "1.8", "1.4", "1.12", "1.09", "4.18", "0.94", "3.77", "2.79", "0.69", "1.25", "1.42", "1.35",
}
# Group medians that the data files cannot reproduce on their own (the grouping, e.g. "has a
# handwritten proof label", lives in the original teardowns, not in data/*.json). Each entry:
# value -> where it comes from in the original research (not shipped with the skill).
WHITELIST_CROSS_CREATOR = {
    "9.04": "cross-creator.md: Sabri's staged 'secret' storefront scene, median of the 4 brainwash hits "
            "(also research-top/SabriSubyOfficial/teardown.md rule 3)",
    "2.785": "research/SabriSubyOfficial/teardown.md rule 3: latest-30 videos with a handwritten proof label, median (n=6)",
    "0.685": "research/SabriSubyOfficial/teardown.md rule 3: latest-30 videos without a proof label, median (n=24)",
    "2.66": "research-top/rileybrownai/teardown.md title table: 'Beginner / Non-Coders / 101', full-history median (n=8)",
}


def norm(x, dp=None):
    """Format a number and trim trailing zeros: 7.70 -> '7.7', 2.0 -> '2'."""
    s = f"{float(x):.{dp}f}" if dp is not None else repr(float(x))
    return s.rstrip("0").rstrip(".") if "." in s else s


def walk_numbers(o):
    if isinstance(o, bool):
        return
    if isinstance(o, (int, float)):
        yield float(o)
    elif isinstance(o, dict):
        for v in o.values():
            yield from walk_numbers(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk_numbers(v)


def known_values(data_dir=DATA):
    vals = set()
    for f in sorted(data_dir.glob("*.json")):
        for x in walk_numbers(json.loads(f.read_text(encoding="utf-8"))):
            vals.update({norm(x), norm(x, 3), norm(x, 2), norm(x, 1)})
    for f in sorted(data_dir.glob("*.tsv")):
        with open(f, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                try:
                    x = float(row.get("outlier") or "")
                except ValueError:
                    continue
                vals.update({norm(x, 2), norm(x, 1)})
    return vals


def figures(paths):
    for p in paths:
        for n, line in enumerate(Path(p).read_text(encoding="utf-8").splitlines(), 1):
            for m in FIGURE.finditer(line):
                yield Path(p), n, m.group(1)


def verify(paths=None, data_dir=DATA):
    paths = paths or [RESEARCH / "overview.md", RESEARCH / "creators.md"]
    vals = known_values(data_dir) | WHITELIST | set(WHITELIST_CROSS_CREATOR)
    found, unmatched = [], []
    for p, n, fig in figures(paths):
        key = norm(fig)
        found.append(fig)
        if key not in vals:
            unmatched.append({"file": str(p.relative_to(ROOT) if p.is_relative_to(ROOT) else p), "line": n, "figure": fig + "×"})
    return {"figures": len(found), "distinct": len(set(found)), "unmatched": unmatched}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("docs", nargs="*")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    r = verify([Path(d) for d in a.docs] or None)
    if a.json:
        print(json.dumps(r, indent=1))
    else:
        for u in r["unmatched"]:
            print(f"UNMATCHED: {u['file']}:{u['line']}: {u['figure']}")
        print(f"{r['figures']} figures ({r['distinct']} distinct), {len(r['unmatched'])} unmatched")
    sys.exit(1 if r["unmatched"] else 0)


if __name__ == "__main__":
    main()
