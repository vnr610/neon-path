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
    // Raise the warning threshold — vendor chunk contains mammoth+markdown libs (~320 kB gzipped), acceptable for a portfolio
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — tiny, always needed, cache forever
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react/jsx")) {
            return "react-core";
          }
          // Router
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          // Supabase client
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // TanStack Query
          if (id.includes("node_modules/@tanstack")) {
            return "query";
          }
          // Radix UI primitives (large — split from app code)
          if (id.includes("node_modules/@radix-ui")) {
            return "radix";
          }
          // Charts (only used on skills/analytics pages)
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          // Animations
          if (id.includes("node_modules/animejs")) {
            return "animations";
          }
          // Lucide icons (very large — split separately)
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // Lodash utilities
          if (id.includes("node_modules/lodash")) {
            return "lodash";
          }
          // Date utilities
          if (id.includes("node_modules/date-fns")) {
            return "date-fns";
          }
          // Word doc parser (admin-only, very heavy)
          if (id.includes("node_modules/mammoth")) {
            return "mammoth";
          }
          // Form validation
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) {
            return "forms";
          }
          // UI extras (dialogs, carousels, date pickers, etc.)
          if (
            id.includes("node_modules/cmdk") ||
            id.includes("node_modules/vaul") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/embla-carousel") ||
            id.includes("node_modules/react-resizable-panels") ||
            id.includes("node_modules/react-day-picker") ||
            id.includes("node_modules/input-otp")
          ) {
            return "ui-extras";
          }
          // Vercel analytics
          if (id.includes("node_modules/@vercel")) {
            return "analytics";
          }
          // Everything else in node_modules → vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
