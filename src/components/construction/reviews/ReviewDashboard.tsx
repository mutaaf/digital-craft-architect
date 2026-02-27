import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Send, MessageCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ReviewDashboardProps {
  sent: number;
  responseRate: number;
  avgRating: number;
  newReviews: number;
  recentReviews: { name: string; rating: number; text: string; date: string }[];
}

const chartData = [
  { name: 'Mon', reviews: 3 },
  { name: 'Tue', reviews: 5 },
  { name: 'Wed', reviews: 2 },
  { name: 'Thu', reviews: 7 },
  { name: 'Fri', reviews: 4 },
  { name: 'Sat', reviews: 6 },
  { name: 'Sun', reviews: 1 },
];

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  </Card>
);

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const ReviewDashboard = ({
  sent,
  responseRate,
  avgRating,
  newReviews,
  recentReviews,
}: ReviewDashboardProps) => (
  <div className="space-y-6">
    {/* Stats grid */}
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<Send size={18} className="text-blue-600" />}
        label="Requests Sent"
        value={String(sent)}
        color="bg-blue-50 dark:bg-blue-900/20"
      />
      <StatCard
        icon={<MessageCircle size={18} className="text-green-600" />}
        label="Response Rate"
        value={`${responseRate}%`}
        color="bg-green-50 dark:bg-green-900/20"
      />
      <StatCard
        icon={<Star size={18} className="text-yellow-600" />}
        label="Avg Rating"
        value={avgRating.toFixed(1)}
        color="bg-yellow-50 dark:bg-yellow-900/20"
      />
      <StatCard
        icon={<TrendingUp size={18} className="text-purple-600" />}
        label="New Reviews"
        value={String(newReviews)}
        color="bg-purple-50 dark:bg-purple-900/20"
      />
    </div>

    {/* Chart */}
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-3">Reviews This Week</h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar dataKey="reviews" fill="hsl(196, 80%, 57%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    {/* Recent reviews */}
    <Card className="p-4">
      <h4 className="text-sm font-semibold mb-3">Recent Reviews</h4>
      <ScrollArea className="h-[200px]">
        <div className="space-y-3">
          {recentReviews.map((r, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{r.name}</span>
                <Stars count={r.rating} />
              </div>
              <p className="text-xs text-gray-500">{r.text}</p>
              <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
              {i < recentReviews.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  </div>
);

export default ReviewDashboard;
