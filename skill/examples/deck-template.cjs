// Starter deck spec. Copy it with: node scripts/new-deck.cjs <deck-id> <folder>
// Replace every TODO with real, sourced content before building. Build with:
//   node <skill>/scripts/build-trial.cjs <this file> --brand <confirmed brand profile>
// Read references/story-structure.md (slide map), references/layouts.md and references/device-library.md first.
module.exports=({path,uri,assets,arrow,source})=>{
// Assets: real files only. Each is embedded once and referenced as {{KEY}} in slide HTML.
// assets.AD=uri(path.join(__dirname,'my-ad.png'),'image/png');
// Quotations: prove them against the PDF before use. The build fails if one character differs.
// source.verifyQuotes(path.join(__dirname,'report.pdf'),[{id:'REF-001',text:'exact words'}],{first:12,last:13});

const deck={slides:[
{id:'__DECK__-opening',title:'TODO three to five words.',section:'01 / TODO section',kind:'opening',reveals:[1,2,3],
 source:'Source: TODO document, page, evidence ID.',
 parts:[
  '<p class="lead">TODO one sentence of context.</p><p class="hand statement">TODO the question<br>this deck answers.</p>',
  '<div class="paper"><div class="micro">THE INPUT</div><h3>TODO</h3><p>TODO</p></div>',
  '<div class="hand statement">TODO the takeaway.</div>'
 ],
 note:'TODO presenter notes: what to say, the exact source, and anything illustrative.'},
{id:'__DECK__-evidence',title:'TODO the evidence slide.',section:'02 / TODO',kind:'d-counts',reveals:[1,2],
 source:'Source: TODO, with page numbers for every figure.',
 parts:[
  '<div class="d-count"><b class="d-num" data-count="0">0</b><p>TODO what was counted</p><small>TODO page</small></div>',
  '<div class="d-count"><b class="d-num" data-count="0">0</b><p>TODO</p><small>TODO page</small></div>'
 ],
 note:'TODO. Use only real figures with page references.'},
{id:'__DECK__-mechanism',title:'TODO how it works.',section:'03 / TODO',kind:'journey',reveals:[1,2,3],
 source:'Source: TODO.',
 parts:[
  '<div class="micro">01 / TODO</div><h3>TODO</h3><p>TODO</p>',
  '<div class="micro">02 / TODO</div><h3>TODO</h3><p>TODO</p>',
  '<div class="micro">03 / TODO</div><h3>TODO</h3><p>TODO</p>'
 ],
 note:'TODO.'}
]};

const register=[{id:'__DECK__',title:'TODO deck title',description:'TODO one factual sentence.',cover:'{{COIN}}',source:'',reading:'?view=reading',brand:{},sourceNote:'TODO sources, and the status of any illustrative examples.'}];

return {deck,register,tools:true,file:'__DECK__-trial.html',title:'TODO Trial',artifactTitle:'TODO Trial',header:'TRIAL · NOT PUBLISHED',eyebrow:'THREE-SLIDE APPROVAL CHECKPOINT',intro:'TODO one sentence describing the trial.'};
};
