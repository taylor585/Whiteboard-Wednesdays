/* How Powerful Is Grok Bot Really?: plays each slide's approved motion one click at a time (same player as fp.js).
   Each .gb-stage lists the time (ms) every reveal plays to in data-stops. The shared player reveals one
   marker part per click; this script seeks the slide's animations to match, so Back, Replay, direct links
   and reduced motion all land on the same frame. Entrance and chapter-card motion run on their own. */
(()=>{
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let cur=null;
const own=a=>!/ent-/.test(a.animationName||'');
function seek(k,animate){
 cancelAnimationFrame(cur.raf);
 const stops=cur.stops,to=stops[Math.min(Math.max(k,0),stops.length-1)];
 cur.stage.dataset.at=String(k);cur.at=k;
 if(!animate||!cur.anims.length){cur.anims.forEach(a=>{a.currentTime=to;});return;}
 const from=stops[k-1],t0=performance.now();
 const tick=now=>{const t=Math.min(to,from+(now-t0));cur.anims.forEach(a=>{a.currentTime=t;});if(t<to)cur.raf=requestAnimationFrame(tick);};
 cur.raf=requestAnimationFrame(tick);
}
function sync(){
 const stage=document.querySelector('#canvas .gb-stage');
 if(!stage){if(cur)cancelAnimationFrame(cur.raf);cur=null;return;}
 const parts=[...stage.closest('.parts').children];
 const k=Math.max(0,parts.filter(p=>p.classList.contains('revealed')).length-1);
 if(!cur||cur.stage!==stage){
  if(cur)cancelAnimationFrame(cur.raf);
  const slide=stage.querySelector('.s');
  stage.querySelectorAll('.s').forEach(s=>s.classList.add('play'));
  const anims=reduced.matches?[]:slide.getAnimations({subtree:true}).filter(own);
  anims.forEach(a=>{a.pause();a.currentTime=0;});
  cur={stage,anims,stops:[0,...stage.dataset.stops.split(',').map(Number)],at:-1,raf:0};
  seek(k,false);return;
 }
 if(k!==cur.at)seek(k,k===cur.at+1&&!reduced.matches);
}
const canvas=document.getElementById('canvas');
if(canvas){new MutationObserver(sync).observe(canvas,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});sync();}
reduced.addEventListener('change',()=>{cur=null;sync();});
})();
