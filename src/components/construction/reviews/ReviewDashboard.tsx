import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Send, MessageCircle, TrendingUp, ArrowUpRight, Users, DollarSign } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ReviewDashboardProps {
  sent: number;
  responseRate: number;
  avgRating: number;
  newReviews: number;
  recentReviews: { name: string; rating: number; text: string; date: string }[];
  companyName?: string;
  location?: string;
  avgJobValue?: number;
}

// 6-month growth projection
const growthData = [
  { month: 'Now', reviews: 3, leads: 8 },
  { month: 'Mo 1', reviews: 12, leads: 14 },
  { month: 'Mo 2', reviews: 24, leads: 22 },
  { month: 'Mo 3', reviews: 38, leads: 31 },
  { month: 'Mo 4', reviews: 48, leads: 38 },
  { month: 'Mo 5', reviews: 56, leads: 44 },
  { month: 'Mo 6', reviews: 62, leads: 49 },
];

const StatCard = ({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  color: string;
}) => (
  <Card className="p-3 sm:p-4">
    <div className="flex items-start justify-between">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      {change && (
        <span className="text-[10px] font-medium text-green-600 dark:text-green-400 flex items-center gap-0.5">
          <ArrowUpRight size={10} /> {change}
        </span>
      )}
    </div>
    <p className="text-xl sm:text-2xl font-bold mt-2">{value}</p>
    <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
  </Card>
);

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={11}
        className={i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const ReviewDashboard = ({
  sent,
  responseRate,
  avgRating,
  newReviews,
  recentReviews,
  companyName = 'DigitalCraft AI',
  location = 'DFW',
  avgJobValue = 35000,
}: ReviewDashboardProps) => {
  const monthlyRevenue = avgJobValue * 3;
  const possessive = companyName.endsWith('s') ? `${companyName}'` : `${companyName}'s`;

  return (
    <div className="space-y-5">
      {/* Before / After comparison */}
      <Card className="p-4 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 border-none">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Projected Impact
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Before</p>
            <p className="text-3xl font-bold text-red-500">3</p>
            <p className="text-[11px] text-gray-500">Google reviews</p>
            <p className="text-[11px] text-gray-400 mt-1">~8 leads/month</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">After 6 Months</p>
            <p className="text-3xl font-bold text-green-600">62</p>
            <p className="text-[11px] text-gray-500">Google reviews</p>
            <p className="text-[11px] text-green-600 font-medium mt-1">~49 leads/month</p>
          </div>
        </div>
        <div className="mt-3 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            <span className="font-bold text-green-600">6x more leads</span> — businesses with 50+ reviews get{' '}
            <span className="font-semibold">266% more inquiries</span>
          </p>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Send size={16} className="text-blue-600" />}
          label="Requests Sent"
          value={String(sent)}
          change="+3 today"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<MessageCircle size={16} className="text-green-600" />}
          label="Response Rate"
          value={`${responseRate}%`}
          change="vs 15% avg"
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<Star size={16} className="text-yellow-600" />}
          label="Avg Rating"
          value={avgRating.toFixed(1)}
          color="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={<TrendingUp size={16} className="text-purple-600" />}
          label="New Reviews (30d)"
          value={String(newReviews)}
          change="+40%"
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* Growth chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">6-Month Growth Projection</h4>
          <Badge variant="outline" className="text-[10px]">
            <Users size={10} className="mr-1" /> Based on {location} avg
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(196, 80%, 57%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(196, 80%, 57%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              cursor={{ stroke: 'hsl(196, 80%, 57%)', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="reviews"
              stroke="hsl(196, 80%, 57%)"
              fill="url(#reviewGrad)"
              strokeWidth={2}
              name="Reviews"
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="hsl(142, 71%, 45%)"
              fill="url(#leadGrad)"
              strokeWidth={2}
              name="Leads/mo"
              strokeDasharray="4 2"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-3 h-0.5 bg-[hsl(196,80%,57%)] rounded" /> Reviews
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-3 h-0.5 bg-[hsl(142,71%,45%)] rounded border-dashed" /> Leads/mo
          </span>
        </div>
      </Card>

      {/* Revenue impact */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} className="text-primary" />
          <h4 className="text-sm font-semibold">Revenue Impact</h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          At {possessive} avg job value of <span className="font-bold">{fmtCurrency(avgJobValue)}</span>, converting just{' '}
          <span className="font-bold">3 extra leads/month</span> from reviews =
        </p>
        <p className="text-2xl font-bold text-primary mt-1">
          +{fmtCurrency(monthlyRevenue)}/month
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Conservative estimate at 10% close rate on review-sourced leads
        </p>
      </Card>

      {/* Recent reviews */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-3">Recent Google Reviews</h4>
        <ScrollArea className="h-[180px]">
          <div className="space-y-3">
            {recentReviews.map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <Stars count={r.rating} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.text}</p>
                <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
                {i < recentReviews.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ReviewDashboard;
