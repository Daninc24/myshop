import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showInstallPrompt || !deferredPrompt) return null;

  const dismissedTime = localStorage.getItem('installPromptDismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-brand-gradient rounded-lg flex items-center justify-center">
              <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">
              Install LuxeCart App
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center px-3 py-2 bg-brand-gradient text-white text-sm font-medium rounded-lg hover:shadow-brand transition-all"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-16 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-3 z-50"
        >
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                You're offline
              </p>
              <p className="text-xs text-yellow-700">
                Some features may be limited. You can still browse cached content.
              </p>
            </div>
            <button
              onClick={() => setShowOfflineMessage(false)}
              className="flex-shrink-0 p-1 hover:bg-yellow-100 rounded"
            >
              <XMarkIcon className="w-4 h-4 text-yellow-600" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NotificationPermission = () => {
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    // Show notification prompt after user has been active for a while
    if (notificationPermission === 'default') {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 60000); // Show after 1 minute

      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationPrompt(false);

      if (permission === 'granted') {
        // Register for push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // In a real app, you'd subscribe to push notifications here
            console.log('Push notifications ready');
          } catch (error) {
            console.error('Push notification setup failed:', error);
          }
        }
      }
    }
  };

  const dismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  };

  // Don't show if permission already granted/denied or recently dismissed
  if (notificationPermission !== 'default' || !showNotificationPrompt) return null;

  const dismissedTime = localStorage.getItem('notificationPromptDismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-xl p-6 max-w-sm w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Stay Updated
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Get notified about order updates, special offers, and new arrivals.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={requestNotificationPermission}
                className="w-full bg-brand-gradient text-white py-3 rounded-lg font-medium hover:shadow-brand transition-all"
              >
                Enable Notifications
              </button>
              <button
                onClick={dismissNotificationPrompt}
                className="w-full text-slate-600 py-2 font-medium hover:text-slate-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const UpdateAvailable = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-50 border border-blue-200 rounded-xl p-4 z-50"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <ArrowDownTrayIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Update Available
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              A new version of LuxeCart is available with improvements and bug fixes.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={dismissUpdate}
                className="px-3 py-2 text-blue-700 text-sm font-medium hover:bg-blue-100 rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={dismissUpdate}
            className="flex-shrink-0 p-1 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const PWAFeatures = () => {
  // Register service worker on component mount
  useEffect(() => {
    if ('serviceWorker' in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <InstallPrompt />
      <OfflineIndicator />
      <NotificationPermission />
      <UpdateAvailable />
    </>
  );
};

export default PWAFeatures;