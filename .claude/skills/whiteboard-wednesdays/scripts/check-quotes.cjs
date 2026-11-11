#!/usr/bin/env node
// Prove quotations are verbatim in a PDF before they go on a slide.
// Usage: node check-quotes.cjs <report.pdf> <quotes.json|quotes.txt> [--first N] [--last N]
//   quotes.json: [{"id":"RED-008","text":"someone googles medspa, ..."}]
//   quotes.txt:  one quote per line as  ID<TAB>exact text
// Whitespace is ignored (PDF extraction can drop spaces); every other character, including apostrophe and
// quotation-mark styles, must match. Prints the page(s) each quote appears on. Exits 1 if any quote fails.
const fs=require('node:fs'),path=require('node:path');
const {quoteReport}=require('./source-tools.cjs');
const argv=process.argv.slice(2),opt=k=>{const i=argv.indexOf(k);return i>=0?+argv[i+1]:undefined;};
if(argv.length<2){console.error('Usage: node check-quotes.cjs <report.pdf> <quotes.json|quotes.txt> [--first N] [--last N]');process.exit(2);}
const raw=fs.readFileSync(path.resolve(argv[1]),'utf8');
const quotes=argv[1].endsWith('.json')?JSON.parse(raw):raw.split('\n').filter(l=>l.trim()).map(l=>{const i=l.indexOf('\t');return {id:l.slice(0,i),text:l.slice(i+1)};});
const result=quoteReport(path.resolve(argv[0]),quotes,{first:opt('--first'),last:opt('--last')});
for(const r of result)console.log((r.ok?'PASS ':'FAIL ')+r.id+(r.ok?'  page '+(r.pages.join(', ')||'spans a page break'):'  not verbatim in the PDF'));
const failed=result.filter(r=>!r.ok).length;
console.log((result.length-failed)+' of '+result.length+' quotations verified.');
process.exit(failed?1:0);
