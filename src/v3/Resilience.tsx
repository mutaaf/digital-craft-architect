import React, { lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { captureException, addBreadcrumb } from '@/utils/sentry';

// Two failure modes that used to take down the whole app (2026-11-18):
//  1. A visitor has the site open, we deploy, they click a link: the old route chunk's hashed file is
//     gone, the dynamic import rejects, and the single top-level boundary showed "Something went wrong".
//     Fix: retry once, then reload the page once (a guard in sessionStorage stops reload loops).
//  2. One page throws while rendering: the whole app, nav included, was replaced by the error screen.
//     Fix: a boundary per route that keeps the chrome, reports the error with the route, and resets
//     when the visitor navigates away.

const RELOAD_KEY = 'dc_chunk_reload_at';
const isChunkError = (e: unknown) => /dynamically imported module|Importing a module script failed|error loading dynamically|Failed to fetch dynamically|ChunkLoadError|Unable to preload CSS/i.test(String((e as Error)?.message ?? e));

function reloadOnce(reason: unknown): boolean {
  try {
    const last = +(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30_000) return false; // already tried: let the boundary show
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch { /* storage blocked: still worth one reload */ }
  addBreadcrumb('chunk load failed, reloading', 'resilience', 'warning', { reason: String(reason) });
  location.reload();
  return true;
}

// Vite fires this when a <link rel=modulepreload> for a lazy chunk fails.
if (typeof window !== 'undefined') {
  addEventListener('vite:preloadError', (e) => { if (reloadOnce((e as Event & { payload?: unknown }).payload)) e.preventDefault(); });
}

/** Drop-in for React.lazy with one retry and a one-time reload on stale chunks. */
export function lazyRoute<T extends React.ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(() =>
    factory().catch(async (err) => {
      if (!isChunkError(err)) throw err;
      await new Promise((r) => setTimeout(r, 400));
      try { return await factory(); } catch (err2) {
        if (reloadOnce(err2)) return new Promise<never>(() => {}); // page is reloading; keep the spinner
        throw err2;
      }
    }),
  );
}

class Boundary extends React.Component<{ route: string; children: React.ReactNode }, { error: unknown }> {
  state = { error: null as unknown };
  static getDerivedStateFromError(error: unknown) { return { error }; }
  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    if (isChunkError(error) && reloadOnce(error)) return;
    captureException(error, { route: this.props.route, componentStack: info.componentStack?.slice(0, 2000) });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main role="alert" className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f5f5f7] px-6 text-center">
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold tracking-tight text-[#1d1d1f]">This page hit a snag.</h1>
        <p className="mt-3 max-w-md text-[17px] text-[#6e6e73]">It's been reported to us automatically. A reload usually fixes it.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => location.reload()} className="k-pill k-pill-brand">Reload the page</button>
          <a href="/" className="k-pill k-pill-light">Go to the home page</a>
        </div>
      </main>
    );
  }
}

/** One boundary per route: keyed by path so navigating away clears a crashed page. */
export const RouteBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return <Boundary key={pathname} route={pathname}>{children}</Boundary>;
};

/** Last-resort boundary around everything (providers included). */
export const AppBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => <Boundary route="app">{children}</Boundary>;
