#!/usr/bin/env python3
"""Compare two images (or two folders of images with the same names).

Usage: python3 scripts/imgdiff.py A.jpg B.jpg
       python3 scripts/imgdiff.py dirA dirB [--mad 2.0] [--p99 40]

Reports mean absolute difference (MAD, 0-255 scale, over all RGB channels) and the
99th percentile of per-pixel max-channel difference. Exits 1 if any pair fails the
thresholds or differs in size. Needs Pillow and numpy.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

IMG = {".jpg", ".jpeg", ".png", ".webp"}


def diff(a, b):
    A, B = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
    if A.size != B.size:
        return {"size_a": A.size, "size_b": B.size, "mad": None, "p99": None}
    d = np.abs(np.asarray(A, dtype=np.int16) - np.asarray(B, dtype=np.int16))
    return {"size": list(A.size), "mad": round(float(d.mean()), 3),
            "p99": round(float(np.percentile(d.max(axis=2), 99)), 2),
            "max": int(d.max())}


def ok(r, mad, p99):
    return r["mad"] is not None and r["mad"] < mad and r["p99"] < p99


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a")
    ap.add_argument("b")
    ap.add_argument("--mad", type=float, default=2.0)
    ap.add_argument("--p99", type=float, default=40)
    x = ap.parse_args()
    a, b = Path(x.a), Path(x.b)
    pairs = []
    if a.is_dir():
        for f in sorted(a.iterdir()):
            if f.suffix.lower() in IMG and not f.name.startswith("_") and (b / f.name).exists():
                pairs.append((f, b / f.name))
    else:
        pairs.append((a, b))
    bad = 0
    for p, q in pairs:
        r = diff(p, q)
        r["file"] = p.name
        r["pass"] = ok(r, x.mad, x.p99)
        bad += not r["pass"]
        print(json.dumps(r))
    if not pairs:
        print("no image pairs found", file=sys.stderr)
        sys.exit(2)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
