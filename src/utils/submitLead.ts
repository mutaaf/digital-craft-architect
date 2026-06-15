// Shared wrapper for the single Formspree endpoint used by every lead form on
// the site. Centralizes the URL + JSON headers, and — critically — short-circuits
// on localhost so `npm run dev` / `npm run preview` (and any agent that drives
// either) cannot pollute the real inbox. Returns a Response so existing call
// sites keep using `res.ok` unchanged; the localhost path returns a synthetic
// 200 to preserve the success-UX branch.
//
// E2E escape hatch: tests under tests/e2e/ that assert on the request body
// (currently only email-me-this-estimate.spec.ts) intercept the URL with
// page.route() and need the real fetch to fire. They set window.__E2E__ = true
// via addInitScript before navigation, which bypasses the localhost block.
// Production never sets this flag; the autonomous `verify` skill runs against
// the preview server without setting it either, so agents still get blocked.

const FORMSPREE_URL = 'https://formspree.io/f/xovekqqk';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

declare global {
  interface Window {
    __E2E__?: boolean;
  }
}

function shouldSkip(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.__E2E__) return false;
  return LOCAL_HOSTS.has(window.location.hostname);
}

export async function submitLead(payload: Record<string, unknown>): Promise<Response> {
  if (shouldSkip()) {
    return new Response(null, { status: 200, statusText: 'OK (localhost skipped)' });
  }
  return fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
