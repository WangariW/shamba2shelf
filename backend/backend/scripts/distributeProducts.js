require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const distributeProducts = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers\n`);

    // Get all products
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} products\n`);

    if (farmers.length === 0) {
      console.log('⚠️ No farmers found!');
      process.exit(1);
    }

    console.log('📦 Distributing products to farmers...\n');

    let updatedCount = 0;

    // Distribute products evenly among farmers
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmer = farmers[i % farmers.length]; // Cycle through farmers

      product.farmerId = farmer._id;
      await product.save();

      console.log(`✅ ${product.name}`);
      console.log(`   → Assigned to: ${farmer.firstName} ${farmer.lastName}`);
      console.log(`   → Email: ${farmer.email}\n`);

      updatedCount++;
    }

    console.log('🎉 Products distributed successfully!');
    console.log(`📊 Total products updated: ${updatedCount}`);

    // Show summary
    console.log('\n📋 SUMMARY BY FARMER:');
    for (const farmer of farmers) {
      const count = await Product.countDocuments({ farmerId: farmer._id, isActive: true });
      console.log(`   ${farmer.firstName} ${farmer.lastName}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error distributing products:', error);
    process.exit(1);
  }
};

distributeProducts();