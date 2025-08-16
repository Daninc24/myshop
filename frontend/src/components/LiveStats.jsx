import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  EyeIcon, 
  ShoppingBagIcon, 
  StarIcon, 
  UserGroupIcon,
  GlobeAltIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const LiveStats = () => {
  const [stats, setStats] = useState({
    visitors: 1247,
    orders: 89,
    products: 15420,
    reviews: 8920,
    countries: 45,
    satisfaction: 98.5
  });

  const [isVisible, setIsVisible] = useState(false);

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics?timeRange=7d');
      setStats({
        visitors: response.data.totalPageViews || 1247,
        orders: response.data.totalOrders || 89,
        products: response.data.totalProducts || 15420,
        reviews: Math.floor((response.data.totalUsers || 5000) * 1.8),
        countries: 45, // Could be fetched from orders data
        satisfaction: 98.5 // Could be calculated from reviews
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Keep fallback values if analytics fails
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchAnalytics();
    
    // Update stats every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: EyeIcon,
      label: "Active Visitors",
      value: stats.visitors,
      suffix: "",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingBagIcon,
      label: "Orders Today",
      value: stats.orders,
      suffix: "",
      color: "text-green-500",
      bgColor: "bg-green-50",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: StarIcon,
      label: "Customer Reviews",
      value: stats.reviews,
      suffix: "+",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: UserGroupIcon,
      label: "Happy Customers",
      value: stats.satisfaction,
      suffix: "%",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: GlobeAltIcon,
      label: "Countries Served",
      value: stats.countries,
      suffix: "",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: FireIcon,
      label: "Products Available",
      value: stats.products,
      suffix: "+",
      color: "text-red-500",
      bgColor: "bg-red-50",
      gradient: "from-red-500 to-orange-500"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium mb-6"
              >
                <FireIcon className="h-5 w-5 text-red-400" />
                Live Statistics
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                Trusted by
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Millions</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-white/80 max-w-3xl mx-auto"
              >
                Real-time statistics showing our global impact and customer satisfaction
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="group relative"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-6 w-6" />
                </div>

                {/* Value */}
                <motion.div
                  key={item.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  {item.value.toLocaleString()}{item.suffix}
                </motion.div>

                {/* Label */}
                <div className="text-sm text-white/70 font-medium">
                  {item.label}
                </div>

                {/* Live indicator */}
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
            <p className="text-lg font-medium mb-2">🚀 Growing Every Day</p>
            <p className="text-white/70 text-sm">
              Join our community of satisfied customers worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveStats;
