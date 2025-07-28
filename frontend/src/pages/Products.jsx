import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet';


import { useParams, useLocation, useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync selectedCategory/subcategory with URL params
  useEffect(() => {
    if (location.pathname.startsWith('/category/')) {
      const { categoryId, subcategoryId } = params;
      setSelectedCategory(categoryId || 'all');
      setSelectedSubcategory(subcategoryId || '');
    } else {
      setSelectedCategory('all');
      setSelectedSubcategory('');
    }
  }, [params, location.pathname]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const { showToast } = useToast();
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Computers & Laptops', name: 'Computers & Laptops' },
    { id: 'Mobile Phones', name: 'Mobile Phones' },
    { id: 'Accessories', name: 'Accessories' },
    { id: 'Home & Kitchen', name: 'Home & Kitchen' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Fashion', name: 'Fashion' },
    { id: 'Beauty', name: 'Beauty & Personal Care' },
    { id: 'Toys', name: 'Toys & Games' },
    { id: 'Books', name: 'Books' },
    { id: 'Automotive', name: 'Automotive' },
    { id: 'Groceries', name: 'Groceries' },
    { id: 'Health', name: 'Health & Wellness' },
    { id: 'Office', name: 'Office Supplies' },
    { id: 'Garden', name: 'Garden & Outdoors' },
    { id: 'Pets', name: 'Pet Supplies' },
    { id: 'Baby', name: 'Baby & Kids' },
    { id: 'Music', name: 'Music & Instruments' },
    { id: 'Art', name: 'Art & Craft' },
    { id: 'Jewelry', name: 'Jewelry' },
    { id: 'Shoes', name: 'Shoes' },
    { id: 'Bags', name: 'Bags & Luggage' },
    { id: 'Watches', name: 'Watches' },
    { id: 'Phones', name: 'Phones & Tablets' },
    { id: 'Cameras', name: 'Cameras & Photography' },
    { id: 'Gaming', name: 'Gaming' },
    { id: 'Stationery', name: 'Stationery' },
    { id: 'Food', name: 'Food & Beverages' },
    { id: 'Tools', name: 'Tools & Hardware' },
    { id: 'Travel', name: 'Travel' },
    { id: 'Fitness', name: 'Fitness & Exercise' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy, sortOrder, pagination.page, pagination.limit]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Convert UI sort options to API parameters
      let sort = 'createdAt';
      let order = 'desc';
      
      switch (sortBy) {
        case 'name':
          sort = 'title';
          order = 'asc';
          break;
        case 'name-desc':
          sort = 'title';
          order = 'desc';
          break;
        case 'price':
          sort = 'price';
          order = 'asc';
          break;
        case 'price-desc':
          sort = 'price';
          order = 'desc';
          break;
        case 'newest':
          sort = 'createdAt';
          order = 'desc';
          break;
        default:
          sort = 'createdAt';
          order = 'desc';
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      params.append('sort', sort);
      params.append('order', order);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      // Price range filters would need to be implemented on the backend
      // For now, we'll filter them client-side after fetching
      
      const response = await axios.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      });
    } catch (error) {
      showToast('Error fetching products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Client-side price filtering (until backend supports it)
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        // Product category can be string or object; support both
        if (!product.category) return false;
        if (typeof product.category === 'string') {
          return product.category === selectedCategory;
        }
        if (typeof product.category === 'object') {
          return product.category.id === selectedCategory || product.category.name === selectedCategory;
        }
        return false;
      });
    }
    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(product => {
        if (!product.subcategory) return false;
        // subcategory can be string or object
        if (typeof product.subcategory === 'string') {
          return product.subcategory === selectedSubcategory;
        }
        if (typeof product.subcategory === 'object') {
          return product.subcategory.id === selectedSubcategory || product.subcategory.name === selectedSubcategory;
        }
        return false;
      });
    }

    // Price range filter (client-side for now)
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }
    return filtered;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Products - MyShopping Center</title>
        <meta name="description" content="Browse all products at MyShopping Center. Find the best deals in electronics, fashion, home, and more!" />
        <meta name="keywords" content="products, shopping, deals, electronics, fashion, home, online store" />
        <meta property="og:title" content="Products - MyShopping Center" />
        <meta property="og:description" content="Browse all products at MyShopping Center. Find the best deals in electronics, fashion, home, and more!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myshoppingcenter.com/products" />
        <meta property="og:image" content="https://myshoppingcenter.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Products - MyShopping Center" />
        <meta name="twitter:description" content="Browse all products at MyShopping Center. Find the best deals in electronics, fashion, home, and more!" />
        <meta name="twitter:image" content="https://myshoppingcenter.com/logo.png" />
        <link rel="canonical" href="https://myshoppingcenter.com/products" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://myshoppingcenter.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": "https://myshoppingcenter.com/products"
              }
            ]
          }
        `}</script>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8 gap-4">
            <MagnifyingGlassIcon className="h-7 w-7 text-primary mr-2" />
            <h2 className="text-3xl font-heading font-bold text-secondary">Browse Products</h2>
          </div>
          {/* Filter and Sort Controls */} 
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            {/* Search and Desktop Filters */} 
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="input-field pr-10 w-full"
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {/* Desktop-only filters */} 
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input-field hidden md:block"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="input-field hidden md:block"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile Filter/Sort Button and View Mode */} 
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowFilters(true)}
                className="btn-secondary md:hidden flex items-center gap-2 flex-grow justify-center"
              >
                <FunnelIcon className="h-5 w-5" />
                Filters & Sort
              </button>

              {/* View Mode Toggle */} 
              <div className="flex bg-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  aria-label="List view"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Modal/Sidebar */} 
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end md:hidden">
              <div className="bg-surface w-full max-w-sm h-full shadow-lg p-6 animate-slide-in-right overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-heading font-bold text-secondary">Filters & Sort</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="mobile-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      id="mobile-category"
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="input-field w-full"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mobile-min-price" className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <input
                      id="mobile-min-price"
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min}
                      onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile-max-price" className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <input
                      id="mobile-max-price"
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max}
                      onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile-sort-by" className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      id="mobile-sort-by"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="input-field w-full"
                    >
                      {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <button onClick={() => { clearFilters(); setShowFilters(false); }} className="btn-secondary w-full mt-4">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in' : 'flex flex-col gap-4 animate-fade-in'}>
            {getFilteredProducts().length > 0 ? (
              getFilteredProducts().map(product => (
                <ProductCard key={product._id} product={product} altText={product.title} viewMode={viewMode} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">No products available at the moment.</p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button 
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-md ${pagination.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-2">
                {[...Array(pagination.pages).keys()].map(i => {
                  const pageNum = i + 1;
                  // Only show a window of pages around current page
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.pages || 
                    (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-md ${pageNum === pagination.page ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.page - 3 || 
                    pageNum === pagination.page + 3
                  ) {
                    return <span key={pageNum} className="self-center">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages}
                className={`px-4 py-2 rounded-md ${pagination.page === pagination.pages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;