
import React, { useEffect, useState, useRef } from 'react';

interface ParallaxBackgroundProps {
  strength?: number;
  enabled?: boolean;
  children: React.ReactNode;
}

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ 
  strength = 0.3, 
  enabled = true,
  children 
}) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPosition = window.scrollY;
      setOffset(scrollPosition * strength);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [strength, enabled]);
  
  if (!enabled) {
    return <>{children}</>;
  }
  
  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden relative bg-white dark:bg-gray-900">
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          backgroundImage: `radial-gradient(circle at 30% 20%, rgba(51, 195, 240, 0.05) 0%, rgba(51, 195, 240, 0) 50%),
                            radial-gradient(circle at 80% 80%, rgba(51, 195, 240, 0.05) 0%, rgba(51, 195, 240, 0) 50%)`,
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxBackground;
