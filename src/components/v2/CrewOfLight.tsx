import React, { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import lock from '@/vendor/aurora-field.json';

// Crew of Light: the CTO hero's stage. aurora-field (vendored, see scripts/aurora-field.mjs)
// draws each trade we build for on a blank canvas with a pen of light, an AI signal runs
// through the drawing, and it fills into a lit body; then the next trade. The library loads
// after first paint, so the headline stays the LCP element. The V2 page is always dark, so
// this has no light-mode variant.

export const TRADES = ['contractor', 'plumber', 'electrician', 'roofer', 'manager', 'realtor'] as const;
export type Trade = (typeof TRADES)[number];

// What the AI did for each trade. Copy stays inside what the site already claims (METRICS,
// OUTCOMES, the demos), with no client names.
const CAPTIONS: Record<Trade, { who: string; did: string }> = {
  contractor: { who: 'Contractor', did: 'Lead response · under 60s' },
  plumber: { who: 'Plumber', did: 'Estimate sent · under an hour' },
  electrician: { who: 'Electrician', did: 'After-hours call · answered and booked' },
  roofer: { who: 'Roofer', did: 'Review request · sent after the job' },
  manager: { who: 'Property manager', did: 'Ops hours reclaimed · 20 hr/wk' },
  realtor: { who: 'Realtor', did: 'Deal analyzed · comps and an offer' },
};
const CREW_LINE = 'Your whole crew · on autopilot';

const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.js`;
const DRAWN_TO_LIT_MS = 650;
const HOLD_LIT_MS = 3600;
const HOLD_CREW_MS = 4500;
// one person fills the stage; the whole crew needs room for six
const SOLO = (w: number, h: number) => Math.min(w * 0.6, h * 0.46);
const GROUP = (w: number, h: number) => Math.min(w * 0.44, h * 0.36);

type Vec = { x: number; y: number; z: number };
interface Field {
  set(options: Record<string, unknown>): Field;
  setShape(name: string, opts?: { pin?: boolean | number }): Field;
  trace(): Field;
  signal(at?: string, hops?: number, count?: number): Field;
  anchors(): Record<string, Vec>;
  on(event: string, fn: (arg: string) => void): Field;
  stats(): { reduced: boolean };
  destroy(): void;
}
declare global {
  interface Window {
    AuroraField?: { create(canvas: HTMLCanvasElement, options: Record<string, unknown>): Field };
  }
}

let loading: Promise<void> | null = null;
function loadLibrary(): Promise<void> {
  if (window.AuroraField) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('aurora-field failed to load')); };
      document.head.appendChild(s);
    });
  }
  return loading;
}
const afterPaint = (fn: () => void) => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout: 1500 });
  else window.setTimeout(fn, 400);
};

// bone light, copper props, an aurora-teal AI signal: DigitalCraft's palette with the founder site's accent
const PALETTE = {
  point: [244, 239, 230], accent: [201, 110, 44], signal: [123, 227, 195], head: [200, 255, 236],
  glow: [62, 143, 122], glow2: [24, 30, 32], fog: [38, 36, 34], hot: '#FFFFFF', star: '#E6E2D6',
};

interface Props {
  /** A trade to show now (headline hover); null hands the stage back to the loop. */
  focus?: Trade | null;
}

const CrewOfLight: React.FC<Props> = ({ focus = null }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const api = useRef<{ draw: (t: Trade, hold?: boolean) => void; resume: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState<Trade | 'all'>('contractor');
  const [lit, setLit] = useState(false);

  useEffect(() => {
    let field: Field | null = null;
    let dead = false;
    let timer = 0;
    let idx = 0;
    let held = false;
    let shownAt = 0;
    let still = false; // prefers-reduced-motion: no pen, just the lit people
    const t0 = performance.now();
    const clear = () => window.clearTimeout(timer);
    const later = (ms: number, fn: () => void) => { clear(); timer = window.setTimeout(fn, ms); };

    const draw = (t: Trade, hold = false) => {
      if (!field) return;
      held = hold;
      idx = TRADES.indexOf(t);
      clear();
      setCurrent(t);
      field.set({ radius: SOLO });
      if (still) { field.setShape(`crew:${t}:lit`, { pin: 60000 }); setLit(true); return; }
      setLit(false);
      field.setShape(`crew:${t}:line`, { pin: 60000 }).trace();
    };
    const crew = () => {
      if (!field) return;
      setCurrent('all'); setLit(true);
      field.set({ radius: GROUP });
      field.setShape('crew:all', { pin: 60000 }).signal(undefined, 30, 10);
      if (!still) later(HOLD_CREW_MS, () => draw(TRADES[0]));
    };
    const next = () => { if (held || document.hidden) return later(HOLD_LIT_MS, next); return idx + 1 < TRADES.length ? draw(TRADES[idx + 1]) : crew(); };
    api.current = { draw, resume: () => { if (!held) return; held = false; if (still) crew(); else later(HOLD_LIT_MS, next); } };

    afterPaint(() => {
      loadLibrary().then(() => {
        if (dead || !window.AuroraField || !canvasRef.current || !stageRef.current) return;
        const narrow = window.innerWidth < 768;
        try {
          field = window.AuroraField.create(canvasRef.current, {
            container: stageRef.current, crew: true, blank: true, cycle: 0, seed: 7,
            shapes: TRADES.flatMap((t) => [`crew:${t}:line`, `crew:${t}:lit`]).concat('crew:all'),
            initial: 'crew:contractor:line', radius: SOLO, count: narrow ? 2000 : 5600, stars: narrow ? 40 : 90,
            palette: PALETTE, autonomy: 0.45, depth: 3.2, interactive: !narrow,
            light: { ambient: 0.18, key: 1.35, rim: 0.95, spec: 0.8, shine: 14 },
          });
        } catch {
          return; // no canvas support: the static copper glow stays as the hero's poster
        }
        if (field.stats().reduced) { still = true; crew(); setReady(true); return; }
        field.on('traced', (name) => {
          if (!field || !name.endsWith(':line')) return;
          field.signal('head', 40, 6);
          later(DRAWN_TO_LIT_MS, () => {
            if (!field) return;
            field.setShape(name.replace(':line', ':lit'), { pin: 60000 }).signal('chest', 30, 8);
            setLit(true);
            if (!shownAt) { shownAt = performance.now(); trackEvent('crew_hero_ready', 'engagement', `${Math.round(shownAt - t0)}ms`); }
            later(HOLD_LIT_MS, next);
          });
        });
        // the caption rides the figure: anchored beside its chest, kept inside the stage
        field.on('frame', () => {
          const el = captionRef.current, st = stageRef.current;
          if (!field || !el || !st) return;
          const a = field.anchors(), c = a.chest || a['2.chest'];
          if (!c) return;
          const x = Math.min(st.clientWidth - el.offsetWidth - 8, Math.max(8, c.x + st.clientWidth * 0.16)), y = Math.max(8, c.y - 24);
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        api.current?.draw('contractor');
        setReady(true);
      }).catch(() => { /* offline or blocked: the poster stays */ });
    });
    return () => { dead = true; clear(); field?.destroy(); field = null; api.current = null; };
  }, []);

  // headline hover: jump to that trade and hold it; let go and the loop carries on
  useEffect(() => {
    if (!ready || !api.current) return;
    if (focus) api.current.draw(focus, true);
    else api.current.resume();
  }, [focus, ready]);

  const caption = current === 'all' ? null : CAPTIONS[current];
  return (
    <div
      ref={stageRef}
      className="relative h-full w-full"
      role="img"
      aria-label="Animated illustration: a contractor, plumber, electrician, roofer, property manager and realtor, each drawn in light and then lit up by AI"
      onPointerDown={() => trackEvent('crew_hero_interact', 'engagement', String(current))}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" style={{ touchAction: 'pan-y' }} />
      <div
        ref={captionRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 hidden transition-opacity duration-500 md:block"
        style={{ opacity: ready && lit && caption ? 1 : 0 }}
      >
        {caption && (
          <div className="rounded-sm border border-white/10 bg-ink/70 px-3 py-2 backdrop-blur-sm">
            <div className="v2-mono flex items-center gap-2 text-[10px] text-bone/55">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#7BE3C3', boxShadow: '0 0 8px #7BE3C3' }} />
              {caption.who}
            </div>
            <div className="mt-1 font-mono text-[12px] uppercase tracking-wider text-bone">{caption.did}</div>
          </div>
        )}
      </div>
      <div
        className="v2-mono pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-bone/60 transition-opacity duration-500"
        style={{ opacity: ready && current === 'all' ? 1 : 0 }}
      >
        {CREW_LINE}
      </div>
      <div className="absolute -bottom-9 left-0 right-0 hidden flex-wrap justify-center gap-x-3 gap-y-1 md:flex" style={{ opacity: ready ? 1 : 0 }}>
        {TRADES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { api.current?.draw(t); trackEvent('crew_hero_interact', 'engagement', `pick:${t}`); }}
            aria-pressed={current === t}
            className={`font-mono text-[10px] uppercase tracking-wider transition ${current === t ? 'text-copper' : 'text-bone/40 hover:text-bone/80'}`}
          >
            {CAPTIONS[t].who}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CrewOfLight;
