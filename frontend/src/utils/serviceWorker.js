// Service Worker registration utility
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
  }

  // Register service worker
  async register() {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification();
          }
        });
      });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated, reloading page...');
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Show update notification
  showUpdateNotification() {
    if (confirm('A new version is available! Would you like to update?')) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Unregister service worker
  async unregister() {
    if (this.registration) {
      await this.registration.unregister();
      console.log('Service Worker unregistered');
    }
  }

  // Check if service worker is active
  isActive() {
    return this.registration && this.registration.active;
  }

  // Get service worker version
  async getVersion() {
    if (!this.registration || !this.registration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      this.registration.active.postMessage(
        { type: 'GET_VERSION' },
        [channel.port2]
      );
    });
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications() {
    if (!this.registration) {
      console.log('Service Worker not registered');
      return false;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (!permission) {
        return false;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send push notification
  async sendPushNotification(title, options = {}) {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Background sync
  async registerBackgroundSync(tag, options = {}) {
    if (!this.registration || !('sync' in this.registration)) {
      console.log('Background sync not supported');
      return false;
    }

    try {
      await this.registration.sync.register(tag, options);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }

  // Cache management
  async clearCaches() {
    if (!this.registration) {
      return false;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Error clearing caches:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.registration) {
      return null;
    }

    try {
      const cacheNames = await caches.keys();
      const stats = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    serviceWorkerManager.register();
  });
}

export default serviceWorkerManager;
