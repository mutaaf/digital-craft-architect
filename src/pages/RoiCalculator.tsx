import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ArrowRight, Calculator, Copy, Check, DollarSign, Clock } from 'lucide-react';
import {
  DEFAULT_INPUTS,
  type RoiInputs,
  computeRoi,
  decodeRoiParams,
  encodeRoiParams,
} from './roiCalculatorParams';
import { saveLastRoiResult } from '@/utils/roiResultStore';

// Ticket 0046 - Shareable AI ROI calculator. Shell mirrors AIReadinessQuiz.
// Module-level constants follow the 2026-05-25 mirror-source rule so the
// rendered meta description and the WebApplication JSON-LD description
// cannot drift.
const META_DESCRIPTION =
  'Free AI ROI calculator: estimate your annual savings from automating after-hours lead response. Four inputs, visible math, shareable result link.';
const ORIGIN = 'https://digitalcraftai.com';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'ROI Calculator', item: `${ORIGIN}/roi` },
  ],
};
const WEBAPP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI ROI Calculator',
  url: `${ORIGIN}/roi`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: META_DESCRIPTION,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

interface InputField { key: keyof RoiInputs; label: string; testid: string; min: number; max: number }
const FIELDS: readonly InputField[] = [
  { key: 'leads', label: 'Weekly inbound leads', testid: 'roi-input-leads', min: 1, max: 1000 },
  { key: 'minutes', label: 'Average minutes per lead', testid: 'roi-input-minutes', min: 1, max: 120 },
  { key: 'hourly', label: 'Fully-loaded hourly rate (USD)', testid: 'roi-input-hourly', min: 10, max: 500 },
  { key: 'afterhours', label: 'After-hours lead percentage', testid: 'roi-input-afterhours', min: 0, max: 100 },
];

const fmtDollars = (n: number) => `$${n.toLocaleString('en-US')}`;
const fmtHours = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40';
const CARD_CLASS =
  'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900';
const STAT_CLASS = 'rounded-xl border border-gray-100 dark:border-gray-800 p-4';
const LABEL_CLASS = 'font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400';

const RoiCalculator: React.FC = () => {
  const { content } = useContent();
  const [searchParams] = useSearchParams();
  const initial = useMemo(() => decodeRoiParams(searchParams), [searchParams]);
  const [inputs, setInputs] = useState<RoiInputs>(initial);
  const [copied, setCopied] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const outputs = computeRoi(inputs);

  const onChange = (key: keyof RoiInputs) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') { setInputs((p) => ({ ...p, [key]: DEFAULT_INPUTS[key] })); return; }
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      setInputs((p) => ({ ...p, [key]: Math.round(n) }));
    };

  const shareUrl = useMemo(() => {
    const params = encodeRoiParams(inputs);
    const origin = typeof window === 'undefined' ? ORIGIN : window.location.origin;
    return `${origin}/roi?${params.toString()}`;
  }, [inputs]);

  const handleCopy = async () => {
    trackCTAClick('roi_share_copy', 'roi');
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // iOS Safari without clipboard permission - fall back to a hidden
      // textarea the visitor can long-press to copy. The visible share
      // input below is also selectable as a third fallback.
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2200); }
      catch { /* silent */ }
      finally { document.body.removeChild(ta); }
    }
  };

  // Fire roi_share_open exactly once on mount when the visitor arrived via
  // an encoded link (recipient opening the share, not the sender typing).
  const arrivedWithParams = FIELDS.some((f) => searchParams.has(f.key));
  useEffect(() => {
    if (arrivedWithParams) trackCTAClick('roi_share_open', 'roi');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ticket 0062 - Debounced persistence of the visitor's last ROI bundle so
  // the /my dashboard can resurface it on a return visit. 800ms debounce
  // because a visitor scrubbing the number inputs would otherwise write 40
  // localStorage entries in five seconds; the saved value the visitor cares
  // about is the one they stop on, not every interstitial keystroke. The
  // differs-from-defaults guard prevents a bare /roi visit (no typing) from
  // writing a placeholder bundle that would surface a fake saved card on /my.
  useEffect(() => {
    const t = setTimeout(() => {
      const isDefault =
        inputs.leads === DEFAULT_INPUTS.leads &&
        inputs.minutes === DEFAULT_INPUTS.minutes &&
        inputs.hourly === DEFAULT_INPUTS.hourly &&
        inputs.afterhours === DEFAULT_INPUTS.afterhours;
      if (!isDefault) saveLastRoiResult(inputs);
    }, 800);
    return () => clearTimeout(t);
  }, [inputs]);

  return (
    <>
      <Helmet>
        <title>AI ROI Calculator | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBAPP_SCHEMA)}</script>
      </Helmet>
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 mb-4 dark:border-primary/40">
              <Calculator size={14} className="text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Free / no sign-up
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              AI ROI Calculator
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Four inputs, visible math, a shareable result link. Estimate the annual savings of
              automating after-hours lead response for your business.
            </p>
          </div>

          <div className={CARD_CLASS}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                    {f.label}
                  </span>
                  <input
                    type="number" min={f.min} max={f.max} step={1}
                    value={inputs[f.key]} onChange={onChange(f.key)}
                    data-testid={f.testid} aria-label={f.label}
                    className={INPUT_CLASS}
                  />
                </label>
              ))}
            </div>
          </div>

          <div
            data-testid="roi-result-card"
            className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 md:p-8 shadow-sm dark:border-primary/40 dark:from-primary/10"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-2">
              Conservative annual savings
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                data-testid="roi-annual-savings"
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
              >
                {fmtDollars(outputs.annualSavings)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">per year</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={STAT_CLASS}>
                <div className={`flex items-center gap-1.5 ${LABEL_CLASS}`}>
                  <Clock size={12} /> Weekly hours saved
                </div>
                <div data-testid="roi-weekly-hours" className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
                  {fmtHours(outputs.weeklyHoursSaved)}
                  <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">hrs/wk</span>
                </div>
              </div>
              <div className={STAT_CLASS}>
                <div className={`flex items-center gap-1.5 ${LABEL_CLASS}`}>
                  <DollarSign size={12} /> Monthly hours saved
                </div>
                <div data-testid="roi-monthly-hours" className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
                  {fmtHours(outputs.monthlyHoursSaved)}
                  <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">hrs/mo</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className={`${LABEL_CLASS} mb-2`}>The math, in plain English</div>
              <p className="mb-2">
                Weekly hours saved = {inputs.leads} leads/week x ({inputs.minutes} minutes / 60) x
                ({inputs.afterhours}% after-hours) = {fmtHours(outputs.weeklyHoursSaved)} hrs/wk.
              </p>
              <p>
                Annual savings = {fmtHours(outputs.weeklyHoursSaved)} hrs/wk x {fmtDollars(inputs.hourly)}/hr
                x 52 weeks = {fmtDollars(outputs.annualSavings)}.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleCopy}
                data-testid="roi-copy-share-link"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 dark:border-primary"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy share link'}
              </button>
              {copied && (
                <span data-testid="roi-copy-confirmation" role="status" className="text-sm text-emerald-700 dark:text-emerald-300">
                  Share link copied to your clipboard
                </span>
              )}
              <input
                type="text" readOnly value={shareUrl} aria-label="Shareable ROI link"
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Defaults reflect publicly-cited SMB medians: 50 weekly inbound leads (HubSpot State
              of Inbound), 8 minutes per lead-handling touch (Sales Hacker response-time study),
              $85/hour fully-loaded ops cost (BLS service-industry hourly rate), and 35% of leads
              arriving after hours (Harvard Business Review lead-response decay). Change any input
              to match your own operation.
            </p>
          </div>

          <div className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to capture this on your own ops?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              30 minutes, no pitch. Walk through these numbers with a real engineer and leave with
              a one-page plan.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer"
                onClick={() => trackCTAClick('roi_book_call', 'roi')}
                className="inline-flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 flex-1"
              >
                Book a free strategy call
                <ArrowRight size={16} />
              </a>
              <Link
                to="/demos"
                onClick={() => trackCTAClick('roi_browse_demos', 'roi')}
                className="inline-flex items-center justify-between gap-3 rounded-xl border-2 border-primary/40 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-primary dark:bg-gray-900 dark:text-white flex-1"
              >
                Try the AI demos
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      {content?.footer && <Footer data={content.footer} />}
    </>
  );
};

export default RoiCalculator;
