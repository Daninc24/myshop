import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const AdvertisementBanner = ({ 
  type = 'banner', // 'banner', 'sidebar', 'inline', 'popup'
  position = 'top', // 'top', 'middle', 'bottom', 'sidebar'
  ads = [],
  autoPlay = true,
  interval = 5000,
  showCloseButton = true,
  showNavigation = true,
  className = ''
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || ads.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, ads.length, interval, isPaused]);

  // Handle ad click
  const handleAdClick = (ad) => {
    if (ad.link) {
      // Track ad click
      if (window.gtag) {
        window.gtag('event', 'ad_click', {
          ad_id: ad.id,
          ad_position: position,
          ad_type: type
        });
      }
      
      // Open ad link
      window.open(ad.link, ad.target || '_blank');
    }
  };

  // Navigation functions
  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  // Close banner
  const closeBanner = () => {
    setIsVisible(false);
    // Track banner close
    if (window.gtag) {
      window.gtag('event', 'ad_close', {
        ad_id: ads[currentAdIndex]?.id,
        ad_position: position,
        ad_type: type
      });
    }
  };

  // Don't render if no ads or hidden
  if (!ads.length || !isVisible) return null;

  const currentAd = ads[currentAdIndex];

  // Different styles based on type and position
  const getBannerStyles = () => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300';
    
    switch (type) {
      case 'banner':
        return `${baseStyles} w-full`;
      case 'sidebar':
        return `${baseStyles} w-64 h-10`;
      case 'inline':
        return `${baseStyles} w-full max-w-4xl mx-auto`;
      case 'popup':
        return `${baseStyles} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 h-10`;
      default:
        return baseStyles;
    }
  };

  const getContainerStyles = () => {
    const baseStyles = 'relative bg-white rounded-lg shadow-lg';
    
    switch (position) {
      case 'top':
        return `${baseStyles} mb-6`;
      case 'middle':
        return `${baseStyles} my-8`;
      case 'bottom':
        return `${baseStyles} mt-6`;
      case 'sidebar':
        return `${baseStyles} sticky top-4`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className={`${getBannerStyles()} ${className}`}>
      <div className={getContainerStyles()}>
        {/* Close button */}
        {showCloseButton && type !== 'inline' && (
          <button
            onClick={closeBanner}
            className="absolute top-2 right-2 z-10 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            aria-label="Close advertisement"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}

        {/* Ad content */}
        <div
          className="relative cursor-pointer group"
          onClick={() => handleAdClick(currentAd)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Ad image */}
          <img
            src={currentAd.image}
            alt={currentAd.title || 'Advertisement'}
            className="w-full h-auto object-cover"
            loading="lazy"
          />

          {/* Ad overlay with text */}
          {currentAd.title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="p-4 text-white">
                <h3 className="font-semibold text-lg mb-1">{currentAd.title}</h3>
                {currentAd.description && (
                  <p className="text-sm opacity-90">{currentAd.description}</p>
                )}
                {currentAd.cta && (
                  <span className="inline-block mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors">
                    {currentAd.cta}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Navigation arrows */}
          {showNavigation && ads.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevAd();
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Previous advertisement"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextAd();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Next advertisement"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Ad indicators */}
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Ad label */}
        <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;
