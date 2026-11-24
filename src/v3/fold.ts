import { useSyncExternalStore } from 'react';

// The form the screen is in, decided live (resize, viewport segments, device posture), the same
// device test mutaafaziz.com uses (its Work edition and launcher):
//  - phone:   phones, the iPhone Duo closed (its 466×678 cover), cover screens down to 280px
//  - tablet:  iPad and narrow windows
//  - desktop: wide windows
//  - open:    the iPhone Duo open (an iPhone screen 600pt+ on its short side, landscape), or any
//             foldable spanning two side-by-side segments: two pages, nothing on the hinge
//  - table:   half-folded with the hinge across (two segments stacked)
// `?duo` fakes the device on a desktop; `?fold=phone|tablet|desktop|open|table` forces a form.
export type Form = 'phone' | 'tablet' | 'desktop' | 'open' | 'table';
export interface FoldState {
  form: Form;
  duo: boolean;
  /** the hinge in CSS px from the left (open) or top (table); null when the screen is flat */
  hinge: { at: number; size: number } | null;
}

type Segments = { segments?: DOMRect[] };
const mm = (q: string) => typeof window.matchMedia === 'function' && window.matchMedia(q).matches;

const isDuo = (): boolean => {
  if (/[?&]duo\b/.test(window.location.search)) return true;
  const sa = Math.min(screen.width, screen.height);
  const sb = Math.max(screen.width, screen.height);
  return /iPhone/.test(navigator.userAgent) && (sa >= 600 || (Math.abs(sa - 466) <= 2 && Math.abs(sb - 678) <= 2));
};

function measure(): FoldState {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const duo = isDuo();
  const forced = new URLSearchParams(window.location.search).get('fold') as Form | null;
  const segs = (window as Window & { viewport?: Segments }).viewport?.segments;

  // a real hinge: the browser knows the segments
  if (segs && segs.length === 2) {
    const [a, b] = segs;
    if (b.left > a.left) return { form: 'open', duo, hinge: { at: a.right, size: Math.max(0, b.left - a.right) } };
    return { form: 'table', duo, hinge: { at: a.bottom, size: Math.max(0, b.top - a.bottom) } };
  }
  if (mm('(horizontal-viewport-segments: 2)')) return { form: 'open', duo, hinge: { at: w / 2, size: 0 } };
  if (mm('(vertical-viewport-segments: 2)')) return { form: 'table', duo, hinge: { at: h / 2, size: 0 } };

  if (forced === 'open') return { form: 'open', duo, hinge: { at: w / 2, size: 2 } };
  if (forced === 'table') return { form: 'table', duo, hinge: { at: h / 2, size: 2 } };
  if (forced === 'phone' || forced === 'tablet' || forced === 'desktop') return { form: forced, duo, hinge: null };

  // the Duo open: two pages either side of a hinge we can't measure, so 50% / 2px
  if (duo && w >= 600 && w > h * 1.1) return { form: 'open', duo, hinge: { at: w / 2, size: 2 } };
  if (w < 768) return { form: 'phone', duo, hinge: null };
  if (w < 1100) return { form: 'tablet', duo, hinge: null };
  return { form: 'desktop', duo, hinge: null };
}

let state: FoldState | null = null;
const listeners = new Set<() => void>();

function apply(s: FoldState) {
  const root = document.documentElement;
  root.dataset.fold = s.form;
  if (s.duo) root.dataset.duo = ''; else delete root.dataset.duo;
  if (s.hinge && s.form === 'open') {
    root.style.setProperty('--v3-hinge-l', `${s.hinge.at}px`);
    root.style.setProperty('--v3-hinge-w', `${s.hinge.size}px`);
  } else {
    root.style.removeProperty('--v3-hinge-l');
    root.style.removeProperty('--v3-hinge-w');
  }
}

function refresh() {
  const next = measure();
  if (state && next.form === state.form && next.duo === state.duo && next.hinge?.at === state.hinge?.at && next.hinge?.size === state.hinge?.size) return;
  state = next;
  apply(next);
  listeners.forEach((l) => l());
}

let wired = false;
function wire() {
  if (wired || typeof window === 'undefined') return;
  wired = true;
  refresh();
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh);
  ['(horizontal-viewport-segments: 2)', '(vertical-viewport-segments: 2)', '(device-posture: folded)'].forEach((q) => {
    try {
      const m = window.matchMedia(q);
      if (m.addEventListener) m.addEventListener('change', refresh);
    } catch { /* the browser doesn't know the query */ }
  });
  const vp = (window as Window & { viewport?: EventTarget }).viewport;
  try { vp?.addEventListener?.('segmentschange', refresh); } catch { /* not supported */ }
}

export function foldState(): FoldState {
  wire();
  return state ?? measure();
}

export function useFold(): FoldState {
  return useSyncExternalStore(
    (l) => { wire(); listeners.add(l); return () => listeners.delete(l); },
    () => foldState(),
    () => ({ form: 'desktop', duo: false, hinge: null }),
  );
}
