
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, HardHat, Building2, PartyPopper, Server, Phone, Wrench, Heart, Scale, UtensilsCrossed, Gamepad2, Dumbbell, Stethoscope, Scissors, Car, ArrowRight, ArrowUpRight } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

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

interface NavbarProps {
  darkHero?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ darkHero = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsMobileServicesOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // When on a dark hero and not yet scrolled, force white text
  const onDark = darkHero && !isScrolled;
  const logoClass = onDark
    ? 'text-xl font-semibold text-white'
    : 'text-xl font-semibold text-gray-900 dark:text-white';
  const linkClass = onDark
    ? 'text-gray-200 hover:text-skyblue transition-colors'
    : 'text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors';
  const hamburgerClass = onDark ? 'text-white' : '';

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
      style={{ top: 'var(--dca-banner-offset, 0px)' }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className={logoClass}>
          Digital<span className="text-skyblue">Craft</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {/* Services Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsServicesOpen((o) => !o)}
              className={`flex items-center gap-1 ${linkClass}`}
            >
              Services
              <ChevronDown size={16} className={`transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            {isServicesOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 animate-fade-in">
                {VERTICALS.map((v) => (
                  <Link
                    key={v.to}
                    to={v.to}
                    onClick={() => setIsServicesOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <v.icon size={16} className="text-primary shrink-0" />
                    {v.label}
                  </Link>
                ))}
                <Link
                  to="/industries"
                  onClick={() => setIsServicesOpen(false)}
                  className="flex items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-t border-gray-200 dark:border-gray-700"
                >
                  View All Industries
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          <a
            href="https://cto.digitalcraftai.com"
            className={`${linkClass} inline-flex items-center gap-1`}
            onClick={() => trackCTAClick('fractional_cto_nav', 'navbar')}
          >
            Fractional CTO
            <ArrowUpRight size={12} className="opacity-70" />
          </a>
          <a href="#pricing" className={linkClass}>Pricing</a>
          <Link to="/quiz" className={linkClass}>AI Quiz</Link>
          <Link to="/blog" className={linkClass}>Blog</Link>
          <a
            href="#contact"
            className={linkClass}
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
            }}
          >
            Contact
          </a>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors inline-flex items-center gap-1.5"
            onClick={() => trackCTAClick('book_a_call', 'navbar')}
          >
            <Phone size={15} />
            Book a Call
          </a>
        </nav>

        <div className="md:hidden flex items-center">
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors mr-3 inline-flex items-center gap-1.5 text-sm"
            onClick={() => trackCTAClick('book_a_call', 'navbar')}
          >
            <Phone size={14} />
            Book a Call
          </a>
          <button onClick={toggleMenu} className={hamburgerClass} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-4 bg-white dark:bg-gray-900 flex flex-col space-y-4">
          {/* Mobile Services Accordion */}
          <button
            onClick={() => setIsMobileServicesOpen((o) => !o)}
            className="flex items-center justify-between text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors"
          >
            Services
            <ChevronDown size={16} className={`transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
          </button>
          {isMobileServicesOpen && (
            <div className="pl-4 flex flex-col space-y-3">
              {VERTICALS.map((v) => (
                <Link
                  key={v.to}
                  to={v.to}
                  onClick={toggleMenu}
                  className="flex items-center gap-2 text-gray-600 hover:text-skyblue dark:text-gray-400 dark:hover:text-skyblue transition-colors"
                >
                  <v.icon size={16} className="text-primary" />
                  {v.label}
                </Link>
              ))}
              <Link
                to="/industries"
                onClick={toggleMenu}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2 border-t border-gray-200 dark:border-gray-700"
              >
                View All Industries
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <a
            href="https://cto.digitalcraftai.com"
            className="inline-flex items-center gap-1 text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors"
            onClick={() => {
              trackCTAClick('fractional_cto_nav', 'navbar_mobile');
              toggleMenu();
            }}
          >
            Fractional CTO
            <ArrowUpRight size={14} className="opacity-70" />
          </a>
          <a href="#pricing" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Pricing</a>
          <Link to="/quiz" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>AI Quiz</Link>
          <Link to="/blog" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Blog</Link>
          <a
            href="#contact"
            className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
              toggleMenu();
            }}
          >
            Contact
          </a>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-md transition-colors inline-flex items-center justify-center gap-1.5 text-center"
            onClick={() => {
              trackCTAClick('book_a_call', 'navbar');
              toggleMenu();
            }}
          >
            <Phone size={15} />
            Book a Call
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
