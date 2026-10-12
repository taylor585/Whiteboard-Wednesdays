import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCreator,createYouTubeClient} from './youtube-api.mjs';
const now=Date.parse('2026-10-11T10:00:00Z');
const stamp=days=>new Date(now-days*86400000).toISOString();
const response=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
test('accepts handles and channel IDs, rejects external URLs',()=>{
 assert.deepEqual(parseCreator('https://www.youtube.com/@example'),{forHandle:'@example'});
 assert.deepEqual(parseCreator('@example'),{forHandle:'@example'});
 assert.throws(()=>parseCreator('https://youtube.com.evil.test/@example'));
 assert.throws(()=>parseCreator('https://evil.test/@example'));
 assert.throws(()=>parseCreator('https://name:password@youtube.com/@example'));
});
test('paginates uploads, deduplicates IDs and filters exact video timestamps',async()=>{
 const calls=[];
 const client=createYouTubeClient('test-only',async url=>{
   calls.push(url);
   if(url.pathname.endsWith('playlistItems'))return response(url.searchParams.get('pageToken') ? {items:[{contentDetails:{videoId:'older',videoPublishedAt:stamp(31)}}]} : {nextPageToken:'next',items:['recent','boundary','future','recent'].map(videoId=>({contentDetails:{videoId,videoPublishedAt:stamp(1)}}))});
   assert.equal(url.searchParams.get('id'),'recent,boundary,future,older');
   return response({items:[['recent',1],['boundary',30],['future',-1],['older',31]].map(([id,age])=>({id,snippet:{title:id,channelTitle:'Fictional QA channel',publishedAt:stamp(age),thumbnails:{high:{url:'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg'}}}}))});
 },()=>now);
 const videos=await client.uploads({id:'channel',handle:'@example',playlistId:'uploads'});
 assert.deepEqual(videos.map(v=>v.id),['recent','boundary']);
 assert.equal(calls.length,3);
});
test('does not return fake empty data on quota errors or absent credentials',async()=>{
 const client=createYouTubeClient('test-only',async()=>new Response(JSON.stringify({error:{errors:[{reason:'quotaExceeded'}]}}),{status:403}));
 await assert.rejects(client.resolve('@example'),/daily YouTube/);
 await assert.rejects(createYouTubeClient('').resolve('@example'),/not configured/);
});
test('resolves canonical channel metadata',async()=>{
 const client=createYouTubeClient('test-only',async()=>response({items:[{id:'UC123',snippet:{title:'Fictional QA channel',customUrl:'@example'},contentDetails:{relatedPlaylists:{uploads:'UU123'}}}]}));
 assert.deepEqual(await client.resolve('@example'),{id:'UC123',name:'Fictional QA channel',handle:'@example',playlistId:'UU123'});
});
