const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Farmer = require('../src/models/Farmer');
require('dotenv').config();

async function debugProductFarmers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get first few products
    const products = await Product.find().limit(3);
    console.log(`\n📦 Found ${products.length} products\n`);

    for (const product of products) {
      console.log('─────────────────────────────────────');
      console.log(`Product: ${product.name}`);
      console.log(`farmerId stored: ${product.farmerId}`);
      console.log(`farmerId type: ${typeof product.farmerId}`);
      
      // Try to find the farmer
      if (product.farmerId) {
        const farmer = await Farmer.findById(product.farmerId);
        if (farmer) {
          console.log(`✅ Farmer found: ${farmer.firstName} ${farmer.lastName}`);
        } else {
          console.log(`❌ Farmer NOT found in Farmer collection`);
          
          // Check if this ID exists in User collection
          const User = mongoose.model('User');
          const user = await User.findById(product.farmerId);
          if (user) {
            console.log(`⚠️ Found in User collection instead: ${user.firstName} ${user.lastName}`);
          }
        }
      }
    }

    // Check total counts
    console.log('\n─────────────────────────────────────');
    const farmerCount = await Farmer.countDocuments();
    const productCount = await Product.countDocuments();
    console.log(`\n📊 Total Farmers: ${farmerCount}`);
    console.log(`📊 Total Products: ${productCount}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugProductFarmers();