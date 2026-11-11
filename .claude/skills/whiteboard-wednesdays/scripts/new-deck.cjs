#!/usr/bin/env node
// Start a new deck spec from examples/deck-template.cjs.
// Usage: node new-deck.cjs <deck-id> <folder>
// Writes <folder>/<deck-id>.cjs and an unconfirmed <folder>/<deck-id>-brand.json. The brand stays unconfirmed until the
// user answers the brand question (references/branding.md); the build refuses it until then.
const fs=require('node:fs'),path=require('node:path');
const [id,folder]=process.argv.slice(2);
if(!id||!folder||!/^[a-z0-9][a-z0-9-]*$/.test(id)){console.error('Usage: node new-deck.cjs <deck-id> <folder>   (deck-id: lower case letters, digits and hyphens)');process.exit(2);}
const out=path.resolve(folder);fs.mkdirSync(out,{recursive:true});
const spec=path.join(out,id+'.cjs'),brand=path.join(out,id+'-brand.json');
for(const f of [spec,brand])if(fs.existsSync(f)){console.error('Refusing to overwrite '+f);process.exit(1);}
const skill=path.resolve(__dirname,'..');
fs.writeFileSync(spec,fs.readFileSync(path.join(skill,'examples/deck-template.cjs'),'utf8').replace(/__DECK__/g,id).replace("file:'"+id+"-trial.html'","file:'"+id+"-trial.html',brandProfile:'"+id+"-brand.json'"));
const template=JSON.parse(fs.readFileSync(path.join(skill,'examples/brand-template.json'),'utf8'));
template.logo=path.relative(out,path.join(skill,'assets/ww-coin.svg'));
fs.writeFileSync(brand,JSON.stringify(template,null,2)+'\n');
console.log('Created '+path.relative(process.cwd(),spec)+' and '+path.relative(process.cwd(),brand)+'.');
console.log('Next: ask the user for the brand (Pecuna Factorem or another), record their answer in the brand file, then fill every TODO.');
