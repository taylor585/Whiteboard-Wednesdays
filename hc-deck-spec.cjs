// Whiteboard Wednesdays v2 deck spec for the AI Harnesses deck. It wraps the live package (public/hc-content.js and
// public/hc.css) so the skill's builder can run its gates and produce a private one-file preview.
// Build: node <skill>/scripts/build-trial.cjs hc-deck-spec.cjs --brand HC-brand.json --dist public --artifact <outside public/>
module.exports=({fs,path})=>{
 const vm=require('node:vm'),ctx={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'public/hc-content.js'),'utf8'),ctx);
 const reg={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'public/presentations.js'),'utf8'),reg);
 const entry=reg.window.presentationRegister.find(p=>p.id==='ai-harnesses');
 return {
  deck:ctx.window.WW,
  register:[{id:entry.id,title:entry.title,description:entry.description,cover:'{{COIN}}',source:'',reading:'?view=reading',brand:{},sourceNote:entry.sourceNote}],
  css:fs.readFileSync(path.join(__dirname,'public/hc.css'),'utf8'),
  tools:false,
  brandProfile:'HC-brand.json',
  file:'hc-preview.html',
  title:'AI Harnesses deck',artifactTitle:'AI Harnesses Deck',
  header:'PREVIEW · NOT PUBLISHED',eyebrow:'FULL DECK · 27 SLIDES',
  intro:'The complete AI Harnesses presentation, as it will appear in the Whiteboard Wednesdays library. Private preview; the live site is unchanged.'
 };
};
