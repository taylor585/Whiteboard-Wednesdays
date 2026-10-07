const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const file=path.join(__dirname,'dist/whiteboard-content.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
for(const s of context.window.WW.slides) s.reveals ??= s.parts.map((_,i)=>s.kind==='techniques'?(i<3?1:i<5?2:3):s.kind==='objections'?(i<2?1:i<4?2:3):s.kind==='evidence'?(i<2?1:i===2?2:3):i+1);
fs.writeFileSync(file,'window.WW='+JSON.stringify(context.window.WW,null,2)+';\n');
