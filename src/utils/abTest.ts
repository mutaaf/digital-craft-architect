import { trackEvent } from './analytics';

export type Variant = 'a' | 'b';

const STORAGE_KEY = 'dca_landing_variant';
const QUERY_KEY = 'v';
const EXPOSURE_KEY = 'dca_variant_exposure';

const isValid = (v: string | null): v is Variant => v === 'a' || v === 'b';

const readQuery = (): Variant | null => {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get(QUERY_KEY);
  return isValid(v) ? v : null;
};

const readStorage = (): Variant | null => {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isValid(v) ? v : null;
  } catch {
    return null;
  }
};

const writeStorage = (v: Variant): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
};

const assignRandom = (): Variant => (Math.random() < 0.5 ? 'a' : 'b');

export const resolveVariant = (): Variant => {
  const fromQuery = readQuery();
  if (fromQuery) {
    writeStorage(fromQuery);
    return fromQuery;
  }
  const fromStorage = readStorage();
  if (fromStorage) return fromStorage;
  const assigned = assignRandom();
  writeStorage(assigned);
  return assigned;
};

export const setVariant = (v: Variant): void => {
  writeStorage(v);
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

export const trackVariantExposure = (v: Variant): void => {
  if (typeof window === 'undefined') return;
  try {
    const last = window.sessionStorage.getItem(EXPOSURE_KEY);
    if (last === v) return;
    window.sessionStorage.setItem(EXPOSURE_KEY, v);
  } catch {
    /* ignore */
  }
  trackEvent('ab_variant_view', 'experiment', `landing_v2:${v}`);
};

export const trackVariantConversion = (name: string, variant: Variant): void => {
  trackEvent('ab_variant_conversion', 'experiment', `landing_v2:${variant}:${name}`);
};
