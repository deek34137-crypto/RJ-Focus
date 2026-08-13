import { ParsedIntent, VideoResult, SearchMode } from '@/types';

// Rough conversion from ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeCandidates(query: string): Promise<any[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }

  // Fetch search results (videos and playlists)
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video,playlist');
  searchUrl.searchParams.set('maxResults', '50'); // Fetch a larger candidate set to ensure videos are found
  searchUrl.searchParams.set('key', API_KEY);

  const searchRes = await fetch(searchUrl.toString(), { next: { revalidate: 3600 } });
  if (!searchRes.ok) {
    throw new Error(`YouTube API Error: ${searchRes.statusText}`);
  }
  
  const searchData = await searchRes.json();
  const items = searchData.items || [];
  
  const videoIds = items.filter((i: any) => i.id.kind === 'youtube#video').map((i: any) => i.id.videoId).join(',');
  const playlistIds = items.filter((i: any) => i.id.kind === 'youtube#playlist').map((i: any) => i.id.playlistId).join(',');

  const requests: Promise<any>[] = [];

  if (videoIds) {
    const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videoUrl.searchParams.set('part', 'snippet,contentDetails');
    videoUrl.searchParams.set('id', videoIds);
    videoUrl.searchParams.set('key', API_KEY);
    requests.push(fetch(videoUrl.toString(), { next: { revalidate: 3600 } }).then(res => res.json()));
  } else {
    requests.push(Promise.resolve({ items: [] }));
  }

  if (playlistIds) {
    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlists');
    playlistUrl.searchParams.set('part', 'snippet,contentDetails');
    playlistUrl.searchParams.set('id', playlistIds);
    playlistUrl.searchParams.set('key', API_KEY);
    requests.push(fetch(playlistUrl.toString(), { next: { revalidate: 3600 } }).then(res => res.json()));
  } else {
    requests.push(Promise.resolve({ items: [] }));
  }

  const [videoData, playlistData] = await Promise.all(requests);
  
  // Format them so relevance engine can easily consume them
  const formattedItems: any[] = [];
  
  for (const v of (videoData.items || [])) {
    formattedItems.push({
      itemType: 'video',
      id: v.id,
      snippet: v.snippet,
      contentDetails: v.contentDetails // has duration
    });
  }

  for (const p of (playlistData.items || [])) {
    formattedItems.push({
      itemType: 'playlist',
      id: p.id,
      snippet: p.snippet,
      contentDetails: p.contentDetails // has itemCount
    });
  }

  return formattedItems;
}
