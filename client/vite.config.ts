import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

// Civic Wise: Vite + React SPA, built as an offline-first PWA.
// The service worker precaches the app shell and runtime-caches API GETs and
// media so lessons keep working on slow or absent connections.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Split third-party code into a few stable chunks. They change rarely,
        // so returning visitors keep them cached across our releases.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("@radix-ui") || id.includes("@floating-ui")) return "radix";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("zod")) return "zod";
          return "vendor";
        },
      },
    },
  },
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Civic Wise",
        short_name: "Civic Wise",
        description: "Free, simple digital skills lessons for communities in Zambia.",
        theme_color: "#14532D",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Read-only content API — serve from cache fast, refresh in background.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/") && url.pathname !== "/api/health",
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "db-api",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Media (images/audio) bundled for offline lessons.
            urlPattern: ({ request }) => ["image", "audio", "video"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "db-media",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    // During dev, proxy API calls to the Express server so there are no CORS
    // hurdles and the app runs same-origin as it will in production.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API ?? "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
