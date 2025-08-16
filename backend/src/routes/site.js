const express = require('express');
const router = express.Router();

// Get site assurances/features
router.get('/assurances', async (req, res) => {
  try {
    // Return default assurances that match the frontend expectations
    const assurances = [
      { 
        key: 'assurance', 
        title: 'Purchase Protection', 
        subtitle: 'Coverage on eligible orders', 
        icon: 'shield' 
      },
      { 
        key: 'delivery', 
        title: 'On-time Delivery', 
        subtitle: 'Trackable shipping', 
        icon: 'truck' 
      },
      { 
        key: 'payments', 
        title: 'Secure payments', 
        subtitle: 'Multiple options', 
        icon: 'card' 
      },
      { 
        key: 'returns', 
        title: 'Easy returns', 
        subtitle: 'Hassle-free policy', 
        icon: 'refresh' 
      }
    ];
    
    res.json(assurances);
  } catch (error) {
    console.error('Error fetching assurances:', error);
    res.status(500).json({ message: 'Error fetching assurances' });
  }
});

// Get site information
router.get('/info', async (req, res) => {
  try {
    const siteInfo = {
      name: 'MyShopping Center',
      description: 'Your premium shopping destination',
      version: '1.0.0',
      features: [
        'Secure payments',
        'Fast delivery',
        'Easy returns',
        '24/7 support'
      ]
    };
    
    res.json(siteInfo);
  } catch (error) {
    console.error('Error fetching site info:', error);
    res.status(500).json({ message: 'Error fetching site info' });
  }
});

module.exports = router;
