
import React, { useState, useEffect } from 'react';
import SnakeGame from './easter-egg/SnakeGame';
import KonamiCodeDetector from './easter-egg/KonamiCodeDetector';

const EasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  
  const handleActivate = () => {
    setIsActive(true);
  };
  
  // Listen for hero image taps
  useEffect(() => {
    const handleHeroTaps = () => {
      handleActivate();
    };
    
    window.addEventListener('hero-easter-egg-activated', handleHeroTaps);
    
    return () => {
      window.removeEventListener('hero-easter-egg-activated', handleHeroTaps);
    };
  }, []);
  
  return (
    <>
      <KonamiCodeDetector onCodeEntered={handleActivate} />
      {isActive && <SnakeGame onClose={() => setIsActive(false)} />}
    </>
  );
};

export default EasterEgg;
