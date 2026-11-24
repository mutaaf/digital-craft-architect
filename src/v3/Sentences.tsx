import React from 'react';

/**
 * A keynote headline wraps between its sentences, never inside a short one: "Every bid. / Out the
 * same day.", not "Every bid. Out / the same day.". Each sentence is an inline-block, so a sentence
 * longer than the line still wraps inside itself (no overflow on a phone).
 */
const Sentences: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(?<=[.!?])\s+/);
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && ' '}
          <span className="inline-block">{p}</span>
        </React.Fragment>
      ))}
    </>
  );
};

export default Sentences;
