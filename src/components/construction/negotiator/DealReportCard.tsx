import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Printer,
  RotateCcw,
  Home,
  DollarSign,
  Target,
  Shield,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import type { PropertyData, NegotiationReport } from '@/data/propertyNegotiation';

interface DealReportCardProps {
  property: PropertyData;
  report: NegotiationReport;
  companyName?: string;
  onReset: () => void;
}

function fmt(n: number) {
  return '$' + n.toLocaleString();
}

const DealReportCard = ({ property, report, companyName, onReset }: DealReportCardProps) => {
  const brand = companyName || '448 Developments';

  return (
    <Card className="overflow-hidden animate-fade-in print:shadow-none print:border">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-5 sm:p-6 print:bg-primary">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium opacity-90">Prepared for {brand}</p>
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            AI Deal Analysis
          </Badge>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-1">Negotiation Playbook</h2>
        <p className="text-sm opacity-80 flex items-center gap-1.5">
          <Home size={14} /> {property.address}
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Property Summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{fmt(property.askingPrice)} asking</Badge>
          <Badge variant="outline">{property.bedrooms} bed / {property.bathrooms} bath</Badge>
          <Badge variant="outline">{property.sqft.toLocaleString()} sqft</Badge>
          <Badge variant="outline">Built {property.yearBuilt}</Badge>
          {property.daysOnMarket !== null && (
            <Badge variant="outline">{property.daysOnMarket} DOM</Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {property.condition}
          </Badge>
        </div>

        <Separator />

        {/* Recommended Offer — Hero */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1">
            <Target size={14} /> Recommended Offer
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-primary">
            {fmt(report.recommendedOffer)}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-100">
              {report.discountPercent}% below asking
            </Badge>
            <span className="text-sm text-gray-400">
              Save {fmt(property.askingPrice - report.recommendedOffer)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Leverage Points */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
            <Target size={14} /> Negotiation Leverage
          </h3>
          <ul className="space-y-2">
            {report.leveragePoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Strategy */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3">
            Strategy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Initial Offer', value: report.strategy.initialOffer },
              { label: 'Counter Strategy', value: report.strategy.counterStrategy },
              { label: 'Walk-Away Point', value: report.strategy.walkawayPoint },
              { label: 'Timeline', value: report.strategy.timeline },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
              >
                <p className="text-xs font-medium text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contingencies */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
            <Shield size={14} /> Contingencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.contingencies.map((c, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* ROI Projection */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} /> ROI Projection
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Purchase Price', fmt(report.roiProjection.purchasePrice)],
                  ['Estimated Rehab', fmt(report.roiProjection.estimatedRehab)],
                  ['Holding Costs', fmt(report.roiProjection.holdingCosts)],
                  ['After Repair Value (ARV)', fmt(report.roiProjection.arv)],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-200 dark:border-gray-800 last:border-0">
                    <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{label}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{value}</td>
                  </tr>
                ))}
                <tr className="bg-green-50 dark:bg-green-950/30 font-semibold">
                  <td className="px-4 py-2.5 text-green-700 dark:text-green-300">
                    Potential Profit
                  </td>
                  <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-300">
                    {fmt(report.roiProjection.potentialProfit)}
                  </td>
                </tr>
                <tr className="bg-green-50 dark:bg-green-950/30 font-semibold">
                  <td className="px-4 py-2.5 text-green-700 dark:text-green-300">ROI</td>
                  <td className="px-4 py-2.5 text-right text-green-700 dark:text-green-300">
                    {report.roiProjection.roiPercent.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Market Context */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-2">
            Market Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{report.marketContext}</p>
        </div>

        {/* Risk Factors */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Risk Factors
          </h3>
          <ul className="space-y-1.5">
            {report.riskFactors.map((r, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1.5">
            <DollarSign size={14} /> Bottom Line
          </p>
          <p className="text-sm">{report.summary}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <Button onClick={() => window.print()} variant="outline" className="flex-1 gap-1.5">
            <Printer size={16} /> Print Playbook
          </Button>
          <Button onClick={onReset} className="flex-1 gap-1.5">
            <RotateCcw size={16} /> Analyze Another
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DealReportCard;
