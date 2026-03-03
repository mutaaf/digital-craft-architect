import { Link, useLocation } from 'react-router-dom';
import { HardHat, Building2, PartyPopper, ArrowLeft } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';

const CONSTRUCTION_LINKS = [
  { path: 'lead-responder', label: 'Leads', fullLabel: 'Lead Responder' },
  { path: 'estimate', label: 'Estimate', fullLabel: 'Estimate' },
  { path: 'reviews', label: 'Reviews', fullLabel: 'Reviews' },
  { path: 'property-negotiator', label: 'Deals', fullLabel: 'Deal Analyzer' },
  { path: 'voice-negotiator', label: 'Voice', fullLabel: 'Voice Negotiator' },
];

const REALESTATE_LINKS = [
  { path: 'property-negotiator', label: 'Deals', fullLabel: 'Deal Analyzer' },
  { path: 'voice-negotiator', label: 'Voice', fullLabel: 'Voice Negotiator' },
  { path: 'lead-responder', label: 'Leads', fullLabel: 'Lead Qualifier' },
];

const EVENTS_LINKS = [
  { path: 'inquiry', label: 'Inquiry', fullLabel: 'Inquiry Qualifier' },
  { path: 'proposal', label: 'Proposal', fullLabel: 'Proposal Generator' },
  { path: 'voice-booking', label: 'Voice', fullLabel: 'Voice Booking' },
];

const DemoNavbar = () => {
  const { pathname } = useLocation();
  const { company } = useDemoContext();
  const brandLabel = company?.companyName
    ? company.companyName.length > 16
      ? company.companyName.slice(0, 16) + '…'
      : company.companyName
    : 'DigitalCraft AI';

  // Detect section from URL path
  const isRealEstate = pathname.startsWith('/realestate');
  const isEvents = pathname.startsWith('/events');
  const basePrefix = isEvents ? '/events/demo' : isRealEstate ? '/realestate/demo' : '/construction/demo';
  const backTo = isEvents ? '/events' : isRealEstate ? '/realestate' : '/construction';
  const links = isEvents ? EVENTS_LINKS : isRealEstate ? REALESTATE_LINKS : CONSTRUCTION_LINKS;
  const Icon = isEvents ? PartyPopper : isRealEstate ? Building2 : HardHat;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to={basePrefix}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
          >
            <Icon size={20} className="text-primary" />
            <span className="font-bold">{brandLabel}</span>
            <span className="hidden sm:inline">Demos</span>
          </Link>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map((l) => {
              const to = `${basePrefix}/${l.path}`;
              return (
                <Link
                  key={l.path}
                  to={to}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    pathname === to
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="sm:hidden">{l.label}</span>
                  <span className="hidden sm:inline">{l.fullLabel}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <Link
          to={backTo}
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
