import axios from 'axios';

// Advertisement Service for managing ads
class AdvertisementService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached ads or fetch from API
  async getCachedAds(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache for ads
  setCachedAds(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Fetch active advertisements
  async getActiveAdvertisements() {
    try {
      const cached = await this.getCachedAds('active_ads');
      if (cached) return cached;

      const response = await axios.get('/adverts/active');
      const ads = response.data.adverts || [];
      
      // Filter ads by date and active status
      const now = new Date();
      const activeAds = ads.filter(ad => {
        const startDate = new Date(ad.startDate);
        const endDate = new Date(ad.endDate);
        return ad.active && now >= startDate && now <= endDate;
      });

      this.setCachedAds('active_ads', activeAds);
      return activeAds;
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      return [];
    }
  }

  // Get advertisements by position
  async getAdvertisementsByPosition(position, limit = 3) {
    try {
      const ads = await this.getActiveAdvertisements();
      return ads.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching ${position} advertisements:`, error);
      return [];
    }
  }

  // Get advertisements by type
  async getAdvertisementsByType(type, limit = 3) {
    try {
      const ads = await this.getActiveAdvertisements();
      const filteredAds = ads.filter(ad => ad.template === type);
      return filteredAds.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching ${type} advertisements:`, error);
      return [];
    }
  }

  // Track ad impression
  async trackImpression(adId, position, type) {
    try {
      if (window.gtag) {
        window.gtag('event', 'ad_impression', {
          ad_id: adId,
          ad_position: position,
          ad_type: type
        });
      }
      
      // Only send to backend if analytics endpoint exists
      try {
        await axios.post('/analytics/ad-impression', {
          adId,
          position,
          type,
          timestamp: new Date().toISOString()
        });
      } catch (analyticsError) {
        // Silently fail if analytics endpoint doesn't exist
        console.debug('Analytics endpoint not available:', analyticsError.message);
      }
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  }

  // Track ad click
  async trackClick(adId, position, type, link) {
    try {
      if (window.gtag) {
        window.gtag('event', 'ad_click', {
          ad_id: adId,
          ad_position: position,
          ad_type: type,
          ad_link: link
        });
      }
      
      // You can also send to your backend
      await axios.post('/analytics/ad-click', {
        adId,
        position,
        type,
        link,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  }

  // Get advertisement statistics
  async getAdStatistics() {
    try {
      const response = await axios.get('/analytics/ad-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching ad statistics:', error);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        clickThroughRate: 0,
        topPerformingAds: []
      };
    }
  }

  // Create advertisement (admin only)
  async createAdvertisement(adData) {
    try {
      const response = await axios.post('/adverts', adData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.clearCache(); // Clear cache after creating new ad
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create advertisement');
    }
  }

  // Update advertisement (admin only)
  async updateAdvertisement(id, adData) {
    try {
      const response = await axios.put(`/adverts/${id}`, adData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      this.clearCache(); // Clear cache after updating ad
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update advertisement');
    }
  }

  // Delete advertisement (admin only)
  async deleteAdvertisement(id) {
    try {
      await axios.delete(`/adverts/${id}`);
      this.clearCache(); // Clear cache after deleting ad
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete advertisement');
    }
  }

  // Get all advertisements (admin only)
  async getAllAdvertisements() {
    try {
      const response = await axios.get('/adverts/all');
      return response.data.adverts || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch advertisements');
    }
  }

  // Validate advertisement data
  validateAdvertisementData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (!data.product) {
      errors.push('Product is required');
    }

    if (!data.startDate) {
      errors.push('Start date is required');
    }

    if (!data.endDate) {
      errors.push('End date is required');
    }

    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }

    return errors;
  }

  // Format advertisement for display
  formatAdvertisementForDisplay(ad) {
    return {
      id: ad._id,
      title: ad.title,
      description: ad.message,
      image: ad.image || ad.images?.[0],
      link: `/products/${ad.product?._id || ad.product}`,
      target: '_self',
      cta: 'Shop Now',
      template: ad.template || 'classic',
      startDate: ad.startDate,
      endDate: ad.endDate,
      active: ad.active,
      product: ad.product
    };
  }

  // Get advertisement placement suggestions
  getPlacementSuggestions() {
    return [
      {
        id: 'topBanner',
        name: 'Top Banner',
        description: 'Prominent banner at the top of the page',
        recommended: true,
        maxAds: 3
      },
      {
        id: 'heroAd',
        name: 'Hero Section',
        description: 'Between hero and features sections',
        recommended: true,
        maxAds: 2
      },
      {
        id: 'categoryAd',
        name: 'Category Section',
        description: 'After categories section',
        recommended: true,
        maxAds: 2
      },
      {
        id: 'featuredAd',
        name: 'Featured Products',
        description: 'Before featured products section',
        recommended: false,
        maxAds: 1
      },
      {
        id: 'newArrivalsAd',
        name: 'New Arrivals',
        description: 'Before new arrivals section',
        recommended: false,
        maxAds: 1
      },
      {
        id: 'bestSellingAd',
        name: 'Best Selling',
        description: 'Before best selling section',
        recommended: false,
        maxAds: 1
      },
      {
        id: 'bottomBanner',
        name: 'Bottom Banner',
        description: 'Banner at the bottom of the page',
        recommended: true,
        maxAds: 2
      },
      {
        id: 'sidebarAd',
        name: 'Sidebar',
        description: 'Sidebar advertisement (desktop only)',
        recommended: false,
        maxAds: 1
      }
    ];
  }
}

// Create singleton instance
const advertisementService = new AdvertisementService();

export default advertisementService;
