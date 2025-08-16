const express = require('express');
const router = express.Router();

// Currency list endpoint
router.get('/currency/list', (req, res) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
    { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
    { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' }
  ];
  
  res.json(currencies);
});

// Currency rates endpoint with real-time data
router.get('/currency/rates', async (req, res) => {
  try {
    // Try to fetch real-time rates from a free API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data && data.rates) {
      // Add some additional currencies that might not be in the API
      const rates = {
        ...data.rates,
        GMD: 50.25, // Gambian Dalasi
        XOF: 550,   // West African CFA Franc
        XAF: 550,   // Central African CFA Franc
        UGX: 3550,  // Ugandan Shilling
        TZS: 2300,  // Tanzanian Shilling
        GHS: 5.85,  // Ghanaian Cedi
        NGN: 410.5, // Nigerian Naira
        KES: 108.5, // Kenyan Shilling
        EGP: 15.65, // Egyptian Pound
        ZAR: 14.85, // South African Rand
        BRL: 5.25,  // Brazilian Real
        MXN: 20.1,  // Mexican Peso
        INR: 74.5,  // Indian Rupee
        CNY: 6.45,  // Chinese Yuan
        JPY: 110.5, // Japanese Yen
        KRW: 1185.5, // South Korean Won
        THB: 33.25, // Thai Baht
        MYR: 4.15,  // Malaysian Ringgit
        IDR: 14250, // Indonesian Rupiah
        PHP: 50.5,  // Philippine Peso
        VND: 23000, // Vietnamese Dong
        RUB: 73.5,  // Russian Ruble
        TRY: 8.65,  // Turkish Lira
        PLN: 3.85,  // Polish Złoty
        CZK: 21.5,  // Czech Koruna
        HUF: 305.5, // Hungarian Forint
        SEK: 8.65,  // Swedish Krona
        NOK: 8.85,  // Norwegian Krone
        DKK: 6.25,  // Danish Krone
        CHF: 0.92,  // Swiss Franc
        SGD: 1.35,  // Singapore Dollar
        HKD: 7.78,  // Hong Kong Dollar
        NZD: 1.42,  // New Zealand Dollar
        AUD: 1.52,  // Australian Dollar
        CAD: 1.35,  // Canadian Dollar
        EUR: 0.85,  // Euro
        GBP: 0.73,  // British Pound
        USD: 1      // US Dollar (base)
      };
      
      res.json(rates);
    } else {
      throw new Error('Invalid response from currency API');
    }
  } catch (error) {
    console.error('Currency API error:', error.message);
    
    // Fallback to static rates if API fails
    const fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      GMD: 50.25,
      CAD: 1.35,
      AUD: 1.52,
      JPY: 110.5,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.5,
      BRL: 5.25,
      MXN: 20.1,
      SGD: 1.35,
      HKD: 7.78,
      NZD: 1.42,
      SEK: 8.65,
      NOK: 8.85,
      DKK: 6.25,
      PLN: 3.85,
      CZK: 21.5,
      HUF: 305.5,
      RUB: 73.5,
      TRY: 8.65,
      ZAR: 14.85,
      KRW: 1185.5,
      THB: 33.25,
      MYR: 4.15,
      IDR: 14250,
      PHP: 50.5,
      VND: 23000,
      EGP: 15.65,
      NGN: 410.5,
      KES: 108.5,
      UGX: 3550,
      TZS: 2300,
      GHS: 5.85,
      XOF: 550,
      XAF: 550
    };
    
    res.json(fallbackRates);
  }
});

module.exports = router; 