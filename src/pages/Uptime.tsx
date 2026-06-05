import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Activity, ArrowRight } from 'lucide-react';
import { UPTIME_SURFACES, type UptimeStatus } from '@/data/uptimeSurfaces';
import { INCIDENTS } from '@/data/uptimeIncidents';
import { useUptimeProbe } from '@/hooks/useUptimeProbe';

// Ticket 0036 - Public /uptime page. Mirrors the Trust + Changelog shell
// (Helmet, Navbar, ScrollProgress, Footer). Chip state comes from the
// ephemeral useUptimeProbe hook firing from the visitor's browser against
// EXISTING /api/* routes (Hard NO on touching /api/). Incidents come from
// the typed INCIDENTS constant; empty -> "No incidents reported in the last
// 90 days." Per the 2026-05-25 SEO Pilot lesson /uptime is NOT in the
// index.html table; per the 2026-05-30 second-@type lesson no JSON-LD.

const UPTIME_DESCRIPTION =
  'Live reachability of the Digital Craft AI public demo surfaces and a hand-curated 90-day incident log. The page reports current observed state only; no aggregate uptime claims.';

// Every Tailwind variant carries a `dark:` pair (AGENTS.md Hard NO). Tuned
// for AA contrast on both backgrounds.
const STATUS_META: Record<UptimeStatus, { label: string; chip: string; dot: string }> = {
  green: { label: 'Reachable', chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800/60', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  yellow: { label: 'Degraded', chip: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800/60', dot: 'bg-amber-500 dark:bg-amber-400' },
  red: { label: 'Unreachable', chip: 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800/60', dot: 'bg-rose-500 dark:bg-rose-400' },
  unknown: { label: 'Status unavailable from this network', chip: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700', dot: 'bg-gray-400 dark:bg-gray-500' },
};

function formatChecked(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

const Uptime: React.FC = () => {
  const { content } = useContent();
  const statuses = useUptimeProbe(UPTIME_SURFACES);
  const [checkedAt, setCheckedAt] = React.useState<Date>(() => new Date());

  // Bump last-checked when any status flips so visitors see the probe is alive.
  React.useEffect(() => { setCheckedAt(new Date()); }, [statuses]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Uptime &amp; Incidents | DigitalCraft AI</title>
        <meta name="description" content={UPTIME_DESCRIPTION} />
        <link rel="canonical" href="https://digitalcraftai.com/uptime" />
        <meta property="og:title" content="Uptime &amp; Incidents | DigitalCraft AI" />
        <meta property="og:description" content={UPTIME_DESCRIPTION} />
        <meta property="og:url" content="https://digitalcraftai.com/uptime" />
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <main>
        <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Activity size={16} />
              Live status
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900 dark:text-white">
              Uptime &amp; Incidents
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Current reachability of every public demo surface, probed from your browser against the same serverless routes the site already uses. No aggregate SLA claims; just what we observe right now.
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Last checked: {formatChecked(checkedAt)} (re-probes every 60 seconds)
            </p>
          </div>
        </section>

        <section className="py-12 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 max-w-3xl">
            <ul className="space-y-4">
              {UPTIME_SURFACES.map((surface) => {
                const status = statuses[surface.id] ?? 'unknown';
                return (
                  <li
                    key={surface.id}
                    id={`surface-${surface.id}`}
                    data-testid="uptime-surface"
                    data-status={status}
                    data-surface-id={surface.id}
                    data-trust-anchor={surface.trustAnchor}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-5 md:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {surface.name}
                        </h2>
                        <code className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono">
                          {surface.probePath}
                        </code>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {surface.description}
                      </p>
                      <Link
                        to={`/trust#${surface.trustAnchor}`}
                        onClick={() => trackCTAClick('uptime_to_trust', surface.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        How this surface handles your data
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                    <Link
                      to={`/trust#${surface.trustAnchor}`}
                      onClick={() => trackCTAClick('uptime_surface_open', surface.id)}
                      className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset transition-colors hover:opacity-90 ${STATUS_META[status].chip}`}
                      aria-label={`${surface.name} status: ${STATUS_META[status].label}`}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${STATUS_META[status].dot}`} aria-hidden="true" />
                      {STATUS_META[status].label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="py-12 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Recent incidents
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Hand-curated log of any operational degradation in the last 90 days. Each entry is appended as part of a post-mortem; nothing is auto-generated.
            </p>
            {INCIDENTS.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-6 text-center text-gray-600 dark:text-gray-300">
                No incidents reported in the last 90 days.
              </div>
            ) : (
              <ul className="space-y-4">
                {INCIDENTS.map((incident) => (
                  <li
                    key={incident.id}
                    data-testid="uptime-incident"
                    className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <code className="font-mono">{incident.id}</code>
                      <span>severity: {incident.severity}</span>
                      <span>started: {incident.startedAt}</span>
                      <span>ended: {incident.endedAt ?? 'ongoing'}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{incident.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="py-12 bg-gray-50 dark:bg-gray-900 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Each surface chip above links to the matching section of the Trust page, where you can read exactly where that data goes.
            </p>
            <Link
              to="/trust"
              onClick={() => trackCTAClick('view_trust', 'uptime_cta')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Read the Trust page
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Uptime;
