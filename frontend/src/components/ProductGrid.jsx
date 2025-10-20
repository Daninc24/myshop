import React, { memo } from 'react';
import ProductCard from './ProductCard';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import { getGridCols } from '../utils/responsiveHelpers';

const ProductGrid = ({ products, viewMode, loading }) => {
  const { screenSize, isMobile } = useResponsiveLayout();
  const gridCols = getGridCols(screenSize);
  
  // Responsive grid classes
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'flex flex-col gap-2 animate-fade-in';
    }
    
    if (isMobile) {
      return 'grid grid-cols-2 gap-2 animate-fade-in';
    }
    
    return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(gridCols, 4)} gap-4 sm:gap-6 lg:gap-8 animate-fade-in`;
  };

  if (loading) {
    return (
      <div className={getGridClasses()}>
        {Array.from({ length: isMobile ? 8 : 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            {isMobile ? (
              // Mobile skeleton - compact horizontal layout
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-3 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              // Desktop skeleton - vertical layout
              <div>
                <div className="bg-gray-200 rounded-2xl h-48 w-full mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <p className="text-gray-500 text-lg">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
      {products.map(product => (
        <ProductCard 
          key={product._id} 
          product={product} 
          altText={product.title} 
          viewMode={viewMode}
          variant={isMobile ? 'compact' : 'default'}
        />
      ))}
    </div>
  );
};

export default memo(ProductGrid);
