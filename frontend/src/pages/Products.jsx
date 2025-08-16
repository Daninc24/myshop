import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
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

// Lazy load heavy components
const ProductGrid = React.lazy(() => import('../components/ProductGrid'));

// Cache for API responses
const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [categories, setCategories] = useState([{ id: 'all', name: 'All Categories' }]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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
  
  // Facets and selected filters
  const [facets, setFacets] = useState({ categories: [], subcategories: [], priceRanges: [], options: {} });
  const [selectedBucket, setSelectedBucket] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});
  const { showToast } = useToast();

  // Memoized sort options
  const sortOptions = useMemo(() => [
    { value: 'name', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
    { value: 'newest', label: 'Newest First' }
  ], []);

  // Load categories with caching
  const fetchCategories = useCallback(async () => {
    const cacheKey = 'categories';
    const cached = apiCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setCategories(cached.data);
      return;
    }

    setCategoriesLoading(true);
    try {
      const res = await axios.get('/categories');
      const list = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.categories) ? res.data.categories : []);
      const mapped = [{ id: 'all', name: 'All Categories' }].concat(
        list.map(c => ({ id: c.id || c._id || c.name, name: c.name, subcategories: c.subcategories || [] }))
      );
      
      // Cache the result
      apiCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
      setCategories(mapped);
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  // Debounce search term to avoid excessive requests
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Memoized query parameters
  const queryParams = useMemo(() => {
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
    
    const params = new URLSearchParams();
    params.append('page', pagination.page);
    params.append('limit', pagination.limit);
    params.append('sort', sort);
    params.append('order', order);
    
    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
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

    // Apply price bucket mapping
    if (selectedBucket) {
      const bucketToRange = {
        under_25: { min: 0, max: 25 },
        '25_50': { min: 25, max: 50 },
        '50_100': { min: 50, max: 100 },
        '100_200': { min: 100, max: 200 },
        '200_plus': { min: 200, max: '' }
      };
      const br = bucketToRange[selectedBucket];
      if (br) {
        params.set('minPrice', br.min);
        if (br.max !== '') params.set('maxPrice', br.max);
        else params.delete('maxPrice');
      }
    }

    // Append selected variant options
    Object.entries(selectedOptions).forEach(([name, value]) => {
      if (value) params.append(`opt_${name}`, value);
    });

    return params.toString();
  }, [debouncedSearchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy, sortOrder, pagination.page, pagination.limit, onlyInStock, selectedBucket, selectedOptions]);

  // Fetch products with caching
  const fetchProducts = useCallback(async (signal) => {
    const cacheKey = `products_${queryParams}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setProducts(cached.data.products);
      setFacets(cached.data.facets);
      setPagination(cached.data.pagination);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/products?${queryParams}`, { signal });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.products || []);
      
      const result = {
        products: list,
        facets: !Array.isArray(data) ? (data.facets || { categories: [], subcategories: [], priceRanges: [], options: {} }) : { categories: [], subcategories: [], priceRanges: [], options: {} },
        pagination: Array.isArray(data) ? {
          page: 1,
          limit: list.length,
          total: list.length,
          pages: 1
        } : (data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        })
      };

      // Cache the result
      apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      setProducts(result.products);
      setFacets(result.facets);
      setPagination(result.pagination);
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return;
      }
      showToast('Error fetching products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams, showToast]);

  // Fetch products when query params change
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
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
    
    if (selectedSubcategory) {
      filtered = filtered.filter(product => {
        if (!product.subcategory) return false;
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
  }, [products, selectedCategory, selectedSubcategory, onlyInStock]);

  // Memoized handlers
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('');
    setPriceRange({ min: '', max: '' });
    setSelectedBucket('');
    setSelectedOptions({});
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
    setSelectedSubcategory('');
    if (value === 'all') {
      navigate('/products');
    } else {
      navigate(`/category/${encodeURIComponent(value)}`);
    }
  }, [navigate]);

  const handleSubcategoryChange = useCallback((value) => {
    setSelectedSubcategory(value);
    if (!value) {
      navigate(`/category/${encodeURIComponent(selectedCategory)}`);
    } else {
      navigate(`/category/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(value)}`);
    }
  }, [navigate, selectedCategory]);

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
                onChange={handleCategoryChange}
                className="hidden md:block"
                style={{ minWidth: 200 }}
                loading={categoriesLoading}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              {selectedCategory !== 'all' && (categories.find(c => c.id === selectedCategory)?.subcategories?.length > 0) && (
                <Select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
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
                  onChange={handleCategoryChange}
                  style={{ width: '100%' }}
                  loading={categoriesLoading}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>
              {selectedCategory !== 'all' && (categories.find(c => c.id === selectedCategory)?.subcategories?.length > 0) && (
                <div>
                  <div className="mb-2 font-medium">Subcategory</div>
                  <Select
                    value={selectedSubcategory}
                    onChange={handleSubcategoryChange}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Facets Sidebar (desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-4 sticky top-28">
                {/* In-stock toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
                    <span>Only show in-stock</span>
                  </label>
                </div>
                {/* Price Ranges */}
                <div className="mb-6">
                  <div className="font-semibold mb-2">Price</div>
                  <ul className="space-y-2">
                    {(facets.priceRanges || []).map((b) => (
                      <li key={b.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded border ${selectedBucket === b.id ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                          onClick={() => setSelectedBucket(prev => prev === b.id ? '' : b.id)}
                        >
                          <span className="mr-2">{b.label}</span>
                          <span className="text-xs text-gray-500">{b.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Variant Options */}
                {Object.keys(facets.options || {}).length > 0 && (
                  <div className="space-y-4">
                    {Object.entries(facets.options).map(([name, values]) => (
                      <div key={name}>
                        <div className="font-semibold mb-2">{name}</div>
                        <Select
                          allowClear
                          value={selectedOptions[name] || undefined}
                          onChange={(val) => setSelectedOptions(prev => {
                            const next = { ...prev };
                            if (!val) delete next[name]; else next[name] = val;
                            return next;
                          })}
                          style={{ width: '100%' }}
                          placeholder={`Choose ${name}`}
                          options={values.map(v => ({ value: v.value, label: `${v.value} (${v.count})` }))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Products Grid/List */}
            <div className="lg:col-span-9">
              <Suspense fallback={<LoadingSpinner />}>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 animate-fade-in' : 'flex flex-col gap-4 animate-fade-in'}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductCard key={product._id} product={product} altText={product.title} viewMode={viewMode} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <p className="text-gray-500 text-lg">No products available at the moment.</p>
                    </div>
                  )}
                </div>
              </Suspense>
            </div>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.pages * pagination.limit}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Products);