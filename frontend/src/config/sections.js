// Dynamic Sections Configuration
export const SECTIONS_CONFIG = {
  // Hero Section
  hero: {
    enabled: true,
    title: 'MyShop',
    subtitle: 'Discover amazing products with confidence. Shop the latest trends and enjoy fast delivery!',
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
        title: 'Fast Delivery',
        description: 'Quick and reliable shipping',
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
        description: 'Hassle-free return policy',
        icon: 'ArrowPathIcon',
        gradient: 'from-purple-500 to-pink-500',
        enabled: true
      },
      {
        title: 'Flexible Payment',
        description: 'Multiple payment options',
        icon: 'CreditCardIcon',
        gradient: 'from-orange-500 to-red-500',
        enabled: true
      }
    ]
  },

  // Advertisement Sections
  advertisements: {
    // Top Banner Advertisement
    topBanner: {
      enabled: true,
      type: 'banner',
      position: 'top',
      maxDisplay: 3,
      autoPlay: true,
      interval: 5000,
      showCloseButton: true,
      showNavigation: true,
      className: 'mb-2',
      priority: 'high'
    },

    // Hero Advertisement
    heroAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 2,
      autoPlay: false,
      showCloseButton: false,
      showNavigation: true,
      className: 'my-2',
      priority: 'high'
    },

    // Category Advertisement
    categoryAd: {
      enabled: true,
      type: 'banner',
      position: 'middle',
      maxDisplay: 2,
      autoPlay: true,
      interval: 4000,
      showCloseButton: true,
      showNavigation: true,
      className: 'my-2',
      priority: 'medium'
    },

    // Featured Products Advertisement
    featuredAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: false,
      showNavigation: false,
      className: 'mb-2',
      priority: 'medium'
    },

    // New Arrivals Advertisement
    newArrivalsAd: {
      enabled: true,
      type: 'banner',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: true,
      showNavigation: false,
      className: 'mb-2',
      priority: 'medium'
    },

    // Best Selling Advertisement
    bestSellingAd: {
      enabled: true,
      type: 'inline',
      position: 'middle',
      maxDisplay: 1,
      autoPlay: false,
      showCloseButton: true,
      showNavigation: false,
      className: 'mb-2',
      priority: 'medium'
    },

    // Bottom Banner Advertisement
    bottomBanner: {
      enabled: true,
      type: 'banner',
      position: 'bottom',
      maxDisplay: 2,
      autoPlay: true,
      interval: 6000,
      showCloseButton: true,
      showNavigation: true,
      className: 'mt-4 mb-2',
      priority: 'high'
    },

    // Sidebar Advertisement
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
    maxDisplay: 4,
    showViewAll: true,
    viewAllLink: '/products'
  },

  // Featured Products Section
  featuredProducts: {
    enabled: true,
    title: 'Featured Products',
    subtitle: 'Handpicked products just for you',
    maxDisplay: 4,
    showViewAll: true,
    viewAllLink: '/products'
  },

  // New Arrivals Section
  newArrivals: {
    enabled: true,
    title: 'New Arrivals',
    subtitle: 'Latest products added to our collection',
    maxDisplay: 3,
    showViewAll: true,
    viewAllLink: '/products?sort=newest'
  },

  // Best Selling Section
  bestSelling: {
    enabled: true,
    title: 'Best Selling',
    subtitle: 'Most popular products our customers love',
    maxDisplay: 3,
    showViewAll: true,
    viewAllLink: '/products?sort=popular'
  },

  // AI Recommendations Section
  aiRecommendations: {
    enabled: true,
    title: 'Recommended for You',
    subtitle: 'Personalized suggestions based on your preferences',
    maxDisplay: 4,
    showViewAll: true,
    viewAllLink: '/products?recommended=true'
  },

  // Stats Section
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
