import { defineConfig } from "tsup";

// Dual-format library build (ESM + CJS + .d.ts). react/react-dom stay external
// — they are peerDependencies and must NOT be bundled into the product.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  minify: false,
  external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
});
