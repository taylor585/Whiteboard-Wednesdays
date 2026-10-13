(()=>{
'use strict';
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-copy-lge-prompt]');if(!button)return;
 const panel=button.closest('.lge-prompt-panel'),field=panel.querySelector('textarea'),status=panel.querySelector('[role="status"]');
 let copied=false;button.disabled=true;
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(field.value);copied=true;}}catch{}
 if(!copied){field.focus();field.select();try{copied=document.execCommand('copy');}catch{}if(copied)button.focus();}
 status.textContent=copied?'Full prompt copied. Paste it into your working chat when you are ready.':'Copy was blocked by this browser. The full prompt is selected; use your device’s Copy command.';
 button.textContent=copied?'Copied full prompt':'Copy full prompt';button.disabled=false;
});
})();

// Verified figures finish at their source values; reading mode remains static.
(()=>{
 const canvas=document.getElementById('canvas');if(!canvas)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');const active=new WeakMap();
 function sync(){canvas.querySelectorAll('[data-lge-count]').forEach(el=>{
  const value=Number(el.dataset.lgeCount),visible=!!el.closest('.revealed');
  if(!visible||reduced.matches){const run=active.get(el);if(run)cancelAnimationFrame(run);active.delete(el);el.textContent=String(value);return;}
  if(active.has(el))return;el.setAttribute('aria-label',String(value));const start=performance.now();
  const tick=now=>{if(!el.isConnected)return;const p=Math.min(1,(now-start)/800);el.textContent=String(Math.round(value*(1-Math.pow(1-p,3))));active.set(el,p<1?requestAnimationFrame(tick):0);};
  active.set(el,requestAnimationFrame(tick));
 });}
 new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes].some(n=>n.nodeType===1)))sync();}).observe(canvas,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 reduced.addEventListener('change',sync);sync();
})();
