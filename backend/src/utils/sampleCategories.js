const Category = require('../models/Category');

const sampleCategories = [
  {
    name: 'Electronics',
    id: 'electronics',
    subcategories: [
      { name: 'Smartphones', id: 'smartphones' },
      { name: 'Laptops', id: 'laptops' },
      { name: 'Tablets', id: 'tablets' },
      { name: 'Accessories', id: 'accessories' },
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
      { name: 'Kids & Baby', id: 'kids-baby' },
      { name: 'Shoes', id: 'shoes' },
      { name: 'Jewelry', id: 'jewelry' },
      { name: 'Watches', id: 'watches' },
      { name: 'Bags & Wallets', id: 'bags-wallets' }
    ]
  },
  {
    name: 'Home & Garden',
    id: 'home-garden',
    subcategories: [
      { name: 'Furniture', id: 'furniture' },
      { name: 'Kitchen & Dining', id: 'kitchen-dining' },
      { name: 'Bedding', id: 'bedding' },
      { name: 'Bath', id: 'bath' },
      { name: 'Decor', id: 'decor' },
      { name: 'Garden', id: 'garden' },
      { name: 'Tools', id: 'tools' }
    ]
  },
  {
    name: 'Sports & Outdoors',
    id: 'sports-outdoors',
    subcategories: [
      { name: 'Exercise & Fitness', id: 'exercise-fitness' },
      { name: 'Team Sports', id: 'team-sports' },
      { name: 'Outdoor Recreation', id: 'outdoor-recreation' },
      { name: 'Hunting & Fishing', id: 'hunting-fishing' },
      { name: 'Camping', id: 'camping' },
      { name: 'Cycling', id: 'cycling' }
    ]
  },
  {
    name: 'Books & Media',
    id: 'books-media',
    subcategories: [
      { name: 'Books', id: 'books' },
      { name: 'Movies & TV', id: 'movies-tv' },
      { name: 'Music', id: 'music' },
      { name: 'Video Games', id: 'video-games' },
      { name: 'Magazines', id: 'magazines' }
    ]
  },
  {
    name: 'Health & Beauty',
    id: 'health-beauty',
    subcategories: [
      { name: 'Personal Care', id: 'personal-care' },
      { name: 'Makeup', id: 'makeup' },
      { name: 'Fragrances', id: 'fragrances' },
      { name: 'Health Care', id: 'health-care' },
      { name: 'Medical Supplies', id: 'medical-supplies' },
      { name: 'Vitamins', id: 'vitamins' }
    ]
  },
  {
    name: 'Toys & Games',
    id: 'toys-games',
    subcategories: [
      { name: 'Action Figures', id: 'action-figures' },
      { name: 'Board Games', id: 'board-games' },
      { name: 'Building Sets', id: 'building-sets' },
      { name: 'Dolls', id: 'dolls' },
      { name: 'Educational', id: 'educational' },
      { name: 'Puzzles', id: 'puzzles' }
    ]
  },
  {
    name: 'Automotive',
    id: 'automotive',
    subcategories: [
      { name: 'Car Parts', id: 'car-parts' },
      { name: 'Car Care', id: 'car-care' },
      { name: 'Motorcycle', id: 'motorcycle' },
      { name: 'Truck', id: 'truck' },
      { name: 'RV Parts', id: 'rv-parts' }
    ]
  },
  {
    name: 'Baby Products',
    id: 'baby-products',
    subcategories: [
      { name: 'Diapers & Wipes', id: 'diapers-wipes' },
      { name: 'Baby Food', id: 'baby-food' },
      { name: 'Baby Gear', id: 'baby-gear' },
      { name: 'Baby Care', id: 'baby-care' },
      { name: 'Baby Toys', id: 'baby-toys' }
    ]
  },
  {
    name: 'Pet Supplies',
    id: 'pet-supplies',
    subcategories: [
      { name: 'Dog Supplies', id: 'dog-supplies' },
      { name: 'Cat Supplies', id: 'cat-supplies' },
      { name: 'Fish Supplies', id: 'fish-supplies' },
      { name: 'Bird Supplies', id: 'bird-supplies' },
      { name: 'Pet Food', id: 'pet-food' }
    ]
  }
];

const addSampleCategories = async () => {
  try {
    console.log('Checking for existing categories...');
    const existingCount = await Category.countDocuments();
    
    if (existingCount === 0) {
      console.log('No categories found. Adding sample categories...');
      
      for (const categoryData of sampleCategories) {
        const existingCategory = await Category.findOne({ id: categoryData.id });
        
        if (!existingCategory) {
          const category = new Category(categoryData);
          await category.save();
          console.log(`Added category: ${categoryData.name}`);
        }
      }
      
      console.log('Sample categories added successfully!');
    } else {
      console.log(`Found ${existingCount} existing categories. Skipping sample data.`);
    }
  } catch (error) {
    console.error('Error adding sample categories:', error);
  }
};

module.exports = { addSampleCategories, sampleCategories };
