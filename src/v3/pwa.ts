// The installable app (after mutaafaziz.com's): a service worker registered after load in production
// builds, the browser's install prompt (or the iOS Share → Add to Home Screen steps), the share sheet,
// "a new version is ready", and online/offline. One small store; src/v3/PwaBar.tsx draws it.

type BIPEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export interface PwaState {
  canInstall: boolean;      // the browser holds an install prompt (single use)
  installed: boolean;       // running as the installed app, or installed this session
  updateReady: boolean;     // a new service worker is waiting
  offline: boolean;
}

let deferred: BIPEvent | null = null;
let waiting: ServiceWorker | null = null;
let state: PwaState = {
  canInstall: false,
  installed: false,
  updateReady: false,
  offline: typeof navigator !== 'undefined' && navigator.onLine === false,
};
const listeners = new Set<() => void>();
const set = (patch: Partial<PwaState>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };

export const pwaState = () => state;
export const subscribePwa = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  ((typeof window.matchMedia === 'function' && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches)) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export const isIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Install: the browser's prompt when it has one. Returns 'ios' when the visitor must use Share → Add to Home Screen. */
export async function install(): Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'> {
  if (deferred) {
    const d = deferred;
    deferred = null;
    set({ canInstall: false }); // a prompt is single-use: the entries hide until the browser offers again
    await d.prompt();
    const { outcome } = await d.userChoice;
    if (outcome === 'accepted') set({ installed: true });
    return outcome;
  }
  if (isIOS() && !isStandalone()) return 'ios';
  return 'unavailable';
}

/** Share: the share sheet when there is one, else copy the link. */
export async function share(data: { title?: string; text?: string; url?: string } = {}): Promise<'shared' | 'copied' | 'failed'> {
  const payload = {
    title: data.title ?? document.title,
    text: data.text ?? 'AI that answers, quotes and follows up for real-world businesses. Try it on your own company.',
    url: data.url ?? window.location.href.replace(/[?&](go|source)=[^&]*/g, ''),
  };
  try {
    if (navigator.share) { await navigator.share(payload); return 'shared'; }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'failed';
  }
  try { await navigator.clipboard.writeText(payload.url); return 'copied'; } catch { return 'failed'; }
}

export function applyUpdate() {
  if (!waiting) { window.location.reload(); return; }
  waiting.postMessage({ type: 'SKIP_WAITING' });
}

let registered = false;
export function registerPwa() {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  if (isStandalone()) set({ installed: true });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    set({ canInstall: true });
  });
  window.addEventListener('appinstalled', () => { deferred = null; set({ installed: true, canInstall: false }); });
  window.addEventListener('online', () => set({ offline: false }));
  window.addEventListener('offline', () => set({ offline: true }));

  // the CTO site installs as its own app
  if (window.location.hostname.startsWith('cto')) {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.setAttribute('href', '/app-cto.webmanifest');
  }

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const go = () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const track = (sw: ServiceWorker | null) => {
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // installed with a controller already in place = an update, not the first install
          if (sw.state === 'installed' && navigator.serviceWorker.controller) { waiting = sw; set({ updateReady: true }); }
        });
      };
      if (reg.waiting && navigator.serviceWorker.controller) { waiting = reg.waiting; set({ updateReady: true }); }
      reg.addEventListener('updatefound', () => track(reg.installing));
      // look for a new version when the app comes back to the foreground
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => { /* no worker: the site works exactly as before */ });

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading || !waiting) return;
      reloading = true;
      window.location.reload();
    });
  };
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
}
