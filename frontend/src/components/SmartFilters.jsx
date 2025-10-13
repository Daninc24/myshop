import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  StarIcon,
  CurrencyDollarIcon,
  TagIcon,
  SwatchIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const PriceRangeSlider = ({ priceRange, setPriceRange, maxPrice = 1000 }) => {
  const [localRange, setLocalRange] = useState(priceRange);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceRange(localRange);
    }, 300);
    return () => clearTimeout(timer);
  }, [localRange, setPriceRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">Price Range</label>
        <span className="text-sm text-slate-500">
          ${localRange[0]} - ${localRange[1]}
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={localRange[0]}
          onChange={(e) => setLocalRange([parseInt(e.target.value), localRange[1]])}
          className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={localRange[1]}
          onChange={(e) => setLocalRange([localRange[0], parseInt(e.target.value)])}
          className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <div className="relative h-2 bg-slate-200 rounded-lg">
          <div
            className="absolute h-2 bg-brand-gradient rounded-lg"
            style={{
              left: `${(localRange[0] / maxPrice) * 100}%`,
              width: `${((localRange[1] - localRange[0]) / maxPrice) * 100}%`
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <input
          type="number"
          value={localRange[0]}
          onChange={(e) => setLocalRange([parseInt(e.target.value) || 0, localRange[1]])}
          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
          placeholder="Min"
        />
        <span className="text-slate-400">to</span>
        <input
          type="number"
          value={localRange[1]}
          onChange={(e) => setLocalRange([localRange[0], parseInt(e.target.value) || maxPrice])}
          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary"
          placeholder="Max"
        />
      </div>
    </div>
  );
};

const RatingFilter = ({ selectedRating, setSelectedRating }) => {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Customer Rating</label>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <label key={rating} className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="rating"
              value={rating}
              checked={selectedRating === rating}
              onChange={(e) => setSelectedRating(parseInt(e.target.value))}
              className="sr-only"
            />
            <div className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
              selectedRating === rating 
                ? 'bg-brand-primary/10 border border-brand-primary' 
                : 'hover:bg-slate-50'
            }`}>
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    className={`w-4 h-4 ${
                      index < rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">& up</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

const BrandFilter = ({ brands, selectedBrands, setSelectedBrands }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedBrands = showAll ? filteredBrands : filteredBrands.slice(0, 5);

  const toggleBrand = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Brand</label>
      
      {brands.length > 5 && (
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      )}
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {displayedBrands.map((brand) => (
          <label key={brand.id} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand.id)}
              onChange={() => toggleBrand(brand.id)}
              className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-900">
              {brand.name}
            </span>
            {brand.count && (
              <span className="ml-auto text-xs text-slate-500">
                ({brand.count})
              </span>
            )}
          </label>
        ))}
      </div>
      
      {filteredBrands.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-brand-primary hover:text-brand-primary-dark"
        >
          {showAll ? 'Show Less' : `Show All (${filteredBrands.length})`}
        </button>
      )}
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategories, setSelectedCategories }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Categories</label>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer group flex-1">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-900">
                  {category.name}
                </span>
                {category.count && (
                  <span className="ml-auto text-xs text-slate-500">
                    ({category.count})
                  </span>
                )}
              </label>
              {category.subcategories && category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="ml-2 p-1 hover:bg-slate-100 rounded"
                >
                  <ChevronDownIcon
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      expandedCategories.has(category.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {expandedCategories.has(category.id) && category.subcategories && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 mt-2 space-y-2 overflow-hidden"
                >
                  {category.subcategories.map((subcategory) => (
                    <label key={subcategory.id} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(subcategory.id)}
                        onChange={() => toggleCategory(subcategory.id)}
                        className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-800">
                        {subcategory.name}
                      </span>
                      {subcategory.count && (
                        <span className="ml-auto text-xs text-slate-400">
                          ({subcategory.count})
                        </span>
                      )}
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const ColorFilter = ({ colors, selectedColors, setSelectedColors }) => {
  const toggleColor = (colorId) => {
    setSelectedColors(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Colors</label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => toggleColor(color.id)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selectedColors.includes(color.id)
                ? 'border-slate-900 scale-110'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {selectedColors.includes(color.id) && (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const AvailabilityFilter = ({ availability, setAvailability }) => {
  const options = [
    { id: 'in-stock', label: 'In Stock', count: 245 },
    { id: 'out-of-stock', label: 'Out of Stock', count: 12 },
    { id: 'pre-order', label: 'Pre-order', count: 8 }
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Availability</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.id} className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={availability.includes(option.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setAvailability(prev => [...prev, option.id]);
                } else {
                  setAvailability(prev => prev.filter(id => id !== option.id));
                }
              }}
              className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-900">
              {option.label}
            </span>
            <span className="ml-auto text-xs text-slate-500">
              ({option.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

const SmartFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters,
  onApplyFilters,
  onClearFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Sample data - in real app, this would come from props or API
  const brands = [
    { id: 'apple', name: 'Apple', count: 45 },
    { id: 'samsung', name: 'Samsung', count: 38 },
    { id: 'nike', name: 'Nike', count: 67 },
    { id: 'adidas', name: 'Adidas', count: 52 }
  ];

  const categories = [
    {
      id: 'electronics',
      name: 'Electronics',
      count: 156,
      subcategories: [
        { id: 'phones', name: 'Phones', count: 45 },
        { id: 'laptops', name: 'Laptops', count: 32 }
      ]
    },
    { id: 'fashion', name: 'Fashion', count: 234 },
    { id: 'home', name: 'Home & Garden', count: 89 }
  ];

  const colors = [
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'red', name: 'Red', hex: '#EF4444' },
    { id: 'blue', name: 'Blue', hex: '#3B82F6' },
    { id: 'green', name: 'Green', hex: '#10B981' },
    { id: 'yellow', name: 'Yellow', hex: '#F59E0B' }
  ];

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (localFilters.priceRange && (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 1000)) count++;
    if (localFilters.rating) count++;
    if (localFilters.brands?.length > 0) count++;
    if (localFilters.categories?.length > 0) count++;
    if (localFilters.colors?.length > 0) count++;
    if (localFilters.availability?.length > 0) count++;
    
    setActiveFiltersCount(count);
  }, [localFilters]);

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 1000],
      rating: null,
      brands: [],
      categories: [],
      colors: [],
      availability: []
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onClearFilters();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-brand-primary mr-2" />
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-brand-primary text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Filters Content */}
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <PriceRangeSlider
            priceRange={localFilters.priceRange || [0, 1000]}
            setPriceRange={(range) => setLocalFilters(prev => ({ ...prev, priceRange: range }))}
          />

          {/* Rating */}
          <RatingFilter
            selectedRating={localFilters.rating}
            setSelectedRating={(rating) => setLocalFilters(prev => ({ ...prev, rating }))}
          />

          {/* Brands */}
          <BrandFilter
            brands={brands}
            selectedBrands={localFilters.brands || []}
            setSelectedBrands={(brands) => setLocalFilters(prev => ({ ...prev, brands }))}
          />

          {/* Categories */}
          <CategoryFilter
            categories={categories}
            selectedCategories={localFilters.categories || []}
            setSelectedCategories={(categories) => setLocalFilters(prev => ({ ...prev, categories }))}
          />

          {/* Colors */}
          <ColorFilter
            colors={colors}
            selectedColors={localFilters.colors || []}
            setSelectedColors={(colors) => setLocalFilters(prev => ({ ...prev, colors }))}
          />

          {/* Availability */}
          <AvailabilityFilter
            availability={localFilters.availability || []}
            setAvailability={(availability) => setLocalFilters(prev => ({ ...prev, availability }))}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 space-y-3">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-brand-gradient text-white py-3 rounded-xl font-medium hover:shadow-brand transition-all"
          >
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <button
            onClick={handleClearFilters}
            className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all"
          >
            Clear All
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SmartFilters;