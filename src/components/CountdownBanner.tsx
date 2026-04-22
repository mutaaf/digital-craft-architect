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

  const isVisible = !dismissed && !!remaining;

  // When the banner is visible, claim a 40px-tall slot at the top of the
  // viewport and shift the (fixed) Navbar + body content down by the same
  // amount. Unsets cleanly on dismiss/unmount.
  useEffect(() => {
    if (!isVisible) return;
    const root = document.documentElement;
    const prevBodyPad = document.body.style.paddingTop;
    root.style.setProperty('--dca-banner-offset', '40px');
    document.body.style.paddingTop = '40px';
    return () => {
      root.style.removeProperty('--dca-banner-offset');
      document.body.style.paddingTop = prevBodyPad;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* session storage unavailable — non-fatal */
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-10 bg-primary/95 text-white text-sm shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-center gap-3 relative">
        <Clock className="h-4 w-4 shrink-0 opacity-80" />
        <p className="text-center truncate">
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
