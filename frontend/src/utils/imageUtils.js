const getOptimizedImageUrl = (imagePath, size = 'medium') => {
  if (!imagePath) return '';

  // Handle data:image (base64) strings directly
  if (imagePath.startsWith('data:image')) {
    return imagePath;
  }

  // Construct URL for images from /uploads
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://myshop-hhfv.onrender.com/api';
    const filename = imagePath.split('/').pop();
    // Append size parameter for potential future image optimization on backend
    return `${baseUrl}/images/${filename}?size=${size}`;
  }

  // Assume it's already a full URL (e.g., Cloudinary URL) or other valid path
  return imagePath;
};

export { getOptimizedImageUrl };