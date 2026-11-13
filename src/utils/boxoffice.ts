// Box Office (mutaafaziz.com/boxoffice) is the portfolio-wide analytics loader
// tagged at the end of index.html. It records page views on its own (SPA
// history changes included) and relays everything to PostHog through
// mutaafaziz.com, with the IP truncated, inputs masked and GPC/DNT honoured.
// Cast List maps digitalcraftai.com to "digital-craft" and
// cto.digitalcraftai.com to "fractional-cto"; any other host (localhost,
// previews) gets a no-op loader, so dev and e2e runs send nothing.
//
// This module adds the handful of conversion events Box Office cannot infer.
// It is queue-safe: a call made before the async script arrives is held in
// `q` and replayed by the loader. Never pass form contents, names, emails or
// company names here, only fixed labels. Google Analytics is untouched; this
// runs alongside it.

type BoxOffice = {
  q?: unknown[][];
  track: (name: string, props?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    boxoffice?: BoxOffice;
  }
}

export function boxofficeTrack(name: string, props: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.boxoffice ??= {
      q: [],
      track(...args: unknown[]) {
        this.q!.push(args);
      },
    };
    window.boxoffice.track(name, props);
  } catch {
    // Analytics must never break a page.
  }
}

/** "[Real Estate Lead] Acme" -> "real_estate_lead". The bracketed tag only. */
export function leadFormTag(subject: unknown): string {
  const tag = typeof subject === 'string' ? /^\[([^\]]+)\]/.exec(subject)?.[1] : undefined;
  return tag ? tag.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') : 'lead';
}

let listening = false;

/**
 * Strategy-call clicks. Calendly opens in a new tab, so the booking itself is
 * not visible from here; the click on any calendly.com link is the closest
 * honest signal, and it catches every booking link on the site at once. A
 * Calendly CTA that also calls trackCTAClick sends a cta_click as well:
 * dashboards should count booking intent from strategy_call_click only.
 */
export function initBoxOfficeEvents(): void {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="calendly.com"]');
      if (a) boxofficeTrack('strategy_call_click', { page: window.location.pathname });
    },
    { capture: true },
  );
}
