const cache = new Map<string, { data: unknown; expires: number }>();

const DEFAULT_TTL = parseInt(process.env.REELS_CACHE_TTL_MS || '900000', 10);

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export function makeCacheKey(items: string[]): string {
  return [...items].sort().join(',').toLowerCase();
}
