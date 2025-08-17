import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdvertisementBanner from './AdvertisementBanner';
import advertisementService from '../services/advertisementService';
import { isAdSectionEnabled, getAdSectionProps } from '../config/sections';

const AdvertisementSection = ({ 
  sectionName, 
  className = '',
  fallbackContent = null 
}) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAdvertisements = async () => {
      if (!isAdSectionEnabled(sectionName)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get active advertisements
        const activeAds = await advertisementService.getActiveAdvertisements();
        
        // Format ads for display
        const formattedAds = activeAds.map(ad => 
          advertisementService.formatAdvertisementForDisplay(ad)
        );

        setAds(formattedAds);

        // Track impressions for loaded ads
        formattedAds.forEach(ad => {
          advertisementService.trackImpression(ad.id, sectionName, 'banner');
        });

      } catch (err) {
        console.error(`Error loading advertisements for ${sectionName}:`, err);
        setError('Failed to load advertisements');
      } finally {
        setLoading(false);
      }
    };

    loadAdvertisements();
  }, [sectionName]);

  // Don't render if section is disabled or no ads available
  if (!isAdSectionEnabled(sectionName) || (!loading && ads.length === 0)) {
    return fallbackContent;
  }

  // Get section configuration
  const sectionProps = getAdSectionProps(sectionName);
  if (!sectionProps) return null;

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-gray-200 rounded-lg h-10 flex items-center justify-center">
          <div className="text-gray-400">Loading advertisements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg p-4`}>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
                           <AdvertisementBanner
          ads={ads}
          {...sectionProps}
          template="compact-image-banner"
          onAdClick={(ad) => {
            advertisementService.trackClick(ad.id, sectionName, 'banner', ad.link);
          }}
        />
    </motion.div>
  );
};

// Specialized advertisement components for different sections
export const TopBannerAd = () => (
  <AdvertisementSection 
    sectionName="topBanner" 
    className="mb-2"
  />
);

export const HeroAd = () => (
  <AdvertisementSection 
    sectionName="heroAd" 
    className="my-2"
  />
);

export const CategoryAd = () => (
  <AdvertisementSection 
    sectionName="categoryAd" 
    className="my-2"
  />
);

export const FeaturedAd = () => (
  <AdvertisementSection 
    sectionName="featuredAd" 
    className="mb-2"
  />
);

export const NewArrivalsAd = () => (
  <AdvertisementSection 
    sectionName="newArrivalsAd" 
    className="mb-2"
  />
);

export const BestSellingAd = () => (
  <AdvertisementSection 
    sectionName="bestSellingAd" 
    className="mb-2"
  />
);

export const BottomBannerAd = () => (
  <AdvertisementSection 
    sectionName="bottomBanner" 
    className="mt-2"
  />
);

export const SidebarAd = () => (
  <AdvertisementSection 
    sectionName="sidebarAd" 
    className="hidden lg:block sticky top-4"
  />
);

// Advertisement grid component for multiple ads
export const AdvertisementGrid = ({ 
  sectionName, 
  columns = 2, 
  className = '' 
}) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const activeAds = await advertisementService.getActiveAdvertisements();
        const formattedAds = activeAds.map(ad => 
          advertisementService.formatAdvertisementForDisplay(ad)
        );
        setAds(formattedAds);
      } catch (error) {
        console.error('Error loading advertisement grid:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  if (loading) {
    return (
      <div className={`${className} grid grid-cols-1 md:grid-cols-${columns} gap-4 animate-pulse`}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-10"></div>
        ))}
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className={`${className} grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {ads.slice(0, columns).map((ad, index) => (
        <motion.div
          key={ad.id || index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
                     <AdvertisementBanner
             ads={[ad]}
             type="inline"
             template="compact-card"
             autoPlay={false}
             showCloseButton={false}
             showNavigation={false}
             onAdClick={(ad) => {
               advertisementService.trackClick(ad.id, sectionName, 'grid', ad.link);
             }}
           />
        </motion.div>
      ))}
    </div>
  );
};

// Advertisement carousel for multiple ads
export const AdvertisementCarousel = ({ 
  sectionName, 
  autoPlay = true, 
  interval = 5000,
  className = '' 
}) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const activeAds = await advertisementService.getActiveAdvertisements();
        const formattedAds = activeAds.map(ad => 
          advertisementService.formatAdvertisementForDisplay(ad)
        );
        setAds(formattedAds);
      } catch (error) {
        console.error('Error loading advertisement carousel:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, []);

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-gray-200 rounded-lg h-10"></div>
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className={className}>
                                   <AdvertisementBanner
              ads={ads}
              type="banner"
              template="compact-image-banner"
              autoPlay={autoPlay}
              interval={interval}
              showCloseButton={true}
              showNavigation={true}
              onAdClick={(ad) => {
                advertisementService.trackClick(ad.id, sectionName, 'carousel', ad.link);
              }}
            />
    </div>
  );
};

export default AdvertisementSection;
