import { ParsedIntent, SearchMode, VideoResult } from '@/types';

const THRESHOLDS = {
  STRICT: 70,
  BALANCED: 40,
  DISCOVERY: 15,
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

  for (const item of youtubeItems) {
    let score = 0;
    const reasons: string[] = [];
    const title = item.snippet.title.toLowerCase();
    const channel = item.snippet.channelTitle.toLowerCase();
    const desc = item.snippet.description.toLowerCase();

    // -- POSITIVE SIGNALS --

    if (intent.organization) {
      if (channel.includes(intent.organization.toLowerCase()) || title.includes(intent.organization.toLowerCase())) {
        score += 20;
        reasons.push(`Organization Match: ${intent.organization}`);
      }
    }

    if (intent.series) {
      if (title.includes(intent.series.toLowerCase())) {
        score += 25;
        reasons.push(`Series Match: ${intent.series}`);
      } else if (desc.includes(intent.series.toLowerCase())) {
        score += 10;
        reasons.push(`Series mentioned: ${intent.series}`);
      }
    }

    if (intent.subject) {
      if (title.includes(intent.subject.toLowerCase())) {
        score += 15;
        reasons.push(`Subject Match: ${intent.subject}`);
      }
    }

    if (intent.class) {
      // E.g., 'Class 12'
      const numMatch = intent.class.match(/(\d+)/);
      if (numMatch) {
        const num = numMatch[1];
        if (title.includes(`class ${num}`) || title.includes(`${num}th`)) {
          score += 10;
          reasons.push(`Class Match: ${intent.class}`);
        }
      }
    }

    if (intent.topic) {
      if (title.includes(intent.topic.toLowerCase())) {
        score += 20;
        reasons.push(`Topic Match: ${intent.topic}`);
      }
    }

    if (intent.exam) {
      if (title.includes(intent.exam.toLowerCase()) || channel.includes(intent.exam.toLowerCase())) {
        score += 10;
        reasons.push(`Exam Match: ${intent.exam}`);
      }
    }

    if (intent.contentType === 'One Shot' && title.includes('one shot')) {
      score += 15;
      reasons.push(`Content Type Match: One Shot`);
    }

    // -- NEGATIVE SIGNALS (Contradictions) --
    
    // Contradictory Subjects
    const subjects = ['physics', 'chemistry', 'maths', 'biology', 'botany', 'zoology'];
    if (intent.subject) {
      for (const subj of subjects) {
        if (subj !== intent.subject.toLowerCase() && title.includes(subj)) {
          score -= 40;
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
            score -= 30;
            reasons.push(`Contradicts Class: Contains Class ${cls}`);
          }
        }
      }
    }

    // Normalize to 0-100 roughly
    score = Math.max(0, Math.min(100, score));

    // Hard filter: if we have negative signals that dropped score to 0 or very low, it will be naturally filtered out by threshold
    // Threshold filtering
    const threshold = THRESHOLDS[mode] || THRESHOLDS.STRICT;

    if (score >= threshold) {
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelName: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration: parseDuration(item.contentDetails.duration),
        publishedAt: item.snippet.publishedAt,
        relevanceScore: score,
        relevanceReasons: reasons,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
