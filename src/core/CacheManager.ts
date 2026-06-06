interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private defaultTTL: number;
  private isEnabled: boolean;

  constructor(defaultTTL: number = 300000, enabled: boolean = true) {
    this.defaultTTL = defaultTTL;
    this.isEnabled = enabled;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (!this.isEnabled) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    if (!this.isEnabled) return null;

    const item = this.cache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    if (!this.isEnabled) return false;

    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearByPrefix(prefix: string): void {
    const keys = Array.from(this.cache.keys()).filter((key) => key.startsWith(prefix));
    keys.forEach((key) => this.cache.delete(key));
  }

  getSize(): number {
    return this.cache.size;
  }
}
