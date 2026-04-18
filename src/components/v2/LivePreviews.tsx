import React, { useEffect, useRef, useState } from 'react';

/* ----------------------------- reveal-on-scroll ----------------------------- */
export const useInView = <T extends Element>(
  opts: IntersectionObserverInit = { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
) => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      opts
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
};

/* ----------------------------- live pulse dot ----------------------------- */
export const LivePulse: React.FC<{ label?: string }> = ({ label = 'LIVE' }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-copper" />
    </span>
    <span className="v2-mono text-[10px] text-copper">{label}</span>
  </span>
);

/* ----------------------------- typing preview ----------------------------- */
interface TypingProps {
  lines: string[];
  className?: string;
}
export const TypingPreview: React.FC<TypingProps> = ({ lines, className }) => {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = lines[i % lines.length];
    const speed = del ? 28 : 55;
    const hold = del ? 0 : 1600;

    const t = setTimeout(() => {
      if (!del && txt.length < current.length) {
        setTxt(current.slice(0, txt.length + 1));
      } else if (!del && txt.length === current.length) {
        setTimeout(() => setDel(true), hold);
      } else if (del && txt.length > 0) {
        setTxt(current.slice(0, txt.length - 1));
      } else if (del && txt.length === 0) {
        setDel(false);
        setI((x) => x + 1);
      }
    }, speed);

    return () => clearTimeout(t);
  }, [txt, del, i, lines]);

  return (
    <div className={`font-mono text-[13px] leading-relaxed text-bone/85 ${className || ''}`}>
      <span>{txt}</span>
      <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-copper align-middle" />
    </div>
  );
};

/* ----------------------------- waveform preview ----------------------------- */
export const WaveformPreview: React.FC<{ bars?: number }> = ({ bars = 36 }) => {
  const heights = React.useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => {
        const base = Math.sin(i * 0.55) * 0.5 + 0.5;
        const jitter = Math.random() * 0.4;
        return 20 + (base * 0.6 + jitter * 0.4) * 72;
      }),
    [bars]
  );
  return (
    <div
      className="flex items-center gap-[3px]"
      aria-label="Voice AI waveform"
      role="img"
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-full bg-copper/80"
          style={{
            height: `${h}px`,
            animation: `v2-wave ${700 + (i % 7) * 90}ms ease-in-out ${i * 40}ms infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

/* ----------------------------- ticker preview ----------------------------- */
interface TickerProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}
export const TickerPreview: React.FC<TickerProps> = ({
  target,
  prefix = '',
  suffix = '',
  duration = 1800,
}) => {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="v2-display text-copper">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ----------------------------- comps pipeline ----------------------------- */
const COMPS = [
  { addr: '412 Maple Dr',    val: '$428,000', cap: '6.1%' },
  { addr: '1201 N Oak Ave',  val: '$451,500', cap: '5.8%' },
  { addr: '85 Cedar Ln',     val: '$419,200', cap: '6.4%' },
  { addr: '7 Chestnut Ct',   val: '$463,800', cap: '5.6%' },
];
export const CompsPreview: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [rows, setRows] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (rows >= COMPS.length) return;
    const t = setTimeout(() => setRows((r) => r + 1), 320);
    return () => clearTimeout(t);
  }, [inView, rows]);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-bone/40">
        <span>Comp</span>
        <span>Value</span>
      </div>
      {COMPS.slice(0, rows).map((c, i) => (
        <div
          key={c.addr}
          className="flex items-center justify-between border-b border-white/5 py-1.5 font-mono text-[12px] text-bone/85"
          style={{ animation: `v2-rise 420ms ${i * 40}ms both` }}
        >
          <span className="truncate text-bone/70">{c.addr}</span>
          <span className="text-copper">{c.val}</span>
        </div>
      ))}
    </div>
  );
};

/* ----------------------------- SMS preview ----------------------------- */
const SMS = [
  { side: 'out', body: 'Hey Alex — thanks for coming out Tuesday. Mind leaving a quick review?' },
  { side: 'in',  body: 'Yeah, absolutely. Best crew I\'ve worked with.' },
  { side: 'sys', body: '★★★★★ posted to Google · 00:47' },
];
export const SMSPreview: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || shown >= SMS.length) return;
    const t = setTimeout(() => setShown((x) => x + 1), 780);
    return () => clearTimeout(t);
  }, [inView, shown]);

  return (
    <div ref={ref} className="space-y-2">
      {SMS.slice(0, shown).map((m, i) => {
        const base =
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-[12px] leading-snug font-editorial';
        const style =
          m.side === 'out'
            ? 'ml-auto bg-copper/90 text-bone rounded-br-sm'
            : m.side === 'in'
            ? 'mr-auto bg-white/8 text-bone/90 rounded-bl-sm'
            : 'mx-auto bg-transparent text-bone/50 font-mono text-[10px] uppercase tracking-wider';
        return (
          <div
            key={i}
            className={`${base} ${style}`}
            style={{ animation: 'v2-rise 500ms both' }}
          >
            {m.body}
          </div>
        );
      })}
    </div>
  );
};

/* ----------------------------- estimator gauge ----------------------------- */
export const EstimatorPreview: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="v2-mono text-bone/50">Est. cost</span>
        <TickerPreview target={48750} prefix="$" />
      </div>
      <div className="h-[2px] w-full overflow-hidden bg-white/10">
        <div
          className="h-full bg-copper"
          style={{ animation: inView ? 'v2-sweep 1800ms cubic-bezier(0.22,1,0.36,1) both' : 'none' }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-bone/55">
        <span>SCOPE CALCULATED</span>
        <span className="text-copper">97% CONFIDENCE</span>
      </div>
    </div>
  );
};
