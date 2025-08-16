const axios = require('axios');

async function debugAPI() {
  try {
    console.log('🔍 Debugging API responses...\n');

    // Test 1: Products API
    console.log('1. Testing Products API...');
    const productsResponse = await axios.get('http://localhost:5002/api/products?limit=2');
    console.log('Status:', productsResponse.status);
    console.log('Products count:', productsResponse.data.products?.length || 0);
    
    if (productsResponse.data.products?.length > 0) {
      const product = productsResponse.data.products[0];
      console.log('First product:', {
        title: product.title,
        images: product.images,
        imageType: typeof product.images,
        imageLength: Array.isArray(product.images) ? product.images.length : 'N/A'
      });
      
      if (Array.isArray(product.images) && product.images.length > 0) {
        console.log('First image URL:', product.images[0]);
        console.log('Image URL type:', typeof product.images[0]);
        console.log('Image URL starts with http:', product.images[0]?.startsWith('http'));
      }
    }

    // Test 2: Best Selling API
    console.log('\n2. Testing Best Selling API...');
    const bestSellingResponse = await axios.get('http://localhost:5002/api/products/best-selling?limit=2');
    console.log('Status:', bestSellingResponse.status);
    console.log('Products count:', bestSellingResponse.data.products?.length || 0);
    
    if (bestSellingResponse.data.products?.length > 0) {
      const product = bestSellingResponse.data.products[0];
      console.log('First product:', {
        title: product.title,
        images: product.images,
        imageType: typeof product.images,
        imageLength: Array.isArray(product.images) ? product.images.length : 'N/A'
      });
    }

    // Test 3: New Arrivals API
    console.log('\n3. Testing New Arrivals API...');
    const newArrivalsResponse = await axios.get('http://localhost:5002/api/products?sort=newest&limit=2');
    console.log('Status:', newArrivalsResponse.status);
    console.log('Products count:', newArrivalsResponse.data.products?.length || 0);
    
    if (newArrivalsResponse.data.products?.length > 0) {
      const product = newArrivalsResponse.data.products[0];
      console.log('First product:', {
        title: product.title,
        images: product.images,
        imageType: typeof product.images,
        imageLength: Array.isArray(product.images) ? product.images.length : 'N/A'
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugAPI();
