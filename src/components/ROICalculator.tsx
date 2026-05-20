import React, { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { trackCTAClick } from '@/utils/analytics';
import { Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';

const CALENDLY_URL = 'https://calendly.com/mutaaf';

const formatCurrency = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n.toLocaleString()}`;

const formatHours = (n: number) => (n === 1 ? '1 hr' : `${n} hrs`);

interface ROICalculatorProps {
  vertical?: 'construction' | 'realestate';
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ vertical = 'construction' }) => {
  const [monthlyLeads, setMonthlyLeads] = useState(40);
  const [closeRate, setCloseRate] = useState(15);
  const [avgDealValue, setAvgDealValue] = useState(vertical === 'realestate' ? 8000 : 15000);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const results = useMemo(() => {
    const currentDeals = monthlyLeads * (closeRate / 100);
    const currentRevenue = currentDeals * avgDealValue;

    const boostedCloseRate = Math.min(closeRate * 1.35, 95);
    const boostedDeals = monthlyLeads * (boostedCloseRate / 100);
    const boostedRevenue = boostedDeals * avgDealValue;

    const addedRevenue = boostedRevenue - currentRevenue;
    const hoursSaved = Math.round(hoursPerWeek * 0.7);
    const monthlySaved = hoursSaved * 4;

    return { currentRevenue, boostedRevenue, addedRevenue, hoursSaved, monthlySaved };
  }, [monthlyLeads, closeRate, avgDealValue, hoursPerWeek]);

  const sliders: {
    label: string;
    value: number;
    setter: (v: number) => void;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
  }[] = [
    {
      label: 'Monthly Leads',
      value: monthlyLeads,
      setter: setMonthlyLeads,
      min: 5,
      max: 200,
      step: 5,
      format: (v) => `${v}`,
    },
    {
      label: 'Close Rate',
      value: closeRate,
      setter: setCloseRate,
      min: 2,
      max: 50,
      step: 1,
      format: (v) => `${v}%`,
    },
    {
      label: 'Average Deal Value',
      value: avgDealValue,
      setter: setAvgDealValue,
      min: 1000,
      max: 100000,
      step: 1000,
      format: formatCurrency,
    },
    {
      label: 'Hours on Follow-Up / Week',
      value: hoursPerWeek,
      setter: setHoursPerWeek,
      min: 1,
      max: 40,
      step: 1,
      format: formatHours,
    },
  ];

  return (
    <section id="roi-calculator" className="container-section">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Calculator className="w-4 h-4" />
          Interactive Tool
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Calculate Your ROI
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Plug in your numbers and see what AI automation could mean for your bottom line.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-md border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Your Business Numbers</h3>
          <div className="space-y-6">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
                  <span className="text-sm font-bold text-primary">{s.format(s.value)}</span>
                </div>
                <Slider
                  value={[s.value]}
                  onValueChange={(vals) => s.setter(vals[0])}
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Without DCA</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(results.currentRevenue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/ month</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border-2 border-primary text-center">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">With DCA</p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {formatCurrency(results.boostedRevenue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/ month</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Added Monthly Revenue</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  +{formatCurrency(results.addedRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hours Saved Per Month</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {results.monthlySaved} hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Projected Annual Uplift</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  +{formatCurrency(results.addedRevenue * 12)}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('roi_calculator_book', 'roi_calculator')}
            className="block"
          >
            <Button className="w-full py-6 text-lg font-semibold">
              Book a Free Call to Capture This ROI
              <TrendingUp className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Based on a 35% improvement in close rate from faster AI-powered lead response.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
