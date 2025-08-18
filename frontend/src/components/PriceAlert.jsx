import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  BellSlashIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PriceAlert = ({ product, currentPrice }) => {
  const [isAlertSet, setIsAlertSet] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('below'); // below, above, percentage
  const [percentage, setPercentage] = useState(10);
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Load existing alerts from localStorage
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    const productAlert = savedAlerts.find(alert => alert.productId === product._id);
    if (productAlert) {
      setIsAlertSet(true);
      setAlerts(savedAlerts);
    }
  }, [product._id]);

  const handleSetAlert = () => {
    if (!targetPrice && alertType !== 'percentage') return;
    if (!email) return;

    const alert = {
      id: Date.now(),
      productId: product._id,
      productName: product.title,
      productImage: product.images?.[0],
      currentPrice: currentPrice,
      targetPrice: alertType === 'percentage' ? null : parseFloat(targetPrice),
      alertType,
      percentage: alertType === 'percentage' ? percentage : null,
      email,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedAlerts = [...alerts, alert];
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    setIsAlertSet(true);
    setShowForm(false);
    setTargetPrice('');
    setEmail('');

    // Show success message
    showNotification('Price alert set successfully!', 'success');
  };

  const handleRemoveAlert = (alertId) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    
    const productAlert = updatedAlerts.find(alert => alert.productId === product._id);
    setIsAlertSet(!!productAlert);

    showNotification('Price alert removed!', 'info');
  };

  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const calculateTargetPrice = () => {
    if (alertType === 'percentage') {
      const discount = (percentage / 100) * currentPrice;
      return (currentPrice - discount).toFixed(2);
    }
    return targetPrice;
  };

  const getAlertDescription = () => {
    if (alertType === 'below') {
      return `Alert when price drops below $${targetPrice}`;
    } else if (alertType === 'above') {
      return `Alert when price goes above $${targetPrice}`;
    } else {
      return `Alert when price drops by ${percentage}% (below $${calculateTargetPrice()})`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BellIcon className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Price Alert</h3>
      </div>

      {!isAlertSet ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Get notified when the price changes for this product.
          </p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
            >
              Set Price Alert
            </button>
          ) : (
            <div className="space-y-4">
              {/* Alert Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAlertType('below')}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      alertType === 'below'
                        ? 'bg-orange-100 border-orange-500 text-orange-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Below Price
                  </button>
                  <button
                    onClick={() => setAlertType('above')}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      alertType === 'above'
                        ? 'bg-orange-100 border-orange-500 text-orange-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Above Price
                  </button>
                  <button
                    onClick={() => setAlertType('percentage')}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      alertType === 'percentage'
                        ? 'bg-orange-100 border-orange-500 text-orange-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              {/* Target Price Input */}
              {alertType !== 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price ($)
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Drop Percentage
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(parseInt(e.target.value))}
                      min="1"
                      max="50"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Target price: ${calculateTargetPrice()}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSetAlert}
                  disabled={(!targetPrice && alertType !== 'percentage') || !email}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Set Alert
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-800">Price Alert Active</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {getAlertDescription()}
            </p>
          </div>

          <div className="space-y-2">
            {alerts
              .filter(alert => alert.productId === product._id)
              .map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.productImage}
                      alt={alert.productName}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.productName}</p>
                      <p className="text-xs text-gray-500">
                        {alert.alertType === 'percentage' 
                          ? `${alert.percentage}% drop` 
                          : `${alert.alertType} $${alert.targetPrice}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAlert(alert.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Add Another Alert
          </button>
        </div>
      )}

      {/* Current Price Display */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Price:</span>
          <span className="text-lg font-bold text-orange-600">${currentPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceAlert;
