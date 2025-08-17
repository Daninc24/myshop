import React, { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getAdvertTemplateById } from './AdvertTemplates';

const AdvertisementBanner = ({ 
  type = 'banner', // 'banner', 'sidebar', 'inline', 'popup'
  position = 'top', // 'top', 'middle', 'bottom', 'sidebar'
  ads = [],
  autoPlay = true,
  interval = 5000,
  showCloseButton = true,
  showNavigation = true,
  className = '',
  template = 'compact-image-banner' // Default to compact image banner template
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

  // Get the template to use
  const selectedTemplate = getAdvertTemplateById(template);

  // Different styles based on type and position
  const getBannerStyles = () => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300';
    
    switch (type) {
      case 'banner':
        return `${baseStyles} w-full`;
      case 'sidebar':
        return `${baseStyles} w-64`;
      case 'inline':
        return `${baseStyles} w-full max-w-4xl mx-auto`;
      case 'popup':
        return `${baseStyles} fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96`;
      default:
        return baseStyles;
    }
  };

  const getContainerStyles = () => {
    const baseStyles = 'relative';
    
    switch (position) {
      case 'top':
        return `${baseStyles} mb-2`;
      case 'middle':
        return `${baseStyles} my-2`;
      case 'bottom':
        return `${baseStyles} mt-2`;
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
            className="absolute top-1 right-1 z-10 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
            aria-label="Close advertisement"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}

        {/* Ad content using compact template */}
        <div
          className="relative cursor-pointer group"
          onClick={() => handleAdClick(currentAd)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Render the compact template */}
          {selectedTemplate && selectedTemplate.render({
            title: currentAd.title,
            message: currentAd.description,
            image: currentAd.image,
            product: currentAd.product,
            productId: currentAd.productId || currentAd.id
          })}

          {/* Navigation arrows for multiple ads */}
          {showNavigation && ads.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevAd();
                }}
                className="absolute left-1 top-1/2 transform -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Previous advertisement"
              >
                <ChevronLeftIcon className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextAd();
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Next advertisement"
              >
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Ad indicators for multiple ads */}
        {ads.length > 1 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Ad label */}
        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
          Ad
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;
