// Dynamic Sections Configuration for LuxeCart
export const SECTIONS_CONFIG = {
  // Hero Section
  hero: {
    enabled: true,
    title: 'LuxeCart',
    subtitle: 'Discover thousands of premium products with confidence. Shop the latest trends and enjoy lightning-fast delivery!',
    highlights: [
      'Premium Quality Products',
      'Fast & Secure Delivery',
      '24/7 Customer Support',
      'Easy Returns & Exchanges'
    ],
    ctaButtons: [
      {
        text: 'Shop Now',
        link: '/products',
        variant: 'primary',
        enabled: true
      },
      {
        text: 'Learn More',
        link: '/about',
        variant: 'secondary',
        enabled: true
      }
    ]
  },

  // Features Section (Assurance Strip)
  features: {
    enabled: true,
    title: 'Why Choose Us',
    subtitle: 'Experience the difference with our premium services',
    items: [
      {
        title: 'Free Shipping',
        description: 'Free shipping on orders over $50',
        icon: 'TruckIcon',
        gradient: 'from-blue-500 to-cyan-500',
        enabled: true
      },
      {
        title: 'Secure Payment',
        description: '100% secure payment processing',
        icon: 'ShieldCheckIcon',
        gradient: 'from-green-500 to-emerald-500',
        enabled: true
      },
      {
        title: 'Easy Returns',
        description: '30-day return policy',
        icon: 'ArrowPathIcon',
        gradient: 'from-purple-500 to-pink-500',
        enabled: true
      },
      {
        title: 'Flexible Payment',
        description: 'Pay in installments',
        icon: 'CreditCardIcon',
        gradient: 'from-orange-500 to-red-500',
        enabled: true
      }
    ]
  },

  // Advertisement Sections
  advertisements: {
    // Top Banner Advertisement - HIGHEST PRIORITY
    topBanner: {
      enabled: true,
      type: 'banner',
      position: 'top',
      maxDisplay: 3,
      autoPlay: true,
      interval: 5000,
      showCloseButton: true,
      showNavigation: true,
      className: 'mb-8', // Increased spacing for better visual separation
      priority: 'high'
    },

    // Hero Advertisement - SECONDARY ENGAGEMENT
    heroAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 2,
      autoPlay: false,
      showCloseButton: false,
      showNavigation: true,
      className: 'my-10', // Increased spacing for better flow
      priority: 'high'
    },

    // Category Advertisement - CONTEXTUAL PLACEMENT
    categoryAd: {
      enabled: true,
      type: 'banner',
      position: 'middle',
      maxDisplay: 2,
      autoPlay: true,
      interval: 4000,
      showCloseButton: true,
      showNavigation: true,
      className: 'my-8', // Better spacing after categories
      priority: 'medium'
    },

    // Featured Products Advertisement - PRE-SHOPPING
    featuredAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: false,
      showNavigation: false,
      className: 'mb-8', // Better spacing before featured products
      priority: 'medium'
    },

    // New Arrivals Advertisement - DISCOVERY
    newArrivalsAd: {
      enabled: true,
      type: 'banner',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: true,
      showNavigation: false,
      className: 'mb-8', // Better spacing before new arrivals
      priority: 'medium'
    },

    // Best Selling Advertisement - SOCIAL PROOF
    bestSellingAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: true,
      showNavigation: false,
      className: 'mb-8', // Better spacing before best selling
      priority: 'medium'
    },

    // Bottom Banner Advertisement - EXIT INTENT
    bottomBanner: {
      enabled: true,
      type: 'banner',
      position: 'bottom',
      maxDisplay: 2,
      autoPlay: true,
      interval: 6000,
      showCloseButton: true,
      showNavigation: true,
      className: 'mt-12 mb-8', // Better spacing for exit intent
      priority: 'high'
    },

    // Sidebar Advertisement - DESKTOP ONLY
    sidebarAd: {
      enabled: true,
      type: 'sidebar',
      position: 'sidebar',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: false,
      showNavigation: false,
      className: 'hidden lg:block sticky top-4',
      priority: 'low'
    }
  },

  // Categories Section
  categories: {
    enabled: true,
    title: 'Shop by Category',
    subtitle: 'Browse our wide range of categories',
    maxDisplay: 6,
    showViewAll: true,
    viewAllLink: '/categories'
  },

  // Featured Products Section (Main product showcase)
  featuredProducts: {
    enabled: true,
    title: 'Featured Products',
    subtitle: 'Handpicked products just for you',
    maxDisplay: 4,
    showViewAll: true,
    viewAllLink: '/products'
  },

  // New Arrivals Section (Streamlined)
  newArrivals: {
    enabled: true,
    title: 'New Arrivals',
    subtitle: 'Latest products added to our collection',
    maxDisplay: 3, // Reduced from 4
    showViewAll: true,
    viewAllLink: '/products?sort=newest'
  },

  // Best Selling Section (Streamlined)
  bestSelling: {
    enabled: true,
    title: 'Best Selling',
    subtitle: 'Most popular products our customers love',
    maxDisplay: 3, // Reduced from 4
    showViewAll: true,
    viewAllLink: '/products?sort=popular'
  },

  // AI Recommendations Section (Non-critical, loads after main content)
  aiRecommendations: {
    enabled: true,
    title: 'Recommended for You',
    subtitle: 'Personalized suggestions based on your preferences',
    maxDisplay: 4,
    showViewAll: true,
    viewAllLink: '/products?recommended=true'
  },

  // Stats Section (Social proof)
  stats: {
    enabled: true,
    title: 'Why Customers Choose Us',
    subtitle: 'Join thousands of satisfied customers',
    items: [
      {
        number: '10K+',
        label: 'Happy Customers',
        icon: 'UserGroupIcon',
        enabled: true
      },
      {
        number: '50K+',
        label: 'Products Available',
        icon: 'ShoppingBagIcon',
        enabled: true
      },
      {
        number: '24/7',
        label: 'Customer Support',
        icon: 'GlobeAltIcon',
        enabled: true
      },
      {
        number: '99%',
        label: 'Satisfaction Rate',
        icon: 'StarIcon',
        enabled: true
      }
    ]
  }
};

// Helper functions for sections
export const getSectionConfig = (sectionName) => {
  return SECTIONS_CONFIG[sectionName] || null;
};

export const getSectionTitle = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.title || '';
};

export const getSectionSubtitle = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.subtitle || '';
};

export const getSectionMaxDisplay = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.maxDisplay || 4;
};

export const shouldShowViewAll = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.showViewAll || false;
};

export const getViewAllLink = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.viewAllLink || '/products';
};

export const isSectionEnabled = (sectionName) => {
  const config = getSectionConfig(sectionName);
  return config?.enabled || false;
};

// Advertisement specific helpers
export const getAdSectionConfig = (adSectionName) => {
  return SECTIONS_CONFIG.advertisements?.[adSectionName] || null;
};

export const isAdSectionEnabled = (adSectionName) => {
  const config = getAdSectionConfig(adSectionName);
  return config?.enabled || false;
};

export const getAdSectionProps = (adSectionName) => {
  const config = getAdSectionConfig(adSectionName);
  if (!config) return null;
  
  return {
    type: config.type,
    position: config.position,
    autoPlay: config.autoPlay,
    interval: config.interval,
    showCloseButton: config.showCloseButton,
    showNavigation: config.showNavigation,
    className: config.className
  };
};

export default SECTIONS_CONFIG;
