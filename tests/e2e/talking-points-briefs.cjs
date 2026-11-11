// Browser test for the Talking points and Briefs screens (11 November 2026).
// Runs the static app from public/ with a mocked window.claude (an in-memory database and a mocked create_session), so it
// never touches the real artifact database and never starts a real session.
//
//   NODE_PATH=/opt/node-tools/node_modules node tests/e2e/talking-points-briefs.cjs [--shots <dir>]
//
// Everything in SAMPLE below is SAMPLE DATA FOR THIS TEST ONLY. It is not research, it is never published, and the
// sources point at example.com on purpose.
'use strict';
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 8872, BASE = 'http://127.0.0.1:' + PORT + '/';
const PUBLIC = path.join(__dirname, '..', '..', 'public');
const shotsAt = process.argv.indexOf('--shots'), SHOTS = shotsAt > 0 ? process.argv[shotsAt + 1] : null;

// ---- SAMPLE DATA FOR THIS TEST ONLY ----
const SAMPLE = {
  topics: {
    't-chatgpt': { title: "ChatGPT just changed the layout again: here's what's new", status: 'planned', recordDate: '2026-11-13', createdAt: '2026-11-08T09:00:00Z',
      points: [
        { id: 'p1', title: 'The sidebar is one list now', position: 0 }, { id: 'p2', title: 'Projects moved to the top', position: 1 },
        { id: 'p3', title: 'The model picker hides by default', position: 2 }, { id: 'p4', title: 'What to change in your own setup', position: 3 }] },
    't-recorded': { title: 'Claude Code skills in 10 minutes', status: 'recorded', recordDate: '2026-11-09', createdAt: '2026-11-01T09:00:00Z', points: [] },
    't-booked': { title: 'I tested 5 AI note takers', status: 'planned', recordDate: '2026-11-16', createdAt: '2026-11-07T09:00:00Z', points: [] },
    't-posted': { title: 'An old video that already posted', status: 'posted', recordDate: '2026-11-02', createdAt: '2026-10-20T09:00:00Z', points: [] },
    't-new': { title: 'A raw spark that is not shortlisted', status: 'new', recordDate: null, createdAt: '2026-11-09T09:00:00Z', points: [] },
    't-short1': { title: 'Why your Meta ads stopped working', status: 'shortlisted', recordDate: null, createdAt: '2026-11-10T09:00:00Z', points: [] },
    't-short2': { title: 'The one prompt I use every morning', status: 'shortlisted', recordDate: null, createdAt: '2026-11-09T12:00:00Z', points: [] },
  },
  briefs: {
    't-chatgpt': { topicId: 't-chatgpt', title: "ChatGPT just changed the layout again: here's what's new", status: 'ready', createdAt: '2026-11-10T10:00:00Z', updatedAt: '2026-11-10T10:20:00Z',
      sections: {
        atAGlance: 'For business owners who use ChatGPT every day and just opened it to find things moved. The promise: in eight minutes you know exactly what changed and what to do about it.',
        coldOpen: 'Open ChatGPT side by side: last week on the left, today on the right. Point at the three things that moved. "If you opened ChatGPT this morning and felt lost, this is why."',
        points: [
          { title: 'The sidebar is one list now', beats: ['Chats, projects and custom GPTs sit in one scrolling list', 'Pinned items stay at the top', 'Search moved into the list header'], proof: 'Sample source 1: the release notes page, screenshot of the new sidebar.' },
          { title: 'Projects moved to the top', beats: ['Projects open in their own view', 'Files and instructions live with the project', 'Old chats can be dragged in'], proof: 'Sample source 2: the help article on projects.' },
          { title: 'The model picker hides by default', beats: ['It picks a model for you unless you open the menu', 'How to choose a model on purpose', 'When to leave it on automatic'], proof: 'Sample source 1, plus a live demo of the menu.' },
          { title: 'What to change in your own setup', beats: ['Pin your three most used projects', 'Move standing instructions into each project', 'Check your custom GPTs still open'], proof: 'Our own account, before and after, on screen.' },
        ],
        close: 'Pin one project today and tell me in the comments which change you hate most. Next video: the five custom GPTs worth keeping.',
        prep: ['Screenshot last week’s layout before recording', 'Have one real project open with files', 'Open both sources in tabs', 'Check the release date on the notes page'],
      },
      sources: [{ title: 'Sample source 1: release notes', url: 'https://example.com/release-notes' }, { title: 'Sample source 2: projects help article', url: 'https://example.com/help/projects' }] },
    't-short1': { topicId: 't-short1', title: 'Why your Meta ads stopped working', status: 'running', createdAt: '2026-11-11T08:00:00Z', updatedAt: '2026-11-11T08:01:00Z', session: { id: 'session_sample_running', url: 'https://claude.ai/code/session_sample_running' } },
    't-short2': { topicId: 't-short2', title: 'The one prompt I use every morning', status: 'failed', error: 'The web search returned nothing current for this title.', createdAt: '2026-11-10T08:00:00Z', updatedAt: '2026-11-10T08:05:00Z' },
  },
};

// The mock database and connector, installed before any app script runs.
function installMock(sample) {
  const store = new Map(), subs = new Map(), docSubs = new Map();
  for (const [c, docs] of Object.entries(sample)) store.set(c, new Map(Object.entries(docs).map(([id, d]) => [id, JSON.parse(JSON.stringify(d))])));
  const col = c => { if (!store.has(c)) store.set(c, new Map()); return store.get(c); };
  const snapDoc = (id, d) => ({ id, exists: d !== undefined, data: () => (d === undefined ? undefined : JSON.parse(JSON.stringify(d))) });
  const snap = c => ({ docs: [...col(c).entries()].map(([id, d]) => snapDoc(id, d)) });
  const emit = c => { (subs.get(c) || []).forEach(cb => setTimeout(() => cb(snap(c)), 0)); for (const [k, cbs] of docSubs) if (k.startsWith(c + '/')) cbs.forEach(cb => setTimeout(() => cb(snapDoc(k.split('/')[1], col(c).get(k.split('/')[1]))), 0)); };
  const writes = [];
  const docRef = (c, id) => ({
    id,
    async get() { return snapDoc(id, col(c).get(id)); },
    async set(d) { writes.push({ op: 'set', path: c + '/' + id, d }); col(c).set(id, JSON.parse(JSON.stringify(d))); emit(c); },
    async update(d) { writes.push({ op: 'update', path: c + '/' + id, d }); if (!col(c).has(id)) throw { code: 'not_found' }; col(c).set(id, { ...col(c).get(id), ...JSON.parse(JSON.stringify(d)) }); emit(c); },
    async delete() { col(c).delete(id); emit(c); },
    onSnapshot(cb) { const k = c + '/' + id; if (!docSubs.has(k)) docSubs.set(k, []); docSubs.get(k).push(cb); setTimeout(() => cb(snapDoc(id, col(c).get(id))), 0); return () => {}; },
  });
  const db = {
    collection: c => ({
      doc: id => docRef(c, id),
      async add(d) { const id = 'auto' + Math.random().toString(36).slice(2, 8); await docRef(c, id).set(d); return docRef(c, id); },
      async get() { return snap(c); },
      onSnapshot(cb) { if (!subs.has(c)) subs.set(c, []); subs.get(c).push(cb); setTimeout(() => cb(snap(c)), 0); return () => {}; },
    }),
    doc: p => docRef(p.split('/')[0], p.split('/')[1]),
  };
  const sessions = [];
  window.__mock = { db, writes, sessions, mode: 'ok', write: (c, id, d) => docRef(c, id).update(d) };
  window.claude = {
    async use(name) {
      if (name === 'db') return db;
      if (name === 'mcp') return {
        async callTool(server, tool, args) {
          if (server === 'Claude Code Remote' && tool === 'create_session') {
            if (window.__mock.mode === 'refuse') throw { code: 'not_granted' };
            const id = 'session_mock_' + (sessions.length + 1); sessions.push({ id, args }); return { payload: { ccr: { id } } };
          }
          throw { code: 'unavailable' };
        },
      };
      return null;
    },
  };
}

let failures = 0, passes = 0;
const check = (ok, what) => { if (ok) passes++; else { failures++; console.log('FAIL ' + what); } };

function serverUp() { return new Promise(r => { http.get(BASE + 'index.html', res => { res.resume(); r(res.statusCode === 200); }).on('error', () => r(false)); }); }

(async () => {
  let server = null;
  if (!await serverUp()) {
    server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', PUBLIC], { stdio: 'ignore' });
    for (let i = 0; i < 50 && !await serverUp(); i++) await new Promise(r => setTimeout(r, 100));
  }
  const browser = await chromium.launch();
  try {
    for (const width of [375, 390, 768, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 800 : 900 } });
      await ctx.addInitScript(installMock, SAMPLE);
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
      const at = async (hash, sel) => { await page.goto(BASE + hash); await page.waitForSelector(sel, { state: 'visible', timeout: 8000 }); await page.waitForTimeout(450); };
      const noScroll = async what => { const r = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); check(r[0] <= r[1], width + ' no sideways scroll on ' + what + ' (' + r + ')'); };
      const W = '[' + width + '] ';

      // Navigation order
      await at('#/talking-points', '#talking-points .tk-row');
      const nav = await page.$$eval('.app-nav a', as => as.map(a => a.textContent.trim()));
      check(JSON.stringify(nav) === JSON.stringify(['Presentations', 'Vault', 'Creator watchlist', 'Topics', 'Talking points', 'Briefs', 'Schedule', 'Publish']), W + 'nav order ' + nav.join(' · '));
      check(await page.getAttribute('#nav-talking', 'aria-current') === 'page', W + 'Talking points tab is current');
      const navFits = await page.evaluate(() => { const n = document.querySelector('.app-nav'); return n.scrollWidth <= n.clientWidth + 1 || getComputedStyle(n).overflowX === 'auto'; });
      check(navFits, W + 'nav fits or scrolls inside itself');

      // Which topics qualify, and in what order
      const titles = await page.$$eval('#talking-points .tk-row .tk-title', h => h.map(x => x.textContent.trim()));
      check(JSON.stringify(titles) === JSON.stringify(['Claude Code skills in 10 minutes', "ChatGPT just changed the layout again: here's what's new", 'I tested 5 AI note takers', 'Why your Meta ads stopped working', 'The one prompt I use every morning']), W + 'qualifying topics in order: ' + titles.join(' | '));
      check(await page.$$eval('#talking-points .tk-row[data-id=t-chatgpt] .tk-points li', l => l.length) === 4, W + 'four numbered points on the outlined topic');
      check((await page.textContent('#talking-points .tk-row[data-id=t-chatgpt] .tk-points li:first-child .tk-n')).trim() === '01', W + 'points are numbered 01');
      check(/No outline yet/.test(await page.textContent('#talking-points .tk-row[data-id=t-booked]')), W + 'No outline yet shown');
      check(/Open brief/.test(await page.textContent('#talking-points .tk-row[data-id=t-chatgpt] .tk-act')), W + 'ready brief offers Open brief');
      check(/Researching/.test(await page.textContent('#talking-points .tk-row[data-id=t-short1] .tk-act')) && await page.$('#talking-points .tk-row[data-id=t-short1] a[href^="https://claude.ai/code/"]') !== null, W + 'running brief shows Writing state with the session link');
      check(/Could not finish/.test(await page.textContent('#talking-points .tk-row[data-id=t-short2] .tk-act')), W + 'failed brief shows its reason and Try again');
      await noScroll('talking points');
      if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({ path: path.join(SHOTS, 'talking-points-' + width + '.png'), fullPage: true });
      if (SHOTS && width === 1280) require('fs').writeFileSync(path.join(SHOTS, 'talking-points.txt'), await page.innerText('#talking-points'));

      // Clicking the title of a ready topic opens its brief
      await page.click('#talking-points .tk-row[data-id=t-chatgpt] .tk-title a');
      await page.waitForSelector('#briefs .br-sheet', { state: 'visible' });
      check(await page.evaluate(() => location.hash) === '#/briefs/t-chatgpt', W + 'title opens #/briefs/t-chatgpt');

      // The brief page
      await page.waitForTimeout(450);
      check(await page.$$eval('#briefs .br-points>li', l => l.length) === 4, W + 'brief shows 4 talking points');
      for (const sel of ['.br-glance', '.br-cold', '.br-close', '.br-prep', '.br-sources']) check(await page.isVisible('#briefs ' + sel), W + 'brief shows ' + sel);
      const bodySize = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#briefs .br-beats li')).fontSize));
      check(width < 700 ? bodySize >= 17 : bodySize >= 18, W + 'brief body type ' + bodySize + 'px');
      check(await page.getAttribute('#nav-briefs', 'aria-current') === 'page', W + 'Briefs tab is current');
      await noScroll('brief');
      if (SHOTS && (width === 390 || width === 1280)) await page.screenshot({ path: path.join(SHOTS, 'brief-' + width + '.png'), fullPage: true });
      if (SHOTS && width === 1280) require('fs').writeFileSync(path.join(SHOTS, 'brief.txt'), await page.innerText('#briefs'));

      // Recording view on, Esc off, button off
      await page.click('#briefs [data-act=record]');
      check(await page.evaluate(() => document.body.classList.contains('br-recording')), W + 'recording view on');
      check(!(await page.isVisible('.site-header')) && !(await page.isVisible('.app-nav')) && !(await page.isVisible('.site-foot')), W + 'recording view hides header, tabs and footer');
      check(await page.isVisible('#briefs [data-act=record]'), W + 'the way out stays visible');
      check(!(await page.isVisible('#briefs [data-act=print]')) && !(await page.isVisible('#briefs [data-act=deck]')), W + 'recording view hides the other actions');
      await noScroll('recording view');
      if (SHOTS && width === 1280) await page.screenshot({ path: path.join(SHOTS, 'recording-view-1280.png'), fullPage: false });
      await page.keyboard.press('Escape');
      check(!(await page.evaluate(() => document.body.classList.contains('br-recording'))) && await page.isVisible('.app-nav'), W + 'Esc leaves recording view');
      await page.click('#briefs [data-act=record]'); await page.click('#briefs [data-act=record]');
      check(!(await page.evaluate(() => document.body.classList.contains('br-recording'))), W + 'the button leaves recording view');
      await page.click('#briefs [data-act=record]'); await page.goto(BASE + '#/talking-points'); await page.waitForTimeout(200);
      check(!(await page.evaluate(() => document.body.classList.contains('br-recording'))) && await page.isVisible('.app-nav'), W + 'leaving the brief leaves recording view');

      // The list of briefs
      await at('#/briefs', '#briefs .br-row');
      const groups = await page.$$eval('#briefs .br-group h2', h => h.map(x => x.textContent.trim()));
      check(groups.length === 2 && /Ready to record/.test(groups[0]) && /In progress/.test(groups[1]), W + 'briefs list groups ' + groups.join(' | '));
      check(await page.$$eval('#briefs .br-group', g => g[0].querySelectorAll('.br-row').length) === 1, W + 'one ready brief listed');
      await noScroll('briefs list');
      if (SHOTS && width === 1280) require('fs').writeFileSync(path.join(SHOTS, 'briefs-list.txt'), await page.innerText('#briefs'));

      // Unknown brief
      await at('#/briefs/does-not-exist', '#briefs .br-blank');
      check(/not here/.test(await page.textContent('#briefs')), W + 'unknown brief explains itself');

      // History: back and forward
      await at('#/library', '#library-wall .pin');
      await page.click('#nav-talking'); await page.waitForSelector('#talking-points .tk-row', { state: 'visible' });
      await page.click('#nav-briefs'); await page.waitForSelector('#briefs .br-row', { state: 'visible' });
      await page.click('#briefs .br-row-act a'); await page.waitForSelector('#briefs .br-sheet', { state: 'visible' });
      await page.goBack(); await page.waitForSelector('#briefs .br-row', { state: 'visible' });
      check(await page.evaluate(() => location.hash) === '#/briefs', W + 'back to the briefs list');
      await page.goBack(); await page.waitForSelector('#talking-points .tk-row', { state: 'visible' });
      check(await page.evaluate(() => location.hash) === '#/talking-points', W + 'back to talking points');
      await page.goForward(); await page.goForward(); await page.waitForSelector('#briefs .br-sheet', { state: 'visible' });
      check(await page.evaluate(() => location.hash) === '#/briefs/t-chatgpt', W + 'forward to the brief');

      if (width === 1280) {
        // Create outline: request, session, and the states the session writes back
        await at('#/talking-points', '#talking-points .tk-row');
        await page.click('#talking-points .tk-row[data-id=t-booked] [data-act=create]');
        await page.waitForFunction(() => /Starting Claude Code/.test(document.querySelector('#talking-points .tk-row[data-id=t-booked] .tk-act').textContent));
        const s = await page.evaluate(() => window.__mock.sessions[0]);
        check(s && s.args.prompt === 'Create talking points t-booked. Follow TALKING-POINTS.md in this repository exactly.' && s.args.model === 'claude-opus-5-5' && s.args.source_url === 'https://github.com/taylor585/Whiteboard-Wednesdays', W + 'create_session called with the runbook line');
        const firstWrite = await page.evaluate(() => window.__mock.writes.find(w => w.path === 'briefs/t-booked'));
        check(firstWrite && firstWrite.op === 'set' && firstWrite.d.status === 'requested' && firstWrite.d.topicId === 't-booked' && firstWrite.d.createdAt, W + 'briefs/<id> written as requested first');
        check(await page.$('#talking-points .tk-row[data-id=t-booked] a[href="https://claude.ai/code/session_mock_1"]') !== null, W + 'Starting shows Open the session');
        await page.evaluate(() => window.__mock.write('briefs', 't-booked', { status: 'running' }));
        await page.waitForFunction(() => /Researching/.test(document.querySelector('#talking-points .tk-row[data-id=t-booked] .tk-act').textContent));
        check(true, W + 'Writing state follows the database');
        await page.evaluate(() => window.__mock.write('briefs', 't-booked', { status: 'ready', sections: { atAGlance: 'x', coldOpen: 'x', points: [1, 2, 3, 4].map(n => ({ title: 'Point ' + n, beats: ['a', 'b'], proof: 'p' })), close: 'x', prep: ['x'] } }));
        await page.waitForFunction(() => /Open brief/.test(document.querySelector('#talking-points .tk-row[data-id=t-booked] .tk-act').textContent));
        check(/Rewrite outline/.test(await page.textContent('#talking-points .tk-row[data-id=t-booked] .tk-act')), W + 'Ready shows Open brief and Rewrite outline');

        // Refused connector: the line to send in a chat
        await page.evaluate(() => { window.__mock.mode = 'refuse'; });
        await page.click('#talking-points .tk-row[data-id=t-recorded] [data-act=create]');
        await page.waitForFunction(() => /Create talking points t-recorded/.test(document.querySelector('#talking-points .tk-row[data-id=t-recorded] .tk-act').textContent));
        check(/did not allow/.test(await page.textContent('#talking-points .tk-row[data-id=t-recorded] .tk-act')), W + 'refusal explains itself and shows the copy line');
        await page.evaluate(() => { window.__mock.mode = 'ok'; });

        // Turn into presentation
        await at('#/briefs/t-chatgpt', '#briefs .br-sheet');
        await page.click('#briefs [data-act=deck]');
        await page.waitForFunction(() => window.__mock.sessions.some(s => /^Build deck from brief t-chatgpt\. Follow TALKING-POINTS\.md/.test(s.args.prompt)));
        await page.waitForFunction(() => /Starting the build/.test(document.querySelector('#briefs .br-actions').textContent));
        check(true, W + 'Turn into presentation starts the build session');
        await page.evaluate(() => window.__mock.write('briefs', 't-chatgpt', { deck: { status: 'running', session: { id: 'session_mock_x', url: 'https://claude.ai/code/session_mock_x' } } }));
        await page.waitForFunction(() => /Building the presentation/.test(document.querySelector('#briefs .br-actions').textContent));
        check(await page.$('#briefs .br-actions a[href="https://claude.ai/code/session_mock_x"]') !== null, W + 'Building shows the session link');
        await page.evaluate(() => window.__mock.write('briefs', 't-chatgpt', { deck: { status: 'ready', deckId: 'ai-harnesses' } }));
        await page.waitForSelector('#briefs a[href="#/presentation/ai-harnesses"]');
        await page.click('#briefs a[href="#/presentation/ai-harnesses"]');
        await page.waitForSelector('#player:not([hidden]) #canvas h2', { timeout: 8000 });
        check(true, W + 'Open presentation opens the deck');
        await page.evaluate(() => window.__mock.write('briefs', 't-chatgpt', { deck: { status: 'failed', error: 'The quotation check failed on slide 3.' } }));
        await at('#/briefs/t-chatgpt', '#briefs .br-sheet');
        check(/quotation check failed/.test(await page.textContent('#briefs .br-actions')) && /Try again/.test(await page.textContent('#briefs .br-actions')), W + 'a failed build shows its reason and Try again');
      }

      // Existing screens still open
      for (const [hash, sel] of [['#/library', '#library-wall .pin'], ['#/vault', '#vault .va-head'], ['#/watchlist', '#video-ideas'], ['#/topics', '#brainstorm'], ['#/schedule', '#topics'], ['#/publish', '#publish'], ['#/settings', '#settings'], ['#/presentation/vision-boards', '#player #canvas h2'], ['#/presentation/ai-harnesses/slide/done-gate', '#player #canvas h2'], ['#/video-ideas', '#video-ideas']]) {
        await at(hash, sel);
        check(await page.isVisible(sel), W + hash + ' opens');
        await noScroll(hash);
      }
      check(errors.length === 0, W + 'no page errors: ' + errors.join(' / '));
      await ctx.close();
    }

    // Reduced motion: screens land finished
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(installMock, SAMPLE);
    const page = await ctx.newPage();
    await page.goto(BASE + '#/library'); await page.waitForSelector('#library-wall .pin');
    await page.click('#nav-talking'); await page.waitForSelector('#talking-points .tk-row', { state: 'visible' });
    const running = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target?.closest?.('#talking-points')).length);
    check(running === 0, '[reduced] no entrance plays on Talking points (' + running + ')');
    await page.click('#nav-briefs'); await page.waitForSelector('#briefs .br-row', { state: 'visible' });
    const running2 = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target?.closest?.('#briefs')).length);
    check(running2 === 0, '[reduced] no entrance plays on Briefs (' + running2 + ')');
    await ctx.close();
  } finally {
    await browser.close();
    if (server) server.kill();
  }
  console.log(passes + ' passed, ' + failures + ' failed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
