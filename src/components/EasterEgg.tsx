
import React, { useState, useEffect } from 'react';
import SnakeGame from './easter-egg/SnakeGame';
import { KONAMI_CODE } from './easter-egg/types';

const EasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [touchSequence, setTouchSequence] = useState<number[]>([]);
  
  useEffect(() => {
    // Keyboard event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      const updatedCode = [...secretCode, e.key];
      
      if (updatedCode.length > KONAMI_CODE.length) {
        updatedCode.shift();
      }
      
      setSecretCode(updatedCode);
      
      const isKonami = KONAMI_CODE.every((key, index) => updatedCode[index] === key);
      
      if (isKonami) {
        setIsActive(true);
        setSecretCode([]);
      }
    };
    
    // Touch event handler for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      const updatedTouchSequence = [...touchSequence, touchX, touchY];
      
      if (updatedTouchSequence.length > 10) {
        updatedTouchSequence.splice(0, 2);
      }
      
      setTouchSequence(updatedTouchSequence);
      
      // Simple swipe detection logic
      if (updatedTouchSequence.length === 10) {
        const isValidSwipeSequence = 
          updatedTouchSequence[0] < updatedTouchSequence[2] && // swipe right
          updatedTouchSequence[1] === updatedTouchSequence[3] && // same vertical position
          updatedTouchSequence[2] < updatedTouchSequence[4] && // continue right
          updatedTouchSequence[3] === updatedTouchSequence[5] && // same vertical position
          updatedTouchSequence[4] < updatedTouchSequence[6] && // continue right
          updatedTouchSequence[5] === updatedTouchSequence[7] && // same vertical position
          updatedTouchSequence[6] < updatedTouchSequence[8] && // continue right
          updatedTouchSequence[7] === updatedTouchSequence[9]; // same vertical position
        
        if (isValidSwipeSequence) {
          setIsActive(true);
          setTouchSequence([]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [secretCode, touchSequence]);
  
  return isActive ? <SnakeGame onClose={() => setIsActive(false)} /> : null;
};

export default EasterEgg;
