/** Where a preference is persisted. `auto` picks the best available at runtime. */
export type StorageBackend = "cookie" | "local" | "auto";

export interface StorageConfig {
  /** Backend strategy. Default `auto`. */
  backend?: StorageBackend;
  /** Cookie domain for cross-subdomain sharing. Default `.agentaily.com`. */
  cookieDomain?: string;
  /** Prefix applied to every key. Default `agentaily:`. */
  keyPrefix?: string;
  /** Cookie lifetime in seconds. Default one year. */
  cookieMaxAge?: number;
}

/**
 * Minimal string key/value store. All methods are total and never throw —
 * unavailable storage (SSR, private mode) degrades silently (get → null).
 */
export interface PreferenceStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}
