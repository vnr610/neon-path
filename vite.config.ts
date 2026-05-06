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
      selfDestroying: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Do NOT set navigateFallback — it causes the offline page to flash
        // on hard refresh (Ctrl+R) because the SW intercepts the navigation
        // before the network responds. The OfflineDetector handles this in React.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallbackDenylist: [
          /^\/rest\//,
          /^\/auth\//,
          /^\/storage\//,
          /^\/functions\//,
        ],
        runtimeCaching: [
          {
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
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        // Use a simple, stable chunking strategy.
        // All node_modules go into one vendor chunk so Rollup controls
        // initialization order — this prevents all "Cannot access X before
        // initialization" and "createContext is undefined" crashes that occur
        // when React-dependent packages are split into separate chunks.
        manualChunks: (id) => {
          if (id.includes("node_modules/")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
