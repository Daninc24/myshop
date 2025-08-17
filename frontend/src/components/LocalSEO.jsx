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
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const LocalSEO = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'LuxeCart Kenya',
    address: 'Nairobi, Kenya',
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
    categories: ['E-commerce', 'Online Shopping', 'Premium Products'],
    description: 'Your premium shopping destination in Kenya. We offer the best quality products with fast delivery and secure payments.',
    coordinates: {
      lat: -1.2921,
      lng: 36.8219
    }
  });

  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Sarah M.',
      rating: 5,
      date: '2024-12-10',
      comment: 'Excellent service! Fast delivery and quality products. Highly recommended!',
      verified: true
    },
    {
      id: 2,
      author: 'John K.',
      rating: 5,
      date: '2024-12-08',
      comment: 'Great shopping experience. The products are exactly as described.',
      verified: true
    },
    {
      id: 3,
      author: 'Mary W.',
      rating: 4,
      date: '2024-12-05',
      comment: 'Good prices and fast shipping. Will definitely shop here again.',
      verified: true
    }
  ]);

  const [showMap, setShowMap] = useState(false);

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
      "areaServed": "Kenya"
    };
  };

  useEffect(() => {
    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(generateLocalBusinessSchema());
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
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
                    
                    <p className="text-gray-600 text-sm">{review.comment}</p>
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
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Interactive Map</p>
                    <p className="text-sm text-gray-500">
                      Latitude: {businessInfo.coordinates.lat}<br />
                      Longitude: {businessInfo.coordinates.lng}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMap(true)}
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Show Map
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                Call Now
              </button>
              
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                Send Message
              </button>
              
              <button className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
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
