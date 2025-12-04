require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const QRCode = require('qrcode');

const fixAllProducts = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Step 1: Activate all products
    console.log('🔧 Activating all products...');
    const activateResult = await Product.updateMany(
      { isActive: false },
      { $set: { isActive: true } }
    );
    console.log(`✅ Activated ${activateResult.modifiedCount} products\n`);

    // Step 2: Fix QR codes
    console.log('🔧 Fixing QR codes for all products...\n');
    const products = await Product.find({});
    const FRONTEND_URL = 'https://10.0.9.91:5173';

    let fixedCount = 0;

    for (const product of products) {
      const productUrl = `${FRONTEND_URL}/trace/${product._id}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#2D5016',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      product.qrCode = qrCodeDataUrl;
      await product.save();

      console.log(`✅ Fixed QR for: ${product.name}`);
      console.log(`   URL: ${productUrl}\n`);
      fixedCount++;
    }

    console.log('🎉 All products fixed successfully!');
    console.log(`📊 Total products updated: ${fixedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAllProducts();