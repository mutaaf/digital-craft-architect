import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import type { ComparableProperty, PropertyData } from '@/data/propertyNegotiation';

interface CompsTableProps {
  comps: ComparableProperty[];
  property: PropertyData;
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return '$' + n.toLocaleString();
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function priceColor(compPrice: number, subjectPrice: number): string {
  if (compPrice < subjectPrice * 0.97) return 'text-green-600 dark:text-green-400';
  if (compPrice > subjectPrice * 1.03) return 'text-red-600 dark:text-red-400';
  return '';
}

const CompsTable = ({ comps, property }: CompsTableProps) => {
  const isLand = property.propertyType === 'land';

  // Compute averages
  const avgPrice = comps.length > 0
    ? Math.round(comps.reduce((s, c) => s + c.salePrice, 0) / comps.length)
    : 0;

  const avgPsf = !isLand
    ? (() => {
        const valid = comps.filter((c) => c.pricePerSqft != null);
        return valid.length > 0
          ? Math.round(valid.reduce((s, c) => s + c.pricePerSqft!, 0) / valid.length)
          : null;
      })()
    : null;

  const avgPpa = isLand
    ? (() => {
        const valid = comps.filter((c) => c.pricePerAcre != null);
        return valid.length > 0
          ? Math.round(valid.reduce((s, c) => s + c.pricePerAcre!, 0) / valid.length)
          : null;
      })()
    : null;

  const avgDist = comps.length > 0
    ? (comps.reduce((s, c) => s + c.distanceMiles, 0) / comps.length).toFixed(1)
    : '—';

  return (
    <Card className="overflow-hidden animate-fade-in">
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-sm">Comparable Sales ({comps.length})</h3>
        <p className="text-xs text-gray-500 mt-0.5">AI-generated comps based on property characteristics</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Address</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {isLand ? (
                <>
                  <TableHead className="text-right">Acreage</TableHead>
                  <TableHead className="text-right">$/Acre</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-right">Beds</TableHead>
                  <TableHead className="text-right">Baths</TableHead>
                  <TableHead className="text-right">SqFt</TableHead>
                  <TableHead className="text-right">$/SqFt</TableHead>
                </>
              )}
              <TableHead className="text-right">Sale Date</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">DOM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comps.map((comp, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-xs">{comp.address}</TableCell>
                <TableCell className={`text-right text-xs ${priceColor(comp.salePrice, property.askingPrice)}`}>
                  {fmt(comp.salePrice)}
                </TableCell>
                {isLand ? (
                  <>
                    <TableCell className="text-right text-xs">{fmtNum(comp.acreage)}</TableCell>
                    <TableCell className="text-right text-xs">{fmt(comp.pricePerAcre)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right text-xs">{fmtNum(comp.bedrooms)}</TableCell>
                    <TableCell className="text-right text-xs">{fmtNum(comp.bathrooms)}</TableCell>
                    <TableCell className="text-right text-xs">{fmtNum(comp.sqft)}</TableCell>
                    <TableCell className="text-right text-xs">{fmt(comp.pricePerSqft)}</TableCell>
                  </>
                )}
                <TableCell className="text-right text-xs">{comp.saleDate}</TableCell>
                <TableCell className="text-right text-xs">{comp.distanceMiles}mi</TableCell>
                <TableCell className="text-right text-xs">{fmtNum(comp.daysOnMarket)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold text-xs">Average</TableCell>
              <TableCell className={`text-right font-semibold text-xs ${priceColor(avgPrice, property.askingPrice)}`}>
                {fmt(avgPrice)}
              </TableCell>
              {isLand ? (
                <>
                  <TableCell className="text-right text-xs">—</TableCell>
                  <TableCell className="text-right font-semibold text-xs">{fmt(avgPpa)}</TableCell>
                </>
              ) : (
                <>
                  <TableCell className="text-right text-xs">—</TableCell>
                  <TableCell className="text-right text-xs">—</TableCell>
                  <TableCell className="text-right text-xs">—</TableCell>
                  <TableCell className="text-right font-semibold text-xs">{fmt(avgPsf)}</TableCell>
                </>
              )}
              <TableCell className="text-right text-xs">—</TableCell>
              <TableCell className="text-right text-xs">{avgDist}mi</TableCell>
              <TableCell className="text-right text-xs">—</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </Card>
  );
};

export default CompsTable;
