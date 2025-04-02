
import React, { useState } from 'react';
import SnakeGame from './easter-egg/SnakeGame';
import KonamiCodeDetector from './easter-egg/KonamiCodeDetector';
import SwipeDetector from './easter-egg/SwipeDetector';

const EasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  
  const handleActivate = () => {
    setIsActive(true);
  };
  
  return (
    <>
      <KonamiCodeDetector onCodeEntered={handleActivate} />
      <SwipeDetector onSwipeDetected={handleActivate} />
      {isActive && <SnakeGame onClose={() => setIsActive(false)} />}
    </>
  );
};

export default EasterEgg;
