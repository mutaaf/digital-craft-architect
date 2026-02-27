interface TimelineBarProps {
  currentDay: number;
  onJump: (day: number) => void;
}

const days = [
  { day: 0, label: 'Day 0 — Initial' },
  { day: 3, label: 'Day 3 — Follow-up' },
  { day: 7, label: 'Day 7 — Final' },
];

const TimelineBar = ({ currentDay, onJump }: TimelineBarProps) => (
  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
    {days.map((d, i) => {
      const isActive = currentDay >= d.day;
      const isCurrent = currentDay === d.day;
      return (
        <div key={d.day} className="flex items-center gap-2">
          <button
            onClick={() => onJump(d.day)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
              isCurrent
                ? 'bg-primary text-white shadow-sm'
                : isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isActive ? 'bg-current' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
            {d.label}
          </button>
          {i < days.length - 1 && (
            <div
              className={`hidden sm:block w-6 h-0.5 ${
                currentDay > d.day ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default TimelineBar;
