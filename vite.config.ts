import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // Use the custom offline fallback page
      selfDestroying: false,
      workbox: {
        // Cache the app shell and all static assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Serve offline.html when a navigation request fails (no network)
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [
          // Don't intercept Supabase API calls
          /^\/rest\//,
          /^\/auth\//,
          /^\/storage\//,
          /^\/functions\//,
        ],
        runtimeCaching: [
          {
            // Cache Supabase REST responses for 5 minutes
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: "VNR610 · Realm Codex",
        short_name: "VNR610",
        description: "Personal portfolio of VNR610 — Full Stack & Cybersecurity",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        icons: [
          { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
          { src: "/placeholder.svg", sizes: "192x192", type: "image/svg+xml" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Raise the warning threshold — vendor contains all React ecosystem + recharts/d3/markdown/mammoth (~518 kB gzipped), acceptable for a portfolio
    chunkSizeWarningLimit: 1700,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Only split libraries that have NO React dependency and no internal circular refs.
          // Everything that touches React must stay in vendor so Rollup controls init order.

          // Supabase — pure JS, no React
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // Lodash — pure JS utilities
          if (id.includes("node_modules/lodash")) {
            return "lodash";
          }
          // Date utilities — pure JS
          if (id.includes("node_modules/date-fns")) {
            return "date-fns";
          }
          // Everything else (React, Radix, Recharts, Markdown, Mammoth, etc.) → vendor
          // Rollup handles their circular deps and init order correctly in one chunk.
          if (id.includes("node_modules/")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
