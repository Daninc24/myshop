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
import { Drawer, Select, Segmented, Pagination, Input, Button, Space } from 'antd';


import { useParams, useLocation, useNavigate } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Categories' }]);
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
  const [onlyInStock, setOnlyInStock] = useState(false);
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

  // Load categories dynamically from backend
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/categories');
        const list = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.categories) ? res.data.categories : []);
        const mapped = [{ id: 'all', name: 'All Categories' }].concat(
          list.map(c => ({ id: c.id || c._id || c.name, name: c.name, subcategories: c.subcategories || [] }))
        );
        if (!cancelled) setCategories(mapped);
      } catch (e) {
        // keep default
      }
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest First' }
  ];

  // Initialize search and category from URL query params
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const initialSearch = query.get('search') || '';
    const initialCategory = query.get('category');
    const initialSubcategory = query.get('subcategory');
    setSearchTerm(initialSearch);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSubcategory) setSelectedSubcategory(initialSubcategory);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [location.search]);

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
      if (selectedSubcategory) {
        params.append('subcategory', selectedSubcategory);
      }
      
      if (priceRange.min !== '') {
        params.append('minPrice', priceRange.min);
      }
      if (priceRange.max !== '') {
        params.append('maxPrice', priceRange.max);
      }
      if (onlyInStock) {
        params.append('inStock', 'true');
      }
      
      const response = await axios.get(`/products?${params.toString()}`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.products || []);
      setProducts(list);
      setPagination(Array.isArray(data) ? {
        page: 1,
        limit: list.length,
        total: list.length,
        pages: 1
      } : (data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      }));
    } catch (error) {
      showToast('Error fetching products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Client-side safeguard filters (kept minimal)
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
    // Subcategory filter (client-side safeguard)
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

    if (onlyInStock) {
      filtered = filtered.filter(p => (typeof p.stock === 'number' ? p.stock > 0 : true));
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
          {/* Advert Banner */}
          <div className="mb-12 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-secondary">
            <div className="p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Summer Sale!</h3>
              <p className="mb-4">Up to 50% off selected items</p>
              <button className="px-6 py-2 bg-white text-primary rounded-full hover:bg-opacity-90 transition">
                Shop Now
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center mb-8 gap-4">
            <MagnifyingGlassIcon className="h-7 w-7 text-primary mr-2" />
            <h2 className="text-3xl font-heading font-bold text-secondary">Browse Products</h2>
          </div>
          {/* Filter and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            {/* Search and Desktop Filters */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  size="middle"
                />
              </div>
              <Select
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedSubcategory('');
                  if (value === 'all') {
                    navigate('/products');
                  } else {
                    navigate(`/category/${encodeURIComponent(value)}`);
                  }
                }}
                className="hidden md:block"
                style={{ minWidth: 200 }}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              {selectedCategory !== 'all' && (categories.find(c => c.id === selectedCategory)?.subcategories?.length > 0) && (
                <Select
                  value={selectedSubcategory}
                  onChange={(value) => {
                    setSelectedSubcategory(value);
                    if (!value) {
                      navigate(`/category/${encodeURIComponent(selectedCategory)}`);
                    } else {
                      navigate(`/category/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(value)}`);
                    }
                  }}
                  placeholder="Subcategory"
                  className="hidden md:block"
                  style={{ minWidth: 200 }}
                  options={categories.find(c => c.id === selectedCategory).subcategories.map((s) => ({ value: s.id || s.name, label: s.name }))}
                />
              )}
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value)}
                className="hidden md:block"
                style={{ minWidth: 200 }}
                options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
              />
              <div className="hidden md:block">
                <Segmented
                  options={[
                    { label: 'Grid', value: 'grid' },
                    { label: 'List', value: 'list' },
                  ]}
                  value={viewMode}
                  onChange={(val) => setViewMode(val)}
                />
              </div>
            </div>

            {/* Mobile Filter/Sort Button and View Mode */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Button className="md:hidden" onClick={() => setShowFilters(true)} icon={null}>
                Filters & Sort
              </Button>
              <div className="md:hidden">
                <Segmented
                  options={[
                    { label: 'Grid', value: 'grid' },
                    { label: 'List', value: 'list' },
                  ]}
                  value={viewMode}
                  onChange={(val) => setViewMode(val)}
                />
              </div>
            </div>
          </div>

          {/* Mobile Filters Drawer */}
          <Drawer
            title="Filters & Sort"
            placement="right"
            onClose={() => setShowFilters(false)}
            open={showFilters}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <div className="mb-2 font-medium">Category</div>
                <Select
                  value={selectedCategory}
                  onChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedSubcategory('');
                    if (value === 'all') {
                      navigate('/products');
                    } else {
                      navigate(`/category/${encodeURIComponent(value)}`);
                    }
                  }}
                  style={{ width: '100%' }}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>
              {selectedCategory !== 'all' && (categories.find(c => c.id === selectedCategory)?.subcategories?.length > 0) && (
                <div>
                  <div className="mb-2 font-medium">Subcategory</div>
                  <Select
                    value={selectedSubcategory}
                    onChange={(value) => {
                      setSelectedSubcategory(value);
                      if (!value) {
                        navigate(`/category/${encodeURIComponent(selectedCategory)}`);
                      } else {
                        navigate(`/category/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(value)}`);
                      }
                    }}
                    style={{ width: '100%' }}
                    options={categories.find(c => c.id === selectedCategory).subcategories.map((s) => ({ value: s.id || s.name, label: s.name }))}
                  />
                </div>
              )}
              <div>
                <div className="mb-2 font-medium">Min Price</div>
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
              </div>
              <div>
                <div className="mb-2 font-medium">Max Price</div>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                  <span>Only show in-stock</span>
                </label>
              </div>
              <div>
                <div className="mb-2 font-medium">Sort By</div>
                <Select
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  style={{ width: '100%' }}
                  options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
                />
              </div>
              <Button onClick={() => { clearFilters(); setShowFilters(false); }} block>
                Clear Filters
              </Button>
            </Space>
          </Drawer>

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
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.pages * pagination.limit}
                onChange={(page) => handlePageChange(page)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;