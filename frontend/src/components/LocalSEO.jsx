import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const LocalSEO = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'LuxeCart Kenya',
    address: 'Westlands, Nairobi, Kenya',
    phone: '+254 791 991 154',
    email: 'info@luxecart.com',
    website: 'https://luxecart.com',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    rating: 4.8,
    reviewCount: 127,
    categories: ['E-commerce', 'Online Shopping', 'Premium Products', 'Electronics', 'Fashion'],
    description: 'Your premium shopping destination in Kenya. We offer the best quality products with fast delivery and secure payments. Shop with confidence for electronics, fashion, home decor, and more.',
    coordinates: {
      lat: -1.2921,
      lng: 36.8219
    },
    socialMedia: {
      facebook: 'https://facebook.com/luxecart',
      instagram: 'https://instagram.com/luxecart',
      twitter: 'https://twitter.com/luxecart',
      linkedin: 'https://linkedin.com/company/luxecart'
    },
    services: [
      'Online Shopping',
      'Fast Delivery',
      'Secure Payments',
      'Customer Support',
      'Returns & Exchanges',
      'Gift Cards'
    ]
  });

  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Sarah M.',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      date: '2024-12-10',
      comment: 'Excellent service! Fast delivery and quality products. The customer support team was very helpful when I had questions about my order. Highly recommended!',
      verified: true,
      helpful: 12
    },
    {
      id: 2,
      author: 'John K.',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      date: '2024-12-08',
      comment: 'Great shopping experience. The products are exactly as described and the delivery was on time. Will definitely shop here again!',
      verified: true,
      helpful: 8
    },
    {
      id: 3,
      author: 'Mary W.',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      rating: 4,
      date: '2024-12-05',
      comment: 'Good prices and fast shipping. The website is easy to navigate and the checkout process was smooth. Very satisfied with my purchase.',
      verified: true,
      helpful: 5
    },
    {
      id: 4,
      author: 'David O.',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      date: '2024-12-03',
      comment: 'Amazing customer service! They helped me find exactly what I was looking for and the product quality exceeded my expectations.',
      verified: true,
      helpful: 15
    }
  ]);

  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Generate structured data for local business
  const generateLocalBusinessSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": businessInfo.name,
      "description": businessInfo.description,
      "url": businessInfo.website,
      "telephone": businessInfo.phone,
      "email": businessInfo.email,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Nairobi",
        "addressCountry": "KE",
        "addressRegion": "Nairobi"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": businessInfo.coordinates.lat,
        "longitude": businessInfo.coordinates.lng
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Monday",
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Tuesday",
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Wednesday",
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Thursday",
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Friday",
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "10:00",
          "closes": "16:00"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": businessInfo.rating,
        "reviewCount": businessInfo.reviewCount
      },
      "priceRange": "$$",
      "paymentAccepted": ["Cash", "Credit Card", "Mobile Money", "Bank Transfer"],
      "currenciesAccepted": "KES",
      "areaServed": "Kenya",
      "sameAs": Object.values(businessInfo.socialMedia)
    };
  };

  useEffect(() => {
    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(generateLocalBusinessSchema());
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face';
  };

  const handleContactAction = (action) => {
    switch (action) {
      case 'call':
        window.open(`tel:${businessInfo.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${businessInfo.email}`, '_self');
        break;
      case 'website':
        window.open(businessInfo.website, '_blank');
        break;
      case 'chat':
        // Implement live chat functionality
        console.log('Opening live chat...');
        break;
      default:
        break;
    }
  };

  const loadMap = () => {
    if (!mapLoaded) {
      setMapLoaded(true);
      // In a real implementation, you would load Google Maps or another mapping service
      setTimeout(() => setShowMap(true), 500);
    } else {
      setShowMap(!showMap);
    }
  };

  return (
    <section className="max-w-7xl mx-auto mb-16 px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <GlobeAltIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{businessInfo.name}</h2>
              <p className="text-orange-100">Your Premium Shopping Destination</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(businessInfo.rating)}
              <span className="font-semibold">{businessInfo.rating}</span>
            </div>
            <span className="text-orange-100">({businessInfo.reviewCount} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Business Information */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h3>

            <div className="space-y-6">
              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">{businessInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <a href={`tel:${businessInfo.phone}`} className="text-orange-500 hover:text-orange-600">
                      {businessInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <a href={`mailto:${businessInfo.email}`} className="text-orange-500 hover:text-orange-600">
                      {businessInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GlobeAltIcon className="w-6 h-6 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Website</h4>
                    <a href={businessInfo.website} className="text-orange-500 hover:text-orange-600">
                      {businessInfo.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-orange-500" />
                  Business Hours
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(businessInfo.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700 capitalize">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Our Services</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {businessInfo.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {businessInfo.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">About Us</h4>
                <p className="text-gray-600 leading-relaxed">
                  {businessInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews and Map */}
          <div className="space-y-6">
            {/* Reviews */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-orange-500" />
                Customer Reviews
              </h3>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.authorAvatar}
                          alt={review.author}
                          className="w-8 h-8 rounded-full"
                          onError={handleImageError}
                        />
                        <span className="font-semibold text-gray-900">{review.author}</span>
                        {review.verified && (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-600 text-sm mb-2">{review.comment}</p>

                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500 transition-colors">
                        <HeartIcon className="w-3 h-3" />
                        Helpful ({review.helpful})
                      </button>
                      <button className="text-xs text-gray-500 hover:text-orange-500 transition-colors">
                        Reply
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Write a Review
              </button>
            </div>

            {/* Map */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>

              <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
                {showMap ? (
                  <div className="text-center w-full">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-600 mb-2">📍 {businessInfo.address}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        Latitude: {businessInfo.coordinates.lat}<br />
                        Longitude: {businessInfo.coordinates.lng}
                      </p>
                      <button
                        onClick={() => window.open(`https://maps.google.com/?q=${businessInfo.coordinates.lat},${businessInfo.coordinates.lng}`, '_blank')}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={loadMap}
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Show Map
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => handleContactAction('call')}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneIcon className="w-4 h-4" />
                Call Now
              </button>

              <button
                onClick={() => handleContactAction('email')}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Send Message
              </button>

              <button
                onClick={() => handleContactAction('chat')}
                className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                Live Chat
              </button>

              <button
                onClick={() => handleContactAction('website')}
                className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Visit Website
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocalSEO;
