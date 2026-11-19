
import React, { useState, useEffect, Suspense, lazy } from 'react';
const SnakeGame = lazy(() => import('./easter-egg/SnakeGame'));
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
      {isActive && <Suspense fallback={null}><SnakeGame onClose={() => setIsActive(false)} /></Suspense>}
    </>
  );
};

export default EasterEgg;
