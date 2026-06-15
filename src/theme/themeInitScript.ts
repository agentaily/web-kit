import type { ThemeInitScriptOptions } from "./types";

const DEFAULT_STORAGE_KEY = "agentaily:theme";

/** A JS string literal safe to inline inside `<script>`: JSON-encode the value,
 * then escape every `<` as `<` so a `</script>` in the data cannot break
 * out of the tag. The runtime value is preserved; only the source text changes. */
function jsLiteral(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Returns a self-contained JS snippet to inline (synchronously, blocking) in the
 * document `<head>` — before React or any paint. It reads the persisted theme
 * (cookie, then localStorage), resolves `system` via `prefers-color-scheme`, and
 * sets the attribute on `<html>` so the first paint already has the right theme
 * (no flash of incorrect theme / FOUC).
 *
 * Properties: dependency-free, idempotent, SSR-safe to *generate* (pure string),
 * and XSS-safe — every interpolated value is JSON-encoded with `<` escaped, so
 * config strings cannot break out of the script (or its `<script>` tag).
 */
export function themeInitScript(options: ThemeInitScriptOptions = {}): string {
  const attribute = options.attribute ?? "data-theme";
  const defaultTheme = options.defaultTheme ?? "system";
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  // The provider writes cookies under encodeURIComponent(key); match that here.
  const cookieName = encodeURIComponent(storageKey);

  const ATTR = jsLiteral(attribute);
  const DEFAULT = jsLiteral(defaultTheme);
  const COOKIE = jsLiteral(`${cookieName}=`);
  const LS_KEY = jsLiteral(storageKey);

  return `(function(){try{var d=document,m=null;try{var c=d.cookie?d.cookie.split("; "):[];for(var i=0;i<c.length;i++){if(c[i].indexOf(${COOKIE})===0){m=decodeURIComponent(c[i].slice(${COOKIE}.length));break;}}}catch(e){}if(m===null){try{m=localStorage.getItem(${LS_KEY});}catch(e){}}var t=m||${DEFAULT},r;if(t==="light"||t==="dark"){r=t;}else{r=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";}d.documentElement.setAttribute(${ATTR},r);}catch(e){}})();`;
}
