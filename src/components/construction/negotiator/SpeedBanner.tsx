import { Zap, TrendingUp } from 'lucide-react';

interface SpeedBannerProps {
  elapsedSeconds: number;
}

const SpeedBanner = ({ elapsedSeconds }: SpeedBannerProps) => {
  const perDay = Math.floor((8 * 3600) / Math.max(elapsedSeconds, 1));
  const displayPerDay = Math.min(perDay, 200);
  const closesPerDay = (displayPerDay / 15).toFixed(1);

  return (
    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 p-4 sm:p-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">
              Analyzed in {elapsedSeconds}s — That's {displayPerDay}+ properties/day
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              vs ~5 manually → {'>'}10x throughput
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm bg-green-100 dark:bg-green-900/50 rounded-lg px-3 py-2">
          <TrendingUp size={16} className="text-green-600 shrink-0" />
          <span className="text-green-700 dark:text-green-300">
            At 1/15 close rate: <strong>~{closesPerDay} deals/day</strong> vs ~0.3 manually
          </span>
        </div>
      </div>
    </div>
  );
};

export default SpeedBanner;
