#!/usr/bin/env python3
"""Render the layout gallery: one small JPG per archetype plus a labelled index sheet.

Usage: python3 scripts/gallery.py [--spec examples/sample-spec.json] [--out assets/layouts]

Renders the spec through render.cjs (bundled fonts, network for fonts blocked), then writes
<out>/<id>.jpg at 640x360, quality 85 (ids in sample-spec.json are the archetype names), and
<out>/_index.png, a labelled grid of all of them. Exits 1 if an archetype is missing from
the spec or a render fails. Needs Node + Playwright, Pillow.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from validate import load_schema  # noqa: E402

W, H, Q = 640, 360, 85


def label_font(size):
    for f in [ROOT / "assets/fonts/ibm-plex-mono-latin.woff2"]:
        try:
            return ImageFont.truetype(str(f), size)
        except Exception:
            pass
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", "DejaVuSansMono-Bold.ttf"]:
        try:
            return ImageFont.truetype(f, size)
        except Exception:
            pass
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", default=str(ROOT / "examples" / "sample-spec.json"))
    ap.add_argument("--out", default=str(ROOT / "assets" / "layouts"))
    ap.add_argument("--cols", type=int, default=4)
    a = ap.parse_args()
    spec = json.load(open(a.spec))
    thumbs = spec["thumbnails"]
    archetypes = load_schema("spec")["definitions"]["archetypes"]["enum"]
    missing = [x for x in archetypes if x not in {t["archetype"] for t in thumbs}]
    if missing:
        print(f"WARNING: spec has no example for: {', '.join(missing)}", file=sys.stderr)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="gallery-") as tmp:
        # Render full size as PNG, so the 640x360 JPG is encoded once.
        for t in thumbs:
            t.pop("format", None)
            t.pop("scale", None)
        sp = Path(tmp) / "spec.json"
        sp.write_text(json.dumps({"thumbnails": thumbs}))
        env = dict(os.environ, THUMB_OFFLINE=os.environ.get("THUMB_OFFLINE", "1"))
        r = subprocess.run(["node", str(ROOT / "scripts" / "render.cjs"), str(sp), tmp], env=env,
                           capture_output=True, text=True)
        sys.stderr.write("".join(l + "\n" for l in (r.stdout + r.stderr).splitlines() if "WARNING" in l))
        if r.returncode:
            sys.stderr.write(r.stdout + r.stderr)
            sys.exit("render failed")
        written, tiles = [], []
        for t in thumbs:
            im = Image.open(Path(tmp) / f"{t['id']}.png").convert("RGB")
            small = im.resize((W, round(W * im.height / im.width)), Image.LANCZOS)
            dest = out / f"{t['id']}.jpg"
            small.save(dest, "JPEG", quality=Q, optimize=True, progressive=True)
            written.append({"file": dest.name, "archetype": t["archetype"], "bytes": dest.stat().st_size})
            tiles.append((t["archetype"], small))
    # Labelled index sheet.
    cols = min(a.cols, len(tiles))
    tw, th, pad, lab = 320, 180, 16, 30
    rows = -(-len(tiles) // cols)
    sheet = Image.new("RGB", (pad + cols * (tw + pad), pad + rows * (th + lab + pad)), "#1C1A17")
    d = ImageDraw.Draw(sheet)
    f = label_font(18)
    for i, (name, im) in enumerate(tiles):
        x, y = pad + (i % cols) * (tw + pad), pad + (i // cols) * (th + lab + pad)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
        d.text((x, y + 4), name, fill="#F5EAD8", font=f)
    idx = out / "_index.png"
    sheet.save(idx, optimize=True)
    written.append({"file": idx.name, "bytes": idx.stat().st_size})
    print(json.dumps({"out": str(out), "files": written, "missing_archetypes": missing}, indent=1))
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
