import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Pause, Play, RotateCcw } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';
import { visitorVertical } from '@/utils/visitorVertical';
import lock from '@/vendor/aurora-field.json';
import { TRADE_LABEL, defaultBoard, personalize, tradeForVertical, type Storyboard } from '../../../api/_scene/board';
import { beatMs, chapterOf, chapters, claimOf, narrate, transcript, type ChapterId, type Voice } from '../../../api/_scene/story';

// Crew of Light (tickets 0117-0119): the heroes' stage. aurora-field (vendored, see
// scripts/aurora-field.mjs) plays a storyboard in four acts: a trade's moment slips (the pen takes
// the drawing back), the builder briefs his agents, the same moment is caught and lit, the crew.
// Around it: a narrator's subtitles, a chapter rail you can jump through, pause (WCAG 2.2.2), and
// a trade picker that recasts the story's hero. The story is data from /api/scene (Edge Config,
// personalized to the visitor's trade), polled so an edit reaches open pages without a deploy;
// the bundled board plays until it answers. The library loads after first paint, so the headline
// stays the LCP element.

const SRC = `/vendor/aurora-field@${lock.version}/aurora-field.min.js`;
const LIVE_MS = 60_000;
const PICK_KEY = 'dca_story_trade';

interface Stage {
  load(board: Storyboard): { ok: boolean; errors: string[] };
  focus(trade: string | null): Stage;
  goto(beat: number): Stage;
  play(): Stage;
  pause(): Stage;
  on(event: string, fn: (e: { index?: number; phase?: string; beat?: { trade?: unknown } }) => void): Stage;
  readonly storyboard: Storyboard;
  readonly index: number;
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
const reducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const readPick = (): string | null => { try { return localStorage.getItem(PICK_KEY); } catch { return null; } };
const savePick = (t: string) => { try { localStorage.setItem(PICK_KEY, t); } catch { /* storage blocked: the pick lasts this visit */ } };

// The company site's visitors may have run a demo on their own company: its name heads their catch
const companyName = (): string | null => {
  for (const v of ['construction', 'realestate']) {
    try {
      const name = (JSON.parse(localStorage.getItem(`dca_demo_company_${v}`) || 'null') as { companyName?: string } | null)?.companyName;
      if (name && name !== 'DigitalCraft AI') return name.replace(/[—<>]/g, ' ').trim().slice(0, 32);
    } catch { /* not set, or not JSON */ }
  }
  return null;
};
function withCompany(board: Storyboard, name: string | null): Storyboard {
  if (!name) return board;
  const at = board.beats.findIndex((b) => 'trade' in b && !b.missed);
  return { ...board, beats: board.beats.map((b, i) => (i === at && b.caption ? { ...b, caption: { ...b.caption, who: name } } : b)) };
}

// bone light, an aurora-teal AI signal; the accent is the host's (copper on the CTO site, sky on the company site)
const PALETTES: Record<Voice, Record<string, unknown>> = {
  cto: { preset: 'ranger', point: [244, 239, 230], accent: [201, 110, 44], signal: [123, 227, 195], head: [200, 255, 236], glow: [62, 143, 122], glow2: [24, 30, 32], fog: [38, 36, 34] },
  root: { preset: 'ranger', point: [236, 244, 250], accent: [51, 195, 240], signal: [123, 227, 195], head: [210, 248, 255], glow: [40, 120, 150], glow2: [14, 24, 34], fog: [22, 32, 44] },
};
const ACCENT: Record<Voice, string> = { cto: 'text-copper', root: 'text-skyblue' };
const BAR: Record<Voice, string> = { cto: 'bg-copper', root: 'bg-skyblue' };
const TRADES = Object.keys(TRADE_LABEL);

export interface StoryState { index: number; phase: string; chapter: ChapterId; line: string; trade: string | null; claim: string | null }

interface Props {
  /** Which site: the CTO site (first person, copper) or the company site (we, sky). */
  host?: Voice;
  /** A trade to show now (headline hover); null hands the stage back to the story. */
  focus?: string | null;
  /** Each step of the story: the headline and the phone layout follow it. */
  onStory?: (s: StoryState) => void;
  /** 'desktop' hides the rail and subtitles on phones (the CTO hero shows the stage faintly behind its copy). */
  chrome?: 'always' | 'desktop';
  className?: string;
}

const CrewOfLight: React.FC<Props> = ({ host = 'cto', focus = null, onStory, chrome = 'always', className = '' }) => {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const bars = useRef<Record<string, HTMLSpanElement | null>>({});
  const clock = useRef({ beat: -1, t0: 0, est: 1, pausedAt: 0 });
  const story = useRef(onStory); story.current = onStory;
  const pick = useRef<string | null>(null);   // the visitor's chosen trade; the live board is cast with it too
  const [board, setBoard] = useState<Storyboard>(() => defaultBoard(host));
  const [at, setAt] = useState({ index: -1, phase: '' });
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [hero, setHero] = useState<string | null>(null);
  const still = useMemo(reducedMotion, []);

  const acts = useMemo(() => chapters(board, host), [board, host]);
  const lines = useMemo(() => transcript(board, host), [board, host]);
  const line = at.index >= 0 ? narrate(board, at.index, at.phase, host) : '';
  const act = at.index >= 0 && board.beats[at.index] ? chapterOf(board.beats[at.index]) : null;

  useEffect(() => {
    let dead = false, timer = 0, etag: string | null = null, shown = false, loops = 0;
    const t0 = performance.now();
    const vertical = visitorVertical(), picked = readPick();
    pick.current = (picked && TRADE_LABEL[picked] ? picked : null) || tradeForVertical(vertical);
    const company = host === 'root' ? companyName() : null;
    const src = `/api/scene?host=${host}${vertical ? `&vertical=${encodeURIComponent(vertical)}` : ''}`;
    const cast = (b: Storyboard) => withCompany(personalize(b, pick.current), company);
    const heroOf = (b: Storyboard) => { const m = b.beats.find((x) => 'trade' in x); return m && 'trade' in m && typeof m.trade === 'string' ? m.trade : null; };
    const pull = async () => {
      try {
        const res = await fetch(src, { headers: etag ? { 'If-None-Match': etag } : {} });
        if (res.status === 304 || !res.ok || dead) return;
        etag = res.headers.get('ETag');
        const next = cast((await res.json()) as Storyboard);
        if (stage.current && stage.current.load(next).ok) { setBoard(next); setHero(heroOf(next)); }
      } catch { /* offline or no API (local preview): the bundled board keeps playing */ }
    };
    afterPaint(() => {
      loadLibrary().then(() => {
        if (dead || !window.AuroraField || !canvas.current || !box.current) return;
        const narrow = window.innerWidth < 768, first = cast(defaultBoard(host));
        try {
          stage.current = window.AuroraField.stage(canvas.current, first, {
            container: box.current, palette: PALETTES[host], count: narrow ? 2000 : 5600, stars: narrow ? 40 : 80,
            interactive: !narrow, radius: (w: number, h: number) => Math.min(w * 0.6, h * 0.42),
            groupRadius: (w: number, h: number) => Math.min(w * 0.42, h * 0.34),   // the agents and the crew are wider than one person
          });
        } catch {
          return;   // no canvas support: the static glow stays as the hero's poster
        }
        setBoard(first); setHero(heroOf(first)); setReady(true);
        const st = stage.current;
        const step = (i: number, phase: string) => {
          const sb = st.storyboard, b = sb.beats[i];
          if (!b) return;
          setAt({ index: i, phase });
          story.current?.({ index: i, phase, chapter: chapterOf(b), line: narrate(sb, i, phase, host), trade: 'trade' in b && typeof b.trade === 'string' ? b.trade : null, claim: claimOf(b) });
        };
        st.on('beat', (e) => {
          const i = e.index ?? 0, b = st.storyboard.beats[i];
          clock.current = { beat: i, t0: performance.now(), est: b ? beatMs(b) : 1, pausedAt: 0 };
          if (still) step(i, 'hold');   // reduced motion holds one beat lit, with no phases: say what it shows
          if (b && (i === 0 || chapterOf(b) !== chapterOf(st.storyboard.beats[i - 1]))) trackEvent('story_chapter', 'engagement', `${host}:${chapterOf(b)}`);
          if (!shown) { shown = true; trackEvent('crew_hero_ready', 'engagement', `${Math.round(performance.now() - t0)}ms`); }
        });
        st.on('phase', (e) => step(e.index ?? 0, e.phase || ''));
        if (still && st.index >= 0) step(st.index, 'hold');   // a still stage shows its beat before anyone is listening
        st.on('loop', () => { loops++; if (loops === 1) trackEvent('story_complete', 'engagement', host); });
        pull();
        timer = window.setInterval(() => { if (!document.hidden) pull(); }, LIVE_MS);
      }).catch(() => { /* blocked: the poster stays */ });
    });
    return () => { dead = true; clearInterval(timer); stage.current?.destroy(); stage.current = null; };
  }, [host, still]);

  useEffect(() => { stage.current?.focus(focus); }, [focus]);

  // the rail: each chapter fills as its beats play (estimated from the board; the stage keeps its own time)
  useEffect(() => {
    if (!ready || still) return;
    let raf = 0;
    const tick = () => {
      const c = clock.current, sb = stage.current?.storyboard;
      if (sb && c.beat >= 0) {
        const now = c.pausedAt || performance.now(), act0 = acts.find((a) => c.beat >= a.first && c.beat <= a.last);
        for (const a of acts) {
          const el = bars.current[a.id + a.first];
          if (!el) continue;
          let f = 0;
          if (act0 === a) {
            let done = 0, total = 0;
            for (let i = a.first; i <= a.last; i++) { const ms = beatMs(sb.beats[i]); total += ms; if (i < c.beat) done += ms; }
            f = Math.min(1, (done + Math.min(c.est, now - c.t0)) / total);
          } else f = act0 && a.first < act0.first ? 1 : 0;
          el.style.transform = `scaleX(${f.toFixed(3)})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, still, acts]);

  const togglePause = () => {
    const st = stage.current; if (!st) return;
    const c = clock.current;
    if (paused) { st.play(); if (c.pausedAt) c.t0 += performance.now() - c.pausedAt; c.pausedAt = 0; }
    else { st.pause(); c.pausedAt = performance.now(); }
    setPaused(!paused);
    trackEvent('story_pause', 'engagement', `${host}:${paused ? 'play' : 'pause'}`);
  };
  const jump = (first: number, id: string) => {
    const st = stage.current; if (!st) return;
    if (paused) { st.play(); setPaused(false); }
    st.goto(first);
    trackEvent('story_jump', 'engagement', `${host}:${id}`);
  };
  const recast = (t: string) => {
    const st = stage.current; if (!st || !TRADE_LABEL[t]) return;
    savePick(t); pick.current = t;
    const next = withCompany(personalize(st.storyboard, t), host === 'root' ? companyName() : null);
    if (st.load(next).ok) { setBoard(next); setHero(t); st.goto(0); if (paused) { st.play(); setPaused(false); } }
    trackEvent('story_trade_pick', 'engagement', `${host}:${t}`);
  };

  const onPhone = chrome === 'desktop' ? 'hidden md:flex' : 'flex';
  return (
    <figure
      className={`relative flex h-full w-full flex-col ${chrome === 'desktop' ? '[&_.af-hud]:hidden md:[&_.af-hud]:block' : ''} ${className}`}
      aria-labelledby={`story-title-${host}`}
    >
      <div
        ref={box}
        className="relative min-h-0 flex-1"
        aria-hidden
        onPointerDown={() => trackEvent('crew_hero_interact', 'engagement', `${host}:${at.index}`)}
      >
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ touchAction: 'pan-y' }} />
      </div>

      {/* the narrator: one line at a time, under the stage, like subtitles */}
      <p
        aria-hidden
        className={`${onPhone} min-h-[3.2em] items-start justify-center px-2 text-center font-editorial text-[17px] italic leading-snug text-bone/85 transition-opacity duration-500 md:text-lg`}
        style={{ opacity: line ? 1 : 0 }}
      >
        <span key={line} className="story-line">{line}</span>
      </p>

      {/* the rail: four acts, jumpable; pause; the hero's trade */}
      <div className={`${onPhone} mt-2 flex-col gap-3`} style={{ opacity: ready ? 1 : 0, transition: 'opacity .6s ease' }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? 'Play the story' : 'Pause the story'}
            aria-pressed={paused}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-bone/20 text-bone/70 transition hover:border-bone/60 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <ol className="flex flex-1 gap-1.5" aria-label="Chapters">
            {acts.map((a) => (
              <li key={a.id + a.first} className="flex-1">
                <button
                  type="button"
                  onClick={() => jump(a.first, a.id)}
                  aria-current={act === a.id ? 'step' : undefined}
                  className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
                >
                  <span className="relative block h-[2px] overflow-hidden bg-bone/15">
                    <span
                      ref={(el) => { bars.current[a.id + a.first] = el; }}
                      className={`absolute inset-0 origin-left ${BAR[host]}`}
                      style={{ transform: still && act === a.id ? 'scaleX(1)' : 'scaleX(0)' }}
                    />
                  </span>
                  <span className={`mt-1.5 block font-mono text-[10px] uppercase tracking-wider transition ${act === a.id ? ACCENT[host] : 'text-bone/40 group-hover:text-bone/75'}`}>
                    {a.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <label className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bone/45">
          <span>Your trade</span>
          <span className="relative">
            <select
              value={hero || ''}
              onChange={(e) => recast(e.target.value)}
              className="cursor-pointer appearance-none rounded-full border border-bone/20 bg-transparent py-1 pl-3 pr-7 font-mono text-[10px] uppercase tracking-wider text-bone/85 transition hover:border-bone/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
            >
              {hero && !TRADE_LABEL[hero] && <option value={hero}>{hero}</option>}
              {TRADES.map((t) => <option key={t} value={t} className="bg-ink text-bone">{TRADE_LABEL[t]}</option>)}
            </select>
            <ChevronDown size={11} aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-bone/60" />
          </span>
          <button
            type="button"
            onClick={() => jump(0, 'replay')}
            aria-label="Watch from the start"
            className="grid h-6 w-6 place-items-center rounded-full text-bone/45 transition hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-bone"
          >
            <RotateCcw size={11} />
          </button>
        </label>
      </div>

      {/* the whole story, for screen readers (the canvas, subtitles and HUD are hidden from them) */}
      <figcaption className="sr-only">
        <span id={`story-title-${host}`}>
          An animated story drawn in light: a {hero ? (TRADE_LABEL[hero] || hero).toLowerCase() : 'tradesperson'} misses a moment that costs a job, AI agents are built and briefed, and the same moment is caught.
        </span>
        <ol>{lines.map((l, i) => <li key={i}>{l}</li>)}</ol>
      </figcaption>
    </figure>
  );
};

export default CrewOfLight;
