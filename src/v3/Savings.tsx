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

interface Props { buildPrice?: number; monthly?: number; onAction?: () => void; actionLabel?: string; className?: string }

const Slider: React.FC<{ id: string; label: string; value: number; min: number; max: number; step: number; show: string; onChange: (n: number) => void }> = ({ id, label, value, min, max, step, show, onChange }) => (
  <div>
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-[14.5px] text-gray-700">{label}</label>
      <span className="v3-num text-[17px] font-semibold text-gray-900">{show}</span>
    </div>
    <input id={id} type="range" className="v3-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

const Savings: React.FC<Props> = ({ buildPrice = 4999, monthly = 999, onAction, actionLabel = 'See it on my company', className = '' }) => {
  const [missed, setMissed] = useState(6);
  const [job, setJob] = useState(3000);
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
    <div className={`v3-card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-night-hair px-5 py-3.5 md:px-6">
        <span className="v3-eyebrow !text-[10.5px]">What it&rsquo;s worth to you</span>
        <span className="v3-eyebrow flex items-center gap-1.5 !text-[10.5px] !text-aurora"><span className="v3-dot" /> your numbers</span>
      </div>
      <div className="space-y-4 px-5 pb-2 pt-5 md:px-6">
        <Slider id="sv-missed" label="Leads you miss a week" value={missed} min={0} max={30} step={1} show={String(missed)} onChange={touch(setMissed)} />
        <Slider id="sv-job" label="Average job" value={job} min={200} max={25000} step={100} show={money(job)} onChange={touch(setJob)} />
        <Slider id="sv-hours" label="Hours a week on follow-up & paperwork" value={hours} min={0} max={40} step={1} show={`${hours} h`} onChange={touch(setHours)} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-px border-t border-night-hair bg-night-hair">
        <div className="bg-[var(--v3-aurora-wash)] px-5 py-4 md:px-6">
          <div className="v3-num text-[30px] font-semibold leading-none text-aurora md:text-[36px]">+{money(r.revenue)}</div>
          <div className="mt-1.5 text-[13px] text-gray-700">more booked a month</div>
        </div>
        <div className="bg-night-deck px-5 py-4 md:px-6">
          <div className="v3-num text-[30px] font-semibold leading-none text-gray-900 md:text-[36px]">{Math.round(r.hoursBack)} h</div>
          <div className="mt-1.5 text-[13px] text-gray-700">back every month</div>
        </div>
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-night-deck px-5 py-3.5 text-sm md:px-6">
          <span className="text-gray-700">Pays for itself in <b className="text-gray-900">{payback}</b></span>
          {r.yearly > 0 && <span className="text-gray-700">First year, net: <b className="text-aurora">{money(r.yearly)}</b></span>}
        </div>
      </div>
      {onAction && (
        <div className="border-t border-night-hair px-5 py-4 md:px-6">
          <button type="button" onClick={onAction} className="v3-btn v3-btn-aurora w-full">{actionLabel} <ArrowRight size={17} /></button>
        </div>
      )}
      <p className="border-t border-night-hair px-5 py-3 text-[11.5px] leading-snug text-gray-500 md:px-6">
        An estimate from your numbers, not a promise. Assumes 1 in 4 recovered leads books, {Math.round(AUTOMATED * 100)}% of admin automated, your hour at ${HOURLY}, a {money(buildPrice)} build and {money(monthly)}/mo.
      </p>
    </div>
  );
};

export default Savings;
