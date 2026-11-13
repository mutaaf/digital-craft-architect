const CTO_HOST_PREFIX = 'cto.';
const CTO_HOST_ENV: string | undefined = import.meta.env.VITE_CTO_HOST;

export const CTO_HOSTNAME = 'cto.digitalcraftai.com';
export const ROOT_HOSTNAME = 'digitalcraftai.com';

export const CTO_URL = `https://${CTO_HOSTNAME}`;
export const ROOT_URL = `https://${ROOT_HOSTNAME}`;

export const isCTOHost = (): boolean => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const override = params.get('force');
  if (override === 'cto') return true;
  if (override === 'root') return false;

  const hostname = window.location.hostname;
  if (CTO_HOST_ENV && hostname === CTO_HOST_ENV) return true;
  // cto-beta.digitalcraftai.com is the CTO site's beta (the `beta` branch)
  return hostname.startsWith(CTO_HOST_PREFIX) || hostname.startsWith('cto-beta.');
};

export const currentHostTag = (): 'cto' | 'root' =>
  isCTOHost() ? 'cto' : 'root';
