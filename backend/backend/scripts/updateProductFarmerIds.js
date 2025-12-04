require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Farmer = require('../src/models/Farmer');

async function updateProductFarmerIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all farmers
    const farmers = await Farmer.find();
    console.log(`📊 Found ${farmers.length} farmers in Farmer collection\n`);

    if (farmers.length === 0) {
      console.log('❌ No farmers found! Run the user migration first.');
      process.exit(1);
    }

    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products\n`);

    // Option 1: Randomly assign farmers to products
    console.log('🔄 Assigning farmers to products...\n');
    
    let updated = 0;
    for (const product of products) {
      // Pick a random farmer
      const randomFarmer = farmers[Math.floor(Math.random() * farmers.length)];
      
      product.farmerId = randomFarmer._id;
      await product.save();
      
      console.log(`✅ Assigned "${product.name}" → ${randomFarmer.name || randomFarmer.email}`);
      updated++;
    }

    console.log(`\n🎉 Updated ${updated} products!`);

    // Verify by testing populate
    console.log('\n🔍 Verifying populate works...');
    const testProduct = await Product.findOne().populate('farmerId');
    
    if (testProduct && testProduct.farmerId) {
      console.log(`✅ Populate works! Test product farmer: ${testProduct.farmerId.name || testProduct.farmerId.email}`);
    } else {
      console.log('❌ Populate still not working');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductFarmerIds();