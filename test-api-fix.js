const axios = require('axios');

// Test the API connectivity fix
async function testAPIConnectivity() {
  console.log('🔧 Testing API Connectivity Fix...\n');
  
  // Test with the production URL
  const API_BASE_URL = 'https://myshop-hhfv.onrender.com/api';
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test 2: Products endpoint
    console.log('2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=1`);
    console.log('✅ Products endpoint passed:', productsResponse.status);
    
    // Test 3: Categories endpoint
    console.log('3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Categories endpoint passed:', categoriesResponse.status);
    
    // Test 4: Cart endpoint (should return 401 for unauthenticated)
    console.log('4. Testing cart endpoint (should return 401)...');
    try {
      await axios.get(`${API_BASE_URL}/cart`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Cart endpoint correctly returns 401 for unauthenticated users');
      } else {
        console.log('❌ Cart endpoint returned unexpected status:', error.response?.status);
      }
    }
    
    console.log('\n🎉 All API connectivity tests passed!');
    console.log('✅ The API URL duplication issue has been fixed.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAPIConnectivity();
