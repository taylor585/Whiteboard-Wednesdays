/* Whiteboard Wednesdays device kit v2.0: device runtime and recording tools.
   Call WWDeviceKit(deck) once, after dist/library.js has started, with the same deck object the viewer renders.
   It never edits the viewer: it watches #progress (the viewer's aria-live status) to learn the slide and reveal.
   Devices handled here: animated counts (.d-num) and tap-the-page hotspots (.d-hot). All other devices are pure CSS.
   Tools: Spotlight (S), Pen (P), Clear (C), Presenter (V), Record cues (R). */
window.WWDeviceKit=function(deck,options){
 options=options||{};
 const tools=options.tools!==false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const $=s=>document.querySelector(s),el=(t,a={},h='')=>{const e=document.createElement(t);Object.assign(e,a);e.innerHTML=h;return e;};
 const strip=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();};
 const current=()=>{const id=decodeURIComponent(location.hash.split('/').pop()||'');const i=deck.slides.findIndex(s=>s.id===id);const t=$('#progress')?.textContent||'';const m=t.match(/reveal (\d+) \/ (\d+)/);const s=deck.slides[i];return {i,s,step:m?+m[1]:(s?Math.max(...s.reveals):0),max:s?Math.max(...s.reveals):0};};
 const fmt=ms=>{const t=Math.max(0,ms)/1000;return String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(1).padStart(4,'0');};
 const notify=t=>{const n=$('#toast');if(!n)return;n.textContent=t;n.hidden=false;setTimeout(()=>n.hidden=true,4500);};

 // Animated counts: the final value is in the markup, so the reading view and reduced motion show it without script.
 const countUp=()=>document.querySelectorAll('#canvas .part.revealed .d-num:not([data-done])').forEach(n=>{n.dataset.done='1';const to=+n.dataset.count;if(reduced.matches){n.textContent=to;return;}const t0=performance.now();const tick=t=>{const p=Math.min(1,(t-t0)/800);n.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick);};n.textContent='0';requestAnimationFrame(tick);});

 // Tap the page: hotspots are buttons, which the viewer never treats as a reveal click.
 document.addEventListener('click',e=>{const b=e.target.closest('.d-hot');if(!b)return;const wrap=b.closest('.d-tapwrap');wrap.querySelectorAll('.d-hot').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const p=wrap.querySelector('.d-tap-panel');p.replaceChildren(el('div',{className:'micro'}),el('h3'),el('p'),el('small'));p.querySelector('.micro').textContent=b.textContent+' / '+(b.dataset.label||'').toUpperCase();p.querySelector('h3').textContent=b.dataset.h||'';p.querySelector('p').textContent=b.dataset.p||'';p.querySelector('small').textContent=b.dataset.s||'';});

 let onTools=()=>{};
 if(tools){
  const bar=el('div',{className:'d-tools'},'<button type="button" id="tool-spot" aria-pressed="false" title="Spotlight (S)">Spotlight</button><button type="button" id="tool-pen" aria-pressed="false" title="Pen (P)">Pen</button><button type="button" id="tool-clear" title="Clear drawing (C)">Clear</button><button type="button" id="tool-presenter" aria-pressed="false" title="Presenter view (V)">Presenter</button><button type="button" id="tool-cues" aria-pressed="false" title="Record cues (R)">Record cues</button>');
  bar.setAttribute('role','group');bar.setAttribute('aria-label','Recording tools');$('#progress').before(bar);
  // Spotlight: pointer-events none, so clicks still reach the slide.
  const spot=el('div',{id:'d-spot',hidden:true});document.body.append(spot);
  addEventListener('pointermove',e=>{spot.style.setProperty('--x',e.clientX+'px');spot.style.setProperty('--y',e.clientY+'px');},{passive:true});
  // Pen: a canvas over the slide but outside #canvas, so strokes never trigger a reveal.
  const pen=el('canvas',{id:'d-pen',hidden:true});$('#player').append(pen);const ctx=pen.getContext('2d');let drawing=null;
  const place=()=>{const c=$('#canvas'),r=devicePixelRatio||1;const keep=pen.width?(()=>{const t=document.createElement('canvas');t.width=pen.width;t.height=pen.height;t.getContext('2d').drawImage(pen,0,0);return t;})():null;
   Object.assign(pen.style,{left:c.offsetLeft+'px',top:c.offsetTop+'px',width:c.offsetWidth+'px',height:c.offsetHeight+'px'});const w=Math.round(c.offsetWidth*r),h=Math.round(c.offsetHeight*r);if(pen.width!==w||pen.height!==h){pen.width=w;pen.height=h;if(keep)ctx.drawImage(keep,0,0);}};
  const clear=()=>ctx.clearRect(0,0,pen.width,pen.height);
  const pt=e=>{const b=pen.getBoundingClientRect(),r=pen.width/b.width;return [(e.clientX-b.left)*r,(e.clientY-b.top)*r];};
  pen.addEventListener('pointerdown',e=>{e.preventDefault();pen.setPointerCapture(e.pointerId);drawing=pt(e);});
  pen.addEventListener('pointermove',e=>{if(!drawing)return;const p=pt(e),r=devicePixelRatio||1;ctx.strokeStyle=options.ink||'#8b6002';ctx.lineWidth=5*r;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...drawing);ctx.lineTo(...p);ctx.stroke();drawing=p;});
  const end=()=>{drawing=null;};pen.addEventListener('pointerup',end);pen.addEventListener('pointercancel',end);pen.addEventListener('click',e=>e.stopPropagation());
  const chip=el('div',{className:'d-chip',hidden:true});chip.setAttribute('role','status');document.body.append(chip);
  // Presenter view: in-page panel, plus a second window where the browser allows one.
  const panel=el('aside',{id:'d-presenter',hidden:true},'<div class="d-row" style="justify-content:space-between;align-items:center"><h2>Presenter</h2><button type="button" id="d-close-presenter">Close</button></div><div><div class="d-timer" id="d-timer">00:00.0</div><div class="d-row"><button type="button" id="d-timer-toggle">Start timer</button><button type="button" id="d-timer-reset">Reset</button><button type="button" id="d-second">Open in a second window</button></div></div><div class="d-box"><span class="micro">NOW</span><b id="d-now"></b></div><div class="d-box"><span class="micro">NEXT</span><b id="d-next"></b></div><div class="d-box"><span class="micro">NOTES</span><p id="d-notes"></p></div><div id="d-cues" hidden><span class="micro">CUE LIST FOR SUBI SHOTS</span><textarea id="d-cuelist" readonly aria-label="Recorded cue list"></textarea><div class="d-row"><button type="button" id="d-copy">Copy cue list</button></div></div>');
  panel.setAttribute('aria-label','Presenter view');document.body.append(panel);
  let timer={on:false,start:0,acc:0},second=null;const elapsed=()=>timer.acc+(timer.on?performance.now()-timer.start:0);
  const nextText=c=>{if(!c.s)return '';if(c.step<c.max){const i=c.s.reveals.findIndex(r=>r===c.step+1);return 'Reveal '+(c.step+1)+': '+strip(c.s.parts[i]).slice(0,170);}const n=deck.slides[c.i+1];return n?'Next slide: '+n.title:'End of the deck';};
  const render=()=>{const c=current();if(!c.s)return;const now=c.s.title+' · reveal '+c.step+' of '+c.max,next=nextText(c);$('#d-now').textContent=now;$('#d-next').textContent=next;$('#d-notes').textContent=c.s.note;$('#d-timer').textContent=fmt(elapsed());
   if(second&&!second.closed){const d=second.document;d.getElementById('t').textContent=fmt(elapsed());d.getElementById('n').textContent=now;d.getElementById('x').textContent=next;d.getElementById('o').textContent=c.s.note;}};
  const cues={on:false,t0:0,list:[]};
  setInterval(()=>{if(timer.on||cues.on){render();if(cues.on)chip.querySelector('span').textContent='● Recording cues '+fmt(performance.now()-cues.t0);}},250);
  $('#d-timer-toggle').onclick=()=>{if(timer.on){timer.acc=elapsed();timer.on=false;}else{timer.start=performance.now();timer.on=true;}$('#d-timer-toggle').textContent=timer.on?'Pause timer':'Start timer';render();};
  $('#d-timer-reset').onclick=()=>{timer={on:false,start:0,acc:0};$('#d-timer-toggle').textContent='Start timer';render();};
  $('#d-second').onclick=()=>{second=window.open('','ww-presenter','width=520,height=720');if(!second){notify('This viewer blocks second windows. Use the panel here instead.');return;}second.document.title='Presenter · Whiteboard Wednesdays';second.document.body.innerHTML='<div style="font:16px system-ui;padding:20px;display:grid;gap:14px"><div id="t" style="font:600 44px monospace"></div><div><small>NOW</small><b id="n" style="display:block"></b></div><div><small>NEXT</small><b id="x" style="display:block"></b></div><div><small>NOTES</small><p id="o"></p></div></div>';render();};
  const setPresenter=on=>{panel.hidden=!on;$('#tool-presenter').setAttribute('aria-pressed',String(on));if(on)render();};
  $('#d-close-presenter').onclick=()=>setPresenter(false);
  // Record cues: times from the moment Record cues is pressed, for post-production in Subi Shots.
  const logCue=()=>{if(!cues.on)return;const c=current();if(!c.s)return;const last=cues.list[cues.list.length-1];if(last&&last.id===c.s.id&&last.step===c.step)return;cues.list.push({t:performance.now()-cues.t0,id:c.s.id,step:c.step,max:c.max,device:c.s.section.split('/ ')[1]||''});};
  const setCues=on=>{cues.on=on;$('#tool-cues').setAttribute('aria-pressed',String(on));if(on){cues.t0=performance.now();cues.list=[];logCue();}else{$('#d-cuelist').value='# Start your screen recording when you press Record cues. Times are from that moment.\n'+cues.list.map(q=>fmt(q.t)+'  '+q.id+'  reveal '+q.step+'/'+q.max+'  '+q.device).join('\n');$('#d-cues').hidden=false;setPresenter(true);}chipState();};
  $('#d-copy').onclick=()=>{const t=$('#d-cuelist');const fallback=()=>{t.focus();t.select();notify('Selected. Copy it with your keyboard.');};try{navigator.clipboard.writeText(t.value).then(()=>notify('Cue list copied.'),fallback);}catch{fallback();}};
  const state={spot:false,pen:false};
  function chipState(){const parts=[];if(cues.on)parts.push('<span>● Recording cues</span><button type="button" data-stop="cues">Stop</button>');if(state.pen)parts.push('<span>Pen on</span><button type="button" data-stop="pen">Stop pen</button>');if(state.spot)parts.push('<span>Spotlight on</span><button type="button" data-stop="spot">Stop</button>');chip.innerHTML=parts.join('');chip.hidden=!parts.length;}
  chip.addEventListener('click',e=>{const b=e.target.closest('[data-stop]');if(!b)return;if(b.dataset.stop==='cues')setCues(false);else setTool(b.dataset.stop,false);});
  function setTool(name,on){state[name]=on;if(name==='pen'&&on)state.spot=false;if(name==='spot'&&on)state.pen=false;spot.hidden=!state.spot;pen.hidden=!state.pen;if(state.pen)place();$('#tool-spot').setAttribute('aria-pressed',String(state.spot));$('#tool-pen').setAttribute('aria-pressed',String(state.pen));chipState();}
  $('#tool-spot').onclick=()=>setTool('spot',!state.spot);$('#tool-pen').onclick=()=>setTool('pen',!state.pen);$('#tool-clear').onclick=clear;$('#tool-presenter').onclick=()=>setPresenter(panel.hidden);$('#tool-cues').onclick=()=>setCues(!cues.on);
  document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]')||document.querySelector('dialog[open]')||$('#player').hidden||document.body.classList.contains('reading-mode'))return;const k=e.key.toLowerCase();if(k==='s')setTool('spot',!state.spot);else if(k==='p')setTool('pen',!state.pen);else if(k==='c')clear();else if(k==='v')setPresenter(panel.hidden);else if(k==='r')setCues(!cues.on);});
  let lastSlide=null;
  onTools=()=>{const c=current();if(c.s&&c.s.id!==lastSlide){lastSlide=c.s.id;clear();}logCue();if(state.pen)requestAnimationFrame(place);if(!panel.hidden||(second&&!second.closed))render();};
  addEventListener('resize',()=>{if(state.pen)place();});
 }
 const onChange=()=>{countUp();onTools();};
 new MutationObserver(onChange).observe($('#progress'),{childList:true,characterData:true,subtree:true});
 onChange();
};
