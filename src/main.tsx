
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './v3/v3.css'
import { isBetaHost } from './utils/beta'
import { registerPwa } from './v3/pwa'
import { initSentry } from './utils/sentry'
import { isCTOHost } from './utils/hostVariant'
import './utils/utmTracker'

// Which build is this? Shown in Sentry releases and on window.__DC_BUILD for support/debugging.
const BUILD = { commit: __BUILD_COMMIT__, builtAt: __BUILD_TIME__, env: isBetaHost() ? 'beta' : import.meta.env.MODE };
(window as unknown as { __DC_BUILD: typeof BUILD }).__DC_BUILD = BUILD;

// Monitoring hooks global errors now and loads its SDK once the page is idle (src/utils/sentry.ts).
initSentry(BUILD.env, BUILD.commit);

// The landing is a lazy chunk; start fetching it alongside React instead of after the first render.
if (location.pathname === '/' && new URLSearchParams(location.search).get('v') !== '2') {
  void (isCTOHost() ? import('./v3/Cto3') : import('./v3/Home3'));
}

createRoot(document.getElementById("root")!).render(<App />);

// the installable app: service worker after load (production builds only), install, share, updates
registerPwa();
