import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock } from 'lucide-react';

const SESSION_KEY = 'dca_urgency_banner_dismissed';

const TARGET_DAY = 1;

function getNextTarget(): Date {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), TARGET_DAY);
  if (target <= now) target.setMonth(target.getMonth() + 1);
  return target;
}

function timeLeft(target: Date): { days: number; hours: number; mins: number } | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
  };
}

const CountdownBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const target = useMemo(() => getNextTarget(), []);
  const [remaining, setRemaining] = useState(() => timeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(timeLeft(target)), 60000);
    return () => clearInterval(id);
  }, [target]);

  if (dismissed || !remaining) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* session storage unavailable — non-fatal */
    }
  };

  return (
    <div className="bg-primary/95 text-white text-sm">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative">
        <Clock className="h-4 w-4 shrink-0 opacity-80" />
        <p className="text-center">
          <span className="font-semibold">Pricing updates in {remaining.days}d {remaining.hours}h</span>
          <span className="hidden sm:inline"> — lock in current rates before they change.</span>
        </p>
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CountdownBanner;
