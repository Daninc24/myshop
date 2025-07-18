// Migration script: Upload all non-Cloudinary product images to Cloudinary and update DB
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const cloudinary = require('./utils/cloudinary');

const isCloudinaryUrl = url => url && url.startsWith('https://res.cloudinary.com/');

async function migrateProductImagesToCloudinary() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  const products = await Product.find();
  let updatedCount = 0;

  for (const product of products) {
    let updated = false;
    const newImages = [];
    for (const img of product.images || []) {
      if (isCloudinaryUrl(img)) {
        newImages.push(img);
        continue;
      }
      let uploadResult;
      if (img.startsWith('data:image')) {
        // Base64 image
        try {
          uploadResult = await cloudinary.uploader.upload(img, { folder: 'products/migrated' });
          newImages.push(uploadResult.secure_url);
          updated = true;
          console.log(`Migrated base64 image for product ${product._id}`);
        } catch (err) {
          console.error(`Failed to migrate base64 image for product ${product._id}:`, err.message);
          newImages.push(img); // fallback
        }
      } else if (img.startsWith('/uploads/')) {
        // Local file path
        const localPath = path.join(__dirname, '../../uploads', path.basename(img));
        if (fs.existsSync(localPath)) {
          try {
            uploadResult = await cloudinary.uploader.upload(localPath, { folder: 'products/migrated' });
            newImages.push(uploadResult.secure_url);
            updated = true;
            console.log(`Migrated local file for product ${product._id}`);
            // Optionally delete local file: fs.unlinkSync(localPath);
          } catch (err) {
            console.error(`Failed to migrate local file for product ${product._id}:`, err.message);
            newImages.push(img); // fallback
          }
        } else {
          console.warn(`Local file not found: ${localPath}`);
          newImages.push(img);
        }
      } else {
        // Unknown format, keep as is
        newImages.push(img);
      }
    }
    if (updated) {
      product.images = newImages;
      await product.save();
      updatedCount++;
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} products.`);
  await mongoose.disconnect();
}

// Only run if executed directly
if (require.main === module) {
  migrateProductImagesToCloudinary().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = migrateProductImagesToCloudinary; 