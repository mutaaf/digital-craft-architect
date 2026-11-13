import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Factory, Phone } from 'lucide-react';
import { openTry } from './TrySheet';
import { CALENDLY } from './verticals';
import { useFold } from './fold';
import { trackCTAClick } from '@/utils/analytics';

// Phones: the bottom of the screen belongs to one dock (it replaces the sticky CTA bar there, and
// lifts the chat bubble above itself). Home · Demos · Try it (the copper diamond) · Industries ·
// Book. Safe-area aware; on the Duo open it keeps to the right page.
const MobileDock: React.FC<{ cto?: boolean }> = ({ cto = false }) => {
  const { pathname } = useLocation();
  const { form } = useFold();

  useEffect(() => {
    document.body.classList.add('v3-has-dock');
    return () => document.body.classList.remove('v3-has-dock');
  }, []);

  const tab = (to: string, label: string, Icon: typeof Home, active: boolean) => (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium tracking-wide transition-colors ${active ? 'text-aurora' : 'text-gray-600 active:text-gray-900'}`}
    >
      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );

  if (cto) {
    // the CTO site: the work, the call (the copper key), the company
    return (
      <nav aria-label="Quick" className="fixed bottom-0 z-[55] border-t border-night-hair bg-[rgba(255,255,255,0.88)] backdrop-blur-xl md:hidden"
        style={{ left: form === 'open' ? 'calc(var(--v3-hinge-l) + var(--v3-hinge-w))' : 0, right: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex h-[62px] max-w-md items-center gap-3 px-4">
          <a href="#outcomes" className="v3-btn v3-btn-ghost flex-1 text-sm">Outcomes</a>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'cto_mobile_dock')} className="v3-btn v3-btn-copper flex-[1.4] text-sm">
            <Phone size={16} /> Book a call
          </a>
        </div>
      </nav>
    );
  }

  const demos = pathname === '/demos' || /\/demo(\/|$)/.test(pathname);
  const industries = pathname === '/industries' || pathname.startsWith('/ai-for-');
  return (
    <nav
      aria-label="Quick"
      className="fixed bottom-0 z-[55] border-t border-night-hair bg-[rgba(255,255,255,0.88)] backdrop-blur-xl md:hidden"
      style={{
        left: form === 'open' ? 'calc(var(--v3-hinge-l) + var(--v3-hinge-w))' : 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      }}
    >
      <div className="mx-auto flex h-[62px] max-w-md items-stretch px-2">
        {tab('/', 'Home', Home, pathname === '/')}
        {tab('/demos', 'Demos', LayoutGrid, demos)}
        <div className="flex flex-1 items-start justify-center">
          <button
            type="button"
            onClick={() => { trackCTAClick('v3_dock_try', 'mobile_dock'); openTry(); }}
            className="group -mt-4 flex flex-col items-center gap-1 text-[10.5px] font-medium tracking-wide text-gray-800 focus-visible:outline-offset-4"
            aria-label="Try it on your company"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--v3-copper)] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] transition-transform group-active:scale-95">
              <span className="block h-[13px] w-[13px] rotate-45 rounded-[2px] border-2 border-white" />
            </span>
            Try it
          </button>
        </div>
        {tab('/industries', 'Industries', Factory, industries)}
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCTAClick('book_a_call', 'mobile_dock')}
          className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-medium tracking-wide text-gray-600 active:text-gray-900"
        >
          <Phone size={20} strokeWidth={1.8} />
          Book
        </a>
      </div>
    </nav>
  );
};

export default MobileDock;
