import { useMemo, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { SCHEDULE } from '@/data/demoProfiles';
import { trackCTAClick } from '@/utils/analytics';
import DemoShell, { Choice, StepTitle, Sms } from './DemoShell';

// Sample availability: the next five weekdays, with some times already taken. Deterministic per
// day so the grid doesn't reshuffle on every render.
const TIMES = ['8:30 AM', '9:15 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:15 PM', '3:30 PM', '4:45 PM'];
function days(urgent: boolean) {
  const out: { key: string; label: string; short: string; times: string[] }[] = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const today = new Date(d);
  if (!urgent) d.setDate(d.getDate() + 1);
  while (out.length < 5) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) {
      const seed = d.getDate() * 7 + d.getMonth();
      const isToday = d.getTime() === today.getTime();
      const hourNow = new Date().getHours();
      const times = TIMES.filter((_t, i) => (seed + i * 3) % 5 !== 0).filter((t) => {
        if (!isToday) return true;
        const [h, rest] = t.split(':'); const pm = rest.includes('PM');
        const hh = (+h % 12) + (pm ? 12 : 0);
        return hh > hourNow + 1;
      });
      if (times.length) out.push({
        key: d.toISOString().slice(0, 10),
        label: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'long' }),
        short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        times,
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Healthcare visits and legal consultations: reason, who, when, done. */
const AppointmentScheduler = () => {
  const { company, vertical } = useDemoContext();
  const p = SCHEDULE[vertical] ?? SCHEDULE.healthcare!;
  const name = company?.companyName || 'Your practice';

  const [reasonId, setReasonId] = useState<string | null>(null);
  const [whoId, setWhoId] = useState(p.with[0].id);
  const [modeId, setModeId] = useState(p.modes[0].id);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [person, setPerson] = useState('');
  const [extra, setExtra] = useState('');
  const [done, setDone] = useState(false);

  const reason = p.reasons.find((r) => r.id === reasonId);
  const grid = useMemo(() => days(!!reason?.urgent), [reason?.urgent]);
  const day = grid.find((d) => d.key === dayKey) ?? null;
  const who = p.with.find((w) => w.id === whoId)!;
  const mode = p.modes.find((m) => m.id === modeId)!;
  const first = person.trim().split(/\s+/)[0] || 'there';
  const when = day && time ? `${day.label === 'Today' ? 'today' : day.label} ${day.short} at ${time}` : '';
  const ready = !!reason && !!day && !!time && person.trim().length > 1;

  const reset = () => { setReasonId(null); setDayKey(null); setTime(null); setPerson(''); setExtra(''); setDone(false); };

  return (
    <DemoShell title={p.title} company={name} h1={p.h1} intro={p.intro} seo={p.seo}>
      {!done ? (
        <div className="space-y-9">
          <section>
            <StepTitle n={1}>{p.reasonStep}</StepTitle>
            <div role="radiogroup" aria-label={p.reasonStep} className="grid gap-2.5 sm:grid-cols-2">
              {p.reasons.map((r) => (
                <Choice key={r.id} on={r.id === reasonId} onClick={() => { setReasonId(r.id); setDayKey(null); setTime(null); }} title={r.label} sub={r.sub} right={r.fee} />
              ))}
            </div>
          </section>

          <section>
            <StepTitle n={2}>{p.withStep}</StepTitle>
            <div role="radiogroup" aria-label={p.withStep} className="grid gap-2.5 sm:grid-cols-3">
              {p.with.map((w) => <Choice key={w.id} on={w.id === whoId} onClick={() => setWhoId(w.id)} title={w.label} sub={w.sub} />)}
            </div>
            <div role="radiogroup" aria-label="How you'd like to meet" className="mt-3 inline-flex flex-wrap gap-1 rounded-full bg-[#e8e8ed] p-1">
              {p.modes.map((m) => (
                <button key={m.id} type="button" role="radio" aria-checked={m.id === modeId} onClick={() => setModeId(m.id)}
                  className={`min-h-[40px] rounded-full px-4 text-[15px] transition ${m.id === modeId ? 'bg-white font-medium text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </section>

          <section aria-disabled={!reason} className={reason ? '' : 'pointer-events-none opacity-40'}>
            <StepTitle n={3}>Pick a time</StepTitle>
            {!reason && <p className="mb-3 text-[15px] text-[#6e6e73]">Choose a reason first, so we show the right length of visit.</p>}
            <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0" data-scroll-strip>
              <div role="radiogroup" aria-label="Day" className="flex gap-2">
                {grid.map((d) => (
                  <button key={d.key} type="button" role="radio" aria-checked={d.key === dayKey} onClick={() => { setDayKey(d.key); setTime(null); }}
                    className={`flex min-h-[64px] min-w-[96px] shrink-0 flex-col items-center justify-center rounded-2xl border px-3 transition ${d.key === dayKey ? 'border-aurora bg-aurora text-white' : 'border-[#e8e8ed] bg-white text-[#1d1d1f] hover:border-[#c7c7cc]'}`}>
                    <span className="text-[15px] font-medium">{d.label}</span>
                    <span className={`text-[13px] ${d.key === dayKey ? 'text-white/80' : 'text-[#6e6e73]'}`}>{d.short}</span>
                  </button>
                ))}
              </div>
            </div>
            {day && (
              <div role="radiogroup" aria-label="Time" className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {day.times.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={t === time} onClick={() => setTime(t)}
                    className={`min-h-[48px] rounded-xl border text-[15px] tabular-nums transition ${t === time ? 'border-aurora bg-[var(--v3-aurora-wash)] font-medium text-[var(--v3-aurora-deep)]' : 'border-[#e8e8ed] bg-white text-[#1d1d1f] hover:border-[#c7c7cc]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <StepTitle n={4}>Who is it for?</StepTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">{p.nameLabel}</span>
                <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="e.g. Jordan Lee" autoComplete="name"
                  className="h-[52px] w-full min-w-0 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-aurora focus:ring-4 focus:ring-aurora/15" />
              </label>
              {p.extraField && (
                <label className="block">
                  <span className="mb-1.5 block text-[14px] text-[#6e6e73]">{p.extraField.label} <span className="text-[#86868b]">(optional)</span></span>
                  <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={p.extraField.placeholder}
                    className="h-[52px] w-full min-w-0 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-aurora focus:ring-4 focus:ring-aurora/15" />
                  <span className="mt-1.5 block text-[13px] text-[#86868b]">{p.extraField.note}</span>
                </label>
              )}
            </div>
          </section>

          <div className="rounded-3xl bg-white p-5 ring-1 ring-[#e8e8ed] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <p className="text-[16px] leading-snug text-[#424245]">
              {ready ? <><strong className="font-semibold text-[#1d1d1f]">{reason!.label}</strong> with {who.label.toLowerCase()}, {when}.</> : 'Pick a reason, a time and a name to book.'}
            </p>
            <button type="button" disabled={!ready} onClick={() => { setDone(true); trackCTAClick('demo_schedule_book', p.path); }}
              className="k-pill k-pill-brand mt-4 w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-40 sm:mt-0 sm:w-auto">
              Book it
            </button>
          </div>
          <p className="text-[13px] leading-snug text-[#86868b]">{p.fine}</p>
        </div>
      ) : (
        <div className="space-y-6" data-testid="schedule-done">
          <div className="rounded-3xl bg-white p-6 text-center ring-1 ring-[#e8e8ed] sm:p-8">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--v3-aurora-wash)] text-[var(--v3-aurora-deep)]"><Check size={28} aria-hidden /></span>
            <h2 className="text-[26px] font-semibold tracking-tight text-[#1d1d1f]">Booked, {first}.</h2>
            <p className="mt-2 text-[17px] text-[#424245]">{reason!.label} with {who.label.toLowerCase()}, {when}. {mode.label}.</p>
            {extra && p.extraField && <p className="mt-2 text-[15px] text-[#6e6e73]">Conflict check queued for “{extra}”.</p>}
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-[#e8e8ed] sm:p-8">
            <p className="mb-4 text-[15px] font-medium text-[#6e6e73]">What {first === 'there' ? 'they' : first} gets, without anyone at the front desk lifting a finger</p>
            <div className="space-y-4">
              <Sms from={`${name} · now`}>{p.confirmText({ company: name, first, reason: reason!.label, who: who.label, when, mode: mode.label })}</Sms>
              <Sms from={`${name} · the day before`}>{p.reminderText({ company: name, first, when, prep: reason!.prep.join(', ').replace(/^./, (c) => c.toLowerCase()) })}</Sms>
            </div>
          </div>
          <button type="button" onClick={reset} className="inline-flex min-h-[44px] items-center gap-1.5 text-[15px] text-[#6e6e73] hover:text-[#1d1d1f]">
            <RotateCcw size={15} aria-hidden /> Book another
          </button>
        </div>
      )}
    </DemoShell>
  );
};

export default AppointmentScheduler;
