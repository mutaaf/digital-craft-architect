import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, RefreshCw, WifiOff, Wifi, Share, X, Phone, SquarePlus } from 'lucide-react';
import { applyUpdate, install, isIOS, isStandalone, pwaState, subscribePwa } from './pwa';
import { openTry } from './TrySheet';
import { CALENDLY, VERTICALS, domainOf } from './verticals';
import { trackEvent } from '@/utils/analytics';

// One bar for the installable app (after mutaafaziz.com's #pwabar): a quiet install offer on the
// third visit (once ever), "A new version is ready · Refresh", offline / back online, and the iOS
// Add to Home Screen steps. It also routes deep links: ?go=try|book|install|demos|<industry>,
// which the app's shortcuts, the web+digitalcraft: protocol and the launch queue all use.

const VISITS = 'dc_v3_visits';
const OFFERED = 'dc_v3_install_offered';
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* blocked */ } },
};

type Bar = null | 'install' | 'ios' | 'update' | 'offline' | 'online' | 'book';

export const showIosSteps = () => window.dispatchEvent(new CustomEvent('v3:ios-install'));

const PwaBar: React.FC = () => {
  const s = useSyncExternalStore(subscribePwa, pwaState, pwaState);
  const [bar, setBar] = useState<Bar>(null);
  const [dismissed, setDismissed] = useState<Bar[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // count visits (once per session) and offer the install on the third, once ever
  useEffect(() => {
    try {
      if (sessionStorage.getItem('dc_v3_counted')) return;
      sessionStorage.setItem('dc_v3_counted', '1');
    } catch { return; }
    const n = Number(ls.get(VISITS) || '0') + 1;
    ls.set(VISITS, String(n));
    if (n >= 3 && !ls.get(OFFERED) && !isStandalone()) {
      window.setTimeout(() => {
        if (pwaState().canInstall) { ls.set(OFFERED, '1'); setBar('install'); }
        else if (isIOS()) { ls.set(OFFERED, '1'); setBar('ios'); }
      }, 9000);
    }
  }, []);

  // ?go= deep links (shortcuts, protocol handler, shared links); the query is cleaned after routing
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    let go = q.get('go');
    if (!go) return;
    go = decodeURIComponent(go).replace(/^web\+digitalcraft:\/*/i, '').toLowerCase();
    q.delete('go');
    const rest = q.toString();
    navigate({ pathname: location.pathname, search: rest ? `?${rest}` : '' }, { replace: true });
    trackEvent('v3_go', 'pwa', go);
    const v = VERTICALS.find((x) => x.key === go || x.key === go?.split(':')[0]);
    if (go === 'try' || go.startsWith('try:')) openTry({ site: domainOf(go.slice(4)) });
    else if (go === 'book') setBar('book'); // a new tab needs a tap: popups never open on their own
    else if (go === 'install') { install().then((r) => { if (r === 'ios') setBar('ios'); }); }
    else if (go === 'demos') navigate('/demos');
    else if (v) navigate(go.includes(':demo') ? v.hub : v.path);
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  // a link the installed app was launched with (launch_handler: navigate-existing)
  useEffect(() => {
    const lq = (window as Window & { launchQueue?: { setConsumer(fn: (p: { targetURL?: string }) => void): void } }).launchQueue;
    lq?.setConsumer((p) => {
      if (!p.targetURL) return;
      const u = new URL(p.targetURL);
      if (u.origin === window.location.origin && u.pathname + u.search !== window.location.pathname + window.location.search) navigate(u.pathname + u.search);
    });
  }, [navigate]);

  // updates, offline, back online
  useEffect(() => { if (s.updateReady) setBar('update'); }, [s.updateReady]);
  useEffect(() => {
    if (s.offline) setBar('offline');
    else setBar((b) => { if (b === 'offline') { window.setTimeout(() => setBar((x) => (x === 'online' ? null : x)), 2500); return 'online'; } return b; });
  }, [s.offline]);
  useEffect(() => {
    const on = () => setBar('ios');
    window.addEventListener('v3:ios-install', on);
    return () => window.removeEventListener('v3:ios-install', on);
  }, []);

  if (!bar || dismissed.includes(bar)) return null;
  const close = () => { setDismissed((d) => [...d, bar]); setBar(null); };

  if (bar === 'ios') {
    return (
      <div className="v3-pwabar flex-col !items-stretch !gap-3 !p-5" role="dialog" aria-label="Add DigitalCraft to your Home Screen">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="v3-eyebrow mb-1">Install the app</div>
            <div className="font-semibold text-gray-900">Add DigitalCraft to your Home Screen</div>
          </div>
          <button onClick={close} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center text-gray-600"><X size={18} /></button>
        </div>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2"><span className="v3-mono text-aurora">1</span> Tap <Share size={16} className="inline text-aurora" /> Share in Safari&rsquo;s toolbar</li>
          <li className="flex items-center gap-2"><span className="v3-mono text-aurora">2</span> Choose <SquarePlus size={16} className="inline text-aurora" /> Add to Home Screen</li>
          <li className="flex items-center gap-2"><span className="v3-mono text-aurora">3</span> Tap Add. It opens full screen, like an app.</li>
        </ol>
      </div>
    );
  }

  const content: Record<Exclude<Bar, null | 'ios'>, React.ReactNode> = {
    install: (
      <>
        <Download size={18} className="shrink-0 text-aurora" />
        <span className="flex-1">Keep DigitalCraft one tap away. It works offline too.</span>
        <button className="v3-btn v3-btn-aurora !min-h-[38px] !px-4 text-sm" onClick={() => { install(); close(); trackEvent('v3_install', 'pwa', 'bar'); }}>Install</button>
      </>
    ),
    update: (
      <>
        <RefreshCw size={18} className="shrink-0 text-aurora" />
        <span className="flex-1">A new version is ready.</span>
        <button className="v3-btn v3-btn-aurora !min-h-[38px] !px-4 text-sm" onClick={applyUpdate}>Refresh</button>
      </>
    ),
    offline: (
      <>
        <WifiOff size={18} className="shrink-0 text-amber-300" />
        <span className="flex-1">Offline · still here. The live demos come back with the network.</span>
      </>
    ),
    online: (
      <>
        <Wifi size={18} className="shrink-0 text-aurora" />
        <span className="flex-1">Back online.</span>
      </>
    ),
    book: (
      <>
        <Phone size={18} className="shrink-0 text-aurora" />
        <span className="flex-1">Thirty minutes, no pitch.</span>
        <a className="v3-btn v3-btn-aurora !min-h-[38px] !px-4 text-sm" href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={close}>Book a call</a>
      </>
    ),
  };
  return (
    <div className="v3-pwabar" role="status">
      {content[bar]}
      {bar !== 'online' && (
        <button onClick={close} aria-label="Dismiss" className="grid h-10 w-10 shrink-0 place-items-center text-gray-500 hover:text-gray-900"><X size={16} /></button>
      )}
    </div>
  );
};

export default PwaBar;
