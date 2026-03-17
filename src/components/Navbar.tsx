
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, HardHat, Building2, PartyPopper, Server } from 'lucide-react';

const VERTICALS = [
  { to: '/construction', label: 'Construction', icon: HardHat },
  { to: '/realestate', label: 'Real Estate', icon: Building2 },
  { to: '/events', label: 'Events', icon: PartyPopper },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
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
              </div>
            )}
          </div>

          <a href="#pricing" className={linkClass}>Pricing</a>
          <Link to="/blog" className={linkClass}>Blog</Link>
          <a
            href="#contact"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
            }}
          >
            Contact
          </a>
        </nav>

        <div className="md:hidden flex items-center">
          <button
            onClick={scrollToContact}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors mr-3"
          >
            Contact
          </button>
          <button onClick={toggleMenu} className={hamburgerClass}>
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
            </div>
          )}

          <a href="#pricing" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Pricing</a>
          <Link to="/blog" className="text-gray-700 hover:text-skyblue dark:text-gray-300 dark:hover:text-skyblue transition-colors" onClick={toggleMenu}>Blog</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
