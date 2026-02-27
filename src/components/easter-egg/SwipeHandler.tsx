
import React, { useEffect, useRef } from 'react';
import { Direction } from './types';

interface SwipeHandlerProps {
  onSwipe: (direction: Direction) => void;
  disabled?: boolean;
}

const SwipeHandler: React.FC<SwipeHandlerProps> = ({ onSwipe, disabled = false }) => {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const threshold = 50; // Minimum distance for a swipe to be detected
  
  useEffect(() => {
    if (disabled) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      
      // Prevent default behavior to avoid scrolling while swiping
      e.preventDefault();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX.current;
      const diffY = endY - startY.current;
      
      // Check if the swipe was significant enough to be detected
      if (Math.abs(diffX) < threshold && Math.abs(diffY) < threshold) {
        // Not a swipe, just a tap
        startX.current = null;
        startY.current = null;
        return;
      }
      
      // Determine swipe direction
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
          onSwipe('RIGHT');
        } else {
          onSwipe('LEFT');
        }
      } else {
        // Vertical swipe
        if (diffY > 0) {
          onSwipe('DOWN');
        } else {
          onSwipe('UP');
        }
      }
      
      startX.current = null;
      startY.current = null;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, disabled]);
  
  return null;
};

export default SwipeHandler;
