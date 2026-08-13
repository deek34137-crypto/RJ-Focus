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

  // Fetch search results
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('maxResults', '25'); // Fetch a good candidate set
  searchUrl.searchParams.set('key', API_KEY);

  const searchRes = await fetch(searchUrl.toString(), { next: { revalidate: 3600 } });
  if (!searchRes.ok) {
    throw new Error(`YouTube API Error: ${searchRes.statusText}`);
  }
  
  const searchData = await searchRes.json();
  const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',') || '';

  if (!videoIds) return [];

  // Fetch detailed video data (for duration, etc.)
  const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videoUrl.searchParams.set('part', 'snippet,contentDetails');
  videoUrl.searchParams.set('id', videoIds);
  videoUrl.searchParams.set('key', API_KEY);

  const videoRes = await fetch(videoUrl.toString(), { next: { revalidate: 3600 } });
  if (!videoRes.ok) {
    throw new Error(`YouTube API Error: ${videoRes.statusText}`);
  }

  const videoData = await videoRes.json();
  
  return videoData.items || [];
}
