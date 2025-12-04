require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const fixProducts = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const products = await Product.find({});

    console.log('🔧 Fixing form and type fields...\n');

    let updatedCount = 0;

    for (const product of products) {
      const name = product.name.toLowerCase();
      
      // Determine FORM (Beans or Ground Coffee)
      if (name.includes('ground')) {
        product.form = 'Ground Coffee';
      } else {
        product.form = 'Beans';
      }

      // Determine TYPE (Arabica, Robusta, or Blend)
      if (name.includes('robusta')) {
        product.type = 'Robusta';
      } else if (name.includes('blend')) {
        product.type = 'Blend';
      } else {
        // Default to Arabica (most Kenyan varieties are Arabica)
        product.type = 'Arabica';
      }

      await product.save();

      console.log(`✅ ${product.name}`);
      console.log(`   Form: ${product.form}`);
      console.log(`   Type: ${product.type}`);
      console.log(`   Variety: ${product.variety}\n`);
      
      updatedCount++;
    }

    console.log('🎉 Products updated successfully!');
    console.log(`📊 Total updated: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixProducts();