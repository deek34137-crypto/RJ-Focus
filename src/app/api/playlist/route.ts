import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', id);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`YouTube API returned ${res.status}`);
    }

    const data = await res.json();
    
    // Map to a cleaner format
    const items = (data.items || []).map((item: any) => ({
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      channelName: item.snippet.videoOwnerChannelTitle,
      position: item.snippet.position,
    })).filter((item: any) => item.title !== 'Private video' && item.title !== 'Deleted video');

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Playlist API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
