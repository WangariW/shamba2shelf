require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const fixNames = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find products with curly apostrophe and update them
    const products = await Product.find({});
    
    for (const product of products) {
      if (product.name.includes('\u2019')) {  // Unicode for curly apostrophe
        const newName = product.name.replace(/\u2019/g, '');  // Remove it
        await Product.updateOne(
          { _id: product._id },
          { $set: { name: newName } }
        );
        console.log(`✅ Fixed: ${product.name} → ${newName}`);
      }
    }

    console.log('\n🎉 All product names fixed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixNames();