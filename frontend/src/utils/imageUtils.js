// Image optimization utility with better performance
const getOptimizedImageUrl = (imagePath, size = 'medium') => {
  if (!imagePath) return '';

  // Handle data:image (base64) strings directly
  if (imagePath.startsWith('data:image')) {
    // For very large base64 images, we might want to limit their size
    // or convert them to a more manageable format
    // For now, let's just return them as-is but add a size limit check
    if (imagePath.length > 1000000) { // If base64 is larger than ~1MB
      console.warn('Large base64 image detected, consider using Cloudinary for better performance');
      // For now, return a placeholder instead of the large base64
      return '/placeholder-image.svg';
    }
    return imagePath;
  }

  // Construct URL for images from /uploads with size optimization
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://myshop-hhfv.onrender.com') + '/api';
    const filename = imagePath.split('/').pop();
    
    // Map size to actual dimensions for better performance
    const sizeMap = {
      'thumbnail': 'w=100&h=100&fit=crop',
      'small': 'w=200&h=200&fit=crop',
      'medium': 'w=400&h=400&fit=crop',
      'large': 'w=800&h=800&fit=crop',
      'original': ''
    };
    
    const sizeParams = sizeMap[size] || sizeMap.medium;
    return `${baseUrl}/images/${filename}?${sizeParams}`;
  }

  // Handle Cloudinary URLs with optimization
  if (imagePath.includes('cloudinary.com')) {
    const sizeMap = {
      'thumbnail': 'w_100,h_100,c_crop',
      'small': 'w_200,h_200,c_crop',
      'medium': 'w_400,h_400,c_crop',
      'large': 'w_800,h_800,c_crop',
      'original': ''
    };
    
    const sizeParams = sizeMap[size] || sizeMap.medium;
    if (sizeParams) {
      // Insert size parameters into Cloudinary URL
      const parts = imagePath.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1) {
        parts.splice(uploadIndex + 1, 0, sizeParams);
        return parts.join('/');
      }
    }
  }

  // Assume it's already a full URL or other valid path
  return imagePath;
};

// Generate srcSet for responsive images
const getImageSrcSet = (imagePath) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  const sizes = [
    { size: 'thumbnail', width: 100 },
    { size: 'small', width: 200 },
    { size: 'medium', width: 400 },
    { size: 'large', width: 800 }
  ];

  return sizes
    .map(({ size, width }) => `${getOptimizedImageUrl(imagePath, size)} ${width}w`)
    .join(', ');
};

// Lazy loading image component props
const getLazyImageProps = (imagePath, alt = '') => {
  return {
    src: getOptimizedImageUrl(imagePath, 'medium'),
    srcSet: getImageSrcSet(imagePath),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    loading: 'lazy',
    alt,
    onError: (e) => {
      // Fallback to a placeholder image
      e.target.src = '/placeholder-image.svg';
    }
  };
};

// Preload critical images
const preloadImage = (imagePath) => {
  if (!imagePath) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(imagePath, 'medium');
  document.head.appendChild(link);
};

export { 
  getOptimizedImageUrl, 
  getImageSrcSet, 
  getLazyImageProps, 
  preloadImage 
};