import React, { useEffect, useRef, useState } from 'react';
import { Users, Star, Zap } from 'lucide-react';

interface CounterProps {
  icon: React.ReactNode;
  end: number;
  suffix: string;
  label: string;
  decimals?: number;
}

const Counter: React.FC<CounterProps> = ({ icon, end, suffix, label, decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const duration = 1500;
    const steps = 40;
    const increment = end / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, end);
      setCount(current);
      if (step >= steps) {
        setCount(end);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [started, end]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 px-6 py-4">
      <div className="text-primary">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {formatted}{suffix}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">{label}</div>
    </div>
  );
};

const SocialProofBar: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-20">
          <Counter
            icon={<Users size={28} />}
            end={50}
            suffix="+"
            label="Businesses Served"
          />
          <Counter
            icon={<Star size={28} />}
            end={4.9}
            suffix="/5"
            label="Client Rating"
            decimals={1}
          />
          <Counter
            icon={<Zap size={28} />}
            end={10000}
            suffix="+"
            label="AI Tasks Automated"
          />
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
