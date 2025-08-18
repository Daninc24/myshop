import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SparklesIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const PremiumFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 1,
      title: "Premium Quality Guarantee",
      description: "Every product is hand-picked and quality-tested before reaching you. No more fake or low-quality items.",
      icon: ShieldCheckIcon,
      color: "bg-success",
      benefits: [
        "100% Authentic Products",
        "Quality Inspection",
        "Warranty Protection",
        "Money-back Guarantee"
      ],
      stats: {
        value: "99.8%",
        label: "Customer Satisfaction"
      }
    },
    {
      id: 2,
      title: "24-Hour Delivery",
      description: "Get your orders delivered within 24 hours across Kenya! Orders placed before 2 PM are delivered the next day.",
      icon: TruckIcon,
      color: "bg-secondary",
      benefits: [
        "24-Hour Delivery",
        "Real-time Tracking",
        "Express Delivery",
        "Contactless Delivery"
      ],
      stats: {
        value: "24",
        label: "Hours Delivery"
      }
    },
    {
      id: 3,
      title: "AI-Powered Recommendations",
      description: "Our advanced AI learns your preferences and suggests products you'll actually love.",
      icon: SparklesIcon,
      color: "bg-accent",
      benefits: [
        "Personalized Suggestions",
        "Trend Analysis",
        "Smart Search",
        "Price Alerts"
      ],
      stats: {
        value: "95%",
        label: "Recommendation Accuracy"
      }
    },
    {
      id: 4,
      title: "Premium Customer Support",
      description: "24/7 dedicated support team with real humans, not bots. We're here when you need us.",
      icon: ChatBubbleLeftRightIcon,
      color: "bg-primary",
      benefits: [
        "24/7 Live Chat",
        "Video Call Support",
        "WhatsApp Support",
        "Priority Queue"
      ],
      stats: {
        value: "< 2min",
        label: "Response Time"
      }
    },
    {
      id: 5,
      title: "Local Business Support",
      description: "Supporting Kenyan businesses and artisans. Buy local, grow local.",
      icon: UserGroupIcon,
      color: "bg-error",
      benefits: [
        "Local Vendors",
        "Artisan Products",
        "Community Support",
        "Economic Growth"
      ],
      stats: {
        value: "500+",
        label: "Local Vendors"
      }
    },
    {
      id: 6,
      title: "Advanced Analytics",
      description: "Track your spending, discover trends, and make informed purchasing decisions.",
      icon: ChartBarIcon,
      color: "bg-secondary",
      benefits: [
        "Spending Analytics",
        "Price History",
        "Trend Reports",
        "Budget Tracking"
      ],
      stats: {
        value: "100%",
        label: "Transparency"
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="max-w-7xl mx-auto mb-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Why Choose LuxeCart?
        </h2>
        <p className="text-lg text-text-secondary max-w-3xl mx-auto">
          We're not just another e-commerce platform. We're redefining online shopping in Kenya with premium features that put you first.
        </p>
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Active Feature Display */}
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary/5 to-error/5 rounded-2xl p-8 border border-primary/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 ${features[activeFeature].color} rounded-xl flex items-center justify-center text-white`}>
              {React.createElement(features[activeFeature].icon, { className: "w-8 h-8" })}
            </div>
            <div>
                             <h3 className="text-2xl font-bold text-text-primary">
                 {features[activeFeature].title}
               </h3>
               <p className="text-text-secondary">
                {features[activeFeature].description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {features[activeFeature].benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-success rounded-full"></div>
                                 <span className="text-sm text-text-primary">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl p-4 text-center border border-border">
                         <div className="text-3xl font-bold text-text-primary">
               {features[activeFeature].stats.value}
             </div>
             <div className="text-sm text-text-secondary">
              {features[activeFeature].stats.label}
            </div>
          </div>
        </motion.div>

        {/* Feature Navigation */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.button
              key={feature.id}
              onClick={() => setActiveFeature(index)}
              className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                activeFeature === index
                  ? 'bg-surface border-primary shadow-lg'
                  : 'bg-surface-hover border-border hover:bg-surface hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center text-white`}>
                  {React.createElement(feature.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                                   <h4 className="font-semibold text-text-primary">{feature.title}</h4>
                 <p className="text-sm text-text-secondary">{feature.stats.value} {feature.stats.label}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>



      {/* Call to Action */}
      <div className="mt-12 text-center">
                 <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Experience Premium Shopping?
          </h3>
                     <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered the difference that premium quality and exceptional service make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <button className="bg-surface text-primary px-8 py-3 rounded-lg font-semibold hover:bg-surface-hover transition-colors border border-border">
              Start Shopping Now
            </button>
                         <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;
