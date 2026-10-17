/** Public YouTube metadata adapter. The API key belongs only in server runtime secrets. */
export class YouTubeError extends Error {
  constructor(message, status=502) { super(message); this.status=status; }
}
export function parseCreator(input) {
  let value=String(input || '').trim();
  if (/^https?:\/\//i.test(value)) {
    let url; try { url=new URL(value); } catch { throw new YouTubeError('Enter a YouTube handle or channel link.',400); }
    if (!['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname) || url.username || url.password) throw new YouTubeError('Use a youtube.com channel link.',400);
    value=decodeURIComponent(url.pathname).replace(/^\//,'').replace(/\/$/,'');
    if(value.startsWith('channel/'))value=value.slice(8);
  }
  if(/^UC[A-Za-z0-9_-]{22}$/.test(value))return {id:value};
  if(/^@[\p{L}\p{N}_.·-]{3,100}$/u.test(value))return {forHandle:value};
  throw new YouTubeError('Enter an @handle or a YouTube /channel/ link.',400);
}
export function createYouTubeClient(key, fetcher=fetch, now=()=>Date.now()) {
  async function get(resource, params) {
    if(!key)throw new YouTubeError('The YouTube API connection is not configured yet.',503);
    const url=new URL('https://www.googleapis.com/youtube/v3/'+resource);
    for(const [name,value] of Object.entries(params))if(value)url.searchParams.set(name,value);
    url.searchParams.set('key',key);
    let response;
    try { response=await fetcher(url,{signal:AbortSignal.timeout(15000)}); }
    catch { throw new YouTubeError('YouTube did not respond. Please retry.'); }
    let data;try{data=await response.json();}catch{throw new YouTubeError('YouTube returned an unreadable response. Please retry.');}
    if(!response.ok) {
      const reason=data.error?.errors?.[0]?.reason;
      if(reason==='quotaExceeded'||reason==='dailyLimitExceeded')throw new YouTubeError('The daily YouTube API allowance has been reached. Try again after it resets.',429);
      if(response.status===403||response.status===401||reason==='keyInvalid')throw new YouTubeError('YouTube rejected the API connection. Check the server-side API configuration.',503);
      throw new YouTubeError('YouTube could not complete this request. Please retry.');
    }
    return data;
  }
  async function resolve(input) {
    const data=await get('channels',{part:'snippet,contentDetails',...parseCreator(input)});
    const channel=data.items?.[0];
    if(!channel?.contentDetails?.relatedPlaylists?.uploads)throw new YouTubeError('No public YouTube channel was found for that handle.',404);
    return {id:channel.id,name:channel.snippet.title,handle:channel.snippet.customUrl || channel.id,playlistId:channel.contentDetails.relatedPlaylists.uploads};
  }
  async function uploads(channel) {
    const cutoff=now()-30*86400000, ids=new Set(); let token='', complete=false;
    for(let page=0;page<12;page++) {
      const data=await get('playlistItems',{part:'contentDetails',playlistId:channel.playlistId,maxResults:'50',pageToken:token});
      const items=data.items || [];
      for(const item of items)if(item.contentDetails?.videoId)ids.add(item.contentDetails.videoId);
      token=data.nextPageToken || '';
      // Uploads are ordered newest first. Use the video's publication date, never playlist insertion time.
      const dated=items.map(x=>Date.parse(x.contentDetails?.videoPublishedAt)).filter(Number.isFinite);
      if(!token || (dated.length===items.length && dated.length && dated.every(t=>t<cutoff))) {complete=true;break;}
    }
    if(!complete)throw new YouTubeError('This channel has more uploads than one refresh can cover. Its previous videos have been kept.');
    const videos=[], all=[...ids];
    for(let start=0;start<all.length;start+=50) {
      const data=await get('videos',{part:'snippet',id:all.slice(start,start+50).join(',')});
      for(const v of data.items || []) {
        const s=v.snippet,t=Date.parse(s?.publishedAt);
        if(!s || !Number.isFinite(t) || t<cutoff || t>now())continue;
        videos.push({id:v.id,channelId:channel.id,handle:channel.handle,creator:s.channelTitle,title:s.title,description:String(s.description || '').slice(0,5000),publishedAt:s.publishedAt,thumbnail:s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || ''});
      }
    }
    return videos.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
  }
  return {resolve,uploads};
}
