import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DEMO_DISCLOSURES } from '@/data/demoDisclosures';
import { trackCTAClick } from '@/utils/analytics';

// Ticket 0033 - Per-demo "what we store" disclosure chip linked to /trust.
//
// Renders a small pill in the top-right of its containing box. Tapping opens
// a shadcn <Dialog> with three short sentences describing what this specific
// demo writes to browser storage, what it sends to which server-side
// providers, and what is NOT stored on Digital Craft servers. Every fact
// rendered here is sourced from DEMO_DISCLOSURES, which also appears on the
// rendered /trust page (mirror-source rule, 2026-05-25 lesson).
//
// Per the 2026-05-07 em-dash Hard NO, every visible string uses hyphens.

interface DataDisclosureChipProps {
  demoPath: string;
}

const DataDisclosureChip = ({ demoPath }: DataDisclosureChipProps) => {
  const [open, setOpen] = useState(false);
  // React 18 strict-mode guard: ensure the analytics event fires exactly once
  // per open. Mirrors the pattern in src/pages/construction/VoiceNegotiator.tsx
  // sharedAnalyticsFiredRef from ticket 0029.
  const openFiredRef = useRef(false);

  const disclosure = DEMO_DISCLOSURES[demoPath];

  useEffect(() => {
    if (!disclosure && import.meta.env.DEV) {
      console.warn(
        `DataDisclosureChip: no DEMO_DISCLOSURES entry for "${demoPath}"; chip will not render.`,
      );
    }
  }, [demoPath, disclosure]);

  if (!disclosure) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !openFiredRef.current) {
      openFiredRef.current = true;
      trackCTAClick('open_data_disclosure', demoPath);
    }
    if (!next) {
      // Allow the next open to fire its own analytics event.
      openFiredRef.current = false;
    }
  };

  const storageList = disclosure.storageKeys.join(', ');
  const providerList = disclosure.serverSendsTo.join(', ');
  const neverList = disclosure.neverStored.join(', ');

  return (
    <>
      <button
        type="button"
        data-testid="data-disclosure-chip"
        aria-label="Data disclosure"
        onClick={() => handleOpenChange(true)}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 backdrop-blur hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
      >
        <ShieldCheck size={14} aria-hidden="true" />
        What we store
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
              What this demo stores
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Plain-language summary scoped to this exact demo. Every fact below
              is also on our full transparency page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            <p>
              <strong className="text-gray-900 dark:text-white">In your browser only:</strong>{' '}
              this demo writes {storageList} to localStorage so the next visit
              on this device can pick up where you left off.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Sent to:</strong>{' '}
              {providerList}. Every AI provider key lives in our serverless
              proxy, never in the browser.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Never on our servers:</strong>{' '}
              {neverList}.
            </p>
          </div>

          <div className="mt-2">
            <Link
              to="/trust"
              onClick={() => trackCTAClick('disclosure_to_trust', demoPath)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors"
            >
              Read full transparency page
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataDisclosureChip;
