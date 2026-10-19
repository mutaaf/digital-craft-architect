import React, { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/utils/analytics';
import { visitorVertical } from '@/utils/visitorVertical';
import lock from '@/vendor/aurora-field.json';
import { DEFAULT_STORYBOARD, TRADE_LABEL, personalize, tradeForVertical, type Storyboard } from '../../../api/_scene/board';

// Crew of Light (ticket 0117): the CTO hero's stage. aurora-field (vendored, see
// scripts/aurora-field.mjs) plays a storyboard: a trade drawn by a pen of light, the moment
// their business slipped, the AI catching it, light filling the drawing, the outcome. The
// story is data from /api/scene (Edge Config, personalized to the visitor's trade), polled so
// an edit reaches open pages without a deploy; the bundled board plays until it answers.
// The library loads after first paint, so the headline stays the LCP element. The V2 page is
// always dark, so this has no light-mode variant.

const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.min.js`;
const LIVE_MS = 60_000;

interface Stage {
  load(board: Storyboard): { ok: boolean; errors: string[] };
  focus(trade: string | null): Stage;
  on(event: string, fn: (e: { index?: number; phase?: string; beat?: { trade?: unknown } }) => void): Stage;
  readonly storyboard: Storyboard;
  destroy(): void;
}
declare global {
  interface Window {
    AuroraField?: { stage(canvas: HTMLCanvasElement, board: Storyboard, options: Record<string, unknown>): Stage; validate(board: unknown): { ok: boolean } };
  }
}

let loading: Promise<void> | null = null;
function loadLibrary(): Promise<void> {
  if (window.AuroraField) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC; s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('aurora-field failed to load')); };
      document.head.appendChild(s);
    });
  }
  return loading;
}
const afterPaint = (fn: () => void) => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout: 1500 }); else window.setTimeout(fn, 400);
};

// bone light, copper props, an aurora-teal AI signal: DigitalCraft's palette with the founder site's accent
const PALETTE = { preset: 'ranger', point: [244, 239, 230], accent: [201, 110, 44], signal: [123, 227, 195], head: [200, 255, 236], glow: [62, 143, 122], glow2: [24, 30, 32], fog: [38, 36, 34] };

interface Props {
  /** A trade to show now (headline hover); null hands the stage back to the story. */
  focus?: string | null;
}

const CrewOfLight: React.FC<Props> = ({ focus = null }) => {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const [trades, setTrades] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    let dead = false, timer = 0, etag: string | null = null, shown = false;
    const t0 = performance.now();
    const vertical = visitorVertical(), trade = tradeForVertical(vertical);
    const src = `/api/scene?host=cto${vertical ? `&vertical=${encodeURIComponent(vertical)}` : ''}`;
    const tradesOf = (b: Storyboard) => b.beats.flatMap((x) => ('trade' in x && typeof x.trade === 'string' ? [x.trade] : []));
    const pull = async () => {
      try {
        const res = await fetch(src, { headers: etag ? { 'If-None-Match': etag } : {} });
        if (res.status === 304 || !res.ok || dead) return;
        etag = res.headers.get('ETag');
        const board = (await res.json()) as Storyboard;
        if (stage.current && stage.current.load(board).ok) setTrades(tradesOf(board));
      } catch { /* offline or no API (local preview): the bundled board keeps playing */ }
    };
    afterPaint(() => {
      loadLibrary().then(() => {
        if (dead || !window.AuroraField || !canvas.current || !box.current) return;
        const narrow = window.innerWidth < 768, board = personalize(DEFAULT_STORYBOARD, trade);
        try {
          stage.current = window.AuroraField.stage(canvas.current, board, {
            container: box.current, palette: PALETTE, count: narrow ? 2000 : 5600, stars: narrow ? 40 : 80,
            interactive: !narrow, radius: (w: number, h: number) => Math.min(w * 0.6, h * 0.42),
          });
        } catch {
          return;   // no canvas support: the static copper glow stays as the hero's poster
        }
        setTrades(tradesOf(board));
        stage.current.on('beat', (e) => {
          const t = e.beat && typeof e.beat.trade === 'string' ? e.beat.trade : null;
          setCurrent(t);
          if (!shown) { shown = true; trackEvent('crew_hero_ready', 'engagement', `${Math.round(performance.now() - t0)}ms`); }
        });
        pull();
        timer = window.setInterval(() => { if (!document.hidden) pull(); }, LIVE_MS);
      }).catch(() => { /* blocked: the poster stays */ });
    });
    return () => { dead = true; clearInterval(timer); stage.current?.destroy(); stage.current = null; };
  }, []);

  useEffect(() => { stage.current?.focus(focus); }, [focus]);

  return (
    <div
      ref={box}
      className="relative h-full w-full"
      role="img"
      aria-label="Animated illustration: tradespeople drawn in light, each lit up by AI when a call or lead would have been missed"
      onPointerDown={() => trackEvent('crew_hero_interact', 'engagement', String(current))}
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" style={{ touchAction: 'pan-y' }} />
      <div className="absolute -bottom-9 left-0 right-0 hidden flex-wrap justify-center gap-x-3 gap-y-1 md:flex" style={{ opacity: trades.length ? 1 : 0 }}>
        {trades.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { stage.current?.focus(t); setTimeout(() => stage.current?.focus(null), 9000); trackEvent('crew_hero_interact', 'engagement', `pick:${t}`); }}
            aria-pressed={current === t}
            className={`font-mono text-[10px] uppercase tracking-wider transition ${current === t ? 'text-copper' : 'text-bone/40 hover:text-bone/80'}`}
          >
            {TRADE_LABEL[t] || t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CrewOfLight;
