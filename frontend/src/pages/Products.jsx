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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
  }, [searchTerm, selectedCategory, priceRange, sortBy, sortOrder, pagination.page, pagination.limit]);

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
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field max-w-xs"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input-field max-w-xs"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Min price"
              value={priceRange.min}
              onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
              className="input-field max-w-xs"
            />
            <input
              type="number"
              placeholder="Max price"
              value={priceRange.max}
              onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
              className="input-field max-w-xs"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field max-w-xs"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={clearFilters} className="btn-secondary ml-2">Clear Filters</button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in">
            {getFilteredProducts().length > 0 ? (
              getFilteredProducts().map(product => (
                <ProductCard key={product._id} product={product} altText={product.title} />
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