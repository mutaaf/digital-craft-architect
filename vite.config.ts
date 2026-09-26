import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Ticket 0098 - Vite's built-in sirv serves .opml files with an empty
// Content-Type because the extension is not in its default MIME table.
// The dev and preview servers need to send an XML-family content-type so
// feed readers (and the e2e spec at
// tests/e2e/feeds-opml-subscription-index.spec.ts) can read /feeds.opml
// as XML. This plugin sets `Content-Type: application/xml; charset=utf-8`
// on any request whose pathname ends with `.opml`. Production is covered
// by the vercel.json `headers` entry shipped alongside this change.
function opmlContentTypePlugin(): Plugin {
  const setHeader = (
    req: { url?: string },
    res: { setHeader: (name: string, value: string) => void },
    next: () => void,
  ) => {
    const url = req.url ?? "";
    const pathname = url.split("?")[0].split("#")[0];
    if (pathname.endsWith(".opml")) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
    }
    next();
  };
  return {
    name: "digital-craft-opml-content-type",
    configureServer(server) {
      server.middlewares.use(setHeader);
    },
    configurePreviewServer(server) {
      server.middlewares.use(setHeader);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    opmlContentTypePlugin(),
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
