// Comprehensive SEO Configuration for LuxeCart
import { getBrandName, getBrandDescription, getBrandWebsite } from './branding';

// Base SEO configuration
export const SEO_CONFIG = {
  // Default meta tags
  default: {
    title: `${getBrandName()} - Your Premium Shopping Destination`,
    description: getBrandDescription(),
    keywords: 'luxury shopping, premium products, exclusive deals, fast delivery, secure payments, online store, ecommerce, luxecart',
    image: `${getBrandWebsite()}/logo.png`,
    url: getBrandWebsite(),
    type: 'website',
    locale: 'en_US',
    siteName: getBrandName(),
    twitterHandle: '@luxecart',
    author: getBrandName(),
    robots: 'index, follow',
    themeColor: '#ff6600',
    viewport: 'width=device-width, initial-scale=1.0'
  },

  // Page-specific SEO configurations
  pages: {
    home: {
      title: `${getBrandName()} - Premium Shopping Experience`,
      description: 'Discover thousands of premium products with confidence. Shop the latest trends and enjoy lightning-fast delivery with secure payments and exceptional customer service.',
      keywords: 'online shopping, premium products, luxury items, fast delivery, secure payments, customer service, shopping experience',
      image: `${getBrandWebsite()}/hero-image.jpg`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": getBrandName(),
        "description": getBrandDescription(),
        "url": getBrandWebsite(),
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${getBrandWebsite()}/products?search={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    },

    products: {
      title: `Products - ${getBrandName()}`,
      description: 'Browse our extensive collection of premium products. Find the best deals on electronics, fashion, home & garden, and more.',
      keywords: 'products, shopping, deals, electronics, fashion, home, garden, sports, beauty, toys',
      image: `${getBrandWebsite()}/products-banner.jpg`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Products",
        "description": "Premium products collection"
      }
    },

    productDetail: {
      title: (productName) => `${productName} - ${getBrandName()}`,
      description: (product) => `Buy ${product.name} at ${getBrandName()}. ${product.description || 'Premium quality product with fast delivery and secure payment.'}`,
      keywords: (product) => `${product.name}, ${product.category}, buy online, premium quality, fast delivery`,
      image: (product) => product.images?.[0] || `${getBrandWebsite()}/product-placeholder.jpg`,
      structuredData: (product) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.images,
        "brand": {
          "@type": "Brand",
          "name": product.brand || getBrandName()
        },
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": getBrandName()
          }
        }
      })
    },

    categories: {
      title: `Categories - ${getBrandName()}`,
      description: 'Explore our product categories. From electronics to fashion, home & garden to sports, find everything you need.',
      keywords: 'categories, product categories, electronics, fashion, home, garden, sports, beauty, toys, automotive',
      image: `${getBrandWebsite()}/categories-banner.jpg`
    },

    cart: {
      title: `Shopping Cart - ${getBrandName()}`,
      description: 'Review your shopping cart items. Secure checkout with multiple payment options and fast delivery.',
      keywords: 'shopping cart, checkout, payment, delivery, secure shopping',
      image: `${getBrandWebsite()}/cart-banner.jpg`,
      robots: 'noindex, nofollow' // Cart pages shouldn't be indexed
    },

    checkout: {
      title: `Checkout - ${getBrandName()}`,
      description: 'Complete your purchase securely. Multiple payment options available including credit cards, PayPal, and more.',
      keywords: 'checkout, payment, secure, credit card, paypal, purchase',
      image: `${getBrandWebsite()}/checkout-banner.jpg`,
      robots: 'noindex, nofollow' // Checkout pages shouldn't be indexed
    },

    about: {
      title: `About Us - ${getBrandName()}`,
      description: `Learn more about ${getBrandName()}. We are committed to providing premium products and exceptional customer service.`,
      keywords: 'about us, company, mission, vision, customer service, premium products',
      image: `${getBrandWebsite()}/about-banner.jpg`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": getBrandName(),
        "description": getBrandDescription(),
        "url": getBrandWebsite(),
        "logo": `${getBrandWebsite()}/logo.png`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+254791991154",
          "contactType": "customer service"
        }
      }
    },

    contact: {
      title: `Contact Us - ${getBrandName()}`,
      description: `Get in touch with ${getBrandName()}. We're here to help with any questions about our products or services.`,
      keywords: 'contact us, customer service, support, help, questions, feedback',
      image: `${getBrandWebsite()}/contact-banner.jpg`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Us",
        "description": "Get in touch with our customer service team"
      }
    },

    login: {
      title: `Login - ${getBrandName()}`,
      description: 'Sign in to your account to access your orders, wishlist, and personalized recommendations.',
      keywords: 'login, sign in, account, user, authentication',
      image: `${getBrandWebsite()}/login-banner.jpg`,
      robots: 'noindex, nofollow' // Login pages shouldn't be indexed
    },

    register: {
      title: `Register - ${getBrandName()}`,
      description: 'Create your account to start shopping. Get access to exclusive deals and personalized recommendations.',
      keywords: 'register, sign up, create account, new user, membership',
      image: `${getBrandWebsite()}/register-banner.jpg`,
      robots: 'noindex, nofollow' // Registration pages shouldn't be indexed
    }
  }
};

// Helper functions for SEO
export const getSEOConfig = (page, data = {}) => {
  const pageConfig = SEO_CONFIG.pages[page] || SEO_CONFIG.default;
  
  if (typeof pageConfig.title === 'function') {
    pageConfig.title = pageConfig.title(data);
  }
  
  if (typeof pageConfig.description === 'function') {
    pageConfig.description = pageConfig.description(data);
  }
  
  if (typeof pageConfig.keywords === 'function') {
    pageConfig.keywords = pageConfig.keywords(data);
  }
  
  if (typeof pageConfig.image === 'function') {
    pageConfig.image = pageConfig.image(data);
  }
  
  if (typeof pageConfig.structuredData === 'function') {
    pageConfig.structuredData = pageConfig.structuredData(data);
  }
  
  return {
    ...SEO_CONFIG.default,
    ...pageConfig
  };
};

// Generate meta tags for a page
export const generateMetaTags = (page, data = {}) => {
  const config = getSEOConfig(page, data);
  
  return {
    title: config.title,
    meta: [
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.keywords },
      { name: 'robots', content: config.robots },
      { name: 'author', content: config.author },
      { name: 'viewport', content: config.viewport },
      { name: 'theme-color', content: config.themeColor },
      
      // Open Graph
      { property: 'og:title', content: config.title },
      { property: 'og:description', content: config.description },
      { property: 'og:type', content: config.type },
      { property: 'og:url', content: config.url },
      { property: 'og:image', content: config.image },
      { property: 'og:site_name', content: config.siteName },
      { property: 'og:locale', content: config.locale },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: config.title },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: config.image },
      { name: 'twitter:site', content: config.twitterHandle },
      
      // Additional
      { rel: 'canonical', href: config.url }
    ],
    link: [
      { rel: 'canonical', href: config.url }
    ],
    script: config.structuredData ? [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(config.structuredData)
      }
    ] : []
  };
};

// Sitemap generation helper
export const generateSitemapUrls = () => {
  const baseUrl = getBrandWebsite();
  
  return [
    { url: `${baseUrl}/`, priority: 1.0, changefreq: 'daily' },
    { url: `${baseUrl}/products`, priority: 0.9, changefreq: 'daily' },
    { url: `${baseUrl}/categories`, priority: 0.8, changefreq: 'weekly' },
    { url: `${baseUrl}/about`, priority: 0.7, changefreq: 'monthly' },
    { url: `${baseUrl}/contact`, priority: 0.6, changefreq: 'monthly' }
  ];
};

// Robots.txt content
export const generateRobotsTxt = () => {
  const baseUrl = getBrandWebsite();
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow private pages
Disallow: /admin/
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /login
Disallow: /register
Disallow: /profile
Disallow: /orders

# Allow important pages
Allow: /products
Allow: /categories
Allow: /about
Allow: /contact`;
};

export default SEO_CONFIG;
