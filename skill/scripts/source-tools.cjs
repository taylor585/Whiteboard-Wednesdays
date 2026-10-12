// Whiteboard Wednesdays source tools v1.1. Requires poppler-utils (pdftotext, pdfinfo).
// verifyQuotes: fail the build if any quotation is not verbatim in the PDF.
// findHighlights: highlight rectangles, in PDF points, for exact phrases on a page.
// zoomVars: the inline style a .d-frame needs to zoom from a whole page into one region.
const {execFileSync}=require('node:child_process');

// Raw extraction can drop inter-word spaces, so whitespace is removed on both sides. Every other character must match,
// including apostrophe and quotation-mark styles. Hyphenated line breaks ("first-\nhand") compare equal to "first-hand".
const squash=s=>s.replace(/\s+/g,'');
function verifyQuotes(pdf,quotes,{first,last}={}){
 const args=['-raw'];if(first)args.push('-f',String(first));if(last)args.push('-l',String(last));
 const text=squash(execFileSync('pdftotext',[...args,pdf,'-']).toString());
 const missing=quotes.filter(q=>!text.includes(squash(q.text)));
 if(missing.length)throw Error('Not verbatim in '+pdf+': '+missing.map(q=>q.id).join(', '));
 return quotes.length;
}

function pageWords(pdf,page){
 const html=execFileSync('pdftotext',['-f',String(page),'-l',String(page),'-bbox',pdf,'-']).toString();
 const size=html.match(/<page width="([\d.]+)" height="([\d.]+)">/);
 const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'");
 const words=[...html.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g)].map(m=>({x0:+m[1],y0:+m[2],x1:+m[3],y1:+m[4],t:decode(m[5])}));
 return {width:+size[1],height:+size[2],words};
}

// Each phrase must match whole consecutive words, ignoring surrounding punctuation; trailing punctuation that the
// phrase does not include (a comma, a closing quotation mark) is trimmed from the rectangle by an average glyph width.
// The vertical band (36% to 83% of the word box) covers the x-height and capitals of the report's body font; check it visually.
// within: {y0,y1} in points limits the search when a phrase appears more than once on the page.
function findHighlights(pdf,page,phrases,{within,pad=1}={}){
 const {width,height,words}=pageWords(pdf,page);
 const core=s=>s.replace(/^[“”"'‘’(\[]+|[“”"'‘’)\],.;:!?]+$/g,'').toLowerCase();
 const pool=within?words.filter(w=>w.y0>=within.y0&&w.y1<=within.y1):words;
 const rects=[];
 for(const phrase of phrases){
  const tokens=phrase.trim().split(/\s+/);
  const start=pool.findIndex((w,i)=>tokens.every((t,j)=>pool[i+j]&&core(pool[i+j].t)===core(t)));
  if(start<0)throw Error('Phrase not found on page '+page+': '+phrase);
  const hit=pool.slice(start,start+tokens.length);
  const last=tokens[tokens.length-1],lw=hit[hit.length-1];
  const extra=lw.t.length-lw.t.indexOf(last.replace(/[“”"'‘’]+$/,''))-last.replace(/[“”"'‘’]+$/,'').length;
  const trim=extra>0?(lw.x1-lw.x0)/lw.t.length*extra:0;
  const lines=[];for(const w of hit){const l=lines.find(l=>Math.abs(l.y0-w.y0)<1);if(l)l.ws.push(w);else lines.push({y0:w.y0,ws:[w]});}
  lines.forEach((l,i)=>{const a=l.ws[0],b=l.ws[l.ws.length-1],h=a.y1-a.y0;const x1=b.x1-(i===lines.length-1?trim:0);
   rects.push([+(a.x0-pad).toFixed(1),+(a.y0+h*.36).toFixed(1),+(x1-a.x0+2*pad).toFixed(1),+(h*.47).toFixed(1)]);});
 }
 return {width,height,rects};
}

// Zoom geometry. The frame is landscape on desktop (height/width 0.72) and taller on phones (0.86), matching device-kit.css.
// region is the target as page fractions {x0,x1,y0,y1}. The page box is fitted to the frame height and centred; the target
// is scaled to fill the frame width, then centred vertically, or pinned near the top when it is short.
function zoomVars(pageAspect,region,{desktop=.72,phone=.86}={}){
 const z=a=>{const f=pageAspect*a,L=(1-f)/2,s=(1/f)/(region.x1-region.x0),yc=(region.y0+region.y1)/2;
  const ty=s*(region.y1-region.y0)<.5?.06-s*region.y0:.5-s*yc;
  return {w:(f*100).toFixed(3)+'%',l:(L*100).toFixed(3)+'%',to:'translate('+((-L/f-s*region.x0)*100).toFixed(3)+'%,'+(ty*100).toFixed(3)+'%) scale('+s.toFixed(4)+')'};};
 const d=z(desktop),p=z(phone);
 return '--zw:'+d.w+';--zl:'+d.l+';--zto:'+d.to+';--pzw:'+p.w+';--pzl:'+p.l+';--pzto:'+p.to;
}

module.exports={verifyQuotes,findHighlights,zoomVars,pageWords};
