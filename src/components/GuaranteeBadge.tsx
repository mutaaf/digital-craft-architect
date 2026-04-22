import React from 'react';
import { ShieldCheck } from 'lucide-react';

const GuaranteeBadge: React.FC = () => (
  <div className="flex items-center justify-center gap-3 mt-8 px-5 py-3.5 mx-auto w-fit rounded-full border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40">
    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
      30-Day ROI Guarantee — if we don't cut your response time in half, your first month is free.
    </p>
  </div>
);

export default GuaranteeBadge;
