import { defineConfig } from "vitest/config";

// The source uses NodeNext ESM with explicit .js import specifiers that point at
// .ts files. Map relative .js imports back to .ts so Vitest can resolve them,
// and provide the env vars env.ts validates at import time.
export default defineConfig({
  resolve: {
    alias: [{ find: /^(\.{1,2}\/.*)\.js$/, replacement: "$1.ts" }],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://test:test@127.0.0.1:5432/test",
      JWT_SECRET: "test-secret-value-at-least-16-chars",
    },
  },
});
