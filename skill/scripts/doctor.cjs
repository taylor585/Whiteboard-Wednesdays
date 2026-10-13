#!/usr/bin/env node
// Check what this machine needs to build, check and verify Whiteboard Wednesdays decks.
// Required to build: Node 20+, the bundled viewer and assets. Required for quotes, highlights and page renders: poppler-utils
// (pdftotext, pdfinfo, pdftoppm). Required for browser verification: Playwright with Chromium. Python 3 packages the skill.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const skill=path.resolve(__dirname,'..'),rows=[];let failed=false;
const row=(name,ok,detail,required=true)=>{rows.push([ok?'ok':required?'MISSING':'optional',name,detail]);if(!ok&&required)failed=true;};
const has=cmd=>spawnSync(cmd,['-v'],{encoding:'utf8'}).error===undefined;
row('Node 20 or newer',+process.versions.node.split('.')[0]>=20,'node '+process.versions.node);
for(const f of ['viewer/library.js','viewer/whiteboard.css','viewer/library.css','assets/ww-coin.svg','assets/ww-caveat.ttf','assets/ww-body.ttf','assets/ww-mono.ttf','assets/ww-display.ttf','scripts/device-kit.css','scripts/device-kit.js'])row('bundled '+f,fs.existsSync(path.join(skill,f)),'');
for(const c of ['pdftotext','pdfinfo','pdftoppm'])row(c+' (poppler-utils)',has(c),'quotes, highlights, page renders');
row('python3',spawnSync('python3',['--version']).error===undefined,'packaging only',false);
let pw=null;try{pw=require(process.env.PLAYWRIGHT_PATH||'playwright');row('playwright',true,'browser verification');}catch{row('playwright',false,'npm install, or set PLAYWRIGHT_PATH',false);}
(async()=>{
 if(pw){try{const b=await pw.chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});await b.close();row('chromium',true,'launches headless');}catch(e){row('chromium',false,'npx playwright install chromium, or set CHROMIUM_PATH',false);}}
 const w=Math.max(...rows.map(r=>r[1].length));
 for(const [s,n,d] of rows)console.log(s.padEnd(9)+n.padEnd(w+2)+d);
 console.log(failed?'\nSomething required is missing; see above.':'\nReady to build. Browser verification needs playwright and chromium marked ok.');
 process.exit(failed?1:0);
})();
