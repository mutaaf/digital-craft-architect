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

const PlaceholderLogo: React.FC<{ label: string; dupe?: boolean }> = ({ label, dupe }) => (
  <div
    data-testid="client-logo"
    className={`flex h-10 shrink-0 items-center whitespace-nowrap text-[#86868b] transition-colors duration-300 hover:text-[#424245] ${dupe ? 'clm-dupe' : ''}`}
    aria-label={`${label} placeholder logo`}
    aria-hidden={dupe || undefined}
  >
    <svg
      viewBox="0 0 24 24"
      className="mr-2 h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M3 10h18M10 3v18" />
    </svg>
    <span className="text-[17px] font-semibold tracking-[-0.02em]">{label}</span>
  </div>
);

const ClientLogoMarquee: React.FC = () => {
  // Duplicate the list so the track can translate by -50% for a seamless loop.
  const track = [...PLACEHOLDER_LOGOS, ...PLACEHOLDER_LOGOS];

  return (
    <section
      data-testid="client-logo-marquee"
      aria-label="Industries we build for"
      className="mx-auto max-w-[1180px] bg-white px-5"
    >
      <p className="mb-6 text-center text-[15px] text-[#6e6e73]">
        Built for construction and real estate teams
      </p>
      <div className="clm-mask group relative overflow-hidden">
        <div className="clm-track flex w-max items-center gap-12 px-6">
          {track.map((label, i) => (
            <PlaceholderLogo key={`${label}-${i}`} label={label} dupe={i >= PLACEHOLDER_LOGOS.length} />
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
          .clm-mask { -webkit-mask-image: none; mask-image: none; }
          .clm-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            column-gap: 40px;
            row-gap: 8px;
            width: 100%;
          }
          /* the loop's second copy only exists for the seamless scroll */
          .clm-dupe { display: none; }
        }
      `}</style>
    </section>
  );
};

export default ClientLogoMarquee;
