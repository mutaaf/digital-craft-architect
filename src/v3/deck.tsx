import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CornerDownLeft } from 'lucide-react';
import CrewOfLight, { type StoryState } from '@/components/v2/CrewOfLight';
import { trackCTAClick, trackEvent } from '@/utils/analytics';

// The instrument deck's parts (after mutaafaziz.com's cockpit, #mcck): one grid whose cells share
// hairlines, aurora brackets on the outer corners, a channel tag per cell (decoration, aria-hidden),
// gauges for numbers that are real, launch keys you can press with 1 2 3 4, and a scan line that
// sweeps the deck once when it first comes into view.

export const Tag: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span aria-hidden className={`v3-tag ${className}`}>{children}</span>
);

export const CellHead: React.FC<{ tag: string; title: React.ReactNode; aside?: React.ReactNode }> = ({ tag, title, aside }) => (
  <div className="mb-6 flex items-start justify-between gap-4">
    <div>
      <Tag className="mb-2 block">{tag}</Tag>
      <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
    </div>
    {aside}
  </div>
);

/** sweeps the deck once, the first time it scrolls into view */
export function useScanOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [scan, setScan] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setScan(true); io.disconnect(); window.setTimeout(() => setScan(false), 1800); }
    }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, scan };
}

/** a number that is real, with the ruler under it (the ticks are decoration, never data) */
export const Gauge: React.FC<{ value: React.ReactNode; label: string; note?: string; accent?: string }> = ({ value, label, note, accent = 'text-white' }) => (
  <div className="flex flex-col justify-between gap-4 bg-night-deck p-5 md:p-6">
    <div className={`text-[34px] font-semibold leading-none tracking-tight md:text-[44px] ${accent}`}>{value}</div>
    <div>
      <div className="v3-ruler mb-3" aria-hidden />
      <div className="text-sm text-gray-300">{label}</div>
      {note && <div className="v3-tag mt-1 !normal-case !tracking-normal text-gray-500">{note}</div>}
    </div>
  </div>
);

export interface LaunchKey { n: number; title: string; sub: string; to: string; external?: boolean }
/** four launch keys; while the row is on screen, 1 2 3 4 press them (never while typing or in a dialog) */
export const LaunchKeys: React.FC<{ keys: LaunchKey[]; where: string }> = ({ keys, where }) => {
  const row = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const [pressed, setPressed] = useState<number | null>(null);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; }, { threshold: 0.5 });
    io.observe(el);
    const key = (e: KeyboardEvent) => {
      if (!visible.current || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
      const k = keys.find((x) => String(x.n) === e.key);
      if (!k) return;
      const a = el.querySelector<HTMLAnchorElement>(`[data-key="${k.n}"]`);
      if (!a) return;
      setPressed(k.n);
      window.setTimeout(() => { setPressed(null); a.click(); }, 160);
    };
    window.addEventListener('keydown', key);
    return () => { io.disconnect(); window.removeEventListener('keydown', key); };
  }, [keys]);
  return (
    <div ref={row} className="col-span-12 grid grid-cols-2 gap-px bg-night-hair md:grid-cols-4">
      {keys.map((k) => {
        const inner = (
          <>
            <div className="flex items-center justify-between">
              <span className="v3-keycap" aria-hidden>{k.n}</span>
              <ArrowUpRight size={18} className="v3-arrow text-gray-500" />
            </div>
            <div>
              <div className="text-[17px] font-semibold text-white">{k.title}</div>
              <div className="mt-1 text-sm text-gray-400">{k.sub}</div>
            </div>
          </>
        );
        const props = {
          'data-key': k.n,
          'data-pressed': pressed === k.n ? '' : undefined,
          className: 'v3-key bg-night-deck',
          onClick: () => trackCTAClick(`v3_key_${k.n}`, where),
        };
        return k.external ? <a key={k.n} {...props} href={k.to}>{inner}</a> : <Link key={k.n} {...props} to={k.to}>{inner}</Link>;
      })}
    </div>
  );
};

export interface Rule { title: string; body: string; proof: string; proofLabel: string }
/** how the agents behave: one open at a time, each with a link to a page that shows it */
export const Rules: React.FC<{ rules: Rule[] }> = ({ rules }) => (
  <ul className="divide-y divide-night-hair border-y border-night-hair">
    {rules.map((r, i) => (
      <li key={r.title}>
        <details name="v3-rules" className="group" open={i === 0}>
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-3 py-2 text-[15px] text-gray-100 [&::-webkit-details-marker]:hidden">
            <span className="v3-dot shrink-0" aria-hidden />
            <span className="flex-1">{r.title}</span>
            <span className="v3-mono text-xs text-gray-600 transition-transform group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <div className="pb-4 pl-[18px] text-sm leading-relaxed text-gray-400">
            {r.body}{' '}
            <Link to={r.proof} className="whitespace-nowrap text-aurora hover:underline">{r.proofLabel} →</Link>
          </div>
        </details>
      </li>
    ))}
  </ul>
);

export interface Answer { q: string; a: React.ReactNode }
export interface Route { test: RegExp; answer: (q: string) => React.ReactNode }
/** "Ask this site anything": a regex router, not a model, and it says so. Contact intent stays first. */
export const AskPrompt: React.FC<{ routes: Route[]; chips: string[]; fallback: React.ReactNode; where: string; greeting: React.ReactNode }> = ({ routes, chips, fallback, where, greeting }) => {
  const [log, setLog] = useState<Answer[]>([]);
  const [q, setQ] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const hit = routes.find((r) => r.test.test(t));
    setLog((l) => [...l.slice(-5), { q: t, a: hit ? hit.answer(t) : fallback }]);
    setQ('');
    trackEvent('v3_ask', 'engagement', `${where}:${hit ? hit.test.source.slice(0, 40) : 'fallback'}`);
  };
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [log]);
  return (
    <div className="flex h-full flex-col">
      <div className="v3-mono mb-4 max-h-[280px] min-h-[150px] flex-1 space-y-3 overflow-y-auto pr-1 text-[13.5px] leading-relaxed" aria-live="polite">
        <div className="text-gray-400"><span className="text-aurora">dc</span> › {greeting}</div>
        {log.map((x, i) => (
          <div key={i} className="space-y-1">
            <div className="text-gray-500">you › <span className="text-gray-200">{x.q}</span></div>
            <div className="text-gray-300"><span className="text-aurora">dc</span> › {x.a}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="relative">
        <label htmlFor={`ask-${where}`} className="sr-only">Ask this site anything</label>
        <input id={`ask-${where}`} className="v3-input v3-mono pr-12 !text-[15px] md:!text-[14px]" style={{ fontSize: 16 }} placeholder="ask anything…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <button type="submit" className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-gray-400 hover:text-aurora" aria-label="Ask"><CornerDownLeft size={16} /></button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => <button key={c} type="button" onClick={() => ask(c)} className="v3-chip !min-h-[32px] !text-[13px]">{c}</button>)}
      </div>
    </div>
  );
};

/** the hero's stage: the Crew of Light storyboard in an instrument window that keeps the time */
export const StageWindow: React.FC<{ host: 'root' | 'cto'; label: string; className?: string; height?: string }> = ({ host, label, className = '', height = 'h-[460px] md:h-[600px]' }) => {
  const [story, setStory] = useState<StoryState | null>(null);
  const taps = useRef(0);
  const reset = useRef(0);
  const state = !story ? 'Live' : story.chapter === 'miss' ? 'Missed' : story.chapter === 'build' ? 'Building' : 'Caught';
  const tap = () => {
    // five taps on the window's header still open the easter egg
    taps.current += 1;
    window.clearTimeout(reset.current);
    if (taps.current >= 5) { taps.current = 0; window.dispatchEvent(new CustomEvent('hero-easter-egg-activated')); return; }
    reset.current = window.setTimeout(() => { taps.current = 0; }, 2000);
  };
  return (
    <div className={`v3-brackets relative border border-night-hair bg-[#090d10] ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: host === 'cto' ? 'radial-gradient(110% 60% at 70% 0%, rgba(201,110,44,0.13), transparent 60%)' : 'radial-gradient(110% 60% at 70% 0%, rgba(123,227,195,0.12), transparent 60%)' }} />
      <div className="relative flex items-center justify-between border-b border-night-hair px-4 py-2.5" onClick={tap}>
        <span className="v3-tag">{label}</span>
        <span className="v3-tag flex items-center gap-2" aria-hidden>
          <span className={`h-1.5 w-1.5 rounded-full ${state === 'Missed' ? 'bg-amber-400' : state === 'Caught' ? 'bg-aurora' : 'bg-[#e89862]'} animate-pulse`} />
          {state}
        </span>
      </div>
      <div className={`relative px-3 pb-3 ${height}`}>
        <CrewOfLight host={host} onStory={setStory} />
      </div>
    </div>
  );
};
