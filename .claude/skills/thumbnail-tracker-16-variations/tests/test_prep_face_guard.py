"""Master rule 6: prep_face.py never accepts a still taken from a video."""
import os
import subprocess
import sys
import tempfile
import unittest

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, 'scripts', 'prep_face.py')
sys.path.insert(0, os.path.join(ROOT, 'scripts'))


class TestGuard(unittest.TestCase):
    def run_guard(self, src, *extra):
        return subprocess.run([sys.executable, SCRIPT, src, os.devnull, *extra], capture_output=True, text=True)

    def test_refuses_video_files(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, 'reel.mp4')
            open(p, 'wb').write(b'\x00')
            r = self.run_guard(p, '--phone-photo')
            self.assertNotEqual(r.returncode, 0)
            self.assertIn('master rule 6', r.stderr)

    def test_refuses_frame_without_exif(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, 'frame.png')
            Image.new('RGB', (64, 64), 'grey').save(p)
            r = self.run_guard(p)
            self.assertNotEqual(r.returncode, 0)
            self.assertIn('no camera EXIF', r.stderr)

    def test_accepts_phone_exif(self):
        import prep_face
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, 'phone.jpg')
            im = Image.new('RGB', (64, 64), 'grey')
            ex = im.getexif()
            ex[271] = 'Apple'
            ex[272] = 'iPhone 15 Pro'
            im.save(p, exif=ex)
            prep_face.guard(p)  # no exception


if __name__ == '__main__':
    unittest.main()
