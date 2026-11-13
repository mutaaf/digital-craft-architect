// The overhaul runs at beta.digitalcraftai.com (root) and cto-beta.digitalcraftai.com (CTO), both
// served from the `beta` branch, while digitalcraftai.com stays on main. `?beta` fakes it anywhere.
export const BETA_HOSTS = ['beta.digitalcraftai.com', 'cto-beta.digitalcraftai.com'] as const;

export const isBetaHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return (BETA_HOSTS as readonly string[]).includes(h) || /[?&]beta\b/.test(window.location.search);
};

// the same page on the live site, for the badge's "current site" link
export const liveUrl = (): string => {
  if (typeof window === 'undefined') return 'https://digitalcraftai.com';
  const cto = window.location.hostname.startsWith('cto');
  return `https://${cto ? 'cto.' : ''}digitalcraftai.com${window.location.pathname}`;
};
