import { defineConfig } from "vitest/config";

// jsdom by default (Provider/hook + cookie/localStorage round-trips). SSR / no-window
// scenarios opt into the node environment per-file via a `// @vitest-environment node`
// docblock at the top of the test file.
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    // Default jsdom origin is an agentaily subdomain so cross-subdomain cookies
    // round-trip (and are https → Secure). localhost / SSR scenarios override
    // this per-file (node environment) or by stubbing window.location.
    environmentOptions: {
      jsdom: { url: "https://form-design.agentaily.com/" },
    },
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
});
