import React from 'react';

// Ticket 0004: a self-contained, honest social-proof strip. These are
// placeholder labels, NOT real client names. The owner swaps in real logos as
// clients onboard. Each item renders as a small grayscale SVG badge so the
// strip reads as "logos" without claiming any specific company.
const PLACEHOLDER_LOGOS: readonly string[] = [
  'Construction Co',
  'RE Agency',
  'Builders Group',
  'Property Partners',
  'Contracting LLC',
  'Realty Collective',
  'Home Services Co',
  'Development Group',
  'Estate Advisors',
  'Trades Network',
];

const PlaceholderLogo: React.FC<{ label: string }> = ({ label }) => (
  <div
    data-testid="client-logo"
    className="flex h-12 w-40 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-4 text-gray-400 grayscale transition-all duration-300 hover:grayscale-0 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:text-gray-300"
    aria-label={`${label} placeholder logo`}
  >
    <svg
      viewBox="0 0 24 24"
      className="mr-2 h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M3 10h18M10 3v18" />
    </svg>
    <span className="truncate text-sm font-semibold tracking-tight">{label}</span>
  </div>
);

const ClientLogoMarquee: React.FC = () => {
  // Duplicate the list so the track can translate by -50% for a seamless loop.
  const track = [...PLACEHOLDER_LOGOS, ...PLACEHOLDER_LOGOS];

  return (
    <section
      data-testid="client-logo-marquee"
      aria-label="Industries we build for"
      className="border-y border-gray-100 bg-white py-8 dark:border-gray-800 dark:bg-gray-900"
    >
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        Built for construction and real estate teams
      </p>
      <div className="clm-mask group relative overflow-hidden">
        <div className="clm-track flex w-max items-center gap-6 px-3">
          {track.map((label, i) => (
            <PlaceholderLogo key={`${label}-${i}`} label={label} />
          ))}
        </div>
      </div>

      {/* Scoped marquee styles. Honors prefers-reduced-motion by stopping the
          animation and showing a centered static row instead. */}
      <style>{`
        .clm-mask {
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .clm-track {
          animation: clm-scroll 40s linear infinite;
        }
        .clm-mask:hover .clm-track {
          animation-play-state: paused;
        }
        @keyframes clm-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .clm-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default ClientLogoMarquee;
