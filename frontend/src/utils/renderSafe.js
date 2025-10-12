// Utility to safely render values and prevent React error #31
export const renderSafe = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    // If it's an object, convert to string representation
    if (value.toString && typeof value.toString === 'function') {
      return value.toString();
    }
    return JSON.stringify(value);
  }
  
  return String(value);
};

// Utility to safely render currency
export const renderCurrency = (currency) => {
  if (typeof currency === 'string') {
    return currency;
  }
  
  if (currency && typeof currency === 'object') {
    return `${currency.symbol || ''} ${currency.code || ''} - ${currency.name || ''}`.trim();
  }
  
  return String(currency || '');
};

// Utility to safely get currency code
export const getCurrencyCode = (currency) => {
  if (typeof currency === 'string') {
    return currency;
  }
  
  if (currency && typeof currency === 'object') {
    return currency.code || currency.symbol || String(currency);
  }
  
  return String(currency || 'USD');
};