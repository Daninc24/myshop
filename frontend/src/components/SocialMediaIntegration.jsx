import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShareIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ArrowUpIcon,
  UserGroupIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CalendarIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const SocialMediaIntegration = () => {
  const [socialStats, setSocialStats] = useState({
    facebook: {
      followers: 15420,
      posts: 156,
      engagement: 8.5,
      url: 'https://facebook.com/luxecart',
      growth: '+12%',
      verified: true
    },
    instagram: {
      followers: 23450,
      posts: 289,
      engagement: 12.3,
      url: 'https://instagram.com/luxecart',
      growth: '+18%',
      verified: true
    },
    twitter: {
      followers: 8920,
      posts: 445,
      engagement: 6.8,
      url: 'https://twitter.com/luxecart',
      growth: '+8%',
      verified: true
    },
    linkedin: {
      followers: 5670,
      posts: 89,
      engagement: 4.2,
      url: 'https://linkedin.com/company/luxecart',
      growth: '+15%',
      verified: true
    }
  });

  const [recentPosts, setRecentPosts] = useState([
    {
      id: 1,
      platform: 'instagram',
      content: 'New premium electronics just arrived! 🚀 Check out our latest collection of high-quality gadgets. #LuxeCart #PremiumElectronics #Kenya',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: '2 hours ago',
      engagement: 12.3,
      author: 'LuxeCart Kenya',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      verified: true
    },
    {
      id: 2,
      platform: 'facebook',
      content: '🎉 Flash Sale Alert! Get 30% off on all fashion items today only. Don\'t miss out on these amazing deals! #FlashSale #Fashion #LuxeCart',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
      likes: 189,
      comments: 32,
      shares: 28,
      timestamp: '5 hours ago',
      engagement: 8.5,
      author: 'LuxeCart Kenya',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      verified: true
    },
    {
      id: 3,
      platform: 'twitter',
      content: 'Customer Spotlight: "Amazing service and fast delivery! LuxeCart has become my go-to for premium products." - Sarah M. #CustomerSatisfaction #LuxeCart',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop',
      likes: 67,
      comments: 15,
      shares: 8,
      timestamp: '1 day ago',
      engagement: 6.8,
      author: 'LuxeCart Kenya',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      verified: true
    },
    {
      id: 4,
      platform: 'linkedin',
      content: 'We\'re excited to announce our expansion into new product categories! Stay tuned for more premium offerings. #BusinessGrowth #LuxeCart #Kenya',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      likes: 89,
      comments: 23,
      shares: 15,
      timestamp: '2 days ago',
      engagement: 4.2,
      author: 'LuxeCart Kenya',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      verified: true
    }
  ]);

  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const shareToSocialMedia = (platform) => {
    const text = 'Check out LuxeCart - Your Premium Shopping Destination in Kenya!';
    const url = currentUrl;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      linkedin: '💼'
    };
    return icons[platform] || '🌐';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: 'bg-blue-600',
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      twitter: 'bg-blue-400',
      linkedin: 'bg-blue-700'
    };
    return colors[platform] || 'bg-gray-600';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop';
  };

  const handlePostInteraction = (postId, action) => {
    // In a real app, this would update the backend
    console.log(`Post ${postId} ${action} interaction`);
  };

  return (
    <section className="max-w-7xl mx-auto mb-16 px-4">
      {/* Social Media Stats */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Follow Us on Social Media
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay connected with LuxeCart for the latest updates, exclusive deals, and premium product showcases.
        </p>
      </div>

      {/* Social Media Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.entries(socialStats).map(([platform, stats]) => (
          <motion.div
            key={platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
          >
            <div className={`w-16 h-16 ${getPlatformColor(platform)} rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl`}>
              {getPlatformIcon(platform)}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {platform}
              </h3>
              {stats.verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Followers:</span>
                <span className="font-semibold text-gray-900">{formatNumber(stats.followers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posts:</span>
                <span className="font-semibold text-gray-900">{stats.posts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Engagement:</span>
                <span className="font-semibold text-green-600">{stats.engagement}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Growth:</span>
                <span className="font-semibold text-green-600">{stats.growth}</span>
              </div>
            </div>

            <a
              href={stats.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Follow
            </a>
          </motion.div>
        ))}
      </div>

      {/* Recent Social Media Posts */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Latest from Our Social Media
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {recentPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={post.image}
                  alt="Social media post"
                  className="w-full h-48 object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPlatformColor(post.platform)}`}>
                    {post.platform}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handlePostInteraction(post.id, 'bookmark')}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-orange-500 transition-colors"
                    title="Bookmark post"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{post.author}</span>
                      {post.verified && (
                        <span className="text-blue-500 text-sm">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{post.timestamp}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{post.timestamp}</span>
                  <span className="text-green-600 font-medium">{post.engagement}% engagement</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-gray-500">
                    <button
                      onClick={() => handlePostInteraction(post.id, 'like')}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <HeartIcon className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handlePostInteraction(post.id, 'comment')}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handlePostInteraction(post.id, 'share')}
                      className="flex items-center gap-1 hover:text-green-500 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span>{post.shares}</span>
                    </button>
                  </div>

                  <a
                    href={socialStats[post.platform]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1"
                  >
                    View Post
                    <ArrowUpIcon className="w-3 h-3 rotate-45" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Sharing */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Share LuxeCart with Your Friends
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Help us spread the word about premium shopping in Kenya. Share LuxeCart with your network and let them discover amazing products!
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => shareToSocialMedia('facebook')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>📘</span>
            Share on Facebook
          </button>

          <button
            onClick={() => shareToSocialMedia('twitter')}
            className="flex items-center gap-2 bg-blue-400 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
          >
            <span>🐦</span>
            Share on Twitter
          </button>

          <button
            onClick={() => shareToSocialMedia('linkedin')}
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <span>💼</span>
            Share on LinkedIn
          </button>

          <button
            onClick={() => shareToSocialMedia('whatsapp')}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <span>📱</span>
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with LuxeCart
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for exclusive deals, new product alerts, and shopping tips.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Join Our Growing Community
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">53K+</div>
            <div className="text-gray-600">Social Media Followers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4.8/5</div>
            <div className="text-gray-600">Customer Rating</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaIntegration;
