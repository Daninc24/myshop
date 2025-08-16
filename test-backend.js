const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend health...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5002/api/health', {
      timeout: 3000
    });
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test products endpoint
    console.log('Testing products endpoint...');
    const productsResponse = await axios.get('http://localhost:5002/api/products', {
      timeout: 5000
    });
    console.log('✅ Products endpoint working, got', productsResponse.data.products?.length || 0, 'products');
    
    // Test best selling endpoint
    console.log('Testing best selling endpoint...');
    const bestSellingResponse = await axios.get('http://localhost:5002/api/products/best-selling', {
      timeout: 5000
    });
    console.log('✅ Best selling endpoint working, got', bestSellingResponse.data.length || 0, 'products');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend();
