import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  UserIcon,
  EyeIcon,
  ArrowRightIcon,
  TagIcon,
  ClockIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const BlogSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);

  // Dynamic blog data with real images and content
  const blogArticles = [
    {
      id: 1,
      title: "10 Essential Tips for Safe Online Shopping in Kenya",
      excerpt: "Learn the best practices for secure online shopping, from choosing reliable payment methods to protecting your personal information.",
      content: "Online shopping has become increasingly popular in Kenya, but it's important to stay safe. Always verify the website's security, use trusted payment methods, and never share sensitive information over unsecured connections. Look for HTTPS in the URL and read customer reviews before making purchases.",
      author: "LuxeCart Team",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-15",
      readTime: "5 min read",
      category: "shopping-tips",
      tags: ["online shopping", "security", "kenya", "tips"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      views: 1250,
      featured: true,
      slug: "safe-online-shopping-kenya"
    },
    {
      id: 2,
      title: "The Ultimate Guide to Choosing Premium Electronics",
      excerpt: "Discover how to select high-quality electronics that offer the best value for money and long-term reliability.",
      content: "When it comes to electronics, quality matters more than ever. Consider factors like warranty, brand reputation, and after-sales support. Premium electronics may cost more initially but often provide better performance and longevity.",
      author: "Tech Expert",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-12",
      readTime: "8 min read",
      category: "electronics",
      tags: ["electronics", "premium", "guide", "quality"],
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop",
      views: 890,
      featured: false,
      slug: "premium-electronics-guide"
    },
    {
      id: 3,
      title: "Sustainable Fashion: Building a Conscious Wardrobe",
      excerpt: "Explore sustainable fashion practices and learn how to build a wardrobe that's both stylish and environmentally friendly.",
      content: "Sustainable fashion is more than just a trend—it's a lifestyle choice. Choose quality over quantity, support ethical brands, and consider the environmental impact of your clothing choices.",
      author: "Fashion Consultant",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-10",
      readTime: "6 min read",
      category: "fashion",
      tags: ["fashion", "sustainable", "wardrobe", "eco-friendly"],
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop",
      views: 756,
      featured: false,
      slug: "sustainable-fashion-wardrobe"
    },
    {
      id: 4,
      title: "Home Decor Trends for 2024: What's Hot in Kenya",
      excerpt: "Stay ahead of the curve with the latest home decor trends that are making waves in Kenyan homes this year.",
      content: "2024 brings exciting new trends in home decor that blend modern aesthetics with traditional African influences. From bold colors to natural materials, discover what's trending in Kenyan homes.",
      author: "Interior Designer",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-08",
      readTime: "7 min read",
      category: "home-decor",
      tags: ["home decor", "trends", "2024", "kenya"],
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop",
      views: 634,
      featured: false,
      slug: "home-decor-trends-2024"
    },
    {
      id: 5,
      title: "Digital Payment Security: Protecting Your Money Online",
      excerpt: "Essential security tips for using digital payment methods safely and protecting your financial information.",
      content: "As digital payments become the norm, understanding security is crucial. Use strong passwords, enable two-factor authentication, and always verify transaction details before confirming payments.",
      author: "Security Expert",
      authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-05",
      readTime: "4 min read",
      category: "security",
      tags: ["digital payments", "security", "online safety", "money"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
      views: 1120,
      featured: false,
      slug: "digital-payment-security"
    },
    {
      id: 6,
      title: "Gift Shopping Made Easy: Perfect Presents for Every Occasion",
      excerpt: "Struggling to find the perfect gift? Our comprehensive guide helps you choose thoughtful presents for any occasion.",
      content: "Gift-giving can be stressful, but with the right approach, you can find the perfect present for any occasion. Consider the recipient's interests, budget, and the significance of the occasion.",
      author: "Gift Expert",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      publishDate: "2024-12-03",
      readTime: "9 min read",
      category: "gift-guide",
      tags: ["gifts", "occasions", "shopping", "presents"],
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=400&fit=crop",
      views: 445,
      featured: false,
      slug: "gift-shopping-guide"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Articles', count: blogArticles.length },
    { id: 'shopping-tips', name: 'Shopping Tips', count: blogArticles.filter(a => a.category === 'shopping-tips').length },
    { id: 'electronics', name: 'Electronics', count: blogArticles.filter(a => a.category === 'electronics').length },
    { id: 'fashion', name: 'Fashion', count: blogArticles.filter(a => a.category === 'fashion').length },
    { id: 'home-decor', name: 'Home & Decor', count: blogArticles.filter(a => a.category === 'home-decor').length },
    { id: 'security', name: 'Security', count: blogArticles.filter(a => a.category === 'security').length },
    { id: 'gift-guide', name: 'Gift Guides', count: blogArticles.filter(a => a.category === 'gift-guide').length }
  ];

  useEffect(() => {
    // Simulate API call with loading state
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setArticles(blogArticles);
        setError(null);
      } catch (err) {
        setError('Failed to load blog articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured).slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop';
  };

  const handleShare = (article) => {
    const text = `${article.title} - ${article.excerpt}`;
    const url = `${window.location.origin}/blog/${article.slug}`;

    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: url
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(url);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover shopping tips, product guides, and industry insights to enhance your shopping experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Blog</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto mb-16 px-4">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Latest from Our Blog
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover shopping tips, product guides, and industry insights to enhance your shopping experience.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Featured Article */}
      {featuredArticle && selectedCategory === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                  <span className="text-gray-500 text-sm">{formatDate(featuredArticle.publishDate)}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <img
                      src={featuredArticle.authorAvatar}
                      alt={featuredArticle.author}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face';
                      }}
                    />
                    <span className="text-sm text-gray-600">{featuredArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">{featuredArticle.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">{featuredArticle.views} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/products?category=featured&article=${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Read Full Article
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleShare(featuredArticle)}
                    className="p-3 text-gray-500 hover:text-orange-500 transition-colors"
                    title="Share article"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                  onError={handleImageError}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-gray-700">Featured</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Regular Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regularArticles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <div className="relative">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-white text-sm font-medium bg-orange-500">
                  {categories.find(c => c.id === article.category)?.name}
                </span>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleShare(article)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-orange-500 transition-colors"
                  title="Share article"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(article.publishDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                {article.title}
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face';
                    }}
                  />
                  <span className="text-sm text-gray-600">{article.author}</span>
                </div>
                <Link
                  to={`/products?category=${article.category}&article=${article.slug}`}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Read More
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* View All Articles Button */}
      <div className="text-center mt-12">
        <Link
          to="/products?view=blog"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          View All Articles
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;
