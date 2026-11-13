
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FooterSection } from '@/hooks/useContent';
import { Linkedin, Calendar, Github, Twitter, Phone, Send } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { submitLead } from '@/utils/submitLead';
import EmailCourseOptin from '@/components/EmailCourseOptin';

interface FooterProps {
  data: FooterSection;
}

// Headline AI providers named in the footer trust chip. The chip text and
// any test assertion read from this one array (mirror-source per the
// 2026-05-25 lesson) so a future edit to the headline three providers
// updates the chip and the test together. The chip is a strict subset of
// the full provider list rendered on /trust (sourced from CLAUDE.md's
// Tech Stack table).
export const PROVIDERS = ['OpenAI', 'Vapi', 'ElevenLabs'] as const;

const FooterNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('submitting');
    trackCTAClick('newsletter_subscribe', 'footer');
    try {
      const res = await submitLead({ email, _subject: '[Newsletter] New subscriber' });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="border-t border-[#d2d2d7] pt-8 pb-8">
      {status === 'success' ? (
        <p className="text-center text-aurora text-sm">Thanks for subscribing! We'll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-[#424245] text-sm whitespace-nowrap">Get AI insights delivered to your inbox</p>
          <div className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address for newsletter"
              className="min-w-0 flex-1 sm:w-64 h-11 px-4 rounded-full bg-white border border-[#d2d2d7] text-[#1d1d1f] text-[16px] sm:text-sm placeholder-[#86868b] focus:outline-none focus:ring-4 focus:ring-aurora/15 focus:border-aurora"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 px-5 rounded-full bg-skyblue hover:bg-aurora-deep text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              Subscribe
            </button>
          </div>
          {status === 'error' && (
            <p className="text-red-600 text-xs">Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  );
};

// Ticket 0083 - "How we ship" trust chip. Fires
// trackCTAClick('footer_how_we_ship_chip', <current-route>) synchronously
// before the SPA navigation so the beacon flushes even on a fast route
// swap. Placed alphabetically ahead of the ticket 0081 Security posture
// chip in the trust-chip row per the ticket's ordering note.
const FooterHowWeShipChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/how-we-ship"
        onClick={() => trackCTAClick('footer_how_we_ship_chip', location.pathname)}
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-how-we-ship-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          How we ship
        </span>
      </Link>
    </p>
  );
};

// Ticket 0081 - "Security posture" trust chip. Fires
// trackCTAClick('footer_security_chip', <current-route>) synchronously
// before the SPA navigation so the beacon flushes even on a fast route
// swap. useLocation is imported at the top so the current-route argument
// is derived, not hard-coded. Sibling to the ticket 0023 PROVIDERS chip
// and the ticket 0069 sub-processor chip pattern.
const FooterSecurityChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/security"
        onClick={() => trackCTAClick('footer_security_chip', location.pathname)}
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-security-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          Security posture
        </span>
      </Link>
    </p>
  );
};

// Ticket 0094 - "AI risks we watch" trust chip. Fires
// trackCTAClick('footer_ai_risks_chip', <current-route>) synchronously
// before the SPA navigation. Placed next to the ticket 0081 security-posture
// chip in the trust-chip row per the ticket's placement note ("next to the
// existing /ethics and /security links"). The label is authored once here as
// the shipped constant per the 2026-05-25 mirror-source rule.
const FOOTER_AI_RISKS_LABEL = 'AI risks we watch';
const FooterAiRisksChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/ai-risks-we-watch"
        onClick={() => trackCTAClick('footer_ai_risks_chip', location.pathname)}
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-ai-risks-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_AI_RISKS_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0097 - "Accessibility Statement" trust chip. Fires
// trackCTAClick('footer_accessibility_statement_chip', <current-route>)
// synchronously before the SPA navigation. Placed next to the ticket 0094
// AI-risks-we-watch chip in the trust-chip row per the ticket's placement
// note ("next to the existing /trust, /ethics, /security, /model-card,
// /agent-fleet, /ai-risks-we-watch links"). The label is authored once here
// as the shipped constant per the 2026-05-25 mirror-source rule.
const FOOTER_ACCESSIBILITY_LABEL = 'Accessibility Statement';
const FooterAccessibilityStatementChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/accessibility-statement"
        onClick={() =>
          trackCTAClick('footer_accessibility_statement_chip', location.pathname)
        }
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-accessibility-statement-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_ACCESSIBILITY_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0102 - "Hallucination Safeguards" trust chip. Fires
// trackCTAClick('footer_hallucination_safeguards_chip', <current-route>)
// synchronously before the SPA navigation. Placed next to the ticket 0097
// accessibility-statement chip in the trust-chip row per the ticket's
// placement note. Label authored once here as the shipped constant per
// the 2026-05-25 mirror-source rule.
const FOOTER_HALLUCINATION_LABEL = 'Hallucination Safeguards';
const FooterHallucinationSafeguardsChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/hallucination-safeguards"
        onClick={() =>
          trackCTAClick('footer_hallucination_safeguards_chip', location.pathname)
        }
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-hallucination-safeguards-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_HALLUCINATION_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0105 - "Data Retention" trust chip. Fires
// trackCTAClick('footer_data_retention_chip', <current-route>) synchronously
// before the SPA navigation. Placed next to the ticket 0102 hallucination-
// safeguards chip in the trust-chip row per the ticket's placement note.
// Label authored once here as the shipped constant per the 2026-05-25
// mirror-source rule.
const FOOTER_DATA_RETENTION_LABEL = 'Data Retention';
const FooterDataRetentionChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/data-retention"
        onClick={() =>
          trackCTAClick('footer_data_retention_chip', location.pathname)
        }
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-data-retention-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_DATA_RETENTION_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0108 - "Roadmap" trust chip. Fires
// trackCTAClick('footer_roadmap_chip', <current-route>) synchronously
// before the SPA navigation. Placed next to the ticket 0105 data-retention
// chip in the trust-chip row per the ticket's placement note. Label
// authored once here as the shipped constant per the 2026-05-25
// mirror-source rule.
const FOOTER_ROADMAP_LABEL = 'Roadmap';
const FooterRoadmapChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/roadmap"
        onClick={() => trackCTAClick('footer_roadmap_chip', location.pathname)}
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-roadmap-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_ROADMAP_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0109 - "Agent Prompts" trust chip. Fires
// trackCTAClick('footer_agent_prompts_chip', <current-route>) synchronously
// before the SPA navigation. Placed next to the ticket 0108 roadmap chip
// in the trust-chip row per the ticket's placement note. Label authored
// once here as the shipped constant per the 2026-05-25 mirror-source rule.
const FOOTER_AGENT_PROMPTS_LABEL = 'Agent Prompts';
const FooterAgentPromptsChip: React.FC = () => {
  const location = useLocation();
  return (
    <p className="text-[#6e6e73] text-xs">
      <Link
        to="/agent-prompts"
        onClick={() => trackCTAClick('footer_agent_prompts_chip', location.pathname)}
        className="hover:text-skyblue transition-colors"
      >
        <span
          data-testid="footer-agent-prompts-chip"
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_AGENT_PROMPTS_LABEL}
        </span>
      </Link>
    </p>
  );
};

// Ticket 0098 - "Subscribe (OPML)" chip linking to the OPML 2.0
// subscription index at /feeds.opml (generated at build time by
// scripts/generate-feeds-opml.ts from src/data/publishedFeeds.ts).
// Placed next to the ticket 0097 accessibility-statement chip in the
// trust-chip row per the ticket 0055/0078 footer-feed-chip pattern.
// Fires trackCTAClick('feeds_opml_subscribe', 'footer') synchronously
// before the browser follows the plain <a href> so the beacon flushes.
// Uses a plain <a> (not <Link>) because /feeds.opml is a static XML
// artifact served by Vercel, not an SPA route.
const FOOTER_OPML_LABEL = 'Subscribe (OPML)';
const FooterFeedsOpmlChip: React.FC = () => {
  return (
    <p className="text-[#6e6e73] text-xs">
      <a
        href="/feeds.opml"
        onClick={() => trackCTAClick('feeds_opml_subscribe', 'footer')}
        className="hover:text-skyblue transition-colors"
        data-testid="feeds-opml-link"
      >
        <span
          className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
        >
          {FOOTER_OPML_LABEL}
        </span>
      </a>
    </p>
  );
};

const Footer: React.FC<FooterProps> = ({ data }) => {
  // Get the actual build timestamp (when the app was compiled)
  // This will be replaced with the actual time during the build process
  const buildTimestamp = new Date(import.meta.env.VITE_BUILD_TIME || new Date().toISOString());
  
  // Format the deployment timestamp in a human-readable format
  const formatDeployTime = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(buildTimestamp);
  };

  const getSocialIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'calendly':
        return <Calendar size={20} />;
      case 'github':
        return <Github size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      default:
        return null;
    }
  };

  return (
    <footer className="border-t border-[#e8e8ed] bg-[#f5f5f7] py-16 text-[#1d1d1f] md:py-20">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mb-2 text-2xl font-semibold md:text-3xl">Digital<span className="text-[#6e6e73]">Craft</span></h2>
            <p className="text-balance text-[#6e6e73]">{data.tagline}</p>
          </div>
          
          <div className="flex justify-center items-center gap-2 mb-6">
            <Phone size={16} className="text-[#6e6e73]" aria-hidden />
            <a href="tel:+19723523293" className="inline-flex min-h-[44px] items-center text-[#424245] hover:text-skyblue transition-colors">
              (972) 352-3293
            </a>
          </div>

          <div className="flex justify-center space-x-6 mb-10">
            {Object.entries(data.socialLinks).map(([key, url]) => (
              <a 
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#424245] transition-colors duration-300 hover:bg-skyblue hover:text-white"
                aria-label={key}
              >
                {getSocialIcon(key)}
              </a>
            ))}
          </div>
          
          <FooterNewsletter />

          <EmailCourseOptin variant="footer" location="footer" />

          <div className="border-t border-[#d2d2d7] pt-8">
            <div className="flex flex-col items-center gap-5">
              <p className="text-sm text-[#6e6e73]">
                &copy; {new Date().getFullYear()} DigitalCraft. All rights reserved.
              </p>
              <div className="flex max-w-5xl flex-wrap items-center justify-center gap-x-3 gap-y-2">
                <p className="text-[#6e6e73] text-xs">
                  <span className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1">
                    Deployed: {formatDeployTime()}
                  </span>
                </p>
                <p className="text-[#6e6e73] text-xs">
                  <Link
                    to="/trust"
                    onClick={() => trackCTAClick('trust_providers_chip', 'footer')}
                    className="hover:text-skyblue transition-colors"
                  >
                    <span
                      data-testid="trust-providers-chip"
                      className="inline-block rounded-full border border-[#e8e8ed] bg-white px-2.5 py-1"
                    >
                      Powered by {PROVIDERS.join(', ')} - see how
                    </span>
                  </Link>
                </p>
                <FooterHowWeShipChip />
                <FooterSecurityChip />
                <FooterAiRisksChip />
                <FooterAccessibilityStatementChip />
                <FooterHallucinationSafeguardsChip />
                <FooterDataRetentionChip />
                <FooterRoadmapChip />
                <FooterAgentPromptsChip />
                <FooterFeedsOpmlChip />
                <div className="flex max-w-full flex-wrap justify-center gap-x-6 gap-y-2">
                  <a href="/industries" className="text-[#424245] hover:text-skyblue text-sm">Industries</a>
                  <Link to="/trust" className="text-[#424245] hover:text-skyblue text-sm">Trust & Privacy</Link>
                  <Link to="/privacy" className="text-[#424245] hover:text-skyblue text-sm">Privacy Policy</Link>
                  <Link
                    to="/changelog"
                    onClick={() => trackCTAClick('open_changelog', 'footer')}
                    className="text-[#424245] hover:text-skyblue text-sm"
                  >
                    Changelog
                  </Link>
                  <Link
                    to="/uptime"
                    onClick={() => trackCTAClick('open_uptime', 'footer')}
                    className="text-[#424245] hover:text-skyblue text-sm"
                  >
                    Uptime
                  </Link>
                  <Link
                    to="/labs"
                    data-testid="footer-labs-link"
                    onClick={() => trackCTAClick('open_labs', 'footer')}
                    className="text-[#424245] hover:text-skyblue text-sm"
                  >
                    Labs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
