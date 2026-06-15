import { isBrowser } from "../internal/env";
import { ONE_YEAR_SECONDS, cookieStore } from "./cookie";
import { guard, localStore, memoryStore, nullStore, probe } from "./stores";
import type { PreferenceStorage, StorageConfig } from "./types";

const DEFAULT_COOKIE_DOMAIN = ".agentaily.com";
const DEFAULT_KEY_PREFIX = "agentaily:";

/** Strip a leading dot: `.agentaily.com` → `agentaily.com`. */
function bareDomain(domain: string): string {
  return domain.replace(/^\./, "");
}

/** True when the current host can actually own a cookie scoped to `domain`
 * (i.e. host is the domain or a subdomain of it). localhost / unrelated hosts
 * return false, so we never write a `.agentaily.com` cookie that the browser
 * would silently reject. */
function hostMatchesDomain(domain: string): boolean {
  const host = typeof location !== "undefined" ? location.hostname : "";
  const bare = bareDomain(domain);
  return host === bare || host.endsWith(`.${bare}`);
}

function resolveStore(config: Required<StorageConfig>): PreferenceStorage {
  // SSR / no document: a no-op store. Never persists across server requests.
  if (!isBrowser()) return nullStore;

  const domainCookie = cookieStore(config.cookieDomain, config.cookieMaxAge);
  const local = localStore();
  const plainCookie = cookieStore(undefined, config.cookieMaxAge);

  switch (config.backend) {
    case "cookie": {
      // Cross-subdomain cookie when the host allows it; otherwise a domain-less
      // cookie so localhost dev still round-trips.
      if (hostMatchesDomain(config.cookieDomain) && probe(domainCookie)) return guard(domainCookie);
      if (probe(plainCookie)) return guard(plainCookie);
      return memoryStore();
    }
    case "local": {
      if (probe(local)) return guard(local);
      return memoryStore();
    }
    case "auto":
    default: {
      // Preference order: cross-subdomain cookie → localStorage → domain-less
      // cookie → in-memory. Each candidate must survive a write/read probe
      // (covers private mode / disabled storage without throwing).
      const candidates: PreferenceStorage[] = [];
      if (hostMatchesDomain(config.cookieDomain)) candidates.push(domainCookie);
      candidates.push(local, plainCookie);
      for (const candidate of candidates) {
        if (probe(candidate)) return guard(candidate);
      }
      return memoryStore();
    }
  }
}

/**
 * Build a preference store. Resolves the concrete backend once (per the config +
 * runtime environment) and applies `keyPrefix` to every key. The returned store
 * never throws — SSR and private mode degrade silently.
 */
export function createStorage(config: StorageConfig = {}): PreferenceStorage {
  const resolved: Required<StorageConfig> = {
    backend: config.backend ?? "auto",
    cookieDomain: config.cookieDomain ?? DEFAULT_COOKIE_DOMAIN,
    keyPrefix: config.keyPrefix ?? DEFAULT_KEY_PREFIX,
    cookieMaxAge: config.cookieMaxAge ?? ONE_YEAR_SECONDS,
  };
  const store = resolveStore(resolved);
  const withPrefix = (key: string): string => `${resolved.keyPrefix}${key}`;
  return {
    get: (key) => store.get(withPrefix(key)),
    set: (key, value) => store.set(withPrefix(key), value),
    remove: (key) => store.remove(withPrefix(key)),
  };
}
