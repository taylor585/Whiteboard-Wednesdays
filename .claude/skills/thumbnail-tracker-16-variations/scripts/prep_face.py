#!/usr/bin/env python3
"""Cut a person out of a photo for thumbnail use.

Usage: python3 prep_face.py photo.jpg out.png [--rim 0] [--warm 0.06]

- Removes the background (rembg, human-segmentation model; ~176MB download on first run).
- Crops to the person, keeps head room, scales to 700px tall (the renderer's face height).
- Optional white rim (--rim 10) for the cut-out sticker look; 0 keeps the modern clean look.
- Light contrast/warmth lift so faces stay readable at feed size.
Requires: rembg[cpu], Pillow.
"""
import argparse

from PIL import Image, ImageEnhance, ImageFilter


VIDEO_EXT = ('.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi')


def guard(src, phone_photo=False):
    """Master rule 6: never a photo of Taylor taken from a video. Refuse video files; refuse photos with no
    camera EXIF (frames, screenshots, webcam stills) unless --phone-photo confirms Taylor supplied it."""
    import os
    if os.path.splitext(src)[1].lower() in VIDEO_EXT:
        raise SystemExit('REFUSED (master rule 6): never take a photo of Taylor from a video. Use a phone photo he supplies, or objects only.')
    if phone_photo:
        return
    exif = Image.open(src).getexif()
    if not (exif.get(271) or exif.get(272)):   # Make / Model
        raise SystemExit('REFUSED (master rule 6): this image has no camera EXIF, so it may be a video frame or screenshot. '
                         'Only use a phone photo Taylor supplied (pass --phone-photo to confirm), otherwise go objects only.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--rim', type=int, default=0)
    ap.add_argument('--warm', type=float, default=0.06)
    ap.add_argument('--phone-photo', action='store_true',
                    help='confirm this is a photo Taylor supplied from his phone (needed when it has no camera EXIF)')
    a = ap.parse_args()
    guard(a.src, a.phone_photo)

    from rembg import new_session, remove
    im = Image.open(a.src).convert('RGB')
    rgb = ImageEnhance.Contrast(im).enhance(1.08)
    rgb = ImageEnhance.Color(rgb).enhance(1.06)
    if a.warm:
        r, g, b = rgb.split()
        r = r.point(lambda v: min(255, int(v * (1 + a.warm))))
        rgb = Image.merge('RGB', (r, g, b))
    cut = remove(rgb, session=new_session('u2net_human_seg'))

    box = cut.getbbox()
    if not box:
        raise SystemExit('No person found in the photo.')
    l, t, r_, b = box
    pad = int((b - t) * 0.04)
    cut = cut.crop((max(0, l - pad), max(0, t - pad), min(cut.width, r_ + pad), b))
    scale = 700 / cut.height
    cut = cut.resize((int(cut.width * scale), 700), Image.LANCZOS)

    if a.rim:
        alpha = cut.split()[3]
        grown = alpha.filter(ImageFilter.MaxFilter(a.rim * 2 + 1))
        rim = Image.new('RGBA', cut.size, (255, 255, 255, 0))
        rim.putalpha(grown)
        white = Image.new('RGBA', cut.size, (255, 255, 255, 255))
        white.putalpha(grown)
        cut = Image.alpha_composite(white, cut)

    cut.save(a.out)
    print(f'saved {a.out} {cut.size}')


if __name__ == '__main__':
    main()
