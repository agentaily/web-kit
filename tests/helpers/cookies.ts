export interface CookieCapture {
  /** Every raw string assigned to document.cookie since install. */
  writes: string[];
  restore(): void;
}

/** Record raw writes to `document.cookie` while still forwarding to the real
 * setter (so cookies are actually stored and round-trips still work). */
export function captureCookieWrites(): CookieCapture {
  const writes: string[] = [];
  const original = Object.getOwnPropertyDescriptor(document, "cookie");
  const proto = Object.getPrototypeOf(document) as object;
  const inherited = Object.getOwnPropertyDescriptor(proto, "cookie");
  const realSet = (original ?? inherited)?.set;
  const realGet = (original ?? inherited)?.get;

  Object.defineProperty(document, "cookie", {
    configurable: true,
    get() {
      return realGet ? realGet.call(document) : "";
    },
    set(value: string) {
      writes.push(value);
      realSet?.call(document, value);
    },
  });

  return {
    writes,
    restore() {
      if (original) Object.defineProperty(document, "cookie", original);
      else Reflect.deleteProperty(document, "cookie");
    },
  };
}

/** Clear all cookies visible on the current document. */
export function clearCookies(): void {
  for (const entry of document.cookie ? document.cookie.split("; ") : []) {
    const name = entry.split("=")[0];
    if (name) {
      document.cookie = `${name}=; path=/; max-age=0`;
      document.cookie = `${name}=; path=/; max-age=0; domain=.agentaily.com`;
    }
  }
}
