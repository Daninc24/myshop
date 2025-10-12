const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabaseIndexes() {
  try {
    console.log('🔧 Fixing database indexes...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Drop any problematic indexes first
    try {
      const indexes = await productsCollection.indexes();
      console.log('📊 Current indexes:', indexes.map(idx => idx.name));
      
      // Drop any indexes that might be causing issues
      const problematicIndexes = indexes.filter(idx => 
        idx.name.includes('newest') || 
        idx.name.includes('hint') ||
        (idx.key && Object.keys(idx.key).some(key => key === 'newest'))
      );
      
      for (const idx of problematicIndexes) {
        if (idx.name !== '_id_') {
          console.log(`🗑️ Dropping problematic index: ${idx.name}`);
          await productsCollection.dropIndex(idx.name);
        }
      }
    } catch (error) {
      console.log('ℹ️ No problematic indexes to drop');
    }

    // Create essential indexes
    const essentialIndexes = [
      { fields: { "createdAt": -1 }, name: "products_created_desc" },
      { fields: { "updatedAt": -1 }, name: "products_updated_desc" },
      { fields: { "price": 1 }, name: "products_price_asc" },
      { fields: { "price": -1 }, name: "products_price_desc" },
      { fields: { "rating": -1 }, name: "products_rating_desc" },
      { fields: { "reviewCount": -1 }, name: "products_review_count_desc" },
      { fields: { "category": 1 }, name: "products_category" },
      { fields: { "subcategory": 1 }, name: "products_subcategory" },
      { fields: { "stock": 1 }, name: "products_stock" },
      { fields: { "title": 1 }, name: "products_title" },
      { fields: { "category": 1, "price": 1 }, name: "products_category_price" },
      { fields: { "rating": -1, "reviewCount": -1 }, name: "products_rating_reviews" }
    ];

    console.log('📊 Creating essential indexes...');
    for (const index of essentialIndexes) {
      try {
        await productsCollection.createIndex(index.fields, { name: index.name });
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85 || error.code === 86) {
          console.log(`ℹ️ Index ${index.name} already exists`);
        } else {
          console.log(`⚠️ Error creating index ${index.name}:`, error.message);
        }
      }
    }

    // Create text search index
    try {
      await productsCollection.createIndex(
        { "title": "text", "description": "text", "category": "text" },
        { name: "products_text_search" }
      );
      console.log('✅ Created text search index');
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        console.log('ℹ️ Text search index already exists');
      } else {
        console.log('⚠️ Error creating text search index:', error.message);
      }
    }

    // Verify indexes
    const finalIndexes = await productsCollection.indexes();
    console.log('\n📊 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✅ Database indexes fixed successfully!');
    console.log('🎯 The following issues have been resolved:');
    console.log('   - Removed problematic "newest" field references');
    console.log('   - Created proper indexes for sorting and filtering');
    console.log('   - Added compound indexes for better query performance');

  } catch (error) {
    console.error('❌ Error fixing database indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run fix if this file is executed directly
if (require.main === module) {
  fixDatabaseIndexes();
}

module.exports = { fixDatabaseIndexes };