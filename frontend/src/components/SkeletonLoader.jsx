import React from 'react';

// Skeleton components for better loading experience
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-8"></div>
      </div>
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const CategoryGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <CategoryCardSkeleton key={index} />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-gray-300"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
    <div className="absolute bottom-8 left-8 right-8">
      <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-white/20 rounded w-2/3 mb-6"></div>
      <div className="flex gap-4">
        <div className="h-12 bg-white/20 rounded w-32"></div>
        <div className="h-12 bg-white/20 rounded w-32"></div>
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex items-center space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-gray-200 rounded ${
                colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-20' : 'w-1/3'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

export const ListSkeleton = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const SearchSkeleton = () => (
  <div className="w-full max-w-2xl mx-auto animate-pulse">
    <div className="relative">
      <div className="h-12 bg-gray-200 rounded-full"></div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-6 h-6 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

export const NavigationSkeleton = () => (
  <div className="bg-white border-b border-gray-200 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="hidden md:flex space-x-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-16"></div>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  </div>
);

// Shimmer effect component
export const Shimmer = ({ className = "h-4 bg-gray-200 rounded" }) => (
  <div className={`${className} relative overflow-hidden`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
  </div>
);

export default {
  ProductCardSkeleton,
  CategoryCardSkeleton,
  ProductGridSkeleton,
  CategoryGridSkeleton,
  HeroSkeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  SearchSkeleton,
  NavigationSkeleton,
  Shimmer
};
