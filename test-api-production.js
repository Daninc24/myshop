const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://your-backend-domain.com/api';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to test API endpoint
async function testEndpoint(method, endpoint, data = null, expectedStatus = 200) {
  const url = `${API_BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const config = {
      method,
      url,
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${method} ${endpoint} - ${response.status} (${duration}ms)`);
      results.passed++;
      return true;
    } else {
      console.log(`❌ ${method} ${endpoint} - Expected ${expectedStatus}, got ${response.status} (${duration}ms)`);
      results.failed++;
      results.errors.push(`${method} ${endpoint}: Expected ${expectedStatus}, got ${response.status}`);
      return false;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message} (${duration}ms)`);
    results.failed++;
    results.errors.push(`${method} ${endpoint}: ${error.message}`);
    return false;
  }
}

// Test all API endpoints
async function runTests() {
  console.log('🚀 Starting API Production Tests...\n');
  console.log(`📍 Testing API at: ${API_BASE_URL}\n`);
  
  // Health check
  await testEndpoint('GET', '/health');
  
  // Product endpoints
  await testEndpoint('GET', '/products');
  await testEndpoint('GET', '/products?limit=5');
  await testEndpoint('GET', '/products?search=test');
  await testEndpoint('GET', '/products/best-selling');
  await testEndpoint('GET', '/products/best-selling?limit=3');
  await testEndpoint('GET', '/products/search/suggestions?q=phone');
  
  // Category endpoints
  await testEndpoint('GET', '/categories');
  
  // Auth endpoints (public)
  await testEndpoint('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'testpassword'
  }, 401); // Should fail with invalid credentials
  
  // Cart endpoints (will fail without auth, but should return proper error)
  await testEndpoint('GET', '/cart', null, 401);
  
  // Analytics endpoints
  await testEndpoint('GET', '/analytics/trending-searches');
  await testEndpoint('GET', '/analytics/search-stats');
  await testEndpoint('POST', '/analytics/search', {
    query: 'test search',
    searchTime: 1.5,
    timestamp: new Date().toISOString()
  });
  
  // Payment endpoints
  await testEndpoint('GET', '/payment/currency/list');
  await testEndpoint('GET', '/payment/currency/rates');
  
  // Events endpoints
  await testEndpoint('GET', '/events');
  await testEndpoint('GET', '/events?upcoming=true');
  
  // Adverts endpoints
  await testEndpoint('GET', '/adverts/active');
  
  // Testimonials endpoints
  await testEndpoint('GET', '/testimonials');
  
  // Page views endpoint
  await testEndpoint('POST', '/pageviews', {
    page: '/test',
    timestamp: new Date().toISOString()
  });
  
  // Site endpoints
  await testEndpoint('GET', '/site/assurances');
  
  // Recommendations endpoints
  await testEndpoint('GET', '/recommendations?type=popular');
  await testEndpoint('GET', '/recommendations?type=trending');
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Exit with appropriate code
  if (results.failed > 0) {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! API is ready for production.');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
