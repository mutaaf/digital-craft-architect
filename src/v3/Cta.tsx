import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { openTry } from './TrySheet';
import { CALENDLY, VERTICALS, domainOf, tryUrl } from './verticals';
import { useFold } from './fold';

// The site's calls to action, in one place (2026-11-12, owner: "we need better CTAs"). The rules:
//  - Say what you get, in the visitor's words: "Build my demo", not "Get started".
//  - Take the next step right there: the website field is in the hero, not behind a button.
//  - Under every primary button, the three things that stop people clicking: cost, signup, time.
//  - The secondary action is always the same human one: a free 30-minute call.

export const TRY_PROMISE = ['Free', 'No signup', 'Ready in about 20 seconds'];
export const CALL_PROMISE = ['Free', '30 minutes', 'By video'];

export const CtaPromise: React.FC<{ items: string[]; className?: string; dark?: boolean }> = ({ items, className = '', dark }) => (
  <p className={`text-[14px] ${dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'} ${className}`}>
    {items.map((x, i) => <React.Fragment key={x}>{i > 0 && <span aria-hidden className="mx-2 opacity-60">·</span>}{x}</React.Fragment>)}
  </p>
);

/** The main action: their website in, their own demo out. With a vertical it goes straight to that
 *  industry's personalized hub; without one, the try sheet asks for the industry. */
export const TryField: React.FC<{
  where: string;                // analytics location, e.g. 'home_hero'
  vertical?: string;            // known industry: skip the sheet
  placeholder?: string;
  align?: 'center' | 'left';
  size?: 'hero' | 'normal';
  dark?: boolean;
  className?: string;
}> = ({ where, vertical, placeholder = 'yourcompany.com', align = 'center', size = 'hero', dark, className = '' }) => {
  const [site, setSite] = useState('');
  const navigate = useNavigate();
  const id = `try-${where}`;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = domainOf(site);
    trackCTAClick('v3_try', `${where}_${domain ? 'site' : 'empty'}`);
    if (domain && vertical && VERTICALS.some((v) => v.key === vertical)) {
      trackCTAClick('v3_try_go', `site:${vertical}`);
      navigate(tryUrl(vertical, domain));
      return;
    }
    openTry({ site: domain || site || null, vertical });
  };
  const h = size === 'hero' ? 'h-[56px] text-[17px]' : 'h-[52px] text-[17px]';
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} w-full max-w-[540px] ${className}`} data-try-field>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={id} className="sr-only">Your website</label>
        <input
          id={id}
          className={`${h} w-full min-w-0 rounded-full border px-6 outline-none transition focus:border-aurora focus:ring-4 focus:ring-aurora/15 sm:flex-1 ${dark ? 'border-white/20 bg-white/10 text-white placeholder-white/50' : 'border-[#d2d2d7] bg-white text-[#1d1d1f] placeholder-[#86868b]'}`}
          inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={placeholder}
          value={site} onChange={(e) => setSite(e.target.value)}
        />
        <button type="submit" className={`k-pill k-pill-brand shrink-0 ${size === 'hero' ? '!min-h-[56px]' : '!min-h-[52px]'}`}>
          Build my demo <ArrowRight size={18} aria-hidden />
        </button>
      </form>
      <CtaPromise items={TRY_PROMISE} dark={dark} className="mt-3" />
    </div>
  );
};

/** The human action. */
export const BookCall: React.FC<{ where: string; event?: string; label?: string; className?: string }> = ({ where, event = 'book_discovery', label = 'Or book a free 30-minute call', className = '' }) => (
  <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick(event, where)} className={`k-link ${className}`}>
    {label} <ChevronRight size={18} strokeWidth={2.2} aria-hidden className="mt-px" />
  </a>
);

/** Desktop only (phones have the dock's Try key): once the hero has scrolled away, a quiet pill
 *  keeps the main action in reach. It steps aside whenever a TryField is on screen. */
export const StickyTry: React.FC<{ where: string; vertical?: string; label?: string }> = ({ where, vertical, label = 'Your AI, built from your website.' }) => {
  const [show, setShow] = useState(false);
  const { form } = useFold();
  useEffect(() => {
    let fieldOnScreen = false;
    const fields = Array.from(document.querySelectorAll('[data-try-field]'));
    const io = new IntersectionObserver((es) => {
      fieldOnScreen = es.some((e) => e.isIntersecting) || fields.some((f) => { const r = f.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      update();
    });
    fields.forEach((f) => io.observe(f));
    const update = () => {
      const past = scrollY > innerHeight * 0.9;
      const nearEnd = scrollY + innerHeight > document.documentElement.scrollHeight - 900;
      setShow(past && !nearEnd && !fieldOnScreen);
    };
    addEventListener('scroll', update, { passive: true });
    update();
    return () => { removeEventListener('scroll', update); io.disconnect(); };
  }, []);
  if (form === 'phone' || form === 'table') return null;
  return (
    <div
      aria-hidden={!show}
      className={`k-sticky-try fixed bottom-6 left-1/2 z-[50] hidden -translate-x-1/2 transition-all duration-500 md:block ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
    >
      <div className="flex items-center gap-4 rounded-full border border-[#e8e8ed] bg-white/90 py-2 pl-6 pr-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <span className="whitespace-nowrap text-[15px] text-[#1d1d1f]">{label}</span>
        <button type="button" tabIndex={show ? 0 : -1} onClick={() => { trackCTAClick('v3_try', `${where}_sticky`); openTry({ vertical }); }} className="k-pill k-pill-brand !min-h-[44px] !px-5 !text-[15px]">
          Build my demo <ArrowRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
};
