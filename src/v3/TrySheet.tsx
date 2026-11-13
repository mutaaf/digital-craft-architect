import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Globe } from 'lucide-react';
import { VERTICALS, domainOf, tryUrl } from './verticals';
import { useFold } from './fold';
import { trackCTAClick } from '@/utils/analytics';

// "Try it on your company": a website and an industry, then that industry's demo hub runs every
// demo personalized to the company (the hubs read ?site=). Opened from anywhere with openTry():
// the phone dock's centre key, the landing, the app's "Try it" shortcut, and links shared into
// the installed app. On the Duo open it's a two-page spread with nothing on the hinge.

const EVENT = 'v3:try';
export function openTry(detail: { site?: string | null; vertical?: string } = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

const LAST = 'dc_v3_try_vertical';

const TrySheet: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState('');
  const [vertical, setVertical] = useState<string>(() => { try { return localStorage.getItem(LAST) || 'construction'; } catch { return 'construction'; } });
  const [touched, setTouched] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { form } = useFold();

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ site?: string | null; vertical?: string }>).detail || {};
      if (d.site) setSite(d.site);
      if (d.vertical) setVertical(d.vertical);
      setTouched(false);
      setOpen(true);
      trackCTAClick('v3_try_open', 'try_sheet');
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', key);
    // phones don't auto-focus (the keyboard would cover the industries); everything else does
    if (form !== 'phone') window.setTimeout(() => input.current?.focus(), 60);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key); };
  }, [open, form]);

  if (!open) return null;
  const domain = domainOf(site);
  const bad = touched && site.trim() !== '' && !domain;

  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (site.trim() && !domain) return;
    try { localStorage.setItem(LAST, vertical); } catch { /* storage blocked */ }
    trackCTAClick('v3_try_go', domain ? `site:${vertical}` : `nosite:${vertical}`);
    setOpen(false);
    navigate(tryUrl(vertical, domain));
  };

  const spread = form === 'open';
  return createPortal(
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="v3-try-title">
      <button aria-label="Close" className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div
        className={
          spread
            ? 'absolute inset-y-0 right-0 flex'
            : 'absolute inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:w-[600px] md:-translate-x-1/2 md:-translate-y-1/2'
        }
        style={spread ? { left: 0 } : undefined}
      >
        {spread && (
          // the left page: what happens, so the right page can be all form
          <div className="hidden flex-col justify-end p-10 text-gray-700 sm:flex" style={{ width: 'var(--v3-hinge-l)', marginRight: 'var(--v3-hinge-w)' }}>
            <div className="v3-eyebrow mb-4">How it works</div>
            <ol className="space-y-4 text-lg">
              <li><span className="v3-mono text-aurora">01</span> We read your website.</li>
              <li><span className="v3-mono text-aurora">02</span> The AI learns your services, tone and area.</li>
              <li><span className="v3-mono text-aurora">03</span> Every demo answers as your company.</li>
            </ol>
          </div>
        )}
        <form
          onSubmit={go}
          className={`v3-brackets relative border border-night-hair bg-night-deck p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-2xl md:p-8 ${spread ? 'flex-1 overflow-y-auto' : 'max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-none'}`}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-700 md:hidden" aria-hidden />
          <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-gray-600 hover:text-gray-900" aria-label="Close">
            <X size={20} />
          </button>
          <div className="v3-eyebrow mb-3 flex items-center gap-2"><span className="v3-dot" /> Live · personalized</div>
          <h2 id="v3-try-title" className="mb-2 text-2xl font-semibold text-gray-900 md:text-3xl">
            Watch it work on <span className="v3-serif italic text-aurora">your</span> company.
          </h2>
          <p className="mb-6 text-gray-600">Give us your website. Every demo answers as your business, in about twenty seconds.</p>

          <label htmlFor="v3-try-site" className="v3-tag mb-2 block">Your website</label>
          <div className="relative mb-1">
            <Globe size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              id="v3-try-site"
              ref={input}
              className="v3-input pl-10"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="yourcompany.com"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={bad}
              aria-describedby="v3-try-hint"
            />
          </div>
          <p id="v3-try-hint" className={`mb-5 min-h-[20px] text-sm ${bad ? 'text-amber-300' : 'text-gray-500'}`}>
            {bad ? 'That doesn’t look like a website. Try something like acmeroofing.com.' : domain ? `We’ll read ${domain}.` : 'No site handy? Leave it empty and try ours.'}
          </p>

          <fieldset>
            <legend className="v3-tag mb-2">Your industry</legend>
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VERTICALS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  aria-pressed={vertical === v.key}
                  onClick={() => setVertical(v.key)}
                  className="v3-chip justify-start rounded-lg"
                >
                  <v.icon size={15} className={vertical === v.key ? 'text-aurora' : 'text-gray-500'} />
                  {v.short}
                </button>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="v3-btn v3-btn-aurora w-full text-base">
            {domain ? `Run the demos on ${domain}` : 'Run the demos'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default TrySheet;
