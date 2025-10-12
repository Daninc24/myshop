const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

async function verifyProduction() {
  try {
    console.log('🔍 Verifying production readiness...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Database connection successful');

    // Check admin user exists
    const adminUser = await User.findOne({ email: 'admin@myshop.com' });
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
    } else {
      console.log('❌ Admin user not found');
    }

    // Check for demo data
    const demoUsers = await User.find({
      email: { $in: ['john@example.com', 'jane@example.com'] }
    });
    if (demoUsers.length === 0) {
      console.log('✅ No demo users found');
    } else {
      console.log(`❌ Found ${demoUsers.length} demo users still in database`);
    }

    // Check products
    const productCount = await Product.countDocuments();
    console.log(`📦 Products in database: ${productCount}`);
    
    if (productCount === 0) {
      console.log('✅ Database clean - no seed products');
    } else {
      // Check if any products have demo/seed characteristics
      const demoProducts = await Product.find({
        $or: [
          { title: /Premium Wireless Headphones/i },
          { title: /Smart Fitness Watch/i },
          { title: /Organic Cotton T-Shirt/i }
        ]
      });
      
      if (demoProducts.length === 0) {
        console.log('✅ No demo products found');
      } else {
        console.log(`⚠️  Found ${demoProducts.length} potential demo products`);
      }
    }

    // Check database indexes
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    const indexes = await productsCollection.indexes();
    console.log(`📊 Product collection has ${indexes.length} indexes`);
    
    // List all indexes to see what we actually have
    console.log('📊 Available indexes:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    const essentialIndexes = [
      'product_text_search',
      'product_rating_reviews',
      'product_created_desc',
      'product_category_price'
    ];
    
    let indexesFound = 0;
    for (const indexName of essentialIndexes) {
      const found = indexes.some(idx => idx.name === indexName);
      if (found) {
        indexesFound++;
        console.log(`✅ Index found: ${indexName}`);
      } else {
        console.log(`❌ Index missing: ${indexName}`);
      }
    }
    
    if (indexesFound === essentialIndexes.length) {
      console.log('✅ All essential indexes present');
    } else {
      console.log(`⚠️  ${essentialIndexes.length - indexesFound} indexes missing`);
    }

    // Check environment configuration
    console.log('\n🔧 Environment Configuration:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   - PORT: ${process.env.PORT || 'not set'}`);
    console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
    console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'not set'}`);
    console.log(`   - MONGO_URI: ${process.env.MONGO_URI ? 'configured' : 'not set'}`);

    // Production readiness score
    let score = 0;
    let maxScore = 6;

    if (adminUser) score++;
    if (demoUsers.length === 0) score++;
    if (productCount === 0 || demoProducts?.length === 0) score++;
    if (indexesFound === essentialIndexes.length) score++;
    if (process.env.JWT_SECRET) score++;
    if (process.env.MONGO_URI) score++;

    console.log(`\n🎯 Production Readiness Score: ${score}/${maxScore} (${Math.round(score/maxScore*100)}%)`);

    if (score === maxScore) {
      console.log('🎉 System is PRODUCTION READY!');
    } else if (score >= 4) {
      console.log('⚠️  System is mostly ready, but needs attention to some areas');
    } else {
      console.log('❌ System needs more work before production deployment');
    }

    console.log('\n📋 Next Steps:');
    if (score < maxScore) {
      console.log('1. Address any issues shown above');
      console.log('2. Run optimization script if indexes are missing');
      console.log('3. Configure missing environment variables');
    }
    console.log('4. Deploy to Render (backend) and Vercel (frontend)');
    console.log('5. Change admin password after first login');
    console.log('6. Test all functionality in production');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyProduction();
}

module.exports = { verifyProduction };