const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');

const sampleCategories = [
  {
    name: 'Electronics',
    id: 'electronics',
    subcategories: [
      { name: 'Smartphones', id: 'smartphones' },
      { name: 'Laptops', id: 'laptops' },
      { name: 'Audio', id: 'audio' },
      { name: 'Cameras', id: 'cameras' }
    ]
  },
  {
    name: 'Fashion',
    id: 'fashion',
    subcategories: [
      { name: 'Men\'s Clothing', id: 'mens-clothing' },
      { name: 'Women\'s Clothing', id: 'womens-clothing' },
      { name: 'Shoes', id: 'shoes' },
      { name: 'Accessories', id: 'accessories' }
    ]
  },
  {
    name: 'Home & Garden',
    id: 'home-garden',
    subcategories: [
      { name: 'Furniture', id: 'furniture' },
      { name: 'Kitchen', id: 'kitchen' },
      { name: 'Garden', id: 'garden' },
      { name: 'Decor', id: 'decor' }
    ]
  },
  {
    name: 'Sports & Outdoors',
    id: 'sports-outdoors',
    subcategories: [
      { name: 'Fitness', id: 'fitness' },
      { name: 'Outdoor Gear', id: 'outdoor-gear' },
      { name: 'Sports Equipment', id: 'sports-equipment' }
    ]
  },
  {
    name: 'Books & Media',
    id: 'books-media',
    subcategories: [
      { name: 'Books', id: 'books' },
      { name: 'Movies', id: 'movies' },
      { name: 'Music', id: 'music' }
    ]
  },
  {
    name: 'Health & Beauty',
    id: 'health-beauty',
    subcategories: [
      { name: 'Skincare', id: 'skincare' },
      { name: 'Makeup', id: 'makeup' },
      { name: 'Health Supplements', id: 'health-supplements' }
    ]
  },
  {
    name: 'Toys & Games',
    id: 'toys-games',
    subcategories: [
      { name: 'Educational Toys', id: 'educational-toys' },
      { name: 'Board Games', id: 'board-games' },
      { name: 'Video Games', id: 'video-games' }
    ]
  },
  {
    name: 'Automotive',
    id: 'automotive',
    subcategories: [
      { name: 'Car Parts', id: 'car-parts' },
      { name: 'Accessories', id: 'car-accessories' },
      { name: 'Tools', id: 'car-tools' }
    ]
  }
];

async function seedCategories() {
  try {
    console.log('🏷️ Seeding categories...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert sample categories
    await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${sampleCategories.length} categories`);

    // Verify categories
    const count = await Category.countDocuments();
    console.log(`📊 Total categories in database: ${count}`);

    console.log('\n🎉 Categories seeded successfully!');
    console.log('\nCategories created:');
    sampleCategories.forEach(cat => {
      console.log(`  📁 ${cat.name} (${cat.subcategories.length} subcategories)`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories };