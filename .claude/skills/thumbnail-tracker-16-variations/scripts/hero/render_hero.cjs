#!/usr/bin/env node
// Screenshot HTML pages with Chromium, supersampled.
// Usage: node render_hq.cjs [--scale 2] [--viewport 1280x720] [--full] in.html out.png [in2.html out2.png ...]
// HQ thumbnails: build_hq.py calls this at --scale 2 (or more for larger sizes), then downsamples with Pillow.
// Feed mocks: feed_mock.py calls it with --scale 1 --viewport 1440x900 --full.
const path = require('path');

function loadPlaywright() {
  for (const t of ['playwright', '/opt/node-tools/node_modules/playwright', 'playwright-core']) {
    try { return require(t); } catch (_) {}
  }
  console.error('Playwright not found. Install with: npm i -g playwright (and a Chromium build).');
  process.exit(1);
}

(async () => {
  const args = process.argv.slice(2);
  let scale = 2, vw = 1280, vh = 720, full = false;
  const pairs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scale') scale = parseFloat(args[++i]);
    else if (args[i] === '--viewport') [vw, vh] = args[++i].split('x').map(Number);
    else if (args[i] === '--full') full = true;
    else pairs.push(args[i]);
  }
  if (!pairs.length || pairs.length % 2) { console.error('give in.html out.png pairs'); process.exit(2); }
  const { chromium } = loadPlaywright();
  const opts = {};
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  let b;
  try { b = await chromium.launch(opts); } catch (e) {
    b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => { throw e; });
  }
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: scale });
  for (let i = 0; i < pairs.length; i += 2) {
    await p.goto('file://' + path.resolve(pairs[i]));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.resolve(pairs[i + 1]), fullPage: full });
    console.log(pairs[i + 1]);
  }
  await b.close();
})();
