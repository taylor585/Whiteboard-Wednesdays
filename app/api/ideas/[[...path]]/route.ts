import { env } from 'cloudflare:workers';
import { createYouTubeClient, YouTubeError } from '../../../../youtube-api.mjs';
import seed from '../../../../public/creators.json';
export const dynamic='force-dynamic';
type Creator={handle:string;name:string;channel_id:string|null;playlist_id:string|null;last_success:string|null;error:string|null;lease_until:number};
type VideoRow={id:string;handle:string;creator:string;title:string;description:string;published_at:string;thumbnail:string};
type TopicRow={id:string;title:string;status:string;notes:string;record_date:string|null;post_date:string|null;created_at:string;updated_at:string};
type PointRow={id:string;topic_id:string;position:number;title:string;note:string;done:number};
const STATUSES=['new','shortlisted','planned','slides_ready','recorded','edited','posted'];
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const bad=(error:string,status=400)=>json({error},status);
function database(){if(!env.DB)throw new YouTubeError('Watchlist storage is temporarily unavailable.',503);return env.DB;}
async function initialise(){const db=database();await db.batch(seed.creators.map(c=>db.prepare('INSERT OR IGNORE INTO creators(handle,name) VALUES(?,?)').bind(c.handle,c.name)));}
const video=(v:VideoRow,withDescription=false)=>({id:v.id,handle:v.handle,creator:v.creator,title:v.title,publishedAt:v.published_at,thumbnail:v.thumbnail,...(withDescription?{description:v.description||''}:{})});
const text=(value:unknown,max:number)=>typeof value==='string'&&value.length<=max?value:null;
// Dates are calendar days (YYYY-MM-DD). Recording happens on Wednesdays and Fridays only (PROCESS.md).
function day(value:unknown){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const d=new Date(value+'T12:00:00Z');return Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==value?null:d;}
async function topicsWithDetail(){
 const db=database();
 const [topics,sources,points]=await Promise.all([
  db.prepare('SELECT * FROM topics ORDER BY record_date IS NULL, record_date, created_at DESC').all<TopicRow>(),
  db.prepare('SELECT ts.topic_id,v.* FROM topic_sources ts JOIN videos v ON v.id=ts.video_id ORDER BY ts.added_at').all<VideoRow&{topic_id:string}>(),
  db.prepare('SELECT * FROM topic_points ORDER BY topic_id, position').all<PointRow>(),
 ]);
 return topics.results.map(t=>({id:t.id,title:t.title,status:t.status,notes:t.notes,recordDate:t.record_date,postDate:t.post_date,createdAt:t.created_at,updatedAt:t.updated_at,
  sources:sources.results.filter(s=>s.topic_id===t.id).map(s=>video(s)),
  points:points.results.filter(p=>p.topic_id===t.id).map(p=>({id:p.id,title:p.title,note:p.note,done:Boolean(p.done),position:p.position}))}));
}
export async function GET(request:Request){
 try{
  await initialise();const db=database(),url=new URL(request.url),action=url.pathname.split('/').filter(Boolean).at(-1);
  if(action==='creator'){
   const handle=url.searchParams.get('handle')||'';
   if(!handle||handle.length>240)return bad('Choose a creator.');
   const videos=await db.prepare('SELECT * FROM videos WHERE handle=? ORDER BY published_at DESC').bind(handle).all<VideoRow>();
   return json({handle,videos:videos.results.map(v=>video(v,true))});
  }
  const [creators,videos]=await Promise.all([
   db.prepare('SELECT * FROM creators ORDER BY name COLLATE NOCASE').all<Creator>(),
   db.prepare('SELECT v.* FROM videos v WHERE v.published_at >= ? OR v.id IN (SELECT video_id FROM topic_sources) ORDER BY v.published_at DESC').bind(new Date(Date.now()-30*86400000).toISOString()).all<VideoRow>(),
  ]);
  return json({configured:Boolean(env.YOUTUBE_API_KEY),creators:creators.results.map(c=>({handle:c.handle,name:c.name,lastSuccess:c.last_success,error:c.error})),videos:videos.results.map(v=>video(v)),topics:await topicsWithDetail()});
 }catch{return json({error:'Your watchlist could not be loaded. Please retry.'},503);}
}
async function topicAction(action:string,body:Record<string,unknown>){
 const db=database(),now=new Date().toISOString();
 if(action==='topic'){
  const videoId=body.videoId===undefined?null:text(body.videoId,64),topicId=body.topicId===undefined?null:text(body.topicId,64);
  if(body.videoId!==undefined&&!videoId)return bad('Choose a video.');
  if(videoId&&!await db.prepare('SELECT id FROM videos WHERE id=?').bind(videoId).first())return bad('This video is no longer available in the watchlist.',404);
  if(topicId){
   if(!videoId)return bad('Choose a video to add.');
   if(!await db.prepare('SELECT id FROM topics WHERE id=?').bind(topicId).first())return bad('That topic no longer exists.',404);
   await db.batch([db.prepare('INSERT OR IGNORE INTO topic_sources(topic_id,video_id,added_at) VALUES(?,?,?)').bind(topicId,videoId,now),db.prepare('UPDATE topics SET updated_at=? WHERE id=?').bind(now,topicId)]);
   return json({id:topicId,added:true});
  }
  let title=body.title===undefined?null:text(body.title,200);
  if(!title&&videoId)title=(await db.prepare('SELECT title FROM videos WHERE id=?').bind(videoId).first<{title:string}>())?.title||null;
  if(!title?.trim())return bad('Give the topic a title.');
  const id=crypto.randomUUID(),statements=[db.prepare('INSERT INTO topics(id,title,status,notes,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(id,title.trim(),'new','',now,now)];
  if(videoId)statements.push(db.prepare('INSERT INTO topic_sources(topic_id,video_id,added_at) VALUES(?,?,?)').bind(id,videoId,now));
  await db.batch(statements);return json({id,created:true});
 }
 if(action==='topic-update'){
  const id=text(body.id,64);if(!id)return bad('Choose a topic.');
  const topic=await db.prepare('SELECT * FROM topics WHERE id=?').bind(id).first<TopicRow>();if(!topic)return bad('That topic no longer exists.',404);
  const sets:string[]=[],values:unknown[]=[];
  if(body.title!==undefined){const v=text(body.title,200)?.trim();if(!v)return bad('Give the topic a title of up to 200 characters.');sets.push('title=?');values.push(v);}
  if(body.notes!==undefined){const v=text(body.notes,8000);if(v===null)return bad('Notes can be up to 8,000 characters.');sets.push('notes=?');values.push(v);}
  if(body.status!==undefined){if(typeof body.status!=='string'||!STATUSES.includes(body.status))return bad('Choose a valid status.');sets.push('status=?');values.push(body.status);}
  if(body.postDate!==undefined){if(body.postDate!==null&&!day(body.postDate))return bad('Choose a valid post date.');sets.push('post_date=?');values.push(body.postDate);}
  const statements=[];
  if(body.recordDate!==undefined){
   if(body.recordDate!==null){const d=day(body.recordDate);if(!d||![3,5].includes(d.getUTCDay()))return bad('Recording days are Wednesday and Friday.');}
   const holder=body.recordDate===null?null:await db.prepare('SELECT id,title FROM topics WHERE record_date=? AND id<>?').bind(body.recordDate,id).first<{id:string;title:string}>();
   if(holder){
    if(body.swap!==true)return json({error:'“'+holder.title+'” is already booked for that day.',conflict:{id:holder.id,title:holder.title}},409);
    // Free the slot first so the unique index holds at every step, then give the other topic this topic's old slot.
    statements.push(db.prepare('UPDATE topics SET record_date=NULL,updated_at=? WHERE id=?').bind(now,holder.id));
    sets.push('record_date=?');values.push(body.recordDate);
    statements.push(db.prepare('UPDATE topics SET '+[...sets,'updated_at=?'].join(',')+' WHERE id=?').bind(...values,now,id));
    statements.push(db.prepare('UPDATE topics SET record_date=?,updated_at=? WHERE id=?').bind(topic.record_date,now,holder.id));
    await db.batch(statements);return json({updated:true,swapped:holder.id});
   }
   sets.push('record_date=?');values.push(body.recordDate);
  }
  if(!sets.length)return bad('Nothing to change.');
  await db.prepare('UPDATE topics SET '+[...sets,'updated_at=?'].join(',')+' WHERE id=?').bind(...values,now,id).run();
  return json({updated:true});
 }
 if(action==='topic-source-remove'){
  const topicId=text(body.topicId,64),videoId=text(body.videoId,64);if(!topicId||!videoId)return bad('Choose a source video.');
  await db.prepare('DELETE FROM topic_sources WHERE topic_id=? AND video_id=?').bind(topicId,videoId).run();return json({removed:true});
 }
 if(action==='topic-delete'){
  const id=text(body.id,64);if(!id)return bad('Choose a topic.');
  await db.batch([db.prepare('DELETE FROM topic_points WHERE topic_id=?').bind(id),db.prepare('DELETE FROM topic_sources WHERE topic_id=?').bind(id),db.prepare('DELETE FROM topics WHERE id=?').bind(id)]);
  return json({deleted:true});
 }
 if(action==='point-add'){
  const topicId=text(body.topicId,64),title=text(body.title,200)?.trim(),note=body.note===undefined?'':text(body.note,4000);
  if(!topicId||!title||note===null)return bad('Give the subtopic a title of up to 200 characters.');
  if(!await db.prepare('SELECT id FROM topics WHERE id=?').bind(topicId).first())return bad('That topic no longer exists.',404);
  const last=await db.prepare('SELECT MAX(position) AS p FROM topic_points WHERE topic_id=?').bind(topicId).first<{p:number|null}>();
  const id=crypto.randomUUID();await db.prepare('INSERT INTO topic_points(id,topic_id,position,title,note,done) VALUES(?,?,?,?,?,0)').bind(id,topicId,(last?.p??-1)+1,title,note).run();
  return json({id,created:true});
 }
 if(action==='point-update'){
  const id=text(body.id,64);if(!id)return bad('Choose a subtopic.');
  const sets:string[]=[],values:unknown[]=[];
  if(body.title!==undefined){const v=text(body.title,200)?.trim();if(!v)return bad('Give the subtopic a title of up to 200 characters.');sets.push('title=?');values.push(v);}
  if(body.note!==undefined){const v=text(body.note,4000);if(v===null)return bad('Notes can be up to 4,000 characters.');sets.push('note=?');values.push(v);}
  if(body.done!==undefined){if(typeof body.done!=='boolean')return bad('Choose done or not done.');sets.push('done=?');values.push(body.done?1:0);}
  if(!sets.length)return bad('Nothing to change.');
  await db.prepare('UPDATE topic_points SET '+sets.join(',')+' WHERE id=?').bind(...values,id).run();return json({updated:true});
 }
 if(action==='point-delete'){
  const id=text(body.id,64);if(!id)return bad('Choose a subtopic.');
  await db.prepare('DELETE FROM topic_points WHERE id=?').bind(id).run();return json({deleted:true});
 }
 if(action==='point-move'){
  const id=text(body.id,64);if(!id||![-1,1].includes(body.direction as number))return bad('Choose a subtopic and a direction.');
  const point=await db.prepare('SELECT * FROM topic_points WHERE id=?').bind(id).first<PointRow>();if(!point)return bad('That subtopic no longer exists.',404);
  const other=await db.prepare('SELECT * FROM topic_points WHERE topic_id=? AND position'+(body.direction===1?'>? ORDER BY position ASC':'<? ORDER BY position DESC')+' LIMIT 1').bind(point.topic_id,point.position).first<PointRow>();
  if(!other)return json({moved:false});
  await db.batch([db.prepare('UPDATE topic_points SET position=? WHERE id=?').bind(other.position,point.id),db.prepare('UPDATE topic_points SET position=? WHERE id=?').bind(point.position,other.id)]);
  return json({moved:true});
 }
 return null;
}
const LARGE=new Set(['topic-update','point-add','point-update']);
export async function POST(request:Request){
 // The existing Sites access boundary protects this shared watchlist.
 // Same-origin JSON requests prevent other sites from submitting writes through a signed-in browser.
 const url=new URL(request.url),origin=request.headers.get('origin'),action=url.pathname.split('/').filter(Boolean).at(-1)||'';
 const limit=LARGE.has(action)?16384:4096;
 if(origin && origin!==url.origin)return json({error:'This action must be made from Whiteboard Wednesdays.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'A JSON request is required.'},415);
 if(Number(request.headers.get('content-length')||0)>limit)return json({error:'Request too large.'},413);
 try {
  const raw=await request.text();if(raw.length>limit)return json({error:'Request too large.'},413);
  const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))return bad('A JSON object is required.');
  const db=database(),client=createYouTubeClient(env.YOUTUBE_API_KEY||'');
  const handled=await topicAction(action,body);if(handled)return handled;
  if(typeof body.handle!=='string'||body.handle.length>240)return json({error:'Enter a YouTube handle or channel link.'},400);
  if(action==='resolve')return json(await client.resolve(body.handle));
  if(action==='creators'){
   const channel=await client.resolve(body.handle);
   const existing=await db.prepare('SELECT handle FROM creators WHERE channel_id=? OR lower(handle)=lower(?)').bind(channel.id,channel.handle).first();
   if(!existing)await db.prepare('INSERT INTO creators(handle,name,channel_id,playlist_id) VALUES(?,?,?,?)').bind(channel.handle,channel.name,channel.id,channel.playlistId).run();
   return json({added:!existing});
  }
  if(action==='refresh'){
   if(!env.YOUTUBE_API_KEY)throw new YouTubeError('The YouTube API connection is not configured yet.',503);
   const creator=await db.prepare('SELECT * FROM creators WHERE handle=?').bind(body.handle).first<Creator>();
   if(!creator)return json({error:'This creator is not on the watchlist.'},404);
   const now=Date.now();
   if(creator.last_success && now-Date.parse(creator.last_success)<3600000)return json({cached:true});
   const lease=await db.prepare('UPDATE creators SET lease_until=? WHERE handle=? AND lease_until<?').bind(now+300000,creator.handle,now).run();
   if(!lease.meta.changes)return json({error:'This creator is already being refreshed. Try again shortly.'},409);
   try {
    const channel=creator.channel_id&&creator.playlist_id ? {id:creator.channel_id,playlistId:creator.playlist_id,name:creator.name,handle:creator.handle} : await client.resolve(creator.handle);
    const videos=await client.uploads(channel),checked=new Date().toISOString(),cutoff=new Date(now-30*86400000).toISOString();
    // Atomic replacement preserves the previous successful data if any network request fails.
    // Videos linked to a topic are never pruned, so a topic's sources stay readable.
    const keep='id NOT IN (SELECT video_id FROM topic_sources) AND id NOT IN (SELECT id FROM saved_ideas)';
    const statements=[db.prepare('DELETE FROM videos WHERE handle=? AND published_at>=? AND '+keep).bind(creator.handle,cutoff)];
    for(const video of videos)statements.push(db.prepare('INSERT INTO videos(id,handle,creator,title,description,published_at,thumbnail,refreshed_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET creator=excluded.creator,title=excluded.title,description=excluded.description,published_at=excluded.published_at,thumbnail=excluded.thumbnail,refreshed_at=excluded.refreshed_at').bind(video.id,creator.handle,video.creator,video.title,video.description,video.publishedAt,video.thumbnail,checked));
    statements.push(db.prepare('UPDATE creators SET name=?,channel_id=?,playlist_id=?,last_success=?,error=NULL,lease_until=0 WHERE handle=?').bind(channel.name,channel.id,channel.playlistId,checked,creator.handle));
    statements.push(db.prepare('DELETE FROM videos WHERE published_at<? AND '+keep).bind(cutoff));
    await db.batch(statements);return json({updated:videos.length});
   }catch(error){const message=error instanceof YouTubeError?error.message:'This creator could not be refreshed. Please retry.';await db.prepare('UPDATE creators SET error=?,lease_until=0 WHERE handle=?').bind(message,creator.handle).run();throw error;}
  }
  return json({error:'Unknown watchlist action.'},404);
 }catch(error){return json({error:error instanceof YouTubeError?error.message:'This action could not be completed. Please retry.'},error instanceof YouTubeError?error.status:500);}
}
