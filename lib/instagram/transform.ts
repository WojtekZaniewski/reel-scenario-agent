import { Reel } from '@/types/reel';
import { calculateViralScore } from '@/lib/viral-score';
import { Instagram120ReelsResponse, Instagram120ReelItem } from './types';

function transformInstagram120Reel(raw: Instagram120ReelItem, username: string): Reel {
  const views = raw.play_count || 0;
  const likes = raw.like_count || 0;
  const comments = raw.comment_count || 0;
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

  return {
    id: raw.pk || raw.id,
    shortcode: raw.code,
    caption: '',
    metrics: { views, likes, comments, engagementRate },
    viralScore: calculateViralScore(views, likes, comments),
    timestamp: 0,
    thumbnailUrl: raw.image_versions2?.candidates?.[0]?.url,
    ownerUsername: username,
  };
}

export function extractReelsFromResponse(data: Instagram120ReelsResponse, username: string): Reel[] {
  const edges = data?.result?.edges || [];

  return edges
    .map((edge) => transformInstagram120Reel(edge.node.media, username))
    .sort((a, b) => b.viralScore - a.viralScore);
}
