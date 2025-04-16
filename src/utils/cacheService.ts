
/**
 * A simple in-memory cache implementation to reduce repeated API calls
 */

type CacheItem<T> = {
  value: T;
  expiry: number | null; // Timestamp when this item expires (null = never expires)
};

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The stored value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Return undefined if item doesn't exist
    if (!item) return undefined;
    
    // Check if item has expired
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param value Value to store
   * @param ttl Time to live in milliseconds (default: 5 minutes, null = never expires)
   */
  set<T>(key: string, value: T, ttl: number | null = this.DEFAULT_TTL): void {
    const expiry = ttl === null ? null : Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear all expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get the number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const cacheService = new CacheService();
