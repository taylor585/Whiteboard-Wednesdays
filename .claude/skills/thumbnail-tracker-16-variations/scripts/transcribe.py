#!/usr/bin/env python3
"""Transcribe a video or audio file into a timestamped transcript and draft chapters.

Usage:
  python3 transcribe.py <video/audio file> <out_dir> [--model small] [--language en]

Writes to out_dir:
  transcript.txt        "[mm:ss] text" per segment (what you read to find hooks, proof and key moments)
  transcript.srt        standard subtitles (upload to YouTube for accurate captions)
  segments.json         [{start, end, text}]
  chapters_draft.json   candidate chapter breaks: first at 0:00, then at long pauses or topic-shift
                        cue phrases ("step two", "next", "now let's", "the first", ...), at least 45s apart.
                        These are only break POINTS. Claude names each chapter after reading the
                        transcript, and must keep YouTube's rules: first chapter 0:00, 3+ chapters, each 10s+.
  meta.json             duration, language, model, words

Needs ffmpeg and faster-whisper (pip install faster-whisper; the model downloads on first use).
CPU speed with "small": very roughly 0.3-0.5x the video length on 4 cores. "base" is faster and rougher,
"medium" slower and better (use it for heavy accents or jargon).
"""
import argparse
import json
import os
import re
import subprocess
import sys

CUES = re.compile(r"\b(step (one|two|three|four|five|\d)|first(ly)?,|second(ly)?,|next(,| up| thing)|now let'?s|let'?s (move|talk|look|jump)|"
                  r"moving on|the (first|second|third|next|last|final) (thing|step|part|one|mistake|reason|way)|"
                  r"part (one|two|three|\d)|number (one|two|three|four|five|\d)|okay so|alright,? so|so now|finally)\b", re.I)


def ts(sec, srt=False):
    h, rem = divmod(int(sec), 3600)
    m, s = divmod(rem, 60)
    if srt:
        ms = int((sec - int(sec)) * 1000)
        return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--model', default='small')
    ap.add_argument('--language', default=None)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit('faster-whisper is not installed: pip install faster-whisper')

    # Decode with ffmpeg ourselves (16 kHz mono float) so faster-whisper never needs PyAV, whose
    # version often clashes with the one faster-whisper expects.
    import numpy as np
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', a.src, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                       capture_output=True)
    if r.returncode != 0 or not r.stdout:
        sys.exit('ffmpeg could not read the file: ' + r.stderr.decode(errors='ignore')[-300:])
    audio = np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0

    model = WhisperModel(a.model, device='cpu', compute_type='int8')
    segs_iter, info = model.transcribe(audio, language=a.language, vad_filter=True, beam_size=5)
    segs = []
    for s in segs_iter:
        segs.append({'start': round(s.start, 2), 'end': round(s.end, 2), 'text': s.text.strip()})
        print(f'[{ts(s.start)}] {s.text.strip()}', flush=True)

    with open(os.path.join(a.out, 'transcript.txt'), 'w') as f:
        for s in segs:
            f.write(f"[{ts(s['start'])}] {s['text']}\n")
    with open(os.path.join(a.out, 'transcript.srt'), 'w') as f:
        for i, s in enumerate(segs, 1):
            f.write(f"{i}\n{ts(s['start'], True)} --> {ts(s['end'], True)}\n{s['text']}\n\n")
    json.dump(segs, open(os.path.join(a.out, 'segments.json'), 'w'), indent=1)

    # Candidate chapter breaks: pauses >= 1.5s or cue phrases, spaced 45s+, always starting at 0:00.
    breaks = [{'s': 0, 't': '0:00', 'why': 'start', 'first_words': segs[0]['text'] if segs else ''}]
    for prev, cur in zip(segs, segs[1:]):
        gap = cur['start'] - prev['end']
        cue = CUES.search(cur['text'])
        if (gap >= 1.5 or cue) and cur['start'] - breaks[-1]['s'] >= 45:
            breaks.append({'s': int(cur['start']), 't': ts(cur['start']), 'why': f'cue "{cue.group(0)}"' if cue else f'{gap:.1f}s pause',
                           'first_words': cur['text']})
    duration = segs[-1]['end'] if segs else 0
    json.dump(breaks, open(os.path.join(a.out, 'chapters_draft.json'), 'w'), indent=1)
    json.dump({'duration_s': round(duration, 1), 'duration': ts(duration), 'language': info.language,
               'model': a.model, 'words': sum(len(s['text'].split()) for s in segs), 'segments': len(segs),
               'chapter_candidates': len(breaks)}, open(os.path.join(a.out, 'meta.json'), 'w'), indent=1)
    print(f'\n{len(segs)} segments, {ts(duration)}, {len(breaks)} chapter candidates -> {a.out}')


if __name__ == '__main__':
    main()
