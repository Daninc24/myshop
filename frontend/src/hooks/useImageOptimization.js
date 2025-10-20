import { useState, useCallback, useRef, useEffect } from 'react';

export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const preloadCache = useRef(new Map());

  // Get optimized image URL with Cloudinary transformations
  const getOptimizedImageUrl = useCallback((url, options = {}) => {
    if (!url) return null;
    
    const { 
      width, 
      height, 
      quality = 'auto', 
      format = 'auto',
      crop = 'fill',
      progressive = true,
      dpr = window.devicePixelRatio || 1
    } = options;
    
    // If it's already a Cloudinary URL, add optimizations
    if (url.includes('cloudinary.com')) {
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
      
      // Add device pixel ratio for high-DPI displays
      if (dpr > 1) {
        transformations.push(`dpr_${Math.min(dpr, 3)}`); // Cap at 3x for performance
      }
      
      // Add dimensions
      if (width && height) {
        transformations.push(`w_${Math.round(width)}`, `h_${Math.round(height)}`, `c_${crop}`);
      } else if (width) {
        transformations.push(`w_${Math.round(width)}`, 'c_scale');
      } else if (height) {
        transformations.push(`h_${Math.round(height)}`, 'c_scale');
      }
      
      // Add progressive JPEG loading
      if (progressive) {
        transformations.push('fl_progressive');
      }
      
      if (transformations.length > 0) {
        return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
      }
    }
    
    return url;
  }, []);

  // Preload image with caching
  const preloadImage = useCallback((src, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('No image source provided'));
        return;
      }

      const optimizedSrc = getOptimizedImageUrl(src, options);
      
      // Check if already loaded
      if (loadedImages.has(optimizedSrc)) {
        resolve(optimizedSrc);
        return;
      }
      
      // Check if already failed
      if (failedImages.has(optimizedSrc)) {
        reject(new Error('Image previously failed to load'));
        return;
      }
      
      // Check cache
      if (preloadCache.current.has(optimizedSrc)) {
        const cached = preloadCache.current.get(optimizedSrc);
        if (cached.status === 'loaded') {
          resolve(optimizedSrc);
          return;
        } else if (cached.status === 'failed') {
          reject(new Error('Image failed to load'));
          return;
        } else if (cached.status === 'loading') {
          // Return existing promise
          cached.promise.then(resolve).catch(reject);
          return;
        }
      }
      
      const img = new Image();
      const promise = new Promise((res, rej) => {
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, optimizedSrc]));
          preloadCache.current.set(optimizedSrc, { status: 'loaded', img });
          res(optimizedSrc);
        };
        
        img.onerror = () => {
          setFailedImages(prev => new Set([...prev, optimizedSrc]));
          preloadCache.current.set(optimizedSrc, { status: 'failed' });
          rej(new Error('Failed to load image'));
        };
      });
      
      // Cache the loading promise
      preloadCache.current.set(optimizedSrc, { status: 'loading', promise });
      
      img.src = optimizedSrc;
      promise.then(resolve).catch(reject);
    });
  }, [getOptimizedImageUrl, loadedImages, failedImages]);

  // Preload multiple images
  const preloadImages = useCallback(async (sources, options = {}) => {
    const results = await Promise.allSettled(
      sources.map(src => preloadImage(src, options))
    );
    
    return results.map((result, index) => ({
      src: sources[index],
      success: result.status === 'fulfilled',
      url: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }, [preloadImage]);

  // Get responsive image sources for different screen sizes
  const getResponsiveImageSources = useCallback((src, sizes = {}) => {
    if (!src) return [];
    
    const defaultSizes = {
      mobile: { width: 400, height: 400 },
      tablet: { width: 600, height: 600 },
      desktop: { width: 800, height: 800 }
    };
    
    const responsiveSizes = { ...defaultSizes, ...sizes };
    
    return Object.entries(responsiveSizes).map(([breakpoint, dimensions]) => ({
      breakpoint,
      src: getOptimizedImageUrl(src, dimensions),
      ...dimensions
    }));
  }, [getOptimizedImageUrl]);

  // Generate srcSet for responsive images
  const generateSrcSet = useCallback((src, widths = [400, 600, 800, 1200]) => {
    if (!src) return '';
    
    return widths
      .map(width => {
        const optimizedSrc = getOptimizedImageUrl(src, { width });
        return `${optimizedSrc} ${width}w`;
      })
      .join(', ');
  }, [getOptimizedImageUrl]);

  // Clear cache (useful for memory management)
  const clearCache = useCallback(() => {
    preloadCache.current.clear();
    setLoadedImages(new Set());
    setFailedImages(new Set());
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      totalCached: preloadCache.current.size,
      loadedCount: loadedImages.size,
      failedCount: failedImages.size,
      loadingCount: Array.from(preloadCache.current.values()).filter(
        item => item.status === 'loading'
      ).length
    };
  }, [loadedImages.size, failedImages.size]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  return {
    getOptimizedImageUrl,
    preloadImage,
    preloadImages,
    getResponsiveImageSources,
    generateSrcSet,
    clearCache,
    getCacheStats,
    loadedImages,
    failedImages
  };
};

export default useImageOptimization;