/**
 * In-memory cache with TTL para dados coletados.
 * Em producao, seria substituido por Redis ou Supabase.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  collectedAt: Date;
}

class DataCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      collectedAt: new Date(),
    });
  }

  get<T>(key: string): { data: T; collectedAt: Date } | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return { data: entry.data as T, collectedAt: entry.collectedAt };
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  stats() {
    const keys = this.keys();
    return {
      totalKeys: keys.length,
      keys: keys.map(k => {
        const entry = this.store.get(k);
        return {
          key: k,
          collectedAt: entry?.collectedAt,
          expiresAt: entry ? new Date(entry.expiresAt) : null,
          expired: entry ? Date.now() > entry.expiresAt : true,
        };
      }),
    };
  }
}

export const dataCache = new DataCache();

// Cache keys
export const CACHE_KEYS = {
  WEATHER: "weather:tangara",
  WEATHER_FORECAST: "weather:forecast:tangara",
  TRENDS: (keyword: string) => `trends:${keyword}`,
  TRENDS_BATCH: "trends:batch:pizza",
  COMPETITORS: (neighborhood: string) => `competitors:${neighborhood}`,
  COMPETITORS_ALL: "competitors:all:tangara",
} as const;

// TTLs em segundos
export const CACHE_TTL = {
  WEATHER: 30 * 60,        // 30 minutos
  WEATHER_FORECAST: 3600,  // 1 hora
  TRENDS: 6 * 3600,        // 6 horas
  COMPETITORS: 24 * 3600,  // 24 horas
} as const;
