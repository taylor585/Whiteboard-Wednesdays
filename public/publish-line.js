/* The publishing line (Taylor chose P2 "Production Line" on 16 November 2026). The rules behind the Publish line, kept out
   of publish.js so node can test them (publish-line.test.mjs): which station a Video job stands at, whether it waits on
   Taylor, and the two-link rule of New video.

   Station mapping: every job status lands on exactly one of the five stations.
     0 Drive links    saved (on the line, not run yet), new, queued (a start that was refused or never made), check
                      (Check the files waits for Taylor); a failed job whose files were never checked
     1 Variety Pack   starting, running (Check the files, earlier work, the pack being made), found, pack; a failed job
                      whose files were checked but that never got past the pack
     2 Finished edits finishing (any session.step: finals, pilot, review, thumbs), pilot, review, ask, thumbs, posts; a
                      failed job that stopped after the pack (session.step finals, pilot, review or thumbs, or pickedAt)
     3 Ready to post  final, until every switched-on platform has posted
     4 Posted         posted, or final with every switched-on platform posted (the caller says so: posted:true)

   The two-link rule (Taylor, 16 November 2026): New video takes the main video (16:9, or the house 32:9; it becomes the
   YouTube video and the LinkedIn cut) and the reel (an upright phone recording; it becomes the Instagram reel and the 4:5
   post, and Facebook gets the same). Both are required, each a drive.google.com file link, and they must be different
   files. A job that declares its links (jobs/<id>.links) or was saved to the line never starts without both: runBlock()
   says why, and publish.js refuses to start it. Jobs from before (one folder, or a list of file links) have no links and
   keep the old rules. */
(() => {
  'use strict';
  const STATIONS = ['Drive links', 'Variety Pack', 'Finished edits', 'Ready to post', 'Posted'];
  const LATER = ['finals', 'pilot', 'review', 'thumbs'];
  const WORKING = ['starting', 'running', 'finishing'];
  // The files are checked once Taylor confirmed them, the session marked each one done, or the job is past the pack.
  const filesChecked = j => !!j && (!!j.checkedAt || ['found','pack','finishing','pilot','review','ask','thumbs','posts','final','posted'].includes(j.status) || ((j.sources || []).length > 0 && j.sources.every(x => x.check === 'done')));

  // A Google Drive file link: drive.google.com/file/d/<id>, or /open?id=<id> and /uc?id=<id>. A folder is told apart.
  function driveFile(url) {
    const s = String(url ?? '').trim();
    if (!s) return {kind:'empty', id:null, url:''};
    let u; try { u = new URL(s); } catch { return {kind:'bad', id:null, url:s}; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return {kind:'bad', id:null, url:s};
    const host = u.hostname.toLowerCase(), path = u.pathname;
    if (host === 'docs.google.com') return {kind:'doc', id:null, url:s};
    if (host !== 'drive.google.com') return {kind:'other', id:null, url:s};
    if (/\/folders?\//.test(path) || /^\/(embedded)?folderview\/?$/.test(path) || /^\/drive\/(u\/\d+\/)?(my-drive|shared-drives|recent|starred)/.test(path)) return {kind:'folder', id:null, url:s};
    const m = path.match(/^\/file\/(?:u\/\d+\/)?d\/([\w-]{20,})(?:\/|$)/);
    if (m) return {kind:'file', id:m[1], url:s};
    const q = u.searchParams.get('id');
    if (/^\/(open|uc)\/?$/.test(path) && q && /^[\w-]{20,}$/.test(q)) return {kind:'file', id:q, url:s};
    return {kind:'bad', id:null, url:s};
  }
  const NAME = {main:'main video', reel:'reel'};
  // Every problem with the two links, in plain words. Empty when both are good.
  function checkLinks(main, reel) {
    const a = driveFile(main), b = driveFile(reel), out = [];
    const one = (p, k) => {
      if (p.kind === 'empty') return;
      if (p.kind === 'folder') out.push('The '+NAME[k]+' link is a Drive folder. Paste the file’s own link: open the file in Drive, choose Share, Copy link.');
      else if (p.kind === 'doc') out.push('The '+NAME[k]+' link is a Google Docs, Sheets or Slides link, not a video file.');
      else if (p.kind !== 'file') out.push('The '+NAME[k]+' link is not a drive.google.com file link. In Drive choose Share, Copy link, and paste that.');
    };
    one(a, 'main'); one(b, 'reel');
    if (a.kind === 'file' && b.kind === 'file' && a.id === b.id) out.push('The two links are the same file. The reel is its own upright phone recording: paste its link.');
    return out;
  }
  // Why Run cannot start (one short line for the disabled button), or '' when it can.
  function linkBlock(main, reel) {
    const a = driveFile(main).kind === 'empty', b = driveFile(reel).kind === 'empty';
    if (a && b) return 'Add both links to run';
    if (a) return 'Add the 16:9 link to run';
    if (b) return 'Add the reel link to run';
    return checkLinks(main, reel).length ? 'Fix the links to run' : '';
  }
  // The two declared links of a job: jobs/<id>.links first, else the sources with those roles (file links only).
  function linksOf(j) {
    const L = j?.links || {}, src = j?.sources || [];
    const pick = role => L[role]?.url ? {url:L[role].url, driveId:L[role].driveId || driveFile(L[role].url).id} : (() => { const s = src.find(x => x.role === role && x.url); return s ? {url:s.url, driveId:s.driveId || null} : null; })();
    return {main:pick('main'), reel:pick('reel')};
  }
  // A job with declared links, or one saved to the line, needs both links before any session starts.
  const declared = j => !!j && (!!j.links || j.status === 'saved');
  const runBlock = j => { if (!declared(j)) return ''; const l = linksOf(j); return linkBlock(l.main?.url, l.reel?.url); };

  function station(j, {posted = false} = {}) {
    const s = j?.status || 'new';
    if (s === 'posted' || (s === 'final' && posted)) return 4;
    if (s === 'final') return 3;
    if (['saved', 'new', 'queued', 'check'].includes(s)) return 0;
    if (['starting', 'running', 'found', 'pack'].includes(s)) return 1;
    if (['finishing', 'pilot', 'review', 'ask', 'thumbs', 'posts'].includes(s)) return 2;
    if (s === 'failed') return LATER.includes(j.session?.step) || j.pickedAt ? 2 : filesChecked(j) || j.packUrl ? 1 : 0;
    return 0;
  }
  // What the card says, and whether the job waits on Taylor. btn is the label of its ink action (it opens the job's screen;
  // on a saved job it is Run, which starts it).
  const ACT = {queued:'Start now', check:'Check the files', found:'Choose', pack:'Make your picks', pilot:'Watch the pilot', review:'Watch and approve', ask:'Answer one question', thumbs:'Pick a thumbnail', posts:'Pick the posts', failed:'Open it'};
  const WORD = {queued:'Not started', check:'Waiting for you to check the files', found:'Found earlier work', pack:'Variety Pack ready for your picks', pilot:'Pilot ready to watch', review:'Master and LinkedIn cut ready to watch', ask:'Needs your booking link or buyer', thumbs:'Thumbnails ready to pick', posts:'Thumbnails and posts ready to pick', failed:'Stopped'};
  const BUSY = {starting:'Starting', running:'Claude Code is working on it', finishing:'Claude Code is working on the edit'};
  const AUTO_STOPS = ['pack', 'pilot', 'review', 'thumbs', 'posts'];  // Claude's picks on autopilot, never Taylor's
  function card(j, opts = {}) {
    const s = j?.status || 'new', ap = j?.autopilot?.on === true, nd = ap && j.autopilot?.needsYou;
    const at = station(j, opts);
    if (at === 4) return {at, needs:false, kind:'done', word:'Posted'};
    if (at === 3) return {at, needs:false, kind:'ready', word:j.hold?.on ? 'On hold' : 'Ready to post', hold:!!j.hold?.on};
    if (s === 'saved') { const block = runBlock(j); return {at, needs:true, kind:block ? 'miss' : 'saved', word:block ? (block === 'Add both links to run' ? 'Links missing · cannot run yet' : block === 'Fix the links to run' ? 'A link needs fixing · cannot run yet' : (block.includes('reel') ? 'Reel' : '16:9')+' link missing · cannot run yet') : 'Both links in · not run yet', btn:'Run', block}; }
    if (WORKING.includes(s)) return {at, needs:!!nd, kind:nd ? 'need' : 'work', word:nd ? 'Hands-off is paused: it needs you' : BUSY[s], btn:nd ? 'Open it' : null};
    if (ap && !nd && AUTO_STOPS.includes(s)) return {at, needs:false, kind:'work', word:'Claude is making this pick (hands-off)'};
    if (ACT[s]) return {at, needs:true, kind:'need', word:WORD[s], btn:ACT[s]};
    return {at, needs:false, kind:'work', word:s};
  }
  const api = {STATIONS, station, card, checkLinks, linkBlock, linksOf, runBlock, declared, driveFile, filesChecked};
  if (typeof window !== 'undefined') window.WWLine = api;
})();
