export interface ReelMetrics {
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
}

export interface Reel {
  id: string;
  shortcode: string;
  caption: string;
  metrics: ReelMetrics;
  viralScore: number;
  timestamp: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  ownerUsername?: string;
}
