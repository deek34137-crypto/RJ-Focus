import { ParsedIntent, SearchMode, VideoResult } from '@/types';

const THRESHOLDS = {
  STRICT: 80,
  BALANCED: 50,
  DISCOVERY: 20,
};

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function rankCandidates(
  youtubeItems: any[],
  intent: ParsedIntent,
  mode: SearchMode = 'STRICT'
): VideoResult[] {
  const results: VideoResult[] = [];

  let max_score = 0;
  if (intent.organization) max_score += 20;
  if (intent.series) max_score += 25;
  if (intent.subject) max_score += 15;
  if (intent.class) max_score += 10;
  if (intent.topic) max_score += 20;
  if (intent.exam) max_score += 10;
  if (intent.contentType === 'One Shot') max_score += 15;

  for (const item of youtubeItems) {
    let raw_score = 0;
    const reasons: string[] = [];
    const title = item.snippet.title.toLowerCase();
    const channel = item.snippet.channelTitle.toLowerCase();
    const desc = item.snippet.description.toLowerCase();

    // -- POSITIVE SIGNALS --

    if (intent.organization) {
      if (channel.includes(intent.organization.toLowerCase()) || title.includes(intent.organization.toLowerCase())) {
        raw_score += 20;
        reasons.push(`Organization Match: ${intent.organization}`);
      }
    }

    if (intent.series) {
      if (title.includes(intent.series.toLowerCase())) {
        raw_score += 25;
        reasons.push(`Series Match: ${intent.series}`);
      } else if (desc.includes(intent.series.toLowerCase())) {
        raw_score += 10;
        reasons.push(`Series mentioned: ${intent.series}`);
      }
    }

    if (intent.subject) {
      if (title.includes(intent.subject.toLowerCase())) {
        raw_score += 15;
        reasons.push(`Subject Match: ${intent.subject}`);
      }
    }

    if (intent.class) {
      const numMatch = intent.class.match(/(\d+)/);
      if (numMatch) {
        const num = numMatch[1];
        if (title.includes(`class ${num}`) || title.includes(`${num}th`)) {
          raw_score += 10;
          reasons.push(`Class Match: ${intent.class}`);
        }
      }
    }

    if (intent.topic) {
      if (title.includes(intent.topic.toLowerCase())) {
        raw_score += 20;
        reasons.push(`Topic Match: ${intent.topic}`);
      }
    }

    if (intent.exam) {
      if (title.includes(intent.exam.toLowerCase()) || channel.includes(intent.exam.toLowerCase())) {
        raw_score += 10;
        reasons.push(`Exam Match: ${intent.exam}`);
      }
    }

    if (intent.contentType === 'One Shot' && title.includes('one shot')) {
      raw_score += 15;
      reasons.push(`Content Type Match: One Shot`);
    }

    // -- NEGATIVE SIGNALS (Contradictions) --
    
    // Contradictory Subjects
    const subjects = ['physics', 'chemistry', 'maths', 'biology', 'botany', 'zoology'];
    if (intent.subject) {
      for (const subj of subjects) {
        if (subj !== intent.subject.toLowerCase() && title.includes(subj)) {
          raw_score -= 40;
          reasons.push(`Contradicts Subject: Contains ${subj}`);
        }
      }
    }

    // Contradictory Class
    const classes = ['10', '11', '12', '9'];
    if (intent.class) {
      const numMatch = intent.class.match(/(\d+)/);
      if (numMatch) {
        const num = numMatch[1];
        for (const cls of classes) {
          if (cls !== num && (title.includes(`class ${cls}`) || title.includes(`${cls}th`))) {
            raw_score -= 30;
            reasons.push(`Contradicts Class: Contains Class ${cls}`);
          }
        }
      }
    }

    // -- DURATION & PLAYLIST MODIFIERS --
    const duration = item.itemType === 'video' && item.contentDetails?.duration 
      ? parseDuration(item.contentDetails.duration) 
      : undefined;
      
    const itemCount = item.itemType === 'playlist' && item.contentDetails?.itemCount
      ? item.contentDetails.itemCount
      : undefined;

    if (item.itemType === 'video' && duration !== undefined && duration < 600) {
      if (intent.series || intent.contentType === 'One Shot' || intent.exam) {
        raw_score -= 50;
        reasons.push('Too short for a full lecture/course (under 10m)');
      }
    }

    if (item.itemType === 'playlist') {
      raw_score += 15;
      reasons.push('Curated Playlist Format');
    }

    let percentage = 0;
    if (max_score === 0) {
      // Unrecognized query
      percentage = raw_score < 0 ? 0 : 100;
    } else {
      percentage = Math.max(0, Math.round((raw_score / max_score) * 100));
    }

    const threshold = THRESHOLDS[mode] || THRESHOLDS.STRICT;

    if (percentage >= threshold) {
      results.push({
        id: item.id,
        itemType: item.itemType || 'video',
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration,
        itemCount,
        publishedAt: item.snippet.publishedAt,
        relevanceScore: percentage,
        relevanceReasons: reasons,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
