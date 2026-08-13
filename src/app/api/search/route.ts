import { NextResponse } from 'next/server';
import { parseQuery } from '@/lib/parser/query-parser';
import { fetchYouTubeCandidates } from '@/lib/youtube/client';
import { rankCandidates } from '@/lib/ranking/relevance-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const mode = searchParams.get('mode') || 'STRICT';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // 1. Parse Intent
    const intent = parseQuery(query);

    // 2. Fetch Candidates from YouTube
    const candidates = await fetchYouTubeCandidates(query);

    // 3. Rank and Filter Candidates
    const rankedResults = rankCandidates(candidates, intent, mode as any);

    return NextResponse.json({
      intent,
      results: rankedResults,
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
