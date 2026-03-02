interface AudioWaveformProps {
  isActive: boolean;
  isSpeaking: 'assistant' | 'user' | null;
}

const BAR_COUNT = 5;
const DELAYS = [0, 150, 300, 100, 250];
const DURATIONS = [400, 550, 350, 500, 450];

const AudioWaveform = ({ isActive, isSpeaking }: AudioWaveformProps) => {
  const colorClass =
    isSpeaking === 'assistant'
      ? 'bg-blue-500'
      : isSpeaking === 'user'
        ? 'bg-green-500'
        : 'bg-gray-400';

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-colors duration-300 ${colorClass}`}
          style={{
            height: isActive ? undefined : '8px',
            animation: isActive
              ? `waveform ${DURATIONS[i]}ms ease-in-out ${DELAYS[i]}ms infinite alternate`
              : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          0% { height: 8px; }
          100% { height: 32px; }
        }
      `}</style>
    </div>
  );
};

export default AudioWaveform;
