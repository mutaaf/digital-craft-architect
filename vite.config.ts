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
/** Lovable's editor script (cdn.gpteng.co) is kept in index.html for the Lovable editor, but has no
 *  business on the production site: a third-party module on every page view. Stripped at build. */
function stripEditorScriptPlugin(): Plugin {
  return {
    name: "digital-craft-strip-editor-script",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(/\s*<!-- IMPORTANT: DO NOT REMOVE THIS SCRIPT TAG[^>]*-->\s*<script src="https:\/\/cdn\.gpteng\.co\/gptengineer\.js" type="module"><\/script>/, "");
    },
  };
}

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
    stripEditorScriptPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  define: {
    __BUILD_COMMIT__: JSON.stringify((process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7)),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
        // Only React itself gets a named vendor chunk. Grouping recharts / radix / react-query into
        // fixed chunks (as before 2026-11-18) made Rollup co-locate shared helpers with them: `clsx`
        // (a recharts dependency, used by every page's cn()) landed in the 390 KB charts chunk, so
        // every page preloaded all of recharts. Rollup's own splitting keeps them with their routes.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run\/router)\//.test(id)) {
            return "react-vendor";
          }
          return undefined;
        },
      },
    },
  },
}));
