const axios = require('axios');

async function debugProducts() {
  try {
    console.log('🔍 Debugging Products API...\n');

    // Test 1: Products API
    console.log('1. Testing Products API...');
    const productsResponse = await axios.get('http://localhost:5002/api/products?limit=5');
    console.log('Status:', productsResponse.status);
    console.log('Products count:', productsResponse.data.products?.length || 0);
    
    if (productsResponse.data.products?.length > 0) {
      console.log('\n📦 Sample Products:');
      productsResponse.data.products.slice(0, 3).forEach((product, index) => {
        console.log(`\nProduct ${index + 1}: ${product.title}`);
        console.log('  - Images:', product.images);
        console.log('  - Image type:', typeof product.images);
        console.log('  - Image length:', Array.isArray(product.images) ? product.images.length : 'N/A');
        
        if (Array.isArray(product.images) && product.images.length > 0) {
          const firstImage = product.images[0];
          console.log('  - First image:', firstImage);
          console.log('  - Is base64:', firstImage.startsWith('data:image/'));
          console.log('  - Is URL:', firstImage.startsWith('http'));
        }
      });
    }

    // Test 2: Best Selling API
    console.log('\n2. Testing Best Selling API...');
    const bestSellingResponse = await axios.get('http://localhost:5002/api/products/best-selling?limit=3');
    console.log('Status:', bestSellingResponse.status);
    console.log('Products count:', bestSellingResponse.data.products?.length || 0);
    
    if (bestSellingResponse.data.products?.length > 0) {
      console.log('\n🏆 Sample Best Selling Products:');
      bestSellingResponse.data.products.slice(0, 2).forEach((product, index) => {
        console.log(`\nBest Selling ${index + 1}: ${product.title}`);
        console.log('  - Images:', product.images);
        console.log('  - Image type:', typeof product.images);
      });
    }

    // Test 3: New Arrivals API
    console.log('\n3. Testing New Arrivals API...');
    const newArrivalsResponse = await axios.get('http://localhost:5002/api/products?sort=newest&limit=3');
    console.log('Status:', newArrivalsResponse.status);
    console.log('Products count:', newArrivalsResponse.data.products?.length || 0);
    
    if (newArrivalsResponse.data.products?.length > 0) {
      console.log('\n🆕 Sample New Arrivals:');
      newArrivalsResponse.data.products.slice(0, 2).forEach((product, index) => {
        console.log(`\nNew Arrival ${index + 1}: ${product.title}`);
        console.log('  - Images:', product.images);
        console.log('  - Image type:', typeof product.images);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugProducts();
