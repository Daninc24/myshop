import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  UserIcon, 
  EyeIcon,
  ArrowRightIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const BlogSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock blog data - in production, this would come from your CMS
  const blogArticles = [
    {
      id: 1,
      title: "10 Essential Tips for Safe Online Shopping in Kenya",
      excerpt: "Learn the best practices for secure online shopping, from choosing reliable payment methods to protecting your personal information.",
      content: "Online shopping has become increasingly popular in Kenya, but it's important to stay safe...",
      author: "LuxeCart Team",
      publishDate: "2024-12-15",
      readTime: "5 min read",
      category: "shopping-tips",
      tags: ["online shopping", "security", "kenya", "tips"],
      image: "/images/blog/safe-shopping.jpg",
      views: 1250,
      featured: true
    },
    {
      id: 2,
      title: "The Ultimate Guide to Choosing Premium Electronics",
      excerpt: "Discover how to select high-quality electronics that offer the best value for money and long-term reliability.",
      content: "When it comes to electronics, quality matters more than ever...",
      author: "Tech Expert",
      publishDate: "2024-12-12",
      readTime: "8 min read",
      category: "electronics",
      tags: ["electronics", "premium", "guide", "quality"],
      image: "/images/blog/premium-electronics.jpg",
      views: 890,
      featured: false
    },
    {
      id: 3,
      title: "Sustainable Fashion: Building a Conscious Wardrobe",
      excerpt: "Explore sustainable fashion practices and learn how to build a wardrobe that's both stylish and environmentally friendly.",
      content: "Sustainable fashion is more than just a trend—it's a lifestyle choice...",
      author: "Fashion Consultant",
      publishDate: "2024-12-10",
      readTime: "6 min read",
      category: "fashion",
      tags: ["fashion", "sustainable", "wardrobe", "eco-friendly"],
      image: "/images/blog/sustainable-fashion.jpg",
      views: 756,
      featured: false
    },
    {
      id: 4,
      title: "Home Decor Trends for 2024: What's Hot in Kenya",
      excerpt: "Stay ahead of the curve with the latest home decor trends that are making waves in Kenyan homes this year.",
      content: "2024 brings exciting new trends in home decor that blend modern aesthetics...",
      author: "Interior Designer",
      publishDate: "2024-12-08",
      readTime: "7 min read",
      category: "home-decor",
      tags: ["home decor", "trends", "2024", "kenya"],
      image: "/images/blog/home-decor-trends.jpg",
      views: 634,
      featured: false
    },
    {
      id: 5,
      title: "Digital Payment Security: Protecting Your Money Online",
      excerpt: "Essential security tips for using digital payment methods safely and protecting your financial information.",
      content: "As digital payments become the norm, understanding security is crucial...",
      author: "Security Expert",
      publishDate: "2024-12-05",
      readTime: "4 min read",
      category: "security",
      tags: ["digital payments", "security", "online safety", "money"],
      image: "/images/blog/digital-payments.jpg",
      views: 1120,
      featured: false
    },
    {
      id: 6,
      title: "Gift Shopping Made Easy: Perfect Presents for Every Occasion",
      excerpt: "Struggling to find the perfect gift? Our comprehensive guide helps you choose thoughtful presents for any occasion.",
      content: "Gift-giving can be stressful, but with the right approach...",
      author: "Gift Expert",
      publishDate: "2024-12-03",
      readTime: "9 min read",
      category: "gift-guide",
      tags: ["gifts", "occasions", "shopping", "presents"],
      image: "/images/blog/gift-guide.jpg",
      views: 445,
      featured: false
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
    // Simulate loading
    const timer = setTimeout(() => {
      setArticles(blogArticles);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
                  <div className="flex items-center gap-2 text-gray-500">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm">{featuredArticle.author}</span>
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
                <Link
                  to={`/blog/${featuredArticle.id}`}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Read Full Article
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="relative">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-blog.jpg';
                  }}
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
                onError={(e) => {
                  e.target.src = '/images/placeholder-blog.jpg';
                }}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {categories.find(c => c.id === article.category)?.name}
                </span>
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
                <div className="flex items-center gap-2 text-gray-500">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm">{article.author}</span>
                </div>
                <Link
                  to={`/blog/${article.id}`}
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
          to="/blog"
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
