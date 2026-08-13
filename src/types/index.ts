export type ParsedIntent = {
  organization?: string;
  series?: string;
  year?: string;
  subject?: string;
  topic?: string;
  class?: string;
  contentType?: string;
  channel?: string;
  exam?: string;
  teacher?: string;
  language?: string;
};

export type VideoResult = {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelName: string;
  thumbnail: string;
  duration: number; // in seconds
  publishedAt: string;
  playlistId?: string;
  relevanceScore: number;
  relevanceReasons: string[];
};

export type SearchMode = 'STRICT' | 'BALANCED' | 'DISCOVERY';

export type SearchSession = {
  id: string;
  query: string;
  intent: ParsedIntent;
  mode: SearchMode;
  results: VideoResult[];
  currentIndex?: number;
  createdAt: number;
};
