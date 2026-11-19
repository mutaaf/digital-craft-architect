import { useMemo, useState } from 'react';
import { Minus, Plus, RotateCcw, Check } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { QUOTE } from '@/data/demoProfiles';
import { trackCTAClick } from '@/utils/analytics';
import DemoShell, { Choice, StepTitle, Sms, range } from './DemoShell';

/** One estimator for every industry that prices a service (dental treatment, salon services,
 *  catering, party packages, memberships, repairs, home services). Live total, no steps to click. */
const QuoteBuilder = () => {
  const { company, vertical } = useDemoContext();
  const p = QUOTE[vertical] ?? QUOTE.homeservices!;
  const name = company?.companyName || 'Your business';

  const [svcId, setSvcId] = useState(p.services[0].id);
  const [qty, setQty] = useState(p.qty?.def ?? 1);
  const [optId, setOptId] = useState(p.options?.list.find((o) => o.mult === 1)?.id ?? p.options?.list[0]?.id ?? '');
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const [booked, setBooked] = useState(false);

  const svc = p.services.find((s) => s.id === svcId)!;
  const opt = p.options?.list.find((o) => o.id === optId);
  const usesQty = !!p.qty && (svc.perUnit || svc.included != null || p.extras.list.some((e) => e.perUnit && extras.has(e.id)));
  const showQty = !!p.qty && (svc.perUnit || svc.included != null || p.extras.list.some((e) => e.perUnit));

  const lines = useMemo(() => {
    const out: { label: string; lo: number; hi: number }[] = [];
    const m = opt?.mult ?? 1;
    let lo = svc.low, hi = svc.high, label = svc.label;
    if (svc.perUnit && p.qty) { lo *= qty; hi *= qty; label += ` × ${qty} ${qty === 1 ? p.qty.unit : p.qty.units}`; }
    out.push({ label: opt && opt.mult !== 1 ? `${label} (${opt.label})` : label, lo: lo * m, hi: hi * m });
    if (svc.included != null && svc.extraEach && qty > svc.included) {
      const n = qty - svc.included;
      out.push({ label: `${n} extra ${n === 1 ? p.qty?.unit : p.qty?.units}`, lo: n * svc.extraEach, hi: n * svc.extraEach });
    }
    for (const e of p.extras.list) if (extras.has(e.id)) {
      const k = e.perUnit && p.qty ? qty : 1;
      out.push({ label: e.perUnit && p.qty ? `${e.label} × ${qty}` : e.label, lo: e.low * k, hi: e.high * k });
    }
    return out;
  }, [svc, opt, qty, extras, p]);
  const lo = lines.reduce((a, l) => a + l.lo, 0);
  const hi = lines.reduce((a, l) => a + l.hi, 0);
  const per = p.period || '';

  const toggle = (id: string) => setExtras((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const reset = () => { setSvcId(p.services[0].id); setQty(p.qty?.def ?? 1); setExtras(new Set()); setBooked(false); };
  let n = 0;

  return (
    <DemoShell title={p.title} company={name} h1={p.h1} intro={p.intro} seo={p.seo} wide>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-9">
          <section>
            <StepTitle n={++n}>{p.serviceStep}</StepTitle>
            <div role="radiogroup" aria-label={p.serviceStep} className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {p.services.map((s) => (
                <Choice key={s.id} on={s.id === svcId} onClick={() => { setSvcId(s.id); setBooked(false); }} title={s.label} sub={s.sub}
                  right={`${range(s.low, s.high)}${s.perUnit && p.qty ? `/${p.qty.unit}` : ''}${per}`} />
              ))}
            </div>
          </section>

          {showQty && p.qty && (
            <section>
              <StepTitle n={++n}>{p.qty.label}</StepTitle>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e8ed] bg-white p-3">
                <button type="button" aria-label={`Fewer ${p.qty.units}`} onClick={() => setQty((q) => Math.max(p.qty!.min, q - (p.qty!.step ?? 1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] transition hover:bg-[#e8e8ed] disabled:opacity-40" disabled={qty <= p.qty.min}>
                  <Minus size={20} aria-hidden />
                </button>
                <label className="flex flex-1 items-baseline justify-center gap-2">
                  <span className="sr-only">{p.qty.label}</span>
                  <input
                    type="number" inputMode="numeric" min={p.qty.min} max={p.qty.max} value={qty}
                    onChange={(e) => setQty(Math.max(p.qty!.min, Math.min(p.qty!.max, parseInt(e.target.value) || p.qty!.min)))}
                    className="w-16 bg-transparent text-right text-[32px] font-semibold tabular-nums tracking-tight text-[#1d1d1f] outline-none"
                  />
                  <span className="text-[17px] text-[#6e6e73]">{qty === 1 ? p.qty.unit : p.qty.units}</span>
                </label>
                <button type="button" aria-label={`More ${p.qty.units}`} onClick={() => setQty((q) => Math.min(p.qty!.max, q + (p.qty!.step ?? 1)))} className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] transition hover:bg-[#e8e8ed] disabled:opacity-40" disabled={qty >= p.qty.max}>
                  <Plus size={20} aria-hidden />
                </button>
              </div>
              {!usesQty && <p className="mt-2 text-[14px] text-[#6e6e73]">This one is priced per visit, not per {p.qty.unit}.</p>}
            </section>
          )}

          {p.options && (
            <section>
              <StepTitle n={++n}>{p.options.step}</StepTitle>
              <div role="radiogroup" aria-label={p.options.step} className="grid gap-2.5 sm:grid-cols-3">
                {p.options.list.map((o) => (
                  <Choice key={o.id} on={o.id === optId} onClick={() => setOptId(o.id)} title={o.label} sub={o.sub} />
                ))}
              </div>
            </section>
          )}

          <section>
            <StepTitle n={++n}>{p.extras.step} <span className="text-[15px] font-normal text-[#86868b]">Optional</span></StepTitle>
            <div className="grid gap-2.5">
              {p.extras.list.map((e) => (
                <Choice key={e.id} role="checkbox" on={extras.has(e.id)} onClick={() => toggle(e.id)} title={e.label}
                  right={`+${range(e.low, e.high)}${e.perUnit && p.qty ? `/${p.qty.unit}` : ''}`} />
              ))}
            </div>
          </section>
        </div>

        {/* The answer: always in view on desktop, right after the choices on phones. */}
        <aside className="lg:sticky lg:top-24" aria-live="polite">
          <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-[#e8e8ed] sm:p-7" data-testid="quote-total">
            <p className="text-[14px] font-medium text-[#6e6e73]">{company?.companyName ? `${company.companyName}'s estimate` : 'Your estimate'}</p>
            <p className="mt-1 text-[clamp(34px,5vw,44px)] font-semibold leading-none tracking-tight tabular-nums text-[#1d1d1f]">
              {range(lo, hi)}<span className="text-[20px] font-medium text-[#6e6e73]">{per}</span>
            </p>
            {p.qty && svc.perUnit && qty > 1 && <p className="mt-1 text-[14px] text-[#6e6e73]">About {range(lo / qty, hi / qty)} per {p.qty.unit}</p>}
            <ul className="mt-5 space-y-2 border-t border-[#f0f0f2] pt-4 text-[15px]">
              {lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-4">
                  <span className="min-w-0 text-[#424245]">{l.label}</span>
                  <span className="shrink-0 tabular-nums text-[#1d1d1f]">{range(l.lo, l.hi)}</span>
                </li>
              ))}
            </ul>
            {!booked ? (
              <button type="button" onClick={() => { setBooked(true); trackCTAClick('demo_quote_book', p.path); }} className="k-pill k-pill-brand mt-6 w-full">
                {p.cta}
              </button>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="flex items-center gap-2 text-[15px] font-medium text-[var(--v3-aurora-deep)]"><Check size={18} aria-hidden /> What your customer gets next</p>
                <Sms from={name}>Hi! Here's your estimate: {svc.label.toLowerCase()}, {range(lo, hi)}{per}. Reply YES and we'll get you booked in.</Sms>
                <button type="button" onClick={reset} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] text-[#6e6e73] hover:text-[#1d1d1f]">
                  <RotateCcw size={15} aria-hidden /> Start over
                </button>
              </div>
            )}
            <p className="mt-4 text-[13px] leading-snug text-[#86868b]">{p.fine}</p>
          </div>
          <p className="mt-4 px-2 text-[14px] leading-snug text-[#6e6e73]"><strong className="font-medium text-[#1d1d1f]">Then:</strong> {p.next}</p>
        </aside>
      </div>
    </DemoShell>
  );
};

export default QuoteBuilder;
