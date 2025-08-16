const mongoose = require('mongoose');

// Database indexing utility for performance optimization
const createIndexes = async () => {
  try {
    console.log('Creating database indexes for performance optimization...');
    
    const db = mongoose.connection.db;
    
    // Product indexes - check if text index already exists
    try {
      await db.collection('products').createIndex(
        { "title": "text", "name": "text" },
        { 
          name: "product_text_search",
          weights: { title: 2, name: 1 }
        }
      );
    } catch (error) {
      if (error.code === 85) { // IndexOptionsConflict
        console.log('⚠️  Text index already exists with different options, skipping...');
      } else {
        throw error;
      }
    }
    
    // Create indexes with error handling
    const createIndexSafely = async (collection, indexSpec, options) => {
      try {
        await collection.createIndex(indexSpec, options);
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`⚠️  Index ${options.name} already exists with different options, skipping...`);
        } else if (error.code === 86) { // IndexKeySpecsConflict
          console.log(`⚠️  Index ${options.name} already exists, skipping...`);
        } else {
          console.log(`⚠️  Error creating index ${options.name}:`, error.message);
        }
      }
    };

    const productsCollection = db.collection('products');
    
    await createIndexSafely(productsCollection, { "category": 1 }, { name: "product_category" });
    await createIndexSafely(productsCollection, { "subcategory": 1 }, { name: "product_subcategory" });
    await createIndexSafely(productsCollection, { "price": 1 }, { name: "product_price" });
    await createIndexSafely(productsCollection, { "stock": 1 }, { name: "product_stock" });
    await createIndexSafely(productsCollection, { "createdAt": -1 }, { name: "product_created_desc" });
    await createIndexSafely(productsCollection, { "updatedAt": -1 }, { name: "product_updated_desc" });
    
    // Compound indexes for common queries
    await createIndexSafely(productsCollection, { "category": 1, "price": 1 }, { name: "product_category_price" });
    await createIndexSafely(productsCollection, { "category": 1, "stock": 1 }, { name: "product_category_stock" });
    await createIndexSafely(productsCollection, { "category": 1, "subcategory": 1 }, { name: "product_category_subcategory" });
    
    // Indexes for best selling products and recommendations
    await createIndexSafely(productsCollection, { "rating": -1, "reviewCount": -1 }, { name: "product_rating_reviews" });
    await createIndexSafely(productsCollection, { "rating": -1, "createdAt": -1 }, { name: "product_rating_created" });
    await createIndexSafely(productsCollection, { "salesCount": -1 }, { name: "product_sales_count" });
    
    // User indexes
    const usersCollection = db.collection('users');
    await createIndexSafely(usersCollection, { "email": 1 }, { unique: true, name: "user_email_unique" });
    await createIndexSafely(usersCollection, { "role": 1 }, { name: "user_role" });
    
    // Order indexes
    const ordersCollection = db.collection('orders');
    await createIndexSafely(ordersCollection, { "user": 1 }, { name: "order_user" });
    await createIndexSafely(ordersCollection, { "status": 1 }, { name: "order_status" });
    await createIndexSafely(ordersCollection, { "createdAt": -1 }, { name: "order_created_desc" });
    
    // Sale indexes (for POS)
    const salesCollection = db.collection('sales');
    await createIndexSafely(salesCollection, { "shopkeeper": 1 }, { name: "sale_shopkeeper" });
    await createIndexSafely(salesCollection, { "createdAt": -1 }, { name: "sale_created_desc" });
    
    // Category indexes
    const categoriesCollection = db.collection('categories');
    await createIndexSafely(categoriesCollection, { "name": 1 }, { name: "category_name" });
    
    console.log('✅ Database indexes created successfully');
    
    // Log index information
    const collections = ['products', 'users', 'orders', 'sales', 'categories'];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`📊 ${collectionName} collection has ${indexes.length} indexes`);
    }
    
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
};

// Remove indexes (for development/testing)
const removeIndexes = async () => {
  try {
    console.log('Removing database indexes...');
    
    const db = mongoose.connection.db;
    
    const collections = ['products', 'users', 'orders', 'sales', 'categories'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        if (index.name !== '_id_') { // Don't remove the default _id index
          await collection.dropIndex(index.name);
          console.log(`Removed index: ${collectionName}.${index.name}`);
        }
      }
    }
    
    console.log('✅ Database indexes removed successfully');
    
  } catch (error) {
    console.error('❌ Error removing database indexes:', error);
    throw error;
  }
};

// Check index usage statistics
const getIndexStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = {};
    
    const collections = ['products', 'users', 'orders', 'sales', 'categories'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      
      stats[collectionName] = {
        totalIndexes: indexes.length,
        indexes: indexes.map(index => ({
          name: index.name,
          keys: index.key,
          unique: index.unique || false,
          sparse: index.sparse || false
        }))
      };
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting index stats:', error);
    throw error;
  }
};

module.exports = {
  createIndexes,
  removeIndexes,
  getIndexStats
};
