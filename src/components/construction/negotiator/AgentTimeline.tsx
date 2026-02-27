import { Search, BarChart3, Brain, MessageCircle, Check, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AgentStep } from '@/data/propertyNegotiation';

interface AgentTimelineProps {
  steps: AgentStep[];
  elapsedMs: number;
}

const STEP_ICONS: Record<AgentStep['id'], React.ElementType> = {
  extract: Search,
  comps: BarChart3,
  analysis: Brain,
  messages: MessageCircle,
};

const AgentTimeline = ({ steps, elapsedMs }: AgentTimelineProps) => {
  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <Card className="p-5 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="14" fill="none" stroke="currentColor"
              className="text-primary transition-all duration-500"
              strokeWidth="3"
              strokeDasharray={`${(progressPct / 100) * 88} 88`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold">Agent Working</p>
          <p className="text-xs text-gray-500">Step {Math.min(completedCount + 1, steps.length)} of {steps.length}</p>
        </div>
      </div>

      <div className="relative ml-4">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
        <div
          className="absolute left-[11px] top-0 w-0.5 bg-green-500 transition-all duration-500"
          style={{ height: `${progressPct}%` }}
        />

        <div className="space-y-5">
          {steps.map((step) => {
            const Icon = STEP_ICONS[step.id];
            const isPending = step.status === 'pending';
            const isRunning = step.status === 'running';
            const isComplete = step.status === 'complete';
            const isError = step.status === 'error';

            return (
              <div key={step.id} className="relative flex gap-3">
                {/* Icon node */}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isComplete
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-600'
                      : isRunning
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                        : isError
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <Check size={12} />
                  ) : isRunning ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : isError ? (
                    <AlertCircle size={12} />
                  ) : (
                    <Icon size={12} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        isPending ? 'text-gray-400' : isError ? 'text-red-600' : ''
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.durationMs != null && (
                      <span className="text-xs text-gray-400">
                        {(step.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  {isRunning && (
                    <div className="mt-1.5 h-1 w-24 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  )}

                  {(isComplete || isError) && step.summary && (
                    <p
                      className={`text-xs mt-1 ${
                        isError
                          ? 'text-red-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elapsed timer */}
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-400">Elapsed</p>
        <p className="text-sm font-mono text-gray-500">{(elapsedMs / 1000).toFixed(1)}s</p>
      </div>
    </Card>
  );
};

export default AgentTimeline;
