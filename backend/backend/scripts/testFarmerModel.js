require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const testFarmerModel = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');
    
    // Try to get the model directly from mongoose
    const FarmerModel = mongoose.model('Farmer');
    
    console.log('✅ Farmer model found in mongoose!');
    console.log('Model name:', FarmerModel.modelName);
    
    const count = await FarmerModel.countDocuments();
    console.log(`📊 Total farmers: ${count}\n`);
    
    const farmers = await FarmerModel.find({ isActive: true, isVerified: true })
      .limit(3)
      .select('name email county averageRating');
    
    console.log('Top farmers:');
    farmers.forEach(f => {
      console.log(`   - ${f.name} (${f.county}) ⭐ ${f.averageRating || 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Check if model is registered
    console.log('\nRegistered models:', Object.keys(mongoose.models));
    
    process.exit(1);
  }
};

testFarmerModel();