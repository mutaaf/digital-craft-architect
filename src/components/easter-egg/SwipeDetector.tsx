
import { useState, useEffect } from 'react';

interface SwipeDetectorProps {
  onSwipeDetected: () => void;
}

const SwipeDetector: React.FC<SwipeDetectorProps> = ({ onSwipeDetected }) => {
  const [touchSequence, setTouchSequence] = useState<number[]>([]);
  
  useEffect(() => {
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
          onSwipeDetected();
          setTouchSequence([]);
        }
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, [touchSequence, onSwipeDetected]);
  
  return null;
};

export default SwipeDetector;
