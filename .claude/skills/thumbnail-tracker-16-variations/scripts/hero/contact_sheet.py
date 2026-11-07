#!/usr/bin/env python3
"""Contact sheet for a round: every thumbnail numbered in a grid, so Taylor picks by number from one image.

Usage:
  python3 contact_sheet.py <out_dir_with_jpgs> <sheet.jpg> [--cols 4] [--title "How To Think With AI"] [--strip strip.png]

Reads every *-YouTube-1280x720.jpg in sorted order, tiles them at 480x270 with a big number badge and the
spec's layout under each, and (with --strip) writes the 168 px colour + greyscale strip for the same round.
"""
import argparse
import glob
import os

from PIL import Image, ImageDraw, ImageFont

FONTS = ['/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']


def font(size):
    for f in FONTS:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--cols', type=int, default=4)
    ap.add_argument('--title', default='')
    ap.add_argument('--strip')
    a = ap.parse_args()
    files = sorted(glob.glob(os.path.join(a.src, '*-YouTube-1280x720.jpg')))
    if not files:
        raise SystemExit('no *-YouTube-1280x720.jpg files in ' + a.src)
    W, H, pad, cap = 480, 270, 18, 40
    rows = (len(files) + a.cols - 1) // a.cols
    top = 70 if a.title else 18
    sheet = Image.new('RGB', (a.cols * (W + pad) + pad, top + rows * (H + cap + pad)), '#0f0f0f')
    d = ImageDraw.Draw(sheet)
    if a.title:
        d.text((pad, 18), f'{a.title}  ·  {len(files)} variations', font=font(30), fill='#ffffff')
    for i, f in enumerate(files):
        x = pad + (i % a.cols) * (W + pad)
        y = top + (i // a.cols) * (H + cap + pad)
        sheet.paste(Image.open(f).convert('RGB').resize((W, H), Image.LANCZOS), (x, y))
        name = os.path.basename(f).replace('-YouTube-1280x720.jpg', '')
        d.rounded_rectangle((x, y + H + 5, x + 40, y + H + 31), 6, fill='#FFD400')
        d.text((x + 20, y + H + 18), str(i + 1), font=font(20), fill='#111111', anchor='mm')
        d.text((x + 50, y + H + 8), name[:48], font=font(16), fill='#aaaaaa')
    sheet.save(a.out, quality=88)
    print(a.out)
    if a.strip:
        cols = len(files)
        st = Image.new('RGB', (cols * 178 + 10, 2 * 105 + 40), '#0f0f0f')
        ds = ImageDraw.Draw(st)
        for i, f in enumerate(files):
            im = Image.open(f).convert('RGB')
            x = 10 + i * 178
            ds.text((x, 8), str(i + 1), font=font(16), fill='#ffffff')
            st.paste(im.resize((168, 95), Image.LANCZOS), (x, 30))
            st.paste(im.convert('L').resize((168, 95), Image.LANCZOS).convert('RGB'), (x, 135))
        st.save(a.strip)
        print(a.strip)


if __name__ == '__main__':
    main()
