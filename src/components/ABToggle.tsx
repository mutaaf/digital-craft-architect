import React, { useEffect, useState } from 'react';
import { setVariant, Variant } from '@/utils/abTest';

interface Props {
  current: Variant;
}

const ABToggle: React.FC<Props> = ({ current }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enabled =
      import.meta.env.DEV ||
      new URLSearchParams(window.location.search).get('debug') === '1';
    setVisible(enabled);
  }, []);

  if (!visible) return null;

  const pick = (v: Variant) => () => {
    if (v !== current) setVariant(v);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[999] flex items-center gap-1 rounded-full border border-black/10 bg-white/90 px-2 py-1.5 text-[11px] font-mono shadow-lg backdrop-blur dark:border-white/10 dark:bg-black/80"
      role="group"
      aria-label="A/B variant toggle"
    >
      <span className="px-1.5 text-neutral-500">v:</span>
      <button
        type="button"
        onClick={pick('a')}
        className={`rounded-full px-2.5 py-1 transition ${
          current === 'a'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        aria-pressed={current === 'a'}
      >
        A · control
      </button>
      <button
        type="button"
        onClick={pick('b')}
        className={`rounded-full px-2.5 py-1 transition ${
          current === 'b'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
        }`}
        aria-pressed={current === 'b'}
      >
        B · champion
      </button>
    </div>
  );
};

export default ABToggle;
