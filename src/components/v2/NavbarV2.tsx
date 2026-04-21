import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  HardHat,
  Building2,
  PartyPopper,
  Wrench,
  Heart,
  Scale,
  UtensilsCrossed,
  Gamepad2,
  Dumbbell,
  Stethoscope,
  Scissors,
  Car,
  Server,
} from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { isCTOHost, ROOT_URL } from '@/utils/hostVariant';

const VERTICALS = [
  { to: '/construction', label: 'Construction', icon: HardHat },
  { to: '/realestate', label: 'Real Estate', icon: Building2 },
  { to: '/events', label: 'Events', icon: PartyPopper },
  { to: '/homeservices', label: 'Home Services', icon: Wrench },
  { to: '/healthcare', label: 'Healthcare', icon: Heart },
  { to: '/legal', label: 'Law Firms', icon: Scale },
  { to: '/restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/kidsplay', label: 'Kids Play', icon: Gamepad2 },
  { to: '/fitness', label: 'Fitness & Gyms', icon: Dumbbell },
  { to: '/dental', label: 'Dental', icon: Stethoscope },
  { to: '/salon', label: 'Salons & Spas', icon: Scissors },
  { to: '/autorepair', label: 'Auto Repair', icon: Car },
  { to: '/setupclaw', label: 'SetupClaw', icon: Server },
];

const CALENDLY = 'https://calendly.com/mutaaf';

const NavbarV2: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [onCTO, setOnCTO] = useState(false);

  useEffect(() => {
    setOnCTO(isCTOHost());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const linkCls =
    'v2-mono text-[11px] text-bone/70 transition hover:text-bone';

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-ink/85 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        {onCTO ? (
          <a
            href={ROOT_URL}
            onClick={() => trackCTAClick('logo_to_root', 'v2_navbar')}
            className="flex items-baseline gap-2"
            aria-label="DigitalCraft home"
          >
            <span
              className="v2-display text-2xl leading-none text-bone"
              style={{ fontWeight: 420 }}
            >
              Digital<span className="italic text-copper">Craft</span>
            </span>
            <span className="v2-mono hidden text-[10px] text-copper md:inline">
              / CTO
            </span>
          </a>
        ) : (
          <Link to="/" className="flex items-baseline gap-2">
            <span
              className="v2-display text-2xl leading-none text-bone"
              style={{ fontWeight: 420 }}
            >
              Digital<span className="italic text-copper">Craft</span>
            </span>
            <span className="v2-mono hidden text-[10px] text-bone/40 md:inline">
              / EST. 2019
            </span>
          </Link>
        )}

        <nav className="hidden items-center gap-7 md:flex">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen((o) => !o)}
              className={`${linkCls} flex items-center gap-1`}
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown
                size={12}
                className={`transition-transform ${
                  servicesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {servicesOpen && (
              <div
                className="absolute left-1/2 top-full mt-3 w-64 -translate-x-1/2 border border-white/10 bg-ink-soft/95 shadow-2xl backdrop-blur-md"
                style={{ animation: 'v2-rise 240ms ease-out both' }}
              >
                <div className="border-b border-white/10 px-4 py-3">
                  <span className="v2-mono text-[10px] text-copper">
                    § Verticals
                  </span>
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-1">
                  {VERTICALS.map((v) => (
                    <Link
                      key={v.to}
                      to={v.to}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-bone/75 transition hover:bg-white/5 hover:text-bone"
                    >
                      <v.icon size={14} className="shrink-0 text-copper" />
                      <span className="font-editorial">{v.label}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/industries"
                  onClick={() => setServicesOpen(false)}
                  className="v2-mono flex items-center justify-between border-t border-white/10 px-4 py-3 text-[11px] text-copper transition hover:bg-white/5"
                >
                  See full catalog
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            )}
          </div>

          <a href="#capabilities" className={linkCls}>
            Portfolio
          </a>
          <Link to="/blog" className={linkCls}>
            Journal
          </Link>

          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('book_a_call', 'v2_navbar')}
            className="group inline-flex items-center gap-2 rounded-full border border-bone/30 bg-bone px-5 py-2 text-ink transition hover:border-copper hover:bg-copper hover:text-bone"
          >
            <span className="v2-mono text-[11px]">Engage</span>
            <ArrowUpRight
              size={13}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </nav>

        <button
          type="button"
          className="text-bone md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden"
          style={{ animation: 'v2-rise 220ms ease-out both' }}
        >
          <div className="container mx-auto max-w-6xl px-5 py-5">
            <button
              type="button"
              onClick={() => setMobileServicesOpen((o) => !o)}
              className="flex w-full items-center justify-between py-3"
              aria-expanded={mobileServicesOpen}
            >
              <span className="v2-mono text-bone/80">Services</span>
              <ChevronDown
                size={14}
                className={`text-bone/60 transition-transform ${
                  mobileServicesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileServicesOpen && (
              <div className="mb-2 grid grid-cols-2 gap-1 border-l-2 border-copper pl-3">
                {VERTICALS.map((v) => (
                  <Link
                    key={v.to}
                    to={v.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-bone/75"
                  >
                    <v.icon size={13} className="text-copper" />
                    {v.label}
                  </Link>
                ))}
              </div>
            )}
            <a
              href="#capabilities"
              onClick={() => setMenuOpen(false)}
              className="block border-t border-white/10 py-3"
            >
              <span className="v2-mono text-bone/80">Portfolio</span>
            </a>
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="block border-t border-white/10 py-3"
            >
              <span className="v2-mono text-bone/80">Journal</span>
            </Link>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMenuOpen(false);
                trackCTAClick('book_a_call', 'v2_navbar_mobile');
              }}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-bone py-3 text-ink"
            >
              <span className="v2-mono text-[11px]">Engage the Champion</span>
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarV2;
