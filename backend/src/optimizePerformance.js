const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

async function optimizePerformance() {
  try {
    console.log('⚡ Starting performance optimization...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create essential database indexes
    console.log('📊 Creating database indexes...');
    
    const db = mongoose.connection.db;
    
    // Product indexes for fast queries
    const productsCollection = db.collection('products');
    
    try {
      // Text search index
      await productsCollection.createIndex(
        { "title": "text", "description": "text" },
        { name: "product_text_search" }
      );
      console.log('✅ Product text search index created');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  Product text search index already exists');
      }
    }

    // Essential product indexes
    const productIndexes = [
      { fields: { "category": 1 }, name: "product_category" },
      { fields: { "subcategory": 1 }, name: "product_subcategory" },
      { fields: { "price": 1 }, name: "product_price" },
      { fields: { "stock": 1 }, name: "product_stock" },
      { fields: { "createdAt": -1 }, name: "product_created_desc" },
      { fields: { "updatedAt": -1 }, name: "product_updated_desc" },
      { fields: { "category": 1, "price": 1 }, name: "product_category_price" },
      { fields: { "rating": -1, "reviewCount": -1 }, name: "product_rating_reviews" }
    ];

    for (const index of productIndexes) {
      try {
        await productsCollection.createIndex(index.fields, { name: index.name });
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          console.log(`ℹ️  Index ${index.name} already exists`);
        }
      }
    }

    // User indexes
    const usersCollection = db.collection('users');
    try {
      await usersCollection.createIndex({ "email": 1 }, { unique: true, name: "user_email_unique" });
      console.log('✅ User email index created');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️  User email index already exists');
      }
    }

    // Order indexes
    const ordersCollection = db.collection('orders');
    const orderIndexes = [
      { fields: { "user": 1 }, name: "order_user" },
      { fields: { "status": 1 }, name: "order_status" },
      { fields: { "createdAt": -1 }, name: "order_created_desc" }
    ];

    for (const index of orderIndexes) {
      try {
        await ordersCollection.createIndex(index.fields, { name: index.name });
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          console.log(`ℹ️  Index ${index.name} already exists`);
        }
      }
    }

    // 2. Analyze current database performance
    console.log('\n📈 Analyzing database performance...');
    
    const stats = await db.stats();
    console.log(`Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Collections: ${stats.collections}`);

    // 3. Check for performance issues
    console.log('\n🔍 Checking for performance issues...');
    
    // Check for products without proper images
    const productsWithoutImages = await Product.countDocuments({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { images: null }
      ]
    });
    console.log(`Products without images: ${productsWithoutImages}`);

    // Check for products with invalid stock
    const productsWithInvalidStock = await Product.countDocuments({
      $or: [
        { stock: { $lt: 0 } },
        { stock: null },
        { stock: { $exists: false } }
      ]
    });
    console.log(`Products with invalid stock: ${productsWithInvalidStock}`);

    // 4. Clean up invalid data
    console.log('\n🧹 Cleaning up invalid data...');
    
    // Fix products without images
    if (productsWithoutImages > 0) {
      await Product.updateMany(
        {
          $or: [
            { images: { $exists: false } },
            { images: { $size: 0 } },
            { images: null }
          ]
        },
        { $set: { images: [] } }
      );
      console.log(`✅ Fixed ${productsWithoutImages} products without images`);
    }

    // Fix products with invalid stock
    if (productsWithInvalidStock > 0) {
      await Product.updateMany(
        {
          $or: [
            { stock: { $lt: 0 } },
            { stock: null },
            { stock: { $exists: false } }
          ]
        },
        { $set: { stock: 0 } }
      );
      console.log(`✅ Fixed ${productsWithInvalidStock} products with invalid stock`);
    }

    // 5. Optimize MongoDB connection settings
    console.log('\n⚙️  MongoDB connection optimization recommendations:');
    console.log('- Use connection pooling (maxPoolSize: 10)');
    console.log('- Set serverSelectionTimeoutMS: 5000');
    console.log('- Set socketTimeoutMS: 45000');
    console.log('- Enable bufferCommands: false for production');

    // 6. Performance recommendations
    console.log('\n🚀 Performance optimization recommendations:');
    console.log('1. Enable compression middleware (already implemented)');
    console.log('2. Use lean() queries for read-only operations');
    console.log('3. Implement proper caching (Redis recommended)');
    console.log('4. Use pagination for large datasets');
    console.log('5. Optimize image delivery (Cloudinary recommended)');
    console.log('6. Enable gzip compression on server');
    console.log('7. Use CDN for static assets');
    console.log('8. Monitor database query performance');

    console.log('\n✅ Performance optimization completed!');

  } catch (error) {
    console.error('❌ Error during performance optimization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run optimization if this file is executed directly
if (require.main === module) {
  optimizePerformance();
}

module.exports = { optimizePerformance };