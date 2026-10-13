// Builds public/vb-reading.html (complete reading view) from public/vb-content.js.
// Run: node build-vb-reading.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'public/vb-content.js'),'utf8'),ctx);
const deck=ctx.window.WW;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const live=p=>p.replace(/<iframe[^>]*data-src="vb-motion-demo\.html"[^>]*><\/iframe>/,'<p class="vb-reading-demo">The playable scene opens on its own page: <a href="vb-motion-demo.html">A slot becomes a ticket</a>.</p>');
const body=deck.slides.map((s,i)=>'<article id="'+esc(s.id)+'"><div class="micro">'+(i+1)+' / '+esc(s.section)+'</div><h2>'+esc(s.title)+'</h2><div class="parts '+esc(s.kind)+'">'+s.parts.map(p=>'<section class="part">'+live(p)+'</section>').join('')+'</div><p class="source">'+esc(s.source)+'</p></article>').join('');
const html='<!doctype html><html lang="en-GB" data-deck-font="hand"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Using AI vision boards to build apps · Reading view</title><link rel="stylesheet" href="whiteboard.css"><link rel="stylesheet" href="vb.css"><script src="vb.js" defer></script></head><body><main class="vb-reading"><header><img src="ww-coin.svg" alt="Pecuna Factorem official coin logo"><h1>Using AI vision boards to build apps</h1></header><nav><a href="./#/presentation/vision-boards/slide/'+esc(deck.slides[0].id)+'">Open the presentation</a></nav>'+body+'</main></body></html>\n';
fs.writeFileSync(path.join(__dirname,'public/vb-reading.html'),html);
console.log('public/vb-reading.html',deck.slides.length,'slides');
