import { useState, useEffect } from 'react';

/**
 * Custom hook for managing responsive/mobile detection
 * @returns {Object} Object containing isMobile state and setter
 */
export const useResponsive = () => {
  // Responsive state - detects if window width is less than 640px
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  // Effect to handle window resize and update mobile state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    setIsMobile
  };
};
