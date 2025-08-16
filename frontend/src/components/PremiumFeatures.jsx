import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  CreditCardIcon,
  StarIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const PremiumFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: TruckIcon,
      title: "Lightning Fast Delivery",
      description: "Same-day delivery in major cities, next-day nationwide",
      gradient: "from-blue-500 to-cyan-500",
      stats: "2.5hr avg delivery",
      highlight: "⚡"
    },
    {
      icon: ShieldCheckIcon,
      title: "100% Secure Shopping",
      description: "Bank-level encryption and fraud protection",
      gradient: "from-green-500 to-emerald-500",
      stats: "0 fraud cases",
      highlight: "🛡️"
    },
    {
      icon: ArrowPathIcon,
      title: "Hassle-Free Returns",
      description: "30-day return policy with free return shipping",
      gradient: "from-purple-500 to-pink-500",
      stats: "99% satisfaction",
      highlight: "🔄"
    },
    {
      icon: CreditCardIcon,
      title: "Flexible Payment Options",
      description: "Pay in installments, multiple payment methods",
      gradient: "from-orange-500 to-red-500",
      stats: "12 payment methods",
      highlight: "💳"
    },
    {
      icon: StarIcon,
      title: "Premium Quality Guarantee",
      description: "All products verified for quality and authenticity",
      gradient: "from-yellow-500 to-amber-500",
      stats: "4.9/5 rating",
      highlight: "⭐"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Shipping",
      description: "Worldwide shipping to 150+ countries",
      gradient: "from-indigo-500 to-purple-500",
      stats: "150+ countries",
      highlight: "🌍"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-6"
              >
                <SparklesIcon className="h-5 w-5" />
                Why Choose Us
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                World-Class Shopping
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Experience</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Discover why millions of customers trust us for their shopping needs
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                {/* Feature icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8" />
                </div>

                {/* Highlight emoji */}
                <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {feature.highlight}
                </div>

                {/* Feature content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <FireIcon className="h-4 w-4" />
                  {feature.stats}
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered the world-class shopping experience
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Shopping Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
