
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './utils/sentry'

// Initialize Sentry with the provided DSN
initSentry(
  "https://933c7f8e8c1171dcd8edfe0170ca50ad@o4509081884557312.ingest.us.sentry.io/4509081885474816",
  import.meta.env.MODE,
  import.meta.env.VITE_APP_VERSION || '1.0.0'
);

createRoot(document.getElementById("root")!).render(<App />);
