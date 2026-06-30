import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable, long-cache vendor libraries into their own chunks so a
        // page-content change does not bust the vendor cache, and so the heavy
        // libs (charts, Radix primitives) load only on the routes that use them
        // rather than riding the initial bundle. Kept coarse on purpose - a
        // handful of named groups, not one chunk per package.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/react-router/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }
          if (id.includes("/recharts/") || id.includes("/d3-")) {
            return "charts";
          }
          if (id.includes("/@radix-ui/")) {
            return "radix";
          }
          if (id.includes("/@tanstack/")) {
            return "react-query";
          }
          return undefined;
        },
      },
    },
  },
}));
