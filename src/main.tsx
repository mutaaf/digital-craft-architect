
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './utils/sentry'

// Initialize Sentry
// Replace 'YOUR_SENTRY_DSN' with your actual Sentry DSN when in production
if (import.meta.env.PROD) {
  initSentry(
    import.meta.env.VITE_SENTRY_DSN || '',
    import.meta.env.MODE,
    import.meta.env.VITE_APP_VERSION || '1.0.0'
  );
}

createRoot(document.getElementById("root")!).render(<App />);
