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
