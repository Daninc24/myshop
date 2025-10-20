import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useResponsiveLayout = () => {
  const [screenSize, setScreenSize] = useState('lg');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < breakpoints.sm) {
        setScreenSize('xs');
      } else if (width < breakpoints.md) {
        setScreenSize('sm');
      } else if (width < breakpoints.lg) {
        setScreenSize('md');
      } else if (width < breakpoints.xl) {
        setScreenSize('lg');
      } else if (width < breakpoints['2xl']) {
        setScreenSize('xl');
      } else {
        setScreenSize('2xl');
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'md';
  const isDesktop = screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl';
  const isSmallScreen = screenSize === 'xs';

  return {
    screenSize,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    breakpoints
  };
};

export default useResponsiveLayout;