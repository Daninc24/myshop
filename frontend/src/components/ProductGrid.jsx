import React, { memo } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, viewMode, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-24 w-24 mx-auto mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-6 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded"></div>
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
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 animate-fade-in' : 'flex flex-col gap-4 animate-fade-in'}>
      {products.map(product => (
        <ProductCard key={product._id} product={product} altText={product.title} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default memo(ProductGrid);
