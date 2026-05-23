import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Printer, Calendar, DollarSign, Link2, Check } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import type { EstimateBreakdown, ProjectType, FinishLevel } from '@/data/estimatePricing';

interface EstimateCardProps {
  breakdown: EstimateBreakdown;
  projectType: ProjectType;
  finish: FinishLevel;
  sqft: number;
  // Builds a same-origin, same-route URL that rehydrates this estimate.
  buildShareUrl?: () => string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const LineItem = ({ label, low, high }: { label: string; low: number; high: number }) => (
  <TableRow>
    <TableCell className="font-medium text-xs sm:text-sm">{label}</TableCell>
    <TableCell className="text-right text-gray-500 text-xs sm:text-sm">{fmt(low)}</TableCell>
    <TableCell className="text-right text-gray-500 text-xs sm:text-sm">{fmt(high)}</TableCell>
  </TableRow>
);

const EstimateCard = ({ breakdown, projectType, finish, sqft, buildShareUrl }: EstimateCardProps) => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';
  const tagline = company?.tagline || 'DFW Construction & Remodeling';
  const phone = company?.phone || '(972) 352-3293';
  const email = company?.email || 'mutaaf@digitalcraftai.com';
  const bookingUrl = company?.bookingUrl || 'https://calendly.com/mutaaf';

  const [copied, setCopied] = useState(false);

  const handlePrint = () => window.print();

  const handleCopyShareLink = async () => {
    if (!buildShareUrl) return;
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / insecure contexts: fall back to a temp textarea.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto print:max-w-none">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden print:shadow-none print:border">
        {/* Header */}
        <div className="bg-primary text-white px-5 sm:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{companyName}</h2>
              <p className="text-white/70 text-sm mt-1">{tagline}</p>
            </div>
            <div className="text-right text-sm text-white/70 hidden sm:block">
              <p>{phone}</p>
              <p>{email}</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {/* Project summary */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {projectType.label}
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {sqft.toLocaleString()} sqft
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {finish.label} Finish
            </Badge>
          </div>

          <h3 className="text-lg font-semibold mb-4">Ballpark Estimate</h3>

          {/* Line items */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableBody>
                <TableRow className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase">
                  <TableCell>Category</TableCell>
                  <TableCell className="text-right">Low</TableCell>
                  <TableCell className="text-right">High</TableCell>
                </TableRow>
                <LineItem label="Demo & Prep" low={breakdown.demoPrep.low} high={breakdown.demoPrep.high} />
                <LineItem label="Materials" low={breakdown.materials.low} high={breakdown.materials.high} />
                <LineItem label="Labor" low={breakdown.labor.low} high={breakdown.labor.high} />
                <LineItem label="Overhead & Mgmt" low={breakdown.overhead.low} high={breakdown.overhead.high} />
                <LineItem label="Contingency (5%)" low={breakdown.contingency.low} high={breakdown.contingency.high} />
                {breakdown.extras.map((e) => (
                  <TableRow key={e.label}>
                    <TableCell className="font-medium text-xs sm:text-sm">{e.label}</TableCell>
                    <TableCell className="text-right text-gray-500 text-xs sm:text-sm">{fmt(e.cost)}</TableCell>
                    <TableCell className="text-right text-gray-500 text-xs sm:text-sm">{fmt(e.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              <span className="text-base sm:text-lg font-semibold">Estimated Range</span>
            </div>
            <span data-testid="estimate-total" className="text-xl sm:text-2xl font-bold text-primary">
              {fmt(breakdown.totalLow)} – {fmt(breakdown.totalHigh)}
            </span>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400">
            <Calendar size={18} className="shrink-0" />
            <span className="text-sm">
              Estimated timeline: {breakdown.timelineLow}–{breakdown.timelineHigh} weeks
            </span>
          </div>

          <Separator className="my-4" />

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 italic mb-6">
            This is a ballpark estimate based on average pricing. Final pricing will be
            determined after an in-home consultation and detailed scope review. Actual costs may
            vary based on site conditions, material selections, and permit requirements.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
              <Printer size={16} /> Print Estimate
            </Button>
            {buildShareUrl && (
              <Button
                data-testid="copy-share-link"
                onClick={handleCopyShareLink}
                variant="outline"
                aria-live="polite"
                className="flex-1 gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {copied ? (
                  <span
                    data-testid="copy-confirmation"
                    className="flex items-center gap-2 text-green-600 dark:text-green-400"
                  >
                    <Check size={16} /> Copied
                  </span>
                ) : (
                  <>
                    <Link2 size={16} /> Copy share link
                  </>
                )}
              </Button>
            )}
            {bookingUrl && (
              <Button asChild className="flex-1 gap-2">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  Book Free Consultation
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateCard;
