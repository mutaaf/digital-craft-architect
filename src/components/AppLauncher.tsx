import React, { useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';
import lock from '@/vendor/launcher.json';
import { trackCTAClick, trackEvent } from '@/utils/analytics';

// Ticket 0123 - the app launcher shared with mutaafaziz.com (github.com/mutaaf/launcher): one list of
// apps (Digital Craft AI, the CTO site, the founder's site, the games and apps), one ⌘K palette.
// Vendored and hash-locked like aurora-field (scripts/launcher.mjs); it loads after first paint, so
// the navbar never waits on it. Here it opens from a navbar button instead of the dock, because
// the bottom of the page already holds the sticky CTA and the chat bubble.

const SRC = `/vendor/launcher@${lock.version}/launcher.js`;
const CALENDLY = 'https://calendly.com/mutaaf';
// glyphs for the site's own rows (the inside of a 24×24 SVG; the launcher draws them in the accent)
const PHONE = '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
// the call opens in a new tab and counts as the navbar's own book_a_call does
const bookCall = (site: string) => () => { trackCTAClick('book_a_call', `app_launcher_${site}`); window.open(CALENDLY, '_blank', 'noopener'); };
const PLAY = '<path d="M8 5.5v13l10.5-6.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';

interface Mounted { open(): void; close(): void; destroy(): void }
declare global {
  interface Window {
    Launcher?: { mount(opts: Record<string, unknown>): Mounted | null };
  }
}

let loading: Promise<void> | null = null;
function loadLauncher(): Promise<void> {
  if (window.Launcher) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('launcher failed to load')); };
      document.head.appendChild(s);
    });
  }
  return loading;
}

// each site's skin and its own rows above the apps
const SITE = {
  root: {
    here: 'dc', theme: 'light', vars: { '--l-accent': '#33C3F0' },
    actions: [
      { name: 'Book a discovery call', tip: 'Thirty minutes, no pitch.', run: bookCall('root'), icon: PHONE, kw: 'call calendly meeting talk' },
      { name: 'Watch it work on your company', tip: 'Run the demos on your own website.', href: '/construction/demo', icon: PLAY, kw: 'demo try company website' },
    ],
  },
  cto: {
    here: 'cto', theme: 'dark', vars: { '--l-accent': '#C96E2C', '--l-panel': 'rgba(14,12,11,.97)' },
    actions: [
      { name: 'Book a discovery call', tip: 'Thirty minutes, no pitch.', run: bookCall('cto'), icon: PHONE, kw: 'call calendly meeting talk engage' },
    ],
  },
} as const;

interface Props {
  site: keyof typeof SITE;
  className?: string;
  size?: number;
}

const AppLauncher: React.FC<Props> = ({ site, className = '', size = 18 }) => {
  const button = useRef<HTMLButtonElement>(null);
  const mounted = useRef<Mounted | null>(null);
  const wantOpen = useRef(false);
  const mountNow = useRef<() => void>(() => {});

  useEffect(() => {
    let gone = false;
    const mount = () => loadLauncher().then(() => {
      if (gone || mounted.current || !button.current || !window.Launcher) return;
      const s = SITE[site];
      mounted.current = window.Launcher.mount({
        trigger: button.current, here: s.here, theme: s.theme, vars: s.vars,
        actions: s.actions.map((a) => ({ ...a })),
        onOpen: () => trackEvent('app_launcher_open', 'engagement', site),
        onLaunch: (a: { id: string }) => trackEvent('app_launch', 'engagement', `${site}:${a.id}`),
      });
      if (wantOpen.current) { wantOpen.current = false; mounted.current?.open(); }
    }).catch(() => { /* the button stays a no-op; the rest of the navbar is unaffected */ });
    mountNow.current = () => { void mount(); };
    // after first paint, so ⌘K works without a click; a click before then loads it at once
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(mount, { timeout: 2500 }); else window.setTimeout(mount, 800);
    return () => { gone = true; mounted.current?.destroy(); mounted.current = null; };
  }, [site]);

  return (
    <button
      ref={button}
      type="button"
      aria-label="Apps"
      aria-keyshortcuts="Meta+K Control+K /"
      title="Apps (⌘K)"
      onClick={() => { if (!mounted.current) { wantOpen.current = true; mountNow.current(); } }}
      className={`inline-flex items-center justify-center rounded-full transition-colors ${className}`}
    >
      <LayoutGrid size={size} aria-hidden />
    </button>
  );
};

export default AppLauncher;
