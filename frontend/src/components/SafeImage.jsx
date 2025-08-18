import React, { useState } from 'react';

const SafeImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      if (onError) onError(e);
    }
  };

  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default SafeImage;
