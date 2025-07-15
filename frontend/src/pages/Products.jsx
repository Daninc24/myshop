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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
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
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      showToast('Error fetching products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...(products || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
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
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} altText={product.title} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">No products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Products; 