import { Link, useLocation } from 'react-router-dom';
import { HardHat, ArrowLeft } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';

const links = [
  { to: '/construction/demo/lead-responder', label: 'Leads', fullLabel: 'Lead Responder' },
  { to: '/construction/demo/estimate', label: 'Estimate', fullLabel: 'Estimate' },
  { to: '/construction/demo/reviews', label: 'Reviews', fullLabel: 'Reviews' },
  { to: '/construction/demo/property-negotiator', label: 'Deals', fullLabel: 'Deal Analyzer' },
  { to: '/construction/demo/voice-negotiator', label: 'Voice', fullLabel: 'Voice Negotiator' },
];

const DemoNavbar = () => {
  const { pathname } = useLocation();
  const { company } = useDemoContext();
  const brandLabel = company?.companyName
    ? company.companyName.length > 16
      ? company.companyName.slice(0, 16) + '…'
      : company.companyName
    : 'DigitalCraft AI';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/construction/demo"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
          >
            <HardHat size={20} className="text-primary" />
            <span className="font-bold">{brandLabel}</span>
            <span className="hidden sm:inline">Demos</span>
          </Link>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className="sm:hidden">{l.label}</span>
                <span className="hidden sm:inline">{l.fullLabel}</span>
              </Link>
            ))}
          </div>
        </div>
        <Link
          to="/construction"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Main</span>
        </Link>
      </div>
    </nav>
  );
};

export default DemoNavbar;
