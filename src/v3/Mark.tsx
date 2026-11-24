import React from 'react';

// The mark (public/icons/icon.svg, drawn small): the copper diamond, Digital Craft's tick, inside an
// orbit of aurora points. `cto` swaps the colours, as the CTO app's icon does.
const Mark: React.FC<{ size?: number; cto?: boolean; className?: string }> = ({ size = 28, cto = false, className = '' }) => {
  const ring = cto ? '#C2611F' : '#0B7D5E'; // deep tones: the mark sits on white now
  const core = cto ? '#0B7D5E' : '#C2611F';
  const dots = Array.from({ length: 18 }, (_, i) => {
    const t = (i / 18) * Math.PI * 2;
    const x = Math.cos(t) * 11, y = Math.sin(t) * 4.6;
    const a = (-24 * Math.PI) / 180;
    const front = (Math.sin(t) + 1) / 2;
    return { x: 16 + x * Math.cos(a) - y * Math.sin(a), y: 16 + x * Math.sin(a) + y * Math.cos(a), r: 0.55 + front * 0.6, o: 0.35 + front * 0.65, front: front > 0.5 };
  });
  const dot = (d: (typeof dots)[number], i: number) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={ring} fillOpacity={d.o} />;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      {dots.filter((d) => !d.front).map(dot)}
      <path d="M16 10.2 21.8 16 16 21.8 10.2 16Z" fill={core} />
      <path d="M16 13.4 18.6 16 16 18.6 13.4 16Z" fill="#0B0F12" fillOpacity=".9" />
      {dots.filter((d) => d.front).map(dot)}
    </svg>
  );
};

export default Mark;
