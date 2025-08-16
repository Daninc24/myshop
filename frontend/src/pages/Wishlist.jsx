import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  HeartIcon, 
  TrashIcon, 
  ShoppingCartIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const { user } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        // In a real app, you'd fetch from API
        const stored = localStorage.getItem(`wishlist_${user._id}`);
        const items = stored ? JSON.parse(stored) : [];
        setWishlistItems(items);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, error]);

  const removeFromWishlist = (productId) => {
    const updatedItems = wishlistItems.filter(item => item._id !== productId);
    setWishlistItems(updatedItems);
    if (user) {
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedItems));
    }
    success('Removed from wishlist');
  };

  const removeSelected = () => {
    const updatedItems = wishlistItems.filter(item => !selectedItems.includes(item._id));
    setWishlistItems(updatedItems);
    setSelectedItems([]);
    setIsSelecting(false);
    if (user) {
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedItems));
    }
    success('Removed selected items from wishlist');
  };

  const toggleSelection = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    setSelectedItems(wishlistItems.map(item => item._id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Sign in to view your wishlist</h2>
          <p className="text-text-secondary mb-6">Save your favorite products and access them anytime</p>
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - MyShop</title>
        <meta name="description" content="View and manage your saved products" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-all duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                <HeartIcon className="w-8 h-8 text-primary" />
                My Wishlist
              </h1>
              <p className="text-text-secondary mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-3">
              {!isSelecting ? (
                <button
                  onClick={() => setIsSelecting(true)}
                  className="btn-outline"
                >
                  Select Items
                </button>
              ) : (
                <>
                  <button
                    onClick={selectedItems.length === wishlistItems.length ? deselectAll : selectAll}
                    className="btn-ghost"
                  >
                    {selectedItems.length === wishlistItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={() => setIsSelecting(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={removeSelected}
                      className="btn-danger"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Remove Selected ({selectedItems.length})
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Your wishlist is empty</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Start exploring our products and save your favorites to your wishlist for easy access later.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/products" className="btn-primary">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
              <Link to="/" className="btn-outline">
                Go Home
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product._id} className="relative">
                {isSelecting && (
                  <div className="absolute top-3 left-3 z-20">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product._id)}
                      onChange={() => toggleSelection(product._id)}
                      className="w-5 h-5 text-primary bg-surface border border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </div>
                )}
                <ProductCard 
                  product={product} 
                  showWishlist={false}
                />
                {isSelecting && (
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 z-20 p-2 bg-error text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && !isSelecting && (
          <div className="mt-12 p-6 bg-surface rounded-2xl border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                Add All to Cart
              </button>
              <button className="btn-outline">
                Share Wishlist
              </button>
              <button className="btn-ghost">
                Export List
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
