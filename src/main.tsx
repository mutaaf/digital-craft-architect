
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './v3/v3.css'
import { isBetaHost } from './utils/beta'
import { registerPwa } from './v3/pwa'
import { initSentry } from './utils/sentry'
import './utils/utmTracker'
import { initBoxOfficeEvents } from './utils/boxoffice'

// Initialize Sentry with the provided DSN
initSentry(
  "https://933c7f8e8c1171dcd8edfe0170ca50ad@o4509081884557312.ingest.us.sentry.io/4509081885474816",
  isBetaHost() ? 'beta' : import.meta.env.MODE,
  import.meta.env.VITE_APP_VERSION || '1.0.0'
);

initBoxOfficeEvents();

createRoot(document.getElementById("root")!).render(<App />);

// the installable app: service worker after load (production builds only), install, share, updates
registerPwa();
