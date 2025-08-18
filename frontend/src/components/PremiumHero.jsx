import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SmartSearch from './SmartSearch';
import { 
  ArrowRightIcon, 
  StarIcon, 
  ShoppingBagIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const PremiumHero = ({ 
  heroContent, 
  trendingProducts, 
  onShopNow, 
  onViewDeals,
  backgroundImage 
}) => {
  const navigate = useNavigate();
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Parallax effect (disabled on mobile for performance)
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Rotate highlights
  useEffect(() => {
    if (!heroContent || !heroContent.highlights || heroContent.highlights.length === 0) {
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentHighlight((prev) => (prev + 1) % heroContent.highlights.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroContent?.highlights?.length]);

  // Animate in on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/40"></div>
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        )}
      </div>

      {/* Floating elements - optimized for mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-20 left-4 md:left-10 text-yellow-400 text-2xl md:text-4xl"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-40 right-4 md:right-20 text-pink-400 text-xl md:text-3xl"
        >
          💎
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-40 left-4 md:left-20 text-blue-400 text-lg md:text-2xl"
        >
          🚀
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 md:space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm border border-white/40 rounded-full px-4 md:px-6 py-2 md:py-3 text-white font-semibold shadow-xl"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                <SparklesIcon className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                <span className="text-xs md:text-sm font-medium">World-Class Shopping Experience</span>
              </motion.div>

              {/* Main title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight px-2"
              >
                <span className="bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400 bg-clip-text text-transparent drop-shadow-2xl filter contrast-125" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(255,255,255,0.3)' }}>
                  {heroContent?.title || 'Welcome to MyShop'}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-white font-semibold max-w-3xl mx-auto drop-shadow-2xl px-4"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(255,255,255,0.2)' }}
              >
                {heroContent?.subtitle || 'Discover premium products with confidence'}
              </motion.p>

              {/* Smart Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="flex justify-center px-4"
              >
                <div className="w-full max-w-2xl">
                  <SmartSearch
                    onSearch={(query) => {
                      if (query.trim()) {
                        navigate(`/products?search=${encodeURIComponent(query.trim())}`);
                      }
                    }}
                    placeholder="Search for products, brands, or categories..."
                  />
                </div>
              </motion.div>

              {/* Rotating highlights */}
              {heroContent?.highlights && heroContent.highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex justify-center px-4"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHighlight}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-sm md:text-lg text-white font-bold bg-white/30 backdrop-blur-sm rounded-lg px-4 md:px-6 py-2 md:py-3 border border-white/40 shadow-xl max-w-xs md:max-w-none"
                      style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      {heroContent.highlights[currentHighlight]}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShopNow}
                  className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full text-base md:text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    {heroContent.cta.primary}
                    <ArrowRightIcon className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onViewDeals}
                  className="px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full text-base md:text-lg hover:bg-white/20 transition-all duration-300 w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    <FireIcon className="h-4 w-4 md:h-5 md:w-5" />
                    {heroContent.cta.secondary}
                  </span>
                </motion.button>
              </motion.div>

              {/* Trending products preview */}
              {trendingProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="mt-8 md:mt-12"
                >
                                     <p className="text-white/80 mb-4 text-xs md:text-sm">🔥 Trending Now</p>
                  <div className="flex justify-center gap-2 md:gap-4">
                    {(Array.isArray(trendingProducts) ? trendingProducts : []).slice(0, 3).map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="relative group"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-yellow-400 transition-colors">
                          <img
                            src={getOptimizedImageUrl(product.images?.[0]) || '/placeholder-image.svg'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                          {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 md:h-3 bg-white/60 rounded-full mt-1 md:mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PremiumHero;
