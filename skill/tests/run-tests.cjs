#!/usr/bin/env node
// Whiteboard Wednesdays skill tests. Usage: npm test   (or node tests/run-tests.cjs [--no-browser])
// 1. Both worked examples build with the bundled viewer and match the reference outputs byte for byte.
// 2. Every bundled quotation is verbatim in the report.
// 3. Negative tests: an altered quote, a repeated device, an unconfirmed brand and a brand confirmed for another deck
//    each stop the build.
// 4. With Playwright available: the browser verifier runs on both builds at 375, 390, 768 and 1280px.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),{spawnSync,spawn}=require('node:child_process');
const skill=path.resolve(__dirname,'..'),ex=path.join(skill,'examples/cadre-crew'),build=path.join(skill,'scripts/build-trial.cjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ww-test-'));
let passed=0;const fail=m=>{console.error('FAILED: '+m);process.exit(1);};
const ok=m=>{passed++;console.log('ok   '+m);};
const run=(args,cwd=ex)=>spawnSync(process.execPath,args,{cwd,encoding:'utf8'});
const specs=[['trial-calibration.cjs','whiteboard-trial-calibration.html'],['trial-devices.cjs','whiteboard-trial-devices.html']];

// 1. Builds match the reference outputs. Run from a folder with no dist, so the bundled viewer is used.
for(const [spec,html] of specs){
 const out=path.join(tmp,html),r=run([build,spec,'--dist',path.join(tmp,'no-dist'),'--out',out]);
 if(r.status!==0)fail('build '+spec+': '+r.stderr);
 if(!r.stdout.includes('bundled snapshot'))fail('build '+spec+' did not use the bundled viewer');
 if(!fs.readFileSync(out).equals(fs.readFileSync(path.join(ex,'output',html))))fail(spec+' output differs from examples/cadre-crew/output/'+html);
 ok('builds with the bundled viewer and matches the reference output: '+spec);
}

// 2. Quotations.
{const src=fs.readFileSync(path.join(ex,'trial-devices.cjs'),'utf8');const quotes=[...src.matchAll(/\['(RED-\d+)','[^']+','((?:[^'\\]|\\.)*)'\]/g)].map(m=>({id:m[1],text:m[2].replace(/\\'/g,"'")}));
 fs.writeFileSync(path.join(tmp,'quotes.json'),JSON.stringify(quotes));
 const r=run([path.join(skill,'scripts/check-quotes.cjs'),'ww-report.pdf',path.join(tmp,'quotes.json'),'--first','12','--last','13']);
 if(r.status!==0||quotes.length!==10)fail('quote check: '+r.stdout+r.stderr);
 ok('all '+quotes.length+' bundled quotations are verbatim in the report');}

// 3. Negative tests: each must stop the build with the right message.
const wrap=(name,body)=>{const f=path.join(tmp,name);fs.writeFileSync(f,"const path=require('node:path');const real=require("+JSON.stringify(path.join(ex,'trial-devices.cjs'))+");\nmodule.exports=ctx=>{"+body+"};\n");return f;};
const negatives=[
 ['an altered quotation',wrap('neg-quote.cjs',"const v=ctx.source.verifyQuotes;ctx.source={...ctx.source,verifyQuotes:(p,qs,o)=>v(p,qs.map(x=>x.id==='RED-008'?{...x,text:x.text.replace('no answer','no reply')}:x),o)};const s=real(ctx);s.brandProfile="+JSON.stringify(path.join(skill,'examples/pecuna-brand.json'))+";return s;"),[],'Not verbatim'],
 ['a repeated device',wrap('neg-variety.cjs',"const s=real(ctx);s.deck.slides[1].kind=s.deck.slides[0].kind;s.brandProfile="+JSON.stringify(path.join(skill,'examples/pecuna-brand.json'))+";return s;"),[],'Variety rule'],
 ['an unconfirmed brand',wrap('neg-brand.cjs',"return real(ctx);"),['--brand',path.join(skill,'examples/brand-template.json')],'not confirmed by the user'],
 ['a brand confirmed for another deck',wrap('neg-deck.cjs',"const s=real(ctx);s.register[0].id='another-deck';return s;"),['--brand',path.join(skill,'examples/pecuna-brand.json')],'is confirmed for']
];
for(const [what,spec,extra,msg] of negatives){
 const out=path.join(tmp,'neg.html');if(fs.existsSync(out))fs.unlinkSync(out);
 const r=run([build,spec,'--dist',path.join(tmp,'no-dist'),'--out',out,...extra]);
 if(r.status===0||!r.stderr.includes(msg)||fs.existsSync(out))fail('the build did not refuse '+what+': '+r.stderr.split('\n').find(l=>l.startsWith('Error'))||r.stdout);
 ok('refuses '+what);
}

// 4. Browser verification.
let pw=null;try{pw=require(process.env.PLAYWRIGHT_PATH||'playwright');}catch{}
if(process.argv.includes('--no-browser')||!pw){console.log('skip browser verification ('+(pw?'--no-browser':'playwright not installed; run npm install')+')');console.log('\n'+passed+' tests passed.');process.exit(0);}
const server=http.createServer((req,res)=>{const f=path.join(tmp,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(tmp)||!fs.existsSync(f)){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',async()=>{
 const port=server.address().port;
 for(const [spec,html] of specs){
  const r=await new Promise(done=>{const p=spawn(process.execPath,[path.join(skill,'scripts/verify-trial.cjs'),spec,'http://127.0.0.1:'+port+'/'+html,'--dist',path.join(tmp,'no-dist')],{cwd:ex,env:{...process.env,QA_OUTPUT:tmp}});let o='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>o+=d);p.on('close',c=>done({c,o}));});
  if(r.c!==0)fail('browser verification '+spec+': '+r.o.trim());
  ok('browser verification '+spec+': '+r.o.trim().split('\n').pop());
 }
 server.close();console.log('\n'+passed+' tests passed.');
});
