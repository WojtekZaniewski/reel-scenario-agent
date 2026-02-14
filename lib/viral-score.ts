export function calculateViralScore(views: number, likes: number, comments: number): number {
  const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

  const viewsScore = Math.min((views / 100_000) * 40, 40);
  const likesScore = Math.min((likes / 10_000) * 30, 30);
  const engagementScore = Math.min(engagementRate * 30, 30);

  return Math.round(viewsScore + likesScore + engagementScore);
}
