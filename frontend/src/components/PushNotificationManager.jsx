import React, { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

const PushNotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkPermission();
      checkSubscription();
    }
  }, []);

  const checkPermission = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setIsSubscribed(true);
        setSubscription(existingSubscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from your server
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual key
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Send subscription to your server
      await sendSubscriptionToServer(subscription);
      
      setIsSubscribed(true);
      setSubscription(subscription);
      
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from your server
        await removeSubscriptionFromServer(subscription);
        
        setIsSubscribed(false);
        setSubscription(null);
        
        console.log('Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    try {
      // Send subscription to your backend
              await fetch('/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: 'user-id', // Replace with actual user ID
        }),
      });
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const removeSubscriptionFromServer = async (subscription) => {
    try {
      // Remove subscription from your backend
              await fetch('/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: 'user-id', // Replace with actual user ID
        }),
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      // Send test notification from your server
              await fetch('/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-id', // Replace with actual user ID
          message: 'This is a test notification from LuxeCart!',
        }),
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <BellSlashIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          Push notifications are not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BellIcon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Push Notifications
        </h3>
      </div>

      <div className="space-y-4">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Permission Status</p>
            <p className="text-xs text-gray-500">
              {permission === 'granted' && 'Notifications are enabled'}
              {permission === 'denied' && 'Notifications are blocked'}
              {permission === 'default' && 'Permission not requested'}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            permission === 'granted' ? 'bg-green-100 text-green-700' :
            permission === 'denied' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {permission}
          </span>
        </div>

        {/* Subscription Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">Subscription Status</p>
            <p className="text-xs text-gray-500">
              {isSubscribed ? 'Subscribed to push notifications' : 'Not subscribed'}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enable Notifications
            </button>
          )}

          {permission === 'granted' && !isSubscribed && (
            <button
              onClick={subscribeToPushNotifications}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Subscribe to Notifications
            </button>
          )}

          {isSubscribed && (
            <>
              <button
                onClick={sendTestNotification}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                Send Test Notification
              </button>
              
              <button
                onClick={unsubscribeFromPushNotifications}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Unsubscribe
              </button>
            </>
          )}

          {permission === 'denied' && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </div>

        {/* Notification Types */}
        {isSubscribed && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Types</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Order updates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Price drops</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">New products</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Promotional offers</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationManager;
