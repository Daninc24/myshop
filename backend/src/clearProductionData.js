const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Sale = require('./models/Sale');
const InventoryLog = require('./models/InventoryLog');
const Message = require('./models/Message');
const PageView = require('./models/PageView');
const Advert = require('./models/Advert');
const Testimonial = require('./models/Testimonial');
const Coupon = require('./models/Coupon');
const Customer = require('./models/Customer');
const Event = require('./models/Event');

async function clearProductionData() {
  try {
    console.log('🧹 Starting production data cleanup...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myshoppingcenter';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all seed/demo data
    console.log('🗑️ Clearing all demo/seed data...');
    
    // Clear products (all demo products)
    const productCount = await Product.countDocuments();
    await Product.deleteMany({});
    console.log(`✅ Removed ${productCount} demo products`);

    // Clear demo users (keep only admin if exists)
    const demoUsers = await User.find({
      email: { $in: ['john@example.com', 'jane@example.com'] }
    });
    await User.deleteMany({
      email: { $in: ['john@example.com', 'jane@example.com'] }
    });
    console.log(`✅ Removed ${demoUsers.length} demo users`);

    // Clear all orders (demo orders)
    const orderCount = await Order.countDocuments();
    await Order.deleteMany({});
    console.log(`✅ Removed ${orderCount} demo orders`);

    // Clear all sales (POS demo sales)
    const saleCount = await Sale.countDocuments();
    await Sale.deleteMany({});
    console.log(`✅ Removed ${saleCount} demo sales`);

    // Clear inventory logs
    const inventoryLogCount = await InventoryLog.countDocuments();
    await InventoryLog.deleteMany({});
    console.log(`✅ Removed ${inventoryLogCount} inventory logs`);

    // Clear messages
    const messageCount = await Message.countDocuments();
    await Message.deleteMany({});
    console.log(`✅ Removed ${messageCount} messages`);

    // Clear page views
    const pageViewCount = await PageView.countDocuments();
    await PageView.deleteMany({});
    console.log(`✅ Removed ${pageViewCount} page views`);

    // Clear demo adverts
    const advertCount = await Advert.countDocuments();
    await Advert.deleteMany({});
    console.log(`✅ Removed ${advertCount} demo adverts`);

    // Clear demo testimonials
    const testimonialCount = await Testimonial.countDocuments();
    await Testimonial.deleteMany({});
    console.log(`✅ Removed ${testimonialCount} demo testimonials`);

    // Clear demo coupons
    const couponCount = await Coupon.countDocuments();
    await Coupon.deleteMany({});
    console.log(`✅ Removed ${couponCount} demo coupons`);

    // Clear demo customers
    const customerCount = await Customer.countDocuments();
    await Customer.deleteMany({});
    console.log(`✅ Removed ${customerCount} demo customers`);

    // Clear demo events
    const eventCount = await Event.countDocuments();
    await Event.deleteMany({});
    console.log(`✅ Removed ${eventCount} demo events`);

    // Ensure admin user exists for production
    const adminEmail = 'admin@myshop.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('👤 Creating production admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Production admin user created');
      console.log('📧 Admin credentials: admin@myshop.com / admin123');
      console.log('⚠️  IMPORTANT: Change the admin password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Production cleanup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- All demo/seed data removed');
    console.log('- Database optimized for production');
    console.log('- Admin user ready for production use');
    console.log('\n⚠️  Next steps:');
    console.log('1. Change admin password after first login');
    console.log('2. Configure production environment variables');
    console.log('3. Set up proper monitoring and backups');

  } catch (error) {
    console.error('❌ Error during production cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  clearProductionData();
}

module.exports = { clearProductionData };