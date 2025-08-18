import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShareIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const SocialMediaSharing = ({ 
  title = "Check out this amazing product on LuxeCart!",
  description = "Discover premium products with lightning-fast delivery and exceptional customer service.",
  url = window.location.href,
  image = "https://luxecart.com/logo.png",
  hashtags = ["LuxeCart", "PremiumShopping", "FastDelivery", "Kenya"],
  product = null,
  showFloating = true,
  position = "bottom-right"
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Generate share text based on product or default
  const generateShareText = () => {
    if (product) {
      return `Just found this amazing ${product.title} on LuxeCart! ${description} #${hashtags.join(' #')}`;
    }
    return `${title} ${description} #${hashtags.join(' #')}`;
  };

  const shareText = generateShareText();

  // Social media platforms configuration
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: ShareIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
      analytics: 'facebook_share'
    },
    {
      name: 'Twitter',
      icon: ShareIcon,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      analytics: 'twitter_share'
    },
    {
      name: 'WhatsApp',
      icon: ShareIcon,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`,
      analytics: 'whatsapp_share'
    },
    {
      name: 'Telegram',
      icon: ShareIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
      analytics: 'telegram_share'
    },
    {
      name: 'Pinterest',
      icon: ShareIcon,
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(shareText)}&media=${encodeURIComponent(image)}`,
      analytics: 'pinterest_share'
    },
    {
      name: 'LinkedIn',
      icon: ShareIcon,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      analytics: 'linkedin_share'
    }
  ];

  // Handle social media sharing
  const handleSocialShare = async (platform) => {
    try {
      // Track share event
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: platform.name.toLowerCase(),
          content_type: product ? 'product' : 'page',
          item_id: url
        });
      }

      // Dispatch custom event for analytics
      window.dispatchEvent(new CustomEvent('luxecart:social_share', {
        detail: {
          platform: platform.name,
          url: url,
          product: product
        }
      }));

      // Open share URL
      const shareWindow = window.open(platform.url, '_blank', 'width=600,height=400');
      
      if (shareWindow) {
        // Increment share count
        setShareCount(prev => prev + 1);
        
        // Store share count in localStorage
        const storedCount = localStorage.getItem('luxecart_share_count') || '0';
        localStorage.setItem('luxecart_share_count', String(parseInt(storedCount) + 1));
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Track copy event
      if (window.gtag) {
        window.gtag('event', 'share', {
          method: 'copy_link',
          content_type: product ? 'product' : 'page',
          item_id: url
        });
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Handle native sharing (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url
        });

        // Track native share
        if (window.gtag) {
          window.gtag('event', 'share', {
            method: 'native',
            content_type: product ? 'product' : 'page',
            item_id: url
          });
        }

        setShareCount(prev => prev + 1);
      } catch (error) {
        console.error('Error with native sharing:', error);
      }
    } else {
      // Fallback to share menu
      setShowShareMenu(true);
    }
  };

  // Load share count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem('luxecart_share_count') || '0';
    setShareCount(parseInt(storedCount));
  }, []);

  // Floating share button
  if (showFloating) {
    return (
      <>
        {/* Floating Share Button */}
        <motion.div
          className={`fixed ${position} z-50 m-4`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          <div className="relative">
            {/* Share Count Badge */}
            {shareCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 }}
              >
                {shareCount > 999 ? '999+' : shareCount}
              </motion.div>
            )}

            {/* Main Share Button */}
            <motion.button
              onClick={handleNativeShare}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShareIcon className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Share Menu Modal */}
        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareMenu(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-sm w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Share This</h3>
                  <p className="text-gray-600">Help others discover amazing products!</p>
                </div>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {socialPlatforms.map((platform) => (
                    <motion.button
                      key={platform.name}
                      onClick={() => handleSocialShare(platform)}
                      className={`${platform.color} text-white p-3 rounded-xl flex flex-col items-center gap-2 transition-all duration-300`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <platform.icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{platform.name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Copy Link Button */}
                <motion.button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                                       {copied ? (
                       <>
                         <CheckIcon className="w-5 h-5 text-green-600" />
                         <span className="text-green-600 font-medium">Copied!</span>
                       </>
                     ) : (
                       <>
                         <DocumentDuplicateIcon className="w-5 h-5" />
                         <span>Copy Link</span>
                       </>
                     )}
                </motion.button>

                {/* Close Button */}
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline share buttons
  return (
    <div className="flex flex-wrap gap-2">
      {socialPlatforms.map((platform) => (
        <motion.button
          key={platform.name}
          onClick={() => handleSocialShare(platform)}
          className={`${platform.color} text-white p-2 rounded-lg flex items-center gap-2 text-sm`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <platform.icon className="w-4 h-4" />
          <span>{platform.name}</span>
        </motion.button>
      ))}
      
      <motion.button
        onClick={handleCopyLink}
        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center gap-2 text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
                 {copied ? (
           <>
             <CheckIcon className="w-4 h-4" />
             <span>Copied!</span>
           </>
         ) : (
           <>
             <DocumentDuplicateIcon className="w-4 h-4" />
             <span>Copy</span>
           </>
         )}
      </motion.button>
    </div>
  );
};

export default SocialMediaSharing;
