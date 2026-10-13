/* Vision Boards deck: copy buttons for the live-run prompts. Delegated, so it works after every slide redraw. */
(()=>{
'use strict';
document.addEventListener('click',async event=>{
 const button=event.target.closest('[data-vb-copy]');if(!button)return;
 const field=document.getElementById(button.dataset.vbCopy),status=button.closest('.vb-copy')?.querySelector('[role="status"]');if(!field)return;
 let copied=false;button.disabled=true;
 try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(field.value);copied=true;}}catch{}
 if(!copied){field.focus();field.select();try{copied=document.execCommand('copy');}catch{}}
 if(status)status.textContent=copied?'Prompt copied. Paste it into Claude Code.':'Copy was blocked by this browser. The prompt is selected; use your device’s Copy command.';
 button.textContent=copied?'Copied':'Copy prompt';button.disabled=false;if(copied)button.focus();
});
})();
