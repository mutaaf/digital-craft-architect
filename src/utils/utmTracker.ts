
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_PREFIX = 'dca_utm_';

// On import, capture UTM params from the URL and persist to sessionStorage
function captureUtmParams(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) {
        sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
      }
    }
  } catch {
    // sessionStorage may be unavailable (private browsing, etc.)
  }
}

captureUtmParams();

/**
 * Returns stored UTM parameters as a plain object.
 * Only includes keys that have a value.
 */
export function getUtmParams(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    for (const key of UTM_KEYS) {
      const value = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (value) {
        result[key] = value;
      }
    }
  } catch {
    // sessionStorage unavailable
  }
  return result;
}
