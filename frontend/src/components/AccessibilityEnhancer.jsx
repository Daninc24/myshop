import React, { useEffect, useState, useRef } from 'react';

// Accessibility Enhancement Component
const AccessibilityEnhancer = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [focusVisible, setFocusVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showControls, setShowControls] = useState(false);
  const announcementRef = useRef(null);

  useEffect(() => {
    // Check user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Check high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);

    const handleContrastChange = (e) => setIsHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Apply focus visible styles
    const handleFocusVisible = () => setFocusVisible(true);
    const handleFocusInvisible = () => setFocusVisible(false);

    document.addEventListener('keydown', handleFocusVisible);
    document.addEventListener('mousedown', handleFocusInvisible);

    // Show controls on Alt+A
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setShowControls(!showControls);
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleFocusVisible);
      document.removeEventListener('mousedown', handleFocusInvisible);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Apply accessibility classes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (fontSize === 'large') {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [isReducedMotion, isHighContrast, fontSize, focusVisible]);

  // Announce to screen reader
  useEffect(() => {
    if (announcement && announcementRef.current) {
      announcementRef.current.textContent = announcement;
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [announcement]);

  const announceToScreenReader = (message) => {
    setAnnouncement(message);
  };

  return (
    <>
      {children}
      
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-600 text-white px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Accessibility controls */}
      {showControls && (
        <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-[200px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Accessibility</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`${fontSize === 'normal' ? 'Increase' : 'Decrease'} font size`}
            >
              <span>Font Size</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {fontSize === 'normal' ? 'Normal' : 'Large'}
              </span>
            </button>

            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast`}
            >
              <span>High Contrast</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {isHighContrast ? 'On' : 'Off'}
              </span>
            </button>

            <button
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`${isReducedMotion ? 'Disable' : 'Enable'} reduced motion`}
            >
              <span>Reduced Motion</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {isReducedMotion ? 'On' : 'Off'}
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowControls(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close accessibility controls"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Quick accessibility toggle */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 left-4 z-40 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label="Accessibility controls (Alt+A)"
        title="Accessibility controls (Alt+A)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </button>
    </>
  );
};

// Accessibility hook for components
export const useAccessibility = () => {
  const [announcement, setAnnouncement] = useState('');

  const announceToScreenReader = (message) => {
    setAnnouncement(message);
    // Clear after a short delay
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return { announceToScreenReader, announcement };
};

// Focus trap hook
export const useFocusTrap = (ref, isActive = false) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  };

  return { focusedIndex, handleKeyDown, setFocusedIndex };
};

export default AccessibilityEnhancer;
