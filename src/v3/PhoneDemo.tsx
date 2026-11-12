import React, { useEffect, useRef, useState } from 'react';
import { CalendarCheck, ChevronLeft } from 'lucide-react';

// The product shot: a late-night lead answered and booked, played as a text thread on a phone.
// It's an illustration (the caption under it says so); the real thing is one click away (openTry).

type Line = { who: 'in' | 'out' | 'note' | 'booked'; text?: string; at: number };
export interface PhoneScript { contact: string; initials: string; inbound: string; reply: string; followIn: string; confirm: string; booked: string; bookedDetail: string }
export const DEFAULT_SCRIPT: PhoneScript = { contact: 'Sarah M.', initials: 'SM', inbound: 'Hi, our AC just quit. Can someone come out tomorrow?', reply: 'So sorry, that’s no fun tonight. I can get a tech to you tomorrow at 8 or 11 AM. Which works?', followIn: '8 is perfect', confirm: 'Done. You’re booked for 8:00 AM, diagnostic $89. Reply here anytime.', booked: 'Booked · Thu 8:00 AM', bookedDetail: 'AC diagnostic · $89 · on your calendar' };
const lines = (s: PhoneScript): Line[] => [
  { who: 'in', text: s.inbound, at: 600 },
  { who: 'note', text: 'Answered in 38 seconds', at: 2400 },
  { who: 'out', text: s.reply, at: 2600 },
  { who: 'in', text: s.followIn, at: 5200 },
  { who: 'out', text: s.confirm, at: 6800 },
  { who: 'booked', at: 8400 },
];
const LOOP = 14000;

const PhoneDemo: React.FC<{ className?: string; script?: PhoneScript }> = ({ className = '', script = DEFAULT_SCRIPT }) => {
  const SCRIPT = lines(script);
  const [t, setT] = useState(0);
  const [cycle, setCycle] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setT(LOOP); return; }
    let start = performance.now();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    const tick = (now: number) => {
      if (!visible) { start = now - t; }
      const el = now - start;
      if (el > LOOP) { start = now; setCycle((c) => c + 1); setT(0); } else setT(el);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = SCRIPT.filter((l) => t >= l.at);
  const next = SCRIPT.find((l) => t < l.at);
  const typing = next && next.who === 'out' && next.at - t < 1400;

  return (
    <figure ref={ref} className={`flex flex-col items-center ${className}`}>
      <div className="k-phone" aria-label={`Illustration: a late-night text from a new lead, answered in 38 seconds and ${script.booked.toLowerCase()}`} role="img">
        <div className="k-screen">
          {/* status bar + island */}
          <div className="relative flex h-[46px] shrink-0 items-center justify-between px-7 pt-1 text-[13px] font-semibold text-[#1d1d1f]">
            <span>9:14</span>
            <span className="absolute left-1/2 top-[10px] h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
            <span className="flex items-center gap-1" aria-hidden><span className="h-[9px] w-[16px] rounded-[3px] border border-[#1d1d1f] p-[1px]"><span className="block h-full w-3/4 rounded-[1px] bg-[#1d1d1f]" /></span></span>
          </div>
          {/* thread header */}
          <div className="flex shrink-0 flex-col items-center border-b border-[#e8e8ed] pb-2.5">
            <ChevronLeft size={22} className="absolute left-4 top-[58px] text-[var(--v3-aurora)]" aria-hidden />
            <span className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-[#a1a1a6] to-[#86868b] text-[15px] font-semibold text-white">{script.initials}</span>
            <span className="text-[11.5px] text-[#1d1d1f]">{script.contact} · new lead</span>
          </div>
          {/* the thread */}
          <div key={cycle} className="flex flex-1 flex-col justify-end gap-1.5 px-3 pb-4">
            {shown.map((l, i) => {
              if (l.who === 'note') return <div key={i} className="k-bub self-center !bg-transparent !p-0 text-center text-[11px] font-medium text-[var(--v3-aurora)]">{l.text}</div>;
              if (l.who === 'booked') return (
                <div key={i} className="k-bub mt-2 flex w-full max-w-none items-center gap-3 self-stretch rounded-[18px] border border-[#e8e8ed] bg-white px-3.5 py-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--v3-aurora-wash)] text-[var(--v3-aurora)]"><CalendarCheck size={19} /></span>
                  <span className="leading-tight"><span className="block text-[13.5px] font-semibold text-[#1d1d1f]">{script.booked}</span><span className="text-[12px] text-[#6e6e73]">{script.bookedDetail}</span></span>
                </div>
              );
              return <div key={i} className={`k-bub ${l.who === 'in' ? 'k-bub-in' : 'k-bub-out'}`}>{l.text}</div>;
            })}
            {typing && <div className="k-bub k-bub-out k-typing flex gap-1 !py-3" aria-hidden><span /><span /><span /></div>}
          </div>
        </div>
      </div>
      <figcaption className="mt-5 max-w-[34ch] text-balance text-center text-[13px] text-[#6e6e73]">Illustration. The real one runs on your company in 20 seconds.</figcaption>
    </figure>
  );
};

export default PhoneDemo;
