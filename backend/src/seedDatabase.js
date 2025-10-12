const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@myshop.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  }
];

const sampleProducts = [
  {
    title: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
    price: 199.99,
    compareAtPrice: 249.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
    ],
    category: 'Electronics',
    subcategory: 'Audio',
    stock: 50,
    status: 'active',
    isFeatured: true,
    isOnSale: true,
    salePercentage: 20,
    specifications: {
      brand: 'AudioTech',
      model: 'AT-WH1000',
      color: 'Black',
      warranty: '2 years'
    },
    tags: ['wireless', 'headphones', 'audio', 'premium', 'noise-cancelling'],
    delivery: {
      freeShipping: true,
      deliveryTime: 'next_day',
      expressDelivery: true
    }
  },
  {
    title: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking watch with heart rate monitoring, GPS, and smartphone connectivity. Track your health and fitness goals.',
    price: 299.99,
    compareAtPrice: 399.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop'
    ],
    category: 'Electronics',
    subcategory: 'Wearables',
    stock: 30,
    status: 'active',
    isFeatured: true,
    specifications: {
      brand: 'FitTech',
      model: 'FT-SW200',
      color: 'Silver',
      warranty: '1 year'
    },
    tags: ['smartwatch', 'fitness', 'health', 'gps', 'heart-rate'],
    delivery: {
      freeShipping: true,
      deliveryTime: 'next_day'
    }
  },
  {
    title: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt. Perfect for casual wear with a modern fit and eco-friendly materials.',
    price: 29.99,
    compareAtPrice: 39.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop'
    ],
    category: 'Fashion',
    subcategory: 'T-Shirts',
    stock: 100,
    status: 'active',
    isFeatured: false,
    specifications: {
      brand: 'EcoWear',
      material: '100% Organic Cotton',
      color: 'White'
    },
    tags: ['organic', 'cotton', 'sustainable', 'casual', 't-shirt'],
    variants: [
      {
        sku: 'ECO-TS-WH-S',
        price: 29.99,
        quantity: 25,
        options: [
          { name: 'Size', value: 'S' },
          { name: 'Color', value: 'White' }
        ]
      },
      {
        sku: 'ECO-TS-WH-M',
        price: 29.99,
        quantity: 25,
        options: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'White' }
        ]
      },
      {
        sku: 'ECO-TS-WH-L',
        price: 29.99,
        quantity: 25,
        options: [
          { name: 'Size', value: 'L' },
          { name: 'Color', value: 'White' }
        ]
      },
      {
        sku: 'ECO-TS-WH-XL',
        price: 29.99,
        quantity: 25,
        options: [
          { name: 'Size', value: 'XL' },
          { name: 'Color', value: 'White' }
        ]
      }
    ],
    options: [
      {
        name: 'Size',
        values: ['S', 'M', 'L', 'XL']
      },
      {
        name: 'Color',
        values: ['White', 'Black', 'Gray']
      }
    ]
  },
  {
    title: 'Modern Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe and advanced brewing technology. Make perfect coffee every morning.',
    price: 149.99,
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'
    ],
    category: 'Home & Garden',
    subcategory: 'Kitchen Appliances',
    stock: 25,
    status: 'active',
    specifications: {
      brand: 'BrewMaster',
      model: 'BM-CM300',
      capacity: '12 cups'
    },
    tags: ['coffee', 'kitchen', 'appliance', 'programmable'],
    delivery: {
      freeShipping: false,
      deliveryTime: '2_3_days'
    }
  },
  {
    title: 'Yoga Mat Premium',
    description: 'High-quality yoga mat with excellent grip and cushioning. Perfect for yoga, pilates, and other floor exercises.',
    price: 49.99,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'
    ],
    category: 'Sports & Outdoors',
    subcategory: 'Fitness',
    stock: 40,
    status: 'active',
    isFeatured: true,
    specifications: {
      brand: 'YogaPro',
      material: 'TPE',
      thickness: '6mm',
      size: '183cm x 61cm'
    },
    tags: ['yoga', 'fitness', 'exercise', 'mat', 'premium'],
    delivery: {
      freeShipping: true,
      deliveryTime: 'next_day'
    }
  },
  {
    title: 'Bestselling Novel',
    description: 'Captivating fiction novel that has topped bestseller lists. A must-read for book lovers.',
    price: 14.99,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop'
    ],
    category: 'Books & Media',
    subcategory: 'Fiction',
    stock: 75,
    status: 'active',
    specifications: {
      author: 'Jane Author',
      pages: 320,
      publisher: 'BookHouse Publishing'
    },
    tags: ['book', 'fiction', 'bestseller', 'novel'],
    delivery: {
      freeShipping: false,
      deliveryTime: '3_5_days'
    }
  },
  {
    title: 'Natural Face Cream',
    description: 'Moisturizing face cream made with natural ingredients. Suitable for all skin types and provides long-lasting hydration.',
    price: 34.99,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop'
    ],
    category: 'Health & Beauty',
    subcategory: 'Skincare',
    stock: 60,
    status: 'active',
    specifications: {
      brand: 'NaturalGlow',
      volume: '50ml',
      skinType: 'All skin types'
    },
    tags: ['skincare', 'natural', 'moisturizer', 'face-cream'],
    delivery: {
      freeShipping: true,
      deliveryTime: 'next_day'
    }
  },
  {
    title: 'Educational Building Blocks',
    description: 'Colorful building blocks set that promotes creativity and learning. Safe for children and made from non-toxic materials.',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1558877385-1c2b2c2e8e8e?w=500&h=500&fit=crop'
    ],
    category: 'Toys & Games',
    subcategory: 'Educational Toys',
    stock: 35,
    status: 'active',
    specifications: {
      brand: 'LearnPlay',
      pieces: 50,
      ageRange: '3-8 years',
      material: 'Non-toxic plastic'
    },
    tags: ['toys', 'educational', 'building-blocks', 'children'],
    delivery: {
      freeShipping: false,
      deliveryTime: '2_3_days'
    }
  }
];

const sampleCategories = [
  { name: 'Electronics', description: 'Latest electronic devices and gadgets' },
  { name: 'Fashion', description: 'Trendy clothing and accessories' },
  { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
  { name: 'Books & Media', description: 'Books, movies, and digital media' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Toys & Games', description: 'Toys and games for all ages' },
  { name: 'Automotive', description: 'Car parts and automotive accessories' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed users
    console.log('👥 Seeding users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.insertMany(hashedUsers);
    console.log(`✅ ${hashedUsers.length} users created`);

    // Seed products
    console.log('📦 Seeding products...');
    await Product.insertMany(sampleProducts);
    console.log(`✅ ${sampleProducts.length} products created`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Accounts Created:');
    console.log('Admin: admin@myshop.com / admin123');
    console.log('User: john@example.com / user123');
    console.log('User: jane@example.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };