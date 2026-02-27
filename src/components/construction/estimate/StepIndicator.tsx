import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const StepIndicator = ({ currentStep, totalSteps, labels }: StepIndicatorProps) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const isActive = step === currentStep;
      const isComplete = step < currentStep;

      return (
        <div key={step} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isComplete
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {isComplete ? <Check size={16} /> : step}
            </div>
            <span
              className={`text-xs mt-1 hidden sm:block ${
                isActive ? 'text-primary font-medium' : 'text-gray-400'
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {step < totalSteps && (
            <div
              className={`w-8 sm:w-16 h-0.5 mb-4 sm:mb-0 ${
                isComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
