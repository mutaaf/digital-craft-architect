// Error + performance monitoring, loaded off the critical path (2026-11-18).
//
// Before: @sentry/react was imported by main.tsx and App.tsx, so ~60 KB of SDK parsed before the first
// paint on every page, and 100% of page loads were traced. Now this file is a tiny facade: calls made
// before the SDK arrives are queued, window errors and unhandled rejections are caught from the very
// first script, and the SDK is imported once the page is idle (or immediately on the first error).

type Level = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
type SentryMod = typeof import('@sentry/react');

const DSN = 'https://933c7f8e8c1171dcd8edfe0170ca50ad@o4509081884557312.ingest.us.sentry.io/4509081885474816';
const queue: Array<(s: SentryMod) => void> = [];
let mod: SentryMod | null = null;
let loading: Promise<SentryMod | null> | null = null;
let opts = { environment: 'production', release: 'dev' };

function run(fn: (s: SentryMod) => void) {
  if (mod) fn(mod);
  else { queue.push(fn); if (queue.length > 100) queue.shift(); }
}

export function loadSentry(): Promise<SentryMod | null> {
  if (loading) return loading;
  loading = import('@sentry/react')
    .then((S) => {
      S.init({
        dsn: DSN,
        environment: opts.environment,
        release: opts.release,
        integrations: [S.browserTracingIntegration()],
        // A sample is enough for Web Vitals and route timings; 100% burned quota for no extra signal.
        tracesSampleRate: opts.environment === 'production' ? 0.2 : 1.0,
        // Same-origin API calls carry the trace header, so a slow /api/* shows up in the trace.
        tracePropagationTargets: [/^\/api\//],
        ignoreErrors: [
          'TypeError: Failed to fetch',
          'TypeError: NetworkError when attempting to fetch resource',
          'TypeError: Load failed',
          'TypeError: cancelled',
          'AbortError',
          'Non-Error promise rejection captured',
          'ResizeObserver loop',
        ],
        denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i, /^safari-(web-)?extension:/i],
        normalizeDepth: 6,
      });
      S.setTag('host', location.hostname);
      mod = S;
      queue.splice(0).forEach((fn) => { try { fn(S); } catch { /* never let telemetry throw */ } });
      return S;
    })
    .catch(() => null); // blocked by an ad blocker or offline: the site works without it
  return loading;
}

/** Call once from main.tsx. Hooks global errors now, loads the SDK when the browser is idle. */
export function initSentry(environment: string, release: string): void {
  opts = { environment, release };
  if (import.meta.env.DEV) return;
  addEventListener('error', (e) => {
    if (!e.error) return; // resource load errors and cross-origin "Script error." carry nothing useful
    run((S) => S.captureException(e.error, { mechanism: { type: 'onerror', handled: false } }));
    loadSentry();
  });
  addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    run((S) => S.captureException(r instanceof Error ? r : new Error(String(r)), { mechanism: { type: 'onunhandledrejection', handled: false } }));
    loadSentry();
  });
  // `load` fires before React has even requested the route's own chunks, so wait a few seconds more:
  // the SDK (~150 KB) must never compete with the page's first paint. An error loads it at once.
  const later = () => setTimeout(() => (typeof requestIdleCallback === 'function' ? requestIdleCallback(() => loadSentry(), { timeout: 3000 }) : loadSentry()), 4000);
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
}

export const captureException = (error: unknown, context?: Record<string, unknown>, level: Level = 'error'): void => {
  if (import.meta.env.DEV) console.error('[monitoring]', error, context);
  run((S) => S.withScope((scope) => {
    scope.setLevel(level);
    if (context) Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    S.captureException(error);
  }));
  loadSentry();
};

export const captureMessage = (message: string, context?: Record<string, unknown>, level: Level = 'info'): void =>
  run((S) => S.withScope((scope) => {
    scope.setLevel(level);
    if (context) Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    S.captureMessage(message);
  }));

export const addBreadcrumb = (message: string, category?: string, level: Level = 'info', data?: Record<string, unknown>): void =>
  run((S) => S.addBreadcrumb({ message, category, level, data, timestamp: Date.now() / 1000 }));

export const setTags = (tags: Record<string, string>): void => run((S) => S.setTags(tags));
export const setContext = (name: string, data: Record<string, unknown>): void => run((S) => S.setContext(name, data));
