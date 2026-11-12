import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, Phone, X, Download, Share2 } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import AppLauncher from '@/components/AppLauncher';
import Mark from '@/v3/Mark';
import { openTry } from '@/v3/TrySheet';
import { CALENDLY, VERTICALS } from '@/v3/verticals';
import { install, share, isStandalone } from '@/v3/pwa';
import { showIosSteps } from '@/v3/PwaBar';
import { useFold } from '@/v3/fold';
import { isCTOHost } from '@/utils/hostVariant';

interface NavbarProps {
  /** kept for the pages that pass it; every page is on the night deck now */
  darkHero?: boolean;
}

// v3 header (the beta overhaul): one hairline bar on the polar night, after mutaafaziz.com's
// Mission Control. Desktop: Demos (a panel of every industry + "try it on your company"),
// Industries, Pricing, Fractional CTO, Blog, the ⌘K app launcher and Book a call. Phones: the
// mark, the launcher and a full-screen menu; the bottom dock (src/v3/MobileDock.tsx) carries the
// rest. On the Duo open it keeps to the right page's edge.
const Navbar: React.FC<NavbarProps> = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [demos, setDemos] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { form } = useFold();
  const cto = React.useMemo(() => isCTOHost(), []);
  // on the Duo open the header lives on one page: the compact layout, whatever the window width
  const compact = form === 'open';
  const wide = compact ? 'hidden' : 'hidden items-center lg:flex';
  const narrow = compact ? '' : 'lg:hidden';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    const out = (e: MouseEvent) => { if (panel.current && !panel.current.contains(e.target as Node)) setDemos(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setDemos(false); setMenu(false); } };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, []);

  useEffect(() => { setMenu(false); setDemos(false); }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [menu]);

  const toSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate(`/#${id}`);
  };

  const link = 'relative px-3 py-2 text-[14.5px] text-gray-700 transition-colors hover:text-gray-900';
  const doInstall = async () => { const r = await install(); if (r === 'ios') showIosSteps(); };

  return (
    <header
      className={`v3-header fixed left-0 right-0 z-50 transition-[background,border-color] duration-300 ${
        scrolled || menu ? 'border-b border-night-hair bg-[rgba(255,255,255,0.8)] backdrop-blur-xl' : 'border-b border-transparent'
      }`}
      style={{ top: 'var(--dca-banner-offset, 0px)', left: form === 'open' ? 'calc(var(--v3-hinge-l) + var(--v3-hinge-w))' : undefined, WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : undefined }}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 px-4 md:px-6">
        <Link to="/" className="group flex items-center gap-2.5 text-gray-900" aria-label="DigitalCraft AI, home">
          <Mark size={30} cto={cto} />
          <span className="text-[17px] font-semibold tracking-tight">
            Digital<span className="text-gray-600 transition-colors group-hover:text-aurora">Craft</span>
            {cto && <span className="ml-1.5 text-[#e89862]">· CTO</span>}
          </span>
        </Link>

        {cto ? (
          <nav className={wide} aria-label="Main">
            <a href="#outcomes" onClick={toSection('outcomes')} className={link}>Outcomes</a>
            <a href="#mandate" onClick={toSection('mandate')} className={link}>Mandate</a>
            <Link to="/case-studies" className={link}>Case studies</Link>
            <a href="https://digitalcraftai.com" className={`${link} inline-flex items-center gap-1`}>The company <ArrowUpRight size={13} className="opacity-60" /></a>
          </nav>
        ) : (
        <nav className={wide} aria-label="Main">
          <div ref={panel} className="relative">
            <button
              className={`${link} inline-flex items-center gap-1 ${demos ? 'text-gray-900' : ''}`}
              aria-expanded={demos}
              aria-haspopup="true"
              onClick={() => setDemos((o) => !o)}
            >
              Demos <ChevronDown size={15} className={`transition-transform ${demos ? 'rotate-180' : ''}`} />
            </button>
            {demos && (
              <div className="v3-brackets absolute left-1/2 top-full mt-3 w-[680px] -translate-x-1/2 border border-night-hair bg-night-deck shadow-[0_30px_80px_-30px_rgba(18,24,28,0.25)] animate-fade-in">
                <div className="grid grid-cols-[1fr_1.55fr] gap-px bg-night-hair">
                  <div className="flex flex-col justify-between bg-night-deck p-6">
                    <div>
                      <div className="v3-eyebrow mb-3 flex items-center gap-2"><span className="v3-dot" /> Live</div>
                      <p className="mb-5 text-lg font-semibold leading-snug text-gray-900">Every demo, answering as <span className="v3-serif italic text-aurora">your</span> company.</p>
                    </div>
                    <div className="space-y-2">
                      <button onClick={() => { setDemos(false); openTry(); }} className="v3-btn v3-btn-aurora w-full text-sm">Try it on my company <ArrowRight size={16} /></button>
                      <Link to="/demos" className="v3-btn v3-btn-ghost w-full text-sm">All live demos</Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-night-hair">
                    {VERTICALS.map((v) => (
                      <Link key={v.key} to={v.hub} className="flex items-center gap-2.5 bg-night-deck px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-night-raised hover:text-gray-900">
                        <v.icon size={16} className="shrink-0 text-gray-500" />
                        {v.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link to="/industries" className={link}>Industries</Link>
          <a href="/#pricing" onClick={toSection('pricing')} className={link}>Pricing</a>
          <a href="https://cto.digitalcraftai.com" className={`${link} inline-flex items-center gap-1`} onClick={() => trackCTAClick('fractional_cto_nav', 'navbar')}>
            Fractional CTO <ArrowUpRight size={13} className="opacity-60" />
          </a>
          <Link to="/blog" className={link}>Blog</Link>
        </nav>
        )}

        <div className="flex items-center gap-1.5 md:gap-2">
          <AppLauncher site={cto ? 'cto' : 'root'} className="h-10 w-10 rounded-lg text-gray-700 hover:bg-black/5 hover:text-gray-900" />
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className={`v3-btn ${cto ? 'v3-btn-copper' : 'v3-btn-aurora'} hidden !min-h-[40px] !px-4 text-sm md:inline-flex`}
            onClick={() => trackCTAClick('book_a_call', cto ? 'navbar_cto' : 'navbar')}
          >
            <Phone size={15} /> Book a call
          </a>
          <button
            onClick={() => setMenu((m) => !m)}
            className={`grid h-11 w-11 place-items-center rounded-lg text-gray-800 hover:bg-black/5 ${narrow}`}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* phones and tablets: a full-screen menu on the night */}
      {/* a portal: the header's backdrop-filter would otherwise trap this fixed panel inside it */}
      {menu && createPortal(
        <div className={`fixed inset-x-0 bottom-0 top-[calc(64px+var(--dca-banner-offset,0px))] z-[49] overflow-y-auto border-t border-night-hair bg-night px-4 pb-[calc(var(--v3-dock-h,0px)+24px)] pt-6 ${narrow}`} style={{ left: form === 'open' ? 'calc(var(--v3-hinge-l) + var(--v3-hinge-w))' : 0 }}>
          {cto ? (
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-copper mb-6 w-full text-base"><Phone size={17} /> Book a discovery call</a>
          ) : (
          <button onClick={() => { setMenu(false); openTry(); }} className="v3-btn v3-btn-aurora mb-6 w-full text-base">
            Try it on my company <ArrowRight size={18} />
          </button>
          )}
          {!cto && <>
          <div className="v3-eyebrow mb-3">Industries</div>
          <div className="v3-deck mb-8 !grid-cols-2">
            {VERTICALS.map((v) => (
              <Link key={v.key} to={v.path} className="flex min-h-[52px] items-center gap-2.5 px-4 text-[15px] text-gray-800">
                <v.icon size={16} className="text-gray-500" /> {v.short}
              </Link>
            ))}
          </div>
          </>}
          <nav className="mb-8 divide-y divide-night-hair border-y border-night-hair" aria-label="Menu">
            {(cto ? [
              { to: '#outcomes', label: 'Outcomes', section: 'outcomes' },
              { to: '#mandate', label: 'The mandate', section: 'mandate' },
              { to: '/case-studies', label: 'Case studies' },
              { to: 'https://digitalcraftai.com', label: 'The company', ext: true },
            ] : [
              { to: '/demos', label: 'All live demos' },
              { to: '/#pricing', label: 'Pricing', section: 'pricing' },
              { to: 'https://cto.digitalcraftai.com', label: 'Fractional CTO', ext: true },
              { to: '/blog', label: 'Blog' },
              { to: '/quiz', label: 'AI readiness quiz' },
              { to: '/#contact', label: 'Contact', section: 'contact' },
            ] as { to: string; label: string; section?: string; ext?: boolean }[]).map((l) =>
              l.section ? (
                <a key={l.label} href={l.to} onClick={toSection(l.section)} className="flex min-h-[56px] items-center justify-between text-xl text-gray-900">{l.label} <ArrowRight size={18} className="text-gray-500" /></a>
              ) : l.ext ? (
                <a key={l.label} href={l.to} className="flex min-h-[56px] items-center justify-between text-xl text-gray-900">{l.label} <ArrowUpRight size={18} className="text-gray-500" /></a>
              ) : (
                <Link key={l.label} to={l.to} className="flex min-h-[56px] items-center justify-between text-xl text-gray-900">{l.label} <ArrowRight size={18} className="text-gray-500" /></Link>
              ),
            )}
          </nav>
          <div className="grid grid-cols-2 gap-2">
            {!isStandalone() && (
              <button onClick={doInstall} className="v3-btn v3-btn-ghost text-sm"><Download size={16} /> Install app</button>
            )}
            <button onClick={() => share()} className="v3-btn v3-btn-ghost text-sm"><Share2 size={16} /> Share</button>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
};

export default Navbar;
