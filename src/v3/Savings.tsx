import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

// "What it's worth to you": the visitor's own numbers in, their outcome out. It's an estimate and
// says so; the assumptions are printed under it, and nothing here is a claim about a client.
const BOOK_RATE = 0.25;   // 1 in 4 recovered leads becomes a job
const AUTOMATED = 0.7;    // share of follow-up and paperwork the agents take over
const HOURLY = 50;        // what an owner's hour is worth
const WEEKS = 4.33;

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

interface Props { buildPrice?: number; monthly?: number; defaultJob?: number; jobLabel?: string; onAction?: () => void; actionLabel?: string; className?: string }

const Slider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; show: string; onChange: (n: number) => void }> = ({ id, label, value, min, max, step, show, onChange }) => (
  <div>
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="min-w-0 text-[17px] text-[#1d1d1f]">{label}</label>
      <span className="v3-num shrink-0 whitespace-nowrap text-[17px] font-semibold text-[#1d1d1f]">{show}</span>
    </div>
    <input id={id} type="range" className="v3-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

const Savings: React.FC<Props> = ({ buildPrice = 4999, monthly = 999, defaultJob = 3000, jobLabel = 'Your average job', onAction, actionLabel = 'See it on my company', className = '' }) => {
  const [missed, setMissed] = useState(6);
  const [job, setJob] = useState(defaultJob);
  const [hours, setHours] = useState(10);
  const touched = React.useRef(false);
  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    if (!touched.current) { touched.current = true; trackEvent('v3_savings_used', 'engagement', 'calculator'); }
  };

  const r = useMemo(() => {
    const revenue = missed * WEEKS * BOOK_RATE * job;
    const hoursBack = hours * AUTOMATED * WEEKS;
    const time = hoursBack * HOURLY;
    const value = revenue + time;
    const paybackWeeks = value > 0 ? (buildPrice + monthly) / (value / WEEKS) : Infinity;
    return { revenue, hoursBack, time, value, paybackWeeks, yearly: value * 12 - monthly * 12 - buildPrice };
  }, [missed, job, hours, buildPrice, monthly]);

  const payback = !isFinite(r.paybackWeeks) ? '—' : r.paybackWeeks < 1 ? 'under a week' : r.paybackWeeks < 9 ? `${Math.ceil(r.paybackWeeks)} weeks` : `${Math.ceil(r.paybackWeeks / WEEKS)} months`;

  return (
    <div className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${className}`}>
      <div className="space-y-7">
        <Slider id="sv-missed" label="Leads you miss a week" value={missed} min={0} max={30} step={1} show={String(missed)} onChange={touch(setMissed)} />
        <Slider id="sv-job" label={jobLabel} value={job} min={200} max={25000} step={100} show={money(job)} onChange={touch(setJob)} />
        <Slider id="sv-hours" label="Hours a week on follow-up & paperwork" value={hours} min={0} max={40} step={1} show={`${hours} h`} onChange={touch(setHours)} />
      </div>
      <div className="text-center md:text-left">
        <div className="mb-2 text-[17px] text-[#6e6e73]">Back in your business, every month</div>
        <div className="v3-num mb-6 text-[64px] font-semibold leading-none tracking-[-0.05em] text-aurora md:text-[88px]" aria-live="polite">{money(r.revenue + r.time)}</div>
        <div className="flex justify-center gap-10 md:justify-start">
          <div><div className="v3-num text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{Math.round(r.hoursBack)} h</div><div className="text-[14px] text-[#6e6e73]">of your time</div></div>
          <div><div className="v3-num text-[32px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{payback}</div><div className="text-[14px] text-[#6e6e73]">to pay for itself</div></div>
        </div>
        {onAction && <button type="button" onClick={onAction} className="k-pill k-pill-brand mt-8">{actionLabel} <ArrowRight size={17} /></button>}
        <p className="mt-6 text-[12px] leading-snug text-[#6e6e73]">
          An estimate from your numbers, not a promise. Assumes 1 in 4 recovered leads books, {Math.round(AUTOMATED * 100)}% of admin automated, your hour at ${HOURLY}, a {money(buildPrice)} build and {money(monthly)}/mo.
        </p>
      </div>
    </div>
  );
};

export default Savings;
