import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Printer, Calendar, DollarSign } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import type { ProposalBreakdown, ProposalServiceType, ProposalTier } from '@/data/proposalPricing';

interface ProposalCardProps {
  breakdown: ProposalBreakdown;
  serviceType: ProposalServiceType;
  tier: ProposalTier;
  guests: number;
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

const ProposalCard = ({ breakdown, serviceType, tier, guests }: ProposalCardProps) => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';
  const tagline = company?.tagline || 'Event Services & Production';
  const phone = company?.phone || '(972) 352-3293';
  const email = company?.email || 'mutaaf@digitalcraftai.com';
  const bookingUrl = company?.bookingUrl || 'https://calendly.com/mutaaf';

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto print:max-w-none">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden print:shadow-none print:border">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 sm:px-8 py-5 sm:py-6">
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
          {/* Service summary */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {serviceType.label}
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {guests.toLocaleString()} guests
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {tier.label} Package
            </Badge>
          </div>

          <h3 className="text-lg font-semibold mb-4">Event Proposal</h3>

          {/* Line items */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableBody>
                <TableRow className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase">
                  <TableCell>Category</TableCell>
                  <TableCell className="text-right">Low</TableCell>
                  <TableCell className="text-right">High</TableCell>
                </TableRow>
                <LineItem label="Equipment / Supplies" low={breakdown.equipment.low} high={breakdown.equipment.high} />
                <LineItem label="Staffing" low={breakdown.staffing.low} high={breakdown.staffing.high} />
                <LineItem label="Design / Planning" low={breakdown.design.low} high={breakdown.design.high} />
                <LineItem label="Logistics" low={breakdown.logistics.low} high={breakdown.logistics.high} />
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
              <DollarSign size={20} className="text-violet-600" />
              <span className="text-base sm:text-lg font-semibold">Estimated Range</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-violet-600">
              {fmt(breakdown.totalLow)} – {fmt(breakdown.totalHigh)}
            </span>
          </div>

          {/* Per-guest pricing */}
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Per-guest cost</span>
              <span className="font-semibold text-violet-600">
                {fmt(Math.round(breakdown.totalLow / guests))} – {fmt(Math.round(breakdown.totalHigh / guests))} / guest
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400">
            <Calendar size={18} className="shrink-0" />
            <span className="text-sm">
              Estimated timeline: {breakdown.timeline}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 italic mb-6">
            This is a ballpark proposal based on average pricing for {guests} guests at the {tier.label} tier.
            Final pricing will be determined after a consultation to review your specific event details, venue
            requirements, and customization preferences.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
              <Printer size={16} /> Print Proposal
            </Button>
            {bookingUrl && (
              <Button asChild className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700">
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

export default ProposalCard;
