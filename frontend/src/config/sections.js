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
    subtitle: 'Most popular products among our customers',
    maxDisplay: 3, // Reduced from 4
    showViewAll: true,
    viewAllLink: '/products?sort=popular'
  },

  // Stats Section (Simplified)
  stats: {
    enabled: false, // Disabled to reduce clutter
    title: 'Our Numbers',
    subtitle: 'Trusted by thousands of customers',
    items: [
      {
        number: '50K+',
        label: 'Happy Customers',
        icon: 'UserGroupIcon',
        enabled: true
      },
      {
        number: '100K+',
        label: 'Products Sold',
        icon: 'ShoppingBagIcon',
        enabled: true
      },
      {
        number: '24/7',
        label: 'Customer Support',
        icon: 'HeartIcon',
        enabled: true
      },
      {
        number: '150+',
        label: 'Countries Served',
        icon: 'GlobeAltIcon',
        enabled: true
      }
    ]
  },

  // Newsletter Section (Simplified)
  newsletter: {
    enabled: false, // Disabled to reduce clutter
    title: 'Stay Updated',
    subtitle: 'Subscribe to our newsletter for exclusive offers and updates',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing!'
  },

  // Testimonials Section (Simplified)
  testimonials: {
    enabled: false, // Disabled to reduce clutter
    title: 'What Our Customers Say',
    subtitle: 'Real reviews from real customers',
    maxDisplay: 3,
    autoPlay: true,
    autoPlayInterval: 5000
  },

  // Events Section (Simplified)
  events: {
    enabled: false, // Disabled to reduce clutter
    title: 'Upcoming Events',
    subtitle: 'Join us for exciting events and promotions',
    maxDisplay: 3,
    showViewAll: true,
    viewAllLink: '/events'
  }
};

// Helper functions for sections
export const isSectionEnabled = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.enabled || false;
};

export const getSectionConfig = (sectionName) => {
  return SECTIONS_CONFIG[sectionName] || {};
};

export const getEnabledSections = () => {
  return Object.keys(SECTIONS_CONFIG).filter(section => 
    SECTIONS_CONFIG[section].enabled
  );
};

export const getSectionItems = (sectionName) => {
  const section = SECTIONS_CONFIG[sectionName];
  if (!section || !section.items) return [];
  
  return section.items.filter(item => item.enabled !== false);
};

export const getSectionTitle = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.title || '';
};

export const getSectionSubtitle = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.subtitle || '';
};

export const getSectionMaxDisplay = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.maxDisplay || 4;
};

export const shouldShowViewAll = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.showViewAll || false;
};

export const getViewAllLink = (sectionName) => {
  return SECTIONS_CONFIG[sectionName]?.viewAllLink || '';
};

export default SECTIONS_CONFIG;
