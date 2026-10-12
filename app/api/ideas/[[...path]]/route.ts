import { env } from 'cloudflare:workers';
import { createYouTubeClient, YouTubeError } from '../../../../youtube-api.mjs';
import seed from '../../../../public/creators.json';
export const dynamic='force-dynamic';
type Creator={handle:string;name:string;channel_id:string|null;playlist_id:string|null;last_success:string|null;error:string|null;lease_until:number};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
function database(){if(!env.DB)throw new YouTubeError('Watchlist storage is temporarily unavailable.',503);return env.DB;}
async function initialise(){const db=database();await db.batch(seed.creators.map(c=>db.prepare('INSERT OR IGNORE INTO creators(handle,name) VALUES(?,?)').bind(c.handle,c.name)));}
export async function GET(){
 try{
  await initialise();const db=database();
  const [creators,videos,saved]=await Promise.all([
   db.prepare('SELECT * FROM creators ORDER BY name COLLATE NOCASE').all<Creator>(),
   db.prepare('SELECT v.* FROM videos v LEFT JOIN saved_ideas s ON s.id=v.id WHERE v.published_at >= ? OR s.id IS NOT NULL ORDER BY v.published_at DESC').bind(new Date(Date.now()-30*86400000).toISOString()).all(),
   db.prepare('SELECT id FROM saved_ideas').all<{id:string}>(),
  ]);
  return json({configured:Boolean(env.YOUTUBE_API_KEY),creators:creators.results.map(c=>({handle:c.handle,name:c.name,lastSuccess:c.last_success,error:c.error})),videos:videos.results.map(v=>({id:v.id,handle:v.handle,creator:v.creator,title:v.title,publishedAt:v.published_at,thumbnail:v.thumbnail})),savedIds:saved.results.map(s=>s.id)});
 }catch{return json({error:'Your watchlist could not be loaded. Please retry.'},503);}
}
export async function POST(request:Request){
 // The existing owner-private Sites access boundary protects this shared watchlist.
 // Same-origin JSON requests prevent other sites from submitting writes through a signed-in browser.
 const url=new URL(request.url),origin=request.headers.get('origin');
 if(origin && origin!==url.origin)return json({error:'This action must be made from Whiteboard Wednesdays.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'A JSON request is required.'},415);
 if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Request too large.'},413);
 try {
  const raw=await request.text();if(raw.length>4096)return json({error:'Request too large.'},413);
  const body=JSON.parse(raw), action=url.pathname.split('/').filter(Boolean).at(-1),db=database(),client=createYouTubeClient(env.YOUTUBE_API_KEY||'');
  if(action==='save'){
   if(typeof body.id!=='string'||typeof body.saved!=='boolean')return json({error:'Choose a video to save.'},400);
   const video=await db.prepare('SELECT id FROM videos WHERE id=?').bind(body.id).first();
   if(!video)return json({error:'This video is no longer available in the watchlist.'},404);
   if(body.saved)await db.prepare('INSERT OR IGNORE INTO saved_ideas(id,saved_at) VALUES(?,?)').bind(body.id,new Date().toISOString()).run();
   else await db.prepare('DELETE FROM saved_ideas WHERE id=?').bind(body.id).run();
   return json({saved:body.saved});
  }
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
    const statements=[db.prepare('DELETE FROM videos WHERE handle=? AND published_at>=? AND id NOT IN (SELECT id FROM saved_ideas)').bind(creator.handle,cutoff)];
    for(const video of videos)statements.push(db.prepare('INSERT INTO videos(id,handle,creator,title,published_at,thumbnail,refreshed_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET creator=excluded.creator,title=excluded.title,published_at=excluded.published_at,thumbnail=excluded.thumbnail,refreshed_at=excluded.refreshed_at').bind(video.id,creator.handle,video.creator,video.title,video.publishedAt,video.thumbnail,checked));
    statements.push(db.prepare('UPDATE creators SET name=?,channel_id=?,playlist_id=?,last_success=?,error=NULL,lease_until=0 WHERE handle=?').bind(channel.name,channel.id,channel.playlistId,checked,creator.handle));
    statements.push(db.prepare('DELETE FROM videos WHERE published_at<? AND id NOT IN (SELECT id FROM saved_ideas)').bind(cutoff));
    await db.batch(statements);return json({updated:videos.length});
   }catch(error){const message=error instanceof YouTubeError?error.message:'This creator could not be refreshed. Please retry.';await db.prepare('UPDATE creators SET error=?,lease_until=0 WHERE handle=?').bind(message,creator.handle).run();throw error;}
  }
  return json({error:'Unknown watchlist action.'},404);
 }catch(error){return json({error:error instanceof YouTubeError?error.message:'This action could not be completed. Please retry.'},error instanceof YouTubeError?error.status:500);}
}
