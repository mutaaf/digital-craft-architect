// Shared wrapper for the single Formspree endpoint used by every lead form on
// the site. Centralizes the URL + JSON headers, and — critically — short-circuits
// on localhost so `npm run dev` / `npm run preview` (and any agent that drives
// either) cannot pollute the real inbox. Returns a Response so existing call
// sites keep using `res.ok` unchanged; the localhost path returns a synthetic
// 200 to preserve the success-UX branch.

const FORMSPREE_URL = 'https://formspree.io/f/xovekqqk';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTS.has(window.location.hostname);
}

export async function submitLead(payload: Record<string, unknown>): Promise<Response> {
  if (isLocalHost()) {
    return new Response(null, { status: 200, statusText: 'OK (localhost skipped)' });
  }
  return fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
