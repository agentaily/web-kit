import type { PreferenceStorage } from "./types";

/** A typed, persisted single value with a default. */
export interface PersistentState<T> {
  get(): T;
  set(value: T): void;
  remove(): void;
}

export interface PersistentStateOptions<T> {
  key: string;
  defaultValue: T;
  storage: PreferenceStorage;
  /** Parse a stored string. Return `undefined` to fall back to defaultValue
   * (use this to reject unknown / corrupt values). Default: identity. */
  decode?: (raw: string) => T | undefined;
  /** Serialize a value for storage. Default: `String(value)`. */
  encode?: (value: T) => string;
}

/**
 * Bind a single key in a PreferenceStorage to a typed value with a default.
 * Reads that miss (or decode to `undefined`) yield the default — so SSR, private
 * mode, and unknown stored values all degrade to the default without throwing.
 */
export function persistentState<T>(options: PersistentStateOptions<T>): PersistentState<T> {
  const { key, defaultValue, storage } = options;
  const encode = options.encode ?? ((value: T): string => String(value));
  const decode = options.decode ?? ((raw: string): T | undefined => raw as unknown as T);
  return {
    get: () => {
      const raw = storage.get(key);
      if (raw === null) return defaultValue;
      const decoded = decode(raw);
      return decoded === undefined ? defaultValue : decoded;
    },
    set: (value) => storage.set(key, encode(value)),
    remove: () => storage.remove(key),
  };
}
