
import React, { useState, useEffect } from 'react';
import SnakeGame from './easter-egg/SnakeGame';
import { KONAMI_CODE } from './easter-egg/types';

const EasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [secretCode, setSecretCode] = useState<string[]>([]);
  
  useEffect(() => {
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
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretCode]);
  
  return isActive ? <SnakeGame onClose={() => setIsActive(false)} /> : null;
};

export default EasterEgg;
