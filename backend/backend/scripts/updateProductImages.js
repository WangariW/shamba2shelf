require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const fs = require('fs');
const path = require('path');

const updateProductImages = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Read the uploaded images JSON
    const uploadedImagesPath = path.join(__dirname, 'uploaded-images.json');
    
    if (!fs.existsSync(uploadedImagesPath)) {
      console.error('❌ uploaded-images.json not found. Please run uploadProductImages.js first.');
      process.exit(1);
    }

    const uploadedImages = JSON.parse(fs.readFileSync(uploadedImagesPath, 'utf8'));

    console.log('📝 Updating products with Cloudinary URLs...\n');

    let updatedCount = 0;

    for (const image of uploadedImages) {
      const product = await Product.findOne({ name: image.productName });

      if (!product) {
        console.log(`⚠️  Product not found: ${image.productName}`);
        continue;
      }

      product.images = [image.url];
      await product.save();

      console.log(`✅ Updated: ${image.productName}`);
      console.log(`   Image: ${image.url}\n`);
      updatedCount++;
    }

    console.log('🎉 Product images updated successfully!');
    console.log(`📊 Total products updated: ${updatedCount}/${uploadedImages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
};

updateProductImages();