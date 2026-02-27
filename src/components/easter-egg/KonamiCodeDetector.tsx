
import { useState, useEffect } from 'react';
import { KONAMI_CODE } from './types';

interface KonamiCodeDetectorProps {
  onCodeEntered: () => void;
}

const KonamiCodeDetector: React.FC<KonamiCodeDetectorProps> = ({ onCodeEntered }) => {
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
        onCodeEntered();
        setSecretCode([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretCode, onCodeEntered]);
  
  return null;
};

export default KonamiCodeDetector;
