require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const QRCode = require('qrcode');

const fixQRCodes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('🔧 Fixing QR codes for all products...\n');

    const products = await Product.find({ isActive: true });

    let fixedCount = 0;

    for (const product of products) {
      // Generate correct URL with /trace/ path
      const productUrl = `${process.env.FRONTEND_URL}/trace/${product._id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl);

      product.qrCode = qrCodeDataUrl;
      await product.save();

      console.log(`✅ Fixed QR for: ${product.name}`);
      console.log(`   URL: ${productUrl}\n`);
      fixedCount++;
    }

    console.log('🎉 QR codes fixed successfully!');
    console.log(`📊 Total products updated: ${fixedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing QR codes:', error);
    process.exit(1);
  }
};

fixQRCodes();