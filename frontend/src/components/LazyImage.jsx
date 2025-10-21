import React, { useState, useRef, useEffect } from 'react';

const LazyImage = React.memo(({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  placeholder = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  onLoad,
  onError,
  quality = 'auto',
  format = 'auto',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Optimize image URL with Cloudinary transformations
  const getOptimizedImageUrl = (imageUrl) => {
    if (!imageUrl || hasError) return placeholder;
    
    // If it's already a Cloudinary URL, add optimizations
    if (imageUrl.includes('cloudinary.com')) {
      const transformations = [];
      
      // Add format optimization
      if (format === 'auto') {
        transformations.push('f_auto');
      } else if (format !== 'original') {
        transformations.push(`f_${format}`);
      }
      
      // Add quality optimization
      if (quality === 'auto') {
        transformations.push('q_auto');
      } else if (quality !== 'original') {
        transformations.push(`q_${quality}`);
      }
      
      // Add dimensions if provided
      if (width && height) {
        transformations.push(`w_${width}`, `h_${height}`, 'c_fill');
      } else if (width) {
        transformations.push(`w_${width}`, 'c_scale');
      } else if (height) {
        transformations.push(`h_${height}`, 'c_scale');
      }
      
      // Add progressive JPEG loading
      transformations.push('fl_progressive');
      
      if (transformations.length > 0) {
        return imageUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
      }
    }
    
    return imageUrl;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Load the actual image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const optimizedSrc = getOptimizedImageUrl(src);
    
    // Preload the image
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setCurrentSrc(placeholder);
      onError?.();
    };
    
    img.src = optimizedSrc;
  }, [isInView, src, width, height, quality, format, placeholder, onLoad, onError]);

  // Generate WebP source for modern browsers
  const getWebPSource = () => {
    if (!src || hasError) return null;
    
    if (src.includes('cloudinary.com')) {
      const transformations = ['f_webp'];
      
      if (quality === 'auto') {
        transformations.push('q_auto');
      } else if (quality !== 'original') {
        transformations.push(`q_${quality}`);
      }
      
      if (width && height) {
        transformations.push(`w_${width}`, `h_${height}`, 'c_fill');
      } else if (width) {
        transformations.push(`w_${width}`, 'c_scale');
      } else if (height) {
        transformations.push(`h_${height}`, 'c_scale');
      }
      
      return src.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    
    return null;
  };

  const webpSrc = getWebPSource();

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      {...props}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
      
      {/* Progressive image loading with WebP support */}
      {isInView && (
        <picture>
          {webpSrc && (
            <source srcSet={webpSrc} type="image/webp" />
          )}
          <img
            src={currentSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => {
              setIsLoaded(true);
              onLoad?.();
            }}
            onError={() => {
              setHasError(true);
              setCurrentSrc(placeholder);
              onError?.();
            }}
          />
        </picture>
      )}
      
      {/* Error state */}
      {hasError && isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default LazyImage;