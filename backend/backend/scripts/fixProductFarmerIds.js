const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Farmer = require('../src/models/Farmer');
require('dotenv').config();

async function fixProductFarmerIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products with null farmerId
    const productsWithNullFarmer = await Product.find({ farmerId: null });
    console.log(`Found ${productsWithNullFarmer.length} products with null farmerId`);

    if (productsWithNullFarmer.length === 0) {
      console.log('✅ All products already have farmerId assigned!');
      process.exit(0);
    }

    // Get any farmer (we'll assign products to existing farmers)
    const farmers = await Farmer.find().limit(10);
    
    if (farmers.length === 0) {
      console.log('❌ No farmers found in database. Please create farmers first.');
      process.exit(1);
    }

    console.log(`Found ${farmers.length} farmers to assign products to`);

    // Assign products to farmers in a round-robin fashion
    let farmerIndex = 0;
    for (const product of productsWithNullFarmer) {
      const farmer = farmers[farmerIndex % farmers.length];
      product.farmerId = farmer._id;
      await product.save();
      
      console.log(`✅ Assigned product "${product.name}" to farmer ${farmer.firstName} ${farmer.lastName}`);
      
      farmerIndex++;
    }

    console.log('✅ All products updated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing products:', error);
    process.exit(1);
  }
}

fixProductFarmerIds();